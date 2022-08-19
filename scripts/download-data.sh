#!/bin/bash
set -e
set -o pipefail

source scripts/config
rsync -SavlPz "$user@$host:$root_dir/data" .
