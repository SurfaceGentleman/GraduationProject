from django.contrib.auth.models import Group
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.serializers import ModelSerializer

from api.models import User
from api import models


class UserModelSerializer(serializers.ModelSerializer):
    re_password = serializers.CharField(write_only=True, max_length=16, min_length=4, required=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'describe', 'nickname', 're_password', 'icon']
        extra_kwargs = {
            'username': {'max_length': 16},
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        user.groups.add(Group.objects.get(id=3))
        return user

    # 局部钩子
    def validate_mobile(self, data):
        if not len(data) == 11:
            raise ValidationError("手机号不合法！")
        return data

    # 全局钩子
    def validate(self, attrs):
        if attrs.get('password') != attrs.get('re_password'):
            raise ValidationError("密码不一致")
        # 去除该字段
        attrs.pop('re_password')
        return attrs


class UserReadOnlyModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'icon']


class UserImageModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['icon']


class OptionSerializer(ModelSerializer):
    class Meta:
        model = models.Option
        fields = ['id', 'text', 'is_true', 'question']


class QuestionSerializer(ModelSerializer):
    class Meta:
        model = models.Question
        fields = ['id', 'text', 'score', 'type', 'option_list', 'right_option_list']
        extra_kwargs = {
            'right_option_list': {'read_only': True}
        }


class QuestionListSerializer(ModelSerializer):
    class Meta:
        model = models.QuestionList
        fields = ['id', 'name', 'question_list', 'create_time']
        extra_kwargs = {
            "questions": {'write_only': True},
            'create_time': {'read_only': True}
        }


class TestRecordSerializer(ModelSerializer):
    class Meta:
        model = models.TestRecord
        fields = ['id', 'user', 'create_time', 'test_name', 'user_name', 'score', 'answer_list']
        extra_kwargs = {
            "user": {'write_only': True}
        }


# class ChoseOption(ModelSerializer):
#     class Meta:
#         model = models.ChoseOptions
#         fields = ['id', '']

class AnswerRecordSerializer(ModelSerializer):
    class Meta:
        model = models.AnswerRecord
        fields = ['id', 'test_record', 'question_info', 'option_list', 'is_true', 'question', 'chose_options']

    extra_kwargs = {
        'chose_options': {'write_only': True},
        'test_record': {'write_only': True},
        'question': {'write_only': True},
    }


class RoomSerializer(ModelSerializer):
    class Meta:
        model = models.Room
        fields = ['id', 'test_record', 'score', 'name', 'question_list', 'user', 'password', "type"]


# class BriefQuestionListSerializer(ModelSerializer):
#     class Meta:
#         model = models.QuestionList
#         fields = ['id', 'name']

class WrongSerializer(ModelSerializer):
    class Meta:
        model = models.Wrong
        fields = ['id', 'user', 'question', 'question_info', 'username']
        extra_kwargs = {
            'user': {'write_only': True},
            'question': {'write_only': True},
            'question_info': {'read_only': True},
            'username': {'read_only': True}
        }
        # depth = 1
