#!/bin/bash
# Simula tap na aba "Pacientes" do iOS Simulator
DEVICE=$(xcrun simctl list devices booted -j | python3 -c "import json,sys; d=json.load(sys.stdin)['devices']; [print(v[0]['udid']) for k,vl in d.items() for v in [vl] if v]" 2>/dev/null | head -1)
echo "Device: $DEVICE"
# Tap na aba Pacientes (posição lógica ~97, 724 para iPhone 17 Pro 393pt wide, 852pt tall)
xcrun simctl io booted tap 97 724
sleep 0.5
# Tap no FAB + para novo paciente
xcrun simctl io booted tap 352 720
sleep 0.3
echo "Done. Check simulator."
read -p "Pressione Enter para fechar..."
