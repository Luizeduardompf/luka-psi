#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
SCREENSHOTS="$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"
mkdir -p "$SCREENSHOTS"

ss() {
  adb -s "$DEVICE" shell screencap -p /sdcard/sc_x.png
  adb -s "$DEVICE" pull /sdcard/sc_x.png "$SCREENSHOTS/$1.png" 2>/dev/null
  echo "  📸 $1.png"
}

echo "Device: $DEVICE"

# ── Fecha developer menu via botão X (x=660, y=580 device) ──
echo "[ 0 ] Fechando dev menu com X..."
adb -s "$DEVICE" shell input tap 660 580
sleep 1.5
ss "X00_after_close"

# Se ainda aberto, tenta tap fora do modal (y=200 acima do modal)
adb -s "$DEVICE" shell input tap 540 200
sleep 1
ss "X01_after_outside_tap"

# ── T1: Login ──
echo "[ T1 ] Tela de login - preenchendo credenciais..."
# Campo email (y≈900)
adb -s "$DEVICE" shell input tap 540 900
sleep 0.5
adb -s "$DEVICE" shell input text "demo"
adb -s "$DEVICE" shell input keyevent 77  # @
adb -s "$DEVICE" shell input text "luka.app"
sleep 0.3

# Campo senha (y≈1100)
adb -s "$DEVICE" shell input tap 540 1100
sleep 0.5
adb -s "$DEVICE" shell input text "Demo"
adb -s "$DEVICE" shell input keyevent 77  # @
adb -s "$DEVICE" shell input text "123456"
sleep 0.3
ss "X02_credentials"

echo "[ T2 ] Clicando Entrar (y=1310)..."
adb -s "$DEVICE" shell input tap 540 1310
echo "  ⏳ Aguardando login (15s)..."
sleep 15
ss "X03_after_login"

echo "✓ Feito! Verificando resultado..."
