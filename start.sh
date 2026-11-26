#!/bin/sh
set -eu
node reflector.js --standalone --storage=none --no-loglatency &
reflector_pid=$!
node pictures-storage.cjs &
pictures_pid=$!
nginx -g 'daemon off;' &
web_pid=$!
trap 'kill "$reflector_pid" "$pictures_pid" "$web_pid" 2>/dev/null || true; wait || true; exit 0' TERM INT
while kill -0 "$reflector_pid" 2>/dev/null && kill -0 "$pictures_pid" 2>/dev/null && kill -0 "$web_pid" 2>/dev/null; do
  sleep 1
done
kill "$reflector_pid" "$pictures_pid" "$web_pid" 2>/dev/null || true
wait || true
exit 1
