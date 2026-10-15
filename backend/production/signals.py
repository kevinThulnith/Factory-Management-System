from .models import ProductionLine, ManufacturingProcess, ProductionSchedule
from backend.signals import create_model_change_signal

from .serializers import (
    ManufacturingProcessSerializer,
    ProductionScheduleSerializer,
    ProductionLineSerializer,
)
from .permissions import (
    ManufacturingProcessPermission,
    ProductionSchedulePermission,
    ProductionLinePermission,
)

# TODO: Create signals for production models

production_line_signal = create_model_change_signal(
    ProductionLine,
    ProductionLineSerializer,
    "production_lines",
    permission_class=ProductionLinePermission,
)

manufacturing_process_signal = create_model_change_signal(
    ManufacturingProcess,
    ManufacturingProcessSerializer,
    "manufacturing_processes",
    permission_class=ManufacturingProcessPermission,
)

production_schedule_signal = create_model_change_signal(
    ProductionSchedule,
    ProductionScheduleSerializer,
    "production_schedules",
    permission_class=ProductionSchedulePermission,
)
