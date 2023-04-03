#!/usr/bin/bash
set -e
set -o pipefail
set -x

git checkout v5-demo

git branch -D v5-minimal-template
git checkout -b v5-minimal-template
git cherry-pick origin/v5-minimal-template

git branch -D v5-auth-template
git checkout -b v5-auth-template
git cherry-pick origin/v5-minimal-template..origin/v5-auth-template

echo finished cherry-pick.

echo -n 'continue to push? [y/N]'
read ans
if [ "x-$ans" != "x-y" ]; then
  exit
fi

git push origin v5-demo
git push origin -f v5-minimal-template
git push origin -f v5-auth-template

