from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

def home(request):
    return render(request, 'home.html')

def login(request):
    # Assume the login was successful
    return render(request, 'login.html')

def error(request):
    # Assume the login was successful
    return render(request, '404.html')