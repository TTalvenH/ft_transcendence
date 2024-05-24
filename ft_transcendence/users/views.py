from django.shortcuts import render, redirect, get_object_or_404
from .forms import CreateUserForm, LoginForm
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser, PongMatch
from .serializers import UserSerializer, RegisterUserSerializer, UserProfileSerializer, MatchHistorySerializer, FriendSerializer
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

# Create your views here.
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
		'display_name': user.display_name
	}
	return render(request, 'users/update_profile.html', context)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@update_last_active
def userProfileTemplate(request, username):
	user = get_object_or_404(CustomUser, username=username)
	context = {
		'username': user.username,
		'profile_image': user.image.url if user.image else 'static/images/plankton.jpg',
		'friends': FriendSerializer(instance=user.friends.all(), many=True).data,
		'match_history': MatchHistorySerializer(instance=user.match_history.all(), many=True).data
	}
	print(context)
	return render(request, 'users/profile.html', context)

@api_view(['GET'])
def qrPrompt(request):
	return render(request, 'users/qr_prompt.html')

@api_view(['GET'])
def renderQr(request):
    return render(request, 'users/qr.html')


def setup_otp(user):
    device, created = TOTPDevice.objects.get_or_create(user=user, name='default')

    key = pyotp.random_base32()
    device.key = key
    device.save()

    user.otp_enabled = True
    user.save()

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
def createUser(request):
    serializer = RegisterUserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        # If OTP is enabled, set up OTP for the user
        enable_otp = request.data.get('enable_otp')
        otp_data = {}
        if enable_otp == 'true':
            otp_data = setup_otp(user)
            if not otp_data['created']:
                return Response({'detail': 'OTP device already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # Construct the response data
        response_data = {
            'user': serializer.data,
            'otp': otp_data
        }

 		 # Convert DRF request to Django HttpRequest
        django_request = HttpRequest()
        django_request.method = 'GET'
        django_request.user = request.user

        # Manually include CSRF token in the context
        csrf_token = get_token(request)
        context = {
            **otp_data['context'],
            'csrf_token': csrf_token,
        }

        # Render the QR code HTML with CSRF token
        qr_html = render_to_string('users/qr.html', context, request=django_request)

        # Construct the response data
        response_data = {
            'user': serializer.data,
            'otp': otp_data,
            'qr_html': qr_html  # Include the rendered HTML in the response
        }

        return Response(response_data, status=status.HTTP_201_CREATED)

    detail = {'detail': 'Invalid data'}
    if serializer.errors.get('username'):
        detail = {'detail': 'Username taken'}
    elif serializer.errors.get('email'):
        detail = {'detail': 'Email taken'}
    return Response(detail, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def loginUser(request):
	user = authenticate(request, username=request.data['username'], password=request.data['password'])
	if not user:
		return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

	response_data = {'otp_required': user.otp_enabled}

	if user.otp_enabled and user.otp_verified:
		return Response(response_data, status=status.HTTP_200_OK)

	user.update_last_active()
	token = create_jwt_pair_for_user(user)
	serializer = UserSerializer(instance=user)
	otp_verified = user.otp_verified
	response_data.update({'tokens': token, 'user': serializer.data, 'otp_verified': otp_verified})

	return Response(response_data, status=status.HTTP_200_OK)

@api_view(['POST'])
def validateOtpAndLogin(request):
	user = get_object_or_404(CustomUser, username=request.data['username'])

	otp = request.data.get('otp')

	if not otp:
		return Response({'detail': 'OTP required.'}, status=status.HTTP_401_UNAUTHORIZED)

	device = TOTPDevice.objects.get(user=user, name='default')
	totp = pyotp.TOTP(device.key)

	if not totp.verify(otp):
		return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_401_UNAUTHORIZED)

	token = create_jwt_pair_for_user(user)
	serializer = UserSerializer(instance=user)

	return Response({'tokens': token, 'user': serializer.data}, status=status.HTTP_200_OK)

@api_view(['POST'])
def verify_otp(request):
	user = get_object_or_404(CustomUser, username=request.data.get('username'))

	otp = request.data.get('otp')
	if not otp:
		return Response({'detail': 'OTP required.'}, status=status.HTTP_400_BAD_REQUEST)

	try:
		device = TOTPDevice.objects.get(user=user, name='default')
		totp = pyotp.TOTP(device.key)

		if not totp.verify(otp):
			return Response({'detail': 'Invalid OTP.'}, status=status.HTTP_401_UNAUTHORIZED)
	except TOTPDevice.DoesNotExist:
		return Response({'detail': 'OTP device not found.'}, status=status.HTTP_404_NOT_FOUND)
	user.otp_verified = True
	user.save()
	return Response({'detail': 'OTP verified successfully.'}, status=status.HTTP_200_OK)



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

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@update_last_active
@permission_classes([IsAuthenticated])
def getUser(request, user_id):
    # Extract user ID from the token
    token_user_id = request.user.id
    
    # Ensure the token user matches the requested user ID
    if token_user_id != user_id:
        return Response({"error": "You are not authorized to access this user's data."}, status=403)
    
    # Retrieve user from the database
    user = get_object_or_404(CustomUser, id=user_id)
    
    # Serialize the user data
    serializer = UserSerializer(instance=user)
    
    # Return the serialized user data
    return Response({'user': serializer.data})

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

from rest_framework.parsers import MultiPartParser

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@update_last_active
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser])
def updateUserPorfile(request):
	print(request.data)
	# Retrieve user from the database
	user = get_object_or_404(CustomUser, id=request.user.id)

	# Serialize the user data
	profile_serializer = UserProfileSerializer(instance=user, data=request.data, partial=True, context={'request': request})
	if profile_serializer.is_valid():
		profile_serializer.save()
		user_serializer = UserSerializer(instance=user)
		jwt_token = create_jwt_pair_for_user(user)
		return Response({'user': user_serializer.data, 'tokens': jwt_token})
	detail = {'detail': 'Invalid data'}
	if profile_serializer.errors.get('username'):
		detail = {'detail': 'Username taken'}
	elif profile_serializer.errors.get('email'):
		detail = {'detail': 'Email taken'}
	elif profile_serializer.errors.get('display_name'):
		detail = {'detail': 'Display name taken'}
	elif profile_serializer.errors.get('password'):
		detail = {'detail': 'Missing required fields'}
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
def add_matchHistory(request, match_id):
	# Retrieve user from the database
	match = get_object_or_404(PongMatch, id=match_id)

	# Add the user to the friend list
	request.user.match_history.add(match)

	# Return the serialized user data
	return Response(MatchHistorySerializer(instance=match).data)

@api_view(['GET'])
@update_last_active
def get_matchHistory(request):
	# Retrieve user from the database
	match = PongMatch.objects.all()

	serializer = MatchHistorySerializer(instance=match, many=True)
	# Return the serialized user data
	return Response(serializer.data)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@update_last_active
@permission_classes([IsAuthenticated])
def logOut(request):
	return Response(status=status.HTTP_200_OK)