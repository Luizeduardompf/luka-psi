#!/bin/bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"
SIZE=$(adb -s "$DEVICE" shell wm size)
echo "Screen: $SIZE"
# Tap "Wait" button - typically at ~35% x, ~56% y
adb -s "$DEVICE" shell input tap 270 1850 2>/dev/null || true
echo "Tapped Wait"
sleep 2
# Now tap first item in Recently opened (Luka)
adb -s "$DEVICE" shell input tap 360 1050 2>/dev/null || true
echo "Tapped Luka in recently opened"
sleep 3
adb -s "$DEVICE" shell screencap -p /sdcard/after_connect.png
adb -s "$DEVICE" pull /sdcard/after_connect.png "/Users/claudecode/Documents/Claude/Projects/Luka/Luka/test-screenshots/after_connect.png"
echo "Screenshot taken"
read -p "Enter para fechar..."
