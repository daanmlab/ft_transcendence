import logging
import pyotp

from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import TokenError, RefreshToken

from app.tokens.otp_token import OTPToken

User = get_user_model()
logger = logging.getLogger(__name__)

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
        decoded_token = OTPToken(otp_token)
        decoded_token.validate_structure()
        totp = pyotp.TOTP(decoded_token['otp_secret'], interval=300)
        if not totp.verify(otp, valid_window=1):
            raise ValueError("Invalid OTP")
        return decoded_token['user_id']

    def generate_jwt_response(self, user_id):
        user = User.objects.get(id=user_id)
        refresh = RefreshToken.for_user(user)
        logger.info(f"User ID {user_id} successfully verified OTP")
        return Response({
            "success": True,
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        }, status=status.HTTP_200_OK)
