#!/usr/bin/env bash
# Abre Expo Go no Android e conecta ao Metro (reload do Luka)
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

if [ -z "$DEVICE" ]; then
  echo "❌ Nenhum emulador conectado."
  read -p "Enter para fechar..."
  exit 1
fi

# Dismiss any dialog first
echo "▶ Verificando dialogs..."
adb -s "$DEVICE" shell uiautomator dump /sdcard/ui_check.xml 2>/dev/null
adb -s "$DEVICE" pull /sdcard/ui_check.xml /tmp/ui_check_reload.xml 2>/dev/null

if grep -q "Android App Compatibility" /tmp/ui_check_reload.xml 2>/dev/null; then
  echo "▶ Dismissing dialog..."
  adb -s "$DEVICE" shell input tap 820 2213
  sleep 2
fi

# Launch Expo Go
echo "▶ Abrindo Expo Go..."
adb -s "$DEVICE" shell am start -n host.exp.exponent/.experience.HomeActivity 2>/dev/null || \
adb -s "$DEVICE" shell monkey -p host.exp.exponent -c android.intent.category.LAUNCHER 1 2>/dev/null
sleep 3

# Check UI state
adb -s "$DEVICE" shell uiautomator dump /sdcard/ui_expo.xml 2>/dev/null
adb -s "$DEVICE" pull /sdcard/ui_expo.xml /tmp/ui_expo.xml 2>/dev/null
echo "Textos na UI:"
grep -o 'text="[^"]*"' /tmp/ui_expo.xml 2>/dev/null | sort -u | head -20

# If Luka is already running, trigger reload via shake + menu
if grep -q "Luka\|Pacientes\|Entrar\|exp://" /tmp/ui_expo.xml 2>/dev/null; then
  echo "▶ App já carregado — disparando reload..."
  # Shake gesture to open dev menu
  adb -s "$DEVICE" shell input keyevent 82 2>/dev/null  # Menu key
  sleep 1
  adb -s "$DEVICE" shell uiautomator dump /sdcard/ui_devmenu.xml 2>/dev/null
  adb -s "$DEVICE" pull /sdcard/ui_devmenu.xml /tmp/ui_devmenu.xml 2>/dev/null

  RELOAD_BOUNDS=$(awk -F'"' '{for(i=1;i<=NF;i++){if($i=="Reload"){for(j=i;j<=NF;j++){if($j=="bounds"){print $(j+1);break}}}}}' /tmp/ui_devmenu.xml 2>/dev/null | head -1)
  if [ -n "$RELOAD_BOUNDS" ]; then
    X=$(echo "$RELOAD_BOUNDS" | awk -F'[][,]' '{x=int(($2+$5)/2); print x}')
    Y=$(echo "$RELOAD_BOUNDS" | awk -F'[][,]' '{y=int(($3+$6)/2); print y}')
    echo "▶ Tapping Reload em ($X, $Y)..."
    adb -s "$DEVICE" shell input tap "$X" "$Y"
  fi
elif grep -q "Enter URL\|exp://" /tmp/ui_expo.xml 2>/dev/null; then
  echo "▶ Conectando ao Metro..."
  adb -s "$DEVICE" shell input tap 540 895
  sleep 0.5
  adb -s "$DEVICE" shell input keyevent 113
  sleep 0.3
  adb -s "$DEVICE" shell input keyevent 67
  sleep 0.3
  adb -s "$DEVICE" shell input text "exp://10.0.2.2:8081"
  sleep 0.8
  adb -s "$DEVICE" shell input keyevent 111
  sleep 0.5
  adb -s "$DEVICE" shell input tap 540 1055
  echo "✓ Connect tocado!"
fi

sleep 8

echo "▶ Screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_reload.png
adb -s "$DEVICE" pull /sdcard/luka_reload.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_reload.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_reload.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo ""
echo "══ Fim ══"
read -p "Enter para fechar..."
