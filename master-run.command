#!/usr/bin/env bash
# Luka — Master script: instala Expo Go SDK 52, inicia Metro, abre em ambos simuladores
set -e
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
cd "$HOME/Documents/Claude/Projects/Luka/Luka"

CACHE_DIR="$HOME/.expo/android-apk-cache"
APK_PATH="$CACHE_DIR/expo-go-sdk52.apk"

echo ""
echo "══════════════════════════════════════════"
echo "  Luka — Setup completo"
echo "══════════════════════════════════════════"
echo ""

# ── 1. Mata Metro antigo ─────────────────────────────────────────
echo "▶ Parando Metro anterior (se existir)..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 1

# ── 2. Verifica emulador Android ────────────────────────────────
ANDROID_DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
if [ -n "$ANDROID_DEVICE" ]; then
  echo "✓ Android emulator: $ANDROID_DEVICE"
else
  echo "⚠ Android emulator não encontrado — Android será pulado"
fi

# ── 3. Instala Expo Go no Android (se necessário) ─────────────
if [ -n "$ANDROID_DEVICE" ]; then
  EXPO_INSTALLED=$(adb -s "$ANDROID_DEVICE" shell pm list packages 2>/dev/null | grep "host.exp.exponent" || true)

  if [ -z "$EXPO_INSTALLED" ]; then
    echo "▶ Expo Go não instalado. Baixando SDK 52 (2.31.4)..."
    mkdir -p "$CACHE_DIR"

    # Verifica APK cacheado
    if [ -f "$APK_PATH" ]; then
      SIZE=$(wc -c < "$APK_PATH" | tr -d ' ')
      if [ "$SIZE" -lt 10000000 ]; then
        echo "  APK inválido ($SIZE bytes) — removendo..."
        rm -f "$APK_PATH"
      else
        echo "  APK cacheado válido ($SIZE bytes)"
      fi
    fi

    if [ ! -f "$APK_PATH" ]; then
      node download-expo-go.js
    fi

    echo "▶ Instalando Expo Go no emulador..."
    adb -s "$ANDROID_DEVICE" uninstall host.exp.exponent 2>/dev/null || true
    adb -s "$ANDROID_DEVICE" install -r "$APK_PATH"
    echo "✓ Expo Go instalado!"
  else
    echo "✓ Expo Go já instalado no Android"
  fi
fi

# ── 4. Inicia Metro ──────────────────────────────────────────
echo ""
echo "▶ Iniciando Metro bundler..."
npx expo start --reset-cache > /tmp/luka-metro.log 2>&1 &
METRO_PID=$!
echo "  Metro PID: $METRO_PID"

# Aguarda Metro subir
echo "▶ Aguardando Metro (até 90s)..."
for i in $(seq 1 90); do
  if curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
    echo "✓ Metro pronto após ${i}s"
    break
  fi
  sleep 1
  printf "."
done
echo ""

# Verifica se Metro subiu
if ! curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
  echo "⚠ Metro pode não ter subido ainda. Log:"
  tail -20 /tmp/luka-metro.log 2>/dev/null || true
fi

# ── 5. Abre no iOS Simulator ─────────────────────────────────
echo "▶ Abrindo no iOS Simulator..."
xcrun simctl openurl booted "exp://localhost:8081" 2>/dev/null && \
  echo "✓ iOS: Luka abrindo" || \
  echo "⚠ iOS: openurl falhou (tente manualmente)"

# ── 6. Abre no Android Emulator ──────────────────────────────
if [ -n "$ANDROID_DEVICE" ]; then
  echo "▶ Abrindo no Android Emulator ($ANDROID_DEVICE)..."
  sleep 2
  adb -s "$ANDROID_DEVICE" shell am force-stop host.exp.exponent 2>/dev/null || true
  sleep 1
  adb -s "$ANDROID_DEVICE" shell am start \
    -a android.intent.action.VIEW \
    -d "exp://10.0.2.2:8081" \
    host.exp.exponent/.experience.HomeActivity 2>/dev/null && \
    echo "✓ Android: Expo Go aberto" || \
  adb -s "$ANDROID_DEVICE" shell am start \
    -a android.intent.action.VIEW \
    -d "exp://10.0.2.2:8081" 2>/dev/null && \
    echo "✓ Android: deep link enviado" || \
    echo "⚠ Android: não foi possível abrir"
fi

echo ""
echo "══════════════════════════════════════════"
echo "  ✓ Metro rodando — não feche esta janela"
echo "══════════════════════════════════════════"
echo ""
wait $METRO_PID
