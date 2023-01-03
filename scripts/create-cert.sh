#!/bin/bash
## generate self-signed https cert for http2 server testing
set -e
set -o pipefail

[ ! -f .env ] && cp .env.example .env

sed -i.bk '/HTTP_VERSION/d' .env

function usecert {
	echo "enabling http2 with self-signed https cert"
	echo "HTTP_VERSION=2" >>.env
}

function skipcert {
	echo "skipping self-signed https cert since mkcert is not installed"
	echo "HTTP_VERSION=1" >>.env
}

# openssl req -nodes -new -x509 -keyout server.key -out server.cert
mkcert -install && mkcert localhost && usecert || skipcert

rm .env.bk
