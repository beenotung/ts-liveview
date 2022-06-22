#!/bin/bash
## to sync the application code base with the cloned template
## you may change the path according to your preference
set -e
set -o pipefail
meld ~/workspace/github.com/beenotung/ts-liveview/$1 $1
