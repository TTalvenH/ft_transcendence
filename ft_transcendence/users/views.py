from django.shortcuts import render, redirect, get_object_or_404
from .forms import CreateUserForm, LoginForm
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from .models import CustomUser
from .serializers import UserSerializer
from .forms import CreateUserForm, LoginForm

# Create your views here.
@api_view(['GET'])
def login(request):
	return render(request, 'users/login.html')

@api_view(['GET'])
def register(request):
	return render(request, 'users/register.html')

@api_view(['POST'])
def createUser(request):
	serializer = UserSerializer(data=request.data)
	if serializer.is_valid():
		serializer.save()
		user = CustomUser.objects.get(username=request.data['username'])
		user.set_password(request.data['password'])
		user.save()
		token = Token.objects.create(user=user)
		return Response({'token': token.key, 'user': serializer.data})
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def loginUser(request):
	user = get_object_or_404(CustomUser, username=request.data['username'])
	if not user.check_password(request.data['password']):
		return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
	token, created = Token.objects.get_or_create(user=user)
	serializer = UserSerializer(instance=user)
	return Response({'token': token.key, 'user': serializer.data})

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
@authentication_classes([SessionAuthentication, TokenAuthentication])
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
