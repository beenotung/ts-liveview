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

if [ -f "$file" ]; then
  echo >&2 "File already exist: $file"
  read -p "Overwrite? [y/N] " ans
  if [[ $ans != y* ]]; then
    echo >&2 "Cancelled."
    exit
  fi
fi

echo "import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'
import Style from '../components/style.js'
import { Context } from '../context.js'
import { mapArray } from '../components/fragment.js'

let style = Style(/* css */ \`
#$name {

}
\`)

let page = (
  <div id='$name'>
    {style}
    <h1>$Name</h1>
    <Main/>
  </div>
)

function Main(attrs: {}, context: Context) {
  let items = [1, 2, 3]
  return (
    <ul>
      {mapArray(items, item => (
        <li>item {item}</li>
      ))}
    </ul>
  )
}

function Submit() {
  return 'TODO'
}

let routes: Routes = {
  '/$name': {
    title: title('$Name'),
    description: 'TODO',
    menuText: '$Name',
    node: page,
  },
  '/$name/submit': {
    title: apiEndpointTitle,
    description: 'TODO',
    node: <Submit/>,
    streaming: false,
  },
}

export default { routes }" > "$file"

echo "saved to $file"
code "$file"

file="server/app/routes.tsx"
echo "import $Name from './pages/$name.js'" > "$file.tmp"
cat "$file" >> "$file.tmp"
mv "$file.tmp" "$file"
sed -i "s/let routeDict: Routes = {/let routeDict: Routes = {\n  ...$Name.routes,/" "$file"
echo "updated $file"
