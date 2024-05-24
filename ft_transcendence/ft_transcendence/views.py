from django.shortcuts import render

# Create your views here.
def index(request):
	return render(request, 'index.html')

def	ui(request):
	return render(request, 'sidePanel.html')

