#!/bin/bash
## to sync the application code base with the cloned template
## you may change the path according to your preference
set -e
set -o pipefail

upstream_path="$HOME/workspace/github.com/beenotung/ts-liveview"

if [ $# == 1 ]; then
  compare_path="$1"
else
  read -p "directory/file to compare: " compare_path
fi

function clean_up {
  rm -rf \
    "$1/node_modules" \
    "$1/pnpm-lock.yaml" \
    "$1/build" \
    "$1/dist"
}

clean_root=0
clean_db=0

case "$compare_path" in
  .|./)
    clean_root=1
    clean_db=1
    ;;
  db|db/|./db|./db/)
    clean_db=1
    ;;
esac

if [ "$clean_root" == 1 ]; then
  clean_up .
  clean_up "$upstream_path"
fi

if [ "$clean_db" == 1 ]; then
  clean_up db
  clean_up "$upstream_path/db"
fi

meld "$upstream_path/$compare_path" "$compare_path"
