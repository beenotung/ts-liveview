#!/bin/bash
set -e
set -o pipefail

result=$(ps | grep node | grep -v grep)
echo "$result"
echo "$result" | awk '{print $1}' | xargs -I {} kill -9 {}
