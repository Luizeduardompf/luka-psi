#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

DEVICE=$(adb devices 2>/dev/null | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

echo "=== Resolução ==="
adb -s "$DEVICE" shell wm size
adb -s "$DEVICE" shell wm density

echo ""
echo "=== Metro check via curl ==="
adb -s "$DEVICE" shell "curl -s --max-time 3 http://10.0.2.2:8081/status 2>&1 || echo 'Metro nao acessivel'"

echo ""
echo "=== Open Expo Go ==="
adb -s "$DEVICE" shell am force-stop host.exp.exponent 2>/dev/null
sleep 1
adb -s "$DEVICE" shell am start -n "host.exp.exponent/.experience.HomeActivity" 2>/dev/null
sleep 3

echo ""
echo "=== UI dump ==="
adb -s "$DEVICE" shell uiautomator dump /sdcard/ui_check2.xml 2>/dev/null
adb -s "$DEVICE" pull /sdcard/ui_check2.xml /tmp/ui_check2.xml 2>/dev/null
grep -o 'bounds="[^"]*"' /tmp/ui_check2.xml | head -30
echo ""
grep -o 'text="[^"]*"' /tmp/ui_check2.xml | grep -v 'text=""' | head -20

echo ""
echo "══ Fim ══"
read -p "Enter para fechar..."
