from django.urls import path, include
from . import views

urlpatterns = [
	path('login.html', views.login),
	path('register.html', views.register),
	path('profile.html', views.userProfileTemplate),
	path('qr_prompt.html', views.qrPrompt,name='qr-prompt'),
	path('create-user', views.createUser, name="create-user"),
	path('login-user', views.loginUser, name="login-user"),
	path('test-token', views.testToken, name="test-token"),
	path('get-user/<int:user_id>/', views.getUser, name="get-user"),
	path('setup-otp', views.setup_otp, name="setup-otp"),
	path('validate-otp', views.validateOtpAndLogin, name="validate-otp"),
]