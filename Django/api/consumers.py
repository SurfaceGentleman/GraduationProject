import json
import time, datetime
from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer

from api.models import *
from api.serializers import *


class QuestionConsumer(JsonWebsocketConsumer):
    user_list = []

    def connect(self):

        self.room_group_name = pk = self.scope['url_route']['kwargs']['room']
        self.scope["ready"] = False
        print(self.channel_name)
        print(self.scope)
        self.scope['user'] = User.objects.get(pk=self.scope['url_route']['kwargs']['user'])
        print(self.scope['user'])
        # 是否为组织者
        if self.scope['user'].groups.all().first().id == 1:
            self.user_list.append({
                "username": self.scope['user'].username + "（组织者）",
                "user_id": self.scope['user'].id,
                "ready": False,
                "answered": False,
                "organizer": True
            })
        else:
            self.user_list.append({
                "username": self.scope['user'].username,
                "user_id": self.scope['user'].id,
                "ready": False,
                "answered": False,
                "organizer": False
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

        # 接收消息
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
        # 服务器向客户端发送题目
        elif text_data_json['status'] == 210:
            message = text_data_json['message']
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'send_question',
                    'message': message
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
                    'message': 300,
                    'user_id': self.scope['user'].id
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
                    if i['answered'] != True and i['organizer'] == False:
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
        elif text_data_json['status'] == 500:
            # 通知组织者用户作答情况
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'send_record',
                    'data': text_data_json['data'],
                    "user_name": text_data_json['user_name'],
                    'status': 501
                }
            )
        elif text_data_json['status'] == 502:
            # 通知用户排名
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'send_rank',
                    'data': text_data_json['data'],
                    'status': 502,
                    'message': "这是排名情况"
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

    def send_question(self, event):
        self.send_json(
            content={
                "status": 210,
                "message": event['message']
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
                "user_id": event['user_id'],
                "status": 300
            }
        )

    def send_record(self, event):
        score = 0
        for data in event['data']:
            score += data['score']
            print(data)

        self.send_json(
            content={
                "status": 501,
                "data": event['data'],
                "user_name": event['user_name'],
                'score': score
            }
        )

    def send_rank(self, event):
        self.send_json(
            content={
                "status": 502,
                "data": event['data'],
                "message": event['message']
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

    # 所有人是否都已经准备
    def is_ready(self):
        for i in self.user_list:
            if not i['ready']:
                return False
        return True

    def connect(self):
        self.room_group_name = self.scope['url_route']['kwargs']['room']
        self.scope["ready"] = False
        print(self.channel_name)
        print(self.scope)
        self.scope['user'] = User.objects.get(pk=self.scope['url_route']['kwargs']['user'])
        print(self.scope['user'])
        # 是否为组织者
        if self.scope['user'].groups.all().first().id == 1:
            self.user_list.append({
                "username": self.scope['user'].username + "（组织者）",
                "user_id": self.scope['user'].id,
                "ready": False,
                "answered": False,
                "organizer": True
            })
        else:
            self.user_list.append({
                "username": self.scope['user'].username,
                "user_id": self.scope['user'].id,
                "ready": False,
                "answered": False,
                "organizer": False
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
        message = text_data_json['message']
        if text_data_json['status'] == 100:

            # Send message to room group
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message
                }
            )
        # 600是组织者主动发布的
        elif text_data_json['status'] == 600:
            # 发布给用户
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'send_responder',
                    'message': message
                }
            )
        # 601有用户选择抢答
        elif text_data_json['status'] == 601:
            # 将信息发送给组织者,用户
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {

                    'type': 'send_601',
                    'message': message,
                    "username": self.scope['user'].username
                }
            )
            # 组织者发送603
            pass
        elif text_data_json['status'] == 602:

            # 然后向用户发送接收信息
            pass
        elif text_data_json['status'] == 603:
            # 用户收到603
            username = text_data_json['username']
            is_true = text_data_json['is_true']
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'send_603',
                    'message': message,
                    "username": username,
                    "is_true": is_true
                }
            )

        elif text_data_json['status'] == 610:
            # 用户收到结束
            # send_end
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'send_end',
                    "message": message
                }
            )
        elif text_data_json["status"] == 611:
            # 组织者收到结束
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'send_score',
                    "message": message,
                    "username": text_data_json['username'],
                    "score": text_data_json["score"]
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

    # 发送抢答
    def send_responder(self, event):
        message = event['message']
        self.send_json(content={
            "message": message,
            "status": 600,
            "time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        })

    # 有用户选择抢答
    def send_601(self, event):
        message = event['message']
        self.send_json(content={
            "message": message,
            "status": 601,
            "username": event['username'],
            "time": datetime.datetime.now().__str__()
        })

    # 组织者返回结果
    def send_603(self, event):
        self.send_json(content={
            "message": event['message'],
            "status": 603,
            "username": event['username'],
            "is_true": event['is_true']
        })

    # 结束抢答
    def send_end(self, event):
        self.send_json(content={
            "message": event['message'],
            "status": 610
        })

    # 用户向组织者上传得分
    def send_score(self, event):
        self.send_json(content={
            "message": event['message'],
            "score": event['score'],
            "status": 611,
            "username": event["username"]
        })


# 匹配
class MatchConsumer(JsonWebsocketConsumer):
    user_list = []
    match_list = []
    room = 0

    def connect(self):
        self.room_group_name = 'match'
        self.scope["ready"] = False
        print(self.channel_name)
        print(self.scope)
        self.scope['user'] = User.objects.get(pk=self.scope['url_route']['kwargs']['user'])
        print(self.scope['user'])

        self.user_list.append({
            "username": self.scope['user'].username,
            "user_id": self.scope['user'].id
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

        print(self.user_list)

        print(text_data)
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        if text_data_json['status'] == 100:

            # Send message to room group
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message
                }
            )
        elif text_data_json['status'] == 110:
            print("有用户想要匹配")
            # 标记为想要匹配,加入匹配队列
            self.match_list.append(
                {
                    "username": self.scope['user'].username,
                    "user_id": self.scope['user'].id
                }
            )

            if len(self.match_list) == 2:
                room = self.room
                self.room += 1
                count = 0
                for user in self.match_list:
                    # Send message to room group
                    print(user)
                    async_to_sync(self.channel_layer.group_send)(
                        self.room_group_name,
                        {
                            'type': 'send_match_ses',
                            'status': 200,
                            'message': "匹配成功",
                            'user_id': user['user_id'],
                            'room': str(room) + 'match'
                        }
                    )
                    # 得到房间号之后，用户会自己断开连接
                self.match_list.clear()
            else:
                pass

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

    def send_match_ses(self, event):
        status = event['status']
        user_id = event['user_id']
        room = event['room']
        message = event['message']

        self.send_json(
            content={
                "status": status,
                'user_id': user_id,
                'room': room,
                'message': message
            }
        )
