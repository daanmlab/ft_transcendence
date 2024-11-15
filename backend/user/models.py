from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.base_user import BaseUserManager
from django.core.validators import RegexValidator, MinLengthValidator

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        if not username:
            raise ValueError(_('The Username field must be set'))

        email = self.normalize_email(email)
        if self.model.objects.filter(email=email).exists():
            raise ValueError(_('A user with this email already exists.'))

        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, username, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, username, password, **extra_fields)

class CustomUser(AbstractUser):
    TWO_FACTOR_CHOICES = [
        ('none', 'None'),
        ('email', 'Email'),
        ('qr', 'QR Code')
    ]
    username = models.CharField(
        max_length=20,
        unique=True,
        validators=[
            MinLengthValidator(4, message='Username must be at least 4 characters long.'),
            RegexValidator(
                regex=r'^[\w.@+-]+$', 
                message=_('Enter a valid username.')
            )
        ]
    )
    email = models.EmailField(_('email address'), max_length=255, unique=True)
    email_is_verified = models.BooleanField(default=False)
    new_email = models.EmailField(_('pending email address'), max_length=255, blank=True, null=True)
    new_email_is_verified = models.BooleanField(default=False)
    avatar_oauth = models.URLField(blank=True, null=True)
    avatar_upload = models.ImageField(upload_to='avatars/', blank=True, null=True)
    oauth_provider = models.CharField(max_length=50, blank=True, null=True)
    oauth_uid = models.CharField(max_length=255, blank=True, null=True)
    two_factor_method = models.CharField(max_length=5, choices=TWO_FACTOR_CHOICES, default='none')
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        if self.email_is_verified:
            self.email = self.email.lower()
        super().save(*args, **kwargs)