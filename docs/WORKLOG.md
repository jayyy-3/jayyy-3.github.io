# WORKLOG - Urblo Execution Log

Last updated: 2026-05-15

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

## Entry Template (Use for Every Future Session)

### Date
- `YYYY-MM-DD`

### Scope
- What changed in this session.
- Why it changed.

### Changed Files
- Absolute file path list only.

### Verification Results
- `npm run build`: pass/fail (+ key notes)
- `npm run lint`: pass/fail (+ key notes)
- `npx tsc -b`: pass/fail (+ key notes)

### Risks and Gaps
- Open defects, unresolved tradeoffs, blocked items.

### Next Handoff
- Exact task IDs from `NEXT_STEPS.md` to run next.
