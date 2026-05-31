#!/usr/bin/env bash
# Login definitivo: navega no Expo Go sem force-stop, abre Luka, faz login
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE (1080x2400)"

# Step 1: Go to Expo Go Home tab (tap Home icon at bottom left)
# From Settings screen, Home tab is at approximately (267, 2289) in 1080x2400
echo "▶ Tocando na aba Home do Expo Go..."
adb -s "$DEVICE" shell input tap 267 2289
sleep 2

# Screenshot to verify state
adb -s "$DEVICE" shell screencap -p /sdcard/expo_home_check.png
adb -s "$DEVICE" pull /sdcard/expo_home_check.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/expo_home_check.png" 2>/dev/null

# Step 2: Tap on Luka in recently opened (539, 1168)
echo "▶ Abrindo Luka..."
adb -s "$DEVICE" shell input tap 539 1168
sleep 18

# Step 3: Screenshot to check if login screen appeared
adb -s "$DEVICE" shell screencap -p /sdcard/luka_login_check.png
adb -s "$DEVICE" pull /sdcard/luka_login_check.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_login_check.png" 2>/dev/null
echo "▶ Verificando estado..."

# Step 4: Login - tap email field (540, 908 in 1080x2400)
echo "▶ Tocando no campo Email..."
adb -s "$DEVICE" shell input tap 540 908
sleep 1

# Type email (fields should be empty since it's a fresh load)
echo "▶ Digitando email..."
adb -s "$DEVICE" shell input text "luizeduardompf@gmail.com"
sleep 0.5

# Tab to senha field
echo "▶ TAB para senha..."
adb -s "$DEVICE" shell input keyevent 61
sleep 0.5

# Type password
echo "▶ Digitando senha..."
adb -s "$DEVICE" shell input text "Luka2025"
sleep 0.3
# Type ! separately to avoid any shell expansion issues
adb -s "$DEVICE" shell input keyevent KEYCODE_SHIFT_LEFT KEYCODE_1 2>/dev/null || \
adb -s "$DEVICE" shell input text "\!"
sleep 0.5

# Submit with Enter
echo "▶ Submetendo..."
adb -s "$DEVICE" shell input keyevent 66
sleep 10

echo "▶ Screenshot final..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_final.png
adb -s "$DEVICE" pull /sdcard/luka_final.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_final.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_final.png" 2>/dev/null | tr -d ' ')
echo "Screenshot final: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
