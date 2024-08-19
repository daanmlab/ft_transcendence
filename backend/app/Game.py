import asyncio
import json
from random import Random
from typing import Union
from channels.generic.websocket import AsyncWebsocketConsumer

def truncate(n, decimals=0):
    multiplier = 10 ** decimals
    return int(n * multiplier) / multiplier

class Paddle :
    def __init__(self, y):
        self.y = y
        self.moving = 0
class PongGame :
    def __init__(self):
        self.ball_x = 0.5
        self.ball_y = 0.5
        self.paddle_height = 0.1
        self.paddle_width = 0.05
        self.ball_speed_x = 0.03
        self.ball_speed_y = 0
        self.paddles = list([
            Paddle(0.5 - 0.05),
            Paddle(0.5 - 0.05)
        ])
        self.socket: Union[AsyncWebsocketConsumer, None] = None


    
    async def game_loop(self, socket: AsyncWebsocketConsumer):
        while True:
            # Update the ball's position
            self.ball_x = truncate(self.ball_x + self.ball_speed_x, 3)
            self.ball_y = truncate(self.ball_y + self.ball_speed_y, 3)

            # update the paddles
            for paddle in self.paddles:
                paddle.y += paddle.moving
            # Check for collisions with paddles
            if self.ball_x >= self.paddle_width and self.ball_x <= self.paddle_width - self.ball_speed_x:
                if self.ball_y >= self.paddles[0].y and self.ball_y <= self.paddles[0].y + self.paddle_height:
                    self.ball_speed_x *= -1
                    # add some randomness to the ball direction
                    self.ball_speed_y = Random().randint(-5, 5) * .01
            if self.ball_x >= (1 - self.paddle_width):
                await socket.send(text_data=json.dumps({
                    "type": "hit"
                }))
                if self.ball_y >= self.paddles[1].y and self.ball_y <= self.paddles[1].y + self.paddle_height:
                    self.ball_speed_x *= -1
                    self.ball_speed_y = Random().randint(-5, 5) * .01
            # Check for collisions with walls
            if self.ball_y <= 0 or self.ball_y >= 1:
                self.ball_speed_y *= -1
            if self.ball_x <= 0 or self.ball_x >= 1:
                await socket.send(text_data=json.dumps({
                    "type": "gameOver"
                }))
                break
            await socket.send(text_data=json.dumps({
                "type": "gameState",
                "ball": [self.ball_x, self.ball_y],
                "paddles": [[paddle.y for paddle in self.paddles]]
            }))
            await asyncio.sleep(0.5)
        pass

    async def startGame(self, socket: AsyncWebsocketConsumer):
        self.socket = socket
        await socket.send(text_data=json.dumps({"type": "gameStarted"}))
        asyncio.create_task(self.game_loop(socket))
        print('game started')
        pass
    pass