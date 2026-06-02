#!/bin/bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"
adb -s "$DEVICE" shell screencap -p /sdcard/android_state.png
adb -s "$DEVICE" pull /sdcard/android_state.png "/Users/claudecode/Documents/Claude/Projects/Luka/Luka/test-screenshots/android_state.png"
echo "Done"
