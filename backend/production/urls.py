from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import (
    ManufacturingProcessViewSet,
    ProductionScheduleViewSet,
    ProductionLineViewSet,
    ProductionMaterialConsumptionViewSet,
)

router = DefaultRouter()
router.register(r"production-line", ProductionLineViewSet, basename="production-line")
router.register(
    r"production-schedule", ProductionScheduleViewSet, basename="production-schedule"
)
router.register(
    r"manufacturing-process",
    ManufacturingProcessViewSet,
    basename="manufacturing-process",
)
router.register(
    r"production-material-consumption",
    ProductionMaterialConsumptionViewSet,
    basename="production-material-consumption",
)

urlpatterns = [path("", include(router.urls))]
