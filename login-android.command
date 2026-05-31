#!/usr/bin/env bash
# Faz login no Luka no Android (device 1080x2400)
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Tela de login está visível
# E-mail field: center approximately (540, 870) in 1080x2400
# Senha field: approximately (540, 1130)
# Entrar button: approximately (540, 1305)

echo "▶ Tocando no campo E-mail..."
adb -s "$DEVICE" shell input tap 540 870
sleep 0.5
adb -s "$DEVICE" shell input text "luizeduardompf@gmail.com"
sleep 0.5

echo "▶ Tocando no campo Senha..."
adb -s "$DEVICE" shell input tap 540 1130
sleep 0.5
adb -s "$DEVICE" shell input text "Luka2025!"
sleep 0.5

echo "▶ Tocando em Entrar..."
adb -s "$DEVICE" shell input tap 540 1305
sleep 8

echo "▶ Screenshot pós-login..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_login.png
adb -s "$DEVICE" pull /sdcard/luka_login.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_login.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_login.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
