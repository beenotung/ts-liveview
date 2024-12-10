#!/bin/bash
set -e
set -o pipefail
grep -n "loadClientPlugin" `find server -type f` \
  | grep -v import \
  | grep -v function \
  | grep -v =
