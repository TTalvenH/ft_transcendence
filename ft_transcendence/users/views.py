from django.shortcuts import render, get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser
from .serializers import UserSerializer, RegisterUserSerializer, UserProfileSerializer, FriendSerializer
from .tokens import create_jwt_pair_for_user
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework.permissions import IsAuthenticated
import qrcode
import base64
import pyotp
from io import BytesIO
from .decorators import update_last_active
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import HttpRequest
from django.template.loader import render_to_string
from django.contrib.auth import authenticate
from django.middleware.csrf import get_token
from pong.serializers import MatchSerializer, TournamentSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpRequest
from django.middleware.csrf import get_token
from django.template.loader import render_to_string
from random import randint
from django.core.mail import send_mail
from rest_framework.parsers import MultiPartParser

@api_view(['GET'])
def login_template(request):
	return render(request, 'users/login.html')

@api_view(['GET'])
def register(request):
	return render(request, 'users/register.html')

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@update_last_active
def update_profile_template(request):
	user = request.user
	context = {
		'username': user.username,
		'profile_image': user.image.url if user.image else 'static/images/plankton.jpg',
		'email': user.email,
		'display_name': user.display_name,
		'two_factor_method': user.two_factor_method,
		'email_verified': user.email_otp_verified,
		'opt_verified': user.otp_verified
	}
	return render(request, 'users/update_profile.html', context)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@update_last_active
def userProfileTemplate(request, username):
	user = get_object_or_404(CustomUser, username=username)
	player1_matches = user.player1_matches.all().filter(tournament_match=False)
	player2_matches = user.player2_matches.all().filter(tournament_match=False)
	match_history = MatchSerializer(instance=player1_matches, many=True).data + MatchSerializer(instance=player2_matches, many=True).data
	match_history = sorted(match_history, key=lambda x: x['dateTime'], reverse=True)
	tournament_history = TournamentSerializer(instance=user.tournament_set.all(), many=True).data
	tournament_history = sorted(tournament_history, key=lambda x: x['dateTime'], reverse=True)
	context = {
		'username': user.username,
		'profile_image': user.image.url if user.image else 'static/images/plankton.jpg',
		'match_history': match_history,
		'tournament_history': tournament_history,
		'friends': FriendSerializer(instance=user.friends.all(), many=True).data,
	}
	return render(request, 'users/profile.html', context)

@api_view(['GET'])
def qrPrompt(request):
	return render(request, 'users/qr_prompt.html')

@api_view(['GET'])
def renderQr(request):
	return render(request, 'users/qr.html')

@api_view(['POST'])
def createUser(request):
	serializer = RegisterUserSerializer(data=request.data)
	if serializer.is_valid():
		user = serializer.save()
		two_factor_method = user.two_factor_method
		otp_data = {}
		qr_html = None

		if two_factor_method == 'app': 
			otp_data = setupOTP(user)
			if not otp_data['created']:
				return Response({'detail': 'OTP device already exists.'}, status=status.HTTP_400_BAD_REQUEST)

			django_request = HttpRequest()
			django_request.method = 'GET'
			django_request.user = request.user
			csrf_token = get_token(request)
			context = otp_data.get('context', {})
			context['csrf_token'] = csrf_token
			qr_html = render_to_string('users/qr.html', context, request=django_request)
			response_data = { 
				'user': serializer.data,
				'otp': otp_data,
				'qr_html': qr_html
			}

		elif two_factor_method == 'email':
			otp_code = generate_email_otp()
			hashed_otp = hash_otp_code(otp_code)
			user.email_otp_code = hashed_otp
			user.save()
			send_mail(
				'Your OTP Code',
				f'Your OTP code is {otp_code}',
				'customer.support.pong@example.com',
				[user.email],
				fail_silently=False,
			)
			otp_data['email_otp'] = 'Email OTP enabled. Check your email for the OTP code.'
			response_data = { 
				'user': serializer.data,
				'otp': otp_data,
			}
		else:
			response_data = { 'user': serializer.data }

		return Response(response_data, status=status.HTTP_201_CREATED)

	detail = {'detail': 'Invalid data'}
	if serializer.errors.get('username'):
		detail = {'detail': 'Username taken'}
	elif serializer.errors.get('email'):
		detail = {'detail': 'Email taken'}
	return Response(detail, status=status.HTTP_400_BAD_REQUEST)

