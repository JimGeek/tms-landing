from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, CreateOrderView, VerifyOrderView
from .feed import google_merchant_feed

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)

urlpatterns = [
    path('feed/', google_merchant_feed, name='product_feed'),
    path('orders/create/', CreateOrderView.as_view(), name='create_order'),
    path('orders/verify/', VerifyOrderView.as_view(), name='verify_order'),
    path('', include(router.urls)),
]
