#!/usr/bin/env bash
# Luka — Metro + iOS + Android (Expo Go auto-install via Expo CLI)
cd "$HOME/Documents/Claude/Projects/Luka/Luka"

export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

echo "══════════════════════════════════════════"
echo "  Luka — Metro + iOS + Android"
echo "══════════════════════════════════════════"

# Matar metro antigo
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2

# Verifica se Expo Go está instalado no Android
DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
EXPO_INSTALLED=""
if [ -n "$DEVICE" ]; then
  EXPO_INSTALLED=$(adb -s "$DEVICE" shell pm list packages 2>/dev/null | grep "host.exp.exponent" || true)
fi

if [ -n "$EXPO_INSTALLED" ]; then
  # Expo Go instalado: inicia Metro normal + deep links
  echo "▶ Iniciando Metro (reset-cache)..."
  npx expo start --reset-cache > /tmp/luka-metro.log 2>&1 &
  METRO_PID=$!
  echo "  Metro PID: $METRO_PID"

  echo "▶ Aguardando Metro iniciar..."
  for i in $(seq 1 60); do
    if curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
      echo "........✓ Metro pronto após ${i}s"
      break
    fi
    sleep 1
    printf "."
  done
  echo ""

  # iOS
  echo "▶ Abrindo no iOS Simulator..."
  xcrun simctl openurl booted "exp://localhost:8081" 2>/dev/null || \
    echo "  (iOS Simulator: abra manualmente)"

  # Android
  echo "▶ Abrindo no Android Emulator..."
  if [ -n "$DEVICE" ]; then
    adb -s "$DEVICE" shell am force-stop host.exp.exponent 2>/dev/null || true
    sleep 1
    adb -s "$DEVICE" shell am start \
      -a android.intent.action.VIEW \
      -d "exp://10.0.2.2:8081" \
      host.exp.exponent/.experience.HomeActivity 2>/dev/null || true
    echo "✓ Android: Expo Go aberto"
  fi

  echo ""
  echo "══ Metro rodando — não feche esta janela ══"
  wait $METRO_PID
else
  # Expo Go NÃO instalado: usa 'expo start --android' que instala automaticamente
  echo "▶ Expo Go não instalado. Usando 'expo start --android'..."
  echo "  (Expo CLI instalará Expo Go automaticamente)"
  echo ""
  # 'yes' responde automaticamente a qualquer prompt de instalação
  yes | npx expo start --reset-cache --android
fi
