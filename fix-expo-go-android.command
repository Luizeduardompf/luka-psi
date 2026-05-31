#!/usr/bin/env bash
# Instala Expo Go 2.32.20 (SDK 52 correto) no emulador Android
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
cd "$HOME/Documents/Claude/Projects/Luka/Luka"

APK_PATH="$HOME/.expo/android-apk-cache/expo-go-sdk52.apk"
APK_URL="https://github.com/expo/expo-go-releases/releases/download/Expo-Go-2.32.20/Expo-Go-2.32.20.apk"

echo ""
echo "══════════════════════════════════════════"
echo "  Install: Expo Go 2.32.20 (SDK 52)"
echo "══════════════════════════════════════════"
echo ""

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
if [ -z "$DEVICE" ]; then
  echo "✗ Nenhum emulador Android encontrado"
  read -p "Pressione Enter para fechar..."
  exit 1
fi
echo "Device: $DEVICE"

# Verifica versão atual
CURRENT=$(adb -s "$DEVICE" shell dumpsys package host.exp.exponent 2>/dev/null | grep versionName | head -1 | tr -d ' ' || echo "não instalado")
echo "Expo Go atual: $CURRENT"

# Remove APK cacheado se existir
rm -f "$APK_PATH"

# Baixa Expo Go 2.32.20 do GitHub Releases
echo "▶ Baixando Expo Go 2.32.20 do GitHub..."
mkdir -p "$(dirname "$APK_PATH")"
curl -L --progress-bar "$APK_URL" -o "$APK_PATH"

SIZE=$(wc -c < "$APK_PATH" | tr -d ' ')
echo ""
echo "APK baixado: $SIZE bytes"

if [ "$SIZE" -lt 10000000 ]; then
  echo "✗ APK inválido — muito pequeno"
  echo "Conteúdo:"
  cat "$APK_PATH" 2>/dev/null | head -5
  read -p "Pressione Enter para fechar..."
  exit 1
fi

echo "▶ Instalando no emulador..."
adb -s "$DEVICE" uninstall host.exp.exponent 2>/dev/null || true
adb -s "$DEVICE" install -r "$APK_PATH"
echo "✓ Instalado!"

NEW_VER=$(adb -s "$DEVICE" shell dumpsys package host.exp.exponent 2>/dev/null | grep versionName | head -1 | tr -d ' ')
echo "Expo Go instalado: $NEW_VER"

# Inicia/verifica Metro
echo ""
echo "▶ Verificando Metro em localhost:8081..."
if ! curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
  echo "  Metro não detectado — iniciando..."
  pkill -f "expo start" 2>/dev/null || true
  pkill -f metro 2>/dev/null || true
  sleep 1
  npx expo start --reset-cache > /tmp/luka-metro.log 2>&1 &
  METRO_PID=$!
  echo "  Metro PID: $METRO_PID"
  for i in $(seq 1 60); do
    if curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
      echo "✓ Metro pronto após ${i}s"
      break
    fi
    sleep 1
    printf "."
  done
  echo ""
else
  echo "✓ Metro já está rodando"
fi

# Abre Luka no Android
echo "▶ Abrindo Luka no Android Emulator..."
sleep 2
adb -s "$DEVICE" shell am force-stop host.exp.exponent 2>/dev/null || true
sleep 1

# Tenta com activity específica primeiro, depois sem
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" \
  host.exp.exponent/.experience.HomeActivity 2>/dev/null \
  && echo "✓ Deep link (HomeActivity) enviado" \
  || adb -s "$DEVICE" shell am start \
     -a android.intent.action.VIEW \
     -d "exp://10.0.2.2:8081" \
     && echo "✓ Deep link enviado"

echo ""
echo "══════════════════════════════════════════"
echo "  ✓ Expo Go 2.32.20 instalado"
echo "══════════════════════════════════════════"
echo ""
read -p "Pressione Enter para fechar..."
