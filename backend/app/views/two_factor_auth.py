import pyotp
import logging

from datetime import datetime, timedelta
from rest_framework.response import Response
from rest_framework import status
from rest_framework_jwt.settings import api_settings
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
jwt_decode_handler = api_settings.JWT_DECODE_HANDLER

class TwoFactorAuthenticationMixin:
    def handle_two_factor_authentication(self, request, user):
        auth_header = request.headers.get('Authorization')
        try:
            if auth_header:
                otp_payload = self.handle_existing_otp_token(auth_header, user)
            else:
                otp_payload = self.handle_new_otp_token(user)
            otp_token = self.encode_otp_token(otp_payload)
            logger.info("OTP token generated for user ID %s", user.id)
            return Response({
                'success': False,
                'message': 'OTP required',
                'otp_token': otp_token
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error("Failed to handle two-factor authentication for user ID %s: %s", user.id, e)
            raise e

    def handle_existing_otp_token(self, auth_header, user):
        logger.info("Handling existing OTP token for user ID %s", user.id)
        payload = auth_header.split(' ')[1]
        otp_payload = self.decode_otp_token(payload)
        otp_valid_until = datetime.fromisoformat(otp_payload['otp_valid_until'])
        if datetime.now() > otp_valid_until:
            logger.info("OTP token expired on %s for user ID %s", otp_valid_until, user.id)
            return self.handle_new_otp_token(user)
        return otp_payload

    def handle_new_otp_token(self, user):
        logger.info("Handling new OTP token for user ID %s", user.id)
        try:
            otp_secret, otp_valid_until = self.send_otp(user)
            otp_payload = {
                'user_id': user.id,
                'otp_secret': otp_secret,
                'otp_valid_until': otp_valid_until
            }
            return otp_payload
        except Exception as e:
            logger.error("Failed to send OTP to user ID %s: %s", user.id, e)
            raise e

    def send_otp(self, user):
        totp = pyotp.TOTP(pyotp.random_base32(), interval=300)
        otp = totp.now()
        send_mail(
            'Your OTP for Login',
            f'Your OTP is {otp}. It will expire in 5 minutes.',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        logger.info("OTP sent to %s, user ID %s", user.email, user.id)
        return totp.secret, (datetime.now() + timedelta(minutes=5)).isoformat()

    def decode_otp_token(self, token):
        return jwt_decode_handler(token)

    def encode_otp_token(self, payload):
        return jwt_encode_handler(payload)