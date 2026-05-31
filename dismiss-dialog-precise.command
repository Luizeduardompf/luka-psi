#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"
echo "Screen size:"
adb -s "$DEVICE" shell wm size
echo "Display density:"
adb -s "$DEVICE" shell wm density

# Try multiple positions: y from 2250 to 2380
# OK button is at ~37% x, Don't Show Again is at ~75% x
for y in 2280 2300 2320 2340 2360; do
  echo "▶ Tap OK at (400, $y)..."
  adb -s "$DEVICE" shell input tap 400 $y
  sleep 0.3
done

sleep 1

# Check if dismissed
adb -s "$DEVICE" shell screencap -p /sdcard/test_dismiss.png
adb -s "$DEVICE" pull /sdcard/test_dismiss.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/test_dismiss.png" 2>/dev/null
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/test_dismiss.png" | tr -d ' ')
echo "Screenshot size: $SIZE bytes"

read -p "Pressione Enter para fechar..."
