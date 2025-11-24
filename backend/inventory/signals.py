from .serializers import MaterialSerializer, SupplierSerializer, OrderSerializer
from .permissions import BasePermissions, OrderPermission
from backend.signals import create_model_change_signal
from .models import Material, Supplier, Order

# TODO: Create signals for inventory models

material_signal = create_model_change_signal(
    Material,
    MaterialSerializer,
    "materials",
    "send_update",
    permission_class=BasePermissions,
)

supplier_signal = create_model_change_signal(
    Supplier,
    SupplierSerializer,
    "suppliers",
    "send_update",
    permission_class=BasePermissions,
)

order_signal = create_model_change_signal(
    Order,
    OrderSerializer,
    "orders",
    "send_update",
    permission_class=OrderPermission,
)
