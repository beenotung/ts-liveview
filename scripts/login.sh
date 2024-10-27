#!/bin/bash
# ssh login for manual deploy setup (e.g. to setup nginx and run seed)
set -e
set -o pipefail

source scripts/config

ssh -t "$user@$host" "
  if [ -d $root_dir ]; then
    cd $root_dir
  fi
  \$0 --login
"
