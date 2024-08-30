import logging
import requests
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .services import get_or_create_user_from_oauth

logger = logging.getLogger(__name__)

class OAuth42View(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        auth_url = f"https://api.intra.42.fr/oauth/authorize?client_id={settings.OAUTH_42_CLIENT_ID}&redirect_uri={settings.OAUTH_42_REDIRECT_URI}&response_type=code"
        return redirect(auth_url)

class OAuth42CallbackView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        try:
            code = request.GET.get('code')
            if not code:
                raise ValueError("OAuth callback without code.")

            access_token = self.exchange_code_for_token(code)
            user_info = self.fetch_user_info(access_token)
            refresh = get_or_create_user_from_oauth(user_info)

            response = redirect(f"{settings.FRONTEND_URL}/oauth-result")
            response.set_cookie('refresh_token', str(refresh), httponly=False, samesite='Lax', secure=True, path='/')
            response.set_cookie('access_token', str(refresh.access_token), httponly=False, samesite='Lax', secure=True, path='/')
            print("refresh:", str(refresh))
            print("access:", str(refresh.access_token))
            return response

        except Exception as e:
            logger.error(f"OAuth error: {str(e)}")
            return redirect(f"{settings.FRONTEND_URL}/oauth-result?error=true")

    def exchange_code_for_token(self, code):
        response = requests.post("https://api.intra.42.fr/oauth/token", data={
            'grant_type': 'authorization_code',
            'client_id': settings.OAUTH_42_CLIENT_ID,
            'client_secret': settings.OAUTH_42_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.OAUTH_42_REDIRECT_URI,
        })
        response.raise_for_status()
        return response.json()['access_token']

    def fetch_user_info(self, access_token):
        response = requests.get("https://api.intra.42.fr/v2/me", headers={
            'Authorization': f'Bearer {access_token}'
        })
        response.raise_for_status()
        return response.json()
