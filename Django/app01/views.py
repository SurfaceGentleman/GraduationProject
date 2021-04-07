from django.shortcuts import render

# Create your views here.
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from app01.models import *
from app01.serializer import *


class QuestionViewSet(ModelViewSet):
    """
        list:
        返回题目列表数据

        retrieve:
        返回题目详情数据

        update:
        修改题目数据

        read:
        返回题目数据
        """
    serializer_class = QuestionSerializer
    queryset = models.Question.objects.all()


class QuestionListViewSet(ModelViewSet):
    serializer_class = QuestionListSerializer
    queryset = models.QuestionList.objects.all()


class TestRecordViewSet(ModelViewSet):
    serializer_class = TestRecordSerializer
    queryset = models.TestRecord.objects.all()


class AnswerRecordViewSet(ModelViewSet):
    serializer_class = AnswerRecordSerializer
    queryset = models.AnswerRecord.objects.all()


class OptionViewSet(ModelViewSet):
    serializer_class = OptionSerializer
    queryset = models.Option.objects.all()


# 上传题目
class UploadQuestionView(APIView):
    def post(self, request, *args, **kwargs):
        json = request.data
        question_info = json['question_info']
        options_info = json['options_info']

        # 保存题目集
        question_ser = QuestionSerializer(data=question_info)
        question_ser.is_valid(raise_exception=True)
        var = question_ser.save()
        question_id = var.id

        # 保存选项
        for option in options_info:
            option['question'] = question_id
        option_ser = OptionSerializer(data=options_info, many=True)
        option_ser.is_valid(raise_exception=True)
        option_ser.save()

        return Response("保存成功")


# 上传测试记录
class UploadTestRecordView(APIView):
    def post(self, request, *args, **kwargs):
        json = request.data
        print(json)
        test_info = json['test_info']
        answer_info = json['answer_info']

        # 保存测试记录
        test_record_ser = TestRecordSerializer(data=test_info)
        test_record_ser.is_valid(raise_exception=True)
        # var.id即为刚刚存储的id
        var = test_record_ser.save()

        # 向该条测试记录存入答题详情表
        for answer in answer_info:
            answer['test_record'] = var.id

        # 保存答题记录
        answer_record_ser = AnswerRecordSerializer(data=answer_info, many=True, partial=True)
        answer_record_ser.is_valid(raise_exception=True)
        answer_record_ser.save()

        return Response({"记录id": var.id})


class UserWrongAnswerView(APIView):

    def get(self, request, *args, **kwargs):
        wrong_info = []
        pk = kwargs.get('pk')
        if pk:
            test_records = TestRecord.objects.filter(user_id=pk)
            for test_record in test_records:
                answer_set = test_record.answer_set.all()
                for answer in answer_set:
                    if not answer.is_true:
                        # # 题目信息
                        # print(answer.question_info())
                        # # 你的选项
                        # print(answer.option_list())
                        # # 正确选项
                        # print(answer.question.right_option_list())
                        wrong_info.append(
                            {
                                "date": test_record.create_time,
                                "question_info": answer.question_info(),
                                "your_chosen": answer.option_list(),
                                "right_options": answer.question.right_option_list(),
                            }
                        )

        return Response(wrong_info)


# 用户详细答题数据
class UserDetailTestView(APIView):
    def get(self, request, pk, test_pk):
        user_last = TestRecord.objects.filter(user_id=pk).filter(pk=test_pk).first()
        answer_list = []
        for i in user_last.answer_set.all():
            answer_list.append({
                "question_info": {
                    "id": i.question.id,
                    "text": i.question.text
                },
                "right_option": i.question.right_option_list(),
                "is_true": i.is_true,
                "options": i.question.option_list()

            })

        json = {
            "id": user_last.id,
            "create_time": user_last.create_time,
            "test_name": user_last.test_name,
            "user_name": user_last.user_name(),
            "score": user_last.score,
            "answer_list": answer_list
        }
        print(json)
        return Response(data=json)


# 用户最近一次作答
class UserLastTestView(APIView):
    def get(self, request, pk):
        user_last = TestRecord.objects.filter(user_id=pk).last()
        answer_list = []
        for i in user_last.answer_set.all():
            answer_list.append({
                "question_info": {
                    "id": i.question.id,
                    "text": i.question.text
                },
                "right_option": i.question.right_option_list(),
                "is_true": i.is_true,
                "options": i.question.option_list()

            })

        json = {
            "id": user_last.id,
            "create_time": user_last.create_time,
            "test_name": user_last.test_name,
            "user_name": user_last.user_name(),
            "score": user_last.score,
            "answer_list": answer_list
        }
        print(json)
        return Response(data=json)


# 用户的作答记录
class UserTestRecordAPIView(APIView):
    def get(self, request, pk):
        user_records = TestRecord.objects.filter(user_id=pk)

        record_json = []
        for user_record in user_records:
            # print(user_record.answer_set.first())
            if user_record.answer_set.first() is not None:
                # print(user_record.answer_set.first().question.question_list)
                test_name = user_record.answer_set.first().question.question_set.name
            else:
                test_name = "null"
            record_json.append(
                {
                    "id": user_record.id,
                    "time": user_record.create_time,
                    "test_name": test_name,
                    "score": user_record.score,
                    "total": user_record.total_score()
                }
            )

        return Response(data=record_json)

# class BriefQuestionListView(APIView):
#     def get(self, request, *args, **kwargs):
#         pk = kwargs.get('pk')
#         if pk:
#             question_list = QuestionList.objects.get(pk=pk)
#             print(question_list.question_list())
#             dict = {
#                 "id": question_list.pk,
#                 "name": question_list.name
#             }
#             brief_question_list = BriefQuestionListSerializer(data=dict, many=False)
#             brief_question_list.is_valid(raise_exception=True)
#             return Response(data=brief_question_list.data)
