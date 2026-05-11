#!/bin/sh

set -e

api_pid=""
web_pid=""
app_mode="${APP_MODE:-production}"

shutdown() {
  if [ -n "$api_pid" ]; then
    kill "$api_pid" 2>/dev/null || true
  fi

  if [ -n "$web_pid" ]; then
    kill "$web_pid" 2>/dev/null || true
  fi

  wait 2>/dev/null || true
}

trap shutdown INT TERM

cd /app/api

echo "Waiting for database..."
until python -c "import os, socket, sys; from urllib.parse import urlparse; parsed = urlparse(os.environ['DATABASE_URL']); host = parsed.hostname; port = parsed.port or 5432; sock = socket.create_connection((host, port), timeout=2); sock.close()"; do
  sleep 2
done

python -m alembic upgrade head

if [ "$app_mode" = "development" ]; then
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
else
  uvicorn app.main:app --host 127.0.0.1 --port 8000 &
fi
api_pid="$!"

cd /app/web
if [ "$app_mode" = "development" ]; then
  npm run dev -- --hostname 0.0.0.0 --port 3000 &
else
  node server.js &
fi
web_pid="$!"

while true; do
  if ! kill -0 "$api_pid" 2>/dev/null; then
    wait "$api_pid"
    exit $?
  fi

  if ! kill -0 "$web_pid" 2>/dev/null; then
    wait "$web_pid"
    exit $?
  fi

  sleep 2
done
