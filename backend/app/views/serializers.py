from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from django.core.validators import validate_email
from django.core.validators import validate_email, FileExtensionValidator
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
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

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(validators=[validate_email])
    new_password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    avatar_upload = serializers.ImageField(required=False, validators=[
        FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])
    ])

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'avatar_upload', 'two_factor_method', 'email_pending', 'new_password']
        read_only_fields = ['id', 'avatar', 'email_pending']

    def update(self, instance, validated_data):
        new_password = validated_data.pop('new_password', None)
        if new_password:
            instance.set_password(new_password)
        return super().update(instance, validated_data)
    
    def validate_avatar_upload(self, value):
        if value.size > 5 * 1024 * 1024:
            raise ValidationError("File too large. Size should not exceed 5 MB.")
        return value
    # return the avatar_upload path as a relative
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.avatar_upload:
            representation['avatar_upload'] = os.path.relpath(instance.avatar_upload.path, settings.MEDIA_ROOT)
        return representation