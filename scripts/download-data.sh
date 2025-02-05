#!/bin/bash
set -e
set -o pipefail

source scripts/config
rsync -SavlPz \
  --exclude '*.sqlite3*' \
  --exclude '*.tmp.*' \
  "$user@$host:$root_dir/data" \
  .
./scripts/download-db.sh
