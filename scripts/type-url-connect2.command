#!/usr/bin/env bash
# Digita a URL no campo aberto do Expo Go e conecta
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Tap on the URL input field
echo "▶ Tocando no campo URL..."
adb -s "$DEVICE" shell input tap 354 595
sleep 0.5

# Clear and type URL
adb -s "$DEVICE" shell input keyevent KEYCODE_CTRL_A 2>/dev/null
adb -s "$DEVICE" shell input text "exp://10.0.2.2:8081"
sleep 0.5

# Tap Connect button
echo "▶ Tocando em Connect..."
adb -s "$DEVICE" shell input tap 354 688
sleep 18

# Screenshot
echo "▶ Screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_typed.png
adb -s "$DEVICE" pull /sdcard/luka_typed.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_typed.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_typed.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
