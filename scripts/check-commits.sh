#!/bin/bash
set -e
set -o pipefail

function check_commit {
  commit="$1"
  out=$(git log -n 1 "$commit")
  hash=$(echo "$out" | sed -n 's/^commit //p')
  date=$(echo "$out" | sed -n 's/^Date: //p')
  echo "$hash | $date"
}

matched=()
mismatched=()
function check {
  name="$1"

  local=$(check_commit "$name")
  remote=$(check_commit "origin/$name")

  local_date=$(echo "$local" | awk -F '|' '{print $2}')
  remote_date=$(echo "$remote" | awk -F '|' '{print $2}')

  if [ "$local_date" == "$remote_date" ]; then
    matched+=("$name")
  else
    mismatched+=("$name")
    echo "mismatch: $name"
    echo "$local"
    echo "$remote"
    echo ""
  fi
}

check v5-hybrid-template
check v5-minimal-template
check v5-minimal-without-db-template
check v5-web-template
check v5-ionic-template
check v5-auth-template
check v5-auth-web-template
check v5-auth-ionic-template

echo "matched branches: ${matched[@]}"

if [ ${#mismatched[@]} -eq 0 ]; then
  echo "all branches are matching."
else
  echo "${#mismatched[@]} branches are not matching."
  exit 1
fi
