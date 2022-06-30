#!/bin/bash
set -e
set -o pipefail

source scripts/config
rsync -SavlP "$user@$host:$root_dir/data" .
