from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import (
    CheckConstraint,
    ManyToManyField,
    DurationField,
    DateTimeField,
    DecimalField,
    TextChoices,
    ForeignKey,
    JSONField,
    CharField,
    TextField,
    SET_NULL,
    CASCADE,
    Model,
    Index,
    Q,
)

#  TODO: Create production models


class ProductionLine(Model):
    """
    Production Line Model

    - Many-to-One with WorkshopArea (a production line belongs to one workshop) ☑️
    - One-to-Many with ProductionSchedules (a production line has many schedules) ☑️
    - Many-to-Many with Employees through LaborAllocation (a production line can have many employees) ☑️
    """

    class OperationalStatus(TextChoices):
        ACTIVE = "ACTIVE", _("Active")
        INACTIVE = "INACTIVE", _("Inactive")
        MAINTENANCE = "MAINTENANCE", _("Under Maintenance")

    name = CharField(max_length=100, unique=True)
    description = TextField(blank=True, null=True)
    production_capacity = DecimalField(max_digits=10, decimal_places=2, default=0.00)
    operational_status = CharField(
        max_length=20,
        default=OperationalStatus.ACTIVE,
        choices=OperationalStatus.choices,
        verbose_name=_("operational status"),
    )
    machines = ManyToManyField(
        "core.Machine",
        blank=True,
        verbose_name=_("machines"),
        related_name="production_lines",
    )
    workshop = ForeignKey(
        "core.Workshop",
        on_delete=CASCADE,
        verbose_name=_("workshop"),
        related_name="production_lines",
    )

    class Meta:
        ordering = ["name"]
        indexes = [
            Index(fields=["name"]),
            Index(fields=["workshop"]),
            Index(fields=["operational_status"]),
        ]
        verbose_name = _("Production Line")
        verbose_name_plural = _("Production Lines")

    def __str__(self):
        return f"{self.name} ({self.workshop.name})"

    def clean(self):
        if self.production_capacity < 0:
            raise ValidationError(_("Production capacity must be non-negative."))

        if self.pk:  # Only check if the instance exists (has been saved)
            self.validate_machines_workshop()

    def validate_machines_workshop(self):
        # !Validate that all assigned machines belong to the same workshop as the production line
        if not self.pk:
            return  # Skip validation for unsaved instances

        invalid_machines = []
        for machine in self.machines.all():
            if machine.workshop != self.workshop:
                invalid_machines.append(machine.name)

        if invalid_machines:
            raise ValidationError(
                _(
                    f"The following machines do not belong to workshop '{self.workshop.name}': {', '.join(invalid_machines)}"
                )
            )

    def add_machines(self, machines):
        # !Add multiple machines to the production line with validation
        invalid_machines = []
        for machine in machines:
            if machine.workshop != self.workshop:
                invalid_machines.append(
                    f"{machine.name} (belongs to {machine.workshop.name})"
                )

        if invalid_machines:
            raise ValidationError(
                _(
                    f"The following machines do not belong to workshop '{self.workshop.name}': {', '.join(invalid_machines)}"
                )
            )

        self.machines.add(*machines)

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def active_machines_count(self):
        # !Return count of active machines in this production line
        return self.machines.filter(status="ACTIVE").count()

    @property
    def is_operational(self):
        # !Check if production line is operational (active and has machines)
        return (
            self.operational_status == self.OperationalStatus.ACTIVE
            and self.machines.exists()
        )


