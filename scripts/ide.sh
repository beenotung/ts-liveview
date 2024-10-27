#!/bin/bash
set -e
set -o pipefail

if [ $# != 1 ]; then
  echo "Error: expected 1 argument, got $#"
  echo "Usage: $0 <directory or file>"
  exit 1
fi

target="$1"

ide=""
hash idea 2> /dev/null && ide="idea"
hash code 2> /dev/null && ide="code"
hash cursor 2> /dev/null && ide="cursor"

if [ -z "$ide" ]; then
  echo "Hint: no IDE found, you need to open $target manually"
else
  $ide "$target" &
fi
