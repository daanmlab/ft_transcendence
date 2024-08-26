from datetime import timedelta
from rest_framework_simplejwt.tokens import Token
import pyotp

class OTPToken(Token):
    token_type = 'otp'
    lifetime = timedelta(minutes=5)

    @classmethod
    def create_token(cls, user_id, otp_secret):
        token = cls()
        token['user_id'] = user_id
        token['otp_secret'] = otp_secret
        return token

    def validate_user(self, user_id):
        if self['user_id'] != user_id:
            raise ValueError("Invalid OTP token for this user")
        return True

    def validate_structure(self):
        if not all(field in self.payload for field in ['user_id', 'otp_secret']):
            raise ValueError('Invalid OTP token structure')
        return True
