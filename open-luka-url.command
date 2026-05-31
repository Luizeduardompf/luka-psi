#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
[ -z "$DEVICE" ] && echo "No device" && exit 1

echo "Sending exp://10.0.2.2:8081 deep link..."
# Use monkey to send URL intent (more reliable)
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" \
  host.exp.exponent/.experience.HomeActivity

sleep 3

echo "Taking screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/current.png
adb -s "$DEVICE" pull /sdcard/current.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/android_current.png"
echo "Done"
