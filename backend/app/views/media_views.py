from django.conf import settings
from django.http import FileResponse, Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import os

class ProtectedMediaView(APIView):
    def get(self, request, path=None):
        file_path = os.path.join(settings.MEDIA_ROOT, path)
        if not os.path.exists(file_path):
            raise Http404("File not found")
        try:
            file = open(file_path, 'rb')
            response = FileResponse(file)
            return response
        except Exception as e:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)