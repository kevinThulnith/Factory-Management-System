from rest_framework.permissions import BasePermission, SAFE_METHODS

# TODO: Create core model permissions


class PermissionBlock(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role == "ADMIN":
            return True

        return False

    def has_object_permission(self, request, view, obj):
        if request.user.role == "ADMIN":
            return True

        return False


class DepartmentPermissions(PermissionBlock):
    """
    Custom permissions for Department API:
    - Admins: Full CRUD.
    - Supervisors: Read-only access to their departments.
    """

    def has_permission(self, request, view):
        if super().has_permission(request, view):
            return True

        if request.method in SAFE_METHODS:
            return request.user.role == "SUPERVISOR"

        return False

    def has_object_permission(self, request, view, obj):
        if super().has_object_permission(request, view, obj):
            return True

        if request.user.role == "SUPERVISOR":
            return obj.supervisor == request.user

        return False


class WorkshopPermissions(PermissionBlock):
    """
    Custom permissions for Workshop API:
    - Admins: Full CRUD.
    - Supervisors: Update 'manager', 'operational_status' in their departments.
    - Managers: Update 'operational_status' in their workshops.
    """

    SUPERVISOR_ALLOWED_FIELDS = {"manager", "operational_status"}
    MANAGER_ALLOWED_FIELDS = {"operational_status"}

    def has_permission(self, request, view):
        # Check admin access first
        if super().has_permission(request, view):
            return True

        user = request.user

        if request.method in SAFE_METHODS:
            return user.role in ["SUPERVISOR", "MANAGER"]

        if (
            request.method in ["PATCH", "PUT"]
            and hasattr(request, "data")
            and request.data
        ):
            request_fields = set(request.data.keys())

            if user.role == "SUPERVISOR":
                return request_fields.issubset(self.SUPERVISOR_ALLOWED_FIELDS)

            if user.role == "MANAGER":
                return request_fields.issubset(self.MANAGER_ALLOWED_FIELDS)

        return False

    def has_object_permission(self, request, view, obj):
        if super().has_object_permission(request, view, obj):
            return True

        user = request.user

        if user.role == "SUPERVISOR":
            return obj.department == user.department

        if user.role == "MANAGER":
            return obj.manager == user

        return False


class MachinePermissions(PermissionBlock):
    """
    Custom permissions for Machine API:
    - Admins: Full CRUD.
    - Supervisors: Update 'operator', 'status' in their departments.
    - Managers: Update 'operator', 'status' in their workshops.
    - Technicians: Update 'status', 'last_maintenance_date', 'next_maintenance_date'.
    - Operators: Read-only access to machines in their own department.
    """

    SUPERVISOR_MANAGER_ALLOWED_FIELDS = {"operator", "status"}
    TECHNICIAN_ALLOWED_FIELDS = {
        "status",
        "last_maintenance_date",
        "next_maintenance_date",
    }

    def has_permission(self, request, view):
        # Check admin access first
        if super().has_permission(request, view):
            return True

        user = request.user

        if request.method in SAFE_METHODS:
            return user.role in ["SUPERVISOR", "MANAGER", "TECHNICIAN", "OPERATOR"]

        if (
            request.method in ["PATCH", "PUT"]
            and hasattr(request, "data")
            and request.data
        ):
            request_fields = set(request.data.keys())

            if user.role in ["SUPERVISOR", "MANAGER"]:
                return request_fields.issubset(self.SUPERVISOR_MANAGER_ALLOWED_FIELDS)

            if user.role == "TECHNICIAN":
                return request_fields.issubset(self.TECHNICIAN_ALLOWED_FIELDS)

        return False

    def has_object_permission(self, request, view, obj):
        if super().has_object_permission(request, view, obj):
            return True

        user = request.user

        if user.role == "TECHNICIAN":
            return True

        if user.role in ["SUPERVISOR", "OPERATOR"]:
            return obj.workshop.department == user.department

        if user.role == "MANAGER":
            return obj.workshop.manager == user

        return False


class MachineOperatorAssignmentPermissions(PermissionBlock):
    """
    Custom permissions for MachineOperatorAssignment API:
    - Admins: Full CRUD.
    - Supervisors: Read-only access to machines in their departments.
    - Managers: Read-only access to machines in their workshops.
    - Operators: Read-only access to their own assignments.
    """

    def has_permission(self, request, view):
        if super().has_permission(request, view):
            return True

        user = request.user

        if request.method in SAFE_METHODS:
            return user.role in ["SUPERVISOR", "MANAGER", "OPERATOR"]

        return False

    def has_object_permission(self, request, view, obj):
        if super().has_object_permission(request, view, obj):
            return True

        user = request.user

        if user.role == "SUPERVISOR":
            return obj.machine.workshop.department == user.department

        if user.role == "MANAGER":
            return obj.machine.workshop.manager == user

        if user.role == "OPERATOR":
            return obj.operator == user

        return False
