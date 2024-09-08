import asyncio
import json
from random import Random
from typing import Union
from channels.generic.websocket import AsyncWebsocketConsumer

def truncate(n, decimals=0) -> float:
    multiplier = 10 ** decimals
    return int(n * multiplier) / multiplier


class Hitbox :
    def __init__(self, x, y, width, height):
        self.x: float = x
        self.y: float = y
        self.width: float = width
        self.height: float = height

    def printState(self, name: str):
        print(f"{name}: {self.x}, {self.y}, {self.width}, {self.height}")

    def collides(self, other: "Hitbox") -> bool:
        # check if the other hitbox is to the left of this hitbox
        if self.x > other.x and self.x < other.x + other.width:
            print("Collision on x left")
            # check if the other hitbox is above this hitbox
            if self.y > other.y and self.y < other.y + other.height:
                return True
            # check if the other hitbox is below this hitbox
            if self.y + self.height > other.y and self.y + self.height < other.y + other.height:
                return True
        # check if the other hitbox is to the right of this hitbox
        if self.x + self.width > other.x and self.x + self.width < other.x + other.width:
            print("Collision on x right")
            # check if the other hitbox is above this hitbox
            if self.y > other.y and self.y < other.y + other.height:
                return True
            # check if the other hitbox is below this hitbox
            if self.y + self.height > other.y and self.y + self.height < other.y + other.height:
                return True
        return False
    
class Paddle (Hitbox):
    def __init__(self, x):
        super().__init__(x, 0.5 - 0.075, 0.02, 0.15)
        self.moving: float = 0
    pass

    def update(self):
        self.y = truncate(self.y + self.moving, 2)

class Ball (Hitbox):
    def __init__(self, x, y):
        super().__init__(x, y, 0.02, 0.02)
        self.speed_x = 0.03
        self.speed_y = 0
    pass

    def update(self):
        self.x = truncate(self.x + self.speed_x, 2)
        self.y = truncate(self.y + self.speed_y, 2)
    pass



class Game :
    def __init__(self):
        self.ball = Ball(0.5 - 0.01, 0.5 - 0.01)
        self.paddles = list([
            Paddle(0),
            Paddle(1 - 0.02)
        ])
        self.socket: Union[AsyncWebsocketConsumer, None] = None

    def reset(self):
        self.ball = Ball(0.5 - 0.01, 0.5 - 0.01)
        self.paddles[0].y = 0.5 - 0.075
        self.paddles[1].y = 0.5 - 0.075
    
    async def game_loop(self):
        if (self.socket is None):
            return
        while True:
            # Update the ball's position
            self.ball.update()
            # Update the paddles' positions
            for paddle in self.paddles:
                paddle.update()
            await asyncio.sleep(.1)
            # Check if the ball collides with the top or bottom of the screen
            if self.ball.y <= 0 or self.ball.y + self.ball.height >= 1:
                self.ball.speed_y *= -1

            # Check if the ball collides with the paddles
            self.ball.printState("Ball")
            self.paddles[0].printState("Paddle 0")
            self.paddles[1].printState("Paddle 1")
            if self.ball.collides(self.paddles[0]) or self.ball.collides(self.paddles[1]):
                print("Collided")
                self.ball.speed_x *= -1

            # Check if the ball got past left paddle
            if self.ball.x < self.paddles[0].x:
                self.reset()
                self.socket.channel_layer.group_send(self.socket.game_group_name, {
                    "type": "state_update",
                    "objects": {
                        "type": "score",
                        "player": 1
                    }
                })
                pass

            # Check if the ball got past right paddle
            if self.ball.x + self.ball.width > self.paddles[1].x + self.paddles[1].width:
                self.reset()
                self.socket.channel_layer.group_send(self.socket.game_group_name, {
                    "type": "state_update",
                    "objects": {
                        "type": "score",
                        "player": 0
                    }
                })
                pass


            await self.socket.channel_layer.group_send(self.socket.game_group_name, {
                "type": "state_update",
                "objects": {
                    "type": "gameState",
                    "ball": {
                        "x": truncate(self.ball.x, 2),
                        "y": truncate(self.ball.y, 2),
                        "width": truncate(self.ball.width, 2),
                        "height": truncate(self.ball.height, 2),
                        "speed_x": truncate(self.ball.speed_x, 2),
                        "speed_y": truncate(self.ball.speed_y, 2)
                    },
                    "paddles": [
                        {
                            "x": truncate(self.paddles[0].x, 2),
                            "y": truncate(self.paddles[0].y, 2),
                            "width": truncate(self.paddles[0].width, 2),
                            "height": truncate(self.paddles[0].height, 2)
                        },
                        {
                            "x": truncate(self.paddles[1].x, 2),
                            "y": truncate(self.paddles[1].y, 2),
                            "width": truncate(self.paddles[1].width, 2),
                            "height": truncate(self.paddles[1].height, 2)
                        }
                    ]
                }
            })
            # await asyncio.sleep(0.1)
        pass

    async def startGame(self, socket: AsyncWebsocketConsumer):
        self.socket = socket
        await socket.channel_layer.group_send(socket.game_group_name, {
            "type": "state_update",
            "objects": {
                "type": "startGame"
            }
        })
        asyncio.create_task(self.game_loop())
        pass
    pass