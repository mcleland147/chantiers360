#!/usr/bin/env bash
# Archive le volume uploads Chantiers360 (Release 1.1-A)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/ops-common.sh
source "$ROOT/scripts/ops-common.sh"

UPLOAD_DIR="${UPLOAD_DIR:-/data/uploads}"
BACKUP_DIR="${OPS_BACKUP_DIR:-$ROOT/backup}"
STAMP="$(date +%Y%m%d_%H%M%S)"
ARCHIVE="$BACKUP_DIR/uploads_${STAMP}.tar.gz"

ops_ensure_backup_dir

if [[ ! -d "$UPLOAD_DIR" ]]; then
  echo "[backup-uploads] Répertoire absent : $UPLOAD_DIR — rien à archiver."
  exit 0
fi

echo "[backup-uploads] Archive $UPLOAD_DIR → $ARCHIVE"
tar -czf "$ARCHIVE" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
sha256sum "$ARCHIVE" > "${ARCHIVE}.sha256"
echo "[backup-uploads] OK — $(du -h "$ARCHIVE" | cut -f1)"
