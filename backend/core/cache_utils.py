import hashlib
from urllib.parse import urlencode

from django.core.cache import cache
from rest_framework.response import Response

TIMEOUT_SHORT = 60
TIMEOUT_LONG = 3600
TIMEOUT_MEDIUM = 300
TIMEOUT_FOREVER = None


def _normalize_items(items):
    normalized = []
    for key, value in items:
        normalized.append((str(key), str(value)))
    return normalized


def _query_items(query_params):
    if not query_params:
        return []

    items = []
    for key, values in sorted(query_params.lists()):
        for value in values:
            items.append((key, value))

    return _normalize_items(items)


def _extra_items(extra):
    if not extra:
        return []

    items = []
    for key, value in sorted(extra.items()):
        if isinstance(value, (list, tuple)):
            for item in value:
                items.append((key, item))
        else:
            items.append((key, value))

    return _normalize_items(items)


def build_params_hash(request, extra=None):
    query_items = _query_items(getattr(request, "query_params", None))
    extra_items = _extra_items(extra)

    if not query_items and not extra_items:
        return None

    encoded = urlencode(query_items + extra_items, doseq=True)
    return hashlib.md5(encoded.encode("utf-8")).hexdigest()


def _join_key(parts):
    return ":".join(str(part) for part in parts if part not in (None, ""))


def key_list(resource, scope=None, params_hash=None):
    return _join_key([resource, scope, "all", params_hash])


def key_detail(resource, pk, scope=None, params_hash=None):
    return _join_key([resource, scope, "detail", pk, params_hash])


def key_nested(resource, parent, parent_pk, scope=None, params_hash=None):
    return _join_key([resource, scope, parent, parent_pk, params_hash])


def key_user_perms(user_id):
    return _join_key(["user_perms", user_id])


def key_user_role(user_id):
    return _join_key(["user_role", user_id])


def invalidate_list(resource):
    cache.delete(key_list(resource))


def invalidate_detail(resource, pk):
    cache.delete(key_detail(resource, pk))


def invalidate_resource(resource, pk=None):
    if hasattr(cache, "delete_pattern"):
        cache.delete_pattern(f"{resource}:*")
        return

    invalidate_list(resource)
    if pk is not None:
        invalidate_detail(resource, pk)


def invalidate_user_perms(user_id):
    cache.delete_many([key_user_perms(user_id), key_user_role(user_id)])


def get_or_set(key, callable_, timeout=TIMEOUT_MEDIUM):
    return cache.get_or_set(key, callable_, timeout)


class RBACCacheMixin:
    cache_resource = None
    cache_timeout = TIMEOUT_MEDIUM
    cache_scope = "user"
    cache_list = True
    cache_detail = True

    def get_cache_scope(self, request):
        scope = self.cache_scope

        if callable(scope):
            return scope(request)

        if scope in (None, "global"):
            return None

        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return "anon"

        if scope == "role":
            return f"role:{user.role}"

        if scope == "department":
            department_id = user.department_id or "none"
            return f"dept:{department_id}"

        if scope == "user":
            return f"user:{user.pk}"

        return str(scope)

    def get_cache_extra(self, request, *args, **kwargs):
        extra = {key: value for key, value in self.kwargs.items() if key != "pk"}
        return extra or None

    def list(self, request, *args, **kwargs):
        if not self.cache_resource or not self.cache_list:
            return super().list(request, *args, **kwargs)

        scope = self.get_cache_scope(request)
        params_hash = build_params_hash(
            request, self.get_cache_extra(request, *args, **kwargs)
        )
        cache_key = key_list(self.cache_resource, scope=scope, params_hash=params_hash)

        def load_data():
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            return serializer.data

        data = get_or_set(cache_key, load_data, self.cache_timeout)
        return Response(data)

    def retrieve(self, request, *args, **kwargs):
        if not self.cache_resource or not self.cache_detail:
            return super().retrieve(request, *args, **kwargs)

        scope = self.get_cache_scope(request)
        params_hash = build_params_hash(
            request, self.get_cache_extra(request, *args, **kwargs)
        )
        cache_key = key_detail(
            self.cache_resource,
            kwargs.get("pk"),
            scope=scope,
            params_hash=params_hash,
        )

        def load_data():
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return serializer.data

        data = get_or_set(cache_key, load_data, self.cache_timeout)
        return Response(data)

    def perform_create(self, serializer):
        super().perform_create(serializer)
        if self.cache_resource:
            invalidate_resource(self.cache_resource)

    def perform_update(self, serializer):
        super().perform_update(serializer)
        if self.cache_resource:
            invalidate_resource(self.cache_resource)

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        if self.cache_resource:
            invalidate_resource(self.cache_resource)
