from django.urls import path
from app.views.auth_views import LoginView, RegisterView, UserView, VerifyEmailView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('login', LoginView.as_view(), name='login'),
    path('register', RegisterView.as_view(), name='register'),
    path('user', UserView.as_view(), name='user'),
    path('verify-email/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
]
