#!/bin/bash
set -e
set -o pipefail
set -x
if [ $# == 0 ]; then
  read -p "page name: " name
else
  name="$1"
fi
echo "import JSX from '../jsx/jsx.js'

export function $name() {
  return <div id='$name page'>
    <h2>$name</h2>
  </div>
}
export default $name" > "server/app/pages/$name.tsx"
