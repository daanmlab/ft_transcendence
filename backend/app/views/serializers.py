from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework.exceptions import ValidationError
User = get_user_model()

from .services import send_verification_email

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

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, max_length=128)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password']
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'two_factor_method']
        read_only_fields = ['id', 'avatar']

    def update(self, instance, validated_data):
        email_changed = 'email' in validated_data and validated_data['email'] != instance.email
        old_email = instance.email

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if email_changed:
            instance.email_is_verified = False
            try:
                send_verification_email(instance)
            except Exception:
                instance.email = old_email
                instance.email_is_verified = True
                raise serializers.ValidationError("Failed to send verification email. Email not updated.")

        instance.save()
        return instance
