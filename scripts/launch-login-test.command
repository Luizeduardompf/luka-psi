#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
SCREENSHOTS="$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"
mkdir -p "$SCREENSHOTS"

ss() {
  adb -s "$DEVICE" shell screencap -p /sdcard/sc_ll.png
  adb -s "$DEVICE" pull /sdcard/sc_ll.png "$SCREENSHOTS/$1.png" 2>/dev/null
  echo "  📸 $1.png"
}

echo "Device: $DEVICE"

# ── Verifica Metro ──
echo "[ 0 ] Verificando Metro (localhost:8081)..."
for i in $(seq 1 20); do
  STATUS=$(curl -s --max-time 2 http://localhost:8081/status 2>/dev/null)
  if echo "$STATUS" | grep -q "packager-status:running"; then
    echo "  ✓ Metro OK"
    break
  fi
  echo "  ⏳ Aguardando Metro... ($i/20)"
  sleep 3
done

# ── Lança app via deep link ──
echo "[ 1 ] Force-stop Expo Go..."
adb -s "$DEVICE" shell am force-stop host.exp.exponent
sleep 2

echo "[ 2 ] Lançando via deeplink exp://10.0.2.2:8081..."
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081"
sleep 5

# Dismiss dialog compatibilidade se aparecer
adb -s "$DEVICE" shell input tap 540 2230
sleep 2

echo "[ 3 ] Aguardando app carregar (25s)..."
sleep 25
ss "LL01_app_loaded"

# ── Fecha developer menu ──
echo "[ 4 ] Fechando dev menu..."
adb -s "$DEVICE" shell input tap 660 580
sleep 1.5
adb -s "$DEVICE" shell input tap 540 200
sleep 1
ss "LL02_menu_closed"

# ── Login ──
echo "[ 5 ] Preenchendo e-mail..."
adb -s "$DEVICE" shell input tap 540 900
sleep 0.5
adb -s "$DEVICE" shell input text "demo"
adb -s "$DEVICE" shell input keyevent 77
adb -s "$DEVICE" shell input text "luka.app"
sleep 0.3

echo "[ 6 ] Preenchendo senha..."
adb -s "$DEVICE" shell input tap 540 1100
sleep 0.5
adb -s "$DEVICE" shell input text "Demo"
adb -s "$DEVICE" shell input keyevent 77
adb -s "$DEVICE" shell input text "123456"
sleep 0.3
ss "LL03_credentials"

echo "[ 7 ] Clicando Entrar..."
adb -s "$DEVICE" shell input tap 540 1310
echo "  ⏳ Aguardando login (15s)..."
sleep 15
ss "LL04_after_login"

# ── Navega pelas abas ──
echo "[ 8 ] Verificando home/dashboard..."
ss "LL05_home"

echo "[ 9 ] Navegando para Pacientes..."
adb -s "$DEVICE" shell input tap 405 2340
sleep 3
ss "LL06_pacientes"

echo "[ 10 ] Navegando para Agenda..."
adb -s "$DEVICE" shell input tap 675 2340
sleep 2
ss "LL07_agenda"

echo ""
echo "══════════════════════════════════════"
echo "  Teste concluído!"
echo "  Screenshots em test-screenshots/"
echo "══════════════════════════════════════"
ls "$SCREENSHOTS/"LL*.png
