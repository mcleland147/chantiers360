#!/bin/sh
set -e

echo "[entrypoint] Prisma migrate deploy..."
npx prisma migrate deploy

echo "[entrypoint] Démarrage API..."
exec "$@"
