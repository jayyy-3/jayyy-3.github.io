# HANDOFF - Current Agent State

Last updated: 2026-05-22

## Current Focus
The launch direction is now Cloudflare Pages + Supabase + an Urblo-owned admin CMS:
- Public website hosting should move to Cloudflare Pages.
- Contact and Sample Request should move from mailto/local-only behavior to Supabase-backed submissions.
- Projects, Stone Library, Products, Articles, media records, and lead records should become customer-maintainable through `/admin`.
- The current runtime remains static/file-backed until implementation tasks are completed.
- The long-form plan and cost baseline live in `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`.

## Current Branch State
- Branch: `main`
- Remote tracking: `origin/main`
- Current work includes runtime UI, data, local project assets, and harness doc updates.

## Canonical Entry Points
- Agent entry: `AGENTS.md`
- Current state: `docs/HANDOFF.md`
- Machine task queue: `docs/agent/tasks.json`
- Verification guide: `docs/agent/verification.md`
- Brand authority: `docs/brand-baseline.md`
- Design authority: `docs/DESIGN.md`
- Architecture contract: `docs/ARCHITECTURE.md`
- Historical evidence: `docs/WORKLOG.md`

## Latest Verification Snapshot
- `npm run build`: pass on 2026-05-18; existing bundle size warning remains.
- `npm run lint`: pass on 2026-05-18.
- `npx tsc -b`: pass on 2026-05-18.
- Playwright visual QA: desktop and mobile Moon Gate detail page checked locally; hotspot click changed the active material inspector, the legacy ACU detail page no longer showed Moon Gate copy, and project heading computed styles matched the live Avenir project-title pattern.
- `npm run agent:check`: pass on 2026-05-18.
- `npm run agent:smoke`: pass on 2026-05-18.
- `git diff --check`: pass on 2026-05-18.
- Cloudflare/Supabase launch plan docs: `npm run agent:check` and `git diff --check` pass on 2026-05-22.
- Supabase schema planning docs: `npm run agent:check` and `git diff --check` pass on 2026-05-22.

## Active Risks
- Cloudflare + Supabase is approved as the launch target, but runtime implementation has not started.
- Supabase schema design is documented, but migrations, RLS implementation, Auth, Storage, admin CRUD, form APIs, and transactional email are not implemented yet.
- Contact and Sample Request remain mailto/local-only in current runtime.
- Projects, Stone Library, Products, and Articles are still file-backed rather than customer-editable.
- The admin CMS does not exist yet.
- Priority media still needs migration away from old WordPress URLs, especially homepage video/poster and other first-viewport assets.
- Stone Library finish imagery still has placeholder/mapping gaps.
- App shell still has delivery-readiness debt around template/default assets and footer/social hygiene.
- Image hosting policy must now be resolved against the Cloudflare/Supabase launch plan.
- GitHub Pages deployment hardening is a legacy fallback only; Cloudflare Pages is the active target.
- Bundle size warning (`>500kB`) remains open.
- Moon Gate material/application notes are intentionally MVP-inferred from supplied imagery and public project context; designer confirmation is still needed before final production claims.
- Other project pages still have legacy-level content and need migration into the material-map model.
- React Helmet still emits an existing strict-mode lifecycle warning in dev console.

## Next Recommended Action
Start `NOW-CLOUDFLARE-PAGES-DEPLOY-001` for repo-side Cloudflare Pages deployment/runbook work. Actual Cloudflare project creation still requires account access.

## Guardrails
- Use repo-root relative paths in committed docs.
- Keep current state short here; write detailed history in `docs/WORKLOG.md`.
- Do not use `docs/NEXT_STEPS.md` as the machine task queue; update `docs/agent/tasks.json` for task state.
