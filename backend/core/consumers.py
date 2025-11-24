from backend.consumers import ConsumerBlock


class DepartmentConsumer(ConsumerBlock):
    group_name = "departments"


class WorkShopConsumer(ConsumerBlock):
    group_name = "workshops"


class MachineConsumer(ConsumerBlock):
    group_name = "machines"
