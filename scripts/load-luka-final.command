#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
SCREENSHOTS="$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"
mkdir -p "$SCREENSHOTS"
echo "Device: $DEVICE"

# 1. Fecha tudo
echo "▶ Force-stop Chrome e Expo Go..."
adb -s "$DEVICE" shell am force-stop com.android.chrome
adb -s "$DEVICE" shell am force-stop host.exp.exponent
sleep 2

# 2. Lança Expo Go e aguarda carregar completamente (10s)
echo "▶ Lançando Expo Go..."
adb -s "$DEVICE" shell monkey -p host.exp.exponent -c android.intent.category.LAUNCHER 1
echo "⏳ Aguardando Expo Go home carregar (10s)..."
sleep 10

adb -s "$DEVICE" shell screencap -p /sdcard/sc_f1.png
adb -s "$DEVICE" pull /sdcard/sc_f1.png "$SCREENSHOTS/final_01_home.png" 2>/dev/null
echo "📸 final_01_home.png (deve mostrar home do Expo Go)"

# 3. Agora envia o deep link — Expo Go já está rodando no home
echo "▶ Enviando deep link exp://10.0.2.2:8081..."
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" \
  host.exp.exponent/.experience.HomeActivity
sleep 3

adb -s "$DEVICE" shell screencap -p /sdcard/sc_f2.png
adb -s "$DEVICE" pull /sdcard/sc_f2.png "$SCREENSHOTS/final_02_after_deeplink.png" 2>/dev/null
echo "📸 final_02_after_deeplink.png"

# Se ainda estiver no home, expande "Enter URL manually" e digita
echo "▶ Tentando Enter URL manually como fallback..."
adb -s "$DEVICE" shell input tap 540 770
sleep 2

adb -s "$DEVICE" shell screencap -p /sdcard/sc_f3.png
adb -s "$DEVICE" pull /sdcard/sc_f3.png "$SCREENSHOTS/final_03_expanded.png" 2>/dev/null
echo "📸 final_03_expanded.png"

# Toca campo URL (agora expandido, y≈920)
adb -s "$DEVICE" shell input tap 540 920
sleep 1

# Limpa campo com 50x DEL
for i in $(seq 1 50); do adb -s "$DEVICE" shell input keyevent KEYCODE_DEL; done
sleep 0.3

# Digita URL
adb -s "$DEVICE" shell input text "10.0.2.2:8081"
sleep 0.5

adb -s "$DEVICE" shell screencap -p /sdcard/sc_f4.png
adb -s "$DEVICE" pull /sdcard/sc_f4.png "$SCREENSHOTS/final_04_typed.png" 2>/dev/null
echo "📸 final_04_typed.png"

# IME action (Connect/Done/Go)
adb -s "$DEVICE" shell input keyevent KEYCODE_ENTER
echo "⏳ Aguardando Luka carregar (30s)..."
sleep 30

adb -s "$DEVICE" shell screencap -p /sdcard/sc_f5.png
adb -s "$DEVICE" pull /sdcard/sc_f5.png "$SCREENSHOTS/final_05_result.png" 2>/dev/null
echo "📸 final_05_result.png"
echo "✓ Feito!"
