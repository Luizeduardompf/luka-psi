#!/bin/bash
cd "$(dirname "$0")"

# Reload iOS Simulator via Metro
echo "🔄 Reloading simulators..."

# Try Metro reload endpoint (common ports)
for port in 8081 8082 19000 19001; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/status" 2>/dev/null)
  if [ "$STATUS" = "200" ]; then
    echo "Metro found on port $port"
    curl -s -X POST "http://localhost:$port/reload" && echo "✅ Reload sent to Metro on $port"
    break
  fi
done

# iOS: send cmd+r via osascript to Simulator
echo "Sending cmd+r to iOS Simulator..."
osascript -e '
tell application "Simulator" to activate
delay 0.5
tell application "System Events"
  keystroke "r" using command down
end tell
' 2>/dev/null && echo "✅ iOS Simulator reload triggered"

# Android: adb reverse reload
ADB=$(which adb 2>/dev/null || echo "$HOME/Library/Android/sdk/platform-tools/adb")
if [ -f "$ADB" ] || command -v adb &>/dev/null; then
  echo "Sending reload to Android..."
  adb shell input keyevent 82 2>/dev/null  # open dev menu
  sleep 1
  adb shell input keyevent 23 2>/dev/null  # select first item (Reload)
  echo "✅ Android reload triggered"
fi

echo ""
echo "Done! Press Enter to close."
read
