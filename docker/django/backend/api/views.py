from django.shortcuts import render

# Create your views here.
def home(request):
    print('testi1')
    return render(request, 'api/home.html')

def login(request):
    # Assume the login was successful
	print('testi')
	return render(request, 'api/login.html')