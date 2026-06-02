#!/usr/bin/env bash
# Fix login: limpa campo, digita email, tab, senha, enter
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Clear email field (select all + delete)
echo "▶ Limpando campo email..."
adb -s "$DEVICE" shell input keyevent KEYCODE_CTRL_A
sleep 0.3
adb -s "$DEVICE" shell input keyevent KEYCODE_DEL
sleep 0.3

# Type email
echo "▶ Digitando email..."
adb -s "$DEVICE" shell input text "luizeduardompf@gmail.com"
sleep 0.5

# Tab to password field
echo "▶ Navegando para senha..."
adb -s "$DEVICE" shell input keyevent KEYCODE_TAB
sleep 0.5

# Type password
echo "▶ Digitando senha..."
adb -s "$DEVICE" shell input text "Luka2025!"
sleep 0.5

# Press Enter to submit
echo "▶ Submetendo..."
adb -s "$DEVICE" shell input keyevent KEYCODE_ENTER
sleep 8

# Screenshot
adb -s "$DEVICE" shell screencap -p /sdcard/luka_login2.png
adb -s "$DEVICE" pull /sdcard/luka_login2.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_login2.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_login2.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
