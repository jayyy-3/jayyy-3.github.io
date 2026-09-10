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

## 2026-09-09 — Behavioral coverage batch

PR #43 merged as `810fd9b0eed97fa2a5183b46549db8423700bda5`; Preview run `34328136267` and production run `34328859066` passed, including the isolated local stack. Production immutable `https://31fd0c27.urblo-site.pages.dev`, apex and www passed bound smoke.

Local attempts retain their original result and screenshots. `journeys-1788942412526` passed QR plus Projects save/refresh/private draft/public Publish/Hide and a deterministic delayed-load New regression. `journeys-1788942585567` also passed Articles invalid validation/API failure recovery, parent-bound child Save, switching locks and both form/inbox flows. `journeys-1788942651608` passed additional Articles public rendering, then failed because the test navigated before asynchronous Sign out completed; `journeys-1788942733567` failed only because Sign out correctly retained a next query parameter. The test now waits for the login pathname. Fresh two-reset verification follows before release.

Confirmed Projects bug M13: New during an existing draft fetch invalidated the request generation but never cleared loading. The new-route branch now clears loading while retaining the stale-response guard. Brand/design alignment: no layout, copy, style, publish or role changes; the existing New action becomes usable during an old read.

Functions JS lint is now included. Exact control-character regex suppressions preserve upload/public-URL validation; an unused QR text-response helper is removed. Synthetic Article fixtures now use the actual rich-text body contract. Runtime browser behavior is split into small journey modules. Real notification delivery, production data writes, CMS handoff and user/device acceptance remain outside this proof. Articles and shared server configuration refactors remain next.

Fresh local `full-1788942811006` passed two resets, migration permission proof and all 16 browser journeys (`journeys-1788942870502`), including unprofiled account rejection. No external requests or uncaught page errors were reported. Full lint passed. Initial container invocation stopped at a trailing blank line left by unused-helper removal; corrected before rerunning the gate.

The next container run caught a documentation-path false positive: the retired-archive substring guard rejected the real UI button label New project. The guard now requires a path separator, with positive archive-path and negative UI-prose cases. Runtime checks had passed up to this docs failure; final gate rerun retains the original failed attempt.

Final clean Node 20 container gate passed all 23 unique source checks. The separate configuration-missing browser gate passed all 12 routes. This batch is ready for its independent PR, expanded isolated CI journeys and immutable Preview smoke; release completion is not inferred before those finish.

## 2026-09-09 — Articles and identity refactor

PR #44's behavior baseline passed run `34330297192` and merged as `97e4f284b25616bb9cb8c56229ed0380eb7de9ac`. Its production run `34331232509` passed; the immutable URL will be recorded with the final release observation.

The 2,226-line Articles route is now an 11-line protected wrapper over explicit types, forms/validation, browser-key data access, editor-state/audit and presentation modules. Data columns/order, parent-bound block updates, generation guards, locks, roles, primary-save/audit order and notices remain unchanged. An AST comparison against the committed pre-refactor source matched all 12 presentation functions/returns, including labels, classes and action bindings. TypeScript and module lint passed. Fresh isolated `full-1788943371457` / `journeys-1788943433474` passed all 16 workflows after extraction; shared server source also matched the tested local copy.

QR and Projects now share configuration/client construction and user/active-profile reads in `functions/_lib/admin-runtime.js`. Modules retain their own roles and exact response/error contracts. New handler-level tests cover missing configuration/session with zero network work, invalid identity without profile lookup, missing/profile-error/unknown-role rejection, viewer mutation denial and owner/admin/editor admission to input validation. Existing QR and Projects behavior verifiers passed.

The Articles validation-order string assertion was replaced with the real invalid-Save recovery assertion. Build-only mutation `article-mutation-1788943722411` deliberately takes the save lock before validation and proves that same browser assertion fails; repository source fingerprint remains unchanged. This fault is available only through the guarded local runner and is included after the normal CI journeys. Remaining useful source boundaries are preserved across the explicit module files. Structured browser console arguments now retain useful error details with nested credential/token redaction.

