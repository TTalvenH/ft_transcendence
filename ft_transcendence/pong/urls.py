from django.urls import path, include
from . import views

urlpatterns = [
	path('startMatch', views.startMatch, name="startMatch"),
	path('endMatch', views.endMatch, name="endMatch"),
	path('gameMenu.html', views.game_menu_template, name="gameMenu"),
	path('1v1.html', views.one_v_one_template, name="1v1"),
	path('controls.html', views.controls_template, name="controls"),
	path('create-match', views.create_match, name="create-match"),
]