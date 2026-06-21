#!/usr/bin/env bash
# Variables et helpers partagés — scripts exploitation K4
set -euo pipefail

ops_root() {
  cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd
}

# Charge un fichier .env (KEY=VALUE, valeurs avec espaces supportées)
ops_load_env() {
  local env_file="$1"
  local line key value
  if [[ ! -f "$env_file" ]]; then
    echo "FAIL: fichier env absent — $env_file" >&2
    exit 1
  fi
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      key="${BASH_REMATCH[1]}"
      value="${BASH_REMATCH[2]}"
      if [[ "$value" =~ ^\".*\"$ ]]; then
        value="${value:1:${#value}-2}"
      elif [[ "$value" =~ ^\'.*\'$ ]]; then
        value="${value:1:${#value}-2}"
      fi
      export "${key}=${value}"
    fi
  done < "$env_file"
}

ops_compose_cmd() {
  local root env_file compose_file
  root="$(ops_root)"
  env_file="${OPS_ENV_FILE:-.env.prod}"
  compose_file="${OPS_COMPOSE_FILE:-docker-compose.prod.yml}"
  cd "$root"
  echo "docker compose -f ${compose_file} --env-file ${env_file}"
}

ops_postgres_service() {
  echo "${OPS_POSTGRES_SERVICE:-postgres}"
}

ops_backup_dir() {
  echo "${OPS_BACKUP_DIR:-backup}"
}

ops_retention_days() {
  echo "${OPS_BACKUP_RETENTION_DAYS:-7}"
}

ops_health_url() {
  echo "${OPS_HEALTH_URL:-https://localhost/api/health}"
}
