# Harness GC

Last updated: 2026-06-30

## Purpose
Harness GC is the self-maintenance layer for the Urblo AI Harness.

It does not write product features, change production data, or decide business priorities. It keeps the agent-facing reality accurate, compact, executable, and mechanically reviewable.

Use it when Jay says:

```text
跑一下 Harness GC
```

The expected response is a concise report: what is true, what is stale, what is noisy, what can be safely cleaned up, and what needs Jay's judgment.

## Mental Model
Harness files are treated as four categories:

- Policy: `AGENTS.md`, `docs/OPERATING_PROTOCOL.md`, `docs/agent/verification.md`, and stable execution rules. Note: `npm run gate` is not an `agent:*` script, so GC's agent-script coverage check does not track it; `scripts/check-harness.mjs` guards it instead.
- State: `docs/agent/status.json`, `docs/HANDOFF.md`, and the active portion of `docs/agent/tasks.json`.
- Evidence: `docs/WORKLOG.md` and ignored `.tmp/` artifacts.
- Knowledge: `docs/ARCHITECTURE.md`, `docs/DESIGN.md`, `docs/brand-baseline.md`, `docs/ADMIN_IA_ACCESS.md`, and schema/runbook docs.

Harness GC reports when these categories drift into each other.

## Commands
Run:

```sh
npm run agent:harness-gc
```

Default mode is read-only. It parses the compact status file, task queue, package scripts, README, and core Harness docs. It exits nonzero only for high-confidence blocking drift.

Run:

```sh
npm run agent:harness-gc:review
```

Review mode writes `.tmp/harness-gc-review.md` with architecture score, drift risks, shortening/splitting suggestions, guardrail ideas, and questions for Jay.

Run:

```sh
npm run agent:harness-gc:fix
```

Fix mode is intentionally conservative. It may refresh top-level `Last updated` dates from `docs/agent/status.json`. It must not mark tasks complete, change priority, delete history, apply live operations, or rewrite domain knowledge.

## Checks
P0 checks fail:

- Missing or invalid `docs/agent/status.json`.
- README current-status phrases that contradict deployed production reality.
- `docs/agent/status.json` listing umbrella tasks as active executable tasks.
- `.tmp/` not ignored.

P1 checks warn loudly:

- `agent:*` package scripts missing from Harness documentation coverage.
- `docs/agent/tasks.json` status counts that make execution priority blurry.
- `Last updated` metadata older than `docs/agent/status.json`.

P2 checks warn:

- Too many `now` tasks.
- Umbrella tasks still listed as `now`.
- `AGENTS.md`, `docs/HANDOFF.md`, or `docs/WORKLOG.md` growing past the review thresholds in `docs/agent/status.json`.
- Done tasks whose notes still read like active blockers.

P3 checks are review fodder:

- Repeated current-state prose.
- Historical proof appearing in current-state files.
- Old status wording that should use current editor-facing language.

## Known Agent Scripts
Harness GC expects every `agent:*` package script to appear in Harness documentation. Current scripts:

- `agent:admin-auth-browser`
- `agent:admin-cms-predeploy`
- `agent:admin-config-gate`
- `agent:admin-crud-coverage`
- `agent:admin-crud-live`
- `agent:admin-handoff-readiness`
- `agent:admin-live-readiness`
- `agent:capabilities-ui`
- `agent:check`
- `agent:cloudflare-preview-smoke`
- `agent:cloudflare-readiness`
- `agent:content-import`
- `agent:content-import:apply-sql`
- `agent:content-import:json`
- `agent:content-import:live`
- `agent:content-import:plan`
- `agent:content-import:preflight-sql`
- `agent:first-admin-bootstrap`
- `agent:forms-live`
- `agent:forms-ui`
- `agent:harness-gc`
- `agent:harness-gc:fix`
- `agent:harness-gc:review`
- `agent:init`
- `agent:live-readiness`
- `agent:public-supabase-readiness`
- `agent:smoke`
- `agent:supabase-foundation-readiness`

## Operating Rules
- Treat code reality and production proof as stronger than stale docs.
- Keep `docs/agent/status.json` compact. Link to canonical docs instead of copying long explanations.
- Do not use Harness GC to hide unresolved product risk.
- Do not let historical `docs/WORKLOG.md` evidence become the first thing a new agent must parse.
- Keep umbrella tasks separate from active executable tasks.
