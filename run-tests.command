#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
SCREENSHOTS="$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"
mkdir -p "$SCREENSHOTS"

tap()  { adb -s "$DEVICE" shell input tap "$1" "$2"; sleep 0.8; }
wait() { sleep "$1"; }
ss()   {
  adb -s "$DEVICE" shell screencap -p /sdcard/sc_t.png
  adb -s "$DEVICE" pull /sdcard/sc_t.png "$SCREENSHOTS/$1.png" 2>/dev/null
  echo "  📸 $1.png"
}

echo "Device: $DEVICE"

# ── Fecha developer menu (botão Continue y≈2173 device, x=540) ──
echo "[ 0 ] Fechando developer menu..."
# Continue button - device coords (1080x2400): y≈2173 baseado no screenshot (54% screen)
# Screenshot mostrou ~540px de 1000px visible = y≈1300 no device com partial view
# Usando y=2173 para "Continue" no device 1080x2400
adb -s "$DEVICE" shell input tap 540 2173
wait 1.5
ss "T00_menu_closed"

# ── T1: Verificar tela de login ──
echo "[ T1 ] Tela de login"
ss "T01_login_screen"

# ── T2: Login com credenciais demo ──
echo "[ T2 ] Preenchendo e-mail..."
tap 540 900  # campo email
sleep 0.5
adb -s "$DEVICE" shell input text "demo"
adb -s "$DEVICE" shell input keyevent 77   # @
adb -s "$DEVICE" shell input text "luka.app"
sleep 0.3

echo "[ T3 ] Preenchendo senha..."
tap 540 1100  # campo senha
sleep 0.5
adb -s "$DEVICE" shell input text "Demo"
adb -s "$DEVICE" shell input keyevent 77   # @
adb -s "$DEVICE" shell input text "123456"
sleep 0.3
ss "T02_credentials_filled"

echo "[ T4 ] Clicando Entrar..."
tap 540 1310  # botão Entrar
echo "  ⏳ Aguardando login (12s)..."
sleep 12
ss "T03_after_login"

# ── T5: Verificar se está no Dashboard ──
echo "[ T5 ] Verificando dashboard/home..."
ss "T04_dashboard"

# ── T6: Navegar para Pacientes ──
echo "[ T6 ] Navegando para Pacientes (tab 2)..."
tap 405 2340  # tab Pacientes
wait 2
ss "T05_pacientes"

# ── T7: Navegar para Agenda ──
echo "[ T7 ] Navegando para Agenda (tab 3)..."
tap 675 2340  # tab Agenda
wait 2
ss "T06_agenda"

# ── T8: Voltar para Home ──
echo "[ T8 ] Voltando para Home (tab 1)..."
tap 135 2340  # tab Home
wait 2
ss "T07_home"

echo ""
echo "══════════════════════════════════════"
echo "  Testes concluídos!"
echo "  Screenshots em test-screenshots/"
echo "══════════════════════════════════════"
ls "$SCREENSHOTS/"T0*.png
