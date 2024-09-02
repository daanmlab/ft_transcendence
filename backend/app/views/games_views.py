from ..models import PongGame
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import PongGameSerializer

# get your invited games
# get your created games
# get your active games
# create a new game

class GamesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print(request.user, " is trying to get games")
        # get your invited games
        invited_games = PongGame.objects.filter(player2=request.user)
        # get your created games
        created_games = PongGame.objects.filter(player1=request.user)
        # get your active games
        active_games = PongGame.objects.filter(player1=request.user, started=True, winner__isnull=True)
        return Response({
            "invited_games": PongGameSerializer(invited_games, many=True).data,
            "created_games": PongGameSerializer(created_games, many=True).data,
            "active_games": PongGameSerializer(active_games, many=True).data
        })

    def post(self, request):
        # Check if the user already has an active game
        active_game = request.user.has_active_game()
        if active_game:
            return Response({"error": "You already have an active game"}, status=400)

        # Check if the user has reached the maximum number of created games
        max_created_games = 5  # Set the maximum number of created games here
        created_games_count = PongGame.objects.filter(player1=request.user).count()
        if created_games_count >= max_created_games:
            return Response({"error": "You have reached the maximum number of created games"}, status=400)

        # Check if the user has reached the maximum number of invited games
        max_invited_games = 10  # Set the maximum number of invited games here
        invited_games_count = PongGame.objects.filter(player2=request.user).count()
        if invited_games_count >= max_invited_games:
            return Response({"error": "You have reached the maximum number of invited games"}, status=400)
        
        # create a new game
        game = PongGame.objects.create(player1=request.user)
        return Response(PongGameSerializer(game).data)
    
    def put(self, request):
        # join a game
        game_id = request.data.get('game_id')
        # check if the game ID is provided
        if not game_id:
            return Response({"error": "No game ID provided"}, status=400)
        
        # check if the game exists
        try:
            game = PongGame.objects.get(id=game_id)
        except PongGame.DoesNotExist:
            return Response({"error": "Game not found"}, status=404)
        
        # safeguard against joining your own game
        if game.player1 == request.user:
            return Response({"error": "You can't join your own game"}, status=400)
        
        # safeguard against joining a game that already has two players
        if game.player2:
            return Response({"error": "Game already has two players"}, status=400)
        
        game.player2 = request.user
        game.save()
        return Response(PongGameSerializer(game).data)