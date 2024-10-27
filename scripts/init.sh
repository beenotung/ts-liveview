#!/bin/bash
set -e
set -o pipefail

hash code 2> /dev/null && code . || echo "code not in path, you need to open the IDE manually"

install="npm i --legacy-peer-deps"
hash slnpm 2> /dev/null && install="slnpm"
hash yarn 2> /dev/null && install="yarn"
hash pnpm 2> /dev/null && install="pnpm i -r --prefer-offline"

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
