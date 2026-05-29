#!/usr/bin/env bash
set -e

PROJECT_DIR="$HOME/Documents/Claude/Projects/Luka/Luka"
cd "$PROJECT_DIR"

# ── Primeiro: chmod +x nos scripts novos ────────────────────────
chmod +x "$PROJECT_DIR"/*.command 2>/dev/null || true
echo "✓ chmod +x aplicado em todos os .command"
echo ""

echo ""
echo "══════════════════════════════════════════"
echo "  Luka — iOS Simulator (via xcrun simctl)"
echo "══════════════════════════════════════════"
echo ""

# ── Garante que Simulator está rodando ──────────────────────────
if ! pgrep -x "Simulator" > /dev/null 2>&1; then
  echo "▶ Abrindo Simulator..."
  open -a Simulator
  echo "▶ Aguardando boot (20s)..."
  sleep 20
else
  echo "✓ Simulator já está rodando"
fi

# ── Aguarda um device Booted ────────────────────────────────────
echo "▶ Aguardando device bootar..."
UDID=""
for i in $(seq 1 20); do
  UDID=$(xcrun simctl list devices 2>/dev/null | grep "Booted" | grep -oE '[A-F0-9-]{36}' | head -1)
  [ -n "$UDID" ] && break
  echo "  tentativa $i/20..."
  sleep 3
done

if [ -z "$UDID" ]; then
  echo "▶ Nenhum device Booted. Bootando iPhone mais recente..."
  UDID=$(xcrun simctl list devices available 2>/dev/null | grep "iPhone" | grep -v unavailable | grep -oE '[A-F0-9-]{36}' | tail -1)
  if [ -z "$UDID" ]; then
    echo "✗ ERRO: Nenhum device iPhone disponível!"
    exit 1
  fi
  xcrun simctl boot "$UDID"
  sleep 15
fi

echo "✓ Device UDID: $UDID"
echo ""

# ── Verifica se Expo Go está instalado ──────────────────────────
EXPO_INSTALLED=false
if xcrun simctl get_app_container "$UDID" host.exp.Exponent 2>/dev/null | grep -q "/"; then
  echo "✓ Expo Go já instalado"
  EXPO_INSTALLED=true
fi

if [ "$EXPO_INSTALLED" = "false" ]; then
  echo "▶ Expo Go não encontrado. Instalando..."

  CACHE_DIR="$HOME/.expo/ios-simulator-app-cache"
  mkdir -p "$CACHE_DIR"

  CACHED_TAR=$(find "$CACHE_DIR" -name "*.tar.gz" 2>/dev/null | head -1)
  CACHED_APP=$(find "$CACHE_DIR" -name "Exponent.app" -type d 2>/dev/null | head -1)

  if [ -n "$CACHED_APP" ]; then
    echo "✓ Usando app cacheado: $CACHED_APP"
  elif [ -n "$CACHED_TAR" ]; then
    echo "✓ Extraindo cache: $CACHED_TAR"
    cd "$CACHE_DIR"
    tar xzf "$CACHED_TAR" 2>/dev/null || true
    CACHED_APP=$(find "$CACHE_DIR" -name "Exponent.app" -type d 2>/dev/null | head -1)
    cd "$PROJECT_DIR"
  else
    echo "▶ Baixando Expo Go SDK 52 para iOS Simulator (~150MB)..."
    cd "$CACHE_DIR"
    curl -L -o expo-go-sdk52.tar.gz \
      "https://api.expo.dev/v2/downloads/latest?platform=ios&appName=Exponent&sdkVersion=52.0.0"
    echo "▶ Extraindo..."
    tar xzf expo-go-sdk52.tar.gz 2>/dev/null || true
    CACHED_APP=$(find "$CACHE_DIR" -name "Exponent.app" -type d 2>/dev/null | head -1)
    cd "$PROJECT_DIR"
  fi

  if [ -z "$CACHED_APP" ]; then
    echo "✗ ERRO: Expo Go não encontrado após download!"
    exit 1
  fi

  echo "▶ Instalando Expo Go no device $UDID..."
  xcrun simctl install "$UDID" "$CACHED_APP"
  echo "✓ Expo Go instalado com sucesso"
fi

echo ""

# ── Abre o projeto no Expo Go ────────────────────────────────────
EXPO_URL="exp://127.0.0.1:8081"
echo "▶ Abrindo: $EXPO_URL"
xcrun simctl openurl "$UDID" "$EXPO_URL"

echo ""
echo "══════════════════════════════════════════"
echo "  ✓ Luka abrindo no iOS Simulator!"
echo "  URL: $EXPO_URL"
echo "══════════════════════════════════════════"
echo ""
