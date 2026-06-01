#!/bin/bash
cd "$(dirname "$0")"
rm -f .git/index.lock
git add README.md reload-simulators.command restart-ios-app.command
git commit -m "docs: update README with migration 009, new features, deployment workflow

- Migration table: added 007, 008, 009
- Table count updated: 12 -> 16
- Added Funcionalidades Implementadas 2026-06-01 section
- Updated Notas Tecnicas: expo-image-picker installed, Management API endpoint
- Added git lock workflow and iOS simulator restart docs
- Added AsyncStorage navigation state caveat
- Added reload-simulators.command and restart-ios-app.command scripts"
git push origin main
echo "Done!"
sleep 2
