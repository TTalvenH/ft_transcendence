from django.db import models
from users.models import CustomUser

# Create your models here.

class PongMatch(models.Model):
	player1Name = models.CharField(max_length=20)
	player1Hp = models.IntegerField()
	player2Name = models.CharField(max_length=20)
	player2Hp = models.IntegerField()
	winner = models.CharField(max_length=20)
	timePlayed = models.CharField(max_length=20)
	dateTime = models.CharField(max_length=20)

	def __str__(self):
		return f'{self.player1Name} vs. {self.player2Name} on {self.dateTime}'

