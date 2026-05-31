#!/usr/bin/env bash
# Toca em Luka com coordenadas corretas (device 1080x2400)
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE — 1080x2400"

# Ensure Expo Go is open (don't force-stop, keep state)
echo "▶ Verificando Expo Go..."
adb -s "$DEVICE" shell am start -n "host.exp.exponent/.experience.HomeActivity" 2>/dev/null
sleep 3

# Tap on Luka card at correct device coordinates
# bounds=[277,906][802,1431] → center (539, 1168)
echo "▶ Tocando em Luka em (539, 1168)..."
adb -s "$DEVICE" shell input tap 539 1168
sleep 20

echo "▶ Screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_correct.png
adb -s "$DEVICE" pull /sdcard/luka_correct.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_correct.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_correct.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
