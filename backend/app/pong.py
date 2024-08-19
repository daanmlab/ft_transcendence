import json
import uuid
import asyncio
import math

from channels.generic.websocket import AsyncWebsocketConsumer
from .Game import PongGame
from channels.layers import get_channel_layer

class PongConsumer(AsyncWebsocketConsumer):
    MAX_SPEED = 5
    THRUST = 0.2

    game_group_name = "game_group"
    game = PongGame()
    players = set()

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    update_lock = asyncio.Lock()

    async def connect(self):
        self.player_id = str(uuid.uuid4())
        await self.accept()
    
    
        await self.channel_layer.group_add(
            self.game_group_name, self.channel_name
        )

        await self.send(
            text_data=json.dumps({"type": "playerId", "playerId": self.player_id})
        )

        async with self.update_lock:
            self.players.add(self.player_id)

        await self.game.startGame(self)
        pass


    async def disconnect(self, close_code):
        async with self.update_lock:
            if self.player_id in self.players:
                del self.players[self.player_id]

        await self.channel_layer.group_discard(
            self.game_group_name, self.channel_name
        )

    async def receive(self, text_data):
        temp_player = 'left'
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get("type", "")

        if message_type == "start_game":
            self.start_game(text_data_json)
        elif message_type == "keydown":
            async with self.update_lock:
                game = self.game
                game["paddles"][temp_player]["moving"] = text_data_json["direction"]
        elif message_type == "keyup":
            async with self.update_lock:
                game = self.game
                game["paddles"][temp_player]["moving"] = 0



    async def state_update(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "stateUpdate",
                    "objects": event["objects"],
                }
            )
        )
