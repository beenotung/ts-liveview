#!/bin/bash
set -e
set -o pipefail

source scripts/config
npm run build
if [ "$MODE" == "quick" ]; then
rsync -SavLPz \
  build \
  dist \
  "$user@$host:$root_dir"
ssh "$user@$host" " \
source ~/.nvm/nvm.sh \
&& pm2 reload $pm2_name \
"
else
rsync -SavLPz \
  build \
  dist \
  package.json \
  "$user@$host:$root_dir"
rsync -SavLPz \
  db/package.json \
  db/migrations \
  "$user@$host:$root_dir/db"
ssh "$user@$host" " \
source ~/.nvm/nvm.sh \
&& set -x \\
&& cd $root_dir \
&& pnpm i -r \
&& cd db \
&& npm run migrate \
&& pm2 reload $pm2_name \
"
fi
