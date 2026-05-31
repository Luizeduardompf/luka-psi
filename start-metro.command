#!/usr/bin/env bash
cd "$(dirname "$0")"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
echo "=== Iniciando Metro bundler ==="
echo "Project: $(pwd)"
npx expo start --android
