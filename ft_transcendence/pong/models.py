from django.db import models
from users.models import CustomUser

# Create your models here.

class Match(models.Model):
	game = models.CharField(max_length=20, default='Pong')
	player1 = models.ForeignKey(CustomUser, related_name='player1_matches', on_delete=models.CASCADE)
	player1Hp = models.IntegerField()
	player2 = models.ForeignKey(CustomUser, related_name='player2_matches', on_delete=models.CASCADE)
	player2Hp = models.IntegerField()
	timePlayed = models.CharField(max_length=20)
	dateTime = models.CharField(max_length=20)

	def __str__(self):
		return f'{self.player1.username} vs. {self.player2.username} on {self.dateTime}'


