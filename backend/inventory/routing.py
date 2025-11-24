from django.urls import re_path
from .consumers import MaterialConsumer, SupplierConsumer, OrderConsumer

websocket_urlpatterns = [
    re_path(r"ws/materials/$", MaterialConsumer.as_asgi()),
    re_path(r"ws/suppliers/$", SupplierConsumer.as_asgi()),
    re_path(r"ws/orders/$", OrderConsumer.as_asgi()),
]
