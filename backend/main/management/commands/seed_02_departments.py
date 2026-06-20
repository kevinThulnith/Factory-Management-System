from django.core.management.base import BaseCommand
from faker import Faker

from core.models import Department, User
from main.info import SAMPLE_DEPARTMENTS


class Command(BaseCommand):
    help = "Seed departments from sample data and assign supervisors/operators."

    def handle(self, *args, **options):
        self.create_departments()
        self.set_operator_to_department()

    def create_departments(self):
        supervisors = User.objects.filter(role=User.Role.SUPERVISOR)
        departments = SAMPLE_DEPARTMENTS[: len(supervisors)]
        fake = Faker()

        for i, department in enumerate(departments):
            supervisor = supervisors[i]
            try:
                Department(
                    name=department,
                    description=fake.sentence(),
                    location=fake.city(),
                    supervisor=supervisor,
                ).save()
                print(f"✅ Created department: {department}")
            except Exception:
                print(f"⚠️ Department '{department}' already exists")

    def set_operator_to_department(self):
        departments = Department.objects.all()
        operators = User.objects.filter(role=User.Role.OPERATOR)

        if not departments.exists():
            print("❌ No departments found. Run seed_02_departments first.")
            return

        for i, operator in enumerate(operators):
            department = departments[i % len(departments)]
            operator.department = department
            operator.save()
            print(f"✅ Assigned {operator.username} to {department.name}")