class ManufacturingProcess(Model):
    """
    Manufacturing Process Model

    - Many-to-Many with Products through ProductProcess (a process can be used for many products) ☑️
    """

    name = CharField(max_length=100, unique=True, verbose_name=_("name"))
    description = TextField()
    standard_time = DurationField()
    quality_parameters = JSONField(default=dict)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [Index(fields=["name"])]

    def __str__(self):
        return self.name

    def clean(self):
        if not isinstance(self.quality_parameters, dict):
            raise ValidationError(_("Quality parameters must be a valid JSON object."))

        if self.standard_time.total_seconds() < 0:
            raise ValidationError(_("Standard time must be a non-negative duration."))

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class ProductionSchedule(Model):
    """
    Production Schedule Model

    - Many-to-One with ProductionLine (a schedule belongs to one production line) ☑️
    - Many-to-One with Product (a schedule is for one product) ☑️
    - Many-to-One with Employee (a schedule is created by one employee) ☑️
    """

    class ScheduleStatus(TextChoices):
        SCHEDULED = "SCHEDULED", _("Scheduled")
        IN_PROGRESS = "IN_PROGRESS", _("In Progress")
        COMPLETED = "COMPLETED", _("Completed")
        CANCELLED = "CANCELLED", _("Cancelled")

    production_line = ForeignKey(
        ProductionLine,
        on_delete=CASCADE,
        related_name="production_schedules",
        verbose_name=_("production line"),
    )
    product = ForeignKey(
        "product.Product",
        on_delete=CASCADE,
        related_name="production_schedules",
        blank=True,
        null=True,
        verbose_name=_("product"),
    )
    quantity = DecimalField(
        _("quantity"), max_digits=10, decimal_places=2, default=0.00
    )
    start_time = DateTimeField(_("start time"), auto_now_add=True)
    end_time = DateTimeField(_("end time"), null=True, blank=True)
    status = CharField(
        max_length=20,
        verbose_name=_("status"),
        choices=ScheduleStatus.choices,
        default=ScheduleStatus.SCHEDULED,
    )
    updated_at = DateTimeField(_("updated at"), auto_now=True)
    created_by = ForeignKey(
        "main.User",
        on_delete=CASCADE,
        verbose_name=_("created by"),
        related_name="created_schedules",
    )

    class Meta:
        ordering = ["start_time"]
        indexes = [
            Index(fields=["product", "status"]),
            Index(fields=["production_line", "status"]),
        ]

    def __str__(self):
        return f"{self.product.name} - {self.quantity} units on {self.production_line.name}"

    def clean(self):
        if self.end_time and self.end_time < self.start_time:
            raise ValidationError(_("End time cannot be before start time."))

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class ProductionMaterialConsumption(Model):
    """
    Production Material Consumption Model
    
    Tracks material consumption for production schedules/lines
    - Many-to-One with ProductionSchedule (a schedule can consume many materials) ☑️
    - Many-to-One with Material (a material can be consumed by many schedules) ☑️
    - Many-to-One with User (records who logged the consumption) ☑️
    """
    
    production_schedule = ForeignKey(
        ProductionSchedule,
        on_delete=CASCADE,
        related_name="material_consumptions",
        verbose_name=_("production schedule"),
    )
    material = ForeignKey(
        "inventory.Material",
        on_delete=CASCADE,
        related_name="production_consumptions",
        verbose_name=_("material"),
    )
    quantity = DecimalField(
        _("quantity consumed"),
        max_digits=10,
        decimal_places=2,
    )
    consumed_at = DateTimeField(
        _("consumed at"),
        auto_now_add=True,
    )
    consumed_by = ForeignKey(
        "main.User",
        on_delete=SET_NULL,
        null=True,
        blank=True,
        related_name="production_material_consumptions",
        verbose_name=_("consumed by"),
    )
    notes = TextField(
        _("notes"),
        blank=True,
        null=True,
    )
    updated_at = DateTimeField(_("updated at"), auto_now=True)
    
    class Meta:
        ordering = ["-consumed_at"]
        indexes = [
            Index(fields=["production_schedule", "material"]),
            Index(fields=["consumed_at"]),
        ]
        constraints = [
            CheckConstraint(
                check=Q(quantity__gt=0),
                name="production_consumption_quantity_positive",
            ),
        ]
        verbose_name = _("Production Material Consumption")
        verbose_name_plural = _("Production Material Consumptions")
    
    def __str__(self):
        return f"{self.production_schedule.product.name if self.production_schedule.product else 'N/A'} - {self.material.name}: {self.quantity} {self.material.unit_of_measurement}"
    
    def clean(self):
        if self.quantity <= 0:
            raise ValidationError(_("Quantity must be greater than zero."))
        
        # Check if material has sufficient stock
        if self.material.quantity < self.quantity:
            raise ValidationError(
                _(f"Insufficient stock. Available: {self.material.quantity} {self.material.unit_of_measurement}")
            )
    
    @transaction.atomic
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_quantity = None
        
        if not is_new:
            try:
                old_instance = ProductionMaterialConsumption.objects.get(pk=self.pk)
                old_quantity = old_instance.quantity
            except ProductionMaterialConsumption.DoesNotExist:
                pass
        
        self.clean()
        super().save(*args, **kwargs)
        
        # Update material inventory
        if is_new:
            # Deduct new consumption from inventory
            self.material.quantity -= self.quantity
            self.material.save(update_fields=["quantity"])
        elif old_quantity is not None and old_quantity != self.quantity:
            # Adjust inventory based on quantity change
            quantity_diff = self.quantity - old_quantity
            self.material.quantity -= quantity_diff
            self.material.save(update_fields=["quantity"])
    
    @transaction.atomic
    def delete(self, *args, **kwargs):
        # Return material to inventory when consumption is deleted
        self.material.quantity += self.quantity
        self.material.save(update_fields=["quantity"])
        super().delete(*args, **kwargs)
