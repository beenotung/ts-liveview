#!/bin/bash
set -e
set -o pipefail

source scripts/config

if [ -z "$MODE" ]; then
  echo "possible mode:"
  echo "  [f] first   (start new pm2 process)"
  echo "  [q] quick   (reload without database migration)"
  echo "  [ ] default (reload with database migration)"
  read -p "mode: " MODE
fi
case "$MODE" in
  f)
    MODE="first"
    ;;
  q)
    MODE="quick"
    ;;
  '')
    MODE="default"
    ;;
esac
echo "deploy mode: $MODE"

set -x

if [ "$MODE" == "quick" ]; then
  rsync -SavLPz \
    server \
    client \
    public \
    build \
    dist \
    "$user@$host:$root_dir"
  ssh "$user@$host" "
    set -e
    source ~/.nvm/nvm.sh
    pm2 reload $pm2_name
  "
else
  npm run build
  rsync -SavLPz \
    server \
    client \
    public \
    build \
    dist \
    package.json \
    README.md \
    "$user@$host:$root_dir"
  rsync -SavLPz \
    db/package.json \
    db/migrations \
    db/knexfile.ts \
    db/db.ts \
    db/proxy.ts \
    db/seed.ts \
    "$user@$host:$root_dir/db"
  if [ "$MODE" == "first" ]; then
    ssh "$user@$host" "
      set -e
      cd $root_dir
      mkdir -p data
    "
    pm2_cmd="cd $root_dir && pm2 start --name $pm2_name dist/server/index.js"
  else
    pm2_cmd="pm2 reload $pm2_name"
  fi
  ssh "$user@$host" "
    set -e
    source ~/.nvm/nvm.sh
    set -x
    cd $root_dir
    pnpm i -r
    cd db
    npm run migrate
    $pm2_cmd
  "
fi
