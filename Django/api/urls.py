from django.urls import path, include
from rest_framework_jwt.views import obtain_jwt_token

from rest_framework.routers import DefaultRouter

from api import views

router = DefaultRouter()

# 注册用户
router.register('register', views.RegisterView)
router.register('questions', views.QuestionViewSet)
router.register('question_lists', views.QuestionListViewSet)
router.register('test_record', views.TestRecordViewSet)
router.register('answer_record', views.AnswerRecordViewSet)
router.register('options', views.OptionViewSet)
router.register('room', views.RoomViewSet)
router.register('wrong', views.WrongViewSet)

urlpatterns = [
    # 用户登录
    path('login/', obtain_jwt_token),

    path('', include(router.urls)),
    path('upload_test/', views.UploadTestRecordView.as_view()),
    path('upload_question/', views.UploadQuestionView.as_view()),
    path('user_wrong/<int:user>/', views.WrongAPIView.as_view()),
    path('user_last_record/<int:pk>/', views.UserLastTestView.as_view()),
    path('user_detail_test_record/<int:pk>/<int:test_pk>/', views.UserDetailTestView.as_view()),
    path('user_record/<int:pk>/', views.UserTestRecordAPIView.as_view()),
]
