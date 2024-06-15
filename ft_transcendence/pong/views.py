import json
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes
from .models import Tournament
from .serializers import MatchCreateSerializer, TournamentSerializer, TournamentCreateSerializer
from users.decorators import update_last_active
from rest_framework_simplejwt.authentication import JWTAuthentication

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@update_last_active
def game_menu_template(request):
	return render(request, 'pong/gameMenu.html')

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@update_last_active
def get_tournament_info(request, tournament_id):
	tournament_serializer = TournamentSerializer(instance=Tournament.objects.get(id=tournament_id), many=False)
	return render(request, 'pong/tournament_info.html', tournament_serializer.data)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@update_last_active
def one_v_one_template(request):
	return render(request, 'pong/1v1.html', {'username': request.user.username})


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@update_last_active
def controls_template(request):
	return render(request, 'pong/controls.html')

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@update_last_active
def tournament_template(request):
	return render(request, 'pong/tournament.html', {'username': request.user.username})


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@update_last_active
def tournament_match_template(request):
	data = request.data
	return render(request, 'pong/tournament_match.html', data)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@update_last_active
def create_match(request):
	match_serializer = MatchCreateSerializer(data=request.data, partial=True)

	if match_serializer.is_valid():
		match_serializer.save()
		return Response(match_serializer.data, status=status.HTTP_201_CREATED)
	return Response(match_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@update_last_active
def create_tournament(request):
	tournament_serializer = TournamentCreateSerializer(data=request.data)

	if tournament_serializer.is_valid():
		tournament_serializer.save()
		return Response(tournament_serializer.data, status=status.HTTP_201_CREATED)
	return Response(tournament_serializer.errors, status=status.HTTP_400_BAD_REQUEST)