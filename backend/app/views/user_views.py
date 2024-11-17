
from rest_framework.generics import ListAPIView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()

class UserListView(ListAPIView):
	queryset = User.objects.filter(email_is_verified=True)
	serializer_class = UserSerializer