from django.urls import path, include
from . import views

urlpatterns = [
	path('startMatch', views.startMatch),
	path('endMatch', views.endMatch),
	path('gameMenu.html', views.game_menu_template)
]