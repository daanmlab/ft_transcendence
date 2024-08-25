import logging

from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.core.signing import Signer, BadSignature
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_jwt.settings import api_settings
from rest_framework.generics import GenericAPIView
from rest_framework import status

from .serializers import LoginSerializer, RegisterSerializer
from .two_factor_auth_views import TwoFactorAuthenticationMixin

User = get_user_model()
jwt_decode_handler = api_settings.JWT_DECODE_HANDLER
signer = Signer()

logger = logging.getLogger(__name__)

from rest_framework_simplejwt.tokens import RefreshToken

class LoginView(TwoFactorAuthenticationMixin, GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.validated_data['user']
                if user.is_2fa_enabled:
                    return self.handle_two_factor_authentication(request, user)
                
                refresh = RefreshToken.for_user(user)
                logger.info(f"User {user.username} logged in successfully")
                return Response({
                    "success": True,
                    "refresh": str(refresh),
                    "access": str(refresh.access_token)
                }, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"An unexpected error occurred during login: {e}")
                return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            logger.error(f"Validation error: {serializer.errors}")
            return Response({"error": serializer.errors}, status=status.HTTP_401_UNAUTHORIZED)

class RegisterView(APIView):
    permission_classes = (AllowAny,)
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            logger.info(f"User with ID {user.id} registered successfully")
            try:
                self.send_verification_email(user)
                return Response({'message': 'User registered successfully'}, status=201)
            except Exception as e:
                logger.error(f"Error while sending verification email: {str(e)}")
                return Response({'error': 'Error while sending verification email'}, status=500)
        logger.error(f"Error during registration: {serializer.errors}")
        return Response(serializer.errors, status=400)

    def send_verification_email(self, user):
        token = signer.sign(user.pk)
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        send_mail(
            'Verify your email',
            f'Click the link to verify your email: {verification_url}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
        )
        logger.info(f"Verification email sent to user ID {user.id}")

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
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Response({'error': 'Token is required'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            token = auth_header.split(' ')[1]
            payload = jwt_decode_handler(token)
        except IndexError:
            return Response({'error': 'Token prefix missing'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception:
            return Response({'error': 'Token is invalid or expired'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'username': user.username,
            'email': user.email,
            'avatar': user.avatar
        }, status=status.HTTP_200_OK)
