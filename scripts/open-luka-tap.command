#!/bin/bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"
echo "Tapping Luka in Recently opened..."
adb -s "$DEVICE" shell input tap 540 1152
sleep 8
echo "Taking screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_opened.png
adb -s "$DEVICE" pull /sdcard/luka_opened.png "/Users/claudecode/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_opened.png"
echo "Done"
