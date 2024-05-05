from rest_framework import serializers
from .models import CustomUser
from .tokens import create_jwt_pair_for_user

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['id', 'username']

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


class UserProfileSerializer(serializers.ModelSerializer):
	class Meta:
		model = CustomUser
		fields = ['id', 'image', 'username']