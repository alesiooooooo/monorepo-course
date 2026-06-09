#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-$(pwd)}"

for service in auth orders payments; do
  file="${ROOT_DIR}/.env.${service}"
  if [ ! -f "${file}" ]; then
    echo "Missing env file ${file}" >&2
    exit 1
  fi
  chmod 600 "${file}"
done

echo "Environment files are ready in ${ROOT_DIR}"
