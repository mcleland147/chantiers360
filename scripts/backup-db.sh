#!/usr/bin/env bash
# Sauvegarde PostgreSQL — stack prod/REC (docker-compose.prod.yml)
# Usage : ./scripts/backup-db.sh
# Cron  : 0 2 * * * cd /opt/chantiers360 && ./scripts/backup-db.sh >> /var/log/chantiers360-backup.log 2>&1
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/ops-common.sh
source "$(dirname "$0")/ops-common.sh"

ENV_FILE="${OPS_ENV_FILE:-.env.prod}"
COMPOSE_FILE="${OPS_COMPOSE_FILE:-docker-compose.prod.yml}"
BACKUP_DIR="$(ops_backup_dir)"
RETENTION_DAYS="$(ops_retention_days)"
POSTGRES_SERVICE="$(ops_postgres_service)"

COMPOSE="docker compose -f ${COMPOSE_FILE} --env-file ${ENV_FILE}"

ops_load_env "$ENV_FILE"

: "${POSTGRES_DB:?POSTGRES_DB manquant dans $ENV_FILE}"
: "${POSTGRES_USER:?POSTGRES_USER manquant dans $ENV_FILE}"

mkdir -p "$BACKUP_DIR"

if ! $COMPOSE ps --status running 2>/dev/null | grep -q postgres; then
  echo "FAIL: service postgres non démarré — lancer la stack prod d'abord" >&2
  exit 1
fi

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/chantiers360_${TIMESTAMP}.sql.gz"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"

echo "[backup-db] Dump PostgreSQL → ${BACKUP_FILE}"
$COMPOSE exec -T "$POSTGRES_SERVICE" \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-acl \
  | gzip -9 > "$BACKUP_FILE"

if command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "$BACKUP_FILE" > "$CHECKSUM_FILE"
elif command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$BACKUP_FILE" > "$CHECKSUM_FILE"
fi

SIZE="$(wc -c < "$BACKUP_FILE" | tr -d ' ')"
echo "[backup-db] OK — ${SIZE} octets"

if [[ "$RETENTION_DAYS" =~ ^[0-9]+$ ]] && (( RETENTION_DAYS > 0 )); then
  echo "[backup-db] Purge backups > ${RETENTION_DAYS} jours"
  find "$BACKUP_DIR" -name 'chantiers360_*.sql.gz' -type f -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true
  find "$BACKUP_DIR" -name 'chantiers360_*.sql.gz.sha256' -type f -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true
fi

echo "[backup-db] Terminé"
