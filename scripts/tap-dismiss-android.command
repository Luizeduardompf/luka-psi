#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
[ -z "$DEVICE" ] && echo "No device" && exit 1

# Screen is 1080x2400. OK button is at ~25% x, ~88% y (based on screenshot)
# "Don't Show Again" at ~75% x, ~88% y
adb -s "$DEVICE" shell input tap 810 2112
echo "Tapped Don't Show Again at 810,2112"
sleep 2

# Re-send deep link to open Luka
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" \
  host.exp.exponent/.experience.HomeActivity 2>/dev/null && echo "Deep link sent" || \
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" 2>/dev/null && echo "Deep link sent (fallback)"

sleep 5
adb -s "$DEVICE" shell screencap -p /sdcard/current.png
adb -s "$DEVICE" pull /sdcard/current.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/android_current.png"
echo "Screenshot saved"
