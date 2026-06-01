#!/bin/bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
DEVICE=$(adb devices | grep "emulator.*device$" | head -1 | awk '{print $1}')
echo "Device: $DEVICE"

# Tap "Nome completo" field and type name
echo "Tapping Nome completo field..."
adb -s "$DEVICE" shell input tap 580 620
sleep 1
echo "Typing patient name..."
adb -s "$DEVICE" shell input text Carlos%sTeste%sAndroid
sleep 1

# Dismiss keyboard
adb -s "$DEVICE" shell input keyevent 4
sleep 1

# Tap Salvar paciente
echo "Tapping Salvar paciente..."
adb -s "$DEVICE" shell input tap 540 2060
sleep 4

# Screenshot
adb -s "$DEVICE" shell screencap -p /sdcard/patient_saved.png
adb -s "$DEVICE" pull /sdcard/patient_saved.png "/Users/claudecode/Documents/Claude/Projects/Luka/Luka/test-screenshots/patient_saved.png"
echo "Done"
