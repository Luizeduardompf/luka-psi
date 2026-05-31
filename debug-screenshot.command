#!/usr/bin/env bash
# Tira screenshot do estado atual do Android emulator
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Screenshot do estado atual
adb -s "$DEVICE" shell screencap -p /sdcard/debug_now.png
adb -s "$DEVICE" pull /sdcard/debug_now.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/debug_now.png"
echo "Screenshot atual salvo"

# Abrir Expo Go HomeActivity
echo "▶ Abrindo Expo Go..."
adb -s "$DEVICE" shell am start -n "host.exp.exponent/.experience.HomeActivity" 2>&1
sleep 5

# Screenshot
adb -s "$DEVICE" shell screencap -p /sdcard/debug_expo.png
adb -s "$DEVICE" pull /sdcard/debug_expo.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/debug_expo.png"
echo "Screenshot Expo Go salvo"

echo "══ Fim ══"
read -p "Enter para fechar..."
