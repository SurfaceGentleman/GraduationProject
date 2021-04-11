from django.urls import path

from api import consumers

websocket_urlpatterns = [
    path("ws/chat/<str:user>/", consumers.ChatConsumer.as_asgi())
]
