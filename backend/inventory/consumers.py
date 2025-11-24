from backend.consumers import ConsumerBlock


class MaterialConsumer(ConsumerBlock):
    group_name = "materials"


class SupplierConsumer(ConsumerBlock):
    group_name = "suppliers"


class OrderConsumer(ConsumerBlock):
    group_name = "orders"
