from django.shortcuts import render

# Create your views here.


from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.settings import api_settings
from django.http import JsonResponse

def index(request):
	return render(request, 'index.html')

def	ui(request):
	return render(request, 'sidePanel.html')
