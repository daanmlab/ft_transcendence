from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

def get_or_create_user_from_oauth(user_info):
    user, created = User.objects.get_or_create(
        oauth_provider='42',
        oauth_uid=str(user_info['id']),
        defaults={
            'username': user_info['login'],
            'email': user_info['email'],
            'avatar': user_info['image']['versions']['medium'],
            'email_is_verified': True,
        }
    )
    
    if not created:
        user.avatar = user_info['image']['versions']['medium']
        user.save()
    
    return RefreshToken.for_user(user)