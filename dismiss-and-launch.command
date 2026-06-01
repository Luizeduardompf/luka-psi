#!/bin/bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Tap Wait up to 10 times with 1.5s delay
for i in $(seq 1 10); do
  echo "Tap Wait attempt $i..."
  adb -s "$DEVICE" shell input tap 540 1344
  sleep 1.5
done

echo "Opening Luka via Expo Go intent..."
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" \
  com.expo.go

sleep 5
echo "Taking screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/after_launch.png
adb -s "$DEVICE" pull /sdcard/after_launch.png "/Users/claudecode/Documents/Claude/Projects/Luka/Luka/test-screenshots/after_launch.png"
echo "Done"
