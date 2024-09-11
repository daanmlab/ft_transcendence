from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.exceptions import ValidationError, APIException, AuthenticationFailed
from .services import send_verification_email

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
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'avatar', 'two_factor_method']
        read_only_fields = ['id', 'avatar']

    def update(self, instance, validated_data):
        email = validated_data.get('email')
        email_changed = email and email != instance.email

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if email_changed:
            instance.email_is_verified = False
            try:
                send_verification_email(instance)
            except Exception as e:
                instance.email = instance.__class__.objects.get(pk=instance.pk).email
                instance.email_is_verified = True
                logger.error("Failed to send verification email: %s", str(e))
                raise APIException("Failed to send verification email. Email not updated.")

        instance.save()
        return instance