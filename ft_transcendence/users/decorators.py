from .models import CustomUser
from rest_framework.response import Response
from rest_framework import status
from functools import wraps

def update_last_active(view_func):
	@wraps(view_func)
	def _wrapped_view(request, *args, **kwargs):
		# Extract the user from the JWT token
		user = request.user

		if not user.is_authenticated:
			return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)

		# Update the user's last active timestamp
		print('user is ={}'.format(user))
		user.update_last_active()

		# Proceed with the original view function
		return view_func(request, *args, **kwargs)
	return _wrapped_view