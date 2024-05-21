from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.dispatch import receiver
from django.db.models.signals import pre_save, post_delete
from django.core.files.storage import default_storage

# Creating our own user class
class CustomUser(AbstractUser):
	display_name = models.CharField(max_length=50, blank=True)
	match_history = models.ManyToManyField('PongMatch', blank=True)
	friends = models.ManyToManyField('CustomUser', blank=True)
	image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
	otp_enabled = models.BooleanField(default=False)
	last_active = models.DateTimeField(default=timezone.now)
	def update_last_active(self):
		self.last_active = timezone.now()
		self.save()

@receiver(pre_save, sender=CustomUser)
def delete_old_image(sender, instance, **kwargs):
	if instance.pk:
		try:
			old_image = sender.objects.get(pk=instance.pk).image
		except sender.DoesNotExist:
			return
		new_image = instance.image
		if old_image and old_image != new_image:
			if default_storage.exists(old_image.path):
				default_storage.delete(old_image.path)

@receiver(post_delete, sender=CustomUser)
def delete_image_on_delete(sender, instance, **kwargs):
	if instance.image:
		if default_storage.exists(instance.image.path):
			default_storage.delete(instance.image.path)

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