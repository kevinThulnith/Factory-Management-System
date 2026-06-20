from random import choice, sample

from django.core.management.base import BaseCommand

from labor.models import SkillMatrix
from main.models import User
from main.info import SAMPLE_SKILLS, SKILL_CATEGORIES


class Command(BaseCommand):
    help = "Seed a skill matrix of 3 random skills per non-admin user."

    def handle(self, *args, **options):
        self.create_skill_matrix()

    def create_skill_matrix(self):
        non_admin_users = User.objects.exclude(role=User.Role.ADMIN)
        print(f"Found {non_admin_users.count()} non-admin users to assign skills to...")

        skills_created = 0

        for user in non_admin_users:
            existing_skills = SkillMatrix.objects.filter(employee=user)
            if existing_skills.exists():
                print(
                    f"  Clearing {existing_skills.count()} existing skills for {user.username}"
                )
                existing_skills.delete()

            selected_skills = sample(SAMPLE_SKILLS, 3)

            for skill_name in selected_skills:
                category = SKILL_CATEGORIES.get(skill_name, "OTHER")

                if user.role == User.Role.MANAGER:
                    level = choice(
                        [
                            SkillMatrix.SkillLevel.INTERMEDIATE,
                            SkillMatrix.SkillLevel.ADVANCED,
                            SkillMatrix.SkillLevel.EXPERT,
                        ]
                    )
                elif user.role == User.Role.SUPERVISOR:
                    level = choice(
                        [
                            SkillMatrix.SkillLevel.INTERMEDIATE,
                            SkillMatrix.SkillLevel.ADVANCED,
                            SkillMatrix.SkillLevel.ADVANCED,
                        ]
                    )
                else:
                    level = choice(
                        [
                            SkillMatrix.SkillLevel.BEGINNER,
                            SkillMatrix.SkillLevel.INTERMEDIATE,
                            SkillMatrix.SkillLevel.INTERMEDIATE,
                            SkillMatrix.SkillLevel.ADVANCED,
                        ]
                    )

                description = f"{skill_name} skill for {user.name}. Level: {level}"

                SkillMatrix.objects.create(
                    name=skill_name,
                    description=description,
                    category=category,
                    level=level,
                    employee=user,
                )

                skills_created += 1
                print(f"  ✅ Added skill: {skill_name} ({level}) to {user.username}")

        print(f"\n🎉 Successfully created {skills_created} skill entries!")

        print("\n📊 Summary by Role:")
        for role_value, role_label in User.Role.choices:
            if role_value == User.Role.ADMIN:
                continue
            user_count = non_admin_users.filter(role=role_value).count()
            skill_count = SkillMatrix.objects.filter(employee__role=role_value).count()
            print(f"  {role_label}: {user_count} users, {skill_count} skills")

        print("\n📈 Skills by Level:")
        for level_value, level_label in SkillMatrix.SkillLevel.choices:
            count = SkillMatrix.objects.filter(level=level_value).count()
            print(f"  {level_label}: {count}")

        print("\n🏷️ Skills by Category:")
        for category_value, category_label in SkillMatrix.SkillCategory.choices:
            count = SkillMatrix.objects.filter(category=category_value).count()
            if count > 0:
                print(f"  {category_label}: {count}")

        print("\n👥 Example Users and Their Skills:")
        for user in non_admin_users[:3]:
            user_skills = SkillMatrix.objects.filter(employee=user)
            print(f"  {user.username} ({user.role}):")
            for skill in user_skills:
                print(f"    - {skill.name} ({skill.level})")
