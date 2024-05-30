from rest_framework import serializers
from .models import CustomUser, PongMatch
from .tokens import create_jwt_pair_for_user
from django.utils import timezone
import re


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
		password = attrs['password']
		if len(password) < 8:
			raise serializers.ValidationError({"password": "Password must be at least 8 characters long."})
		if not re.search(r'[A-Z]', password):
			raise serializers.ValidationError({"password": "Password must contain at least one uppercase letter."})
		if not re.search(r'[a-z]', password):
			raise serializers.ValidationError({"password": "Password must contain at least one lowercase letter."})
		if not re.search(r'\d', password):
			raise serializers.ValidationError({"password": "Password must contain at least one number."})
		if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
			raise serializers.ValidationError({"password": "Password must contain at least one special character."})
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

class MatchHistorySerializer(serializers.ModelSerializer):
	class Meta:
		model = PongMatch
		fields = ['id', 'player1Name', 'player1Hp', 'player2Name', 'player2Hp', 'winner', 'timePlayed', 'dateTime']

class UserProfileSerializer(serializers.ModelSerializer):
	friends = FriendSerializer(many=True)  # Use the nested serializer
	match_history = MatchHistorySerializer(many=True)
	old_password = serializers.CharField(
		write_only=True,
		required=False,
	)
	new_password = serializers.CharField(
		write_only=True,
		required=False,
		validators=[validate_password]
	)
	confirm_password = serializers.CharField(
		write_only=True,
		required=False
	)
	class Meta:
		model = CustomUser
		fields = ['id', 'image', 'username', 'friends', 'match_history', 'last_active', 'old_password', 'new_password', 'confirm_password', 'email', 'otp_enabled']
		read_only_fields = ['id', 'friends', 'match_history', 'last_active']
		extra_kwargs = {
			'username': {'required': False}  # Make username field optional for partial updates
		}
	def validate(self, attrs):
		user = self.context['request'].user
		print('HELLOOOO')
		if 'new_password' in attrs and 'confirm_password' in attrs and 'old_password' in attrs:
			print('heellloooo22')
			if not user.check_password(attrs.get('old_password', '')):
				raise serializers.ValidationError({"old_password": "Wrong password."})
			if attrs['new_password'] != attrs['confirm_password']:
				raise serializers.ValidationError({"password": "Password fields didn't match."})
			password = attrs['new_password']
			print('password is = {}'.format(password))
			if len(password) < 8:
				raise serializers.ValidationError({"new_password": "Password must be at least 8 characters long."})
			if not re.search(r'[A-Z]', password):
				raise serializers.ValidationError({"new_password": "Password must contain at least one uppercase letter."})
			if not re.search(r'[a-z]', password):
				raise serializers.ValidationError({"new_password": "Password must contain at least one lowercase letter."})
			if not re.search(r'\d', password):
				raise serializers.ValidationError({"new_password": "Password must contain at least one number."})
			if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
				raise serializers.ValidationError({"new_password": "Password must contain at least one special character."})
		elif 'new_password' in attrs or 'confirm_password' in attrs or 'old_password' in attrs:
			raise serializers.ValidationError({"password": "Missing required field."})
		return attrs
	
	def update(self, instance, validated_data):
		new_password = validated_data.pop('new_password', None)
		validated_data.pop('confirm_password', None)
		validated_data.pop('old_password', None)

		old_username = instance.username

		instance = super().update(instance, validated_data)

		if new_password:
			instance.set_password(new_password)
			instance.save()
		if instance.otp_enabled == False:
			instance.otp_verified = False
			instance.save()


		# Update match_history entries with the user's new name
		for match in instance.match_history.all():
			if match.player1Name == old_username:
				match.player1Name = instance.username
			elif match.player2Name == old_username:
				match.player2Name = instance.username
			if match.winner == old_username:
				match.winner = instance.username
			match.save()
			print('player 1 = {}, player 2 = {}, winner = {}'.format(match.player1Name, match.player2Name, match.winner))

		return instance
