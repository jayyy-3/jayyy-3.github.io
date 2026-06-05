#!/usr/bin/env bash
set -euo pipefail

echo "Admin CMS predeploy gate."
echo "No deployment, Supabase writes, browser login, or live content changes are attempted."

npm run agent:admin-crud-coverage
npm run build
npm run lint
npx tsc -b
npm run agent:supabase-foundation-readiness
npm run agent:public-supabase-readiness
npm run agent:cloudflare-readiness
npm run agent:check
git diff --check
npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au

echo "Admin CMS predeploy gate passed."
echo "Run preview/browser gates separately before deployment: npm run agent:smoke && npm run agent:admin-config-gate"
echo "Production handoff is still not complete until deployment and the production walkthrough Results Template pass."
