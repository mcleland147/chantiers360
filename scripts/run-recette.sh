#!/usr/bin/env bash
# Recette MOA assistée — stack réelle (PostgreSQL + API + frontend)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "[recette] Démarrage PostgreSQL (si nécessaire)…"
npm run dev:db

echo "[recette] Migrations + seed…"
npm run prisma:deploy --prefix backend
npm run prisma:seed --prefix backend

BACKEND_PID=""
cleanup() {
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "[recette] Arrêt backend (PID $BACKEND_PID)…"
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

if curl -sf "http://localhost:3000/api/health" >/dev/null 2>&1; then
  echo "[recette] Backend déjà actif sur :3000 — redémarrage pour code à jour…"
  pkill -f "nest start" 2>/dev/null || pkill -f "backend/dist/main" 2>/dev/null || true
  sleep 2
fi

if curl -sf "http://localhost:3000/api/health" >/dev/null 2>&1; then
  echo "[recette] Backend toujours actif (processus externe)"
else
  echo "[recette] Démarrage backend…"
  npm run start:dev --prefix backend &
  BACKEND_PID=$!
  for i in $(seq 1 60); do
    if curl -sf "http://localhost:3000/api/health" >/dev/null 2>&1; then
      echo "[recette] Backend prêt."
      break
    fi
    if [[ $i -eq 60 ]]; then
      echo "[recette] ERREUR : backend non joignable après 60s"
      exit 1
    fi
    sleep 1
  done
fi

echo "[recette] Exécution Playwright (tests/recette)…"
cd e2e
npx playwright test --config=playwright.recette.config.ts
PLAY_EXIT=$?

echo "[recette] Génération rapport…"
node "$ROOT/scripts/generate-recette-report.mjs" || true

exit $PLAY_EXIT
