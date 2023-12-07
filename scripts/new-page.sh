#!/bin/bash
set -e
set -o pipefail

if [ $# == 0 ]; then
  read -p "page name: " name
else
  name="$1"
fi

file="server/app/pages/$name.tsx"

if [ -f "$file" ]; then
  echo >&2 "File already exist: $file"
  read -p "Overwrite? [y/N] " ans
  if [[ $ans != y* ]]; then
    echo >&2 "Cancelled."
    exit
  fi
fi

echo "import { o } from '../jsx/jsx.js'

function $name() {
  return (
    <div id='$name'>
      <h1>$name</h1>
    </div>
  )
}

export default $name" > "$file"

echo "saved to $file"
code "$file"
