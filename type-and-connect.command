#!/usr/bin/env bash
# O painel "Enter URL manually" já está expandido.
# Basta tocar no campo, limpar, digitar a URL e tocar Connect.
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Dump UI para encontrar EditText e botão Connect
adb -s "$DEVICE" shell uiautomator dump /sdcard/ui_pre.xml 2>/dev/null
adb -s "$DEVICE" pull /sdcard/ui_pre.xml /tmp/ui_pre.xml 2>/dev/null

echo "--- UI atual ---"
grep -o 'text="[^"]*"' /tmp/ui_pre.xml 2>/dev/null | sort -u | head -20

# Extrai bounds do EditText (input field exp://)
EDIT_BOUNDS=$(awk -F'"' '{for(i=1;i<=NF;i++){if($i=="android.widget.EditText"){for(j=i;j<=NF;j++){if($j=="bounds"){print $(j+1);break}}}}}' /tmp/ui_pre.xml 2>/dev/null | head -1)
echo "EditText bounds: '$EDIT_BOUNDS'"

if [ -n "$EDIT_BOUNDS" ]; then
  IX1=$(echo "$EDIT_BOUNDS" | awk -F'[^0-9]+' '{print $2}')
  IY1=$(echo "$EDIT_BOUNDS" | awk -F'[^0-9]+' '{print $3}')
  IX2=$(echo "$EDIT_BOUNDS" | awk -F'[^0-9]+' '{print $4}')
  IY2=$(echo "$EDIT_BOUNDS" | awk -F'[^0-9]+' '{print $5}')
  ICX=$(( (IX1 + IX2) / 2 ))
  ICY=$(( (IY1 + IY2) / 2 ))
  echo "Campo em: ($ICX, $ICY)"

  adb -s "$DEVICE" shell input tap "$ICX" "$ICY"
  sleep 1
  # Limpa campo (select all + delete)
  adb -s "$DEVICE" shell input keyevent KEYCODE_CTRL_A 2>/dev/null || true
  adb -s "$DEVICE" shell input keyevent KEYCODE_DEL
  sleep 0.3
  adb -s "$DEVICE" shell input text "10.0.2.2:8081"
  sleep 1
  echo "✓ URL digitada"
else
  # Fallback: coordenadas hardcoded (centro do input em ~y=1340 na tela 1080x2400)
  # Olhando screenshot: input visível ~1/4 da tela → aprox y=895, x=540
  echo "⚠ EditText não encontrado via awk — usando coords hardcoded..."
  adb -s "$DEVICE" shell input tap 540 895
  sleep 1
  adb -s "$DEVICE" shell input keyevent KEYCODE_CTRL_A 2>/dev/null || true
  adb -s "$DEVICE" shell input keyevent KEYCODE_DEL
  sleep 0.3
  adb -s "$DEVICE" shell input text "10.0.2.2:8081"
  sleep 1
  echo "✓ URL digitada (fallback)"
fi

# Dump novamente para encontrar Connect
adb -s "$DEVICE" shell uiautomator dump /sdcard/ui_typed.xml 2>/dev/null
adb -s "$DEVICE" pull /sdcard/ui_typed.xml /tmp/ui_typed.xml 2>/dev/null

CONN_BOUNDS=$(awk -F'"' '{for(i=1;i<=NF;i++){if($i=="Connect"){for(j=i;j<=NF;j++){if($j=="bounds"){print $(j+1);break}}}}}' /tmp/ui_typed.xml 2>/dev/null | head -1)
echo "Connect bounds: '$CONN_BOUNDS'"

if [ -n "$CONN_BOUNDS" ]; then
  CX1=$(echo "$CONN_BOUNDS" | awk -F'[^0-9]+' '{print $2}')
  CY1=$(echo "$CONN_BOUNDS" | awk -F'[^0-9]+' '{print $3}')
  CX2=$(echo "$CONN_BOUNDS" | awk -F'[^0-9]+' '{print $4}')
  CY2=$(echo "$CONN_BOUNDS" | awk -F'[^0-9]+' '{print $5}')
  CCX=$(( (CX1 + CX2) / 2 ))
  CCY=$(( (CY1 + CY2) / 2 ))
  echo "Connect em: ($CCX, $CCY)"
  adb -s "$DEVICE" shell input tap "$CCX" "$CCY"
  echo "✓ Connect tocado!"
else
  echo "⚠ Connect não encontrado — teclando Enter..."
  adb -s "$DEVICE" shell input keyevent 66
  echo "✓ Enter enviado"
fi

sleep 5

# Screenshot final
adb -s "$DEVICE" shell screencap -p /sdcard/luka_loaded.png
adb -s "$DEVICE" pull /sdcard/luka_loaded.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_loaded.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_loaded.png" | tr -d ' ')
echo ""
echo "Screenshot: $SIZE bytes"
echo "══════════════════════════════"
echo "  Luka carregando no Android?"
echo "══════════════════════════════"
read -p "Enter para fechar..."
