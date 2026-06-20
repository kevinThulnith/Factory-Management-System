import random
from django.core.management.base import BaseCommand

from product.models import Product, ProductProcess
from production.models import ManufacturingProcess
from main.info import SAMPLE_PRODUCTS


class Command(BaseCommand):
    help = "Seed products and assign manufacturing process sequences."

    def handle(self, *args, **options):
        try:
            self.create_products()
            self.add_manufacturing_processes_with_sequence()
            self.display_product_sequences()
            self.get_summary_statistics()
            print("\n✅ Command completed successfully!")
        except Exception as e:
            print(f"\n❌ Command failed with error: {e}")
            import traceback

            traceback.print_exc()

    def create_products(self):
        print("Creating products...")
        created_count = 0

        for i, pr_data in enumerate(SAMPLE_PRODUCTS):
            if i >= 10:
                break

            existing_product = Product.objects.filter(name=pr_data["name"]).first()
            if existing_product:
                print(f"Product '{pr_data['name']}' already exists. Skipping...")
                continue

            try:
                product = Product.objects.create(**pr_data)
                created_count += 1
                print(f"✅ Created product: {product.name}")
            except Exception as e:
                print(f"⚠️ Failed to create product {pr_data['name']}: {e}")

        print(f"🎉 Successfully created {created_count} products!")

    def add_manufacturing_processes_with_sequence(self):
        print("\nAssigning manufacturing processes to products...")

        processes = list(ManufacturingProcess.objects.all())
        products = Product.objects.all()

        if len(processes) < 3:
            print("⚠️ Need at least 3 manufacturing processes to assign")
            return

        assignment_count = 0
        for product in products:
            ProductProcess.objects.filter(product=product).delete()

            num_processes = random.randint(3, min(5, len(processes)))
            random_processes = random.sample(processes, num_processes)

            try:
                for sequence_num, process in enumerate(random_processes, start=1):
                    ProductProcess.objects.create(
                        product=product, process=process, sequence=sequence_num
                    )
                    print(f"   ✅ Step {sequence_num}: {process.name}")

                assignment_count += 1
                print(
                    f"✅ Added {len(random_processes)} processes to product {product.name}"
                )
            except Exception as e:
                print(f"⚠️ Failed to add processes to product {product.name}: {e}")

        print(f"🎉 Successfully assigned processes to {assignment_count} products!")

    def display_product_sequences(self):
        print("\n📋 Product Manufacturing Sequences:")
        print("=" * 70)

        products = Product.objects.all()

        for product in products:
            print(f"\n📦 {product.name} ({product.code}):")

            product_processes = (
                ProductProcess.objects.filter(product=product)
                .select_related("process")
                .order_by("sequence")
            )

            if product_processes:
                for pp in product_processes:
                    print(
                        f"   {pp.sequence}. {pp.process.name} (Est. time: {pp.process.standard_time})"
                    )
            else:
                print("   No processes assigned")

        print("\n" + "=" * 70)

    def get_summary_statistics(self):
        print("\n📊 Summary Statistics:")
        print("-" * 30)

        total_products = Product.objects.count()
        total_processes = ManufacturingProcess.objects.count()
        total_assignments = ProductProcess.objects.count()

        print(f"Total Products: {total_products}")
        print(f"Total Manufacturing Processes: {total_processes}")
        print(f"Total Process Assignments: {total_assignments}")

        if total_products > 0:
            avg = total_assignments / total_products
            print(f"Average Processes per Product: {avg:.1f}")
