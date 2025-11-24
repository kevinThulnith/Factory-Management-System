from .serializers import ProjectSerializer, TaskSerializer
from backend.signals import create_model_change_signal
from .models import Project, Task


task_signal = create_model_change_signal(Task, TaskSerializer, "tasks", "send_update")

project_signal = create_model_change_signal(
    Project, ProjectSerializer, "projects", "send_update"
)
