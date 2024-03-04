#!/bin/bash
set -e
set -o pipefail

if [ $# == 0 ]; then
  read -p "component name: " name
else
  name="$1"
fi

Name=$(echo "$name" | sed 's/^\(.\)/\U\1/' | sed 's/-\(.\)/\U\1/g')
Title=$(echo "$name" | sed 's/^\(.\)/\U\1/' | sed 's/-\(.\)/ \U\1/g')

styleName="$Name""Style"

file="server/app/components/$name.tsx"

if [ -f "$file" ]; then
  echo >&2 "File already exist: $file"
  read -p "Overwrite? [y/N] " ans
  if [[ $ans != y* ]]; then
    echo >&2 "Cancelled."
    exit
  fi
fi

echo "import { o } from '../jsx/jsx.js'
import Style from './style.js'

export let $styleName = Style(/* css */ \`
.$name {

}
\`)

export function $Name() {
  return (
    <div class='$name'>
      {$styleName}
      $Title
    </div>
  )
}

export default $Name" > "$file"

echo "saved to $file"
code "$file"

if [ -d dist ]; then
  touch dist/__dev_restart__
fi
