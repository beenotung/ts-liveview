#!/bin/bash
set -e
set -o pipefail
set -x

function reset {
  branch=$1
  git checkout $branch
  git checkout origin/$branch
  git branch -D $branch
  git checkout -b $branch
}

reset master
reset v5-demo
reset v5-minimal-template
reset v5-auth-template
