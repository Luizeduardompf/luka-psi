#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

echo "══════════════════════════════════════════"
echo "  Luka — npm install + iOS + Android"
echo "══════════════════════════════════════════"
echo ""

echo "▶ npm install..."
npm install --legacy-peer-deps
echo "✓ npm install OK"
echo ""

# iOS in new Terminal window
echo "▶ Abrindo iOS Simulator..."
osascript -e 'tell application "Terminal"
  activate
  do script "cd ~/Documents/Claude/Projects/Luka/Luka && export ANDROID_HOME=$HOME/Library/Android/sdk && export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH && npx expo run:ios"
end tell'

sleep 3

# Android in new Terminal window
echo "▶ Abrindo Android Emulator..."
osascript -e 'tell application "Terminal"
  activate
  do script "cd ~/Documents/Claude/Projects/Luka/Luka && export ANDROID_HOME=$HOME/Library/Android/sdk && export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH && npx expo run:android"
end tell'

echo ""
echo "✓ Ambos os simuladores sendo iniciados em janelas separadas."
echo "  Primeira compilação leva 3–5 min cada."
