#!/bin/bash
set -e
set -o pipefail

source scripts/config

ssh "$user@$host" "
  set -e
  cd $root_dir/data
  sqlite3 db.sqlite3 '.backup backup.sqlite3'
"

rsync -SavlPz "$user@$host:$root_dir/data/backup.sqlite3" "data/"

cd data
ls -lh backup.sqlite3

read -p "Replace local db? (y/N): " ans
if [ "$ans" = "y" ]; then
  echo "Replacing local db..."
  sqlite3 backup.sqlite3 '.backup db.sqlite3'
else
  echo "Skipping local db replacement."
fi
