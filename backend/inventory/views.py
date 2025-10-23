from .permissions import BasePermissions, OrderPermission, OrderMaterialPermission
from .models import Material, Supplier, Order, OrderMaterial
from django.shortcuts import get_object_or_404
from core.views import ModelViewSet
from .serializers import (
    OrderMaterialSerializer,
    MaterialSerializer,
    SupplierSerializer,
    OrderSerializer,
)

# TODO: create inventory model views


class MaterialViewSet(ModelViewSet):
    """
    Material API
    - Admins: Full CRUD access
    - Purchasing | Supervisors: Read-only access
    """

    serializer_class = MaterialSerializer
    permission_classes = [BasePermissions]
    queryset = Material.objects.all()


class SupplierViewSet(ModelViewSet):
    """
    Supplier API
    - Admins: Full CRUD access
    - Purchasing | Supervisors: Read-only access
    """

    serializer_class = SupplierSerializer
    permission_classes = [BasePermissions]
    queryset = Supplier.objects.all()


class OrderViewSet(ModelViewSet):
    """
    Order API :
    - Admins: Full CRUD access
    - Supervisors: Only create, update, partial update their own orders
    - Purchasing: Can view, update order status
    """

    serializer_class = OrderSerializer
    permission_classes = [OrderPermission]

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return (
                Order.objects.all()
                .select_related("supplier", "created_by")
                .prefetch_related("order_materials", "order_materials__material")
            )

        if user.role == "SUPERVISOR":
            return (
                Order.objects.filter(created_by=user)
                .select_related("supplier", "created_by")
                .prefetch_related("order_materials", "order_materials__material")
            )

        if user.role == "PURCHASING":
            return (
                Order.objects.all()
                .select_related("supplier", "created_by")
                .prefetch_related("order_materials", "order_materials__material")
            )

        return Order.objects.none()


class OrderMaterialViewSet(ModelViewSet):
    """
    OrderMaterial API (Nested under Order):
    - Must specify order_id to access materials
    - Admins: Full CRUD access
    - Supervisors: Only Can manage materials for their orders, cannot delete
    - Purchasing: Read-only access
    """

    serializer_class = OrderMaterialSerializer
    permission_classes = [OrderMaterialPermission]

    def get_queryset(self):
        # !Get order materials for the specified order
        order_id = self.kwargs.get("order_pk")
        user = self.request.user

        # !Get the base OrderMaterial queryset for this order
        base_queryset = OrderMaterial.objects.filter(order_id=order_id)

        if user.role in ["ADMIN", "PURCHASING"]:
            return base_queryset
        elif user.role == "SUPERVISOR":
            return base_queryset.filter(order__created_by=user)

        return OrderMaterial.objects.none()

    def perform_create(self, serializer):
        order_id = self.kwargs.get("order_pk")
        order = get_object_or_404(Order, id=order_id)
        serializer.save(order=order)
        
    def perform_update(self, serializer):
        order_id = self.kwargs.get("order_pk")
        order = get_object_or_404(Order, id=order_id)
        serializer.save(order=order)
        
    def perform_destroy(self, instance):
        # Prevent deletion if user is SUPERVISOR
        user = self.request.user
        if user.role == "SUPERVISOR":
            raise PermissionError("Supervisors cannot delete order materials.")
        instance.delete()
