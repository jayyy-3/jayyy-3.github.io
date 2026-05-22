# WORKLOG - Urblo Execution Log

Last updated: 2026-05-22

## Entry - 2026-05-22 (Old-Site Favicon Restoration)

### Scope
- Replaced the temporary SVG favicon with the original WordPress site icon files from the old Urblo site.
- Added controlled local PNG icon assets for 32x32, 192x192, 512x512, Apple touch, and Microsoft tile use.
- Updated `index.html` and `public/site.webmanifest` to reference the old-site-matched PNG icon set.
- Updated architecture and task queue docs so agents do not reintroduce the temporary SVG icon.

### Changed Files
- `index.html`
- `public/favicon.png`
- `public/favicon-32x32.png`
- `public/favicon-192x192.png`
- `public/apple-touch-icon.png`
- `public/mstile-270x270.png`
- Removed the temporary SVG favicon file.
- `public/site.webmanifest`
- `docs/ARCHITECTURE.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: homepage head exposes PNG favicon and Apple touch icon links, no `favicon.svg` reference remains.
- Static asset checks: favicon PNGs and manifest return HTTP 200 from the local dev server.

### Risks and Gaps
- Browser favicon caches can be sticky; production verification should use a hard refresh or a fresh browser profile after deployment.
- Final social share image is still `public/og-default.svg` and remains separate from favicon work.

### Next Handoff
- Continue `NOW-SEO-DELIVERY-001` with article media/HTML cleanup.
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-22 (Legacy Project and Stone Fallback Media)

### Scope
- Migrated legacy project listing/detail images from old WordPress URLs into `public/media/launch/projects`.
- Migrated remaining Stone Library fallback images from old WordPress URLs into `public/media/launch/stone-library/fallbacks`.
- Updated `src/data/projectData.ts` and `src/data/stoneFinishImages.ts` to use controlled local paths.
- Updated asset audit, architecture, handoff, roadmap, and task queue docs to record that direct old WordPress media references are no longer present in runtime data.

### Changed Files
- `public/media/launch/projects`
- `public/media/launch/stone-library/fallbacks`
- `src/data/projectData.ts`
- `src/data/stoneFinishImages.ts`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `rg "urblo.com.au/wp-content/uploads" src public/articles data`: no results.
- Browser QA: Projects list, legacy project detail pages, Stone Library list, and Blueocean stone detail showed no broken images and no old WordPress image URLs.

### Risks and Gaps
- Article list/detail media still contains external Squarespace, Google, and Front email artifacts and should be cleaned through `NOW-SEO-DELIVERY-001` and the Article CMS migration.
- Local launch media remains a stopgap; Supabase/Cloudflare media records are still required for long-term customer-maintained content.

### Next Handoff
- Continue `NOW-SEO-DELIVERY-001` with article media/HTML cleanup.
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-22 (Homepage Video Replacement and P1 Visible Media)

### Scope
- Replaced the old local homepage MP4 with a web-ready H.264 720p export from the user-provided `Urblo_Homepage.mp4`.
- Kept the public runtime path as `public/media/launch/home/urblo-hero.mp4` so the existing homepage and video modal code continues to use the controlled source.
- Migrated homepage section imagery, latest-project thumbnails, Stone Showcase thumbnails, manifesto imagery, partner logos, and video CTA background away from old WordPress URLs.
- Migrated Our Story portraits away from old WordPress URLs and replaced the old carbon banner URL, which returned 404, with the controlled local route banner.
- Updated architecture, asset audit, handoff, roadmap, and task queue docs to reflect the new media state.

### Changed Files
- `public/media/launch/home/urblo-hero.mp4`
- `public/media/launch/homepage`
- `public/media/launch/our-story`
- `src/data/homepage.ts`
- `src/pages/OurStory.tsx`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: desktop homepage selected the new local MP4, reported `readyState=4`, `1280x720`, `17.67s`, and no broken first-screen images; mobile homepage selected no MP4 source and kept the local poster fallback.

### Risks and Gaps
- `NOW-ASSET-MIGRATION-001` remains open because legacy project media, Stone Library fallback media, and article media still need migration.
- The homepage MP4 is controlled locally for launch safety but should still be reviewed for Cloudflare R2 or Stream before production scale.
- The original user-provided HEVC source was not committed; only the web-ready export is in the repository.

### Next Handoff
- Continue `NOW-ASSET-MIGRATION-001` with legacy project media and Stone Library fallback media.
- `NOW-FORMS-SUPABASE-001`
- `NOW-SEO-DELIVERY-001`

## Entry - 2026-05-22 (P0 Launch Media Stopgap)

### Scope
- Downloaded and controlled the launch-critical logo, homepage poster, contact image, and homepage MP4 under `public/media/launch`.
- Generated controlled route banner stopgaps from existing project media because several old WordPress banner URLs now return 404.
- Repointed shared logo, homepage hero media, video modal source, route banners, Contact page imagery, and matching homepage proof imagery away from old WordPress URLs.
- Added mobile homepage video fallback behavior so mobile viewports keep the poster and do not select the 10 MB MP4 source.
- Added a Cloudflare Pages cache rule for unversioned `/media/*` launch assets.
- Updated architecture, handoff, roadmap, task queue, and asset audit docs so the current launch media posture is explicit.

### Changed Files
- `public/_headers`
- `public/media/launch`
- `src/App.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `src/data/siteChrome.ts`
- `src/pages/ContactPage.tsx`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: desktop homepage selected the local MP4 and local poster; mobile homepage selected no MP4 source and kept the local poster; Products, Product detail, Projects, Our Story, Contact, Articles, and Article detail route banners loaded from local `public/media/launch` paths with no broken images observed.

### Risks and Gaps
- `NOW-ASSET-MIGRATION-001` remains open because P1/P2 media still depends on old WordPress, Squarespace, Google, and Front URLs.
- The homepage MP4 is controlled locally for launch safety but should still be reviewed for Cloudflare R2 or Stream before production scale.
- Article cover GIFs and newsletter HTML media remain part of the article CMS cleanup path.
- React Helmet still emits the existing strict-mode dev-console warning.

### Next Handoff
- Continue `NOW-ASSET-MIGRATION-001` with P1 homepage/project/Stone Library media migration.
- `NOW-FORMS-SUPABASE-001`
- `NOW-SEO-DELIVERY-001`

## Entry - 2026-05-22 (Asset Migration Audit)

### Scope
- Added `docs/ASSET_MIGRATION_AUDIT.md` to inventory old WordPress and remote article media dependencies.
- Classified launch media risk into P0, P1, and P2 groups.
- Identified homepage video/poster, logo, route banners, contact image, and share image as pre-cutover risks.
- Documented storage targets for normal images, homepage video, and short-term local stopgap assets.
- Added verification commands for checking residual old-site media references before cutover.

### Changed Files
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/HANDOFF.md`
- `docs/agent/tasks.json`
- `docs/WORKLOG.md`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates intentionally skipped because this is a docs/asset-audit change only.

### Risks and Gaps
- `NOW-ASSET-MIGRATION-001` remains open because the audit is complete but actual media migration is not.
- Homepage video/poster and old WordPress route banners remain runtime dependencies.
- Article media cleanup remains tied to the future article CMS block migration.

### Next Handoff
- Continue `NOW-ASSET-MIGRATION-001` with P0 asset replacement.
- Continue `NOW-SEO-DELIVERY-001` article cleanup and claim-safety review.
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-22 (SEO Metadata Baseline)

### Scope
- Replaced the default Vite title and favicon references in `index.html`.
- Added Urblo favicon, web manifest, and default share image assets.
- Added route-level title, description, canonical, Open Graph, and Twitter metadata through `react-helmet`.
- Removed inactive footer social placeholders for Facebook and YouTube until real destinations are available.
- Tightened visible sustainability wording by replacing obvious typo/placeholder copy and avoiding the prior absolute "100%" carbon wording.

### Changed Files
- `index.html`
- Temporary SVG favicon asset, later replaced by old-site PNG icons.
- `public/og-default.svg`
- `public/site.webmanifest`
- Removed retired Vite favicon asset.
- `src/App.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `src/data/siteChrome.ts`
- `docs/ARCHITECTURE.md`
- `docs/agent/tasks.json`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- `NOW-SEO-DELIVERY-001` remains open because article cleanup and broader claim-safety review are not complete.
- Default share image is an SVG placeholder asset; a production PNG/JPEG share image should be considered after media migration.
- `react-helmet` strict-mode warning remains a known dev-console issue.

### Next Handoff
- Continue `NOW-SEO-DELIVERY-001`.
- `NOW-ASSET-MIGRATION-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-22 (Cloudflare Pages Repo Prep)

### Scope
- Switched routing from `HashRouter` to `BrowserRouter` for Cloudflare-friendly clean URLs.
- Changed Vite `base` to `/` for root-domain Pages deployment and direct-refresh asset loading.
- Added Cloudflare Pages static config: `public/_redirects`, `public/_routes.json`, and `public/_headers`.
- Updated smoke checks from hash routes to clean routes, including product and project detail paths.
- Added `docs/CLOUDFLARE_DEPLOYMENT.md` as the deployment, environment, preview, DNS, and rollback runbook.
- Marked `NEXT-ROUTER-SEO-001` done and marked `NOW-CLOUDFLARE-PAGES-DEPLOY-001` blocked at account-level setup after repo-side prep.

### Changed Files
- `src/App.tsx`
- `vite.config.ts`
- `public/_redirects`
- `public/_routes.json`
- `public/_headers`
- `scripts/agent-smoke.sh`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass for clean routes `/`, `/stone-library`, `/stone-library/alpine-white`, `/products`, `/products/primeBlock`, `/projects`, `/projects/moon-gate-woolley-street`, `/our-story`, `/contact`, `/articles`, plus `/articles/index.json`.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Cloudflare dashboard project creation, preview URL validation, custom domain, DNS cutover, and rollback still require account access.
- The current GitHub Pages workflow remains as a legacy path and may not represent final launch behavior.
- BrowserRouter clean URLs rely on the Cloudflare Pages SPA fallback when deployed.

### Next Handoff
- `NOW-SEO-DELIVERY-001`
- `NOW-ASSET-MIGRATION-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-22 (Supabase Schema Plan)

### Scope
- Closed `NOW-CLOUDFLARE-SUPABASE-ARCH-001` after the launch architecture and cost model were pushed to origin.
- Added `docs/SUPABASE_SCHEMA.md` as the first Supabase schema design contract.
- Covered admin roles, site settings, media assets, Stone Library, Products, Projects, Articles, enquiries, sample requests, RLS expectations, indexes, and migration phases.
- Added Products to the CMS and schema scope so product pages are not left as static code-only data.
- Updated launch, architecture, roadmap, task queue, and handoff docs to point at the schema plan.

### Changed Files
- `docs/SUPABASE_SCHEMA.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`
- `docs/WORKLOG.md`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates intentionally skipped because this is a docs/schema planning change only.

### Risks and Gaps
- The schema is documented but has not been implemented as Supabase migrations.
- RLS policies, storage buckets, admin users, seed scripts, and form APIs still need implementation and live verification.
- Actual Cloudflare and Supabase project setup requires account access.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-22 (Cloudflare + Supabase Launch Harness)

### Scope
- Recorded the launch decision to use Cloudflare Pages, Cloudflare Pages Functions, Supabase, and an Urblo-owned admin CMS.
- Added a long-form launch plan with monthly platform cost planning, required workstreams, and launch readiness gates.
- Recorded that `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md` is temporary before launch and must be consolidated into architecture, operations, and worklog docs after production launch.
- Updated machine task priority so Cloudflare/Supabase schema, deployment, forms, admin CMS, media migration, and SEO delivery are the active launch track.
- Added verification profiles for Cloudflare deployment, Supabase schema/data migration, backend API/forms, and admin CMS work.
- Updated handoff and roadmap docs to distinguish current static/file-backed runtime reality from the target launch architecture.

### Changed Files
- `AGENTS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates intentionally skipped because this is a docs/harness planning change only.

### Risks and Gaps
- Runtime code still deploys as a static app and still uses mailto/local-only form behavior until implementation tasks are completed.
- Supabase schema, RLS, Auth, Storage, Pages Functions, transactional email, and `/admin` are not yet implemented.
- Cloudflare Pages project, environment variables, DNS cutover, and rollback still need implementation and verification.
- Platform costs are estimates and must be rechecked before billing commitments or major usage changes.

### Next Handoff
- `NOW-CLOUDFLARE-SUPABASE-ARCH-001`
- `NOW-SUPABASE-SCHEMA-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-05-18 (Project Typography Alignment)

### Scope
- Verified the live Urblo project archive/detail title system against `urblo.com.au`: project H1 uses `Avenir LT Std`, light `300`, normal letter spacing, and no forced uppercase.
- Replaced the local project archive/detail title treatment that was inheriting the heavier `Space Grotesk` display style.
- Added project-specific typography utilities for project page titles, project hero titles, section headings, and material/card titles.
- Updated Project listing, Project detail, Project cards, and Material Map inspector headings to use the project typography system.
- Updated design and handoff docs so future project pages preserve the live Urblo title pattern.

### Changed Files
- `src/index.css`
- `src/pages/Projects.tsx`
- `src/pages/ProjectDetails.tsx`
- `src/components/ProjectCard.tsx`
- `src/components/projects/ProjectMaterialMap.tsx`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- Playwright visual QA: local Moon Gate project H1 computed styles matched the live Urblo project-title pattern for family, weight, size, line-height, letter spacing, and text transform.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The broader site still keeps its existing `urblo-page-title` display treatment outside project pages; this change intentionally scopes the live Avenir title correction to Projects.
- Bundle size warning (`>500kB`) remains out of scope.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-DELIVERY-READINESS-001`

## Entry - 2026-05-18 (Project Material Map Refinement)

### Scope
- Refined the Moon Gate project page from a broad editorial case-study layout into a material-first project detail flow.
- Removed the heavy conceptual `Surface / Void / Pause` narrative modules from the rendered page.
- Reworked `ProjectMaterialMap` so hotspots identify stone/finish/application placement and resolve stone labels, finish labels, preview imagery, and links through `StoneLibraryService`.
- Replaced large featured-material cards with a compact material schedule.
- Fixed the legacy project detail copy path so non-Moon Gate projects no longer inherit Moon Gate-specific narrative text.
- Updated architecture, design, and handoff docs to reflect the material-first hotspot contract.

### Changed Files
- `src/components/projects/ProjectMaterialMap.tsx`
- `src/data/projectData.ts`
- `src/pages/ProjectDetails.tsx`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass.
- `git diff --check`: pass.
- Playwright visual QA: desktop and mobile Moon Gate detail page checked locally; hotspot click changed the active material inspector.
- Playwright visual QA: legacy ACU project detail checked locally; Moon Gate-specific copy was absent.

### Risks and Gaps
- Moon Gate material/application notes remain MVP-inferred and need designer/project-team confirmation before final production claims.
- Other project pages still use legacy-level content until migrated.
- Bundle size warning (`>500kB`) remains out of scope.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-DELIVERY-READINESS-001`

## Entry - 2026-05-15 (Moon Gate Project Material Map MVP)

### Scope
- Built `Moon Gate | Woolley Street` as the first designer-facing project case study and Project Material Map MVP.
- Copied supplied Moon Garden imagery into controlled deployment assets under `public/images/projects/moon-gate`.
- Unified project listing/detail metadata through `src/data/projectData.ts` and closed the previous project data drift task.
- Added reusable hotspot interaction through `src/components/projects/ProjectMaterialMap.tsx`.
- Rebuilt project detail layout around a page-owned hero, project facts, design narrative, material map, Urblo scope, featured materials, gallery, and CTA.
- Linked Moon Gate featured materials to Stone Library entries for Angola Black and New Grey.
- Updated architecture/design/handoff/task docs for the new project data and interaction contract.

### Changed Files
- `.gitignore`
- `src/App.tsx`
- `src/components/projects/ProjectMaterialMap.tsx`
- `src/data/projectData.ts`
- `src/layouts/DefaultLayout.tsx`
- `src/pages/ProjectDetails.tsx`
- `src/pages/Projects.tsx`
- `public/images/projects/moon-gate/*`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- Playwright CLI visual QA: desktop and mobile Moon Gate detail page checked; hotspot hover/tap changed active cards.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Moon Gate scope/design copy is MVP-inferred from supplied imagery, confirmed finish notes, and public project context; designer confirmation is still needed before treating it as final project truth.
- New Grey finish is recorded as Flamed per user confirmation; Angola Black remains Polished.
- Quantity is presented as `5 bespoke stone elements` based on the previous `5 Units` field and should be confirmed later.
- Other projects still use legacy-level project detail content until migrated into the material-map model.
- React Helmet still emits an existing dev strict-mode lifecycle warning.
- Bundle size warning (`>500kB`) remains out of scope.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-DELIVERY-READINESS-001`

## Entry - 2026-05-15 (Agent Init and Static Smoke Harness)

### Scope
- Added `scripts/agent-init.sh` and package script `npm run agent:init` for quick repo/status/read-order briefing.
- Added `scripts/agent-smoke.sh` and package script `npm run agent:smoke` for lightweight Vite preview smoke checks across key hash routes and `public/articles/index.json`.
- Updated `AGENTS.md`, `docs/HANDOFF.md`, `docs/ARCHITECTURE.md`, `docs/NEXT_STEPS.md`, and `docs/agent/verification.md` to include the new Phase 2 commands.
- Removed the temporary missing-file allowance for `scripts/agent-smoke.sh` now that the script exists.

### Changed Files
- `AGENTS.md`
- `package.json`
- `docs/HANDOFF.md`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/verification.md`
- `scripts/agent-init.sh`
- `scripts/agent-smoke.sh`
- `scripts/check-doc-paths.mjs`
- `scripts/check-harness.mjs`

### Verification Results
- `npm run agent:check`: pass.
- `npm run agent:init`: pass.
- `npm run agent:smoke`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- `agent:smoke` is a static shell smoke using Vite preview; it does not replace future browser-rendered visual or interaction checks.
- Runtime application gates remain last measured on 2026-05-08 unless a runtime task reruns them.

## Entry - 2026-05-15 (AI Harness Root Entry + Design Contract)

### Scope
- Promoted the agent harness entry from `docs/README_AGENT.md` to root-level `AGENTS.md` so Codex has a clear project entry point.
- Added `docs/DESIGN.md` as the canonical design contract for visual rhythm, UX tone, page archetypes, Stone Library behavior, imagery, copy claim posture, and design QA.
- Updated brand/architecture/backlog docs to separate brand authority from design execution authority.
- Refreshed stale harness wording around quality gate measurement and the old live-browsing limitation note.
- Converted committed docs to repo-root relative paths and added a rule to keep local absolute paths out of repo docs.
- Rephrased archived source references in `docs/brand-baseline.md` and `docs/DESIGN.md` so external materials are not presented as repo files.
- Added Phase 1 harness artifacts: `docs/HANDOFF.md`, `docs/agent/tasks.json`, `docs/agent/verification.md`, `scripts/check-doc-paths.mjs`, and `scripts/check-harness.mjs`.
- Slimmed `docs/NEXT_STEPS.md` into a human-readable roadmap backed by the machine-readable task queue.

### Changed Files
- `AGENTS.md`
- `package.json`
- `docs/README_AGENT.md` (retired)
- `docs/HANDOFF.md`
- `docs/DESIGN.md`
- `docs/brand-baseline.md`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-doc-paths.mjs`
- `scripts/check-harness.mjs`

### Verification Results
- Documentation-only change; runtime gates were not rerun.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- `DESIGN.md` is a first canonical pass and should evolve after final Figma/WordPress parity decisions.
- Runtime quality gates remain last measured on 2026-05-08.

## Entry - 2026-05-08 (Stone Library Visual Density Polish)

### Scope
- Restyled Stone Library list/detail surfaces into a tighter material-library tool experience.
- Removed the empty black banner on Stone Library list/detail routes by using the header-only default layout spacer.
- Tightened list page hero spacing, filter control sizing, card image ratio, card typography, status badges, card borders, and placeholder imagery.
- Reduced Stone Library detail media stage scale and improved finish selector text contrast/readability, especially on mobile.
- Kept route behavior, filtering behavior, finish selection, centering, and lightbox behavior unchanged.

### Changed Files
- `src/App.tsx`
- `src/pages/StoneLibraryPage.tsx`
- `src/pages/StoneLibraryDetailPage.tsx`
- `src/components/stone-library/FilterBar.tsx`
- `src/components/stone-library/StoneCard.tsx`
- `src/components/stone-library/ImageStage.tsx`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/SpecsPanel.tsx`
- `src/service/StoneLibraryService.ts`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass
- Playwright CLI visual smoke check:
  - `/stone-library` desktop: compact header, tighter filter bar, four-column material cards, lighter missing-image placeholder.
  - `/stone-library` mobile: stacked filter controls and first card render without horizontal overflow.
  - `/stone-library/alpine-white` desktop: reduced media stage scale, readable finish selector, specs visible below the comparison surface.
  - `/stone-library/alpine-white` mobile: no horizontal document overflow (`scrollWidth` equals `clientWidth` at 390px).

### Risks and Gaps
- React Helmet still emits the known strict-mode `UNSAFE_componentWillMount` console warning via `SideEffect(NullComponent2)`.
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.
- Long-tail Stone Library image mapping gaps remain under existing image backlog items.

### Next Handoff
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-DELIVERY-READINESS-001`
- `NOW-ASSET-STRATEGY-001`
- `NOW-DEPLOY-PAGES-HARDEN-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-08 (Contact Route + Our Story Team Update + Docs Contract Sync)

### Scope
- Removed Bob Lu and Hunter from the Our Story team section.
- Replaced the four-person Swiper carousel with a stable two-person responsive grid for Natalie and Cameron.
- Added a `/contact` route with direct email/phone/address contact channels and a no-backend project-brief form that opens a prefilled email draft.
- Updated shared header/footer navigation so Contact Us points to `/contact`; Sample Request remains a `mailto:` fallback.
- Updated active harness docs to remove stale footer route mismatch claims and old component references in the backlog.

### Changed Files
- `src/App.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/OurStory.tsx`
- `src/data/siteChrome.ts`
- `src/components/site/SiteFooter.tsx`
- `docs/README_AGENT.md`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass
- Playwright CLI smoke check:
  - `/contact`: route loads with title `Urblo - Contact Us`; header/footer Contact links resolve to `#/contact`; Sample Request resolves to `mailto:info@urblo.com.au?subject=Sample%20Request`.
  - `/contact` mobile viewport: header collapses to the existing toggle menu and Contact Us remains available in the expanded menu.
  - `/our-story`: route loads with title `Urblo - Our Story`; team section renders only Natalie and Cameron.

### Risks and Gaps
- Contact form is intentionally not a backend submission; it opens a prefilled email draft through `mailto:`.
- React Helmet still emits the known strict-mode `UNSAFE_componentWillMount` console warning via `SideEffect(NullComponent2)`.
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.

### Next Handoff
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-DELIVERY-READINESS-001`
- `NOW-ASSET-STRATEGY-001`
- `NOW-DEPLOY-PAGES-HARDEN-001`
- `NEXT-UI-PARITY-001`
- `NEXT-SAMPLE-REQUEST-001`

## Entry - 2026-03-26 (Homepage Rebuild + Local Font Hosting)

### Scope
- Rebuilt the homepage from the legacy tabbed `FeatureSection` into a dedicated long-form landing page composed of:
  - hero
  - sustainability
  - trusted partner banner
  - product showcase
  - metrics
  - latest projects
  - stone showcase
  - manifesto
  - video CTA
- Added a homepage-only layout so the new Figma-style header/footer does not change non-home routes.
- Localized homepage fonts into `public/fonts/urblo`:
  - `Avenir LT Std`
  - `Didot LT Std`
  - `Space Grotesk`
- Removed the old home-only tab/panel component stack after confirming it was no longer referenced.
- Kept homepage images/video remote for this phase; only fonts were moved on-platform.

### Changed Files
- `src/App.tsx`
- `src/pages/Home.tsx`
- `src/index.css`
- `src/layouts/HomepageLayout.tsx`
- `src/components/homepage/HomepageHeader.tsx`
- `src/components/homepage/HomepageFooter.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `public/fonts/urblo/*`
- `docs/ARCHITECTURE.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Homepage still depends on remote WordPress-hosted image/video assets by design for this phase.
- Bundle size warning (`>500kB`) remains unchanged from prior sessions.
- `docs/NEXT_STEPS.md` already had user-side uncommitted changes and was left untouched in this session.

## Baseline Entry - 2026-02-09 (Docs Reset)

### Scope
- Full rewrite of active execution docs to code-truth baseline:
  - `docs/README_AGENT.md`
  - `docs/ARCHITECTURE.md`
  - `docs/NEXT_STEPS.md`
  - `docs/WORKLOG.md`
- `docs/brand-baseline.md` kept read-only.

### Rationale
- Active docs contained legacy project assumptions and outdated technical contracts.
- Objective of this reset: make docs executable for future agents using current repository facts, while keeping brand baseline linked as advisory decision rubric.

### Measured Current State
- `npm run build`: pass
- `npm run lint`: fail
  - 3 errors from linting generated file under `.vite/deps/react-router-dom.js`
  - 1 warning in `src/pages/ProductDetailPage.tsx`
- `npx tsc -b`: pass

### Key Risks at Handoff
- Navigation links to routes not declared in router (`/sample-request`, `/contact`, `/en-au/contact-us`).
- Internal anchor usage is inconsistent with `HashRouter` behavior.
- Duplicate `/products` route declaration exists in `src/App.tsx`.
- Lint gate is currently blocking and must be fixed before feature delivery closure.

### Next Handoff Focus
- Execute in order:
  - `NOW-ROUTE-001`
  - `NOW-LINT-001`
  - `NOW-RUNBOOK-001`
- Keep brand baseline advisory linkage in all user-facing tasks.

## Entry - 2026-02-09 (Stone Library Refactor + Docs Closure)

### Scope
- Replaced legacy Material/New Material route family with a unified Stone Library experience:
  - `/stone-library`
  - `/stone-library/:stoneGroupId`
- Introduced Stone Library typed contracts, service layer, filters, detail variant switching, and finish accordion UX.
- Migrated product body-stone options from removed `materialData.ts` to `StoneLibraryService` output.
- Removed obsolete material pages/components/data that were no longer referenced.
- Updated docs to match post-refactor route/data contracts and quality gate reality.

### Changed Files (This Session)
- `src/App.tsx`
- `src/components/Header.tsx`
- `src/pages/StoneLibraryPage.tsx`
- `src/pages/StoneLibraryDetailPage.tsx`
- `src/components/stone-library/FilterBar.tsx`
- `src/components/stone-library/StoneCard.tsx`
- `src/components/stone-library/VariantSwitch.tsx`
- `src/components/stone-library/ImageStage.tsx`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/SpecsPanel.tsx`
- `src/types/stone-library.ts`
- `src/service/StoneLibraryService.ts`
- `src/data/finishBehaviorMeta.ts`
- `src/data/stoneFinishImages.ts`
- `src/pages/ProductDetailPage.tsx`
- `src/data/productData.ts`
- `src/types/product.ts`
- `tsconfig.app.json`
- `eslint.config.js`
- `docs/README_AGENT.md`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Footer still links to undeclared in-app routes (`/sample-request`, `/contact`) and needs route-safe remediation.
- Stone finish HD imagery mapping is still partial and currently falls back to placeholders/defaults where missing.
- Finish behavior notes are currently generic defaults and should be replaced with approved production copy.
- Bundle warning (`>500kB`) remains and requires code-splitting work.

### Next Handoff
- `NOW-ROUTE-002`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-DATA-001`

## Entry - 2026-02-09 (Variant Correction + Product Group Mode)

### Scope
- Corrected Stone Library variant behavior to match business rules:
  - Golden Crust: only Light/Dark
  - Harcourt: no variant switch (single base stone)
  - Tuscany: only Vein Cut/Cross Cut
- Applied fixes in both clean runtime data and service-layer normalization to prevent future source regression from leaking into UI.
- Updated Products body-stone selector to group-level options only (no variant-level entries in selector UI).
- Deferred dual-side accordion and price-tier visualization to documented backlog with explicit acceptance criteria.

### Changed Files
- `data/clean/stone_library.json`
- `data/clean/stone_variants.csv`
- `src/service/StoneLibraryService.ts`
- `src/pages/ProductDetailPage.tsx`
- `src/types/product.ts`
- `src/data/productData.ts`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Sample-related clean files (`sample_catalog.json`, `sample_items.csv`, `stone_finish_capabilities.csv`) still contain legacy variant entries by design for this scope and may diverge from Stone Library display rules.
- Left-side media on detail page is not yet a true image accordion; right list still drives current active preview.
- Price range display remains textual (`$ / $$ / $$$`) and is pending tier-meter redesign.

### Next Handoff
- `NEXT-STONELIB-UX-ACC-001`
- `NEXT-STONELIB-PRICE-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-DATA-001`

## Entry - 2026-02-09 (Stone Library UI Interaction Closure)

### Scope
- Finalized Stone Library detail interaction contract for selection stability and texture inspection:
  - Right-side finish list switched to click-only selection (no hover-triggered active changes).
  - Left image accordion retained hover preview + click lock behavior.
- Removed heavy in-image dark overlay/caption treatment on active panels and kept cleaner finish-first visual treatment.
- Enforced active panel 3:2 presentation with narrow collapsed panels and horizontal overflow-safe behavior.
- Added finish lightbox for deep visual review:
  - full-screen open/close, prev/next, keyboard shortcuts, and 1x/2x zoom with drag-pan.
- Updated architecture/backlog docs to reflect new runtime interaction contract and completed UX task.

### Changed Files
- `src/components/stone-library/ImageStage.tsx`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/FinishLightbox.tsx`
- `src/pages/StoneLibraryDetailPage.tsx`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Bundle size warning (`>500kB`) remains and is unchanged by this scope.
- `react-helmet` strict-mode lifecycle warning remains unrelated and is not addressed in this session.

### Next Handoff
- `NEXT-STONELIB-LAYOUT-001`
- `NEXT-STONELIB-PRICE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-02-09 (Stone Library Click-Only + Finish Centering)

### Scope
- Converted Stone Library left image accordion from hover-preview behavior to click-only finish selection.
- Added active finish centering behavior so each finish selection click re-centers the left-stage active panel.
- Simplified finish state composition in detail page by removing preview state and adding a center-request token.
- Updated architecture and backlog docs to match the new interaction contract.

### Changed Files
- `src/pages/StoneLibraryDetailPage.tsx`
- `src/components/stone-library/ImageStage.tsx`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.
- Left-stage centering behavior currently assumes smooth scrolling; reduced-motion preference handling is not yet added.

### Next Handoff
- `NEXT-STONELIB-LAYOUT-001`
- `NEXT-STONELIB-PRICE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-02-09 (Stone Library Finish Visibility Guard)

### Scope
- Added a visibility guard to Stone Library left-stage auto-scroll behavior.
- Finish selection now keeps current scroll position when the active panel is fully visible in the horizontal viewport.
- Auto-scroll executes only when active panel is clipped or out of frame, then uses best-effort smooth centering.
- Updated architecture contract wording to match the new “visible then no-move” rule.

### Changed Files
- `src/components/stone-library/ImageStage.tsx`
- `docs/ARCHITECTURE.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.

### Next Handoff
- `NEXT-STONELIB-LAYOUT-001`
- `NEXT-STONELIB-PRICE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-02-09 (Stone Library Low-Finish Viewport Fill)

### Scope
- Added low-finish viewport fill behavior to Stone Library left media stage.
- Kept active panel fixed at 3:2 while expanding non-active panel widths when default widths do not fill the stage viewport.
- Added single-finish layout behavior that keeps the lone 3:2 panel centered instead of stretching full width.
- Kept existing visibility-guarded scrolling policy: no scroll movement when active panel is fully visible.
- Updated architecture/backlog docs to reflect this interaction contract.

### Changed Files
- `src/components/stone-library/ImageStage.tsx`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.
- Fill-width computation depends on runtime measurement and may need tuning if panel gap token changes in future style updates.

### Next Handoff
- `NEXT-STONELIB-LAYOUT-001`
- `NEXT-STONELIB-PRICE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-02-09 (Stone Library Motion Debounce Tuning)

### Scope
- Tuned ImageStage interaction to remove perceived “second tug” after finish selection.
- Removed delayed second-pass centering and replaced resize-driven width recompute with debounced scheduling.
- Added fill-width state change guard to avoid redundant updates when measured width drift is negligible.

### Changed Files
- `src/components/stone-library/ImageStage.tsx`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.

### Next Handoff
- `NEXT-STONELIB-LAYOUT-001`
- `NEXT-STONELIB-PRICE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-02-09 (Stone Library Width/Center Motion Refactor)

### Scope
- Refactored Stone Library ImageStage motion system to stabilize centering and remove race conditions between width recompute and scroll decisions.
- Separated layout engine (inactive fill width computation) from scroll engine (click-token visibility-check scroll).
- Replaced width animation with immediate width updates; retained smooth scrolling only when active panel is clipped.
- Added strict-mode guard using center token tracking to prevent duplicate scroll decisions from effect double-invocation.

### Changed Files
- `src/components/stone-library/ImageStage.tsx`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.
- Runtime width measurement still depends on current gap token values and should be re-checked if stage spacing styles change.

### Next Handoff
- `NEXT-STONELIB-LAYOUT-001`
- `NEXT-STONELIB-PRICE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-02-09 (Popup Persistence Fix + Price Tier Meter + Backlog Closure)

### Scope
- Fixed welcome popup persistence behavior so first display writes `seenPopup` and prevents repeat display on later visits.
- Replaced plain stone detail price text with a 3-level visual tier meter (`Budget / Balanced / Premium`) while preserving source notation (`$ / $$ / $$$`) for traceability.
- Applied graceful fallback to `Price on request` for `tbc` stones or missing/invalid tier values.
- Closed `NEXT-STONELIB-LAYOUT-001` by user acceptance and moved both layout/price tasks from `Next` to `Done` in backlog docs.
- Updated architecture and execution docs to keep runtime contracts synchronized.

### Changed Files
- `src/components/WelcomePopup.tsx`
- `src/types/stone-library.ts`
- `src/service/StoneLibraryService.ts`
- `src/components/stone-library/SpecsPanel.tsx`
- `src/pages/StoneLibraryDetailPage.tsx`
- `docs/README_AGENT.md`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Footer still links to undeclared routes (`/sample-request`, `/contact`) until `NOW-ROUTE-002` closes.
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.
- Stone Library image and finish-data completion work remains open under existing now/next tasks.

### Next Handoff
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-DELIVERY-READINESS-001`
- `NOW-ASSET-STRATEGY-001`
- `NOW-ROUTE-002`
- `NEXT-UI-PARITY-001`
- `NEXT-SAMPLE-REQUEST-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-IMG-002`
- `NEXT-STONELIB-DATA-001`
- `NEXT-DATA-001`

## Entry - 2026-05-22 (Article Media Launch Cleanup)

### Scope
- Replaced article list/detail cover GIF URLs with controlled local WebP still images under `public/media/launch/articles`.
- Added runtime article HTML preparation before DOMPurify sanitization so known Squarespace/Front/Google proxy images resolve to local media, Google emoji images become text, and known campaign/unsubscribe/old-upload links are stripped or rewritten.
- Kept raw newsletter HTML as migration source only; long-term article authoring remains Supabase structured blocks through the admin CMS.
- Updated architecture, asset audit, handoff, roadmap, and machine task queue to reflect the current article stopgap and remaining CMS work.

### Changed Files
- `public/media/launch/articles`
- `public/articles/index.json`
- `public/articles/*/meta.json`
- `src/lib/articleMedia.ts`
- `src/components/ArticleCard.tsx`
- `src/pages/ArticlePage.tsx`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass with existing bundle size warning and Browserslist staleness notice.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- Browser QA: `/articles` renders four local article covers; all four article detail routes render article text and, after lazy-load scroll, have zero known external/proxy article image URLs and zero known campaign/unsubscribe/Google redirect/old upload links.

### Risks and Gaps
- Raw newsletter HTML remains in `public/articles/*/content.html`; this is acceptable only as a migration source until Supabase structured article blocks are implemented.
- Article image ownership, alt text, and source metadata still need Supabase media records.
- React Helmet strict-mode warning remains an existing development-console issue.
- Bundle size warning remains and is not addressed in this scope.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-DELIVERY-READINESS-001`

## Entry - 2026-05-22 (Delivery Readiness Cleanup)

### Scope
- Replaced the default Vite starter README with an Urblo-specific project README.
- Removed the unused React starter SVG asset from the starter assets folder.
- Marked `NOW-DELIVERY-READINESS-001` done because the active app metadata, favicon, footer social destinations, README handoff, and starter asset cleanup no longer expose template defaults.

### Changed Files
- `README.md`
- `src/assets/*`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass with existing bundle size warning and Browserslist staleness notice.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Final share imagery and deeper claim-safety review remain under `NOW-SEO-DELIVERY-001`.
- Contact and Sample Request still need Supabase-backed implementation.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-ASSET-STRATEGY-001`

## Entry - 2026-05-22 (Asset Hosting Strategy Closure)

### Scope
- Closed `NOW-ASSET-STRATEGY-001` because the interim and delivery-phase media hosting policy is now explicit.
- Current phase: controlled local assets under `public/media/launch` for launch-critical static media until backend storage is available.
- Delivery phase: Supabase Storage for normal CMS-managed media, with Cloudflare R2 or Stream reviewed separately for large homepage video delivery.
- Kept migration sequence, owners, and residual risks in the asset audit and architecture docs.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The policy is documented, but Supabase Storage buckets, media records, and upload workflows are not implemented yet.
- Homepage video still needs a final R2/Stream decision before production scale.

### Next Handoff
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-22 (Stone Library Image Fast-Track Closure)

### Scope
- Confirmed the provided primary Stone Library finish assets are mapped through the runtime image layer.
- Recorded current Stone Library image coverage so future agents and the client can distinguish real mapped finish photos, controlled temporary fallback images, and true missing source images.
- Closed `NOW-STONELIB-IMG-FASTTRACK-001`; final HD image sourcing remains under `NEXT-STONELIB-IMG-001`, and secondary Juparana/Zen Grey frame behavior remains under `NEXT-STONELIB-IMG-002`.

### Changed Files
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass with existing bundle size warning and Browserslist staleness notice.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Golden Crust, Harcourt, and Tan Brown still need approved HD source images before the Stone Library can be called visually complete.
- Blueocean, Honey Comb, and Tuscany use controlled local fallback imagery but still need finish-specific HD coverage.
- Juparana and Zen Grey secondary source frames exist but need an approved presentation pattern before implementation.

### Next Handoff
- `NOW-SEO-DELIVERY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-22 (SEO Social and Claim-Safety Cleanup)

### Scope
- Added a controlled 1200 x 630 PNG social share image and updated default Open Graph/Twitter metadata to use it.
- Kept the SVG social image as the editable source and adjusted the source text so it does not clip when exported.
- Rewrote article excerpts away from unqualified carbon, cost, speed, and universal-performance claims.
- Added a runtime article cleanup layer for known high-risk newsletter phrases so public article detail pages render safer wording until the Supabase structured article system replaces raw newsletter HTML.
- Closed `NOW-SEO-DELIVERY-001`.

### Changed Files
- `index.html`
- `public/og-default.png`
- `public/og-default.svg`
- `public/articles/index.json`
- `public/articles/*/meta.json`
- `src/App.tsx`
- `src/lib/articleMedia.ts`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass with existing bundle size warning and Browserslist staleness notice.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Raw article newsletter HTML is still not the final article model; it should move to Supabase structured blocks with editorial review.
- The React Helmet strict-mode warning remains.
- Bundle size warning remains and is the next no-secret launch-quality task.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `LATER-PERF-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-IMG-002`

## Entry Template (Use for Every Future Session)

### Date
- `YYYY-MM-DD`

### Scope
- What changed in this session.
- Why it changed.

### Changed Files
- Repo-root relative file path list only.

### Verification Results
- `npm run build`: pass/fail (+ key notes)
- `npm run lint`: pass/fail (+ key notes)
- `npx tsc -b`: pass/fail (+ key notes)

### Risks and Gaps
- Open defects, unresolved tradeoffs, blocked items.

### Next Handoff
- Exact task IDs from `NEXT_STEPS.md` to run next.
