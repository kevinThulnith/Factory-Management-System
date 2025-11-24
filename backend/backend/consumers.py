from channels.generic.websocket import AsyncWebsocketConsumer
import json


class ConsumerBlock(AsyncWebsocketConsumer):
    """Base consumer class for creating specific WebSocket consumers"""

    group_name = None  # Must be set by subclasses

    async def connect(self):
        user = self.scope["user"]

        if not user.is_authenticated:
            await self.close()
            return

        if not self.group_name:
            raise ValueError("group_name must be set in the subclass")

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send(
            text_data=json.dumps(
                {
                    "type": "connection_established",
                    "message": f"You are now connected to the live {self.group_name} feed.",
                }
            )
        )

    async def disconnect(self, close_code):
        if self.group_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        """Handle incoming WebSocket messages - override in subclasses if needed"""
        pass

    async def send_update(self, event):
        """Send updates to WebSocket - can be overridden in subclasses"""
        payload = event["payload"]
        await self.send(text_data=json.dumps(payload))
