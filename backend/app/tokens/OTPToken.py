from datetime import timedelta
from rest_framework_simplejwt.tokens import Token
from django.contrib.auth import get_user_model

User = get_user_model()

class OTPToken(Token):
    token_type = 'otp'
    lifetime = timedelta(minutes=5)

    def generate_token(user):
        """
        Generate a temporary verification token for OTP verification
        """
        token = OTPToken.for_user(user)
        return str(token)

    def validate_token(token):
        """
        Validate the temporary verification token
        
        Returns the user if token is valid, None otherwise
        """
        try:
            # Validate token
            validated_token = OTPToken(token)
            validated_token.verify()
            
            # Get user from token
            user_id = validated_token.payload.get('user_id')
            user = User.objects.get(id=user_id)
            return user
        
        except Exception as e:
            print(e)
            return None