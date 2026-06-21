#!/bin/sh
set -e

echo "[entrypoint] Prisma migrate deploy..."
npx prisma migrate deploy

echo "[entrypoint] Répertoire uploads..."
mkdir -p "${UPLOAD_DIR:-/data/uploads}"

echo "[entrypoint] Démarrage API..."
exec "$@"
