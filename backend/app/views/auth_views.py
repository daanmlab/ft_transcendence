import pyotp
import logging

from datetime import datetime
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.core.signing import Signer, BadSignature
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_jwt.settings import api_settings
from rest_framework.generics import GenericAPIView
from rest_framework.exceptions import ValidationError
from rest_framework import permissions
from rest_framework import status

from .serializers import LoginSerializer
from .services import flatten_validation_error
from .two_factor_auth import TwoFactorAuthenticationMixin

User = get_user_model()
jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
jwt_decode_handler = api_settings.JWT_DECODE_HANDLER
signer = Signer()

logger = logging.getLogger(__name__)

class LoginView(TwoFactorAuthenticationMixin, GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']

            if user.is_2fa_enabled:
                return self.handle_two_factor_authentication(request, user)

            payload = self.get_jwt_payload(user)
            token = self.get_jwt_token(payload)
            return Response({"success": True, "token": token}, status=status.HTTP_200_OK)

        except ValidationError as e:
            logger.error(f"Validation error: {e}")
            error_message = flatten_validation_error(e.detail)
            return Response({"error": error_message}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f"An unexpected error occurred during login: {e}")
            return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return Response({'error': 'Token is required'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
<<<<<<< HEAD
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

=======
            jwt_decode_handler(token)
        except:
            return Response({'error': 'Token is expired'}, status=401)
        if not token:
            return Response({'error': 'Token is required'}, status=401)
        user = User.objects.get(id=jwt_decode_handler(token)['user_id'])
>>>>>>> feature/oauth2
        return Response({
            'username': user.username,
            'email': user.email,
            'avatar': user.avatar
        }, status=status.HTTP_200_OK)

class VerifyOTPView(APIView):
    def post(self, request):
        otp, otp_token = self.extract_otp_and_token(request)
        if not otp or not otp_token:
            return Response({'error': 'OTP and OTP token are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp_payload = jwt_decode_handler(otp_token)
            response = self.verify_otp(otp, otp_payload)
            return response

        except Exception as e:
            return self.handle_generic_exception(e)

    def extract_otp_and_token(self, request):
        otp = request.data.get('otp')
        otp_token = request.data.get('otp_token')
        if not otp or not otp_token:
            logger.warning("OTP or OTP token missing in request.")
        return otp, otp_token

    def verify_otp(self, otp, otp_payload):
        user_id = otp_payload['user_id']
        otp_secret = otp_payload['otp_secret']
        otp_valid_until = otp_payload['otp_valid_until']

        otp_valid_until = timezone.datetime.fromisoformat(otp_valid_until).replace(tzinfo=timezone.utc)
        if otp_valid_until < timezone.now():
            logger.info(f"OTP expired for user ID {user_id}.")
            return Response({"error": "OTP expired"}, status=status.HTTP_410_GONE)

        totp = pyotp.TOTP(otp_secret, interval=300)
        if totp.verify(otp, valid_window=1):
            user = User.objects.get(id=user_id)
            payload = jwt_payload_handler(user)
            token = jwt_encode_handler(payload)
            logger.info(f"OTP verified successfully for user ID {user_id}.")
            return Response({"success": True, "token": token}, status=status.HTTP_200_OK)
        else:
            logger.warning(f"Invalid OTP provided for user ID {user_id}.")
            return Response({"error": "Invalid OTP"}, status=status.HTTP_401_UNAUTHORIZED)

    def handle_generic_exception(self, exception):
        logger.error(f"Error during OTP verification: {str(exception)}")
        return Response({"error": "An error occurred during verification"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)