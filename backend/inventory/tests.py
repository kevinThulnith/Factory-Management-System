from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from decimal import Decimal
from inventory.models import Material, MaterialUsage
from main.models import User


class MaterialUsageModelTest(TestCase):
    """Tests for the MaterialUsage model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            email="testuser@example.com",
            username="testuser",
            password="testpassword123",
        )
        self.material = Material.objects.create(
            name="Test Material",
            description="A test material",
            unit_of_measurement="kg",
            quantity=Decimal("100.00"),
            reorder_level=Decimal("10.00"),
        )

    def test_create_material_usage_success(self):
        """Test creating a material usage record successfully."""
        initial_quantity = self.material.quantity

        usage = MaterialUsage.objects.create(
            material=self.material,
            task_name="Test Task",
            task_description="A test task description",
            quantity_used=Decimal("10.00"),
            used_by=self.user,
            notes="Test notes",
        )

        # Verify usage record was created
        self.assertIsNotNone(usage.id)
        self.assertEqual(usage.material, self.material)
        self.assertEqual(usage.task_name, "Test Task")
        self.assertEqual(usage.quantity_used, Decimal("10.00"))
        self.assertEqual(usage.used_by, self.user)

        # Verify material quantity was reduced
        self.material.refresh_from_db()
        self.assertEqual(
            self.material.quantity, initial_quantity - Decimal("10.00")
        )

    def test_create_material_usage_insufficient_quantity(self):
        """Test that creating usage with insufficient quantity raises error."""
        with self.assertRaises(ValidationError) as context:
            MaterialUsage.objects.create(
                material=self.material,
                task_name="Test Task",
                quantity_used=Decimal("200.00"),  # More than available
                used_by=self.user,
            )

        self.assertIn("Insufficient material quantity", str(context.exception))

        # Verify material quantity was not changed
        self.material.refresh_from_db()
        self.assertEqual(self.material.quantity, Decimal("100.00"))

    def test_create_material_usage_zero_quantity_fails(self):
        """Test that creating usage with zero quantity raises error."""
        with self.assertRaises((ValidationError, IntegrityError)):
            MaterialUsage.objects.create(
                material=self.material,
                task_name="Test Task",
                quantity_used=Decimal("0.00"),
                used_by=self.user,
            )

    def test_create_material_usage_negative_quantity_fails(self):
        """Test that creating usage with negative quantity raises error."""
        with self.assertRaises((ValidationError, IntegrityError)):
            MaterialUsage.objects.create(
                material=self.material,
                task_name="Test Task",
                quantity_used=Decimal("-10.00"),
                used_by=self.user,
            )

    def test_delete_material_usage_restores_quantity(self):
        """Test that deleting usage record restores material quantity."""
        initial_quantity = self.material.quantity

        usage = MaterialUsage.objects.create(
            material=self.material,
            task_name="Test Task",
            quantity_used=Decimal("10.00"),
            used_by=self.user,
        )

        # Verify quantity was reduced
        self.material.refresh_from_db()
        self.assertEqual(
            self.material.quantity, initial_quantity - Decimal("10.00")
        )

        # Delete the usage record
        usage.delete()

        # Verify quantity was restored
        self.material.refresh_from_db()
        self.assertEqual(self.material.quantity, initial_quantity)

    def test_material_usage_str_representation(self):
        """Test the string representation of MaterialUsage."""
        usage = MaterialUsage.objects.create(
            material=self.material,
            task_name="Test Task",
            quantity_used=Decimal("10.00"),
            used_by=self.user,
        )

        expected_str = f"{self.material.name} - 10.00 used for Test Task"
        self.assertEqual(str(usage), expected_str)

    def test_material_usage_ordering(self):
        """Test that usages are ordered by usage_date descending."""
        usage1 = MaterialUsage.objects.create(
            material=self.material,
            task_name="Task 1",
            quantity_used=Decimal("5.00"),
            used_by=self.user,
        )
        usage2 = MaterialUsage.objects.create(
            material=self.material,
            task_name="Task 2",
            quantity_used=Decimal("5.00"),
            used_by=self.user,
        )

        usages = list(MaterialUsage.objects.all())
        # Most recent should be first
        self.assertEqual(usages[0], usage2)
        self.assertEqual(usages[1], usage1)

    def test_material_usage_exact_quantity(self):
        """Test using exactly all available material quantity."""
        exact_quantity = self.material.quantity

        usage = MaterialUsage.objects.create(
            material=self.material,
            task_name="Test Task",
            quantity_used=exact_quantity,
            used_by=self.user,
        )

        self.assertIsNotNone(usage.id)
        self.material.refresh_from_db()
        self.assertEqual(self.material.quantity, Decimal("0.00"))

    def test_material_usage_optional_fields(self):
        """Test that optional fields can be null."""
        usage = MaterialUsage.objects.create(
            material=self.material,
            task_name="Test Task",
            quantity_used=Decimal("5.00"),
            used_by=self.user,
            task_description=None,
            notes=None,
        )

        self.assertIsNone(usage.task_description)
        self.assertIsNone(usage.notes)

    def test_material_usage_related_name(self):
        """Test the related_name for material and user relationships."""
        usage = MaterialUsage.objects.create(
            material=self.material,
            task_name="Test Task",
            quantity_used=Decimal("5.00"),
            used_by=self.user,
        )

        # Test material.material_usages
        self.assertIn(usage, self.material.material_usages.all())

        # Test user.material_usages
        self.assertIn(usage, self.user.material_usages.all())

    def test_multiple_usages_reduce_quantity_correctly(self):
        """Test that multiple usage records reduce quantity correctly."""
        initial_quantity = self.material.quantity

        MaterialUsage.objects.create(
            material=self.material,
            task_name="Task 1",
            quantity_used=Decimal("20.00"),
            used_by=self.user,
        )
        MaterialUsage.objects.create(
            material=self.material,
            task_name="Task 2",
            quantity_used=Decimal("30.00"),
            used_by=self.user,
        )

        self.material.refresh_from_db()
        expected_quantity = initial_quantity - Decimal("50.00")
        self.assertEqual(self.material.quantity, expected_quantity)
