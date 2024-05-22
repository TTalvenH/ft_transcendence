from django.urls import path, include
from . import views

urlpatterns = [
	path('api/pong.html', views.pong),
	path('gameMenu.html', views.game_menu_template)
]