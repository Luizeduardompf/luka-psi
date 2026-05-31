#!/usr/bin/env bash
# Toca "Don't Show Again" no dialog Android App Compatibility
# e aguarda Luka carregar
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Verifica estado atual via uiautomator
echo "▶ Dump UI..."
adb -s "$DEVICE" shell uiautomator dump /sdcard/ui.xml 2>/dev/null
adb -s "$DEVICE" pull /sdcard/ui.xml /tmp/ui_dismiss.xml 2>/dev/null

echo "Textos na UI:"
grep -o 'text="[^"]*"' /tmp/ui_dismiss.xml 2>/dev/null | sort -u | head -20

if grep -q "Android App Compatibility" /tmp/ui_dismiss.xml 2>/dev/null; then
  echo "▶ Dialog encontrado!"

  # Tenta encontrar "Don't Show Again" e "OK" com awk
  DNT_BOUNDS=$(awk -F'"' '{for(i=1;i<=NF;i++){if(index($i,"Don")>0 && index($i,"Show")>0){for(j=i;j<=NF;j++){if($j=="bounds"){print $(j+1);break}}}}}' /tmp/ui_dismiss.xml 2>/dev/null | head -1)
  OK_BOUNDS=$(awk -F'"' '{for(i=1;i<=NF;i++){if($i=="OK"){for(j=i;j<=NF;j++){if($j=="bounds"){print $(j+1);break}}}}}' /tmp/ui_dismiss.xml 2>/dev/null | head -1)

  echo "Don't Show Again bounds: '$DNT_BOUNDS'"
  echo "OK bounds: '$OK_BOUNDS'"

  if [ -n "$DNT_BOUNDS" ]; then
    X=$(echo "$DNT_BOUNDS" | awk -F'[][,]' '{x=int(($2+$5)/2); print x}')
    Y=$(echo "$DNT_BOUNDS" | awk -F'[][,]' '{y=int(($3+$6)/2); print y}')
    echo "▶ Tapping 'Don't Show Again' em ($X, $Y)..."
    adb -s "$DEVICE" shell input tap "$X" "$Y"
  else
    echo "▶ Hardcode: tapping 'Don't Show Again' em (820, 2213)..."
    adb -s "$DEVICE" shell input tap 820 2213
  fi
  echo "✓ Dialog dismissed!"
else
  echo "⚠ Dialog não encontrado. Estado atual acima."
fi

sleep 6

echo "▶ Screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/after_dismiss.png
adb -s "$DEVICE" pull /sdcard/after_dismiss.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/after_dismiss.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/after_dismiss.png" | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo ""
echo "══ Fim ══"
read -p "Enter para fechar..."
