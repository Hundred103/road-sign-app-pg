#!/usr/bin/env bash
set -euo pipefail

# Demo helper for configuring Caddy + Let's Encrypt.
# Usage:
#   ./scripts/setup-proxy.sh [domain] [email] [staging]
# Example:
#   ./scripts/setup-proxy.sh roadsigns.ftp.sh mati1mich@gmail.com false

DOMAIN="${1:-roadsigns.ftp.sh}"
EMAIL="${2:-mati1mich@gmail.com}"
STAGING="${3:-false}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CADDYFILE_PATH="$ROOT_DIR/proxy/Caddyfile"

mkdir -p "$ROOT_DIR/proxy"

if [[ "$STAGING" == "true" ]]; then
  ACME_BLOCK="    acme_ca https://acme-staging-v02.api.letsencrypt.org/directory"
else
  ACME_BLOCK=""
fi

cat > "$CADDYFILE_PATH" <<EOF
{
    email $EMAIL
$ACME_BLOCK
}

# Public domain with Let's Encrypt
$DOMAIN {
    encode gzip zstd
    reverse_proxy frontend:80
}

# Local fallback (no TLS)
localhost, 127.0.0.1 {
    encode gzip zstd
    reverse_proxy frontend:80
}
EOF

echo "[proxy] Generated $CADDYFILE_PATH"
echo "[proxy] Domain: $DOMAIN"
echo "[proxy] Email:  $EMAIL"
echo "[proxy] Staging ACME: $STAGING"

echo "[proxy] Starting frontend + proxy services..."
cd "$ROOT_DIR"
docker compose up -d frontend proxy

echo "[proxy] Done. DNS for $DOMAIN must point to this host public IP."