One subsequent full attempt (`full-1788943873996`) stopped before browser work because a new diagnostic import was accidentally placed before the shebang. It was corrected and syntax-checked; retry evidence remains separate. No live business data, Storage objects or outbound emails were touched. Brand/design alignment: presentation structure and public behavior remain unchanged. Follow-up module work and administrator main protection now have their own queue entries.

Final isolated retry `full-1788944053598` passed two resets, all normal workflows and the deliberate mutation proof. The first refactor container run passed build/lint/server behaviors, then the overlay verifier still looked for extracted guards in the old route file. Its three retained checks now target the state, data and form modules respectively; the boundary assertions themselves remain unchanged.

A second container attempt found the same stale-file assumption in the Cloudflare packaging source guard. Its server-only credential/auth checks now include the shared identity module for both handlers. Browser-key prohibitions remain checked across the combined server dependency. The new handler behavior tests independently prove the actual identity/configuration outcomes.

Final clean Node 20 container gate passed all 24 unique source checks. The structured console capture reported the deliberate Article API 500, a harmless unused-preload warning and the existing duplicate GoTrue client/storage-name warning when public/admin clients coexist. Public client source has persistSession=false; no session failure was observed, so namespace behavior is a separate investigation task, not an asserted data-loss bug. PR #44 production immutable is `https://c0006474.urblo-site.pages.dev` and its bound custom-domain readback passed.

The final missing-configuration browser gate passed all 12 routes. Refactor source, synthetic workflows and mutation evidence are ready for the independent Preview/CI release; production readback remains a separate next step.

## 2026-09-10 — Cold-start and closeout verification

A fresh process read only repository startup state and returned checkout/observed-runtime versions, current task, next action, six module entry groups, verification and recorded authorization. Root instructions measure 3,575 bytes; startup files 12,096 bytes plus init output 4,115 bytes = 16,211 bytes. Active state, explicit idle state in a temporary directory without Git/history, invalid/archived task rejection and rejection of idle hiding active work pass. This is a reproducible repository/command handoff exercise, not an independent human study.

Fixed the local doctor's stale Node 20 requirement: local Functions need Node 22+, while source compatibility remains tested in the Node 20 container. All local read-only prerequisite observations were ready. Preview requires a supplied origin and never substitutes production's immutable URL. Root entry now describes the deployed classified CI rather than future migration text. The closeout clean Node 20 gate passed.

GitHub readback still reports admin=false/push=true and main protected=false. The existing authorization covers protection, but the connected identity cannot apply administrator-only settings. The runbook and a separate blocked task identify the exact required PR/quality rule; no new fees, production data changes or external messages were introduced.

PR #45 merged as `8a25265771424bb4680624a25cb3bfaa2564c3ae`. Production run `34445064304` passed all source/browser checks, isolated database/Functions workflows and mutation proof, deployment, immutable `https://deef89f2.urblo-site.pages.dev` smoke and bound apex/www smoke. The maintenance implementation is archived and currentTaskId is explicitly null; candidate work does not become authorized automatically. Final closeout changes affect tooling and documentation only. A browser settings read also found no signed-in administrator session, so main protection remains a documented external blocker.

Final idle-state container rerun found the CMS acceptance guard still required the physical-delete constraint in the active queue after maintenance archival. The existing future CMS task now retains that exact constraint; runtime controls are unchanged. The first launch was denied Docker socket access by the sandbox, then retried with approved local Docker access; neither failed attempt is represented as a passed gate.

## 2026-09-10 — Stone Library workspace candidate and isolated adoption proof

Scope: replaced the three-column table editor with a visual collection and page-shaped editor, serialized automatic private-draft saving, shared `StonePageView` preview, ordered exact finish imagery, paginated private media upload/selection, history and reference-safe publication/hide. Added the protected Function, service-only aggregate RPC and separate browser-write/reference lockdown migrations. Projects/Products/Articles now share published catalogue choices and retain unavailable saved selections. Origin/internal sources remain private; managed hidden keys cannot revive static content.

