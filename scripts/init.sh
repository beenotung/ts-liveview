#!/bin/bash
set -e
set -o pipefail

hash code && code . || echo "code not in path, you need to open the IDE manually"

#install="slnpm"
install="pnpm i -r --prefer-offline"
#install="yarn"
#install="npm i --legacy-peer-deps"

echo "running '$install' in $(pwd)"
$install
if [[ "$install" == pnpm* ]]; then
  pnpm rebuild
fi

cd db
if [[ "$install" != *-r* ]]; then
  echo "running '$install' in $(pwd)"
  $install
elif [[ "$install" == pnpm* ]]; then
  pnpm rebuild
fi
echo "setup database"
npm run setup

echo
echo "Ready to go!"
echo
echo "Run 'npm start' to start the development server"
echo
