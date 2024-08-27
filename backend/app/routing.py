from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path, path
from app import pong

# URLs that handle the WebSocket connection are placed here.
websocket_urlpatterns=[
    path("ws/<str:game>/", pong.PongConsumer.as_asgi()),
    re_path("ws/", pong.PongConsumer.as_asgi()),
]

