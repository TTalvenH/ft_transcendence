from django.shortcuts import render, redirect, get_object_or_404
from .forms import CreateUserForm, LoginForm
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser
from .serializers import UserSerializer, RegisterUserSerializer, UserProfileSerializer
from .tokens import create_jwt_pair_for_user
# Create your views here.
@api_view(['GET'])
def login(request):
	return render(request, 'users/login.html')

@api_view(['GET'])
def register(request):
	return render(request, 'users/register.html')

@api_view(['GET'])
def updateProfile(request):
	return render(request, 'users/update_profile.html')

@api_view(['GET'])
def userProfileTemplate(request):
	return render(request, 'users/profile.html')	

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
		serializer.save()
		return Response({'user': serializer.data})
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def loginUser(request):
	user = get_object_or_404(CustomUser, username=request.data['username'])
	if not user.check_password(request.data['password']):
		return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
	token = create_jwt_pair_for_user(user)
	serializer = UserSerializer(instance=user)
	return Response({'tokens': token, 'user': serializer.data})



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

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def getUserPorfile(request, user_id):
    # Retrieve user from the database
    user = get_object_or_404(CustomUser, id=user_id)
    
    # Serialize the user data
    serializer = UserProfileSerializer(instance=user)
    
    # Return the serialized user data
    return Response(serializer.data)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def updateUserPorfile(request):
	# Retrieve user from the database
	user = get_object_or_404(CustomUser, id=request.user.id)

	# Serialize the user data
	serializer = UserProfileSerializer(instance=user, data=request.data, partial=True)
	if (serializer.is_valid()):
		print('its trueee')
		serializer.save()

	# Return the serialized user data
	return Response(serializer.data)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def addFriend(request, user_id):
	# Retrieve user from the database
	user = get_object_or_404(CustomUser, id=user_id)

	# Add the user to the friend list
	request.user.friends.add(user)

	# Return the serialized user data
	return Response(UserSerializer(instance=user).data)