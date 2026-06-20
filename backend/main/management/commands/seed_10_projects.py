from datetime import date, timedelta
from random import choice, randint

from django.core.management.base import BaseCommand

from project.models import Project, Task
from main.models import User
from main.info import project_names, task_templates


class Command(BaseCommand):
    help = "Seed sample projects with tasks assigned to managers and operators."

    def handle(self, *args, **options):
        self.create_projects_and_tasks()

    def create_projects_and_tasks(self):
        managers = User.objects.filter(role=User.Role.MANAGER)
        operators = User.objects.filter(role=User.Role.OPERATOR)

        for i, project_name in enumerate(project_names, 1):
            start_date = date.today() + timedelta(days=randint(0, 30))
            end_date = start_date + timedelta(days=randint(30, 90))

            project = Project.objects.create(
                name=project_name,
                description=f"Description for {project_name} - This project aims to improve manufacturing efficiency and quality.",
                start_date=start_date,
                end_date=end_date,
                project_status=choice(
                    [
                        Project.ProjectStatus.PLANNING,
                        Project.ProjectStatus.IN_PROGRESS,
                        Project.ProjectStatus.PLANNING,
                    ]
                ),
                project_manager=choice(managers),
            )

            print(f"✅ Created project: {project.name}")

            for j, task_template in enumerate(task_templates, 1):
                task_start = start_date + timedelta(days=j * 7)
                task_end = task_start + timedelta(days=randint(5, 14))

                task = Task.objects.create(
                    name=f"{project_name} - {task_template}",
                    description=f"{task_template} for {project_name}. This task involves detailed work on the {task_template.lower()} phase.",
                    project=project,
                    assigned_to=choice(operators),
                    start_date=task_start,
                    end_date=task_end,
                    status=choice(
                        [
                            Task.TaskStatus.PENDING,
                            Task.TaskStatus.IN_PROGRESS,
                            Task.TaskStatus.PENDING,
                        ]
                    ),
                )

                print(f"  ✅ Created task: {task.name}")

        print(
            f"\n🎉 Successfully created {Project.objects.count()} projects and {Task.objects.count()} tasks!"
        )

        print("\n📊 Summary:")
        print(f"Total Projects: {Project.objects.count()}")
        print(f"Total Tasks: {Task.objects.count()}")
        print(f"Total Managers: {User.objects.filter(role=User.Role.MANAGER).count()}")
        print(
            f"Total Operators: {User.objects.filter(role=User.Role.OPERATOR).count()}"
        )

        print("\n📈 Project Status Distribution:")
        for status, label in Project.ProjectStatus.choices:
            count = Project.objects.filter(project_status=status).count()
            print(f"  {label}: {count}")

        print("\n📈 Task Status Distribution:")
        for status, label in Task.TaskStatus.choices:
            count = Task.objects.filter(status=status).count()
            print(f"  {label}: {count}")
