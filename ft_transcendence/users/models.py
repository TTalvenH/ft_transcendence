from django.db import models
from django.contrib.auth.models import AbstractUser

# Creating our own user class
class CustomUser(AbstractUser):
	image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
	otp_enabled = True