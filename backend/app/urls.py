from django.urls import path
from app.views.auth_views import (
    LoginView,
    RegisterView,
    UserView,
    VerifyEmailView,
    VerifyOTPView,
)

from app.views.oauth_views import (
    OAuth42View,
    OAuth42CallbackView,
)

urlpatterns = [
    path('login', LoginView.as_view(), name='login'),
    path('register', RegisterView.as_view(), name='register'),
    path('user', UserView.as_view(), name='user'),
    path('verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('oauth/42/', OAuth42View.as_view(), name='oauth_42'),
    path('oauth/42/callback/', OAuth42CallbackView.as_view(), name='oauth_42_callback'),
    path('verify-otp', VerifyOTPView.as_view(), name='verify-otp'),
]