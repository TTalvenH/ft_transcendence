import json
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from .models import Match
from .serializers import MatchSerializer

# Create your views here.
@api_view(['GET'])
def startMatch(request):
	#get data from database
	# users = User.objects.filter(is_authenticated=True)
	# data = []
	# for user in users:
	# 	data.append(user.username)
	# return Response(data)
	return Response(
		{'users': ['Tuomo', 'Nikki']}
	)

@api_view(['POST'])
def endMatch(request):
	print(request.body)
	json_data = json.loads(request.body)
	match = models.PongMatch.objects.create(
		player1Name=json_data['player1']['name'],
		player1Hp=json_data['player1']['hitpoints'],
		player2Name=json_data['player2']['name'],
		player2Hp=json_data['player2']['hitpoints'],
		winner=json_data['winner'],
		timePlayed=json_data['matchTimeLength'],
		dateTime=json_data['dateTime']
	)
	print(match)
	return Response(status=200)


@api_view(['GET'])
def game_menu_template(request):
	return render(request, 'pong/gameMenu.html')


@api_view(['GET'])
def one_v_one_template(request):
	return render(request, 'pong/1v1.html')


@api_view(['GET'])
def controls_template(request):
	return render(request, 'pong/controls.html')

@api_view(['POST'])
def create_match(request):
	match_serializer = MatchSerializer(data=request.data)

	if match_serializer.is_valid():
		match_serializer.save()
		return Response(match_serializer.data, status=status.HTTP_201_CREATED)
	return Response(match_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
