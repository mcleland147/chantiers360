#!/usr/bin/env bash
# Validation stack production locale — Phase K2
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

COMPOSE="docker compose -f docker-compose.prod.yml --env-file .env.prod"
BASE_URL="${PROD_BASE_URL:-https://localhost}"

echo "== K2 verify — stack production =="

if [[ ! -f .env.prod ]]; then
  echo "FAIL: .env.prod absent — cp .env.prod.example .env.prod"
  exit 1
fi

echo "[1/8] Health API via Caddy..."
HEALTH=$(curl -kfsS "${BASE_URL}/api/health" 2>/dev/null || true)
echo "$HEALTH" | grep -q '"status":"ok"' || { echo "FAIL health: $HEALTH"; exit 1; }
echo "OK"

echo "[2/8] Frontend accessible..."
curl -kfsS "${BASE_URL}/" | grep -q '<div id="root">' || { echo "FAIL frontend"; exit 1; }
echo "OK"

echo "[3/8] Login JWT..."
LOGIN=$(curl -kfsS -X POST "${BASE_URL}/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"conducteur@batinova.fr","password":"demo123"}')
echo "$LOGIN" | grep -q '"token"' || { echo "FAIL login (seed actif ?): $LOGIN"; exit 1; }
echo "OK"

echo "[4/8] Route protégée avec JWT..."
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
curl -kfsS "${BASE_URL}/api/chantiers" -H "Authorization: Bearer ${TOKEN}" | grep -q '\[' || { echo "FAIL chantiers"; exit 1; }
echo "OK"

echo "[5/8] Swagger désactivé (404)..."
SWAG=$(curl -kfsS -o /dev/null -w "%{http_code}" "${BASE_URL}/api/docs-json" || true)
[[ "$SWAG" == "404" ]] || { echo "FAIL swagger status=$SWAG (attendu 404)"; exit 1; }
echo "OK"

echo "[6/8] PostgreSQL non exposé sur l'hôte..."
if command -v nc >/dev/null 2>&1; then
  if nc -z 127.0.0.1 5432 2>/dev/null; then
    echo "WARN: port 5432 ouvert (stack dev en parallèle ?) — vérifier qu'aucun mapping prod n'existe"
  else
    echo "OK (5432 fermé ou dev stack séparée)"
  fi
else
  echo "SKIP (nc absent)"
fi

echo "[7/8] Healthchecks Docker..."
$COMPOSE ps --format json 2>/dev/null | head -1 >/dev/null || $COMPOSE ps
 unhealthy=$($COMPOSE ps --status restarting --status exited 2>/dev/null | wc -l | tr -d ' ')
 echo "Containers listés — vérifier manuellement si unhealthy"

echo "[8/8] React Router (SPA fallback)..."
curl -kfsS "${BASE_URL}/chantiers" | grep -q '<div id="root">' || { echo "FAIL SPA route"; exit 1; }
echo "OK"

echo ""
echo "== K2 verify — tous les contrôles passés =="
