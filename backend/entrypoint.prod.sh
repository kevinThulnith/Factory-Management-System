#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until python -c "
import os, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()
from django.db import connections
try:
    connections['default'].ensure_connection()
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; do
  echo "Database unavailable, retrying in 2s..."
  sleep 2
done
echo "Database is ready."

echo "Running collectstatic..."
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate --noinput

echo "Starting daphne..."
exec daphne -b 0.0.0.0 -p 8000 backend.asgi:application