def generate_email_otp():
	return str(randint(100000, 999999))

def setupOTP(user):
	device, created = TOTPDevice.objects.get_or_create(user=user, name='default')
	key = pyotp.random_base32()
	device.key = key
	device.save()

	uri = pyotp.totp.TOTP(key).provisioning_uri(name=user.username, issuer_name="pong")
	qr = qrcode.make(uri)
	buffered = BytesIO()
	qr.save(buffered, format="PNG")
	img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

	context = {
		'qr_code_url': img_str,
	}

	return {
		'detail': 'OTP device created successfully.',
		'created': True,
		'context': context,
		'provisioning_uri': uri
	}

@api_view(['POST'])
def loginUser(request):
	user = authenticate(request, username=request.data['username'], password=request.data['password'])
	if not user:
		return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
	if user.two_factor_method == 'email' and not user.email_otp_verified:
		user.two_factor_method = 'None'
	elif user.two_factor_method == 'app' and not user.otp_verified:
		user.two_factor_method = 'None'
	user.save()
  
	if user.two_factor_method == 'email' and user.email_otp_verified:
		otp_code = generate_email_otp()
		hashed_otp = hash_otp_code(otp_code)
		user.email_otp_code = hashed_otp
		user.save()
		send_mail(
			'Your OTP Code',
			f'Your OTP code is {otp_code}',
			'customer.support.pong@example.com',
			[user.email],
			fail_silently=False,
		)
	serializer = UserSerializer(instance=user)
	response_data = {'two_factor_method': user.two_factor_method, 'otp_verified': user.otp_verified, 'email_otp_verified': user.email_otp_verified, 'user': serializer.data}
	user.update_last_active()
	if user.two_factor_method == 'None':
		token = create_jwt_pair_for_user(user)
		response_data.update({'tokens': token})

	return Response(response_data, status=status.HTTP_200_OK)

@api_view(['POST'])
def validateOtpAndLogin(request):
	user = get_object_or_404(CustomUser, username=request.data['username'])
	otp = request.data.get('otp')

	if user.two_factor_method and not otp:
		return Response({'detail': 'OTP required.'}, status=status.HTTP_401_UNAUTHORIZED)

	if user.two_factor_method == 'app':
		device = TOTPDevice.objects.get(user=user, name='default')
		totp = pyotp.TOTP(device.key)
		if not totp.verify(otp):
			return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_401_UNAUTHORIZED)

	hashed_otp = hash_otp_code(otp)
	if user.two_factor_method == 'email':
		if hashed_otp != user.email_otp_code:
			return Response({'detail': 'Invalid Email OTP.'}, status=status.HTTP_401_UNAUTHORIZED)

	user.update_last_active()
	token = create_jwt_pair_for_user(user)
	serializer = UserSerializer(instance=user)

	return Response({'tokens': token, 'user': serializer.data}, status=status.HTTP_200_OK)

@api_view(['POST'])
def verifyOTP(request):
	user = get_object_or_404(CustomUser, username=request.data.get('username'))
	two_factor_method = user.two_factor_method
	otp = request.data.get('otp')

	if not two_factor_method:
		return Response({'detail': 'OTP required.'}, status=status.HTTP_400_BAD_REQUEST)

	if two_factor_method == 'app':
		try:
			device = TOTPDevice.objects.get(user=user, name='default')
			totp = pyotp.TOTP(device.key)
			if totp.verify(otp):
				user.otp_verified = True
				user.save()
				return Response({'detail': 'OTP verified successfully.'}, status=status.HTTP_200_OK)
		except TOTPDevice.DoesNotExist:
			return Response({'detail': 'OTP device not found.'}, status=status.HTTP_404_NOT_FOUND)

	hashed_otp = hash_otp_code(otp)
	if user.two_factor_method == 'email' and hashed_otp == user.email_otp_code:
		user.email_otp_verified = True
		user.save()
		return Response({'detail': 'Email OTP verified successfully.'}, status=status.HTTP_200_OK)
	else:
		return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@update_last_active
