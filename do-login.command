#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
SCREENSHOTS="$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"
mkdir -p "$SCREENSHOTS"

ss() {
  adb -s "$DEVICE" shell screencap -p /sdcard/sc_dol.png
  adb -s "$DEVICE" pull /sdcard/sc_dol.png "$SCREENSHOTS/$1.png" 2>/dev/null
  echo "  📸 $1.png"
}

echo "Device: $DEVICE"
ss "DOL00_estado_inicial"

# ── Campo e-mail ──
echo "[ 1 ] Campo e-mail (y=900)..."
adb -s "$DEVICE" shell input tap 540 900
sleep 0.8
# Limpa o campo com ctrl+a + delete
adb -s "$DEVICE" shell input keyevent 29  # A
# Nao funciona com ctrl. Seleciona tudo via longpress + select all
adb -s "$DEVICE" shell input keyevent --longpress 123  # KEYCODE_MOVE_END (move to end)
sleep 0.3
# Seleciona tudo com shift+ctrl+home
adb -s "$DEVICE" shell input keyevent 122  # KEYCODE_MOVE_HOME
sleep 0.2
# Limpa com CTRL+A then DELETE
adb -s "$DEVICE" shell input text ""
# Mais simples: usar adb para limpar via selectAll + cut
adb -s "$DEVICE" shell input keyevent 28  # END
sleep 0.2
# Delete tudo caracter a caracter seria lento. Usar outro método:
# Triple click seleciona a linha toda no Android
adb -s "$DEVICE" shell input tap 540 900
sleep 0.3
adb -s "$DEVICE" shell input tap 540 900
sleep 0.3
adb -s "$DEVICE" shell input tap 540 900
sleep 0.5
# Apaga seleção
adb -s "$DEVICE" shell input keyevent 67  # BACKSPACE
sleep 0.3
# Digita email
adb -s "$DEVICE" shell input text "demo"
adb -s "$DEVICE" shell input keyevent 77    # KEYCODE_AT = @
adb -s "$DEVICE" shell input text "luka.app"
sleep 0.3

# ── Campo senha ──
echo "[ 2 ] Campo senha (y=1100)..."
adb -s "$DEVICE" shell input tap 540 1100
sleep 0.8
# Triple tap para selecionar tudo
adb -s "$DEVICE" shell input tap 540 1100
sleep 0.3
adb -s "$DEVICE" shell input tap 540 1100
sleep 0.3
adb -s "$DEVICE" shell input tap 540 1100
sleep 0.5
adb -s "$DEVICE" shell input keyevent 67  # BACKSPACE para limpar
sleep 0.3
# Digita senha
adb -s "$DEVICE" shell input text "Demo"
adb -s "$DEVICE" shell input keyevent 77    # @
adb -s "$DEVICE" shell input text "123456"
sleep 0.5
ss "DOL01_credentials"

# ── Submete com returnKey Done (keyevent 66 = ENTER) ──
# O campo senha tem onSubmitEditing={handleSubmit(onSubmit)} e returnKeyType="done"
echo "[ 3 ] Submetendo via returnKey Done (keyevent 66)..."
adb -s "$DEVICE" shell input keyevent 66  # KEYCODE_ENTER / Done
echo "  ⏳ Aguardando login (15s)..."
sleep 15
ss "DOL02_after_login"

echo ""
echo "[ 4 ] Verificando resultado..."
FOCUS=$(adb -s "$DEVICE" shell dumpsys window windows 2>/dev/null | grep mCurrentFocus | head -1)
echo "  Foco: $FOCUS"

# Navega pelas abas se logado
echo "[ 5 ] Tentando navegar (Pacientes tab)..."
adb -s "$DEVICE" shell input tap 405 2340
sleep 2
ss "DOL03_pacientes"

echo "[ 6 ] Agenda tab..."
adb -s "$DEVICE" shell input tap 675 2340
sleep 2
ss "DOL04_agenda"
