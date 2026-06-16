#!/bin/sh
set -e

# Apply migrations, retrying while the Postgres container becomes available.
n=0
until npx prisma migrate deploy; do
  n=$((n + 1))
  if [ "$n" -ge 10 ]; then
    echo "prisma migrate deploy failed after $n attempts"
    exit 1
  fi
  echo "Database not ready, retry $n/10..."
  sleep 3
done

exec node dist/main
