#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Try multiple tap positions for the buttons at the bottom of the dialog
# Screen is 1080x2400; dialog buttons appear near the bottom

echo "▶ Tentando tap em diferentes posições do botão 'OK'..."

# Try OK button at various Y positions
for y in 2050 2100 2150 2200 2250; do
  echo "  Tap (270, $y)..."
  adb -s "$DEVICE" shell input tap 270 $y
  sleep 0.5
done

echo "▶ Tentando keyevent ENTER..."
adb -s "$DEVICE" shell input keyevent 66

sleep 1

# Screenshot to verify
adb -s "$DEVICE" shell screencap -p /sdcard/after_ok.png
adb -s "$DEVICE" pull /sdcard/after_ok.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/after_ok.png"
echo "Screenshot saved"

read -p "Pressione Enter para fechar..."
