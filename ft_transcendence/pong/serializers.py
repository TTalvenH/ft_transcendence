from rest_framework import serializers
from .models import Match
from users.models import CustomUser

class MatchSerializer(serializers.ModelSerializer):
	player1_username = serializers.CharField(source='player1.username', read_only=True)
	player2_username = serializers.CharField(source='player2.username', read_only=True)

	class Meta:
		model = Match
		fields = [
			'id',
			'game',
			'player1',
			'player1_username',
			'player1Hp',
			'player2',
			'player2_username',
			'player2Hp',
			'timePlayed',
			'dateTime'
		]
		read_only_fields = ['id', 'player1_username', 'player2_username']

class MatchCreateSerializer(serializers.ModelSerializer):
	player1 = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
	player2 = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
	timePlayed = serializers.CharField(max_length=20)
	dateTime = serializers.DateTimeField()

	class Meta:
		model = Match
		fields = [
			'game',
			'player1',
			'player1Hp',
			'player2',
			'player2Hp',
			'timePlayed',
			'dateTime'
		]

	def validate(self, data):
		"""
		Check that the same user is not both player1 and player2.
		"""
		if data['player1'] == data['player2']:
			raise serializers.ValidationError("A player cannot play against themselves.")
		return data

	def create(self, validated_data):
		# Custom creation logic, if needed
		match = Match.objects.create(**validated_data)
		return match