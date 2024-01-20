#!/bin/bash
set -e
set -o pipefail

if [ $# == 0 ]; then
  read -p "page name: " name
else
  name="$@"
fi

# trim spaces
# replace spaces to hyphen (-)
# e.g. user-agents
name="$(echo "$name" | sed -r 's/^ +//g' | sed -r 's/ +$//g' | sed 's/ /-/g')"

# replace hyphen to space
# capitalize
# e.g. User Agents
title="$(node -p "'$name'.replace(/-/g,' ').replace(/(^| )\w/g,s=>s.toUpperCase())")"

# replace spaces
# e.g. UserAgents
id="$(echo "$title" | sed -r 's/ //g')"

# lowercase
# e.g. user-agents
url="$(echo "$name" | awk '{print tolower($0)}')"

file="server/app/pages/$url.tsx"

if [ -f "$file" ]; then
  echo >&2 "File already exist: $file"
  read -p "Overwrite? [y/N] " ans
  if [[ "$ans" != y* ]]; then
    echo >&2 "Cancelled."
    exit
  fi
fi

cat "server/app/pages/route-template.tsx" \
  | sed "s/__id__/$id/" \
  | sed "s/__title__/$title/" \
  | sed "s/__url__/$url/" \
  > "$file"

echo "saved to $file"
code "$file"

file="server/app/routes.tsx"
echo "import $id from './pages/$url.js'" > "$file.tmp"
cat "$file" >> "$file.tmp"
mv "$file.tmp" "$file"
sed -i '' "s/let routeDict: Routes = {/let routeDict: Routes = {\n  ...$id.routes,/" "$file"
echo "updated $file"
