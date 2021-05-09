from rest_framework.exceptions import AuthenticationFailed

from api import models


def my_jwt_response_payload_handler(token, user=None, request=None):
    return {
        'token': token,
        'msg': '登陆成功',
        'status': 100,
        'username': user.username,
        'user_id': user.id,
        'desc': user.describe,
        'icon': user.icon.url
    }


from rest_framework.authentication import BaseAuthentication
from rest_framework_jwt.authentication import BaseJSONWebTokenAuthentication, jwt_decode_handler

import jwt


class MyJwtAuthentication(BaseAuthentication):
    def authenticate(self, request):
        jwt_value = request.META.get('HTTP_AUTHORIZATION')
        if jwt_value:
            try:
                # jwt提供了通过三段token,取出payload的方法，并且有校验功能
                payload = jwt_decode_handler(jwt_value)
            except jwt.ExpiredSignature:
                raise AuthenticationFailed("已过期")
            except jwt.InvalidTokenError:
                raise AuthenticationFailed("用户非法")
            except Exception as e:
                raise AuthenticationFailed(str(e))

            # 因为payload就是用户信息的字典
            print(payload)

            # 要得到user对象
            # 1.去查数据库
            user = models.User.objects.get(pk=payload.get('user_id'))
            # 2. 不查库
            user = models.User(id=payload.get('user_id'), username=payload.get('username'))

            return user, jwt_value

        # 没有值，直接抛异常
        raise AuthenticationFailed('您没有携带认证信息')


class MyJwtAuthentication2(BaseJSONWebTokenAuthentication):
    def authenticate(self, request):
        jwt_value = request.META.get('HTTP_AUTHORIZATION')
        if jwt_value:
            try:
                # jwt提供了通过三段token,取出payload的方法，并且有校验功能
                payload = jwt_decode_handler(jwt_value)
            except jwt.ExpiredSignature:
                raise AuthenticationFailed("已过期")
            except jwt.InvalidTokenError:
                raise AuthenticationFailed("用户非法")
            except Exception as e:
                raise AuthenticationFailed(str(e))

            user = self.authenticate_credentials(payload)

            return user, jwt_value

        # 没有值，直接抛异常
        raise AuthenticationFailed('您没有携带认证信息')
