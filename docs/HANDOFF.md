# HANDOFF - Current Agent State

Last updated: 2026-05-27

## Current Focus
The launch direction is now Cloudflare Pages + Supabase + an Urblo-owned admin CMS:
- Public website hosting should move to Cloudflare Pages.
- Contact and Sample Request should move from mailto/local-only behavior to Supabase-backed submissions.
- Projects, Stone Library, Products, Articles, media records, and lead records should become customer-maintainable through `/admin`.
- The current runtime remains static/file-backed until implementation tasks are completed.
- The long-form plan and cost baseline live in `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`.
- Supabase project access is available through the connector for project `Urblo` (`npkidywzwddbnfrnxlmo`, `ap-southeast-2`); foundation and baseline seed migrations are applied.
- Forms backend source is implemented for `/api/enquiries` and `/api/sample-requests`, with live Supabase insert verification pending server-side `SUPABASE_SERVICE_ROLE_KEY` configuration.

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
- Last Supabase foundation gate on 2026-05-27: `foundation_schema`, `foundation_hardening`, and `anon_read_only` migrations applied to project `npkidywzwddbnfrnxlmo`; Supabase checks confirmed three migrations listed, 24 expected tables, 24/24 RLS enabled, no anonymous private lead/admin privileges, anonymous public content grants are read-only, no missing public-schema foreign-key indexes, and `enquiries_new_queue_idx` / `sample_requests_new_queue_idx` exist. Local gates `npm run build`, `npm run lint`, `npx tsc -b`, `npm run agent:check`, `git diff --check`, and `npm run agent:smoke` pass.
- Last Supabase baseline seed gate on 2026-05-27: `baseline_seed` migration applied to project `npkidywzwddbnfrnxlmo`; Supabase checks confirmed 12 distinct finish definitions, one published `default` site settings row, and idempotent rerun with no duplicate rows.
- Last forms backend source gate on 2026-05-27: `/api/enquiries` and `/api/sample-requests` Pages Functions added; Contact page main submit flow posts to those endpoints; `node scripts/check-forms-api.mjs` confirms valid/invalid/Turnstile-failure behavior with mocked Supabase/Turnstile calls; local gates `npm run build`, `npm run lint`, `npx tsc -b`, and `npm run agent:smoke` pass.
- Last full runtime gate on 2026-05-26: `npm run build`, `npm run lint`, `npx tsc -b`, and `npm run agent:smoke` pass during the capabilities CTA and route update. Build keeps the previous healthy JavaScript chunk profile; Browserslist staleness notice remains.
- Last docs/harness gate on 2026-05-26: `npm run agent:check` and `git diff --check` pass.
- Recent title typography polish on 2026-05-25: global public page H1s now follow the Projects page title treatment, and Article detail no longer uses the old Space Grotesk uppercase H1.
- Recent motion polish on 2026-05-25: route changes now use restrained pathname-keyed enter transitions, and proof metrics visibly count from 0 when scrolled into view.
- Recent Stone Library overlay polish on 2026-05-25: list-card status badges, image provenance, zoom, and collapsed finish labels now use dark translucent surfaces with white text, reserving Urblo lime for confirmed/action signals rather than broad label fills.
- Recent Stone Library status polish on 2026-05-25: external Available/Upcoming/No states now use shared lightweight status pills across detail header, variant switch, finish selector, availability summary, finish capability, and cut option rows; heavy black status blocks and full lime fills are avoided.
- Recent homepage hero polish on 2026-05-26: global header and homepage first-viewport copy use an edge-aligned gutter, and the old `Stone Solutions for Street` hero copy has been replaced with sequential all-caps `DESIGN. SOURCE. DELIVER.` lines, second-line offset, letter-by-letter left-to-right reveal motion, and Urblo-green punctuation.
- Recent homepage proof-section polish on 2026-05-26: the old rendered sustainability/tabbed feature module has been removed from the homepage flow, and the proof metrics section now appears directly after the hero with the approved stone/city framing and updated 50+/130+/20+/3500+ metrics.
- Recent homepage partner-banner copy polish on 2026-05-26: the banner now uses `Design-led stone solutions for streetscapes & civil landscapes.`, highlights `Design-led` in Urblo lime, and renders the sentence from `src/data/homepage.ts` instead of hardcoded JSX copy.
- Recent capabilities bridge on 2026-05-26: the homepage proof section now has a lightweight `Our Capabilities` CTA, and `/capabilities` renders a provisional design/specification/sourcing/delivery capability page until final client content is supplied.
- Recent Supabase planning update on 2026-05-26: the Supabase line is now split into executable tasks: `NOW-SUPABASE-FOUNDATION-001`, `NOW-SUPABASE-SEED-BASELINE-001`, and `NOW-FORMS-BACKEND-001`, with acceptance checks based on Supabase migrations, table listings, RLS policy inspection, and form row creation tests.
- Recent Supabase foundation update on 2026-05-27: `foundation_schema`, `foundation_hardening`, and `anon_read_only` migrations are applied to project `npkidywzwddbnfrnxlmo`; verification confirmed 24 expected tables, RLS enabled on all 24, private lead/admin tables inaccessible to anon, read-only anon grants for public content, and no missing public-schema foreign-key indexes.
- Recent Supabase baseline seed update on 2026-05-27: `baseline_seed` migration is applied and verified with the current Stone Library finish dictionary plus one published default Urblo site settings row.
- Recent forms backend source update on 2026-05-27: Contact form now submits enquiries to `/api/enquiries`; Sample Request mode is available at `/contact?intent=sample-request` and submits to `/api/sample-requests`; footer/sample CTAs now route to the Contact sample-request mode instead of mailto.
- Recent browser QA on 2026-05-25: homepage hero is full viewport at 1440x900 and 390x844; mobile does not select the MP4 source; desktop selects the MP4 with `preload="none"`.
- Recent video QA on 2026-05-25: `public/media/launch/home/urblo-hero.mp4` was re-encoded from about 16MB to about 3MB while preserving 1280x720 playback; desktop video reached `readyState=4`, and mobile still selected no MP4 source.
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
- Supabase foundation schema/RLS and baseline seeds are applied and verified. Form API source is implemented, but live row creation still needs server-side environment variables. Auth, Storage, admin CRUD, and transactional email verification are not implemented yet.
- Contact and Sample Request no longer use mailto for the main submit path in source code, but production persistence is not verified until the Cloudflare Pages Function environment has `SUPABASE_SERVICE_ROLE_KEY`.
- Projects, Stone Library, Products, and Articles are still file-backed rather than customer-editable.
- The admin CMS does not exist yet. `NOW-ADMIN-CMS-001` is an umbrella objective; the no-secret admin IA/access contract is complete in `docs/ADMIN_IA_ACCESS.md`. Supabase foundation/RLS and baseline seeds are applied, but admin auth should wait until first admin email and browser-safe anon-key handling are confirmed.
- P0/P1 old WordPress media references in runtime data have been migrated to controlled local assets under `public/media/launch`; article covers and known detail images now have a local runtime stopgap under `public/media/launch/articles`.
- Stone Library current-site shared-drive image mapping is complete for Golden Crust, Tan Brown, Honey Comb, Ivory Sand, and Tuscany. Secondary frames are wired for Juparana and Zen Grey. Blueocean remains on the controlled fallback and Harcourt remains placeholder/TBC because no matching current-site shared-drive source was found.
- Raw article newsletter HTML remains source material and still needs Supabase structured-block migration, claim-safety review, mobile-safe templates, and full editorial cleanup before the article system is considered final.
- Article mobile overflow has a runtime CSS stopgap verified at 320px for the cost-myth article, but raw newsletter HTML remains the wrong long-term authoring model.
- Product detail pages now initialize default material selections and include selected-summary feedback, a geometry-preview disclaimer, separate material previews, a configuration enquiry CTA, and deliberate pending-image states; deeper product data approval remains part of the CMS/content migration work.
- Legacy project detail pages remain weaker than the Moon Gate material-map case study model; the broad migration task is paused by user direction for now.
- `/capabilities` is intentionally provisional. Replace the current capability copy and supporting modules when the client supplies final service/capability content, and avoid treating the placeholder as final launch copy without review.
- Article claim cleanup remains paused by user direction for now; do not change article claim wording until explicitly resumed.
- Public URL style is normalized to lowercase kebab-case across products, articles, projects, and Stone Library. Old product/article URLs are preserved through `public/_redirects` and runtime alias handling.
- App shell default Vite metadata, starter README content, and default social image issues have been replaced; launch polish debt remains around future campaign-specific share imagery only if the client wants a bespoke preview.
- Image hosting policy must now be resolved against the Cloudflare/Supabase launch plan.
- GitHub Pages deployment hardening is a legacy fallback only; Cloudflare Pages is the active target and currently blocked at account-level project setup.
- Short-term GitHub Pages preview routing now generates `404.html` from `index.html` during deploy so direct clean-route visits can load the React app. Live deep-link rendering was confirmed on `/stone-library/angola-black`, though GitHub Pages still reports HTTP 404 for fallback-served routes. This is a compatibility patch only; Cloudflare Pages remains the production launch target and should use `public/_redirects`.
- Route-level code splitting resolved the previous bundle size warning; future admin/CMS additions should keep chunk output under review.
- Moon Gate material/application notes are intentionally MVP-inferred from supplied imagery and public project context; designer confirmation is still needed before final production claims.
- Other project pages still have legacy-level content and need migration into the material-map model.
- Homepage video is now a controlled, optimized static launch asset. Live Cloudflare preview should still verify actual LCP/network behavior after deployment, and Cloudflare Stream/R2 remains optional for adaptive video management.

