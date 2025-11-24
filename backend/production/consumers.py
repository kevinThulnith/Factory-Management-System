from backend.consumers import ConsumerBlock


class ProductionLineConsumer(ConsumerBlock):
    group_name = "production_lines"


class ManufacturingProcessConsumer(ConsumerBlock):
    group_name = "manufacturing_processes"


class ProductionScheduleConsumer(ConsumerBlock):
    group_name = "production_schedules"
