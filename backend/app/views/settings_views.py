import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import UserSettingsSerializer

logger = logging.getLogger(__name__)

class UserSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = UserSettingsSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            user = serializer.save()
            logger.info(f"User {user.username} updated their settings.")
            return Response({"message": "Settings updated successfully."}, status=status.HTTP_200_OK)
        else:
            errors = serializer.errors
            logger.error(f"Error updating settings for user {request.user.username}: {errors}")
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
