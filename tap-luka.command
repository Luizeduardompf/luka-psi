#!/usr/bin/env bash
# Toca em "Luka" na lista de Recently opened do Expo Go
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

if [ -z "$DEVICE" ]; then
  echo "❌ Nenhum emulador conectado."
  read -p "Enter para fechar..."
  exit 1
fi

# Tap on Luka in Recently opened (center of the card ~y=727 on 1560px screen)
echo "▶ Tocando em Luka..."
adb -s "$DEVICE" shell input tap 354 727
sleep 15

# Screenshot
echo "▶ Screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_open.png
adb -s "$DEVICE" pull /sdcard/luka_open.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_open.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_open.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo ""
echo "══ Fim ══"
read -p "Enter para fechar..."
