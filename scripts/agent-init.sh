#!/usr/bin/env bash
set -euo pipefail

echo "== Urblo Agent Init =="
echo

echo "Repo:"
pwd
echo

echo "Git status:"
git status --short --branch
echo

echo "Recent commits:"
git log --oneline -5
echo

echo "Runtime:"
node --version
npm --version
echo

echo "Read order:"
echo "1. AGENTS.md"
echo "2. docs/HANDOFF.md"
echo "3. docs/agent/tasks.json"
echo "4. docs/agent/verification.md"
echo "5. docs/brand-baseline.md"
echo "6. docs/DESIGN.md"
echo "7. docs/ARCHITECTURE.md"
echo "8. docs/SUPABASE_SCHEMA.md when working on Supabase/admin"
echo "9. docs/ADMIN_IA_ACCESS.md when working on /admin"
echo "10. docs/NEXT_STEPS.md"
echo "11. docs/WORKLOG.md when historical evidence is needed"
echo

echo "Useful commands:"
echo "- npm run agent:admin-crud-coverage"
echo "- npm run agent:admin-crud-live"
echo "- npm run agent:admin-live-readiness"
echo "- npm run agent:first-admin-bootstrap"
echo "- npm run agent:check"
echo "- npm run agent:cloudflare-readiness"
echo "- npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev"
echo "- npm run agent:content-import"
echo "- npm run agent:content-import -- --out .tmp/content-import-preview.json"
echo "- npm run agent:content-import:plan"
echo "- npm run agent:content-import:preflight-sql"
echo "- npm run agent:content-import:apply-sql"
echo "- npm run agent:forms-live"
echo "- npm run agent:live-readiness"
echo "- npm run agent:public-supabase-readiness"
echo "- npm run agent:smoke"
echo "- npm run build"
echo "- npm run lint"
echo "- npx tsc -b"
