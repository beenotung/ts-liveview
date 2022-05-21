#!/bin/bash
## generate self-signed https cert for http2 server testing
set -e
set -o pipefail
openssl req  -nodes -new -x509  -keyout server.key -out server.cert
