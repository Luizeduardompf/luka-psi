#!/usr/bin/env bash
# Limpa campo URL e conecta com coordenadas hardcoded (verificadas via uiautomator)
# Campo input: center (540, 895)
# Connect button: bounds [453,1026][627,1084] → center (540, 1055)
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

echo "▶ Triple-tap no campo para selecionar tudo..."
adb -s "$DEVICE" shell input tap 540 895
sleep 0.3
adb -s "$DEVICE" shell input tap 540 895
sleep 0.3
adb -s "$DEVICE" shell input tap 540 895
sleep 0.5

echo "▶ CTRL+A + DEL para limpar..."
adb -s "$DEVICE" shell input keyevent 113   # CTRL+A
sleep 0.3
adb -s "$DEVICE" shell input keyevent 67    # DEL
sleep 0.3
# Segunda rodada por garantia
adb -s "$DEVICE" shell input keyevent 113
sleep 0.2
adb -s "$DEVICE" shell input keyevent 67
sleep 0.3

echo "▶ Digitando URL correta..."
adb -s "$DEVICE" shell input text "exp://10.0.2.2:8081"
sleep 0.8

echo "▶ Fechando teclado (Escape)..."
adb -s "$DEVICE" shell input keyevent 111
sleep 0.5

echo "▶ Tocando Connect em (540, 1055)..."
adb -s "$DEVICE" shell input tap 540 1055
echo "✓ Connect tocado!"

sleep 8

echo "▶ Screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_final.png
adb -s "$DEVICE" pull /sdcard/luka_final.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_final.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_final.png" | tr -d ' ')
echo "Screenshot: $SIZE bytes"
read -p "Enter para fechar..."
