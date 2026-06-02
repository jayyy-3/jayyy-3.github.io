# WORKLOG - Urblo Execution Log

Last updated: 2026-06-02

## Entry - 2026-06-02 (Projects Archive, Detail, and Media Blocks)

### Scope
- Rebuilt `/projects` as a functional archive with breadcrumb, large title, proof-led intro, project count, sector filters, grid/list view controls, and equal-sized project images.
- Rebuilt `/projects/:slug` as a full-width case-study surface with oversized opening, previous/next project navigation, hero media, Project Information facts, narrative, ordered media blocks, Featured Materials where data supports it, and shared CTA.
- Added `ProjectHotspotImage` as the shared public hotspot renderer and made `ProjectMaterialMap` delegate to it.
- Extended static project data with listing metadata, story copy, ordered media blocks, and Moon Gate hotspot metadata.
- Extended `/admin/projects` source with ordered `project_media` block editing for normal images, hotspot images, and optional YouTube video rows.
- Added draggable/click hotspot placement on the selected admin material map image while keeping numeric x/y percentage fields.
- Prepared `supabase/migrations/202606020001_project_media_blocks.sql` for the future live `project_media` block contract.
- Updated content import and admin verifiers so the static-to-Supabase path understands structured project media blocks.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`
- `scripts/check-content-import-readiness.mjs`
- `src/App.tsx`
- `src/components/projects/ProjectHotspotImage.tsx`
- `src/components/projects/ProjectMaterialMap.tsx`
- `src/data/projectData.ts`
- `src/pages/ProjectDetails.tsx`
- `src/pages/Projects.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `supabase/migrations/202606020001_project_media_blocks.sql`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/projects`, `/projects/moon-gate-woolley-street`, admin route shells, shared CTA contracts, and current project/capability assets.
- `npm run agent:check`: pass.
- `npm run agent:admin-crud-coverage`: pass, including `project_media` coverage and source assertions for hotspot stage/marker controls, pointer placement handlers, and coordinate-update callbacks.
- `npm run agent:content-import -- --out .tmp/content-import-preview.json`: pass with 115 media candidates, 5 projects, 15 `project_media` rows, 1 `project_material_map`, 2 `project_hotspots`, 0 warnings, and 0 blockers.
- `npm run agent:content-import:apply-sql`: pass; regenerated ignored review/plan/preflight/apply/rollback artifacts under `.tmp/` without live Supabase writes.
- In-app Browser QA at `http://127.0.0.1:4174/projects`, desktop default viewport: page identity `Projects | Urblo`, nonblank `/projects` content, 5 equal `396x297` grid images, Education filter changed count to `02`, List view changed filtered images to equal `120x90`, `0` horizontal overflow, and no framework overlay.
- In-app Browser QA at `390x844`: `/projects` rendered 5 equal `327x245` grid images, Commercial filter changed count to `01`, retained `0` horizontal overflow, and no framework overlay.
- In-app Browser QA for `/projects/moon-gate-woolley-street`: page identity `Project Detail | Urblo`, h1 `Moon Gate | Woolley Street`, Project Information, previous/next navigation, full-width hero/media, 2 hotspot buttons, Featured Materials, `0` horizontal overflow, and no framework overlay. Desktop and mobile hotspot tap/click on `Flamed seating elements` set `aria-pressed="true"` and updated the inspector with New Grey/Flamed metadata, application copy, and Stone Library link.
- In-app Browser QA for `/projects/west-side-place`: page identity `Project Detail | Urblo`, h1 `West Side Place`, Project Information, narrative, previous/next navigation, ordered normal image captions, no hotspot controls as expected, `0` horizontal overflow, and no framework overlay at desktop and `390x844`.
- In-app Browser QA for `/admin/projects`: current no-browser-key environment renders the configuration-required admin auth state without private Projects module content, framework overlay, or horizontal overflow.
- Console health: Browser logs only the existing Cloudflare Turnstile warning `[Cloudflare Turnstile] Unknown parameter passed to api.js: "?ver=...", ignoring.` No task-caused runtime errors were observed.

### Risks and Gaps
- The new Supabase migration is source-prepared only and has not been applied to the live Supabase project.
- Current static project data has no client-approved Urblo YouTube video configured, so public browser QA can verify the renderer/source contract but not a live configured video block.
- Live admin drag-and-drop QA is pending browser-safe Supabase config plus an active admin/editor profile. This checkpoint verifies the source implementation and strengthened no-secret admin coverage gate instead.
- Public Projects remain static/file-backed until content import and public read cutover are approved.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-ADMIN-CONTENT-CRUD-001`

## Entry - 2026-06-02 (Homepage Latest Projects Full-Screen Stability)

### Scope
- Reworked the homepage Latest Projects section so the whole section is exactly one viewport high (`100svh`) instead of being content-height driven.
- Fixed hover/tap layout shift by giving the active copy, active image, and thumbnail rail stable measured regions.
- Added short-screen desktop behavior that hides the active summary and places facts beside the CTA so 720-768px high screens do not clip controls.
- Added short mobile behavior that simplifies active copy/facts and shrinks rail media so the one-screen section remains readable at 375x667.
- Added lightweight `data-*` markers for repeatable rendered QA of the active region, active copy, active image, and rail.

### Changed Files
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/homepage/HomepageSections.tsx`
- `src/index.css`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including homepage project assets and public route/CTA contracts.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Playwright Chromium fallback against `http://127.0.0.1:4174/`: pass at `1440x900`, `1366x768`, `1280x720`, `390x844`, and `375x667`. Each viewport reported section height equal to viewport height, section scroll height equal to viewport height, 0 height delta for section/active copy/active image/rail after hover or tap selection, `0` horizontal overflow, no framework overlay, no console errors/warnings, visible section heading, visible CTA, and image above rail.
- In-app Browser plugin QA was attempted first but unavailable because `agent.browsers.list()` returned an empty backend list; Playwright was used as the fallback validation path.

### Risks and Gaps
- Deployed-preview visual QA remains pending until a Cloudflare Pages preview URL exists.
- The homepage project browser remains static data until the approved public content migration switches Projects to Supabase-backed reads.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-06-01 (Homepage Latest Projects Redesign)

### Scope
- Replaced the old black Latest Projects card grid with an image-led selected-project browser based on the supplied sketch and Escofet-style reference rhythm.
- Updated `homepageData.latestProjects` to five project records with location, scope, year, summary, image, and alt text.
- Added a desktop rail that shows four project thumbnails at a time, supports horizontal drag, and lets hover/focus/tap update the upper project detail panel.
- Kept route navigation on the upper `View project` CTA so thumbnail interaction remains selection-only.
- Added smoke coverage for the five controlled project image assets.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/agent-smoke.sh`
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including the five Latest Projects asset paths.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Playwright Chromium against `http://127.0.0.1:4174/`: desktop `1440x900` confirmed `The work speaks.`, the upper `View project` CTA, four fully visible project thumbnails, draggable rail movement from `scrollLeft 0` to `319`, hover selection for Moon Gate, 0 document horizontal overflow, and 0 console errors.
- Playwright Chromium mobile `390x844`: tap selection for Australian Catholic University updated the active thumbnail state, document horizontal overflow was `0`, and console errors were `0`.

### Risks and Gaps
- Final deployed visual QA remains pending until a Cloudflare Pages preview URL exists.
- Project summaries are still static homepage copy and should be reconciled with CMS-sourced public project records during the approved content migration.

## Entry - 2026-06-01 (Homepage Partner Banner Background)

### Scope
- Replaced the homepage `Design-led stone solutions for streetscapes & civil landscapes.` partner-banner background with the supplied West Side Place aerial image.
- Added the controlled optimized asset at `public/media/launch/homepage/partner-banner-west-side-place.jpg`.
- Updated homepage data and smoke coverage so the runtime asset path is guarded.
- Updated Harness notes for the homepage partner-banner image contract.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `public/media/launch/homepage/partner-banner-west-side-place.jpg`
- `scripts/agent-smoke.sh`
- `src/data/homepage.ts`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `asset ok: /media/launch/homepage/partner-banner-west-side-place.jpg`.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Playwright CLI fallback against `http://127.0.0.1:4174/`: desktop `1440x900` and mobile `390x844` both confirmed the partner banner `img` source is `/media/launch/homepage/partner-banner-west-side-place.jpg`, rendered the approved banner copy, had 0 horizontal overflow, and reported 0 console errors.

### Risks and Gaps
- None identified beyond normal deployed-preview QA after Cloudflare Pages preview exists.

## Entry - 2026-06-01 (Capability Statement Service Hub Redesign)

### Scope
- Reworked `/capabilities` from an editorial PDF-like page into a service-style capability hub informed by the supplied Sam the Paving Man capabilities reference.
- Rebuilt the page around the Founder PDF's five capability scopes, approach, lifecycle support, national reach, Urblo advantage, selected-project proof ledger, and email-gated PDF download.
- Rotated the previously sideways site-review image upright before reuse.
- Expanded the Capability Statement source verifier and Harness docs so the concrete capability modules and project ledger remain guarded.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `public/media/launch/capabilities/site-install-review.jpg`
- `scripts/check-capabilities-page-source.mjs`
- `src/pages/CapabilitiesPage.tsx`

### Verification Results
- `npm run agent:capabilities-ui`: pass.
- `npx tsc -b`: pass.
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser plugin QA fallback: the in-app Browser route was unavailable, so Playwright CLI with Chromium was used against local Vite dev server `http://127.0.0.1:4174/capabilities`.
- Browser QA desktop `1440x1000`: hero, capability hub, sticky module navigation, corrected site-review image usage, selected proof, and download section rendered with 0 console errors/warnings.
- Browser QA mobile `390x844`: hero, capability module list, first service detail, and corrected responsive stacking rendered without visible overlap; document horizontal overflow was `0`.

### Risks and Gaps
- Live email capture for the Capability Statement PDF download still depends on the same server-side `/api/enquiries` credential verification as Contact.
- Final deployed visual QA remains pending until a Cloudflare Pages preview URL exists.

## Entry - 2026-06-01 (Homepage Hero Single Terminal Symbol)

### Scope
- Removed the terminal dots from the first two homepage hero lines.
- Kept only the final `DELIVER.` symbol, with the dot in Urblo lime.
- Updated current Harness notes so the hero contract is `DESIGN`, `SOURCE`, `DELIVER.` rather than three punctuated lines.

### Changed Files
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/homepage/HomepageSections.tsx`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser QA through the in-app Browser against local Vite preview on `http://127.0.0.1:4174`: pass for DOM/style checks.
- Browser QA desktop `1440x900`: hero lines are `DESIGN`, `SOURCE`, `DELIVER.`; dot count is 1; the only dot belongs to `DELIVER.` and computes to `rgb(0, 255, 25)`; no framework overlay, console warnings/errors, or horizontal overflow.
- Browser QA mobile `390x844`: hero lines are `DESIGN`, `SOURCE`, `DELIVER.`; dot count is 1; the only dot belongs to `DELIVER.` and computes to `rgb(0, 255, 25)`; no framework overlay, console warnings/errors, or horizontal overflow.
- Browser screenshot capability timed out twice on `Page.captureScreenshot`; Playwright fallback captured `/tmp/urblo-home-hero-single-dot-mobile.png` after waiting for `aria-label="DESIGN SOURCE DELIVER."`, confirming the mobile visual state without the welcome popup.

### Risks and Gaps
- None identified beyond normal deployed-preview QA after Cloudflare Pages preview exists.

## Entry - 2026-06-01 (Homepage Capabilities CTA Inner Ring)

### Scope
- Removed the nested circular icon ring from the homepage proof-section `Our Capabilities` CTA.
- Kept the outer pill button, text, and arrow motion, but removed the small inner circle that made the CTA read as a concentric-circle control.
- Updated the design Harness note for this CTA treatment.

### Changed Files
- `docs/DESIGN.md`
- `docs/WORKLOG.md`
- `src/components/homepage/HomepageSections.tsx`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser QA through the in-app Browser against local Vite preview on `http://127.0.0.1:4174`: pass.
- Browser QA desktop `1440x900`: `Our Capabilities` CTA still routes to `/capabilities`; inner icon wrapper border width is `0px`, border radius is `0px`, and no framework overlay, console warnings/errors, or horizontal overflow were observed.
- Browser QA mobile `390x844`: inner icon wrapper border width is `0px`, border radius is `0px`, and no framework overlay, console warnings/errors, or horizontal overflow were observed.

### Risks and Gaps
- None identified beyond normal deployed-preview QA after Cloudflare Pages preview exists.

## Entry - 2026-06-01 (Homepage Hero Final Dot)

### Scope
- Updated the homepage first-viewport verb stack so `DESIGN.` and `SOURCE.` no longer render green punctuation.
- Kept only the final `DELIVER.` terminal dot in Urblo lime, matching the latest user direction for the hero signal color.
- Updated Harness design/handoff/roadmap/task notes so future agents do not restore green punctuation to all three hero lines.

### Changed Files
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/homepage/HomepageSections.tsx`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser QA through the in-app Browser against local Vite preview on `http://127.0.0.1:4174`: pass.
- Browser QA desktop `1440x900`: computed hero dot colors are `DESIGN.` white, `SOURCE.` white, `DELIVER.` Urblo lime; no framework overlay, console warnings/errors, or horizontal overflow.
- Browser QA mobile `390x844`: computed hero dot colors are `DESIGN.` white, `SOURCE.` white, `DELIVER.` Urblo lime; no framework overlay, console warnings/errors, or horizontal overflow.

### Risks and Gaps
- None identified beyond normal deployed-preview QA after Cloudflare Pages preview exists.

## Entry - 2026-06-01 (Founder Capability Statement Web Page)

### Scope
- Replaced the provisional `/capabilities` page with a web-native version of Natalie Ma's 2026 Capability Statement, using the supplied PDF as the current client-approved capability source where it supersedes older placeholder copy.
- Added the downloadable 2026 Capability Statement PDF plus extracted capability and Natalie imagery under controlled `public/` launch paths.
- Added an email-gated Capability Statement download form that posts to `/api/enquiries` as `Capability statement download`, reveals the direct PDF link only after a successful API response, and reuses the shared Turnstile widget path when `VITE_TURNSTILE_SITE_KEY` is configured.
- Centralized the live CTA definitions used by capability, contact, sample request, and PDF download surfaces in `src/data/siteChrome.ts`, and added `/capabilities` to shared header/footer navigation.
- Updated `/our-story` so Natalie Ma's portrait, role, bio, and founder quote are sourced from the Capability Statement and visible in the team card without requiring hover.
- Updated Harness docs and source checks so future agents treat the Founder statement page, shared CTA data, PDF asset, media assets, and download lead-capture contract as guarded surfaces.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `public/downloads/urblo-capability-statement-2026.pdf`
- `public/media/launch/capabilities/*`
- `public/media/launch/our-story/natalie-ma-2026.jpg`
- `scripts/agent-init.sh`
- `scripts/agent-smoke.sh`
- `scripts/check-capabilities-page-source.mjs`
- `scripts/check-contact-form-ui-source.mjs`
- `scripts/check-harness.mjs`
- `src/App.tsx`
- `src/components/TurnstileField.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/data/siteChrome.ts`
- `src/lib/turnstileConfig.ts`
- `src/pages/CapabilitiesPage.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/OurStory.tsx`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/capabilities`, PDF/media assets, shared Capabilities CTAs, Contact form UI source check, and Capability Statement source check.
- `npm run agent:capabilities-ui`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser QA through the in-app Browser against local Vite preview on `http://127.0.0.1:4174`: pass.
- Browser QA `/capabilities` desktop `1440x900`: correct title/route, nonblank hero, no framework overlay, no console warnings/errors, no horizontal overflow, hero leaves real next-section content visible.
- Browser QA `/capabilities` mobile `390x844`: correct title/route, nonblank hero, no framework overlay, no console warnings/errors, no horizontal overflow, next-section content visible.
- Browser QA Capability Statement form: invalid email shows inline validation, direct PDF link is hidden before success, and a valid email on local static preview shows the expected API-configuration error without revealing the direct PDF link.
- Browser QA `/our-story` desktop and mobile: Natalie image resolves to `public/media/launch/our-story/natalie-ma-2026.jpg`; Natalie role, PDF-sourced bio, and founder quote are visible; no framework overlay, console warnings/errors, or horizontal overflow were observed.

### Risks and Gaps
- Live Capability Statement download lead capture is not proven until the same server-side `/api/enquiries` credentials are configured and Jay approves tagged live form QA writes.
- Real Turnstile proof still requires public `VITE_TURNSTILE_SITE_KEY`, server-side Turnstile secret, a valid token, and the existing approval-gated live verifier.
- Real notification proof still requires Resend sender/recipient configuration and approval-gated live form writes.
- Browser QA was local built-preview only. Cloudflare Pages preview smoke remains pending until a Pages preview URL exists.
- Current web imagery is extracted from the supplied Capability Statement PDF; higher-resolution source photography can replace these assets later without changing the page contract.

### Next Handoff
- Continue live form verification after service-role credentials and Jay approval are available: `npm run agent:forms-live -- --allow-writes`, then the browser-boundary, email, and Turnstile variants when their required inputs exist.
- After Cloudflare Pages preview exists, run `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev` and re-run the live form verifier against that deployed origin after environment variables are configured.

## Entry - 2026-05-29 (Cloudflare Pages Account Read-Only Probe)

### Scope
- Used the Cloudflare API connector in read-only mode to inspect Pages project availability in the two accessible Cloudflare accounts.
- Checked Jay's account and Hunter's account without creating projects, deployments, domains, DNS records, environment variables, or secrets.
- Confirmed the Cloudflare launch blocker is account/project setup rather than a repo-side Pages readiness issue.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Cloudflare API spec lookup: pass. Confirmed the read-only Pages endpoint is `GET /accounts/{account_id}/pages/projects`.
- Jay Cloudflare account (`a9cbf84bf6677e2af8c76b353afe0d9d`) Pages project list: pass. The account is reachable and currently returns 0 Pages projects.
- Hunter Cloudflare account (`077afae2c6f4e77badadf21e49e58eb7`) Pages project list: blocked by Cloudflare API authentication error with the current token.
- `npm run agent:live-readiness`: pass in report-only mode; live Supabase keys, first-admin inputs, admin credentials, preview URL, and tagged-write approvals remain missing/manual-gated.
- `git status --short`: clean before this documentation checkpoint.

### Risks and Gaps
- No Cloudflare Pages project, preview deployment, production environment variable, custom domain, DNS record, or rollback state was created or changed.
- Jay's account appears usable for future Pages setup but has no existing Pages project to smoke-test.
- Hunter's account cannot be used with the current Cloudflare token until access is fixed.
- Creating a Pages project still requires Jay to choose the target account and approve the account-level action.

### Next Handoff
- Ask Jay whether to create the Cloudflare Pages project in Jay's account or resolve Hunter account access first.
- After a preview deployment exists, run `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`.

## Entry - 2026-05-29 (Full Unprofiled Admin Route-Probe Coverage)

### Scope
- Expanded `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` so unauthorized-profile live mode derives its probes from the complete authenticated admin route list.
- The future no-write live QA now requires `/admin`, `/admin/leads`, `/admin/media`, `/admin/settings`, `/admin/stone-library`, `/admin/projects`, `/admin/products`, `/admin/articles`, and `/admin/audit` to stay on `/admin/unauthorized` without private module headings after an unprofiled Auth user signs in.
- Hardened `npm run agent:admin-crud-coverage` so the unauthorized-profile probes cannot quietly fall back to a small route subset.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- Supabase changelog scan: pass. Relevant current notes for this source-only auth verifier checkpoint remain the April 28, 2026 Data/GraphQL API exposure change and May 2026 platform/auth notes; no database implementation change was needed.
- `npm run agent:live-readiness`: pass in report-only mode with live credentials, preview URL, first-admin inputs, and approvals still missing/manual-gated.
- `npm run agent:supabase-foundation-readiness`: pass.
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:admin-auth-browser -- --expect-unauthorized`: pass in plan-only/no-login mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- Live unprofiled browser QA still requires browser-safe Supabase config and a valid Auth user with no active `admin_profiles` row.
- This checkpoint is source/tooling only. It does not prove active-admin login, first-admin bootstrap, live form persistence, admin CRUD writes, Storage upload policy, email/Turnstile behavior, or Cloudflare preview deployment.

### Next Handoff
- When browser-safe Supabase config and an unprofiled Auth test account are available, run `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` to verify every launch-critical admin route stays unauthorized for that account.

## Entry - 2026-05-29 (Admin Runner Credential Input Boundary)

### Scope
- Extended the shared live input validation helper to the admin config browser gate so `--base-url` placeholders or non-origin URLs fail before browser navigation.
- Tightened active-admin and unprofiled admin browser QA readiness so copied email placeholders do not proceed to Supabase Auth login attempts.
- Tightened `admin-crud-live --allow-writes` so live RLS write verification requires either an explicit access token or a real email-shaped admin email/password pair before any live auth/write work can start.
- Updated Harness docs and task state to record the stricter admin runner input boundary.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-config-gate.mjs`
- `scripts/check-admin-crud-live.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- Supabase changelog scan: pass. The relevant hosted-platform note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint is local verifier/docs hardening only.
- `node --check` for edited admin/live-readiness scripts: pass.
- `npm run agent:admin-config-gate -- --base-url '<preview-origin>'`: expected fail before browser navigation with the placeholder base URL error.
- Placeholder active-admin browser QA check with dummy browser key/password: expected fail in strict plan mode with `valid URBLO_ADMIN_EMAIL` missing; no login attempted.
- Placeholder admin CRUD live write check with dummy browser key/password: expected fail before Supabase auth/write work with `valid URBLO_ADMIN_EMAIL + URBLO_ADMIN_PASSWORD` missing.
- Placeholder admin login readiness audit: `npm run agent:live-readiness` reports active-admin, unprofiled, and admin CRUD live write gates as missing valid email-shaped inputs when placeholder emails are supplied.
- `npm run agent:live-readiness`: pass in report-only mode with live inputs still missing/manual-gated.
- `npm run agent:admin-auth-browser`: pass in plan-only/no-login mode.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:first-admin-bootstrap`: pass in plan-only/no-write mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:forms-ui`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run agent:supabase-foundation-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.

### Risks and Gaps
- This is another source-only verifier guard. It still does not provide service-role keys, browser-safe keys, admin credentials, first-admin profile, Cloudflare preview URL, or Jay approvals needed for live completion.

### Next Handoff
- Continue source-only hardening only where it reduces launch risk; otherwise live form/admin proof remains blocked on the external inputs listed by `npm run agent:live-readiness`.

## Entry - 2026-05-29 (Live Verifier Input Boundary)

### Scope
- Added a shared live input validation helper for placeholder detection, first-admin email shape checks, and origin-only base URL normalization.
- Aligned the actual live verifier scripts with the existing readiness-report boundary: `forms-live`, `cloudflare-preview-smoke`, and `admin-auth-browser` now reject copied placeholders or URLs with path/query/hash in `--base-url` before any network or live-write work starts.
- Tightened `admin-live-readiness` so copied first-admin email placeholders are reported as invalid before read-only Supabase checks.
- Updated Harness docs and task state so future handoffs distinguish readiness reporting from executable verifier input validation.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/_lib/live-input-validation.mjs`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-live-readiness.mjs`
- `scripts/check-cloudflare-preview-smoke.mjs`
- `scripts/check-forms-api-live.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- Supabase changelog scan: pass. The relevant hosted-platform note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint is local verifier/docs hardening only.
- `node --check` for the shared helper and all edited verifier scripts: pass.
- `node -e "JSON.parse(...docs/agent/tasks.json...)"`: pass.
- Negative placeholder check: `npm run agent:forms-live -- --allow-writes --base-url '<preview-origin>'` fails before Supabase work with the placeholder base URL error.
- Negative placeholder check: `npm run agent:cloudflare-preview-smoke -- --base-url '<preview-origin>'` fails before route/API requests with the placeholder base URL error.
- Negative placeholder check: `npm run agent:admin-auth-browser -- --base-url '<preview-origin>'` fails before browser navigation with the placeholder base URL error.
- Negative placeholder check: `npm run agent:admin-live-readiness -- --admin-email '<first-admin-email>'` reports `valid URBLO_FIRST_ADMIN_EMAIL or --admin-email` missing, alongside missing keys.
- Pathful URL checks for `forms-live` and `cloudflare-preview-smoke`: pass; both fail before live/network work because the base URL is not an origin-only value.
- `npm run agent:live-readiness`: pass in report-only mode with live inputs still missing/manual-gated.
- `npm run agent:admin-auth-browser`: pass in plan-only/no-login mode.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.
- Plan-only `npm run agent:admin-crud-live`: pass.
- Plan-only `npm run agent:first-admin-bootstrap`: pass.
- `npm run agent:supabase-foundation-readiness`: pass.

### Risks and Gaps
- Live form persistence, first-admin readiness, active-admin browser QA, unprofiled unauthorized browser QA, admin CRUD live writes, Storage upload proof, email/Turnstile proof, and Cloudflare preview smoke remain blocked by the same missing credentials, preview URL, first-admin details, and Jay approvals.
- This checkpoint reduces false-start live verifier risk only; it does not make the CMS operational.

### Next Handoff
- Continue `NOW-FORMS-BACKEND-001`, `NOW-ADMIN-AUTH-RLS-001`, and `NOW-CLOUDFLARE-PAGES-DEPLOY-001` after credentials, first-admin details, preview URL, and write approvals are available.

## Entry - 2026-05-29 (Live Readiness Manual Input Validation)

### Scope
- Tightened `npm run agent:live-readiness` so non-secret manual `--base-url` and `--admin-email` inputs must be real values before readiness reports them as present.
- Copied placeholders such as `<preview-origin>` and `<first-admin-email>`, malformed emails, and preview URLs with path/query/hash now remain missing in text and JSON readiness output.
- Updated Harness docs and task state so future live verification handoffs do not confuse example placeholders with usable Cloudflare preview URLs or first-admin email inputs.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-live-readiness.mjs`

### Verification Results
- Supabase changelog scan: pass. The relevant current hosted-platform note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint is local readiness tooling/docs only.
- Supabase connector read-only sanity: pass. Project `Urblo` is active healthy on Postgres 17.6.1, with 12 launch migrations, 24/24 expected launch tables with RLS, 114 public-schema policies, 12 finish rows, one default site settings row, zero admin/form/content parent rows, and zero security advisor lints.
- `node --check scripts/check-live-readiness.mjs`: pass.
- Placeholder readiness check: pass. `npm run agent:live-readiness -- --base-url '<preview-origin>' --admin-email '<first-admin-email>' --form-writes-approved --first-admin-writes-approved --admin-writes-approved --content-import-approved --content-merge-approved --content-public-cutover-approved --turnstile-token-provided` reports valid preview URL and valid first-admin email as missing.
- Valid override JSON check: pass. `npm run agent:live-readiness -- --json --base-url https://example.pages.dev --admin-email first@example.com --form-writes-approved --first-admin-writes-approved --admin-writes-approved --content-import-approved --content-merge-approved --content-public-cutover-approved --turnstile-token-provided` reports those non-secret values as present while preserving missing secret/session inputs.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:forms-ui`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- Plan-only `npm run agent:admin-auth-browser`: pass.
- Plan-only `npm run agent:admin-crud-live`: pass.
- Plan-only `npm run agent:first-admin-bootstrap`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This prevents false readiness from placeholder/manual input mistakes, but it does not provide the missing service-role key, browser-safe key, first-admin email/profile, admin credentials, Cloudflare preview URL, Turnstile/email secrets, or Jay approvals.
- The admin CMS remains source-ready but not live-operational until the credential-gated form/admin/preview checks run.

### Next Handoff
- Continue `NOW-FORMS-BACKEND-001`, `NOW-ADMIN-AUTH-RLS-001`, and `NOW-CLOUDFLARE-PAGES-DEPLOY-001` after the required credentials, first-admin details, preview URL, and approvals exist.

## Entry - 2026-05-29 (Production Dependency Audit)

### Scope
- Upgraded production-facing dependencies to remove the critical/high production audit path: `react-router-dom` to `^7.16.0`, `swiper` to `^12.2.0`, and `postcss` to `^8.5.15`.
- Ran `npm audit fix` to refresh safe transitive dependency versions in `package-lock.json`; `npm audit --omit=dev --audit-level=critical` now reports zero vulnerabilities.
- Added `tailwindcss/nesting` before Tailwind in `postcss.config.js` so Swiper 12 nested CSS builds cleanly instead of relying on PostCSS warning-tolerant output.

