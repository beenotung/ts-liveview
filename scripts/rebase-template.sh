#!/usr/bin/env bash
set -e
set -o pipefail
set -x

git checkout v5-auth-template
git checkout v5-ionic-template
git checkout v5-web-template
git checkout v5-hybrid-template
git checkout v5-demo
git checkout master

git merge v5-demo
git checkout v5-demo
git merge master

git branch -D v5-hybrid-template
git checkout -b v5-hybrid-template
git cherry-pick origin/v5-hybrid-template

git checkout v5-hybrid-template
git branch -D v5-web-template
git checkout -b v5-web-template
git cherry-pick origin/v5-hybrid-template..origin/v5-web-template

git checkout v5-hybrid-template
git branch -D v5-ionic-template
git checkout -b v5-ionic-template
git cherry-pick origin/v5-hybrid-template..origin/v5-ionic-template

git checkout v5-hybrid-template
git branch -D v5-auth-template
git checkout -b v5-auth-template
git cherry-pick origin/v5-hybrid-template..origin/v5-auth-template

set +x
echo finished cherry-pick.

echo -n 'continue to push? [y/N] '
read ans
if [ "x-$ans" != "x-y" ]; then
  exit
fi
set -x

git push origin master v5-demo
git push origin -f \
  v5-hybrid-template \
  v5-web-template \
  v5-ionic-template \
  v5-auth-template

git checkout master
git branch -D v5-demo
git branch -D v5-hybrid-template
git branch -D v5-web-template
git branch -D v5-ionic-template
git branch -D v5-auth-template
