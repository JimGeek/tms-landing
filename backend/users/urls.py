from django.urls import path
from .views import GoogleLogin, GenerateOTP, VerifyOTP

urlpatterns = [
    path('google/', GoogleLogin.as_view(), name='google_login'),
    path('mobile/generate/', GenerateOTP.as_view(), name='generate_otp'),
    path('mobile/verify/', VerifyOTP.as_view(), name='verify_otp'),
]