### Changed Files
- `AGENTS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `package-lock.json`
- `postcss.config.js`

### Verification Results
- `npm run build`: pass. The previous Swiper nested-CSS warnings are resolved; Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `npm audit --omit=dev --audit-level=critical`: pass with zero vulnerabilities reported.
- Playwright Chromium homepage carousel render check: pass. The product carousel renders 5 slides, 5 pagination bullets, 2 navigation buttons, and a visible active slide.

### Risks and Gaps
- This reduces production dependency audit risk but does not complete live Supabase form/admin verification.
- Build still reports the existing Browserslist data staleness notice.

### Next Handoff
- Continue live form/admin verification after the required credentials, first-admin details, Cloudflare preview URL, and Jay approvals are available.

## Entry - 2026-05-29 (Live Readiness Docs Guard)

### Scope
- Refreshed live-readiness documentation in `docs/ARCHITECTURE.md`, `docs/CLOUDFLARE_DEPLOYMENT.md`, and `docs/agent/verification.md` so the documented non-secret flags match the current runner.
- Added a Harness assertion so `npm run agent:check` fails if those docs stop mentioning the current approval/readiness flags, including guarded content import/cutover approvals and the Turnstile token readiness flag.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-harness.mjs`

### Verification Results
- `node --check scripts/check-harness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:live-readiness`: pass in report-only mode and still reports missing external credentials/approvals.
- `npm run agent:check`: pass, including the new live-readiness docs flag guard.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run lint`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This closes a documentation/tooling drift only. Live form persistence, first-admin setup, active-admin browser QA, admin CRUD live writes, Storage upload proof, email/Turnstile proof, and Cloudflare preview smoke still require the external inputs reported by `npm run agent:live-readiness`.

### Next Handoff
- Continue source-only hardening where useful, but do not claim CMS completion until live form/admin gates run with credentials and approvals.

## Entry - 2026-05-29 (Cloudflare Env Placeholder Contract)

### Scope
- Expanded `npm run agent:cloudflare-readiness` so it guards the full live-readiness environment placeholder contract across `.env.example` and `docs/CLOUDFLARE_DEPLOYMENT.md`.
- The gate now includes canonical Supabase/Form vars, compatibility aliases, Cloudflare preview URL helpers, first-admin bootstrap email, active-admin login credentials, admin access token, and unprofiled QA credentials.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-cloudflare-pages-readiness.mjs`

### Verification Results
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run lint`: pass.

### Risks and Gaps
- This is repo-side contract hardening only. It does not create the Cloudflare Pages project, set environment variables, produce a preview URL, or verify deployed Pages behavior.
- Runtime build/typecheck/smoke were already green in the immediately preceding admin credential-boundary checkpoint and were not rerun for this docs/tooling-only Cloudflare verifier expansion.

### Next Handoff
- Continue to use `npm run agent:live-readiness` before live form/admin/preview work, and run `npm run agent:cloudflare-preview-smoke -- --base-url <preview-origin>` only after a real Pages preview URL exists.

## Entry - 2026-05-29 (Admin Live Login Credential Boundary)

### Scope
- Tightened `npm run agent:admin-crud-live` so live password login only reads `URBLO_ADMIN_EMAIL`/`URBLO_ADMIN_PASSWORD`, or an explicit `URBLO_ADMIN_ACCESS_TOKEN`.
- Kept `URBLO_FIRST_ADMIN_EMAIL` reserved for first-admin bootstrap/readiness checks so setup identity and live admin session credentials are not conflated.
- Added source coverage so the admin live verifier fails if `URBLO_FIRST_ADMIN_EMAIL` returns as a live-login fallback.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `.env.example`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`

### Verification Results
- Supabase changelog scan: pass. Relevant current note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint is local verifier/docs hardening.
- Supabase connector read-only sanity: pass. The live project reports all 24 expected launch tables, no missing RLS among those tables, 114 public-schema policies, 12 applied launch migrations in the expected set, 12 published finish definitions, one published default `site_settings` row, and zero private/admin/form/import target rows.
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:live-readiness`: pass in report-only mode and still reports missing external credentials/approvals.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- Live admin write proof is still pending browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged QA writes.
- Live form persistence, first-admin setup, email/Turnstile proof, and Cloudflare preview smoke remain blocked by the external inputs listed by `npm run agent:live-readiness`.

### Next Handoff
- Continue source-only hardening only where it meaningfully reduces launch risk. Do not claim the admin CMS is operational until the live form/admin gates run with credentials and approvals.

## Entry - 2026-05-29 (Supabase Foundation Source Readiness Gate)

### Scope
- Added `npm run agent:supabase-foundation-readiness` as a no-secret source verifier for the applied Supabase foundation contract.
- The new gate checks the expected 12 migration files, 24 launch tables including `project_media`, RLS enablement, public-select policies, private-table anonymous revokes, anonymous read-only public grants, baseline seed upserts, the service-role-only Sample Request atomic RPC, Storage bucket/listing hardening, private SECURITY DEFINER helper posture, and normalized admin profile email uniqueness.
- Wired the command into `npm run agent:check` and `npm run agent:init` so future agents cannot silently drop the foundation verifier while live credentials remain unavailable.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-harness.mjs`
- `scripts/check-supabase-foundation-readiness.mjs`

### Verification Results
- Supabase changelog scan: pass. Current relevant breaking-change note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint changes only local source verification.
- `node --check scripts/check-supabase-foundation-readiness.mjs`: pass.
- `npm run agent:supabase-foundation-readiness`: pass.
- `node --check scripts/check-harness.mjs`: pass.
- `npm run agent:check`: pass, including the delegated Supabase foundation source-readiness gate.
- `npm run lint`: pass.
- `git diff --check`: pass.
- `npm run agent:init`: pass and lists `npm run agent:supabase-foundation-readiness`.
- Supabase connector read-only sanity: pass. The live project reports 12/12 expected migrations, 24/24 expected launch tables, no missing RLS among those tables, 12 published finish definitions with 12 distinct keys, one published default `site_settings` row, zero private admin/form rows, and zero imported content rows for media, Stone Library groups, Products, Projects, and Articles.

### Risks and Gaps
- This is source-only. It does not replace read-only Supabase connector sanity, live form persistence, first-admin readiness, authenticated admin browser QA, admin CRUD live writes, Storage upload proof, or Cloudflare preview smoke.
- Live blockers remain unchanged: service-role key, browser-safe Supabase key, first admin email/profile, admin/unprofiled test credentials, Cloudflare preview URL, and Jay approval for tagged live QA writes.

### Next Handoff
- Continue source-only hardening where useful, but treat live form/admin completion as pending until the missing credentials, first-admin details, preview URL, and write approvals are available.

## Entry - 2026-05-29 (Read-Only Supabase Sanity Refresh)

### Scope
- Ran fresh read-only Supabase connector checks against project `npkidywzwddbnfrnxlmo`.
- Confirmed the live database still matches the documented foundation/seed/admin-hardening state before continuing source-only admin work.
- Recorded that the live project still has no first admin profile and no imported/static-to-Supabase content rows, so live admin/form completion remains credential- and approval-gated.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`

### Verification Results
- Supabase migration list: pass. All 12 launch migrations are listed through `sample_request_atomic_insert`.
- Supabase security advisor: pass. Zero security lints returned.
- Supabase SQL sanity: pass. 24 expected public launch tables are present, 24/24 have RLS enabled, and no expected tables are missing.
- Supabase seed sanity: pass. `finish_definitions` has 12 rows and 12 distinct finish keys; published default `site_settings` count is 1.
- Supabase live-state sanity: pass. Active admin profiles, form lead rows, media assets, Stone Library groups, Projects, Products, and Articles all remain at 0 rows.
- No writes, Auth changes, Storage writes, form submissions, or Cloudflare actions were performed.

### Risks and Gaps
- Live form persistence still requires service-role environment configuration and Jay approval for tagged form QA writes.
- Live admin readiness still requires browser-safe Supabase config, first admin email/profile setup, and an unprofiled Auth test account for unauthorized browser QA.

### Next Handoff
- Continue source-only readiness work until local/Cloudflare credentials and approvals are available, then run the live form/admin gates documented in `docs/HANDOFF.md`.

## Entry - 2026-05-29 (Unprofiled Admin Route-Probe Gate)

### Scope
- Extended `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` beyond the first unauthorized landing.
- After an unprofiled Auth user reaches `/admin/unauthorized`, the runner now probes `/admin`, `/admin/leads`, and `/admin/settings` while still signed in and requires each route to stay on the unauthorized shell without private module headings.
- Added source coverage so those unauthorized direct-route probes cannot be silently removed from the admin browser verifier.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-auth-browser -- --expect-unauthorized`: pass in plan-only mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode and now describes the protected-route probes in the unprofiled admin browser QA note.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates were intentionally skipped because this checkpoint changed verifier/docs only, not `src/**` runtime behavior.

### Risks and Gaps
- Live unprofiled browser QA still requires browser-safe Supabase config and a valid Auth user with no active `admin_profiles` row.
- This checkpoint is source/tooling only. It does not create users, profiles, content rows, Storage objects, audit rows, form submissions, or Cloudflare state.

### Next Handoff
- When browser-safe Supabase config and an unprofiled Auth test account are available, run `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` to verify the unauthorized landing and direct-route probes in one no-write browser flow.

## Entry - 2026-05-29 (Admin Browser Sign-Out Gate)

### Scope
- Extended active-admin `npm run agent:admin-auth-browser -- --allow-login --strict` so the no-write browser QA flow checks session exit, not only session entry.
- After authenticated route-shell checks, the runner clicks Sign out and requires the protected route to return to `/admin/login?next=...` without rendering private admin audit content.
- Added source coverage so the sign-out check cannot be silently removed from the admin browser verifier.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-auth-browser`: pass in plan-only mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live sign-out browser QA still requires browser-safe Supabase config and a real active admin email/password.
- This checkpoint does not create rows, upload Storage objects, change Auth users/profiles, verify form persistence, or touch Cloudflare.

### Next Handoff
- When active-admin browser credentials exist, run `npm run agent:admin-auth-browser -- --allow-login --strict` to verify login, route shells, and sign-out behavior in one no-write flow.

## Entry - 2026-05-29 (Unprofiled Admin Browser QA Gate)

### Scope
- Added a no-write unauthorized-profile mode to `npm run agent:admin-auth-browser`.
- `--allow-login --expect-unauthorized --strict` now uses `URBLO_UNPROFILED_EMAIL` and `URBLO_UNPROFILED_PASSWORD` to prove a valid Supabase Auth user without an active `admin_profiles` row lands on `/admin/unauthorized`.
- The check rejects private admin module headings in that unauthorized state and creates no content rows, Storage objects, audit events, Auth users, or admin profiles.
- Added the new gate to `npm run agent:live-readiness`, `.env.example`, docs, and `npm run agent:admin-crud-coverage` source guards.

### Changed Files
- `.env.example`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-auth-browser -- --expect-unauthorized`: pass in plan-only mode.
- `npm run agent:live-readiness`: pass in report-only mode and now reports the unprofiled unauthorized browser QA gate.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-config-gate`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live unauthorized-profile browser QA was not run because this workspace has no browser-safe Supabase key or unprofiled Auth test credentials.
- This checkpoint is source/tooling only. It does not create the first admin, create an unprofiled Auth user, run live admin writes, upload Storage objects, verify form persistence, or touch Cloudflare.

### Next Handoff
- When browser-safe Supabase config and an unprofiled Auth test account are available, run `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` before claiming the unauthorized-profile access state is live verified.

## Entry - 2026-05-29 (First-Admin Email Matching Coverage Guard)

### Scope
- Hardened `npm run agent:admin-crud-coverage` so the first-admin/bootstrap readiness email matching contract cannot silently regress.
- The source gate now fails if first-admin/bootstrap or admin-live readiness goes back to an exact case-sensitive `email` query instead of normalized profile-email matching.

### Changed Files
- `scripts/check-admin-crud-coverage.mjs`
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This is source-only/no-write. It does not create Supabase users/profiles/rows, upload Storage objects, configure credentials, touch Cloudflare, or run live writes.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-29 (First-Admin Email Case Readiness)

### Scope
- Updated the first-admin bootstrap verifier and admin live-readiness verifier so `admin_profiles.email` matching is normalized before comparison.
- This aligns the scripts with the live `admin_profiles_email_ci_unique_idx` database contract, which enforces unique `lower(btrim(email))` values.
- The change prevents a mixed-case manually created admin profile email from being misreported as missing during read-only first-admin readiness.

### Changed Files
- `scripts/bootstrap-first-admin.mjs`
- `scripts/check-admin-live-readiness.mjs`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Supabase connector read-only sanity: 24/24 expected launch tables present, 0 expected launch tables missing RLS, 12 published finish definitions, 1 published default `site_settings` row, 0 active admin profiles, and current selected content/lead target tables still empty.
- `node --check scripts/bootstrap-first-admin.mjs`: pass.
- `node --check scripts/check-admin-live-readiness.mjs`: pass.
- `npm run agent:first-admin-bootstrap`: pass in no-write plan mode.
- `npm run agent:admin-auth-browser`: pass in plan-only mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:live-readiness`: pass in report-only mode; live inputs remain missing/manual-gated.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only/no-write. It did not create a Supabase Auth user, create or change an admin profile, create form/admin/content rows, upload Storage objects, configure credentials, touch Cloudflare, or run live writes.
- Live first-admin/admin verification still requires service-role and browser-safe keys, the first admin email, a real admin session/password or token, and Jay approval for any write path.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-29 (Local Live Verification Secret Handling)

### Scope
- Added a local secret-file section to `docs/CLOUDFLARE_DEPLOYMENT.md`.
- Documented that live verification secrets should go in ignored local env files such as `.env.local` or `.dev.vars`, not chat or committed docs.
- Grouped the variables required for form persistence, browser-key privacy checks, admin readiness, admin browser QA, admin CRUD live writes, email proof, and Turnstile proof.

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is documentation only. It does not configure Cloudflare, create a Supabase Auth user, create an admin profile, run live form writes, send email, verify Turnstile, or run authenticated admin CRUD.

### Next Handoff
- When credentials are available, place them in `.env.local` or `.dev.vars`, run `npm run agent:live-readiness`, then run the specific approval-gated live verifier for the next target.

## Entry - 2026-05-29 (Content Import and Public Cutover Readiness Recheck)

### Scope
- Re-ran the source-only static-to-Supabase content import artifact generation and public cutover readiness checks.
- Wrote ignored review artifacts under `.tmp/` only; no Supabase SQL was applied and no production rows were created.

### Verification Results
- `npm run agent:content-import:apply-sql`: pass.
- Generated dry-run candidates: 115 media assets, 13 stone groups, 15 stone variants, 153 finish capabilities, 53 finish image rows, 6 products, 28 product models, 18 product material defaults, 18 product specs, 5 projects, 41 project facts, 14 project media rows, 2 project material rows, 1 project material map, 2 hotspots, 4 articles, and 95 article blocks.
- Import warnings: 0.
- Import blockers: 0.
- `npm run agent:public-supabase-readiness`: pass.
- Public readiness verified 13 stone groups, 6 products, 5 projects, and 4 articles remain `draft` in the import dry run.
- Public readiness verified 95 draft article blocks use structured extraction instead of placeholder HTML imports.
- Public readiness verified the generated preflight SQL includes Data API role/sequence grant inspection, guarded draft import SQL keeps manual import/merge gates and avoids destructive/publish statements, guarded rollback SQL remains manually destructive-gated and reverse ordered, public RLS policy source remains published-only, anonymous grants remain read-only, public runtime remains static/file-backed, and Cloudflare Functions remain scoped to `/api/*`.

### Risks and Gaps
- These checks do not apply content, publish rows, switch public runtime reads, or verify live admin CRUD.
- Applying `.tmp/content-import-apply.sql`, approving merge/upsert behavior, and cutting over public reads still require Jay approval and live credential/admin verification.

### Next Handoff
- Keep content import artifacts as review-only until import approval is explicit.
- Continue form/admin live verification only after the missing service-role, browser-safe key, first-admin, admin-session, and approval inputs are available.

## Entry - 2026-05-29 (Supabase Read-Only State Re-Audit)

### Scope
- Re-checked the live Supabase project state through read-only connector SQL for project `npkidywzwddbnfrnxlmo`.
- Verified the applied migration list still includes the current launch migrations through `sample_request_atomic_insert`.
- Verified launch table, RLS, seed, Storage bucket, grant, helper, RPC, and empty-content/import-target assumptions before continuing source-only work.

### Verification Results
- Expected launch tables present: 24 of 24.
- Expected launch tables missing RLS: none.
- Published finish definitions: 12.
- Published default `site_settings` row: 1.
- Current launch content and lead row counts for `media_assets`, `stone_groups`, `stone_variants`, `products`, `projects`, `articles`, `enquiries`, `sample_requests`, and `sample_request_items`: all 0.
- Storage buckets: `urblo-public-media` is public with 25 MB limit; `urblo-admin-media` is private with 50 MB limit.
- Public policy count: 114.
- Anonymous write grants on public launch tables: 0.
- Anonymous grants on private admin/lead tables: 0.
- `admin_profiles` rows: 0; active admin profiles: 0.
- `admin_profiles_email_ci_unique_idx`: present.
- `submit_sample_request_with_item(jsonb, jsonb)`: executable by `service_role`, not executable by `anon` or `authenticated`.
- `public.has_admin_role(text[])`: not executable by `anon` or `authenticated`.

### Risks and Gaps
- No active admin profile exists yet, so active-admin browser login, `/admin` CRUD writes, and audit-row write verification remain blocked until Jay confirms the first admin path and credentials are configured.
- The content import target is still empty and public runtime remains static/file-backed; do not apply generated import SQL or cut over public reads without approval.
- Live form persistence remains unverified because service-role environment configuration and tagged live form QA approval are still missing.

### Next Handoff
- Continue source-only readiness where it improves final verification coverage.
- For live progress, configure server/browser Supabase keys and confirm the first admin email, then run the existing read-only and approval-gated live verifiers in the order listed in `docs/HANDOFF.md`.

## Entry - 2026-05-29 (Admin Auth Browser Env Loading)

### Scope
- Updated `npm run agent:admin-auth-browser` so it can read untracked local env files (`.env.local`, `.env`, `.dev.vars`) as well as shell values.
- Added `--env-file <path>` support for an additional local secret source when needed.
- The runner still prints only variable names and sources, never secret values.
- Relaxed the hard `VITE_SUPABASE_URL` requirement because `src/lib/supabaseClient.ts` already defaults to the Urblo Supabase project URL; the live browser auth check only requires a browser-safe key and admin email/password credentials.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-auth-browser.mjs`

### Verification Results
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `npm run agent:admin-auth-browser`: pass in plan-only mode; it scanned no env files in this workspace and attempted no Supabase login.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live login mode remains unrun until browser-safe Supabase config and real active admin email/password credentials exist.
- This checkpoint improves credential input handling only; it does not prove active-admin access, admin writes, form persistence, Storage policy, Cloudflare preview behavior, or public content cutover.

### Next Handoff
- Put browser-safe key and admin QA credentials in an untracked env file or shell, then run `npm run agent:admin-auth-browser -- --allow-login --strict` after first-admin/profile readiness is verified.

## Entry - 2026-05-29 (Admin Auth Browser QA Runner)

### Scope
- Added `npm run agent:admin-auth-browser` as a gated browser login verifier for the configured `/admin` auth shell.
- Default mode is plan-only: it prints required inputs and performs no Supabase login.
- Live mode requires `--allow-login --strict`, browser-safe Supabase config, and `URBLO_ADMIN_EMAIL`/`URBLO_ADMIN_PASSWORD`; it signs in through `/admin/login`, checks authenticated admin route shells, rejects config/unauthorized/login states after authentication, captures screenshots, and creates no content rows, Storage objects, or audit events.
- Added the runner to live-readiness reporting so the no-write browser auth QA gate is visible separately from tagged admin CRUD/live-write verification.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-harness.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `npm run agent:admin-auth-browser`: pass in plan-only mode; no Supabase login attempted.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-config-gate`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode and now reports the new no-write admin auth browser QA command.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live login mode was not run because this workspace still lacks persistent browser-safe Supabase config and real active admin email/password credentials.
- The runner proves authenticated route shells only. It does not prove save/upload/export writes, audit row creation, private Storage policy, form persistence, Cloudflare preview behavior, or public content cutover.

### Next Handoff
- After first-admin/profile setup and browser-safe config exist, run `npm run agent:admin-auth-browser -- --allow-login --strict` before tagged admin CRUD live writes.

## Entry - 2026-05-29 (Repeatable Admin Config-Gate Browser Check)

### Scope
- Added `npm run agent:admin-config-gate` as a repeatable no-secret Firefox browser gate for the built `/admin` shell.
- The new runner starts Vite preview when no `--base-url` is supplied, generates a temporary Playwright spec under `.tmp/`, checks all launch-critical admin routes for `Configuration required`, rejects private admin/module text, captures screenshots, and shuts the preview down.
- Added `playwright` as a dev dependency so the gate does not depend on a global or temporary `npx` cache.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `package-lock.json`
- `scripts/agent-init.sh`
- `scripts/check-admin-config-gate.mjs`
- `scripts/check-harness.mjs`

### Verification Results
- `node --check scripts/check-admin-config-gate.mjs`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-config-gate`: pass; 11 Firefox route checks passed and screenshots were written to `.tmp/admin-config-gate/screenshots`.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This remains no-config browser QA. It does not prove active-admin login, unprofiled-user unauthorized behavior, browser-key RLS writes, audit row creation, Storage upload policy, form persistence, Cloudflare preview behavior, or public content cutover.
- Extra observation: `npm audit --omit=dev --audit-level=critical` still reports existing production dependency advisories, including a critical Swiper advisory that requires a breaking upgrade path. That is not resolved in this admin-gate checkpoint.

### Next Handoff
- Run `npm run agent:admin-config-gate` after admin route/auth-shell changes, before claiming no-config admin route protection remains intact.
- Live admin verification still requires browser-safe Supabase config, a real owner/admin session, first-admin profile readiness, and Jay approval for tagged QA writes.

## Entry - 2026-05-29 (Admin No-Config Route Gate Full Coverage)

### Scope
- Expanded the built-site admin no-config QA evidence from the earlier `/admin`, `/admin/media`, and `/admin/login` spot check to every launch-critical admin route.
- Verified the config-missing gate on `/admin`, `/admin/login`, `/admin/unauthorized`, `/admin/leads`, `/admin/media`, `/admin/settings`, `/admin/stone-library`, `/admin/projects`, `/admin/products`, `/admin/articles`, and `/admin/audit`.
- This checkpoint proves the built admin shell stays fail-closed without browser-safe Supabase configuration; it does not change runtime source, Supabase data, Auth users, Storage, Cloudflare state, or credentials.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- Local preview: `npx vite preview --host 127.0.0.1 --port 4191 --strictPort`.
- Playwright Firefox screenshot checks: pass for `/admin`, `/admin/login`, `/admin/unauthorized`, `/admin/leads`, `/admin/media`, `/admin/settings`, `/admin/stone-library`, `/admin/projects`, `/admin/products`, `/admin/articles`, and `/admin/audit`, each waiting for rendered `Configuration required`.
- Screenshot evidence: `/tmp/urblo-admin-config-required-admin.png`, `/tmp/urblo-admin-config-required-admin-login.png`, `/tmp/urblo-admin-config-required-admin-unauthorized.png`, `/tmp/urblo-admin-config-required-admin-leads.png`, `/tmp/urblo-admin-config-required-admin-media.png`, `/tmp/urblo-admin-config-required-admin-settings.png`, `/tmp/urblo-admin-config-required-admin-stone-library.png`, `/tmp/urblo-admin-config-required-admin-projects.png`, `/tmp/urblo-admin-config-required-admin-products.png`, `/tmp/urblo-admin-config-required-admin-articles.png`, and `/tmp/urblo-admin-config-required-admin-audit.png`.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is built-site no-config browser QA only. It does not prove active-admin login, unprofiled-user unauthorized behavior, browser-key RLS writes, audit row creation, Storage upload policy, form persistence, Cloudflare preview behavior, or public content cutover.
- Live admin verification still requires browser-safe Supabase config, a real owner/admin session, first-admin profile readiness, and Jay approval for tagged QA writes.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`: continue only after browser-safe Supabase config and first-admin/profile inputs exist; then run the read-only readiness and authenticated browser QA paths.
- `NOW-ADMIN-CMS-001`: keep source-only guardrails moving where useful, but do not claim operational admin completion until live admin writes are verified.

## Entry - 2026-05-29 (Admin Destructive-Removal Source Guard)

### Scope
- Hardened `npm run agent:admin-crud-coverage` again so the launch-critical admin source cannot quietly introduce destructive removal behavior.
- The checker now scans `src/pages/admin` and `scripts/check-admin-crud-live.mjs` for Supabase `.delete()` mutations, HTTP `DELETE` requests, destructive RPC names, and visible `Delete`/`Remove` controls.
- This reinforces the existing archive-first removal model while first-admin credentials and live admin QA writes remain unavailable.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated in the current local environment.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only coverage. It does not prove live admin login, browser-key RLS writes, audit row creation, Storage upload policy, form persistence, Cloudflare preview behavior, or public content cutover.
- Live admin CRUD still requires browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged QA writes.

### Next Handoff
- `NOW-ADMIN-CMS-001`: continue source-only guardrails where possible; run `npm run agent:admin-crud-live -- --allow-writes` only after credentials/session/approval exist.
- `NOW-FORMS-BACKEND-001`: live form persistence still needs the service-role key and Jay approval for tagged form QA writes.

## Entry - 2026-05-29 (Admin CRUD State-Coverage Guard)

### Scope
- Hardened `npm run agent:admin-crud-coverage` so it now checks launch-critical admin UI state paths in addition to routes, tables, role gates, audit actions, and archive behavior.
- Mutating admin screens must keep validation feedback and save paths.
- Media/content lifecycle screens must keep publish/archive save paths plus published/archived state controls.
- This keeps the `/admin` source screens closer to the required operational CMS shape while live credentials and first-admin access remain unavailable.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only coverage. It does not prove live admin login, browser-key RLS writes, audit row creation, Storage upload policy, or public content cutover.
- Live admin CRUD still requires browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged QA writes.

### Next Handoff
- `NOW-ADMIN-CMS-001`: continue source-only guardrails where possible; run `npm run agent:admin-crud-live -- --allow-writes` only after credentials/session/approval exist.
- `NOW-ADMIN-AUTH-RLS-001`: first-admin readiness still needs the first admin email plus browser-safe and service-role keys.

## Entry - 2026-05-29 (Cloudflare Preview Bundle/API Safe-Failure Guard)

### Scope
- Hardened the deployed-preview smoke runner so it recursively discovers deployed JS/CSS route chunks instead of checking only the initial HTML asset references.
- Added deployed admin bundle contract checks for the configuration-required state and `admin_profiles` profile gate, plus browser bundle checks against service-role env access patterns.
- Added no-write malformed JSON API safe-failure checks for `/api/enquiries` and `/api/sample-requests`.
- Expanded the Forms API mock wrapper checks so OPTIONS must expose CORS method/header values and malformed JSON returns `400 invalid_json` before any Supabase calls.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-cloudflare-preview-smoke.mjs`
- `scripts/check-forms-api.mjs`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `node --check scripts/check-cloudflare-preview-smoke.mjs`: pass.
- `node --check scripts/check-forms-api.mjs`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:cloudflare-preview-smoke -- --base-url http://127.0.0.1:4184`: pass; local preview mode verified route shells, recursively discovered assets/route chunks, and the admin bundle contract while skipping Cloudflare-only redirect/Function checks.
- `npm run agent:smoke`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated in the current local environment.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only/local-preview hardening. It did not create a Cloudflare Pages project, run against a real `*.pages.dev` URL, create Supabase rows, create Auth users, upload Storage objects, configure credentials, send email, verify Turnstile, or run tagged live QA writes.
- Final deployed preview smoke still requires a Cloudflare Pages preview URL.
- Live form persistence still requires server-side service-role credentials and Jay approval for tagged form QA writes.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`: run `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev` once a Pages preview URL exists.
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live -- --allow-writes` only after service-role credentials exist and Jay approves tagged live form QA writes.
- `NOW-ADMIN-AUTH-RLS-001`: continue first-admin readiness once browser-safe Supabase config, service-role verification key, and the first admin email are available.

## Entry - 2026-05-29 (Content Import Data API Grant Preflight)

