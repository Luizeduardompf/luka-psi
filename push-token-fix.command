#!/bin/bash
cd "/Users/claudecode/Documents/Claude/Projects/Luka/Luka"
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true
echo "📍 Branch: $(git branch --show-current)"
git add app/f/\[token\].tsx
git commit -m "fix(web): extract token from pathname as fallback for SPA routing

useLocalSearchParams returns undefined on direct URL access in Expo
Router SPA export. Use usePathname as fallback to extract the token
from the URL path segment."
echo "📤 Pushing..."
git push origin main
echo ""
echo "✅ Done! Vercel deploy triggered."
read -p "Pressione Enter para fechar..."
