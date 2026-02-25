from .consumers import (
    MaterialConsumer,
    SupplierConsumer,
    OrderConsumer,
    MaterialConsumptionConsumer,
)
from django.urls import re_path

# ! WebSocket URL patterns for inventory app

websocket_urlpatterns = [
    re_path(r"ws/materials/$", MaterialConsumer.as_asgi()),
    re_path(r"ws/suppliers/$", SupplierConsumer.as_asgi()),
    re_path(r"ws/orders/$", OrderConsumer.as_asgi()),
    re_path(r"ws/material-consumptions/$", MaterialConsumptionConsumer.as_asgi()),
]
