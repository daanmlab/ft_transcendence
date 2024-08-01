from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_jwt.settings import api_settings
from django.contrib.auth.models import User

jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
jwt_decode_handler = api_settings.JWT_DECODE_HANDLER

class LoginView(APIView):
    permission_classes = (AllowAny,)
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid username'}, status=400)

        if user.check_password(password):
            payload = jwt_payload_handler(user)
            token = jwt_encode_handler(payload)
            return Response({'token': token})
        else:
            return Response({'error': 'Invalid password'}, status=400)

class RegisterView(APIView):
    permission_classes = (AllowAny,)
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=400)

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=400)
        if len(password) < 8:
            return Response({'error': 'Password must be at least 8 characters long'}, status=400)
        if len(username) < 4:
            return Response({'error': 'Username must be at least 4 characters long'}, status=400)
        if len(username) > 20:
            return Response({'error': 'Username must be at most 20 characters long'}, status=400)

        user = User.objects.create_user(email=email, username=username, password=password)
        payload = jwt_payload_handler(user)
        token = jwt_encode_handler(payload)
        return Response({'token': token}, headers={
            'Access-Control-Allow-Origin': '*'
        })

class UserView(APIView):
    def get(self, request):
        token = request.headers.get('Authorization').split(' ')[1]
        if not token:
            return Response({'error': 'Token is required'}, status=400)
        user = User.objects.get(id=jwt_decode_handler(token)['user_id'])
        return Response({'username': user.username, 'email': user.email})