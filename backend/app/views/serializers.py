import os
import logging

from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from django.core.validators import validate_email
from django.core.validators import validate_email, FileExtensionValidator
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.exceptions import ValidationError, APIException, AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .services import send_verification_email

User = get_user_model()
logger = logging.getLogger(__name__)

class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        if not self.user.email_is_verified:
            raise serializers.ValidationError("Email is not verified.")
        
        data['user'] = self.user
        return data

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(validators=[validate_email])
    password = serializers.CharField(write_only=True, validators=[validate_password])
    new_email = serializers.EmailField(required=False, validators=[validate_email])
    new_password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    avatar_upload = serializers.ImageField(required=False, validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])])

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'avatar_oauth', 'avatar_upload','two_factor_method', 'new_email', 'new_password', 'date_joined']
        read_only_fields = ['id', 'avatar_oauth', 'date_joined']

    def create(self, validated_data):
        try:
            return User.objects.create_user(**validated_data)
        except ValueError as e:
            raise ValidationError({'detail': str(e)})
    
    def update(self, instance, validated_data):
        new_password = validated_data.pop('new_password', None)
        new_email = validated_data.pop('new_email', None)

        if new_password:
            instance.set_password(new_password)

        if new_email:
            try:
                instance.new_email = new_email
                send_verification_email(instance)
            except Exception as e:
                logger.error(f"Verification email failed: {str(e)}")
                raise APIException("Failed to send verification email. User was not updated.")

        return super().update(instance, validated_data)

    def validate_new_email(self, value):
        if User.objects.filter(email=value).exists() or User.objects.filter(new_email=value).exists():
            raise serializers.ValidationError("This email is already registered to another account.")
        return value

    def validate_avatar_upload(self, value):
        if value.size > 5 * 1024 * 1024:
            raise ValidationError("File too large. Size should not exceed 5 MB.")
        return value
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.avatar_upload:
            representation['avatar_upload'] = os.path.relpath(
                instance.avatar_upload.path, 
                settings.MEDIA_ROOT
            )
        return representation