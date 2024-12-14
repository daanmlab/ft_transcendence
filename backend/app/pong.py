import json
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer
from .Game import Game
from .models import PongGame
from channels.db import database_sync_to_async
from django.utils import timezone

def create_group_name(player_id: int, game_id: int) -> str:
    return f"{game_id}_{player_id}"

class PongConsumer(AsyncWebsocketConsumer):

    game_group_name = None
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    update_lock = asyncio.Lock()
    side: int = 0
    
    @database_sync_to_async
    def get_player1(self, game: PongGame):
        return game.player1

    @database_sync_to_async
    def get_player2(self, game: PongGame):
        return game.player2
    
    @database_sync_to_async
    def get_channel_group_name(self, game: PongGame):
        return game.channel_group_name
    
    @database_sync_to_async
    def game_has_winner(self, game: PongGame):
        return game.winner is not None

    async def connect(self):
        if "error" in self.scope:
            await self.accept()
            await self.send(text_data=json.dumps({"type": "error", "message": self.scope["error"]}))
            await self.close()
            return
        
        print(self.scope["url_route"])

        # check game_id parameter
        await self.accept()
        if not "game_id" in self.scope["url_route"]["kwargs"]:
            await self.send(text_data=json.dumps({"type": "error", "message": "No game ID provided"}))
            await self.close()
            return
        # check if game exists
        db_game: PongGame = await database_sync_to_async(PongGame.objects.filter(id=self.scope["url_route"]["kwargs"]["game_id"]).first)()
        if not db_game:
            await self.send(text_data=json.dumps({"type": "error", "message": "Game not found"}))
            await self.close()
            return
        # check if user is player1 or player2
        if (await self.get_player1(db_game)) != self.scope["user"] and (await self.get_player2(db_game)) != self.scope["user"]:
            await self.send(text_data=json.dumps({"type": "error", "message": "You are not a player in this game"}))
            await self.close()
            return
        # check if game is finished
        if await self.game_has_winner(db_game):
            await self.send(text_data=json.dumps({"type": "error", "message": "Game is finished"}))
            await self.close()
            return
        # check if user is player1 or player2
        if (await self.get_player1(db_game)) == self.scope["user"]:
            self.side = 0
        else:
            self.side = 1

        # check or register channel group
        if not await self.get_channel_group_name(db_game):
            db_game.channel_group_name = create_group_name(self.scope["user"].id, db_game.id)
            print(f"Channel group name: {db_game.channel_group_name}")

            await self.channel_layer.group_add(
                db_game.channel_group_name,
                self.channel_name
            )
            await database_sync_to_async(db_game.save)()
        else:
            print(f"Channel group name: {db_game.channel_group_name}")

            await self.channel_layer.group_add(
                db_game.channel_group_name,
                self.channel_name
            )

        print(f"Connected to game {db_game.id} as {self.scope['user'].username}")

        await self.channel_layer.group_send(
            db_game.channel_group_name,
            {
                "type": "state_update",
                "objects": {
                    "type": "join",
                    "player": self.scope["user"].username,
                    "side": self.side
                }
            }
        )
        db_game.match_date = timezone.now()
        await database_sync_to_async(db_game.save)()

        self.db_game = db_game
        self.game_group_name = db_game.channel_group_name
        self.game = Game()

    async def disconnect(self, close_code):
        if self.game_group_name:
            await self.channel_layer.group_discard(
                self.game_group_name, self.channel_name
            )
        if self.game:
            await self.game.handle_disconnect()

        # Update game status to interrupted if no winner and game was in progress
        if not self.db_game.winner and self.db_game.status == 'in_progress':
            self.db_game.status = 'interrupted'
            await database_sync_to_async(self.db_game.save)()

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("type", "")

        print("Received message: ", message_type)
        if message_type == "start_game":
            print(self.db_game.status)
            if self.db_game.status != "not_started":
                return
            print("Starting game")
            print("Game group name", self.game_group_name)
            
            await self.game.startGame(self)
        elif message_type == "keydown":
            print(text_data_json)
            if text_data_json.get("key") == "w":
                async with self.update_lock:
                    self.game.paddles[self.side].moving = -0.02
                print(self.game.paddles[0].moving)
            elif text_data_json.get("key") == "s":
                async with self.update_lock:
                    self.game.paddles[self.side].moving = 0.02
        elif message_type == "keyup":
            if text_data_json.get("key") == "w" or text_data_json.get("key") == "s":
                async with self.update_lock:
                    self.game.paddles[self.side].moving = 0

    async def state_update(self, event):
        await self.send(
            text_data=json.dumps(
                event.get("objects"),
            )
        )