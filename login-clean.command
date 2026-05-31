#!/usr/bin/env bash
# Login limpo: força fechar, reabre Luka, faz login com coords corretas
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE (1080x2400)"

# Force stop Expo Go completely
echo "▶ Reiniciando Expo Go..."
adb -s "$DEVICE" shell am force-stop host.exp.exponent 2>/dev/null
sleep 2

# Open Expo Go HomeActivity
adb -s "$DEVICE" shell am start -n "host.exp.exponent/.experience.HomeActivity" 2>/dev/null
sleep 4

# Tap on Luka in Recently opened (bounds=[277,906][802,1431] → center 539,1168)
echo "▶ Abrindo Luka..."
adb -s "$DEVICE" shell input tap 539 1168
sleep 18

# Now login screen should be fresh and empty
# Tap on E-mail field (center ~540, 908 in 1080x2400)
echo "▶ Tocando no campo Email..."
adb -s "$DEVICE" shell input tap 540 908
sleep 0.8

# Type email
echo "▶ Digitando email..."
adb -s "$DEVICE" shell input text "luizeduardompf@gmail.com"
sleep 0.5

# Press TAB to move to senha field
echo "▶ Navegando para senha (TAB)..."
adb -s "$DEVICE" shell input keyevent 61
sleep 0.5

# Type senha
echo "▶ Digitando senha..."
adb -s "$DEVICE" shell input text "Luka2025!"
sleep 0.5

# Press Enter to submit
echo "▶ Submetendo..."
adb -s "$DEVICE" shell input keyevent 66
sleep 10

# Screenshot
echo "▶ Screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_clean_login.png
adb -s "$DEVICE" pull /sdcard/luka_clean_login.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_clean_login.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_clean_login.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