## Next Recommended Action
Continue `NOW-FORMS-BACKEND-001` by configuring a server-side `SUPABASE_SERVICE_ROLE_KEY` for local/Cloudflare Pages Function verification, then run live API tests proving valid enquiries and sample requests create Supabase rows and invalid submissions create no rows. Optional `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `LEAD_NOTIFICATION_FROM`, `ENQUIRY_NOTIFICATION_TO`, and `SAMPLE_REQUEST_NOTIFICATION_TO` can be added after the database write path is verified. Keep article claim cleanup and broad legacy project migration paused until the user resumes them. `NEXT-MOTION-POLISH-001`, `NEXT-PAGE-TITLE-TYPOGRAPHY-001`, `NEXT-STONELIB-IMAGE-LABEL-READABILITY-001`, `NEXT-STONELIB-STATUS-PILL-CONSISTENCY-001`, and `NEXT-HOME-HERO-EDGE-REVEAL-001` are complete unless browser QA finds a regression. Start Cloudflare production deployment/DNS cutover only after Supabase-backed form behavior is verified or the user explicitly accepts a static-only launch.

## Guardrails
- Use repo-root relative paths in committed docs.
- Keep current state short here; write detailed history in `docs/WORKLOG.md`.
- Do not use `docs/NEXT_STEPS.md` as the machine task queue; update `docs/agent/tasks.json` for task state.
