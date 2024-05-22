from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view

# Create your views here.
@api_view(['GET'])
def pong(request):
	return render(request, 'pong/pong.html')

@api_view(['GET'])
def game_menu_template(request):
	return render(request, 'pong/gameMenu.html')