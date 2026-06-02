#!/bin/bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

echo "📱 Abrindo Expo Go no Android e conectando ao Metro..."
DEVICE=$(adb devices | grep emulator | awk '{print $1}' | head -1)
echo "Emulador: $DEVICE"

# Abrir Expo Go
adb -s "$DEVICE" shell monkey -p host.exp.exponent 1 2>/dev/null || true
sleep 3

# Conectar ao Metro via deep link
adb -s "$DEVICE" shell am start -a android.intent.action.VIEW -d "exp://192.168.1.247:8081" host.exp.exponent 2>/dev/null || true

echo ""
echo "✅ Done!"
read -p "Pressione Enter para fechar..."
