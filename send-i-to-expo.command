#!/usr/bin/env bash
# Envia 'i' para o terminal do Expo (abre iOS Simulator)
osascript <<'APPLESCRIPT'
tell application "Terminal"
  activate
  -- Encontra a janela com "run-expo-go" no título
  set targetWindow to missing value
  repeat with w in windows
    if name of w contains "run-expo-go" then
      set targetWindow to w
      exit repeat
    end if
  end repeat
  -- Se encontrou, envia 'i'; senão, usa a janela frontmost
  if targetWindow is not missing value then
    set frontmost of targetWindow to true
  end if
end tell
delay 0.3
tell application "System Events"
  tell process "Terminal"
    keystroke "i"
  end tell
end tell
APPLESCRIPT
echo "Tecla 'i' enviada ao Expo."
