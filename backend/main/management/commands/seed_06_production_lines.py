import random
from django.core.management.base import BaseCommand
from faker import Faker

from core.models import Workshop, Machine
from production.models import ProductionLine
from main.info import SAMPLE_PRODUCTION_LINES, SAMPLE_PRODUCTION_LINE_CAPACITIES


class Command(BaseCommand):
    help = "Seed production lines and attach machines to them."

    def handle(self, *args, **options):
        self.create_production_lines()
        self.add_machines()

    def create_production_lines(self):
        fake = Faker()
        workshops = Workshop.objects.all()
        for i in range(8):
            if i >= len(workshops):
                print("⚠️ Not enough workshops to create all production lines")
                break
            workshop = workshops[i]
            name = f"{workshop.name} {SAMPLE_PRODUCTION_LINES[i]}"
            try:
                ProductionLine.objects.create(
                    name=name,
                    workshop=workshop,
                    production_capacity=random.choice(
                        SAMPLE_PRODUCTION_LINE_CAPACITIES
                    ),
                    description=fake.sentence(),
                )
                print(f"✅ Created production line: {name}")
            except Exception as e:
                print(f"⚠️ Failed to create production line {name}: {e}")

    def add_machines(self):
        pls = ProductionLine.objects.all()
        for pl in pls:
            machines = Machine.objects.filter(workshop=pl.workshop)

            if machines.count() < 2:
                print(f"⚠️ Not enough machines in workshop for {pl.name}")
                continue

            for i in range(2):
                machine = machines[i]
                try:
                    pl.machines.add(machine)
                    pl.save()
                    print(f"✅ Added machine {machine.name} to {pl.name}")
                except Exception as e:
                    print(f"⚠️ Failed to add machine {machine.name} to {pl.name}: {e}")
