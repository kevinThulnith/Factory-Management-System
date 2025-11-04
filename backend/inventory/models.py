from django.db.models import DecimalField, EmailField, FileField
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator
from main.models import phone_validator
from django.db import transaction
from django.db.models import Sum
from django.db.models import (
    CheckConstraint,
    DateTimeField,
    TextChoices,
    ForeignKey,
    DateField,
    CharField,
    TextField,
    CASCADE,
    Model,
    Index,
    Q,
)

# TODO: Create inventory models


class Material(Model):
    """
    Material Model

    - One-to-Many with Order items (a material can be in many Orders) ☑️
    """

    name = CharField(max_length=255, unique=True)
    description = TextField(blank=True, null=True)
    unit_of_measurement = CharField(max_length=50, blank=True, null=True)
    quantity = DecimalField(max_digits=10, decimal_places=2, default=0.00)
    reorder_level = DecimalField(max_digits=10, decimal_places=2, default=0.00)
    updated_at = DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [Index(fields=["name"]), Index(fields=["quantity"])]
        constraints = [
            CheckConstraint(
                check=Q(quantity__gte=0), name="material_quantity_non_negative"
            ),
            CheckConstraint(
                check=Q(reorder_level__gte=0),
                name="material_reorder_level_non_negative",
            ),
        ]

    def __str__(self):
        return f"{self.name} -> {self.quantity} {self.unit_of_measurement}"

    @property
    def is_low_stock(self):
        return self.quantity <= self.reorder_level

    @property
    def is_out_of_stock(self):
        return self.quantity == 0


class Supplier(Model):
    """
    Supplier Model

    - One-to-Many with orders (a supplier can have many purchases) ☑️
    """

    name = CharField(_("name"), max_length=150)
    address = TextField(_("address"), blank=True)
    email = EmailField(blank=True, unique=True, validators=[EmailValidator])
    phone = CharField(
        max_length=30,
        blank=True,
        unique=True,
        validators=[phone_validator],
    )

    class Meta:
        ordering = ["name"]
        indexes = [Index(fields=["name"])]

    def __str__(self):
        return self.name

    def clean(self):
        if not self.email and not self.phone:
            raise ValidationError("Either email or phone number must be provided")

    def save(self, *args, **kwargs):
        if "update_fields" not in kwargs:
            self.clean()
        super().save(*args, **kwargs)


class Order(Model):
    """
    Order Model

    - One-to-Many with Order Materials (an order can have many materials) ☑️
    - One-to-Many with Suppliers (an order can have one supplier) ☑️
    - One-to-Many with Employee (an order can have one employee) ☑️
    """

    class OrderStatus(TextChoices):
        DRAFT = "DRAFT", _("Draft")
        ORDERED = "ORDERED", _("Ordered")
        CANCELLED = "CANCELLED", _("Cancelled")
        RECEIVED = "RECEIVED", _("Received Complete")

    order_date = DateField(_("order date"), auto_now_add=True)
    supplier = ForeignKey(Supplier, on_delete=CASCADE, related_name="orders")
    created_by = ForeignKey(
        "main.User", on_delete=CASCADE, related_name="created_orders"
    )
    status = CharField(
        max_length=20,
        db_index=True,
        default=OrderStatus.DRAFT,
        choices=OrderStatus.choices,
    )
    updated_at = DateTimeField(_("updated at"), auto_now=True)
    total = DecimalField(max_digits=10, decimal_places=2, default=0.00)
    invoice = FileField(upload_to="invoices/", blank=True, null=True)

    class Meta:
        ordering = ["-order_date"]
        indexes = [Index(fields=["supplier", "status"])]
        constraints = [
            CheckConstraint(check=Q(total__gte=0), name="order_total_non_negative"),
        ]

    def __str__(self):
        return f"Order #{self.id} from {self.supplier.name}"

    def save(self, *args, **kwargs):
        is_receiving = False

        if self.pk:
            old_order = Order.objects.select_related(None).get(pk=self.pk)
            if (
                old_order.status != self.OrderStatus.RECEIVED
                and self.status == self.OrderStatus.RECEIVED
            ):
                is_receiving = True
        else:
            # !cant create an order as RECEIVED
            if self.status == self.OrderStatus.RECEIVED:
                raise ValueError(_("Cannot create an order directly as RECEIVED."))

        # Perform the check before saving
        if is_receiving:
            # <-- ADD THIS CHECK
            if not self.invoice:
                raise ValidationError(
                    _("Cannot change status to RECEIVED without uploading an invoice.")
                )

        super().save(*args, **kwargs)

        # Update stocks only after a successful save
        if is_receiving:
            self._update_material_stocks()

    @transaction.atomic
    def _update_material_stocks(self):
        for order_material in self.order_materials.all():
            material = order_material.material
            material.quantity += order_material.quantity
            material.save(update_fields=["quantity"])


class OrderMaterial(Model):
    """
    Order Material Model

    - Many-to-One with Orders (an order can have many materials) ☑️
    - Many-to-One with Materials (a material can be in many orders) ☑️
    """

    order = ForeignKey(Order, on_delete=CASCADE, related_name="order_materials")
    material = ForeignKey(Material, on_delete=CASCADE, related_name="order_materials")
    quantity = DecimalField(max_digits=10, decimal_places=2)
    unit_price = DecimalField(max_digits=10, decimal_places=2)
    total_price = DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        ordering = ["order"]
        unique_together = ["order", "material"]
        indexes = [Index(fields=["order"]), Index(fields=["material"])]

    def __str__(self):
        return f"{self.material.name} - {self.unit_price} - {self.quantity} -> {self.total_price}"

    def save(self, *args, **kwargs):
        if self.quantity < 0:
            raise ValidationError(_("Quantity cannot be negative."))

        if self.unit_price < 0:
            raise ValidationError(_("Unit price cannot be negative."))

        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)
        self.update_order_total()

    def update_order_total(self):
        "Recalculate the order total based on all materials."
        total = (
            OrderMaterial.objects.filter(order=self.order).aggregate(
                total=Sum("total_price")
            )["total"]
            or 0.00
        )
        Order.objects.filter(pk=self.order.pk).update(total=total)
