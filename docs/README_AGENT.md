# README_AGENT - Urblo Execution Entry

Last updated: 2026-02-09

## Project Mission
Urblo web exists to communicate a design-led, engineering-backed, proof-driven stone solution system for streetscapes and civil landscapes. For any decision touching positioning, copy, UX intent, or visual direction, use `/Users/lee/Documents/SAI/urblo/urblo-react/docs/brand-baseline.md` as the brand decision rubric.

## Startup Checklist (Read Order + Command Order)
1. Read this file first: `/Users/lee/Documents/SAI/urblo/urblo-react/docs/README_AGENT.md`.
2. Read brand rubric: `/Users/lee/Documents/SAI/urblo/urblo-react/docs/brand-baseline.md`.
3. Read technical facts and contracts: `/Users/lee/Documents/SAI/urblo/urblo-react/docs/ARCHITECTURE.md`.
4. Read active execution backlog: `/Users/lee/Documents/SAI/urblo/urblo-react/docs/NEXT_STEPS.md`.
5. Read latest session evidence: `/Users/lee/Documents/SAI/urblo/urblo-react/docs/WORKLOG.md`.
6. Run quality gates from repo root in this exact order:
   - `npm run build`
   - `npm run lint`
   - `npx tsc -b`
7. Treat any gate failure as blocking unless `NEXT_STEPS.md` explicitly defines a temporary exception.

## Canonical Conflict Precedence
- Brand and messaging decisions: `/Users/lee/Documents/SAI/urblo/urblo-react/docs/brand-baseline.md` is authoritative.
- Execution priorities and task sequencing: `/Users/lee/Documents/SAI/urblo/urblo-react/docs/NEXT_STEPS.md` is authoritative.
- Architecture, route, data, and state contracts: `/Users/lee/Documents/SAI/urblo/urblo-react/docs/ARCHITECTURE.md` is authoritative.
- Session evidence and what was actually validated: `/Users/lee/Documents/SAI/urblo/urblo-react/docs/WORKLOG.md` is authoritative.
- If docs conflict with code reality, update docs to match code first, then add remediation tasks in `NEXT_STEPS.md`.

## When Docs Must Be Updated
Update docs when any of the following changes:
- Route behavior, navigation behavior, or CTA behavior visible to users.
- Data contracts or typed models used by runtime pages.
- State/storage side effects (`zustand`, `localStorage`, client fetch contracts).
- Build/lint/typecheck gate status.
- Deployment behavior or release pipeline.
- Priority, risk posture, or handoff assumptions.

Minimum required updates for major changes:
- `/Users/lee/Documents/SAI/urblo/urblo-react/docs/NEXT_STEPS.md`
- `/Users/lee/Documents/SAI/urblo/urblo-react/docs/WORKLOG.md`
- `/Users/lee/Documents/SAI/urblo/urblo-react/docs/ARCHITECTURE.md` (if contracts changed)

## Delivery Closure Guardrail (New)
Before declaring implementation complete, verify all checks below:
- Code gates passed (`build`, `lint`, `tsc`).
- Contract docs reflect current routes and runtime data sources.
- `WORKLOG.md` includes scope, verification evidence, and residual risks.
- `NEXT_STEPS.md` marks completed items and leaves explicit follow-ups.

## Current Critical Risk Snapshot (Measured 2026-02-09)
- Stone Library migration is complete: old `/materials*` route family has been removed and replaced with `/stone-library` + `/stone-library/:stoneGroupId`.
- Quality gates are green (`npm run build`, `npm run lint`, `npx tsc -b` all pass).
- Footer route mismatch remains: `/sample-request` and `/contact` links still exist in `/Users/lee/Documents/SAI/urblo/urblo-react/src/components/Footer.tsx`, but those routes are not declared in `/Users/lee/Documents/SAI/urblo/urblo-react/src/App.tsx`.
- Bundle size warning (`>500kB` chunk) remains and should be addressed with code splitting.
