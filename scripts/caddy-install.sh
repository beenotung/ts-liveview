#!/bin/bash
## more see https://caddyserver.com/docs/install
set -e
set -o pipefail
curl -sS https://webi.sh/caddy | sh
