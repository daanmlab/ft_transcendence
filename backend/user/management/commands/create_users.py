from django.core.management.base import BaseCommand
from user.models import CustomUser, GameStats
from faker import Faker
import random

class Command(BaseCommand):
    help = "Create a group of users with associated game stats"

    def handle(self, *args, **kwargs):
        fake = Faker()
        number_of_users = 10

        for _ in range(number_of_users):
            username = fake.user_name()
            email = fake.email()

            user = CustomUser.objects.create_user(
                email=email,
                username=username,
                password="pass"
            )

            game_stats = user.game_stats

            total_matches = random.randint(30, 60)
            wins = random.randint(0, total_matches)
            losses = total_matches - wins

            game_stats.total_matches = total_matches
            game_stats.wins = wins
            game_stats.losses = losses
            game_stats.save()

            self.stdout.write(self.style.SUCCESS(f"Successfully created user: {username}, Password: pass"))
