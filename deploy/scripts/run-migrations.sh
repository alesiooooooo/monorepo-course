#!/usr/bin/env bash

set -euo pipefail

DEPLOY_DIR="${1:?deploy dir is required}"
TARGET_ENV="${2:?target env is required}"

echo "No migrations configured for $TARGET_ENV"
