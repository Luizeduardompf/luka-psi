#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Force-stop para estado limpo
echo "▶ Force-stop Expo Go..."
adb -s "$DEVICE" shell am force-stop host.exp.exponent
sleep 1

# Lança com deep link
echo "▶ Abrindo exp://10.0.2.2:8081..."
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" \
  host.exp.exponent/.experience.HomeActivity
sleep 3

echo "✓ Expo Go iniciado — aguarde o dialog de compatibilidade e clique OK no emulador"
