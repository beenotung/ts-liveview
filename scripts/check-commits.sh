#!/bin/bash
set -e
set -o pipefail

function check_commit {
  commit="$1"
  out=$(git log -n 1 "$commit")
  hash=$(echo "$out" | grep -oP 'commit \K.*')
  date=$(echo "$out" | grep -oP 'Date: \K.*')
  echo "$hash | $date"
}

function check {
  name="$1"
  echo ""
  echo "== checking $name =="

  local=$(check_commit "$name")
  remote=$(check_commit "origin/$name")

  local_date=$(echo "$local" | awk -F '|' '{print $2}')
  remote_date=$(echo "$remote" | awk -F '|' '{print $2}')

  if [ "$local_date" == "$remote_date" ]; then
    echo "matched"
  else
    echo "$local"
    echo "$remote"
  fi
}

check master
check v5-demo
check v5-hybrid-template
check v5-web-template
check v5-ionic-template
check v5-auth-template
check v5-auth-web-template
check v5-auth-ionic-template
