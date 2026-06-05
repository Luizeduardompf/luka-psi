#!/usr/bin/env bash
# Abre o Luka no simulador via simctl (sem precisar de toque)

echo "▶ Abrindo Luka no Expo Go via simctl..."
UDID=$(xcrun simctl list devices 2>/dev/null | grep "Booted" | grep -oE '[A-F0-9-]{36}' | head -1)

if [ -z "$UDID" ]; then
  echo "✗ Nenhum device booted"
  exit 1
fi

echo "✓ Device: $UDID"

# Abrir URL do Expo Go que aponta para o Metro bundler
xcrun simctl openurl "$UDID" "exp://127.0.0.1:8081"

echo "✓ Luka aberto no Expo Go"
read -p "Pressione Enter para fechar..."
