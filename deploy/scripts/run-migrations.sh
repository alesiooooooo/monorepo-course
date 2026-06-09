#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-$(pwd)}"
ENVIRONMENT="${2:-learn-aws-dev}"

echo "No database migrations configured for ${ENVIRONMENT}. Skipping."
echo "Deploy root: ${ROOT_DIR}"
