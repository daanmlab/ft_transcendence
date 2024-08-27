from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework.exceptions import ValidationError
User = get_user_model()

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if user and user.is_active:
            if not user.email_is_verified:
                raise serializers.ValidationError("Email is not verified")
            data['user'] = user
            return data
        raise serializers.ValidationError("Incorrect Credentials")

class VerifyOTPSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    otp = serializers.CharField()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'avatar', 'email_is_verified', 'is_2fa_enabled')
        read_only_fields = ('id', 'email', 'email_is_verified', 'is_2fa_enabled')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, max_length=128)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password']
        
    def validate_username(self, value):
        if len(value) < 4 or len(value) > 20:
            raise serializers.ValidationError("Username must be between 4 and 20 characters long.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user