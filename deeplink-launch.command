#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
SCREENSHOTS="$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"
mkdir -p "$SCREENSHOTS"
echo "Device: $DEVICE"

# Verifica Metro bundler
echo "▶ Verificando Metro na porta 8081..."
curl -s --max-time 2 http://10.0.2.2:8081/status && echo "✓ Metro OK" || echo "✗ Metro não responde"

# Force-stop completo
echo "▶ Force-stop Expo Go..."
adb -s "$DEVICE" shell am force-stop host.exp.exponent
adb -s "$DEVICE" shell am force-stop com.android.chrome
sleep 3  # espera suficiente para cleanup

# Lança Expo Go via deep link SEM especificar componente
# Deixa o Android resolver qual Activity trata exp://
echo "▶ Lançando via deep link exp://10.0.2.2:8081..."
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081"
sleep 5

adb -s "$DEVICE" shell screencap -p /sdcard/sc_dl1.png
adb -s "$DEVICE" pull /sdcard/sc_dl1.png "$SCREENSHOTS/dl_01_after_start.png" 2>/dev/null
echo "📸 dl_01_after_start.png"

# Se dialog de compatibilidade aparecer, toca OK (y=2230 device)
echo "▶ Dismissando dialog se aparecer..."
adb -s "$DEVICE" shell input tap 540 2230
sleep 2

# Aguarda app carregar
echo "⏳ Aguardando app carregar (20s)..."
sleep 20

adb -s "$DEVICE" shell screencap -p /sdcard/sc_dl2.png
adb -s "$DEVICE" pull /sdcard/sc_dl2.png "$SCREENSHOTS/dl_02_loaded.png" 2>/dev/null
echo "📸 dl_02_loaded.png"
echo "✓ Feito!"
