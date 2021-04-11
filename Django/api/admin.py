from django.contrib import admin

# Register your models here.
from api import models

admin.site.register(models.Option)
admin.site.register(models.Question)
admin.site.register(models.QuestionList)
admin.site.register(models.TestRecord)
admin.site.register(models.AnswerRecord)
admin.site.register(models.User)
