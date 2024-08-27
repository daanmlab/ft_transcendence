import json
import asyncio

from channels.generic.websocket import AsyncWebsocketConsumer
from .Game import Game
from .models import PongGame
from channels.db import database_sync_to_async


def create_group_name(player_id: int) -> str:
    return f"game_group_{player_id}"



class PongConsumer(AsyncWebsocketConsumer):

    game_group_name = None
    game = Game()

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    update_lock = asyncio.Lock()
    
    @database_sync_to_async
    def get_player1(self, game: PongGame):
        return game.player1

    @database_sync_to_async
    def get_player2(self, game: PongGame):
        return game.player2

    async def connect(self):
        if "error" in self.scope:
            await self.accept()
            await self.send(text_data=json.dumps({"type": "error", "message": self.scope["error"]}))
            await self.close()
            return
        
        # check params if the user is creating a new game or joining an existing one
        await self.accept()
        if "game" in self.scope["url_route"]["kwargs"]:
            self.game_group_name = self.scope["url_route"]["kwargs"]["game"]
            # check if the game exists in the database
            if not await database_sync_to_async(PongGame.objects.filter(channel_group_name=self.game_group_name).exists)():
                await self.send(text_data=json.dumps({"type": "error", "message": "Game not found"}))
                await self.close()
                return
            # check if the game is full
            game: PongGame = await database_sync_to_async(PongGame.objects.get)(channel_group_name=self.game_group_name)
            if (await self.get_player2(game)) is not None:
                await self.send(text_data=json.dumps({"type": "error", "message": "Game is full"}))
                await self.close()
                return
            # add the user to the game
            game.player2 = self.scope["user"]
            await database_sync_to_async(game.save)()
            
            # add user to the group
            await self.channel_layer.group_add(
                self.game_group_name, self.channel_name
            )
            # inform group that a new player has joined
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    "type": "state_update",
                    "objects": {
                        "type": "player_join",
                        "player": self.scope["user"].id
                    }
                }
            )
            await self.send(text_data=json.dumps({"type": "game_id", "game_id": self.game_group_name}))
        else:
            self.game_group_name = create_group_name(int(self.scope["user"].id))
            # delete any existing games
            await database_sync_to_async(PongGame.objects.filter(player1=self.scope["user"]).delete)()
            # create a new game
            game = PongGame(channel_group_name=self.game_group_name, player1=self.scope["user"])
            await database_sync_to_async(game.save)()
            # add user to the group
            await self.channel_layer.group_add(
                self.game_group_name, self.channel_name
            )
            # send the game id to the user

        # if not self.game_group_name:
        return

        self.game = Game()
    
        await self.channel_layer.group_add(
            self.game_group_name, self.channel_name
        )


        await self.game.startGame(self)
        pass


    async def disconnect(self, close_code):
        if self.game_group_name:
            await self.channel_layer.group_discard(
                self.game_group_name, self.channel_name
            )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("type", "")

        if message_type == "start_game":
            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    "type": "state_update",
                    "objects": {
                        "type": "start_game",
                    }
                }
            )
            await self.game.startGame(self)
        elif message_type == "keydown":
            async with self.update_lock:
                self.game.paddles[0].set_moving(-0.02)
        elif message_type == "keyup":
            async with self.update_lock:
                self.game.paddles[0].set_moving(0)

    async def state_update(self, event):
        await self.send(
            text_data=json.dumps(
                event,
            )
        )
