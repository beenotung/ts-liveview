#!/bin/bash
set -e
set -o pipefail

type="$(sed -nr 's/\s+layout_type: LayoutType\.(\w+).*/\1/p' server/config.ts)"
echo "page type: $type"

if [ $# == 0 ]; then
  read -p "page name: " name
else
  name="$1"
fi

Name=$(echo "$name" | sed 's/^\(.\)/\U\1/' | sed 's/-\(.\)/\U\1/g')
Title=$(echo "$name" | sed 's/^\(.\)/\U\1/' | sed 's/-\(.\)/ \U\1/g')

file="server/app/pages/$name.tsx"

if [ -f "$file" ]; then
  echo >&2 "File already exist: $file"
  read -p "Overwrite? [y/N] " ans
  if [[ $ans != y* ]]; then
    echo >&2 "Cancelled."
    exit
  fi
fi

if [ "$type" == "ionic" ]; then
  source ./scripts/route-template-ionic.sh
else
  source ./scripts/route-template-web.sh
fi

echo "import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'
import Style from '../components/style.js'
import { Context } from '../context.js'
import { mapArray } from '../components/fragment.js'
$template_import
let pageTitle = '$Title'

let style = Style(/* css */ \`
#$name {

}
\`)
$template_main
function Submit() {
  return 'TODO'
}

let routes: Routes = {
  '/$name': {
    title: title(pageTitle),
    description: 'TODO',
    menuText: pageTitle,
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
