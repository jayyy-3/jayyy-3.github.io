# HANDOFF - Current Agent State

Last updated: 2026-05-25

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
- Last full runtime gate on 2026-05-25: `npm run build`, `npm run lint`, `npx tsc -b`, and `npm run agent:smoke` pass. Build keeps the previous healthy JavaScript chunk profile; Browserslist staleness notice remains.
- Last docs/harness gate on 2026-05-25: `npm run agent:check` and `git diff --check` pass.
- Recent browser QA on 2026-05-25: homepage hero is full viewport at 1440x900 and 390x844; mobile does not select the MP4 source; desktop selects the MP4 with `preload="none"`.
- Recent browser QA on 2026-05-25: article detail at 320px, contact at 390px, Products, Our Story, missing project, unknown route, Product detail, and Stone Library detail all reported zero horizontal overflow and no fresh console errors after `react-helmet` removal.
- Recent browser QA on 2026-05-25: clicking the homepage Artisan Park project card from scroll position 1800 navigates to `/projects/artisan-park-yarrabend` with `scrollY=0`.
- Recent browser QA on 2026-05-25: Contact empty submit is blocked with inline copy requiring project notes plus email or phone; Stone Library active imagery discloses finish-specific image source.
- Recent browser QA on 2026-05-25: unknown route, missing product detail, and missing article detail render deliberate route states instead of falling back to Home or blank/error text.
- Recent browser QA on 2026-05-25: Product detail configuration on `/products/primeBlock` renders selected-summary feedback, a prefilled configuration enquiry CTA, and pending-image copy when Harcourt is selected. Browser screenshot/desktop DOM checks passed; mobile viewport fallback was attempted but blocked by local browser tooling.
- Secondary Stone Library frames are implemented for approved Juparana and Zen Grey source files. Runtime gates pass, but fresh desktop/mobile browser visual QA remains blocked until the in-app Browser pane or local Chrome/Playwright is available.
- Product and article public slugs now use lowercase kebab-case with explicit Cloudflare 301 rules and runtime alias redirects for the previous camelCase/title-case URLs.
- Recent browser QA on 2026-05-25: Stone Library list renders 13 results; Golden Crust, Tan Brown, Honey Comb, and Tuscany detail pages render mapped images without `IMAGE COMING SOON`; Golden Crust Dark and Tuscany Cross Cut variant switches update to the correct mapped images.
- Current controlled-media status: P0/P1 visible media has local stopgaps under `public/media/launch`; direct old WordPress `wp-content/uploads` references are removed from runtime data; article media still needs structured-block migration.
- Stone Library shared-drive audit and current-site image mapping on 2026-05-25 are complete for current website stones only; Drive-only products are intentionally out of scope for this launch pass.
- Detailed historical verification evidence lives in `docs/WORKLOG.md`; keep this snapshot limited to current state and latest gates.

## Active Risks
- Cloudflare + Supabase is approved as the launch target, but runtime implementation has not started.
- Clean URL routing is implemented repo-side for Cloudflare Pages, but the live Cloudflare project, preview deployment, custom domain, DNS cutover, and rollback still require account access.
- Supabase schema design is documented, but migrations, RLS implementation, Auth, Storage, admin CRUD, form APIs, and transactional email are not implemented yet.
- Contact and Sample Request remain mailto/local-only in current runtime.
- Contact now validates the local mailto composer enough to avoid empty drafts, but it still does not persist leads until Supabase forms are implemented.
- Projects, Stone Library, Products, and Articles are still file-backed rather than customer-editable.
- The admin CMS does not exist yet. `NOW-ADMIN-CMS-001` is an umbrella objective; the no-secret admin IA/access contract is complete in `docs/ADMIN_IA_ACCESS.md`, and the blocked auth/RLS, content CRUD, media, and lead-management child tasks should use that contract when Supabase access is available.
- P0/P1 old WordPress media references in runtime data have been migrated to controlled local assets under `public/media/launch`; article covers and known detail images now have a local runtime stopgap under `public/media/launch/articles`.
- Stone Library current-site shared-drive image mapping is complete for Golden Crust, Tan Brown, Honey Comb, Ivory Sand, and Tuscany. Secondary frames are wired for Juparana and Zen Grey. Blueocean remains on the controlled fallback and Harcourt remains placeholder/TBC because no matching current-site shared-drive source was found.
- Raw article newsletter HTML remains source material and still needs Supabase structured-block migration, claim-safety review, mobile-safe templates, and full editorial cleanup before the article system is considered final.
- Article mobile overflow has a runtime CSS stopgap verified at 320px for the cost-myth article, but raw newsletter HTML remains the wrong long-term authoring model.
- Product detail pages now initialize default material selections and include selected-summary feedback, a geometry-preview disclaimer, separate material previews, a configuration enquiry CTA, and deliberate pending-image states; deeper product data approval remains part of the CMS/content migration work.
- Legacy project detail pages remain weaker than the Moon Gate material-map case study model; the broad migration task is paused by user direction for now.
- Article claim cleanup remains paused by user direction for now; do not change article claim wording until explicitly resumed.
- Public URL style is normalized to lowercase kebab-case across products, articles, projects, and Stone Library. Old product/article URLs are preserved through `public/_redirects` and runtime alias handling.
- App shell default Vite metadata, starter README content, and default social image issues have been replaced; launch polish debt remains around future campaign-specific share imagery only if the client wants a bespoke preview.
- Image hosting policy must now be resolved against the Cloudflare/Supabase launch plan.
- GitHub Pages deployment hardening is a legacy fallback only; Cloudflare Pages is the active target and currently blocked at account-level project setup.
- Route-level code splitting resolved the previous bundle size warning; future admin/CMS additions should keep chunk output under review.
- Moon Gate material/application notes are intentionally MVP-inferred from supplied imagery and public project context; designer confirmation is still needed before final production claims.
- Other project pages still have legacy-level content and need migration into the material-map model.
- The desktop homepage MP4 remains large. Current mitigations are full-viewport poster, mobile poster-only behavior, and `preload="none"`; final performance sign-off still needs re-encoding or Cloudflare Stream/R2 review.

## Next Recommended Action
If account access is unavailable, continue low-risk runtime polish under `NEXT-UI-PARITY-001` and media performance work under `NOW-ASSET-MIGRATION-001`, while leaving article claim cleanup and broad legacy project migration paused until the user resumes them. Start `NOW-FORMS-SUPABASE-001`, `NOW-ADMIN-AUTH-RLS-001`, and `NOW-CLOUDFLARE-PAGES-DEPLOY-001` only when the required Supabase, Turnstile/email, or Cloudflare access is available.

## Guardrails
- Use repo-root relative paths in committed docs.
- Keep current state short here; write detailed history in `docs/WORKLOG.md`.
- Do not use `docs/NEXT_STEPS.md` as the machine task queue; update `docs/agent/tasks.json` for task state.
