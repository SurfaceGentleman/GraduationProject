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
        return User.objects.create_user(**validated_data)

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
        fields = ['id', 'text', 'score', 'type', 'option_list']


class QuestionListSerializer(ModelSerializer):
    class Meta:
        model = models.QuestionList
        fields = ['id', 'name', 'question_list']
        extra_kwargs = {
            "questions": {'write_only': True},
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

# class BriefQuestionListSerializer(ModelSerializer):
#     class Meta:
#         model = models.QuestionList
#         fields = ['id', 'name']
