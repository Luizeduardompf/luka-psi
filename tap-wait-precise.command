#!/bin/bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"
echo "Tapping Wait at 540,1344..."
adb -s "$DEVICE" shell input tap 540 1344
sleep 2
echo "Taking screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/after_wait.png
adb -s "$DEVICE" pull /sdcard/after_wait.png "/Users/claudecode/Documents/Claude/Projects/Luka/Luka/test-screenshots/after_wait.png"
echo "Done"
