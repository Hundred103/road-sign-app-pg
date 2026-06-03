#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-roadsigns.ftp.sh}"
EMAIL="${2:-mati1mich@gmail.com}"

export PUBLIC_DOMAIN="${DOMAIN}"
export ACME_EMAIL="${EMAIL}"

echo "Starting public reverse proxy for ${PUBLIC_DOMAIN} using ${ACME_EMAIL}"
echo "This will request a trusted Let's Encrypt certificate once DNS points to this host and ports 80/443 are reachable."

docker compose up -d reverse-proxy
