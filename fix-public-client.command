#!/bin/bash
cd "/Users/claudecode/Documents/Claude/Projects/Luka/Luka"
rm -f .git/index.lock .git/HEAD.lock 2>/dev/null || true
echo "📍 Branch: $(git branch --show-current)"
git add src/services/supabase.ts src/services/forms.service.ts
git commit -m "fix(public-form): use supabasePublic client to avoid 401 from stale session

The shared supabase client sends the logged-in psychologist's session
token as Authorization header. When that session is expired or present
in localStorage on the same browser, all anon queries from the public
form page return 401.

Fix: add supabasePublic client with persistSession:false and use it in
all public-facing service methods: getSubmissionByToken, validateAccess,
getPsychologistPublicProfile, getTemplatePreview, getResponses,
saveResponse, completeSubmission."
echo "📤 Pushing..."
git push origin main
echo ""
echo "✅ Done! Vercel deploy triggered."
read -p "Pressione Enter para fechar..."
