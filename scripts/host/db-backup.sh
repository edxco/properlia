#!/bin/bash
# Nightly pg_dump of the db container to S3. Credentials come from the instance role.
set -euo pipefail
umask 077

APP_DIR="${APP_DIR:-/home/ubuntu/properlia}"
ENV_FILE="${ENV_FILE:-.env.stage}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.stage.yml}"
BUCKET="${BACKUP_BUCKET:-proper-db-backups-stage-mx}"
REGION="${AWS_REGION:-mx-central-1}"

cd "$APP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
DUMP="$TMP/properlia-$STAMP.dump"

dc() { docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"; }

dc exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$DUMP"
dc exec -T db pg_restore -l < "$DUMP" > /dev/null

( cd "$TMP" && sha256sum "$(basename "$DUMP")" > "$(basename "$DUMP").sha256" )

aws s3 cp "$DUMP" "s3://$BUCKET/stage/$(basename "$DUMP")" --region "$REGION" --only-show-errors
aws s3 cp "$DUMP.sha256" "s3://$BUCKET/stage/$(basename "$DUMP").sha256" --region "$REGION" --only-show-errors

logger -t properlia-db-backup "uploaded $(basename "$DUMP") ($(stat -c %s "$DUMP") bytes) to s3://$BUCKET/stage/"
