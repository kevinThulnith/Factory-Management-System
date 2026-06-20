from datetime import timedelta
from django.core.management.base import BaseCommand
from faker import Faker

from core.models import Workshop, Machine
from main.info import SAMPLE_MACHINES


class Command(BaseCommand):
    help = "Seed machines into workshops from sample data."

    def handle(self, *args, **options):
        self.create_machines()

    def create_machines(self):
        workshops = Workshop.objects.all()
        fake = Faker()
        created_count = 0

        for workshop in workshops:
            if workshop.name in SAMPLE_MACHINES:
                print(f"✅ Workshop: {workshop.name}")
                machine_list = SAMPLE_MACHINES[workshop.name][:3]
                for machine_data in machine_list:
                    created_count += 1
                    print(
                        f"{created_count}) {machine_data['name']} -> {machine_data['model_number']}"
                    )

                    purchase_date = fake.date_between(start_date="-4y", end_date="-3y")
                    last_maintenance_date = fake.date_between(
                        start_date=purchase_date, end_date="-30d"
                    )
                    next_maintenance_date = fake.date_between(
                        start_date=last_maintenance_date + timedelta(days=1),
                        end_date="+6m",
                    )

                    Machine(
                        name=machine_data["name"],
                        model_number=machine_data["model_number"],
                        workshop=workshop,
                        purchase_date=purchase_date,
                        last_maintenance_date=last_maintenance_date,
                        next_maintenance_date=next_maintenance_date,
                    ).save()
                    print("✅ Created machine")
                print("\n")

        print(f"Total machines created: {created_count}")
