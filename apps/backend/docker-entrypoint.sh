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

# Seed on first boot only. The seed self-guards: with no flag it becomes a no-op
# when the database already has data, so redeploys never wipe production. A
# destructive wipe+reseed only happens when a developer runs `npm run db:seed`
# (which passes --force) explicitly — e.g. via the platform's run-command/exec.
# Kept non-fatal so a seed hiccup can't block the app from starting.
npx tsx prisma/seed.ts || echo "⚠️  seed step skipped/failed — continuing startup"

exec node dist/main
