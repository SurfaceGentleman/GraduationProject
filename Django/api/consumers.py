import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer

from api.models import User


class ChatConsumer(JsonWebsocketConsumer):
    user_list = []

    # 所有人是否都已经准备
    def is_ready(self):
        for i in self.user_list:
            if not i['ready']:
                return False
        return True

    def connect(self):
        self.room_group_name = "hehe"
        self.scope["ready"] = False
        print(self.channel_name)
        print(self.scope)
        self.scope['user'] = User.objects.get(pk=self.scope['url_route']['kwargs']['user'])
        print(self.scope['user'])
        self.user_list.append({
            "username": self.scope['user'].username,
            "user_id": self.scope['user'].id,
            "ready": False
        })
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'join_message',
                'message': self.scope['user'].username + "加入了房间"
            }
        )

        self.accept()

    def disconnect(self, close_code):

        # 移出房间
        for i in self.user_list:
            if i["user_id"] == self.scope['user'].id:
                self.user_list.remove(i)
                break

        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data=None, bytes_data=None):
        print(text_data)
        text_data_json = json.loads(text_data)

        # 发送消息
        if text_data_json['status'] == 100:
            message = text_data_json['message']

            # Send message to room group
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message
                }
            )
        # 准备
        elif text_data_json['status'] == 200:
            for i in self.user_list:
                if i["user_id"] == self.scope['user'].id:
                    i['ready'] = True
                    break

            # 通知客户端该用户已经准备
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'ready_one_message',
                    'message': 200,
                    'username': self.scope['user'].username
                }
            )
            if self.is_ready():
                # 通知客户端开始
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'ready_message',
                        'message': 201
                    }
                )

    # Receive message from room group
    def chat_message(self, event):
        message = event['message']
        # Send message to WebSocket

        # self.send(text_data=json.dumps({
        #     'message': self.scope['url_route']['kwargs']['user'] + ":" + message
        # }))

        self.send_json(content={"message": message,
                                "status": 100
                                })

    # 加入房间信息
    def join_message(self, event):
        message = event['message']
        self.send_json(content={"message": message,
                                "status": 101
                                })
        self.send_json(content={"message": self.user_list,
                                "tips": "这是已加入房间的用户",
                                "status": 102
                                })

    # 准备信息
    def ready_message(self, event):
        status = event['message']
        self.send_json(
            content={
                "status": status,
                "message": "所有人已准备"
            }
        )

    def ready_one_message(self, event):
        status = event['message']
        username = event['username']
        self.send_json(
            content={
                "status": status,
                "message": username + "已准备"
            }
        )
