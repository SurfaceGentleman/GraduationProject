from django.urls import path

from api import consumers

websocket_urlpatterns = [
    path("ws/<str:room>/<str:user>/", consumers.QuestionConsumer.as_asgi()),
    path("ws/responder/<str:room>/<str:user>/", consumers.ResponderConsumer.as_asgi()),
    path("match/<str:user>/", consumers.MatchConsumer.as_asgi()),
]
