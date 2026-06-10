#!/usr/bin/env bash

set -euo pipefail

DEPLOY_DIR="${1:?deploy dir is required}"
TARGET_ENV="${2:?target env is required}"
AWS_REGION="${AWS_REGION:?AWS_REGION is required}"

mkdir -p "$DEPLOY_DIR"

sync_service() {
  local service="$1"
  local output_file="$2"
  local path="/monorepo-course/${TARGET_ENV}/${service}/"
  local tmp_file

  tmp_file="$(mktemp)"

  aws ssm get-parameters-by-path \
    --region "$AWS_REGION" \
    --path "$path" \
    --with-decryption \
    --recursive \
    --query 'Parameters[*].[Name,Value]' \
    --output text > "$tmp_file"

  if [ ! -s "$tmp_file" ]; then
    echo "No SSM parameters found for $path" >&2
    rm -f "$tmp_file"
    exit 1
  fi

  awk '{
    n = split($1, parts, "/");
    key = parts[n];
    $1 = "";
    sub(/^\t/, "", $0);
    printf("%s=%s\n", key, $0);
  }' "$tmp_file" | sort > "$output_file"

  rm -f "$tmp_file"
}

sync_service "auth" "$DEPLOY_DIR/.env.auth"
sync_service "orders" "$DEPLOY_DIR/.env.orders"
sync_service "payments" "$DEPLOY_DIR/.env.payments"
