from rest_framework.serializers import ModelSerializer

from app01 import models


class OptionSerializer(ModelSerializer):
    class Meta:
        model = models.Option
        fields = ['id', 'text', 'is_true', 'question']


class QuestionSerializer(ModelSerializer):
    class Meta:
        model = models.Question
        fields = ['id', 'text', 'score', 'is_right', 'type', 'option_list']


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
