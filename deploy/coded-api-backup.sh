#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/vrtxomega/apps/coded-api}"
BACKUP_DIR="${BACKUP_DIR:-/home/vrtxomega/backups/coded-api}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
ARCHIVE="$BACKUP_DIR/coded-api-$STAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

tar -czf "$ARCHIVE" \
  -C "$APP_DIR" \
  data/coded.sqlite \
  admin-token.txt \
  -C /home/vrtxomega/.config/systemd/user \
  coded-api.service \
  coded-api.service.d/secrets.conf

chmod 600 "$ARCHIVE"
find "$BACKUP_DIR" -type f -name 'coded-api-*.tar.gz' -mtime +14 -delete

printf 'Created %s\n' "$ARCHIVE"
