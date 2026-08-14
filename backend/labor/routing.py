from .consumers import SkillMatrixConsumer, LaborAllocationConsumer
from django.urls import re_path

# !WebSocket routing for labor app

websocket_urlpatterns = [
    re_path(r"ws/skill-matrix/$", SkillMatrixConsumer.as_asgi()),
    re_path(r"ws/labor-allocation/$", LaborAllocationConsumer.as_asgi()),
]
