from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_jwt.settings import api_settings
from django.contrib.auth.models import User

jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        try:
            user = User.objects.get(username=username)
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

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=400)

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=400)
        if len(password) < 8:
            return Response({'error': 'Password must be at least 8 characters long'}, status=400)
        if len(username) < 4:
            return Response({'error': 'Username must be at least 4 characters long'}, status=400)
        if len(username) > 20:
            return Response({'error': 'Username must be at most 20 characters long'}, status=400)

        user = User.objects.create_user(username=username, password=password)
        payload = jwt_payload_handler(user)
        token = jwt_encode_handler(payload)
        return Response({'token': token})