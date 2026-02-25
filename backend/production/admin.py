from django.contrib import admin
from .models import (
    ProductionLine,
    ProductionSchedule,
    ManufacturingProcess,
)


@admin.register(ProductionLine)
class ProductionLineAdmin(admin.ModelAdmin):
    list_display = ["name", "workshop", "operational_status", "production_capacity"]
    list_filter = ["operational_status", "workshop"]
    search_fields = ["name", "workshop__name"]
    filter_horizontal = ["machines"]


@admin.register(ManufacturingProcess)
class ManufacturingProcessAdmin(admin.ModelAdmin):
    list_display = ["name", "standard_time", "created_at"]
    search_fields = ["name"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(ProductionSchedule)
class ProductionScheduleAdmin(admin.ModelAdmin):
    list_display = [
        "production_line",
        "product",
        "quantity",
        "status",
        "start_time",
        "end_time",
    ]
    list_filter = ["status", "start_time", "production_line"]
    search_fields = ["product__name", "production_line__name"]
    date_hierarchy = "start_time"
