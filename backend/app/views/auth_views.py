import logging

from django.contrib.auth import get_user_model
from django.core.signing import Signer, BadSignature
from django.conf import settings

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.generics import GenericAPIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer
from .services import send_verification_email

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
        if serializer.is_valid():
            try:
                user = serializer.validated_data['user']
                if user.two_factor_method != 'none':
                    return self.handle_two_factor_authentication(request, user)
                
                refresh = RefreshToken.for_user(user)
                logger.info(f"User {user.username} logged in successfully")
                return Response({
                    "success": True,
                    "refresh": str(refresh),
                    "access": str(refresh.access_token)
                }, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"An unexpected error occurred during login: {e}")
                return Response({"error": "An unexpected error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            logger.error(f"Validation error: {serializer.errors}")
            return Response({"error": serializer.errors}, status=status.HTTP_401_UNAUTHORIZED)

class RegisterView(APIView):
    permission_classes = (AllowAny,)
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user: UserModel = serializer.save()
            logger.info(f"User with ID {user.id} registered successfully")
            try:
                send_verification_email(user)
                return Response({'message': 'User registered successfully'}, status=201)
            except Exception as e:
                user.delete()
                error_message = {'non_field_errors': [str(e)]}
                return Response(error_message, status=500)
        logger.error(f"Error during registration: {serializer.errors}")
        return Response(serializer.errors, status=400)


class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, token):
        try:
            user_id = signer.unsign(token)
            user: UserModel = User.objects.get(pk=user_id)
            user.email_is_verified = True
            user.save()
            return Response({'message': 'Email verified successfully.'}, status=status.HTTP_200_OK)
        except (BadSignature, User.DoesNotExist):
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_401_UNAUTHORIZED)

class UserView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        logger.info(f"User {request.user.id} retrieved their profile")
        return Response({'user': serializer.data})

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            logger.info(f"User {request.user.id} updated their profile")
            return Response(serializer.data)
        else:
            logger.error(f"Error updating profile for user {request.user.id}: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        user = request.user
        user.delete()
        logger.info(f"User {user.id} deleted their account")
        return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)