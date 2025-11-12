from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
import logging
import time

logger = logging.getLogger(__name__)

# TODO: Show execution for API requests


class RequestTimeLoggingMiddleware:
    """
    Middleware to log the execution time of each request
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Record start time
        start_time = time.time()

        # Process the request
        response = self.get_response(request)

        # Calculate execution time
        execution_time = time.time() - start_time
        execution_time_ms = execution_time * 1000

        # Format execution time display
        if execution_time_ms > 999:
            time_display = f"{int(execution_time)}s"
        else:
            time_display = f"{execution_time_ms:.2f}ms"

        # Log the execution time
        logger.info(
            f"{request.method} {request.path} - Status: {response.status_code} - "
            f"⌛: {time_display}"
        )

        # Optionally add execution time to response headers
        response["X-Execution-Time"] = f"{execution_time:.4f}s"

        return response


@database_sync_to_async
def get_user(token_key):
    """
    Asynchronously get the user from the database given a token.
    """
    from django.contrib.auth.models import User, AnonymousUser

    try:
        # Validate the token
        token = AccessToken(token_key)
        # Get the user ID from the token payload
        user_id = token.get("user_id")
        # Fetch the user from the database
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, User.DoesNotExist):
        # If the token is invalid or the user doesn't exist, return an anonymous user
        return AnonymousUser()


class JWTAuthMiddleware:
    """
    Custom middleware for JWT authentication with WebSockets.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if token:
            scope["user"] = await get_user(token)
        else:
            from django.contrib.auth.models import AnonymousUser

            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)
