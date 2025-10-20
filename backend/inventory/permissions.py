from core.permissions import PermissionBlock, SAFE_METHODS

# TODO: Create inventory model permissions


class BasePermissions(PermissionBlock):
    """
    Supplier | Material permissions:
    - Admins: Full CRUD access
    - Purchasing | Supervisors: Read-only access
    """

    def has_permission(self, request, view):
        if super().has_permission(request, view):
            return True

        if request.user.role == "ADMIN":
            return True

        if request.method in SAFE_METHODS:
            return request.user.role in ["PURCHASING", "SUPERVISOR"]

        return False

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class OrderPermission(PermissionBlock):
    """
    Order permissions:
    - Admins: Full CRUD access
    - Supervisors: Only create, update their own orders
    - Purchasing: Can view, update order status
    """

    PURCHASING_ALLOWED_FIELDS = {"status"}

    def has_permission(self, request, view):
        if super().has_permission(request, view):
            return True

        user = request.user

        if user.role == "SUPERVISOR":
            return request.method != "DELETE"

        if user.role == "PURCHASING":
            if request.method in SAFE_METHODS:
                return True

            if (
                request.method in ["PATCH", "PUT"]
                and hasattr(request, "data")
                and request.data
            ):
                request_fields = set(request.data.keys())
                return request_fields.issubset(self.PURCHASING_ALLOWED_FIELDS)

        return False

    def has_object_permission(self, request, view, obj):
        if super().has_object_permission(request, view, obj):
            return True

        user = request.user

        if user.role == "PURCHASING":
            return True

        if user.role == "SUPERVISOR":
            return obj.created_by == user

        return False


class OrderMaterialPermission(PermissionBlock):
    """
    OrderMaterial permissions:
    - Admins: Full CRUD access
    - Supervisors: Only Can manage materials for their orders
    - Purchasing: Read-only access
    """

    def has_permission(self, request, view):
        if super().has_permission(request, view):
            return True

        user = request.user

        if request.method in SAFE_METHODS:
            return user.role in ["PURCHASING", "SUPERVISOR"]

        if view.action in ["create", "update", "partial_update"]:
            return user.role == "SUPERVISOR"

        return False

    def has_object_permission(self, request, view, obj):
        if super().has_object_permission(request, view, obj):
            return True

        user = request.user

        if user.role == "PURCHASING":
            return True

        if user.role == "SUPERVISOR":
            if obj.order.created_by == user and request.method != "DELETE":
                return True

            if request.method in SAFE_METHODS:
                return True

            if request.method in ["PATCH", "PUT"]:
                allowed_fields = {"quantity", "price"}
                if request.data and all(
                    key in allowed_fields for key in request.data.keys()
                ):
                    return True

            return False

        return False
