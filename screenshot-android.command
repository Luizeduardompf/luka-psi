#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"
adb -s "$DEVICE" shell screencap -p /sdcard/current.png
adb -s "$DEVICE" pull /sdcard/current.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/android_current.png"
echo "Screenshot salva"
