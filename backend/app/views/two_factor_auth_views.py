import logging
import pyotp

from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from app.tokens.otp_token import OTPToken
from rest_framework.exceptions import AuthenticationFailed

from .services import generate_jwt_response

User = get_user_model()
logger = logging.getLogger(__name__)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        otp = request.data.get('otp')
        otp_token = request.data.get('otp_token')

        if not otp or not otp_token:
            return Response({'error': 'OTP and OTP token are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = self.validate_otp_token(otp_token, otp)
            return generate_jwt_response(user_id)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)

    def validate_otp_token(self, otp_token, otp):
        decoded_token = OTPToken(otp_token)
        decoded_token.validate_structure()
        totp = pyotp.TOTP(decoded_token['otp_secret'], interval=300)
        if not totp.verify(otp, valid_window=1):
            raise AuthenticationFailed("Invalid OTP")
        return decoded_token['user_id']