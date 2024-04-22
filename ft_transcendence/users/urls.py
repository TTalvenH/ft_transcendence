from django.urls import path, include
from . import views

urlpatterns = [
	path('login.html', views.login),
	path('register.html', views.register),
]