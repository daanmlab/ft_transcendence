from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class PongGame(models.Model):
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1_games', null=False)
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2_games', default=None, null=True)
    channel_group_name = models.CharField(max_length=100, default='')
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='won_games', default=None, null=True)
    date_played = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.player2 is None:
            return f"{self.player1.username} is still waiting for an opponent"
        if self.winner is None:
            return f"{self.player1.username} vs {self.player2.username} - Winner: TBD"
        return f"{self.player1.username} vs {self.player2.username} - Winner: {self.winner.username}"

class Tournament(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    participants = models.ManyToManyField(User, related_name='tournaments')
    games = models.ManyToManyField(PongGame, related_name='tournaments', blank=True)

    def __str__(self):
        return self.name