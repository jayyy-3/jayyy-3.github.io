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
- `npm run build`: pass on 2026-05-22; existing bundle size warning and Browserslist staleness notice remain.
- `npm run lint`: pass on 2026-05-22.
- `npx tsc -b`: pass on 2026-05-22.
- Playwright visual QA: desktop and mobile Moon Gate detail page checked locally; hotspot click changed the active material inspector, the legacy ACU detail page no longer showed Moon Gate copy, and project heading computed styles matched the live Avenir project-title pattern.
- `npm run agent:check`: pass on 2026-05-18.
- `npm run agent:smoke`: pass on 2026-05-18.
- `git diff --check`: pass on 2026-05-18.
- Cloudflare/Supabase launch plan docs: `npm run agent:check` and `git diff --check` pass on 2026-05-22.
- Supabase schema planning docs: `npm run agent:check` and `git diff --check` pass on 2026-05-22.
- `npm run agent:smoke`: pass on 2026-05-22 for clean routes and article index.
- Cloudflare Pages repo-side routing/runbook work: runtime and harness verification pass on 2026-05-22.
- SEO metadata baseline: runtime and harness verification pass on 2026-05-22.
- Asset migration audit: `npm run agent:check` and `git diff --check` pass on 2026-05-22.
- P0 launch media stopgap: runtime and harness verification pass on 2026-05-22.
- Browser media QA on 2026-05-22: desktop homepage selects local MP4 and poster; mobile homepage selects no MP4 source and uses the local poster; Products, Product detail, Projects, Our Story, Contact, Articles, and Article detail banners load from local `public/media/launch` assets with no broken images observed.
- Homepage video replacement and P1 visible homepage/Our Story media pass: runtime, harness, and browser media QA pass on 2026-05-22.
- Legacy project media and Stone Library fallback migration: runtime, harness, old WordPress scan, and browser media QA pass on 2026-05-22.
- Old-site favicon restoration: runtime, harness, local asset, and browser head verification pass on 2026-05-22.
- Article media cleanup: runtime build/lint/typecheck pass on 2026-05-22; Browser QA confirms `/articles` uses local article covers and all four article detail routes render text with zero known external/proxy article images or campaign/unsubscribe/Google redirect/old upload links after lazy-load scroll.

## Active Risks
- Cloudflare + Supabase is approved as the launch target, but runtime implementation has not started.
- Clean URL routing is implemented repo-side for Cloudflare Pages, but the live Cloudflare project, preview deployment, custom domain, DNS cutover, and rollback still require account access.
- Supabase schema design is documented, but migrations, RLS implementation, Auth, Storage, admin CRUD, form APIs, and transactional email are not implemented yet.
- Contact and Sample Request remain mailto/local-only in current runtime.
- Projects, Stone Library, Products, and Articles are still file-backed rather than customer-editable.
- The admin CMS does not exist yet.
- P0/P1 old WordPress media references in runtime data have been migrated to controlled local assets under `public/media/launch`; article covers and known detail images now have a local runtime stopgap under `public/media/launch/articles`.
- Stone Library finish imagery still has placeholder/mapping gaps.
- Raw article newsletter HTML remains source material and still needs Supabase structured-block migration plus editorial cleanup before the article system is considered final.
- App shell default Vite metadata has been replaced; delivery-readiness debt remains around final share imagery and deeper claim-safety review.
- Image hosting policy must now be resolved against the Cloudflare/Supabase launch plan.
- GitHub Pages deployment hardening is a legacy fallback only; Cloudflare Pages is the active target and currently blocked at account-level project setup.
- Bundle size warning (`>500kB`) remains open.
- Moon Gate material/application notes are intentionally MVP-inferred from supplied imagery and public project context; designer confirmation is still needed before final production claims.
- Other project pages still have legacy-level content and need migration into the material-map model.
- React Helmet still emits an existing strict-mode lifecycle warning in dev console.

## Next Recommended Action
Continue with the next launch blocker that does not require account secrets: Stone Library image coverage or delivery-readiness cleanup. Start `NOW-FORMS-SUPABASE-001` once Supabase project credentials and Turnstile/email secrets are available. Return to `NOW-CLOUDFLARE-PAGES-DEPLOY-001` once Cloudflare dashboard access is available.

## Guardrails
- Use repo-root relative paths in committed docs.
- Keep current state short here; write detailed history in `docs/WORKLOG.md`.
- Do not use `docs/NEXT_STEPS.md` as the machine task queue; update `docs/agent/tasks.json` for task state.
