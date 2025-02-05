#!/bin/bash
set -e
set -o pipefail

source scripts/config

ssh "$user@$host" "
  set -e
  cd $root_dir/data
  ls -lh db.sqlite3
  sqlite3 db.sqlite3 '.dump' | zstd > dump.sql.zst
"

rsync -SavLP "$user@$host:$root_dir/data/dump.sql.zst" "data/"

rm -f data/remote.sqlite3
zstd -d -c data/dump.sql.zst | sqlite3 data/remote.sqlite3

ls -lh data/remote.sqlite3

read -p "Replace local db? (y/N): " ans
if [ "$ans" = "y" ]; then
  echo "Replacing local db..."
  sqlite3 data/remote.sqlite3 '.backup data/db.sqlite3'
else
  echo "Skipping local db replacement."
fi
