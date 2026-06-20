from django.core.management.base import BaseCommand

from production.models import ManufacturingProcess
from main.info import SAMPLE_Manufacturing_Process


class Command(BaseCommand):
    help = "Seed manufacturing processes from sample data."

    def handle(self, *args, **options):
        self.create_manufacturing_processes()

    def create_manufacturing_processes(self):
        print("Creating manufacturing processes...")
        created_count = 0

        for mp_data in SAMPLE_Manufacturing_Process:
            existing_mp = ManufacturingProcess.objects.filter(
                name=mp_data["name"]
            ).first()
            if existing_mp:
                print(
                    f"Manufacturing process '{mp_data['name']}' already exists. Skipping..."
                )
                continue

            mp = ManufacturingProcess(
                name=mp_data["name"],
                description=mp_data["description"],
                standard_time=mp_data["standard_time"],
                quality_parameters=mp_data["quality_parameters"],
            )

            try:
                mp.save()
                created_count += 1
                print(f"✅ Created manufacturing process: {mp.name}")
            except Exception as e:
                print(
                    f"❌ Error creating manufacturing process '{mp_data['name']}': {e}"
                )

        print(f"\n🎉 Successfully created {created_count} manufacturing processes!")
