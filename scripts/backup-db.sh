#!/bin/bash
set -e
set -o pipefail

source scripts/config

ssh "$user@$host" "
  set -e
  cd $root_dir
	sqlite3 data/db.sqlite3 '.backup data/backup.sqlite3'
"

rsync -SavlPz "$user@$host:$root_dir/data/backup.sqlite3" "data/"

ls -lh data/backup.sqlite3
