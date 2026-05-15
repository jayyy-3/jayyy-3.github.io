# NEXT_STEPS - Urblo Roadmap

Last updated: 2026-05-15

## Purpose
This file is the human-readable roadmap. The machine-readable task queue lives in `docs/agent/tasks.json` and is the source of truth for active task status, file ownership, acceptance criteria, and verification commands.

Use this file to understand priority shape. Use `docs/agent/tasks.json` to execute.

## Current Objective
Raise delivery readiness baseline, keep route integrity explicit, and use the root harness plus design contract to align high-impact pages before later performance and data-quality refinements.

## Blocking Quality Gate Policy
A task touching runtime behavior is not complete unless all three pass:
- `npm run build`
- `npm run lint`
- `npx tsc -b`

Docs-only and harness-only work should run:
- `npm run agent:check`
- `git diff --check`

## Last Runtime Baseline
Measured 2026-05-08:
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass

## Advisory Brand + Design Gate
For any user-facing layout/copy/IA task:
- Reference relevant sections in `docs/brand-baseline.md`.
- Reference relevant sections in `docs/DESIGN.md`.
- Include a short brand/design alignment note in task delivery.
- If implementation cannot satisfy baseline yet, record explicit gap and follow-up ID.

## Now
Source of truth: `docs/agent/tasks.json`.

- `NOW-STONELIB-IMG-FASTTRACK-001`: map provided finish assets into Stone Library and reduce placeholder usage.
- `NOW-DELIVERY-READINESS-001`: remove template/default shell assets and user-visible placeholder UI.
- `NOW-ASSET-STRATEGY-001`: decide and document current vs delivery image hosting policy.
- `NOW-DEPLOY-PAGES-HARDEN-001`: harden GitHub Pages deployment and credential safety.

## Next
- `NEXT-UI-PARITY-001`: bring Home, Our Story, Articles, and Contact Us toward approved visual references.
- `NEXT-SAMPLE-REQUEST-001`: define Sample Request implementation path and backend/form constraints.
- `NEXT-STONELIB-IMG-001`: complete Stone Library HD finish image coverage.
- `NEXT-STONELIB-IMG-002`: decide and implement secondary finish frame behavior.
- `NEXT-STONELIB-DATA-001`: replace generic finish behavior text with approved notes.
- `NEXT-DATA-001`: unify project list/detail data.
- `NEXT-ROUTER-SEO-001`: decide GitHub Pages routing and SEO tradeoff.

## Later
- `LATER-BRAND-001`: align homepage modules with brand pillars and proof framing.
- `LATER-PERF-001`: reduce bundle size and improve chunk strategy.
- `LATER-QA-001`: broaden automated route and CTA smoke coverage.

## Completed This Cycle
- `DONE-DOCS-HARNESS-ROOT-001`: promoted `docs/README_AGENT.md` to root `AGENTS.md`, added `docs/DESIGN.md`, moved repo docs to relative paths, and separated brand authority from design execution authority.
- Phase 1 harness hygiene committed: `docs/HANDOFF.md`, `docs/agent/tasks.json`, `docs/agent/verification.md`, `scripts/check-doc-paths.mjs`, and `scripts/check-harness.mjs`.
- Phase 2 verification harness completed: `scripts/agent-init.sh`, `scripts/agent-smoke.sh`, and package-level `agent:*` scripts.

Older completion details live in `docs/WORKLOG.md`.

## Exit Criteria for Current Delivery Cycle
- Active `now` tasks in `docs/agent/tasks.json` are complete or explicitly deferred.
- All applicable quality gates pass per `docs/agent/verification.md`.
- Navigation and route contracts remain consistent with `src/App.tsx`, `src/data/siteChrome.ts`, and `src/components/site/SiteFooter.tsx`.
- Delivery shell is free of template/default app metadata and dead social links.
- Stone Library data/image follow-ups are explicit, not implied complete.
