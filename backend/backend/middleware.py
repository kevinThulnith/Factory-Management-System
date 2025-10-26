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

        # Log the execution time
        logger.info(
            f"{request.method} {request.path} - Status: {response.status_code} - "
            f"⌛: {execution_time:.4f}s {execution_time * 1000:.2f}ms"
        )

        # Optionally add execution time to response headers
        response["X-Execution-Time"] = f"{execution_time:.4f}s"

        return response
