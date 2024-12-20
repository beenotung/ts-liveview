#!/bin/bash

## Install rsync inside Git for Windows
## Check for updates on: https://gist.github.com/beenotung/888af731b7ccf56f9fb429fc4644ea38

set -e
set -o pipefail

dir="$HOME/local/opt/rsync"

mkdir -p "$dir"
cd "$dir"

function download {
  url="$1"
  path="$2"
  file="$(basename "$path")"
  if [ ! -f "$file" ]; then
    echo "download $url"
    curl "$url"| tar --zstd -xf - "$path" -O > "$file"
  else
    echo "skip $file"
  fi
}

download "https://repo.msys2.org/msys/x86_64/rsync-3.3.0-1-x86_64.pkg.tar.zst" "usr/bin/rsync.exe"
download "https://repo.msys2.org/msys/x86_64/libxxhash-0.8.2-1-x86_64.pkg.tar.zst" "usr/bin/msys-xxhash-0.dll"
download "https://repo.msys2.org/msys/x86_64/libgcrypt-1.11.0-1-x86_64.pkg.tar.zst" "usr/bin/msys-crypto-1.dll"

read -p "auto setup $dir into PATH? [y/N]" ans
if [ "$ans" == 'y' ]; then
  echo "export PATH=\"\$PATH:\$HOME/local/opt/rsync\"" >> "$HOME/.bashrc"
  echo "export PATH=\"\$PATH:\$HOME/local/opt/rsync\"" >> "$HOME/.zshrc"
  echo "Please reload the shell for the PATH updates."
else
  echo "Please make sure $dir is added to PATH."
fi
