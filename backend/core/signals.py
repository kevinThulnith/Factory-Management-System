from .permissions import DepartmentPermissions, WorkshopPermissions, MachinePermissions
from .serializers import DepartmentSerializer, WorkshopSerializer, MachineSerializer
from .cache_utils import invalidate_resource, invalidate_user_perms
from django.db.models.signals import post_delete, post_save
from backend.signals import create_model_change_signal
from .models import Department, Workshop, Machine
from django.conf import settings
from django.apps import apps

# TODO: Create signals fore core models

department_signal = create_model_change_signal(
    Department,
    DepartmentSerializer,
    "departments",
    "send_update",
    permission_class=DepartmentPermissions,
)

workshop_signal = create_model_change_signal(
    Workshop,
    WorkshopSerializer,
    "workshops",
    "send_update",
    permission_class=WorkshopPermissions,
)

machine_signal = create_model_change_signal(
    Machine,
    MachineSerializer,
    "machines",
    "send_update",
    permission_class=MachinePermissions,
)


RESOURCE_MODEL_MAP = {
    "department": "core.Department",
    "workshop": "core.Workshop",
    "machine": "core.Machine",
    "machine_operator_assignment": "core.MachineOperatorAssignment",
    "material": "inventory.Material",
    "supplier": "inventory.Supplier",
    "order": "inventory.Order",
    "order_material": "inventory.OrderMaterial",
    "material_consumption": "inventory.MaterialConsumption",
    "labor_allocation": "labor.LaborAllocation",
    "skill_matrix": "labor.SkillMatrix",
    "product": "product.Product",
    "product_process": "product.ProductProcess",
    "project": "project.Project",
    "task": "project.Task",
    "production_line": "production.ProductionLine",
    "manufacturing_process": "production.ManufacturingProcess",
    "production_schedule": "production.ProductionSchedule",
}


def _make_cache_invalidator(resource):
    def handler(sender, instance, **kwargs):
        invalidate_resource(resource, instance.pk)

    return handler


def _invalidate_user_cache(sender, instance, **kwargs):
    invalidate_user_perms(instance.pk)


def register_cache_invalidation():
    for resource, model_label in RESOURCE_MODEL_MAP.items():
        model = apps.get_model(model_label)

        post_save.connect(
            _make_cache_invalidator(resource),
            sender=model,
            dispatch_uid=f"cache_invalidate_{resource}_save",
            weak=False,
        )
        post_delete.connect(
            _make_cache_invalidator(resource),
            sender=model,
            dispatch_uid=f"cache_invalidate_{resource}_delete",
            weak=False,
        )

    user_model = apps.get_model(settings.AUTH_USER_MODEL)
    post_save.connect(
        _invalidate_user_cache,
        sender=user_model,
        dispatch_uid="cache_invalidate_user_perms",
        weak=False,
    )


register_cache_invalidation()
