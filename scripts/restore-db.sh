#!/usr/bin/env bash
# Restauration PostgreSQL depuis un dump gzip (pg_dump)
# Usage : ./scripts/restore-db.sh backup/chantiers360_YYYYMMDD_HHMMSS.sql.gz
#         OPS_FORCE=1 ./scripts/restore-db.sh backup/latest.sql.gz
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/ops-common.sh
source "$(dirname "$0")/ops-common.sh"

ENV_FILE="${OPS_ENV_FILE:-.env.prod}"
COMPOSE_FILE="${OPS_COMPOSE_FILE:-docker-compose.prod.yml}"
POSTGRES_SERVICE="$(ops_postgres_service)"
HEALTH_URL="$(ops_health_url)"

COMPOSE="docker compose -f ${COMPOSE_FILE} --env-file ${ENV_FILE}"

usage() {
  echo "Usage: $0 <fichier_backup.sql.gz>" >&2
  echo "Variables: OPS_ENV_FILE, OPS_COMPOSE_FILE, OPS_FORCE=1 (sans confirmation)" >&2
  exit 1
}

[[ $# -ge 1 ]] || usage
BACKUP_FILE="$1"

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "FAIL: backup introuvable — $BACKUP_FILE" >&2
  exit 1
fi

ops_load_env "$ENV_FILE"

: "${POSTGRES_DB:?POSTGRES_DB manquant}"
: "${POSTGRES_USER:?POSTGRES_USER manquant}"

if [[ "${OPS_FORCE:-}" != "1" ]]; then
  echo "⚠️  Restauration destructive sur la base « ${POSTGRES_DB} »"
  echo "    Fichier : ${BACKUP_FILE}"
  read -r -p "Confirmer (tapez RESTORE) : " confirm
  [[ "$confirm" == "RESTORE" ]] || { echo "Annulé."; exit 1; }
fi

if [[ -z "$($COMPOSE ps --status running -q 2>/dev/null)" ]] || \
   ! $COMPOSE ps --status running 2>/dev/null | grep -q "${POSTGRES_SERVICE}"; then
  echo "FAIL: postgres non démarré" >&2
  exit 1
fi

echo "[restore-db] Arrêt backend (éviter écritures concurrentes)..."
$COMPOSE stop backend 2>/dev/null || true

echo "[restore-db] Fermeture connexions actives..."
$COMPOSE exec -T "$POSTGRES_SERVICE" psql -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 <<SQL
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '${POSTGRES_DB}' AND pid <> pg_backend_pid();
SQL

echo "[restore-db] Recréation base vide..."
$COMPOSE exec -T "$POSTGRES_SERVICE" psql -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 <<SQL
DROP DATABASE IF EXISTS "${POSTGRES_DB}";
CREATE DATABASE "${POSTGRES_DB}";
SQL

echo "[restore-db] Import dump..."
gunzip -c "$BACKUP_FILE" | $COMPOSE exec -T "$POSTGRES_SERVICE" \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1

echo "[restore-db] Redémarrage backend..."
$COMPOSE up -d backend

echo "[restore-db] Attente health API..."
deadline=$((SECONDS + 120))
while (( SECONDS < deadline )); do
  if curl -kfsS "$HEALTH_URL" 2>/dev/null | grep -q '"status":"ok"'; then
    echo "[restore-db] OK — ${HEALTH_URL}"
    exit 0
  fi
  sleep 3
done

echo "FAIL: health check timeout — ${HEALTH_URL}" >&2
$COMPOSE logs --tail 30 backend
exit 1
