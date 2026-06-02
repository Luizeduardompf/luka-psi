#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
[ -z "$DEVICE" ] && echo "No device" && exit 1

echo "Trying to dismiss dialog via keyevent ENTER..."
adb -s "$DEVICE" shell input keyevent 66
sleep 1

# If still showing, try TAB+ENTER to focus 2nd button
adb -s "$DEVICE" shell input keyevent 61
sleep 0.5
adb -s "$DEVICE" shell input keyevent 66
sleep 1

# Also try BACK
adb -s "$DEVICE" shell input keyevent 4
sleep 1

echo "Sending deep link..."
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" \
  host.exp.exponent/.experience.HomeActivity 2>/dev/null

sleep 8
adb -s "$DEVICE" shell screencap -p /sdcard/current.png
adb -s "$DEVICE" pull /sdcard/current.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/android_current.png"
echo "Done"
