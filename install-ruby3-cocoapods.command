#!/usr/bin/env bash

export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.rbenv/bin:$HOME/.rbenv/shims:$PATH"

echo ""
echo "══════════════════════════════════════════"
echo "  Instalando Ruby 3 + CocoaPods"
echo "  (sem sudo, ~10 min)"
echo "══════════════════════════════════════════"
echo ""

# ── Step 1: rbenv ──────────────────────────────────────────────
if ! command -v rbenv &>/dev/null; then
  echo "▶ Instalando rbenv..."
  curl -fsSL https://github.com/rbenv/rbenv-installer/raw/HEAD/bin/rbenv-installer | bash
  export PATH="$HOME/.rbenv/bin:$HOME/.rbenv/shims:$PATH"
  eval "$(rbenv init -)"
  echo "✓ rbenv instalado"
else
  echo "✓ rbenv já instalado"
  eval "$(rbenv init -)"
fi
echo ""

# ── Step 2: Ruby 3.2.x ────────────────────────────────────────
RUBY_VERSION="3.2.3"
if rbenv versions | grep -q "$RUBY_VERSION"; then
  echo "✓ Ruby $RUBY_VERSION já instalado"
else
  echo "▶ Instalando Ruby $RUBY_VERSION (compilando, aguarde ~10 min)..."
  # Install build deps via brew if available
  if command -v brew &>/dev/null; then
    brew install openssl readline libyaml 2>/dev/null || true
  fi
  RUBY_CONFIGURE_OPTS="--with-openssl-dir=$(brew --prefix openssl 2>/dev/null || echo /usr)" \
    rbenv install "$RUBY_VERSION"
  echo "✓ Ruby $RUBY_VERSION instalado"
fi
echo ""

# ── Step 3: Set global Ruby ────────────────────────────────────
rbenv global "$RUBY_VERSION"
eval "$(rbenv init -)"
echo "✓ Ruby ativo: $(ruby --version)"
echo ""

# ── Step 4: CocoaPods ─────────────────────────────────────────
echo "▶ Instalando CocoaPods..."
gem install cocoapods --no-document
rbenv rehash
echo "✓ CocoaPods: $(pod --version)"
echo ""

# ── Step 5: Add to shell profile ──────────────────────────────
ZSHRC="$HOME/.zshrc"
RBENV_LINE='eval "$(rbenv init - zsh)"'
if ! grep -q "rbenv init" "$ZSHRC" 2>/dev/null; then
  echo "" >> "$ZSHRC"
  echo '# rbenv' >> "$ZSHRC"
  echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> "$ZSHRC"
  echo "$RBENV_LINE" >> "$ZSHRC"
  echo "✓ rbenv adicionado ao ~/.zshrc"
fi

echo ""
echo "══════════════════════════════════════════"
echo "  Sucesso! Ruby + CocoaPods prontos."
echo "  Agora abra: fix-and-run-ios.command"
echo "══════════════════════════════════════════"
echo ""
