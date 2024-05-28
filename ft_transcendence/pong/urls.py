from django.urls import path, include
from . import views

urlpatterns = [
	path('startMatch', views.startMatch),
	path('endMatch', views.endMatch),
	path('gameMenu.html', views.game_menu_template),
	path('1v1.html', views.one_v_one_template)
]