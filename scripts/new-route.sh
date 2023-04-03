#!/bin/bash
set -e
set -o pipefail

if [ $# == 0 ]; then
  read -p "page name: " name
else
  name="$1"
fi

Name=$(echo "$name" | sed 's/^\(.\)/\U\1/')

file="server/app/pages/$name.tsx"

echo "import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'

function $Name() {
  return <div id='$name'>
    <h2>$Name</h2>
  </div>
}

function submit() {
  return 'TODO'
}

let routes: Routes = {
  '/$name': {
    title: title('$Name'),
    description: 'TODO',
    menuText: '$Name',
    node: <$Name/>,
  },
  '/$name/submit': {
    title: apiEndpointTitle,
    description: 'TODO',
    node: [submit],
    streaming: false,
  },
}

export default { routes }" > "$file"

echo "saved to $file"
code "$file"
