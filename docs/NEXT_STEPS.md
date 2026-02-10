# NEXT_STEPS - Urblo Execution Backlog

Last updated: 2026-02-09

## Current Objective
Raise delivery readiness baseline (brand assets + UI completeness), close route integrity gaps, and align high-impact pages with approved Figma/WordPress references before later performance and data-quality refinements.

## Blocking Quality Gate Policy
A task touching runtime behavior is not complete unless all three pass:
- `npm run build`
- `npm run lint`
- `npx tsc -b`

## Current Baseline (Measured 2026-02-09)
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass

## Advisory Brand Gate (Non-Blocking)
For any user-facing layout/copy/IA task:
- Reference relevant sections in `/Users/lee/Documents/SAI/urblo/urblo-react/docs/brand-baseline.md`.
- Include a short brand alignment note in task delivery.
- If implementation cannot satisfy baseline yet, record explicit gap and follow-up ID.

## Completed This Cycle

### DONE-STONELIB-001
- Scope:
  - Removed legacy materials route family.
  - Introduced Stone Library list/detail experience with filter + variant + finish accordion UX.
  - Migrated product body-stone options to Stone Library service output.
- Key files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/App.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/StoneLibraryPage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/StoneLibraryDetailPage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/service/StoneLibraryService.ts`

### DONE-LINT-001
- Scope:
  - Resolved lint gate by excluding generated `.vite/**` output from ESLint scope.
- Key file:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/eslint.config.js`

### DONE-STONELIB-002
- Scope:
  - Corrected Stone Library variant rules for Golden Crust, Harcourt, and Tuscany.
  - Applied variant normalization guard in service layer to prevent future source drift from leaking to UI.
  - Switched Products Body Stone selector to group-level options (no variant options).
- Key files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/data/clean/stone_library.json`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/data/clean/stone_variants.csv`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/service/StoneLibraryService.ts`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/ProductDetailPage.tsx`

### DONE-STONELIB-UX-ACC-001
- Scope:
  - Reworked Stone Library detail into synchronized dual-control interaction:
    - Left image accordion switched to click-select behavior.
    - Right finish list is click-select only (no hover-triggered switching).
  - Removed heavy dark image overlays and in-image active caption block.
  - Added full-screen finish lightbox with keyboard navigation and 2x zoom/pan for texture inspection.
  - Stabilized active panel rendering with fixed 3:2 ratio and narrow collapsed panels.
- Key files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/ImageStage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/FinishAccordion.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/FinishLightbox.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/StoneLibraryDetailPage.tsx`

### DONE-STONELIB-UX-CENTER-001
- Scope:
  - Updated Stone Library detail finish interaction to left/right click-only selection.
  - Removed left-stage hover/focus finish state mutation and simplified page state to lock/default precedence.
  - Added finish selection centering behavior so each finish click re-centers the active left-stage panel with smooth horizontal scroll.
- Key files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/ImageStage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/StoneLibraryDetailPage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/ARCHITECTURE.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/NEXT_STEPS.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/WORKLOG.md`

### DONE-STONELIB-UX-FILL-001
- Scope:
  - Added low-finish stage fill behavior so non-active finish panels expand to remove unused viewport space.
  - Kept active finish panel fixed at 3:2 while distributing remaining width to non-active panels.
  - Added single-finish centering rule (3:2 panel centered instead of stretching full width).
  - Kept existing visibility-guarded scroll policy (no movement when active panel is fully visible).
- Key files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/ImageStage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/ARCHITECTURE.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/NEXT_STEPS.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/WORKLOG.md`

### DONE-STONELIB-UX-REFINE-001
- Scope:
  - Refactored ImageStage width/scroll behavior into stable single-pass flows to remove occasional non-centering regressions.
  - Kept click-only selection with visibility-check scroll policy, but changed motion style to immediate width updates plus smooth scroll only when clipped.
  - Added strict-mode guard so one center token triggers one effective scroll decision.
- Key files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/ImageStage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/ARCHITECTURE.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/NEXT_STEPS.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/WORKLOG.md`

### DONE-STONELIB-LAYOUT-001
- Scope:
  - Closed Stone Library detail layout stretch issue after user acceptance of the implemented behavior.
  - Removed `NEXT-STONELIB-LAYOUT-001` from active backlog and kept completion trace in docs.
- Key files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/StoneLibraryDetailPage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/ImageStage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/FinishAccordion.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/NEXT_STEPS.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/WORKLOG.md`

### DONE-STONELIB-PRICE-001
- Scope:
  - Replaced plain `$ / $$ / $$$` price text with a scannable 3-level tier meter (`Budget / Balanced / Premium`).
  - Kept original `$` source notation as secondary trace text and added graceful fallback to `Price on request` for `tbc` or missing tier values.
- Key files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/SpecsPanel.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/service/StoneLibraryService.ts`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/types/stone-library.ts`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/StoneLibraryDetailPage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/NEXT_STEPS.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/WORKLOG.md`

### DONE-POPUP-001
- Scope:
  - Fixed welcome popup persistence so first display writes `seenPopup=true` and subsequent visits do not re-show the popup.
  - Added timer cleanup to prevent delayed state updates after unmount.
- Key files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/WelcomePopup.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/ARCHITECTURE.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/README_AGENT.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/WORKLOG.md`

## Now

### NOW-STONELIB-IMG-FASTTRACK-001
- Objective: Fast-track replacement of Stone Library placeholder images using user-provided finish assets.
- Problem statement: Most finish assets are now available from stakeholder handoff, but list/detail still display placeholder states for unmapped entries.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/stoneFinishImages.ts`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/service/StoneLibraryService.ts`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/StoneCard.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/ImageStage.tsx`
- Implementation notes:
  - Prioritize direct mapping of handed-over finish images to existing stone group/variant/finish keys.
  - Keep placeholder fallback only for truly missing assets and track those residual gaps explicitly.
  - Treat this as Phase 1 delivery, with `NEXT-STONELIB-IMG-001` continuing as Phase 2 full coverage/QA.
- Definition of Done:
  - All provided finish images are mapped and visible in Stone Library list/detail where keys exist.
  - Placeholder usage is reduced to only not-yet-provided assets.
  - Residual unmapped finish list is recorded under `NEXT-STONELIB-IMG-001`.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

### NOW-DELIVERY-READINESS-001
- Objective: Remove template/default assets and visible placeholder UI that block production handoff.
- Problem statement: The app shell and several surfaces still show non-delivery defaults or placeholders (e.g. Vite favicon/title, empty feature icons, placeholder icon slots, dead social links).
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/index.html`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/FeatureSection.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/panels/ProcessSliderPanel.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/Footer.tsx`
- Implementation notes:
  - Replace default Vite shell metadata (`/vite.svg`, `Vite + React + TS`) with Urblo brand assets and title contract.
  - Replace empty icon stubs with approved icon set.
  - Resolve dead footer social anchors (`href="#"`) with real links or explicit hide rule.
- Definition of Done:
  - No user-visible template defaults remain in app shell.
  - No empty/placeholder icon containers remain in active UI.
  - Footer contains no dead external social links.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

### NOW-ASSET-STRATEGY-001
- Objective: Decide and document image hosting strategy for current phase and delivery phase.
- Problem statement: Runtime currently depends on many hard-coded external `urblo.com.au/wp-content/uploads/...` assets, which creates coupling and delivery risk if source URLs change.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/ARCHITECTURE.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/NEXT_STEPS.md`
  - runtime references under `/Users/lee/Documents/SAI/urblo/urblo-react/src/**` and `/Users/lee/Documents/SAI/urblo/urblo-react/data/**`
- Implementation notes:
  - Make an explicit phase decision:
    - Phase A (current): keep WordPress-hosted assets with fallback and broken-link checks.
    - Phase B (delivery): mirror critical assets to controlled storage (`public/` or CDN bucket) and update references.
  - Record ownership and migration trigger (what condition forces Phase B start).
- Definition of Done:
  - Image hosting policy is explicitly approved and recorded in docs.
  - A migration trigger and owner are documented.
  - If Phase B is selected now, migration scope is converted into executable tasks.
- Verification commands:
  - `npm run build` (if code references changed)
  - `npm run lint` (if code references changed)
  - `npx tsc -b` (if code references changed)

### NOW-ROUTE-002
- Objective: Finish route/CTA integrity by removing unresolved footer destinations.
- Problem statement: Footer still points to `/sample-request` and `/contact`, but both routes are undeclared.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/Footer.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/App.tsx` (if adding explicit contact route)
- Implementation notes:
  - Choose one approach and keep contract explicit: convert to `mailto/tel`, add real route(s), or remove links.
  - Replace raw in-app anchors with router-safe links where route exists.
- Definition of Done:
  - Footer no longer links to undeclared in-app paths.
  - Navigation contract in `ARCHITECTURE.md` matches code.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

### NOW-DOCS-002
- Objective: Enforce docs closure discipline after contract-level code changes.
- Problem statement: Large route/data refactors can be shipped without synchronized docs unless closure is explicit.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/README_AGENT.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/ARCHITECTURE.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/NEXT_STEPS.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/WORKLOG.md`
- Implementation notes:
  - Keep a mandatory “Delivery Closure Guardrail” checklist in README_AGENT.
  - Add worklog entry for every contract change session with gate evidence.
- Definition of Done:
  - Docs and code route/data contracts remain synchronized at handoff.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

## Next

### NEXT-UI-PARITY-001
- Objective: Reproduce approved Home / Our Story / Articles / Contact Us UI from existing Figma and WordPress implementations.
- Problem statement: Current React pages are functionally present but not yet aligned to approved design/system parity for delivery.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/Home.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/OurStory.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/ArticlesPage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/ArticlePage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/App.tsx` (for Contact route declaration)
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/Header.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/Footer.tsx`
- Implementation notes:
  - Use Figma as source-of-truth for spacing/typography/component behavior.
  - Use WordPress UI as behavior/content reference where Figma omits details.
  - Split delivery into page-by-page checkpoints: Home -> Our Story -> Articles -> Contact Us.
  - Keep responsive parity (desktop/tablet/mobile) and route-safe navigation contracts.
- Definition of Done:
  - The four target pages reach agreed parity versus design/reference baseline.
  - Contact Us has explicit route and UX contract in router + nav surfaces.
  - Parity evidence (before/after screenshots + gap list) is captured in worklog.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

### NEXT-SAMPLE-REQUEST-001
- Objective: Define and stage Sample Request capability for later implementation.
- Problem statement: Sample Request is needed for product flow but implementation path (form stack, submission target, notification, storage) is not yet decided.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/App.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/Footer.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/ARCHITECTURE.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/NEXT_STEPS.md`
- Implementation notes:
  - Run decision spike first: `mailto` fallback vs third-party form backend vs custom API/serverless.
  - Define minimum contract: required fields, anti-spam, consent, analytics event, and success/error UX.
  - Keep route/CTA inactive or explicitly marked until contract is approved.
- Definition of Done:
  - Chosen implementation path is documented with constraints and owner.
  - Route and CTA behavior for pre-launch phase is explicit and non-broken.
  - Follow-up build task exists with implementation-ready acceptance criteria.
- Verification commands:
  - `npm run build` (if runtime behavior changed)
  - `npm run lint` (if runtime behavior changed)
  - `npx tsc -b` (if runtime behavior changed)

### NEXT-STONELIB-IMG-001
- Objective: Complete Stone Library finish imagery coverage after fast-track ingestion.
- Problem statement: After `NOW-STONELIB-IMG-FASTTRACK-001`, remaining finishes still require full HD coverage, QA validation, and long-tail mapping closure.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/stoneFinishImages.ts`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/service/StoneLibraryService.ts`
- Implementation notes:
  - Close long-tail per-variant/per-finish mapping gaps left after fast-track.
  - Validate resolution, crop behavior, and consistency across list/detail breakpoints.
  - Keep graceful fallback behavior for missing assets until all approved images arrive.
- Definition of Done:
  - All priority stones/finishes display intended HD images in list and detail views.
  - No approved finish remains on placeholder imagery.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

### NEXT-STONELIB-IMG-002
- Objective: Define and implement how secondary finish frames (`_2`) should be shown without breaking current comparison flow.
- Problem statement: Multiple finishes now have paired assets (`_1` + `_2`), but runtime currently uses `_1` only and has no UX contract for exposing `_2`.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/stoneFinishImages.ts`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/ImageStage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/FinishAccordion.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/NEXT_STEPS.md`
- Implementation notes:
  - Keep `_1` as default visual for all finishes unless user explicitly switches view.
  - Decide one explicit `_2` interaction model (e.g., alternate frame toggle, detail lens, or split compare) and avoid mixing patterns.
  - Define authoring rules for future pairs (naming, fallback, and when `_2` is optional vs required).
- Definition of Done:
  - `_2` rendering behavior is documented and implemented with clear trigger rules.
  - Interaction works on desktop and mobile without desynchronizing active finish state.
  - Missing `_2` assets degrade gracefully to `_1` without placeholder regression.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

### NEXT-STONELIB-DATA-001
- Objective: Replace generic finish behavior text with approved product/engineering notes.
- Problem statement: Current behavior copy is a general fallback table and not project-calibrated.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/finishBehaviorMeta.ts`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/FinishAccordion.tsx`
- Implementation notes:
  - Add validated slip/glare/maintenance notes by finish.
  - Ensure wording remains non-absolute and context-safe.
- Definition of Done:
  - Finish behavior notes are reviewed and specific enough for designer decision support.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

### NEXT-DATA-001
- Objective: Unify project list/detail data source to prevent drift.
- Problem statement: Project list metadata is maintained in `Projects.tsx` while detail data is maintained in `projectData.ts`, creating duplicate maintenance paths.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/Projects.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/projectData.ts`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/ProjectDetails.tsx`
- Implementation notes:
  - Define one typed project source that serves both list and detail pages.
  - Keep slug identity and rendering contract stable.
- Definition of Done:
  - List and detail pages use one shared typed data source.
  - No duplicated project metadata blocks remain.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

## Later

### LATER-BRAND-001
- Objective: Align homepage feature modules with brand baseline pillars and proof framing.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/FeatureSection.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/panels/SustainabilityPanel.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/panels/InstallStepsPanel.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/panels/CostComparePanel.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/panels/ProcessSliderPanel.tsx`

### LATER-PERF-001
- Objective: Reduce client bundle size and improve chunk strategy.
- Problem statement: Current build emits a large JS chunk warning (`>500kB`).
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/vite.config.ts`
  - route/page modules under `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages`

### LATER-QA-001
- Objective: Add automated route smoke coverage for declared routes and key CTAs.
- Affected files:
  - test tooling to be introduced under repo root
  - route source `/Users/lee/Documents/SAI/urblo/urblo-react/src/App.tsx`

## Exit Criteria for Current Cycle
- `NOW-STONELIB-IMG-FASTTRACK-001`, `NOW-DELIVERY-READINESS-001`, `NOW-ASSET-STRATEGY-001`, `NOW-ROUTE-002`, and `NOW-DOCS-002` are complete.
- All three quality gates pass.
- Navigation and route contracts are consistent with `src/App.tsx` and `src/components/Footer.tsx`.
- Delivery shell is free of template/default app metadata and dead social links.
- Stone Library data/image follow-ups are explicitly tracked, not implied complete.
