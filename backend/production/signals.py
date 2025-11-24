from .models import ProductionLine, ManufacturingProcess, ProductionSchedule
from backend.signals import create_model_change_signal
from .serializers import (
    ManufacturingProcessSerializer,
    ProductionScheduleSerializer,
    ProductionLineSerializer,
)

production_line_signal = create_model_change_signal(
    ProductionLine, ProductionLineSerializer, "production_lines", "send_update"
)

manufacturing_process_signal = create_model_change_signal(
    ManufacturingProcess,
    ManufacturingProcessSerializer,
    "manufacturing_processes",
    "send_update",
)

production_schedule_signal = create_model_change_signal(
    ProductionSchedule,
    ProductionScheduleSerializer,
    "production_schedules",
    "send_update",
)
