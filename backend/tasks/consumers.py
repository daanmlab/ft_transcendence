from random import Random
from channels.consumer import SyncConsumer
import os
import time
from django.contrib.auth.models import User

class testConsumer(SyncConsumer):
    ball_x = .5
    ball_y = .5
    ball_speed_x = .05
    ball_speed_y = 0
    paddle_height = .1
    paddle_width = .05
    paddle_left_y = .5 - paddle_height / 2
    paddle_right_y = .5 - paddle_height / 2

    def visualize(self):
        os.system('clear')
        width = 30
        height = 20

        for row in range(height):
            for col in range(width):
                if row == int(self.ball_y * height) and col == int(self.ball_x * width):
                    print("O", end="")
                elif col == 1 or col == width - 2:
                    if row >= int(self.paddle_left_y * height) and row < int((self.paddle_left_y + self.paddle_height) * height):
                        print("|", end="")
                    else:
                        print(" ", end="")
                elif col == 0 or col == width - 1:
                    print("|", end="")
                elif row == 0 or row == height - 1:
                    print("-", end="")
                else:
                    print(" ", end="")
            print()
        pass

    def start_game(self, message):
        print('worker called: ', message['type'])
        if not message['user_id']:
            raise Exception('User ID is required')
        if not message['game_id']:
            raise Exception('Game ID is required')

        self.ball_x = .5
        self.ball_y = .5
        self.ball_speed_x = .05
        self.ball_speed_y = 0
        self.paddle_left_y = .5 - self.paddle_height / 2
        self.paddle_right_y = .5 - self.paddle_height / 2

        
    
        
        while True:
            self.visualize()
            
            # Update the ball's position
            self.ball_x += self.ball_speed_x
            self.ball_y += self.ball_speed_y

            # Check for collisions with paddles
            if self.ball_x <= 1 - self.paddle_width and self.ball_x >= 1 - self.paddle_width - self.ball_speed_x:
                if self.ball_y >= self.paddle_right_y and self.ball_y <= self.paddle_right_y + self.paddle_height:
                    self.ball_speed_x *= -1
                    # add some randomness to the ball direction
                    self.ball_speed_y = Random().randint(-5, 5) * .01
            if self.ball_x >= self.paddle_width and self.ball_x <= self.paddle_width - self.ball_speed_x:
                if self.ball_y >= self.paddle_left_y and self.ball_y <= self.paddle_left_y + self.paddle_height:
                    self.ball_speed_x *= -1

            # Check for collisions with walls
            if self.ball_y <= 0 or self.ball_y >= 1:
                self.ball_speed_y *= -1
            if self.ball_x <= 0 or self.ball_x >= 1:
                print('game over')
                break

            print(f"Ball: ({self.ball_x}, {self.ball_y})")
            print(f"Paddle Left: {self.paddle_left_y}")
            print(f"Paddle Right: {self.paddle_right_y}")
            print("---------------------------")
            
            time.sleep(.5)  # delay between frames

