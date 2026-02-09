# NEXT_STEPS - Urblo Execution Backlog

Last updated: 2026-02-09

## Current Objective
Stabilize route/CTA integrity and engineering gates first, then progressively align IA/content execution with the brand baseline while preserving code-truth documentation.

## Blocking Quality Gate Policy
A task touching runtime behavior is not complete unless all three pass:
- `npm run build`
- `npm run lint`
- `npx tsc -b`

## Current Baseline (Measured 2026-02-09)
- `npm run build`: pass
- `npm run lint`: fail (3 errors from `.vite/deps/react-router-dom.js`, 1 hook warning in `src/pages/ProductDetailPage.tsx`)
- `npx tsc -b`: pass

## Advisory Brand Gate (Non-Blocking)
For any user-facing layout/copy/IA task:
- Reference relevant sections in `/Users/lee/Documents/SAI/urblo/urblo-react/docs/brand-baseline.md`.
- Include a short brand alignment note in task delivery.
- If implementation cannot satisfy baseline yet, record explicit gap and follow-up ID.

## Now

### NOW-ROUTE-001
- Objective: Restore route and CTA integrity so all primary navigation and key CTAs resolve to valid in-app behavior.
- Problem statement: Current nav/CTA links include undeclared paths (`/sample-request`, `/contact`, `/en-au/contact-us`) and internal raw anchors that are inconsistent with `HashRouter`.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/App.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/Header.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/Footer.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/Materials.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/EnquiryStrip.tsx`
- Implementation notes:
  - Decide for each unresolved destination: implement route, remap to existing route, or disable CTA with explicit copy.
  - Replace internal `<a href="/...">` usage with router-safe navigation approach compatible with `HashRouter`.
  - Remove duplicate `/products` route declaration in `App.tsx`.
- Definition of Done:
  - Header/footer/section CTAs no longer point to missing routes.
  - Internal navigation is router-consistent.
  - No duplicate route declarations in router config.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

### NOW-LINT-001
- Objective: Unblock lint gate and make lint results reflect repository source code only.
- Problem statement: `eslint .` currently scans generated `.vite/deps` output and fails with missing-rule-definition errors; there is also a React hook dependency warning in product detail page.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/eslint.config.js`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/ProductDetailPage.tsx`
- Implementation notes:
  - Update lint ignore scope to exclude generated runtime/build outputs (at minimum `.vite/**`, keep `dist/**` ignored).
  - Resolve hook dependency warning with a stable, explicit dependency strategy.
  - Re-run lint and ensure no hidden config regressions.
- Definition of Done:
  - `npm run lint` exits with code 0.
  - Lint output concerns only repository source files.
- Verification commands:
  - `npm run lint`
  - `npm run build`
  - `npx tsc -b`

### NOW-RUNBOOK-001
- Objective: Align engineering runbook and handoff instructions with actual Vite contracts.
- Problem statement: Legacy command assumptions and route expectations can cause agents to run incorrect checks or chase non-existent contracts.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/README_AGENT.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/ARCHITECTURE.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/NEXT_STEPS.md`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/docs/WORKLOG.md`
- Implementation notes:
  - Keep command contract explicitly tied to `package.json` and current repo scripts.
  - Keep quality gate order and blocking policy explicit.
  - Keep no-backend-API statement explicit until backend exists.
- Definition of Done:
  - Startup instructions are reproducible by a fresh agent session.
  - All docs share one consistent command contract.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

## Next

### NEXT-BRAND-001
- Objective: Align homepage feature modules with brand baseline pillars and proof framing.
- Problem statement: Existing home feature implementation partially reflects pillar topics but lacks explicit proof structure, claim context, and CTA funnel clarity expected by brand baseline.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/FeatureSection.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/panels/SustainabilityPanel.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/panels/InstallStepsPanel.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/panels/CostComparePanel.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/panels/ProcessSliderPanel.tsx`
- Implementation notes:
  - Add explicit claim context/assumptions where percentages or comparative statements are used.
  - Ensure each panel has outcome -> method -> proof -> next-step pattern.
  - Keep tone and claim style aligned with baseline guardrails.
- Definition of Done:
  - Homepage modules have evidence-backed narrative blocks and actionable next steps.
  - Claim language avoids universal/absolute framing.
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

### NEXT-CONTENT-001
- Objective: Harden article content pipeline and metadata integrity.
- Problem statement: Articles rely on static public JSON/HTML and manual consistency, with potential mismatch between metadata and content folders.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/public/articles/index.json`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/scripts/generate-article-index.ts`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/ArticlesPage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/ArticlePage.tsx`
- Implementation notes:
  - Normalize generation workflow for `index.json` and add checks for missing content/meta pairs.
  - Keep slug/date ordering deterministic.
- Definition of Done:
  - Article list and detail contracts are generated and validated from one repeatable process.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

## Later

### LATER-IA-001
- Objective: Implement persona-aware routing and CTA funnels (designer, contractor, government) per brand baseline.
- Problem statement: Current IA does not provide role-based pathways and intent-specific CTA routing.
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/Header.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/Home.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/ProductsPage.tsx`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/Projects.tsx`
- Implementation notes:
  - Add routing strategy for persona entry points and conversion-specific destination pages.
  - Keep advisory brand gate notes attached during design.
- Definition of Done:
  - Distinct persona pathways and CTAs exist and are testable.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

### LATER-PERF-001
- Objective: Reduce client bundle size and improve chunk strategy.
- Problem statement: Current build emits a large JS chunk warning (`>500kB`).
- Affected files:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/vite.config.ts`
  - Route/page modules under `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages`
- Implementation notes:
  - Introduce route-level code splitting and manual chunk strategy where appropriate.
  - Validate no routing regressions under `HashRouter`.
- Definition of Done:
  - Large chunk warning is removed or reduced to accepted documented threshold.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

### LATER-QA-001
- Objective: Add automated route smoke coverage for declared routes and key CTAs.
- Problem statement: Route/CTA validation is currently manual and easy to regress.
- Affected files:
  - test tooling to be introduced under repo root
  - route source `/Users/lee/Documents/SAI/urblo/urblo-react/src/App.tsx`
- Implementation notes:
  - Start with smoke checks for route render, nav integrity, and key CTA click paths.
  - Attach test evidence policy in docs when tooling is introduced.
- Definition of Done:
  - Automated smoke checks run locally and in CI for route/CTA critical paths.
- Verification commands:
  - `npm run build`
  - `npm run lint`
  - `npx tsc -b`

## Exit Criteria for Current Cycle
- `NOW-ROUTE-001`, `NOW-LINT-001`, and `NOW-RUNBOOK-001` are complete.
- All three quality gates pass.
- Navigation and route contracts are consistent with `src/App.tsx`.
- Brand-related non-aligned areas are tracked as explicit backlog items, not implied as complete.
