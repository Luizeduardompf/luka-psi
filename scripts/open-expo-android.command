#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
# Fecha dialogo OK
adb -s "$DEVICE" shell input tap 268 2207 2>/dev/null || true
sleep 1
# Reabre Expo Go com URL do Metro
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" \
  host.exp.exponent/.experience.HomeActivity 2>/dev/null || \
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081"
echo "✓ Expo Go aberto no Android!"
