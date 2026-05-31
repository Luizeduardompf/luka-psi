#!/usr/bin/env bash
# Abre Luka no Android de forma confiável
# Force-stop Expo Go + relaunch com deep link
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
SCREENSHOTS="$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"

echo "Device: $DEVICE"

# Force-stop Expo Go para garantir estado limpo
echo "▶ Force-stop Expo Go..."
adb -s "$DEVICE" shell am force-stop host.exp.exponent
sleep 2

# Lança Expo Go com deep link
echo "▶ Abrindo exp://10.0.2.2:8081..."
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" \
  host.exp.exponent/.experience.HomeActivity
sleep 4

# Captura screenshot inicial
adb -s "$DEVICE" shell screencap -p /sdcard/sc_open1.png
adb -s "$DEVICE" pull /sdcard/sc_open1.png "$SCREENSHOTS/open_01_initial.png" 2>/dev/null
echo "📸 open_01_initial.png"

# Se o dialog de compatibilidade aparecer, toca OK (y≈2230 x≈270)
echo "▶ Dismissando dialog se aparecer (OK em y=2230)..."
adb -s "$DEVICE" shell input tap 270 2230
sleep 2

# Screenshot após dismiss
adb -s "$DEVICE" shell screencap -p /sdcard/sc_open2.png
adb -s "$DEVICE" pull /sdcard/sc_open2.png "$SCREENSHOTS/open_02_after_ok.png" 2>/dev/null
echo "📸 open_02_after_ok.png"

# Se ainda não carregou o projeto, tenta "Enter URL manually" no Expo Go home
# "Enter URL manually" está em y≈770 no device 1080x2400
adb -s "$DEVICE" shell input tap 350 770
sleep 1

# Screenshot para ver estado atual
adb -s "$DEVICE" shell screencap -p /sdcard/sc_open3.png
adb -s "$DEVICE" pull /sdcard/sc_open3.png "$SCREENSHOTS/open_03_state.png" 2>/dev/null
echo "📸 open_03_state.png"

echo "✓ Feito! Verifique screenshots em test-screenshots/"
