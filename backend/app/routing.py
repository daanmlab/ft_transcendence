from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path
from app import pong

# URLs that handle the WebSocket connection are placed here.
websocket_urlpatterns=[
    re_path(
        "ws/yea", pong.PongConsumer.as_asgi()
    ),
]

