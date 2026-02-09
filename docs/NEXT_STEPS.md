# NEXT_STEPS - Urblo Execution Backlog

Last updated: 2026-02-09

## Current Objective
Close remaining route integrity gaps after Stone Library migration, keep docs and code contracts synchronized, and then continue performance and data-quality improvements.

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

## Now

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

### NEXT-STONELIB-IMG-001
- Objective: Integrate production HD finish imagery into Stone Library accordion.
- Problem statement: Current image mapping is partial and relies on fallback placeholders.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/stoneFinishImages.ts`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/service/StoneLibraryService.ts`
- Implementation notes:
  - Add per-variant and per-finish image mappings.
  - Keep graceful fallback behavior for missing assets.
- Definition of Done:
  - All priority stones/finishes display intended HD images in list and detail views.
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

### NEXT-STONELIB-UX-ACC-001
- Objective: Upgrade Stone Library detail visual interaction from single image stage to true dual-side synchronized image accordion.
- Problem statement: Current detail page supports finish hover/click sync on the right list only. Left media stage is still a single static panel and does not support accordion panel interaction.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/StoneLibraryDetailPage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/ImageStage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/FinishAccordion.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/stoneFinishImages.ts`
- Implementation notes:
  - Replace left-side single image with horizontal multi-panel image accordion.
  - Default state: all panels collapsed-narrow; active panel expands.
  - Interaction contract: hover/click on either side (left panel or right finish list) must synchronize active finish.
  - Desktop: hover preview + click lock; mobile: tap lock.
  - Expanded panel supports overlay content (title/subtitle/CTA); collapsed panel shows compact label/icon.
  - Keep smooth width/opacity transitions and keyboard accessibility.
- Definition of Done:
  - Left and right controls remain state-consistent in all interaction modes.
  - Accordion animation is smooth and layout remains stable on desktop/mobile.
  - No regression in finish metadata rendering.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

### NEXT-STONELIB-PRICE-001
- Objective: Replace plain `$ / $$ / $$$` display with a clearer visual price tier representation.
- Problem statement: Current price range text is semantically correct but weak in scanability and decision support.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/stone-library/SpecsPanel.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/service/StoneLibraryService.ts`
- Implementation notes:
  - Introduce 3-level tier meter UI (Budget / Balanced / Premium) mapped from existing tier/source data.
  - Preserve original `$` symbol text as secondary annotation for traceability.
  - Ensure `tbc` or missing tier values degrade gracefully to “Price on request”.
- Definition of Done:
  - Price information is visually scannable and still traceable to source data.
  - No assumptions are implied beyond available source metadata.
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
- `NOW-ROUTE-002` and `NOW-DOCS-002` are complete.
- All three quality gates pass.
- Navigation and route contracts are consistent with `src/App.tsx` and `src/components/Footer.tsx`.
- Stone Library data/image follow-ups are explicitly tracked, not implied complete.
