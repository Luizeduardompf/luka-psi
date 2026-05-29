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
  echo "  Instale via Android Studio → SDK Manager"
  exit 1
fi
echo "✓ Android SDK: $ANDROID_HOME"

# ── Verifica se adb está disponível ─────────────────────────────
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

  # Pega o primeiro AVD disponível
  AVD_NAME=$(emulator -list-avds 2>/dev/null | head -1)
  if [ -z "$AVD_NAME" ]; then
    echo "✗ ERRO: Nenhum AVD encontrado!"
    echo "  Crie um no Android Studio → Device Manager → Create Device"
    echo "  (Pixel 7, API 35, ARM64)"
    exit 1
  fi

  echo "▶ Iniciando AVD: $AVD_NAME"
  nohup emulator -avd "$AVD_NAME" -no-snapshot-load > /tmp/emulator.log 2>&1 &
  EMULATOR_PID=$!
  echo "✓ Emulador iniciado (PID $EMULATOR_PID)"
  echo "▶ Aguardando boot (pode levar 60-90s)..."

  # Aguarda adb device aparecer
  for i in $(seq 1 60); do
    ADB_DEVICE=$(adb devices 2>/dev/null | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
    [ -n "$ADB_DEVICE" ] && break
    printf "  aguardando device... $i/60\r"
    sleep 2
  done

  if [ -z "$ADB_DEVICE" ]; then
    echo "✗ ERRO: Emulador não apareceu em 2 minutos"
    exit 1
  fi

  # Aguarda boot completo (sys.boot_completed=1)
  echo "▶ Aguardando boot completo..."
  for i in $(seq 1 60); do
    BOOTED=$(adb -s "$ADB_DEVICE" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
    [ "$BOOTED" = "1" ] && break
    printf "  boot: $i/60\r"
    sleep 2
  done
  echo ""
else
  echo "✓ Emulador já rodando: $ADB_DEVICE"
fi

echo "✓ Device: $ADB_DEVICE"
echo ""

# ── Verifica/instala Expo Go ─────────────────────────────────────
EXPO_INSTALLED=$(adb -s "$ADB_DEVICE" shell pm list packages 2>/dev/null | grep "host.exp.exponent" || true)

if [ -z "$EXPO_INSTALLED" ]; then
  echo "▶ Expo Go não instalado. Baixando APK..."

  CACHE_DIR="$HOME/.expo/android-apk-cache"
  mkdir -p "$CACHE_DIR"
  APK_PATH="$CACHE_DIR/expo-go-sdk52.apk"

  if [ ! -f "$APK_PATH" ]; then
    echo "▶ Baixando Expo Go SDK 52 para Android (~80MB)..."
    curl -L -o "$APK_PATH" \
      "https://api.expo.dev/v2/downloads/latest?platform=android&appName=Exponent&sdkVersion=52.0.0"
    echo "✓ Download concluído"
  else
    echo "✓ Usando APK cacheado: $APK_PATH"
  fi

  echo "▶ Instalando Expo Go no emulador..."
  adb -s "$ADB_DEVICE" install -r "$APK_PATH"
  echo "✓ Expo Go instalado"
else
  echo "✓ Expo Go já instalado"
fi

echo ""

# ── Abre o app via deep link ─────────────────────────────────────
# No Android emulator, o host Mac é acessível via 10.0.2.2
EXPO_URL="exp://10.0.2.2:8081"
echo "▶ Abrindo Luka no Expo Go: $EXPO_URL"
adb -s "$ADB_DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "$EXPO_URL" \
  host.exp.exponent/.experience.HomeActivity 2>/dev/null || \
adb -s "$ADB_DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "$EXPO_URL"

echo ""
echo "══════════════════════════════════════════"
echo "  ✓ Luka abrindo no Android Emulator!"
echo "  Metro URL: $EXPO_URL"
echo "══════════════════════════════════════════"
echo ""
echo "  OBS: O Metro Bundler (run-expo-go.command)"
echo "  precisa estar rodando em outro Terminal."
echo ""
