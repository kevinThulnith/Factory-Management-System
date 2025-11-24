from django.db.models.signals import post_save, post_delete
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.dispatch import receiver


class DummyRequest:
    """Dummy request object for serializer context"""

    def build_absolute_uri(self, location):
        return location


def create_model_change_signal(model, serializer_class, group_name, event_type):
    """
    Factory function to create signal handlers for model changes.
    """

    @receiver([post_save, post_delete], sender=model)
    def model_change_handler(sender, instance, **kwargs):
        if "created" in kwargs:
            action = "created" if kwargs["created"] else "updated"
        else:
            action = "deleted"

        serializer = serializer_class(instance, context={"request": DummyRequest()})
        payload = {"action": action, "data": serializer.data}
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            group_name, {"type": event_type, "payload": payload}
        )

    return model_change_handler
