#!/usr/bin/env bash
# Root's daily job. Credentials stay on the host, outside the app's env.
set -euo pipefail
umask 077
BASE=${DATABASE_BACKUP_HOME:-/opt/temestudo}
set -a
source "$BASE/database-backup.env"
set +a
: "${DATABASE_BACKUP_BUCKET:?}" "${DATABASE_BACKUP_ENDPOINT:?}" "${DATABASE_BACKUP_KEY:?}"
exec 8>"$BASE/database-backup.lock"
flock -n 8 || exit 1
IMAGE="temestudo-app:sha-$(cat "$BASE/no-ar")"
OBJECT="s3://$DATABASE_BACKUP_BUCKET/database/$(date -u +%Y-%m-%dT%H-%M-%S)-$(cat /proc/sys/kernel/random/uuid).sqlite.enc"
# Stage the encrypted file before upload: a failed snapshot never publishes
# a truncated object. No plaintext leaves the maintenance container.
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
docker run --rm --read-only --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges \
  --env-file "$BASE/database-backup.env" -v "${DATABASE_VOLUME:-temestudo-data}:/data" \
  "$IMAGE" node scripts/database-maintenance.ts backup /data/app.sqlite > "$WORK/backup.enc"
aws --endpoint-url "$DATABASE_BACKUP_ENDPOINT" s3 cp "$WORK/backup.enc" "$OBJECT" --only-show-errors
echo "Database backup uploaded: $OBJECT"
