import logging
import pyotp

from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from rest_framework_simplejwt.tokens import TokenError

from app.tokens.otp_token import OTPToken

logger = logging.getLogger(__name__)

class TwoFactorAuthenticationMixin:
    def handle_two_factor_authentication(self, request, user):
        otp_token = request.data.get('otp_token')
        try:
            otp_payload, new_token_created = self.get_or_create_otp_token(otp_token, user)
            return Response({
                'success': False,
                'message': 'OTP required',
                'otp_token': otp_token if not new_token_created else self.encode_otp_token(otp_payload)
            }, status=status.HTTP_200_OK)
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
        
        return self.create_new_otp_token(user), True

    def validate_existing_token(self, otp_token, user):
        decoded_token = OTPToken(otp_token)
        decoded_token.validate_user(user.id)  # Moved logic
        return decoded_token.payload

    def create_new_otp_token(self, user):
        totp = pyotp.TOTP(pyotp.random_base32(), interval=300)
        otp = totp.now()
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
