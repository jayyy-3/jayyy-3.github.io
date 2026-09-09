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

- PR #41 first CI run `34324917881` passed all 22 source nodes, then stalled in browser process shutdown and was cancelled before deployment. Linux retained the Vite grandchild behind `npx`; the gate now launches Vite directly. The graph streams sanitized logs as checks run, enforces check time budgets and retains interruption evidence so cancellation cannot lose the active check log. CI cancellation correctly made `quality` fail.

## 2026-09-09 — Record-only CI acceptance

PR #41 passed repaired run `34326148845`, including 23 unique verification nodes, immutable Preview `https://84f83fa9.urblo-site.pages.dev` and stable `quality`, then merged as `28cd2a1`. The earlier cancelled run remains recorded above; Linux reproduction confirmed that `npx` left Vite serving after termination while the direct Node launcher stopped it.

This entry deliberately changes only historical evidence. Its PR must run the docs graph and stable `quality`, with dependency installation but no website build, browser installation or Cloudflare deployment. The subsequent main run must also skip deployment. Runtime SHA/URL observations remain unchanged until fresh production readback is recorded; a newer record-only repository SHA does not invalidate an unchanged runtime fingerprint.

## 2026-09-09 — Isolated local QR stack

- PR #41 merge `28cd2a1f4ad1dee293afd7d4f9f5dff3208ccd94` passed production run `34326552945` and immutable/apex/www readback at `https://98b6a225.urblo-site.pages.dev`. PR #42/main `03767bc6bdf5164a6b1644a4100378f9c2fa7ed5` passed runs `34326719464` and `34327122789` with no build/browser/deploy. Both release and later record-only artifacts have runtime fingerprint `03eec5670136b87337c146d89044c364c304b637ae851764041763af415212c9`.
- Pinned Supabase CLI 2.117.0, local Postgres 17, project `urblo-isolated-v1`, API 57321 and app 8788. All wrappers validate exact loopback target, project identity, Docker socket and current checkout, strip inherited provider credentials, and reject linked projects. Actual CLI negative tests reject production before attempting any Docker command.
- Initial fresh migration failed on absent hosted-only `public.rls_auto_enable()`. Conditional revocation preserves the existing helper branch; the local transaction proof confirms anon/authenticated denial and rolls back. No production migration was applied or rerun.
- Initial local login failed because the email provider was disabled; corrected only local config while keeping global registration disabled. A first synthetic PNG failed browser decode; replaced with deterministic valid PNG generation. First QR selector attempt used a label text matcher affected by nested option text; switched to observed accessible combobox role. Separate attempt evidence is retained.
- Full local proof `full-1788941176621` passed guards, start, two resets/reseeds, helper permission proof and QR browser journey. QR proof covers actual private upload/public promotion, Function-created stable link, material Save + refresh, actual Open page navigation, public material rendering, Hide 404, Restore same slug, and anonymous mutation 401. Browser plugin not available; repository-pinned Playwright Chromium used at 1440x1000. Screenshots and safe request metadata are stored per attempt under ignored `.tmp/local/`.
- Runtime CI now runs the isolated proof before deployment and uploads its safe logs/JSON/screenshots. Local test credentials are synthetic; real notification delivery, CMS handoff, Projects/Articles representative coverage and user acceptance are not inferred. Main protection remains the administrator-access dependency already raised with Jay.
