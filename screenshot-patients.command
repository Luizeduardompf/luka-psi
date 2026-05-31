#!/usr/bin/env bash
# Screenshot da lista de pacientes no Android
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Tap na aba Pacientes (segunda aba na bottom nav)
# Bottom nav está em y≈2330 no device 1080x2400
# Abas: Início(135,2330), Pacientes(405,2330), Configurações(675,2330), agenda(945,2330)
echo "▶ Tocando aba Pacientes..."
adb -s "$DEVICE" shell input tap 405 2330
sleep 2

# Screenshot
adb -s "$DEVICE" shell screencap -p /sdcard/patients_list.png
adb -s "$DEVICE" pull /sdcard/patients_list.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/patients_list.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/patients_list.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
