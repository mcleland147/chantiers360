#!/usr/bin/env bash
# Génère .env.ci pour GitHub Actions / tests Docker locaux
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

cat > .env.ci <<'EOF'
NODE_ENV=production
POSTGRES_DB=chantiers360
POSTGRES_USER=chantiers360
POSTGRES_PASSWORD=ci-postgres-password-32chars-min
JWT_SECRET=ci-test-jwt-secret-minimum-32-characters-long
JWT_EXPIRES_IN=15m
CORS_ORIGIN=https://localhost
VITE_API_BASE_URL=/api
APP_DOMAIN=localhost
TLS_BLOCK=tls internal
CADDY_HTTP_PORT=80
CADDY_HTTPS_PORT=443
EOF

echo ".env.ci généré pour CI."
