from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Category, Product, Order
from .serializers import CategorySerializer, ProductSerializer
import razorpay
from django.conf import settings

# Initialize Razorpay Client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class CreateOrderView(APIView):
    def post(self, request):
        product_ids = request.data.get('product_ids', [])
        
        # Security: Fetch prices from DB, don't trust frontend amount
        products = Product.objects.filter(id__in=product_ids)
        if not products:
             return Response({'error': 'No valid products found'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate Total (assuming quantity 1 for simplicity for now, typically you'd handle qty)
        # TODO: Handle quantity passed from frontend
        total_amount = sum([p.price for p in products]) 
        
        # Create RazorPay Order
        currency = 'INR'
        amount_in_paise = int(total_amount * 100) # Razorpay takes amount in paise

        try:
            razorpay_order = razorpay_client.order.create({
                'amount': amount_in_paise,
                'currency': currency,
                'payment_capture': '1' 
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Save Order to DB
        order = Order.objects.create(
            total_amount=total_amount,
            razorpay_order_id=razorpay_order['id'],
            status='Pending'
        )
        order.products.set(products)
        order.save()

        return Response({
            'order_id': order.id,
            'razorpay_order_id': razorpay_order['id'],
            'amount': total_amount,
            'currency': currency,
            'key_id': settings.RAZORPAY_KEY_ID
        })

class VerifyOrderView(APIView):
    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        try:
            # Verify Signature
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })

            # Update Order Status
            order = Order.objects.get(razorpay_order_id=razorpay_order_id)
            order.status = 'Paid'
            order.razorpay_payment_id = razorpay_payment_id
            order.save()

            return Response({'message': 'Payment Verified Successfully'})

        except razorpay.errors.SignatureVerificationError:
            return Response({'error': 'Signature Verification Failed'}, status=status.HTTP_400_BAD_REQUEST)
        except Order.DoesNotExist:
             return Response({'error': 'Order Not Found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
