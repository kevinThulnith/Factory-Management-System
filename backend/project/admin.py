from django.contrib import admin
from .models import Project, Task


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "project_manager",
        "project_status",
        "start_date",
        "end_date",
    ]
    list_filter = ["project_status", "start_date"]
    search_fields = ["name", "project_manager__name"]
    date_hierarchy = "start_date"


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "project",
        "assigned_to",
        "status",
        "start_date",
        "end_date",
    ]
    list_filter = ["status", "start_date", "project"]
    search_fields = ["name", "project__name", "assigned_to__name"]
    date_hierarchy = "start_date"
