# HANDOFF - Current Agent State

Last updated: 2026-05-15

## Current Focus
Moon Gate is now the first Projects-system MVP:
- Project listing/detail metadata has been unified in `src/data/projectData.ts`.
- `Moon Gate | Woolley Street` uses local project imagery, a designer-facing case study narrative, project facts, scope framing, interactive material hotspots, featured material links, and gallery modules.
- The new `ProjectMaterialMap` component is the reusable pattern for future project case studies.

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
- `npm run build`: pass on 2026-05-15; existing bundle size warning remains.
- `npm run lint`: pass on 2026-05-15.
- `npx tsc -b`: pass on 2026-05-15.
- Playwright CLI visual QA: desktop and mobile Moon Gate detail page checked; hotspot hover/tap changed the active material card.
- `npm run agent:check`: pass on 2026-05-15.
- `npm run agent:smoke`: pass on 2026-05-15.
- `git diff --check`: pass on 2026-05-15.

## Active Risks
- Stone Library finish imagery still has placeholder/mapping gaps.
- App shell still has delivery-readiness debt around template/default assets and footer/social hygiene.
- Image hosting policy is undecided for WordPress-hosted runtime assets.
- GitHub Pages deployment workflow still needs hardening.
- Bundle size warning (`>500kB`) remains open.
- Moon Gate scope/design copy is intentionally MVP-inferred from supplied imagery and public project context; designer confirmation is still needed before final production claims.
- Other project pages still have legacy-level content and need migration into the material-map model.
- React Helmet still emits an existing strict-mode lifecycle warning in dev console.

## Next Recommended Action
Run remaining closure gates, then either commit the Moon Gate MVP or start `NEXT-PROJECTS-INTAKE-001` to define the reusable content intake template for future project migrations.

## Guardrails
- Use repo-root relative paths in committed docs.
- Keep current state short here; write detailed history in `docs/WORKLOG.md`.
- Do not use `docs/NEXT_STEPS.md` as the machine task queue; update `docs/agent/tasks.json` for task state.
