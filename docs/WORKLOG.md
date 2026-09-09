# WORKLOG — current execution evidence

Last updated: 2026-09-09

Historical evidence is immutable and is not current task state. Current state is generated from `docs/agent/status.json` and `docs/agent/tasks.json`.

## 2026-09-09 — Maintainability baseline

Jay approved the full maintainability plan: isolated local testing, repository-owned task state, scoped authorization, separate verified batches and Articles refactoring without UI/data-contract changes. The implementation uses a clean worktree based on main 2e7977b; unrelated local edits are preserved. No production data mutation or external email is authorized by this maintenance task.

## 2026-09-09 — State/archive batch

Root instructions are 3,558 bytes; default startup documents total 11,353 bytes at this checkpoint. Completed tasks and the previous WORKLOG are archived without deleting records; archive hashes reproduce the complete original WORKLOG. Current CMS handoff stays revalidation_required. Generated HANDOFF/NEXT_STEPS/README and read-only GC pass; injected invalid task/CMS/Preview and stale summary cases are rejected. Initial clean Node 20 container gate passed, followed by a final repeat after this evidence and architecture-index cleanup. External branch protection and isolated local stack remain pending in the full maintenance task.

## Historical evidence index

The concatenated archive parts reproduce the previous WORKLOG byte-for-byte. Integrity is checked against `docs/archive/2026-09-09/worklog-index.json`.

- [worklog-01.md](archive/2026-09-09/worklog-01.md): original lines 1–1777.
- [worklog-02.md](archive/2026-09-09/worklog-02.md): original lines 1778–3547.
- [worklog-03.md](archive/2026-09-09/worklog-03.md): original lines 3548–5346.
- [worklog-04.md](archive/2026-09-09/worklog-04.md): original lines 5347–7113.
- [worklog-05.md](archive/2026-09-09/worklog-05.md): original lines 7114–8897.
- [worklog-06.md](archive/2026-09-09/worklog-06.md): original lines 8898–10688.
- [worklog-07.md](archive/2026-09-09/worklog-07.md): original lines 10689–12471.
- [worklog-08.md](archive/2026-09-09/worklog-08.md): original lines 12472–12615.

<a id="phase-0-tagged-media-role-boundary-proof"></a>
Original evidence: [phase-0-tagged-media-role-boundary-proof](archive/2026-09-09/worklog-01.md#phase-0-tagged-media-role-boundary-proof).

## 2026-09-09 — Maintenance state release and verification graph

Scope: approved maintainability plan batches 1–2; no UI changes, production data writes, external email or DNS changes.

- PR #40 (`01b284886f2d4233a23e74aa86c3b38d6a154022`) merged as `709af75165b366999ee24ef24c666e8243b6aa56`. CI run `34323595831` and immutable Preview `https://7a83ed7d.urblo-site.pages.dev` passed; production CI `34323951402` deployed `https://78bdc657.urblo-site.pages.dev`. Immutable, apex and www each passed bound route/asset/MIME/redirect/Function smoke.
- First PR CI run `34323166603` failed on a stale HANDOFF phrase guard. The guard now validates the structured Published-overlay/static-fallback state, with a mutation test; full existing public runtime checks remained. Local Admin predeploy and clean Node 20 gate passed after repair.
- `agent:verify` selects a dependency graph from Git rename/delete/untracked-aware changes. The 22-check source graph executes each node once. Build includes TypeScript. Runtime adds the browser config boundary; an already verified env-less build is reused, while configured builds require a separate env-less browser build. Old smoke/predeploy/check commands remain compatible.
- Pure record docs select state/path/harness/classifier checks and no deployment. Tooling selects the complete source graph. Runtime/build/release/unknown paths require deployment and browser checks; migrations have their own category. Actual temporary-Git tests verify rename into docs, deletion, untracked files and fingerprint invalidation.
- Each run saves a unique attempt directory under ignored `.tmp/verification/`, sanitized child output, exit codes, elapsed times, repository SHA and runtime fingerprint. A failed attempt is never overwritten by retry. First local graph run could not bind Vite inside the sandbox; the next uncovered one stale Capabilities smoke-wrapper string. That integration assertion now checks the graph; later full source and runtime/browser runs passed.
- Cloudflare API readback found current `urblo-site` is direct upload, while legacy `urblo` Git integration still built all branches. Within the approved consolidation scope, disabled legacy production and preview automatic builds, read back false/none, and verified its canonical deployment pointer stayed unchanged. No rollback deployment was deleted. API schema: [Cloudflare project settings](https://developers.cloudflare.com/api/resources/pages/subresources/projects/).
- CI now produces stable `quality` on PRs and main, skips deployment for records, automatically smokes immutable Preview and production domains. Wrangler is pinned at 4.130.0; its CLI requires Node 22, while build/container checks remain Node 20. GitHub administrator configuration remains external until `quality` exists and the owner applies protection.

Residual work: verify the new workflow on its own PR; prove a record-only PR has zero deployments; apply main protection with administrator access; local isolated database/journeys and Articles/server refactor remain subsequent batches. Broader CMS acceptance remains unproven.
