#!/usr/bin/env bash
set -e

PROJECT_DIR="$HOME/Documents/Claude/Projects/Luka/Luka"
cd "$PROJECT_DIR"

echo ""
echo "══════════════════════════════════════════"
echo "  Luka — Git Commit + Push GitHub"
echo "══════════════════════════════════════════"
echo ""

# Remove stale lock if exists
rm -f .git/index.lock
echo "✓ Lock limpo"

# Git config
git config user.email "luizeduardompf@gmail.com"
git config user.name "Luiz Eduardo"

# Verifica remote
if git remote get-url origin 2>/dev/null | grep -q "github"; then
  echo "✓ Remote origin: $(git remote get-url origin)"
else
  echo "▶ Adicionando remote origin..."
  git remote add origin git@github.com:Luizeduardompf/luka-psi.git 2>/dev/null || \
  git remote set-url origin git@github.com:Luizeduardompf/luka-psi.git
fi

# Commit inicial
if git log --oneline 2>/dev/null | grep -q .; then
  echo "✓ Já tem commits:"
  git log --oneline | head -3
else
  echo "▶ Fazendo commit inicial..."
  git add -A
  git commit -m "feat: initial commit — Luka v1.0.0

- React Native + Expo SDK 52 + Expo Router v4
- NativeWind v4 (Tailwind CSS para React Native)
- Supabase Auth + PostgreSQL com RLS
- Gestão de pacientes, sessões e financeiro
- Telas: login, splash, pacientes, nova sessão, financeiro
- iOS Simulator rodando via Expo Go"
  echo "✓ Commit feito"
fi

echo ""
echo "▶ Fazendo push para GitHub (main)..."
git push -u origin main
echo ""
echo "══════════════════════════════════════════"
echo "  ✓ Push concluído!"
echo "  https://github.com/Luizeduardompf/luka-psi"
echo "══════════════════════════════════════════"
echo ""
