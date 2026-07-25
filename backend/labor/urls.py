from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LaborAllocationViewSet, SkillMatrixViewSet

router = DefaultRouter()
router.register(r"allocation", LaborAllocationViewSet, basename="labor-allocation")
router.register(r"skill-matrix", SkillMatrixViewSet, basename="skill-matrix")

urlpatterns = [path("", include(router.urls))]
