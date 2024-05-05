from django.urls import path, include
from . import views

urlpatterns = [
	path('login.html', views.login),
	path('register.html', views.register),
	path('profile.html', views.userProfileTemplate),
	path('create-user', views.createUser, name="create-user"),
	path('login-user', views.loginUser, name="login-user"),
	path('test-token', views.testToken, name="test-token"),
	path('get-user/<int:user_id>/', views.getUser, name="get-user"),
	path('get-user-profile/<int:user_id>/', views.getUserPorfile, name="get-user-profile"),
	path('update-user-profile', views.updateUserPorfile, name="update-user-profile"),
]