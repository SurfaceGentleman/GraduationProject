from django.db import models

# Create your models here.

from django.db import models
from django.contrib.auth.models import AbstractUser


class BaseModel(models.Model):
    is_delete = models.BooleanField(choices=((0, '未删除'), (1, '删除')), default=0)
    # 自动插入     models.DateTimeField(auto_now_add=True)
    create_time = models.DateTimeField(auto_now_add=True)
    last_update_time = models.DateTimeField(auto_now=True)

    class Meta:
        # 单个字段，有索引，有唯一
        # 多个字段，有联合索引，联合唯一

        # 不在数据库建立表
        abstract = True


# 用户(一对一)
class User(AbstractUser):
    describe = models.CharField(max_length=256, default="")
    icon = models.ImageField(upload_to='icon', default='icon/default.png')
    nickname = models.CharField(max_length=32, default="")

    def __str__(self):
        return self.username


# 问题
class Question(BaseModel):
    text = models.CharField(max_length=512)
    score = models.IntegerField(default=5)
    # 是否单选？(1为单选，2为多选，其余待定)
    type = models.IntegerField(choices=((1, '单选'), (2, '多选'), (3, '其他')), default=1)

    def get_list_name(self):
        return self.question_set.name

    def right_option_list(self):
        right_option_list = self.option_set.all().filter(is_true=True)
        lists = []
        for option in right_option_list:
            lists.append({"id": option.id, 'text': option.text})
        return lists

    def option_list(self):
        option_list = self.option_set.all()
        lists = []
        for option in option_list:
            lists.append({"id": option.id, 'text': option.text, 'is_true': option.is_true})
        return lists

    def __str__(self):
        return self.text

    class Meta:
        db_table = 'question'


# 选项(多对一)
class Option(BaseModel):
    text = models.CharField(max_length=512)
    is_true = models.BooleanField(default=False)
    question = models.ForeignKey(Question, on_delete=models.DO_NOTHING)

    def __str__(self):
        return self.text

    class Meta:
        db_table = 'option'


# # 竞赛（小分可以从题目中获得，总分可以直接加）
# class Event(models.Model):
#     name = models.CharField(max_length=20)
#     questions = models.ManyToManyField(Question, through='QuestionList')
#
#     class Meta:
#         db_table = 'event'


# 题目集（多对多）
class QuestionList(BaseModel):
    name = models.CharField(max_length=512, default="")
    questions = models.ManyToManyField(Question, related_name="question_set")

    def question_list(self):
        question_list = self.questions.all()
        list = []
        for question in question_list:
            list.append({
                "id": question.id,
                "text": question.text,
                "score": question.score,
                "option_list": question.option_list(),

            })
        return list

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'questionList'


# 测试记录
class TestRecord(BaseModel):
    score = models.IntegerField(default=0)
    test_name = models.CharField(max_length=256, default="")
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)

    # type = models

    def total_score(self):
        score = 0
        answer_list = self.answer_set.all()
        for answer in answer_list:
            score += answer.question.score
        return score

    def __str__(self):
        return str(self.create_time) + " | " + self.user.username
        # 多表连接

    def answer_list(self):
        answer_list = self.answer_set.all()
        print(answer_list)
        list = []
        for answer in answer_list:
            list.append({
                'question_info': answer.question_info(),
                'options': answer.question.option_list(),
                'chose_option': answer.option_list(),
                'is_true': answer.is_true,

            })
        return list

    def user_name(self):
        return self.user.username

    class Meta:
        db_table = 'test_record'


class AnswerRecord(BaseModel):
    question = models.ForeignKey(Question, on_delete=models.DO_NOTHING)
    # 多个选项

    chose_options = models.ManyToManyField(Option)
    is_true = models.BooleanField(default=0)
    # 一对多
    test_record = models.ForeignKey(TestRecord, on_delete=models.DO_NOTHING, related_name="answer_set")

    class Meta:
        db_table = 'answer_record'

    def question_info(self):
        return {'id': self.question.id, 'text': self.question.text}

    def option_list(self):
        option_list = self.chose_options.all()
        list = []
        for option in option_list:
            list.append({'id': option.id, 'text': option.text})
        return list

    def __str__(self):
        return self.test_record.test_name + "|" + self.test_record.user.username + "| uid:" + str(
            self.test_record.user.id)


# class Room(BaseModel):
#     # 房价名
#     name = models.CharField(max_length=200)
#     # 竞答类型
#     type = models.IntegerField(choices=((1, '风险题'), (2, '必答题'), (3, '抢答题'), (4, '双人对战')), default=1)
#     password = models.CharField(max_length=6, default='123456')
#
#     # 习题集
#     question_list = models.ForeignKey(to=QuestionList, on_delete=models.DO_NOTHING, default=None)
#     # 组织者
#     user = models.ManyToManyField(to=User, on_delete=models.DO_NOTHING)
