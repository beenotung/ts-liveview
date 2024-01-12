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
    "$1/db" \
    "$1/build" \
    "$1/dist" \
}

clean_up .
clean_up "$upstream_path"

meld "$upstream_path/$compare_path" "$compare_path"
