from backend.consumers import ConsumerBlock


class UserConsumer(ConsumerBlock):
    group_name = "users"
