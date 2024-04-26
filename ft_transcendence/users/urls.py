from django.urls import path, include
from . import views

urlpatterns = [
	path('login.html', views.login),
	path('register.html', views.register),
	path('profile.html', views.userProfileTemplate),
	path('create-user', views.createUser, name="create-user"),
	path('login-user', views.loginUser, name="login-user"),
	path('test-token', views.testToken, name="test-token"),
]