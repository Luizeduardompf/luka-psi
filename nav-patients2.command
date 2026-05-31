#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Tap aba Pacientes com Y correto (~2280, acima da gesture zone)
echo "▶ Tap Pacientes (405, 2280)..."
adb -s "$DEVICE" shell input tap 405 2280
sleep 3

adb -s "$DEVICE" shell screencap -p /sdcard/pacientes2.png
adb -s "$DEVICE" pull /sdcard/pacientes2.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/pacientes2.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/pacientes2.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
