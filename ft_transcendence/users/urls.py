from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
	path('login.html', views.login_template),
	path('register.html', views.register),
	path('profile.html/<str:username>/', views.userProfileTemplate),
	path('qr_prompt.html', views.qrPrompt),
	path('update_profile.html', views.updateProfile),
	path('create-user', views.createUser, name="create-user"),
	path('login-user', views.loginUser2, name="login-user"),
	path('test-token', views.testToken, name="test-token"),
	path('get-user/<int:user_id>/', views.getUser, name="get-user"),
	path('setup-otp', views.setup_otp, name="setup-otp"),
	path('validate-otp', views.validateOtpAndLogin, name="validate-otp"),
	path('get-user-profile/<str:username>/', views.getUserPorfile, name="get-user-profile"),
	path('update-user-profile', views.updateUserPorfile, name="update-user-profile"),
	path('add-friend/<str:username>/', views.addFriend, name="add-friend"),
	path('log-out-view', views.logOut, name="log-out"),
	path('add-matchHistory/<int:match_id>/', views.add_matchHistory, name="add-matchHistory"),
	path('get-matchHistory', views.get_matchHistory, name="get-matchHistory"),
	path('token/refresh_token', TokenRefreshView.as_view(), name="refresh_token"),
]