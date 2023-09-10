#!/bin/bash
set -e
set -o pipefail

source .env
[ -z "$PORT" ] && PORT=8100
IP="$(ifconfig | grep -oE '192.\d+.\d+.\d+' | grep -v 255)"
TO="http://$IP:$PORT"
echo "proxy to: $TO"
caddy reverse-proxy --to "$TO" --from "$IP" --internal-certs
