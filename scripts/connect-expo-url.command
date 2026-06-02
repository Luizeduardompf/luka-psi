#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# First verify Metro is running
if ! curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
  echo "⚠ Metro não está rodando! Iniciando..."
  cd "$HOME/Documents/Claude/Projects/Luka/Luka"
  pkill -f "expo start" 2>/dev/null || true
  pkill -f metro 2>/dev/null || true
  sleep 1
  npx expo start --reset-cache > /tmp/luka-metro.log 2>&1 &
  echo "Aguardando Metro..."
  for i in $(seq 1 60); do
    if curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
      echo "✓ Metro pronto após ${i}s"
      break
    fi
    sleep 1; printf "."
  done
  echo ""
else
  echo "✓ Metro está rodando"
fi

# Make sure Expo Go is running (open it if not)
echo "▶ Garantindo que Expo Go está aberto..."
adb -s "$DEVICE" shell am start \
  -n host.exp.exponent/.experience.HomeActivity \
  2>/dev/null || true
sleep 2

# Dump UI to find "Enter URL manually"
adb -s "$DEVICE" shell uiautomator dump /sdcard/ui.xml 2>/dev/null
adb -s "$DEVICE" pull /sdcard/ui.xml /tmp/ui_expo.xml 2>/dev/null

echo "--- Elementos clicáveis na UI ---"
grep -oE 'text="[^"]{3,50}"[^>]*bounds="[^"]*"' /tmp/ui_expo.xml 2>/dev/null | head -20

# Find "Enter URL manually" button
ENTER_URL_BOUNDS=$(grep -oE 'text="Enter URL manually"[^>]*bounds="\[[0-9]+,[0-9]+\]\[[0-9]+,[0-9]+\]"' /tmp/ui_expo.xml 2>/dev/null | grep -oE 'bounds="\[[0-9]+,[0-9]+\]\[[0-9]+,[0-9]+\]"' | head -1)
echo "Enter URL manually bounds: $ENTER_URL_BOUNDS"

if [ -n "$ENTER_URL_BOUNDS" ]; then
  # Calculate center
  X1=$(echo "$ENTER_URL_BOUNDS" | grep -oP '\[\K[0-9]+(?=,)' | head -1)
  Y1=$(echo "$ENTER_URL_BOUNDS" | grep -oP ',\K[0-9]+(?=\])' | head -1)
  X2=$(echo "$ENTER_URL_BOUNDS" | grep -oP '\[\K[0-9]+(?=,)' | tail -1)
  Y2=$(echo "$ENTER_URL_BOUNDS" | grep -oP ',\K[0-9]+(?=\])' | tail -1)
  CX=$(( (X1 + X2) / 2 ))
  CY=$(( (Y1 + Y2) / 2 ))
  
  echo "Tapping 'Enter URL manually' at ($CX, $CY)..."
  adb -s "$DEVICE" shell input tap "$CX" "$CY"
  sleep 2
  
  # Dump again to find the URL input field
  adb -s "$DEVICE" shell uiautomator dump /sdcard/ui2.xml 2>/dev/null
  adb -s "$DEVICE" pull /sdcard/ui2.xml /tmp/ui2_expo.xml 2>/dev/null
  
  echo "--- Campos de input ---"
  grep -oE 'class="android.widget.EditText"[^>]*bounds="[^"]*"' /tmp/ui2_expo.xml 2>/dev/null | head -5
  
  # Find EditText for URL input
  INPUT_BOUNDS=$(grep -oE 'class="android.widget.EditText"[^>]*bounds="\[[0-9]+,[0-9]+\]\[[0-9]+,[0-9]+\]"' /tmp/ui2_expo.xml 2>/dev/null | grep -oE 'bounds="\[[0-9]+,[0-9]+\]\[[0-9]+,[0-9]+\]"' | head -1)
  echo "Input field bounds: $INPUT_BOUNDS"
  
  if [ -n "$INPUT_BOUNDS" ]; then
    IX1=$(echo "$INPUT_BOUNDS" | grep -oP '\[\K[0-9]+(?=,)' | head -1)
    IY1=$(echo "$INPUT_BOUNDS" | grep -oP ',\K[0-9]+(?=\])' | head -1)
    IX2=$(echo "$INPUT_BOUNDS" | grep -oP '\[\K[0-9]+(?=,)' | tail -1)
    IY2=$(echo "$INPUT_BOUNDS" | grep -oP ',\K[0-9]+(?=\])' | tail -1)
    ICX=$(( (IX1 + IX2) / 2 ))
    ICY=$(( (IY1 + IY2) / 2 ))
    
    echo "Tapping input field at ($ICX, $ICY)..."
    adb -s "$DEVICE" shell input tap "$ICX" "$ICY"
    sleep 1
    
    echo "Digitando URL..."
    adb -s "$DEVICE" shell input text "exp://10.0.2.2:8081"
    sleep 1
    
    # Press the Connect/OK button
    echo "Procurando botão Connect..."
    adb -s "$DEVICE" shell uiautomator dump /sdcard/ui3.xml 2>/dev/null
    adb -s "$DEVICE" pull /sdcard/ui3.xml /tmp/ui3_expo.xml 2>/dev/null
    grep -oE 'text="[^"]*"[^>]*bounds="[^"]*"' /tmp/ui3_expo.xml 2>/dev/null | head -10
    
    # Try pressing Enter
    adb -s "$DEVICE" shell input keyevent 66
    sleep 2
    
    echo "✓ URL enviada!"
  else
    echo "⚠ Campo de input não encontrado"
    # Try pressing tab and typing
    adb -s "$DEVICE" shell input keyevent 61
    sleep 0.5
    adb -s "$DEVICE" shell input text "exp://10.0.2.2:8081"
    adb -s "$DEVICE" shell input keyevent 66
  fi
else
  echo "⚠ Botão 'Enter URL manually' não encontrado"
  echo "Tentando deep link direto..."
  adb -s "$DEVICE" shell am start -a android.intent.action.VIEW -d "exp://10.0.2.2:8081"
fi

sleep 3

# Final screenshot
adb -s "$DEVICE" shell screencap -p /sdcard/final_connect.png
adb -s "$DEVICE" pull /sdcard/final_connect.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/final_connect.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/final_connect.png" | tr -d ' ')
echo "Screenshot final: $SIZE bytes"

read -p "Pressione Enter para fechar..."
