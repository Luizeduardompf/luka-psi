#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "══════════════════════════════════════════"
echo "  Luka — Setup & Launch"
echo "══════════════════════════════════════════"
echo ""

# ── 1. npm install ──────────────────────────────────────────────
echo "▶ [1/4] npm install..."
npm install --legacy-peer-deps 2>&1 | tail -5
echo "✓ npm install concluído"
echo ""

# ── 2. Verificar .env ───────────────────────────────────────────
if [ ! -f .env ]; then
  echo "✗ ERRO: .env não encontrado! Crie com EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY"
  exit 1
fi
echo "✓ .env encontrado"
echo ""

# ── 3. Verificar simuladores disponíveis ───────────────────────
echo "▶ [2/4] Verificando simuladores..."

IOS_OK=false
ANDROID_OK=false

if command -v xcrun &>/dev/null; then
  SIM=$(xcrun simctl list devices available 2>/dev/null | grep -E "iPhone [0-9]" | grep -v "unavailable" | tail -1 | sed 's/.*(\(.*\)) (.*/\1/')
  if [ -n "$SIM" ]; then
    IOS_OK=true
    echo "✓ iOS Simulator disponível"
  fi
fi

if command -v emulator &>/dev/null || [ -d "$HOME/Library/Android/sdk/emulator" ]; then
  ANDROID_OK=true
  echo "✓ Android SDK encontrado"
else
  echo "⚠ Android SDK não encontrado no PATH (será configurado abaixo)"
fi
echo ""

# ── 4. Exportar Android SDK path ───────────────────────────────
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

# ── 5. Criar AVD se não existir ────────────────────────────────
echo "▶ [3/4] Verificando AVD Android..."
if command -v avdmanager &>/dev/null; then
  EXISTING_AVD=$(avdmanager list avd 2>/dev/null | grep "Name:" | head -1 | awk '{print $2}')
  if [ -z "$EXISTING_AVD" ]; then
    echo "  Criando AVD Pixel_7_API_34..."
    # Accept all licenses
    yes | sdkmanager --licenses > /dev/null 2>&1 || true
    sdkmanager "system-images;android-34;google_apis;arm64-v8a" 2>&1 | tail -3
    echo "no" | avdmanager create avd \
      --name "Pixel_7_API_34" \
      --package "system-images;android-34;google_apis;arm64-v8a" \
      --device "pixel_7" 2>&1
    echo "✓ AVD criado: Pixel_7_API_34"
  else
    echo "✓ AVD existente: $EXISTING_AVD"
  fi
else
  echo "⚠ avdmanager não encontrado. Android emulator pode não funcionar."
  echo "  Abra Android Studio → Virtual Device Manager → crie um Pixel 7 API 34"
fi
echo ""

# ── 6. Launch ──────────────────────────────────────────────────
echo "▶ [4/4] Iniciando simuladores..."
echo ""
echo "  Escolha:"
echo "  [1] iOS Simulator"
echo "  [2] Android Emulator"
echo "  [3] Ambos (abre dois terminais)"
echo "  [4] Expo Go (QR code)"
echo ""
read -rp "  Opção (1/2/3/4): " CHOICE

case $CHOICE in
  1)
    echo "Iniciando iOS..."
    npx expo run:ios
    ;;
  2)
    echo "Iniciando Android..."
    npx expo run:android
    ;;
  3)
    echo "Iniciando iOS em background..."
    osascript -e 'tell application "Terminal" to do script "cd '"$PROJECT_DIR"' && export ANDROID_HOME=$HOME/Library/Android/sdk && export PATH=$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH && npx expo run:android"'
    sleep 2
    echo "Iniciando iOS..."
    npx expo run:ios
    ;;
  4)
    echo "Iniciando Expo Go (QR code)..."
    npx expo start
    ;;
  *)
    echo "Opção inválida. Rodando iOS..."
    npx expo run:ios
    ;;
esac
