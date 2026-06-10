#!/usr/bin/env bash

set -euo pipefail

DEPLOY_DIR="${1:?deploy dir is required}"

for file in "$DEPLOY_DIR/.env.auth" "$DEPLOY_DIR/.env.orders" "$DEPLOY_DIR/.env.payments"; do
  if [ ! -f "$file" ]; then
    echo "Missing env file: $file" >&2
    exit 1
  fi

  chmod 600 "$file"
done
