#!/usr/bin/env bash
# Teste de login refinado — lida com @ via clipboard workaround
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
SCREENSHOTS="$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"
mkdir -p "$SCREENSHOTS"

echo ""
echo "══════════════════════════════════════════"
echo "  Luka — Teste de Login (Android)"
echo "  Device: $DEVICE"
echo "══════════════════════════════════════════"
echo ""

tap() { adb -s "$DEVICE" shell input tap "$1" "$2"; sleep 0.8; }
screenshot() {
  adb -s "$DEVICE" shell screencap -p /sdcard/sc_$1.png
  adb -s "$DEVICE" pull /sdcard/sc_$1.png "$SCREENSHOTS/$1.png" 2>/dev/null
  echo "  📸 $1.png"
}

# Reabre o app Luka no Expo Go para garantir estado limpo
echo "▶ Reabrindo Luka..."
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" \
  host.exp.exponent/.experience.HomeActivity 2>/dev/null || \
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" 2>/dev/null || true
sleep 5
screenshot "L0_app_opened"

# Testar navegação para "Criar conta"
# Coordenadas corrigidas: "Criar conta" em y≈1700, x≈700 (1080x2400)
echo ""
echo "[ T1 ] Navegar para Criar Conta"
tap 700 1700
sleep 2
screenshot "L1_criar_conta"

# Se não navegou, tentar y=1650 x=680
echo "[ T1b ] Tentativa alternativa"
tap 680 1650
sleep 2
screenshot "L1b_criar_conta_alt"

# Volta
adb -s "$DEVICE" shell input keyevent KEYCODE_BACK
sleep 1

# Agora testa login — usa input text com @ escapado para shell
# No bash, passar como argumento separado funciona melhor
echo ""
echo "[ T2 ] Preencher E-mail"
tap 540 900   # campo email
sleep 0.5
# adb shell input text tem bug com @
# Workaround: digitar caractere a caractere via keycode para @
# Ou usar split: texto antes e depois do @
adb -s "$DEVICE" shell input text "demo"
# @ = KEYCODE_AT (77) no Android
adb -s "$DEVICE" shell input keyevent 77
adb -s "$DEVICE" shell input text "luka.app"
sleep 0.3

echo "[ T3 ] Preencher Senha"
tap 540 1140  # campo senha
sleep 0.5
adb -s "$DEVICE" shell input text "Demo"
# @ = KEYCODE_AT (77)
# Senha: Demo@123456
adb -s "$DEVICE" shell input keyevent 77
adb -s "$DEVICE" shell input text "123456"
sleep 0.3

screenshot "L2_credentials_filled"

echo "[ T4 ] Clicando Entrar"
tap 540 1350  # botão Entrar
echo "  ⏳ Aguardando resposta Supabase (10s)..."
sleep 10
screenshot "L3_after_login_attempt"

# Verifica se está no dashboard (não mais na tela de login)
CURRENT_PKG=$(adb -s "$DEVICE" shell dumpsys window windows 2>/dev/null | grep -E "mCurrentFocus|mFocusedApp" | head -1)
echo "  App em foco: $CURRENT_PKG"

echo ""
echo "══════════════════════════════════════════"
echo "  Screenshots salvos em test-screenshots/"
echo "══════════════════════════════════════════"
ls "$SCREENSHOTS/"
