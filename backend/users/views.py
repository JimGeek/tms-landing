from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
import random

# Google Login View
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    permission_classes = [AllowAny]
    # callback_url = "http://localhost:5173" # Update with your frontend URL

# Mock OTP Store (In-memory for dev, use Redis/DB for prod)
otp_storage = {}

class GenerateOTP(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response({'error': 'Phone number required'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate 4 digit OTP
        otp = str(random.randint(1000, 9999))
        otp_storage[phone_number] = otp
        
        # In production, integrate SMS API here
        print(f"DEBUG: OTP for {phone_number} is {otp}") 

        return Response({'message': 'OTP sent successfully'})

class VerifyOTP(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_number = request.data.get('phone_number')
        otp = request.data.get('otp')

        if not phone_number or not otp:
            return Response({'error': 'Phone number and OTP required'}, status=status.HTTP_400_BAD_REQUEST)

        stored_otp = otp_storage.get(phone_number)
        
        if stored_otp == otp:
            # OTP Verified - Return Mock Token (Need real JWT logic here later)
            # For now, just success message
            return Response({'message': 'Login Successful', 'token': 'mock-jwt-token-xyz'})
        
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
