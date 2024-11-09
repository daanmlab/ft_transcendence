from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError, APIException, AuthenticationFailed
from .services import send_verification_email
import os

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
        raise AuthenticationFailed("Incorrect Credentials")

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])    
    class Meta:
        model = User
        fields = ['email', 'username', 'password']
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

from django.core.validators import validate_email
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(validators=[validate_email])
    new_password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    avatar_upload = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'avatar_upload', 'two_factor_method', 'email_pending', 'new_password']
        read_only_fields = ['id', 'avatar', 'email_pending']

    def update(self, instance, validated_data):
        avatar_upload = validated_data.pop('avatar_upload', None)
        if avatar_upload:
            instance.avatar_upload = avatar_upload
        new_password = validated_data.pop('new_password', None)
        if new_password:
            instance.set_password(new_password)
        return super().update(instance, validated_data)
    
    def validate_avatar_upload(self, value):
        if value:
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("File too large. Size should not exceed 5 MB.")
            valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in valid_extensions:
                raise serializers.ValidationError("Unsupported file extension.")
        return value