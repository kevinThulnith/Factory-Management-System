from faker import Faker
import random
import django
import sys
import os

# 🔧 Add the project root to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 🔧 Set Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# ✅ Setup Django
django.setup()

# ⬇️ Your user generation logic below this
from main.models import User


def split_first_last(full_name: str):
    parts = full_name.strip().split()
    if not parts:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], parts[-1]


def create_random_users():
    fake = Faker()
    for i in range(90):
        username = f"user{i+1}"
        if not User.objects.filter(username=username).exists():
            full_name = fake.name()
            first_name, last_name = split_first_last(full_name)
            User.objects.create_user(
                email=f"{username}@example.com",
                username=username,
                password="1234",
                first_name=first_name,
                last_name=last_name,
                dob=fake.date_of_birth(maximum_age=30, minimum_age=20),
                nic=str(random.randint(1000000000, 9999999999)),
                mobile_no=f"0{random.randint(700000000, 799999999)}",
            )
            print(f"✅ Created user: {username}")
        else:
            print(f"⚠️ User {username} already exists")


def set_base(role, count):
    users = User.objects.filter(role=User.Role.OPERATOR)[:count]
    for user in users:
        user.role = role
        user.save()
        print(f"✅ Set {user.username} as {role.name.lower()}")
    return len(users)


def set_supervisors():
    # TODO: Set supervisors
    n = set_base(User.Role.SUPERVISOR, 7)
    print(f"👥 Total supervisors set: {n}")


def set_managers():
    # TODO: Set managers
    n = set_base(User.Role.MANAGER, 21)
    print(f"👥 Total managers set: {n}")


def set_technicians():
    # TODO: Set technicians
    n = set_base(User.Role.TECHNICIAN, 7)
    print(f"👥 Total technicians set: {n}")


def set_purchasing():
    # TODO: Set purchasing
    fake = Faker()
    for i in range(3):
        username = f"purchasing{i+92}"
        if not User.objects.filter(username=username).exists():
            full_name = fake.name()
            first_name, last_name = split_first_last(full_name)
            User.objects.create_user(
                email=f"{fake.email()}",
                username=username,
                password="1234",
                first_name=first_name,
                last_name=last_name,
                dob=fake.date_of_birth(maximum_age=30, minimum_age=20),
                nic=str(random.randint(1000000000, 9999999999)),
                mobile_no=f"0{random.randint(700000000, 799999999)}",
                role=User.Role.PURCHASING,
            )
            print(f"✅ Created purchasing user: {username}")
        else:
            print(f"⚠️ Purchasing user {username} already exists")


if __name__ == "__main__":
    create_random_users()
    set_supervisors()
    set_managers()
    set_technicians()
    set_purchasing()
