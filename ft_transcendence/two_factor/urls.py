
from django.urls import path
from . import views

urlpatterns = [
    path('2fa/', views.TwoFAView.as_view(), name='2fa'),
]