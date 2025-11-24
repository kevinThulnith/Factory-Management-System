from .serializers import DepartmentSerializer, WorkshopSerializer, MachineSerializer
from backend.signals import create_model_change_signal
from .models import Department, Workshop, Machine

department_signal = create_model_change_signal(
    Department, DepartmentSerializer, "departments", "send_update"
)

workshop_signal = create_model_change_signal(
    Workshop, WorkshopSerializer, "workshops", "send_update"
)

machine_signal = create_model_change_signal(
    Machine, MachineSerializer, "machines", "send_update"
)
