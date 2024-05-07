import json
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from pong import models

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
