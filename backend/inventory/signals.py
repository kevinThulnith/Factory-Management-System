from .serializers import MaterialSerializer, SupplierSerializer, OrderSerializer
from backend.signals import create_model_change_signal
from .models import Material, Supplier, Order

material_signal = create_model_change_signal(
    Material, MaterialSerializer, "materials", "send_update"
)

supplier_signal = create_model_change_signal(
    Supplier, SupplierSerializer, "suppliers", "send_update"
)

order_signal = create_model_change_signal(
    Order, OrderSerializer, "orders", "send_update"
)
