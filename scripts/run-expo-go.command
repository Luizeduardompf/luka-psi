#!/usr/bin/env bash
set -e

PROJECT_DIR="$HOME/Documents/Claude/Projects/Luka/Luka"
cd "$PROJECT_DIR"

echo ""
echo "══════════════════════════════════════════"
echo "  Luka — Expo Go (iOS Simulator)"
echo "══════════════════════════════════════════"
echo ""

# ── node_modules check ────────────────────────────────────────
if [ ! -d node_modules/metro ]; then
  echo "▶ Removendo node_modules antigos..."
  rm -rf node_modules package-lock.json
  echo "▶ npm install (aguarde ~2 min)..."
  npm install --legacy-peer-deps
  echo "✓ npm install concluído"
  echo ""
else
  echo "✓ node_modules OK"
  echo ""
fi

# ── .env check ────────────────────────────────────────────────
if [ ! -f .env ]; then
  echo "✗ ERRO: .env não encontrado!"
  exit 1
fi
echo "✓ .env OK"
echo ""

# ── Abre Simulator antes do Expo (evita osascript System Events) ──
echo "▶ Abrindo iOS Simulator..."
open -a Simulator
echo "▶ Aguardando Simulator iniciar (15s)..."
sleep 15
echo "✓ Simulator aberto"
echo ""

# ── Expo Start com --clear ────────────────────────────────────
echo "▶ Iniciando Expo Go (Metro + QR)..."
echo "  O Simulator já está aberto e será detectado automaticamente."
echo ""
npx expo start --go --clear
