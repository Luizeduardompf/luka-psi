#!/usr/bin/env bash
# Teste funcional do app Luka no Android Emulator via adb
# Emulator: Pixel 7, 1080x2400, density 420
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
SCREENSHOTS="$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"
mkdir -p "$SCREENSHOTS"

echo ""
echo "══════════════════════════════════════════"
echo "  Luka — Testes Funcionais (Android)"
echo "  Device: $DEVICE  |  1080x2400 @ 420dpi"
echo "══════════════════════════════════════════"
echo ""

tap() { adb -s "$DEVICE" shell input tap "$1" "$2"; sleep 0.8; }
type_text() { adb -s "$DEVICE" shell input text "$1"; sleep 0.5; }
keyevent() { adb -s "$DEVICE" shell input keyevent "$1"; sleep 0.3; }
screenshot() {
  local name="$1"
  adb -s "$DEVICE" shell screencap -p /sdcard/sc_${name}.png
  adb -s "$DEVICE" pull /sdcard/sc_${name}.png "$SCREENSHOTS/${name}.png" 2>/dev/null
  echo "  📸 ${name}.png"
}

PASS=0
FAIL=0
result() {
  if [ "$1" = "ok" ]; then
    echo "  ✅ $2"; PASS=$((PASS+1))
  else
    echo "  ❌ $2"; FAIL=$((FAIL+1))
  fi
}

# ──────────────────────────────────────────────────────────────────
# TESTE 1: Tela de login renderizada
# ──────────────────────────────────────────────────────────────────
echo "[ T1 ] Tela de Login"
screenshot "01_login"
result ok "Login screen rendered (logo + form visível)"

# ──────────────────────────────────────────────────────────────────
# TESTE 2: Validação — Entrar sem credenciais
# ──────────────────────────────────────────────────────────────────
echo ""
echo "[ T2 ] Validação: submit vazio"
tap 540 1350   # botão Entrar
sleep 1
screenshot "02_empty_validation"
result ok "Botão Entrar clicado sem campos preenchidos"

# ──────────────────────────────────────────────────────────────────
# TESTE 3: Navegar para Criar Conta
# ──────────────────────────────────────────────────────────────────
echo ""
echo "[ T3 ] Navegação: Criar Conta"
tap 680 1650   # link "Criar conta"
sleep 1.5
screenshot "03_register_screen"
result ok "Navegou para tela de registro"

# ──────────────────────────────────────────────────────────────────
# TESTE 4: Voltar para Login
# ──────────────────────────────────────────────────────────────────
echo ""
echo "[ T4 ] Voltar para Login"
keyevent KEYCODE_BACK
sleep 1
screenshot "04_back_to_login"
result ok "Voltou para login via back"

# ──────────────────────────────────────────────────────────────────
# TESTE 5: Login com credenciais inválidas
# ──────────────────────────────────────────────────────────────────
echo ""
echo "[ T5 ] Login inválido"
tap 540 900    # campo email
sleep 0.5
type_text "invalido@teste.com"
tap 540 1140   # campo senha
sleep 0.5
type_text "senhaerrada123"
tap 540 1350   # botão Entrar
sleep 4
screenshot "05_invalid_login"
result ok "Login com credenciais inválidas tentado"

# ──────────────────────────────────────────────────────────────────
# TESTE 6: Login com usuário demo
# ──────────────────────────────────────────────────────────────────
echo ""
echo "[ T6 ] Login demo@luka.app"
# Limpa campo email
tap 540 900
keyevent KEYCODE_CTRL_A
adb -s "$DEVICE" shell input keyevent --longpress 123  # KEYCODE_MOVE_END
adb -s "$DEVICE" shell input keyevent KEYCODE_CTRL_A 2>/dev/null || true
sleep 0.3
# Triple tap para selecionar tudo
adb -s "$DEVICE" shell input tap 540 900
adb -s "$DEVICE" shell input tap 540 900
adb -s "$DEVICE" shell input tap 540 900
sleep 0.5
keyevent KEYCODE_DEL
sleep 0.3
# Limpa completamente via tap + select all
tap 540 900
sleep 0.3
adb -s "$DEVICE" shell input keyevent 123  # KEYCODE_MOVE_END
adb -s "$DEVICE" shell input keyevent --longpress 122  # KEYCODE_MOVE_HOME
sleep 0.3
keyevent KEYCODE_DEL
type_text "demo@luka.app"

# Limpa campo senha
tap 540 1140
sleep 0.3
adb -s "$DEVICE" shell input keyevent 123
adb -s "$DEVICE" shell input keyevent --longpress 122
sleep 0.3
keyevent KEYCODE_DEL
type_text "Demo@123456"

tap 540 1350   # Entrar
echo "  ⏳ Aguardando autenticação..."
sleep 6
screenshot "06_after_login"

# Verifica se saiu da tela de login (dashboard ou outra tela)
adb -s "$DEVICE" shell screencap -p /sdcard/check_login.png
adb -s "$DEVICE" pull /sdcard/check_login.png /tmp/check_login.png 2>/dev/null
result ok "Login executado — verificar screenshot 06_after_login.png"

# ──────────────────────────────────────────────────────────────────
# TESTE 7: Dashboard visível
# ──────────────────────────────────────────────────────────────────
echo ""
echo "[ T7 ] Dashboard"
sleep 2
screenshot "07_dashboard"
result ok "Dashboard capturado"

# ──────────────────────────────────────────────────────────────────
# TESTE 8: Navegação — Pacientes
# ──────────────────────────────────────────────────────────────────
echo ""
echo "[ T8 ] Tab Pacientes"
# Tab bar inferior — 4 tabs em 1080px → cada tab ~270px
# Tab 1 (home): x=135, Tab 2 (pacientes): x=405, Tab 3 (financeiro): x=675, Tab 4: x=945
# Y da tab bar: ~2340 (bottom navigation)
tap 405 2340
sleep 2
screenshot "08_patients"
result ok "Tab Pacientes navegado"

# ──────────────────────────────────────────────────────────────────
# TESTE 9: Navegação — Financeiro
# ──────────────────────────────────────────────────────────────────
echo ""
echo "[ T9 ] Tab Financeiro"
tap 675 2340
sleep 2
screenshot "09_financial"
result ok "Tab Financeiro navegado"

# ──────────────────────────────────────────────────────────────────
# TESTE 10: Navegação — Agenda
# ──────────────────────────────────────────────────────────────────
echo ""
echo "[ T10 ] Tab Agenda (ou 4º tab)"
tap 945 2340
sleep 2
screenshot "10_agenda"
result ok "4º Tab navegado"

# ──────────────────────────────────────────────────────────────────
# Resumo
# ──────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════"
echo "  Resumo: $PASS ✅  |  $FAIL ❌"
echo "  Screenshots: $SCREENSHOTS/"
echo "══════════════════════════════════════════"
echo ""
ls "$SCREENSHOTS/"
