#!/usr/bin/env bash
set -e
set -o pipefail
set -x

git checkout v5-auth-template
git checkout v5-minimal-template
git checkout v5-demo
git checkout master

git merge v5-demo
git checkout v5-demo
git merge master

git branch -D v5-minimal-template
git checkout -b v5-minimal-template
git cherry-pick origin/v5-minimal-template

git branch -D v5-auth-template
git checkout -b v5-auth-template
git cherry-pick origin/v5-minimal-template..origin/v5-auth-template

set +x
echo finished cherry-pick.

echo -n 'continue to push? [y/N] '
read ans
if [ "x-$ans" != "x-y" ]; then
  exit
fi
set -x

git push origin master v5-demo
git push origin -f v5-minimal-template v5-auth-template
