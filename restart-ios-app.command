#!/bin/bash
BUNDLE="com.luka.psi"
echo "Restarting Luka on iOS Simulator..."
xcrun simctl terminate booted "$BUNDLE" 2>/dev/null
sleep 1
xcrun simctl launch booted "$BUNDLE" 2>/dev/null
echo "✅ Done! Luka relaunched."
sleep 2
