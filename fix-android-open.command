#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
SCREENSHOTS="$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"
mkdir -p "$SCREENSHOTS"

echo "Device: $DEVICE"

# Helper
tap() { adb -s "$DEVICE" shell input tap "$1" "$2"; }
screenshot() {
  adb -s "$DEVICE" shell screencap -p /sdcard/sc_fix_$1.png
  adb -s "$DEVICE" pull /sdcard/sc_fix_$1.png "$SCREENSHOTS/fix_$1.png" 2>/dev/null
  echo "📸 fix_$1.png"
}

# Abre Expo Go com deep link
echo "▶ Abrindo exp://10.0.2.2:8081..."
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" \
  host.exp.exponent/.experience.HomeActivity 2>/dev/null || \
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" 2>/dev/null || true

sleep 3
screenshot "01_after_open"

# Verifica se o dialog de compatibilidade está visível
# Tenta "Don't Show Again" para suprimir permanentemente
echo "▶ Clicando 'Don't Show Again' para suprimir dialog..."
# Botão direito (Don't Show Again) está em x≈810, y≈2230
tap 810 2230
sleep 1
screenshot "02_after_dont_show_again"

# Reabre Luka
echo "▶ Reabrindo Luka..."
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" \
  host.exp.exponent/.experience.HomeActivity 2>/dev/null || \
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" 2>/dev/null || true

sleep 5
screenshot "03_luka_opened"
echo ""
echo "✓ Pronto! Verifique fix_03_luka_opened.png"
ls "$SCREENSHOTS/"fix_*.png
