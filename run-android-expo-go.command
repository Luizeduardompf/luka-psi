#!/usr/bin/env bash
set -e

PROJECT_DIR="$HOME/Documents/Claude/Projects/Luka/Luka"
cd "$PROJECT_DIR"

export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

echo ""
echo "══════════════════════════════════════════"
echo "  Luka — Android Emulator + Expo Go"
echo "══════════════════════════════════════════"
echo ""

# ── Verifica Android SDK ─────────────────────────────────────────
if [ ! -d "$ANDROID_HOME" ]; then
  echo "✗ ERRO: Android SDK não encontrado em $ANDROID_HOME"
  exit 1
fi
echo "✓ Android SDK: $ANDROID_HOME"

if ! command -v adb &>/dev/null; then
  echo "✗ adb não encontrado no PATH"
  exit 1
fi
echo "✓ adb OK"
echo ""

# ── Inicia emulador se não estiver rodando ───────────────────────
ADB_DEVICE=$(adb devices 2>/dev/null | grep -v "List of" | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')

if [ -z "$ADB_DEVICE" ]; then
  echo "▶ Nenhum emulador rodando. Iniciando AVD..."
  AVD_NAME=$(emulator -list-avds 2>/dev/null | head -1)
  if [ -z "$AVD_NAME" ]; then
    echo "✗ ERRO: Nenhum AVD encontrado!"
    exit 1
  fi
  echo "▶ Iniciando AVD: $AVD_NAME"
  nohup emulator -avd "$AVD_NAME" -no-snapshot-load > /tmp/emulator.log 2>&1 &
  echo "▶ Aguardando boot (60-90s)..."
  for i in $(seq 1 60); do
    ADB_DEVICE=$(adb devices 2>/dev/null | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
    [ -n "$ADB_DEVICE" ] && break
    sleep 2
  done
  for i in $(seq 1 60); do
    BOOTED=$(adb -s "$ADB_DEVICE" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
    [ "$BOOTED" = "1" ] && break
    sleep 2
  done
else
  echo "✓ Emulador já rodando: $ADB_DEVICE"
fi

echo "✓ Device: $ADB_DEVICE"
echo ""

# ── Verifica/instala Expo Go ─────────────────────────────────────
EXPO_INSTALLED=$(adb -s "$ADB_DEVICE" shell pm list packages 2>/dev/null | grep "host.exp.exponent" || true)

if [ -z "$EXPO_INSTALLED" ]; then
  CACHE_DIR="$HOME/.expo/android-apk-cache"
  mkdir -p "$CACHE_DIR"
  APK_PATH="$CACHE_DIR/expo-go-sdk52.apk"

  # Remove cache inválido se existir
  if [ -f "$APK_PATH" ]; then
    MAGIC=$(xxd "$APK_PATH" 2>/dev/null | head -1 | grep -o "504b 0304" || true)
    if [ -z "$MAGIC" ]; then
      echo "⚠ APK cacheado inválido — removendo..."
      rm -f "$APK_PATH"
    fi
  fi

  if [ ! -f "$APK_PATH" ]; then
    echo "▶ Baixando Expo Go APK do GitHub Releases..."

    # Busca a versão mais recente do expo-go no GitHub API
    EXPO_GO_VERSION=$(curl -s "https://api.github.com/repos/expo/expo/releases?per_page=50" 2>/dev/null \
      | python3 -c "
import sys, json
try:
    releases = json.load(sys.stdin)
    for r in releases:
        tag = r.get('tag_name', '')
        if tag.startswith('expo-go@'):
            version = tag.replace('expo-go@', '')
            print(version)
            break
except:
    pass
" 2>/dev/null)

    if [ -z "$EXPO_GO_VERSION" ]; then
      # Fallback: versão conhecida para SDK 52
      EXPO_GO_VERSION="2.31.4"
      echo "  (usando versão fallback: $EXPO_GO_VERSION)"
    else
      echo "  Versão detectada: $EXPO_GO_VERSION"
    fi

    APK_URL="https://github.com/expo/expo/releases/download/expo-go%40${EXPO_GO_VERSION}/Exponent-${EXPO_GO_VERSION}.apk"
    echo "▶ URL: $APK_URL"
    curl -L --progress-bar -o "$APK_PATH" "$APK_URL"

    # Verifica se é um APK válido (começa com PK\x03\x04)
    MAGIC=$(xxd "$APK_PATH" 2>/dev/null | head -1 | grep -o "504b 0304" || true)
    if [ -z "$MAGIC" ]; then
      echo "✗ ERRO: arquivo baixado não é um APK válido"
      echo "  Tipo: $(file "$APK_PATH" 2>/dev/null || echo 'desconhecido')"
      rm -f "$APK_PATH"
      exit 1
    fi
    echo "✓ APK válido baixado"
  else
    echo "✓ Usando APK cacheado: $APK_PATH"
  fi

  echo "▶ Instalando Expo Go no emulador $ADB_DEVICE..."
  adb -s "$ADB_DEVICE" install -r "$APK_PATH"
  echo "✓ Expo Go instalado"
else
  echo "✓ Expo Go já instalado"
fi

echo ""

# ── Abre o app via deep link ─────────────────────────────────────
# No Android emulator, o host Mac é 10.0.2.2
EXPO_URL="exp://10.0.2.2:8081"
echo "▶ Abrindo Luka no Expo Go: $EXPO_URL"
adb -s "$ADB_DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "$EXPO_URL" \
  host.exp.exponent/.experience.HomeActivity 2>/dev/null || \
adb -s "$ADB_DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "$EXPO_URL" 2>/dev/null || true

echo ""
echo "══════════════════════════════════════════"
echo "  ✓ Luka abrindo no Android Emulator!"
echo "  Metro URL: exp://10.0.2.2:8081"
echo "══════════════════════════════════════════"
echo ""
echo "  OBS: Metro Bundler (run-expo-go.command)"
echo "  precisa estar rodando em outro Terminal."
echo ""
