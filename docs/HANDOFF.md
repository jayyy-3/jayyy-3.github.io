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
- Worktree should be clean after the latest pushed harness/task updates; verify with `git status --short` before editing.

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
- Last full runtime gate on 2026-05-22: `npm run build`, `npm run lint`, `npx tsc -b`, and `npm run agent:smoke` pass. Build no longer emits the previous `>500kB` JavaScript chunk warning; Browserslist staleness notice remains.
- Last docs/harness gate on 2026-05-22: `npm run agent:check` and `git diff --check` pass.
- Recent browser QA on 2026-05-22: Home no longer contains `Browse by stone type`; Prime Block initializes default material selections; the Debunking article has zero horizontal overflow at 390px after the article stopgap.
- Current controlled-media status: P0/P1 visible media has local stopgaps under `public/media/launch`; direct old WordPress `wp-content/uploads` references are removed from runtime data; article media still needs structured-block migration.
- Detailed historical verification evidence lives in `docs/WORKLOG.md`; keep this snapshot limited to current state and latest gates.

## Active Risks
- Cloudflare + Supabase is approved as the launch target, but runtime implementation has not started.
- Clean URL routing is implemented repo-side for Cloudflare Pages, but the live Cloudflare project, preview deployment, custom domain, DNS cutover, and rollback still require account access.
- Supabase schema design is documented, but migrations, RLS implementation, Auth, Storage, admin CRUD, form APIs, and transactional email are not implemented yet.
- Contact and Sample Request remain mailto/local-only in current runtime.
- Unknown URLs still render the homepage through the catch-all route; `NOW-ROUTE-ERROR-STATES-001` tracks a proper 404/not-found state.
- Projects, Stone Library, Products, and Articles are still file-backed rather than customer-editable.
- The admin CMS does not exist yet. `NOW-ADMIN-CMS-001` is an umbrella objective; use `NEXT-ADMIN-IA-ACCESS-001` first, then the blocked auth/RLS, content CRUD, media, and lead-management child tasks when Supabase access is available.
- P0/P1 old WordPress media references in runtime data have been migrated to controlled local assets under `public/media/launch`; article covers and known detail images now have a local runtime stopgap under `public/media/launch/articles`.
- Stone Library fast-track imagery is mapped/documented, but final HD coverage must start with `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001` against the Saistone Google Drive `Urblo Digital Stone Library` source before `NEXT-STONELIB-IMG-001`.
- Raw article newsletter HTML remains source material and still needs Supabase structured-block migration, claim-safety review, mobile-safe templates, and full editorial cleanup before the article system is considered final.
- Product detail pages now initialize default material selections, but still need a stronger conversion/configuration experience with clear CTA, selected-summary feedback, and deliberate missing-image states.
- Legacy project detail pages remain weaker than the Moon Gate material-map case study model; at least one more project should be migrated before the project system feels consistent.
- Public URL styles are mixed across products, articles, projects, and Stone Library; normalize before production indexing if URLs will be changed.
- App shell default Vite metadata, starter README content, and default social image issues have been replaced; launch polish debt remains around future campaign-specific share imagery only if the client wants a bespoke preview.
- Image hosting policy must now be resolved against the Cloudflare/Supabase launch plan.
- GitHub Pages deployment hardening is a legacy fallback only; Cloudflare Pages is the active target and currently blocked at account-level project setup.
- Route-level code splitting resolved the previous bundle size warning; future admin/CMS additions should keep chunk output under review.
- Moon Gate material/application notes are intentionally MVP-inferred from supplied imagery and public project context; designer confirmation is still needed before final production claims.
- Other project pages still have legacy-level content and need migration into the material-map model.
- React Helmet still emits an existing strict-mode lifecycle warning in dev console.

## Next Recommended Action
If account access is unavailable, start with `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001` or `NEXT-ADMIN-IA-ACCESS-001`; both are useful non-secret tasks. Then use `NOW-ROUTE-ERROR-STATES-001`, `NEXT-PRODUCT-DETAIL-CONVERSION-001`, or `NEXT-PROJECTS-INTAKE-001` for runtime polish. Start `NOW-FORMS-SUPABASE-001`, `NOW-ADMIN-AUTH-RLS-001`, and `NOW-CLOUDFLARE-PAGES-DEPLOY-001` only when the required Supabase, Turnstile/email, or Cloudflare access is available.

## Guardrails
- Use repo-root relative paths in committed docs.
- Keep current state short here; write detailed history in `docs/WORKLOG.md`.
- Do not use `docs/NEXT_STEPS.md` as the machine task queue; update `docs/agent/tasks.json` for task state.