@permission_classes([IsAuthenticated])
def getUserPorfile(request, username):
    user = get_object_or_404(CustomUser, username=username)
    serializer = UserProfileSerializer(instance=user)
    return Response(serializer.data)

import hashlib

def hash_otp_code(otp_code):
    hashed_otp = hashlib.sha256(otp_code.encode()).hexdigest()
    return hashed_otp

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def otpSetupView(request):
	user = get_object_or_404(CustomUser, id=request.user.id)

	enable_otp = request.data.get('enable_otp')
	enable_email_otp = request.data.get('enable_email_otp')

	if enable_otp:
		user.otp_verified = False
		user.email_otp_verified = False
		user.two_factor_method = 'app'
		user.save()
		otp_data = setupOTP(user)
		if not otp_data['created']:
			return Response({'detail': 'OTP device already exists.'}, status=status.HTTP_400_BAD_REQUEST)

		django_request = HttpRequest()
		django_request.method = 'GET'
		django_request.user = request.user
		csrf_token = get_token(request)
		context = otp_data.get('context', {})
		context['csrf_token'] = csrf_token

		qr_html = render_to_string('users/qr.html', context, request=django_request)
		response_data = {
			'otp': otp_data,
			'qr_html': qr_html,
			'username': user.username
		}

	elif enable_email_otp:
		user.email_otp_verified = False
		user.otp_verified = False
		user.two_factor_method = 'email'
		otp_code = generate_email_otp()
		hashed_otp_code = hash_otp_code(otp_code)
		user.email_otp_code = hashed_otp_code
		user.save()
		send_mail(
				'Your OTP Code',
				f'Your OTP code is {otp_code}',
				'customer.support.pong@example.com',
				[user.email],
				fail_silently=False,
			)
		response_data = {'username': user.username }
	else:
		user.two_factor_method = 'None'
		user.email_otp_verified = False
		user.otp_verified = False
		user.save()
		response_data = {'detail': 'No setup needed'}
		 
	return Response(response_data, status=status.HTTP_201_CREATED)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@update_last_active
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def updateUserProfile(request):
	user = get_object_or_404(CustomUser, id=request.user.id)
	profile_serializer = UserProfileSerializer(instance=user, data=request.data, partial=True, context={'request': request})

	if profile_serializer.is_valid():
		profile_serializer.save()
		otp_setup_needed = False
		email_otp_setup_needed = False
		TwoFactorMethod = user.two_factor_method
		user_serializer = UserSerializer(instance=user)
		
		if TwoFactorMethod == 'app' and not user.otp_verified:
			otp_setup_needed = True
		elif TwoFactorMethod == 'email' and not user.email_otp_verified:
			email_otp_setup_needed = True
		return Response({
			'user': user_serializer.data, 
			'otp_setup_needed': otp_setup_needed, 
			'email_otp_setup_needed': email_otp_setup_needed
		})

	detail = {'detail': 'Invalid data'}
	if profile_serializer.errors.get('username'):
		detail = {'detail': 'Username taken.'}
	elif profile_serializer.errors.get('email'):
		detail = {'detail': profile_serializer.errors.get('email')}
	elif profile_serializer.errors.get('password'):
		detail = {'detail': 'Missing required fields.'}
	return Response(detail, status=400)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@update_last_active
@permission_classes([IsAuthenticated])
def addFriend(request, username):
	if username == request.user.username or request.user.friends.filter(username=username).exists():
		return Response(status=status.HTTP_400_BAD_REQUEST)
	user = get_object_or_404(CustomUser, username=username)
	request.user.friends.add(user)
	user.friends.add(request.user)

	return Response(FriendSerializer(instance=user).data)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@update_last_active
@permission_classes([IsAuthenticated])
def logOut(request):
	return Response(status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@update_last_active
@permission_classes([IsAuthenticated])
def get_user(request, username):
	user = get_object_or_404(CustomUser, username=username)
	return Response({'username': user.username, 'id': user.id}, status=status.HTTP_200_OK)

@api_view(['GET'])
def check_existance(request, username):
	user = get_object_or_404(CustomUser, username=username)
	return Response(status=status.HTTP_200_OK)
