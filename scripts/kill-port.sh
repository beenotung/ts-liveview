#!/bin/bash
set -e
set -o pipefail

## there is a optional variable PORT in .env file
source .env

## find the default port number in env.ts
default_port=$(grep -oE '\bPORT: [0-9]+\b' server/env.ts | awk '{print $2}')
port=${PORT:-${default_port}}

function ls-port {
  if [ $(uname) == "Darwin" ]; then
    netstat -vanp tcp | grep LISTEN | grep -E "\*\.\b$port\b" | awk '{print $9}' || true
  else
    netstat -lpn 2>/dev/null | grep -E ":::\b$port\b" | awk '{print $NF}' || true
  fi
}

ps=$(ls-port | awk -F '/' '{print $1}')

if [ -z "$ps" ]; then
  echo "no process is listening on port $port"
  exit 0
fi

for p in $ps; do
  echo "killing process pid $p (port $port)"
  kill $p
done
