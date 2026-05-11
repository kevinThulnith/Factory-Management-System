from core.cache_utils import RBACCacheMixin, TIMEOUT_MEDIUM, TIMEOUT_SHORT
from .permissions import LaborAllocationPermission, SkillMatrixPermission
from .serializers import LaborAllocationSerializer, SkillMatrixSerializer
from .models import LaborAllocation, SkillMatrix
from rest_framework.viewsets import ModelViewSet
from django.db.models import Q

# TODO: Create labor views


class LaborAllocationViewset(RBACCacheMixin, ModelViewSet):
    """
    LaborAllocation View
    - Admins: Full CRUD Access
    - Managers: labor allocations related to their projects
    - Operators: Read-only access to their own labor allocations
    - Supervisors: Read-only access to all labor allocations managed by managers in own department
    """

    serializer_class = LaborAllocationSerializer
    permission_classes = [LaborAllocationPermission]
    cache_resource = "labor_allocation"
    cache_timeout = TIMEOUT_SHORT
    cache_scope = "user"

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return LaborAllocation.objects.all()

        if user.role == "MANAGER":
            return LaborAllocation.objects.filter(
                Q(project__project_manager=user)
                | Q(task__project__project_manager=user)
            )

        elif user.role == "OPERATOR":
            return LaborAllocation.objects.filter(employee=user)

        elif user.role == "SUPERVISOR":
            return LaborAllocation.objects.filter(
                Q(project__project_manager__department=user.department)
                | Q(task__project__project_manager__department=user.department)
            )

        return LaborAllocation.objects.none()


class SkillMatrixViewset(RBACCacheMixin, ModelViewSet):
    """
    SkillMatrix View
    - Admins: Full CRUD Access
    - Supervisors: Full CRUD Access to skill matrices of employees in their department
    - Other users: Read-only access to their own skill matrix
    """

    serializer_class = SkillMatrixSerializer
    permission_classes = [SkillMatrixPermission]
    cache_resource = "skill_matrix"
    cache_timeout = TIMEOUT_MEDIUM
    cache_scope = "user"

    def get_queryset(self):
        user = self.request.user

        if user.role == "ADMIN":
            return SkillMatrix.objects.all()

        elif user.role == "SUPERVISOR":
            return SkillMatrix.objects.filter(employee__department=user.department)

        elif user.role not in ["SUPERVISOR", "ADMIN"]:
            return SkillMatrix.objects.filter(employee=user)

        return SkillMatrix.objects.none()
