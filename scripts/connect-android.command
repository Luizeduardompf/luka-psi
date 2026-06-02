#!/usr/bin/env bash
# Conecta Expo Go ao Metro via intent direto
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

if [ -z "$DEVICE" ]; then
  echo "❌ Nenhum emulador conectado."
  read -p "Enter para fechar..."
  exit 1
fi

# Force close Expo Go first
echo "▶ Fechando Expo Go..."
adb -s "$DEVICE" shell am force-stop host.exp.exponent 2>/dev/null
sleep 1

# Open Luka via deep link
echo "▶ Abrindo Luka via exp:// intent..."
adb -s "$DEVICE" shell am start -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" \
  -n "host.exp.exponent/.experience.HomeActivity" 2>/dev/null || \
adb -s "$DEVICE" shell am start -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" 2>/dev/null

sleep 12

echo "▶ Screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_connect.png
adb -s "$DEVICE" pull /sdcard/luka_connect.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_connect.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_connect.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo ""
echo "══ Fim ══"
read -p "Enter para fechar..."
