#!/bin/bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"
# Get screen resolution
SIZE=$(adb -s "$DEVICE" shell wm size | grep -o '[0-9]*x[0-9]*')
echo "Screen size: $SIZE"
W=$(echo $SIZE | cut -dx -f1)
H=$(echo $SIZE | cut -dx -f2)
echo "W=$W H=$H"
# "Wait" button is at roughly 25% x, 55% y of screen
TAP_X=$(echo "$W * 25 / 100" | bc)
TAP_Y=$(echo "$H * 55 / 100" | bc)
echo "Tapping Wait at: $TAP_X, $TAP_Y"
adb -s "$DEVICE" shell input tap $TAP_X $TAP_Y
sleep 1
echo "Tapped!"
# Screenshot to verify
adb -s "$DEVICE" shell screencap -p /sdcard/after_tap.png
adb -s "$DEVICE" pull /sdcard/after_tap.png "/Users/claudecode/Documents/Claude/Projects/Luka/Luka/test-screenshots/after_tap.png"
echo "Screenshot saved"
read -p "Enter para fechar..."
