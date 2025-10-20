from .models import Supplier, Material, Order, OrderMaterial, _
from rest_framework.serializers import (
    ReadOnlyField,
    SerializerMethodField,
    StringRelatedField,
    ModelSerializer,
    IntegerField,
)


# TODO: Create inventory serializers


class MaterialSerializer(ModelSerializer):
    class Meta:
        model = Material
        fields = "__all__"
        extra_kwargs = {"updated_at": {"read_only": True}}


class SupplierSerializer(ModelSerializer):
    order_count = IntegerField(source="orders.count", read_only=True)

    class Meta:
        model = Supplier
        fields = "__all__"


class OrderSerializer(ModelSerializer):
    order_materials = SerializerMethodField()
    supplier_name = StringRelatedField(source="supplier", read_only=True)
    created_by_name = StringRelatedField(source="created_by.name", read_only=True)

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ["order_date", "updated_at", "total", "created_by"]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)

    def get_order_materials(self, obj):
        return (
            obj.order_materials.all()
            .select_related("material")
            .values("material__name", "quantity", "unit_price", "total_price")
        )


class OrderMaterialSerializer(ModelSerializer):
    material_name = ReadOnlyField(source="material.name")

    class Meta:
        model = OrderMaterial
        fields = "__all__"
        read_only_fields = ["order", "total_price"]

    def create(self, validated_data):
        return super().create(validated_data)
