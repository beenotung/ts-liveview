#!/bin/bash
set -e
set -o pipefail

hash code && code . || echo "code not in path, you need to open the IDE manually"

#install="slnpm"
install="pnpm i -r"
#install="yarn"
#install="npm i"

echo "running '$install' in $(pwd)"
$install

cd db
if [[ "$install" != *-r* ]]; then
  echo "running '$install' in $(pwd)"
  $install
fi
echo "migrating database"
npm run migrate

echo
echo "Ready to go!"
echo
echo "Run 'npm start' to start the development server"
echo
echo "Run 'npm run build' to build for production deployment"
echo "Run 'npm run production' to start server in production mode"
echo
