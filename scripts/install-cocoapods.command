#!/usr/bin/env bash

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo ""
echo "══════════════════════════════════════════"
echo "  Instalando CocoaPods (sem sudo)"
echo "══════════════════════════════════════════"
echo ""

if command -v pod &>/dev/null; then
  echo "✓ CocoaPods já instalado: $(pod --version)"
  exit 0
fi

# Try gem --user-install (no sudo required, installs to ~/.gem)
echo "▶ Instalando CocoaPods via gem --user-install..."
GEM_USER_DIR="$(ruby -e 'puts Gem.user_dir' 2>/dev/null)"
echo "  Destino: $GEM_USER_DIR"

gem install cocoapods --user-install --no-document

# Add user gem bin to PATH
GEM_BIN="$(ruby -e 'puts Gem.user_bindir' 2>/dev/null)"
export PATH="$GEM_BIN:$PATH"

if command -v pod &>/dev/null; then
  echo ""
  echo "✓ CocoaPods instalado: $(pod --version)"
  echo ""
  echo "  Adicione esta linha ao seu ~/.zshrc para manter o PATH:"
  echo "  export PATH=\"$GEM_BIN:\$PATH\""
  echo ""
  echo "══════════════════════════════════════════"
  echo "  Sucesso! Agora abra fix-and-run-ios.command"
  echo "══════════════════════════════════════════"
else
  echo "✗ CocoaPods não encontrado após instalação"
  echo "  Tente: gem install cocoapods --user-install"
  exit 1
fi
