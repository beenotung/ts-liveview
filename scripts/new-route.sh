#!/bin/bash
set -e
set -o pipefail

if [ $# == 0 ]; then
  read -p "page name: " name
else
  name="$@"
  echo "page name: $name"
fi

read -p "template [hybrid/web/ionic]: " template
template_file="server/app/pages/route-template-$template.tsx"
if [ ! -f "$template_file" ]; then
  echo >&2 "Template file not found: $template_file"
  exit 1
fi

# trim spaces
# replace hyphen to space
# e.g. user agents
name="$(echo "$name" | sed 's/-/ /g' | sed -r 's/^ +//g' | sed -r 's/ +$//g')"

# capitalize
# e.g. User Agents
title="$(node -p "'$name'.replace(/-/g,' ').replace(/(^| )\w/g,s=>s.toUpperCase())")"

# remove spaces
# e.g. UserAgents
id="$(echo "$title" | sed -r 's/ //g')"

# lowercase
# replace spaces to hyphen
# e.g. user-agents
url="$(echo "$name" | awk '{print tolower($0)}' | sed 's/ /-/g')"

file="server/app/pages/$url.tsx"

if [ -f "$file" ]; then
  echo >&2 "File already exist: $file"
  read -p "Overwrite? [y/N] " ans
  if [[ "$ans" != y* ]]; then
    echo >&2 "Cancelled."
    exit
  fi
fi

cat "$template_file" \
  | sed "s/__id__/$id/" \
  | sed "s/__title__/$title/g" \
  | sed "s/__name__/$name/" \
  | sed "s/__url__/$url/" \
  > "$file"

echo "saved to $file"
./scripts/ide.sh "$file"

if [ -d dist ]; then
  touch dist/__dev_restart__
fi

file="server/app/routes.tsx"
echo "import $id from './pages/$url.js'" > "$file.tmp"
cat "$file" >> "$file.tmp"
mv "$file.tmp" "$file"
if [[ "$(uname)" == "Darwin" ]]; then
  sed -i '' "s/let routeDict = {/let routeDict = {\n  ...$id.routes,/" "$file"
else
  sed -i "s/let routeDict = {/let routeDict = {\n  ...$id.routes,/" "$file"
fi
echo "updated $file"
