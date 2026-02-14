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

./scripts/ide.sh "$file"
