from django.urls import path
from . import views

app_name = 'api'

urlpatterns = [
    path('home.html', views.home, name='home'),
    path('login.html', views.login, name='login'),
]
