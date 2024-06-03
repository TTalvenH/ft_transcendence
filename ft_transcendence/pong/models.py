from django.db import models
from users.models import CustomUser
from django.utils import timezone

# Create your models here.

class Match(models.Model):
	game = models.CharField(max_length=20, default='Pong')
	tournament_match = models.BooleanField(default=False)
	player1 = models.ForeignKey(CustomUser, related_name='player1_matches', on_delete=models.CASCADE)
	player1Hp = models.IntegerField()
	player2 = models.ForeignKey(CustomUser, related_name='player2_matches', on_delete=models.CASCADE)
	player2Hp = models.IntegerField()
	timePlayed = models.CharField(max_length=20)
	dateTime = models.DateTimeField(default=timezone.now)

	def __str__(self):
		return f'{self.player1.username} vs. {self.player2.username} on {self.dateTime}'


class Tournament(models.Model):
	game = models.CharField(max_length=20, default='Pong')
	players = models.ManyToManyField(CustomUser)
	match_one = models.ForeignKey(Match, related_name='match_one', on_delete=models.CASCADE, default=None)
	match_two = models.ForeignKey(Match, related_name='match_two', on_delete=models.CASCADE, default=None)
	match_final = models.ForeignKey(Match, related_name='match_final', on_delete=models.CASCADE, default=None)
	dateTime = models.DateTimeField(default=timezone.now)