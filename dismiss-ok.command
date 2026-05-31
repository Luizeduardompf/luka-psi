#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Dismiss "Android App Compatibility" dialog
# OK button: bounds=[463,2142][631,2284] → center (547,2213)
echo "▶ Tocando OK no dialog..."
adb -s "$DEVICE" shell input tap 547 2213
sleep 1

# Verifica se ainda aparece o dialog
adb -s "$DEVICE" shell uiautomator dump /sdcard/ui_check.xml 2>/dev/null
adb -s "$DEVICE" pull /sdcard/ui_check.xml /tmp/ui_check.xml 2>/dev/null
if grep -q "Android App Compatibility" /tmp/ui_check.xml 2>/dev/null; then
  echo "⚠ Dialog ainda visível, tentando 'Don't Show Again'..."
  # "Don't Show Again" button
  DNT_LINE=$(grep -o 'text="Don'\''t Show Again"[^/]*/>' /tmp/ui_check.xml 2>/dev/null | head -1)
  BOUNDS=$(echo "$DNT_LINE" | grep -o 'bounds="[^"]*"' | head -1 | sed 's/bounds="//;s/"//')
  echo "Don't Show Again bounds: $BOUNDS"
  # Use awk to parse [x1,y1][x2,y2]
  X=$(echo "$BOUNDS" | awk -F'[][,]' '{x=($2+$5)/2; print int(x)}')
  Y=$(echo "$BOUNDS" | awk -F'[][,]' '{y=($3+$6)/2; print int(y)}')
  echo "Tapping at ($X, $Y)"
  if [ -n "$X" ] && [ -n "$Y" ]; then
    adb -s "$DEVICE" shell input tap "$X" "$Y"
  else
    # Hardcode "Don't Show Again" approx
    adb -s "$DEVICE" shell input tap 822 2213
  fi
  sleep 1
fi

sleep 4

echo "▶ Screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_after_ok.png
adb -s "$DEVICE" pull /sdcard/luka_after_ok.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_after_ok.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_after_ok.png" | tr -d ' ')
echo "Screenshot: $SIZE bytes"
read -p "Enter para fechar..."
