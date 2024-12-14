from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path, path
from app import pong
from app.consumers import GameInvitationConsumer

# URLs that handle the WebSocket connection are placed here.
websocket_urlpatterns=[
    path("ws/<str:game_id>/", pong.PongConsumer.as_asgi()),
    path('ws/game-invitation/<str:room_name>/', GameInvitationConsumer.as_asgi()),
]

