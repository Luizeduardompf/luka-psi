#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"
SCREENSHOTS="$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"
mkdir -p "$SCREENSHOTS"

# Fecha qualquer painel aberto (stylus/keyboard) via BACK
adb -s "$DEVICE" shell input keyevent KEYCODE_BACK
sleep 0.5
adb -s "$DEVICE" shell input keyevent KEYCODE_BACK
sleep 0.5

# Clica no campo URL (y≈966 no device — ver calibração)
# Calibração Mac→Device: campo URL na tela em y≈362 Mac
# device_y = (362-105)/(770-105) * 2400 = 257/665 * 2400 ≈ 927
adb -s "$DEVICE" shell input tap 540 927
sleep 0.5

# Verifica estado
adb -s "$DEVICE" shell screencap -p /sdcard/sc_before_type.png
adb -s "$DEVICE" pull /sdcard/sc_before_type.png "$SCREENSHOTS/before_type.png" 2>/dev/null
echo "📸 before_type.png"

# Digita URL — sem caracteres especiais
adb -s "$DEVICE" shell input text "10.0.2.2:8081"
sleep 0.5

# Clica Connect — y≈1068 device
adb -s "$DEVICE" shell input tap 540 1068
echo "▶ Connect clicado"
sleep 8

# Screenshot resultado
adb -s "$DEVICE" shell screencap -p /sdcard/sc_after_connect.png
adb -s "$DEVICE" pull /sdcard/sc_after_connect.png "$SCREENSHOTS/after_connect.png" 2>/dev/null
echo "📸 after_connect.png"
echo "✓ Feito!"
