from django.urls import path
from . import views

urlpatterns = [
	path('gameMenu.html', views.game_menu_template, name="gameMenu"),
	path('1v1.html', views.one_v_one_template, name="1v1"),
	path('controls.html', views.controls_template, name="controls"),
	path('create-match', views.create_match, name="create-match"),
	path('create-tournament', views.create_tournament, name="create-tournament"),
	path('tournament.html', views.tournament_template, name="tournament"),
	path('tournament_match.html', views.tournament_match_template, name="tournament-match"),
	path('get_tournament_info/<int:tournament_id>/', views.get_tournament_info, name="tournament-info"),
]