#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
if [ -z "$DEVICE" ]; then echo "No device"; exit 1; fi

SIZE=$(adb -s "$DEVICE" shell wm size 2>/dev/null | awk '{print $3}')
echo "Screen: $SIZE"
W=$(echo $SIZE | cut -d'x' -f1)
H=$(echo $SIZE | cut -d'x' -f2)
TX=$(echo "$W * 25 / 100" | bc)
TY=$(echo "$H * 69 / 100" | bc)
echo "Tapping OK at $TX,$TY"
adb -s "$DEVICE" shell input tap $TX $TY
sleep 3
adb -s "$DEVICE" shell screencap -p /sdcard/current.png
adb -s "$DEVICE" pull /sdcard/current.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/android_current.png"
echo "Screenshot saved"
