from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings
from .serializers import (
    UserSerializer, PetitionSerializer, SignatureSerializer, MyTokenObtainPairSerializer
)
from .models import Petition, Signature
from django.contrib.auth import get_user_model

@api_view(['POST'])
def check_email(request):
    email = request.data.get("email", "").strip()
    if User.objects.filter(email=email).exists():
        return Response({"error": "Email is already in use."}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"message": "Email is valid."}, status=status.HTTP_200_OK)

@api_view(['POST'])
def check_bioid(request):
    bio_id = request.data.get("bio_id", "").strip()
    if bio_id not in settings.VALID_BIO_IDS:
        return Response({"error": "BioID is invalid."}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(bio_id=bio_id).exists():
        return Response({"error": "BioID is already in use."}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"message": "BioID is valid."}, status=status.HTTP_200_OK)


User = get_user_model()
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    def perform_create(self, serializer):
        serializer.save(role='petitioner')

class PetitionViewSet(viewsets.ModelViewSet):
    queryset = Petition.objects.all()
    serializer_class = PetitionSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return Petition.objects.annotate(
            signatures_count=Count('signatures', distinct=True),
            already_signed=Count('signatures', filter=Q(signatures__signer=user))
        )

    @action(detail=True, methods=["GET"], url_path="check_threshold")
    def check_threshold(self, request, pk=None):
        petition = self.get_object()
        if petition.signatures.count() >= settings.SIGNATURE_THRESHOLD:
            return Response({"meets_threshold": True}, status=status.HTTP_200_OK)
        return Response({"meets_threshold": False}, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=["POST"], url_path="respond_and_close")
    def respond_and_close(self, request, pk=None):
        petition = self.get_object()
        if request.user.role != 'committee':
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        response_text = request.data.get('response', '').strip()
        if not response_text:
            return Response({"detail": "Response text is required."}, status=status.HTTP_400_BAD_REQUEST)

        petition.response = response_text
        petition.status = 'closed'
        petition.save()
        return Response({"detail": "Petition closed with response."}, status=status.HTTP_200_OK)


class SignatureViewSet(viewsets.ModelViewSet):
    queryset = Signature.objects.all()
    serializer_class = SignatureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        petition_id = self.request.data.get('petition')
        if petition_id:
            petition = Petition.objects.get(id=petition_id)
            if petition.status == 'closed':
                raise ValueError("Cannot sign a closed petition.")
        serializer.save(signer=self.request.user)


class IsCommitteeMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'committee'
        )

class ThresholdView(APIView):
    permission_classes = [IsCommitteeMember]
    def get(self, request):
        return Response({"threshold": settings.SIGNATURE_THRESHOLD}, status=status.HTTP_200_OK)

    def post(self, request):
        if request.user.role != 'committee':
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        new_threshold = request.data.get('threshold')
        if not isinstance(new_threshold, int) or new_threshold <= 0:
            return Response({"detail": "Invalid threshold value. Must be a positive integer."}, status=status.HTTP_400_BAD_REQUEST)

        settings.SIGNATURE_THRESHOLD = new_threshold
        return Response({"detail": "Threshold updated successfully.", "threshold": new_threshold}, status=status.HTTP_200_OK)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class SLPPOpenData(APIView):
    def get(self, request):
        status_filter = request.query_params.get('status', None)

        petitions = Petition.objects.annotate(signatures_count=Count('signatures')).all()

        if status_filter:
            petitions = petitions.filter(status=status_filter)

        response_data = {
            "petitions": [
                {
                    "petition_id": petition.id,
                    "status": petition.status,
                    "petition_title": petition.title,
                    "petition_text": petition.content,
                    "petitioner": petition.creator.email,
                    "signatures": petition.signatures_count,
                    "response": petition.response or "No response provided yet.",
                }
                for petition in petitions
            ]
        }

        return Response(response_data, status=status.HTTP_200_OK)