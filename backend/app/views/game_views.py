from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from app.models import GameInvitation, PongGame
from .serializers import GameInvitationSerializer

User = get_user_model()

class CreateGameInvitationView(APIView):
    def post(self, request, user_id):
        receiver = get_object_or_404(User, id=user_id)
        sender = request.user

        if receiver == sender:
            return Response(
                {"message": "You cannot invite yourself."},
                status=status.HTTP_400_BAD_REQUEST
            )

        existing_invitation = GameInvitation.objects.filter(
            sender=sender, receiver=receiver, status="pending"
        ).first()

        if existing_invitation:
            return Response(
                {"message": "An invitation has already been sent."},
                status=status.HTTP_400_BAD_REQUEST
            )

        invitation = GameInvitation.objects.create(sender=sender, receiver=receiver)

        return Response(
            {"message": "Invitation sent successfully.", "invitation_id": invitation.id},
            status=status.HTTP_201_CREATED
        )


class AcceptGameInvitationView(APIView):
    def post(self, request, invitation_id):
        invitation = get_object_or_404(GameInvitation, id=invitation_id, status="pending")
        if invitation.receiver != request.user:
            return Response(
                {"message": "You are not authorized to accept this invitation."},
                status=status.HTTP_403_FORBIDDEN
            )

        invitation.status = "accepted"
        game = PongGame.objects.create(player1=invitation.sender, player2=invitation.receiver)
        invitation.game = game
        invitation.save()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"game_invitation_{invitation_id}",
            {
                "type": "game_accepted",
                "game_url": f"/game/{game.id}"
            }
        )

        return Response(
            {"message": "Invitation accepted.", "game_url": f"/game/{game.id}"},
            status=status.HTTP_200_OK
        )


class SentGameInvitationsListView(ListAPIView):
    serializer_class = GameInvitationSerializer

    def get_queryset(self):
        return GameInvitation.objects.filter(sender=self.request.user).select_related('receiver').order_by('-created_at')

class ReceivedGameInvitationsListView(ListAPIView):
    serializer_class = GameInvitationSerializer

    def get_queryset(self):
        return GameInvitation.objects.filter(receiver=self.request.user).select_related('sender').order_by('-created_at')
