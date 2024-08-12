from asyncio import sleep
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print('connected')
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def startGame(self):
        await sleep(1)
        print('game started')
        await self.send(text_data=json.dumps({
            'action': 'gameStarted'
        }))
        await sleep(10)
        print('game ended')
        await self.send(text_data=json.dumps({
            'action': 'gameEnded'
        }))
        self.channel_layer.send('pong', {
            'type': 'pong.gameEnded'
        })
        pass


    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json['action']
        print(action)
        if action == 'ping':
            await self.send(text_data=json.dumps({
                'action': 'pong'
            }))
        elif action == 'start':
            self.startGame()
        else:
            self.send(text_data=json.dumps({
                'error': 'Invalid action'
            }))