#!/bin/bash
set -e
set -o pipefail

hash code && code . || echo "code not in path, you need to open the IDE manually"

#install="slnpm"
install="pnpm i --prefer-offline --no-optional"
#install="yarn"
#install="npm i"

cd db
echo "running '$install' in $(pwd)"
$install
if [[ "$install" == *no-optional* ]]; then
  $install
fi
npm run migrate

cd ..
echo "running '$install' in $(pwd)"
$install
if [[ "$install" == *no-optional* ]]; then
  $install
fi

echo
echo "Ready to go!"
echo
echo "Run 'npm start' to start the development server"
echo
echo "Run 'npm run build' to build for production deployment"
echo "Run 'npm run production' to start server in production mode"
echo