### Scope
- Expanded the generated content import preflight SQL so future static-to-Supabase import reviews inspect Data API table grants in addition to RLS and policies.
- Added role matrix checks for `anon`, `authenticated`, and `service_role` table privileges, plus generated-identity sequence usage checks for `authenticated` and `service_role`.
- Hardened `npm run agent:public-supabase-readiness` so the Data API grant matrix cannot be silently removed from the preflight artifact.
- Ran read-only Supabase connector verification against project `npkidywzwddbnfrnxlmo` after reviewing the Supabase 2026-04-28 Data API explicit-grants changelog.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-content-import-readiness.mjs`
- `scripts/check-public-supabase-readiness.mjs`

### Verification Results
- `node --check scripts/check-content-import-readiness.mjs`: pass.
- `node --check scripts/check-public-supabase-readiness.mjs`: pass.
- `npm run agent:content-import:preflight-sql`: pass; regenerated ignored `.tmp/content-import-preflight.sql` with Data API role and sequence grant inspection.
- `npm run agent:public-supabase-readiness`: pass; now verifies the preflight SQL includes grant inspection for `anon`, `authenticated`, and `service_role`.
- Supabase connector read-only grant summary: pass. Current live project has 19/19 public content tables with anon `select`, 5/5 private/admin/lead tables with anon `select` denied, 24/24 tables with anon writes denied, 24/24 tables with authenticated CRUD grants, 24/24 tables with service-role CRUD grants, and 23/23 generated sequences with authenticated/service-role usage grants.

### Risks and Gaps
- This is source/read-only hardening. It did not apply import SQL, create rows, create Auth users, upload Storage objects, configure credentials, or touch Cloudflare state.
- Live form persistence, first-admin readiness, tagged admin CRUD writes, Storage upload proof, email proof, Turnstile proof, content import apply, and public read cutover remain blocked on the existing credential and approval gates.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: live form persistence remains the next credential-gated proof once service-role key and tagged write approval exist.
- `NOW-ADMIN-AUTH-RLS-001`: first-admin readiness still needs browser/service keys and Jay's first-admin email.
- `NOW-ADMIN-CONTENT-CRUD-001`: content import remains draft/no-write until Jay approves import and cutover.

## Entry - 2026-05-29 (Content Import Connector Preflight)

### Scope
- Generated the latest ignored content import preflight bundle with `npm run agent:content-import:preflight-sql`.
- Ran a read-only Supabase connector preflight against project `npkidywzwddbnfrnxlmo` to compare planned static-to-Supabase import rows with the current target table state.
- Verified the current production target remains clean for a future approved draft import: no current rows in import target tables, no current rows in parent conflict-gate tables, RLS enabled across checked seed/import tables, and public-select policy coverage present.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:content-import:preflight-sql`: pass; generated ignored `.tmp/content-import-preview.json`, `.tmp/content-import-plan.md`, and `.tmp/content-import-preflight.sql` with 115 media candidates, 13 stone groups, 15 variants, 153 finish capability rows, 53 finish image rows, 6 products, 28 models, 5 projects, 4 articles, 95 article blocks, 0 warnings, and 0 blockers.
- Supabase connector read-only SQL: pass. Live target has 12 `finish_definitions`, 1 `site_settings` row, and 0 current rows in every content import target table.
- Supabase connector parent conflict-gate check: pass. `media_assets`, `stone_groups`, `products`, `projects`, and `articles` all have 0 current rows, so the generated merge/upsert conflict gate has no current natural-key conflicts.
- Supabase connector RLS/policy check: pass. No missing RLS across checked seed/import tables, and each checked public content table has one public-select policy.
- Supabase security advisor: pass. 0 security lints.

### Risks and Gaps
- This is a read-only/source-only preflight. It did not apply import SQL, merge rows, publish content, switch public runtime reads, create Supabase rows, create Auth users, upload Storage objects, or touch Cloudflare state.
- Actual import remains blocked on Jay approval for the draft import, merge/upsert behavior if preflight ever reports parent conflicts, live admin/auth readiness, and a deliberate public read cutover.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`: keep content import and public read cutover guarded until approval.
- `NOW-ADMIN-CMS-001`: resume live admin verification only after browser-safe Supabase config, first admin, admin session, and write approval exist.
- `NOW-FORMS-BACKEND-001`: live form persistence remains the next credential-gated proof once service-role key and write approval exist.

## Entry - 2026-05-29 (Final Turnstile Public Site-Key Guard)

### Scope
- Hardened `scripts/check-forms-api-live.mjs` so final `--require-turnstile` proof refuses to start unless `VITE_TURNSTILE_SITE_KEY` is configured.
- Kept the existing server-side Turnstile secret and token checks, so the live verifier now proves the public Contact widget path and server verification path are both intentionally configured before tagged live form rows can be created.
- Updated Harness docs and task acceptance so final Turnstile proof cannot be mistaken for a server-only token check.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-forms-api-live.mjs`

### Verification Results
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `SUPABASE_SERVICE_ROLE_KEY=dummy TURNSTILE_SECRET_KEY=dummy node scripts/check-forms-api-live.mjs --allow-writes --require-turnstile --turnstile-token dummy`: expected fail-closed before Supabase reads/writes with missing `VITE_TURNSTILE_SITE_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY=dummy VITE_TURNSTILE_SITE_KEY=dummy node scripts/check-forms-api-live.mjs --allow-writes --require-turnstile --turnstile-token dummy`: expected fail-closed at the next preflight with missing server-side Turnstile secret.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:live-readiness -- --json --form-writes-approved --turnstile-token-provided`: pass in report-only mode; final Turnstile proof still reports missing service key, Turnstile secret, and `VITE_TURNSTILE_SITE_KEY` in the current local environment.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.

### Risks and Gaps
- This is source-only verifier hardening. It does not create Supabase rows, configure Turnstile, verify a real token, send email, create Auth users, upload Storage objects, or touch Cloudflare state.
- Live form persistence and final Turnstile proof still require `SUPABASE_SERVICE_ROLE_KEY`, `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` or `CF_TURNSTILE_SECRET_KEY`, a valid target-environment token, and Jay approval for tagged form QA writes.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: configure service-role key and run `npm run agent:forms-live` after Jay approval.
- `NOW-FORMS-SUPABASE-001`: run final email/Turnstile proof after Resend and Turnstile inputs exist.
- `NOW-ADMIN-AUTH-RLS-001`: continue first-admin readiness once first admin email and keys are available.

## Entry - 2026-05-29 (Content Cutover Readiness Gates)

### Scope
- Expanded `npm run agent:live-readiness` so content import and public read cutover approval gates are visible next to form/admin/Cloudflare live blockers.
- Added no-secret readiness flags for guarded draft content import apply, merge/upsert approval, and public read cutover approval: `--content-import-approved`, `--content-merge-approved`, and `--content-public-cutover-approved`.
- Updated Harness docs so generated `.tmp` import SQL remains clearly no-write review material until Jay approves the live operation.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-live-readiness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; content import artifacts show ready, while live apply and public cutover remain manual-gated without approval flags.
- `npm run agent:live-readiness -- --json --content-import-approved --content-merge-approved --content-public-cutover-approved`: pass in report-only mode; content import/cutover gates show ready when explicit approval flags are supplied.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:check`: pass.
- `npm run lint`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only/no-write. It did not apply content import SQL, merge target rows, publish content, switch public runtime reads, create Supabase rows, create Auth users, upload Storage objects, or touch Cloudflare.
- Real content import apply, any merge/upsert, and public read cutover still require Jay approval, reviewed preflight output, live credentials/session readiness, and a deliberate runtime migration.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Admin Live Dashboard Health Predicate Guard)

### Scope
- Expanded `npm run agent:admin-crud-live` so the future approval-gated live run verifies dashboard health predicates against tagged QA rows before archiving them.
- The staged live proof now covers published media missing metadata, project and project-fact claim review, published Products/Articles missing key media, TBC Stone Library rows, and stale new leads.
- Hardened `npm run agent:admin-crud-coverage` so the dashboard-health live-verifier hooks and dashboard project-fact copy cannot be silently removed.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run agent:smoke`: pass.
- `npm run agent:forms-ui`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated in the current local environment.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:content-import:apply-sql`: pass; wrote ignored `.tmp/` review SQL/artifact files only.
- `npm run agent:public-supabase-readiness`: pass.

### Risks and Gaps
- This is source-only/no-write. It did not run `--allow-writes`, create Supabase rows, create Auth users, upload Storage objects, configure credentials, touch Cloudflare, or verify live admin browser access.
- Final dashboard-health proof still requires browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged live admin QA writes.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Admin Dashboard Health Queue)

### Scope
- Expanded `/admin` dashboard from simple published-row metrics into an operational content health queue.
- Added source-side Supabase count checks for published media missing alt/usage notes, published project and project-fact claim review, published products/articles missing key media, Stone Library TBC rows, and stale new leads older than 48 hours.
- Hardened `npm run agent:admin-crud-coverage` so those dashboard health checks and table references cannot be silently removed.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `src/pages/admin/AdminDashboardPage.tsx`

### Verification Results
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:forms-ui`: pass.
- `npm run agent:admin-crud-coverage`: pass; Dashboard coverage now includes `media_assets`, `stone_groups`, `projects`, `project_facts`, `products`, `articles`, `enquiries`, and `sample_requests`.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated in the current local environment.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only/no-write. It did not create Supabase rows, create Auth users, run live admin writes, upload Storage objects, send email, verify Turnstile, create Cloudflare state, or configure credentials.
- The dashboard health queue still needs live browser/data QA after browser-safe Supabase config, first-admin profile access, and a real owner/admin session exist.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Content Import Merge Approval Guard)

### Scope
- Added a parent natural-key conflict report to the generated content import preflight SQL.
- Added a separate `urblo.import_merge_approved=true` guard to the generated draft import SQL so existing parent keys in `media_assets`, `stone_groups`, `products`, `projects`, or `articles` require explicit merge/upsert approval in addition to the base import approval.
- Expanded public Supabase readiness checks so the merge gate, manual-comment posture, and guarded parent-table conflict checks cannot be silently removed.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-content-import-readiness.mjs`
- `scripts/check-public-supabase-readiness.mjs`

### Verification Results
- Supabase connector `list_migrations`: pass. 12 migrations are applied through `sample_request_atomic_insert`.
- Supabase connector `execute_sql`: pass. 24/24 expected launch tables exist with RLS enabled, 12 published finish definitions exist, one published default `site_settings` row exists, and private workflow/admin tables remain at 0 rows.
- Supabase security advisor: pass. 0 security lints.
- `node --check scripts/check-content-import-readiness.mjs`: pass.
- `node --check scripts/check-public-supabase-readiness.mjs`: pass.
- `npm run agent:content-import:apply-sql`: pass; wrote ignored `.tmp/` preview, plan, preflight, apply, and rollback artifacts only.
- `npm run agent:public-supabase-readiness`: pass; verified the manual import approval gate, manual merge approval gate, draft-only status posture, and existing rollback/readiness contracts.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated in the current local environment.

### Risks and Gaps
- This is source-only/no-write. It did not apply content rows, merge existing data, roll back data, create Supabase rows, create Auth users, upload Storage objects, touch Cloudflare, configure credentials, or run live form/admin writes.
- Real content import, merge/upsert behavior, rollback execution, public read cutover, and publication still require Jay approval, reviewed target preflight output, credentials, and a deliberate live operation window.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Content Import Rollback SQL Guard)

### Scope
- Added `--rollback-sql-out` support to the static-to-Supabase content import dry run.
- Updated `npm run agent:content-import:apply-sql` so the ignored `.tmp/` review bundle now includes both guarded draft apply SQL and guarded draft rollback SQL.
- The rollback artifact is destructive by nature but fail-closed by default: it aborts unless `urblo.rollback_approved=true` is explicitly set in the transaction, rolls back in reverse dependency order, and targets matching draft/import rows only.
- Expanded public Supabase readiness checks so the rollback artifact cannot lose its manual gate, reverse order, draft targeting, or dry-run row-count summary.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `scripts/check-content-import-readiness.mjs`
- `scripts/check-harness.mjs`
- `scripts/check-public-supabase-readiness.mjs`

### Verification Results
- `node --check scripts/check-content-import-readiness.mjs`: pass.
- `node --check scripts/check-public-supabase-readiness.mjs`: pass.
- `node --check scripts/check-harness.mjs`: pass.
- `npm run agent:content-import:apply-sql`: pass; wrote ignored `.tmp/` preview, plan, preflight, apply, and rollback artifacts only.
- `npm run agent:public-supabase-readiness`: pass; verified the new guarded rollback SQL plus existing draft-only import/readiness contracts.

### Risks and Gaps
- This is source-only/no-write. It did not apply or roll back data, create Supabase rows, delete rows, create Auth users, upload Storage objects, touch Cloudflare, or use credentials.
- Real content import and rollback execution still require Jay approval, a reviewed target preflight, service-role credential review, and a deliberate live operation window.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Contact Turnstile Widget Source Contract)

### Scope
- Added the optional Cloudflare Turnstile widget path to the public Contact form.
- The widget renders only when `VITE_TURNSTILE_SITE_KEY` is configured, blocks submission until a token exists in that mode, sends `turnstileToken` to the existing Pages Function payload, and resets after success or failure.
- Added `VITE_TURNSTILE_SITE_KEY` to the Vite/env contract, `.env.example`, Cloudflare readiness guard, live-readiness reporting, Contact source verifier, and Harness docs.

### Changed Files
- `.env.example`
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `scripts/check-contact-form-ui-source.mjs`
- `scripts/check-live-readiness.mjs`
- `src/pages/ContactPage.tsx`
- `src/vite-env.d.ts`

### Verification Results
- `node --check scripts/check-contact-form-ui-source.mjs`: pass.
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; final Turnstile proof now reports missing `VITE_TURNSTILE_SITE_KEY` alongside the server secret/key and approval/token gates.
- `npm run agent:live-readiness -- --json --form-writes-approved --turnstile-token-provided`: pass in report-only mode; flags clear only the manual approval/token gates and do not replace missing credentials.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including Forms API checks and the Contact form UI source contract.
- Playwright CLI Firefox snapshot on `http://127.0.0.1:4174/contact`: pass. With no `VITE_TURNSTILE_SITE_KEY` configured, the Contact page rendered the normal form, direct email/phone fallback channels, and no Turnstile widget.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is a source-only widget/config checkpoint. It does not create Supabase rows, verify a real Turnstile token, configure the Cloudflare Turnstile site, configure server-side Turnstile secrets, send email, create Auth users, upload Storage objects, or touch Cloudflare state.
- Final Turnstile launch proof still requires `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` or `CF_TURNSTILE_SECRET_KEY`, a valid target-environment token, service-role credentials, and Jay approval for tagged live form QA writes.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Live Form Email and Turnstile Proof Guards)

### Scope
- Strengthened `scripts/check-forms-api-live.mjs` with explicit final proof flags for real notification and Turnstile behavior.
- Added `--allow-email --require-email` so final live form proof must store `notification_status = 'sent'` for valid enquiry and sample request rows instead of accepting skipped or failed notification states.
- Added `--require-turnstile --turnstile-token <token>` so final live form proof must store `turnstile_success = true` for valid enquiry and sample request rows.
- Expanded `npm run agent:live-readiness` so email and Turnstile proof inputs are reported separately, and updated the Cloudflare runbook/readiness guard to keep the final proof commands visible.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/agent-init.sh`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `scripts/check-forms-api-live.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; final email and Turnstile proof inputs remain missing/manual-gated in the current local environment.
- `npm run agent:live-readiness -- --json --form-writes-approved --turnstile-token-provided`: pass in report-only mode; approval/token readiness flags clear only the relevant manual gates and do not replace missing credentials.
- Expected fail-closed guard: `SUPABASE_SERVICE_ROLE_KEY=dummy node scripts/check-forms-api-live.mjs --allow-writes --require-email` stops before writes because direct handler email proof also requires `--allow-email`.
- Expected fail-closed guard: `SUPABASE_SERVICE_ROLE_KEY=dummy node scripts/check-forms-api-live.mjs --allow-writes --allow-email --require-email` stops before writes because Resend sender/recipient configuration is missing.
- Expected fail-closed guard: `SUPABASE_SERVICE_ROLE_KEY=dummy node scripts/check-forms-api-live.mjs --allow-writes --require-turnstile` stops before writes because a token is missing.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:content-import:apply-sql`: pass; wrote ignored `.tmp/` review/preflight/apply artifacts only.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:init`: pass and now lists the final email/Turnstile proof commands.
- Supabase connector `list_migrations`: pass. 12 migrations are applied through `sample_request_atomic_insert`.
- Supabase connector read-only sanity: pass. 24/24 expected launch tables have RLS enabled; published seeds remain 12 finish definitions and one default site settings row; private workflow/admin tables still have 0 rows.
- Supabase security advisor: pass. 0 security lints.

### Risks and Gaps
- This is source-only verifier hardening. It does not create Supabase rows, send emails, verify a real Turnstile token, upload Storage objects, create Auth users, or touch Cloudflare state.
- Final form completion still requires service-role credentials, browser-safe key for private-row proof, Resend variables, Turnstile secret/token, Cloudflare preview URL for deployed proof, and Jay approval for tagged live form QA writes.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Admin Storage Readback and Anonymous Read Guard)

### Scope
- Strengthened `scripts/check-admin-crud-live.mjs` so the approval-gated `--include-storage` live run no longer proves only private Storage upload success.
- The live verifier now checks the tagged tiny `urblo-admin-media` object can be read back by the signed-in admin and is denied to anonymous browser-key reads through both private and public Storage object endpoints.
- Expanded `scripts/check-admin-crud-coverage.mjs` so the Storage signed-in readback and anonymous-read guards cannot be silently removed.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-live -- --include-storage`: pass in plan-only/no-write mode; plan now includes the private Storage signed-in readback and anonymous-read denial checks.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated, and Storage proof messaging now names signed-in readback plus anonymous-read denial.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:forms-ui`: pass.

### Risks and Gaps
- This is a verifier hardening checkpoint only. It does not upload Storage objects, create Supabase rows, create Auth users, run live admin writes, or touch Cloudflare state.
- Final Storage proof still requires browser-safe Supabase config, a real owner/admin session, Jay approval for tagged live admin QA writes, and `npm run agent:admin-crud-live -- --allow-writes --include-storage`.

### Next Handoff
- `NOW-ADMIN-MEDIA-LEADS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Harness Operational Script Guard)

### Scope
- Hardened `npm run agent:check` so `scripts/check-harness.mjs` verifies the active operational `agent:*` package script map, not only the core harness and Contact UI source check.
- The guarded script map now covers form live/UI checks, admin coverage/live/readiness checks, first-admin bootstrap, live input readiness, Cloudflare readiness/preview smoke, content import, and public Supabase readiness commands.
- Refreshed current no-write Supabase evidence while live credentials remain absent.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-harness.mjs`

### Verification Results
- Supabase connector `list_migrations`: pass. 12 migrations are applied through `sample_request_atomic_insert`.
- Supabase connector `execute_sql`: pass. 24/24 expected public launch tables exist with RLS enabled, 12 published finish definitions exist, one published default site settings row exists, and private workflow/admin tables remain at 0 rows.
- Supabase connector `execute_sql`: pass. `submit_sample_request_with_item(jsonb, jsonb)` is `security invoker` and executable by `service_role` only.
- Supabase security advisor: pass. 0 security lints.
- Supabase performance advisor: reviewed. Remaining INFO/WARN items are expected early-stage unused-index and multiple-permissive-policy notices on new/low-traffic launch tables; do not remove launch-pattern indexes before real import/live admin usage evidence exists.
- `node --check scripts/check-harness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:forms-ui`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; all live form/admin/Cloudflare inputs remain missing or approval-gated in the current local environment.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:content-import:apply-sql`: pass; wrote ignored `.tmp/` review/preflight/apply artifacts only.

### Risks and Gaps
- This is source/docs verification hardening plus read-only external-state evidence. It does not create Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes.
- Live completion still requires service-role and browser-safe Supabase keys, Jay-confirmed first-admin email/profile/session, Cloudflare preview URL, and Jay approval for tagged form/admin QA writes.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-29 (Sample Request Atomic Insert RPC)

### Scope
- Added and applied Supabase migration `sample_request_atomic_insert` for project `npkidywzwddbnfrnxlmo`.
- Added service-role-only RPC function `public.submit_sample_request_with_item(jsonb, jsonb)` so the Pages Function creates a `sample_requests` row and first `sample_request_items` row inside one database transaction.
- Updated `/api/sample-requests` source to call the RPC instead of two separate REST inserts, reducing the risk of a stored sample request without its requested item.
- Updated Forms API mock checks so direct sample request/table item inserts now fail the source contract, and the migration source must retain the service-role-only RPC grants.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `functions/_lib/forms.js`
- `scripts/check-forms-api.mjs`
- `supabase/migrations/202605290003_sample_request_atomic_insert.sql`
- `supabase/migrations/README.md`

### Verification Results
- `node --check functions/_lib/forms.js`: pass.
- `node --check scripts/check-forms-api.mjs`: pass.
- `node scripts/check-forms-api.mjs`: pass; valid sample requests now use `submit_sample_request_with_item`, mock checks fail on direct `sample_requests` / `sample_request_items` insert paths, and the migration source includes the expected service-role-only RPC grant/revoke contract.
- Supabase connector syntax preflight in a rolled-back transaction: pass.
- Supabase connector `apply_migration`: `sample_request_atomic_insert` applied successfully.
- Supabase connector `list_migrations`: `sample_request_atomic_insert` present.
- Supabase connector `execute_sql`: `submit_sample_request_with_item(jsonb, jsonb)` exists, is `security invoker`, uses `search_path=public, pg_temp`, denies execute to `anon` and `authenticated`, and allows execute to `service_role`.
- Supabase connector `execute_sql`: `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items` remain at 0 rows after the DDL-only migration.

### Risks and Gaps
- This fixes source and database write atomicity for the sample request/request-item pair, but still does not prove live form persistence because no service-role key or Jay approval for tagged live form QA writes is available locally.
- Email delivery, Turnstile, deployed Cloudflare Function behavior, and browser-key private-row proof remain pending their documented credentials and approval gates.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Admin Profile Form Duplicate Validation)

### Scope
- Added `/admin/settings` form validation for duplicate Supabase Auth user IDs before creating an admin profile.
- Added `/admin/settings` form validation for duplicate normalized admin profile emails before save, matching the live `admin_profiles_email_ci_unique_idx` database constraint.
- Expanded `npm run agent:admin-crud-coverage` to guard both validation messages.
- Updated Harness docs to record the UI validation layer and remaining live save blockers.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `src/pages/admin/AdminSettingsPage.tsx`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This improves source/UI validation only. Live `/admin/settings` profile saves still require browser-safe Supabase config, a real owner/admin profile, and approved live QA writes.
- It does not replace the live database uniqueness constraint or live first-admin/readiness checks.

### Next Handoff
- `NOW-ADMIN-SETTINGS-CRUD-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-29 (Admin Profile Email Uniqueness)

### Scope
- Added and applied Supabase migration `admin_profile_email_uniqueness` for project `npkidywzwddbnfrnxlmo`.
- Added `admin_profiles_email_ci_unique_idx` on `lower(btrim(email))` so admin profile email lookups stay case-insensitively unambiguous for first-admin bootstrap, admin readiness, and `/admin/settings` profile management.
- Strengthened `scripts/bootstrap-first-admin.mjs` so approved write mode refuses to bootstrap when the target profile email is already linked to a different Supabase Auth user before attempting the upsert.
- Added `npm run agent:admin-crud-coverage` checks for the migration/source contract.
- Updated Harness docs to reflect the applied data integrity constraint and remaining live credential/approval blockers.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/bootstrap-first-admin.mjs`
- `scripts/check-admin-crud-coverage.mjs`
- `supabase/migrations/202605290002_admin_profile_email_uniqueness.sql`
- `supabase/migrations/README.md`

### Verification Results
- Supabase connector `list_migrations`: `admin_profile_email_uniqueness` present.
- Supabase connector `execute_sql`: `admin_profiles_email_ci_unique_idx` exists as a unique index on `lower(btrim(email))`.
- Supabase connector `execute_sql`: duplicate normalized admin profile email groups = 0.
- `node --check scripts/bootstrap-first-admin.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:first-admin-bootstrap`: pass in plan-only/no-write mode.
- `npm run agent:first-admin-bootstrap -- --verify-only --admin-email first@example.com`: expected fail-closed result on missing service-role key.
- `npm run agent:admin-live-readiness -- --admin-email first@example.com`: expected fail-closed result on missing browser-safe and service-role keys.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:forms-ui`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is a live schema hardening migration plus source guard. It does not create a Supabase Auth user, create an admin profile, run first-admin write mode, perform admin CRUD live writes, upload Storage objects, submit live forms, or touch Cloudflare state.
- Live completion still requires service-role and browser-safe Supabase keys, Jay-confirmed first-admin email, Jay approval for first-admin/profile writes, a real owner/admin session, Jay approval for tagged admin/form QA writes, and a Cloudflare preview URL.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Admin Auth Profile Link Readiness Guard)

### Scope
- Strengthened `scripts/bootstrap-first-admin.mjs` so read-only `--verify-only` now fails if the active admin profile is not linked to the matching Supabase Auth user id for the supplied first-admin email.
- Strengthened `scripts/check-admin-live-readiness.mjs` so the read-only admin readiness gate also verifies the matching Auth user/profile link before browser login/save QA.
- Added `npm run agent:admin-crud-coverage` source checks so the Auth/profile link contract cannot be silently removed.
- Kept the checkpoint source-only. No Supabase Auth users, profiles, rows, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/bootstrap-first-admin.mjs`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-live-readiness.mjs`

### Verification Results
- `node --check scripts/bootstrap-first-admin.mjs`: pass.
- `node --check scripts/check-admin-live-readiness.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:first-admin-bootstrap`: pass in plan-only/no-write mode.
- `npm run agent:first-admin-bootstrap -- --verify-only --admin-email first@example.com`: expected fail-closed result on missing service-role key.
- `npm run agent:admin-live-readiness -- --admin-email first@example.com`: expected fail-closed result on missing browser-safe and service-role keys.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:forms-ui`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This catches profile/Auth id mismatch before browser QA, but it still does not create or update any Auth user/profile.
- Live first-admin and active-admin verification still require service-role credentials, browser-safe Supabase key configuration, Jay-confirmed first-admin email, Jay approval for any writes, and a real owner/admin session before tagged admin write QA.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (First Admin Verify-Only Role Guard)

### Scope
- Strengthened `scripts/bootstrap-first-admin.mjs` so read-only `--verify-only` now fails unless the existing active `admin_profiles` row has the planned bootstrap role (`owner` by default, or explicit `--role admin`).
- Added `npm run agent:admin-crud-coverage` source checks so the first-admin verify-only role contract cannot be silently removed.
- Kept the checkpoint source-only. No Supabase Auth users, profiles, rows, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/bootstrap-first-admin.mjs`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `node --check scripts/bootstrap-first-admin.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:first-admin-bootstrap`: pass in plan-only/no-write mode.
- `npm run agent:first-admin-bootstrap -- --verify-only --admin-email first@example.com`: expected fail-closed result on missing service-role key.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:forms-ui`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This prevents a wrong-role first-admin profile from passing the read-only bootstrap check, but it still does not create or update any Auth user/profile.
- Live first-admin bootstrap still requires service-role credentials, Jay-confirmed first-admin email, Jay approval, `--allow-writes`, and matching `--confirm-email`.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Public Supabase Guarded Apply-SQL Readiness)

### Scope
- Strengthened `scripts/check-public-supabase-readiness.mjs` so the no-write public cutover gate now generates and inspects the guarded draft content import SQL, not only the JSON dry-run payload.
- Added source checks that the generated apply SQL keeps the `urblo.import_approved` gate commented by default, still requires runtime approval, contains no destructive statements, contains no publish-status changes, forces imported content status to `draft`, and keeps the SQL verification summary aligned with dry-run plan counts.
- Kept the checkpoint source-only. No Supabase rows, Storage objects, Auth users, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-public-supabase-readiness.mjs`

### Verification Results
- `node --check scripts/check-public-supabase-readiness.mjs`: pass.
- `npm run agent:public-supabase-readiness`: pass; now reports guarded draft apply-SQL safety along with draft-only payload, structured article blocks, public RLS, anon grants, static runtime, and Cloudflare route scope.
- `npm run agent:content-import:apply-sql`: pass; wrote ignored `.tmp/` review/preflight/apply artifacts only.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This strengthens source-only safety before an approved content import. It still does not apply content rows, migrate public reads to Supabase, verify live form persistence, create a first admin profile, run authenticated admin CRUD writes, upload Storage objects, or validate a Cloudflare preview URL.
- Live completion still requires service-role and browser-safe Supabase keys, first-admin email/profile/session, Cloudflare preview URL, and Jay approval for tagged live writes.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Forms Live Audit Metadata Coverage)

