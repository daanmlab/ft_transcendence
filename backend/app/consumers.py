import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GameInvitationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"game_invitation_{self.room_name}"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        print(f"Connected to room: {self.room_name}, group: {self.room_group_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        print(f"Disconnected from room: {self.room_name}, group: {self.room_group_name}")

    async def game_accepted(self, event):
        game_url = event['game_url']
        await self.send(text_data=json.dumps({'type': 'game_accepted', 'game_url': game_url}))

        print(f"Sent game URL: {game_url} to room: {self.room_name}, group: {self.room_group_name}")

    async def game_invited(self, event):
        invitation = event['invitation']
        await self.send(text_data=json.dumps({'type': 'game_invited', 'invitation': invitation}))

        print(f"Sent invitation: {invitation} to room: {self.room_name}, group: {self.room_group_name}")