#!/bin/bash
set -euo pipefail

if [ $# == 0 ]; then
  read -p "file name: " name
elif [ $# == 1 ]; then
  name="$1"
else
  echo >&2 "Error: too many arguments"
  echo >&2 "Usage: $0 <file name>"
  exit 1
fi

if [ -d "./tasks" ]; then
  tasks_dir="./tasks"
elif [ -d "../tasks" ]; then
  tasks_dir="../tasks"
else
  tasks_dir="./tasks"
  mkdir "$tasks_dir"
fi

file="$tasks_dir/$name.md"

touch "$file"

# Add entry to _index.md
index_file="$tasks_dir/_index.md"
if [ ! -f "$index_file" ]; then
  echo "# Task Index" > "$index_file"
fi

if ! grep -q "$name.md" "$index_file"; then
  echo "- [placeholder: short desc](${name}.md)" >> "$index_file"
fi

./scripts/ide.sh "$file"
