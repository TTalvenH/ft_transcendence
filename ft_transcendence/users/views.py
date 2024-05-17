from django.shortcuts import render, redirect, get_object_or_404
from .forms import CreateUserForm, LoginForm
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser
from .serializers import UserSerializer, RegisterUserSerializer
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

# Create your views here.
@api_view(['GET'])
def login(request):
	return render(request, 'users/login.html')

@api_view(['GET'])
def register(request):
	return render(request, 'users/register.html')

@api_view(['GET'])
def userProfileTemplate(request):
	return render(request, 'users/profile.html')

@api_view(['GET'])
def qrPrompt(request):
	return render(request, 'users/qr_prompt.html')

@api_view(['POST'])
def createUser(request):
    """
    This function is an api_view that can be accessed with a POST request.
    It uses RegisterUserSerializer to validate the request data.
    If the data is valid, it creates a new user with the given data,
    gets the user object, and returns a Response containing the serialized user data.
    If the data is invalid, it returns a Response with error messages.
    """
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
        return Response(response_data, status=status.HTTP_201_CREATED)
    else:
        # Debug: print out the errors
        print(serializer.errors)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def setup_otp(user):
	device, created = TOTPDevice.objects.get_or_create(user=user, name='default')

	if not created:
		return {'detail': 'OTP device already exists.', 'created': False}

	# Generate a unique key for the user
	key = pyotp.random_base32()
	device.key = key
	device.save()


	user.otp_enabled = True
	user.save()
	# Generate the QR code URL
	uri = pyotp.totp.TOTP(key).provisioning_uri(name=user.username, issuer_name="pong")

	# Create the QR code image
	qr = qrcode.make(uri)
	buffered = BytesIO()
	qr.save(buffered, format="PNG")
	img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

	# Read the HTML template from a file
	template_path = '/Users/atuliara/Desktop/new/ft_transcendence/users/templates/users/qr.html'
	try:
		with open(template_path, 'r') as file:
			html_template = Template(file.read())
	except FileNotFoundError:
		return {'detail': 'Template file not found.', 'created': False}

	# Inject the base64 QR code and OTP secret into the HTML template
	html = html_template.safe_substitute(qr_code_url=img_str, otp_secret=key)

	return {
		'detail': 'OTP device created successfully.',
		'created': True,
		'html': html,
		'provisioning_uri': uri
	}

@api_view(['POST'])
def loginUser(request):
	user = get_object_or_404(CustomUser, username=request.data['username'])

	if not user.check_password(request.data['password']):
		return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_404_NOT_FOUND)

	response_data = {'otp_required': user.otp_enabled}

	if user.otp_enabled:
		return Response(response_data, status=status.HTTP_200_OK)

	token = create_jwt_pair_for_user(user)
	serializer = UserSerializer(instance=user)
	response_data.update({'tokens': token, 'user': serializer.data})

	return Response(response_data, status=status.HTTP_200_OK)

@api_view(['POST'])
def validateOtpAndLogin(request):
	user = get_object_or_404(CustomUser, username=request.data['username'])

	# if not user.check_password(request.data['password']):
	# 	return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_404_NOT_FOUND)

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



# This function is an api_view that can be accessed with a GET request
# It is decorated with @authentication_classes, which means that it will
# attempt to authenticate the request using either SessionAuthentication or
# TokenAuthentication.
# The user is only allowed to access this view if they are authenticated,
# which is specified in the @permission_classes decorator.
# The function returns a Response with a dictionary containing the user's
# email, which is taken from request.user.email. This is only accessible if
# the user is authenticated, as specified by the IsAuthenticated permission.

from rest_framework_simplejwt.authentication import JWTAuthentication

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

