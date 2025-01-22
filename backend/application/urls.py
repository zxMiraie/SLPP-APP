from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    PetitionViewSet,
    SignatureViewSet,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'petitions', PetitionViewSet, basename='petitions')
router.register(r'signatures', SignatureViewSet, basename='signatures')

urlpatterns = [
    path('', include(router.urls)),
]