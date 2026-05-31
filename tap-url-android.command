#!/usr/bin/env bash
# Conecta Expo Go ao Metro usando "Enter URL manually"
# Versão corrigida — usa sed/awk em vez de grep -P (macOS)
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

if [ -z "$DEVICE" ]; then
  echo "✗ Nenhum emulador encontrado"
  read -p "Enter para fechar..."
  exit 1
fi

# Verifica Metro
if ! curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
  echo "⚠ Metro não está rodando! Inicie Metro primeiro."
  read -p "Enter para fechar..."
  exit 1
fi
echo "✓ Metro rodando"

# Abre Expo Go
echo "▶ Abrindo Expo Go..."
adb -s "$DEVICE" shell am start -n host.exp.exponent/.experience.HomeActivity 2>/dev/null || true
sleep 2

# Dump UI e extrai bounds com awk/sed (sem grep -P)
adb -s "$DEVICE" shell uiautomator dump /sdcard/ui.xml 2>/dev/null
adb -s "$DEVICE" pull /sdcard/ui.xml /tmp/ui_tap.xml 2>/dev/null

echo "--- Elementos com 'Enter URL' ---"
grep -o 'text="Enter URL[^"]*"[^/]*/>' /tmp/ui_tap.xml 2>/dev/null | head -5 || \
  grep -o 'Enter URL manually' /tmp/ui_tap.xml 2>/dev/null | head -3

# Extrai bounds do botão "Enter URL manually" com awk
BOUNDS=$(awk -F'"' '{for(i=1;i<=NF;i++){if($i=="Enter URL manually"){for(j=i;j<=NF;j++){if($j=="bounds"){print $(j+1);break}}}}}' /tmp/ui_tap.xml 2>/dev/null | head -1)
echo "Bounds 'Enter URL manually': $BOUNDS"

if [ -n "$BOUNDS" ]; then
  # Parse "[x1,y1][x2,y2]" com awk
  X1=$(echo "$BOUNDS" | awk -F'[^0-9]+' '{print $2}')
  Y1=$(echo "$BOUNDS" | awk -F'[^0-9]+' '{print $3}')
  X2=$(echo "$BOUNDS" | awk -F'[^0-9]+' '{print $4}')
  Y2=$(echo "$BOUNDS" | awk -F'[^0-9]+' '{print $5}')
  CX=$(( (X1 + X2) / 2 ))
  CY=$(( (Y1 + Y2) / 2 ))
  echo "Centro: ($CX, $CY)"

  echo "▶ Tapping 'Enter URL manually'..."
  adb -s "$DEVICE" shell input tap "$CX" "$CY"
  sleep 2

  # Dump UI para encontrar o campo de texto
  adb -s "$DEVICE" shell uiautomator dump /sdcard/ui2.xml 2>/dev/null
  adb -s "$DEVICE" pull /sdcard/ui2.xml /tmp/ui2_tap.xml 2>/dev/null

  # Extrai EditText com awk
  EDIT_BOUNDS=$(awk -F'"' '{for(i=1;i<=NF;i++){if($i=="android.widget.EditText"){for(j=i;j<=NF;j++){if($j=="bounds"){print $(j+1);break}}}}}' /tmp/ui2_tap.xml 2>/dev/null | head -1)
  echo "EditText bounds: $EDIT_BOUNDS"

  if [ -n "$EDIT_BOUNDS" ]; then
    IX1=$(echo "$EDIT_BOUNDS" | awk -F'[^0-9]+' '{print $2}')
    IY1=$(echo "$EDIT_BOUNDS" | awk -F'[^0-9]+' '{print $3}')
    IX2=$(echo "$EDIT_BOUNDS" | awk -F'[^0-9]+' '{print $4}')
    IY2=$(echo "$EDIT_BOUNDS" | awk -F'[^0-9]+' '{print $5}')
    ICX=$(( (IX1 + IX2) / 2 ))
    ICY=$(( (IY1 + IY2) / 2 ))

    echo "▶ Tapping campo de texto em ($ICX, $ICY)..."
    adb -s "$DEVICE" shell input tap "$ICX" "$ICY"
    sleep 1

    echo "▶ Digitando URL..."
    adb -s "$DEVICE" shell input text "exp://10.0.2.2:8081"
    sleep 1

    echo "▶ Confirmando (Enter)..."
    adb -s "$DEVICE" shell input keyevent 66
    sleep 3
    echo "✓ URL enviada!"
  else
    echo "⚠ EditText não encontrado. Tentando tab + type..."
    adb -s "$DEVICE" shell input keyevent 61
    sleep 0.5
    adb -s "$DEVICE" shell input text "exp://10.0.2.2:8081"
    sleep 1
    adb -s "$DEVICE" shell input keyevent 66
    sleep 3
  fi
else
  echo "⚠ 'Enter URL manually' não encontrado. Dump completo:"
  cat /tmp/ui_tap.xml | grep -o 'text="[^"]*"' | sort -u | head -20

  echo "▶ Tentando tap direto nas coords conhecidas (344, 791)..."
  adb -s "$DEVICE" shell input tap 344 791
  sleep 2
  adb -s "$DEVICE" shell uiautomator dump /sdcard/ui2b.xml 2>/dev/null
  adb -s "$DEVICE" pull /sdcard/ui2b.xml /tmp/ui2b.xml 2>/dev/null
  EDIT_BOUNDS=$(awk -F'"' '{for(i=1;i<=NF;i++){if($i=="android.widget.EditText"){for(j=i;j<=NF;j++){if($j=="bounds"){print $(j+1);break}}}}}' /tmp/ui2b.xml 2>/dev/null | head -1)
  if [ -n "$EDIT_BOUNDS" ]; then
    IX1=$(echo "$EDIT_BOUNDS" | awk -F'[^0-9]+' '{print $2}')
    IY1=$(echo "$EDIT_BOUNDS" | awk -F'[^0-9]+' '{print $3}')
    IX2=$(echo "$EDIT_BOUNDS" | awk -F'[^0-9]+' '{print $4}')
    IY2=$(echo "$EDIT_BOUNDS" | awk -F'[^0-9]+' '{print $5}')
    ICX=$(( (IX1 + IX2) / 2 ))
    ICY=$(( (IY1 + IY2) / 2 ))
    adb -s "$DEVICE" shell input tap "$ICX" "$ICY"
    sleep 1
    adb -s "$DEVICE" shell input text "exp://10.0.2.2:8081"
    sleep 1
    adb -s "$DEVICE" shell input keyevent 66
    sleep 3
    echo "✓ URL enviada via fallback!"
  fi
fi

# Screenshot final
echo ""
echo "▶ Capturando screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/tap_url_final.png
adb -s "$DEVICE" pull /sdcard/tap_url_final.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/tap_url_final.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/tap_url_final.png" | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo ""
read -p "Pressione Enter para fechar..."
