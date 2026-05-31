#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
SCREENSHOTS="$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"
mkdir -p "$SCREENSHOTS"
echo "Device: $DEVICE"

# 1. Fecha Chrome e Expo Go
echo "▶ Force-stop Chrome e Expo Go..."
adb -s "$DEVICE" shell am force-stop com.android.chrome
adb -s "$DEVICE" shell am force-stop host.exp.exponent
sleep 2

# 2. Abre Expo Go fresh
echo "▶ Abrindo Expo Go..."
adb -s "$DEVICE" shell monkey -p host.exp.exponent -c android.intent.category.LAUNCHER 1
sleep 4

adb -s "$DEVICE" shell screencap -p /sdcard/sc_reset1.png
adb -s "$DEVICE" pull /sdcard/sc_reset1.png "$SCREENSHOTS/reset_01_launched.png" 2>/dev/null
echo "📸 reset_01_launched.png"

# 3. Toca "Enter URL manually" (y≈770 no device 1080x2400)
echo "▶ Tocando Enter URL manually..."
adb -s "$DEVICE" shell input tap 540 770
sleep 1

adb -s "$DEVICE" shell screencap -p /sdcard/sc_reset2.png
adb -s "$DEVICE" pull /sdcard/sc_reset2.png "$SCREENSHOTS/reset_02_url_expanded.png" 2>/dev/null
echo "📸 reset_02_url_expanded.png"

# 4. Toca no campo URL para focar
echo "▶ Focando campo URL..."
adb -s "$DEVICE" shell input tap 540 920
sleep 0.5

# 5. Seleciona tudo e deleta conteúdo existente
adb -s "$DEVICE" shell input keyevent KEYCODE_MOVE_END
adb -s "$DEVICE" shell input keyevent --longpress KEYCODE_MOVE_HOME
sleep 0.3
# CTRL+A para selecionar tudo
adb -s "$DEVICE" shell input keyevent 277   # KEYCODE_CTRL_A via combined
sleep 0.2
# Deleta seleção
for i in $(seq 1 30); do
  adb -s "$DEVICE" shell input keyevent KEYCODE_DEL
done
sleep 0.3

# 6. Digita URL limpa
echo "▶ Digitando 10.0.2.2:8081..."
adb -s "$DEVICE" shell input text "10.0.2.2:8081"
sleep 0.5

adb -s "$DEVICE" shell screencap -p /sdcard/sc_reset3.png
adb -s "$DEVICE" pull /sdcard/sc_reset3.png "$SCREENSHOTS/reset_03_url_typed.png" 2>/dev/null
echo "📸 reset_03_url_typed.png"

# 7. Pressiona ENTER (IME action = Connect)
echo "▶ Pressionando ENTER (Connect)..."
adb -s "$DEVICE" shell input keyevent KEYCODE_ENTER
echo "⏳ Aguardando Luka carregar (30s)..."
sleep 30

adb -s "$DEVICE" shell screencap -p /sdcard/sc_reset4.png
adb -s "$DEVICE" pull /sdcard/sc_reset4.png "$SCREENSHOTS/reset_04_result.png" 2>/dev/null
echo "📸 reset_04_result.png"
echo "✓ Feito!"
