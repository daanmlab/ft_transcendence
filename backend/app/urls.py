from django.urls import path
from app.views.auth_views import LoginView, RegisterView, UserView

urlpatterns = [
    path('login', LoginView.as_view(), name='login'),
    path('register', RegisterView.as_view(), name='register'),
    path('user', UserView.as_view(), name='user'),
]