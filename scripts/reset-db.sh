#!/bin/bash
set -euo pipefail

if [ -d data ]; then
  cd data
elif [ -d ../data ]; then
  cd ../data
else
  echo "data directory not found"
  exit 1
fi

sqlite3 remote.sqlite3 '.backup db.sqlite3'
