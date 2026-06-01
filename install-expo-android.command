#!/bin/bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

APK="/Users/claudecode/Documents/Claude/Projects/Luka/Luka/.expo-go-cache/expo-go-sdk52.apk"

echo "📱 Instalando Expo Go no Android emulator..."
echo "APK: $APK"
echo "Tamanho: $(du -h "$APK" | cut -f1)"
echo ""

# Verificar emulator
DEVICE=$(adb devices | grep emulator | awk '{print $1}' | head -1)
if [ -z "$DEVICE" ]; then
  echo "❌ Nenhum emulador encontrado. Abra o Android emulator primeiro."
  read -p "Enter para fechar..."
  exit 1
fi

echo "✅ Emulador: $DEVICE"
echo "📦 Instalando (aguarde ~60s)..."
adb -s "$DEVICE" install -r "$APK"
echo ""
echo "✅ Instalação concluída!"
read -p "Pressione Enter para fechar..."
