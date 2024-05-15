from rest_framework import serializers
from .models import CustomUser
from .tokens import create_jwt_pair_for_user
from django.utils import timezone

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['id', 'username', 'last_active']

from django.contrib.auth.password_validation import password_validators_help_texts, validate_password
from rest_framework.validators import UniqueValidator
class RegisterUserSerializer(serializers.ModelSerializer):
	"""
	Serializer for registering a new user.

	It has three extra fields: password and confirm_password for the user to input their desired
	password twice, and email which must be unique.
	"""

	password = serializers.CharField(
		write_only=True,
		required=True,
		validators=[validate_password]
	)
	confirm_password = serializers.CharField(
		write_only=True,
		required=True
	)
	email = serializers.EmailField(
		required=True,
		validators=[UniqueValidator(queryset=CustomUser.objects.all())]
	)

	class Meta:
		"""
		Meta class for RegisterUserSerializer.

		It specifies the model to use, which is the CustomUser model, and the fields to include in the serializer.
		"""

		model = CustomUser
		fields = ['username', 'email', 'password', 'confirm_password']

	def validate(self, attrs):
		"""
		Validate that the password and confirm_password fields match.

		Raise a serializers.ValidationError if not.
		"""

		if attrs['password'] != attrs['confirm_password']:
			raise serializers.ValidationError(
				{"password": "Password fields didn't match."}
			)

		return attrs

	def create(self, validated_data):
		"""
		Create a new user and set their password.

		Return the created user.
		"""

		user = CustomUser.objects.create(
			username=validated_data['username'],
			email=validated_data['email'],
		)

		user.set_password(validated_data['password'])

		user.save()

		return user


class FriendSerializer(serializers.ModelSerializer):
	is_active = serializers.SerializerMethodField()
	class Meta:
		model = CustomUser
		fields = ['id', 'username', 'is_active']
	def get_is_active(self, obj):
		# Check if the user has been active in the last 5 minutes
		last_active = obj.last_active
		now = timezone.now()
		five_minutes_ago = now - timezone.timedelta(minutes=1)
		return last_active >= five_minutes_ago

class UserProfileSerializer(serializers.ModelSerializer):
	friends = FriendSerializer(many=True)  # Use the nested serializer

	class Meta:
		model = CustomUser
		fields = ['id', 'image', 'username', 'friends', 'match_history', 'last_active']
