#!/usr/bin/env bash
# Login com ana.silva@luka.app / Luka1234
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE (1080x2400)"

# Force stop Expo Go and reopen Luka fresh
echo "▶ Reiniciando Expo Go..."
adb -s "$DEVICE" shell am force-stop host.exp.exponent 2>/dev/null
sleep 2
adb -s "$DEVICE" shell am start -n "host.exp.exponent/.experience.HomeActivity" 2>/dev/null
sleep 4

# Tap Luka in recently opened
echo "▶ Abrindo Luka..."
adb -s "$DEVICE" shell input tap 539 1168
sleep 20

# Verify we're on login screen
echo "▶ Screenshot estado inicial..."
adb -s "$DEVICE" shell screencap -p /sdcard/pre_login.png
adb -s "$DEVICE" pull /sdcard/pre_login.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/pre_login.png" 2>/dev/null

# Tap email field (fresh, should be empty)
echo "▶ Tocando no campo Email..."
adb -s "$DEVICE" shell input tap 540 908
sleep 0.8

# Type email in parts (@ causes issues)
echo "▶ Digitando email..."
adb -s "$DEVICE" shell input text "ana.silva"
adb -s "$DEVICE" shell input text "@luka.app"
sleep 0.5

# Dismiss keyboard
echo "▶ Fechando teclado..."
adb -s "$DEVICE" shell input keyevent 4
sleep 1

# Tap senha field
echo "▶ Tocando no campo Senha..."
adb -s "$DEVICE" shell input tap 540 1154
sleep 0.8

# Type password (no special chars)
echo "▶ Digitando senha..."
adb -s "$DEVICE" shell input text "Luka1234"
sleep 0.5

# Dismiss keyboard
echo "▶ Fechando teclado..."
adb -s "$DEVICE" shell input keyevent 4
sleep 0.8

# Tap Entrar
echo "▶ Tocando em Entrar..."
adb -s "$DEVICE" shell input tap 540 1347
sleep 12

# Screenshot
echo "▶ Screenshot final..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_ana_login.png
adb -s "$DEVICE" pull /sdcard/luka_ana_login.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_ana_login.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_ana_login.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
