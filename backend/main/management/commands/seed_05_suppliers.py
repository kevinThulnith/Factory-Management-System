from django.core.management.base import BaseCommand
from faker import Faker

from inventory.models import Supplier, Material
from main.info import MATERIALS


class Command(BaseCommand):
    help = "Seed suppliers and materials for inventory."

    def handle(self, *args, **options):
        self.create_suppliers()
        self.create_material()

    def create_suppliers(self):
        fake = Faker()
        for i in range(12):
            print(f"\nCreating supplier {i+1}/12...")
            name = fake.company()
            address = fake.address()
            email = fake.email()
            phone = fake.numerify("##########")

            print(
                f"Name: {name} \n Address: {address} \n Email: {email} \n Phone: {phone}\n"
            )

            if not Supplier.objects.filter(email=email).exists():
                Supplier.objects.create(
                    name=name,
                    address=address,
                    email=email,
                    phone=phone,
                )
                print(f"✅ Created supplier: {name}")
            else:
                print(f"⚠️ Supplier with email {email} already exists")

    def create_material(self):
        for material_data in MATERIALS:
            material, created = Material.objects.get_or_create(
                name=material_data["name"],
                defaults={
                    "description": material_data["description"],
                    "unit_of_measurement": material_data["unit_of_measurement"],
                    "quantity": material_data["quantity"],
                    "reorder_level": material_data["reorder_level"],
                },
            )
            if created:
                print(f"\n✅ Added new material: {material.name}")
            else:
                print(f"\n⚠️ Material already exists: {material.name}")
