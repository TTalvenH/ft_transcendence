from django.urls import path, include
from . import views

urlpatterns = [
	path('login.html', views.login_template),
	path('register.html', views.register),
	path('profile.html', views.userProfileTemplate),
	path('update_profile.html', views.updateProfile),
	path('create-user', views.createUser, name="create-user"),
	path('login-user', views.loginUser, name="login-user"),
	path('test-token', views.testToken, name="test-token"),
	path('get-user/<int:user_id>/', views.getUser, name="get-user"),
	path('get-user-profile/<int:user_id>/', views.getUserPorfile, name="get-user-profile"),
	path('update-user-profile', views.updateUserPorfile, name="update-user-profile"),
	path('add-friend/<int:user_id>/', views.addFriend, name="add-friend"),
	path('log-out-view', views.logOut, name="log-out"),
]