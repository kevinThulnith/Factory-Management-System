from backend.consumers import ConsumerBlock


class ProjectConsumer(ConsumerBlock):
    group_name = "projects"


class TaskConsumer(ConsumerBlock):
    group_name = "tasks"
