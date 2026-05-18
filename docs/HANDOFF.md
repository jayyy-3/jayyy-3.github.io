# HANDOFF - Current Agent State

Last updated: 2026-05-18

## Current Focus
Moon Gate is the first Projects-system material-map MVP:
- Project listing/detail metadata has been unified in `src/data/projectData.ts`.
- `Moon Gate | Woolley Street` now prioritizes project facts, a real project-photo material map, a compact material schedule, gallery evidence, and direct links into Stone Library.
- `ProjectMaterialMap` is intentionally material-first: hotspots identify stone/finish/application placement and resolve stone labels, finish labels, preview imagery, and links through `StoneLibraryService` where possible.
- Project archive/detail headings now use the live Urblo project typography pattern: `Avenir LT Std`, light hero/page H1, normal letter spacing, and no forced uppercase on the main title.

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
- `npm run build`: pass on 2026-05-18; existing bundle size warning remains.
- `npm run lint`: pass on 2026-05-18.
- `npx tsc -b`: pass on 2026-05-18.
- Playwright visual QA: desktop and mobile Moon Gate detail page checked locally; hotspot click changed the active material inspector, the legacy ACU detail page no longer showed Moon Gate copy, and project heading computed styles matched the live Avenir project-title pattern.
- `npm run agent:check`: pass on 2026-05-18.
- `npm run agent:smoke`: pass on 2026-05-18.
- `git diff --check`: pass on 2026-05-18.

## Active Risks
- Stone Library finish imagery still has placeholder/mapping gaps.
- App shell still has delivery-readiness debt around template/default assets and footer/social hygiene.
- Image hosting policy is undecided for WordPress-hosted runtime assets.
- GitHub Pages deployment workflow still needs hardening.
- Bundle size warning (`>500kB`) remains open.
- Moon Gate material/application notes are intentionally MVP-inferred from supplied imagery and public project context; designer confirmation is still needed before final production claims.
- Other project pages still have legacy-level content and need migration into the material-map model.
- React Helmet still emits an existing strict-mode lifecycle warning in dev console.

## Next Recommended Action
Start `NEXT-PROJECTS-INTAKE-001` to define the reusable content intake template for future project migrations.

## Guardrails
- Use repo-root relative paths in committed docs.
- Keep current state short here; write detailed history in `docs/WORKLOG.md`.
- Do not use `docs/NEXT_STEPS.md` as the machine task queue; update `docs/agent/tasks.json` for task state.
