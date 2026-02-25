from django.contrib import admin
from .models import Material, Supplier, Order, OrderMaterial, MaterialConsumption


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ["name", "quantity", "unit_of_measurement", "reorder_level"]
    search_fields = ["name"]
    list_filter = ["unit_of_measurement"]


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "phone"]
    search_fields = ["name", "email"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "supplier", "status", "total", "order_date"]
    list_filter = ["status"]
    search_fields = ["supplier__name"]
    date_hierarchy = "order_date"


@admin.register(OrderMaterial)
class OrderMaterialAdmin(admin.ModelAdmin):
    list_display = ["order", "material", "quantity", "unit_price", "total_price"]
    search_fields = ["material__name"]


@admin.register(MaterialConsumption)
class MaterialConsumptionAdmin(admin.ModelAdmin):
    list_display = [
        "material",
        "consumption_type",
        "quantity",
        "consumed_at",
        "consumed_by",
    ]
    list_filter = ["consumption_type", "consumed_at", "material"]
    search_fields = [
        "material__name",
        "task__name",
        "production_schedule__product__name",
        "consumed_by__name",
    ]
    date_hierarchy = "consumed_at"
    readonly_fields = ["consumed_at", "updated_at", "consumption_type"]
    raw_id_fields = ["material", "task", "production_schedule", "consumed_by"]
