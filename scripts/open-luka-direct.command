#!/usr/bin/env bash
# Abre Luka diretamente via Expo Go sem passar pelo browser
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Kill Chrome
echo "▶ Fechando Chrome..."
adb -s "$DEVICE" shell am force-stop com.android.chrome 2>/dev/null
sleep 1

# Kill Expo Go
echo "▶ Fechando Expo Go..."
adb -s "$DEVICE" shell am force-stop host.exp.exponent 2>/dev/null
sleep 1

# Open Expo Go home directly then open Luka via its internal mechanism
echo "▶ Abrindo Expo Go na HomeActivity..."
adb -s "$DEVICE" shell am start \
  -n "host.exp.exponent/.experience.HomeActivity" \
  --es "url" "exp://10.0.2.2:8081" 2>/dev/null
sleep 5

# Dump UI to find exact position of Luka card
echo "▶ Verificando UI..."
adb -s "$DEVICE" shell uiautomator dump /sdcard/ui_home.xml 2>/dev/null
adb -s "$DEVICE" pull /sdcard/ui_home.xml /tmp/ui_home.xml 2>/dev/null
echo "Textos:"
grep -o 'text="[^"]*"' /tmp/ui_home.xml | sort -u | head -20
echo ""

# Find Luka bounds
LUKA_BOUNDS=$(grep -o 'text="Luka"[^>]*bounds="[^"]*"' /tmp/ui_home.xml | grep -o 'bounds="[^"]*"' | head -1)
if [ -z "$LUKA_BOUNDS" ]; then
  LUKA_BOUNDS=$(awk -F'"' '{for(i=1;i<=NF;i++){if($i=="Luka"){for(j=i;j<=NF;j++){if($j=="bounds"){print $(j+1);break}}}}}' /tmp/ui_home.xml | head -1)
fi
echo "Luka bounds: $LUKA_BOUNDS"

if [ -n "$LUKA_BOUNDS" ]; then
  X=$(echo "$LUKA_BOUNDS" | awk -F'[][,]' '{print int(($2+$5)/2)}')
  Y=$(echo "$LUKA_BOUNDS" | awk -F'[][,]' '{print int(($3+$6)/2)}')
  echo "▶ Tocando em Luka em ($X, $Y)..."
  adb -s "$DEVICE" shell input tap "$X" "$Y"
  sleep 20
else
  echo "▶ Luka não encontrado na UI, tentando tap em y=900..."
  adb -s "$DEVICE" shell input tap 354 900
  sleep 20
fi

echo "▶ Screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_direct.png
adb -s "$DEVICE" pull /sdcard/luka_direct.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_direct.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_direct.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
