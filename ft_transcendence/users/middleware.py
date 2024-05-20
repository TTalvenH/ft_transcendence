from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class userMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response
	def __call__(self, request):
		print(request.user)
		if request.user.is_authenticated:
			request.user.update_last_active()
		response = self.get_response(request)
		return response