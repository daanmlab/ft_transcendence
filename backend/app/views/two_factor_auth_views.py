import pyotp
import logging

from datetime import timedelta
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.tokens import Token
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import TokenError

User = get_user_model()
logger = logging.getLogger(__name__)

class OTPToken(Token):
    token_type = 'otp'
    lifetime = timedelta(minutes=5)

    @classmethod
    def create_token(cls, user_id, otp_secret, otp_valid_until):
        token = cls()
        token['user_id'] = user_id
        token['otp_secret'] = otp_secret
        token['otp_valid_until'] = otp_valid_until
        return token

class TwoFactorAuthenticationMixin:
    def handle_two_factor_authentication(self, request, user):
        otp_token = request.data.get('otp_token')
        try:
            otp_payload, new_token_created = self.get_or_create_otp_token(otp_token, user)
            response_data = {
                'success': False,
                'message': 'OTP required',
                'otp_token': otp_token if not new_token_created else self.encode_otp_token(otp_payload)
            }
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"OTP token handling failed for user ID {user.id}: {e}")
            return Response({
                'success': False,
                'message': 'An error occurred during two-factor authentication. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_or_create_otp_token(self, otp_token, user):
        if otp_token:
            try:
                payload = self.validate_existing_token(otp_token, user)
                logger.info(f"Valid OTP token for user ID {user.id}. Using existing token.")
                return payload, False
            except TokenError:
                logger.info(f"Expired token for user ID {user.id}. Generating new OTP token.")
        
        new_payload = self.create_new_otp_token(user)
        return new_payload, True

    def validate_existing_token(self, otp_token, user):
        decoded_token = OTPToken(otp_token)
        if decoded_token['user_id'] != user.id:
            raise ValueError("Invalid OTP token for this user")
        return decoded_token.payload

    def create_new_otp_token(self, user):
        totp = pyotp.TOTP(pyotp.random_base32(), interval=300)
        otp = totp.now()
        logger.info(f"New OTP sent to user ID {user.id}")
        # send_mail(
        #     'Your OTP for Login',
        #     f'Your OTP is {otp}. It will expire in 5 minutes.',
        #     settings.DEFAULT_FROM_EMAIL,
        #     [user.email],
        #     fail_silently=False,
        # )
        print(f"OTP sent: {otp}")  # For debugging purposes
        return {
            'user_id': user.id,
            'otp_secret': totp.secret
        }

    def encode_otp_token(self, payload):
        return str(OTPToken.create_token(
            user_id=payload['user_id'],
            otp_secret=payload['otp_secret']
        ))

class VerifyOTPView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        otp = request.data.get('otp')
        otp_token = request.data.get('otp_token')

        if not otp or not otp_token:
            return Response({'error': 'OTP and OTP token are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = self.validate_otp_token(otp_token, otp)
            return self.generate_jwt_response(user_id)
        except (ValueError, TokenError) as e:
            logger.warning(f"OTP verification failed: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            logger.error(f"Unexpected error during OTP verification: {str(e)}", exc_info=True)
            return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def validate_otp_token(self, otp_token, otp):
        payload = OTPToken(otp_token).payload
        if not all(field in payload for field in ['user_id', 'otp_secret']):
            raise ValueError('Invalid OTP token structure')
        
        pyotp.TOTP(payload['otp_secret'], interval=300).verify(otp, valid_window=1)
        return payload['user_id']

    def generate_jwt_response(self, user_id):
        user = User.objects.get(id=user_id)
        refresh = RefreshToken.for_user(user)
        logger.info(f"User ID {user_id} successfully verified OTP")
        return Response({
            "success": True,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=status.HTTP_200_OK)