# 限制只有超级用户能访问
from rest_framework.permissions import BasePermission


class UserPermission(BasePermission):
    message = '仅组织者可以查看'

    def has_permission(self, request, view):
        # user_type = request.user.get_user_type_display()
        # if user_type == '超级用户':
        # 权限在认证之后，所以能取到user
        user_type = request.user.user_type
        print(user_type)
        if user_type == 1:
            return True
        else:
            return False
