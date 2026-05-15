# HANDOFF - Current Agent State

Last updated: 2026-05-15

## Current Focus
Implement the Codex-first AI harness upgrade in two checkpoints:
- Phase 1: repo-local harness hygiene, machine-readable task state, docs checks, and slim roadmap.
- Phase 2: agent init/smoke scripts and package-level verification commands.

## Current Branch State
- Branch: `main`
- Remote tracking: `origin/main`
- Current work is documentation and harness tooling only; no runtime UI behavior has been intentionally changed.

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
- Last full runtime gates remain measured on 2026-05-08: `npm run build`, `npm run lint`, and `npx tsc -b` passed.
- Current harness work uses docs/tooling checks first; runtime gates should be rerun when application code changes.

## Active Risks
- Stone Library finish imagery still has placeholder/mapping gaps.
- App shell still has delivery-readiness debt around template/default assets and footer/social hygiene.
- Image hosting policy is undecided for WordPress-hosted runtime assets.
- GitHub Pages deployment workflow still needs hardening.
- Bundle size warning (`>500kB`) remains open.

## Next Recommended Action
Complete Phase 1, commit it, then implement Phase 2 scripts and commit again.

## Guardrails
- Use repo-root relative paths in committed docs.
- Keep current state short here; write detailed history in `docs/WORKLOG.md`.
- Do not use `docs/NEXT_STEPS.md` as the machine task queue; update `docs/agent/tasks.json` for task state.
