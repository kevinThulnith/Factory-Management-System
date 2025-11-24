from backend.signals import create_model_change_signal
from .serializers import UserSerializer
from .models import User

user_signal = create_model_change_signal(User, UserSerializer, "users", "send_update")