### Scope
- Strengthened `scripts/check-forms-api-live.mjs` so approved live form verification checks valid enquiry/sample-request audit rows include the submitted source route metadata.
- Added live verifier checks that invalid enquiry/sample-request payloads create no lead rows and no matching audit events.
- Strengthened `scripts/check-forms-api.mjs` so mock/source Forms API checks guard enquiry and sample-request audit payload entity fields, source route metadata, item id, and quantity.
- Kept the checkpoint source/mock-only. No Supabase rows, Storage objects, Auth users, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-forms-api-live.mjs`
- `scripts/check-forms-api.mjs`

### Verification Results
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `node --check scripts/check-forms-api.mjs`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:check`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This improves source/mock and future live verification coverage. It still does not prove production form persistence until a server-side Supabase service-role key is available and Jay approves tagged live form QA writes.
- Turnstile, email delivery, deployed Cloudflare Function behavior, and private-row browser-key proof remain pending their documented credentials and approval gates.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Admin Live Audit Action Coverage)

### Scope
- Strengthened `scripts/check-admin-crud-live.mjs` so approved live admin CRUD QA writes must produce the exact expected `admin_audit_events` action counts, entity types, entity ids, marker metadata, and verifier source metadata.
- Replaced the previous loose `at least 40 audit rows` check with explicit coverage for Settings, Media, Stone Library, Products, Projects, Articles, Leads, exports, and publish/archive transitions.
- Strengthened `scripts/check-admin-crud-coverage.mjs` so source-only coverage fails if the admin live verifier drops the exact audit action coverage contract.
- Kept the checkpoint source-only. No Supabase rows, Storage objects, Auth users, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:check`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This improves the eventual live admin proof but remains source-only until browser-safe Supabase keys, an owner/admin session, Jay approval for tagged admin QA writes, and optional Storage upload approval are available.
- It does not prove active admin login, form persistence, live CRUD writes, Storage upload, Cloudflare preview deployment, or production DNS.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Admin Browser Secret and Config Gate Coverage)

### Scope
- Strengthened `scripts/check-admin-crud-coverage.mjs` so the source-only admin verifier scans all `src` browser source files for actual Supabase service-role env/client usage patterns instead of checking only `src/lib/supabaseClient.ts`.
- Added machine checks for the admin config-missing state copy, login/unauthorized config handling, and admin-route WelcomePopup suppression.
- Added machine checks that the future `scripts/check-admin-crud-live.mjs` path remains browser-key/RLS based and does not introduce service-role key access.
- Kept the checkpoint source-only. No Supabase rows, Storage objects, Auth users, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:check`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only coverage hardening. It does not prove active admin login, first-admin bootstrap, live form persistence, admin CRUD writes, Storage upload, audit row creation, or Cloudflare preview deployment.
- Live completion still requires service-role and browser-safe Supabase keys, first-admin email/profile/session, Cloudflare preview URL, and Jay approval for tagged live writes.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Supabase Read-Only Sanity Snapshot)

### Scope
- Used the Supabase connector in read-only mode to re-check the current Urblo project state after the Forms API wrapper coverage checkpoint.
- Confirmed the production foundation and seed posture still matches the Harness contract before any future live-write verification.
- No SQL migration, DDL, insert, update, delete, Auth action, Storage upload, or Cloudflare action was performed.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`

### Verification Results
- Supabase migration list for project `npkidywzwddbnfrnxlmo`: pass. 10 migrations are applied: foundation schema/hardening/anon grants, baseline seed, admin settings/profile/helper hardening, and media Storage hardening.
- Supabase table/RLS query: pass. 24/24 expected public launch tables exist and have RLS enabled.
- Supabase baseline/private row query: pass. 12 published `finish_definitions`, one published default `site_settings` row, and zero private workflow/admin rows in `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items`.
- Supabase Storage bucket query: pass. `urblo-admin-media` exists as private and `urblo-public-media` exists as public.

### Risks and Gaps
- This is a read-only external-state snapshot. It does not verify live form persistence, first-admin bootstrap, active-admin login, admin CRUD writes, Storage upload, audit row creation, deployed Cloudflare preview behavior, or DNS.
- The first attempted sanity query used stale local assumptions (`site_settings.key` and a 23-table list) and was corrected to the actual schema contract (`site_settings.settings_key` and the 24-table list including `project_media`) before recording this evidence.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-05-29 (Forms API Wrapper Coverage)

### Scope
- Strengthened `scripts/check-forms-api.mjs` so the no-secret Forms API verifier covers the Cloudflare Pages Function endpoint wrappers, not only the shared request handlers.
- Added checks that GET requests return `method_not_allowed`, OPTIONS returns the 204 preflight response without Supabase calls, and invalid Sample Request POSTs fail validation before Supabase calls.
- Kept the checkpoint source-only: no live endpoint, Supabase row, Turnstile, Resend, Cloudflare, or credential access was used.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-forms-api.mjs`

### Verification Results
- `node scripts/check-forms-api.mjs`: pass.
- `node --check scripts/check-forms-api.mjs`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API wrapper/source checks, and Contact form UI source checks.
- `npm run agent:check`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This strengthens source/mock coverage only. Live Contact and Sample Request persistence still requires server-side `SUPABASE_SERVICE_ROLE_KEY`, optional notification/Turnstile secrets, and Jay approval for tagged live form QA writes.
- Deployed Cloudflare Function behavior still requires a real Pages preview URL before `npm run agent:cloudflare-preview-smoke -- --base-url <preview>` can prove deployed route/API behavior.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (First Admin Bootstrap Audit Guard)

