from .permissions import BasePermissions, OrderPermission, MaterialConsumptionPermission
from .models import Material, Supplier, Order, MaterialConsumption, OrderMaterial
from django.db.models.signals import post_save, post_delete
from backend.signals import create_model_change_signal
from core.cache_utils import invalidate_resource
from django.dispatch import receiver

from .serializers import (
    MaterialConsumptionSerializer,
    MaterialSerializer,
    SupplierSerializer,
    OrderSerializer,
)

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

material_consumption_signal = create_model_change_signal(
    MaterialConsumption,
    MaterialConsumptionSerializer,
    "material_consumptions",
    "send_update",
    permission_class=MaterialConsumptionPermission,
)


@receiver([post_save, post_delete], sender=MaterialConsumption)
def invalidate_consumption_related_caches(sender, instance, **kwargs):
    "Invalidate related caches when material consumption changes"
    invalidate_resource("material_consumption")
    invalidate_resource("material")
    invalidate_resource("task")
    invalidate_resource("production_schedule")


@receiver([post_save, post_delete], sender=OrderMaterial)
def invalidate_order_material_related_caches(sender, instance, **kwargs):
    "Invalidate related caches when order material changes"
    invalidate_resource("order_material")
    invalidate_resource("order")


@receiver(post_save, sender=Order)
def invalidate_order_related_caches(sender, instance, **kwargs):
    "Invalidate related caches when order changes"
    invalidate_resource("order")
    # If order is RECEIVED, materials are updated
    if instance.status == "RECEIVED":
        invalidate_resource("material")
