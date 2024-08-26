from django.urls import path
from app.views.auth_views import (
    LoginView,
    RegisterView,
    UserView,
    VerifyEmailView,
)

from app.views.oauth_views import (
    OAuth42View,
    OAuth42CallbackView,
)

from rest_framework_simplejwt.views import (#TODO:implement refresh token 
    TokenRefreshView,
)

from app.views.two_factor_auth_views import (
    VerifyOTPView,
)

urlpatterns = [
    path('login', LoginView.as_view(), name='login'),
    path('register', RegisterView.as_view(), name='register'),
    path('user', UserView.as_view(), name='user'),
    path('verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('oauth/42/', OAuth42View.as_view(), name='oauth_42'),
    path('oauth/42/callback/', OAuth42CallbackView.as_view(), name='oauth_42_callback'),
    path('verify-otp', VerifyOTPView.as_view(), name='verify-otp'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]