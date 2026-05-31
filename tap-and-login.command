#!/usr/bin/env bash
# Tap Luka card (Expo Go Home screen) e faz login com ana.silva@luka.app
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE (1080x2400)"

# Trazer Expo Go para frente (sem force-stop, mantém Home screen)
echo "▶ Trazendo Expo Go para frente..."
adb -s "$DEVICE" shell am start -n "host.exp.exponent/.experience.HomeActivity" 2>&1
sleep 2

# Tap no card Luka em Recently Opened
# Coord calculada do screenshot: center ~(541, 1122) em 1080x2400
echo "▶ Abrindo Luka (tap 541, 1122)..."
adb -s "$DEVICE" shell input tap 541 1122
sleep 20

# Screenshot para verificar se chegou na tela de login
echo "▶ Screenshot pós-abertura..."
adb -s "$DEVICE" shell screencap -p /sdcard/after_open.png
adb -s "$DEVICE" pull /sdcard/after_open.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/after_open.png" 2>/dev/null
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/after_open.png" 2>/dev/null | tr -d ' ')
echo "Screenshot pós-abertura: $SIZE bytes"

# === LOGIN ===
# Limpar e preencher campo Email (540, 908)
echo "▶ Campo Email (540, 908)..."
adb -s "$DEVICE" shell input tap 540 908
sleep 0.8
adb -s "$DEVICE" shell input keyevent KEYCODE_MOVE_END
sleep 0.2
for i in $(seq 1 80); do adb -s "$DEVICE" shell input keyevent KEYCODE_DEL; done
sleep 0.3

echo "▶ Digitando email..."
adb -s "$DEVICE" shell input text "ana.silva"
adb -s "$DEVICE" shell input text "@luka.app"
sleep 0.5

echo "▶ Dismiss teclado..."
adb -s "$DEVICE" shell input keyevent 4
sleep 1

# Campo Senha (540, 1154)
echo "▶ Campo Senha (540, 1154)..."
adb -s "$DEVICE" shell input tap 540 1154
sleep 0.8
adb -s "$DEVICE" shell input keyevent KEYCODE_MOVE_END
sleep 0.2
for i in $(seq 1 40); do adb -s "$DEVICE" shell input keyevent KEYCODE_DEL; done
sleep 0.3

echo "▶ Digitando senha..."
adb -s "$DEVICE" shell input text "Luka1234"
sleep 0.5

echo "▶ Dismiss teclado..."
adb -s "$DEVICE" shell input keyevent 4
sleep 0.8

# Tap Entrar (540, 1347)
echo "▶ Tocando Entrar (540, 1347)..."
adb -s "$DEVICE" shell input tap 540 1347
sleep 12

# Screenshot final
echo "▶ Screenshot final..."
adb -s "$DEVICE" shell screencap -p /sdcard/loggedin.png
adb -s "$DEVICE" pull /sdcard/loggedin.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/loggedin.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/loggedin.png" 2>/dev/null | tr -d ' ')
echo "Screenshot final: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
