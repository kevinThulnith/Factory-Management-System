from backend.signals import create_model_change_signal
from .permissions import ProductPermission
from .serializers import ProductSerializer
from .models import Product

# TODO: Create signals for product models

product_signal = create_model_change_signal(
    Product,
    ProductSerializer,
    "products",
    permission_class=ProductPermission,
)
