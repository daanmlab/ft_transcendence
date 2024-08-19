from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_jwt.settings import api_settings

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.core.signing import Signer, BadSignature
from django.conf import settings

User = get_user_model()
jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
jwt_decode_handler = api_settings.JWT_DECODE_HANDLER
signer = Signer()

class LoginView(APIView):
    permission_classes = (AllowAny,)
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=400)
        try:
            user = User.objects.get(email=email)
            if not user.email_is_verified:
                return Response({'error': 'Email is not verified'}, status=401)
        except User.DoesNotExist:
            return Response({'error': 'Invalid username'}, status=401)

        if user.check_password(password):
            payload = jwt_payload_handler(user)
            token = jwt_encode_handler(payload)
            return Response({'token': token})
        else:
            return Response({'error': 'Invalid password'}, status=401)

class RegisterView(APIView):
    permission_classes = (AllowAny,)
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')

        if User.objects.filter(email=email).exists() or User.objects.filter(username=username).exists():
            return Response({'error': 'Email or username already in use'}, status=409)

        if not username or not password:
            return Response({'error': 'Username and password are required'}, status=400)
        if len(password) < 8:
            return Response({'error': 'Password must be at least 8 characters long'}, status=400)
        if len(username) < 4:
            return Response({'error': 'Username must be at least 4 characters long'}, status=400)
        if len(username) > 20:
            return Response({'error': 'Username must be at most 20 characters long'}, status=400)

        user = User.objects.create_user(email=email, username=username, password=password)
        user.email_is_verified = False
        user.save()

        token = signer.sign(user.pk)
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        send_mail(
            'Verify your email',
            f'Click the link to verify your email: {verification_url}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
        )

        return Response({'message': 'User registered successfully. Please verify your email.'}, status=201)

class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, token):
        try:
            user_id = signer.unsign(token)
            user = User.objects.get(pk=user_id)
            user.email_is_verified = True
            user.save()
            return Response({'message': 'Email verified successfully.'}, status=200)
        except (BadSignature, User.DoesNotExist):
            return Response({'error': 'Invalid or expired token'}, status=401)

class UserView(APIView):
    def get(self, request):
        token = request.headers.get('Authorization').split(' ')[1]
        # check if token is expired
        try:
            jwt_decode_handler(token)
        except:
            return Response({'error': 'Token is expired'}, status=401)
        if not token:
            return Response({'error': 'Token is required'}, status=401)
        user = User.objects.get(id=jwt_decode_handler(token)['user_id'])
        return Response({
            'username': user.username,
            'email': user.email,
            'avatar': user.avatar
        })