from django.contrib import admin
from .models import CustomUser, PongMatch
# Register your models here.
admin.site.register([CustomUser, PongMatch])