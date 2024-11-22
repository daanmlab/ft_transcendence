import qrcode
import base64
import pyotp
from io import BytesIO
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import GenericAPIView
from .services import generate_jwt_response
from app.tokens.OTPToken import OTPToken

User = get_user_model()

class TwoFactorAuthView(GenericAPIView):
    permission_classes = [AllowAny]
    
    def generate_otp(self, user):
        """
        Generate a one-time password (OTP) for the user.
        """
        if not user.validation_secret:
            user.validation_secret = pyotp.random_base32()
            user.save()
        
        totp = pyotp.TOTP(user.validation_secret, interval=30)
        otp = totp.now()
        print(f"Generated OTP for {user.email}: {otp}")
        return otp

    def validate_otp(self, user, otp):
        """
        Validate the provided OTP against the user's TOTP.
        """
        if not user.validation_secret:
            return False

        totp = pyotp.TOTP(user.validation_secret, interval=30)
        
        return totp.verify(otp, valid_window=2)
    
class AuthenticatorSetupView(TwoFactorAuthView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Generate a QR code for setting up the authenticator app.
        """
        user = request.user
        if user.two_factor_method == 'authenticator':
            return Response({'error': 'Authenticator already set up'}, status=status.HTTP_400_BAD_REQUEST)
        
        totp = user.generate_totp()

        # Create provisioning URI
        uri = totp.provisioning_uri(
            name=user.email,
            issuer_name='PONG'
        )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(uri)
        qr.make(fit=True)
        
        # Convert to base64
        img = qr.make_image(fill_color="black", back_color="white")
        img_io = BytesIO()
        img.save(img_io, format='PNG')
        qr_code_base64 = base64.b64encode(img_io.getvalue()).decode('utf-8')
        
        return Response({
            'qr_code': qr_code_base64,
        })

class VerifyAuthenticatorSetupView(TwoFactorAuthView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Verify the OTP provided by the user during authenticator setup.
        """
        user = request.user
        if user.two_factor_method == 'authenticator':
            return Response({'error': 'Authenticator already set up'}, status=status.HTTP_400_BAD_REQUEST)
        
        otp = request.data.get('otp')
        is_valid = self.validate_otp(user, otp)
        
        if is_valid:
            user.two_factor_method = 'authenticator'
            user.save()
            return Response({
                'success': True,
                'message': 'Two-factor authentication setup successfully'
            })
        
        return Response({
            'error': 'Invalid OTP',
        }, status=status.HTTP_400_BAD_REQUEST)
    
class VerifyOTPView(TwoFactorAuthView):
    
    def post(self, request):
        otp = request.data.get('otp')
        otp_token = request.data.get('otp_token')
        
        if not otp or not otp_token:
            return Response({'error': 'OTP and OTP token are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Validate token
            validated_token = OTPToken(otp_token)
            validated_token.verify()
            
            # Get user from token
            user_id = validated_token.payload.get('user_id')
            user = User.objects.get(id=user_id)
        except Exception as e:
            return Response({'error': 'Invalid verification token'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Validate OTP
        if self.validate_otp(user, otp):
            return generate_jwt_response(user)
        
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_401_UNAUTHORIZED)