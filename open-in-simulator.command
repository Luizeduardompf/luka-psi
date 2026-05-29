#!/usr/bin/env bash
set -e

PROJECT_DIR="$HOME/Documents/Claude/Projects/Luka/Luka"
cd "$PROJECT_DIR"

# ── chmod +x em todos os scripts ────────────────────────────────
chmod +x "$PROJECT_DIR"/*.command "$PROJECT_DIR"/*.sh 2>/dev/null || true
echo "✓ chmod +x aplicado"
echo ""

# ── Git push (se commit existir e ainda não pushado) ─────────────
if git log --oneline 2>/dev/null | grep -q .; then
  echo "▶ Configurando SSH para github.com..."
  mkdir -p ~/.ssh && chmod 700 ~/.ssh
  # Adiciona chave ED25519 oficial do GitHub diretamente (sem ssh-keyscan)
  if ! grep -q "github.com" ~/.ssh/known_hosts 2>/dev/null; then
    echo "github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH8nwfpJB3+dM22nLh" >> ~/.ssh/known_hosts
    echo "github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=" >> ~/.ssh/known_hosts
    chmod 600 ~/.ssh/known_hosts
    echo "✓ Chaves do GitHub adicionadas ao known_hosts"
  else
    echo "✓ github.com já no known_hosts"
  fi
  # SSH config para não perguntar fingerprint
  if ! grep -q "github.com" ~/.ssh/config 2>/dev/null; then
    printf "\nHost github.com\n  StrictHostKeyChecking yes\n  IdentityFile ~/.ssh/id_ed25519\n" >> ~/.ssh/config
    chmod 600 ~/.ssh/config
  fi
  echo "▶ Fazendo push para GitHub..."
  git push -u origin main && \
    echo "✓ Push concluído! https://github.com/Luizeduardompf/luka-psi" || \
    echo "⚠ Push falhou — verifique se a SSH key está configurada no GitHub"
fi
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
