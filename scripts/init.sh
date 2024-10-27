#!/bin/bash
set -e
set -o pipefail

./scripts/ide.sh .

install="npm i --legacy-peer-deps"
hash slnpm 2> /dev/null && install="slnpm"
hash yarn 2> /dev/null && install="yarn"
hash pnpm 2> /dev/null && install="pnpm i -r --prefer-offline"

echo "running '$install' in $(pwd)"
$install
if [[ "$install" == pnpm* ]]; then
  pnpm rebuild
fi

echo
echo "Ready to go!"
echo
echo "Run 'npm start' to start the development server"
echo
