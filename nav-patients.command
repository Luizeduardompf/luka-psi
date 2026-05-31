#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Screenshot do estado atual primeiro
adb -s "$DEVICE" shell screencap -p /sdcard/before_nav.png
adb -s "$DEVICE" pull /sdcard/before_nav.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/before_nav.png" 2>/dev/null

# Tap aba Pacientes - segundo ícone da bottom nav
# Device 1080x2400, bottom nav height ~150px, y center ~2325
# 4 tabs: largura 1080/4=270 cada, centros: 135, 405, 675, 945
echo "▶ Tap Pacientes (405, 2325)..."
adb -s "$DEVICE" shell input tap 405 2325
sleep 3

adb -s "$DEVICE" shell screencap -p /sdcard/patients_tab.png
adb -s "$DEVICE" pull /sdcard/patients_tab.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/patients_tab.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/patients_tab.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
