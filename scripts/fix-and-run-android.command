#!/usr/bin/env bash
set -e

PROJECT_DIR="$HOME/Documents/Claude/Projects/Luka/Luka"
cd "$PROJECT_DIR"

export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

echo ""
echo "══════════════════════════════════════════"
echo "  Luka — Clean Install + Android"
echo "══════════════════════════════════════════"
echo ""

# Só reinstala se node_modules estiver ausente (iOS pode ter feito isso já)
if [ ! -d node_modules ] || [ ! -d node_modules/metro ]; then
  echo "▶ Removendo node_modules corrompido..."
  rm -rf node_modules
  echo "▶ npm install (aguarde ~2 min)..."
  npm install --legacy-peer-deps
  echo "✓ npm install concluído"
fi

echo "✓ Dependências OK"
echo ""

echo "▶ Verificando Android SDK..."
if [ ! -d "$ANDROID_HOME" ]; then
  echo "✗ Android SDK não encontrado em $ANDROID_HOME"
  echo "  Abra Android Studio → SDK Manager para configurar"
  exit 1
fi
echo "✓ Android SDK: $ANDROID_HOME"
echo ""

echo "▶ Verificando AVD..."
AVD=$(avdmanager list avd 2>/dev/null | grep "Name:" | head -1 | awk '{print $2}')
if [ -z "$AVD" ]; then
  echo "⚠ Nenhum AVD encontrado."
  echo "  Abra Android Studio → Virtual Device Manager → Create Virtual Device"
  echo "  (Pixel 7, API 35, ARM)"
  read -p "  Pressione Enter após criar o AVD..."
fi

echo "▶ Iniciando Android Emulator..."
npx expo run:android
