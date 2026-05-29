#!/usr/bin/env bash
set -e

PROJECT_DIR="$HOME/Documents/Claude/Projects/Luka/Luka"
cd "$PROJECT_DIR"

# Setup PATH (Homebrew + gem user bindir)
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
GEM_BIN="$(ruby -e 'puts Gem.user_bindir' 2>/dev/null)"
[ -n "$GEM_BIN" ] && export PATH="$GEM_BIN:$PATH"

echo ""
echo "══════════════════════════════════════════"
echo "  Luka — iOS Simulator"
echo "══════════════════════════════════════════"
echo ""

# ── CocoaPods check ────────────────────────────────────────────
if ! command -v pod &>/dev/null; then
  echo "▶ CocoaPods não encontrado. Instalando via gem..."
  gem install cocoapods --user-install --no-document
  GEM_BIN="$(ruby -e 'puts Gem.user_bindir' 2>/dev/null)"
  [ -n "$GEM_BIN" ] && export PATH="$GEM_BIN:$PATH"
fi

if command -v pod &>/dev/null; then
  echo "✓ CocoaPods: $(pod --version)"
else
  echo "✗ CocoaPods não instalado. Execute install-cocoapods.command primeiro."
  exit 1
fi
echo ""

# ── npm install ────────────────────────────────────────────────
if [ ! -d node_modules/metro ]; then
  echo "▶ Removendo node_modules e package-lock.json..."
  rm -rf node_modules package-lock.json
  echo "▶ npm install (aguarde ~2 min)..."
  npm install --legacy-peer-deps
  echo "✓ npm install concluído"
  echo ""
else
  echo "✓ node_modules OK"
  echo ""
fi

# ── .env check ─────────────────────────────────────────────────
if [ ! -f .env ]; then
  echo "✗ ERRO: .env não encontrado!"
  exit 1
fi
echo "✓ .env OK"
echo ""

# ── Expo run:ios ───────────────────────────────────────────────
echo "▶ Iniciando iOS Simulator (pode levar 3-5 min na primeira vez)..."
npx expo run:ios
