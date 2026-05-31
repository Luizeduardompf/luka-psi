#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
SCREENSHOTS="$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"
mkdir -p "$SCREENSHOTS"
echo "Device: $DEVICE"

# Toca no campo URL para focar
adb -s "$DEVICE" shell input tap 540 597
sleep 0.5

# Seleciona todo o texto (CTRL+A) e deleta
adb -s "$DEVICE" shell input keyevent KEYCODE_CTRL_LEFT
adb -s "$DEVICE" shell input keyevent --longpress KEYCODE_A
sleep 0.3
adb -s "$DEVICE" shell input keyevent KEYCODE_DEL
sleep 0.3

# Alternativa: triple-tap para selecionar tudo
adb -s "$DEVICE" shell input tap 540 597
sleep 0.2
adb -s "$DEVICE" shell input tap 540 597
sleep 0.2
adb -s "$DEVICE" shell input tap 540 597
sleep 0.3

# Digita a URL correta
adb -s "$DEVICE" shell input text "10.0.2.2:8081"
sleep 0.5

adb -s "$DEVICE" shell screencap -p /sdcard/sc_before_connect.png
adb -s "$DEVICE" pull /sdcard/sc_before_connect.png "$SCREENSHOTS/tap_connect_before.png" 2>/dev/null
echo "📸 tap_connect_before.png"

# Fecha teclado tocando fora
adb -s "$DEVICE" shell input tap 540 1500
sleep 0.5

# Toca Connect (y=688 no device sem teclado)
echo "▶ Tocando Connect y=688..."
adb -s "$DEVICE" shell input tap 540 688
echo "⏳ Aguardando Luka carregar (25s)..."
sleep 25

adb -s "$DEVICE" shell screencap -p /sdcard/sc_luka_result.png
adb -s "$DEVICE" pull /sdcard/sc_luka_result.png "$SCREENSHOTS/luka_result.png" 2>/dev/null
echo "📸 luka_result.png"
echo "✓ Feito!"
