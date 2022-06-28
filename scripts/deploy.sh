#!/bin/bash
set -e
set -o pipefail

source scripts/config
npm run build
rsync -SavlP \
  build \
	dist \
	"$user@$host:$root_dir"
ssh "$user@$host" "source ~/.nvm/nvm.sh && pm2 reload $pm2_name"
