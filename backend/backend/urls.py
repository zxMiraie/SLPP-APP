from django.contrib import admin
from django.urls import path, include
from application.views import MyTokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from application.views import ThresholdView, check_email, check_bioid, SLPPOpenData

urlpatterns = [
    path('admin/', admin.site.urls),
    #base url for application
    path('api/', include('application.urls')),
    ##jwt tokens
    path('api/auth/login', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    ##for committee threshold
    path("api/threshold/", ThresholdView.as_view(), name="update-threshold"),
    ##for ajax validation
    path('api/check-email/', check_email, name='check_email'),
    path('api/check-bioid/', check_bioid, name='check_bioid'),

    path('slpp/petitions', SLPPOpenData.as_view(), name='slpp-petitions'),
]