#!/bin/bash
set -e
set -o pipefail

source scripts/config

if [ -z "$MODE" ]; then
  echo "possible mode:"
  echo "  [f] first   (start new pm2 process)"
  echo "  [u] upload   (for static files updates)"
  echo "  [q] quick   (for UI-only updates)"
  echo "  [ ] default (install dependencies and run database migration)"
  read -p "mode: " MODE
fi
case "$MODE" in
  f)
    MODE="first"
    ;;
  u)
    MODE="upload"
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

if [ "$MODE" == "upload" ]; then
  rsync -SavLPz \
    public \
    "$user@$host:$root_dir"
elif [ "$MODE" == "quick" ]; then
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
    pm2 logs $pm2_name
  "
else
  npm run build
  rsync -SavLPz \
    server \
    client \
    public \
    template \
    build \
    dist \
    package.json \
    README.md \
    "$user@$host:$root_dir"
  if [ "$MODE" == "first" ]; then
    rebuild_cmd="pnpm rebuild"
    pm2_cmd="cd $root_dir && pm2 start --name $pm2_name dist/server/index.js"
  else
    rebuild_cmd=""
    pm2_cmd="pm2 reload $pm2_name"
  fi
  ssh "$user@$host" "
    set -e
    source ~/.nvm/nvm.sh
    set -x
    cd $root_dir
    mkdir -p data
    pnpm i -r
    $rebuild_cmd
    $pm2_cmd
    pm2 logs $pm2_name
  "
fi
