from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser

def create_jwt_pair_for_user(user: CustomUser):
	refresh = RefreshToken.for_user(user)

	return {
		'access': str(refresh.access_token),
		'refresh': str(refresh)
	}