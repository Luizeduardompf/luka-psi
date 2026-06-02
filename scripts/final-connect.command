#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Coordenadas conhecidas da tela (1080x2400):
# Campo URL: centro ~(540, 895)
# Connect button: bounds [453,1026][627,1084] → centro (540, 1055)

echo "▶ Triple-tap no campo para selecionar tudo..."
adb -s "$DEVICE" shell input tap 540 895
sleep 0.3
adb -s "$DEVICE" shell input tap 540 895
sleep 0.3
adb -s "$DEVICE" shell input tap 540 895
sleep 0.5

echo "▶ Selecionando tudo (CTRL+A = keyevent 113) e deletando..."
adb -s "$DEVICE" shell input keyevent 113
sleep 0.3
adb -s "$DEVICE" shell input keyevent 67
sleep 0.5

echo "▶ Digitando URL correta..."
adb -s "$DEVICE" shell input text "exp://10.0.2.2:8081"
sleep 1

echo "▶ Teclando Enter para fechar teclado..."
adb -s "$DEVICE" shell input keyevent 111
sleep 0.5

echo "▶ Tocando Connect em (540, 1055)..."
adb -s "$DEVICE" shell input tap 540 1055
sleep 8

echo "▶ Screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/final.png
adb -s "$DEVICE" pull /sdcard/final.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/final.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/final.png" | tr -d ' ')
echo "Screenshot: $SIZE bytes"
read -p "Enter para fechar..."
