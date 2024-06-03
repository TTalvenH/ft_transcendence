from rest_framework import serializers
from .models import Match, Tournament
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
			'id',
			'game',
			'tournament_match',
			'player1',
			'player1Hp',
			'player2',
			'player2Hp',
			'timePlayed',
			'dateTime'
		]
		read_only_fields = ['id']

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
	

class TournamentSerializer(serializers.ModelSerializer):
	match_one = MatchSerializer()
	match_two = MatchSerializer()
	match_final = MatchSerializer()

	class Meta:
		model = Tournament
		fields = [
			'id',
			'game',
			'dateTime',
			'match_one',
			'match_two',
			'match_final',
		]
		read_only_fields = ['id']

class TournamentCreateSerializer(serializers.ModelSerializer):
	match_one = serializers.PrimaryKeyRelatedField(queryset=Match.objects.all())
	match_two = serializers.PrimaryKeyRelatedField(queryset=Match.objects.all())
	match_final = serializers.PrimaryKeyRelatedField(queryset=Match.objects.all())

	class Meta:
		model = Tournament
		fields = [
			'match_one',
			'match_two',
			'match_final'
		]

	def create(self, validated_data):
		# Extract matches from the validated data
		match_one = validated_data.pop('match_one')
		match_two = validated_data.pop('match_two')
		match_final = validated_data.pop('match_final')

		# Create the tournament
		tournament = Tournament.objects.create(
			match_one=match_one,
			match_two=match_two,
			match_final=match_final
		)

		# Add players from the matches to the tournament
		players = set()
		players.add(match_one.player1)
		players.add(match_one.player2)
		players.add(match_two.player1)
		players.add(match_two.player2)

		tournament.players.set(players)
		tournament.save()

		return tournament