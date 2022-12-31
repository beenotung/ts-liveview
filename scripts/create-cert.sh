#!/bin/bash
## generate self-signed https cert for http2 server testing
set -e
set -o pipefail

function skipcert {
	echo "skipping self-signed https cert since mkcert is not installed"
	[ ! -f .env ] && cp .env .env.example
	sed -i '/HTTP_VERSION/d' .env
	echo "HTTP_VERSION=1" >.env
}

# openssl req -nodes -new -x509 -keyout server.key -out server.cert
mkcert -install && mkcert localhost || skipcert