### Scope
- Updated `scripts/bootstrap-first-admin.mjs` so approved `--allow-writes` mode records an `admin_profile.bootstrap` audit event after the first-admin profile upsert.
- The audit event uses `actor_user_id = null` because the bootstrap is a guarded service-role setup operation, and stores target Auth/profile metadata in `metadata`.
- The command now fails if the bootstrap audit event cannot be recorded, instead of silently treating the access-control change as fully verified.
- Strengthened `npm run agent:admin-crud-coverage` so it guards this bootstrap audit source contract.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/bootstrap-first-admin.mjs`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `node --check scripts/bootstrap-first-admin.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:first-admin-bootstrap`: pass in plan-only/no-write mode; no Supabase calls, invites, profile writes, or deletes were attempted.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API/UI source checks.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only first-admin audit hardening. It does not create an Auth user, create or update an admin profile, or verify live audit row creation.
- Live first-admin bootstrap still requires service-role credentials, Jay-confirmed first admin email, Jay approval, `--allow-writes`, and matching `--confirm-email`.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Admin Login Next Target Guard)

### Scope
- Tightened `/admin/login` post-auth redirect handling so it accepts only true admin-console `next` targets: `/admin`, `/admin?*`, or `/admin/*`.
- Blocked login and unauthorized self-loop targets from being used as authenticated redirects.
- Strengthened `npm run agent:admin-crud-coverage` so it guards the login next-target source contract and verifies session bootstrap still calls `supabase.auth.getUser()` before querying an active `admin_profiles` row.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `src/pages/admin/AdminLoginPage.tsx`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API/UI source checks.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only admin auth hardening. It does not prove active admin login, unprofiled-user unauthorized behavior, first-admin bootstrap, live CRUD writes, Storage uploads, audit row creation, or Cloudflare preview deployment.
- Live admin verification still requires browser-safe Supabase config, service-role verification access, first admin email/profile, a real owner/admin session, and Jay approval for tagged live admin QA writes.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Contact Form UI Source Contract)

### Scope
- Added a no-secret Contact form UI source contract check for the public enquiry and sample-request form.
- The check verifies the main submit flow stays on `/api/enquiries` and `/api/sample-requests`, not a mailto/window-navigation fallback.
- It also verifies inline validation, success, error, submitting, sample-request mode fields, direct email/phone fallback channels, and source-route payload handling.
- Wired the check into `npm run agent:smoke` after the existing Forms API mock coverage.
- Added Harness protection so `npm run agent:check` verifies the `agent:forms-ui` package script exists and `npm run agent:smoke` keeps running the Contact form UI source contract check.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/agent-smoke.sh`
- `scripts/check-contact-form-ui-source.mjs`
- `scripts/check-harness.mjs`

### Verification Results
- `node --check scripts/check-contact-form-ui-source.mjs`: pass.
- `node --check scripts/check-harness.mjs`: pass.
- `npm run agent:forms-ui`: pass.
- Supabase MCP read-only sanity: 10 migrations are present, 24/24 public launch tables have RLS enabled, 12 published finish definitions exist, one published default site settings row exists, and private workflow/admin tables remain at 0 rows.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including Forms API mock checks and the new Contact form UI source contract check.
- `npm run agent:init`: pass and now lists `npm run agent:forms-ui`.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:content-import:apply-sql`: pass; wrote ignored `.tmp/` review/preflight/apply artifacts only.

### Risks and Gaps
- This is source-only UI contract coverage. It does not submit live forms, create Supabase rows, send email, verify Turnstile, run responsive browser QA, or verify Cloudflare deployed endpoints.
- Live Contact/Sample Request persistence still requires server-side `SUPABASE_SERVICE_ROLE_KEY` and Jay approval for tagged live form QA writes.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Admin No-Config Route Gate QA)

### Scope
- Verified the built admin shell still renders the configuration-required gate when no browser-safe Supabase key is configured.
- Checked representative admin routes covering dashboard, protected module, and login entry points.
- Kept the check no-secret and no-write; it did not configure Supabase env, create users, query Supabase, or touch live data.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx vite preview --host 127.0.0.1 --port 4191 --strictPort`: pass; served the current built site locally.
- `npx playwright screenshot --wait-for-selector "text=Configuration required" --wait-for-timeout=500 --viewport-size=1280,800 http://127.0.0.1:4191/admin /tmp/urblo-admin-config-required-dashboard.png`: pass.
- `npx playwright screenshot --wait-for-selector "text=Configuration required" --wait-for-timeout=500 --viewport-size=1280,800 http://127.0.0.1:4191/admin/media /tmp/urblo-admin-config-required-media.png`: pass.
- `npx playwright screenshot --wait-for-selector "text=Configuration required" --wait-for-timeout=500 --viewport-size=1280,800 http://127.0.0.1:4191/admin/login /tmp/urblo-admin-config-required-login.png`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This proves only the config-missing gate for the built local site. It does not prove active admin login, unprofiled-user unauthorized behavior, first-admin bootstrap, live CRUD writes, Storage uploads, or Cloudflare preview deployment.
- Playwright Test was not added as a dependency; the verification used the existing `npx playwright screenshot` CLI.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-05-29 (Cloudflare Preview Route Checklist Alignment)

### Scope
- Aligned the Cloudflare deployment runbook's deployed-preview manual route checklist with the canonical public routes used by the actual preview smoke runner.
- Replaced the stale direct-refresh `/products/primeBlock` checklist item with canonical `/products/prime-block`.
- Added canonical article detail and `/capabilities` direct-refresh checks to the runbook.
- Hardened `npm run agent:cloudflare-readiness` so it fails if those canonical preview route checks drop from the runbook.

### Changed Files
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-cloudflare-pages-readiness.mjs`

### Verification Results
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Source/docs-only deployment readiness alignment. No Cloudflare project, DNS record, Supabase row, Storage object, Auth user, credential, or live write was created or changed.
- Actual deployed-preview smoke still requires a real `*.pages.dev` URL.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Admin Live Publish Archive Verifier)

### Scope
- Strengthened `scripts/check-admin-crud-live.mjs` so the future approval-gated live admin verifier exercises publish-then-archive transitions for public-facing tagged QA rows.
- The live plan now proves create/update/publish/archive more directly before the final anonymous browser-key invisibility check.
- Hardened `scripts/check-admin-crud-coverage.mjs` so source coverage fails if the live verifier drops the public-facing publish actions.
- Updated Harness docs to align the live admin verifier contract with the launch-critical non-destructive lifecycle.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode and now lists publish-then-archive public-facing QA checks.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Source/docs-only verifier hardening. No Supabase rows, Storage objects, Auth users, Cloudflare state, credentials, or live writes were created or changed.
- The publish-then-archive proof will only execute after browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged live admin QA writes exist.

### Next Handoff
- `NOW-ADMIN-CMS-001`
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-29 (Admin Archive Contract Verifier Guard)

### Scope
- Hardened `npm run agent:admin-crud-coverage` so it now checks the admin archive/removal contract in `docs/agent/tasks.json`, `docs/ADMIN_IA_ACCESS.md`, `docs/SUPABASE_SCHEMA.md`, and `scripts/check-admin-crud-live.mjs`.
- The verifier now fails if the launch-critical admin CMS acceptance drifts back toward physical-delete wording instead of create/update/publish/archive plus approval-gated destructive policy.
- Updated Harness docs that describe admin CRUD coverage.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:check`: pass.
- `npm run lint`: pass.
- `git diff --check`: pass.
- Supabase MCP read-only sanity: 10 migrations are present, 24/24 expected public launch tables have RLS enabled, 12 published finish definitions exist, one published default site settings row exists, and `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items` remain at 0 rows.

### Risks and Gaps
- Source/docs-only guard. No Supabase rows, Storage objects, Auth users, Cloudflare state, credentials, or live writes were created or changed.
- Live form/admin verification remains blocked by missing service-role key, browser-safe key, first admin email/profile/session, Cloudflare preview URL, and Jay approval for tagged writes.

### Next Handoff
- `NOW-ADMIN-CMS-001`
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-29 (Admin Archive/Delete Contract Alignment)

### Scope
- Aligned admin CMS task acceptance with the implemented launch removal model: create/update/publish/archive is in scope; physical delete controls remain approval-gated until Jay approves a retention/destructive-delete policy.
- Added the same non-destructive archive contract to the admin IA, Supabase schema, architecture, roadmap, and handoff docs so future live admin QA does not interpret CRUD as permission to delete production rows.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- `npm run agent:check`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `git diff --check`: pass.

### Risks and Gaps
- Docs-only contract alignment. No Supabase rows, Storage objects, Auth users, Cloudflare state, credentials, or live writes were created or changed.
- Live form/admin verification remains blocked by missing service-role key, browser-safe key, first admin email/profile/session, Cloudflare preview URL, and Jay approval for tagged writes.

### Next Handoff
- `NOW-ADMIN-CMS-001`
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-29 (Admin Storage Live Readiness Gate)

### Scope
- Added a distinct `npm run agent:live-readiness` check for the final media upload policy proof: `npm run agent:admin-crud-live -- --allow-writes --include-storage`.
- Hardened `npm run agent:cloudflare-readiness` so the Cloudflare deployment runbook must keep the Storage-inclusive admin live verification command.
- Updated Harness docs so media Storage upload proof is not hidden behind the general admin CRUD/audit live check.
- Corrected stale architecture risk wording that still implied broader admin content CRUD source screens were missing; the current blocker is live save verification, approved content import, and public read cutover.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-live-readiness.mjs`: pass.
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- `npm run agent:live-readiness -- --json`: pass and includes `admin-crud-live-storage`.
- `npm run agent:live-readiness`: pass in report-only mode and lists the new `Tagged admin media Storage upload policy` check as missing/manual-gated until browser-safe key, owner/admin session, and Jay approval exist.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:check`: pass.
- `npm run lint`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Source-only readiness hardening. No Supabase rows, Storage objects, Auth users, credentials, Cloudflare state, or live writes were created or changed.
- Final media upload proof still requires browser-safe Supabase config, a real owner/admin session, Jay approval for tagged admin QA writes, and `npm run agent:admin-crud-live -- --allow-writes --include-storage`.

### Next Handoff
- `NOW-ADMIN-MEDIA-LEADS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-05-29 (Cloudflare First Admin Approval Gate Guard)

### Scope
- Updated the Cloudflare deployment runbook so admin browser QA setup includes the guarded first-admin path:
  - read-only verify: `npm run agent:first-admin-bootstrap -- --verify-only --admin-email <first-admin-email>`;
  - write/invite path: `npm run agent:first-admin-bootstrap -- --allow-writes --admin-email <first-admin-email> --confirm-email <first-admin-email>` only after Jay approval.
- Hardened `npm run agent:cloudflare-readiness` so the runbook must retain `--first-admin-writes-approved`, the first-admin write command, and the Jay approval language.

### Changed Files
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-cloudflare-pages-readiness.mjs`

### Verification Results
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `npm run lint`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- Source-only runbook/readiness hardening. No Cloudflare project, DNS, secrets, Supabase users, profiles, rows, Storage objects, or live writes were created or changed.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (First Admin Write Readiness Gate)

### Scope
- Added a no-secret `npm run agent:live-readiness` check for the approval-gated first-admin profile/invite write path.
- The readiness report now separates read-only first-admin verification from `npm run agent:first-admin-bootstrap -- --allow-writes --admin-email <first-admin-email> --confirm-email <first-admin-email>`.
- Added `--first-admin-writes-approved` as a readiness-only manual gate flag; it does not replace service-role credentials, `--allow-writes`, or `--confirm-email`.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:live-readiness`: pass in report-only mode and now lists the first-admin profile/invite live write gate.
- `npm run agent:live-readiness -- --first-admin-writes-approved`: pass in report-only mode and clears only the first-admin manual gate while preserving missing credential/email reporting.
- `npm run agent:live-readiness -- --json --first-admin-writes-approved`: pass and exposes the new `first-admin-bootstrap-write` check in JSON output.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Supabase MCP read-only sanity: 10 migrations present, 24/24 expected launch tables have RLS enabled, 12 published finish definitions, one published default site settings row, and 0 rows in `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items`.

### Risks and Gaps
- Source-only readiness hardening. No Supabase users, profiles, rows, Storage objects, Cloudflare state, credentials, or live writes were created or changed.
- The first-admin live write path still requires Jay approval, a service-role key, `--allow-writes`, and matching `--confirm-email`.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-05-29 (Agent Init Forms Live Command)

### Scope
- Updated `npm run agent:init` output so the useful command list shows the write-gated live form verifier command: `npm run agent:forms-live -- --allow-writes`.
- This keeps the startup briefing aligned with the new forms live write-mode guard.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`
- `scripts/agent-init.sh`

### Verification Results
- `npm run agent:init`: pass and now lists `npm run agent:forms-live -- --allow-writes`.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Source-only Harness usability update. No live writes, credentials, or Cloudflare changes.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Forms Live Write-Mode Guard)

### Scope
- Hardened `scripts/check-forms-api-live.mjs` so live form verification refuses to create tagged Supabase rows unless `--allow-writes` is supplied.
- Updated `scripts/check-live-readiness.mjs` and `scripts/check-cloudflare-pages-readiness.mjs` so readiness and deployment docs point to the executable write-gated command forms.
- Updated Harness docs to make the live form proof require three separate conditions: Jay approval, `--allow-writes`, and the required Supabase credentials.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `scripts/check-forms-api-live.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `npm run agent:forms-live`: expected fail before Supabase calls because `--allow-writes` is absent.
- `npm run agent:live-readiness`: pass in report-only mode and now lists `--allow-writes` form commands plus the manual approval gate.
- `npm run agent:live-readiness -- --form-writes-approved`: pass in report-only mode and clears only the form approval gate while preserving missing credential reporting.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- This is source-only write-safety hardening. It does not verify live form persistence and creates no Supabase rows.
- Future live form verification must run with `npm run agent:forms-live -- --allow-writes` only after Jay approves tagged live form QA writes.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Cloudflare Runbook Approval Gate Guard)

### Scope
- Hardened `npm run agent:cloudflare-readiness` so the Cloudflare runbook must keep the manual approval gates for tagged live form and admin QA writes.
- The verifier now fails if `docs/CLOUDFLARE_DEPLOYMENT.md` drops `--form-writes-approved`, `--admin-writes-approved`, or the Jay approval language around those live-write checks.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-cloudflare-pages-readiness.mjs`

### Verification Results
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- Source-only readiness hardening. It does not create a Cloudflare preview, configure secrets, or run live Supabase writes.
- Live form/admin verification still waits for keys, first-admin/profile inputs, preview URL, and Jay approval.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Live Readiness Form Write Approval Gate)

### Scope
- Refined `npm run agent:live-readiness` so tagged live form QA writes are explicitly approval-gated before local/direct, deployed, or private-boundary form persistence checks are run.
- Added `--form-writes-approved` as the non-secret readiness flag for Jay approval, matching the existing admin live-write approval pattern.
- Updated Harness docs so future agents do not treat service-role credentials alone as sufficient permission to create tagged live enquiry/sample-request rows.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:live-readiness`: pass in report-only mode and reports the live form commands as manually gated until Jay approval is supplied.
- `npm run agent:live-readiness -- --form-writes-approved`: pass in report-only mode and clears only the form approval gate while preserving missing service-role/browser-safe credential reporting.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- This is a no-secret, no-write readiness hardening change only. It does not verify live form row creation.
- Live form persistence remains blocked until a server-side service-role key is configured and Jay approves tagged form QA writes.
- Final private-row proof still requires both service-role and browser-safe keys plus `npm run agent:forms-live -- --require-browser-boundary`.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Cloudflare Forms Boundary Runbook)

### Scope
- Updated `docs/CLOUDFLARE_DEPLOYMENT.md` so the Cloudflare preview/production handoff includes `npm run agent:forms-live -- --require-browser-boundary` after both service-role and browser-safe Supabase keys are configured.
- Strengthened `scripts/check-cloudflare-pages-readiness.mjs` so repo-side Cloudflare readiness fails if the deployment runbook drops that final private-row form proof command.
- No Supabase rows, Auth users, Storage objects, credentials, Cloudflare state, or live writes were created or changed.

### Changed Files
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-cloudflare-pages-readiness.mjs`

### Verification Results
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- This is a runbook/source readiness checkpoint only. It does not create a Cloudflare Pages project, configure environment variables, run deployed preview smoke, or submit live form rows.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`: create/verify the Pages preview URL, then run `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`.

## Entry - 2026-05-29 (Live Forms Private Lead Boundary)

### Scope
- Strengthened `scripts/check-forms-api-live.mjs` so live form verification checks created private enquiry, sample request, and sample item rows against anonymous browser-key reads whenever a browser-safe Supabase key is available.
- Added `--require-browser-boundary` so final launch proof can require `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY` in addition to the service-role key.
- Updated `scripts/check-live-readiness.mjs` to report readiness for `npm run agent:forms-live -- --require-browser-boundary`.
- No Supabase rows, Auth users, Storage objects, credentials, Cloudflare state, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-forms-api-live.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:live-readiness`: pass in report-only mode and now reports the missing inputs for `npm run agent:forms-live -- --require-browser-boundary`.
- `npm run agent:forms-live`: expected credential-gated fail before Supabase calls because no local service-role key is configured.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only no-write mode.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- Supabase MCP read-only private row count check: pass. `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items` remain at 0 rows.

### Risks and Gaps
- The private form-row browser-key boundary runs only after service-role and browser-safe keys are configured.
- Live form persistence, first-admin setup, active-admin browser QA, Storage upload, and Cloudflare preview smoke remain blocked by credential/account inputs.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live`, then `npm run agent:forms-live -- --require-browser-boundary`, after service-role and browser-safe keys are configured.

## Entry - 2026-05-29 (Admin CRUD Live Private Lead RLS Guard)

### Scope
- Strengthened `scripts/check-admin-crud-live.mjs` so the approval-gated live write verifier will also prove tagged private lead QA rows are not anonymously readable through browser-key access.
- The live run now checks tagged `enquiries`, `sample_requests`, and `sample_request_items` rows after authenticated RLS writes, accepting either zero visible rows or an expected deny response.
- Strengthened `scripts/check-admin-crud-coverage.mjs` so source coverage fails if the private-lead browser-key boundary guard is removed from the live verifier.
- No Supabase rows, Auth users, Storage objects, credentials, Cloudflare state, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only no-write mode and includes the private-lead browser-key boundary check in the printed live plan.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- Supabase MCP read-only private row count check: pass. `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items` remain at 0 rows.

### Risks and Gaps
- The new private-lead boundary check executes only in `--allow-writes` mode after browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged QA writes exist.
- Live form persistence, first-admin setup, active-admin browser QA, Storage upload, and Cloudflare preview smoke remain blocked by credential/account inputs.

### Next Handoff
- `NOW-ADMIN-CMS-001`: run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged live QA writes and a real owner/admin session exists.
- `NOW-FORMS-BACKEND-001`: configure service-role key and run `npm run agent:forms-live`.

## Entry - 2026-05-29 (Admin CRUD Live Public RLS Invisibility)

### Scope
- Strengthened `scripts/check-admin-crud-live.mjs` so the approval-gated live write verifier will also prove tagged public-content QA rows are not anonymously visible after they are left draft/archived.
- The live run now uses browser-key anonymous readback for tagged `site_settings`, `media_assets`, `stone_groups`, `products`, `projects`, and `articles` rows after authenticated RLS writes.
- Updated Harness docs so future live admin QA treats public invisibility as part of the tagged write proof, not a separate assumption.
- No Supabase rows, Auth users, Storage objects, credentials, Cloudflare state, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-live.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only no-write mode and includes the public-RLS invisibility check in the printed live plan.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- The new anonymous readback runs only in `--allow-writes` mode after browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged QA writes exist.
- Live form persistence, first-admin setup, active-admin browser QA, Storage upload, and Cloudflare preview smoke remain blocked by credential/account inputs.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`: run first-admin verify/bootstrap and active admin readiness after keys and first admin email are available.
- `NOW-ADMIN-CMS-001`: run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged live QA writes and a real owner/admin session exists.

## Entry - 2026-05-29 (Admin Readiness Browser-Key Boundary)

### Scope
- Strengthened `scripts/check-admin-live-readiness.mjs` so the read-only admin readiness gate now uses the configured browser-safe Supabase key, not just the service-role key.
- The runner now verifies published `site_settings` and `finish_definitions` are readable through the browser-key anonymous boundary, while `admin_profiles` returns no private rows or an expected deny response without an authenticated admin session.
- Updated Harness docs so future agents know `agent:admin-live-readiness` proves the browser-key public/private boundary before active-admin browser QA.
- No Supabase rows, Auth users, Storage objects, credentials, Cloudflare state, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-admin-live-readiness.mjs`: pass.
- `npm run agent:admin-live-readiness -- --admin-email first@example.com`: expected credential-gated fail before Supabase calls because browser-safe and service-role keys are not configured.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only no-write mode.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- The new browser-key boundary checks will execute only after `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY` and a service-role key are configured.
- Active-admin login, first-admin bootstrap, live form persistence, live admin CRUD writes, Storage upload, export audit rows, and Cloudflare preview smoke remain blocked by the same credential/account inputs.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: configure service-role key and run `npm run agent:forms-live`.
- `NOW-ADMIN-AUTH-RLS-001`: after first admin email and keys are available, run first-admin verify/bootstrap, then `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>`.
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`: run deployed preview smoke after a Cloudflare Pages preview URL exists.

## Entry - 2026-05-29 (Supabase Read-Only Launch Sanity)

### Scope
- Ran a read-only Supabase connector sanity pass against project `npkidywzwddbnfrnxlmo`.
- Verified the live project still matches the expected pre-credential launch state after the source-only admin/import verifier checkpoints.
- No migrations, SQL writes, table rows, Storage objects, Auth users, Cloudflare state, credentials, or local runtime source were changed.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`

### Verification Results
- Supabase migration list: pass. 10 launch migrations are present, ending with `security_definer_private_helpers`.
- Supabase table/RLS check: pass. 24 expected public launch tables exist and all 24 have RLS enabled.
- Supabase policy helper check: pass. 99 checked policy expressions use `private.has_admin_role(...)`; 0 use `public.has_admin_role(...)`.
- Supabase helper privilege check: pass. `anon` and `authenticated` have no direct routine privileges on exposed public admin helper functions.
- Supabase seed/private-row check: pass. 12 published `finish_definitions`, 1 published default `site_settings` row, and 0 rows in `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items`.
- Supabase Storage check: pass. `urblo-public-media` and `urblo-admin-media` buckets exist with expected public/private bucket posture, and four authenticated `storage.objects` policies are present.

### Risks and Gaps
- This checkpoint is read-only evidence. It does not verify live form persistence, first-admin setup, active-admin login, admin CRUD writes, Storage upload, audit row creation, or Cloudflare preview deployment.
- The live project intentionally still has zero private workflow rows because service-role form verification and first-admin bootstrap have not run.

### Next Handoff
- Continue source-only verification hardening while credentials are unavailable.
- Once credentials are available, run `npm run agent:forms-live`, first-admin verify/bootstrap, admin live readiness, and approval-gated tagged admin writes in the documented order.

## Entry - 2026-05-29 (Admin Article Structured Authoring Coverage)

### Scope
- Extended `scripts/check-admin-crud-coverage.mjs` so the admin source-only gate now explicitly verifies structured article authoring guardrails.
- The verifier checks that `/admin/articles` exposes every approved `article_blocks.block_type` from the schema as a block type option.
- The verifier fails if raw HTML/newsletter authoring helpers such as `dangerouslySetInnerHTML`, `rawHtml`, or newsletter HTML fields appear in `AdminArticlesPage`.
- The verifier also guards the existing JSON and published-block validation copy so published blocks continue requiring structured content rather than empty payloads.
- No runtime article rendering, Supabase rows, Storage objects, Cloudflare state, credentials, or approved article copy were changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API mock checks.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only verifier hardening. It does not prove live article save/publish flows, live audit rows, or active admin access.
- `/admin/articles` still uses a JSON editor for block content. That is acceptable for the current operational source screen, but final customer handoff may still need friendlier block-specific forms.
- Live admin article CRUD remains blocked until browser-safe Supabase config, a first admin profile, a real admin session, and Jay approval for tagged live writes exist.

### Next Handoff
- Continue source-only admin/import verifier hardening while credentials are unavailable.
- Run live article CRUD through `npm run agent:admin-crud-live -- --allow-writes` only after the approved credential/session path exists.

## Entry - 2026-05-29 (Public Supabase Article Block Readiness Guard)

### Scope
- Extended `scripts/check-public-supabase-readiness.mjs` so the public cutover gate now verifies the article structured import shape, not only draft/public-boundary status.
- The verifier now fails if `article_blocks` regress to one placeholder per article, if legacy placeholder migration status returns, if image blocks are missing or not linked to `media_assets`, if shared newsletter/social images leak in, or if newsletter footer/contact artifacts appear in block text.
- The verifier also checks rich-text claim-review metadata: rich text blocks need `claimReviewStatus`, and any block with `reviewFlags` must stay `needs_review`.
- No Supabase rows, Storage objects, Cloudflare state, credentials, public runtime code, or approved article copy were changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-public-supabase-readiness.mjs`

### Verification Results
- `node --check scripts/check-public-supabase-readiness.mjs`: pass.
- `npm run agent:content-import`: pass with 115 media candidates, 4 articles, 95 article blocks, 0 warnings, and 0 blockers.
- `npm run agent:content-import:apply-sql`: pass; generated ignored JSON, Markdown, preflight SQL, and guarded draft apply SQL artifacts.
- `npm run agent:public-supabase-readiness`: pass; it now reports 95 structured draft article blocks plus the existing draft-only/public-boundary checks.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API mock checks.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is a source-only regression guard. It does not apply import SQL, publish article blocks, create credentials, verify live admin saves, or migrate public article runtime to Supabase.
- Article source copy remains draft-only and claim-review gated. Do not treat extracted newsletter copy as approved public content without Jay/content review.
- Live completion still requires service-role form verification, first-admin/profile setup, browser-safe Supabase config, a real admin session, tagged admin write approval, and Cloudflare preview deployment.

### Next Handoff
- Continue source-only import/public-read preparation while credentials are unavailable.
- If credentials become available, run the existing live path in order: `npm run agent:forms-live`, first-admin readiness/bootstrap verification, admin live readiness, plan-only admin CRUD live verifier, then approval-gated tagged live writes.

## Entry - 2026-05-29 (Article Structured Import Draft Blocks)

### Scope
- Expanded `scripts/check-content-import-readiness.mjs` so the no-write static-to-Supabase import prepares draft structured article blocks from legacy newsletter HTML.
- The importer now extracts source-ordered `rich_text`, `image`, `cta`, and `project_spotlight` blocks, links image blocks to `media_assets` through `media_source_url`, and skips newsletter footer/contact/social artifacts.
- Claim-sensitive source text is not rewritten in this import path; it remains draft-only and carries `reviewFlags` plus `claimReviewStatus` metadata for later editorial review.
- No Supabase rows, Storage objects, Cloudflare state, credentials, public runtime code, or approved copy were changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-content-import-readiness.mjs`

### Verification Results
- `node --check scripts/check-content-import-readiness.mjs`: pass.
- `npm run agent:content-import`: pass with 115 media candidates, 4 articles, 95 article blocks, 0 warnings, and 0 blockers.
- `npm run agent:content-import -- --out .tmp/content-import-preview.json`: pass; local ignored review artifact confirms per-article block extraction and review flags.
- `npm run agent:content-import:apply-sql`: pass; generated ignored JSON, Markdown, preflight SQL, and guarded draft apply SQL artifacts.
- `npm run agent:public-supabase-readiness`: pass; import candidates remain draft-only and public runtime remains static/file-backed.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API mock checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Article source copy still needs editorial and claim review before publication; this checkpoint only prepares draft CMS-shaped rows.
- The generated apply SQL was not run against Supabase and remains approval-gated.
- Public article runtime still renders sanitized legacy HTML until a deliberate public-read migration is approved and verified.

### Next Handoff
- Continue source-only import/public-read preparation while credentials are unavailable.
- Do not publish imported article blocks or treat newsletter source copy as approved without Jay/content review.

## Entry - 2026-05-29 (Live Forms Notification Status Gate)

### Scope
- Tightened `scripts/check-forms-api-live.mjs` so future live form verification checks notification status consistency.
- Valid enquiry and sample-request live checks now assert that the response `notificationStatus` is final (`not_required`, `sent`, or `failed`) and matches the stored Supabase row's `notification_status`.
- This catches a failure where the lead row is created but the notification status patch silently fails.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-forms-api-live.mjs`

### Verification Results
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `npm run agent:forms-live`: expected credential-gated fail before Supabase calls because no local service-role key is configured.

### Risks and Gaps
- Live form persistence, live audit rows, and real notification delivery remain unverified until service-role and email environment variables are configured.
- The new assertion will run only when `npm run agent:forms-live` can make live submissions.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: configure the service-role key and run `npm run agent:forms-live`.
- `NOW-FORMS-SUPABASE-001`: add `--allow-email` or deployed email envs only when real notification delivery is intentionally being verified.

## Entry - 2026-05-29 (Forms Notification Mock Coverage)

### Scope
- Expanded `scripts/check-forms-api.mjs` so the no-secret Forms API gate covers configured Resend notification behavior.
- Added mocked enquiry notification success coverage: initial Supabase insert uses `notification_status = pending`, Resend is called with the configured enquiry recipient, and the row is patched to `sent`.
- Added mocked sample-request notification failure coverage: the visitor response still succeeds after the lead and sample item are stored, Resend failure is captured, and the row is patched to `failed`.
- No real Resend call, Supabase write, credential, or Cloudflare state change was performed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-forms-api.mjs`

### Verification Results
- `node --check scripts/check-forms-api.mjs`: pass.
- `node scripts/check-forms-api.mjs`: pass, including notification success/failure mocks.

### Risks and Gaps
- Live Supabase row creation remains unverified until `SUPABASE_SERVICE_ROLE_KEY` is configured.
- Real Resend delivery remains unverified until `RESEND_API_KEY`, sender, and recipient environment variables are configured in a controlled environment.
- Turnstile production verification remains staged but unverified until the Turnstile secret exists.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live` after service-role credentials exist.
- `NOW-FORMS-SUPABASE-001`: verify live persistence, real notification delivery, and admin-visible lead workflow after credentials and preview environment exist.

## Entry - 2026-05-29 (First Admin Bootstrap Runner)

### Scope
- Added `npm run agent:first-admin-bootstrap` as a guarded first-admin operational runner.
- Default mode prints the approved setup path and performs no Supabase calls, Auth invites, profile writes, or deletes.
- Added `--verify-only` for read-only service-role inspection of the Auth user, `admin_profiles` row, and baseline seed rows once Jay provides the first admin email and service-role key.
- Added live write mode guardrails: `--allow-writes` requires a matching `--confirm-email`; `--invite` is explicit; existing active owners block a new bootstrap unless `--allow-existing-owner` is intentional.
- Updated live readiness reporting and Harness docs so first-admin setup has a clear no-write, read-only, and approval-gated write path.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/bootstrap-first-admin.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/bootstrap-first-admin.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:first-admin-bootstrap`: pass; plan-only, no Supabase calls, invites, writes, or deletes attempted.
- `npm run agent:first-admin-bootstrap -- --verify-only --admin-email first@example.com`: expected fail-closed behavior because no service-role key is configured.
- `npm run agent:live-readiness`: pass in report-only mode and now reports the first-admin bootstrap verifier inputs.

### Risks and Gaps
- No first admin Auth user, profile row, invite, or credential was created in this checkpoint.
- Live first-admin bootstrap still requires Jay to confirm the email and approve write/invite mode, plus a service-role key in an untracked environment.
- Active-admin browser QA and admin CRUD live writes remain blocked until browser-safe keys, first-admin profile, admin session credentials, and write approval exist.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live` after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- `NOW-ADMIN-AUTH-RLS-001`: run `npm run agent:first-admin-bootstrap -- --verify-only --admin-email <first-admin-email>` after service-role key and first admin email are available; run write mode only after Jay approval.
- `NOW-ADMIN-CMS-001`: continue source-only content import/public-read preparation while credentials remain unavailable.

## Entry - 2026-05-29 (Stone Library Finish Image Import Payload)

### Scope
- Extended the static-to-Supabase content import dry run so Stone Library finish-specific imagery from `src/data/stoneFinishImages.ts` is represented as draft `stone_finish_images` rows.
- Added a TypeScript AST extractor for the static image map so Vite `import.meta.glob` runtime code is not executed by the Node import verifier.
- Added local `data/Product` media source validation, finish-image counts in the JSON/Markdown plan, read-only preflight SQL status/count checks, and guarded draft apply SQL inserts.
- Kept all imported finish image rows and linked media rows draft-only; no Supabase rows, Storage objects, Cloudflare state, credentials, or live admin writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-content-import-readiness.mjs`

### Verification Results
- `node --check scripts/check-content-import-readiness.mjs`: pass.
- `npm run agent:content-import`: pass with 104 media candidates, 13 stone groups, 15 stone variants, 153 finish capability rows, 53 stone finish image rows, 6 products, 28 product models, 18 product material defaults, 18 product specs, 5 projects, 41 project facts, 14 project media rows, 2 project materials, 1 material map, 2 hotspots, 4 articles, 4 article block placeholders, 0 warnings, and 0 blockers.
- `npm run agent:content-import:apply-sql`: pass and wrote ignored JSON, Markdown, preflight SQL, and guarded draft apply SQL artifacts.
- Static SQL artifact guard scan: pass. The generated apply SQL includes the approval guard, inserts `stone_finish_images`, has no `delete from`, `drop table`, or `truncate`, and has no `status = 'published'` import operation.
- `.tmp/` ignore check: pass. Generated import artifacts are ignored by Git.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API mock checks.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only mode; no Supabase writes, Storage uploads, or deletes were attempted.
- `npm run agent:live-readiness`: pass in report-only mode. It still reports missing service-role key, persistent browser-safe key env, first-admin email, admin session credentials, Jay approval for tagged live QA writes, and Cloudflare preview URL.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This checkpoint does not apply the generated import SQL to Supabase, publish content, create credentials, create a first admin, or verify live admin/form writes.
- The imported finish-image source URLs are local `data/Product` migration source locators; the rows remain draft until media is deliberately uploaded/approved through the CMS or a reviewed import path.
- Default/reference-only Stone Library imagery remains excluded from finish-specific `stone_finish_images` rows unless a later content decision maps it to a specific finish or media role.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live` after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- `NOW-ADMIN-AUTH-RLS-001`: run `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after browser-safe and service-role keys plus first-admin profile are available.
- `NOW-ADMIN-CONTENT-CRUD-001`: keep source-only import/public-read preparation moving while credentials remain unavailable; apply/import remains approval-gated.

## Entry - 2026-05-29 (Stone Library Finish Image Admin Source)

### Scope
- Expanded `/admin/stone-library` from group/variant/finish capability editing to include finish image links backed by `stone_finish_images`.
- The Stone Library admin screen now loads `media_assets`, lists finish image links for the selected stone group/variant, and lets active editor/admin/owner roles create, update, publish, and archive image links for selected variants and finishes.
- Published finish image links are guarded so they must reference a published media record.
- Added `stone_finish_image.create`, `stone_finish_image.update`, `stone_finish_image.publish`, and `stone_finish_image.archive` audit actions after successful primary saves.
- Updated admin source coverage and the plan-only live CRUD verifier so later credential-gated live runs include `stone_finish_images`.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`
- `src/pages/admin/AdminStoneLibraryPage.tsx`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass. Stone Library coverage now includes `stone_finish_images` and `media_assets`.
- `npm run agent:admin-crud-live`: pass in plan-only mode; no Supabase writes, Storage uploads, or deletes were attempted.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API mock checks.
- `npm run agent:live-readiness`: pass in report-only mode. It still reports missing service-role key, persistent browser-safe key env, first-admin email, admin session credentials, Jay approval for tagged live QA writes, and Cloudflare preview URL.
- `npm run agent:cloudflare-readiness`: pass.
- Playwright Firefox rendered check on `http://127.0.0.1:5182/admin/stone-library`: pass. With no browser-safe Supabase key configured, the route shows the configuration-required auth state, hides Stone Library private content including the new finish-image surface, suppresses WelcomePopup content, and reports 0 browser console warnings/errors.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This checkpoint is source-only. It does not verify live Stone Library saves, live media upload, live finish-image publish/archive, or audit row creation because browser-safe Supabase config and an active admin/editor profile are still missing.
- Static-to-Supabase content import still prepares media candidates and Stone Library records as draft review material; applying/importing production rows still requires Jay approval and the credential path.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live` after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- `NOW-ADMIN-AUTH-RLS-001`: run `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after browser-safe and service-role keys plus first-admin profile are available.
- `NOW-ADMIN-CONTENT-CRUD-001`: continue source-only content import/public-read preparation if credentials remain unavailable; run live Stone Library image-link verification only after browser-safe config and an active admin/editor profile exist.

## Entry - 2026-05-29 (Guarded Content Import Apply SQL)

### Scope
- Added `--apply-sql-out` support to `scripts/check-content-import-readiness.mjs`.
- Added `npm run agent:content-import:apply-sql` to write the ignored `.tmp/content-import-preview.json`, `.tmp/content-import-plan.md`, `.tmp/content-import-preflight.sql`, and `.tmp/content-import-apply.sql` review bundle in one command.
- The generated apply SQL is guarded: it aborts unless `urblo.import_approved=true` is explicitly set inside the transaction, imports static content candidates as `draft`, and is intended for review after Jay approves the import scope.
- Updated Harness docs to distinguish the generated SQL artifact from an approved production import.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-content-import-readiness.mjs`

### Verification Results
- `node --check scripts/check-content-import-readiness.mjs`: pass.
- `npm run agent:content-import`: pass with 51 media candidates, 13 stone groups, 15 stone variants, 153 finish capability rows, 6 products, 28 product models, 18 product material defaults, 18 product specs, 5 projects, 41 project facts, 14 project media rows, 2 project materials, 1 material map, 2 hotspots, 4 articles, 4 article block placeholders, 0 warnings, and 0 blockers.
- `npm run agent:content-import:apply-sql`: pass and wrote ignored JSON, Markdown, preflight SQL, and guarded draft apply SQL artifacts.
- Static SQL artifact guard scan: pass. The generated apply SQL includes the approval guard, has no `delete from`, `drop table`, or `truncate`, and has no `status = 'published'` import operation.
- `.tmp/` ignore check: pass. Generated import artifacts are ignored by Git.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API mock checks.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode. It still reports missing service-role key, persistent browser-safe key env, first-admin email, admin session credentials, Jay approval for tagged live QA writes, and Cloudflare preview URL.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This checkpoint does not apply the generated import SQL to Supabase, publish content, create credentials, create a first admin, or verify live admin/form writes.
- The apply SQL should not be run until Jay approves import scope and the correct credential/environment path is confirmed.
- Article block rows remain draft placeholders that flag legacy newsletter content for structured review; article claim cleanup remains paused until explicitly resumed.

### Next Handoff
- Continue live form persistence after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- Continue live admin readiness after browser-safe Supabase config, service-role verification access, and first-admin email/profile are available.
- Use `npm run agent:content-import:apply-sql` only as a review artifact generator until Jay approves applying draft rows.

## Entry - 2026-05-29 (Supabase Private Helper Hardening)

### Scope
- Added and applied the `security_definer_private_helpers` Supabase migration.
- Moved admin-role RLS helper usage to `private.has_admin_role(...)` in a non-exposed schema and revoked exposed `public.current_admin_role()` / `public.has_admin_role(text[])` execution from browser roles.
- Rewrote public-table and Storage policies that previously called the public helper so they now call the private helper.
- Ran read-only Supabase advisor and policy/privilege checks to verify the hardening did not break public reads.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `supabase/migrations/README.md`
- `supabase/migrations/202605290001_security_definer_private_helpers.sql`

### Verification Results
- Supabase migration list: pass. `security_definer_private_helpers` is listed on project `npkidywzwddbnfrnxlmo`.
- Supabase security advisor: pass. 0 security lints after the helper migration.
- Supabase policy inspection: pass. 99 policies call `private.has_admin_role(...)`; 0 policies call `public.has_admin_role(...)`.
- Supabase privilege inspection: pass. `authenticated` cannot execute `public.current_admin_role()` or `public.has_admin_role(text[])`; `anon` cannot execute either public or private admin-role helper; `authenticated` can execute the private helpers used by RLS/Storage policies.
- Supabase role-read checks: pass. Role `anon` can still read 1 published `site_settings` row and 12 published `finish_definitions`; role `authenticated` without a JWT sees those public rows and 0 `admin_profiles`.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API mock checks.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:live-readiness`: pass in report-only mode. It still reports missing service-role key, persistent browser-safe key env, first-admin email, admin session credentials, Jay approval for tagged live QA writes, and Cloudflare preview URL.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only mode. No Supabase writes, Storage uploads, or deletes were attempted.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Changed-file secret pattern scan: pass.

### Risks and Gaps
- This is non-destructive schema hardening. It does not create a first admin, verify active admin login, run CRUD writes, verify live form persistence, upload Storage objects, or touch Cloudflare.
- Supabase performance advisor still reports expected INFO/WARN items for unused indexes and multiple permissive policies on new/low-traffic tables. Those are not launch blockers yet; do not remove launch-pattern indexes before real traffic/import/live admin usage exists.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live` after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- `NOW-ADMIN-AUTH-RLS-001`: run `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after browser-safe and service-role keys plus first-admin profile are available.
- `NOW-ADMIN-CMS-001`: run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged QA writes and a real owner/admin session exists.

## Entry - 2026-05-29 (Admin Browser-Key Unauthenticated Gate)

### Scope
- Verified the admin shell with a real browser-safe Supabase publishable key supplied only through the local shell environment.
- Confirmed the configured-key unauthenticated state now shows the Supabase Auth login form instead of the configuration-required state.
- Confirmed unauthenticated direct visits to protected admin routes redirect to `/admin/login` with the intended `next` parameter and do not render private module content.
- No Supabase data was queried or mutated beyond normal unauthenticated Auth/session checks, no first-admin/profile changes were made, no live writes were run, and no key was written to `.env` files or committed.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Supabase changelog scan: pass. Current relevant breaking-change note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint performs no schema/API exposure change.
- Supabase connector read-only sanity: pass. Nine launch migrations remain listed on project `npkidywzwddbnfrnxlmo`, and checked core public tables report RLS enabled.
- Temporary Vite dev server with shell-only `VITE_SUPABASE_PUBLISHABLE_KEY`: pass.
- Playwright CLI with Firefox on `http://127.0.0.1:5177/admin`: pass. URL resolves to `/admin/login?next=%2Fadmin`, renders the `Admin login` form, does not show the configuration-required state, and does not render dashboard launch checks.
- Playwright CLI with Firefox on `http://127.0.0.1:5177/admin/media`: pass. URL resolves to `/admin/login?next=%2Fadmin%2Fmedia`, renders the `Admin login` form, and does not render Media Library private content.
- Playwright console inspection: pass. 0 errors and 0 warnings; only React DevTools info appears.
- `npm run agent:live-readiness`: pass in report-only mode. It still reports missing service-role key, persistent browser-safe key env, first-admin email, admin session credentials, Jay approval for tagged live QA writes, and Cloudflare preview URL.

### Risks and Gaps
- This proves the configured-key unauthenticated gate only. It does not prove active admin login, unprofiled-user unauthorized state, admin profile readiness, CRUD writes, media upload/export, lead workflow, or audit row creation.
- Persistent local/Cloudflare browser-safe Supabase env configuration is still pending; the key was used only for this local no-write check.
- First-admin email/profile, service-role key, real owner/admin session, Cloudflare preview URL, and Jay approval for tagged live QA writes remain required for the next live gates.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live` after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- `NOW-ADMIN-AUTH-RLS-001`: run `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after browser-safe and service-role keys plus first-admin profile are available.
- `NOW-ADMIN-CMS-001`: run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged QA writes and a real owner/admin session exists.

## Entry - 2026-05-28 (Live Readiness Non-Secret Overrides)

### Scope
- Refined `npm run agent:live-readiness` so non-secret manual inputs can be represented directly in the audit.
- Added support for `--base-url <origin>`, `--admin-email <email>`, and `--admin-writes-approved`.
- Kept secret-bearing inputs out of CLI flags: service-role keys, browser keys, and admin sessions still come only from env files or the shell.
- No Supabase queries, Supabase mutations, Cloudflare account changes, DNS changes, live writes, or credential storage were performed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:live-readiness`: pass in report-only mode, preserving the missing-input report when no env files are present.
- `npm run agent:live-readiness -- --base-url <preview-origin> --admin-email <first-admin-email> --admin-writes-approved`: pass in report-only mode. It marks the non-secret preview URL, admin email, and approval flag as present without printing those values, and still reports missing service-role/browser/admin-session inputs.
- `npm run agent:live-readiness -- --base-url <preview-origin> --admin-email <first-admin-email> --admin-writes-approved --strict`: expected fail because the service-role key, browser-safe key, and admin session credentials are still missing.

### Risks and Gaps
- `--admin-writes-approved` is only a readiness accounting flag. It does not run writes, create sessions, or replace Jay's actual approval requirement before `npm run agent:admin-crud-live -- --allow-writes`.
- This refinement still does not provide service-role credentials, browser-safe Supabase key configuration, first-admin profile setup, or Cloudflare preview deployment.

### Next Handoff
- Continue with `npm run agent:forms-live`, `npm run agent:admin-live-readiness`, `npm run agent:admin-crud-live -- --allow-writes`, and `npm run agent:cloudflare-preview-smoke` only after their required inputs exist and approvals are satisfied.

## Entry - 2026-05-28 (Live Verification Readiness Audit Runner)

### Scope
- Added `npm run agent:live-readiness` as a no-secret audit for the live inputs needed by form persistence, deployed form verification, first-admin readiness, tagged admin CRUD/audit writes, and Cloudflare preview smoke.
- Added optional local preview URL helper variables to `.env.example`.
- Updated Harness, architecture, Cloudflare, task, roadmap, and startup docs so this runner is visible before credential-gated checks.
- No Supabase queries, Supabase mutations, Cloudflare project changes, DNS changes, live writes, or credential handling were performed.

### Changed Files
- `.env.example`
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:init`: pass and lists `npm run agent:live-readiness`.
- `npm run agent:live-readiness`: pass in report-only mode. With no env files found, it reports missing service-role key, preview URL, browser-safe Supabase key, first-admin email, admin session credentials, and Jay approval for tagged live QA writes.
- `npm run agent:live-readiness -- --json`: pass.
- `npm run agent:live-readiness -- --strict`: expected fail. Strict mode exits non-zero when the same live inputs are missing or manually gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only mode; no writes, Storage uploads, or deletes were attempted.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, critical CTA contracts, redirects, and Forms API mock checks.

### Risks and Gaps
- This checkpoint improves live-verification ergonomics but does not replace credential-gated live checks.
- Live form persistence still needs `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_SERVICE_KEY`.
- Admin readiness still needs a browser-safe Supabase key, service-role verification key, and Jay-confirmed first-admin email/profile.
- Tagged admin CRUD/audit live writes still need a real owner/admin session and Jay approval.
- Cloudflare preview smoke still needs a Pages preview URL or explicit `--base-url`.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live` after service-role credentials are configured.
- `NOW-ADMIN-AUTH-RLS-001`: run `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after browser/service keys and first-admin profile are available.
- `NOW-ADMIN-CMS-001`: run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged QA writes and a real owner/admin session exists.

## Entry - 2026-05-28 (Post-Alignment Baseline Verification)

### Scope
- Re-ran source/no-write, runtime, and credential-gated readiness checks after the Harness alignment and generated-artifact ignore commits.
- Verified the current blocker remains missing live credentials/account state, not source coverage.
- Queried Supabase through the connector in read-only mode to confirm migration/RLS/row-count posture after this checkpoint.
- No runtime source, Supabase schema/data, Cloudflare account state, credentials, or live content was changed.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`

### Verification Results
- `git status --short`: clean before recording this entry.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only mode; no writes, Storage uploads, or deletes were attempted.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- Supabase connector read-only sanity: pass. Nine launch migrations are present, latest migration is `security_definer_function_grants`, 12 checked core tables have RLS enabled, private workflow rows remain 0, `finish_definitions` remains 12, and `site_settings` remains 1.
- `npm run agent:forms-live`: expected credential-gated fail on missing `SUPABASE_SERVICE_ROLE_KEY`.
- `npm run agent:admin-live-readiness`: expected credential-gated fail on missing browser-safe Supabase key, service-role key, and first-admin email.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, critical CTAs, redirects, and Forms API mock checks.

### Risks and Gaps
- The active goal is not complete. Live form persistence, live admin auth/profile readiness, tagged admin CRUD/audit writes, live media upload/export, live lead workflow/export, Cloudflare preview smoke, deployed form verification, and production DNS/cutover remain unverified.
- Advancing those live checks requires server-side Supabase credentials, browser-safe Supabase configuration, first-admin details, Cloudflare preview/account state, and Jay approval for tagged admin QA writes where applicable.

### Next Handoff
- Configure `SUPABASE_SERVICE_ROLE_KEY`, then run `npm run agent:forms-live` locally and against Cloudflare preview when available.
- Configure browser-safe Supabase key and confirm first admin email/profile, then run `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>`.
- Run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged QA writes and a real owner/admin session exists.

## Entry - 2026-05-28 (Generated Test Artifact Ignore)

### Scope
- Added generated Playwright/test artifact directories to `.gitignore` so local verification output does not leave the goal worktree dirty.
- Existing `test-results/` files were not deleted or modified.
- No runtime source, Supabase data, Cloudflare state, credentials, or public content was changed.

### Changed Files
- `.gitignore`
- `docs/WORKLOG.md`

### Verification Results
- `git status --short`: after the ignore update, only the intended `.gitignore` and `docs/WORKLOG.md` edits remained visible before commit.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is repository hygiene only. It does not advance live credential-gated form/admin verification.

### Next Handoff
- Continue with credential-gated form/admin live checks when keys and first-admin details are available, or continue source-only readiness work if credentials remain unavailable.

## Entry - 2026-05-28 (Forms Current-State Harness Alignment)

### Scope
- Corrected current-state Harness wording that still implied Contact and Sample Request main submit behavior was mailto/local-only.
- Aligned `AGENTS.md`, `docs/HANDOFF.md`, `docs/ARCHITECTURE.md`, `docs/NEXT_STEPS.md`, and `docs/agent/tasks.json` with current source reality: Contact and Sample Request now post to Pages Functions, while production persistence still awaits service-role environment verification.
- Clarified that direct email/phone links remain manual contact channels, not the primary form submit path.
- Clarified that public content runtime is still static/file-backed until content import and public read migration are explicitly approved/applied, even though source CRUD screens now exist.
- No runtime source, Supabase schema/data, Cloudflare account state, credentials, or live content was changed.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:init`: pass. It showed this docs-only working tree plus an unrelated untracked `test-results/` directory.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates were intentionally skipped because this checkpoint only changes Harness/current-state documentation.

### Risks and Gaps
- This does not prove live form persistence, email notification, first-admin access, admin live writes, media upload/export, lead workflow, or Cloudflare preview behavior.
- The active goal remains incomplete until credential-gated live checks and approved QA writes pass.

### Next Handoff
- Continue `NOW-FORMS-BACKEND-001` with `npm run agent:forms-live` after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- Continue `NOW-ADMIN-AUTH-RLS-001` with `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after browser-safe/service keys and first-admin profile details are available.
- Run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged QA writes and a real owner/admin session exists.

## Entry - 2026-05-28 (Goal Resume Readiness Audit)

### Scope
- Resumed the active `/admin` CMS goal from the current worktree instead of relying on previous session memory.
- Re-read the Harness in the required order and ran no-write source/external readiness checks for the implemented admin, Cloudflare, public Supabase, and live credential gates.
- Confirmed the current blocker remains credentials/account state, not source coverage: live form persistence needs a server-side service-role key; live admin readiness needs a browser-safe Supabase key, service-role verification key, and first-admin email/profile.
- No runtime source, Supabase schema, Supabase data, Cloudflare account state, or live content was changed.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run agent:init`: pass. Branch reported clean and tracking `origin/main`.
- `npm run agent:admin-crud-coverage`: pass. Covered Dashboard, Settings/admin profiles, Media, Stone Library, Projects, Products, Articles, Leads, and Audit source/table/audit/export coverage.
- `npm run agent:admin-crud-live`: pass in plan-only mode. No writes, Storage uploads, or deletes were attempted.
- `npm run agent:cloudflare-readiness`: pass. Repo-side Pages build contract, SPA fallback, Function routing scope, headers, API handlers, env placeholders, and deployment runbook remain valid.
- `npm run agent:public-supabase-readiness`: pass. Import candidates remain draft-only, public RLS source remains published-only, anonymous grants remain read-only, public runtime remains static/file-backed, and Functions stay scoped to `/api/*`.
- Supabase connector migration sanity: pass. Nine launch migrations are listed on project `npkidywzwddbnfrnxlmo`.
- Supabase connector RLS sanity: pass. The checked core public tables all report RLS enabled.
- Supabase connector row-count sanity: pass. `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items` remain 0; `finish_definitions` remains 12; `site_settings` remains 1.
- `npm run agent:forms-live`: expected credential-gated fail. It stops on missing `SUPABASE_SERVICE_ROLE_KEY` before live form verification.
- `npm run agent:admin-live-readiness`: expected credential-gated fail. It stops on missing browser-safe Supabase key, service-role key, and first-admin email.

### Risks and Gaps
- The goal is not complete. Live form persistence, live admin auth/profile readiness, live admin CRUD/audit writes, live media upload/export, live lead workflow/export, Cloudflare preview smoke, and deployed form verification still require external credentials/account state and Jay approvals.
- No tagged QA writes were run, and no first-admin/profile changes were made.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification with `npm run agent:forms-live` after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- `NOW-ADMIN-AUTH-RLS-001` live admin readiness with `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after browser-safe and service-role keys plus first-admin profile are available.
- `NOW-ADMIN-CMS-001` live tagged CRUD/audit verification with `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged QA writes and a real owner/admin session exists.

## Entry - 2026-05-28 (Admin Scaffold Cleanup)

### Scope
- Removed the retired `AdminModulePage` scaffold component now that all launch-critical admin modules have real source screens.
- Removed unused `scaffold` / `locked` module state branches from `adminContent`, `AdminShell`, and the dashboard rollout list.
- Updated admin CRUD coverage so the retired scaffold component cannot reappear unnoticed and the dashboard shows each module as `Source ready`.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `src/pages/admin/AdminDashboardPage.tsx`
- `src/pages/admin/AdminShell.tsx`
- `src/pages/admin/adminContent.ts`
- Deleted the retired admin module scaffold component.

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/*` route shells.
- `npm run agent:admin-crud-coverage`: pass. The runner now fails if the retired scaffold component reappears.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is a source cleanup only. It does not prove live admin login, live RLS writes, live audit rows, or Supabase-backed form persistence.

### Next Handoff
- `NOW-ADMIN-CMS-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-28 (Cloudflare Preview Smoke Runner)

### Scope
- Added `scripts/check-cloudflare-preview-smoke.mjs` as a no-secret HTTP verifier for deployed Cloudflare Pages preview URLs.
- Added `npm run agent:cloudflare-preview-smoke`.
- The runner verifies direct-refresh public/admin route shells, unknown-route fallback shell, deployed `/assets/*`, legacy product/article redirects, and no-write API safe-failure behavior for `/api/enquiries` and `/api/sample-requests`.
- Local Vite preview URLs are supported for script validation; Cloudflare-only redirect and Function checks are skipped on local hosts.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `scripts/check-cloudflare-preview-smoke.mjs`

### Verification Results
- Cloudflare docs check: pass. Current Pages documentation confirms `_redirects`-based routing and Pages Functions routing remain relevant for this preview smoke scope.
- `node --check scripts/check-cloudflare-preview-smoke.mjs`: pass.
- `npm run agent:cloudflare-preview-smoke -- --base-url http://127.0.0.1:4184`: pass against local Vite preview. Verified public/admin route shells, unknown-route fallback shell, and asset references. Redirect and Function checks were skipped because the base URL was local.

### Risks and Gaps
- This does not create a Cloudflare Pages project, deploy a preview, configure environment variables, validate production DNS, or prove live Supabase row creation.
- Cloudflare-only redirect and Function checks still need to run against the real `*.pages.dev` URL.
- Valid form persistence still requires `npm run agent:forms-live -- --base-url https://<preview>.pages.dev` after server-side `SUPABASE_SERVICE_ROLE_KEY` is configured.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-28 (Public Supabase Readiness Runner)

### Scope
- Tightened `scripts/check-content-import-readiness.mjs` so status-bearing static-to-Supabase import candidates stay `draft`, including Stone Library rows that previously inherited current public active/TBC source status.
- Added `scripts/check-public-supabase-readiness.mjs` and `npm run agent:public-supabase-readiness` as a no-write source verifier for public Supabase cutover preparation.
- The new runner verifies zero content import warnings/blockers, draft-only import statuses, local media availability, published-only public RLS policy source, read-only anonymous grants, static public runtime boundaries, Cloudflare SPA fallback, and `/api/*` Function routing scope.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-content-import-readiness.mjs`
- `scripts/check-public-supabase-readiness.mjs`

### Verification Results
- Supabase changelog check: pass. The recent Data API exposure breaking change remains relevant and is covered by explicit grants/RLS checks; no live schema or Data API exposure change was made.
- Supabase RLS documentation check: pass. The runner follows the documented exposed-schema posture by checking RLS/policy/grant source for public content tables before any browser-readable cutover.
- `node --check scripts/check-public-supabase-readiness.mjs`: pass.
- `npm run agent:content-import`: pass. Prepared 51 media candidates, 13 stone groups, 15 stone variants, 153 finish capability rows, 6 products, 28 product models, 5 projects, 4 articles, 0 warnings, and 0 blockers.
- `npm run agent:public-supabase-readiness`: pass. Verified 13 stone groups, 6 products, 5 projects, and 4 articles remain draft in the import dry run, plus published-only public RLS policy source, read-only anonymous grants, static public runtime boundary, Cloudflare SPA fallback, and `/api/*` Function routing scope.
- `npm run agent:content-import:preflight-sql`: pass. Wrote local ignored JSON, Markdown, and SQL review artifacts.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- Supabase connector read-only sanity: pass. Nine launch migrations are present, 24 public tables have RLS enabled, private workflow rows remain 0, finish definitions remain 12, and site settings remains 1.
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/*` route shells and Forms API mock checks.

### Risks and Gaps
- This is still no-write source verification. It does not apply imported rows, prove live browser-key reads, verify admin save flows, or replace `npm run agent:forms-live` / `npm run agent:admin-crud-live -- --allow-writes`.
- Public Projects, Stone Library, Products, and Articles remain file-backed until Jay approves content import scope and public read migration.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification with `npm run agent:forms-live` after credentials are configured.
- `NOW-ADMIN-AUTH-RLS-001` live admin profile readiness and browser QA after first-admin email/profile and browser-safe keys are available.
- `NOW-ADMIN-CONTENT-CRUD-001` approved content import/apply and public read migration only after live admin access and content scope are confirmed.

## Entry - 2026-05-28 (Admin CRUD Live Verifier)

### Scope
- Added `scripts/check-admin-crud-live.mjs` as a credential-gated live write verifier for the implemented `/admin` CMS.
- Added `npm run agent:admin-crud-live` and listed it in `npm run agent:init`.
- Default mode is plan-only and performs no Supabase writes, Storage uploads, or deletes.
- Live mode requires `--allow-writes`, a browser-safe Supabase key, and a real owner/admin Supabase Auth session through `URBLO_ADMIN_ACCESS_TOKEN` or `URBLO_ADMIN_EMAIL`/`URBLO_ADMIN_PASSWORD`.
- The live flow is designed to create tagged draft/archived QA rows across Settings, Media, Stone Library, Projects, Products, Articles, private lead workflow rows, and export audit actions through browser-key RLS. Optional `--include-storage` uploads a tiny private `urblo-admin-media` object.

### Changed Files
- `.env.example`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-admin-crud-live.mjs`

### Verification Results
- Supabase changelog check: pass. The relevant recent Data API exposure change is already covered by existing grants/RLS posture; no new schema or Data API exposure change was made.
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only mode. It reported missing local admin credentials and performed no writes.
- `npm run agent:admin-crud-coverage`: pass. Existing admin source route/module/table/action/export coverage remains green.
- `npm run agent:cloudflare-readiness`: pass. Cloudflare Pages build contract, SPA fallback, Function routing scope, headers, API handlers, env placeholders, and deployment runbook remain valid after documentation updates.
- Supabase migration list: pass. The nine applied launch migrations are still present on project `npkidywzwddbnfrnxlmo`.
- Supabase RLS sanity: pass. All 24 public launch tables report `relrowsecurity = true`.
- Supabase private workflow row-count sanity: pass. `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items` remain at 0 rows after plan-only verification; `finish_definitions` remains 12 and `site_settings` remains 1.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/*` route shells and Forms API mock checks.

### Risks and Gaps
- Live admin writes remain unverified until browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged QA writes are available.
- The live verifier intentionally does not create or change first-admin profile rows and intentionally does not physically delete tagged QA rows.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-CMS-001` live tagged CRUD/audit verification with `npm run agent:admin-crud-live -- --allow-writes`.
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.

## Entry - 2026-05-28 (Cloudflare Pages Readiness Runner)

### Scope
- Added `scripts/check-cloudflare-pages-readiness.mjs` as a no-secret repo-side Cloudflare Pages verifier.
- Added `npm run agent:cloudflare-readiness` and listed it in `npm run agent:init`.
- The runner checks the Cloudflare Pages build command, Vite root base, SPA fallback, `/api/*` Function routing scope, launch headers, Pages Function handler files, environment placeholders, and `docs/CLOUDFLARE_DEPLOYMENT.md`.
- It does not create a Cloudflare Pages project, set environment variables, validate a preview URL, change a custom domain, or touch DNS.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-cloudflare-pages-readiness.mjs`

### Verification Results
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `npm run agent:cloudflare-readiness`: pass. Verified build contract, SPA fallback, Function routing scope, headers, API handlers, env placeholders, and deployment runbook.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/*` route shells and Forms API mock checks.

### Risks and Gaps
- Cloudflare Pages project creation, preview deployment validation, production environment variables, custom domain, DNS cutover, and rollback still require account-level access and confirmation.
- Form persistence still depends on server-side `SUPABASE_SERVICE_ROLE_KEY` configuration before deployed Pages endpoint verification can pass.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001` account-level Pages setup after Jay confirms the Cloudflare account/project path.
- `NOW-FORMS-BACKEND-001` live form persistence/audit verification with `npm run agent:forms-live` after credentials are configured.

## Entry - 2026-05-28 (Admin CRUD Coverage Runner)

### Scope
- Added `scripts/check-admin-crud-coverage.mjs` as a no-secret source coverage verifier for the implemented `/admin` CMS.
- Added `npm run agent:admin-crud-coverage` and listed it in `npm run agent:init`.
- The runner checks `/admin` route registration, active module registration, `RequireAdmin` access states, browser-key-only Supabase client wiring, launch-critical table references, role-gated controls, publish/archive paths, shared admin audit writer actions, and audit-gated Media/Leads exports.
- It does not mutate Supabase and does not replace live browser QA with a configured admin profile.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass. Covered Dashboard, Settings/admin profiles, Media, Stone Library, Projects, Products, Articles, Leads, and Audit table/action coverage.
- Supabase connector read-only sanity check: pass. The nine applied launch migrations are still present, 24 public tables have RLS enabled, live private workflow counts remain 0 admin profiles / 0 audit events / 0 enquiries / 0 sample requests / 0 sample items, and baseline seeds remain 12 finish definitions plus 1 site settings row.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/*` route shells and Forms API mock checks.

### Risks and Gaps
- Live admin save/upload/export/audit verification still requires browser-safe Supabase config and active admin profiles.
- The runner proves source coverage only; it cannot prove RLS write success or browser session behavior without credentials.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001` live admin profile readiness with `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after credentials are configured.
- `NOW-FORMS-BACKEND-001` live form persistence/audit verification with `npm run agent:forms-live`.

## Entry - 2026-05-28 (Admin Live Readiness Runner)

### Scope
- Added `scripts/check-admin-live-readiness.mjs` as a non-mutating readiness runner before live `/admin` browser QA.
- Added `npm run agent:admin-live-readiness`.
- The runner loads `.env.local`, `.env`, `.dev.vars`, and shell values; requires a browser-safe Supabase key, a service-role verification key, and a first-admin email.
- It verifies one active `admin_profiles` row for the named email, checks the required role, and confirms baseline `site_settings` and `finish_definitions` seed rows.
- It does not create Supabase Auth users, create/update admin profile rows, mutate content, or delete rows.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-admin-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-admin-live-readiness.mjs`: pass.
- `npm run agent:admin-live-readiness`: expected credential-gated fail. No local browser-safe key, service-role key, or first-admin email is configured, and the command stops before any Supabase calls.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('json ok')"`: pass.
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/*` route shells and Forms API mock checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live admin auth/profile verification is still unverified until Jay confirms the first admin email and browser-safe/service-role keys are configured.
- First admin bootstrap still must happen outside this runner. Creating or changing admin profiles requires Jay confirmation because it changes access control.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001` live admin profile readiness with `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after credentials are configured.
- `NOW-FORMS-BACKEND-001` live form persistence/audit verification with `npm run agent:forms-live`.

## Entry - 2026-05-28 (Live Forms Verification Runner)

### Scope
- Added `scripts/check-forms-api-live.mjs` as a credential-gated live verification runner for Contact and Sample Request persistence.
- Added `npm run agent:forms-live`.
- The runner supports direct handler verification by default and deployed endpoint verification with `--base-url`.
- It verifies valid enquiry rows, valid sample request rows, sample item rows, server-side audit rows, invalid enquiry no-write behavior, and invalid sample-request no-write behavior once a service-role key is configured.
- It intentionally fails when `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_SERVICE_KEY` is absent and keeps tagged test rows for auditability until Jay approves cleanup.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-forms-api-live.mjs`

### Verification Results
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('json ok')"`: pass.
- `npm run agent:forms-live`: expected credential-gated fail. No local secret file is present, and the command stops with missing `SUPABASE_SERVICE_ROLE_KEY` before any Supabase calls.
- Supabase connector pre-check: pass. Current live counts remain 0 admin profiles, 0 audit events, 0 enquiries, 0 sample requests, 0 sample request items, 12 finish definitions, and 1 site settings row.
- Supabase connector migration check: pass. Applied migrations still include foundation, hardening, anon read-only, baseline seed, admin settings/profile hardening, SECURITY DEFINER grant hardening, and media Storage migrations.
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/*` route shells and Forms API mock checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live form persistence is still unverified until a real server-side service-role key is configured locally or in Cloudflare Pages.
- The live runner creates tagged test rows by design and does not delete them automatically; cleanup requires Jay approval because it is a destructive database action.
- Turnstile and Resend production behavior remain staged; use `--turnstile-token` or `--allow-email` only when those checks are intentionally being exercised.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification with `npm run agent:forms-live` after credentials are configured.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification after browser-safe Supabase key and first admin profile are available.

## Entry - 2026-05-28 (Form Environment Example and Alias Docs)

### Scope
- Updated `.env.example` so local/Cloudflare configuration shows the server-side `SUPABASE_URL` plus supported compatibility aliases used by the Pages Function source.
- Updated `docs/CLOUDFLARE_DEPLOYMENT.md` and `docs/ARCHITECTURE.md` to distinguish canonical environment variable names from compatibility aliases.
- No secrets were added; all values remain blank placeholders except the public/project Supabase URL.

### Changed Files
- `.env.example`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live form persistence is still unverified until the actual server-side `SUPABASE_SERVICE_ROLE_KEY` is configured in the local/Cloudflare Pages Function environment.
- Turnstile and Resend remain staged but unverified until their real secrets are configured.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.

## Entry - 2026-05-28 (Content Import Preflight SQL Artifact)

### Scope
- Added `--preflight-sql-out` support to `scripts/check-content-import-readiness.mjs`.
- Added `npm run agent:content-import:preflight-sql` to write `.tmp/content-import-preview.json`, `.tmp/content-import-plan.md`, and `.tmp/content-import-preflight.sql`.
- The generated SQL artifact is read-only and covers planned-vs-current row counts, seed/import target counts, status distribution, RLS state, and policy inspection.
- Verified current Supabase target state without writing rows: seed tables have 12 finish definitions and one site settings row, content import target tables are empty, and all checked seed/import target tables have RLS enabled.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-content-import-readiness.mjs`

### Verification Results
- `npm run agent:content-import:preflight-sql`: pass. Wrote local ignored JSON, Markdown plan, and read-only SQL artifacts with 0 warnings and 0 blockers.
- Supabase connector target-count/RLS preflight: pass. `finish_definitions` has 12 rows, `site_settings` has 1 row, all checked content import target tables have 0 rows, and all checked seed/import target tables have RLS enabled.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('json ok')"`: pass.

### Risks and Gaps
- This is still a preflight artifact only. It must not be run as an import/apply step, and it does not write Supabase rows.
- Actual import remains blocked on Jay's content-scope approval, credential handling, backup/export posture, and live admin verification.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-CONTENT-CRUD-001` approved content import/apply checkpoint after credentials are available.

## Entry - 2026-05-28 (Admin Dashboard Launch Checks Refresh)

### Scope
- Updated the protected admin dashboard's open launch checklist so it no longer lists completed Storage bucket/media policy work as an open blocker.
- The dashboard now points active admins to the current blockers: server-side form service-role verification, first admin profile, live admin save/upload/export audit verification, and approved content import scope.
- Kept the change source-only; no Supabase rows or production configuration were changed.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/pages/admin/AdminDashboardPage.tsx`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin` route shell coverage and Forms API mock checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Active-admin dashboard rendering is still not live-verified because browser-safe Supabase configuration and a first active admin profile are still required.
- The checklist is operational copy only; it does not resolve the underlying credential and live verification blockers.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-CONTENT-CRUD-001` approved content import/apply checkpoint after credentials are available.

## Entry - 2026-05-28 (Media Manifest Export Source)

### Scope
- Added admin/editor CSV export to `/admin/media` for the currently visible media manifest.
- Export includes storage/external source fields, media type, dimensions, size, alt/caption/credit/usage notes, and status timestamps.
- Export is audit-gated: the screen attempts a `media_assets.export_manifest` row in `admin_audit_events` before creating the download and blocks export if the audit write fails.
- Kept live export verification pending until browser-safe Supabase config and an active admin/editor profile exist.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/pages/admin/AdminMediaPage.tsx`
- `src/pages/admin/adminContent.ts`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/media` route shell coverage and Forms API mock checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live media manifest export and its audit row are unverified until browser-safe Supabase configuration and an active admin/editor profile exist.
- The export is limited to records currently visible in the admin media screen. Date/status filtering can be added later if operational policy requires it.
- Server-side form row creation remains unverified until `SUPABASE_SERVICE_ROLE_KEY` is configured.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-MEDIA-LEADS-001` live media upload/save/export and lead save/export verification.

## Entry - 2026-05-28 (Content Import Plan Artifact)

### Scope
- Added `--plan-out` support to `scripts/check-content-import-readiness.mjs`.
- Added `npm run agent:content-import:plan` to write both `.tmp/content-import-preview.json` and `.tmp/content-import-plan.md`.
- The Markdown plan records no-write safety notes, preflight checks, table apply order, reverse rollback order, and verification expectations.
- Kept the flow non-destructive: generated files stay in ignored `.tmp/` and no Supabase rows are written.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-content-import-readiness.mjs`

### Verification Results
- `npm run agent:content-import:plan`: pass. Latest run prepared 51 media candidates, 13 stone groups, 15 stone variants, 153 finish capability rows, 6 products, 28 product models, 18 material defaults, 18 specs, 5 projects, 41 project facts, 14 project media rows, 2 project materials, 1 material map, 2 hotspots, 4 articles, and 4 article block placeholders with 0 warnings and 0 blockers.
- `npm run agent:content-import`: pass with the same zero-warning, zero-blocker content summary.
- `.tmp/content-import-preview.json`: pass. The local ignored artifact includes `importPlan` keys for safety, preflight checks, apply order, rollback order, and verification.
- `.tmp/content-import-plan.md`: pass. The local ignored Markdown plan renders the apply/rollback table and preflight checklist.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('json ok')"`: pass.

### Risks and Gaps
- This is still a planning artifact only. It must not be treated as an approved production import or client-approved published content.
- Actual apply/import still requires Jay approval, a backup/export posture, service-role credential handling, rollback review, and live Supabase verification.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-CONTENT-CRUD-001` explicit import/apply approval and implementation after credentials are available.

## Entry - 2026-05-28 (Leads CSV Export Source)

### Scope
- Added owner/admin CSV export to `/admin/leads` for the currently loaded enquiry and sample-request queue.
- Export includes contact details, workflow status, assignment labels, notification/Turnstile state, message/internal notes, shipping address, and sample item summaries.
- Export is audit-gated: the screen attempts a `leads.export_csv` row in `admin_audit_events` before creating the download and blocks the export if the audit write fails.
- Kept physical deletes hidden; live export verification still requires browser-safe Supabase config plus an active owner/admin profile.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/pages/admin/AdminLeadsPage.tsx`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 430 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/leads` route shell coverage and Forms API mock checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- Live CSV export and its audit row are unverified until browser-safe Supabase configuration and an active owner/admin profile exist.
- The export is limited to rows currently loaded by the admin screen; broader date/status-filtered export can be added after policy requirements are confirmed.
- Server-side form row creation remains unverified until `SUPABASE_SERVICE_ROLE_KEY` is configured.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-MEDIA-LEADS-001` live Leads save/export verification.

## Entry - 2026-05-28 (Content Import Artifact Output)

### Scope
- Added `--out` support to `scripts/check-content-import-readiness.mjs`.
- Added `.tmp/` to `.gitignore` so local review artifacts are not accidentally committed.
- Added `npm run agent:content-import:json` for stdout JSON output and documented the quieter artifact command through agent init.
- Kept the import flow strictly no-write: generated artifacts remain draft review payloads and do not write Supabase rows.

### Changed Files
- `.gitignore`
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-content-import-readiness.mjs`

### Verification Results
- `npm run agent:content-import`: pass. Latest run prepared 51 media candidates, 13 stone groups, 15 stone variants, 153 finish capability rows, 6 products, 28 product models, 18 product material defaults, 18 product specs, 5 projects, 41 project facts, 2 project materials, 1 material map, 2 hotspots, 4 articles, and 4 article block placeholders with 0 warnings and 0 blockers.
- `npm run agent:content-import -- --out .tmp/content-import-preview.json`: pass. Wrote the local ignored draft artifact and preserved the same summary counts.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The artifact is intentionally draft/no-write material. It must not be applied to production Supabase or treated as client-approved published content without explicit approval.
- The future apply/import step still needs a separate approval gate, service-role credentials, rollback/export planning, and live verification.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-CONTENT-CRUD-001` explicit import/apply planning after Jay approves the draft content scope.

## Entry - 2026-05-28 (Admin Profile Management and RLS Hardening)

### Scope
- Added non-destructive admin profile management to `/admin/settings` for existing Supabase Auth users.
- Owner/admin roles can create/update profile rows once live auth is configured; the UI blocks self-lockout, preserves at least one active owner, and does not expose delete controls.
- Applied `admin_profile_owner_hardening` so admins can maintain non-owner profiles while owner-role assignment and owner-profile changes require owner.
- Applied `security_definer_function_grants` so anonymous users cannot directly execute admin SECURITY DEFINER helpers and `rls_auto_enable` is not directly executable by anon/authenticated.
- Kept live profile save verification pending until browser-safe Supabase config and first-admin access are available.

### Changed Files
- `src/pages/admin/AdminSettingsPage.tsx`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `supabase/migrations/202605280004_admin_profile_owner_hardening.sql`
- `supabase/migrations/202605280005_security_definer_function_grants.sql`
- `supabase/migrations/README.md`

### Verification Results
- Supabase migration list: pass. `admin_profile_owner_hardening` and `security_definer_function_grants` are listed on project `npkidywzwddbnfrnxlmo`.
- Supabase policy check: pass. `admin_profiles` INSERT/UPDATE allow owner broadly, allow admin only for `admin/editor/viewer` rows, and DELETE is owner-only for non-owner rows.
- Supabase function grant check: pass. `anon` cannot execute `current_admin_role()` or `has_admin_role(text[])`; `rls_auto_enable()` is not directly executable by anon/authenticated.
- Supabase security advisor: partial pass. The previous anonymous SECURITY DEFINER warnings are cleared; authenticated warnings remain for `current_admin_role()` and `has_admin_role(text[])` because they remain executable for RLS policy evaluation.
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 427 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live admin profile create/update is still unverified until `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`, an active first-admin profile, and a browser session are available.
- First admin bootstrap still happens outside `/admin/settings` and requires Jay to confirm the first admin email/profile.
- Authenticated SECURITY DEFINER helper warnings remain because moving RLS helpers out of the exposed public schema would require a separate helper-function refactor and policy migration.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-SETTINGS-CRUD-001` live settings/admin-profile save verification.
- Source-only content import/public-read preparation if credentials remain unavailable.

## Entry - 2026-05-28 (Server-Side Form Audit Source)

### Scope
- Updated the Cloudflare Pages Function form helpers so successful enquiry and sample-request inserts attempt server-side `admin_audit_events` writes with `actor_user_id = null`.
- Added audit metadata for source route, Turnstile result, initial notification status, and sample-request item context.
- Kept visitor responses resilient: audit logging failure is swallowed after the primary lead row has been stored.
- Expanded Forms API mocks to cover audit writes, audit-failure resilience, missing service-role fail-closed behavior before Supabase calls, and existing Turnstile fail-closed behavior.

### Changed Files
- `functions/_lib/forms.js`
- `scripts/check-forms-api.mjs`
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `node scripts/check-forms-api.mjs`: pass.
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 416 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including all current `/admin/*` route shells and Forms API mock checks.

### Risks and Gaps
- Live form row creation and live form audit-row creation are still unverified until `SUPABASE_SERVICE_ROLE_KEY` exists in the local/Cloudflare Pages Function environment.
- Transactional email delivery remains staged but unverified until Resend/email secrets are configured.
- The source intentionally does not fail visitor submissions because audit logging failed after the primary lead row was stored.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-CONTENT-CRUD-001` source-only public-read preparation if credentials remain unavailable.

## Entry - 2026-05-28 (Content Import Dry Run)

### Scope
- Added `scripts/check-content-import-readiness.mjs` and `npm run agent:content-import`.
- The script reads current static Stone Library JSON, Products data, Projects data, Articles manifest/source HTML, and referenced local media.
- It prepares Supabase-shaped draft import candidates with natural keys and fails before any database write if local media is missing, slugs/keys duplicate, or project material-map references use unknown stone/finish keys.
- The script is intentionally no-write and does not treat provisional static content as final client-approved published content.

### Changed Files
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-content-import-readiness.mjs`
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`

### Verification Results
- Supabase read-only count check: content tables and `admin_audit_events` currently have zero rows before import.
- `npm run agent:content-import`: pass. Prepared 51 media candidates, 13 stone groups, 15 stone variants, 153 finish capability rows, 6 products, 28 product models, 18 product material defaults, 18 product specs, 5 projects, 41 project facts, 2 project materials, 1 material map, 2 hotspots, 4 articles, and 4 article block placeholders with 0 warnings and 0 blockers.
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 416 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including all current `/admin/*` route shells and Forms API mock checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is import preparation only; no rows were written to Supabase.
- Draft import candidates still need review before any production import, especially article structured-block cleanup and project claim approval.
- Live content import and public read migration still require browser-safe Supabase config, active admin profiles, and an explicit import/apply checkpoint.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CONTENT-CRUD-001` live import/apply and public-read migration after credentials and approval.

## Entry - 2026-05-28 (Admin Audit Writer Source)

### Scope
- Added `src/lib/adminAudit.ts` as the shared browser-side audit writer for admin save flows.
- Wired Settings, Media, Stone Library, Projects, Products, Articles, and Leads save workflows to call the audit writer after successful primary mutations.
- Audit insert failures are appended to the success notice and do not roll back the already-saved primary record.
- Kept live audit-row verification pending until browser-safe Supabase config and an active admin/editor or owner/admin profile exist.

### Changed Files
- `src/lib/adminAudit.ts`
- `src/pages/admin/AdminSettingsPage.tsx`
- `src/pages/admin/AdminMediaPage.tsx`
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `src/pages/admin/AdminProductsPage.tsx`
- `src/pages/admin/AdminArticlesPage.tsx`
- `src/pages/admin/AdminLeadsPage.tsx`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 416 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including all current `/admin/*` route shells and Forms API mock checks.

### Risks and Gaps
- Live audit row creation is not verified because browser-safe Supabase key configuration and an active admin profile are still required.
- Server-side form audit events are not implemented yet; form persistence itself still requires `SUPABASE_SERVICE_ROLE_KEY` verification first.
- Audit insert failure currently notifies the admin but does not retry automatically.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CONTENT-CRUD-001` content import/public-read preparation if credentials remain unavailable.

## Entry - 2026-05-28 (Admin Audit Visibility Source)

### Scope
- Replaced the `/admin/audit` scaffold with a protected owner/admin read-only review screen behind the existing Supabase Auth/profile gate.
- The screen reads audit events and active admin profile labels from Supabase.
- Owner/admin roles can inspect actor, action, entity, timestamp, and metadata JSON once browser-safe Supabase config and an active profile exist.
- Added loading, empty, filter, detail, metadata JSON, restricted-role, read-only, and error states.
- Kept audit event mutation out of this screen; shared mutation helpers still need to write audit rows from admin CRUD and form workflows.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminAuditPage.tsx`
- `src/pages/admin/adminContent.ts`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/audit` route shell coverage.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Playwright CLI with Firefox: pass for `/admin/audit` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than Audit content.

### Risks and Gaps
- Live Audit visibility verification is not complete because browser-safe Supabase key configuration and an active owner/admin profile are still required.
- The admin CRUD and form workflows do not yet write audit event rows; this screen will be empty until mutation helpers or server-side event writers are added.
- Export, retention policy, and sensitive-operation review rules remain pending.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- Shared audit event writers for admin CRUD and form workflows.
- Source-only content import preparation if credentials remain unavailable.

## Entry - 2026-05-28 (Admin Leads Workflow Source)

### Scope
- Replaced the `/admin/leads` scaffold with a protected source workflow screen behind the existing Supabase Auth/profile gate.
- The screen reads enquiries, sample requests, sample request items, active admin profiles, Stone Library labels, and finish labels from Supabase.
- Active owner/admin roles can update lead status, assignment, and internal notes once browser-safe Supabase config and an active profile exist.
- Added loading, empty, contact detail, sample item, notification state, Turnstile state, status, assignment, internal notes, read-only, and error states.
- Kept lead row creation server-side only through the existing Pages Function form endpoints; manual lead creation, export, and physical delete controls remain intentionally hidden.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminLeadsPage.tsx`
- `src/pages/admin/adminContent.ts`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/leads` route shell coverage.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Playwright CLI with Firefox: pass for `/admin/leads` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than Leads workflow content.

### Risks and Gaps
- Live Leads save verification is not complete because browser-safe Supabase key configuration and an active owner/admin profile are still required.
- Live lead row creation is still not verified because server-side `SUPABASE_SERVICE_ROLE_KEY` is not configured for the Pages Function environment.
- Transactional email, Turnstile production secret verification, lead export, and audit review remain pending.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-MEDIA-LEADS-001` live verification and export/notification follow-ups.
- Next source-only checkpoint without credentials: useful audit visibility.

## Entry - 2026-05-28 (Admin Articles CRUD Source)

### Scope
- Replaced the `/admin/articles` scaffold with a protected source CRUD screen behind the existing Supabase Auth/profile gate.
- The screen reads article metadata, structured article blocks, media records, project references, and Stone Library references from Supabase.
- Active editor/admin/owner roles can create/update article and block records, publish/archive articles and blocks, and keep legacy newsletter source material as provenance rather than the normal authoring model once browser-safe Supabase config and an active profile exist.
- Added loading, empty, validation, save, publish/archive, structured-block JSON, reference-linking, legacy-source provenance, read-only, and error states.
- Kept public Article runtime static/file-backed with sanitized legacy HTML; static-to-Supabase content import and public read migration remain separate follow-ups.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminArticlesPage.tsx`
- `src/pages/admin/adminContent.ts`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 386 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/articles` route shell coverage.
- Playwright CLI with Firefox: pass for `/admin/articles` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than Articles CRUD content, and console output had 0 errors/warnings.

### Risks and Gaps
- Live Articles save verification is not complete because browser-safe Supabase key configuration and an active admin/editor profile are still required.
- Public Article routes still read `public/articles/index.json` and legacy HTML content; public runtime migration from static data to Supabase remains pending.
- Structured block schemas are intentionally JSON-backed in this source checkpoint; richer per-block form controls can be added after the client confirms editorial needs.
- Physical delete controls are intentionally not exposed in this checkpoint; archive is the safe operational path until destructive-delete policy is confirmed.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-MEDIA-LEADS-001` next source-only checkpoint: lead inbox status/notes workflow.
- `NOW-ADMIN-CONTENT-CRUD-001` live save verification and static-to-Supabase content imports.

## Entry - 2026-05-28 (Admin Products CRUD Source)

### Scope
- Replaced the `/admin/products` scaffold with a protected source CRUD screen behind the existing Supabase Auth/profile gate.
- The screen reads product families, product models, material defaults, product specs, Stone Library references, and media options from Supabase.
- Active editor/admin/owner roles can create/update product, model, material-default, and spec records; publish/archive products and models; and keep product configuration structured once browser-safe Supabase config and an active profile exist.
- Added loading, empty, validation, save, publish/archive, material-default, read-only, and error states.
- Kept public Product runtime static/file-backed; static-to-Supabase content import and public read migration remain separate follow-ups.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminProductsPage.tsx`
- `src/pages/admin/adminContent.ts`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 364 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/products` route shell and Forms API checks.
- Playwright CLI with Firefox: pass for `/admin/products` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than Products CRUD content, and console output had 0 errors/warnings.

### Risks and Gaps
- Live Products save verification is not complete because browser-safe Supabase key configuration and an active admin/editor profile are still required.
- Public Product routes still read `src/data/productData.ts`; public runtime migration from static data to Supabase remains pending.
- Physical delete controls are intentionally not exposed in this checkpoint; archive is the safe operational path until destructive-delete policy is confirmed.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CONTENT-CRUD-001` next source-only checkpoint: Articles as structured blocks.
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-28 (Admin Projects CRUD Source)

### Scope
- Replaced the `/admin/projects` scaffold with a protected source CRUD screen behind the existing Supabase Auth/profile gate.
- The screen reads Projects, project facts, material schedule rows, material maps, hotspots, Stone Library references, finish references, and media options from Supabase.
- Active editor/admin/owner roles can create/update project, fact, material, map, and hotspot records; publish/archive projects, maps, and hotspots; and keep claim-review state explicit once browser-safe Supabase config and an active profile exist.
- Added loading, empty, validation, save, publish/archive, claim-review, read-only, and error states.
- Kept public Project runtime static/file-backed; static-to-Supabase content import and public read migration remain separate follow-ups.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `src/pages/admin/adminContent.ts`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 339 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/projects` route shell and Forms API checks.
- Playwright CLI with Firefox: pass for `/admin/projects` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than Projects CRUD content, and console output had 0 errors/warnings.

### Risks and Gaps
- Live Projects save verification is not complete because browser-safe Supabase key configuration and an active admin/editor profile are still required.
- Public Project routes still read `src/data/projectData.ts`; public runtime migration from static data to Supabase remains pending.
- Physical delete controls are intentionally not exposed in this checkpoint; archive is the safe operational path until destructive-delete policy is confirmed.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CONTENT-CRUD-001` next source-only checkpoint: Products.
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-28 (Admin Stone Library CRUD Source)

### Scope
- Replaced the `/admin/stone-library` scaffold with a protected source CRUD screen behind the existing Supabase Auth/profile gate.
- The screen reads Stone Library groups, variants, finish definitions, and finish capability rows from Supabase.
- Active editor/admin/owner roles can create/update stone groups, create/update variants, publish/archive group and variant records, and save per-finish capability rows once browser-safe Supabase config and an active profile exist.
- Added loading, empty, validation, save, publish/archive, read-only, and error states.
- Kept public Stone Library runtime static/file-backed; static-to-Supabase content import and public read migration remain separate follow-ups.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `src/pages/admin/adminContent.ts`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Supabase policy inspection: pass. `stone_groups`, `stone_variants`, `stone_finish_capabilities`, and `finish_definitions` keep active admin-role SELECT/INSERT/UPDATE policies, owner/admin DELETE policies, and published-only public SELECT policies.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 301 kB before gzip.
- `npm run agent:smoke`: pass, including `/admin/stone-library` route shell and Forms API checks.
- Playwright browser QA: pass for `/admin/stone-library` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than Stone Library CRUD content, and console output had 0 errors/warnings. Firefox was installed for local Playwright because local Chrome was unavailable.

### Risks and Gaps
- Live Stone Library save verification is not complete because browser-safe Supabase key configuration and an active editor/admin profile are still required.
- Supabase Stone Library tables currently have finish definitions seeded, but group/variant/capability content import has not been run; the admin UI can create records once live auth is available.
- Public Stone Library routes still read `data/clean/stone_library.json`; public runtime migration from static data to Supabase remains pending.
- Physical delete controls are intentionally not exposed in this checkpoint; archive is the safe operational path until destructive-delete policy is confirmed.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CONTENT-CRUD-001` next source-only checkpoint: Projects with material maps and hotspots.
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-28 (Admin Media Storage and Library Source)

### Scope
- Added Supabase Storage foundation for Urblo media: `urblo-public-media` for public-safe assets and `urblo-admin-media` for private draft/review assets.
- Added Storage RLS policies for active admin roles and removed broad public object listing after Supabase advisor flagged the risk.
- Added `/admin/media` as the first media library source screen behind the Supabase Auth/profile gate.
- The media screen supports upload-backed draft records, external media records, metadata editing, role-aware read-only behavior, and publish/archive validation.
- Expanded smoke coverage to include `/admin/media`.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminMediaPage.tsx`
- `src/pages/admin/adminContent.ts`
- `supabase/migrations/202605280002_media_storage_foundation.sql`
- `supabase/migrations/202605280003_media_storage_listing_hardening.sql`
- `supabase/migrations/README.md`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Supabase migration list: pass. `media_storage_foundation` and `media_storage_listing_hardening` are listed on project `npkidywzwddbnfrnxlmo`.
- Supabase bucket check: pass. `urblo-public-media` exists as a public bucket with a 25 MB limit; `urblo-admin-media` exists as a private bucket with a 50 MB limit; both allow the launch image/PDF/MP4 MIME set.
- Supabase policy check: pass. Storage object SELECT is available to active admin viewer/editor/admin/owner roles; INSERT/UPDATE to editor/admin/owner; DELETE to owner/admin.
- Supabase security advisor follow-up: pass for the new public bucket listing issue. The broad public `storage.objects` SELECT policy was removed. Existing security-definer function warnings from the foundation helper functions remain as a separate hardening follow-up.
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 271 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/media` route shell and Forms API checks.
- Playwright browser QA: pass for `/admin/media` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than media library content, and console output was limited to the React DevTools development notice.

### Risks and Gaps
- Live media upload/save verification is not complete because browser-safe Supabase key configuration and an active admin/editor profile are still required.
- The media screen is source-ready but does not yet migrate existing static launch assets into Supabase records.
- Lead inbox remains pending live form persistence and notification verification.
- Supabase advisors still report existing security-definer helper function warnings and expected early-stage unused-index/permissive-policy warnings; those were not introduced by this media checkpoint except where Storage policies depend on the existing admin role helper.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-MEDIA-LEADS-001`
- `NOW-ADMIN-CONTENT-CRUD-001`

## Entry - 2026-05-28 (Admin Settings CRUD and RLS Hardening)

### Scope
- Added `/admin/settings` as the first real admin CRUD source screen behind the Supabase Auth/profile gate.
- The settings form reads or creates the default `site_settings` row and supports status, company name, primary contact, social links, SEO defaults, and footer JSON editing.
- Added role-aware UI so owner/admin can save while editor/viewer sessions stay read-only.
- Added and applied Supabase migration `admin_settings_role_hardening` so `site_settings` INSERT/UPDATE/DELETE policies require owner/admin while SELECT remains available to active viewer/editor/admin/owner profiles.
- Expanded smoke coverage to include `/admin/settings`.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminSettingsPage.tsx`
- `src/pages/admin/adminContent.ts`
- `supabase/migrations/202605280001_admin_settings_role_hardening.sql`
- `supabase/migrations/README.md`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Supabase migration list: pass. `admin_settings_role_hardening` is listed on project `npkidywzwddbnfrnxlmo`.
- Supabase policy check: pass. `site_settings_admin_insert`, `site_settings_admin_update`, and `site_settings_admin_delete` require owner/admin; `site_settings_admin_select` remains viewer/editor/admin/owner.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/settings` route shell and Forms API checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Playwright browser QA: pass for `/admin/settings` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than settings data.

### Risks and Gaps
- Live settings save is not verified because browser-safe Supabase key configuration and an active owner/admin profile are still required.
- Settings is the only CRUD source screen so far; media, Stone Library, Projects, Products, Articles, leads, audit, and admin-user management remain pending.
- The database policy is stricter than the original generic admin-write policy for `site_settings`; this matches `docs/ADMIN_IA_ACCESS.md`.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-SETTINGS-CRUD-001`

## Entry - 2026-05-28 (Admin Auth Shell Source)

### Scope
- Added the first `/admin` runtime shell outside the public site chrome.
- Added browser-side Supabase client configuration using `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`, with no service-role key in browser code.
- Added real Supabase Auth email/password login flow, session validation through `getUser()`, active `admin_profiles` lookup, sign-out, unauthorized state, config-required state, and protected dashboard/module scaffolds.
- Suppressed the public WelcomePopup on admin routes.
- Added `.env.example` for public/server environment variable names and expanded smoke route coverage for `/admin`, `/admin/login`, and `/admin/unauthorized`.

### Changed Files
- `.env.example`
- `.gitignore`
- `package.json`
- `package-lock.json`
- `scripts/agent-smoke.sh`
- `src/App.tsx`
- `src/vite-env.d.ts`
- `src/lib/supabaseClient.ts`
- `src/lib/adminAuth.tsx`
- `src/lib/adminAuthHooks.ts`
- `src/lib/adminAuthState.ts`
- `src/pages/admin`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk output is about 240 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin`, `/admin/login`, `/admin/unauthorized`, public route shells, CTA contracts, and Forms API checks.
- Playwright browser QA: pass for `/admin` and `/admin/login` with no browser-safe Supabase key configured. Both routes show the configuration-required state, do not render dashboard content, suppress the public WelcomePopup, and report no console errors beyond React DevTools info.
- `npm audit --omit=dev`: reports existing production dependency advisories in React Router, Swiper, glob/minimatch/picomatch, PostCSS, yaml, and brace-expansion. This checkpoint did not widen into dependency upgrades.

### Risks and Gaps
- Live admin login is not verified because browser-safe Supabase key configuration and Jay's first admin email/profile are still required.
- Active-admin dashboard queries are implemented but unproven against a real authenticated admin session.
- Module routes are protected scaffolds only; content CRUD, media upload, lead management, settings, and audit workflows are still pending.
- Live form persistence still requires server-side `SUPABASE_SERVICE_ROLE_KEY` verification.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

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
- `docs/ASSET_MIGRATION_AUDIT.md`
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

## Entry - 2026-05-22 (Route-Level Code Splitting)

### Scope
- Converted public page components in `src/App.tsx` to lazy-loaded route modules while keeping existing layouts, route paths, and metadata behavior intact.
- Added a small route-loading fallback inside the existing page layout surfaces.
- Reduced the initial JavaScript app shell from about 674 kB to about 255 kB in the Vite production build.
- Closed `LATER-PERF-001`; the previous `>500kB` JavaScript chunk warning no longer appears.

### Changed Files
- `AGENTS.md`
- `src/App.tsx`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass; no `>500kB` JavaScript chunk warning, with the existing Browserslist staleness notice only.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Future admin/CMS features can reintroduce large chunks if not split deliberately.
- React Helmet strict-mode warning remains.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `LATER-QA-001`

## Entry - 2026-05-22 (Smoke CTA Coverage)

### Scope
- Expanded `npm run agent:smoke` beyond route-shell and article-index checks.
- Added named CTA contract checks for Contact navigation, Sample Request mailto fallback, homepage Contact/Sample Request fallbacks, Moon Gate CTAs, Contact page Stone Library CTA, and stone detail phone CTA.
- Closed `LATER-QA-001` because smoke failures now report actionable route/CTA names.

### Changed Files
- `scripts/agent-smoke.sh`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Smoke checks are still contract-level checks, not full browser interaction tests.
- Supabase-backed forms are still not implemented, so Sample Request remains a verified mailto fallback only.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `NEXT-PROJECTS-INTAKE-001`
- `NEXT-STONELIB-DATA-001`

## Entry - 2026-05-22 (Homepage Stone Section Removal and Full-Site UI QA)

### Scope
- Removed the homepage `Browse by stone type` section by request, including the unused source type/data and four local showcase images.
- Polished obvious homepage/product copy issues surfaced during the QA pass: removed unfinished ellipses, corrected `student accommodation`, corrected `street furniture`, and fixed the product heading text spacing.
- Added runtime article safeguards for legacy newsletter HTML: mobile table/media constraints, dead-link unwrapping, stronger loading behavior, and additional claim-sensitive phrase rewrites.
- Initialized product detail default material selections and corrected duplicate `Timber Flush +` model labels where they were intended to be `Timber Rise +`.
- Used two read-only subagents for independent route/UI and customer/content QA, then converted the unresolved findings into machine-readable Harness tasks.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `src/data/productData.ts`
- `src/pages/ProductDetailPage.tsx`
- `src/pages/ArticlePage.tsx`
- `src/lib/articleMedia.ts`
- `src/index.css`
- Deleted four former homepage stone showcase images from `public/media/launch/homepage`.
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass; no `>500kB` JavaScript chunk warning, with the existing Browserslist staleness notice only.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser desktop QA on `http://127.0.0.1:4174`: Home no longer contains `Browse by stone type`, Home and Prime Block have no broken images or horizontal overflow, Prime Block initializes New Grey, Stainless Steel Finish, and Spotted-Gum Timber, and the known React Helmet strict-mode warning remains.
- Playwright mobile fallback QA at 390px: `/articles/Debunking-the-Cost-Myth-by-Urblo-Bluestone-Blocks` had `scrollWidth` 390, zero horizontal overflow, zero broken images, zero empty links, and no flagged `Guaranteed Quality`, `zero cracks`, `3-10-week curing cycle`, `30% faster`, or `flawless alignment` text.

### Risks and Gaps
- Unknown URLs still render Home until `NOW-ROUTE-ERROR-STATES-001`.
- Articles still need structured blocks and full editorial approval under `NOW-ARTICLE-STRUCTURE-CLAIMS-001`.
- Product detail configuration still needs stronger conversion feedback and CTA under `NEXT-PRODUCT-DETAIL-CONVERSION-001`.
- Stone Library still needs approved source imagery for Golden Crust, Harcourt, and Tan Brown under `NEXT-STONELIB-IMG-001`.
- Legacy project pages remain less complete than Moon Gate and need migration under `NEXT-PROJECTS-INTAKE-001`.
- URL slug normalization should be decided before production indexing under `NEXT-SLUG-URL-NORMALIZE-001`.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ROUTE-ERROR-STATES-001`
- `NOW-ARTICLE-STRUCTURE-CLAIMS-001`
- `NEXT-PRODUCT-DETAIL-CONVERSION-001`
- `NEXT-PROJECTS-INTAKE-001`

## Entry - 2026-05-22 (Stone Library Drive Source Task)

### Scope
- Recorded the Saistone Google Drive shared folder named `Urblo Digital Stone Library` as the temporary source of truth for Stone Library imagery.
- Added `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001` to compare the shared-drive source against current website mappings and identify stale, changed, or unpublished Stone Library images.
- Kept machine-specific local absolute paths out of committed Harness docs.

### Changed Files
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The image audit itself has not been run yet.
- Shared-drive source folders may need manual naming normalization before automated mapping is reliable.

### Next Handoff
- `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-22 (Harness Task Sequencing Cleanup)

### Scope
- Shortened `docs/HANDOFF.md` so it reads as a current handoff instead of a full verification history.
- Re-sequenced Stone Library image work so `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001` runs before final HD image coverage.
- Marked `NOW-ADMIN-CMS-001` as an umbrella objective and added smaller admin child tasks for IA/access planning, Auth/RLS, content CRUD, media, and lead management.
- Updated roadmap and root harness notes so future agents do not attempt the whole admin CMS in one pass.

### Changed Files
- `AGENTS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The new admin implementation child tasks remain blocked until Supabase/Auth/Storage/form secrets are available.
- `NEXT-ADMIN-IA-ACCESS-001` is the only admin task intended to proceed without secrets.

### Next Handoff
- `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001`
- `NEXT-ADMIN-IA-ACCESS-001`
- `NOW-ROUTE-ERROR-STATES-001`

## Entry - 2026-05-25 (Stone Library Drive Image Audit)

### Scope
- Ran the current-site-only Stone Library source audit against the Saistone shared-drive folder named `Urblo Digital Stone Library`.
- Followed user direction to ignore shared-drive products that are not currently present on the website.
- Compared current runtime mappings in `src/data/stoneFinishImages.ts` and repo media against shared-drive candidates without changing runtime mappings or assets in this pass.
- Recorded the update list for `NEXT-STONELIB-IMG-001`: Golden Crust Light/Dark, Tan Brown, Honey Comb, Tuscany, and Ivory Sand honed review.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates were not run because no runtime mappings or assets changed.

### Risks and Gaps
- `NEXT-STONELIB-IMG-001` still needs to normalize and map the approved shared-drive candidates.
- Ivory Sand honed needs visual review before replacing the current Sandstone-named asset.
- Blueocean and Harcourt still have no matching current-site source candidate in the shared-drive scope.

### Next Handoff
- `NEXT-STONELIB-IMG-001`
- `NEXT-ADMIN-IA-ACCESS-001`
- `NOW-ROUTE-ERROR-STATES-001`

## Entry - 2026-05-25 (Stone Library Current-Site Image Mapping)

### Scope
- Normalized current-site shared-drive Stone Library candidates into `data/Product`.
- Mapped Golden Crust Light/Dark, Tan Brown, and Honey Comb to finish-specific runtime images.
- Replaced old Ivory Sand `Sandstone` file paths with shared-drive `Ivory Sand` image paths after visual review.
- Mapped Tuscany Vein Cut and Cross Cut to variant-level default images only, avoiding false finish-specific claims.
- Removed obsolete old Sandstone-named assets and unused Tuscany fallback files; Blueocean keeps the controlled fallback and Harcourt keeps TBC placeholders.

### Changed Files
- `AGENTS.md`
- `data/Product/Golden Crust`
- `data/Product/Honey Comb`
- `data/Product/Ivory Sand`
- `data/Product/Tan Brown`
- `data/Product/Tuscany`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `public/media/launch/stone-library/fallbacks`
- `src/data/stoneFinishImages.ts`

### Verification Results
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- Browser QA: pass on `http://127.0.0.1:5173/stone-library`, `/stone-library/golden-crust`, `/stone-library/tan-brown`, `/stone-library/honey-comb`, and `/stone-library/tuscany`. Golden Crust Dark and Tuscany Cross Cut variant switches update to mapped images; only the known React Helmet strict-mode warning appeared in console logs.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Blueocean still needs approved finish imagery if Urblo wants more than the controlled fallback.
- Harcourt still needs approved source imagery before its TBC placeholder state can be removed.
- Tuscany still needs finish-specific photos before honed, polished, and sandblasted can be visually distinct.

### Next Handoff
- `NEXT-ADMIN-IA-ACCESS-001`
- `NOW-ROUTE-ERROR-STATES-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-25 (Admin IA and Access Contract)

### Scope
- Added `docs/ADMIN_IA_ACCESS.md` as the executable no-secret contract for the future Urblo-owned `/admin` site.
- Defined admin route map, unauthenticated/authenticated/unauthorized/loading states, viewer/editor/admin/owner role behavior, draft/review/published/archived/TBC content states, and module rollout sequence.
- Added first-pass field ownership models for leads, media, Stone Library, Projects, Products, and Articles.
- Recorded admin implementation boundaries so future agents do not ship fake production auth before Supabase credentials, RLS, Storage policies, form endpoints, and secrets are available.
- Updated architecture, launch plan, schema, design, handoff, roadmap, and task queue references to point future admin implementation work at the contract.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates were not run because no runtime routes, components, data, or assets changed.

### Risks and Gaps
- `/admin` is not implemented yet.
- Supabase Auth, RLS, Storage policies, Cloudflare Pages Functions, Turnstile, and email secrets remain blocked until account access is available.
- The next no-secret runtime task is `NOW-ROUTE-ERROR-STATES-001`.

### Next Handoff
- `NOW-ROUTE-ERROR-STATES-001`
- `NEXT-PRODUCT-DETAIL-CONVERSION-001`
- `NEXT-PROJECTS-INTAKE-001`

## Entry - 2026-05-25 (Route Error States)

### Scope
- Replaced the catch-all homepage fallback with a branded not-found page so unknown public URLs no longer look like valid homepage visits.
- Added a shared `RouteState` component for public route-level loading, not-found, and load-error states.
- Updated product detail and article detail routes so missing slugs, loading work, and fetch failures render deliberate recovery states instead of blank content, red text, or misleading fallback content.
- Added smoke coverage for one unknown route shell and one missing product detail route shell.
- Updated architecture, design, handoff, roadmap, and task queue docs so future agents treat this as an implemented launch-safety contract.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/agent-smoke.sh`
- `src/App.tsx`
- `src/components/RouteState.tsx`
- `src/pages/ArticlePage.tsx`
- `src/pages/NotFoundPage.tsx`
- `src/pages/ProductDetailPage.tsx`

### Verification Results
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including unknown-route and missing-product state route shells.
- Browser QA: pass on `/not-a-real-urblo-route`, `/products/not-a-real-product`, and `/articles/not-a-real-article`; each route rendered deliberate state copy and did not render the homepage title.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Browser screenshot capture timed out during this QA pass, so state verification used browser title and rendered text checks instead.
- React Helmet still emits an existing strict-mode lifecycle warning in dev console.
- Product detail pages still need the separate conversion/configuration polish task.

### Next Handoff
- `NEXT-PRODUCT-DETAIL-CONVERSION-001`
- `NEXT-PROJECTS-INTAKE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-25 (Product Detail Conversion)

### Scope
- Turned product detail configuration from button-only selection into a visible selected-configuration summary.
- Added a prefilled `mailto:` CTA so a visitor can discuss the exact product/model/material combination without waiting for Supabase forms.
- Added Contact and Stone Library recovery links inside the product configuration area.
- Added specification caveat copy so the current sample-level values are presented as discussion cues until final engineering/product data is approved.
- Added `OptionItem.imageState` and product selector treatment for missing stone imagery, including an explicit `Image pending` badge that does not pollute the button accessible name.
- Updated product/detail architecture, design contract, handoff, roadmap, and task queue docs.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/ModelSelector.tsx`
- `src/components/OptionSelector.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/service/StoneLibraryService.ts`
- `src/types/product.ts`

### Verification Results
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- Browser QA: desktop pass on `/products/primeBlock`; the page identity, meaningful content, selected summary, prefilled `mailto:` CTA, pending-image copy, and Timber Rise + / Harcourt interaction were verified. One screenshot was captured before the CTA row was adjusted, and a later browser reconnect failed before a fresh screenshot could be captured.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Browser mobile viewport override did not apply in the in-app Browser, and the Playwright CLI fallback was blocked because the local Chrome distribution is unavailable. Mobile layout still needs a fresh visual check when browser tooling is available.
- React Helmet still emits an existing strict-mode lifecycle warning in dev console.
- Product records remain static/file-backed; customer-editable product fields are still part of the Supabase/admin CRUD track.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NEXT-STONELIB-IMG-002`
- `NEXT-SLUG-URL-NORMALIZE-001`

## Entry - 2026-05-25 (Stone Library Secondary Frames)

### Scope
- Implemented secondary finish frames as support media for the active Stone Library finish, not separate finish states.
- Added secondary image mapping for approved Juparana and Zen Grey `_2` source frames in `src/data/stoneFinishImages.ts`.
- Extended the Stone Library service/type contract so `FinishVM.secondaryImages` carries approved secondary frame metadata.
- Added active-finish secondary thumbnails below the image stage; clicking a thumbnail opens the lightbox on that frame while preserving the active finish.
- Added frame selection inside `FinishLightbox` so primary and secondary frames can be inspected without changing finish state.
- Added active finish frame-count disclosure to `FinishAccordion`.
- Updated architecture, design, handoff, asset audit, roadmap, and task queue docs.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/FinishLightbox.tsx`
- `src/components/stone-library/ImageStage.tsx`
- `src/data/stoneFinishImages.ts`
- `src/pages/StoneLibraryDetailPage.tsx`
- `src/service/StoneLibraryService.ts`
- `src/types/stone-library.ts`

### Verification Results
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Fresh desktop/mobile browser visual QA is blocked: the in-app Browser reports no active pane, and the Playwright CLI fallback cannot launch because local Chrome is unavailable.
- Harcourt remains placeholder/TBC because no approved source imagery exists.
- Blueocean remains on the controlled fallback because no matching current-site shared-drive source exists.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NEXT-SLUG-URL-NORMALIZE-001`
- `NOW-ARTICLE-STRUCTURE-CLAIMS-001`

## Entry - 2026-05-25 (Public Slug Normalization)

### Scope
- Normalized canonical product slugs from camelCase to lowercase kebab-case.
- Normalized canonical article slugs from title-case export names to lowercase kebab-case.
- Added `legacySlugs` on products and articles so old public URLs still resolve inside the SPA.
- Added `sourceSlug` on article metadata so current raw HTML content can stay in the existing title-case source folders while public URLs become canonical.
- Added explicit Cloudflare 301 rules for old product and article URLs before the SPA fallback in `public/_redirects`.
- Updated smoke coverage to exercise canonical product/article route shells and assert representative redirect rules exist.
- Updated architecture, admin IA, handoff, roadmap, and task queue docs with the slug policy and redirect compatibility model.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `public/_redirects`
- `public/articles/index.json`
- `public/articles/Curving-the-Future-Greening-the-Pipelines-Sustainable-Legacy/meta.json`
- `public/articles/Debunking-the-Cost-Myth-by-Urblo-Bluestone-Blocks/meta.json`
- `public/articles/Modular-Mastery-How-PrimeBlock-Core-Transformed-Aitken-College/meta.json`
- `public/articles/Stone-Transformed-8-Ways-to-Redefine-Bluestones-Look-Feel/meta.json`
- `scripts/agent-smoke.sh`
- `src/data/productData.ts`
- `src/pages/ArticlePage.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/scripts/generate-article-index.ts`
- `src/service/ProductService.ts`
- `src/types/article.ts`
- `src/types/product.ts`

### Verification Results
- Article JSON metadata parse check: pass.
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including canonical product/article route shells and representative old-to-new redirect rule checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Cloudflare 301 behavior still needs live Pages preview validation after Cloudflare project setup.
- Raw article content folders are intentionally not renamed in this pass; `sourceSlug` keeps compatibility until structured article migration.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NOW-ARTICLE-STRUCTURE-CLAIMS-001`
- `NEXT-UI-PARITY-001`

## Entry - 2026-05-25 (Launch UI Hardening)

### Scope
- Implemented the approved UI/UX launch fixes except the two user-paused areas: article claim cleanup and broad legacy project-detail migration.
- Made the homepage hero full viewport, changed hero video loading to `preload="none"`, and preserved mobile poster-only behavior for performance.
- Added client-side scroll restoration so internal route changes land at the top instead of preserving deep scroll positions.
- Removed the duplicated Article detail route banner and hardened route-level loading, not-found, and error states for no-banner routes.
- Added mobile safeguards for legacy article newsletter HTML and shortened article previous/next controls.
- Made Product detail renders honest as geometry previews, with separate material preview rows for body stone, frame finish, and battens.
- Added Stone Library finish-image provenance roles so active imagery is labeled as finish-specific, reference, or pending.
- Added local Contact form validation before opening a mailto draft, improved mobile Our Story bio visibility, tightened global eyebrow contrast, fixed project facts mobile stacking, and made Product cards/copy more aligned with the current data.
- Replaced `react-helmet` with a native route metadata updater to remove React 19 strict-mode console noise.

### Changed Files
- `package.json`
- `package-lock.json`
- `src/App.tsx`
- `src/components/ProductCard.tsx`
- `src/components/RouteState.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/ImageStage.tsx`
- `src/data/stoneFinishImages.ts`
- `src/index.css`
- `src/pages/ArticlePage.tsx`
- `src/pages/ArticlesPage.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/NotFoundPage.tsx`
- `src/pages/OurStory.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/pages/ProductsPage.tsx`
- `src/pages/ProjectDetails.tsx`
- `src/service/StoneLibraryService.ts`
- `src/types/stone-library.ts`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Subagent review: completed as a sidecar UI/UX launch pass; it confirmed most dirty fixes and caught a temporary Stone Library `imageRole` type narrowing issue, which was fixed before final gates.
- Browser QA: pass on `/`, `/definitely-not-a-page`, `/projects/unknown-project`, `/articles/debunking-the-cost-myth-by-urblo-bluestone-blocks`, `/products/terra-line`, `/stone-library/new-grey`, `/our-story`, `/products`, and `/contact`.
- Browser QA metrics: homepage first section measured 900px at 1440x900 and 844px at 390x844; mobile homepage did not select the MP4 source; article detail at 320px had zero horizontal overflow; contact empty submit showed the inline validation message; homepage project-card navigation reset to `scrollY=0`.
- Fresh browser console check after removing `react-helmet`: no new warnings or errors after page load.
- Screenshot evidence was captured through the Playwright CLI fallback because Browser screenshot capture timed out in this environment.
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The desktop homepage MP4 is still large. Current mitigations reduce mobile cost and initial preload, but final performance sign-off still needs re-encoding or Cloudflare Stream/R2 review.
- Article claim cleanup is explicitly paused by user direction and remains open under `NOW-ARTICLE-STRUCTURE-CLAIMS-001`.
- Broad legacy project detail migration is explicitly paused by user direction and remains open under `NEXT-PROJECTS-INTAKE-001`.
- Raw article newsletter HTML remains a migration source and should still move to structured article blocks before customer CRUD is considered complete.
- Contact validation prevents empty mailto drafts but does not persist leads; Supabase-backed forms remain required.

### Next Handoff
- `NOW-ASSET-MIGRATION-001`
- `NOW-FORMS-SUPABASE-001`
- `NEXT-UI-PARITY-001`

## Entry - 2026-05-25 (Homepage Video Optimization)

### Scope
- Re-encoded the controlled homepage hero MP4 from the previous launch stopgap into a smaller production-friendly static asset.
- Preserved the existing public path `public/media/launch/home/urblo-hero.mp4` so no data contract or route changes were required.
- Kept desktop/tablet video behavior and mobile poster-only behavior from the launch UI hardening pass.
- Updated asset, architecture, handoff, roadmap, worklog, and machine task docs so agents no longer treat the desktop MP4 as an unresolved large-asset blocker.

### Changed Files
- `public/media/launch/home/urblo-hero.mp4`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Source size comparison: previous controlled MP4 was about 16MB; optimized MP4 is about 3MB.
- Encoding target: H.264 MP4, 1280x720, 30fps, no audio, fast-start.
- Browser QA on desktop 1440x900: homepage video selected `/media/launch/home/urblo-hero.mp4`, reached `readyState=4`, reported 1280x720 intrinsic size, first section height was 900px, and horizontal overflow was 0.
- Browser QA on mobile 390x844: homepage first section height was 844px, horizontal overflow was 0, and the video selected no MP4 source.
- Playwright CLI screenshot fallback captured the optimized desktop homepage first viewport.
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live Cloudflare preview should still verify actual LCP/network behavior after deployment.
- Cloudflare Stream/R2 remains optional if the client wants adaptive streaming, analytics, or non-repo video management later.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-05-25 (Motion Polish)

### Scope
- Added shared structured-number motion for Urblo proof metrics.
- Applied count-up behavior to homepage metrics and Our Story counters.
- Replaced `react-countup` scroll-spy behavior with an in-house `IntersectionObserver` plus `requestAnimationFrame` counter so numbers visibly grow when the user scrolls to them.
- Added restrained route enter transitions keyed by pathname so public page changes feel smoother without delaying route-state content.
- Kept dates, dimensions, specification text, filter counts, native select option counts, and Stone Library card scan counts static after motion review because those numbers support fast inspection rather than brand proof.
- Updated the design, architecture, handoff, roadmap, worklog, and machine task queue to record the motion boundary for future agents.

### Changed Files
- `src/App.tsx`
- `package.json`
- `package-lock.json`
- `src/components/AnimatedNumber.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/pages/OurStory.tsx`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: homepage proof metrics start at `0`, show intermediate values after scroll, and reach final values with zero horizontal overflow.
- Browser QA: Our Story proof counters start at `0`, show intermediate values after scroll, and reach final values with zero horizontal overflow.
- Browser QA: Stone Library result count and card finish/variant counts remain immediate/static scan text, not count-up targets.
- Browser QA: clicking from `/projects` at scroll depth into `/projects/moon-gate-woolley-street` lands on the detail page with `scrollY=0` and zero horizontal overflow.
- Browser QA: unknown public route still renders the deliberate Page not found state with zero horizontal overflow.

### Risks and Gaps
- Numeric count-up now intentionally runs on viewport entry so the growth is visible. If future accessibility review requires a reduced-motion opt-out for counters, add a scoped prop rather than reverting to library scroll-spy behavior.
- This pass does not change Supabase forms, admin CMS, article structure, or broad legacy project migration.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-25 (Page Title Typography)

### Scope
- Promoted the Projects page title typography to the global public page H1 style.
- Changed `.urblo-page-title` to use `Avenir LT Std`, light `300`, normal letter spacing, and no forced uppercase.
- Replaced Projects and legacy project detail H1s with the shared page title class.
- Replaced Article detail's previous Space Grotesk uppercase H1 with the shared page title class plus a white inverse modifier for the image hero.
- Left homepage hero, card titles, section headings, Stone Library specs headings, and project material-map hero typography unchanged because they are different hierarchy roles.
- Updated design, handoff, roadmap, worklog, and machine task docs.

### Changed Files
- `src/index.css`
- `src/pages/Projects.tsx`
- `src/pages/ProjectDetails.tsx`
- `src/pages/ArticlePage.tsx`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: `/projects`, `/products`, `/stone-library`, `/our-story`, `/contact`, `/articles`, one article detail route, one product detail route, one stone detail route, and one no-banner route state all use `Avenir LT Std`, weight `300`, no forced uppercase, and zero horizontal overflow for page H1s.
- Browser QA: mobile `/contact` and the long article detail title have zero horizontal overflow after adding page-title wrapping and increasing the article hero image height.

### Risks and Gaps
- Further editorial/title content can still create unusual wrapping, but current long Contact and article-detail cases are checked at desktop and 390px mobile.
- This pass does not change card, section, tool, or homepage hero typography.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-25 (Stone Library Image Label Readability)

### Scope
- Improved Stone Library image overlay labels after user feedback that small black-on-image labels were hard to read.
- Changed detail-stage image provenance labels, Zoom affordance, and collapsed finish labels to use dark translucent backplates with white text.
- Used Urblo lime as a restrained confirmed/action signal instead of a broad overlay fill, so pending/reference imagery does not read as approved and stone texture remains inspectable.
- Unified Stone Library list-card `Available` and `Upcoming` image badges with the same overlay language.
- Updated the design contract, handoff, roadmap, and machine task queue.

### Changed Files
- `src/components/stone-library/ImageStage.tsx`
- `src/components/stone-library/FinishLightbox.tsx`
- `src/components/stone-library/StoneCard.tsx`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: `/stone-library` list badges and `/stone-library/blueocean`, `/stone-library/harcourt`, `/stone-library/tuscany`, and `/stone-library/juparana` detail overlays render with generated dark translucent backgrounds and white text at 1280px.
- Browser QA: `/stone-library` and `/stone-library/harcourt`, `/stone-library/blueocean`, and `/stone-library/juparana` remain readable at 390px; `/stone-library/juparana` also remains readable at 320px, with no page-level horizontal overflow and no collision between the left provenance label and right Zoom action.

### Risks and Gaps
- This pass improves label contrast and UI consistency; it does not change remaining Stone Library source-image coverage gaps such as Harcourt pending imagery.
- Browser QA caught unsupported Tailwind opacity shorthands during the pass; the affected Stone Library classes were replaced with generated opacity tokens before final gates.
- Final production contrast should still be rechecked after any future HD image swap, especially on very bright or highly patterned stone photos.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-25 (Stone Library Status Pill Consistency)

### Scope
- Followed up on the external Stone Library `Available` states after user feedback that the outside status badges also needed the same polish.
- Added a shared `StatusPill` component for Stone Library status presentation across light, dark, and image-overlay contexts.
- Converted detail header status, variant status, finish selector status, Specs availability summary, Finish Capability rows, Cut Options rows, and card status badges to the same lightweight status system.
- Reworked external availability badges into a lighter lime ghost treatment after user feedback that black status blocks felt too heavy for Urblo.
- Removed broad lime fills from external availability badges; Urblo lime now appears as a thin outline/wash and small confirmed-available signal.
- Left missing-data and empty-state text as plain copy rather than turning every `TBC` or `No` string into status chrome.

### Changed Files
- `src/components/stone-library/StatusPill.tsx`
- `src/components/stone-library/StoneCard.tsx`
- `src/pages/StoneLibraryDetailPage.tsx`
- `src/components/stone-library/VariantSwitch.tsx`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/SpecsPanel.tsx`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: Stone Library list, Juparana detail, and Harcourt detail status pills render with no heavy black status blocks at desktop and 390px mobile widths, and the checked routes have no page-level horizontal overflow.

### Risks and Gaps
- The price tier meter still uses Urblo lime bars by design; it is a price scale, not an availability badge.
- Production contrast should be checked again after any future Stone Library visual system change or image source swap.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-25 (Homepage Edge Hero Reveal)

### Scope
- Reworked the homepage first viewport after user feedback that the logo, nav, and hero copy were too constrained by the centered page container.
- Added an edge-aligned container for the global header and homepage hero while leaving standard content pages on the normal readable page container.
- Replaced the old first-viewport `Stone Solutions for Street` headline and support copy with three sequential hero lines: `Design.`, `Source.`, `Deliver.`
- Restricted Urblo green to the punctuation dots and made the line reveal reduced-motion aware.
- Recorded the edge-aligned hero/header pattern in the design contract and machine task queue.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/components/site/SiteHeader.tsx`
- `src/data/homepage.ts`
- `src/index.css`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Playwright screenshot QA: homepage checked at 1440x900 and 390x844 after animation settle; header/hero edge alignment, full-viewport video/poster treatment, and no hero text overflow were verified visually.

### Risks and Gaps
- The desktop hero video remains the controlled static MP4 with mobile poster-only behavior; Cloudflare preview should still verify actual LCP/network behavior after deployment.
- The edge container is intentionally limited to the global header and homepage first viewport; future full-bleed sections should opt in deliberately rather than replacing the standard content container.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-26 (Homepage Hero Reference Alignment)

### Scope
- Adjusted the homepage hero after the user clarified the Richard Crookes reference target.
- Changed the verb stack to all caps: `DESIGN.`, `SOURCE.`, `DELIVER.`
- Offset the second line, reduced the hero type scale, and lowered the stack closer to the viewport bottom.
- Changed hero motion from an upward line reveal to a letter-by-letter left-to-right reveal, while preserving reduced-motion behavior.
- Rechecked desktop and mobile first-viewport rendering and mobile menu interaction.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA at 1440x900: all-caps hero, edge-aligned first line, second-line offset, smaller type, lower bottom anchoring, and no top clipping render correctly.
- Browser QA at 390x844: no horizontal overflow; all three lines fit and remain readable over the poster frame.
- Browser animation QA: mid-animation state shows `DESIGN.` complete while `SOURCE.` is partially revealed and `DELIVER.` is still hidden, matching the requested first-line, second-line, third-line sequencing.
- Browser interaction QA: mobile header menu button resolves uniquely, opens successfully, and exposes nav links.
- Browser console: only the expected Framer Motion reduced-motion warning was present because the test browser has reduced motion enabled.

### Risks and Gaps
- The Browser test environment had reduced motion enabled; the reduced-motion path still preserves visible letter sequencing with shorter fades, while the normal path keeps the same line and character delays with slightly more motion.
- The hero remains tied to the current controlled video/poster asset; Cloudflare preview should still verify real network and LCP behavior after deployment.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-26 (GitHub Pages SPA Fallback)

### Scope
- Investigated direct URL 404s on GitHub Pages for clean React routes such as `/stone-library/angola-black`.
- Confirmed direct GitHub Pages requests were returning the platform 404 before the React app loaded, while client-side navigation worked after the app was already running.
- Added a short-term GitHub Pages deploy step that copies `dist/index.html` to `dist/404.html` after build, allowing GitHub Pages missing-file fallback to load the SPA.
- Documented that this does not replace Cloudflare Pages routing; Cloudflare remains the production launch target and continues to rely on `public/_redirects`.

### Changed Files
- `.github/workflows/deploy.yml`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `curl -I https://jayyy-3.github.io/stone-library/angola-black`: confirmed current live GitHub Pages platform 404 before the fix is deployed.
- `git show origin/gh-pages:404.html`: confirmed the deployed branch currently has no `404.html`.
- `npm run build`: pass. Browserslist staleness notice remains.
- `test -f dist/index.html && cp dist/index.html dist/404.html && cmp -s dist/index.html dist/404.html`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Post-deploy `origin/gh-pages:404.html`: confirmed `404.html` exists and matches the Urblo app shell.
- Post-deploy `curl -sS -D - https://jayyy-3.github.io/stone-library/angola-black`: returns GitHub Pages HTTP 404 status with the Urblo app shell body, not the default GitHub platform 404 body.
- Browser verification: direct visit to `https://jayyy-3.github.io/stone-library/angola-black` renders `Stone Detail | Urblo`, `h1` = `Angola Black`, and the stone detail content.

### Risks and Gaps
- GitHub Pages may still return HTTP 404 status for fallback-served deep links even though the React app renders the requested route; this is acceptable only as a short-term preview fix.
- Cloudflare Pages should remove the need for this workaround by serving clean routes through `public/_redirects` with a 200 fallback.
- Live GitHub Pages behavior has been confirmed after the pushed workflow deployed `gh-pages`; keep treating it as a preview-only compatibility patch.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-26 (Homepage Proof Section Update)

### Scope
- Removed the rendered homepage sustainability/tabbed feature module from the page flow by request.
- Moved the homepage proof metrics section into the removed module's position, directly after the hero.
- Replaced the previous team-assistance copy with `Stone has always shaped cities.` and `We shape how stone is designed, specified, and delivered.`
- Replaced the metrics with 50+ projects delivered, 130+ tonnes of CO2 offset, 20+ landscape architects nominated, and 3500+ linear metres stone blocks delivered.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- Browser verification on `http://127.0.0.1:5174/`: pass. The old sustainability copy and old team copy are absent; the new proof copy appears in section 1 directly after the hero; the partner banner follows the proof metrics section.
- Browser scrolled verification: pass. Metrics animate to 50+, 130+, 20+, and 3,500+ with the requested labels.

### Risks and Gaps
- The old sustainability/tabbed module code remains available but is disabled from the rendered homepage flow. Treat any future reintroduction as a design/content rebuild, not a simple toggle-on.
- The updated CO2 and delivery metrics are client-supplied copy in this task; deeper substantiation should be handled during CMS/content governance.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-26 (Homepage Partner Banner Copy)

### Scope
- Replaced the homepage partner banner copy with `Design-led stone solutions for streetscapes & civil landscapes.`
- Changed the banner component to render the copy from `src/data/homepage.ts` instead of keeping a separate hardcoded JSX sentence.
- Highlighted `Design-led` in Urblo lime while keeping the remainder of the banner sentence white.
- Updated the brand baseline anchor line so future agents do not revive the old trusted-partner wording.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `docs/brand-baseline.md`
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser DOM verification on `http://127.0.0.1:5174/`: pass. The partner banner section text is `Design-led stone solutions for streetscapes & civil landscapes.`, and the old trusted-partner sentence is absent from the rendered section.
- Browser style verification on `http://127.0.0.1:5174/`: pass. `Design-led` renders as a separate span with computed color `rgb(0, 255, 25)`, matching `--urblo-lime`.
- `npx playwright screenshot --wait-for-timeout=2500 --full-page --viewport-size=1280,720 http://127.0.0.1:5174/ /tmp/urblo-home-fullpage-partner-banner-check.png`: captured supplemental visual evidence.

### Risks and Gaps
- Browser screenshot capture through the in-app Browser timed out once; DOM verification and Playwright screenshot fallback were used instead.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-26 (Capabilities CTA and Route)

### Scope
- Added a lightweight `Our Capabilities` CTA under the homepage proof-section intro copy.
- Added `/capabilities` as a dedicated provisional capability page covering design translation, specification support, sourcing/fabrication, and delivery coordination.
- Updated route metadata, smoke route coverage, and Harness docs so the new public route is tracked.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/pages/CapabilitiesPage.tsx`
- `src/App.tsx`
- `scripts/agent-smoke.sh`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/capabilities` route shell and the homepage capabilities CTA target.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- In-app Browser verification on `http://127.0.0.1:5174/`: pass. The homepage renders exactly one `Our Capabilities` link with `href="/capabilities"`, and clicking it navigates to `/capabilities` with title `Capabilities | Urblo`.
- In-app Browser rendered-content verification: pass. `/capabilities` renders `Our Capabilities`, `Design translation`, and `Delivery coordination`. Console warnings were limited to the existing reduced-motion environment notice.
- Playwright screenshot fallback on `http://127.0.0.1:5174/`: pass. Desktop and 390px mobile screenshots confirmed the homepage CTA placement and `/capabilities` page render with no console errors or mobile horizontal overflow. The fallback was used because in-app Browser screenshot capture timed out twice.

### Risks and Gaps
- `/capabilities` copy is provisional and should be replaced with client-approved capability content before treating it as final launch messaging.
- The route currently reuses the projects banner until dedicated capability imagery is approved.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-26 (Supabase Execution Task Breakdown)

### Scope
- Confirmed the Supabase execution path should start with the accessible Urblo project, not manual dashboard table creation.
- Split the Supabase work into foundation migration, baseline seed, forms backend, admin auth shell, and later content CRUD phases.
- Added explicit acceptance criteria for migrations, table existence, RLS policy inspection, lead row creation, and no browser-exposed service-role secrets.
- Added a reviewed migration directory scaffold for future SQL migration files.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `supabase/migrations/README.md`

### Verification Results
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The Supabase project exists and is connector-accessible, but no production migration has been applied yet.
- First admin email, browser-safe anon-key handling, Turnstile secrets, and transactional email secrets are still needed before the admin and form flows can be considered production-ready.
- Cloudflare Pages project creation remains separate from Supabase execution and may still require resolving Hunter account Pages API permissions or choosing Jay's account for Pages.

### Next Handoff
- `NOW-SUPABASE-FOUNDATION-001`
- `NOW-SUPABASE-SEED-BASELINE-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-27 (Supabase Foundation Applied)

### Scope
- Added reviewed Supabase foundation migrations under `supabase/migrations`.
- Applied `foundation_schema`, `foundation_hardening`, and `anon_read_only` to Supabase project `npkidywzwddbnfrnxlmo`.
- Created launch foundation tables for admin profiles, audit events, media assets, site settings, finish definitions, Stone Library, Products, Projects, Articles, enquiries, sample requests, and sample request items.
- Added `updated_at` triggers, admin-role helper functions, status/FK/listing indexes, operational new-lead partial indexes, anonymous read-only grants for public content, and RLS policies.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `supabase/migrations/README.md`
- `supabase/migrations/202605270001_foundation_schema.sql`
- `supabase/migrations/202605270002_foundation_hardening.sql`
- `supabase/migrations/202605270003_anon_read_only.sql`

### Verification Results
- Supabase migration list: pass. `foundation_schema`, `foundation_hardening`, and `anon_read_only` are listed on project `npkidywzwddbnfrnxlmo`.
- Supabase table existence check: pass. 24 expected foundation tables exist in `public`.
- Supabase RLS check: pass. 24/24 public foundation tables have RLS enabled.
- Supabase policy summary: pass. Public content tables have public-select policies plus admin policies; lead/admin private tables have admin policies and no public-select policies.
- Supabase private grant check: pass. `anon` has no SELECT/INSERT/UPDATE/DELETE grants on `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, or `sample_request_items`.
- Supabase public grant check: pass. `anon` has SELECT and no INSERT/UPDATE/DELETE on checked public content tables.
- Supabase FK index check: pass. No public-schema foreign-key columns are missing an index after hardening.
- Supabase operational queue index check: pass. `enquiries_new_queue_idx` and `sample_requests_new_queue_idx` exist.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass. Existing public route shells, redirects, and CTA contracts remain green.

### Risks and Gaps
- No seed data exists yet; `finish_definitions` and `site_settings` remain empty until `NOW-SUPABASE-SEED-BASELINE-001`.
- No first admin user has been created because that requires Jay to confirm the first admin email.
- No runtime code is connected to Supabase yet; public pages remain static/file-backed and forms remain mailto/local-only until the forms backend checkpoint.
- Supabase Storage buckets/policies are not implemented yet; media CRUD remains part of the admin media checkpoint.

### Next Handoff
- `NOW-SUPABASE-SEED-BASELINE-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-27 (Supabase Baseline Seed Applied)

### Scope
- Added the baseline seed migration under `supabase/migrations`.
- Applied `baseline_seed` to Supabase project `npkidywzwddbnfrnxlmo`.
- Seeded the first published finish dictionary from the current Stone Library data.
- Seeded one published default Urblo `site_settings` row with contact, social, footer, and SEO baseline values.
- Updated Harness docs so the next executable checkpoint is the forms backend.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `supabase/migrations/README.md`
- `supabase/migrations/202605270004_baseline_seed.sql`

### Verification Results
- Supabase migration list: pass. `baseline_seed` is listed on project `npkidywzwddbnfrnxlmo`.
- Supabase finish seed check: pass. `finish_definitions` contains 12 rows and 12 distinct finish keys.
- Supabase site settings check: pass. `site_settings` contains one published `default` row.
- Supabase idempotency check: pass. Rerunning the seed upsert kept counts at 12 distinct finishes and one default settings row.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- Public runtime is still static/file-backed and does not read this seed data yet.
- Contact and Sample Request still depend on local/mailto behavior until `NOW-FORMS-BACKEND-001`.
- No first admin user has been created because that requires Jay to confirm the first admin email.
- Supabase Storage buckets, media policies, Auth UI, and admin CRUD are still pending.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-27 (Forms Backend Source and Contact Submit Flow)

### Scope
- Added Cloudflare Pages Function source for `/api/enquiries` and `/api/sample-requests`.
- Added shared server-side validation, Turnstile fail-closed behavior when configured, Supabase REST writes using server-side credentials, and staged Resend notification handling.
- Reworked the Contact page so the main enquiry flow submits to `/api/enquiries` instead of opening a local email draft.
- Added Contact page Sample Request mode at `/contact?intent=sample-request`, with sample preference, finish, quantity, project name, shipping address, and notes fields that submit to `/api/sample-requests`.
- Updated footer/sample request CTA contracts to route to the Contact sample-request mode.
- Added `scripts/check-forms-api.mjs` and wired it into `npm run agent:smoke` so invalid submissions, valid Supabase write payloads, sample request item payloads, and Turnstile failure behavior are checked without secrets.

### Changed Files
- `functions/_lib/forms.js`
- `functions/api/enquiries.js`
- `functions/api/sample-requests.js`
- `scripts/check-forms-api.mjs`
- `scripts/agent-smoke.sh`
- `src/pages/ContactPage.tsx`
- `src/data/siteChrome.ts`
- `src/data/homepage.ts`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `node scripts/check-forms-api.mjs`: pass. Valid enquiry targets `enquiries`; invalid enquiry returns validation failure before Supabase calls; valid sample request targets `sample_requests` and `sample_request_items`; configured Turnstile failure returns 403 before Supabase calls.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including the Forms API checks and updated Sample Request CTA route contracts.
- Playwright screenshot check: partial pass. A 390px mobile screenshot of `/contact` rendered without visible first-viewport layout breakage. Follow-up screenshots for `/contact?intent=sample-request` were blocked by local Playwright browser launch failures after the first capture.

### Risks and Gaps
- Live API row creation through `/api/enquiries` and `/api/sample-requests` has not been run because no local or Cloudflare server-side `SUPABASE_SERVICE_ROLE_KEY` is configured in the environment.
- Turnstile and Resend notification code is staged but not production-verified because those secrets are not configured.
- `NOW-FORMS-BACKEND-001` should stay open until live endpoint tests prove valid submissions create Supabase rows and invalid submissions create no rows.
- Admin lead inbox and status updates are still pending under the admin auth/media/leads tasks.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

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
