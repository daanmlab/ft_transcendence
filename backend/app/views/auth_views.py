import logging

from django.contrib.auth import get_user_model
from django.core.signing import Signer, BadSignature

from rest_framework.exceptions import APIException
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import GenericAPIView, RetrieveUpdateDestroyAPIView, CreateAPIView
from rest_framework import status

from .serializers import LoginSerializer, UserSerializer
from .services import send_verification_email, generate_jwt_response

from app.models import User as UserModel
from app.mixins.two_factor_auth_mixin import TwoFactorAuthenticationMixin

User = get_user_model()
signer = Signer()
logger = logging.getLogger(__name__)

class LoginView(TwoFactorAuthenticationMixin, GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        if user.two_factor_method != 'none':
            return self.handle_two_factor_authentication(request, user)
        return generate_jwt_response(user.id, serializer.validated_data['refresh'], serializer.validated_data['access'])

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            user_id = signer.unsign(token)
            user: UserModel = User.objects.get(pk=user_id)
            
            if user.new_email:
                user.email = user.new_email
                user.email_is_verified = True
                user.new_email = None
                user.new_email_is_verified = False
                user.save()
                return Response({'message': 'Email verified and updated successfully.'}, status=status.HTTP_200_OK)
            elif not user.email_is_verified:
                user.email_is_verified = True
                user.save()
                return Response({'message': 'Email verified successfully.'}, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Email already verified.'}, status=status.HTTP_200_OK)
        except (BadSignature, User.DoesNotExist):
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_401_UNAUTHORIZED)


class UserView(CreateAPIView, RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer

<<<<<<< Updated upstream
    def get_object(self):
=======
    def get_object(self): # permission check
        user_id = self.kwargs.get('pk')
        if user_id:
            obj = get_object_or_404(User, pk=user_id)
            self.check_object_permissions(self.request, obj)
            return obj
>>>>>>> Stashed changes
        return self.request.user

    def perform_create(self, serializer): # send verification email
        user = serializer.save()
        logger.info(f"User with ID {user.id} registered successfully")
        try:
            send_verification_email(user)
        except Exception as e:
            user.delete()
            logger.error(f"Verification email failed: {str(e)}")
            raise APIException(f"Failed to send verification email. User was not created.")

    def get_permissions(self): # permission settings
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated()]