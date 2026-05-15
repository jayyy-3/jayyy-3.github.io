# AGENTS - Urblo AI Harness Entry

Last updated: 2026-05-15

## Project Mission
Urblo web exists to communicate a design-led, engineering-backed, proof-driven natural stone solution system for streetscapes and civil landscapes.

The harness has two separate creative authorities:
- Brand strategy, positioning, copy claims, and audience framing live in `docs/brand-baseline.md`.
- Visual design, UX rhythm, page composition, interaction tone, and UI quality live in `docs/DESIGN.md`.

## Startup Checklist
1. Read this file first: `AGENTS.md`.
2. Read current handoff: `docs/HANDOFF.md`.
3. Read machine task queue: `docs/agent/tasks.json`.
4. Read verification matrix: `docs/agent/verification.md`.
5. Read brand rubric: `docs/brand-baseline.md`.
6. Read design contract: `docs/DESIGN.md`.
7. Read technical facts and contracts: `docs/ARCHITECTURE.md`.
8. Read human roadmap: `docs/NEXT_STEPS.md`.
9. Read latest session evidence when needed: `docs/WORKLOG.md`.
10. For docs/harness changes, run:
   - `npm run agent:check`
   - `git diff --check`
11. For runtime changes, run quality gates from repo root in this order:
   - `npm run build`
   - `npm run lint`
   - `npx tsc -b`
12. Treat any runtime gate failure as blocking unless `docs/agent/tasks.json` explicitly defines a temporary exception.

## Canonical Conflict Precedence
- Code reality wins over stale docs. If docs conflict with implemented behavior, verify code reality, update docs, then add remediation tasks if the behavior itself is wrong.
- Brand strategy, positioning, audience, voice, and claim safety: `docs/brand-baseline.md` is authoritative.
- Visual design, UX rhythm, layout density, imagery treatment, page archetypes, and interaction tone: `docs/DESIGN.md` is authoritative.
- Architecture, route, data, state, side-effect, and deployment contracts: `docs/ARCHITECTURE.md` is authoritative.
- Machine-readable execution priorities and task sequencing: `docs/agent/tasks.json` is authoritative.
- Human-readable roadmap and cycle shape: `docs/NEXT_STEPS.md` is advisory.
- Current handoff state: `docs/HANDOFF.md` is authoritative for the next recommended action.
- Session evidence and what was actually validated: `docs/WORKLOG.md` is authoritative.

When brand and design appear to disagree, preserve the brand promise first, then adjust UI execution through `DESIGN.md`.

## When Docs Must Be Updated
Update docs when any of the following changes:
- Route behavior, navigation behavior, or CTA behavior visible to users.
- Page-level design direction, visual system choices, or interaction patterns.
- Data contracts or typed models used by runtime pages.
- State/storage side effects (`zustand`, `localStorage`, client fetch contracts).
- Build/lint/typecheck gate status.
- Deployment behavior or release pipeline.
- Priority, risk posture, or handoff assumptions.

Committed docs should use repo-root relative paths such as `src/App.tsx` or `docs/DESIGN.md`. Do not write machine-specific absolute paths into repo docs. If an outside local archive informed a decision, summarize it as an external source instead of making it a canonical path.

Minimum required updates for major changes:
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md` when current state, next action, or risk posture changed
- `docs/agent/tasks.json` when task status, files, acceptance, or verification changed
- `docs/ARCHITECTURE.md` when contracts changed
- `docs/DESIGN.md` when visual or UX direction changed

## Delivery Closure Guardrail
Before declaring implementation complete, verify all checks below:
- Code gates passed for runtime changes (`build`, `lint`, `tsc`).
- Harness checks passed for docs/tooling changes (`npm run agent:check`, `git diff --check`).
- Contract docs reflect current routes and runtime data sources.
- User-facing changes include a brand/design alignment note when relevant.
- `docs/HANDOFF.md` reflects current next action and risks.
- `WORKLOG.md` includes scope, verification evidence, and residual risks.
- `docs/agent/tasks.json` and `NEXT_STEPS.md` leave explicit follow-ups.

## Current Critical Risk Snapshot
- Root harness entry is `AGENTS.md`; the old `docs/README_AGENT.md` path is retired.
- Current-state handoff is `docs/HANDOFF.md`; machine task state is `docs/agent/tasks.json`.
- Stone Library migration is complete: old `/materials*` route family has been removed and replaced with `/stone-library` plus `/stone-library/:stoneGroupId`.
- Contact route is declared at `/contact`; shared header/footer navigation points to declared routes, with Sample Request remaining a `mailto:` fallback until a backend/form path is chosen.
- Last runtime gates were measured on 2026-05-08 and were green (`npm run build`, `npm run lint`, `npx tsc -b`).
- Bundle size warning (`>500kB` chunk) remains and should be addressed with code splitting.
