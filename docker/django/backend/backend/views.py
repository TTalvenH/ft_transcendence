from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

def error(request):
    # Assume the login was successful
    return render(request, '404.html')
