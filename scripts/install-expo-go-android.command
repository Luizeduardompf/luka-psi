#!/usr/bin/env bash
# Remove APK errado (2.25.1 é SDK 50, não SDK 52) e baixa versão correta
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

APK_PATH="$HOME/.expo/android-apk-cache/expo-go-sdk52.apk"

echo ""
echo "══════════════════════════════════════════"
echo "  Reinstalando Expo Go SDK 52 correto"
echo "══════════════════════════════════════════"
echo ""

# Remove APK cacheado (pode ser versão errada)
if [ -f "$APK_PATH" ]; then
  SIZE=$(wc -c < "$APK_PATH" | tr -d ' ')
  echo "  Removendo APK cacheado ($SIZE bytes)..."
  rm -f "$APK_PATH"
fi

# Desinstala Expo Go errado do emulador
DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
if [ -n "$DEVICE" ]; then
  echo "  Desinstalando Expo Go do emulador $DEVICE..."
  adb -s "$DEVICE" uninstall host.exp.exponent 2>/dev/null || true
fi

echo ""
echo "▶ Baixando Expo Go SDK 52 (versão correta)..."
cd "$HOME/Documents/Claude/Projects/Luka/Luka"
node download-expo-go.js

echo ""
read -p "Pressione Enter para fechar..."
