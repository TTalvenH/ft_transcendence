from django.shortcuts import render, redirect, get_object_or_404
from .forms import CreateUserForm, LoginForm
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser
from .serializers import UserSerializer, RegisterUserSerializer, UserProfileSerializer, FriendSerializer
from .tokens import create_jwt_pair_for_user
from django_otp.plugins.otp_totp.models import TOTPDevice
from rest_framework.permissions import IsAuthenticated
import qrcode
import io
import base64
from django.conf import settings
import pyotp
from io import BytesIO
from string import Template
from .decorators import update_last_active
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.http import HttpRequest
from django.template.loader import render_to_string
from django.contrib.auth import authenticate
from django.middleware.csrf import get_token
from pong.serializers import MatchSerializer, TournamentSerializer

@api_view(['GET'])
def login_template(request):
	return render(request, 'users/login.html')

@api_view(['GET'])
def register(request):
	return render(request, 'users/register.html')

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@update_last_active
def updateProfile(request):
	user = request.user
	context = {
		'username': user.username,
		'profile_image': user.image.url if user.image else 'static/images/plankton.jpg',
		'email': user.email,
		'display_name': user.display_name,
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
	print(tournament_history)
	context = {
		'username': user.username,
		'profile_image': user.image.url if user.image else 'static/images/plankton.jpg',
		'match_history': match_history,
		'tournament_history': tournament_history,
		'friends': FriendSerializer(instance=user.friends.all(), many=True).data,
	}
	print(context.get('match_history'))
	return render(request, 'users/profile.html', context)

@api_view(['GET'])
def qrPrompt(request):
	return render(request, 'users/qr_prompt.html')

@api_view(['GET'])
def renderQr(request):
    return render(request, 'users/qr.html')

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpRequest
from django.middleware.csrf import get_token
from django.template.loader import render_to_string

@api_view(['POST'])
def createUser(request):
	# print(request.POST)
	serializer = RegisterUserSerializer(data=request.data)
	if serializer.is_valid():
		user = serializer.save()
		two_factor_method = user.two_factor_method
		print('method is', two_factor_method)
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
			user.email_otp_code = otp_code
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


from random import randint
from django.core.mail import send_mail

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

	if user.two_factor_method == 'email' and user.email_otp_verified:
		otp_code = generate_email_otp()
		user.email_otp_code = otp_code
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
	token = create_jwt_pair_for_user(user)
	response_data.update({'tokens': token, 'user': serializer.data})
	print(response_data)

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

	if user.two_factor_method == 'email':
		if otp != user.email_otp_code:
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
	print('method is', two_factor_method)
	print('otp is', otp)
	print('user code: ', user.email_otp_code)
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

	if user.two_factor_method == 'email' and otp == user.email_otp_code:
		user.email_otp_verified = True
		user.save()
		return Response({'detail': 'Email OTP verified successfully.'}, status=status.HTTP_200_OK)
	else:
		return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_401_UNAUTHORIZED)


# This function is an api_view that can be accessed with a GET request
# It is decorated with @authentication_classes, which means that it will
# attempt to authenticate the request using either SessionAuthentication or
# TokenAuthentication.
# The user is only allowed to access this view if they are authenticated,
# which is specified in the @permission_classes decorator.
# The function returns a Response with a dictionary containing the user's
# email, which is taken from request.user.email. This is only accessible if
# the user is authenticated, as specified by the IsAuthenticated permission.

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def testToken(request):
	"""
	This function is an api_view that can be accessed with a GET request.
	It is decorated with @authentication_classes, which means that it will
	attempt to authenticate the request using either SessionAuthentication or
	TokenAuthentication.
	The user is only allowed to access this view if they are authenticated,
	which is specified in the @permission_classes decorator.
	The function returns a Response with a dictionary containing the user's
	email, which is taken from request.user.email. This is only accessible if
	the user is authenticated, as specified by the IsAuthenticated permission.
	"""
	return Response({"passed for {}".format(request.user.email)})


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# @api_view(['GET'])
# @authentication_classes([JWTAuthentication])
# @update_last_active
# @permission_classes([IsAuthenticated])
# def getUser(request, user_id):
#     # Extract user ID from the token
#     token_user_id = request.user.id
    
#     # Ensure the token user matches the requested user ID
#     if token_user_id != user_id:
#         return Response({"error": "You are not authorized to access this user's data."}, status=403)
    
#     # Retrieve user from the database
#     user = get_object_or_404(CustomUser, id=user_id)
    
#     # Serialize the user data
#     serializer = UserSerializer(instance=user)
    
#     # Return the serialized user data
#     return Response({'user': serializer.data})

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@update_last_active
@permission_classes([IsAuthenticated])
def getUserPorfile(request, username):
    # Retrieve user from the database
    user = get_object_or_404(CustomUser, username=username)
    
    # Serialize the user data
    serializer = UserProfileSerializer(instance=user)
    
    # Return the serialized user data
    return Response(serializer.data)

# otpSetupView is called when user sets up otp from profile

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def otpSetupView(request):
	user = get_object_or_404(CustomUser, id=request.user.id)

	enable_otp = request.data.get('enable_otp')
	enable_email_otp = request.data.get('enable_email_otp')
	print('enable_otp', enable_otp)
	print('enable_email_otp', enable_email_otp)

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
		context = {
			**otp_data['context'],
			'csrf_token': csrf_token,
		}

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
		user.email_otp_code = otp_code
		user.save()
		send_mail(
                'Your OTP Code',
                f'Your OTP code is {otp_code}',
                'customer.support.pong@example.com',
                [user.email],
                fail_silently=False,
            )
		response_data = {'username': user.username }
	# else:
	# 	user.two_factor_method = 'None'
	# 	user.email_otp_verified = False
	# 	user.otp_verified = False
	# 	user.save()
	# 	response_data = {'detail': 'No setup needed'}

	return Response(response_data, status=status.HTTP_201_CREATED)

from rest_framework.parsers import MultiPartParser

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@update_last_active
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def updateUserProfile(request):
	user = get_object_or_404(CustomUser, id=request.user.id)
	# print(request.data)
	profile_serializer = UserProfileSerializer(instance=user, data=request.data, partial=True, context={'request': request})

	if profile_serializer.is_valid():
		profile_serializer.save()
		otp_setup_needed = False
		email_otp_setup_needed = False
		TwoFactorMethod = user.two_factor_method
		user_serializer = UserSerializer(instance=user)
		print('2fa :', TwoFactorMethod)
		print(user.otp_verified)
		print(user.email_otp_verified)
		
		
		if TwoFactorMethod == 'app' and not user.otp_verified:
			otp_setup_needed = True
		elif TwoFactorMethod == 'email' and not user.email_otp_verified:
			email_otp_setup_needed = True
		else:
			user.two_factor_method = 'None'
			user.save()

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
	# Retrieve user from the database
	if username == request.user.username or request.user.friends.filter(username=username).exists():
		return Response(status=status.HTTP_400_BAD_REQUEST)
	user = get_object_or_404(CustomUser, username=username)
	# Add the user to the friend list
	request.user.friends.add(user)
	user.friends.add(request.user)

	# Return the serialized user data
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
	print('llllllllll')
	print(user)
	return Response(status=status.HTTP_200_OK)