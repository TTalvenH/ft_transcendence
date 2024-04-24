from django.urls import path, include
from . import views

urlpatterns = [
	path('api/pong.html', views.pong)
]