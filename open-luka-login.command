#!/usr/bin/env bash
# Abre Luka via exp:// URL direto no Expo Go e faz login
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Abrir Luka via intent com URL do Metro
echo "▶ Abrindo Luka via Expo Go URL..."
adb -s "$DEVICE" shell am start \
  -a android.intent.action.VIEW \
  -d "exp://10.0.2.2:8081" \
  -n "host.exp.exponent/.experience.HomeActivity" \
  --ei "EXKernelOpenURLNotificationURLKey" 0 2>&1 || true
sleep 20

# Screenshot
adb -s "$DEVICE" shell screencap -p /sdcard/luka_open.png
adb -s "$DEVICE" pull /sdcard/luka_open.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_open.png" 2>/dev/null
echo "▶ Screenshot: $HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_open.png"

# Check screenshot size
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_open.png" 2>/dev/null | tr -d ' ')
echo "Screenshot size: $SIZE bytes"

# Limpar campo email (caso tenha conteúdo anterior)
echo "▶ Tocando campo email (540, 908)..."
adb -s "$DEVICE" shell input tap 540 908
sleep 0.8
adb -s "$DEVICE" shell input keyevent KEYCODE_MOVE_END
sleep 0.2
for i in $(seq 1 80); do
  adb -s "$DEVICE" shell input keyevent KEYCODE_DEL
done
sleep 0.3

# Digitar email
echo "▶ Digitando email..."
adb -s "$DEVICE" shell input text "ana.silva"
adb -s "$DEVICE" shell input text "@luka.app"
sleep 0.5

# Dismiss keyboard
echo "▶ Fechando teclado..."
adb -s "$DEVICE" shell input keyevent 4
sleep 1

# Senha
echo "▶ Tocando campo senha (540, 1154)..."
adb -s "$DEVICE" shell input tap 540 1154
sleep 0.8

echo "▶ Limpando campo senha..."
adb -s "$DEVICE" shell input keyevent KEYCODE_MOVE_END
sleep 0.2
for i in $(seq 1 40); do
  adb -s "$DEVICE" shell input keyevent KEYCODE_DEL
done
sleep 0.3

echo "▶ Digitando senha..."
adb -s "$DEVICE" shell input text "Luka1234"
sleep 0.5

# Dismiss keyboard
echo "▶ Fechando teclado..."
adb -s "$DEVICE" shell input keyevent 4
sleep 0.8

# Entrar
echo "▶ Tocando Entrar (540, 1347)..."
adb -s "$DEVICE" shell input tap 540 1347
sleep 12

# Screenshot final
echo "▶ Screenshot final..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_loggedin.png
adb -s "$DEVICE" pull /sdcard/luka_loggedin.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_loggedin.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_loggedin.png" 2>/dev/null | tr -d ' ')
echo "Screenshot final: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
