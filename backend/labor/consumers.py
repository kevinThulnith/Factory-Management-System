from backend.consumers import ConsumerBlock


class SkillMatrixConsumer(ConsumerBlock):
    group_name = "skill_matrices"


class LaborAllocationConsumer(ConsumerBlock):
    group_name = "labor_allocations"
