#!/bin/bash
set -e
set -o pipefail

if [ ! -f localhost.pem ] || [ ! -f localhost-key.pem ]; then
  ./scripts/create-cert.sh
fi

#install="slnpm"
install="pnpm i --prefer-offline"
#install="yarn"
#install="npm i"

cd db
echo "running '$install' in $(pwd)"
$install
npm run migrate

cd ..
echo "running '$install' in $(pwd)"
$install

echo
echo "Ready to go!"
echo
echo "Run 'npm run dev' to start the development server"
echo
echo "Run 'npm run build' to build for production deployment"
echo "Run 'npm start' to start server in production mode"
echo
