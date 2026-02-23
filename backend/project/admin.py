from django.contrib import admin
from .models import Project, Task, TaskMaterialConsumption


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["name", "project_manager", "project_status", "start_date", "end_date"]
    list_filter = ["project_status", "start_date"]
    search_fields = ["name", "project_manager__name"]
    date_hierarchy = "start_date"


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["name", "project", "assigned_to", "status", "start_date", "end_date"]
    list_filter = ["status", "start_date", "project"]
    search_fields = ["name", "project__name", "assigned_to__name"]
    date_hierarchy = "start_date"


@admin.register(TaskMaterialConsumption)
class TaskMaterialConsumptionAdmin(admin.ModelAdmin):
    list_display = [
        "task",
        "material",
        "quantity",
        "consumed_at",
        "consumed_by",
    ]
    list_filter = ["consumed_at", "material"]
    search_fields = [
        "task__name",
        "material__name",
        "consumed_by__name",
    ]
    date_hierarchy = "consumed_at"
    readonly_fields = ["consumed_at", "updated_at"]
    raw_id_fields = ["task", "material", "consumed_by"]
