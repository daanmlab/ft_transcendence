from django.contrib.auth import get_user_model
from rest_framework_jwt.settings import api_settings
from django.conf import settings

import logging

logger = logging.getLogger(__name__)
User = get_user_model()
jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

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

    payload = jwt_payload_handler(user)
    token = jwt_encode_handler(payload)
    
    return token