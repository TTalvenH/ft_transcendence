from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

# Creating our own user class
class CustomUser(AbstractUser):
	match_history = models.ManyToManyField('PongMatch', blank=True)
	friends = models.ManyToManyField('CustomUser', blank=True)
	image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
	otp_enabled = True
	last_active = models.DateTimeField(default=timezone.now)
	def update_last_active(self):
		self.last_active = timezone.now()
		self.save()

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