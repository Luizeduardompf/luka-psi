#!/usr/bin/env bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator" | grep "device$" | head -1 | awk '{print $1}')
SCREENSHOTS="$HOME/Documents/Claude/Projects/Luka/Luka/test-screenshots"
mkdir -p "$SCREENSHOTS"
echo "Device: $DEVICE"

# Verifica app em foco antes de tocar
FOCUS=$(adb -s "$DEVICE" shell dumpsys window windows 2>/dev/null | grep mCurrentFocus | head -1)
echo "Foco atual: $FOCUS"

adb -s "$DEVICE" shell screencap -p /sdcard/sc_before.png
adb -s "$DEVICE" pull /sdcard/sc_before.png "$SCREENSHOTS/jc_before.png" 2>/dev/null
echo "📸 jc_before.png — estado antes do tap"

# Toca Connect no Expo Go (device coords 1080x2400, y=688)
echo "▶ Tap Connect y=688..."
adb -s "$DEVICE" shell input tap 540 688
echo "⏳ Aguardando 30s..."
sleep 30

adb -s "$DEVICE" shell screencap -p /sdcard/sc_jc_after.png
adb -s "$DEVICE" pull /sdcard/sc_jc_after.png "$SCREENSHOTS/jc_after.png" 2>/dev/null
echo "📸 jc_after.png"
echo "✓ Feito!"
