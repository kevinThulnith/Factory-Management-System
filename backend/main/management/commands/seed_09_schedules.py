import random
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker

from production.models import ProductionSchedule, ProductionLine
from product.models import Product
from main.models import User

fake = Faker()


class Command(BaseCommand):
    help = "Seed production schedules across the next 30 days."

    def handle(self, *args, **options):
        try:
            if not ProductionLine.objects.exists():
                print("No production lines found. Creating sample production lines...")
                self.create_sample_production_lines()
                print()

            self.create_production_schedules()
            self.display_schedule_summary()
            print("\n✅ Command completed successfully!")
        except Exception as e:
            print(f"\n❌ Command failed with error: {e}")
            import traceback

            traceback.print_exc()

    def create_production_schedules(self):
        print("Creating production schedules...")

        production_lines = list(
            ProductionLine.objects.filter(operational_status="ACTIVE")
        )
        products = list(Product.objects.all())
        users = list(User.objects.filter(role__in=["ADMIN", "MANAGER", "SUPERVISOR"]))

        if not production_lines:
            print("❌ No active production lines found. Create production lines first.")
            return
        if not products:
            print("❌ No products found. Create products first.")
            return
        if not users:
            print("❌ No suitable users found. Create users first.")
            return

        created_count = 0
        start_date = timezone.now()

        for day_offset in range(30):
            current_date = start_date + timedelta(days=day_offset)

            if current_date.weekday() >= 5:
                continue

            daily_schedules = random.randint(2, 5)

            for _ in range(daily_schedules):
                production_line = random.choice(production_lines)
                product = random.choice(products)
                created_by = random.choice(users)

                start_hour = random.randint(6, 14)
                start_minute = random.choice([0, 15, 30, 45])

                schedule_start = current_date.replace(
                    hour=start_hour, minute=start_minute, second=0, microsecond=0
                )

                max_quantity = min(production_line.production_capacity, Decimal("1000"))
                quantity = Decimal(str(random.randint(10, int(max_quantity))))

                if current_date.date() < timezone.now().date():
                    status = random.choices(
                        [
                            ProductionSchedule.ScheduleStatus.COMPLETED,
                            ProductionSchedule.ScheduleStatus.CANCELLED,
                        ],
                        weights=[85, 15],
                    )[0]
                elif current_date.date() == timezone.now().date():
                    status = random.choices(
                        [
                            ProductionSchedule.ScheduleStatus.IN_PROGRESS,
                            ProductionSchedule.ScheduleStatus.COMPLETED,
                            ProductionSchedule.ScheduleStatus.SCHEDULED,
                        ],
                        weights=[40, 30, 30],
                    )[0]
                else:
                    status = ProductionSchedule.ScheduleStatus.SCHEDULED

                end_time = None
                if status == ProductionSchedule.ScheduleStatus.COMPLETED:
                    duration_hours = random.randint(2, 8)
                    end_time = schedule_start + timedelta(hours=duration_hours)

                try:
                    existing = ProductionSchedule.objects.filter(
                        production_line=production_line,
                        product=product,
                        start_time__date=schedule_start.date(),
                    ).first()

                    if existing:
                        continue

                    ProductionSchedule.objects.create(
                        production_line=production_line,
                        product=product,
                        quantity=quantity,
                        start_time=schedule_start,
                        end_time=end_time,
                        status=status,
                        created_by=created_by,
                    )

                    created_count += 1
                    print(
                        f"✅ Created schedule: {product.name} on {production_line.name} - {quantity} units ({status})"
                    )
                except Exception as e:
                    print(f"❌ Error creating schedule: {e}")

        print(f"\n🎉 Successfully created {created_count} production schedules!")

    def display_schedule_summary(self):
        print("\n📊 Production Schedule Summary:")
        print("=" * 60)

        total_schedules = ProductionSchedule.objects.count()

        if total_schedules == 0:
            print("No schedules found.")
            return

        print("\n📈 Schedule Status Breakdown:")
        for status_code, status_name in ProductionSchedule.ScheduleStatus.choices:
            count = ProductionSchedule.objects.filter(status=status_code).count()
            percentage = (count / total_schedules) * 100
            print(f"  {status_name}: {count} ({percentage:.1f}%)")

        print("\n🏭 Schedules by Production Line:")
        from django.db.models import Count

        line_stats = (
            ProductionSchedule.objects.values("production_line__name")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )

        for stat in line_stats:
            print(f"  {stat['production_line__name']}: {stat['count']} schedules")

        print("\n📅 Recent Schedules (Last 5):")
        recent_schedules = ProductionSchedule.objects.select_related(
            "production_line", "product", "created_by"
        ).order_by("-start_time")[:5]

        for schedule in recent_schedules:
            print(
                f"  {schedule.start_time.strftime('%Y-%m-%d %H:%M')} - "
                f"{schedule.product.name} on {schedule.production_line.name} "
                f"({schedule.status})"
            )

    def create_sample_production_lines(self):
        from core.models import Workshop

        if ProductionLine.objects.exists():
            print("Production lines already exist.")
            return

        workshops = Workshop.objects.all()
        if not workshops.exists():
            print("❌ No workshops found. Create workshops first.")
            return

        sample_lines = [
            {
                "name": "Assembly Line A",
                "description": "Main assembly line for pumps",
                "capacity": 100,
            },
            {
                "name": "Assembly Line B",
                "description": "Secondary assembly line",
                "capacity": 80,
            },
            {
                "name": "Welding Line 1",
                "description": "Primary welding operations",
                "capacity": 50,
            },
            {
                "name": "Machining Line",
                "description": "CNC machining operations",
                "capacity": 60,
            },
            {
                "name": "Quality Control Line",
                "description": "Final inspection and testing",
                "capacity": 120,
            },
        ]

        created_count = 0
        for line_data in sample_lines:
            workshop = random.choice(workshops)
            try:
                ProductionLine.objects.create(
                    name=line_data["name"],
                    description=line_data["description"],
                    production_capacity=line_data["capacity"],
                    workshop=workshop,
                )
                created_count += 1
                print(f"✅ Created production line: {line_data['name']}")
            except Exception as e:
                print(f"❌ Error creating production line {line_data['name']}: {e}")

        print(f"Created {created_count} production lines.")
