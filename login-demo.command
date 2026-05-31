#!/usr/bin/env bash
# Login com credenciais demo: demo@luka.app / Demo123456
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE (1080x2400)"

# Email field já tem focus e conteúdo errado — limpar primeiro
echo "▶ Limpando campo email..."
adb -s "$DEVICE" shell input tap 540 908
sleep 0.5
adb -s "$DEVICE" shell input keyevent KEYCODE_MOVE_END
sleep 0.2
for i in $(seq 1 60); do
  adb -s "$DEVICE" shell input keyevent KEYCODE_DEL
done
sleep 0.3

# Type email in parts to avoid @ issues
echo "▶ Digitando email..."
adb -s "$DEVICE" shell input text "demo"
adb -s "$DEVICE" shell input text "@luka.app"
sleep 0.5

# Dismiss keyboard
echo "▶ Fechando teclado..."
adb -s "$DEVICE" shell input keyevent 4
sleep 1

# Tap senha field (540, 1154)
echo "▶ Tocando no campo Senha..."
adb -s "$DEVICE" shell input tap 540 1154
sleep 0.8

# Type password in parts
echo "▶ Digitando senha..."
adb -s "$DEVICE" shell input text "Demo"
adb -s "$DEVICE" shell input text "123456"
sleep 0.5

# Dismiss keyboard
echo "▶ Fechando teclado..."
adb -s "$DEVICE" shell input keyevent 4
sleep 0.8

# Tap Entrar (540, 1347)
echo "▶ Tocando em Entrar..."
adb -s "$DEVICE" shell input tap 540 1347
sleep 12

# Screenshot
echo "▶ Screenshot..."
adb -s "$DEVICE" shell screencap -p /sdcard/luka_demo_login.png
adb -s "$DEVICE" pull /sdcard/luka_demo_login.png "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_demo_login.png"
SIZE=$(wc -c < "$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots/luka_demo_login.png" 2>/dev/null | tr -d ' ')
echo "Screenshot: $SIZE bytes"
echo "══ Fim ══"
read -p "Enter para fechar..."
