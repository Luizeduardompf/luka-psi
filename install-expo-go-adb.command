#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

ADB_DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
APK="$HOME/Documents/Claude/Projects/Luka/Luka/.expo-go-cache/expo-go-sdk52.apk"

echo "Device: $ADB_DEVICE"
echo "APK: $APK"
echo "▶ Instalando Expo Go 2.32.20..."
adb -s "$ADB_DEVICE" install -r "$APK"
echo "✓ Instalado!"

echo "▶ Abrindo Luka no Expo Go..."
adb -s "$ADB_DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" 2>/dev/null || true

echo "══════════════════════════════"
echo "  ✓ Android OK!"
echo "══════════════════════════════"
