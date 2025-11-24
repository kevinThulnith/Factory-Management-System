from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/production-lines/$", consumers.ProductionLineConsumer.as_asgi()),
    re_path(
        r"ws/production-schedules/$", consumers.ProductionScheduleConsumer.as_asgi()
    ),
    re_path(
        r"ws/manufacturing-processes/$",
        consumers.ManufacturingProcessConsumer.as_asgi(),
    ),
]