Local evidence: build/lint/typecheck passed; configured entry is 415.91 kB and the Supabase chunk remains separate. `agent:stone-workspace` passed 13 behavior/security groups including failed-second-copy compensation, definite transaction rollback, uncertain-outcome retention and successful publication. On a disposable Postgres database, both migrations applied and 28 transactional assertions passed: complete draft isolation, stable IDs, receipt replay/conflicts, Viewer denial, reference protections, tombstones, history and grants. A two-session Product-publication/Stone-hide race waited for the first transaction and rejected the hide after the new public reference committed.

The loopback browser fixture uses real local PostgREST/SQL plus synthetic sessions. Browser checks passed create/save/refresh, private upload/preview/publication/public readback, media pagination beyond 160 records, failed-save navigation retention/retry, lost-response replay, multi-editor conflict retention, 1280px layout and mobile no-horizontal-overflow. New Grey hide was rejected in the UI with the linked public Product/Project list. The no-config gate passed all 12 admin routes. Synthetic sessions are not production Auth proof.

Local adoption of exact plan `b9a4e1f1c3fce163793263641139cc69c7620cce3853b2e03ed1a5a114784f9f` passed: 12 baseline stones, 55 photographs, archives 1/13, retained originals/history; resumed readback compared every public variant/finish/image relationship and all 55 published photo hashes. Products/defaults, Articles/blocks, Projects/materials and all 32 Image QR records had unchanged before/after fingerprints. The original production read-only snapshot showed six formal Product drafts, four formal Article drafts and Moon Gate draft; none was discarded or published. Private sample rows were not fetched or changed.

Release inventory and rollback: `docs/STONE_LIBRARY_WORKSPACE_RELEASE.md`; exact machine plan: `docs/agent/stone-library-adoption-plan.json`. No production migration, content/Storage write or runtime promotion occurred. Fresh production workflow proof and Jay's five-minute usability acceptance remain open. The legacy direct-write CRUD verifier now refuses live mode before login/mutation, since it cannot safely exercise the new protected Stone boundary. Gate/Preview closeout follows below.


### Current-main integration and final local verification

Integrated latest main `5cae8f380993f76ee0bba199062165a7259674dd`, preserving maintenance's classified verification graph, generated state, Articles layer split, shared server identity and Image QR material pages. Ported Stone selectors into Articles data/components and registered `stone-workspace` once in the verification graph. QR selections now use the managed catalogue; active explicit/default QR material references participate in the Stone transaction guard without changing the 32 resource rows or permanent URLs. The expanded SQL fixture passes 30 assertions, including QR blockers and legacy default-name matching.

Failures retained: the initial host smoke attempt could not reach its loopback server under the filesystem/network sandbox; the allowed local rerun passed. Legacy source checks initially expected direct Stone CRUD and old file locations; they were updated to check the protected endpoint and new module boundaries. Current-main integration initially failed the Articles relative import and new server lint scope; both were corrected. The complete current-main container-profile graph then passed on the host. The original isolated candidate also passed the clean Node 20 Docker gate; the integrated candidate's final Docker result is recorded at closeout. Admin no-config browser proof remains 12 passing routes; the shared Stone editor UI was unchanged by the Articles/QR integration.

Production remains on its previously recorded verified runtime; no production migration, adoption or content/Storage write occurred. Next is immutable branch Preview smoke, then item-specific approval of `docs/STONE_LIBRARY_WORKSPACE_RELEASE.md`. The branch's editor depends on the expand migration and cannot function against the unexpanded production database until that step is approved.

Integrated Node 20 Docker gate passed with 25 unique checks. The final QR default-registry assertion also passes; final committed source is gated again before push. Browser Back automation did not yield reliable completion evidence and is not counted as a passed browser case; in-app link/save-failure guards and queue flush behavior are verified.
