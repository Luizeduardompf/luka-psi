#!/usr/bin/env bash
# Login Android: dismiss teclado entre campos para evitar sobreposição
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE (1080x2400)"

# Step 1: Clear email field first
# Tap email field and select all + delete
echo "▶ Limpando campo email..."
adb -s "$DEVICE" shell input tap 540 908
sleep 0.8
# Move to end, then delete backwards many times
adb -s "$DEVICE" shell input keyevent KEYCODE_MOVE_END
sleep 0.2
for i in $(seq 1 60); do
  adb -s "$DEVICE" shell input keyevent KEYCODE_DEL
done
sleep 0.3

# Type email
echo "▶ Digitando email..."
adb -s "$DEVICE" shell input text "luizeduardompf@gmail.com"
sleep 0.5

# DISMISS keyboard with BACK key
echo "▶ Fechando teclado (BACK)..."
adb -s "$DEVICE" shell input keyevent 4
sleep 1

# Step 2: Tap senha field (now keyboard is dismissed, correct y coords)
# Senha field center: ~(540, 1154) in 1080x2400
echo "▶ Tocando no campo Senha..."
adb -s "$DEVICE" shell input tap 540 1154
sleep 0.8

# Type password
echo "▶ Digitando senha..."
adb -s "$DEVICE" shell input text "Luka2025!"
sleep 0.5

# DISMISS keyboard again
echo "▶ Fechando teclado..."
adb -s "$DEVICE" shell input keyevent 4
sleep 0.8

# Tap Entrar button (~540, 1347)
echo "▶ Tocando em Entrar..."
adb -s "$DEVICE" shell input tap 540 1347
sleep 10

# Screenshot
echo "▶ Screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_back_login.png
adb -s "$DEVICE" pull /sdcard/luka_back_login.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_back_login.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_back_login.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
