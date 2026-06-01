#!/bin/bash
# Navega para Pacientes em ambos os apps e mostra novos pacientes

echo "=== iOS Simulator ==="
# Aba Pacientes no iOS (tap na tab bar - posição lógica para iPhone 17 Pro)
# Tela: 393pt wide, 852pt tall. Tab bar na parte inferior.
# Aba Pacientes é a 2a tab: aprox x=118, y=834
xcrun simctl io booted tap 118 834
sleep 1
echo "Tapped Pacientes tab on iOS"

echo ""
echo "=== Android (adb) ==="
# Verifica se adb está disponível
if command -v adb &> /dev/null; then
  ANDROID_DEVICE=$(adb devices | grep -v "List" | grep "device$" | head -1 | cut -f1)
  if [ -n "$ANDROID_DEVICE" ]; then
    echo "Android device: $ANDROID_DEVICE"
    # Tap na tab Pacientes no Android (Pixel 7, 1080x2400)
    # Tab bar height ~56dp. Pacientes é 2a tab de 5. Width=1080/5=216, center da 2a = 216+108=324
    adb -s "$ANDROID_DEVICE" shell input tap 324 2344
    sleep 1
    echo "Tapped Pacientes tab on Android"
  else
    echo "No Android device found via adb"
  fi
else
  echo "adb not found in PATH"
  # Try common locations
  ADB_PATH="$HOME/Library/Android/sdk/platform-tools/adb"
  if [ -f "$ADB_PATH" ]; then
    ANDROID_DEVICE=$("$ADB_PATH" devices | grep -v "List" | grep "device$" | head -1 | cut -f1)
    if [ -n "$ANDROID_DEVICE" ]; then
      "$ADB_PATH" -s "$ANDROID_DEVICE" shell input tap 324 2344
      echo "Tapped via $ADB_PATH"
    fi
  fi
fi

echo ""
echo "Done! Check both simulators for new patients:"
echo "  - Lucas Teste iOS"
echo "  - Marina Teste Android"
read -p "Pressione Enter para fechar..."
