from django.core.management.base import BaseCommand

from core.models import Workshop, Department, User
from main.info import SAMPLE_WORKSHOPS, WORKSHOP_DESCRIPTIONS


class Command(BaseCommand):
    help = "Seed workshops per department and assign managers."

    def handle(self, *args, **options):
        self.create_workshops()
        self.add_managers()

    def create_workshops(self):
        departments = Department.objects.all()
        for department in departments:
            if department.name in SAMPLE_WORKSHOPS:
                workshop_list = SAMPLE_WORKSHOPS[department.name][:3]
                for workshop in workshop_list:
                    description = WORKSHOP_DESCRIPTIONS[workshop]
                    print(
                        f" Creating workshop {workshop} for department {department.name}..."
                    )
                    Workshop(
                        name=workshop,
                        description=description,
                        department=department,
                    ).save()
                    print(
                        f"✅ Created workshop: {workshop} for department {department.name}"
                    )

    def add_managers(self):
        workshops = Workshop.objects.all()
        managers = User.objects.filter(role=User.Role.MANAGER)

        if managers.count() < workshops.count():
            print("Not enough managers for all workshops!")
            return

        for i, workshop in enumerate(workshops):
            manager = managers[i]
            print(f"Setting {manager.username} as manager for {workshop.name}")

            workshop.manager = manager
            workshop.save()

            workshop.refresh_from_db()
            manager.refresh_from_db()

            print(f"✅ Workshop: {workshop.name}")
            print(f"✅ Manager: {manager.username}")
            print(f"✅ Manager role: {manager.role}")
            print(f"✅ Manager department: {manager.department}\n")
