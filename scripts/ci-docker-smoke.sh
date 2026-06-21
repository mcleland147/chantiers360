#!/usr/bin/env bash
# Smoke test Docker prod — CI / validation locale
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${CI_ENV_FILE:-.env.ci}"
COMPOSE="docker compose -f docker-compose.prod.yml --env-file ${ENV_FILE}"

if [[ ! -f "$ENV_FILE" ]]; then
  bash scripts/ci-prepare-env.sh
fi

echo "[ci-docker-smoke] Démarrage stack..."
$COMPOSE up -d

cleanup() {
  echo "[ci-docker-smoke] Arrêt stack..."
  $COMPOSE down -v --remove-orphans 2>/dev/null || true
}
trap cleanup EXIT

echo "[ci-docker-smoke] Attente healthchecks..."
deadline=$((SECONDS + 120))
while (( SECONDS < deadline )); do
  if $COMPOSE ps --status running 2>/dev/null | grep -q backend && \
     curl -kfsS https://127.0.0.1/api/health >/dev/null 2>&1; then
    break
  fi
  sleep 3
done

HEALTH=$(curl -kfsS https://127.0.0.1/api/health || true)
echo "$HEALTH" | grep -q '"status":"ok"' || {
  echo "FAIL: health check — $HEALTH"
  $COMPOSE ps
  $COMPOSE logs --tail 50 backend caddy
  exit 1
}

echo "[ci-docker-smoke] OK"
