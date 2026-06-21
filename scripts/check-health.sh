#!/usr/bin/env bash
# Monitoring healthcheck — stack prod + endpoint /api/health
# Usage : ./scripts/check-health.sh
# Cron  : */5 * * * * cd /opt/chantiers360 && ./scripts/check-health.sh || mail -s "Chantiers360 DOWN" ops@example.com
# Codes : 0 = OK, 1 = service ou health KO, 2 = stack absente
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/ops-common.sh
source "$(dirname "$0")/ops-common.sh"

ENV_FILE="${OPS_ENV_FILE:-.env.prod}"
COMPOSE_FILE="${OPS_COMPOSE_FILE:-docker-compose.prod.yml}"
HEALTH_URL="$(ops_health_url)"
JSON_OUTPUT="${OPS_HEALTH_JSON:-0}"

COMPOSE="docker compose -f ${COMPOSE_FILE} --env-file ${ENV_FILE}"

timestamp_iso() {
  date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u +"%Y-%m-%dT%H:%M:%SZ"
}

report_fail() {
  local msg="$1"
  local code="${2:-1}"
  if [[ "$JSON_OUTPUT" == "1" ]]; then
    printf '{"status":"error","message":"%s","url":"%s","at":"%s"}\n' "$msg" "$HEALTH_URL" "$(timestamp_iso)"
  else
    echo "FAIL: $msg" >&2
  fi
  exit "$code"
}

report_ok() {
  local body="$1"
  if [[ "$JSON_OUTPUT" == "1" ]]; then
    printf '{"status":"ok","url":"%s","health":%s,"at":"%s"}\n' "$HEALTH_URL" "$body" "$(timestamp_iso)"
  else
    echo "OK: stack healthy — ${HEALTH_URL}"
    echo "$body"
  fi
  exit 0
}

if [[ ! -f "$ENV_FILE" ]]; then
  report_fail "fichier env absent ($ENV_FILE)" 2
fi

if [[ -z "$($COMPOSE ps --status running -q 2>/dev/null)" ]]; then
  report_fail "stack non démarrée" 2
fi

# Containers en erreur (exited, restarting, unhealthy)
bad_status=$($COMPOSE ps -a --format '{{.Name}} {{.Status}}' 2>/dev/null | grep -E 'unhealthy|Restarting|Exited \(1\)|Exited \(137\)' || true)
if [[ -n "$bad_status" ]]; then
  report_fail "containers en erreur — voir docker compose ps"
fi

HEALTH_BODY="$(curl -kfsS --max-time 10 "$HEALTH_URL" 2>/dev/null || true)"
if [[ -z "$HEALTH_BODY" ]]; then
  report_fail "endpoint health inaccessible — ${HEALTH_URL}"
fi

if ! echo "$HEALTH_BODY" | grep -q '"status":"ok"'; then
  report_fail "health invalide — ${HEALTH_BODY}"
fi

report_ok "$HEALTH_BODY"
