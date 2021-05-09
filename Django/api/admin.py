from django.contrib import admin

# Register your models here.
from api import models

admin.site.site_title = "后端管理"
admin.site.site_header = "知识竞答系统后端管理"


class OptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'question', 'is_true')
    list_per_page = 10
    search_fields = ('id', 'text')


class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'option_list')
    list_per_page = 10
    search_fields = ('id', 'text')


class QuestionListAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    list_per_page = 10
    search_fields = ('id', 'name')


class RoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'type')
    list_per_page = 10
    search_fields = ('id', 'name')


admin.site.register(models.Option, OptionAdmin)
admin.site.register(models.Question, QuestionAdmin)
admin.site.register(models.QuestionList, QuestionListAdmin)
admin.site.register(models.TestRecord)
admin.site.register(models.User)
admin.site.register(models.Room, RoomAdmin)
admin.site.register(models.Wrong)
