#!/usr/bin/env bash
set -e

PROJECT_DIR="$HOME/Documents/Claude/Projects/Luka/Luka"
cd "$PROJECT_DIR"

echo ""
echo "══════════════════════════════════════════"
echo "  Luka — Git Push (SSH fix)"
echo "══════════════════════════════════════════"
echo ""

# ── Adiciona GitHub ao known_hosts ──────────────────────────────
mkdir -p ~/.ssh
chmod 700 ~/.ssh

if ! grep -q "github.com" ~/.ssh/known_hosts 2>/dev/null; then
  echo "▶ Adicionando github.com ao known_hosts..."
  ssh-keyscan -t ed25519,rsa github.com >> ~/.ssh/known_hosts 2>/dev/null
  echo "✓ github.com adicionado ao known_hosts"
else
  echo "✓ github.com já está no known_hosts"
fi
echo ""

# ── Verifica SSH key ─────────────────────────────────────────────
if ! ssh -T git@github.com 2>&1 | grep -q "Hi "; then
  echo "⚠ SSH auth pode ter problema. Continuando mesmo assim..."
fi

# ── Push ─────────────────────────────────────────────────────────
echo "▶ Fazendo push para GitHub..."
GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=accept-new" \
  git push -u origin main

echo ""
echo "══════════════════════════════════════════"
echo "  ✓ Push concluído!"
echo "  https://github.com/Luizeduardompf/luka-psi"
echo "══════════════════════════════════════════"
echo ""
