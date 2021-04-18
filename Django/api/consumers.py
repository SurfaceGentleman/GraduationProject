import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer

from api.models import *
from api.serializers import *
from django.core import serializers


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
            "ready": False,
            "answered": False
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
        # 通知客户端该用户已经退出房间
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'exit_message',
                'message': 103,
                'username': self.scope['user'].username
            }
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
        # 获取题目数据
        elif text_data_json['status'] == 300:
            # 通知客户端开始
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'get_questions',
                    'question_list_id': text_data_json['question_list_id'],
                    'message': 300
                }
            )
        elif text_data_json['status'] == 301:
            # 通知所有用户当前用户的回答情况
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'send_current_user_answer',
                    'is_true': text_data_json["message"]['is_true'],
                    'message': 301,
                    'username': self.scope['user'].username
                }
            )
            # 修改用户作答信息
            for i in self.user_list:
                if i["user_id"] == self.scope['user'].id:
                    i['answered'] = True
                    break

            # 查看用户回答情况
            def is_all_answerd(self):
                for i in self.user_list:
                    if i['answered'] != True:
                        return False
                return True

            is_all_answered = is_all_answerd(self)
            if is_all_answered:
                print("均作答完成")
                # 通知所有用户所有人均已回答完毕
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'all_user_answered',
                        # 'is_true': text_data_json["message"]['is_true'],
                        'message': 401,
                        # 'username': self.scope['user'].username
                    }
                )
                # 清除作答信息
                for i in self.user_list:
                    i['answered'] = False

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

    # xx用户已准备
    def ready_one_message(self, event):
        status = event['message']
        username = event['username']
        self.send_json(
            content={
                "status": status,
                "message": username + "已准备"
            }
        )

    def exit_message(self, event):
        status = event['message']
        username = event['username']
        self.send_json(
            content={
                "status": status,
                "message": username + "已退出房间"
            }
        )
        self.send_json(
            content={
                "message": self.user_list,
                "tips": "这是已加入房间的用户",
                "status": 102
            }
        )

    def get_questions(self, event):
        status = event['message']
        question_list_id = event['question_list_id']
        question_list_queryset = QuestionList.objects.filter(pk=question_list_id).first()
        question_list_ser = QuestionListSerializer(question_list_queryset)
        self.send_json(
            content={
                "data": question_list_ser.data,
                "status": 300
            }
        )

    def send_current_user_answer(self, event):
        status = event['message']
        record = ""
        if event['is_true']:
            record = "正确"
        else:
            record = "错误"
        self.send_json(
            content={
                "status": 301,
                "data": event['username'] + "回答" + record
            }
        )

    def all_user_answered(self, event):
        status = event['message']
        self.send_json(
            content={
                "status": 401,
                "message": "所有用户均已作答"
            }
        )


class ResponderConsumer(JsonWebsocketConsumer):
    user_list = []
    sponsor = {}
