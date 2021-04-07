from django.urls import path, include
from rest_framework import routers
from rest_framework.documentation import include_docs_urls

from app01 import views

router = routers.DefaultRouter()
router.register('questions', views.QuestionViewSet)
router.register('question_lists', views.QuestionListViewSet)
router.register('test_record', views.TestRecordViewSet)
router.register('answer_record', views.AnswerRecordViewSet)
router.register('options', views.OptionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('docs/', include_docs_urls(title='API文档')),
    path('upload_test/', views.UploadTestRecordView.as_view()),
    path('upload_question/', views.UploadQuestionView.as_view()),
    path('user_wrong/<int:pk>/', views.UserWrongAnswerView.as_view()),
    path('user_last_record/<int:pk>/', views.UserLastTestView.as_view()),
    path('user_detail_test_record/<int:pk>/<int:test_pk>/', views.UserDetailTestView.as_view()),
    path('user_record/<int:pk>/', views.UserTestRecordAPIView.as_view())
    # path('brief_ques_list/<int:pk>/', views.BriefQuestionListView.as_view())
]
