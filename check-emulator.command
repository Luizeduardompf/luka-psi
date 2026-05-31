#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"
echo "Screen size:"
adb -s "$DEVICE" shell wm size
echo "Density:"
adb -s "$DEVICE" shell wm density
mkdir -p "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"
adb -s "$DEVICE" shell screencap -p /sdcard/screen_now.png
adb -s "$DEVICE" pull /sdcard/screen_now.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/screen_now.png"
echo "✓ Screenshot salvo em test-screenshots/screen_now.png"
