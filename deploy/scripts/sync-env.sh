#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-$(pwd)}"
ENVIRONMENT="${2:-learn-aws-dev}"
PREFIX="/monorepo-course/${ENVIRONMENT}"
AWS_REGION="${AWS_REGION:-eu-central-1}"

write_service_env() {
  local service="$1"
  local target_file="$2"
  local path="${PREFIX}/${service}/"

  aws ssm get-parameters-by-path \
    --region "${AWS_REGION}" \
    --path "${path}" \
    --recursive \
    --with-decryption \
    --output json \
    --query 'Parameters[].{Name:Name,Value:Value}' \
    | jq -r '.[] | "\(.Name | split("/")[-1])=\(.Value)"' > "${target_file}"

  chmod 600 "${target_file}"
  echo "Synced ${target_file}"
}

mkdir -p "${ROOT_DIR}"
write_service_env "auth" "${ROOT_DIR}/.env.auth"
write_service_env "orders" "${ROOT_DIR}/.env.orders"
write_service_env "payments" "${ROOT_DIR}/.env.payments"
