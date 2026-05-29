#!/usr/bin/env bash
cd ~/Documents/Claude/Projects/Luka/Luka
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
echo "▶ Iniciando Android Emulator..."
npx expo run:android
