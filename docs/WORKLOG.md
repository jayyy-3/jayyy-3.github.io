# WORKLOG - Urblo Execution Log

Last updated: 2026-08-02

## Entry - 2026-08-02 (Jay Acceptance of Projects Phase 1)

- After PR `#11` reached production and its deployment-bound technical checks passed, Jay used the production result and reported: `试了试没问题。OK`.
- This is the required Jay-owned user acceptance for the deployed Projects Phase 1 and single-editor follow-up; it is not an agent self-certification and does not close unrelated Admin golden workflows.
- `NOW-ADMIN-UX-RESHAPE-001` remains `now` because the approved directive continues with Phase 2 replication, Phase 3 guide/Harness consolidation, and mandatory sunset deletion of `docs/ADMIN_UX_RESHAPE_PLAN.md`. The next module is Articles.

## Entry - 2026-08-02 (Public Opacity Repair and Single-Editor Projects Simplification)

### Scope
- Traced the public Projects/navbar display failure to Tailwind not generating non-default percentage opacity utilities such as the header's `bg-black/88` and menu's `bg-black/96`. Added the complete integer opacity scale and a built-CSS smoke assertion for the critical public utilities.
- Verified the local public Projects header and opened menu render with the intended opaque dark backgrounds at desktop and mobile widths, with no horizontal overflow or relevant console errors.
- Removed Project proof-review controls and approval-dependent publish blockers. Client and protected server Save paths now normalize legacy project/fact/material review columns automatically; required copy, references, media, server promotion, conflict handling, audit, Auth, and RLS boundaries remain.
- Removed the Dashboard Project claim-review queries and rewrote its visible workflow as Edit, Save, Publish. No Supabase migration or production write was required or performed.

### Verification State
- `npm run agent:admin-projects-aggregate`: pass.
- `npm run build`, `npm run lint`, `npx tsc -b`, `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`, `npm run agent:admin-cms-predeploy`, isolated 11-route `npm run agent:admin-config-gate`, `npm run agent:check`, JSON parsing, and `git diff --check`: pass.
- `npm run gate`: pass in the clean Node 20 Docker/Colima build for implementation commit `fa205e0`; the unrelated user-owned untracked `docs/SEO_EXTERNAL_AI_BRIEF.md` remained untouched and was reported by the gate.
- Local visual verification: public Projects desktop/mobile navbar and menu backgrounds pass.
- Draft PR `#11` implementation commit `610d4b2` deployed as immutable Preview `3b285f72-fafa-46c5-abc8-8ccda419b738` at `https://3b285f72.urblo.pages.dev`. No-write Cloudflare smoke passed all public/Admin routes, recursive assets, redirects, safe-failure form Functions, and the protected Projects endpoint. Strict owner login passed all nine authenticated Admin routes.
- Deployed `/projects` readback found header `rgba(0, 0, 0, 0.88)`, opened menu `rgba(0, 0, 0, 0.96)`, equal `scrollWidth/clientWidth` at 1280px, and no relevant console warnings/errors.

### Risks and Gaps
- The Preview login runner proves route/auth shells, while source/behavior checks prove removal of Project review controls; neither is Jay's fool test or a content-write workflow.
- Production remains on merge `25c05ebb` until Jay separately approves promotion of this follow-up.

### Jay Correction: Match Stone Library Header Treatment
- Jay rejected the first PR `#11` public-header result. The prior diagnosis focused on missing compiled opacity utilities but missed the route-level difference: Stone Library supplies a 102px black `DefaultLayout` support band behind the translucent header, while Projects had disabled that band and compensated with page-local white padding.
- Projects listing and detail now use the same default layout band as Stone Library. The duplicate `pt-[102px]` values and obsolete detail loading offset are removed.
- Local rendered checks pass at 1280px and 390px for Projects listing, opened navigation menu, and Project detail: support band is black and 102px high, main content begins at 102px, width has no overflow, and no relevant console warning/error appears.
- Correction commit `9d93624` passed the clean Node 20 container gate and was pushed to draft PR `#11`. Cloudflare immutable Preview `b438de5b-b341-4fe5-bb49-bb944f7f8c30` at `https://b438de5b.urblo.pages.dev` passed every public/Admin route, recursive asset/redirect/Function boundary, blocked-Supabase static fallback, and all nine authenticated Admin routes.
- In-app Browser verification against that immutable Preview confirmed Stone Library and Projects both use the translucent `rgba(0,0,0,0.88)` header at a 102px main offset; Projects listing/detail and the opened desktop/mobile menu have no horizontal overflow.
- After Jay's explicit promotion approval, PR `#11` merged as `59cded9bca05ccee69fafe0ab92e4486debf14f9` and Cloudflare deployed immutable production `76de2abf-a27b-4ecb-9e1f-fe229af4c8ed` at `https://76de2abf.urblo.pages.dev`. The immutable deployment passed full route, recursive asset, redirect, Function, and protected-Projects endpoint smoke.
- The first immediate custom-domain read occurred during Cloudflare's switch window: `www` still referenced the old entry and apex served one stale dynamic asset as SPA HTML. No rollback or data write was attempted. Fresh deployment-bound reruns passed for both `https://urblo.com.au` and `https://www.urblo.com.au`, with exact root/recursive asset identity against the immutable deployment; production owner login then passed all nine Admin routes and blocked-Supabase static fallback.
- Final in-app Browser production readback at 1280px and 390px confirmed the Projects header at `rgba(0,0,0,0.88)`, the shared 102px main offset, an opened mobile menu, and zero horizontal overflow. This is deployment evidence, not Jay's fool test.

### Next Handoff
- `NOW-ADMIN-UX-RESHAPE-001`: Jay runs the production Projects fool test.

## Entry - 2026-08-02 (Projects Production Runtime and Contract B)

### Scope
- Merged PR `#9` at production merge `25c05ebb727974f60d2d205e6f66e99dccf53afc` and verified immutable Cloudflare deployment `877d13c4-1e28-45d7-a62a-afdd3b0e0dda`.
- Verified the immutable URL, `urblo.com.au`, and `www.urblo.com.au` with deployment-bound route, asset, redirect, Function, and protected Projects endpoint smoke checks. Production owner login passed all nine authenticated Admin routes.
- After Jay's separate migration-only approval, applied contract B as production version `20260802105537` and aligned source to `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql`.
- Read back all six Project table and sequence privilege boundaries, legacy mutation-policy removal, RLS state, hardened public policies, retained service-role writes, and security advisor state. The operational Project edit freeze is lifted.

### Verification Results
- Authenticated direct insert/update/delete privileges: false on all six Project tables; select remains true.
- Authenticated usage/select/update privileges: false on all six Project sequences.
- Service-role insert/update/delete and sequence usage: true.
- All six tables retain RLS; only admin/public SELECT policies remain, with public children bound to approved Published parents.
- Security advisor: no new B-specific issue; existing leaked-password and intentional tombstone-RPC warnings remain.

### Risks and Gaps
- Jay's fool test remains the acceptance boundary and cannot be self-certified by an agent.
- A Cloudflare-only rollback to the legacy direct-write Projects UI is invalid after B.
- Real two-session/Postgres/Storage negative writes remain optional and require fresh approval.

### Next Handoff
- `NOW-ADMIN-UX-RESHAPE-001`: Jay runs the production Projects fool test.

## Entry - 2026-08-02 (Fresh Projects Preview And Minimum-Disclosure Migration C)

### Delivery Gate And Preview
- Installed and started the Homebrew-managed Docker/Colima runtime, added the Docker Buildx plugin, and passed `npm run gate` in a clean Node 20 container for commit `a79a364`. The local branch was pushed through that commit and opened as draft PR `#9`.
- Cloudflare bound commit `a79a3645383fea7e55b5cc5cdc8bee6487aa0f20` to deployment `a20062a0-951e-4d18-8aae-31e69f537b6f` at `https://a20062a0.urblo.pages.dev`. The immutable Preview smoke passed all public/Admin routes, recursive asset MIME/body checks, redirects, safe-failure form endpoints, and the protected Projects API boundary. The real owner login check passed all nine authenticated Admin routes. No content, Storage, invitation, or production runtime write occurred.
- The C readback/documentation checkpoint `fdf7a47` also passed the clean Node 20 container gate and deployed as `480ac707-7c03-4f21-98c7-52d388ce5f83` at `https://480ac707.urblo.pages.dev`; its immutable smoke passed. The strict Firefox login runner then exposed a verifier-only false positive: Supabase Storage's Cloudflare response emitted `Cookie “__cf_bm” has been rejected for invalid domain`, which Firefox classified as a console error even though the app does not set or consume that cookie. The message reproduced twice. Direct in-app browser verification on the same immutable deployment signed the owner into `/admin`, opened the real `/admin/projects/4` workspace, found meaningful content and no relevant application warnings/errors, and made no content changes.
- `scripts/check-admin-auth-browser.mjs` now ignores only that exact third-party `__cf_bm` invalid-domain diagnostic. Every other console error and every page error remains blocking. This synchronizes the verifier with browser reality; no UI/runtime behavior was changed to satisfy the check.

### Approved C Apply And Readback
- Jay separately approved only the production minimum-disclosure migration C. Read-only preflight found project `npkidywzwddbnfrnxlmo` active/healthy on Postgres 17.6.1, A applied, C/B absent, and the old tombstone RPC returning all four archived QA slugs.
- Applied migration `restrict_archived_project_tombstones` once. Supabase recorded production version `20260802103337`; source is aligned as `supabase/migrations/20260802103337_restrict_archived_project_tombstones.sql`, and the still-unapplied contract B is ordered after it as `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql`.
- Function readback matches the reviewed C source: it is owned by `postgres`, remains `STABLE SECURITY DEFINER`, has an empty `search_path`, reads only `public.projects`, and no longer references `private.project_drafts`. `PUBLIC` has no execute privilege; `anon`, `authenticated`, and `service_role` retain intentional execute access.
- The four archived QA Projects remain in their existing Archived state, but the RPC result changed from those four slugs to an empty list, exactly matching the intersection of archived canonical Projects and the five bundled public fallback slugs. No Project row, child row, draft, media record, Storage object, audit record, user, email, or runtime configuration was created or changed.
- Security advisor output remains the known leaked-password-protection Auth warning plus the two expected generic warnings for the intentionally browser-callable, slug-only `SECURITY DEFINER` function. Performance findings are pre-existing and unchanged in scope; C introduced no table, policy, or index changes.

### Next Approval Boundary
- Migration C is closed. Keep Project editing frozen. The next production write is promotion of the matching aggregate runtime from PR `#9`; it requires a separate explicit approval. Contract B remains unapplied and requires another approval/readback only after the aggregate runtime is live. Jay's fool test remains the final acceptance and cannot be self-certified.

## Entry - 2026-07-19 (Projects Closeout Negative Paths And Tombstone Repair)

### Problems Found And Source Repair
- The approved Preview marker `admin-projects-ui-mrroa6p0` was not one of the five bundled static Project slugs. Its Hide/public-not-found result proved that a non-static archived CMS page disappears, but it did not exercise static-fallback tombstone suppression. Subsequent read-only production analysis found A's public `get_archived_project_slugs()` returns four QA slugs, including one never-published marker, so the minimum-disclosure concern is a concrete data-boundary defect.
- Added source migration `supabase/migrations/20260802103337_restrict_archived_project_tombstones.sql`. It replaces the public function with the exact intersection of archived canonical Projects and the five slugs already public in `src/data/projectData.ts`, returns the allowlisted constant, and never reads `private.project_drafts`. The contract migration moved to `20260802105537_project_aggregate_write_lockdown.sql`. Both C and B remain unapplied and require separate, fresh production approvals/readback.
- Added defence in depth in `src/service/ProjectService.ts`: unknown RPC results cannot hide or enumerate anything outside the bundled public Project set. The overlay verifier now injects an unknown private-style slug and proves it is discarded.
- A `revision_conflict` previously set a reload notice without disabling editor mutations; ordinary Discard could then clear the warning while retaining the stale revision/timestamp. The editor now locks fields and Save/Publish/Hide during conflict, hides ordinary Discard, and leaves Reload latest as the only recovery that fetches fresh tokens.
- The Projects verifier now executes deterministic, no-network full-handler behavior: a stale Save preserves the structured 409 `revision_conflict`; a failed Publish copies a mocked private image create-only, verifies the copy, receives an RPC conflict, checks references, removes the exact nonce path, records `project.aggregate.publish_compensation`, and reports the cleanup summary. This closes source orchestration evidence, not real two-session/Postgres/Storage behavior; any live negative write needs fresh approval and should not intentionally force compensation-delete/audit failure in production.

### Harness Parity And Approval Boundary
- The closeout audit found both TypeScript-importing verifier scripts used Node's `--experimental-strip-types`, which is unavailable in the protocol's Node 20 container. Added explicit dev dependency `tsx`, routed both scripts through it, and made the parent Admin CRUD coverage runner invoke the Projects verifier through the same local `tsx` entry. Direct Node 20.20.2 execution now passes the Projects verifier, the nested CRUD coverage chain, and the complete Admin CMS predeploy chain. A test-only nonfunctional WebSocket constructor lets Supabase initialize its unused Realtime client under Node 20 while still failing any accidental socket use.
- The first final predeploy rerun exposed two stale documentation-string assertions for the Stone Library and Article public read paths. The docs keep the more accurate Published-first/static-fallback contract, and `scripts/check-public-supabase-readiness.mjs` now verifies that contract instead of forcing the old wording; the complete rerun passed.
- Fresh host-side verification passed: `npm run build`, `npm run lint`, `npx tsc -b`, `npm run agent:smoke`, `npm run agent:admin-cms-predeploy`, the isolated 11-route `npm run agent:admin-config-gate`, Projects aggregate/public overlay/foundation/public Supabase checks, Cloudflare source readiness, Harness checks, Harness GC/review with zero failures and two known documentation-size/date warnings, JSON parse, and `git diff --check`. Direct Node 20.20.2 execution passed the complete Admin CMS predeploy chain, including both `tsx`-backed TypeScript-importing verifiers. `npm audit --omit=dev` reports zero production dependency vulnerabilities; existing development-tool advisories were not expanded into this Projects closeout.
- No Supabase migration, content/Storage write, invitation, Cloudflare configuration change, runtime promotion, push, or production deployment occurred. Project editing remains frozen. Next delivery order is fresh gate and immutable Preview, separately approved C apply/readback, separately approved production runtime promotion, separately approved B apply/readback, then Jay's fool test. The 2026-07-16 Docker exception applied only to the original push and is not reused here.

## Entry - 2026-07-19 (Projects Authenticated Preview Workflow)

### Approved Scope And Preview Configuration
- After Jay's separate approval for the cleanable tagged Project/Storage workflow, production Project editing was placed under the documented operational freeze. The approved scope covered one owner-driven aggregate Project happy path plus restoration of the temporary Stone prerequisite; it did not authorize production runtime promotion, contract migration B, invitations, destructive cleanup, or any other production content change.
- Cloudflare Pages Preview received `VITE_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` as Preview-only secrets. Production Cloudflare configuration was not changed. Retrying commit `9441811` produced immutable deployment `1a3e0d4b-d74a-4979-be64-921e5a510ccc` at `https://1a3e0d4b.urblo.pages.dev`; the no-write smoke passed 23 public/Admin/404 routes, recursive JS/CSS MIME/body integrity, configured browser-secret boundaries, nine redirects, form safe-failure behavior, and the protected Projects API boundary. Owner sign-in reached the real configured Admin, and an invalid bearer request returned `401 invalid_session`, not `server_not_configured`.
- Production had no Published Stone family, so the workflow temporarily published existing archived QA fixture `stone_groups.id = 1` through the normal Stone Library UI. No real Draft stone copy was changed. Audit `154` recorded `stone_group.publish`.

### One-Save Project Evidence
- Marker `admin-projects-ui-mrroa6p0` was used throughout. The owner created Project `9` in the page-shaped editor with Overview fields, one approved Fact, one approved Stone/Finish material, one material map, one visually created hotspot moved by keyboard from 50/50 to 55/55, and one inline image uploaded with alt text. Upload audit `155` proves the image began private-first in `urblo-admin-media` as Media `119`.
- Unsaved `Open preview` used the public Project renderer and showed the title, hero, Fact, material, map, hotspot, and `Ready to publish` before Save. The public-shaped hotspot rendered at `left: 55%; top: 55%`.
- The complete aggregate was saved exactly once with no confirmation dialog. Audit `156` is the only `project.aggregate_draft.save` for Project `9`, revision `1`, with `liveStatus = null` and one Fact/Material/Map/Hotspot. The canonical Project did not yet exist; reload then read back every saved field and the 55/55 point from the private aggregate.

### Publish, Public Readback, Hide, And Restore
- Publish created canonical Project `9` and all four child rows as Published. Audit `157` recorded `project.aggregate.publish`; Media `119` was copied create-only to `urblo-public-media`, and audit `158` recorded removal of the private source with no retained private object. The public Preview route displayed the complete Project, both image uses, material map, and 55/55 hotspot.
- Hide produced audit `159` and archived Project `9`, its Fact/Material/Map/Hotspot, and private aggregate revision `3`. An anonymous REST read of the slug returned `200 []`, and a cache-busted public route read rendered `Project not found` without the tagged title.
- The temporary Stone fixture was restored through the normal UI to its exact original Archived state. Audit `160` records `stone_group.archive`; final Stone counts are 0 Published, 12 Draft, and 4 Archived. Its Variant and Finish image remain Draft and their linked Media remains Archived.
- Final residual state follows the approved archive-first/no-destructive-delete contract: the tagged Project aggregate and audit history remain Archived; Media `119` and one 123,161-byte public JPEG remain Published so the archived record's historical reference is not broken; the private upload source is gone. Physical deletion would require a separate retention/destructive-delete approval.

### Acceptance Boundary And Next Action
- This closes the authenticated Preview implementation happy path for exactly-one-Save, refresh persistence, shared unsaved preview, inline private-first media, visual hotspot, Publish/public readback, Hide, and public-not-found for a non-static QA slug. It did not prove bundled static-fallback tombstone suppression. It is not a production deployment proof, does not update `docs/agent/admin-handoff-evidence.json`, and is not Jay's unassisted fool test.
- `NOW-ADMIN-UX-RESHAPE-001` remains `now`. The later closeout entry records deterministic conflict/compensation evidence and the selected minimum-disclosure repair. Keep the Project edit freeze through a fresh Preview, C, aggregate runtime promotion, B, and Jay's fool test. Contract B was not applied in this workflow.

## Entry - 2026-07-19 (Projects Aggregate Expand Migration A)

### Approved Production Scope
- Jay explicitly approved only the Production expand migration for the Projects aggregate. The approved action was apply/readback of `project_aggregate_drafts`; it did not authorize tagged Project or Storage records, invitations, contract migration B, or production runtime promotion.
- Read-only preflight found project `npkidywzwddbnfrnxlmo` active and healthy on Postgres 17.6.1. Migration A's objects were absent, no unrelated transaction was waiting, existing Project counts were 8 projects, 44 facts, 5 materials, 4 material maps, 17 media blocks, and 4 hotspots, with 5 Draft and 3 Archived projects. The focused foundation, Projects aggregate, public-readiness, and diff checks passed before apply.

### Apply And Readback
- Applied migration name `project_aggregate_drafts` once. Supabase recorded production version `20260719015649`; the local file is aligned as `supabase/migrations/20260719015649_project_aggregate_drafts.sql`, and the unapplied contract step is ordered after it as `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql`.
- Readback confirms `private.project_drafts`, `admin_project_aggregate(...)`, `get_archived_project_slugs()`, both child lifecycle indexes, and the Facts/Materials lifecycle columns exist. The private draft table contains 0 rows. All six existing Project/child counts and the 5 Draft / 3 Archived status split are unchanged; Facts and Materials have zero parent-lifecycle mismatches.
- The aggregate RPC is `SECURITY DEFINER`, has an empty `search_path`, returns `jsonb`, and is executable only by `service_role`. The tombstone RPC is also search-path pinned and deliberately executable by `anon`, `authenticated`, and `service_role`; its read-only call returned the 3 archived slugs without exposing archived records. Browser roles have no table privileges on `private.project_drafts`; the pre-existing authenticated schema usage remains necessary for private RLS helpers and does not grant draft-table access.
- Contract B was not applied: all 18 legacy Project write policies remain, authenticated insert/update/delete privileges remain on all six Project tables, and authenticated sequence usage remains on all six Project sequences. The aggregate list read returned all 8 Projects and left the private draft table at 0 rows.

### Advisor And Residual State
- The security advisor reports the pre-existing leaked-password-protection Auth warning plus two expected generic warnings because the slug-only archived-project function is browser-callable `SECURITY DEFINER`. No archived record or draft JSON was exposed, but A did not yet enforce the public-fallback minimum. The private draft table was empty at this readback; the later closeout audit found canonical QA slugs still made the endpoint over-broad and supersedes the earlier assumption that the issue was only hypothetical.
- Performance advisor INFOs include the two new lifecycle indexes as unused immediately after creation and four unindexed actor foreign keys on the empty private draft table. These do not block the expand readback; no unapproved follow-up DDL was applied, and they remain visible for later review before contract closure.
- No test Project, media row, Storage object, audit record, invite, recovery email, public content status, or production runtime was created or changed by this step beyond the approved lifecycle backfill and schema objects.
- Post-bookkeeping no-write verification passed: JSON parse, `git diff --check`, `npm run agent:supabase-foundation-readiness`, `npm run agent:admin-projects-aggregate`, `npm run agent:public-supabase-readiness`, `npm run agent:check`, Harness GC/report with no failures, and the full Cloudflare preview smoke against latest deployed preview `https://d29d45cf.urblo.pages.dev` for commit `9441811`.

### Next Approval Boundary
- Migration A is closed. At this checkpoint the next step required a second action-specific approval and a continuous Project edit freeze; that approved happy path is recorded above. The later closeout entry now governs C, fresh Preview, runtime promotion, B, and Jay's fool-test boundary.

## Entry - 2026-07-16 (Phase 1 Branch Push Gate Exception)

### Gate Decision
- Phase 1 implementation commit `389023f` was created only after the full host-side runtime, Admin, Harness, readiness, plan-only, JSON, diff, and read-only responsive browser checks passed.
- The required post-commit `npm run gate` stopped before executing any project check because this workstation has no Docker-compatible runtime (`docker: command not found`). This was an unavailable runner, not a code-test failure; no attempt was made to disguise the result as a green container gate.
- Jay explicitly approved a one-time exception on 2026-07-16 to skip Docker for this push and defer installation until a later cycle. The exception applies only to pushing the current `codex/admin-ux-reshape` candidate using the already-green host-equivalent evidence; it does not change `docs/OPERATING_PROTOCOL.md` or authorize future pushes without the normal container gate.
- No Supabase migration, tagged Project/Storage write, invite, or production promotion is included in this exception.

### Branch Preview Evidence
- Pushed `codex/admin-ux-reshape` through commit `30e9b57` (`389023f` is the Phase 1 implementation commit; `30e9b57` records the one-time gate exception). Cloudflare associated that exact commit with deployment `1c3372dd-d4b0-49c1-a02b-ffee96e60ee3` and immutable URL `https://1c3372dd.urblo.pages.dev`.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://1c3372dd.urblo.pages.dev` passed: all public/Admin route shells, recursively discovered JavaScript/CSS status and MIME/body checks, configured-bundle/browser-secret boundaries, legacy redirects, safe-failure form Functions, and the protected `/api/admin/projects` boundary passed without content or Storage writes.
- The branch alias `https://codex-admin-ux-reshape.urblo.pages.dev` and immutable URL both returned HTTP 200. GitHub's Cloudflare check callback still displayed `in_progress` at the final readback even though the immutable deployment was already serving and passed the independent smoke; keep that callback lag visible rather than calling it a completed check.

### Next Handoff
- Stop for Jay's separate approval before applying expand migration `supabase/migrations/20260719015649_project_aggregate_drafts.sql`.
- Do not begin the tagged authenticated Project/Storage workflow under that approval; it remains a second action-specific production-write decision after expand migration readback.

## Entry - 2026-07-14 (Admin Projects Phase 1 Source Candidate)

### Scope
- Implemented the approved Phase 1 Projects vertical prototype in local source as a page-shaped aggregate workspace: one aggregate draft and sticky action bar, collapsible sections in public-page order, shared public/draft rendering, visual hotspot placement, inline private-first media, and archived-slug suppression so a hidden CMS project does not reappear from bundled fallback.
- Added accessible up/down ordering for facts, materials, media blocks, maps, and map-scoped points; continuous sort indexes are derived from visible order rather than exposed as editor fields. The Projects list/editor now remain side by side around 1116px, narrow section actions wrap, and material-map tabs have roving keyboard/tabpanel semantics.
- Removed the global user-facing legacy/migration fallback card and disabled redundant clean Save, already-live Publish, and already-hidden Hide actions.
- Kept the searchable picker bounded to the latest 500 library rows while exact-batch-fetching every image referenced by the loaded draft; referenced private signed previews refresh every 45 minutes. Dirty-state comparison is computed once in the parent editor page instead of duplicated during hotspot movement.
- Added a protected `/api/admin/projects` Pages Function and service-role-only aggregate RPC source for list/get/save/publish/archive. Aggregate save and its audit event are transaction-bound; publish persists the request's current draft revision before applying the canonical aggregate.
- Updated behavior-level Harness coverage for the new editor rather than preserving obsolete string assertions.

### Security And Reliability Boundaries Present In Source
- The Function keeps the service-role key server-side, authenticates an active admin profile, allows Viewer reads only, and normalizes new or claim-bearing Editor changes back to `needs_review` instead of trusting browser-supplied approval state. The RPC locks and rechecks that profile against the Function's initial trusted role so a concurrent role change fails closed. Existing canonical Projects also carry a required `baseUpdatedAt` token from GET through POST/RPC, including first adoption before a private draft exists.
- Publish performs early checks plus transaction-local media and taxonomy reference rechecks. The locked canonical token comparison precedes every first-adoption draft/canonical write and all later Publish/Hide mutations. PGRST errors carry the structured HTTP detail shape expected by the Function mapper so intended conflict/permission responses do not collapse into generic upstream errors.
- Private-to-public Storage promotion is create-only with byte verification. A failed publish performs reference-aware compensation for public copies created by that request and reports retained objects when safe cleanup cannot be proven.

### Production And Acceptance Boundary
- Projects database rollout is split into two source-only migrations. Expand migration `supabase/migrations/20260719015649_project_aggregate_drafts.sql` creates the private draft/RPC contract and writes the child lifecycle backfill. Contract migration `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql` later revokes legacy browser table/sequence writes and hardens public parent/child policies. Jay has not approved either migration and neither has been applied or read back in production.
- No Phase 1 production content/Storage write, branch preview, authenticated aggregate save/publish/public-readback/hide workflow, or production promotion occurred in this source milestone.
- The full host-side local suite passed on 2026-07-14: build, lint, typecheck, agent smoke, Admin CMS predeploy, Admin config gate (11/11 routes), Harness check, Supabase/public/Cloudflare readiness, aggregate/CRUD coverage, plan-only admin CRUD/content-import checks, JSON parsing, and `git diff --check`. The preferred clean-container `npm run gate` remains the final post-commit pre-push check.
- A read-only local Playwright implementation check used the real owner session plus a mocked aggregate GET endpoint, with POST requests forced to 405. It verified the 1116px side-by-side workspace, clean action states, and the inline dirty-navigation choice. It also exposed a 390px shell overflow; the mobile grid/nav containment was fixed, the page read back at `scrollWidth === innerWidth`, and the aggregate verifier now guards that containment. This is implementation evidence only, not the authenticated preview workflow or Jay's fool test.
- `NOW-ADMIN-UX-RESHAPE-001` remains `now` and cannot be marked done from source inspection, Harness checks, screenshots, or agent self-review.
- Jay alone owns the documented unassisted fool-test acceptance; it remains pending.

### Next Handoff
- Commit the complete Phase 1 candidate, run the clean-container gate, push the branch preview, and run its no-write smoke before requesting approval for expand migration `supabase/migrations/20260719015649_project_aggregate_drafts.sql`.
- After expand readback, request separate action-specific approval for tagged Project/Storage writes, then freeze all Project editing before the authenticated preview workflow. Keep the freeze through aggregate UI/endpoint production promotion and contract readback so legacy child-table writes cannot overlap the new aggregate path.
- Request a fresh separate approval before applying contract migration `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql`; then read back table/sequence privileges, public policies, and security advisor state before lifting the freeze. After contract, a Cloudflare-only rollback to the legacy direct-write UI is invalid.

## Entry - 2026-07-14 (Admin UX Reshape Directive And Phase 0 Read-Only Audit)

### Direction And Task State
- Imported Jay's approved `docs/ADMIN_UX_RESHAPE_PLAN.md` directive from the Claude review branch into `codex/admin-ux-reshape`; the complete sunset clause remains part of the temporary authority.
- Registered `NOW-ADMIN-UX-RESHAPE-001` as `next`, preserving the max-three active-task rule while Phase 0 remains open. The task prohibits copy-only Clarify loops, requires behavior verification to follow the new UI, and reserves the fool test for Jay.
- No Phase 1 runtime source was changed before the Phase 0 prerequisites.

### Phase 0 Read-Only Evidence
- Supabase migration history stops at `20260603142359 project_media_blocks`; `20260713065628_media_public_bucket_role_hardening.sql` is not applied.
- Production `storage.objects` INSERT/UPDATE policies currently allow active Editor access to both `urblo-admin-media` and `urblo-public-media`, confirming the direct-public-write gap remains open.
- `npm run agent:admin-media-role-boundary-live` passed in plan-only mode: distinct owner/editor credentials and the browser-safe key are present; no login, network request, Storage object, update, delete, or other production write occurred.
- Official Supabase guidance confirms Site URL is the default fallback and recommends exact production redirect paths. The app requests `https://urblo.com.au/admin/account-setup?mode=invite` and `?mode=recovery`; the prior delivered invite's localhost callback remains failing evidence.
- The available Supabase database connector cannot read hosted Auth URL configuration, and the local environment has no Management API token. Chrome reached the Supabase/GitHub sign-in screen but had no existing dashboard session, so configuration readback and mutation stopped pending Jay login plus item-specific approval.

### Phase 0 Approved Auth URL Configuration
- Jay logged into the production Supabase dashboard and explicitly approved only the Auth URL configuration change. The initial dashboard readback showed Site URL `http://localhost:3000` and no Redirect URLs.
- Site URL was changed to `https://urblo.com.au`; the dashboard returned `Successfully updated site URL` and a fresh readback showed the saved value.
- Added and precisely read back the two approved allowlist entries: `https://urblo.com.au/admin/account-setup?mode=invite` and `https://urblo.com.au/admin/account-setup?mode=recovery`. A second read-only browser pass verified all three persisted URLs; the recovery value was checked in fixed-length chunks to avoid Chrome title truncation.
- No invite or recovery email was sent, no database migration was applied, and no Storage object or policy was written during this action. Auth URL configuration is closed as a Phase 0 prerequisite; custom Auth SMTP ownership and the real invite/recovery golden workflow remain open.
- The Auth action ended before any migration or Storage write; the separately approved migration is recorded below.

### Phase 0 Approved Media Role Migration
- Jay separately approved applying the Media role migration only; tagged Storage object writes were explicitly outside this approval.
- Pre-apply readback confirmed production migration history ended at `20260603142359 project_media_blocks`, while both `urblo_storage_admin_object_insert` and `urblo_storage_admin_object_update` still allowed active Editors across the private and public buckets.
- Applied `media_public_bucket_role_hardening` to production project `npkidywzwddbnfrnxlmo`. Supabase recorded version `20260714050750`; the local migration filename and Harness references were aligned to `supabase/migrations/20260714050750_media_public_bucket_role_hardening.sql`.
- Post-apply readback confirms the INSERT policy allows owner/admin/editor for `urblo-admin-media` but only owner/admin for `urblo-public-media`. The UPDATE policy has the same split in both `USING` and `WITH CHECK`.
- The security advisor reports one current warning: Auth leaked-password protection is disabled. This is unrelated to the Storage migration and was not changed without separate approval. Performance advisor findings are pre-existing unused-index and multiple-permissive-policy notices; no migration-specific Storage/RLS security lint appeared.
- No Storage object, media metadata row, invite, recovery email, or content status was created or changed during the migration action. Phase 0 then blocked only on the separately approved tagged Editor/owner Storage role-boundary proof recorded below.

### Phase 0 Tagged Media Role-Boundary Proof
- Jay separately approved the exact tagged production Storage proof. It used the existing active Editor and owner accounts through the browser-safe key; it did not send email or mutate content/database records.
- The first marker, `media-role-1784006293326-a081ef77`, exposed a verifier defect after the role operations: the public object update and cleanup readbacks reused a cached URL, so Supabase Smart CDN returned the earlier bytes and a temporary HTTP 200 after deletion. Exact `storage.objects` readback was already zero rows, proving cleanup had succeeded rather than leaving an object behind.
- Updated `scripts/check-admin-media-role-boundary-live.mjs` so every byte and absence readback uses a unique `cacheNonce`, requests no-cache, uses a short QA cache TTL, and reports CDN diagnostics on byte mismatch. This follows Supabase's documented update/delete invalidation window without weakening the rule that a fresh origin read returning an object is a hard cleanup failure.
- The corrected strict run passed for marker `media-role-1784006428939-3520f05f`: Editor private insert/update succeeded; Editor public insert/update was denied and did not alter the owner-created object; owner public insert/update succeeded; and every tagged object was removed with absence read back.
- Independent production SQL after the run returned zero `storage.objects` rows for both markers. No tagged object, email, media metadata row, audit/content row, or content status remains from this proof.
- Phase 0 is closed. `NOW-ADMIN-UX-RESHAPE-001` moved into `now`; the separately decision-gated Turnstile task moved to `next` so the queue remains at three active executable tasks. Phase 1 starts with the approved Projects vertical prototype, while Jay retains the fool-test acceptance.

## Entry - 2026-07-13 (PR #6 Production Recovery And Evidence-Bound Cache Gate)

### Deployment Result
- Cache-repair PR `#6` merged as `a2a7ae5`; Cloudflare production deployment `c7a910df-6dd3-440b-8971-a6120353ed19` completed at immutable origin `https://c7a910df.urblo.pages.dev`.
- The immutable deployment passes the MIME/body-aware asset smoke across 59 recursively discovered JavaScript/CSS assets. Both `https://urblo.com.au` and `https://www.urblo.com.au` are bound to that exact deployment by root asset identity plus full-graph byte-for-byte and MIME comparison.
- Apex production passes with four residual response-header warnings on `Home-esKw3164.css`, `publicEntitySeo-CgpviqMQ.js`, `projectFactValue-CROx5WB9.js`, and `supabase-KVA2hGew.js`. Each warned response has exact byte and MIME equality with the immutable deployment; `www` passes without warnings. These stale headers are operational cleanup, not evidence of stale or malformed current code.
- The Cloudflare dashboard session available to this run was signed out and no Cloudflare API token was present, so no cache purge or account configuration mutation was attempted.

### Harness Closure
- `scripts/check-cloudflare-preview-smoke.mjs` now rejects redirects on every direct SPA route, requires every route to reference the same entry assets as `/`, rejects absolute/protocol-relative/query/fragment/namespace-escaping asset references, then compares every recursively discovered same-origin query-free production JavaScript/CSS asset against an independent immutable deployment when `--reference-url` is supplied. Redirect-to-home, route-specific stale shells, URL substitution, status, empty bodies, SPA HTML fallbacks, MIME, bytes, graph budget, bundle markers, browser-secret boundaries, legacy redirects, and Function safe failures remain hard gates.
- A residual year-long cache header remains a hard failure without `--reference-url`. With a reference it becomes a warning only after exact bytes and MIME match; source readiness still hard-fails any project-authored `Cache-Control:` line in `public/_headers`.
- Production apex, `www`, and the moving `urblo.pages.dev` alias are matched after FQDN trailing-dot normalization and require `--reference-url`; it accepts only an HTTPS `https://<8-hex-deployment>.urblo.pages.dev` origin and must differ from `--base-url`. Negative checks proved a missing production reference, trailing-dot bypass, production-domain self-reference, immutable self-comparison, route redirect, route-specific stale shell, absolute asset URL, and query-bearing asset URL all fail, while the previous PR `#5` deployment fails root asset identity.

### Production Admin Verification
- `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`: pass. The browser gate proved three blocked-Supabase public static fallbacks, all nine authenticated admin routes, Sign out, and a protected-route revisit.
- This is no-write production auth/route evidence. It does not prove editor draft save/refresh, Storage promotion, publish/public readback, archive, Settings public readback, invite/password setup, password recovery, responsive workflow completion, Dashboard use, or editor-guide usability.
- No Supabase content row, Storage object, content status, invite, recovery email, Cloudflare setting, or DNS record was changed during this production recovery/readback.

### Verification
- Docker remained unavailable, so the documented host-equivalent runtime gate passed in order: `npm run build`, `npm run lint`, `npx tsc -b`, and `npm run agent:smoke`.
- `npm run agent:admin-cms-predeploy`, `npm run agent:admin-config-gate` (11/11 routes), `npm run agent:cloudflare-readiness`, `npm run agent:check`, JSON parsing, and `git diff --check`: pass.
- `npm run agent:harness-gc` and `npm run agent:harness-gc:review`: zero failures; the only warning is the intentional historical WORKLOG size threshold.
- Bound production smoke: apex and `www` pass against `https://c7a910df.urblo.pages.dev`; the previous immutable deployment and missing-reference negative runs fail for the intended reasons.

### Remaining Boundary
- Production `/admin` is reachable and authenticates on the repair deployment; the prior cached-asset release blocker is superseded.
- CMS handoff remains `revalidation_required` until the confirmed localhost Auth callback configuration is corrected, the pending Media Storage migration is applied/read back and its Editor/owner role proof passes with explicit write approval, and all twelve UI golden workflows are recorded against one deployment.

## Entry - 2026-07-13 (PR #5 Production Asset Cache Incident And Harness Repair)

### Deployment And Discovery
- Harness PR `#5` merged as `cb0ec9a`; Cloudflare deployment `4aef2ba1-3e00-4e43-b5d6-1ac962fbf02d` completed successfully at `https://4aef2ba1.urblo.pages.dev`.
- Branch-preview route/asset/redirect/Function smoke passed. The immutable production deployment then passed blocked-Supabase static fallback for Products, Projects, and Articles plus all nine authenticated admin routes, Sign out, and protected-route revisit.
- The first custom-domain smoke appeared to pass, but the production auth/fallback check failed on `/products`. Direct inspection proved the custom origin returned the SPA HTML shell with HTTP 200 for `/assets/index-JYM_HDIO.css`, `/assets/publicMediaUrl-DnH1XMRj.js`, and `/assets/publicContentOverlay-DLdr1C4F.js`; the same exact paths returned real CSS/JavaScript from the immutable deployment. The custom responses were Cloudflare cache hits, while a query-string cache miss returned the correct asset.
- A browser receiving the exact cached `publicMediaUrl` URL produced `error loading dynamically imported module` and a blank public page. This is a real production custom-domain failure, not a test-only discrepancy.

### Harness And Runtime Repair
- `scripts/check-cloudflare-preview-smoke.mjs` previously asserted only HTTP 200 for recursively discovered assets, then parsed an HTML fallback as if it were JavaScript. It now checks the exact browser URL without cache-busting, requires JavaScript/CSS MIME types, and rejects a doctype, HTML document, or React root shell body on an asset path.
- The asset traversal now resolves both `/assets/...` and relative `./chunk.js` / `../chunk.js` references, rejects redirects and empty bodies, accepts only exact JavaScript/EcmaScript media types or `text/css`, rejects the removed year-long immutable asset policy, and fails explicitly if the recursively discovered graph exceeds 200 entries instead of silently truncating coverage.
- Production smoke accepts an optional immutable `--reference-url` and requires the custom origin's root entry/style asset identity to match it. This binds a green custom-domain result to the newly promoted deployment instead of allowing a complete but stale version to pass.
- Removed the project-authored one-year `/assets/*` and `/fonts/*` immutable cache rules plus the one-day `/media/*` override. Cloudflare Pages default cache/revalidation behavior now owns static assets; `agent:cloudflare-readiness` fails if those custom cache patterns return.
- The first host-equivalent gate exposed a local `.claude/worktrees/.../.vite` dependency cache to the root ESLint scan. ESLint now ignores nested Vite caches and the machine-local Claude worktree root, so lint measures the active working tree instead of generated files from a separate checkout.
- A negative production run of the strengthened gate fails on the cached CSS false 200, proving the new assertion detects the incident.
- Semantically equivalent, explicit source/CSS edits produce new hashes for all three affected assets and their importing chunks, avoiding the poisoned exact cache keys on the repair deployment. The local configured build now emits `index-BPfkogHO.css`, `publicMediaUrl-BCnm8sfh.js`, and `publicContentOverlay-C9qA3frw.js` instead of the cached paths.
- No Supabase content row, Storage object, profile, invite, recovery email, or audit event was created by this incident diagnosis or repair.

### Local Verification
- Docker remains unavailable, so the documented host-equivalent gate passed: `npm run build`, `npm run lint`, `npx tsc -b`, `npm run agent:smoke`, `npm run agent:check`, and `git diff --check`.
- `npm run agent:cloudflare-readiness`: pass with project-authored asset/font/media cache overrides required to remain absent.
- Strengthened deployed smoke: pass against the local production build; expected fail against the currently affected production origin on the cached CSS HTML shell.
- Immutable-reference mode: pass against the local build when its root entry/style identity matches the supplied reference origin; production promotion will supply the exact `*.urblo.pages.dev` deployment URL.
- `npm run agent:admin-cms-predeploy`: pass in no-write mode; `npm run agent:admin-config-gate`: 11/11 pass; configured `npm run agent:admin-auth-browser -- --allow-login --strict`: pass for three blocked-Supabase fallbacks, nine authenticated routes, Sign out, and protected-route revisit.
- Harness GC: zero failures; the only warning remains the intentional historical WORKLOG size threshold.

### Current Boundary
- PR `#5` immutable deployment evidence is valid, but production custom-domain health is not. The repair must pass the MIME-aware smoke on both its immutable URL and `https://urblo.com.au`, followed by the authenticated production browser gate, before the release is called green.
- The admin handoff remains `revalidation_required`; the Auth redirect, Media migration/role proof, and twelve golden workflows remain separate open work.

## Entry - 2026-07-13 (QA Editor Provisioning And Harness Reality Repair)

### Scope And Approved Account Change
- Jay approved creating a separate production QA Editor and keeping its credentials in the ignored local `.env`.
- The local browser-safe Supabase key plus owner and Editor credentials are now present without being printed or committed; `.env` remains mode `0600`.
- The first test invite used an address unavailable in the connected mailbox. Its newly created, still-unconfirmed Auth user was removed with an ID/email/age/confirmation-constrained cleanup; the historical invite audit event remains.
- A final approved QA Editor invite was created through the protected production Function. The email arrived, but its callback fell back to `http://localhost:3000` even though the Function supplied the production origin. This confirms an incorrect or incomplete Supabase Auth Site URL/Redirect URL configuration.
- The one-time invite was consumed directly through the Auth API only to activate the QA account for role testing. Password sign-in and the account's own active `editor` profile RLS readback passed. This direct activation does not satisfy the Settings invite/password golden workflow.

### Harness Problems Confirmed
- `scripts/check-admin-auth-browser.mjs` still matched the retired display copy `Admin login`, so the repaired login page produced a false failure before authentication.
- `scripts/check-admin-config-gate.mjs` reused the normal `dist/`; after a real browser key was added locally, the supposed no-config check exercised a configured bundle and failed for the wrong reason.
- The auth-browser check also reused any existing `dist/`, so an old bundle could pass while current source was broken. Its Sign out assertion stopped at the returned login page and did not reopen a protected route to prove the session was actually gone.
- The env-less build had hidden a configured-build regression: with the Supabase browser key present, the main entry had grown to approximately 627.72 kB. Merely splitting a vendor file would remove the per-file warning without proving that Supabase left the eager entry path.

### Repairs
- Added a stable `admin-login-form` test marker and removed display-copy matching from login/signed-out state assertions.
- The no-config gate now builds a dedicated temporary bundle with all browser-safe Supabase variables explicitly cleared. It no longer depends on the normal configured `dist/`.
- The auth-browser gate now builds current source into its own configured temporary bundle, enforces a maximum 500,000-byte entry file, rejects eager Supabase module preload, aborts the dynamic Supabase chunk and proves Products/Projects/Articles still render static fallback, signs in, verifies all nine authenticated routes, signs out, then reopens `/admin/media` and verifies the protected redirect again.
- Both browser gates now require the current preview process to report readiness, verify the served HTML references the entry hash from that gate's isolated build, treat early process exit as failure, and force cleanup if graceful preview shutdown stalls. This prevents an old service already occupying the port from producing a false pass.
- The public Supabase client now loads on demand. Vite keeps it in a dedicated vendor chunk, but the configured `index.html` does not module-preload that chunk; this improves the dependency boundary instead of only suppressing a size warning.
- A failed dynamic SDK chunk load or client construction now resolves as no public client, resets the in-flight initializer for a later retry, and preserves the existing static-content fallback instead of rejecting Product, Project, or Article page loads. Public settings still requests the chunk shortly after the first public render, so this change removes it from the eager entry/preload path; it does not claim the homepage never downloads Supabase.

### Verification Results
- `npm run build`: pass. Configured output entry `416.89 kB`; Supabase vendor `211.64 kB`; no `>500kB` warning; Supabase is absent from `dist/index.html` preload links. The existing Browserslist staleness notice remains.
- `npm run agent:admin-auth-browser -- --allow-login --strict`: pass against an isolated configured current-source build for three blocked-Supabase static fallback routes, all 9 authenticated routes, Sign out, and the protected-route revisit. No content rows, Storage objects, or audit events were created by this browser check.
- `npm run agent:admin-config-gate`: pass for 11/11 routes against the isolated no-config build.
- Port-conflict negative check: pass. With a dummy service occupying the strict preview port, `agent:admin-config-gate` failed instead of accepting the old service, confirming the early-exit/readiness/entry-hash guard prevents that false pass.
- `npm run agent:public-supabase-readiness`: pass after the public client became asynchronous/on-demand.
- `npm run agent:public-content-overlay`: pass.
- `npm run agent:admin-media-role-boundary-live`: the earlier plan-only run now finds distinct owner/Editor/browser-key inputs; it made no login or Storage write and still requires migration readback plus explicit approval for the tagged live proof.
- `npm run lint`, `npx tsc -b`, `npm run agent:smoke`, `npm run agent:check`, `npm run agent:admin-cms-predeploy`, and `git diff --check`: pass.
- `npm run agent:harness-gc` and `npm run agent:harness-gc:review`: zero failures; the only warning is the intentional historical WORKLOG length threshold.

### Remaining Boundary
- Production Auth callback configuration is not fixed. Email arrival plus a localhost callback is a failing invite-flow result, not partial handoff completion; Auth custom SMTP ownership is also still unverified.
- The pending Media Storage role migration was not applied, and no content row, content status, Storage object, password-recovery email, or golden-workflow mutation was created in this checkpoint.
- The Harness/runtime follow-up in this entry still requires reviewed deployment, production no-write smoke, and a production auth-browser rerun. The twelve-workflow handoff remains `revalidation_required`.

## Entry - 2026-07-13 (Admin Reliability Preview And Production Deployment)

### Scope
- Rebased the admin reliability/UX repair onto current `origin/main`, preserved the operating protocol and image-optimization work, and kept the unrelated untracked SEO external AI brief draft (never committed) out of the release.
- Added `.dev.vars` to `.gitignore` and changed the local `.env` mode from `0644` to `0600`; no secret value was printed, staged, or committed.
- Published branch `codex/admin-reliability-ux`, opened PR `#3`, verified its Cloudflare preview, and merged it to `main` after the preview gate passed.
- Verified Cloudflare production deployment `6d193af5-cf8e-4541-a1e2-c73164d1a290` for merge commit `46d46b4` at immutable URL `https://6d193af5.urblo.pages.dev` and production origin `https://urblo.com.au`.

### Verification Results
- Docker was unavailable on this workstation, so the documented host-equivalent fallback ran in order: `npm run build`, `npm run lint`, `npm run agent:smoke`, `npm run agent:check`, and `git diff --check`: pass.
- `npm run agent:admin-cms-predeploy`: pass in no-write mode.
- `npm run agent:admin-config-gate`: 11/11 Firefox route checks passed.
- `npm run agent:harness-gc` and `npm run agent:harness-gc:review`: zero failures; one intentional warning remains because `docs/WORKLOG.md` is over the 8,000-line review threshold.
- Cloudflare branch preview `https://codex-admin-reliability-ux.urblo.pages.dev`: deployment success and `npm run agent:cloudflare-preview-smoke` pass.
- GitHub PR `#3`: merged to `main` as `46d46b4` after the Cloudflare preview check passed.
- Cloudflare production deployment and the GitHub Pages workflow: success.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass for public/admin route shells, recursively discovered assets, admin bundle secret/config boundaries, representative redirects, and safe no-write Function behavior.

### Result And Remaining Boundary
- The repair is now deployed; the previous statement that production still ran the old admin build is superseded by this entry.
- Deployment proves buildability and public/no-write route behavior only. It does not prove signed-in editor save/refresh, private-media promotion, publish/public readback, archive, settings consumption, invite/password setup, recovery, responsive authenticated navigation, Projects task completion, Dashboard operations, or editor-guide usability.
- The pending Media Storage role migration was not applied and no Supabase row, Storage object, invitation, recovery email, or content status was changed during this release.
- A separate QA Editor still needs provisioning before the approved Editor/owner role-boundary proof. Production handoff remains `revalidation_required`.

## Entry - 2026-07-13 (Admin Reliability And Task UX Re-Audit)

### Scope
- Reopened the production CMS handoff after Jay reported that `/admin` was not working and was extremely difficult to use.
- Read the Harness control documents, inspected the implemented admin/public data paths, and reviewed the current production admin at a common 1116 x 799 desktop viewport without signing in or writing data.
- Treated prior route-shell screenshots and direct browser-key/API mutations as historical infrastructure evidence, not proof that an editor can complete the UI workflow.
- Made local source, UI, contract, and Harness repairs only. No deployment, production login, Supabase write, Storage write, invitation, recovery email, content publication, or archive action was attempted.

### Management And Harness Findings
- The earlier strict handoff check could pass from a WORKLOG `Pass` phrase plus valid URL/email inputs. It did not require a login, draft save/refresh, publication, public readback, archive, invitation, or recovery result.
- The June auth browser check proved authenticated route shells and sign-out. The June CRUD verifier mutated tables directly through browser-key/RLS calls. Both were useful infrastructure tests, but neither represented the actual editor product.
- This created a completion-evidence mismatch: the Harness was strong on source contracts, schema/RLS posture, and safe live-write gating, but weak on task-level product outcomes.
- Current truth is spread across `AGENTS.md`, `docs/HANDOFF.md`, `docs/agent/status.json`, the approximately 200 KB task queue, the approximately 668 KB WORKLOG, and many exact-copy source checks. The compact startup surfaces help, but current claims can still drift unless evidence is machine-bound to a deployment.
- The machine queue marked `NOW-ARTICLE-STRUCTURE-CLAIMS-001` done even though its own notes and current handoff said claim cleanup was paused and acceptance was unmet; it is now `next`, matching the user decision and remaining work.
- `docs/agent/admin-handoff-evidence.json` v2 is now the machine-readable production assertion. It starts as `revalidation_required`, expires evidence after seven days, requires one immutable Cloudflare deployment URL and a real local Git commit SHA, and requires tracked or same-deployment evidence for every editor golden workflow.
- The strengthened readiness checker now rejects source/documentation drift even in report mode. Missing live evidence remains report-only before deployment and becomes blocking under `--strict`.

### Confirmed Reliability Failures
- The Supabase auth listener called session/profile work from inside `onAuthStateChange`, matching Supabase's documented client-lock deadlock pattern.
- Settings could invite an Auth user, but there was no safe account-setup/password-recovery product flow. Contact/Sample Request SMTP2GO proof did not prove Supabase Auth email delivery.
- Invite redirects accepted a browser-supplied URL, and a failed profile insert could leave an orphaned invited Auth user.
- Media loading was capped at 80 records while the imported library contained 115 candidates. Selecting new External media could be overwritten by the selected-record effect.
- Publishing private Storage media changed database metadata without copying the object to the public bucket. Public adapters then read `source_url`, so Storage-backed uploads had no usable public URL.
- Public services replaced an entire static category as soon as any Published CMS row existed. Publishing one record could hide unrelated static records.
- Published `site_settings` had an admin editor but no public consumer.
- Lifecycle copy said Archive removed content from the website, while migration fallback can reveal a matching legacy static record after the CMS version is hidden.

### Confirmed UX Failures
- The production Projects screen mounted all project, fact, material, media, map, and hotspot editors in one page. At 1116 x 799 it was approximately 9,600 pixels tall before completing a normal record task.
- Projects had no stable selected-record URL, no unsaved-change warning, repeated non-searchable media selects, and no task-stage focus.
- Most admin modules are large page monoliths that expose the database shape rather than an editor workflow. Projects was approximately 3,200 source lines before this repair; Stone Library was approximately 2,500.
- The repository has extensive source-string and live API verifiers but no normal component/integration/end-to-end suite for editor behavior. Generated configuration-gate browser specs do not replace an authenticated editor journey.
- Production contains visible tagged QA residue in leads/content queues, which makes the operational dashboard harder to trust.

### Local Source Repairs
- Deferred auth refresh outside the synchronous Supabase auth-state callback. Same-user/token refreshes now run in the background without unmounting the active editor; initial login, sign-out, and genuine user transitions retain blocking state changes.
- Added focused sign-in, forgot-password, invite/recovery account setup, explicit expired/invalid-link states, keyboard focus indicators, and announced error/success states.
- Bound implicit invite/recovery callbacks to the captured token pair inside a separate non-persistent/no-refresh/no-URL-detection Auth client. The shared browser client no longer auto-consumes URL sessions, captured callback credentials are removed from the address bar, and the same isolated client verifies the callback user and writes the password. A different login in this or another tab therefore cannot rebind the callback, and opening a password link cannot replace an unrelated shared admin session. The completion screen returns to explicit password sign-in instead of inferring access from whichever shared session is present. Query-string spoofing, stale/unrelated sessions, reused links, and unsupported PKCE callbacks fail safely.
- Derived invite callbacks from the request origin, disabled server URL-session detection, removed the browser redirect input, and delete the newly invited Auth user if profile creation fails.
- Increased Media loading to 500 records, stabilized new External records, and validated external/hosted media as safe HTTP(S) or root-relative URLs.
- Forced every initial Media upload into the private bucket. A failed metadata insert is read back before cleanup; owner/admin roles can best-effort remove a confirmed private orphan, while editors receive an explicit private-only orphan warning because their role cannot delete Storage objects.
- Restricted private-to-public automatic promotion to Website owner/CMS manager roles and bound it to the selected record's original private bucket/path plus `updated_at`. Promotion creates a new public object without overwrite, reads back ambiguous or zero-row guarded updates, and checks for other media-record references before rollback or private-source cleanup, retaining the object whenever ownership cannot be proved.
- Added pending migration `supabase/migrations/20260713065628_media_public_bucket_role_hardening.sql` so the same private-first rule is enforced by Storage RLS: Editors retain private-bucket insert/update, while public-bucket insert/update requires owner/admin. It is source-verified only and was not applied to production in this session.
- Added `npm run agent:admin-media-role-boundary-live` as a default no-network/no-write plan and approval-gated browser-key/RLS verifier. Live mode requires distinct active Editor and owner/admin credentials, proves Editor private insert/update success plus public insert/update denial, proves owner/admin public insert/update success, and fails unless all tagged objects are removed. The handoff evidence schema now treats applied-migration/readback plus this live role proof as a required production prerequisite separate from the twelve editor workflows.
- Extended `npm run agent:live-readiness` with that separate role-boundary check. It distinguishes the older owner/admin private-upload/anonymous-denial proof from the Editor public-bucket policy proof, rejects matching Editor/owner email identities, and keeps migration readback plus approval for that exact tagged role proof as explicit non-secret manual gates; `--media-role-migration-verified` records readback only, while the dedicated `--media-role-writes-approved` avoids conflating this permission with general CRUD approval. Neither flag applies SQL or runs writes.
- Public media resolution now requires a Published media row, accepts Storage objects only from `urblo-public-media`, and rejects unsafe external URL schemes.
- Added per-canonical-record Published CMS overlay for Projects, Products, Articles, and Stone Library so unrelated static fallback remains visible.
- Matching Published Projects retain static-only sector/category/material/map/gallery/CTA fields until the schema/public adapter owns them; facts/media dependency failures reject the CMS overlay instead of replacing healthy fallback with partial content.
- Added a validated public consumer for Published default site settings covering company name, supported footer/contact/social data, homepage SEO defaults, and default share image. Admin Published saves and public parsing share exact normalization/validation; later public mounts refetch instead of reusing a permanent success/failure cache; a static fallback result receives one bounded 750 ms retry that is cancelled on unmount; `/admin` does not perform this public settings fetch.
- Added runtime metadata plus Article/WebPage/Breadcrumb JSON-LD for resolved Published CMS Project, Product, Article, and Stone detail routes so CMS SEO fields/defaults replace the initial SPA fallback and stale static entity JSON-LD after the entity loads. Brand-new CMS-only URLs still need a release-time sitemap and crawlable first-HTML strategy.
- Lazy-loaded admin route modules, kept one stable Admin/Auth provider across `/admin/*` navigation, and kept medium-desktop header actions wrapped instead of clipped.
- Reworked Projects around stable `/admin/projects/:projectId` URLs and Overview, Facts, Materials, Media, and Maps/hotspots workspaces. Only the active workspace mounts; all six editor forms have baseline-derived unsaved-change warnings across record/new/tab/admin-navigation/sign-out/history/reload transitions; child saves update only their own row/baseline; publish blockers jump to the correct workspace; media selection is searchable.
- Added request-generation guards to Project bundle/hotspot and Article-section loads. Project/Article child saves capture the original parent and editor identity, constrain UPDATEs by parent ownership, block record switching while writes are active, and ignore a response after its parent/editor is no longer current instead of reparenting or overwriting another record.
- Added the same parent/row identity capture, ownership-constrained UPDATEs, in-flight parent-switch locks, and stale bundle/capability rejection to Products and Stone Library child editors.
- Made the Articles, Projects, Products, and Stone Library editor grids inert while a parent catalog or child bundle is incomplete. Parent selection now clears stale child forms/readiness first, enters loading state, and only the current selection generation releases it, so another record's sections/capabilities cannot drive Save or Publish. Articles now validates before taking the save lock and releases that lock in `finally`, preventing invalid or exceptional saves from freezing the editor until refresh.
- Restricted Project structured facts to JSON text or text arrays in Admin and defensively normalize legacy object/number values before public React rendering. Published Article CTA/video destinations now share a root-relative-or-http(s) contract in Admin and the public renderer, rejecting protocol-relative, unsafe-scheme, control-character, and encoded-backslash inputs.
- Updated Archive/status language across content modules to distinguish hiding the CMS version from removing a matching legacy fallback.

### Verification Results
- `npm run build`: pass. Admin route chunks are separate; the known Browserslist data-staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/account-setup` and `/admin/projects/1` route shells.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.
- `npm run agent:admin-crud-coverage`: pass, including isolated callback-password writes, private-only initial Media uploads, selected-path/version promotion guards, metadata readback, reference-safe Storage cleanup, parent ownership, loading interaction boundaries, and Articles save-lock release source contracts.
- `npm run agent:public-content-overlay`: pass, including unmatched-static retention, Published precedence, Draft media rejection, and unsafe media URL rejection.
- Targeted ESLint and `npx tsc -b`: pass after the Project/Article concurrency, structured-fact, safe-link, dynamic JSON-LD, and Settings retry repairs.
- `npm run agent:admin-crud-coverage`: pass after parent-ownership predicates and stale-response guards were added to Projects and Article sections.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:supabase-foundation-readiness`: pass, including the pending owner/admin-only public-bucket insert/update policy source.
- `npm run agent:admin-media-role-boundary-live`: pass in plan-only mode. It reported the missing live credentials, made no network call, login, upload, update, or delete, and did not claim the migration was applied.
- `node --check scripts/check-live-readiness.mjs` and targeted ESLint for the live-readiness/role-boundary verifiers: pass.
- `npm run agent:live-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au`: pass in report-only mode. It lists the production URL and admin email without printing secrets, keeps the migration/approval/Editor-owner credential gates missing, and does not query or mutate Supabase.
- Synthetic no-network identity checks: pass. Both readiness reporting and the role-boundary verifier reject `Same@Example.com` versus `same@example.com` as the same account even when every other fake input/flag is present; the readiness item remains `ready: false`.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:seo-readiness`: pass.
- `npm run agent:admin-cms-predeploy`: pass in no-write source/report mode.
- `npm run agent:check`: pass.
- `npm run agent:harness-gc` and `npm run agent:harness-gc:review`: zero failures and one intentional warning for the 12,000-line historical WORKLOG.
- Strict admin handoff readiness: expected fail. The repaired source is not deployed, the applied-migration/role-boundary prerequisite is missing, and all twelve production workflow/usability evidence items remain missing or stale.

### Residual Risks And Explicit Follow-Ups
- Production still runs the previous admin build. This entry does not claim that the user's production problem is closed.
- Supabase Auth custom SMTP and exact allowed invite/recovery redirect URLs remain unverified. The implemented callback supports implicit token-pair links only; PKCE `?code=` callbacks are deliberately rejected until a state-bound code-exchange flow is designed.
- Media promotion spans Storage and database operations and cannot be atomic in the current browser workflow. Original-path/version binding, reference checks, and retain-on-uncertainty behavior reduce cross-record deletion risk but do not create a transaction.
- The public-bucket role-hardening migration is not applied in production yet. Until it is applied and read back, a signed-in Editor can still bypass the UI and call the existing public-bucket write policy directly.
- Media search is capped at 500 rather than paginated/virtualized, Projects has confirmation-based protection rather than autosave/draft recovery, and there is no admin-to-public preview contract.
- Products, Articles, Stone Library, Media, Settings, and Leads still need the same task-level UX treatment where user testing shows friction.
- Project materials, maps, and hotspots are editable in admin, but not every stored relationship has a complete public consumer. Multi-table content saves are not transactional.
- The current Project schema has no sector/category fields. Matching legacy Projects preserve static taxonomy, while a brand-new CMS-only Project still receives generic taxonomy until a migration/editor field is designed.
- An Archived CMS record can reveal a matching static fallback until CMS-only cutover. Editors must verify the public route rather than assuming Archive means absence.
- Client-side entity SEO and entity JSON-LD update after JavaScript loads; brand-new CMS-only URLs are not added automatically to the static sitemap or structured route inventory, and deep-link first HTML remains the shared SPA shell.
- Tagged QA residue should be reviewed and cleaned only under an approved retention policy; no destructive cleanup was attempted here.
- Production closure requires applied-migration/readback plus live Editor/owner Storage-role evidence, then deployment and approved evidence for sign-in, draft save/refresh, private media publish, public readback, archive behavior, settings public readback, invite/password setup, recovery, responsive admin navigation, the Projects task workflow, the Dashboard operational queue, and non-technical editor-guide usability against the same deployment SHA.

### Result
- The codebase now has a credible local P0 reliability patch and the first task-oriented editor redesign, plus a Harness that refuses to call the CMS handed off from source checks alone.
- `NOW-ADMIN-RELIABILITY-UX-001` remains `now`. The next action is apply/read back the Storage role migration and pass the approved Editor/owner verifier, deploy one reviewed SHA, configure Auth email/redirects, run the approved production golden workflow, then close Projects pagination/preview gaps before copying the pattern to other modules.

## Entry - 2026-06-30 (Operating Protocol + Container Gate)

### Scope
- Added `docs/OPERATING_PROTOCOL.md` as the session-level working agreement: container-first test-gated delivery (branch -> `npm run gate` -> Cloudflare preview smoke -> promote to `main`) plus the design review -> implement -> remember loop on top of `docs/DESIGN.md` and `docs/brand-baseline.md`.
- Added the local container gate: `Dockerfile.gate` + `scripts/container-gate.sh` + `npm run gate`. Gates run as Docker build steps (build incl. `tsc -b`, lint, `agent:smoke`, `agent:check`), with `git diff --check` host-side.
- Ran an 8-angle adversarial review of the setup (line-scan, removed-behavior, cross-file/harness tracer, reuse, simplification, efficiency, altitude, conventions); 19 confirmed findings were fixed in the same branch.
- Review fixes: `.dockerignore` now excludes `.env*`/`.dev.vars`/`*.local` so secrets never enter the gate image and the build stays env-less; dropped the no-op separate `tsc -b` step; added `agent:check` to the gate; working-tree-vs-commit caveat plus dirty-tree warning; `.github/workflows/deploy.yml` bumped Node 18 -> 20 for parity with the gate; gate registered in `scripts/check-harness.mjs` required files/scripts; `docs/OPERATING_PROTOCOL.md` added to AGENTS.md Canonical Conflict Precedence; honest machine-local wording for the session kick-start hook; npm cache mount and label-scoped image pruning.

### Changed Files
- `docs/OPERATING_PROTOCOL.md`
- `Dockerfile.gate`
- `.dockerignore`
- `scripts/container-gate.sh`
- `package.json`
- `AGENTS.md`
- `.github/workflows/deploy.yml`
- `scripts/check-harness.mjs`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/status.json`
- `docs/agent/verification.md`
- `docs/agent/harness-gc.md`

### Verification Results
- `npm run gate`: pass (container: build incl. `tsc -b`, lint, `agent:smoke` full route/asset/redirect/CTA set, `agent:check`).
- `npm run agent:check`: pass.
- `npm run agent:harness-gc`: pass with only the known `docs/WORKLOG.md` size warning.
- `git diff --check`: clean.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://chore-operating-protocol.urblo.pages.dev`: pass against the branch preview (routes, assets, admin bundle contract, legacy redirects, API safe-failure).

### Residual Risks / Follow-Ups
- Cloudflare Pages build Node version should be pinned to `NODE_VERSION=20` in project settings (account-level change, not repo-side).
- Gate enforcement is protocol-level; platform enforcement (CI + branch protection on `main`) is a decision-gated upgrade.
- The session kick-start memory hook is machine-local to Hunter's machine; other agents rely on the `AGENTS.md` Working Process pointer.

## Entry - 2026-06-12 (SEO Phase 2 Legacy URL Cleanup)

### Scope
- Implemented the Phase 2 GSC legacy URL cleanup in source.
- Added selective 301 rules in `public/_redirects` for old contact, capacity, product, product-category, stone-product, article, and selected trailing-slash public detail URLs.
- Left junk WordPress/admin/plugin/feed/search/upload paths unrescued and out of the sitemap.
- Extended SEO readiness, local smoke, Cloudflare readiness, and deployed preview smoke checks so representative old-to-new redirects are guarded.
- Moved the next SEO work to a Phase 3 content-growth task focused on non-brand specifier search intent.

### Redirect Groups
- Recovered to current pages: `/contact-us` to `/contact`, `/our-capacity` to `/capabilities`, `/product` to `/products`, `/article` to `/articles`.
- Recovered to closest content: `/article/discover-the-art-of-surface-finishes` to the current bluestone finish article, `/product/creama` and `/product-category/limestone` to `/stone-library`, and old bollard/planter/engraved-inlay URLs to `/capabilities`.
- Canonical cleanup: selected indexed trailing-slash project/product/article detail URLs now redirect to their no-trailing-slash canonical paths.

### Changed Files
- `public/_redirects`
- `scripts/agent-smoke.sh`
- `scripts/check-cloudflare-preview-smoke.mjs`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `scripts/check-seo-readiness.mjs`
- `docs/SEO_PHASE_2_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/status.json`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:seo-readiness`: pass. Verified 36 approved sitemap URLs plus representative GSC legacy redirect rules.
- `npm run agent:cloudflare-readiness`: pass. Verified repo-side Cloudflare Pages contract and representative redirect rules.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass. Verified public/admin route shells, assets, CTA contracts, and representative redirect rules including `/contact-us`, `/our-capacity`, `/product/creama`, `/product-category/limestone`, `/stone-product/bollard`, `/article/discover-the-art-of-surface-finishes`, and `/projects/xavier-college/`.
- `npm run agent:check`: pass.
- `npm run agent:harness-gc`: pass with zero failures and the three existing warnings for `AGENTS.md` date, `docs/agent/harness-gc.md` date, and long `docs/WORKLOG.md`.
- `npm run agent:harness-gc:review`: pass and wrote `.tmp/harness-gc-review.md`.
- `git diff --check`: pass.

### Risks and Gaps
- This does not create new keyword-rich content. Phase 3 content growth remains the next SEO work.
- Production redirect behavior requires Cloudflare Pages deployment of this commit before deployed smoke can prove live 301 responses.

### Next Handoff
- Run full runtime/harness gates, push the redirect cleanup, then verify production redirects after Cloudflare deploys the new commit.
- After Google recrawls, monitor whether old WordPress/old-site issues decay and whether canonical sitemap discovery improves.

## Entry - 2026-06-12 (GSC Review and Phase 2 SEO Plan)

### Scope
- Reviewed Google Search Console after the Phase 1 SEO indexability deployment.
- Found that GSC's Page indexing data still reflected a 2026-06-05 crawl state, before the new 36-URL sitemap and crawler files were deployed.
- Submitted/refreshed `https://urblo.com.au/sitemap.xml` in GSC on 2026-06-12.
- Confirmed the next SEO work should not replace Phase 1; it should add a Phase 2 pass for stale sitemap refresh monitoring, legacy URL mapping, selective 301 redirects, and non-brand long-tail landing-page/content improvement.
- Added `docs/SEO_PHASE_2_PLAN.md` as the executable planning document for the next SEO cycle.

### GSC Observations
- GSC showed 21 indexed pages and 29 not indexed pages, with many examples coming from old WordPress or old-site paths rather than the current canonical sitemap.
- Stale submitted sitemap history was visible for `https://urblo.com.au/sitemap.xml` and `https://www.urblo.com.au/sitemap.xml`.
- Search performance was mostly branded; non-brand product, material, and project discovery remains the Phase 2 opportunity.
- HTTPS and Breadcrumb enhancement status did not show a launch-blocking issue; Core Web Vitals lacked enough field data rather than showing a failing score.

### Changed Files
- `docs/SEO_PHASE_2_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/status.json`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`

### Verification Results
- GSC submission: pass. Search Console showed "Sitemap submitted successfully" for `https://urblo.com.au/sitemap.xml`.
- GSC table immediately after submission showed submitted date `12 Jun 2026`, status `Success`, discovered pages `11`, and old `Last read` `3 Aug 2023`; Google processing of the refreshed 36-URL sitemap remains a monitoring item.
- `jq empty docs/agent/status.json docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `npm run agent:harness-gc`: pass with zero failures and three existing warnings: `AGENTS.md` date older than status, `docs/agent/harness-gc.md` date older than status, and long `docs/WORKLOG.md`.
- `git diff --check`: pass.

### Next Handoff
- Monitor GSC until Google actually reads the refreshed sitemap and updates discovered-page/indexing data.
- Later Phase 2 work should follow `docs/SEO_PHASE_2_PLAN.md`.

## Entry - 2026-06-12 (SEO Indexability Foundation)

### Scope
- Implemented Phase 1 SEO indexability foundation for the existing public site without changing visual layout.
- Added `src/data/seoRoutes.ts` as the source-side public SEO route registry for title, description, canonical URL, sitemap priority/change frequency, breadcrumbs, and conservative structured-data inputs.
- Updated `src/App.tsx` so the native head updater reads from the SEO registry, writes robots meta, canonical, Open Graph, Twitter metadata, and client-side JSON-LD.
- Added real static `public/robots.txt` and `public/sitemap.xml`; the sitemap covers 36 approved public canonical URLs across Home, public listing pages, 5 Projects, 13 Stone Library groups, 6 Products, and 4 Articles.
- Added `npm run agent:seo-readiness` and guarded it through `npm run agent:check`.
- Updated Harness docs and task state for the Phase 1 SEO boundary.

### Changed Files
- `src/data/seoRoutes.ts`
- `src/App.tsx`
- `public/robots.txt`
- `public/sitemap.xml`
- `scripts/check-seo-readiness.mjs`
- `scripts/check-harness.mjs`
- `package.json`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/status.json`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`

### Verification Results
- `npm run agent:seo-readiness`: pass. Verified real robots/sitemap files, 36 approved sitemap URLs, no `/admin` or `/api` sitemap exposure, and registry-driven App metadata wiring.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Production readback after push: `https://urblo.com.au/robots.txt` returned static robots text, `https://urblo.com.au/sitemap.xml` returned XML, and production sitemap contained 36 `<loc>` entries.

### Risks and Gaps
- Phase 1 does not make the Vite React app server-rendered or pre-rendered. Deep-link first HTML remains the shared app shell until JavaScript executes; this is documented as a Phase 2 technical SEO decision.
- Google Search Console sitemap submission/indexing evidence is a manual follow-up outside the source-only local gate.

### Next Handoff
- Submit `https://urblo.com.au/sitemap.xml` in Google Search Console and monitor indexed pages/query data after Google recrawls.
- Decide Phase 2 SEO depth: content/CTA polish only, standard Stone/Product/Project landing-page expansion, or deeper public route pre-rendering.

## Entry - 2026-06-11 (Homepage Hero Video Replacement)

### Scope
- Replaced the homepage hero video source using the client-provided local file `Lark20260611-213730.mp4`.
- Did not commit the 74MB source file; generated controlled web assets at the existing public paths so homepage runtime data did not need to change.
- Regenerated the desktop MP4 as H.264 1280x720, 30fps, no-audio, fast-start media at about 4.6MB.
- Regenerated the mobile MP4 as H.264 540x960, 30fps, no-audio, fast-start media at about 2.3MB.
- Regenerated the homepage hero poster as a 1280x720 JPEG at about 411KB.
- Updated media contract docs for the new source and sizes.

### Changed Files
- `public/media/launch/home/urblo-hero.mp4`
- `public/media/launch/home/urblo-hero-mobile.mp4`
- `public/media/launch/home/hero-poster.jpg`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/WORKLOG.md`

### Verification Results
- AVFoundation source inspection: `Lark20260611-213730.mp4` is 1920x1080, 60fps, 27s, with one audio track before conversion.
- Generated asset inspection: desktop MP4 is `avc1`, 1280x720, 30fps, 27s, no audio, about 4.6MB; mobile MP4 is `avc1`, 540x960, 30fps, 27s, no audio, about 2.3MB; poster is 1280x720 JPEG, about 411KB.
- Fast-start check: both committed MP4s have `moov` before `mdat`.
- Local HTTP check against `http://127.0.0.1:5175/media/launch/home/urblo-hero.mp4`: pass. Response used `Content-Type: video/mp4`, `Content-Length: 4820594`, and byte-range reads returned data.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Local Google Chrome / Playwright desktop QA at 1440x900: pass. Homepage selected `/media/launch/home/urblo-hero.mp4`, reached `readyState = 4`, played unpaused, reported 1280x720 intrinsic size, 27s duration, hero height 900px, no horizontal overflow, and no media error.
- Local Google Chrome / Playwright mobile QA at 390x844: pass. Homepage selected `/media/launch/home/urblo-hero-mobile.mp4`, reached `readyState = 4`, played unpaused, reported 540x960 intrinsic size, 27s duration, hero height 844px, no horizontal overflow, and retained Tencent X5 inline attributes.

### Risks and Gaps
- Real WeChat playback still needs production-device confirmation after deployment.
- Cloudflare Stream/R2 remains optional if future production metrics show static MP4 delivery is not enough.

### Next Handoff
- Deploy and verify the new homepage hero video on production, including real WeChat playback.

## Entry - 2026-06-11 (Stone Library Country-Only Origin)

### Scope
- Updated public Stone Library origin presentation so listing cards and detail Specs show country only.
- Kept `origin_region` in Supabase, import data, and admin edit forms for internal/editorial traceability.
- Updated the `/admin/stone-library` group list preview to show country only, matching public presentation.

### Changed Files
- `src/service/StoneLibraryService.ts`
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `docs/WORKLOG.md`

### Verification Results
- `rg -n "\\$\\{region\\}, \\$\\{country\\}|origin_region.*join|origin_region.*origin_country.*join|regionDisplay.*countryDisplay|origin\\.source" src/service/StoneLibraryService.ts src/pages/admin/AdminStoneLibraryPage.tsx -S`: pass; no old region-plus-country presentation pattern remains.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass. npm reported an available major-version notice after the run.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Local Browser QA against `http://127.0.0.1:5173/stone-library`: pass. Listing cards showed country-only origins such as `China` and `Angola`, had no `region, country` pattern, no horizontal overflow, and no console error/warning logs.
- Local Browser QA against `http://127.0.0.1:5173/stone-library/alpine-white`: pass. Detail Specs `Origin` value was `China`, with no `region, country` pattern, no horizontal overflow, and no console error/warning logs.

### Risks and Gaps
- Existing data can still store region/province internally; the public and admin-list presentation intentionally ignores it.

### Next Handoff
- Deploy and verify country-only Stone Library origins on production after the next push.

## Entry - 2026-06-07 (Stone Library Public DL Name Removal)

### Scope
- Removed the public Stone Library detail Specs card that displayed `DL Name` / `TBC`.
- Kept CMS/source fields intact for internal editing and import traceability; this change only removes the public website presentation.
- Updated the task queue acceptance wording so future harness passes treat internal DL/source naming as non-public content.

### Changed Files
- `src/components/stone-library/SpecsPanel.tsx`
- `src/pages/StoneLibraryDetailPage.tsx`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `rg -n "DL Name|DL Name TBC|dlName=|dlName\\b" src/components src/pages docs/agent/tasks.json -S`: pass; only the updated harness acceptance wording mentions the removed public label.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Local Browser QA against `http://127.0.0.1:5173/stone-library/alpine-white`: pass. Public detail text did not include `DL Name`, `DL Name TBC`, or the admin `Supplier/source label`; visible Specs labels were `Type`, `Origin`, `Availability`, `Raw Block`, and `Price Range`; horizontal overflow was false; console error/warning logs were empty.

### Risks and Gaps
- Internal CMS `source_name` / static `dlName` data still exists by design; it is not displayed by the public Specs panel.

### Next Handoff
- Verify and push the public Stone Library DL Name removal.

## Entry - 2026-06-07 (Homepage Project Rail Affordance)

### Scope
- Improved the homepage `The work speaks.` project rail so the draggable interaction is easier to discover on desktop and mobile.
- Added restrained previous/next arrow controls, a horizontal-move icon, rail progress feedback, and a right-edge continuation treatment for hidden project cards.
- Tuned pointer drag threshold/speed and prevented hover selection from firing while drag suppression is active.
- Updated the design contract to keep visible rail affordance as part of the Latest Projects interaction pattern.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/index.css`
- `docs/DESIGN.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- Local Browser desktop 1440x900 against `http://127.0.0.1:5174/`: pass. Latest Projects stayed one viewport high, the next arrow was visible/enabled, clicking it selected `moon-gate-woolley-street`, scrolled the rail from `0` to `319`, and enabled the previous arrow.
- Local Browser mobile 390x844 against `http://127.0.0.1:5174/`: pass. Latest Projects stayed `844px` high, body horizontal overflow was false, the next arrow was visible/enabled, clicking it selected `moon-gate-woolley-street`, and rail scroll moved to `157.5`.
- Local Browser console checks: pass, with no desktop or mobile error/warning logs during the rail QA.

### Risks and Gaps
- The rail still uses static homepage project data until the public content cutover is approved.
- Real WeChat validation was not repeated for this rail interaction; local mobile browser QA covered layout and interaction only.

### Next Handoff
- Deploy and verify `The work speaks.` rail affordance on production after the next push.

## Entry - 2026-06-05 (WeChat Mobile Hero Video Playback)

### Scope
- Investigated the homepage hero video not playing inside WeChat on mobile.
- Local mobile browser verification showed the React hero video source selection works outside WeChat: the 390x844 mobile viewport selected `/media/launch/home/urblo-hero-mobile.mp4`, reached `readyState = 4`, and was not paused.
- Production resource headers for the mobile MP4 were healthy: `video/mp4`, byte ranges enabled, Cloudflare cache hit, and about 1.17MB before the fix.
- MP4 box inspection found the previous mobile and desktop files were H.264 High Profile level 3.1. That is web-playable, but less reliable for WeChat/X5 autoplay background video than Baseline/Main profile.
- Re-encoded `public/media/launch/home/urblo-hero-mobile.mp4` as H.264 Constrained Baseline level 3.1, yuv420p, 540x960, 30fps, no-audio, fast-start media at about 1.8MB.
- Added Tencent X5 / WeChat inline playback attributes to the hero video element and added playback retries for media readiness, user gesture, page visibility, page show, and `WeixinJSBridgeReady`.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `public/media/launch/home/urblo-hero-mobile.mp4`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/WORKLOG.md`

### Verification Results
- MP4 inspection: mobile file now has `AVCProfileIndication = 66` (`0x42`, Baseline), level 3.1, `moov` before `mdat`, and no audio track.
- Local Browser mobile 390x844: pass. Hero video selected `/media/launch/home/urblo-hero-mobile.mp4`, `readyState = 4`, `paused = false`, intrinsic size 540x960, and `x5-playsinline` / `x5-video-player-type` / `x5-video-player-fullscreen` / `x5-video-orientation` attributes were present.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.

### Risks and Gaps
- This cannot fully prove WeChat playback until the change is deployed and tested in the real WeChat in-app browser on iOS/Android.
- If WeChat still refuses autoplay after deployment, the next fallback should be a tap-to-play overlay or Cloudflare Stream/R2 adaptive delivery review.

### Next Handoff
- Deploy and test `https://urblo.com.au` in the real WeChat in-app browser.

## Entry - 2026-06-05 (Project Overview Audit)

### Scope
- Reviewed current project state across `AGENTS.md`, `docs/HANDOFF.md`, `docs/agent/status.json`, `docs/agent/tasks.json`, `docs/ARCHITECTURE.md`, `docs/agent/verification.md`, code routes, admin modules, Supabase clients, and Cloudflare Functions.
- Found one docs contract drift introduced by recent handoff compression: public Supabase readiness expected exact cutover/static-fallback language in `docs/ARCHITECTURE.md` and `docs/HANDOFF.md`.
- Restored the public content import/public-read cutover wording and the canonical Published Supabase content with static fallback wording.

### Verification Results
- `npm run build`: pass; build still reports the known Browserslist staleness notice and `AdminApp` chunk-size warning.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:public-supabase-readiness`: pass after the docs wording repair.
- `npm run agent:check`: pass.
- `npm run agent:harness-gc`: pass with zero failures and one warning for `docs/WORKLOG.md` size.
- `git diff --check`: pass.

### Risks and Gaps
- Local shell has no live secrets loaded, so live-readiness remains report-only for future Turnstile, invite, admin browser, and tagged live-write checks.
- Repository is ahead of `origin/main`; latest local Harness GC commits are not pushed from this session.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-SETTINGS-CRUD-001`

## Entry - 2026-06-05 (Harness GC Queue Cleanup)

### Scope
- Reduced the active `now` queue to the two genuinely executable follow-ups: final Turnstile proof and real Settings invite proof.
- Marked the completed CMS umbrella/auth/content/media/leads/form-backend work as done or deferred where current evidence supports it.
- Moved paused article claim cleanup from `now` to `next`.
- Reworded historical done-task notes that used current-blocker language.
- Replaced `docs/HANDOFF.md` with a compact current-state handoff under the Harness GC line target.
- Replaced `docs/NEXT_STEPS.md` with a concise roadmap and agent command index.
- Updated `docs/agent/status.json` so future agents can distinguish active execution work from umbrella or decision-gated follow-ups.

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:harness-gc`: pass with zero failures and one warning.
- `npm run agent:harness-gc:review`: pass; wrote `.tmp/harness-gc-review.md` with Harness architecture score 96/100.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Remaining GC warning: `docs/WORKLOG.md` has 11628 lines against the configured 8000-line review target.

### Risks and Gaps
- `docs/WORKLOG.md` intentionally remains above the Harness GC review-size target because it is the historical evidence archive.
- Live Turnstile proof and real Settings invite proof still require their own credentials, target inputs, and approval before execution.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-SETTINGS-CRUD-001`

## Entry - 2026-06-05 (Harness GC First Pass)

### Scope
- Added `docs/agent/status.json` as a compact current-state API for agents.
- Added `docs/agent/harness-gc.md` as the Harness GC operating guide.
- Added `scripts/check-harness-gc.mjs` plus package scripts for read-only GC, conservative fix mode, and review artifact generation.
- Updated README current status so it no longer claims production API, Supabase integration, or admin CMS are absent.
- Updated `AGENTS.md`, `docs/agent/verification.md`, `scripts/check-harness.mjs`, and `docs/agent/tasks.json` so the new GC capability is part of the official harness.

### Changed Files
- `docs/agent/status.json`
- `docs/agent/harness-gc.md`
- `scripts/check-harness-gc.mjs`
- `package.json`
- `scripts/check-harness.mjs`
- `README.md`
- `AGENTS.md`
- `docs/agent/verification.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `node --check scripts/check-harness-gc.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:harness-gc`: pass with zero failures and five warnings.
- `npm run agent:harness-gc:review`: pass; wrote `.tmp/harness-gc-review.md`.
- Reported warnings: eight `now` tasks exceed target three, `NOW-ADMIN-CMS-001` remains an umbrella task in `now`, three done tasks contain active-blocker wording, `docs/HANDOFF.md` exceeds its review target, and `docs/WORKLOG.md` exceeds its review target.
- Current task status counts reported by GC: `{"done":30,"now":8,"next":3,"later":3}`.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Harness GC is not yet wired into `npm run agent:check`; keep it separate until the warning profile has been reviewed for false positives.
- The first report intentionally does not mutate task status. Reducing the eight `now` tasks requires Jay/agent judgment in a follow-up cleanup pass.

### Next Handoff
- `NOW-HARNESS-GC-001`

## Entry - 2026-06-05 (Admin CMS Production Walkthrough Results)

### Scope
- Completed the production no-write CMS handoff walkthrough for the current `/admin` UX stack on `https://urblo.com.au`.
- Verified deployed public/admin routes, deployed assets, redirects, safe API behavior, active owner login, authenticated admin module shells, sign out, Dashboard orientation, representative Projects publish blockers, and Change history language.
- Used generated production screenshots under `.tmp/admin-auth-browser/screenshots` for module-level evidence.
- No customer content, lead workflow, media item, Settings invite, or publication state was changed during this walkthrough.

| Area | Result | Evidence | Changes Made | Public URL / Screenshot | Follow-up |
|---|---|---|---|---|---|
| Deployment | Pass | `git push origin main` advanced production source through `3db6690`. | Deployed CMS UX/handoff stack, QA heading fix, and WebP re-encode. | `https://urblo.com.au` | None. |
| Deployed smoke | Pass | `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au` passed after `3db6690`. | None during smoke. | Production origin checked. | None. |
| Active-admin browser QA | Pass | Strict no-write login QA passed for 9 authenticated routes after the WebP fix. | None during QA. | `.tmp/admin-auth-browser/screenshots` | None. |
| Dashboard orientation | Pass | Dashboard screenshot shows Recommended next action, website visibility, Draft/Published/Archived counts, Content health queue, and editor workflow. | None. | `.tmp/admin-auth-browser/screenshots/admin.png` | None. |
| Settings account handoff | Deferred | Settings route shell was included in strict authenticated QA; guide covers Invite and grant access plus Grant existing login. | No invite email was sent. | `.tmp/admin-auth-browser/screenshots/admin-settings.png` | Run a real invite proof only after Jay approves a target editor email. |
| Media readiness | Pass | Media route shell was included in strict authenticated QA and source-guarded publish checklist/action language. | None. | `.tmp/admin-auth-browser/screenshots/admin-media.png` | Real media save/publish remains approval-gated. |
| Projects publish path | Pass | Projects screenshot shows Website publish status, Publish checklist, proof-review blocker, action bars, and disabled Publish guidance. | None. | `.tmp/admin-auth-browser/screenshots/admin-projects.png` | Customer/editor review-publish remains a content decision, not a CMS blocker. |
| Stone Library publish path | Pass | Stone Library route shell was included in strict authenticated QA and source-guarded family/variant/checklist/media guidance. | None. | `.tmp/admin-auth-browser/screenshots/admin-stone-library.png` | Customer/editor review-publish remains a content decision. |
| Products publish path | Pass | Products route shell was included in strict authenticated QA and source-guarded product/model checklist language. | None. | `.tmp/admin-auth-browser/screenshots/admin-products.png` | Customer/editor review-publish remains a content decision. |
| Articles publish path | Pass | Articles route shell was included in strict authenticated QA and source-guarded article/section checklist/forms language. | None. | `.tmp/admin-auth-browser/screenshots/admin-articles.png` | Customer/editor review-publish remains a content decision. |
| Leads workflow | Pass | Leads route shell was included in strict authenticated QA and source-guarded workflow/export language. | None. | `.tmp/admin-auth-browser/screenshots/admin-leads.png` | Real lead workflow changes remain approval-gated. |
| Change history | Pass | Change history screenshot shows current title, filters, recent events, event details, and read-only rules. | None. | `.tmp/admin-auth-browser/screenshots/admin-audit.png` | None. |
| Final editor handoff | Pass | `docs/ADMIN_EDITOR_GUIDE.md` matches the deployed interface for admin address, start path, status rules, module actions, publish checks, account handoff, CMS coverage, and fallback boundaries. | None. | `docs/ADMIN_EDITOR_GUIDE.md` | Only optional live invite proof and customer content review/publish decisions remain. |

### Verification Results
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass.
- `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`: pass through a temporary public publishable-key extraction from the deployed bundle; secrets were not printed.
- Screenshot evidence exists for login, signed-out, Dashboard, Leads, Media, Settings, Stone Library, Projects, Products, Articles, and Change history under `.tmp/admin-auth-browser/screenshots`.

### Risks and Gaps
- Settings real invite email proof is deferred until Jay approves a target editor email.
- Bulk publishing imported Draft content is intentionally not part of this handoff; editors should review and publish content item by item.
- Turnstile final form proof remains outside the CMS handoff goal.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Production Admin Browser QA Heading Fix)

### Scope
- Pushed the CMS UX/handoff stack to `origin/main` at commit `43a1750`.
- Ran deployed Cloudflare smoke against `https://urblo.com.au`; route, asset, redirect, and safe API checks passed.
- Ran production active-admin browser QA with `info@urblo.com.au`; login reached the authenticated shell, but the verifier still expected the old `/admin/audit` heading `Audit`.
- Updated `scripts/check-admin-auth-browser.mjs` to expect the current editor-facing `/admin/audit` heading `Change history` and to keep that private module text out of signed-out/unauthorized checks.
- Reran active-admin browser QA against the current deployed bundle after the verifier fix; authenticated route checks passed, then strict console checking exposed a static article image decode error for `/media/launch/articles/stone-transformed/02-stone-finishes.webp`.
- Re-encoded that WebP image at the same 2500x1875 dimensions so Firefox no longer has to decode the suspect source file.

### Changed Files
- `scripts/check-admin-auth-browser.mjs`
- `public/media/launch/articles/stone-transformed/02-stone-finishes.webp`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `git push origin main`: pass, `7c89ea7..43a1750`.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass.
- Production active-admin browser QA before this fix: failed at `/admin/audit` because the verifier expected heading `Audit` while the deployed editor-facing heading is `Change history`.
- `git push origin main`: pass, `43a1750..a59fa01`.
- Production active-admin browser QA after verifier fix but before image re-encode: authenticated route checks passed, then failed strict console checking on `Image corrupt or truncated` for `/media/launch/articles/stone-transformed/02-stone-finishes.webp`.
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `sips -g pixelWidth -g pixelHeight public/media/launch/articles/stone-transformed/02-stone-finishes.webp`: pass, 2500x1875.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `git push origin main`: pass, `a59fa01..3db6690`.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass after `3db6690`.
- Production active-admin browser QA after WebP re-encode and deploy: pass for 9 authenticated routes with no strict console/page errors.

### Risks and Gaps
- The failure was in the QA script's old expected heading, not in the production login flow. Final editor handoff still requires the corrected verifier to pass after redeploy and the production walkthrough Results Template to be filled.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Stone Library Public Read Contract Alignment)

### Scope
- Rechecked `src/service/StoneLibraryService.ts` against the handoff docs before final CMS delivery.
- Confirmed Stone Library detail already has a Published CMS/Supabase detail adapter for families, variants, finish capabilities, and finish images, with static detail data kept as fallback.
- Updated stale harness/architecture/task wording that still described Stone Library detail as static-only.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is a contract/documentation alignment pass only. It does not deploy the current CMS UX stack or prove the production editor walkthrough.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin CMS Predeploy Gate Runner)

### Scope
- Added `npm run agent:admin-cms-predeploy` as a no-secret non-preview local gate runner for the current CMS UX stack.
- The runner chains admin CRUD coverage, build, lint, TypeScript, Supabase foundation readiness, public Supabase readiness, Cloudflare readiness, harness checks, `git diff --check`, and report-only admin handoff readiness.
- Preview/browser gates remain separate required deployment checks: `npm run agent:smoke` and `npm run agent:admin-config-gate`.
- Updated the root harness entry so future agents see the CMS predeploy gates and final strict handoff audit before claiming production handoff complete.
- The runner does not deploy, log into production, write Supabase, or mutate live content.

### Changed Files
- `AGENTS.md`
- `scripts/admin-cms-predeploy.sh`
- `package.json`
- `scripts/check-harness.mjs`
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `docs/agent/verification.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `bash -n scripts/admin-cms-predeploy.sh`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- Initial Node-based predeploy runner attempt: failed at embedded `npm run agent:smoke` because Vite preview returned `listen EPERM` while binding local preview ports from inside the nested runner. Standalone `npm run agent:smoke` passed immediately after, so this was treated as a runner false failure rather than an application failure.
- Replaced the Node aggregation runner with `scripts/admin-cms-predeploy.sh` and kept preview/browser gates separate.
- `npm run agent:admin-cms-predeploy`: pass. It ran admin CRUD coverage, build, lint, TypeScript, Supabase foundation readiness, public Supabase readiness, Cloudflare readiness, harness checks, `git diff --check`, and report-only admin handoff readiness. Build still shows the existing Browserslist staleness notice and AdminApp chunk-size warning. Handoff readiness correctly reports production walkthrough evidence missing.
- `npm run agent:smoke`: pass as the separate preview route/API/UI source gate.
- `npm run agent:admin-config-gate`: pass for 11 no-browser-key admin routes; screenshots written under `.tmp/admin-config-gate/screenshots`.

### Risks and Gaps
- Passing this predeploy gate plus the separate preview/browser gates proves local readiness only. The CMS is still not handoff-complete until the current stack is deployed and the production walkthrough Results Template passes.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin Handoff Readiness Audit Runner)

### Scope
- Added `npm run agent:admin-handoff-readiness` as a no-write final CMS handoff audit.
- The runner checks the editor guide, production walkthrough, Results Template, production origin input, first-admin email input, and whether `docs/WORKLOG.md` contains production walkthrough results with Final editor handoff marked Pass.
- Default mode is report-only; `--strict` fails until production walkthrough evidence exists, preventing the CMS goal from being marked complete based on local readiness alone.

### Changed Files
- `scripts/check-admin-handoff-readiness.mjs`
- `package.json`
- `scripts/check-harness.mjs`
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `docs/agent/verification.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `node --check scripts/check-admin-handoff-readiness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au`: pass in report-only mode, with production walkthrough evidence correctly reported missing.
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict`: expected fail because production walkthrough evidence is not recorded yet.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The runner intentionally reports missing production walkthrough evidence until the current CMS UX stack is deployed and the Results Template is filled in `docs/WORKLOG.md`.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Current Roadmap Terminology Alignment)

### Scope
- Cleaned current roadmap/task wording so active CMS handoff status uses editor-facing items/content language.
- Updated the current content-CRUD roadmap note from draft rows / published reads to production CMS Draft items and Published CMS content.
- Updated the CMS task acceptance from Stone Library/media records to Stone Library/media items.

### Changed Files
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`
- `docs/WORKLOG.md`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Historical worklog evidence still contains older database terms where it records past implementation state. Current handoff, roadmap, guide, walkthrough, and task acceptance should use editor-facing language.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (One-Page Editor Handoff)

### Scope
- Added a concise One-Page Editor Handoff to `docs/ADMIN_EDITOR_GUIDE.md`.
- The one-page version covers admin address, account setup, Dashboard start screen, search/status filtering, Draft/Pubished/Archived behavior, Save/Publish/Open public page, CMS coverage, imported Draft content, static fallback, and escalation paths.
- Updated harness checks so the one-page editor handoff cannot be removed silently.

### Changed Files
- `docs/ADMIN_EDITOR_GUIDE.md`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This improves the customer-facing handoff artifact. It does not deploy the current CMS UX stack or run the production active-admin walkthrough.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Production Walkthrough Results Template)

### Scope
- Added a reusable Results Template to `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` so production CMS handoff proof can be recorded consistently after deployment.
- The template captures deployment, deployed smoke, active-admin browser QA, each admin module walkthrough, public URLs/screenshots, changes made, deferrals, failures, and final editor handoff readiness.
- Updated harness checks so the results template and deferral language cannot be removed silently.

### Changed Files
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This improves production evidence capture. It does not deploy the current CMS UX stack or run the active-admin production walkthrough.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (CMS Terminology Regression Guards)

### Scope
- Added regression guards for the latest visible terminology cleanup so editor-facing copy does not drift back to backend-shaped wording.
- `npm run agent:admin-crud-coverage` now rejects the old visible Leads, Articles, Stone Library, and Projects terms cleaned in the previous pass.
- `npm run agent:check` now rejects old production walkthrough terms such as Draft rows, Supabase Auth, profile rows, `claim_status`, raw imported HTML/JSON, and database rows.

### Changed Files
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.

### Risks and Gaps
- This is a regression-guard improvement for source and handoff language. It does not deploy the current CMS UX stack or replace production walkthrough proof.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (CMS Visible Terminology Hardening)

### Scope
- Ran a targeted scan for visible/editor-facing backend wording across admin source and handoff walkthrough docs.
- Replaced remaining visible lead export/inbox, Article block hint, Stone Library group, and Project editor copy that used records, rows, or other storage-shaped wording.
- Cleaned the production walkthrough so its pass conditions use editor-facing proof-review, structured-content, Change history, Draft item, and CMS content language.

### Changed Files
- `src/pages/admin/AdminLeadsPage.tsx`
- `src/pages/admin/AdminArticlesPage.tsx`
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- Targeted visible terminology scan: pass. Remaining `claim_status` matches are internal Projects/Dashboard source fields, queries, and proof-review label mapping only.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This reduces editor-facing technical language in the current local CMS UX stack. It still does not deploy the stack or replace production active-admin walkthrough proof.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (CMS UX Full Pre-Deploy Gate Refresh)

### Scope
- Re-ran the full local CMS/runtime verification stack for the current `/admin` UX and handoff changes.
- Verified source coverage, build, lint, TypeScript, public/admin smoke, Supabase foundation/public-readiness, no-config admin browser gate, Cloudflare Pages readiness, and plan-only live admin/content runners.
- Refreshed the live-input audit for `https://urblo.com.au` with `info@urblo.com.au` as the known first admin.

### Changed Files
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:supabase-foundation-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only mode; no Supabase writes, Storage uploads, or deletes attempted.
- `npm run agent:content-import:live`: pass in plan-only mode; no Supabase login and no row changes attempted.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:admin-config-gate`: pass for 11 no-browser-key admin routes; screenshots written under `.tmp/admin-config-gate/screenshots`.
- `npm run agent:live-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au`: pass in report-only mode. It reports Cloudflare deployed-preview smoke and static-to-Supabase draft import artifacts as ready, while the current shell still lacks live Supabase/admin/browser credentials and write approvals for production walkthrough proof.

### Risks and Gaps
- These checks prove the current local CMS UX stack is pre-deploy ready, but they do not deploy it.
- Final handoff still requires pushing/deploying this stack, deployed smoke, active-admin browser QA, and completing `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` with production evidence.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Editor Guide Customer-Language Cleanup)

### Scope
- Cleaned the customer-facing editor guide so handoff language stays in CMS/editor terms instead of backend terms.
- Replaced the remaining imported-content, public-read, and CSV language around rows/records/Supabase with Draft items, CMS content, entries, and Change history wording.
- Updated the harness guide check to require the new CMS Draft item phrasing.

### Changed Files
- `docs/ADMIN_EDITOR_GUIDE.md`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- Targeted editor-guide technical-term scan: pass. The only remaining Supabase mention is the explicit reassurance that day-to-day editing does not require Supabase, code, table names, or developer help.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is a customer-language/harness cleanup. It does not deploy the current CMS UX stack or replace the production walkthrough.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (CMS UX Pre-Deploy Readiness Refresh)

### Scope
- Re-ran the no-secret deployment and live-input readiness checks for the current CMS UX/handoff stack.
- Confirmed the repository-side Cloudflare Pages deployment contract remains healthy.
- Confirmed production origin `https://urblo.com.au` is ready as the deployed-preview smoke input.
- Confirmed the current local shell still lacks live Supabase/admin/browser secrets required for production CMS walkthrough proof.

### Changed Files
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:cloudflare-readiness`: pass. Verified build contract, SPA fallback, Function routing scope, headers, API handlers, env placeholders, and deployment runbook.
- `npm run agent:live-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au`: pass in report-only mode with no writes and no secret output. Ready inputs: Cloudflare deployed-preview route/API smoke and static-to-Supabase draft import artifacts. Missing in the current local shell: service-role key, browser-safe Supabase key, admin login credentials/token, unprofiled QA credentials, form/email/Turnstile secrets, and live-write approvals.

### Risks and Gaps
- This confirms the local stack is ready for the next deployment step, but it does not deploy it.
- Production CMS handoff still requires deployed smoke, active-admin browser QA, and `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` evidence after push/deploy approval.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Editor First Handoff Walkthrough Guide)

### Scope
- Strengthened the editor handoff guide with a short first-session walkthrough for a new non-technical CMS editor.
- The walkthrough covers signing in, using Dashboard, filtering to Draft, making a reversible edit, reading Publish blockers, confirming Open public page after approved publish, and explaining static fallback.
- Updated harness checks so the first handoff walkthrough cannot disappear from the editor guide.

### Changed Files
- `docs/ADMIN_EDITOR_GUIDE.md`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is a docs/handoff improvement. It does not replace deployment or the production walkthrough proof.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Project Publish Blocker Error Copy Cleanup)

### Scope
- Revisited the Projects publish blocker experience because this was the first real editor pain point reported.
- Simplified the blocked Publish error so it names the first checklist item once, includes the repair detail, reports remaining checklist items, and tells editors the first repair item is highlighted below.
- Removed the previous duplicated `Start with` guidance from runtime source and added coverage guards so the repeated sentence cannot return.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- Targeted duplicate-copy scan: pass for runtime source.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.

### Risks and Gaps
- This improves source/runtime error clarity; production authenticated edit/publish walkthrough still needs deployment and real-session evidence.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin Role Copy Normalization)

### Scope
- Audited remaining admin module headers and read-only notices for inconsistent role wording.
- Replaced visible `Admin/Editor` labels in Media, Products, and Articles with `CMS editor`.
- Replaced Media and Stone Library read-only notices that used `admin/editor`, `editor/admin`, or material-record language with CMS editor wording.
- Updated admin CRUD coverage to require the normalized role labels and reject the older technical role wording.

### Changed Files
- `src/pages/admin/AdminMediaPage.tsx`
- `src/pages/admin/AdminProductsPage.tsx`
- `src/pages/admin/AdminArticlesPage.tsx`
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- Targeted role-term scan: pass for runtime source.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.

### Risks and Gaps
- This was a source/runtime copy normalization pass; production authenticated walkthrough remains pending after deployment.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Settings and Media Handoff Copy Cleanup)

### Scope
- Continued the admin editor-facing copy audit after Browser QA.
- Replaced the remaining Settings empty-state wording that referred to CMS access records.
- Replaced the Settings invite-security note that exposed the private Supabase service key concept with plain secure-server wording.
- Replaced Media library fallback titles that could show raw `#id` values with untitled media labels.
- Extended admin CRUD coverage to guard the new Settings and Media wording and reject the older technical copy.

### Changed Files
- `src/pages/admin/AdminSettingsPage.tsx`
- `src/pages/admin/AdminMediaPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- Targeted old-term scan: pass for runtime source.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This was a source/runtime copy cleanup, not a production authenticated walkthrough.
- Final CMS handoff still needs deployment plus `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` evidence.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin No-Config Entry Copy QA)

### Scope
- Used the in-app Browser against local `/admin` to inspect the no-config admin entry state.
- Found the configuration-required screen still used technical `Admin auth`, browser-safe key, and project URL language.
- Replaced that visible copy with CMS-access language that tells a CMS manager what needs to happen without exposing Supabase/project-key terminology.
- Updated admin config/auth/coverage verifiers so the new wording is expected and the old technical wording cannot return.

### Changed Files
- `src/pages/admin/AdminState.tsx`
- `scripts/check-admin-config-gate.mjs`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-auth-browser.mjs`
- `docs/WORKLOG.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Browser QA
- Flow under test: `/admin` no-config entry state -> configuration-required CMS access message -> safe return link.
- Desktop Browser check: `http://127.0.0.1:5173/admin` rendered `CMS access is not connected yet`, no framework overlay, and no console warnings/errors.
- Mobile Browser check at 390x844: the same state wrapped cleanly, with readable copy and visible `Return to site` action.

### Verification Results
- Browser page identity: pass (`Admin | Urblo` at `http://127.0.0.1:5173/admin`).
- Browser not-blank / no-overlay / console health: pass.
- Targeted old-term scan: pass for runtime source; old technical terms remain only in verifier rejection strings.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes after rebuild. An earlier pre-rebuild run failed against stale `dist` output and was corrected by rebuilding before rerun.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This only verifies the no-config entry state; authenticated production CMS walkthrough remains pending after deployment.
- Screenshots were captured through the Browser session for visual inspection and were not added to the repo.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (CMS Handoff Live Readiness Audit)

### Scope
- Re-ran the no-write live-input readiness audit for the CMS handoff path using the production admin origin and first admin email.
- Confirmed the current production origin is ready for the deployed-preview route/API smoke input.
- Confirmed the reviewed static-to-Supabase draft import artifacts remain represented in readiness output.
- Kept final CMS handoff blocked on deployment of the current local UX stack plus production walkthrough evidence, not on source-only readiness.

### Changed Files
- `docs/WORKLOG.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:live-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au`: pass in report-only mode. No writes were made and no secrets were printed.
- Ready in the audit: Cloudflare deployed-preview route/API smoke input for `https://urblo.com.au`, and static-to-Supabase draft import artifacts.
- Missing in the current local shell: service-role key, browser-safe Supabase key, admin login credentials or token, form/email/Turnstile secrets, active-admin browser QA inputs, unprofiled unauthorized browser QA inputs, Settings invite live proof inputs, admin CRUD/live-write inputs, media Storage live-write inputs, and final Turnstile proof inputs.

### Risks and Gaps
- This audit does not deploy the current local CMS UX stack.
- This audit does not replace active-admin browser QA, Settings invite proof, admin live-write QA, final form/email proof, or Turnstile proof.
- Production editor handoff still requires the deployment sequence and module walkthrough in `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin Auth and Module Copy Terminology Sweep)

### Scope
- Continued the editor-facing terminology sweep across the remaining admin modules.
- Replaced visible Supabase/Auth/profile-row wording in the login, unauthorized, loading, and access-error states with approved CMS login/access language.
- Replaced remaining visible `record`/`row` wording in shared CMS public-page status copy, Media, Products, Projects, and the Change history module card.
- Extended admin CRUD coverage so those older technical phrases cannot return.

### Changed Files
- `src/pages/admin/AdminCmsPrimitives.tsx`
- `src/pages/admin/AdminLoginPage.tsx`
- `src/pages/admin/AdminMediaPage.tsx`
- `src/pages/admin/AdminProductsPage.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `src/pages/admin/AdminState.tsx`
- `src/pages/admin/AdminUnauthorizedPage.tsx`
- `src/pages/admin/adminContent.ts`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- Targeted old-term scan: pass. Removed visible phrases no longer appear in `src/pages/admin`.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This was a source/local runtime pass; it does not replace the production walkthrough.
- Internal database/table terms remain in non-UI source code where needed for Supabase queries and verification.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin Editor-Facing Terminology Sweep)

### Scope
- Scanned `/admin` source for remaining user-visible technical wording.
- Replaced residual editor-facing `record`, `row`, and `Unknown` language in Leads, Articles, and Change history with clearer CMS/customer wording.
- Updated admin CRUD coverage so those old terms cannot silently return.

### Changed Files
- `src/pages/admin/AdminArticlesPage.tsx`
- `src/pages/admin/AdminAuditPage.tsx`
- `src/pages/admin/AdminLeadsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- Targeted old-term scan: pass. The removed visible phrases no longer appear in the edited admin pages.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This was a source terminology pass, not a signed-in production walkthrough.
- Some internal variable/type names still use `row`/`record`; those are not editor-facing and were left intact.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin CMS Handoff Evidence Matrix)

### Scope
- Added a Handoff Evidence Matrix to the production walkthrough.
- The matrix maps the CMS goal requirements to current evidence and final proof still needed before claiming non-technical editor handoff.
- Covered login/orientation, Draft/Published/Archived clarity, Publish readiness, list/filter/save/publish/archive/public confirmation, technical-copy hiding, account handoff, and CMS/fallback explanation.
- Updated harness and verification docs so final handoff readiness must include this matrix.

### Changed Files
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-harness.mjs`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This matrix proves the remaining evidence boundary, not production completion.
- The goal remains active until the current CMS UX stack is deployed and the production walkthrough evidence is recorded.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin Editor Handoff Summary)

### Scope
- Added a concise Customer Handoff Summary to the admin editor guide.
- The summary now gives non-technical editors the admin address, account/role framing, daily editing path, publish confirmation rule, CMS coverage, imported Draft-row behavior, and static fallback boundary before the longer detailed guide.
- Tightened `npm run agent:check` so the handoff summary cannot silently disappear.

### Changed Files
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-harness.mjs`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This improves the customer-facing handoff guide, but production editors still need the current CMS UX stack deployed before they can use the latest interface language.
- Final handoff still requires production walkthrough evidence.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (CMS UX Pre-Deploy Readiness Gates)

### Scope
- Ran the remaining no-secret pre-deploy gates for the current local CMS UX stack.
- Verified the Cloudflare Pages repository-side deployment contract still passes after the CMS UX changes.
- Verified the built admin shell still shows the configuration-required gate across all launch-critical admin routes when browser-safe Supabase config is absent.
- Kept production deployment and production walkthrough explicitly pending.

### Changed Files
- `docs/WORKLOG.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:cloudflare-readiness`: pass. Verified build contract, SPA fallback, Function routing scope, headers, API handlers, env placeholders, and deployment runbook.
- `npm run agent:admin-config-gate`: pass. Firefox no-config gate passed for 11 admin routes; screenshots were written to `.tmp/admin-config-gate/screenshots`.

### Risks and Gaps
- These are pre-deploy source/built-site gates only; they do not deploy the current CMS UX stack.
- Production editor handoff still requires push/deploy approval, deployed smoke, active-admin browser QA, and the production walkthrough.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin Production Walkthrough Status Alignment)

### Scope
- Aligned the production walkthrough with the latest local CMS UX status language.
- Updated `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` to require Lead workflow status and Website settings status during the deployed module walkthrough.
- Tightened `npm run agent:check` so both the editor guide and production walkthrough must keep those handoff terms.
- Removed a redundant production-walkthrough handoff gap from the editor guide so the final open-item list stays cleaner.
- Recorded the walkthrough/guide alignment in the machine task queue without changing task status.

### Changed Files
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-harness.mjs`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is documentation/harness alignment only; it does not replace the production walkthrough.
- The current CMS UX stack still needs push/deploy approval before production editors can see the latest interface language.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin Leads and Settings Status Clarity)

### Scope
- Continued the `/admin` CMS editor-handoff goal by tightening the final Leads/Settings UX consistency pass.
- Added Lead workflow status before Recommended next step so lead managers can immediately see whether the selected lead needs an owner, needs internal notes, is ready to save, is handled, or is no longer active.
- Added Website settings status before the shared CMS status rules in Settings so CMS managers can distinguish Live settings, Draft settings, and Hidden settings before saving global contact/footer/search defaults.
- Expanded `npm run agent:admin-crud-coverage` so the new Leads and Settings status language cannot silently regress.
- Updated the editor guide, handoff, roadmap, and task queue to reflect the current local CMS UX state.

### Changed Files
- `src/pages/admin/AdminLeadsPage.tsx`
- `src/pages/admin/AdminSettingsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This batch is local source/docs work and has not been deployed to `https://urblo.com.au`.
- Final editor handoff still requires deploying the CMS UX changes and running `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` against production with a real active admin session.
- Settings invite flow still needs deployed live invite proof before it is used for production editor onboarding.

### Next Handoff
- `NOW-ADMIN-CMS-001`
- `NOW-ADMIN-SETTINGS-CRUD-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-06-04 (Articles Publish Status Summary)

### Scope
- Continued the `/admin` CMS editor-handoff goal by aligning Articles with the newer publish-status pattern.
- Added Article website status before the Article publish checklist so editors can see whether the article is Live on website, Ready not live yet, or Not ready to publish.
- Added Section publish status before Section actions so editors can see whether the selected section can appear in the article, is ready but unpublished, or is blocked.
- Locked section Publish when the selected section content is not ready, and updated locked Article/Section Publish errors to point editors to the first missing checklist item.
- Expanded `npm run agent:admin-crud-coverage` so Articles must keep the article/section publish-status and first-missing-item language.

### Changed Files
- `src/pages/admin/AdminArticlesPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Articles coverage now guards Article website status, Section publish status, and first-missing-item publish-blocker language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This is local source/docs work. It does not deploy the latest CMS UX stack or prove production editor behavior.
- Leads and Settings still need final consistency passes before production handoff.

### Next Handoff
- Continue with Leads and Settings consistency after the current Articles gates pass.

## Entry - 2026-06-04 (Products Publish Status Summary)

### Scope
- Continued the `/admin` CMS editor-handoff goal by aligning Products with the newer Projects/Media/Stone publish-status pattern.
- Added Product website status before the product Publish checklist so editors can see whether the product is Live on website, Ready not live yet, or Not ready to publish.
- Added Model publish status before the model Publish checklist so editors can see whether a model already supports a published product, is ready but unpublished, or is blocked.
- Updated locked Product/Model Publish errors to point editors to the first missing checklist item.
- Expanded `npm run agent:admin-crud-coverage` so Products must keep the publish-status and first-missing-item language.

### Changed Files
- `src/pages/admin/AdminProductsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Products coverage now guards Product website status, Model publish status, and first-missing-item publish-blocker language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This is local source/docs work. It does not deploy the latest CMS UX stack or prove production editor behavior.
- Articles, Leads, and Settings still need final consistency passes before production handoff.

### Next Handoff
- Continue with Articles publish-status consistency after the current Products gates pass.

## Entry - 2026-06-04 (Stone Finish Image Media Dependency)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making the Stone Library finish-image publishing dependency on Media clearer.
- Added Finish image public status inside the Stone Library finish-image editor so editors can see whether a finish image can appear on the website, is ready but unpublished, or is blocked.
- Added Open Media first guidance when the selected Media library item is not Published in Media, including clearer save/publish error copy.
- Expanded `npm run agent:admin-crud-coverage` so Stone Library must keep the finish-image public-status and Media dependency language.

### Changed Files
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Stone Library coverage now guards Finish image public status and Open Media first dependency language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This is local source/docs work. It does not deploy the latest CMS UX stack or prove production editor behavior.
- Broader Stone Library production walkthrough still needs to run after deployment approval.

### Next Handoff
- Continue toward production handoff by either running rendered local admin QA or moving to Products/Articles/Leads/Settings consistency once Stone Library gates pass.

## Entry - 2026-06-04 (Media Public-Use Status Summary)

### Scope
- Continued the `/admin` CMS editor-handoff goal by tightening Media publish clarity before moving deeper into Stone Library finish-image dependencies.
- Added Website media status above the Media Publish checklist so editors can see whether the selected media item is Available to public pages, Ready not published yet, or Not ready for public pages.
- Added first-missing-item guidance when Media Publish is locked, so editors know whether to fix source, public location, alt text, or usage notes first.
- Expanded `npm run agent:admin-crud-coverage` so the Media page must keep the public-use status summary and first-missing-item language.

### Changed Files
- `src/pages/admin/AdminMediaPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Media coverage now guards Website media status and first-missing-item publish-blocker language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This is local source/docs work. It does not deploy the latest CMS UX stack or prove production editor behavior.
- Stone Library finish-image UX still needs a follow-up pass to make the Media dependency even more direct from the Stone editor.

### Next Handoff
- Continue with Stone Library finish-image dependency clarity after the current Media gates pass.

## Entry - 2026-06-04 (Projects Publish Status Summary)

### Scope
- Continued the `/admin` CMS editor-handoff goal by tightening the Projects publish-blocker experience after the real editor confusion around Publish.
- Added a Website publish status summary above the Project Publish checklist so editors can see whether the selected project is Live on website, Ready not live yet, or Not ready to publish.
- Added a Start with action that jumps to the first repair item when Publish is locked, and adjusted the Publish failure message to tell editors that the checklist has highlighted the first repair item.
- Expanded `npm run agent:admin-crud-coverage` so the Projects page must keep the publish-status summary and first-repair language.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Projects coverage now guards Website publish status and first-repair publish-blocker language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This is local source/docs work. It is not deployed, and production editor walkthrough proof still has to run after deployment approval.

### Next Handoff
- Continue Projects production-readiness QA, then move to the next priority area: Media and Stone Library publish clarity.

## Entry - 2026-06-04 (Admin Editor Quick Start)

### Scope
- Added a Quick Start For Editors section to `docs/ADMIN_EDITOR_GUIDE.md` so non-technical editors get a short first-run path before the longer role/status/module details.
- The quick start tells editors to sign in, start from Dashboard Recommended next action, use list/search/status filters, save through the visible actions bar, check the publish checklist, confirm with Open public page, and ask a CMS manager for Settings, export, account access, or Change history work.
- Expanded `npm run agent:check` so the editor guide must keep that quick-start language and the no-Supabase/no-code handoff principle.

### Changed Files
- `docs/ADMIN_EDITOR_GUIDE.md`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass. Harness now guards the Quick Start For Editors handoff terms.
- `git diff --check`: pass.

### Risks and Gaps
- This is editor guidance and harness protection only. It does not deploy the latest CMS UX stack or prove production editor behavior.

### Next Handoff
- Proceed to push/deploy approval for the current CMS UX stack, then run `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` against production.

## Entry - 2026-06-04 (Admin CMS Deploy Approval Scope)

### Scope
- Added a Current CMS UX Stack Scope section to `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` so deployment approval has a clear module-by-module scope.
- The scope lists included Dashboard, Projects, Media, Stone Library, Products, Articles, Leads, Settings, and handoff-doc improvements.
- The scope also names what deployment approval does not cover: final Turnstile proof, destructive deletes, bulk publishing imported Draft content, removing static fallback behavior, or sending real Settings invite emails without separate approval.
- Expanded `npm run agent:check` so this approval-scope language stays present.

### Changed Files
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass. Harness now guards the deployment approval scope terms.
- `git diff --check`: pass.

### Risks and Gaps
- This is approval-scope documentation only. It does not push/deploy the CMS UX stack.

### Next Handoff
- Proceed to push/deploy approval for the current CMS UX stack.

## Entry - 2026-06-04 (Admin Production Walkthrough Deploy Sequence)

### Scope
- Added a Deploy Sequence to `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` so the approved CMS UX stack has a concrete push/deploy/proof order.
- The sequence now requires local pre-deploy gates, Cloudflare deployment identifier recording, deployed smoke, active-admin browser QA when credentials are present, module walkthrough evidence, and final handoff doc updates only after the walkthrough passes.
- Expanded `npm run agent:check` so the deploy sequence and production smoke/auth commands stay guarded.

### Changed Files
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass. Harness now guards the walkthrough Deploy Sequence terms.
- `git diff --check`: pass.

### Risks and Gaps
- This is still pre-deploy documentation. It does not push, deploy, or run production editor walkthrough proof.

### Next Handoff
- Proceed to push/deploy approval for the current CMS UX stack.

## Entry - 2026-06-04 (Cloudflare Repo Readiness Before CMS UX Deploy)

### Scope
- Ran the no-write repo-side Cloudflare Pages readiness gate for the current local CMS UX stack.
- Verified the local repository still has the expected Pages build contract, SPA fallback, Function routing scope, launch headers, API handler files, environment placeholders, and deployment runbook before push/deploy approval.

### Changed Files
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`

### Verification Results
- `npm run agent:cloudflare-readiness`: pass.
- Pending after docs update: `npm run agent:check` and `git diff --check`.

### Risks and Gaps
- This is repo-side deployment readiness only. It does not deploy the current CMS UX stack.
- Production handoff still requires push/deploy approval and `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`.

### Next Handoff
- Proceed to push/deploy approval for the current CMS UX stack.

## Entry - 2026-06-04 (Production Cloudflare Smoke Before CMS UX Deploy)

### Scope
- Ran the no-write Cloudflare deployed smoke against `https://urblo.com.au` before deploying the current local CMS UX stack.
- Verified the current production deployment still serves public route shells, admin route shells, discovered assets, legacy redirects, admin bundle config/secret boundary markers, and safe-failure behavior for `/api/enquiries` and `/api/sample-requests`.

### Changed Files
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`

### Verification Results
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: first sandboxed attempt failed with `fetch failed`.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass after approved non-sandbox rerun. Routes, assets, redirects, admin bundle contract, and API safe-failure checks passed.
- Pending after docs update: `npm run agent:check` and `git diff --check`.

### Risks and Gaps
- This proves the current production deployment is healthy; it does not prove the local CMS UX stack is deployed.
- Production editor handoff still requires deploying the current local CMS UX stack and running `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`.

### Next Handoff
- Proceed to push/deploy approval for the current CMS UX stack.

## Entry - 2026-06-04 (Admin CMS Production Handoff Live-Input Audit)

### Scope
- Ran the no-write live readiness input audit for production CMS handoff using `https://urblo.com.au` and `info@urblo.com.au` as non-secret inputs.
- Confirmed Cloudflare deployed-preview route/API smoke is ready with the supplied base URL.
- Confirmed current local shell has no live Supabase/admin/browser credentials loaded, so live form proofs, admin auth browser QA, admin CRUD/live-write QA, and Settings invite/live proofs remain missing/manual-gated in this local environment.

### Changed Files
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:live-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au`: pass in report-only mode. No writes were attempted.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:admin-crud-coverage`: pass. Admin source coverage still passes after documenting the live-input audit.

### Risks and Gaps
- This does not contradict previous production proofs; it only shows the current local environment does not have the secret inputs needed to rerun them.
- Production CMS handoff still needs push/deploy approval, active-admin browser QA against the deployed stack, and `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` evidence.

### Next Handoff
- Supply/approve the required live inputs only when ready to run production proof commands; otherwise continue with push/deploy approval and no-write deployed smoke.

## Entry - 2026-06-04 (Admin CMS Verification Matrix Walkthrough Contract)

### Scope
- Wired `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` into `docs/agent/verification.md` so Admin CMS production handoff now has an explicit verification source.
- The Admin CMS verification profile now names the walkthrough as required after deployment and before final non-technical editor handoff.
- Added evidence requirements for Dashboard orientation, Settings invite/access, Stone Library publish path, Article publish path, and Open public page confirmation.

### Changed Files
- `docs/agent/verification.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass. Verification matrix and walkthrough docs are both covered by harness checks.
- `git diff --check`: pass.
- `npm run agent:admin-crud-coverage`: pass. Admin source coverage still passes after the verification-doc update.

### Risks and Gaps
- This is verification-contract documentation, not production proof. The production walkthrough still needs to run after deploy.

### Next Handoff
- Proceed to push/deploy approval and execute the production walkthrough.

## Entry - 2026-06-04 (Admin Production Walkthrough Checklist)

### Scope
- Added `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` as the production checklist for proving the CMS is ready for non-technical editor handoff after deployment.
- The checklist covers admin login/orientation, Settings account handoff, Media readiness, Projects publish path, Stone Library publish path, Products publish path, Articles publish path, Leads workflow, Change history, and final handoff decision criteria.
- Updated `npm run agent:check` so the walkthrough file is required and guarded for the current action-bar and production proof language.

### Changed Files
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass. Harness now requires `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` and guards the production walkthrough terms.
- `npm run agent:admin-crud-coverage`: pass. Admin source coverage still passes after the walkthrough docs update.
- `git diff --check`: pass.

### Risks and Gaps
- This is a production QA checklist, not production proof. The walkthrough still needs to run after the local CMS UX stack is deployed.

### Next Handoff
- Proceed to push/deploy approval and execute `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` on production.

## Entry - 2026-06-04 (Admin CMS UX Stack Full Gate and Handoff Audit)

### Scope
- Ran the full current-stack verification set after the Dashboard, Projects, Media, Stone Library, Products, Articles, Leads, Settings, and editor-guide UX passes.
- Audited the active CMS handoff goal against current source and docs evidence.
- Confirmed local source/docs now cover editor start flow, Draft / Published / Archived state meaning, module action bars, publish checklists, visible public-page confirmation, Settings account handoff, current CMS coverage, and static fallback boundaries.

### Changed Files
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-config-gate`: pass. All 11 no-config admin route checks passed.

### Completion Audit
- Proven locally: non-technical editor orientation through Dashboard Recommended next action; module lists/search/status filters; Draft / Published / Archived visibility language; clear action bars for Projects, Stone Library, Products, Articles, Media, Leads, and Settings; publish checklists and blocker language; Open public page guidance; editor-facing Settings account handoff; and `docs/ADMIN_EDITOR_GUIDE.md` usage guidance.
- Not yet proven in production: the local CMS UX stack has not been pushed/deployed, Settings invite still needs live invite QA, and final signed-in editor walkthroughs for Stone Library and Articles still need to run against production content.

### Risks and Gaps
- Do not mark the CMS handoff goal complete until the current uncommitted stack is deployed and production editor walkthrough evidence exists.
- The build still reports the existing AdminApp chunk-size warning; it is not a functional failure but remains worth monitoring as admin grows.

### Next Handoff
- Get push/deploy approval for the current CMS UX stack, then run production active-admin walkthroughs covering Dashboard, Settings invite/access, a Stone Library publish path, an Article publish path, and a public-page confirmation after publishing.

## Entry - 2026-06-04 (Admin Editor Guide Handoff Refresh)

### Scope
- Continued the `/admin` CMS editor-handoff goal by refreshing `docs/ADMIN_EDITOR_GUIDE.md` after the Dashboard, content, Leads, and Settings UX action-bar passes.
- Added Where Editors Start guidance so non-technical editors know to begin with Recommended next action, content status counts, Content health queue, and All clear checks.
- Added Account Handoff Flow guidance for Settings so CMS managers can distinguish Site settings actions from CMS access handoff actions.
- Updated module notes to include Project actions, Stone family actions, Variant actions, Product actions, Model actions, Article actions, Section actions, Media actions, Lead workflow actions, and Site settings actions.
- Expanded harness checks so the editor guide cannot silently drift away from the current CMS UX language.

### Changed Files
- `docs/ADMIN_EDITOR_GUIDE.md`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass. Harness now guards the refreshed editor guide handoff/action-bar terms.
- `npm run agent:admin-crud-coverage`: pass. Admin source coverage still passes after the guide refresh.
- `git diff --check`: pass.

### Risks and Gaps
- This is a local docs/harness pass. The customer-facing guide still depends on the current CMS UX stack being pushed and deployed before production editors see the described interface.

### Next Handoff
- Continue with final production walkthrough/deploy readiness for the current CMS UX stack.

## Entry - 2026-06-04 (Admin Settings Handoff Actions UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Settings clearer for website settings saves and CMS account handoff.
- Added a Site settings actions bar near the top of the settings editor so Save settings sits beside Draft / Published / Archived website-visibility meaning.
- Added a CMS access handoff actions panel in People and access so CMS managers can choose between Invite and grant access for new editors and Grant existing login for people who already have a login setup code.
- Expanded admin CRUD coverage so Settings keeps the action bars and editor-facing save/invite guidance.

### Changed Files
- `src/pages/admin/AdminSettingsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards the Settings handoff action bars and editor-facing save/invite guidance.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass after approved non-sandbox rerun. The first sandboxed run did not get a response from Vite preview at `http://127.0.0.1:4173`.
- `npm run agent:admin-config-gate`: pass after approved non-sandbox rerun. The first sandboxed run hit `listen EPERM` on `127.0.0.1:4192`.

### Risks and Gaps
- This is a local source/docs UX pass. Settings account handoff still needs production invite QA after deploy approval.

### Next Handoff
- Continue the CMS editor-handoff UX pass with production walkthrough/readiness notes, then deploy after Jay approves the current uncommitted CMS UX stack.

## Entry - 2026-06-04 (Admin Leads Workflow Actions UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Leads workflow saving more visible and less form-like for non-technical lead managers.
- Added a Lead workflow actions bar beside the status guidance so Save workflow sits with the current next-step meaning.
- Added editor-facing action notes for selected, unselected, and read-only states, including the expected sequence: set workflow status, assign an owner, and record internal notes.
- Expanded admin CRUD coverage so Leads keeps the workflow action bar and editor-facing save/history language.

### Changed Files
- `src/pages/admin/AdminLeadsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards the Leads workflow action bar and editor-facing save/history language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass after approved non-sandbox rerun. The first sandboxed run did not get a response from Vite preview at `http://127.0.0.1:4173`.
- `npm run agent:admin-config-gate`: pass after approved non-sandbox rerun. The first sandboxed run hit `listen EPERM` on `127.0.0.1:4192`.

### Risks and Gaps
- This is a local source/docs UX pass. The Leads workflow actions still need production editor walkthrough after push/deploy approval.

### Next Handoff
- Continue the CMS editor-handoff UX pass with Settings, then run the same source/runtime gates before deploy or handoff.

## Entry - 2026-06-04 (Admin Articles Action Bar UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Articles save/publish/archive actions visible beside the article and section editing flow.
- Replaced separate Article and Article section button rows with Article actions and Section actions bars.
- Added editor-facing action notes that explain Draft saves, Published website visibility, Archived hiding, and why article Publish is locked until the Article publish checklist is clear.
- Expanded admin CRUD coverage so Articles keeps the action bars and editor-facing save/publish lock language.

### Changed Files
- `src/pages/admin/AdminArticlesPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards the Articles action bars and editor-facing save/publish lock language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: blocked in this environment. Sandboxed run started Vite preview but `http://127.0.0.1:4173` did not respond.
- `npm run agent:admin-config-gate`: blocked in this environment. Sandboxed run failed with `listen EPERM` on `127.0.0.1:4192`.

### Risks and Gaps
- This is a local source/docs UX pass. The Articles action bars still need production editor walkthrough after push/deploy approval.

### Next Handoff
- Rerun `npm run agent:smoke` and `npm run agent:admin-config-gate` once localhost preview escalation is available, then stage/commit after `.git` index writes are allowed.

## Entry - 2026-06-04 (Admin Products Action Bar UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Products save/publish/archive actions visible beside the product and model publish checklists.
- Replaced separate Product and Model button rows with Product actions and Model actions bars.
- Added editor-facing action notes that explain Draft saves, Published website visibility, Archived hiding, and why Publish is locked until the relevant checklist is clear.
- Expanded admin CRUD coverage so Products keeps the action bars and editor-facing save/publish lock language.

### Changed Files
- `src/pages/admin/AdminProductsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards the Products action bars and editor-facing save/publish lock language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: blocked in this environment. Sandboxed run started Vite preview but `http://127.0.0.1:4173` did not respond.
- `npm run agent:admin-config-gate`: blocked in this environment. Sandboxed run failed with `listen EPERM` on `127.0.0.1:4192`.

### Risks and Gaps
- This is a local source/docs UX pass. The Products action bars still need production editor walkthrough after push/deploy approval.

### Next Handoff
- Rerun `npm run agent:smoke` and `npm run agent:admin-config-gate` once localhost preview escalation is available, then stage/commit after `.git` index writes are allowed.

## Entry - 2026-06-04 (Admin Media Action Bar UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Media save/publish/archive actions visible beside the metadata publish checklist.
- Added a Media actions bar below the Media publish checklist and reused the same action language in the right-side utility column.
- Added editor-facing action notes that explain Draft saves, Published media visibility, Archived media hiding, and why Publish is locked until the Media publish checklist is clear.
- Expanded admin CRUD coverage so Media keeps the action bar and editor-facing save/publish lock language.

### Changed Files
- `src/pages/admin/AdminMediaPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards the Media action bar and editor-facing save/publish lock language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: blocked in this environment. Sandboxed run started Vite preview but `http://127.0.0.1:4173` did not respond.
- `npm run agent:admin-config-gate`: blocked in this environment. Sandboxed run failed with `listen EPERM` on `127.0.0.1:4192`.

### Risks and Gaps
- This is a local source/docs UX pass. The Media action bar still needs production editor walkthrough after push/deploy approval.

### Next Handoff
- Rerun `npm run agent:smoke` and `npm run agent:admin-config-gate` once localhost preview escalation is available, then stage/commit after `.git` index writes are allowed.

## Entry - 2026-06-04 (Admin Stone Library Action Bar UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Stone Library family and variant actions easier to find.
- Replaced the separate Stone family and Variant button rows with editor-facing action bars that pair Save / Publish / Archive with the current visibility state.
- Added action notes that explain Draft, Published, Archived, and Needs confirmation behavior beside the controls, including that Needs confirmation stays private until the checklist is clear.
- Expanded admin CRUD coverage so Stone Library keeps the action bars and editor-facing save/publish lock language.

### Changed Files
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards the Stone Library action bars and editor-facing save/publish lock language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: blocked in this environment. Sandboxed run started Vite preview but `http://127.0.0.1:4173` did not respond.
- `npm run agent:admin-config-gate`: blocked in this environment. Sandboxed run failed with `listen EPERM` on `127.0.0.1:4192`.

### Risks and Gaps
- This is a local source/docs UX pass. The Stone Library action bars still need production editor walkthrough after push/deploy approval.

### Next Handoff
- Rerun `npm run agent:smoke` and `npm run agent:admin-config-gate` once localhost preview escalation is available, then stage/commit after `.git` index writes are allowed.

## Entry - 2026-06-04 (Admin Projects Action Bar UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Projects save/publish/archive actions easier to find.
- Added a Project actions bar immediately below the Publish checklist so editors can save, publish, or archive without hunting at the bottom of the long project form.
- Reused the same action bar near the bottom of the editor and added inline action notes that explain whether Publish is locked, whether changes stay in the CMS, and when Published changes can appear on the website.
- Expanded admin CRUD coverage so the Projects editor keeps the visible action bar and editor-facing save/publish lock language.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards the Projects action bar and editor-facing save/publish lock language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: blocked in this environment. Escalated local preview run was rejected by policy; sandboxed run started Vite preview but `http://127.0.0.1:4173` did not respond.
- `npm run agent:admin-config-gate`: blocked in this environment. Escalated local preview run was rejected by policy; sandboxed run failed with `listen EPERM` on `127.0.0.1:4192`.

### Risks and Gaps
- This is a local source/docs UX pass. The Projects action bar still needs production editor walkthrough after push/deploy approval.

### Next Handoff
- Rerun `npm run agent:smoke` and `npm run agent:admin-config-gate` once localhost preview escalation is available, then stage/commit after `.git` index writes are allowed.

## Entry - 2026-06-04 (Admin Dashboard Priority Queue UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Dashboard behave more like an editor workbench.
- Replaced the static Start here cards with Recommended next action cards derived from new leads, publish blockers, and hidden draft content.
- Changed the Content health queue so it shows only items that need attention before publishing, with clear checks grouped separately under All clear checks.
- Expanded admin CRUD coverage so the Dashboard cannot drift back to a static next-job prompt or a noisy health queue that lists clear checks as primary work.

### Changed Files
- `src/pages/admin/AdminDashboardPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- Browser DOM check on local `/admin`: pass for no-config admin gate after Vite dev server was started outside the sandbox; page reached the configuration-required state with no framework overlay or relevant console errors. Screenshot/locator click proof was attempted, but the browser runtime timed out during capture/locator evaluation, so the stable packaged browser gate below remains the authoritative rendered route proof.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards the Dashboard priority queue language and rejects the older static next-job/noisy clear-check queue.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. Browser DOM verification confirmed the local no-config admin gate renders without framework overlay or relevant console errors, but authenticated Dashboard data-state walkthrough still needs push/deploy plus production editor session.

### Next Handoff
- Continue with push/deploy approval and production editor walkthrough.

## Entry - 2026-06-04 (Admin Media Library Item Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by cleaning up Media library visible language.
- Replaced Media list/action/empty/editor/export copy from record/records wording to Media library items, External media, New media item, and visible media library items.
- Kept technical storage fields intact while making the visible Media screen read like a content library rather than a database table.
- Expanded admin CRUD coverage so the Media screen cannot drift back to Library records / External record / No media records / New media record / visible media records wording.

### Changed Files
- `src/pages/admin/AdminMediaPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Media library items / External media / New media item language and rejects older Media record/records wording.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and production editor walkthrough.

## Entry - 2026-06-04 (Admin Projects Subcontent Visibility UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by clarifying Projects subcontent visibility.
- Added Draft/Published/Archived labels to Media block, Material map, and Hotspot selection chips so editors can see which saved child items can appear publicly.
- Added Status helper copy for Media blocks, Material maps, and Hotspots explaining when Published child content can appear on the public project page and when Draft content stays hidden.
- Added a project status label helper and expanded admin CRUD coverage so child-content status labels and visibility explanations remain guarded.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Projects child-content Draft/Published/Archived chip labels and subcontent visibility helper copy.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and production editor walkthrough.

## Entry - 2026-06-04 (Admin Projects Proof Review Repair UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by improving the Projects Facts/Materials repair path after a Publish checklist blocker.
- Added proof-review status labels to Facts and Materials selection chips so editors can see which saved items still need review before opening each one.
- Extended Fact and Material proof-review help so Needs review explicitly says it keeps Project Publish locked until the editor chooses Approved for public use or Deferred / keep private.
- Added a shared proof-review label helper and expanded admin CRUD coverage so the status labels and publish-lock guidance remain guarded.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards the Projects Facts/Materials proof-review labels and publish-lock repair context.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and production editor walkthrough.

## Entry - 2026-06-04 (Admin Projects Publish Blocker Guidance UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by improving the Projects publish-blocker repair path.
- Added a Status field helper explaining that Published is only allowed after the Publish checklist is clear, so editors do not treat the status dropdown as a bypass.
- Added highlighted Publish checklist state: when Publish or Save with Published is blocked, the first repair item is marked Start here.
- Reworked the publish-blocked error message so it points to the highlighted checklist item instead of producing a long error paragraph.
- Expanded admin CRUD coverage so the Status helper, Start here highlight, highlighted blocker state, and simplified publish-blocked error remain guarded.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards the Projects publish-blocker repair path, including Status helper, Start here highlight, highlighted blocker state, and simplified publish-blocked error.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and production editor walkthrough.

## Entry - 2026-06-04 (Admin Dashboard Status Count Clarity UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by strengthening the Dashboard content-status summary.
- Changed the Dashboard content-status heading to ask what the website can show now.
- Added per-status count meanings in the shared status count cards: Published can appear on website, Draft is safe to edit, and Archived is hidden but kept.
- Updated Dashboard status-row guidance so editors understand Published is website-eligible while Draft remains the safe workspace.
- Expanded admin CRUD coverage so the status-count meaning language is guarded source-side.

### Changed Files
- `src/pages/admin/AdminDashboardPage.tsx`
- `src/pages/admin/AdminCmsPrimitives.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards the Dashboard status-section heading and per-status count meanings.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and production editor walkthrough.

## Entry - 2026-06-04 (Admin Dashboard Visibility Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal with a global Dashboard/status-language cleanup.
- Replaced Dashboard metric, empty-state, and recent-lead guidance that still referenced rows, Supabase, or service-role verification with editor-facing website/live-content language.
- Reworded the admin shell visibility note so editors see that Published content can appear on the website, while Draft and Archived stay hidden.
- Reworded shared CMS status/workflow primitives so they describe draft content and page sections instead of rows.
- Expanded admin CRUD coverage so Dashboard, shell, and shared status primitives cannot drift back to the older technical wording.

### Changed Files
- `src/pages/admin/AdminShell.tsx`
- `src/pages/admin/AdminDashboardPage.tsx`
- `src/pages/admin/AdminCmsPrimitives.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Dashboard live-on-website, review-task/customer-enquiry empty states, and shared visibility wording while rejecting older rows/Supabase/service-role language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and production editor walkthrough.

## Entry - 2026-06-04 (Admin Projects Case Study Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal with a focused Projects language cleanup.
- Replaced visible Projects list, empty-state, read-only, publish-checklist, and media-health copy from project record / rows / Media library records wording to project case studies, details, materials, Media library items, and Nothing added yet.
- Replaced the Projects shell eyebrow from Admin/Editor to Editing access.
- Expanded admin CRUD coverage so Projects cannot drift back to the older record/row/media-record visible wording.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Projects case-study, detail/material count, Media library item, and Nothing added yet language, and rejects older project-record, row, and media-record wording.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and production editor walkthrough.

## Entry - 2026-06-04 (Admin Invite Duplicate Guard UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by hardening the new Settings invite flow.
- Changed the protected invite Function so it checks existing CMS access before sending a Supabase Auth invite, avoiding duplicate invite emails when the email already has access.
- Updated the People and access intro copy so Settings now clearly starts from Invite and grant access rather than the older setup-code-only sequence.
- Expanded admin CRUD and Cloudflare readiness coverage so the server-side existing-access guard cannot silently drift.

### Changed Files
- `functions/_lib/admin-invite.js`
- `src/pages/admin/AdminSettingsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `node --check functions/_lib/admin-invite.js`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards the server-side existing CMS access preflight before invite email send.
- `npm run agent:cloudflare-readiness`: pass. Cloudflare readiness now guards the protected invite Function's existing-access preflight.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus live invite QA before production editors rely on browser-side account creation.

### Next Handoff
- Continue with full gates, then push/deploy approval and a live invite walkthrough.

## Entry - 2026-06-04 (Admin Settings Invite Flow UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal with a high-impact Settings account-access improvement.
- Added protected Cloudflare Pages Function source for `/api/admin/invite-user`.
- The invite Function verifies the signed-in bearer session, requires an active Website owner or CMS manager profile, keeps the Supabase service key server-side, sends a Supabase Auth invite, creates the `admin_profiles` row, and records `admin_profile.invite` in Change history.
- Updated `/admin/settings` with an Invite and grant access form for new CMS users, while keeping Grant existing login as the setup-code fallback.
- Expanded admin CRUD and Cloudflare readiness coverage so the invite UI, protected Function, service-key boundary, role checks, profile insert, and Change history insert cannot silently drift.

### Changed Files
- `functions/_lib/admin-invite.js`
- `functions/api/admin/invite-user.js`
- `src/pages/admin/AdminSettingsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `node --check functions/_lib/admin-invite.js && node --check functions/api/admin/invite-user.js`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Settings invite UI, protected invite Function, bearer-session check, owner/admin role check, service-key boundary, profile insert, and Change history insert.
- `npm run agent:cloudflare-readiness`: pass. Readiness now covers `/api/admin/invite-user` routing and server-side invite Function contracts.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus live invite QA before production editors rely on browser-side account creation.
- The new invite flow has not yet sent a real Supabase Auth invite in production from `/admin/settings`.

### Next Handoff
- Continue with full runtime gates, then push/deploy approval and a live invite walkthrough.

## Entry - 2026-06-04 (Admin Leads Export Reference UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal with a focused Leads export cleanup.
- Replaced the Leads CSV `Lead ID` column with `Reference`.
- Exported enquiries and sample requests now use editor-facing references such as `enquiry-123` and `sample-123` instead of bare database numbers.
- Expanded admin CRUD coverage so Leads export language cannot drift back to `Lead ID`.

### Changed Files
- `src/pages/admin/AdminLeadsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now requires Leads CSV Reference language and rejects `Lead ID`.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus a final production editor walkthrough before the CMS handoff goal can be considered complete.
- Browser-safe invite/create-user inside `/admin/settings` remains the largest remaining non-technical handoff gap; current CMS access still depends on creating or inviting the login account outside the browser admin.

### Next Handoff
- Continue with push/deploy approval, decide whether to build an invite/create-user flow, and run the final production editor walkthrough.

## Entry - 2026-06-04 (Admin Products and Articles Media Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal with a focused Products and Articles media-language cleanup.
- Replaced Products health copy from model rows / media records to models / Media library items.
- Replaced Products and Articles media picker/preview fallbacks from `Media #id` and `/#id` status text to Untitled media plus Published in Media / Not published in Media labels.
- Replaced media-record and asset-review helper copy with Media library item and item-review language.
- Replaced shared subrecord empty copy from No records yet to Nothing added yet.
- Expanded admin CRUD coverage so Products and Articles cannot drift back to media-record, Media #, #id, asset-review, model-row, or selected-media-record wording in visible editing UI.

### Changed Files
- `src/pages/admin/AdminProductsPage.tsx`
- `src/pages/admin/AdminArticlesPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Products and Articles Media library item / Untitled media / Nothing added yet language and rejects media-record, Media #, #id, asset-review, model-row, and selected-media-record wording.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus a final production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and final production editor walkthrough.

## Entry - 2026-06-04 (Admin Stone Library Media Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal with a focused Stone Library language cleanup.
- Replaced visible Stone Library Admin/Editor, Library records, No stone records yet, media record, selected media record, Media #, and mutate wording with Editor access, Stone families, Media from library, Media library item, and save-changes language.
- Updated finish-image empty states, publish blocker copy, publishing rules, media picker label, picker options, preview status, and validation copy so editors understand they are choosing from the Media library.
- Expanded admin CRUD coverage so Stone Library cannot drift back to those technical labels in visible editing UI.

### Changed Files
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Stone Library Stone families / Media library item language and rejects Admin/Editor, Library records, media-record, Media #, and mutate wording.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass after removing the obsolete `mediaLabel` id parameter.
- `npm run lint`: pass after removing the obsolete `mediaLabel` id parameter.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus a final production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and final production editor walkthrough.

## Entry - 2026-06-04 (Admin Projects Media Selection Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal with a focused Projects media-selection cleanup.
- Replaced Projects media block selector language from Media asset / YouTube URL or ID to Media from library / YouTube link.
- Replaced Map health ID-linking copy with Media library availability language.
- Replaced project media picker option and preview labels from `#id` / raw status strings to Published/Draft/Archived in Media labels.
- Replaced internal validation labels such as Stone group ID, Finish definition ID, Hotspot map ID, and Project material ID with editor-facing selection labels.
- Expanded admin CRUD coverage so Projects cannot drift back to ID-linking, YouTube ID, raw selection-ID, or media-record ID language in visible editing UI.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Projects Media from library / YouTube link language and rejects ID-linking/raw selection-ID wording.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus a final production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and final production editor walkthrough.

## Entry - 2026-06-04 (Admin Leads and Settings Handoff Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal with a focused Leads and Settings language cleanup.
- Replaced Sample Request item fallbacks in Leads with Stone not selected / Finish not selected and Stone not found / Finish not found in both the on-screen request detail and CSV export output.
- Reframed Settings account-linking UI from Copy ID / Existing login account ID to Copy setup code / Login setup code while preserving the existing login-account binding contract.
- Changed the Settings team count label from profiles to people so the list reads like access management instead of database rows.
- Expanded admin CRUD coverage so Leads cannot drift back to TBC or Unknown stone/finish language, and Settings cannot drift back to Copy ID / Existing login account ID wording.

### Changed Files
- `src/pages/admin/AdminLeadsPage.tsx`
- `src/pages/admin/AdminSettingsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Leads sample-item fallback language and Settings setup-code language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus a final production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and final production editor walkthrough.

## Entry - 2026-06-04 (Admin Articles Migration Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal with a focused Articles language cleanup.
- Replaced the article list secondary line with `URL: <key> / Date not set` so editors understand the route key and the missing-date task.
- Replaced Original import note/link labels with Migration note and Migration source link.
- Removed ID terminology from linked project/stone validation labels for Article sections.
- Expanded admin CRUD coverage so Articles cannot drift back to Original import note/link, Date needs review, or linked project/stone ID wording in visible editing UI.

### Changed Files
- `src/pages/admin/AdminArticlesPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Articles Migration note/link, URL/date list labels, and non-ID linked record validation labels.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus a final production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and final production walkthrough.

## Entry - 2026-06-04 (Admin Products URL-Key Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal with a focused Products language cleanup.
- Replaced visible Products `slug` wording in list search and validation with Website URL key language.
- Replaced the product list secondary label with `URL: <key>` so editors understand the field is the public route key.
- Replaced model publish guidance from clean key to model website key.
- Replaced Material slug with Material reference and updated validation so editors can provide a Stone Library link, material reference, or display label without learning internal field names.
- Expanded admin CRUD coverage so Products cannot drift back to slug/material-slug/clean-key wording in visible editing UI.

### Changed Files
- `src/pages/admin/AdminProductsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Products URL key / Material reference language and rejects visible slug/material-slug/clean-key regressions.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus a final production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and final production walkthrough.

## Entry - 2026-06-04 (Admin Projects URL-Key Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal with a focused Projects language cleanup.
- Replaced visible Projects `Slug` wording with Website URL key language in the project editor, list search placeholder, publish checklist detail, and validation messages.
- Replaced the project list fallback `Location TBC` with `Location not set` so incomplete location data reads as an editor task rather than a domain status.
- Replaced the Facts `JSON value` label and invalid-JSON error with Structured detail language and help text, making the advanced field optional and less alarming for normal fact editing.
- Updated guide/harness wording so product model publishing uses model website key rather than clean model key.
- Expanded admin CRUD coverage so Projects cannot drift back to slug/JSON/TBC labels in visible editing UI.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-harness.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Projects Website URL key / Structured detail language and rejects visible slug/JSON/TBC regressions.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus a final production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and final production walkthrough.

## Entry - 2026-06-04 (Admin Change History UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by replacing the visible Activity log / Owner/Admin audit language with Change history / Website owner / CMS manager language.
- Updated `/admin/audit` to present as Change history, with restricted-state copy, list/detail copy, guardrail copy, and health summary language that a non-technical CMS manager can understand.
- Added friendly action/entity labels for common audit records so saved changes read as Published project, Updated media, Exported leads CSV, CMS team access, Media library, Article sections, and related CMS areas instead of raw dotted actions or table names.
- Updated admin navigation labels so Operations shows Change history, Settings shows Website owner / CMS manager access, and Articles refers to Article sections rather than structured story content.
- Updated shared save/export failure notices so editors see Change history wording when audit logging fails or succeeds.
- Updated docs and coverage so the new Change history language is guarded and the editor guide no longer mentions reviewed project claim status.

### Changed Files
- `src/pages/admin/AdminAuditPage.tsx`
- `src/pages/admin/adminContent.ts`
- `src/pages/admin/AdminMediaPage.tsx`
- `src/lib/adminAudit.ts`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-harness.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now reports Change history and guards friendly action/entity labels plus Website owner / CMS manager language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a local source/docs UX pass. The latest local CMS UX commits still need push/deploy approval plus a final production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and final production walkthrough.

## Entry - 2026-06-04 (Admin Editor Guide Harness Guard)

### Scope
- Continued the `/admin` CMS editor-handoff goal by adding a harness guard for the editor guide.
- Updated `npm run agent:check` so it now requires `docs/ADMIN_EDITOR_GUIDE.md` to keep the production admin address, Website owner / CMS manager / Editor / Viewer roles, CMS team access path, Draft/Published/Archived/Needs confirmation language, admin module coverage, public fallback notes, imported Draft-content note, push/deploy gap, and final editor walkthrough gap.
- Added old-term regression checks so the guide cannot silently drift back to Supabase Auth login account, Admin team, Active profile, structured article blocks, activity logging, SEO defaults, TBC table labels, or Owner/Admin table-role wording.

### Changed Files
- `scripts/check-harness.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `node --check scripts/check-harness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass. The new editor-guide guard ran inside the harness.
- `git diff --check`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a harness/docs guard only. The latest local CMS UX commits still need push/deploy approval plus a final production editor walkthrough before the CMS handoff goal can be considered complete.

### Next Handoff
- Continue with push/deploy approval and final production walkthrough.

## Entry - 2026-06-04 (Admin Editor Guide Refresh)

### Scope
- Continued the `/admin` CMS editor-handoff goal by refreshing `docs/ADMIN_EDITOR_GUIDE.md` after the page-level UX language passes.
- Updated the guide to use Website owner, CMS manager, Editor, and Viewer roles instead of older Owner/Admin wording.
- Updated account setup language around CMS team / People and access, Active access, login account ID, and the current limitation that login-account creation still happens outside browser CMS.
- Updated module notes for Dashboard, Projects, Stone Library, Products, Articles, Media, Leads, Settings, and Activity log to match current editor-facing language.
- Updated fallback and publishing sections for imported Draft rows, Article sections, Published in Media, Leads change-history export, and Open public page behavior.
- Added an explicit handoff gap that the local CMS UX commits must be pushed and deployed before production editors see the latest interface.

### Changed Files
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This guide is now current with the local source state, but production still needs the local CMS UX commits pushed/deployed plus a final editor walkthrough.

### Next Handoff
- Continue with push/deploy approval, then run the final production editor walkthrough against the updated `/admin` interface.

## Entry - 2026-06-04 (Admin Settings Team Access UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by clarifying Settings public-site and team-access language.
- Replaced visible Owner/Admin framing with Website settings, CMS manager, and Website owner language.
- Renamed Global contact and SEO / SEO defaults to Global contact and search defaults / Search defaults.
- Rewrote the What this changes guidance so editors see public website settings, CMS team access, and login-account prerequisites without Supabase Auth or default-row terminology.
- Reframed Admin team / Profiles and access / Active profile as CMS team / People and access / Active access.
- Updated team-access notices and validation errors so they refer to CMS access, CMS manager access, and Website owner access instead of admin profile rows or owner-role internals.
- Expanded admin CRUD coverage so Settings keeps the editor-facing website-settings/CMS-team/search-default/access language and rejects older Owner/Admin, Supabase Auth, admin-profile-row, owner-role, and default SEO/default-row wording.

### Changed Files
- `src/pages/admin/AdminSettingsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Settings' Website settings / CMS manager / Website owner / search defaults / CMS team / People and access / Active access language and rejects older Owner/Admin, Supabase Auth, admin-profile-row, owner-role, default SEO, and default-row visible wording.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a targeted Settings language pass. The final CMS handoff guide still needs a post-polish refresh before declaring the overall CMS goal complete.

### Next Handoff
- Continue the CMS goal with the final editor handoff guide and an end-to-end admin walkthrough check.

## Entry - 2026-06-04 (Admin Leads Workflow Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Leads feel like a team work queue instead of a technical lead table.
- Replaced visible owner/admin and activity-log export language with lead manager and change history wording.
- Renamed Lead guardrails to Workflow rules and replaced physical-delete wording with Closed/Spam workflow guidance.
- Rewrote inbox health and form-delivery copy so failed notifications become email-delivery review and the anti-spam badge is described as the website spam check.
- Updated lead assignment labels so team roles read as Team owner, Lead manager, Editor, or Team member instead of raw system role names.
- Rewrote CSV export headers and values from snake_case/status codes to editor-facing labels such as Lead type, Website page, Email delivery, Spam check, and Assigned owner.
- Expanded admin CRUD coverage so Leads keeps the editor-facing visible-queue/change-history/workflow language and rejects older activity-log, owner/admin export, physical-delete, failed-notification, and unknown-admin wording.

### Changed Files
- `src/pages/admin/AdminLeadsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Leads' lead-manager/change-history/Workflow rules/email-delivery/CSV-header language and rejects older activity-log, owner/admin export, physical-delete, failed-notification, and unknown-admin visible wording.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a targeted Leads work-queue language pass. Settings remains the next CMS UX unification target.

### Next Handoff
- Continue the CMS goal with Settings team-access and public-site settings clarity.

## Entry - 2026-06-04 (Admin Articles Section Publishing UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by clarifying Articles status, section authoring, media, and publishing language.
- Renamed the visible article Slug field to Website URL key and added article status help explaining Draft, Published, and Archived public visibility.
- Replaced visible legacy-source labels with Original import note and Original import link so migration provenance stays understandable without exposing internal terminology.
- Renamed structured block authoring language to Article sections, including section buttons, section health, section checklist items, and section validation messages.
- Rewrote article media selector labels and previews so editors see Published in Media / Not published in Media instead of raw media paths or status/path strings.
- Renamed Article publishing guardrails to Publishing rules and replaced physical-delete language with archive-history language.
- Expanded admin CRUD coverage so Articles keeps the editor-facing website-key/import-note/section/media/status language and rejects older legacy-source, guardrail, physical-delete, slug/kebab-case, and raw source-path wording.

### Changed Files
- `src/pages/admin/AdminArticlesPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Articles' Website URL key / Original import note-link / Article sections / status-help / Media preview language and rejects older legacy-source, guardrail, physical-delete, slug/kebab-case, raw newsletter, and raw source-path visible wording.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a targeted Articles language and publish-readiness pass. Leads and Settings remain the next CMS UX unification targets.

### Next Handoff
- Continue the CMS goal with Leads workflow clarity and Settings team-access/public-site language.

## Entry - 2026-06-04 (Admin Products Publishing Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by clarifying Products status, media, and publishing language.
- Renamed the product Slug field to Website URL key and the model key field/checklist language to Model website key.
- Added product/model status help explaining when Draft, Published, and Archived records can appear publicly.
- Rewrote product/model media selector labels and previews so editors see Published in Media / Not published in Media instead of raw media paths or status/path strings.
- Rewrote Product publishing rules and archive language around public visibility and editing history.
- Expanded admin CRUD coverage so Products keeps the editor-facing website-key/media/status language and rejects older physical-delete, ID-linking, and model-key blocker wording.

### Changed Files
- `src/pages/admin/AdminProductsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Products' Website URL key / Model website key / status-help / Media preview language and rejects older physical-delete, ID-linking, Cannot publish model, and Model key visible wording.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a targeted Products status/media-language pass. Articles, Leads, and Settings remain the next CMS UX unification targets.

### Next Handoff
- Continue the CMS goal with Articles media/legacy-source publishing language, then Leads and Settings.

## Entry - 2026-06-04 (Admin Stone Library Confirmation UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by clarifying Stone Library status, confirmation, and finish-image publishing language.
- Replaced visible Stone Library `TBC` wording in current editor controls with Needs confirmation language and added group/variant status help that explains whether each state can appear publicly.
- Renamed Source type note and Price source to Stone type proof note and Pricing note.
- Rewrote finish-image publish blocker language so editors know to open Media and publish the selected media record before publishing a finish image.
- Updated finish-image media selector labels/previews so they show Published in Media / Not published in Media instead of raw media paths or status/path strings.
- Renamed Stone Library publication guardrails to Publishing rules and replaced physical-delete language with archive-history language.
- Expanded admin CRUD coverage to guard the new Stone Library editor-facing language and reject the old TBC/technical publishing copy.

### Changed Files
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Stone Library's Needs confirmation/status-help/finish-image media guidance and rejects older TBC/source/price/guardrail publishing copy.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a targeted Stone Library status/confirmation-language pass. Authenticated rendered Stone Library QA still needs production or local credentialed browser walkthrough after deployment.

### Next Handoff
- Continue the CMS goal with deeper Stone Library workflow ergonomics or proceed to remaining Products/Articles/Leads/Settings unification.

## Entry - 2026-06-04 (Admin Media Visibility Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Media publishing and file-location choices clearer for non-technical editors.
- Replaced visible Media source/location labels with editor-facing language: File or link type, Website visibility location, Uploaded file location, and Upload destination.
- Added inline guidance for Uploaded file, External archive link, Hosted file link, Hosted video link, Private draft library, and Public website library so editors can tell whether a media record can support public pages.
- Rewrote Media list fallback titles and location summaries so assets without alt/caption no longer surface raw uploaded-file paths as the primary label.
- Renamed Media publication guardrails to Publishing rules and expanded admin CRUD coverage to keep the editor-facing Media labels while rejecting older Storage file path / Upload bucket / Cloudflare R2 / Cloudflare Stream visible wording.

### Changed Files
- `src/pages/admin/AdminMediaPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Media's editor-facing source/location labels and rejects older Storage file path / Upload bucket / Cloudflare R2 / Cloudflare Stream visible wording.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a targeted Media language and visibility-location pass. Stone Library remains the next CMS UX target.
- Authenticated rendered Media QA still needs a production or local credentialed browser walkthrough after deployment.

### Next Handoff
- Continue the CMS goal with Stone Library TBC/finish-image publishing clarity.

## Entry - 2026-06-04 (Admin Projects Proof Review Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by tightening the Projects publishing experience around the real editor blocker already observed in production use.
- Replaced visible Project/Facts/Materials claim-review field language with editor-facing Proof review language.
- Added inline Proof review explanations for Needs review, Approved for public use, and Deferred / keep private so editors can decide whether a row is safe to publish without understanding `claim_status`.
- Rewrote Projects list readiness copy, Publish checklist blocker details, publish-lock validation messages, and the right-side publishing rules to explain what is live, what is blocked, and where to fix it.
- Expanded admin CRUD coverage so Projects keeps the new proof-review language and rejects the older Claims checked / Claim status / Cannot publish wording.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Projects proof-review language and rejects the older Claims checked / Claim status / Cannot publish wording.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a targeted Projects editor-language pass. The deeper Projects list/detail IA and live editor walkthrough remain active CMS handoff work.
- Local rendered admin verification covered the no-config shell; the authenticated proof-review UI still needs production or local credentialed browser QA after this batch is deployed.

### Next Handoff
- Continue the CMS goal with deeper Projects workflow ergonomics, then move to Media and Stone Library.

## Entry - 2026-06-04 (Admin Dashboard Module Card Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by removing technical dependency language from global admin module cards.
- Replaced the `dependency` module-card field with `handoffLabel`, so Dashboard renders editor-facing labels directly instead of mapping Supabase/RLS strings to friendlier copy.
- Rewrote module summaries for Dashboard, Media, Stone Library, Projects, Products, Articles, Settings, and Activity log around editing jobs and handoff meaning.
- Expanded admin CRUD coverage so module cards keep editor-facing handoff labels and cannot reintroduce visible Supabase/RLS dependency copy.

### Changed Files
- `src/pages/admin/adminContent.ts`
- `src/pages/admin/AdminDashboardPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now guards Dashboard module-card handoff labels and rejects technical dependency copy in `adminContent.ts`.
- `npm run agent:check`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a source-level IA/language improvement; final proof still needs production editor walkthrough after deployment.

### Next Handoff
- Continue the CMS goal with remaining page-level language cleanup and production editor walkthrough proof.

## Entry - 2026-06-04 (Admin Activity Log Language UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by replacing user-facing audit-event language with Activity log language.
- Changed shared save notices so activity-log failures read as an owner/admin follow-up, not a technical `Audit event failed` message.
- Changed Media and Leads export messages from audit-event wording to activity-log wording.
- Changed Settings status copy so editors no longer see database row IDs for site settings.
- Renamed the `/admin/audit` navigation/page presentation to Activity log while keeping the existing route and table contracts intact.
- Added Activity log formatting so action/entity values render as readable labels instead of raw dotted or underscored keys.
- Expanded admin CRUD coverage so the Activity log language and readable formatting source contract is guarded.

### Changed Files
- `src/lib/adminAudit.ts`
- `src/pages/admin/AdminAuditPage.tsx`
- `src/pages/admin/AdminLeadsPage.tsx`
- `src/pages/admin/AdminMediaPage.tsx`
- `src/pages/admin/AdminSettingsPage.tsx`
- `src/pages/admin/adminContent.ts`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now reports Activity log and guards the readable Activity log source contract.
- `npm run agent:check`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- The underlying route remains `/admin/audit` for compatibility; the visible CMS language now says Activity log.

### Next Handoff
- Continue the CMS goal with final production editor walkthrough proof and any remaining page-level language gaps.

## Entry - 2026-06-04 (Admin Settings Access Grant UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Settings team access easier for non-technical owner/admin users to operate.
- Added a Copy ID action on existing admin profile rows so owners/admins can copy the full login account ID instead of relying on a shortened display value.
- Renamed the profile form from generic add/edit language to Grant CMS access / Edit CMS access, clarifying that this grants CMS permission to an already-created login account.
- Added inline copy feedback after copying a login account ID and clearer form copy separating login-account creation from CMS role assignment.
- Expanded admin CRUD coverage so the Settings access-grant and copy-ID handoff contract is source-guarded.

### Changed Files
- `src/pages/admin/AdminSettingsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now requires the Settings access-grant and copy-ID handoff source contract.
- `npm run agent:check`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This still does not create Supabase Auth login accounts from the browser CMS; owners/admins still need the login account to exist before granting CMS access.

### Next Handoff
- Continue the CMS goal with final production editor walkthrough proof and any remaining Settings/account creation handoff gaps.

## Entry - 2026-06-04 (Admin Leads Visible Export UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by correcting the Leads export flow to match what editors see.
- Changed `Export visible queue` so it exports only the current search/filter result rather than every loaded lead row.
- Added visible count copy showing filtered rows versus total loaded rows, and clarified that exports use the current search and filters.
- Updated export audit metadata to record filtered enquiry/sample/item counts, total loaded rows, and the active filter/search state.
- Expanded admin CRUD coverage so the visible filtered export contract is source-guarded.

### Changed Files
- `src/pages/admin/AdminLeadsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now requires the Leads visible filtered export source contract.
- `npm run agent:check`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is source-verified locally until the production editor walkthrough confirms CSV export behavior with real lead filters after deployment.

### Next Handoff
- Continue the CMS goal with Settings/team-access handoff clarity and final production editor walkthrough proof.

## Entry - 2026-06-04 (Admin Product Model Publish Checklist UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Product Model publishing readable before editors click Publish.
- Added a Model publish checklist for model key, model label, and model image readiness inside `/admin/products`.
- Locked the Model Publish button until that checklist is clear, and added the same guard in the save path so an editor cannot publish a model that cannot satisfy the Product publish checklist.
- Generalized the existing Product publish checklist component so product-level and model-level readiness can share the same visual pattern with clearer module-specific copy.
- Expanded admin CRUD coverage so the Product Model publish checklist and locked-publish source contract are guarded.

### Changed Files
- `src/pages/admin/AdminProductsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now requires the Product Model publish checklist and locked-publish source contract.
- `npm run agent:check`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is source-verified locally until the final production signed-in editor walkthrough confirms the flow with imported product rows after deployment.

### Next Handoff
- Continue the CMS goal with production walkthrough proof and any remaining editor confusion found during real-content use.

## Entry - 2026-06-04 (Admin Articles Publish Checklist UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Article publishing readable before editors click Publish.
- Added an Article publish checklist for title, website URL, published date, excerpt, at least one Published structured block, and published-block content readiness.
- Locked the Article Publish button until the checklist is clear, matching the Product/Project pattern and replacing hidden validation-only feedback.
- Updated Article publication guardrails to tell editors to complete the checklist and publish at least one structured block before public article bodies can appear.
- Expanded admin CRUD coverage so the Article publish checklist and locked-publish contract are source-guarded.

### Changed Files
- `src/pages/admin/AdminArticlesPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now requires the Article publish checklist and locked-publish source contract.
- `npm run agent:check`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is source-verified locally; a production signed-in editor walkthrough still needs to confirm the checklist with real imported article rows after deployment.

### Next Handoff
- Continue the CMS goal with production walkthrough proof and any remaining editor confusion found during real-content use.

## Entry - 2026-06-04 (Admin Public Page Confirmation Links)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making post-publish confirmation visible inside content editors.
- Added shared `CmsPublicPageLink` UI that opens the public route only when a record is Published; Draft, TBC, and Archived records show a hidden-state explanation instead.
- Added the public-page confirmation control to Projects, Stone Library, Products, and Articles editor headers.
- Updated Dashboard handoff guidance so it no longer claims Stone Library detail and Article body rendering are unresolved public gaps; editors are now told to use the public-page link after publishing.
- Expanded admin CRUD coverage so the public-page confirmation control must remain on launch-critical content editors.

### Changed Files
- `src/pages/admin/AdminCmsPrimitives.tsx`
- `src/pages/admin/AdminDashboardPage.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `src/pages/admin/AdminProductsPage.tsx`
- `src/pages/admin/AdminArticlesPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now requires the public-page confirmation control on Projects, Stone Library, Products, and Articles.
- `npm run agent:check`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- The public-page link is a confirmation shortcut; it does not replace the production signed-in editor walkthrough after deployment.
- Draft/TBC/Archived rows remain hidden by design, so editors still need to publish and then confirm the route.

### Next Handoff
- Continue the CMS goal with production walkthrough proof and any remaining editor confusion found during real-content use.

## Entry - 2026-06-04 (Public Stone Library Detail CMS Adapter)

### Scope
- Continued the `/admin` CMS editor-handoff goal by closing the Stone Library detail public-read gap.
- Added a public Stone Library detail adapter that reads Published Supabase stone families, variants, finish capabilities, and finish images before falling back to static Stone Library data.
- Updated `/stone-library/:stoneGroupId` to load detail data asynchronously, show a deliberate loading/error state, and avoid redirecting before the published-first lookup completes.
- Expanded `npm run agent:public-supabase-readiness` so it fails if Stone Library detail loses the published-first adapter or static fallback.
- Updated the editor guide, handoff, roadmap, and task queue to reflect that Stone Library listing/detail can now reflect Published CMS rows.

### Changed Files
- `src/service/StoneLibraryService.ts`
- `src/pages/StoneLibraryDetailPage.tsx`
- `scripts/check-public-supabase-readiness.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:public-supabase-readiness`: pass. Verified published-only public Supabase read boundaries, Stone Library detail published-first adapter guard, and static fallback contract.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:check`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; `/stone-library/alpine-white` route passed.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Imported Stone Library rows remain `draft` by design; an editor still needs to review and publish real family/variant/finish/image rows before the public site shows CMS-authored detail content.
- The CMS detail adapter maps cut options to a conservative on-request public row because the current Supabase Stone Library schema does not yet store cut-option rows separately.
- A final signed-in production editor walkthrough is still required after local commits are pushed and deployed.

### Next Handoff
- Continue the CMS goal with a signed-in production walkthrough and editor review/publish proof.

## Entry - 2026-06-04 (Public Article Structured Block Rendering)

### Scope
- Continued the `/admin` CMS editor-handoff goal by closing the public Article body gap.
- Added a public Article body adapter that reads Published Supabase `article_blocks` for the current article slug and falls back to sanitized legacy HTML from `legacy_source_path` when no published structured blocks are available.
- Added public renderers for structured article block types used by `/admin/articles`, including rich text, media, quote, FAQ, CTA, reference, proof metric, video-link, comparison, and callout blocks.
- Expanded `npm run agent:public-supabase-readiness` so it fails if Article public detail loses the structured-block adapter or fallback boundary.
- Updated the editor guide, handoff, roadmap, and task queue to reflect that Article body rendering is now CMS-backed for Published blocks while imported draft content remains private until reviewed and published.

### Changed Files
- `src/service/ArticleService.ts`
- `src/pages/ArticlePage.tsx`
- `scripts/check-public-supabase-readiness.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:public-supabase-readiness`: pass. Verified 95 draft Article blocks stay structured in import dry run and the public runtime boundary keeps published-only Supabase reads with static/legacy fallback.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Imported article rows and blocks remain `draft` by design; an editor still needs to review and publish real Article content before the public site shows those CMS-authored bodies.
- Stone Library detail now has a published-first Supabase adapter in the following worklog entry; production editor walkthrough remains.
- A final signed-in production editor walkthrough is still required after local commits are pushed and deployed.

### Next Handoff
- Continue the CMS goal with a signed-in production walkthrough and editor review/publish proof.

## Entry - 2026-06-04 (Admin Settings Access Handoff UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Settings/team-access pass.
- Replaced the remaining technical Settings protection copy with owner/admin-facing language.
- Added an Access setup checklist that explains the actual handoff sequence: create or invite a login account first, paste the existing login account ID, choose the lowest suitable role, keep the profile active, then ask the person to sign in at `/admin`.
- Renamed the form field to Existing login account ID and clarified that email alone cannot grant CMS access.
- Added a Role guide for Owner, Admin, Editor, and Viewer so non-technical owners understand permission tradeoffs before saving access.
- Expanded the admin CRUD coverage guard, CMS handoff docs, roadmap, task queue, and editor guide to reflect the account-handoff contract.

### Changed Files
- `src/pages/admin/AdminSettingsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- Visual sanity check: reviewed `.tmp/admin-config-gate/screenshots/admin-settings.png`; `/admin/settings` still renders the no-config protected shell without private settings/team content exposure.

### Risks and Gaps
- The browser CMS still cannot create the underlying login account or send an invite; it now states that clearly and guides the profile-grant step.
- Live Settings/team-access save proof remains a production authenticated owner/admin walkthrough item after local commits are pushed and deployed.

### Next Handoff
- Continue the CMS goal with a signed-in production editor walkthrough after deployment, or the remaining Stone Library detail/public Article rendering gaps.

## Entry - 2026-06-04 (Admin Dashboard Editor Start UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Dashboard first-screen pass.
- Added Start here quick actions for Review new leads, Publish content, and Prepare media so non-technical editors have a clear first decision after login.
- Fixed content-status routing for Stone families so the status row opens `/admin/stone-library` instead of falling back to `/admin`.
- Reworded Dashboard health labels away from database/claim jargon and toward editor-facing review tasks.
- Replaced stale launch-secret/checklist guidance with handoff guidance for account role setup, real-content walkthrough, publish checklists, and known public fallback gaps.
- Updated admin CRUD coverage, CMS handoff docs, roadmap, task queue, and editor guide to reflect the Dashboard editor-start contract.

### Changed Files
- `src/pages/admin/AdminDashboardPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- Visual sanity check: reviewed `.tmp/admin-config-gate/screenshots/admin.png`; `/admin` still renders the no-config protected shell without private dashboard content exposure.

### Risks and Gaps
- Dashboard editor-start UX is source-verified locally but still needs signed-in production editor walkthrough after these local commits are pushed and deployed.
- Stone Library detail and Article body rendering still have public fallback gaps, now called out in the Dashboard handoff guidance.

### Next Handoff
- Continue the CMS goal with a signed-in production editor walkthrough after deployment, or the remaining Stone Library detail/public Article rendering gaps.

## Entry - 2026-06-04 (Admin Stone Library Publish Checklist UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Stone Library publish-readiness pass.
- Added Stone Library family and variant Publish checklists so editors can see missing URL key, public summary, variant, and finish availability requirements before publication.
- Locked Stone family and Variant Publish actions while checklist blockers remain, replacing late validation surprises with visible readiness guidance.
- Replaced several technical/internal labels with editor-facing language such as Website URL key, Supplier/source label, Stone type shown on website, Public summary, Internal notes, Supplier/source variant, and Variant category.
- Reworded finish capability states from yes/TBC/no into Available, Needs confirmation, and Not available in the editor UI.
- Expanded the admin CRUD coverage guard, CMS handoff docs, roadmap, task queue, and editor guide to reflect Stone Library checklist/finish-availability authoring.

### Changed Files
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- Visual sanity check: reviewed `.tmp/admin-config-gate/screenshots/admin-stone-library.png`; `/admin/stone-library` still renders the no-config protected shell without private content exposure.

### Risks and Gaps
- The checklist is source-verified locally but still needs signed-in production editor walkthrough after these local commits are pushed and deployed.
- Stone Library detail remains static-backed until the deeper public variant/finish detail mapper is completed.

### Next Handoff
- Continue the CMS goal with a signed-in production editor walkthrough after deployment, or the remaining Stone Library detail/public Article rendering gaps.

## Entry - 2026-06-04 (Admin Media Publish Checklist UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Media publish-readiness pass.
- Replaced internal storage/source labels with editor-facing language such as Private draft library, Public website library, Media source, Publishing location, External archive link, and File details.
- Added a Media Publish checklist for source recording, public location, image alt text, and usage notes.
- Locked Media Publish and the status-save publish path while checklist blockers remain, so editors see the missing readiness step instead of discovering it through a late validation error.
- Expanded the admin CRUD coverage guard, CMS handoff docs, roadmap, task queue, and editor guide to reflect Media checklist/library-label authoring.

### Changed Files
- `src/pages/admin/AdminMediaPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- Visual sanity check: reviewed `.tmp/admin-config-gate/screenshots/admin-media.png`; `/admin/media` still renders the no-config protected shell without private content exposure.

### Risks and Gaps
- The checklist is source-verified locally but still needs signed-in production editor walkthrough after these local commits are pushed and deployed.
- Public media reuse still depends on editors publishing the relevant media before linking it from content modules.

### Next Handoff
- Continue the CMS goal with a signed-in production editor walkthrough after deployment, or the remaining Stone Library detail/public Article rendering gaps.

## Entry - 2026-06-04 (Admin Leads Workflow Guidance UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Leads workflow pass.
- Replaced technical lead detail language with editor-facing labels: `Source route` became Website page, notification states became Email pending/sent/failed/not required, and Turnstile state became Spam check passed/failed/not recorded.
- Added status-specific Recommended next step guidance in the workflow editor for enquiries and sample requests, so owner/admin users know what action each status implies before saving.
- Renamed the export action to Export visible queue while preserving the existing audit-gated CSV export behavior.
- Updated the admin CRUD coverage guard, CMS handoff docs, roadmap, task queue, and editor guide to reflect lead workflow guidance.

### Changed Files
- `src/pages/admin/AdminLeadsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- Visual sanity check: reviewed `.tmp/admin-config-gate/screenshots/admin-leads.png`; `/admin/leads` still renders the no-config protected shell without private content exposure.

### Risks and Gaps
- The workflow guidance is source-verified locally, but a signed-in production editor walkthrough is still needed after local CMS UX commits are pushed and deployed.
- Final Turnstile form proof remains separate; this pass only improves how stored anti-spam state is explained in the admin.

### Next Handoff
- Continue with a signed-in production editor walkthrough after deployment, or remaining public rendering/detail gaps.

## Entry - 2026-06-04 (Admin Products Publish Checklist UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Products publish-readiness pass.
- Replaced product-level `SEO JSON` editing with editor-facing Search title and Search description fields while preserving the existing `products.seo` JSON contract behind the form.
- Added a Product Publish checklist for product name, website URL, short description, hero image, at least one published model with image, material defaults, and specifications.
- Locked Product Publish and the status-save publish path while checklist blockers remain, so editors see what to fix before attempting publication.
- Expanded the admin CRUD coverage guard, CMS handoff docs, roadmap, task queue, and editor guide to reflect Product checklist/search-field authoring.

### Changed Files
- `src/pages/admin/AdminProductsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- Visual sanity check: reviewed `.tmp/admin-config-gate/screenshots/admin-products.png`; `/admin/products` still renders the no-config protected shell without private content exposure.

### Risks and Gaps
- The checklist is source-verified locally but still needs signed-in production editor walkthrough after these local commits are pushed and deployed.
- Product public pages already prefer published Supabase rows with static fallback; this change improves editor readiness but does not alter public rendering.

### Next Handoff
- Continue the CMS goal with a signed-in production editor walkthrough after deployment, or the remaining Stone Library detail/public Article rendering gaps.

## Entry - 2026-06-04 (Admin Articles Form Authoring UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Articles authoring pass.
- Replaced article-level `SEO JSON` editing with editor-facing Search title and Search description fields while preserving the existing `articles.seo` JSON contract behind the form.
- Replaced direct Article block content JSON entry with block-type-specific editor forms for rich text, image/gallery notes, quotes, FAQ, CTA, project/stone references, comparison notes, proof metrics, video embeds, and callouts.
- Updated block publish validation so Published blocks require meaningful editor content for the selected block type instead of only requiring a non-empty JSON object.
- Updated the admin CRUD coverage guard, CMS handoff docs, roadmap, task queue, and editor guide to reflect form-based Article authoring.

### Changed Files
- `src/pages/admin/AdminArticlesPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- Browser/IAB DOM check for `http://127.0.0.1:5173/admin/articles`: pass for page identity, nonblank config-required shell, no Vite overlay, and zero console warnings/errors. Browser screenshot capture timed out twice, so the visual sanity check used the generated Playwright gate screenshot at `.tmp/admin-config-gate/screenshots/admin-articles.png`.

### Risks and Gaps
- Local no-config browser validation can prove the route shell and guard state, but not the signed-in live Article editor form; that still needs production or local browser-safe Supabase config plus an active editor/admin session.
- Public Article detail still renders sanitized legacy HTML until structured public block rendering is implemented.
- Products still has a separate SEO JSON field that should receive the same editor-facing treatment in a later batch.

### Next Handoff
- Continue the CMS goal by replacing Products SEO JSON with editor-facing SEO fields or by adding a final production Article editor walkthrough after deployment.

## Entry - 2026-06-04 (Admin Products Media Selector UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Products media/default-material pass.
- Replaced raw Product hero media ID and Model image media ID entry with editor-facing media selectors and previews.
- Added Stone Library status feedback to Product material defaults so editors can see whether the linked stone is public-ready.
- Updated validation labels so Product media errors refer to selected images/media rather than database IDs.

### Changed Files
- `src/pages/admin/AdminProductsPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Products no longer requires hand-entering media IDs for hero/model images, but SEO JSON remains a technical field that still needs a friendlier editor layer.
- Product model publish readiness is still less explicit than Projects; a future pass should add a compact checklist for published model image/label/key readiness.

### Next Handoff
- Continue the CMS goal by simplifying Article block editing or replacing Products SEO JSON with editor-facing SEO fields.

## Entry - 2026-06-04 (Admin Stone Library Finish Image UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Stone Library finish-image pass.
- Added selected-media preview, source/status feedback, and missing-media feedback to the finish image link editor.
- Locked the Finish Image Publish action when the selected media record is not Published in `/admin/media`, with editor-facing guidance explaining what to fix.
- Updated the save-time validation copy so the error points editors back to publishing the media record, not to an internal database rule.

### Changed Files
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass after preserving the existing source-gate phrase for published finish-image media requirements.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Stone Library finish images are clearer, but the finish capability grid still has dense source/admin-note fields that need more editorial guidance.
- Stone Library detail remains static-backed until the public variant/finish detail mapper is completed.

### Next Handoff
- Continue the CMS goal by simplifying Products media/default selectors or adding clearer Stone Library finish capability guidance.

## Entry - 2026-06-04 (Admin Projects Media Selector UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Projects media-linking pass.
- Replaced raw media ID entry with editor-facing media selectors and previews for project cover image, hero image, material image, media block asset, material map image, and hotspot preview image fields.
- Kept the existing Supabase data contract unchanged; selectors still write the same media ID values, but editors choose from readable media labels with thumbnail/status/source feedback.
- Updated validation labels so media errors refer to selected images/media rather than database IDs.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Projects no longer requires hand-entering media IDs for the main image links, but Products and Stone Library still have similar media-linking patterns that should be unified next.
- Media picker search/filtering is still basic because it uses the existing select list; a richer reusable media chooser remains a later UX improvement once the pattern is shared across modules.

### Next Handoff
- Continue the CMS goal by applying the same non-technical media selection pattern to Stone Library finish images and Product media/default imagery.

## Entry - 2026-06-04 (Admin Projects Publish Checklist UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Projects publish-flow pass.
- Moved project Publish readiness into the Project editor instead of leaving it as a side-panel/error-only cue.
- Expanded the Project Publish checklist to include title, website URL, public summary/lead copy, project claims, fact claims, and material claims.
- Locked the Project Publish button while blockers remain, renamed the primary form submit from `Save draft` to `Save changes`, and changed the project-level claim field label to `Claims checked`.
- Made checklist actions scroll/select the relevant Project, Facts, or Materials editor section so editors know where to fix blockers.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Projects is more usable for publish blockers, but media ID entry and nested media-map/hotspot editing are still technical and need later editor-facing selectors/previews.
- Customer/editor review-publish proof against real imported draft content remains outstanding until this local CMS UX batch is pushed and verified in production.

### Next Handoff
- Continue the CMS goal by simplifying remaining nested content editors, with Stone Library detail/finish-image editing and Project media selectors as the next highest-friction areas.

## Entry - 2026-06-04 (CMS Storage Proof, Draft Import, and Public Read Cutover)

### Scope
- Ran the approved Storage-inclusive admin live QA path.
- Added `scripts/apply-content-import-live.mjs` and `npm run agent:content-import:live` as a plan-only-by-default live draft import runner.
- Imported the reviewed static-to-Supabase payload into production Supabase as draft/review rows through browser-key owner/admin RLS.
- Cut public Projects, Products, Articles, and the Stone Library listing to prefer published Supabase reads with static fallback.
- Updated `npm run agent:public-supabase-readiness` from a static-only boundary check to a public browser-key read boundary plus static fallback check.

### Supabase Evidence
- Storage QA marker: `admin-live-1780497462544-23b1d5e3`.
- Storage object uploaded: `urblo-admin-media/live-check/admin-live-1780497462544-23b1d5e3.png`.
- Storage-inclusive admin QA recorded 48 audit rows, verified signed-in admin readback, and verified anonymous browser-key denial through private and public Storage object endpoints.
- Draft content import wrote/upserted 115 media assets, 13 stone groups, 15 variants, 153 finish capabilities, 53 finish image rows, 6 products, 28 product models, 18 material defaults, 18 specs, 5 projects, 41 project facts, 2 project materials, 1 project material map, 15 project media rows, 2 hotspots, 4 articles, and 95 article blocks.
- Stored parent counts after import: 13 stone groups, 6 products, 5 projects, and 4 articles.
- Anonymous browser-key reads exposed zero imported draft parent rows.

### Verification
- `npm run agent:content-import:apply-sql`: pass; local ignored artifacts generated with 0 warnings and 0 blockers.
- `npm run agent:content-import:live`: pass in plan-only mode.
- `npm run agent:content-import:live -- --allow-writes`: pass with approved admin session.
- `npx tsc -b`: pass after public-read adapter changes.
- `npm run build`: pass.
- `npm run lint`: pass.
- `npm run agent:smoke`: pass when rerun with local preview listen permission; the first sandboxed attempt failed with `listen EPERM` before route checks.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Playwright Firefox public render QA against local preview: `/stone-library`, `/products`, `/projects`, and `/articles` rendered expected H1/content with no console/page errors.
- Git commit `7a318ab` pushed to `origin/main`.
- Cloudflare Pages production deployment `bc830b5f-4c98-46ab-8962-586478ff9259` for commit `7a318ab` reached `deploy` status `success`.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass on the current production deployment.

### Risks and Gaps
- Imported production content is intentionally still `draft`; public pages continue using static fallback until an editor publishes rows in `/admin`.
- Stone Library detail remains static-backed until the deeper public variant/finish detail mapper is completed.
- Article detail continues rendering sanitized legacy HTML from `legacy_source_path`; structured public block rendering remains a follow-up.
- Turnstile remains unconfigured/unverified.
- Unprofiled unauthorized admin browser QA remains staged but unrun.

### Next Handoff
- Finish full runtime/docs gates for this cutover branch.
- Publish a small reviewed content sample in `/admin` and smoke the public Supabase read path end to end.
- Complete Stone Library detail public adapter and article structured block renderer if the client wants public pages to reflect every CMS field immediately.

## Entry - 2026-06-04 (Admin CRUD Live QA and Project Media Migration)

### Scope
- Applied the approved `project_media_blocks` migration to the live Supabase project and aligned the local migration filename with the remote migration version.
- Verified `project_media` now has `project_material_map_id`, `block_title`, and `youtube_url`, plus the expected media-role and block-contract constraints/indexes.
- Re-ran approval-gated non-Storage admin CRUD/live lead workflow QA.
- Archived partial public-facing QA rows left by the failed pre-migration run and recorded cleanup audit rows.

### Supabase Evidence
- Remote migration list includes `20260603142359 project_media_blocks`.
- Columns verified: `project_media.project_material_map_id`, `project_media.block_title`, and `project_media.youtube_url`.
- Constraints verified: `project_media_media_role_check` and `project_media_block_contract_check`.
- Indexes verified: `project_media_project_material_map_idx`, `project_media_project_role_sort_idx`, and `project_media_one_active_youtube_idx`.

### Verification
- Failed pre-migration run marker: `admin-live-1780496442071-f27c2b7d`; it stopped at missing `project_media.block_title`.
- Passed run marker: `admin-live-1780496690772-b8a47213`.
- `npm run agent:admin-crud-live -- --allow-writes`: pass.
- Created tagged QA rows: `site_settings#4`, `media_assets#2`, `stone_groups#2`, `stone_variants#2`, `stone_finish_capabilities#2`, `stone_finish_images#2`, `products#2`, `product_models#2`, `product_material_defaults#2`, `product_specs#2`, `projects#2`, `project_facts#2`, `project_materials#2`, `project_material_maps#2`, `project_media#1`, `project_hotspots#1`, `articles#1`, `article_blocks#1`, `enquiries#5`, `sample_requests#4`, and `sample_request_items#4`.
- Audit rows recorded by the passing run: `48`.
- Dashboard health predicates matched tagged QA rows before archive cleanup.
- Tagged public-content rows were published, archived, and then checked for anonymous invisibility.
- Anonymous browser-key reads returned zero tagged QA content rows and no private lead rows.

### Cleanup
- Partial failed-run public-facing rows were archived non-destructively: `site_settings#3`, `media_assets#1`, `stone_groups#1`, `products#1`, and `projects#1`.
- Cleanup audit rows recorded: `admin_audit_events.id = 73` through `77`.

### Advisor Notes
- Security advisor returned one Auth warning: leaked password protection is disabled.
- Performance advisor returned existing INFO/WARN items around unused indexes and multiple permissive SELECT policies; these are follow-up tuning items, not blockers for the completed QA run.

### Risks and Gaps
- Optional Storage upload proof was not run because `--include-storage` was not approved/requested.
- Turnstile remains unconfigured/unverified.
- Static-to-Supabase content import and public read cutover still need explicit approval and review.

### Next Handoff
- Decide whether to run `npm run agent:admin-crud-live -- --allow-writes --include-storage` for final Storage upload proof.
- Decide whether Turnstile proof is required before launch and configure its site key/secret/token path if yes.
- Continue toward guarded content import/public read cutover after content review approval.

## Entry - 2026-06-04 (Production Active Admin Browser QA Passed)

### Scope
- Ran no-write active-admin browser QA against `https://urblo.com.au` for `info@urblo.com.au`.
- Installed the local Playwright Firefox runtime needed by the verifier.
- Used a browser-safe Supabase publishable key and a one-time shell/session credential path; no secrets were written to repo files or docs.
- Updated launch harness docs so active-admin browser QA is no longer listed as a blocker.

### Verification
- `curl -I https://urblo.com.au/`: HTTP `200` when run with external network access.
- `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`: pass.
- The verifier reported 9 authenticated admin routes checked and wrote ignored screenshots under `.tmp/admin-auth-browser/screenshots`.

### Screenshots
- `.tmp/admin-auth-browser/screenshots/login.png`
- `.tmp/admin-auth-browser/screenshots/admin.png`
- `.tmp/admin-auth-browser/screenshots/admin-leads.png`
- `.tmp/admin-auth-browser/screenshots/admin-media.png`
- `.tmp/admin-auth-browser/screenshots/admin-settings.png`
- `.tmp/admin-auth-browser/screenshots/admin-stone-library.png`
- `.tmp/admin-auth-browser/screenshots/admin-projects.png`
- `.tmp/admin-auth-browser/screenshots/admin-products.png`
- `.tmp/admin-auth-browser/screenshots/admin-articles.png`
- `.tmp/admin-auth-browser/screenshots/admin-audit.png`
- `.tmp/admin-auth-browser/screenshots/signed-out.png`

### Risks and Gaps
- Admin CRUD/live lead workflow verification is still pending explicit tagged-write approval.
- Optional Storage upload proof still requires intentional `--include-storage`.
- Turnstile remains unconfigured/unverified.
- The temporary admin password used for QA should be rotated after launch hardening.

### Next Handoff
- Run `npm run agent:admin-crud-live` in plan-only mode, then run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged admin QA writes.
- Decide whether Turnstile proof is required before launch and configure its site key/secret/token path if yes.

## Entry - 2026-06-03 (First Admin Profile Bootstrapped)

### Scope
- Verified Supabase Auth contains confirmed user `info@urblo.com.au`.
- Created the first active admin profile linked to that Auth user with role `owner`.
- Recorded `admin_profile.bootstrap` in `admin_audit_events`.
- Verified admin readiness data with Supabase connector and browser-key REST boundary checks.
- Did not run browser login QA because no admin password/session was available to Codex.

### Changed Files
- `AGENTS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Supabase Evidence
- Auth user: `info@urblo.com.au`, user id `74b9e1d1-5f29-482c-836e-4feec8cd0087`, email confirmed on 2026-06-03.
- Admin profile: `info@urblo.com.au`, display name `Urblo Admin`, role `owner`, `is_active = true`.
- Active admin profile count: `1`.
- Bootstrap audit: `admin_audit_events.id = 8`, action `admin_profile.bootstrap`, metadata includes role `owner` and source `codex-first-admin-bootstrap`.
- Baseline seeds remain present: 12 published finish definitions and one published site settings row.

### Browser-Key Readiness Evidence
- Production browser key type: publishable.
- Anonymous browser-key REST read of published `site_settings`: HTTP `200`, one row.
- Anonymous browser-key REST read of published `finish_definitions`: HTTP `200`, 12 rows.
- Anonymous browser-key REST read of `admin_profiles`: HTTP `401`, denied.

### Risks and Gaps
- Active-admin browser login QA is still pending because Codex does not have `URBLO_ADMIN_PASSWORD` or an admin access token.
- Admin lead workflow/export QA and admin CRUD live verification remain pending until an authenticated owner/admin browser session is available and Jay approves tagged admin QA writes.
- Turnstile remains unconfigured/unverified.

### Next Handoff
- Provide admin credentials outside chat via local `.env.local`/shell variables, then run `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`.
- After no-write admin browser QA passes, run admin lead workflow/admin CRUD live checks only after explicit tagged-write approval.

## Entry - 2026-06-03 (Supabase Browser-Key Boundary Verified)

### Scope
- Verified Cloudflare Pages production now includes the deployed Supabase browser-safe publishable key after redeploy.
- Triggered Cloudflare Pages production redeploy `7d10ba13-5b9f-4d6e-86b9-e28218978189` for commit `7100bba` so build-time `VITE_` variables were included in the production bundle.
- Ran approved tagged production Contact and Sample Request submissions against `https://urblo.com.au`.
- Used the deployed public Supabase publishable key to verify private lead rows are not anonymously readable through REST.
- Checked Supabase Auth/admin profile readiness and found no Auth users and no admin profiles yet.

### Changed Files
- `AGENTS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Cloudflare Deployment Evidence
- Production deployment: `7d10ba13-5b9f-4d6e-86b9-e28218978189`.
- Deployment URL: `https://7d10ba13.urblo.pages.dev`.
- Commit: `7100bba34959885242103a1103aba32d450dd834`.
- Deployment status: `success`.
- Production bundle check: Supabase URL is present, a browser-safe publishable key is present, and no key value was printed.

### Live Boundary Proof
- Marker: `boundary-live-1780494471331-3df3d8f9`.
- Contact HTTP proof against `https://urblo.com.au/api/enquiries`: HTTP `201`, response id `4`, `notificationStatus = sent`.
- Sample Request HTTP proof against `https://urblo.com.au/api/sample-requests`: HTTP `201`, response sample request id `3`, sample item id `3`, `notificationStatus = sent`.
- Anonymous REST read with the deployed Supabase publishable key returned HTTP `401` for `enquiries.id = 4`.
- Anonymous REST read with the deployed Supabase publishable key returned HTTP `401` for `sample_requests.id = 3`.
- Anonymous REST read with the deployed Supabase publishable key returned HTTP `401` for `sample_request_items.id = 3`.
- Supabase connector readback confirmed the tagged enquiry, sample request, sample item, and audit rows exist.
- Supabase connector readback confirmed `admin_audit_events.id = 6/7` for the tagged boundary run.

### Admin Readiness
- `public.admin_profiles` is currently empty.
- `auth.users` is currently empty.
- Admin live login/profile QA is blocked until the first Supabase Auth user exists and an active `admin_profiles` row is linked to that user.

### Verification Results
- Cloudflare deployment readback: deployment `7d10ba13-5b9f-4d6e-86b9-e28218978189` is `deploy/success`.
- Production bundle check: pass, browser-safe publishable key present without printing the key.
- Production private-row boundary proof: pass, anonymous reads denied for the tagged private lead rows.
- Supabase connector readback: pass for tagged rows and audit rows.

### Risks and Gaps
- Turnstile remains unconfigured/unverified.
- First admin bootstrap remains pending because there are no Supabase Auth users or admin profiles yet.
- Admin browser login and admin lead workflow remain blocked until the first admin Auth/profile path exists.

### Next Handoff
- Create or invite the first Supabase Auth user, then create/link the first active owner/admin `admin_profiles` row.
- Run admin readiness and no-write admin browser QA after that account exists.

## Entry - 2026-06-03 (SMTP2GO Notification Path Verified)

### Scope
- Selected SMTP2GO as the preferred Contact/Sample Request notification provider because Urblo already has a subscription.
- Updated the Pages Function form handler to prefer `SMTP2GO_API_KEY` through SMTP2GO's HTTP API and retain Resend as a compatibility fallback.
- Updated source/mock/live readiness checks and launch docs so final email proof uses SMTP2GO variables.
- Added SMTP2GO DNS records in Cloudflare for return-path, DKIM, and tracking verification.
- Pushed commit `3408f34` and verified Cloudflare Pages production deployment `0439e4f9-73d4-44d1-ac5a-17b7cf363dfa`.
- Ran approved tagged production SMTP2GO proof against `https://urblo.com.au` using HTTP submissions plus Supabase connector readback.

### Changed Files
- `AGENTS.md`
- `.env.example`
- `functions/_lib/forms.js`
- `scripts/check-forms-api.mjs`
- `scripts/check-forms-api-live.mjs`
- `scripts/check-live-readiness.mjs`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`

### Cloudflare DNS Evidence
- Account: Hunter (`077afae2c6f4e77badadf21e49e58eb7`)
- Zone: `urblo.com.au` (`544d6bf99e48f4b36d7abb24f053ab17`)
- Added DNS-only CNAME `em905485.urblo.com.au -> return.smtp2go.net`, record id `999d935aa8b2323d0d1b613aa5bcc276`.
- Added DNS-only CNAME `s905485._domainkey.urblo.com.au -> dkim.smtp2go.net`, record id `15b74562f23fb255774c77ad46c7d473`.
- Added DNS-only CNAME `link.urblo.com.au -> track.smtp2go.net`, record id `86625766121803fd24d38c7e84c785e5`.
- Readback confirmed all three records have `proxied = false` and TTL auto.
- Readback confirmed Google MX records remain `aspmx.l.google.com` plus `alt1` through `alt4`, and apex TXT/SPF records remain present.

### Cloudflare Deployment Evidence
- Production deployment: `0439e4f9-73d4-44d1-ac5a-17b7cf363dfa`.
- Deployment URL: `https://0439e4f9.urblo.pages.dev`.
- Commit: `3408f34a50daac7967e6f66fe260de28f25bc76e`.
- Deployment status: `success`.

### Live SMTP2GO Proof
- Marker: `smtp2go-live-1780493701494-8916a935`.
- Contact HTTP proof against `https://urblo.com.au/api/enquiries`: HTTP `201`, response id `3`, `notificationStatus = sent`.
- Sample Request HTTP proof against `https://urblo.com.au/api/sample-requests`: HTTP `201`, response sample request id `2`, sample item id `2`, `notificationStatus = sent`.
- Supabase connector readback: `enquiries.id = 3` exists with matching tagged email/source route and `notification_status = sent`.
- Supabase connector readback: `sample_requests.id = 2` exists with matching tagged email/source route and `notification_status = sent`.
- Supabase connector readback: `sample_request_items.id = 2` exists for `sample_request_id = 2`, `quantity = 1`, and notes including Angola Black, Honed, SMTP2GO Verification, and the marker.
- Supabase connector readback: `admin_audit_events.id = 4` records `enquiry.create` for `enquiries.id = 3` with matching source-route metadata.
- Supabase connector readback: `admin_audit_events.id = 5` records `sample_request.create` for `sample_requests.id = 2` with matching source-route metadata, `itemId = 2`, and `quantity = 1`.

### Verification Results
- `node --check scripts/check-forms-api.mjs`: pass.
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `node scripts/check-forms-api.mjs`: pass, including SMTP2GO and Resend notification mocks.
- `npm run agent:forms-ui`: pass.
- `npm run agent:live-readiness`: report-only pass; email proof now reports `SMTP2GO_API_KEY or RESEND_API_KEY` as the provider input.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass after rerunning with approved local preview-server permission; the first sandboxed run could not reach the Vite preview server.
- `git push origin main`: pass after GitHub credentials became available; pushed `3408f34` to `origin/main`.
- `npm run agent:forms-live -- --allow-writes --allow-email --require-email --base-url https://urblo.com.au`: expected local verifier guard stopped before writes because no local `SUPABASE_SERVICE_ROLE_KEY` is available in this workspace. Equivalent approved production HTTP proof plus Supabase connector readback was used instead.

### Risks and Gaps
- Real SMTP2GO delivery is verified for the current provider path; future rechecks with the packaged live verifier require local `SUPABASE_SERVICE_ROLE_KEY` for row readback.
- Browser-safe Supabase private-row proof, Turnstile proof, and admin lead workflow proof remain separate launch checks.

### Next Handoff
- `NEXT-FORMS-EMAIL-NOTIFY-001` is complete for the current provider path.
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-06-02 (Production Domain Cutover)

### Scope
- Added production custom domains `urblo.com.au` and `www.urblo.com.au` to the Cloudflare Pages project `urblo`.
- Cut over apex and `www` website DNS to Cloudflare Pages.
- Preserved the previous website DNS values in Cloudflare DNS record comments and in `docs/CLOUDFLARE_DEPLOYMENT.md` for rollback.
- Kept Google Workspace MX records, apex TXT/SPF/verification records, NS records, and `qa.urblo.com.au` unchanged.
- Recorded the post-launch email-notification follow-up: Contact and Sample Request notifications should eventually go to `info@urblo.com.au`, but provider selection/configuration is deferred.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Cloudflare Evidence
- Account: Hunter (`077afae2c6f4e77badadf21e49e58eb7`)
- Zone: `urblo.com.au` (`544d6bf99e48f4b36d7abb24f053ab17`)
- Pages project: `urblo`
- Custom domains added:
  - `urblo.com.au`
  - `www.urblo.com.au`
- Current apex website DNS: `CNAME urblo.com.au -> urblo.pages.dev`, proxied, TTL auto.
- Current `www` website DNS: `CNAME www.urblo.com.au -> urblo.pages.dev`, proxied, TTL auto.
- Rollback apex website DNS: record id `9bc69b26cbeef071e02f4a1bd5f715e7`, `A urblo.com.au -> 159.198.65.164`, proxied, TTL auto.
- Rollback `www` website DNS: record id `4ce8ffa7ee003ae79acac67096ca33ab`, `CNAME www.urblo.com.au -> urblo.com.au`, proxied, TTL auto.
- Unchanged reference old-site DNS: `qa.urblo.com.au -> 159.198.65.164`, proxied, TTL auto.
- Google MX records remained pointed at `aspmx.l.google.com` and `alt1` through `alt4`.

### Verification Results
- `curl -I https://urblo.com.au`: HTTP `200`.
- `curl -I https://www.urblo.com.au`: HTTP `200`.
- `curl -I https://urblo.com.au/stone-library/angola-black`: HTTP `200`.
- `curl -I https://www.urblo.com.au/contact`: HTTP `200`.
- `curl -I https://urblo.com.au/api/enquiries`: HTTP `405`, expected safe-failure for GET.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://www.urblo.com.au`: pass.
- Cloudflare Pages domain API: `urblo.com.au` and `www.urblo.com.au` are both `active`; verification and HTTP validation are both `active`.

### Risks and Gaps
- Email notification is still not configured; form rows persist to Supabase and currently use `notification_status = not_required`.
- Browser-safe Supabase/admin readiness remains pending.
- Turnstile proof remains pending.
- If rollback is needed, use the DNS values recorded above and in `docs/CLOUDFLARE_DEPLOYMENT.md`; do not touch MX/TXT/SPF/NS records.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-FORMS-SUPABASE-001`
- `NEXT-FORMS-EMAIL-NOTIFY-001`

## Entry - 2026-06-02 (Cloudflare Deployed Form Persistence Verified)

### Scope
- Ran approved tagged live form QA writes against the deployed Cloudflare Pages production URL after the server-side Supabase env vars were configured and redeployed.
- Verified Contact and Sample Request valid submissions persisted to Supabase through deployed Pages Functions.
- Verified invalid tagged submissions returned validation failures and created no matching lead or audit rows.
- Rechecked the created rows with the Supabase connector using read-only SQL.
- Did not clean up or delete QA rows; they remain available for auditability until Jay explicitly approves cleanup.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Live Target
- Base URL: `https://urblo.pages.dev`
- Cloudflare Pages redeploy after env configuration: `17588cfa-2204-4b95-b6e0-4e3531e366bb`
- Marker: `urblo-live-1780380851058-3c7e6822`

### Verification Results
- Valid enquiry POST: HTTP `201`, response id `1`, `notificationStatus = not_required`.
- Valid sample request POST: HTTP `201`, response sample request id `1`, sample item id `1`, `notificationStatus = not_required`.
- Invalid enquiry POST: HTTP `400 validation_failed`.
- Invalid sample request POST: HTTP `400 validation_failed`.
- Supabase connector readback: `enquiries.id = 1` exists with email `enquiry-urblo-live-1780380851058-3c7e6822@example.com`, matching `source_route`, `notification_status = not_required`, and `turnstile_success = null`.
- Supabase connector readback: `sample_requests.id = 1` exists with email `sample-urblo-live-1780380851058-3c7e6822@example.com`, matching `source_route`, `notification_status = not_required`, and `turnstile_success = null`.
- Supabase connector readback: `sample_request_items.id = 1` exists for `sample_request_id = 1`, `quantity = 2`, and notes including Angola Black, Honed, Live Forms Check, and the marker.
- Supabase connector readback: `admin_audit_events.id = 1` records `enquiry.create` for `enquiries.id = 1` with matching source-route metadata.
- Supabase connector readback: `admin_audit_events.id = 2` records `sample_request.create` for `sample_requests.id = 1` with matching source-route metadata, `itemId = 1`, and `quantity = 2`.
- Supabase connector readback: invalid tagged enquiry rows = `0`, invalid tagged sample request rows = `0`, invalid tagged audit rows = `0`.

### Risks and Gaps
- This proves base deployed persistence and server-side audit creation only.
- `notification_status = not_required` because no email provider variables were configured at that checkpoint; real SMTP2GO notification proof still needs `npm run agent:forms-live -- --allow-writes --allow-email --require-email`.
- `turnstile_success = null` because Turnstile is not configured; bot-protection proof still needs `VITE_TURNSTILE_SITE_KEY`, server-side Turnstile secret, a valid token, and `npm run agent:forms-live -- --allow-writes --require-turnstile --turnstile-token <token>`.
- Browser-key private-row denial was not verified because no browser-safe Supabase key is configured in Cloudflare Pages production.
- Admin lead workflow/export was not verified because first-admin/admin browser configuration is still pending.
- DNS and custom domains were not changed.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-MEDIA-LEADS-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-06-02 (Cloudflare Form Env Check)

### Scope
- Checked Cloudflare Pages environment variable presence for the `urblo` project after Jay configured the two server-side form variables.
- Confirmed production has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Confirmed preview environment variables are currently empty.
- Re-ran no-write deployed Pages smoke.

### Changed Files
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Cloudflare API project readback: pass. Production env includes `SUPABASE_URL` as plain text pointing to the Urblo Supabase project URL and `SUPABASE_SERVICE_ROLE_KEY` as secret text. Secret value was not printed.
- Cloudflare API project readback: preview env vars are empty.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.pages.dev`: pass.
- `GET https://urblo.pages.dev/api/enquiries`: HTTP `405` with `method_not_allowed`, confirming the deployed Function still rejects unsafe method use without writes.

### Risks and Gaps
- Live form persistence was not run because it creates tagged Supabase QA rows and requires Jay approval.
- The standard `npm run agent:forms-live -- --allow-writes --base-url https://urblo.pages.dev` verifier also needs a local service-role verification key, or an approved connector-backed equivalent, to prove created rows and audit metadata.
- Browser-safe Supabase key, Turnstile, email provider, first-admin, and admin live verification inputs remain pending.

### Next Handoff
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-06-02 (Cloudflare Pages Preview Verified)

### Scope
- Verified Jay's Cloudflare Pages GitHub source configuration is now active.
- Confirmed the `urblo` Pages project is connected to `jayyy-3/jayyy-3.github.io`.
- Confirmed the first production deployment completed successfully on `urblo.pages.dev`.
- Ran deployed preview smoke against the live Pages default domain.
- Confirmed no production custom domain or DNS cutover was applied.

### Changed Files
- `AGENTS.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Cloudflare Evidence
- Account: Hunter (`077afae2c6f4e77badadf21e49e58eb7`)
- Pages project: `urblo`
- Project ID: `3c4c5af3-a2a8-4058-bc0e-0ee6e8cfcaca`
- Production URL: `https://urblo.pages.dev`
- Latest deployment: `542c25f4-2e55-437a-abbe-58d427aff48c`
- Deployment URL: `https://542c25f4.urblo.pages.dev`
- Environment: `production`
- Deployment status: `success`
- Commit: `9a1e9c6`
- Git source: `jayyy-3/jayyy-3.github.io`, branch `main`
- Custom domains: none
- Core DNS remains unchanged: apex and `qa` are proxied `A` records to `159.198.65.164`, and `www` is a proxied CNAME to `urblo.com.au`.

### Verification Results
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.pages.dev`: pass. Verified direct refresh for public/admin route shells, unknown-route fallback, deployed assets and route chunks, admin config/profile-gate bundle markers, browser service-role boundary, legacy product/article redirects, and no-write API safe-failure behavior for `/api/enquiries` and `/api/sample-requests`.
- `npm run agent:live-readiness -- --base-url https://urblo.pages.dev`: report-only pass. Cloudflare deployed-preview route/API smoke is ready; live form/admin checks remain missing service-role/browser-safe Supabase variables, first-admin inputs, admin credentials, Turnstile/email variables where applicable, and Jay approval for tagged live writes.
- `curl -I https://urblo.pages.dev`: HTTP `200`.
- Cloudflare API project readback: pass. Source, deployment, build config, and no-custom-domain state match expectations.

### Risks and Gaps
- Live form persistence is still unverified until Cloudflare Pages environment variables include `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_URL` and Jay approves tagged form QA writes.
- Admin auth/live CRUD remains unverified until browser-safe Supabase key configuration, first-admin setup, and active admin credentials are available.
- No production custom domain is attached yet; DNS cutover remains explicitly approval-gated.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-06-02 (Cloudflare Pages Project Creation)

### Scope
- Created the Cloudflare Pages project `urblo` in Hunter's Cloudflare account.
- Set production branch to `main`, build command to `npm run build`, output directory to `dist`, and root directory to `/`.
- Attempted to connect the GitHub repo `jayyy-3/jayyy-3.github.io` during project creation and again through the source endpoint.
- Confirmed DNS and custom domains were not changed.

### Changed Files
- `AGENTS.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Cloudflare Evidence
- Account: Hunter (`077afae2c6f4e77badadf21e49e58eb7`)
- Zone: `urblo.com.au` (`544d6bf99e48f4b36d7abb24f053ab17`)
- Pages project: `urblo`
- Project ID: `3c4c5af3-a2a8-4058-bc0e-0ee6e8cfcaca`
- Default domain: `urblo.pages.dev`
- Deployments: `0`
- Custom domains: none
- Current core DNS remains unchanged: apex and `qa` are proxied `A` records to `159.198.65.164`, and `www` is a proxied CNAME to `urblo.com.au`.

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- Cloudflare API project readback: pass. Project exists with expected branch/build/output settings and no latest deployment.
- Cloudflare API deployment list: pass. `0` deployments.
- Cloudflare API domains list: pass. No custom domains.
- `curl -I https://urblo.pages.dev`: returns Cloudflare `522`, expected while the Pages project has no deployment.

### Risks and Gaps
- GitHub source connection failed twice with Cloudflare API error `8000011`: `There is an internal issue with your Cloudflare Pages Git installation`.
- `wrangler` is available through `npx`, but this workspace is not logged in and no local `CLOUDFLARE_API_TOKEN` is configured, so direct upload could not run.
- Preview smoke cannot run until either the Pages GitHub app is reinstalled/reauthorized for this repo or a local Cloudflare API token is provided for `npx wrangler pages deploy dist --project-name=urblo --branch=main`.
- No DNS record, environment variable, secret, deployment, or production custom domain was changed.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-06-02 (Cloudflare Harness Drift Repair)

### Scope
- Repaired Harness drift after Cloudflare access was rechecked.
- Updated the Cloudflare task from zone-access blocked to actionable Pages project creation.
- Recorded the then-current recheck result that `urblo.com.au` was readable in Hunter's Cloudflare account, no Pages project existed before the subsequent `urblo` project creation, and apex/`www`/`qa` DNS still pointed to the old WordPress target.
- Kept production custom domain and DNS cutover explicitly out of scope until approval.

### Changed Files
- `AGENTS.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass. Harness path checks and Supabase foundation source readiness passed.
- `npm run agent:cloudflare-readiness`: pass. Repo-side Pages build contract, SPA fallback, Function routing scope, headers, API handlers, env placeholders, and deployment runbook remain valid.
- `git diff --check`: pass.

### Risks and Gaps
- No Cloudflare Pages project, deployment, custom domain, DNS record, environment variable, or secret was created or changed in this docs repair.
- Preview smoke still waits for a real `*.pages.dev` URL.
- DNS cutover remains a separate approval-gated launch step.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-06-02 (Projects Archive, Detail, and Media Blocks)

### Scope
- Rebuilt `/projects` as a functional archive with breadcrumb, large title, proof-led intro, project count, sector filters, grid/list view controls, and equal-sized project images.
- Rebuilt `/projects/:slug` as a full-width case-study surface with oversized opening, previous/next project navigation, hero media, Project Information facts, narrative, ordered media blocks, Featured Materials where data supports it, and shared CTA.
- Added `ProjectHotspotImage` as the shared public hotspot renderer and made `ProjectMaterialMap` delegate to it.
- Extended static project data with listing metadata, story copy, ordered media blocks, and Moon Gate hotspot metadata.
- Extended `/admin/projects` source with ordered `project_media` block editing for normal images, hotspot images, and optional YouTube video rows.
- Added draggable/click hotspot placement on the selected admin material map image while keeping numeric x/y percentage fields.
- Prepared the project media block migration for the future live `project_media` block contract. This migration was later applied as `supabase/migrations/20260603142359_project_media_blocks.sql` during the 2026-06-04 approved admin QA run.
- Updated content import and admin verifiers so the static-to-Supabase path understands structured project media blocks.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`
- `scripts/check-content-import-readiness.mjs`
- `src/App.tsx`
- `src/components/projects/ProjectHotspotImage.tsx`
- `src/components/projects/ProjectMaterialMap.tsx`
- `src/data/projectData.ts`
- `src/pages/ProjectDetails.tsx`
- `src/pages/Projects.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `supabase/migrations/20260603142359_project_media_blocks.sql`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/projects`, `/projects/moon-gate-woolley-street`, admin route shells, shared CTA contracts, and current project/capability assets.
- `npm run agent:check`: pass.
- `npm run agent:admin-crud-coverage`: pass, including `project_media` coverage and source assertions for hotspot stage/marker controls, pointer placement handlers, and coordinate-update callbacks.
- `npm run agent:content-import -- --out .tmp/content-import-preview.json`: pass with 115 media candidates, 5 projects, 15 `project_media` rows, 1 `project_material_map`, 2 `project_hotspots`, 0 warnings, and 0 blockers.
- `npm run agent:content-import:apply-sql`: pass; regenerated ignored review/plan/preflight/apply/rollback artifacts under `.tmp/` without live Supabase writes.
- In-app Browser QA at `http://127.0.0.1:4174/projects`, desktop default viewport: page identity `Projects | Urblo`, nonblank `/projects` content, 5 equal `396x297` grid images, Education filter changed count to `02`, List view changed filtered images to equal `120x90`, `0` horizontal overflow, and no framework overlay.
- In-app Browser QA at `390x844`: `/projects` rendered 5 equal `327x245` grid images, Commercial filter changed count to `01`, retained `0` horizontal overflow, and no framework overlay.
- In-app Browser QA for `/projects/moon-gate-woolley-street`: page identity `Project Detail | Urblo`, h1 `Moon Gate | Woolley Street`, Project Information, previous/next navigation, full-width hero/media, 2 hotspot buttons, Featured Materials, `0` horizontal overflow, and no framework overlay. Desktop and mobile hotspot tap/click on `Flamed seating elements` set `aria-pressed="true"` and updated the inspector with New Grey/Flamed metadata, application copy, and Stone Library link.
- In-app Browser QA for `/projects/west-side-place`: page identity `Project Detail | Urblo`, h1 `West Side Place`, Project Information, narrative, previous/next navigation, ordered normal image captions, no hotspot controls as expected, `0` horizontal overflow, and no framework overlay at desktop and `390x844`.
- In-app Browser QA for `/admin/projects`: current no-browser-key environment renders the configuration-required admin auth state without private Projects module content, framework overlay, or horizontal overflow.
- Console health: Browser logs only the existing Cloudflare Turnstile warning `[Cloudflare Turnstile] Unknown parameter passed to api.js: "?ver=...", ignoring.` No task-caused runtime errors were observed.

### Risks and Gaps
- Superseded on 2026-06-04: the project media block migration is now applied and verified in the live Supabase project.
- Current static project data has no client-approved Urblo YouTube video configured, so public browser QA can verify the renderer/source contract but not a live configured video block.
- Live admin drag-and-drop QA is pending browser-safe Supabase config plus an active admin/editor profile. This checkpoint verifies the source implementation and strengthened no-secret admin coverage gate instead.
- Public Projects remain static/file-backed until content import and public read cutover are approved.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-ADMIN-CONTENT-CRUD-001`

## Entry - 2026-06-02 (Homepage Latest Projects Sketch Ratio)

### Scope
- Reworked the homepage Latest Projects layout to match the supplied sketch ratio: upper copy spans two columns, upper feature image spans two columns, and the lower draggable rail shows four portrait project images on desktop.
- Added optional `featureImage` and `featureImageAlt` fields to `HomepageProject` so the upper image can be selected independently from the lower rail image. Current static records use existing second-detail project media where available and fall back to the rail image if a future record omits feature media.
- Hid the rail scrollbar and converted rail labels into image overlays so lower project cards can use the full fixed-height portrait slot.
- Kept the section at exactly one viewport (`100svh`) and preserved stable copy/feature/rail heights across hover selection. Mobile uses a simplified active summary plus matching feature/rail heights.
- Extended `npm run agent:smoke` required assets to include the new homepage feature image paths.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/agent-smoke.sh`
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `src/index.css`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including the new homepage feature image asset paths.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser plugin QA against `http://127.0.0.1:4174/`: pass for page identity, nonblank Project Section DOM, no relevant console warnings/errors, no horizontal overflow, section height equal to viewport height, and matching feature/rail heights in the active in-app viewport. Screenshot capture through Browser timed out, so screenshots were captured with Playwright fallback.
- Playwright Chromium fallback against `http://127.0.0.1:4174/`: pass at `1440x900`, `1366x768`, and `390x844`. Desktop checks confirmed section height equals viewport height, upper feature image height equals lower portrait image height, upper feature image width equals two rail image slots plus gutter, four project rail images are visible at desktop width, `View project` remains visible, hover changes the active project to Moon Gate, section/copy/feature/rail heights remain unchanged after hover, horizontal overflow is `0`, no framework overlay is present, and console issues are `0`. Mobile checks confirmed matching feature/rail heights, visible CTA, draggable rail overflow, no horizontal document overflow, and stable heights after hover.

### Risks and Gaps
- Deployed-preview visual QA remains pending until a Cloudflare Pages preview URL exists.
- Homepage project records remain static/file-backed until approved content import and public Supabase cutover.
- Admin-side selection of homepage feature media should map to the same `featureImage` concept when the CMS/public content migration is approved.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NEXT-PROJECTS-INTAKE-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-06-02 (Homepage Latest Projects Full-Screen Stability)

### Scope
- Reworked the homepage Latest Projects section so the whole section is exactly one viewport high (`100svh`) instead of being content-height driven.
- Fixed hover/tap layout shift by giving the active copy, active image, and thumbnail rail stable measured regions.
- Added short-screen desktop behavior that hides the active summary and places facts beside the CTA so 720-768px high screens do not clip controls.
- Added short mobile behavior that simplifies active copy/facts and shrinks rail media so the one-screen section remains readable at 375x667.
- Added lightweight `data-*` markers for repeatable rendered QA of the active region, active copy, active image, and rail.

### Changed Files
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/homepage/HomepageSections.tsx`
- `src/index.css`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including homepage project assets and public route/CTA contracts.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Playwright Chromium fallback against `http://127.0.0.1:4174/`: pass at `1440x900`, `1366x768`, `1280x720`, `390x844`, and `375x667`. Each viewport reported section height equal to viewport height, section scroll height equal to viewport height, 0 height delta for section/active copy/active image/rail after hover or tap selection, `0` horizontal overflow, no framework overlay, no console errors/warnings, visible section heading, visible CTA, and image above rail.
- In-app Browser plugin QA was attempted first but unavailable because `agent.browsers.list()` returned an empty backend list; Playwright was used as the fallback validation path.

### Risks and Gaps
- Deployed-preview visual QA remains pending until a Cloudflare Pages preview URL exists.
- The homepage project browser remains static data until the approved public content migration switches Projects to Supabase-backed reads.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-06-01 (Homepage Latest Projects Redesign)

### Scope
- Replaced the old black Latest Projects card grid with an image-led selected-project browser based on the supplied sketch and Escofet-style reference rhythm.
- Updated `homepageData.latestProjects` to five project records with location, scope, year, summary, image, and alt text.
- Added a desktop rail that shows four project thumbnails at a time, supports horizontal drag, and lets hover/focus/tap update the upper project detail panel.
- Kept route navigation on the upper `View project` CTA so thumbnail interaction remains selection-only.
- Added smoke coverage for the five controlled project image assets.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/agent-smoke.sh`
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including the five Latest Projects asset paths.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Playwright Chromium against `http://127.0.0.1:4174/`: desktop `1440x900` confirmed `The work speaks.`, the upper `View project` CTA, four fully visible project thumbnails, draggable rail movement from `scrollLeft 0` to `319`, hover selection for Moon Gate, 0 document horizontal overflow, and 0 console errors.
- Playwright Chromium mobile `390x844`: tap selection for Australian Catholic University updated the active thumbnail state, document horizontal overflow was `0`, and console errors were `0`.

### Risks and Gaps
- Final deployed visual QA remains pending until a Cloudflare Pages preview URL exists.
- Project summaries are still static homepage copy and should be reconciled with CMS-sourced public project records during the approved content migration.

## Entry - 2026-06-01 (Homepage Partner Banner Background)

### Scope
- Replaced the homepage `Design-led stone solutions for streetscapes & civil landscapes.` partner-banner background with the supplied West Side Place aerial image.
- Added the controlled optimized asset at `public/media/launch/homepage/partner-banner-west-side-place.jpg`.
- Updated homepage data and smoke coverage so the runtime asset path is guarded.
- Updated Harness notes for the homepage partner-banner image contract.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `public/media/launch/homepage/partner-banner-west-side-place.jpg`
- `scripts/agent-smoke.sh`
- `src/data/homepage.ts`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `asset ok: /media/launch/homepage/partner-banner-west-side-place.jpg`.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Playwright CLI fallback against `http://127.0.0.1:4174/`: desktop `1440x900` and mobile `390x844` both confirmed the partner banner `img` source is `/media/launch/homepage/partner-banner-west-side-place.jpg`, rendered the approved banner copy, had 0 horizontal overflow, and reported 0 console errors.

### Risks and Gaps
- None identified beyond normal deployed-preview QA after Cloudflare Pages preview exists.

## Entry - 2026-06-01 (Capability Statement Service Hub Redesign)

### Scope
- Reworked `/capabilities` from an editorial PDF-like page into a service-style capability hub informed by the supplied Sam the Paving Man capabilities reference.
- Rebuilt the page around the Founder PDF's five capability scopes, approach, lifecycle support, national reach, Urblo advantage, selected-project proof ledger, and email-gated PDF download.
- Rotated the previously sideways site-review image upright before reuse.
- Expanded the Capability Statement source verifier and Harness docs so the concrete capability modules and project ledger remain guarded.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `public/media/launch/capabilities/site-install-review.jpg`
- `scripts/check-capabilities-page-source.mjs`
- `src/pages/CapabilitiesPage.tsx`

### Verification Results
- `npm run agent:capabilities-ui`: pass.
- `npx tsc -b`: pass.
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser plugin QA fallback: the in-app Browser route was unavailable, so Playwright CLI with Chromium was used against local Vite dev server `http://127.0.0.1:4174/capabilities`.
- Browser QA desktop `1440x1000`: hero, capability hub, sticky module navigation, corrected site-review image usage, selected proof, and download section rendered with 0 console errors/warnings.
- Browser QA mobile `390x844`: hero, capability module list, first service detail, and corrected responsive stacking rendered without visible overlap; document horizontal overflow was `0`.

### Risks and Gaps
- Live email capture for the Capability Statement PDF download still depends on the same server-side `/api/enquiries` credential verification as Contact.
- Final deployed visual QA remains pending until a Cloudflare Pages preview URL exists.

## Entry - 2026-06-01 (Homepage Hero Single Terminal Symbol)

### Scope
- Removed the terminal dots from the first two homepage hero lines.
- Kept only the final `DELIVER.` symbol, with the dot in Urblo lime.
- Updated current Harness notes so the hero contract is `DESIGN`, `SOURCE`, `DELIVER.` rather than three punctuated lines.

### Changed Files
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/homepage/HomepageSections.tsx`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser QA through the in-app Browser against local Vite preview on `http://127.0.0.1:4174`: pass for DOM/style checks.
- Browser QA desktop `1440x900`: hero lines are `DESIGN`, `SOURCE`, `DELIVER.`; dot count is 1; the only dot belongs to `DELIVER.` and computes to `rgb(0, 255, 25)`; no framework overlay, console warnings/errors, or horizontal overflow.
- Browser QA mobile `390x844`: hero lines are `DESIGN`, `SOURCE`, `DELIVER.`; dot count is 1; the only dot belongs to `DELIVER.` and computes to `rgb(0, 255, 25)`; no framework overlay, console warnings/errors, or horizontal overflow.
- Browser screenshot capability timed out twice on `Page.captureScreenshot`; Playwright fallback captured `/tmp/urblo-home-hero-single-dot-mobile.png` after waiting for `aria-label="DESIGN SOURCE DELIVER."`, confirming the mobile visual state without the welcome popup.

### Risks and Gaps
- None identified beyond normal deployed-preview QA after Cloudflare Pages preview exists.

## Entry - 2026-06-01 (Homepage Capabilities CTA Inner Ring)

### Scope
- Removed the nested circular icon ring from the homepage proof-section `Our Capabilities` CTA.
- Kept the outer pill button, text, and arrow motion, but removed the small inner circle that made the CTA read as a concentric-circle control.
- Updated the design Harness note for this CTA treatment.

### Changed Files
- `docs/DESIGN.md`
- `docs/WORKLOG.md`
- `src/components/homepage/HomepageSections.tsx`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser QA through the in-app Browser against local Vite preview on `http://127.0.0.1:4174`: pass.
- Browser QA desktop `1440x900`: `Our Capabilities` CTA still routes to `/capabilities`; inner icon wrapper border width is `0px`, border radius is `0px`, and no framework overlay, console warnings/errors, or horizontal overflow were observed.
- Browser QA mobile `390x844`: inner icon wrapper border width is `0px`, border radius is `0px`, and no framework overlay, console warnings/errors, or horizontal overflow were observed.

### Risks and Gaps
- None identified beyond normal deployed-preview QA after Cloudflare Pages preview exists.

## Entry - 2026-06-01 (Homepage Hero Final Dot)

### Scope
- Updated the homepage first-viewport verb stack so `DESIGN.` and `SOURCE.` no longer render green punctuation.
- Kept only the final `DELIVER.` terminal dot in Urblo lime, matching the latest user direction for the hero signal color.
- Updated Harness design/handoff/roadmap/task notes so future agents do not restore green punctuation to all three hero lines.

### Changed Files
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/homepage/HomepageSections.tsx`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser QA through the in-app Browser against local Vite preview on `http://127.0.0.1:4174`: pass.
- Browser QA desktop `1440x900`: computed hero dot colors are `DESIGN.` white, `SOURCE.` white, `DELIVER.` Urblo lime; no framework overlay, console warnings/errors, or horizontal overflow.
- Browser QA mobile `390x844`: computed hero dot colors are `DESIGN.` white, `SOURCE.` white, `DELIVER.` Urblo lime; no framework overlay, console warnings/errors, or horizontal overflow.

### Risks and Gaps
- None identified beyond normal deployed-preview QA after Cloudflare Pages preview exists.

## Entry - 2026-06-01 (Founder Capability Statement Web Page)

### Scope
- Replaced the provisional `/capabilities` page with a web-native version of Natalie Ma's 2026 Capability Statement, using the supplied PDF as the current client-approved capability source where it supersedes older placeholder copy.
- Added the downloadable 2026 Capability Statement PDF plus extracted capability and Natalie imagery under controlled `public/` launch paths.
- Added an email-gated Capability Statement download form that posts to `/api/enquiries` as `Capability statement download`, reveals the direct PDF link only after a successful API response, and reuses the shared Turnstile widget path when `VITE_TURNSTILE_SITE_KEY` is configured.
- Centralized the live CTA definitions used by capability, contact, sample request, and PDF download surfaces in `src/data/siteChrome.ts`, and added `/capabilities` to shared header/footer navigation.
- Updated `/our-story` so Natalie Ma's portrait, role, bio, and founder quote are sourced from the Capability Statement and visible in the team card without requiring hover.
- Updated Harness docs and source checks so future agents treat the Founder statement page, shared CTA data, PDF asset, media assets, and download lead-capture contract as guarded surfaces.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `public/downloads/urblo-capability-statement-2026.pdf`
- `public/media/launch/capabilities/*`
- `public/media/launch/our-story/natalie-ma-2026.jpg`
- `scripts/agent-init.sh`
- `scripts/agent-smoke.sh`
- `scripts/check-capabilities-page-source.mjs`
- `scripts/check-contact-form-ui-source.mjs`
- `scripts/check-harness.mjs`
- `src/App.tsx`
- `src/components/TurnstileField.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/data/siteChrome.ts`
- `src/lib/turnstileConfig.ts`
- `src/pages/CapabilitiesPage.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/OurStory.tsx`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/capabilities`, PDF/media assets, shared Capabilities CTAs, Contact form UI source check, and Capability Statement source check.
- `npm run agent:capabilities-ui`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser QA through the in-app Browser against local Vite preview on `http://127.0.0.1:4174`: pass.
- Browser QA `/capabilities` desktop `1440x900`: correct title/route, nonblank hero, no framework overlay, no console warnings/errors, no horizontal overflow, hero leaves real next-section content visible.
- Browser QA `/capabilities` mobile `390x844`: correct title/route, nonblank hero, no framework overlay, no console warnings/errors, no horizontal overflow, next-section content visible.
- Browser QA Capability Statement form: invalid email shows inline validation, direct PDF link is hidden before success, and a valid email on local static preview shows the expected API-configuration error without revealing the direct PDF link.
- Browser QA `/our-story` desktop and mobile: Natalie image resolves to `public/media/launch/our-story/natalie-ma-2026.jpg`; Natalie role, PDF-sourced bio, and founder quote are visible; no framework overlay, console warnings/errors, or horizontal overflow were observed.

### Risks and Gaps
- Live Capability Statement download lead capture is not proven until the same server-side `/api/enquiries` credentials are configured and Jay approves tagged live form QA writes.
- Real Turnstile proof still requires public `VITE_TURNSTILE_SITE_KEY`, server-side Turnstile secret, a valid token, and the existing approval-gated live verifier.
- Real notification proof still requires Resend sender/recipient configuration and approval-gated live form writes.
- Browser QA was local built-preview only. Cloudflare Pages preview smoke remains pending until a Pages preview URL exists.
- Current web imagery is extracted from the supplied Capability Statement PDF; higher-resolution source photography can replace these assets later without changing the page contract.

### Next Handoff
- Continue live form verification after service-role credentials and Jay approval are available: `npm run agent:forms-live -- --allow-writes`, then the browser-boundary, email, and Turnstile variants when their required inputs exist.
- After Cloudflare Pages preview exists, run `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev` and re-run the live form verifier against that deployed origin after environment variables are configured.

## Entry - 2026-05-29 (Cloudflare Pages Account Read-Only Probe)

### Scope
- Used the Cloudflare API connector in read-only mode to inspect Pages project availability in the two accessible Cloudflare accounts.
- Checked Jay's account and Hunter's account without creating projects, deployments, domains, DNS records, environment variables, or secrets.
- Confirmed the Cloudflare launch blocker is account/project setup rather than a repo-side Pages readiness issue.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Cloudflare API spec lookup: pass. Confirmed the read-only Pages endpoint is `GET /accounts/{account_id}/pages/projects`.
- Jay Cloudflare account (`a9cbf84bf6677e2af8c76b353afe0d9d`) Pages project list: pass. The account is reachable and currently returns 0 Pages projects.
- Hunter Cloudflare account (`077afae2c6f4e77badadf21e49e58eb7`) Pages project list: blocked by Cloudflare API authentication error with the current token.
- `npm run agent:live-readiness`: pass in report-only mode; live Supabase keys, first-admin inputs, admin credentials, preview URL, and tagged-write approvals remain missing/manual-gated.
- `git status --short`: clean before this documentation checkpoint.

### Risks and Gaps
- No Cloudflare Pages project, preview deployment, production environment variable, custom domain, DNS record, or rollback state was created or changed.
- Jay's account appears usable for future Pages setup but has no existing Pages project to smoke-test.
- Hunter's account cannot be used with the current Cloudflare token until access is fixed.
- Creating a Pages project still requires Jay to choose the target account and approve the account-level action.

### Next Handoff
- Ask Jay whether to create the Cloudflare Pages project in Jay's account or resolve Hunter account access first.
- After a preview deployment exists, run `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`.

## Entry - 2026-05-29 (Full Unprofiled Admin Route-Probe Coverage)

### Scope
- Expanded `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` so unauthorized-profile live mode derives its probes from the complete authenticated admin route list.
- The future no-write live QA now requires `/admin`, `/admin/leads`, `/admin/media`, `/admin/settings`, `/admin/stone-library`, `/admin/projects`, `/admin/products`, `/admin/articles`, and `/admin/audit` to stay on `/admin/unauthorized` without private module headings after an unprofiled Auth user signs in.
- Hardened `npm run agent:admin-crud-coverage` so the unauthorized-profile probes cannot quietly fall back to a small route subset.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- Supabase changelog scan: pass. Relevant current notes for this source-only auth verifier checkpoint remain the April 28, 2026 Data/GraphQL API exposure change and May 2026 platform/auth notes; no database implementation change was needed.
- `npm run agent:live-readiness`: pass in report-only mode with live credentials, preview URL, first-admin inputs, and approvals still missing/manual-gated.
- `npm run agent:supabase-foundation-readiness`: pass.
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:admin-auth-browser -- --expect-unauthorized`: pass in plan-only/no-login mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- Live unprofiled browser QA still requires browser-safe Supabase config and a valid Auth user with no active `admin_profiles` row.
- This checkpoint is source/tooling only. It does not prove active-admin login, first-admin bootstrap, live form persistence, admin CRUD writes, Storage upload policy, email/Turnstile behavior, or Cloudflare preview deployment.

### Next Handoff
- When browser-safe Supabase config and an unprofiled Auth test account are available, run `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` to verify every launch-critical admin route stays unauthorized for that account.

## Entry - 2026-05-29 (Admin Runner Credential Input Boundary)

### Scope
- Extended the shared live input validation helper to the admin config browser gate so `--base-url` placeholders or non-origin URLs fail before browser navigation.
- Tightened active-admin and unprofiled admin browser QA readiness so copied email placeholders do not proceed to Supabase Auth login attempts.
- Tightened `admin-crud-live --allow-writes` so live RLS write verification requires either an explicit access token or a real email-shaped admin email/password pair before any live auth/write work can start.
- Updated Harness docs and task state to record the stricter admin runner input boundary.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-config-gate.mjs`
- `scripts/check-admin-crud-live.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- Supabase changelog scan: pass. The relevant hosted-platform note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint is local verifier/docs hardening only.
- `node --check` for edited admin/live-readiness scripts: pass.
- `npm run agent:admin-config-gate -- --base-url '<preview-origin>'`: expected fail before browser navigation with the placeholder base URL error.
- Placeholder active-admin browser QA check with dummy browser key/password: expected fail in strict plan mode with `valid URBLO_ADMIN_EMAIL` missing; no login attempted.
- Placeholder admin CRUD live write check with dummy browser key/password: expected fail before Supabase auth/write work with `valid URBLO_ADMIN_EMAIL + URBLO_ADMIN_PASSWORD` missing.
- Placeholder admin login readiness audit: `npm run agent:live-readiness` reports active-admin, unprofiled, and admin CRUD live write gates as missing valid email-shaped inputs when placeholder emails are supplied.
- `npm run agent:live-readiness`: pass in report-only mode with live inputs still missing/manual-gated.
- `npm run agent:admin-auth-browser`: pass in plan-only/no-login mode.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:first-admin-bootstrap`: pass in plan-only/no-write mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:forms-ui`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run agent:supabase-foundation-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.

### Risks and Gaps
- This is another source-only verifier guard. It still does not provide service-role keys, browser-safe keys, admin credentials, first-admin profile, Cloudflare preview URL, or Jay approvals needed for live completion.

### Next Handoff
- Continue source-only hardening only where it reduces launch risk; otherwise live form/admin proof remains blocked on the external inputs listed by `npm run agent:live-readiness`.

## Entry - 2026-05-29 (Live Verifier Input Boundary)

### Scope
- Added a shared live input validation helper for placeholder detection, first-admin email shape checks, and origin-only base URL normalization.
- Aligned the actual live verifier scripts with the existing readiness-report boundary: `forms-live`, `cloudflare-preview-smoke`, and `admin-auth-browser` now reject copied placeholders or URLs with path/query/hash in `--base-url` before any network or live-write work starts.
- Tightened `admin-live-readiness` so copied first-admin email placeholders are reported as invalid before read-only Supabase checks.
- Updated Harness docs and task state so future handoffs distinguish readiness reporting from executable verifier input validation.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/_lib/live-input-validation.mjs`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-live-readiness.mjs`
- `scripts/check-cloudflare-preview-smoke.mjs`
- `scripts/check-forms-api-live.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- Supabase changelog scan: pass. The relevant hosted-platform note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint is local verifier/docs hardening only.
- `node --check` for the shared helper and all edited verifier scripts: pass.
- `node -e "JSON.parse(...docs/agent/tasks.json...)"`: pass.
- Negative placeholder check: `npm run agent:forms-live -- --allow-writes --base-url '<preview-origin>'` fails before Supabase work with the placeholder base URL error.
- Negative placeholder check: `npm run agent:cloudflare-preview-smoke -- --base-url '<preview-origin>'` fails before route/API requests with the placeholder base URL error.
- Negative placeholder check: `npm run agent:admin-auth-browser -- --base-url '<preview-origin>'` fails before browser navigation with the placeholder base URL error.
- Negative placeholder check: `npm run agent:admin-live-readiness -- --admin-email '<first-admin-email>'` reports `valid URBLO_FIRST_ADMIN_EMAIL or --admin-email` missing, alongside missing keys.
- Pathful URL checks for `forms-live` and `cloudflare-preview-smoke`: pass; both fail before live/network work because the base URL is not an origin-only value.
- `npm run agent:live-readiness`: pass in report-only mode with live inputs still missing/manual-gated.
- `npm run agent:admin-auth-browser`: pass in plan-only/no-login mode.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.
- Plan-only `npm run agent:admin-crud-live`: pass.
- Plan-only `npm run agent:first-admin-bootstrap`: pass.
- `npm run agent:supabase-foundation-readiness`: pass.

### Risks and Gaps
- Live form persistence, first-admin readiness, active-admin browser QA, unprofiled unauthorized browser QA, admin CRUD live writes, Storage upload proof, email/Turnstile proof, and Cloudflare preview smoke remain blocked by the same missing credentials, preview URL, first-admin details, and Jay approvals.
- This checkpoint reduces false-start live verifier risk only; it does not make the CMS operational.

### Next Handoff
- Continue `NOW-FORMS-BACKEND-001`, `NOW-ADMIN-AUTH-RLS-001`, and `NOW-CLOUDFLARE-PAGES-DEPLOY-001` after credentials, first-admin details, preview URL, and write approvals are available.

## Entry - 2026-05-29 (Live Readiness Manual Input Validation)

### Scope
- Tightened `npm run agent:live-readiness` so non-secret manual `--base-url` and `--admin-email` inputs must be real values before readiness reports them as present.
- Copied placeholders such as `<preview-origin>` and `<first-admin-email>`, malformed emails, and preview URLs with path/query/hash now remain missing in text and JSON readiness output.
- Updated Harness docs and task state so future live verification handoffs do not confuse example placeholders with usable Cloudflare preview URLs or first-admin email inputs.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-live-readiness.mjs`

### Verification Results
- Supabase changelog scan: pass. The relevant current hosted-platform note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint is local readiness tooling/docs only.
- Supabase connector read-only sanity: pass. Project `Urblo` is active healthy on Postgres 17.6.1, with 12 launch migrations, 24/24 expected launch tables with RLS, 114 public-schema policies, 12 finish rows, one default site settings row, zero admin/form/content parent rows, and zero security advisor lints.
- `node --check scripts/check-live-readiness.mjs`: pass.
- Placeholder readiness check: pass. `npm run agent:live-readiness -- --base-url '<preview-origin>' --admin-email '<first-admin-email>' --form-writes-approved --first-admin-writes-approved --admin-writes-approved --content-import-approved --content-merge-approved --content-public-cutover-approved --turnstile-token-provided` reports valid preview URL and valid first-admin email as missing.
- Valid override JSON check: pass. `npm run agent:live-readiness -- --json --base-url https://example.pages.dev --admin-email first@example.com --form-writes-approved --first-admin-writes-approved --admin-writes-approved --content-import-approved --content-merge-approved --content-public-cutover-approved --turnstile-token-provided` reports those non-secret values as present while preserving missing secret/session inputs.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:forms-ui`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- Plan-only `npm run agent:admin-auth-browser`: pass.
- Plan-only `npm run agent:admin-crud-live`: pass.
- Plan-only `npm run agent:first-admin-bootstrap`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This prevents false readiness from placeholder/manual input mistakes, but it does not provide the missing service-role key, browser-safe key, first-admin email/profile, admin credentials, Cloudflare preview URL, Turnstile/email secrets, or Jay approvals.
- The admin CMS remains source-ready but not live-operational until the credential-gated form/admin/preview checks run.

### Next Handoff
- Continue `NOW-FORMS-BACKEND-001`, `NOW-ADMIN-AUTH-RLS-001`, and `NOW-CLOUDFLARE-PAGES-DEPLOY-001` after the required credentials, first-admin details, preview URL, and approvals exist.

## Entry - 2026-05-29 (Production Dependency Audit)

### Scope
- Upgraded production-facing dependencies to remove the critical/high production audit path: `react-router-dom` to `^7.16.0`, `swiper` to `^12.2.0`, and `postcss` to `^8.5.15`.
- Ran `npm audit fix` to refresh safe transitive dependency versions in `package-lock.json`; `npm audit --omit=dev --audit-level=critical` now reports zero vulnerabilities.
- Added `tailwindcss/nesting` before Tailwind in `postcss.config.js` so Swiper 12 nested CSS builds cleanly instead of relying on PostCSS warning-tolerant output.

### Changed Files
- `AGENTS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `package-lock.json`
- `postcss.config.js`

### Verification Results
- `npm run build`: pass. The previous Swiper nested-CSS warnings are resolved; Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `npm audit --omit=dev --audit-level=critical`: pass with zero vulnerabilities reported.
- Playwright Chromium homepage carousel render check: pass. The product carousel renders 5 slides, 5 pagination bullets, 2 navigation buttons, and a visible active slide.

### Risks and Gaps
- This reduces production dependency audit risk but does not complete live Supabase form/admin verification.
- Build still reports the existing Browserslist data staleness notice.

### Next Handoff
- Continue live form/admin verification after the required credentials, first-admin details, Cloudflare preview URL, and Jay approvals are available.

## Entry - 2026-05-29 (Live Readiness Docs Guard)

### Scope
- Refreshed live-readiness documentation in `docs/ARCHITECTURE.md`, `docs/CLOUDFLARE_DEPLOYMENT.md`, and `docs/agent/verification.md` so the documented non-secret flags match the current runner.
- Added a Harness assertion so `npm run agent:check` fails if those docs stop mentioning the current approval/readiness flags, including guarded content import/cutover approvals and the Turnstile token readiness flag.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-harness.mjs`

### Verification Results
- `node --check scripts/check-harness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:live-readiness`: pass in report-only mode and still reports missing external credentials/approvals.
- `npm run agent:check`: pass, including the new live-readiness docs flag guard.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run lint`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This closes a documentation/tooling drift only. Live form persistence, first-admin setup, active-admin browser QA, admin CRUD live writes, Storage upload proof, email/Turnstile proof, and Cloudflare preview smoke still require the external inputs reported by `npm run agent:live-readiness`.

### Next Handoff
- Continue source-only hardening where useful, but do not claim CMS completion until live form/admin gates run with credentials and approvals.

## Entry - 2026-05-29 (Cloudflare Env Placeholder Contract)

### Scope
- Expanded `npm run agent:cloudflare-readiness` so it guards the full live-readiness environment placeholder contract across `.env.example` and `docs/CLOUDFLARE_DEPLOYMENT.md`.
- The gate now includes canonical Supabase/Form vars, compatibility aliases, Cloudflare preview URL helpers, first-admin bootstrap email, active-admin login credentials, admin access token, and unprofiled QA credentials.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-cloudflare-pages-readiness.mjs`

### Verification Results
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run lint`: pass.

### Risks and Gaps
- This is repo-side contract hardening only. It does not create the Cloudflare Pages project, set environment variables, produce a preview URL, or verify deployed Pages behavior.
- Runtime build/typecheck/smoke were already green in the immediately preceding admin credential-boundary checkpoint and were not rerun for this docs/tooling-only Cloudflare verifier expansion.

### Next Handoff
- Continue to use `npm run agent:live-readiness` before live form/admin/preview work, and run `npm run agent:cloudflare-preview-smoke -- --base-url <preview-origin>` only after a real Pages preview URL exists.

## Entry - 2026-05-29 (Admin Live Login Credential Boundary)

### Scope
- Tightened `npm run agent:admin-crud-live` so live password login only reads `URBLO_ADMIN_EMAIL`/`URBLO_ADMIN_PASSWORD`, or an explicit `URBLO_ADMIN_ACCESS_TOKEN`.
- Kept `URBLO_FIRST_ADMIN_EMAIL` reserved for first-admin bootstrap/readiness checks so setup identity and live admin session credentials are not conflated.
- Added source coverage so the admin live verifier fails if `URBLO_FIRST_ADMIN_EMAIL` returns as a live-login fallback.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `.env.example`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`

### Verification Results
- Supabase changelog scan: pass. Relevant current note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint is local verifier/docs hardening.
- Supabase connector read-only sanity: pass. The live project reports all 24 expected launch tables, no missing RLS among those tables, 114 public-schema policies, 12 applied launch migrations in the expected set, 12 published finish definitions, one published default `site_settings` row, and zero private/admin/form/import target rows.
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:live-readiness`: pass in report-only mode and still reports missing external credentials/approvals.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- Live admin write proof is still pending browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged QA writes.
- Live form persistence, first-admin setup, email/Turnstile proof, and Cloudflare preview smoke remain blocked by the external inputs listed by `npm run agent:live-readiness`.

### Next Handoff
- Continue source-only hardening only where it meaningfully reduces launch risk. Do not claim the admin CMS is operational until the live form/admin gates run with credentials and approvals.

## Entry - 2026-05-29 (Supabase Foundation Source Readiness Gate)

### Scope
- Added `npm run agent:supabase-foundation-readiness` as a no-secret source verifier for the applied Supabase foundation contract.
- The new gate checks the expected 12 migration files, 24 launch tables including `project_media`, RLS enablement, public-select policies, private-table anonymous revokes, anonymous read-only public grants, baseline seed upserts, the service-role-only Sample Request atomic RPC, Storage bucket/listing hardening, private SECURITY DEFINER helper posture, and normalized admin profile email uniqueness.
- Wired the command into `npm run agent:check` and `npm run agent:init` so future agents cannot silently drop the foundation verifier while live credentials remain unavailable.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-harness.mjs`
- `scripts/check-supabase-foundation-readiness.mjs`

### Verification Results
- Supabase changelog scan: pass. Current relevant breaking-change note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint changes only local source verification.
- `node --check scripts/check-supabase-foundation-readiness.mjs`: pass.
- `npm run agent:supabase-foundation-readiness`: pass.
- `node --check scripts/check-harness.mjs`: pass.
- `npm run agent:check`: pass, including the delegated Supabase foundation source-readiness gate.
- `npm run lint`: pass.
- `git diff --check`: pass.
- `npm run agent:init`: pass and lists `npm run agent:supabase-foundation-readiness`.
- Supabase connector read-only sanity: pass. The live project reports 12/12 expected migrations, 24/24 expected launch tables, no missing RLS among those tables, 12 published finish definitions with 12 distinct keys, one published default `site_settings` row, zero private admin/form rows, and zero imported content rows for media, Stone Library groups, Products, Projects, and Articles.

### Risks and Gaps
- This is source-only. It does not replace read-only Supabase connector sanity, live form persistence, first-admin readiness, authenticated admin browser QA, admin CRUD live writes, Storage upload proof, or Cloudflare preview smoke.
- Live blockers remain unchanged: service-role key, browser-safe Supabase key, first admin email/profile, admin/unprofiled test credentials, Cloudflare preview URL, and Jay approval for tagged live QA writes.

### Next Handoff
- Continue source-only hardening where useful, but treat live form/admin completion as pending until the missing credentials, first-admin details, preview URL, and write approvals are available.

## Entry - 2026-05-29 (Read-Only Supabase Sanity Refresh)

### Scope
- Ran fresh read-only Supabase connector checks against project `npkidywzwddbnfrnxlmo`.
- Confirmed the live database still matches the documented foundation/seed/admin-hardening state before continuing source-only admin work.
- Recorded that the live project still has no first admin profile and no imported/static-to-Supabase content rows, so live admin/form completion remains credential- and approval-gated.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`

### Verification Results
- Supabase migration list: pass. All 12 launch migrations are listed through `sample_request_atomic_insert`.
- Supabase security advisor: pass. Zero security lints returned.
- Supabase SQL sanity: pass. 24 expected public launch tables are present, 24/24 have RLS enabled, and no expected tables are missing.
- Supabase seed sanity: pass. `finish_definitions` has 12 rows and 12 distinct finish keys; published default `site_settings` count is 1.
- Supabase live-state sanity: pass. Active admin profiles, form lead rows, media assets, Stone Library groups, Projects, Products, and Articles all remain at 0 rows.
- No writes, Auth changes, Storage writes, form submissions, or Cloudflare actions were performed.

### Risks and Gaps
- Live form persistence still requires service-role environment configuration and Jay approval for tagged form QA writes.
- Live admin readiness still requires browser-safe Supabase config, first admin email/profile setup, and an unprofiled Auth test account for unauthorized browser QA.

### Next Handoff
- Continue source-only readiness work until local/Cloudflare credentials and approvals are available, then run the live form/admin gates documented in `docs/HANDOFF.md`.

## Entry - 2026-05-29 (Unprofiled Admin Route-Probe Gate)

### Scope
- Extended `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` beyond the first unauthorized landing.
- After an unprofiled Auth user reaches `/admin/unauthorized`, the runner now probes `/admin`, `/admin/leads`, and `/admin/settings` while still signed in and requires each route to stay on the unauthorized shell without private module headings.
- Added source coverage so those unauthorized direct-route probes cannot be silently removed from the admin browser verifier.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-auth-browser -- --expect-unauthorized`: pass in plan-only mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode and now describes the protected-route probes in the unprofiled admin browser QA note.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates were intentionally skipped because this checkpoint changed verifier/docs only, not `src/**` runtime behavior.

### Risks and Gaps
- Live unprofiled browser QA still requires browser-safe Supabase config and a valid Auth user with no active `admin_profiles` row.
- This checkpoint is source/tooling only. It does not create users, profiles, content rows, Storage objects, audit rows, form submissions, or Cloudflare state.

### Next Handoff
- When browser-safe Supabase config and an unprofiled Auth test account are available, run `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` to verify the unauthorized landing and direct-route probes in one no-write browser flow.

## Entry - 2026-05-29 (Admin Browser Sign-Out Gate)

### Scope
- Extended active-admin `npm run agent:admin-auth-browser -- --allow-login --strict` so the no-write browser QA flow checks session exit, not only session entry.
- After authenticated route-shell checks, the runner clicks Sign out and requires the protected route to return to `/admin/login?next=...` without rendering private admin audit content.
- Added source coverage so the sign-out check cannot be silently removed from the admin browser verifier.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-auth-browser`: pass in plan-only mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live sign-out browser QA still requires browser-safe Supabase config and a real active admin email/password.
- This checkpoint does not create rows, upload Storage objects, change Auth users/profiles, verify form persistence, or touch Cloudflare.

### Next Handoff
- When active-admin browser credentials exist, run `npm run agent:admin-auth-browser -- --allow-login --strict` to verify login, route shells, and sign-out behavior in one no-write flow.

## Entry - 2026-05-29 (Unprofiled Admin Browser QA Gate)

### Scope
- Added a no-write unauthorized-profile mode to `npm run agent:admin-auth-browser`.
- `--allow-login --expect-unauthorized --strict` now uses `URBLO_UNPROFILED_EMAIL` and `URBLO_UNPROFILED_PASSWORD` to prove a valid Supabase Auth user without an active `admin_profiles` row lands on `/admin/unauthorized`.
- The check rejects private admin module headings in that unauthorized state and creates no content rows, Storage objects, audit events, Auth users, or admin profiles.
- Added the new gate to `npm run agent:live-readiness`, `.env.example`, docs, and `npm run agent:admin-crud-coverage` source guards.

### Changed Files
- `.env.example`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-auth-browser -- --expect-unauthorized`: pass in plan-only mode.
- `npm run agent:live-readiness`: pass in report-only mode and now reports the unprofiled unauthorized browser QA gate.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-config-gate`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live unauthorized-profile browser QA was not run because this workspace has no browser-safe Supabase key or unprofiled Auth test credentials.
- This checkpoint is source/tooling only. It does not create the first admin, create an unprofiled Auth user, run live admin writes, upload Storage objects, verify form persistence, or touch Cloudflare.

### Next Handoff
- When browser-safe Supabase config and an unprofiled Auth test account are available, run `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` before claiming the unauthorized-profile access state is live verified.

## Entry - 2026-05-29 (First-Admin Email Matching Coverage Guard)

### Scope
- Hardened `npm run agent:admin-crud-coverage` so the first-admin/bootstrap readiness email matching contract cannot silently regress.
- The source gate now fails if first-admin/bootstrap or admin-live readiness goes back to an exact case-sensitive `email` query instead of normalized profile-email matching.

### Changed Files
- `scripts/check-admin-crud-coverage.mjs`
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This is source-only/no-write. It does not create Supabase users/profiles/rows, upload Storage objects, configure credentials, touch Cloudflare, or run live writes.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-29 (First-Admin Email Case Readiness)

### Scope
- Updated the first-admin bootstrap verifier and admin live-readiness verifier so `admin_profiles.email` matching is normalized before comparison.
- This aligns the scripts with the live `admin_profiles_email_ci_unique_idx` database contract, which enforces unique `lower(btrim(email))` values.
- The change prevents a mixed-case manually created admin profile email from being misreported as missing during read-only first-admin readiness.

### Changed Files
- `scripts/bootstrap-first-admin.mjs`
- `scripts/check-admin-live-readiness.mjs`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Supabase connector read-only sanity: 24/24 expected launch tables present, 0 expected launch tables missing RLS, 12 published finish definitions, 1 published default `site_settings` row, 0 active admin profiles, and current selected content/lead target tables still empty.
- `node --check scripts/bootstrap-first-admin.mjs`: pass.
- `node --check scripts/check-admin-live-readiness.mjs`: pass.
- `npm run agent:first-admin-bootstrap`: pass in no-write plan mode.
- `npm run agent:admin-auth-browser`: pass in plan-only mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:live-readiness`: pass in report-only mode; live inputs remain missing/manual-gated.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only/no-write. It did not create a Supabase Auth user, create or change an admin profile, create form/admin/content rows, upload Storage objects, configure credentials, touch Cloudflare, or run live writes.
- Live first-admin/admin verification still requires service-role and browser-safe keys, the first admin email, a real admin session/password or token, and Jay approval for any write path.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-29 (Local Live Verification Secret Handling)

### Scope
- Added a local secret-file section to `docs/CLOUDFLARE_DEPLOYMENT.md`.
- Documented that live verification secrets should go in ignored local env files such as `.env.local` or `.dev.vars`, not chat or committed docs.
- Grouped the variables required for form persistence, browser-key privacy checks, admin readiness, admin browser QA, admin CRUD live writes, email proof, and Turnstile proof.

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is documentation only. It does not configure Cloudflare, create a Supabase Auth user, create an admin profile, run live form writes, send email, verify Turnstile, or run authenticated admin CRUD.

### Next Handoff
- When credentials are available, place them in `.env.local` or `.dev.vars`, run `npm run agent:live-readiness`, then run the specific approval-gated live verifier for the next target.

## Entry - 2026-05-29 (Content Import and Public Cutover Readiness Recheck)

### Scope
- Re-ran the source-only static-to-Supabase content import artifact generation and public cutover readiness checks.
- Wrote ignored review artifacts under `.tmp/` only; no Supabase SQL was applied and no production rows were created.

### Verification Results
- `npm run agent:content-import:apply-sql`: pass.
- Generated dry-run candidates: 115 media assets, 13 stone groups, 15 stone variants, 153 finish capabilities, 53 finish image rows, 6 products, 28 product models, 18 product material defaults, 18 product specs, 5 projects, 41 project facts, 14 project media rows, 2 project material rows, 1 project material map, 2 hotspots, 4 articles, and 95 article blocks.
- Import warnings: 0.
- Import blockers: 0.
- `npm run agent:public-supabase-readiness`: pass.
- Public readiness verified 13 stone groups, 6 products, 5 projects, and 4 articles remain `draft` in the import dry run.
- Public readiness verified 95 draft article blocks use structured extraction instead of placeholder HTML imports.
- Public readiness verified the generated preflight SQL includes Data API role/sequence grant inspection, guarded draft import SQL keeps manual import/merge gates and avoids destructive/publish statements, guarded rollback SQL remains manually destructive-gated and reverse ordered, public RLS policy source remains published-only, anonymous grants remain read-only, public runtime remains static/file-backed, and Cloudflare Functions remain scoped to `/api/*`.

### Risks and Gaps
- These checks do not apply content, publish rows, switch public runtime reads, or verify live admin CRUD.
- Applying `.tmp/content-import-apply.sql`, approving merge/upsert behavior, and cutting over public reads still require Jay approval and live credential/admin verification.

### Next Handoff
- Keep content import artifacts as review-only until import approval is explicit.
- Continue form/admin live verification only after the missing service-role, browser-safe key, first-admin, admin-session, and approval inputs are available.

## Entry - 2026-05-29 (Supabase Read-Only State Re-Audit)

### Scope
- Re-checked the live Supabase project state through read-only connector SQL for project `npkidywzwddbnfrnxlmo`.
- Verified the applied migration list still includes the current launch migrations through `sample_request_atomic_insert`.
- Verified launch table, RLS, seed, Storage bucket, grant, helper, RPC, and empty-content/import-target assumptions before continuing source-only work.

### Verification Results
- Expected launch tables present: 24 of 24.
- Expected launch tables missing RLS: none.
- Published finish definitions: 12.
- Published default `site_settings` row: 1.
- Current launch content and lead row counts for `media_assets`, `stone_groups`, `stone_variants`, `products`, `projects`, `articles`, `enquiries`, `sample_requests`, and `sample_request_items`: all 0.
- Storage buckets: `urblo-public-media` is public with 25 MB limit; `urblo-admin-media` is private with 50 MB limit.
- Public policy count: 114.
- Anonymous write grants on public launch tables: 0.
- Anonymous grants on private admin/lead tables: 0.
- `admin_profiles` rows: 0; active admin profiles: 0.
- `admin_profiles_email_ci_unique_idx`: present.
- `submit_sample_request_with_item(jsonb, jsonb)`: executable by `service_role`, not executable by `anon` or `authenticated`.
- `public.has_admin_role(text[])`: not executable by `anon` or `authenticated`.

### Risks and Gaps
- No active admin profile exists yet, so active-admin browser login, `/admin` CRUD writes, and audit-row write verification remain blocked until Jay confirms the first admin path and credentials are configured.
- The content import target is still empty and public runtime remains static/file-backed; do not apply generated import SQL or cut over public reads without approval.
- Live form persistence remains unverified because service-role environment configuration and tagged live form QA approval are still missing.

### Next Handoff
- Continue source-only readiness where it improves final verification coverage.
- For live progress, configure server/browser Supabase keys and confirm the first admin email, then run the existing read-only and approval-gated live verifiers in the order listed in `docs/HANDOFF.md`.

## Entry - 2026-05-29 (Admin Auth Browser Env Loading)

### Scope
- Updated `npm run agent:admin-auth-browser` so it can read untracked local env files (`.env.local`, `.env`, `.dev.vars`) as well as shell values.
- Added `--env-file <path>` support for an additional local secret source when needed.
- The runner still prints only variable names and sources, never secret values.
- Relaxed the hard `VITE_SUPABASE_URL` requirement because `src/lib/supabaseClient.ts` already defaults to the Urblo Supabase project URL; the live browser auth check only requires a browser-safe key and admin email/password credentials.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-auth-browser.mjs`

### Verification Results
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `npm run agent:admin-auth-browser`: pass in plan-only mode; it scanned no env files in this workspace and attempted no Supabase login.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live login mode remains unrun until browser-safe Supabase config and real active admin email/password credentials exist.
- This checkpoint improves credential input handling only; it does not prove active-admin access, admin writes, form persistence, Storage policy, Cloudflare preview behavior, or public content cutover.

### Next Handoff
- Put browser-safe key and admin QA credentials in an untracked env file or shell, then run `npm run agent:admin-auth-browser -- --allow-login --strict` after first-admin/profile readiness is verified.

## Entry - 2026-05-29 (Admin Auth Browser QA Runner)

### Scope
- Added `npm run agent:admin-auth-browser` as a gated browser login verifier for the configured `/admin` auth shell.
- Default mode is plan-only: it prints required inputs and performs no Supabase login.
- Live mode requires `--allow-login --strict`, browser-safe Supabase config, and `URBLO_ADMIN_EMAIL`/`URBLO_ADMIN_PASSWORD`; it signs in through `/admin/login`, checks authenticated admin route shells, rejects config/unauthorized/login states after authentication, captures screenshots, and creates no content rows, Storage objects, or audit events.
- Added the runner to live-readiness reporting so the no-write browser auth QA gate is visible separately from tagged admin CRUD/live-write verification.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-harness.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `npm run agent:admin-auth-browser`: pass in plan-only mode; no Supabase login attempted.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-config-gate`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode and now reports the new no-write admin auth browser QA command.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live login mode was not run because this workspace still lacks persistent browser-safe Supabase config and real active admin email/password credentials.
- The runner proves authenticated route shells only. It does not prove save/upload/export writes, audit row creation, private Storage policy, form persistence, Cloudflare preview behavior, or public content cutover.

### Next Handoff
- After first-admin/profile setup and browser-safe config exist, run `npm run agent:admin-auth-browser -- --allow-login --strict` before tagged admin CRUD live writes.

## Entry - 2026-05-29 (Repeatable Admin Config-Gate Browser Check)

### Scope
- Added `npm run agent:admin-config-gate` as a repeatable no-secret Firefox browser gate for the built `/admin` shell.
- The new runner starts Vite preview when no `--base-url` is supplied, generates a temporary Playwright spec under `.tmp/`, checks all launch-critical admin routes for `Configuration required`, rejects private admin/module text, captures screenshots, and shuts the preview down.
- Added `playwright` as a dev dependency so the gate does not depend on a global or temporary `npx` cache.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `package-lock.json`
- `scripts/agent-init.sh`
- `scripts/check-admin-config-gate.mjs`
- `scripts/check-harness.mjs`

### Verification Results
- `node --check scripts/check-admin-config-gate.mjs`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-config-gate`: pass; 11 Firefox route checks passed and screenshots were written to `.tmp/admin-config-gate/screenshots`.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This remains no-config browser QA. It does not prove active-admin login, unprofiled-user unauthorized behavior, browser-key RLS writes, audit row creation, Storage upload policy, form persistence, Cloudflare preview behavior, or public content cutover.
- Extra observation: `npm audit --omit=dev --audit-level=critical` still reports existing production dependency advisories, including a critical Swiper advisory that requires a breaking upgrade path. That is not resolved in this admin-gate checkpoint.

### Next Handoff
- Run `npm run agent:admin-config-gate` after admin route/auth-shell changes, before claiming no-config admin route protection remains intact.
- Live admin verification still requires browser-safe Supabase config, a real owner/admin session, first-admin profile readiness, and Jay approval for tagged QA writes.

## Entry - 2026-05-29 (Admin No-Config Route Gate Full Coverage)

### Scope
- Expanded the built-site admin no-config QA evidence from the earlier `/admin`, `/admin/media`, and `/admin/login` spot check to every launch-critical admin route.
- Verified the config-missing gate on `/admin`, `/admin/login`, `/admin/unauthorized`, `/admin/leads`, `/admin/media`, `/admin/settings`, `/admin/stone-library`, `/admin/projects`, `/admin/products`, `/admin/articles`, and `/admin/audit`.
- This checkpoint proves the built admin shell stays fail-closed without browser-safe Supabase configuration; it does not change runtime source, Supabase data, Auth users, Storage, Cloudflare state, or credentials.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- Local preview: `npx vite preview --host 127.0.0.1 --port 4191 --strictPort`.
- Playwright Firefox screenshot checks: pass for `/admin`, `/admin/login`, `/admin/unauthorized`, `/admin/leads`, `/admin/media`, `/admin/settings`, `/admin/stone-library`, `/admin/projects`, `/admin/products`, `/admin/articles`, and `/admin/audit`, each waiting for rendered `Configuration required`.
- Screenshot evidence: `/tmp/urblo-admin-config-required-admin.png`, `/tmp/urblo-admin-config-required-admin-login.png`, `/tmp/urblo-admin-config-required-admin-unauthorized.png`, `/tmp/urblo-admin-config-required-admin-leads.png`, `/tmp/urblo-admin-config-required-admin-media.png`, `/tmp/urblo-admin-config-required-admin-settings.png`, `/tmp/urblo-admin-config-required-admin-stone-library.png`, `/tmp/urblo-admin-config-required-admin-projects.png`, `/tmp/urblo-admin-config-required-admin-products.png`, `/tmp/urblo-admin-config-required-admin-articles.png`, and `/tmp/urblo-admin-config-required-admin-audit.png`.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is built-site no-config browser QA only. It does not prove active-admin login, unprofiled-user unauthorized behavior, browser-key RLS writes, audit row creation, Storage upload policy, form persistence, Cloudflare preview behavior, or public content cutover.
- Live admin verification still requires browser-safe Supabase config, a real owner/admin session, first-admin profile readiness, and Jay approval for tagged QA writes.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`: continue only after browser-safe Supabase config and first-admin/profile inputs exist; then run the read-only readiness and authenticated browser QA paths.
- `NOW-ADMIN-CMS-001`: keep source-only guardrails moving where useful, but do not claim operational admin completion until live admin writes are verified.

## Entry - 2026-05-29 (Admin Destructive-Removal Source Guard)

### Scope
- Hardened `npm run agent:admin-crud-coverage` again so the launch-critical admin source cannot quietly introduce destructive removal behavior.
- The checker now scans `src/pages/admin` and `scripts/check-admin-crud-live.mjs` for Supabase `.delete()` mutations, HTTP `DELETE` requests, destructive RPC names, and visible `Delete`/`Remove` controls.
- This reinforces the existing archive-first removal model while first-admin credentials and live admin QA writes remain unavailable.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated in the current local environment.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only coverage. It does not prove live admin login, browser-key RLS writes, audit row creation, Storage upload policy, form persistence, Cloudflare preview behavior, or public content cutover.
- Live admin CRUD still requires browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged QA writes.

### Next Handoff
- `NOW-ADMIN-CMS-001`: continue source-only guardrails where possible; run `npm run agent:admin-crud-live -- --allow-writes` only after credentials/session/approval exist.
- `NOW-FORMS-BACKEND-001`: live form persistence still needs the service-role key and Jay approval for tagged form QA writes.

## Entry - 2026-05-29 (Admin CRUD State-Coverage Guard)

### Scope
- Hardened `npm run agent:admin-crud-coverage` so it now checks launch-critical admin UI state paths in addition to routes, tables, role gates, audit actions, and archive behavior.
- Mutating admin screens must keep validation feedback and save paths.
- Media/content lifecycle screens must keep publish/archive save paths plus published/archived state controls.
- This keeps the `/admin` source screens closer to the required operational CMS shape while live credentials and first-admin access remain unavailable.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only coverage. It does not prove live admin login, browser-key RLS writes, audit row creation, Storage upload policy, or public content cutover.
- Live admin CRUD still requires browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged QA writes.

### Next Handoff
- `NOW-ADMIN-CMS-001`: continue source-only guardrails where possible; run `npm run agent:admin-crud-live -- --allow-writes` only after credentials/session/approval exist.
- `NOW-ADMIN-AUTH-RLS-001`: first-admin readiness still needs the first admin email plus browser-safe and service-role keys.

## Entry - 2026-05-29 (Cloudflare Preview Bundle/API Safe-Failure Guard)

### Scope
- Hardened the deployed-preview smoke runner so it recursively discovers deployed JS/CSS route chunks instead of checking only the initial HTML asset references.
- Added deployed admin bundle contract checks for the configuration-required state and `admin_profiles` profile gate, plus browser bundle checks against service-role env access patterns.
- Added no-write malformed JSON API safe-failure checks for `/api/enquiries` and `/api/sample-requests`.
- Expanded the Forms API mock wrapper checks so OPTIONS must expose CORS method/header values and malformed JSON returns `400 invalid_json` before any Supabase calls.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-cloudflare-preview-smoke.mjs`
- `scripts/check-forms-api.mjs`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `node --check scripts/check-cloudflare-preview-smoke.mjs`: pass.
- `node --check scripts/check-forms-api.mjs`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:cloudflare-preview-smoke -- --base-url http://127.0.0.1:4184`: pass; local preview mode verified route shells, recursively discovered assets/route chunks, and the admin bundle contract while skipping Cloudflare-only redirect/Function checks.
- `npm run agent:smoke`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated in the current local environment.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only/local-preview hardening. It did not create a Cloudflare Pages project, run against a real `*.pages.dev` URL, create Supabase rows, create Auth users, upload Storage objects, configure credentials, send email, verify Turnstile, or run tagged live QA writes.
- Final deployed preview smoke still requires a Cloudflare Pages preview URL.
- Live form persistence still requires server-side service-role credentials and Jay approval for tagged form QA writes.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`: run `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev` once a Pages preview URL exists.
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live -- --allow-writes` only after service-role credentials exist and Jay approves tagged live form QA writes.
- `NOW-ADMIN-AUTH-RLS-001`: continue first-admin readiness once browser-safe Supabase config, service-role verification key, and the first admin email are available.

## Entry - 2026-05-29 (Content Import Data API Grant Preflight)

### Scope
- Expanded the generated content import preflight SQL so future static-to-Supabase import reviews inspect Data API table grants in addition to RLS and policies.
- Added role matrix checks for `anon`, `authenticated`, and `service_role` table privileges, plus generated-identity sequence usage checks for `authenticated` and `service_role`.
- Hardened `npm run agent:public-supabase-readiness` so the Data API grant matrix cannot be silently removed from the preflight artifact.
- Ran read-only Supabase connector verification against project `npkidywzwddbnfrnxlmo` after reviewing the Supabase 2026-04-28 Data API explicit-grants changelog.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-content-import-readiness.mjs`
- `scripts/check-public-supabase-readiness.mjs`

### Verification Results
- `node --check scripts/check-content-import-readiness.mjs`: pass.
- `node --check scripts/check-public-supabase-readiness.mjs`: pass.
- `npm run agent:content-import:preflight-sql`: pass; regenerated ignored `.tmp/content-import-preflight.sql` with Data API role and sequence grant inspection.
- `npm run agent:public-supabase-readiness`: pass; now verifies the preflight SQL includes grant inspection for `anon`, `authenticated`, and `service_role`.
- Supabase connector read-only grant summary: pass. Current live project has 19/19 public content tables with anon `select`, 5/5 private/admin/lead tables with anon `select` denied, 24/24 tables with anon writes denied, 24/24 tables with authenticated CRUD grants, 24/24 tables with service-role CRUD grants, and 23/23 generated sequences with authenticated/service-role usage grants.

### Risks and Gaps
- This is source/read-only hardening. It did not apply import SQL, create rows, create Auth users, upload Storage objects, configure credentials, or touch Cloudflare state.
- Live form persistence, first-admin readiness, tagged admin CRUD writes, Storage upload proof, email proof, Turnstile proof, content import apply, and public read cutover remain blocked on the existing credential and approval gates.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: live form persistence remains the next credential-gated proof once service-role key and tagged write approval exist.
- `NOW-ADMIN-AUTH-RLS-001`: first-admin readiness still needs browser/service keys and Jay's first-admin email.
- `NOW-ADMIN-CONTENT-CRUD-001`: content import remains draft/no-write until Jay approves import and cutover.

## Entry - 2026-05-29 (Content Import Connector Preflight)

### Scope
- Generated the latest ignored content import preflight bundle with `npm run agent:content-import:preflight-sql`.
- Ran a read-only Supabase connector preflight against project `npkidywzwddbnfrnxlmo` to compare planned static-to-Supabase import rows with the current target table state.
- Verified the current production target remains clean for a future approved draft import: no current rows in import target tables, no current rows in parent conflict-gate tables, RLS enabled across checked seed/import tables, and public-select policy coverage present.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:content-import:preflight-sql`: pass; generated ignored `.tmp/content-import-preview.json`, `.tmp/content-import-plan.md`, and `.tmp/content-import-preflight.sql` with 115 media candidates, 13 stone groups, 15 variants, 153 finish capability rows, 53 finish image rows, 6 products, 28 models, 5 projects, 4 articles, 95 article blocks, 0 warnings, and 0 blockers.
- Supabase connector read-only SQL: pass. Live target has 12 `finish_definitions`, 1 `site_settings` row, and 0 current rows in every content import target table.
- Supabase connector parent conflict-gate check: pass. `media_assets`, `stone_groups`, `products`, `projects`, and `articles` all have 0 current rows, so the generated merge/upsert conflict gate has no current natural-key conflicts.
- Supabase connector RLS/policy check: pass. No missing RLS across checked seed/import tables, and each checked public content table has one public-select policy.
- Supabase security advisor: pass. 0 security lints.

### Risks and Gaps
- This is a read-only/source-only preflight. It did not apply import SQL, merge rows, publish content, switch public runtime reads, create Supabase rows, create Auth users, upload Storage objects, or touch Cloudflare state.
- Actual import remains blocked on Jay approval for the draft import, merge/upsert behavior if preflight ever reports parent conflicts, live admin/auth readiness, and a deliberate public read cutover.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`: keep content import and public read cutover guarded until approval.
- `NOW-ADMIN-CMS-001`: resume live admin verification only after browser-safe Supabase config, first admin, admin session, and write approval exist.
- `NOW-FORMS-BACKEND-001`: live form persistence remains the next credential-gated proof once service-role key and write approval exist.

## Entry - 2026-05-29 (Final Turnstile Public Site-Key Guard)

### Scope
- Hardened `scripts/check-forms-api-live.mjs` so final `--require-turnstile` proof refuses to start unless `VITE_TURNSTILE_SITE_KEY` is configured.
- Kept the existing server-side Turnstile secret and token checks, so the live verifier now proves the public Contact widget path and server verification path are both intentionally configured before tagged live form rows can be created.
- Updated Harness docs and task acceptance so final Turnstile proof cannot be mistaken for a server-only token check.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-forms-api-live.mjs`

### Verification Results
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `SUPABASE_SERVICE_ROLE_KEY=dummy TURNSTILE_SECRET_KEY=dummy node scripts/check-forms-api-live.mjs --allow-writes --require-turnstile --turnstile-token dummy`: expected fail-closed before Supabase reads/writes with missing `VITE_TURNSTILE_SITE_KEY`.
- `SUPABASE_SERVICE_ROLE_KEY=dummy VITE_TURNSTILE_SITE_KEY=dummy node scripts/check-forms-api-live.mjs --allow-writes --require-turnstile --turnstile-token dummy`: expected fail-closed at the next preflight with missing server-side Turnstile secret.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:live-readiness -- --json --form-writes-approved --turnstile-token-provided`: pass in report-only mode; final Turnstile proof still reports missing service key, Turnstile secret, and `VITE_TURNSTILE_SITE_KEY` in the current local environment.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.

### Risks and Gaps
- This is source-only verifier hardening. It does not create Supabase rows, configure Turnstile, verify a real token, send email, create Auth users, upload Storage objects, or touch Cloudflare state.
- Live form persistence and final Turnstile proof still require `SUPABASE_SERVICE_ROLE_KEY`, `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` or `CF_TURNSTILE_SECRET_KEY`, a valid target-environment token, and Jay approval for tagged form QA writes.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: configure service-role key and run `npm run agent:forms-live` after Jay approval.
- `NOW-FORMS-SUPABASE-001`: run final email/Turnstile proof after Resend and Turnstile inputs exist.
- `NOW-ADMIN-AUTH-RLS-001`: continue first-admin readiness once first admin email and keys are available.

## Entry - 2026-05-29 (Content Cutover Readiness Gates)

### Scope
- Expanded `npm run agent:live-readiness` so content import and public read cutover approval gates are visible next to form/admin/Cloudflare live blockers.
- Added no-secret readiness flags for guarded draft content import apply, merge/upsert approval, and public read cutover approval: `--content-import-approved`, `--content-merge-approved`, and `--content-public-cutover-approved`.
- Updated Harness docs so generated `.tmp` import SQL remains clearly no-write review material until Jay approves the live operation.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-live-readiness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; content import artifacts show ready, while live apply and public cutover remain manual-gated without approval flags.
- `npm run agent:live-readiness -- --json --content-import-approved --content-merge-approved --content-public-cutover-approved`: pass in report-only mode; content import/cutover gates show ready when explicit approval flags are supplied.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:check`: pass.
- `npm run lint`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only/no-write. It did not apply content import SQL, merge target rows, publish content, switch public runtime reads, create Supabase rows, create Auth users, upload Storage objects, or touch Cloudflare.
- Real content import apply, any merge/upsert, and public read cutover still require Jay approval, reviewed preflight output, live credentials/session readiness, and a deliberate runtime migration.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Admin Live Dashboard Health Predicate Guard)

### Scope
- Expanded `npm run agent:admin-crud-live` so the future approval-gated live run verifies dashboard health predicates against tagged QA rows before archiving them.
- The staged live proof now covers published media missing metadata, project and project-fact claim review, published Products/Articles missing key media, TBC Stone Library rows, and stale new leads.
- Hardened `npm run agent:admin-crud-coverage` so the dashboard-health live-verifier hooks and dashboard project-fact copy cannot be silently removed.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run agent:smoke`: pass.
- `npm run agent:forms-ui`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated in the current local environment.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:content-import:apply-sql`: pass; wrote ignored `.tmp/` review SQL/artifact files only.
- `npm run agent:public-supabase-readiness`: pass.

### Risks and Gaps
- This is source-only/no-write. It did not run `--allow-writes`, create Supabase rows, create Auth users, upload Storage objects, configure credentials, touch Cloudflare, or verify live admin browser access.
- Final dashboard-health proof still requires browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged live admin QA writes.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Admin Dashboard Health Queue)

### Scope
- Expanded `/admin` dashboard from simple published-row metrics into an operational content health queue.
- Added source-side Supabase count checks for published media missing alt/usage notes, published project and project-fact claim review, published products/articles missing key media, Stone Library TBC rows, and stale new leads older than 48 hours.
- Hardened `npm run agent:admin-crud-coverage` so those dashboard health checks and table references cannot be silently removed.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `src/pages/admin/AdminDashboardPage.tsx`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass after approved local preview-server permission; sandbox-only run failed with `Vite preview did not respond at http://127.0.0.1:4173`.
- `npm run agent:admin-config-gate`: pass for 11 admin routes after approved local preview/browser permission; screenshots written to ignored `.tmp/admin-config-gate/screenshots`.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:forms-ui`: pass.
- `npm run agent:admin-crud-coverage`: pass; Dashboard coverage now includes `media_assets`, `stone_groups`, `projects`, `project_facts`, `products`, `articles`, `enquiries`, and `sample_requests`.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated in the current local environment.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only/no-write. It did not create Supabase rows, create Auth users, run live admin writes, upload Storage objects, send email, verify Turnstile, create Cloudflare state, or configure credentials.
- The dashboard health queue still needs live browser/data QA after browser-safe Supabase config, first-admin profile access, and a real owner/admin session exist.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Content Import Merge Approval Guard)

### Scope
- Added a parent natural-key conflict report to the generated content import preflight SQL.
- Added a separate `urblo.import_merge_approved=true` guard to the generated draft import SQL so existing parent keys in `media_assets`, `stone_groups`, `products`, `projects`, or `articles` require explicit merge/upsert approval in addition to the base import approval.
- Expanded public Supabase readiness checks so the merge gate, manual-comment posture, and guarded parent-table conflict checks cannot be silently removed.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-content-import-readiness.mjs`
- `scripts/check-public-supabase-readiness.mjs`

### Verification Results
- Supabase connector `list_migrations`: pass. 12 migrations are applied through `sample_request_atomic_insert`.
- Supabase connector `execute_sql`: pass. 24/24 expected launch tables exist with RLS enabled, 12 published finish definitions exist, one published default `site_settings` row exists, and private workflow/admin tables remain at 0 rows.
- Supabase security advisor: pass. 0 security lints.
- `node --check scripts/check-content-import-readiness.mjs`: pass.
- `node --check scripts/check-public-supabase-readiness.mjs`: pass.
- `npm run agent:content-import:apply-sql`: pass; wrote ignored `.tmp/` preview, plan, preflight, apply, and rollback artifacts only.
- `npm run agent:public-supabase-readiness`: pass; verified the manual import approval gate, manual merge approval gate, draft-only status posture, and existing rollback/readiness contracts.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated in the current local environment.

### Risks and Gaps
- This is source-only/no-write. It did not apply content rows, merge existing data, roll back data, create Supabase rows, create Auth users, upload Storage objects, touch Cloudflare, configure credentials, or run live form/admin writes.
- Real content import, merge/upsert behavior, rollback execution, public read cutover, and publication still require Jay approval, reviewed target preflight output, credentials, and a deliberate live operation window.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Content Import Rollback SQL Guard)

### Scope
- Added `--rollback-sql-out` support to the static-to-Supabase content import dry run.
- Updated `npm run agent:content-import:apply-sql` so the ignored `.tmp/` review bundle now includes both guarded draft apply SQL and guarded draft rollback SQL.
- The rollback artifact is destructive by nature but fail-closed by default: it aborts unless `urblo.rollback_approved=true` is explicitly set in the transaction, rolls back in reverse dependency order, and targets matching draft/import rows only.
- Expanded public Supabase readiness checks so the rollback artifact cannot lose its manual gate, reverse order, draft targeting, or dry-run row-count summary.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `scripts/check-content-import-readiness.mjs`
- `scripts/check-harness.mjs`
- `scripts/check-public-supabase-readiness.mjs`

### Verification Results
- `node --check scripts/check-content-import-readiness.mjs`: pass.
- `node --check scripts/check-public-supabase-readiness.mjs`: pass.
- `node --check scripts/check-harness.mjs`: pass.
- `npm run agent:content-import:apply-sql`: pass; wrote ignored `.tmp/` preview, plan, preflight, apply, and rollback artifacts only.
- `npm run agent:public-supabase-readiness`: pass; verified the new guarded rollback SQL plus existing draft-only import/readiness contracts.

### Risks and Gaps
- This is source-only/no-write. It did not apply or roll back data, create Supabase rows, delete rows, create Auth users, upload Storage objects, touch Cloudflare, or use credentials.
- Real content import and rollback execution still require Jay approval, a reviewed target preflight, service-role credential review, and a deliberate live operation window.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Contact Turnstile Widget Source Contract)

### Scope
- Added the optional Cloudflare Turnstile widget path to the public Contact form.
- The widget renders only when `VITE_TURNSTILE_SITE_KEY` is configured, blocks submission until a token exists in that mode, sends `turnstileToken` to the existing Pages Function payload, and resets after success or failure.
- Added `VITE_TURNSTILE_SITE_KEY` to the Vite/env contract, `.env.example`, Cloudflare readiness guard, live-readiness reporting, Contact source verifier, and Harness docs.

### Changed Files
- `.env.example`
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `scripts/check-contact-form-ui-source.mjs`
- `scripts/check-live-readiness.mjs`
- `src/pages/ContactPage.tsx`
- `src/vite-env.d.ts`

### Verification Results
- `node --check scripts/check-contact-form-ui-source.mjs`: pass.
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; final Turnstile proof now reports missing `VITE_TURNSTILE_SITE_KEY` alongside the server secret/key and approval/token gates.
- `npm run agent:live-readiness -- --json --form-writes-approved --turnstile-token-provided`: pass in report-only mode; flags clear only the manual approval/token gates and do not replace missing credentials.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including Forms API checks and the Contact form UI source contract.
- Playwright CLI Firefox snapshot on `http://127.0.0.1:4174/contact`: pass. With no `VITE_TURNSTILE_SITE_KEY` configured, the Contact page rendered the normal form, direct email/phone fallback channels, and no Turnstile widget.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is a source-only widget/config checkpoint. It does not create Supabase rows, verify a real Turnstile token, configure the Cloudflare Turnstile site, configure server-side Turnstile secrets, send email, create Auth users, upload Storage objects, or touch Cloudflare state.
- Final Turnstile launch proof still requires `VITE_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` or `CF_TURNSTILE_SECRET_KEY`, a valid target-environment token, service-role credentials, and Jay approval for tagged live form QA writes.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Live Form Email and Turnstile Proof Guards)

### Scope
- Strengthened `scripts/check-forms-api-live.mjs` with explicit final proof flags for real notification and Turnstile behavior.
- Added `--allow-email --require-email` so final live form proof must store `notification_status = 'sent'` for valid enquiry and sample request rows instead of accepting skipped or failed notification states.
- Added `--require-turnstile --turnstile-token <token>` so final live form proof must store `turnstile_success = true` for valid enquiry and sample request rows.
- Expanded `npm run agent:live-readiness` so email and Turnstile proof inputs are reported separately, and updated the Cloudflare runbook/readiness guard to keep the final proof commands visible.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/agent-init.sh`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `scripts/check-forms-api-live.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; final email and Turnstile proof inputs remain missing/manual-gated in the current local environment.
- `npm run agent:live-readiness -- --json --form-writes-approved --turnstile-token-provided`: pass in report-only mode; approval/token readiness flags clear only the relevant manual gates and do not replace missing credentials.
- Expected fail-closed guard: `SUPABASE_SERVICE_ROLE_KEY=dummy node scripts/check-forms-api-live.mjs --allow-writes --require-email` stops before writes because direct handler email proof also requires `--allow-email`.
- Expected fail-closed guard: `SUPABASE_SERVICE_ROLE_KEY=dummy node scripts/check-forms-api-live.mjs --allow-writes --allow-email --require-email` stops before writes because Resend sender/recipient configuration is missing.
- Expected fail-closed guard: `SUPABASE_SERVICE_ROLE_KEY=dummy node scripts/check-forms-api-live.mjs --allow-writes --require-turnstile` stops before writes because a token is missing.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:content-import:apply-sql`: pass; wrote ignored `.tmp/` review/preflight/apply artifacts only.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:init`: pass and now lists the final email/Turnstile proof commands.
- Supabase connector `list_migrations`: pass. 12 migrations are applied through `sample_request_atomic_insert`.
- Supabase connector read-only sanity: pass. 24/24 expected launch tables have RLS enabled; published seeds remain 12 finish definitions and one default site settings row; private workflow/admin tables still have 0 rows.
- Supabase security advisor: pass. 0 security lints.

### Risks and Gaps
- This is source-only verifier hardening. It does not create Supabase rows, send emails, verify a real Turnstile token, upload Storage objects, create Auth users, or touch Cloudflare state.
- Final form completion still requires service-role credentials, browser-safe key for private-row proof, Resend variables, Turnstile secret/token, Cloudflare preview URL for deployed proof, and Jay approval for tagged live form QA writes.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Admin Storage Readback and Anonymous Read Guard)

### Scope
- Strengthened `scripts/check-admin-crud-live.mjs` so the approval-gated `--include-storage` live run no longer proves only private Storage upload success.
- The live verifier now checks the tagged tiny `urblo-admin-media` object can be read back by the signed-in admin and is denied to anonymous browser-key reads through both private and public Storage object endpoints.
- Expanded `scripts/check-admin-crud-coverage.mjs` so the Storage signed-in readback and anonymous-read guards cannot be silently removed.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-live -- --include-storage`: pass in plan-only/no-write mode; plan now includes the private Storage signed-in readback and anonymous-read denial checks.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated, and Storage proof messaging now names signed-in readback plus anonymous-read denial.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:forms-ui`: pass.

### Risks and Gaps
- This is a verifier hardening checkpoint only. It does not upload Storage objects, create Supabase rows, create Auth users, run live admin writes, or touch Cloudflare state.
- Final Storage proof still requires browser-safe Supabase config, a real owner/admin session, Jay approval for tagged live admin QA writes, and `npm run agent:admin-crud-live -- --allow-writes --include-storage`.

### Next Handoff
- `NOW-ADMIN-MEDIA-LEADS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Harness Operational Script Guard)

### Scope
- Hardened `npm run agent:check` so `scripts/check-harness.mjs` verifies the active operational `agent:*` package script map, not only the core harness and Contact UI source check.
- The guarded script map now covers form live/UI checks, admin coverage/live/readiness checks, first-admin bootstrap, live input readiness, Cloudflare readiness/preview smoke, content import, and public Supabase readiness commands.
- Refreshed current no-write Supabase evidence while live credentials remain absent.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-harness.mjs`

### Verification Results
- Supabase connector `list_migrations`: pass. 12 migrations are applied through `sample_request_atomic_insert`.
- Supabase connector `execute_sql`: pass. 24/24 expected public launch tables exist with RLS enabled, 12 published finish definitions exist, one published default site settings row exists, and private workflow/admin tables remain at 0 rows.
- Supabase connector `execute_sql`: pass. `submit_sample_request_with_item(jsonb, jsonb)` is `security invoker` and executable by `service_role` only.
- Supabase security advisor: pass. 0 security lints.
- Supabase performance advisor: reviewed. Remaining INFO/WARN items are expected early-stage unused-index and multiple-permissive-policy notices on new/low-traffic launch tables; do not remove launch-pattern indexes before real import/live admin usage evidence exists.
- `node --check scripts/check-harness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:forms-ui`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; all live form/admin/Cloudflare inputs remain missing or approval-gated in the current local environment.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:content-import:apply-sql`: pass; wrote ignored `.tmp/` review/preflight/apply artifacts only.

### Risks and Gaps
- This is source/docs verification hardening plus read-only external-state evidence. It does not create Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes.
- Live completion still requires service-role and browser-safe Supabase keys, Jay-confirmed first-admin email/profile/session, Cloudflare preview URL, and Jay approval for tagged form/admin QA writes.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-29 (Sample Request Atomic Insert RPC)

### Scope
- Added and applied Supabase migration `sample_request_atomic_insert` for project `npkidywzwddbnfrnxlmo`.
- Added service-role-only RPC function `public.submit_sample_request_with_item(jsonb, jsonb)` so the Pages Function creates a `sample_requests` row and first `sample_request_items` row inside one database transaction.
- Updated `/api/sample-requests` source to call the RPC instead of two separate REST inserts, reducing the risk of a stored sample request without its requested item.
- Updated Forms API mock checks so direct sample request/table item inserts now fail the source contract, and the migration source must retain the service-role-only RPC grants.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `functions/_lib/forms.js`
- `scripts/check-forms-api.mjs`
- `supabase/migrations/202605290003_sample_request_atomic_insert.sql`
- `supabase/migrations/README.md`

### Verification Results
- `node --check functions/_lib/forms.js`: pass.
- `node --check scripts/check-forms-api.mjs`: pass.
- `node scripts/check-forms-api.mjs`: pass; valid sample requests now use `submit_sample_request_with_item`, mock checks fail on direct `sample_requests` / `sample_request_items` insert paths, and the migration source includes the expected service-role-only RPC grant/revoke contract.
- Supabase connector syntax preflight in a rolled-back transaction: pass.
- Supabase connector `apply_migration`: `sample_request_atomic_insert` applied successfully.
- Supabase connector `list_migrations`: `sample_request_atomic_insert` present.
- Supabase connector `execute_sql`: `submit_sample_request_with_item(jsonb, jsonb)` exists, is `security invoker`, uses `search_path=public, pg_temp`, denies execute to `anon` and `authenticated`, and allows execute to `service_role`.
- Supabase connector `execute_sql`: `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items` remain at 0 rows after the DDL-only migration.

### Risks and Gaps
- This fixes source and database write atomicity for the sample request/request-item pair, but still does not prove live form persistence because no service-role key or Jay approval for tagged live form QA writes is available locally.
- Email delivery, Turnstile, deployed Cloudflare Function behavior, and browser-key private-row proof remain pending their documented credentials and approval gates.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Admin Profile Form Duplicate Validation)

### Scope
- Added `/admin/settings` form validation for duplicate Supabase Auth user IDs before creating an admin profile.
- Added `/admin/settings` form validation for duplicate normalized admin profile emails before save, matching the live `admin_profiles_email_ci_unique_idx` database constraint.
- Expanded `npm run agent:admin-crud-coverage` to guard both validation messages.
- Updated Harness docs to record the UI validation layer and remaining live save blockers.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `src/pages/admin/AdminSettingsPage.tsx`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This improves source/UI validation only. Live `/admin/settings` profile saves still require browser-safe Supabase config, a real owner/admin profile, and approved live QA writes.
- It does not replace the live database uniqueness constraint or live first-admin/readiness checks.

### Next Handoff
- `NOW-ADMIN-SETTINGS-CRUD-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-29 (Admin Profile Email Uniqueness)

### Scope
- Added and applied Supabase migration `admin_profile_email_uniqueness` for project `npkidywzwddbnfrnxlmo`.
- Added `admin_profiles_email_ci_unique_idx` on `lower(btrim(email))` so admin profile email lookups stay case-insensitively unambiguous for first-admin bootstrap, admin readiness, and `/admin/settings` profile management.
- Strengthened `scripts/bootstrap-first-admin.mjs` so approved write mode refuses to bootstrap when the target profile email is already linked to a different Supabase Auth user before attempting the upsert.
- Added `npm run agent:admin-crud-coverage` checks for the migration/source contract.
- Updated Harness docs to reflect the applied data integrity constraint and remaining live credential/approval blockers.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/bootstrap-first-admin.mjs`
- `scripts/check-admin-crud-coverage.mjs`
- `supabase/migrations/202605290002_admin_profile_email_uniqueness.sql`
- `supabase/migrations/README.md`

### Verification Results
- Supabase connector `list_migrations`: `admin_profile_email_uniqueness` present.
- Supabase connector `execute_sql`: `admin_profiles_email_ci_unique_idx` exists as a unique index on `lower(btrim(email))`.
- Supabase connector `execute_sql`: duplicate normalized admin profile email groups = 0.
- `node --check scripts/bootstrap-first-admin.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:first-admin-bootstrap`: pass in plan-only/no-write mode.
- `npm run agent:first-admin-bootstrap -- --verify-only --admin-email first@example.com`: expected fail-closed result on missing service-role key.
- `npm run agent:admin-live-readiness -- --admin-email first@example.com`: expected fail-closed result on missing browser-safe and service-role keys.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:forms-ui`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is a live schema hardening migration plus source guard. It does not create a Supabase Auth user, create an admin profile, run first-admin write mode, perform admin CRUD live writes, upload Storage objects, submit live forms, or touch Cloudflare state.
- Live completion still requires service-role and browser-safe Supabase keys, Jay-confirmed first-admin email, Jay approval for first-admin/profile writes, a real owner/admin session, Jay approval for tagged admin/form QA writes, and a Cloudflare preview URL.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Admin Auth Profile Link Readiness Guard)

### Scope
- Strengthened `scripts/bootstrap-first-admin.mjs` so read-only `--verify-only` now fails if the active admin profile is not linked to the matching Supabase Auth user id for the supplied first-admin email.
- Strengthened `scripts/check-admin-live-readiness.mjs` so the read-only admin readiness gate also verifies the matching Auth user/profile link before browser login/save QA.
- Added `npm run agent:admin-crud-coverage` source checks so the Auth/profile link contract cannot be silently removed.
- Kept the checkpoint source-only. No Supabase Auth users, profiles, rows, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/bootstrap-first-admin.mjs`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-live-readiness.mjs`

### Verification Results
- `node --check scripts/bootstrap-first-admin.mjs`: pass.
- `node --check scripts/check-admin-live-readiness.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:first-admin-bootstrap`: pass in plan-only/no-write mode.
- `npm run agent:first-admin-bootstrap -- --verify-only --admin-email first@example.com`: expected fail-closed result on missing service-role key.
- `npm run agent:admin-live-readiness -- --admin-email first@example.com`: expected fail-closed result on missing browser-safe and service-role keys.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:forms-ui`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This catches profile/Auth id mismatch before browser QA, but it still does not create or update any Auth user/profile.
- Live first-admin and active-admin verification still require service-role credentials, browser-safe Supabase key configuration, Jay-confirmed first-admin email, Jay approval for any writes, and a real owner/admin session before tagged admin write QA.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (First Admin Verify-Only Role Guard)

### Scope
- Strengthened `scripts/bootstrap-first-admin.mjs` so read-only `--verify-only` now fails unless the existing active `admin_profiles` row has the planned bootstrap role (`owner` by default, or explicit `--role admin`).
- Added `npm run agent:admin-crud-coverage` source checks so the first-admin verify-only role contract cannot be silently removed.
- Kept the checkpoint source-only. No Supabase Auth users, profiles, rows, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/bootstrap-first-admin.mjs`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `node --check scripts/bootstrap-first-admin.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:first-admin-bootstrap`: pass in plan-only/no-write mode.
- `npm run agent:first-admin-bootstrap -- --verify-only --admin-email first@example.com`: expected fail-closed result on missing service-role key.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:forms-ui`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This prevents a wrong-role first-admin profile from passing the read-only bootstrap check, but it still does not create or update any Auth user/profile.
- Live first-admin bootstrap still requires service-role credentials, Jay-confirmed first-admin email, Jay approval, `--allow-writes`, and matching `--confirm-email`.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Public Supabase Guarded Apply-SQL Readiness)

### Scope
- Strengthened `scripts/check-public-supabase-readiness.mjs` so the no-write public cutover gate now generates and inspects the guarded draft content import SQL, not only the JSON dry-run payload.
- Added source checks that the generated apply SQL keeps the `urblo.import_approved` gate commented by default, still requires runtime approval, contains no destructive statements, contains no publish-status changes, forces imported content status to `draft`, and keeps the SQL verification summary aligned with dry-run plan counts.
- Kept the checkpoint source-only. No Supabase rows, Storage objects, Auth users, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-public-supabase-readiness.mjs`

### Verification Results
- `node --check scripts/check-public-supabase-readiness.mjs`: pass.
- `npm run agent:public-supabase-readiness`: pass; now reports guarded draft apply-SQL safety along with draft-only payload, structured article blocks, public RLS, anon grants, static runtime, and Cloudflare route scope.
- `npm run agent:content-import:apply-sql`: pass; wrote ignored `.tmp/` review/preflight/apply artifacts only.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This strengthens source-only safety before an approved content import. It still does not apply content rows, migrate public reads to Supabase, verify live form persistence, create a first admin profile, run authenticated admin CRUD writes, upload Storage objects, or validate a Cloudflare preview URL.
- Live completion still requires service-role and browser-safe Supabase keys, first-admin email/profile/session, Cloudflare preview URL, and Jay approval for tagged live writes.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Forms Live Audit Metadata Coverage)

### Scope
- Strengthened `scripts/check-forms-api-live.mjs` so approved live form verification checks valid enquiry/sample-request audit rows include the submitted source route metadata.
- Added live verifier checks that invalid enquiry/sample-request payloads create no lead rows and no matching audit events.
- Strengthened `scripts/check-forms-api.mjs` so mock/source Forms API checks guard enquiry and sample-request audit payload entity fields, source route metadata, item id, and quantity.
- Kept the checkpoint source/mock-only. No Supabase rows, Storage objects, Auth users, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-forms-api-live.mjs`
- `scripts/check-forms-api.mjs`

### Verification Results
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `node --check scripts/check-forms-api.mjs`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:check`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This improves source/mock and future live verification coverage. It still does not prove production form persistence until a server-side Supabase service-role key is available and Jay approves tagged live form QA writes.
- Turnstile, email delivery, deployed Cloudflare Function behavior, and private-row browser-key proof remain pending their documented credentials and approval gates.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Admin Live Audit Action Coverage)

### Scope
- Strengthened `scripts/check-admin-crud-live.mjs` so approved live admin CRUD QA writes must produce the exact expected `admin_audit_events` action counts, entity types, entity ids, marker metadata, and verifier source metadata.
- Replaced the previous loose `at least 40 audit rows` check with explicit coverage for Settings, Media, Stone Library, Products, Projects, Articles, Leads, exports, and publish/archive transitions.
- Strengthened `scripts/check-admin-crud-coverage.mjs` so source-only coverage fails if the admin live verifier drops the exact audit action coverage contract.
- Kept the checkpoint source-only. No Supabase rows, Storage objects, Auth users, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:check`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This improves the eventual live admin proof but remains source-only until browser-safe Supabase keys, an owner/admin session, Jay approval for tagged admin QA writes, and optional Storage upload approval are available.
- It does not prove active admin login, form persistence, live CRUD writes, Storage upload, Cloudflare preview deployment, or production DNS.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Admin Browser Secret and Config Gate Coverage)

### Scope
- Strengthened `scripts/check-admin-crud-coverage.mjs` so the source-only admin verifier scans all `src` browser source files for actual Supabase service-role env/client usage patterns instead of checking only `src/lib/supabaseClient.ts`.
- Added machine checks for the admin config-missing state copy, login/unauthorized config handling, and admin-route WelcomePopup suppression.
- Added machine checks that the future `scripts/check-admin-crud-live.mjs` path remains browser-key/RLS based and does not introduce service-role key access.
- Kept the checkpoint source-only. No Supabase rows, Storage objects, Auth users, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API checks, and Contact form UI source checks.
- `npm run agent:check`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only coverage hardening. It does not prove active admin login, first-admin bootstrap, live form persistence, admin CRUD writes, Storage upload, audit row creation, or Cloudflare preview deployment.
- Live completion still requires service-role and browser-safe Supabase keys, first-admin email/profile/session, Cloudflare preview URL, and Jay approval for tagged live writes.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Supabase Read-Only Sanity Snapshot)

### Scope
- Used the Supabase connector in read-only mode to re-check the current Urblo project state after the Forms API wrapper coverage checkpoint.
- Confirmed the production foundation and seed posture still matches the Harness contract before any future live-write verification.
- No SQL migration, DDL, insert, update, delete, Auth action, Storage upload, or Cloudflare action was performed.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`

### Verification Results
- Supabase migration list for project `npkidywzwddbnfrnxlmo`: pass. 10 migrations are applied: foundation schema/hardening/anon grants, baseline seed, admin settings/profile/helper hardening, and media Storage hardening.
- Supabase table/RLS query: pass. 24/24 expected public launch tables exist and have RLS enabled.
- Supabase baseline/private row query: pass. 12 published `finish_definitions`, one published default `site_settings` row, and zero private workflow/admin rows in `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items`.
- Supabase Storage bucket query: pass. `urblo-admin-media` exists as private and `urblo-public-media` exists as public.

### Risks and Gaps
- This is a read-only external-state snapshot. It does not verify live form persistence, first-admin bootstrap, active-admin login, admin CRUD writes, Storage upload, audit row creation, deployed Cloudflare preview behavior, or DNS.
- The first attempted sanity query used stale local assumptions (`site_settings.key` and a 23-table list) and was corrected to the actual schema contract (`site_settings.settings_key` and the 24-table list including `project_media`) before recording this evidence.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-05-29 (Forms API Wrapper Coverage)

### Scope
- Strengthened `scripts/check-forms-api.mjs` so the no-secret Forms API verifier covers the Cloudflare Pages Function endpoint wrappers, not only the shared request handlers.
- Added checks that GET requests return `method_not_allowed`, OPTIONS returns the 204 preflight response without Supabase calls, and invalid Sample Request POSTs fail validation before Supabase calls.
- Kept the checkpoint source-only: no live endpoint, Supabase row, Turnstile, Resend, Cloudflare, or credential access was used.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-forms-api.mjs`

### Verification Results
- `node scripts/check-forms-api.mjs`: pass.
- `node --check scripts/check-forms-api.mjs`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, Forms API wrapper/source checks, and Contact form UI source checks.
- `npm run agent:check`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This strengthens source/mock coverage only. Live Contact and Sample Request persistence still requires server-side `SUPABASE_SERVICE_ROLE_KEY`, optional notification/Turnstile secrets, and Jay approval for tagged live form QA writes.
- Deployed Cloudflare Function behavior still requires a real Pages preview URL before `npm run agent:cloudflare-preview-smoke -- --base-url <preview>` can prove deployed route/API behavior.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (First Admin Bootstrap Audit Guard)

### Scope
- Updated `scripts/bootstrap-first-admin.mjs` so approved `--allow-writes` mode records an `admin_profile.bootstrap` audit event after the first-admin profile upsert.
- The audit event uses `actor_user_id = null` because the bootstrap is a guarded service-role setup operation, and stores target Auth/profile metadata in `metadata`.
- The command now fails if the bootstrap audit event cannot be recorded, instead of silently treating the access-control change as fully verified.
- Strengthened `npm run agent:admin-crud-coverage` so it guards this bootstrap audit source contract.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/bootstrap-first-admin.mjs`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `node --check scripts/bootstrap-first-admin.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:first-admin-bootstrap`: pass in plan-only/no-write mode; no Supabase calls, invites, profile writes, or deletes were attempted.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API/UI source checks.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only first-admin audit hardening. It does not create an Auth user, create or update an admin profile, or verify live audit row creation.
- Live first-admin bootstrap still requires service-role credentials, Jay-confirmed first admin email, Jay approval, `--allow-writes`, and matching `--confirm-email`.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Admin Login Next Target Guard)

### Scope
- Tightened `/admin/login` post-auth redirect handling so it accepts only true admin-console `next` targets: `/admin`, `/admin?*`, or `/admin/*`.
- Blocked login and unauthorized self-loop targets from being used as authenticated redirects.
- Strengthened `npm run agent:admin-crud-coverage` so it guards the login next-target source contract and verifies session bootstrap still calls `supabase.auth.getUser()` before querying an active `admin_profiles` row.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `src/pages/admin/AdminLoginPage.tsx`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API/UI source checks.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only admin auth hardening. It does not prove active admin login, unprofiled-user unauthorized behavior, first-admin bootstrap, live CRUD writes, Storage uploads, audit row creation, or Cloudflare preview deployment.
- Live admin verification still requires browser-safe Supabase config, service-role verification access, first admin email/profile, a real owner/admin session, and Jay approval for tagged live admin QA writes.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-29 (Contact Form UI Source Contract)

### Scope
- Added a no-secret Contact form UI source contract check for the public enquiry and sample-request form.
- The check verifies the main submit flow stays on `/api/enquiries` and `/api/sample-requests`, not a mailto/window-navigation fallback.
- It also verifies inline validation, success, error, submitting, sample-request mode fields, direct email/phone fallback channels, and source-route payload handling.
- Wired the check into `npm run agent:smoke` after the existing Forms API mock coverage.
- Added Harness protection so `npm run agent:check` verifies the `agent:forms-ui` package script exists and `npm run agent:smoke` keeps running the Contact form UI source contract check.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/agent-smoke.sh`
- `scripts/check-contact-form-ui-source.mjs`
- `scripts/check-harness.mjs`

### Verification Results
- `node --check scripts/check-contact-form-ui-source.mjs`: pass.
- `node --check scripts/check-harness.mjs`: pass.
- `npm run agent:forms-ui`: pass.
- Supabase MCP read-only sanity: 10 migrations are present, 24/24 public launch tables have RLS enabled, 12 published finish definitions exist, one published default site settings row exists, and private workflow/admin tables remain at 0 rows.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including Forms API mock checks and the new Contact form UI source contract check.
- `npm run agent:init`: pass and now lists `npm run agent:forms-ui`.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:content-import:apply-sql`: pass; wrote ignored `.tmp/` review/preflight/apply artifacts only.

### Risks and Gaps
- This is source-only UI contract coverage. It does not submit live forms, create Supabase rows, send email, verify Turnstile, run responsive browser QA, or verify Cloudflare deployed endpoints.
- Live Contact/Sample Request persistence still requires server-side `SUPABASE_SERVICE_ROLE_KEY` and Jay approval for tagged live form QA writes.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Admin No-Config Route Gate QA)

### Scope
- Verified the built admin shell still renders the configuration-required gate when no browser-safe Supabase key is configured.
- Checked representative admin routes covering dashboard, protected module, and login entry points.
- Kept the check no-secret and no-write; it did not configure Supabase env, create users, query Supabase, or touch live data.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx vite preview --host 127.0.0.1 --port 4191 --strictPort`: pass; served the current built site locally.
- `npx playwright screenshot --wait-for-selector "text=Configuration required" --wait-for-timeout=500 --viewport-size=1280,800 http://127.0.0.1:4191/admin /tmp/urblo-admin-config-required-dashboard.png`: pass.
- `npx playwright screenshot --wait-for-selector "text=Configuration required" --wait-for-timeout=500 --viewport-size=1280,800 http://127.0.0.1:4191/admin/media /tmp/urblo-admin-config-required-media.png`: pass.
- `npx playwright screenshot --wait-for-selector "text=Configuration required" --wait-for-timeout=500 --viewport-size=1280,800 http://127.0.0.1:4191/admin/login /tmp/urblo-admin-config-required-login.png`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This proves only the config-missing gate for the built local site. It does not prove active admin login, unprofiled-user unauthorized behavior, first-admin bootstrap, live CRUD writes, Storage uploads, or Cloudflare preview deployment.
- Playwright Test was not added as a dependency; the verification used the existing `npx playwright screenshot` CLI.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-05-29 (Cloudflare Preview Route Checklist Alignment)

### Scope
- Aligned the Cloudflare deployment runbook's deployed-preview manual route checklist with the canonical public routes used by the actual preview smoke runner.
- Replaced the stale direct-refresh `/products/primeBlock` checklist item with canonical `/products/prime-block`.
- Added canonical article detail and `/capabilities` direct-refresh checks to the runbook.
- Hardened `npm run agent:cloudflare-readiness` so it fails if those canonical preview route checks drop from the runbook.

### Changed Files
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-cloudflare-pages-readiness.mjs`

### Verification Results
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Source/docs-only deployment readiness alignment. No Cloudflare project, DNS record, Supabase row, Storage object, Auth user, credential, or live write was created or changed.
- Actual deployed-preview smoke still requires a real `*.pages.dev` URL.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Admin Live Publish Archive Verifier)

### Scope
- Strengthened `scripts/check-admin-crud-live.mjs` so the future approval-gated live admin verifier exercises publish-then-archive transitions for public-facing tagged QA rows.
- The live plan now proves create/update/publish/archive more directly before the final anonymous browser-key invisibility check.
- Hardened `scripts/check-admin-crud-coverage.mjs` so source coverage fails if the live verifier drops the public-facing publish actions.
- Updated Harness docs to align the live admin verifier contract with the launch-critical non-destructive lifecycle.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode and now lists publish-then-archive public-facing QA checks.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Source/docs-only verifier hardening. No Supabase rows, Storage objects, Auth users, Cloudflare state, credentials, or live writes were created or changed.
- The publish-then-archive proof will only execute after browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged live admin QA writes exist.

### Next Handoff
- `NOW-ADMIN-CMS-001`
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-29 (Admin Archive Contract Verifier Guard)

### Scope
- Hardened `npm run agent:admin-crud-coverage` so it now checks the admin archive/removal contract in `docs/agent/tasks.json`, `docs/ADMIN_IA_ACCESS.md`, `docs/SUPABASE_SCHEMA.md`, and `scripts/check-admin-crud-live.mjs`.
- The verifier now fails if the launch-critical admin CMS acceptance drifts back toward physical-delete wording instead of create/update/publish/archive plus approval-gated destructive policy.
- Updated Harness docs that describe admin CRUD coverage.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:check`: pass.
- `npm run lint`: pass.
- `git diff --check`: pass.
- Supabase MCP read-only sanity: 10 migrations are present, 24/24 expected public launch tables have RLS enabled, 12 published finish definitions exist, one published default site settings row exists, and `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items` remain at 0 rows.

### Risks and Gaps
- Source/docs-only guard. No Supabase rows, Storage objects, Auth users, Cloudflare state, credentials, or live writes were created or changed.
- Live form/admin verification remains blocked by missing service-role key, browser-safe key, first admin email/profile/session, Cloudflare preview URL, and Jay approval for tagged writes.

### Next Handoff
- `NOW-ADMIN-CMS-001`
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-29 (Admin Archive/Delete Contract Alignment)

### Scope
- Aligned admin CMS task acceptance with the implemented launch removal model: create/update/publish/archive is in scope; physical delete controls remain approval-gated until Jay approves a retention/destructive-delete policy.
- Added the same non-destructive archive contract to the admin IA, Supabase schema, architecture, roadmap, and handoff docs so future live admin QA does not interpret CRUD as permission to delete production rows.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- `npm run agent:check`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `git diff --check`: pass.

### Risks and Gaps
- Docs-only contract alignment. No Supabase rows, Storage objects, Auth users, Cloudflare state, credentials, or live writes were created or changed.
- Live form/admin verification remains blocked by missing service-role key, browser-safe key, first admin email/profile/session, Cloudflare preview URL, and Jay approval for tagged writes.

### Next Handoff
- `NOW-ADMIN-CMS-001`
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-29 (Admin Storage Live Readiness Gate)

### Scope
- Added a distinct `npm run agent:live-readiness` check for the final media upload policy proof: `npm run agent:admin-crud-live -- --allow-writes --include-storage`.
- Hardened `npm run agent:cloudflare-readiness` so the Cloudflare deployment runbook must keep the Storage-inclusive admin live verification command.
- Updated Harness docs so media Storage upload proof is not hidden behind the general admin CRUD/audit live check.
- Corrected stale architecture risk wording that still implied broader admin content CRUD source screens were missing; the current blocker is live save verification, approved content import, and public read cutover.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-live-readiness.mjs`: pass.
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- `npm run agent:live-readiness -- --json`: pass and includes `admin-crud-live-storage`.
- `npm run agent:live-readiness`: pass in report-only mode and lists the new `Tagged admin media Storage upload policy` check as missing/manual-gated until browser-safe key, owner/admin session, and Jay approval exist.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:check`: pass.
- `npm run lint`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Source-only readiness hardening. No Supabase rows, Storage objects, Auth users, credentials, Cloudflare state, or live writes were created or changed.
- Final media upload proof still requires browser-safe Supabase config, a real owner/admin session, Jay approval for tagged admin QA writes, and `npm run agent:admin-crud-live -- --allow-writes --include-storage`.

### Next Handoff
- `NOW-ADMIN-MEDIA-LEADS-001`
- `NOW-ADMIN-CMS-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-05-29 (Cloudflare First Admin Approval Gate Guard)

### Scope
- Updated the Cloudflare deployment runbook so admin browser QA setup includes the guarded first-admin path:
  - read-only verify: `npm run agent:first-admin-bootstrap -- --verify-only --admin-email <first-admin-email>`;
  - write/invite path: `npm run agent:first-admin-bootstrap -- --allow-writes --admin-email <first-admin-email> --confirm-email <first-admin-email>` only after Jay approval.
- Hardened `npm run agent:cloudflare-readiness` so the runbook must retain `--first-admin-writes-approved`, the first-admin write command, and the Jay approval language.

### Changed Files
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-cloudflare-pages-readiness.mjs`

### Verification Results
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `npm run lint`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- Source-only runbook/readiness hardening. No Cloudflare project, DNS, secrets, Supabase users, profiles, rows, Storage objects, or live writes were created or changed.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (First Admin Write Readiness Gate)

### Scope
- Added a no-secret `npm run agent:live-readiness` check for the approval-gated first-admin profile/invite write path.
- The readiness report now separates read-only first-admin verification from `npm run agent:first-admin-bootstrap -- --allow-writes --admin-email <first-admin-email> --confirm-email <first-admin-email>`.
- Added `--first-admin-writes-approved` as a readiness-only manual gate flag; it does not replace service-role credentials, `--allow-writes`, or `--confirm-email`.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:live-readiness`: pass in report-only mode and now lists the first-admin profile/invite live write gate.
- `npm run agent:live-readiness -- --first-admin-writes-approved`: pass in report-only mode and clears only the first-admin manual gate while preserving missing credential/email reporting.
- `npm run agent:live-readiness -- --json --first-admin-writes-approved`: pass and exposes the new `first-admin-bootstrap-write` check in JSON output.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Supabase MCP read-only sanity: 10 migrations present, 24/24 expected launch tables have RLS enabled, 12 published finish definitions, one published default site settings row, and 0 rows in `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items`.

### Risks and Gaps
- Source-only readiness hardening. No Supabase users, profiles, rows, Storage objects, Cloudflare state, credentials, or live writes were created or changed.
- The first-admin live write path still requires Jay approval, a service-role key, `--allow-writes`, and matching `--confirm-email`.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-05-29 (Agent Init Forms Live Command)

### Scope
- Updated `npm run agent:init` output so the useful command list shows the write-gated live form verifier command: `npm run agent:forms-live -- --allow-writes`.
- This keeps the startup briefing aligned with the new forms live write-mode guard.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`
- `scripts/agent-init.sh`

### Verification Results
- `npm run agent:init`: pass and now lists `npm run agent:forms-live -- --allow-writes`.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Source-only Harness usability update. No live writes, credentials, or Cloudflare changes.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Forms Live Write-Mode Guard)

### Scope
- Hardened `scripts/check-forms-api-live.mjs` so live form verification refuses to create tagged Supabase rows unless `--allow-writes` is supplied.
- Updated `scripts/check-live-readiness.mjs` and `scripts/check-cloudflare-pages-readiness.mjs` so readiness and deployment docs point to the executable write-gated command forms.
- Updated Harness docs to make the live form proof require three separate conditions: Jay approval, `--allow-writes`, and the required Supabase credentials.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `scripts/check-forms-api-live.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `npm run agent:forms-live`: expected fail before Supabase calls because `--allow-writes` is absent.
- `npm run agent:live-readiness`: pass in report-only mode and now lists `--allow-writes` form commands plus the manual approval gate.
- `npm run agent:live-readiness -- --form-writes-approved`: pass in report-only mode and clears only the form approval gate while preserving missing credential reporting.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- This is source-only write-safety hardening. It does not verify live form persistence and creates no Supabase rows.
- Future live form verification must run with `npm run agent:forms-live -- --allow-writes` only after Jay approves tagged live form QA writes.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Cloudflare Runbook Approval Gate Guard)

### Scope
- Hardened `npm run agent:cloudflare-readiness` so the Cloudflare runbook must keep the manual approval gates for tagged live form and admin QA writes.
- The verifier now fails if `docs/CLOUDFLARE_DEPLOYMENT.md` drops `--form-writes-approved`, `--admin-writes-approved`, or the Jay approval language around those live-write checks.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-cloudflare-pages-readiness.mjs`

### Verification Results
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- Source-only readiness hardening. It does not create a Cloudflare preview, configure secrets, or run live Supabase writes.
- Live form/admin verification still waits for keys, first-admin/profile inputs, preview URL, and Jay approval.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Live Readiness Form Write Approval Gate)

### Scope
- Refined `npm run agent:live-readiness` so tagged live form QA writes are explicitly approval-gated before local/direct, deployed, or private-boundary form persistence checks are run.
- Added `--form-writes-approved` as the non-secret readiness flag for Jay approval, matching the existing admin live-write approval pattern.
- Updated Harness docs so future agents do not treat service-role credentials alone as sufficient permission to create tagged live enquiry/sample-request rows.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:live-readiness`: pass in report-only mode and reports the live form commands as manually gated until Jay approval is supplied.
- `npm run agent:live-readiness -- --form-writes-approved`: pass in report-only mode and clears only the form approval gate while preserving missing service-role/browser-safe credential reporting.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- This is a no-secret, no-write readiness hardening change only. It does not verify live form row creation.
- Live form persistence remains blocked until a server-side service-role key is configured and Jay approves tagged form QA writes.
- Final private-row proof still requires both service-role and browser-safe keys plus `npm run agent:forms-live -- --require-browser-boundary`.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-29 (Cloudflare Forms Boundary Runbook)

### Scope
- Updated `docs/CLOUDFLARE_DEPLOYMENT.md` so the Cloudflare preview/production handoff includes `npm run agent:forms-live -- --require-browser-boundary` after both service-role and browser-safe Supabase keys are configured.
- Strengthened `scripts/check-cloudflare-pages-readiness.mjs` so repo-side Cloudflare readiness fails if the deployment runbook drops that final private-row form proof command.
- No Supabase rows, Auth users, Storage objects, credentials, Cloudflare state, or live writes were created or changed.

### Changed Files
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-cloudflare-pages-readiness.mjs`

### Verification Results
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- This is a runbook/source readiness checkpoint only. It does not create a Cloudflare Pages project, configure environment variables, run deployed preview smoke, or submit live form rows.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`: create/verify the Pages preview URL, then run `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`.

## Entry - 2026-05-29 (Live Forms Private Lead Boundary)

### Scope
- Strengthened `scripts/check-forms-api-live.mjs` so live form verification checks created private enquiry, sample request, and sample item rows against anonymous browser-key reads whenever a browser-safe Supabase key is available.
- Added `--require-browser-boundary` so final launch proof can require `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY` in addition to the service-role key.
- Updated `scripts/check-live-readiness.mjs` to report readiness for `npm run agent:forms-live -- --require-browser-boundary`.
- No Supabase rows, Auth users, Storage objects, credentials, Cloudflare state, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-forms-api-live.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:live-readiness`: pass in report-only mode and now reports the missing inputs for `npm run agent:forms-live -- --require-browser-boundary`.
- `npm run agent:forms-live`: expected credential-gated fail before Supabase calls because no local service-role key is configured.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only no-write mode.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- Supabase MCP read-only private row count check: pass. `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items` remain at 0 rows.

### Risks and Gaps
- The private form-row browser-key boundary runs only after service-role and browser-safe keys are configured.
- Live form persistence, first-admin setup, active-admin browser QA, Storage upload, and Cloudflare preview smoke remain blocked by credential/account inputs.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live`, then `npm run agent:forms-live -- --require-browser-boundary`, after service-role and browser-safe keys are configured.

## Entry - 2026-05-29 (Admin CRUD Live Private Lead RLS Guard)

### Scope
- Strengthened `scripts/check-admin-crud-live.mjs` so the approval-gated live write verifier will also prove tagged private lead QA rows are not anonymously readable through browser-key access.
- The live run now checks tagged `enquiries`, `sample_requests`, and `sample_request_items` rows after authenticated RLS writes, accepting either zero visible rows or an expected deny response.
- Strengthened `scripts/check-admin-crud-coverage.mjs` so source coverage fails if the private-lead browser-key boundary guard is removed from the live verifier.
- No Supabase rows, Auth users, Storage objects, credentials, Cloudflare state, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only no-write mode and includes the private-lead browser-key boundary check in the printed live plan.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- Supabase MCP read-only private row count check: pass. `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items` remain at 0 rows.

### Risks and Gaps
- The new private-lead boundary check executes only in `--allow-writes` mode after browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged QA writes exist.
- Live form persistence, first-admin setup, active-admin browser QA, Storage upload, and Cloudflare preview smoke remain blocked by credential/account inputs.

### Next Handoff
- `NOW-ADMIN-CMS-001`: run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged live QA writes and a real owner/admin session exists.
- `NOW-FORMS-BACKEND-001`: configure service-role key and run `npm run agent:forms-live`.

## Entry - 2026-05-29 (Admin CRUD Live Public RLS Invisibility)

### Scope
- Strengthened `scripts/check-admin-crud-live.mjs` so the approval-gated live write verifier will also prove tagged public-content QA rows are not anonymously visible after they are left draft/archived.
- The live run now uses browser-key anonymous readback for tagged `site_settings`, `media_assets`, `stone_groups`, `products`, `projects`, and `articles` rows after authenticated RLS writes.
- Updated Harness docs so future live admin QA treats public invisibility as part of the tagged write proof, not a separate assumption.
- No Supabase rows, Auth users, Storage objects, credentials, Cloudflare state, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-live.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only no-write mode and includes the public-RLS invisibility check in the printed live plan.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- The new anonymous readback runs only in `--allow-writes` mode after browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged QA writes exist.
- Live form persistence, first-admin setup, active-admin browser QA, Storage upload, and Cloudflare preview smoke remain blocked by credential/account inputs.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`: run first-admin verify/bootstrap and active admin readiness after keys and first admin email are available.
- `NOW-ADMIN-CMS-001`: run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged live QA writes and a real owner/admin session exists.

## Entry - 2026-05-29 (Admin Readiness Browser-Key Boundary)

### Scope
- Strengthened `scripts/check-admin-live-readiness.mjs` so the read-only admin readiness gate now uses the configured browser-safe Supabase key, not just the service-role key.
- The runner now verifies published `site_settings` and `finish_definitions` are readable through the browser-key anonymous boundary, while `admin_profiles` returns no private rows or an expected deny response without an authenticated admin session.
- Updated Harness docs so future agents know `agent:admin-live-readiness` proves the browser-key public/private boundary before active-admin browser QA.
- No Supabase rows, Auth users, Storage objects, credentials, Cloudflare state, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-admin-live-readiness.mjs`: pass.
- `npm run agent:admin-live-readiness -- --admin-email first@example.com`: expected credential-gated fail before Supabase calls because browser-safe and service-role keys are not configured.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only no-write mode.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- The new browser-key boundary checks will execute only after `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY` and a service-role key are configured.
- Active-admin login, first-admin bootstrap, live form persistence, live admin CRUD writes, Storage upload, export audit rows, and Cloudflare preview smoke remain blocked by the same credential/account inputs.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: configure service-role key and run `npm run agent:forms-live`.
- `NOW-ADMIN-AUTH-RLS-001`: after first admin email and keys are available, run first-admin verify/bootstrap, then `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>`.
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`: run deployed preview smoke after a Cloudflare Pages preview URL exists.

## Entry - 2026-05-29 (Supabase Read-Only Launch Sanity)

### Scope
- Ran a read-only Supabase connector sanity pass against project `npkidywzwddbnfrnxlmo`.
- Verified the live project still matches the expected pre-credential launch state after the source-only admin/import verifier checkpoints.
- No migrations, SQL writes, table rows, Storage objects, Auth users, Cloudflare state, credentials, or local runtime source were changed.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`

### Verification Results
- Supabase migration list: pass. 10 launch migrations are present, ending with `security_definer_private_helpers`.
- Supabase table/RLS check: pass. 24 expected public launch tables exist and all 24 have RLS enabled.
- Supabase policy helper check: pass. 99 checked policy expressions use `private.has_admin_role(...)`; 0 use `public.has_admin_role(...)`.
- Supabase helper privilege check: pass. `anon` and `authenticated` have no direct routine privileges on exposed public admin helper functions.
- Supabase seed/private-row check: pass. 12 published `finish_definitions`, 1 published default `site_settings` row, and 0 rows in `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items`.
- Supabase Storage check: pass. `urblo-public-media` and `urblo-admin-media` buckets exist with expected public/private bucket posture, and four authenticated `storage.objects` policies are present.

### Risks and Gaps
- This checkpoint is read-only evidence. It does not verify live form persistence, first-admin setup, active-admin login, admin CRUD writes, Storage upload, audit row creation, or Cloudflare preview deployment.
- The live project intentionally still has zero private workflow rows because service-role form verification and first-admin bootstrap have not run.

### Next Handoff
- Continue source-only verification hardening while credentials are unavailable.
- Once credentials are available, run `npm run agent:forms-live`, first-admin verify/bootstrap, admin live readiness, and approval-gated tagged admin writes in the documented order.

## Entry - 2026-05-29 (Admin Article Structured Authoring Coverage)

### Scope
- Extended `scripts/check-admin-crud-coverage.mjs` so the admin source-only gate now explicitly verifies structured article authoring guardrails.
- The verifier checks that `/admin/articles` exposes every approved `article_blocks.block_type` from the schema as a block type option.
- The verifier fails if raw HTML/newsletter authoring helpers such as `dangerouslySetInnerHTML`, `rawHtml`, or newsletter HTML fields appear in `AdminArticlesPage`.
- The verifier also guards the existing JSON and published-block validation copy so published blocks continue requiring structured content rather than empty payloads.
- No runtime article rendering, Supabase rows, Storage objects, Cloudflare state, credentials, or approved article copy were changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API mock checks.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is source-only verifier hardening. It does not prove live article save/publish flows, live audit rows, or active admin access.
- `/admin/articles` still uses a JSON editor for block content. That is acceptable for the current operational source screen, but final customer handoff may still need friendlier block-specific forms.
- Live admin article CRUD remains blocked until browser-safe Supabase config, a first admin profile, a real admin session, and Jay approval for tagged live writes exist.

### Next Handoff
- Continue source-only admin/import verifier hardening while credentials are unavailable.
- Run live article CRUD through `npm run agent:admin-crud-live -- --allow-writes` only after the approved credential/session path exists.

## Entry - 2026-05-29 (Public Supabase Article Block Readiness Guard)

### Scope
- Extended `scripts/check-public-supabase-readiness.mjs` so the public cutover gate now verifies the article structured import shape, not only draft/public-boundary status.
- The verifier now fails if `article_blocks` regress to one placeholder per article, if legacy placeholder migration status returns, if image blocks are missing or not linked to `media_assets`, if shared newsletter/social images leak in, or if newsletter footer/contact artifacts appear in block text.
- The verifier also checks rich-text claim-review metadata: rich text blocks need `claimReviewStatus`, and any block with `reviewFlags` must stay `needs_review`.
- No Supabase rows, Storage objects, Cloudflare state, credentials, public runtime code, or approved article copy were changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-public-supabase-readiness.mjs`

### Verification Results
- `node --check scripts/check-public-supabase-readiness.mjs`: pass.
- `npm run agent:content-import`: pass with 115 media candidates, 4 articles, 95 article blocks, 0 warnings, and 0 blockers.
- `npm run agent:content-import:apply-sql`: pass; generated ignored JSON, Markdown, preflight SQL, and guarded draft apply SQL artifacts.
- `npm run agent:public-supabase-readiness`: pass; it now reports 95 structured draft article blocks plus the existing draft-only/public-boundary checks.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API mock checks.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is a source-only regression guard. It does not apply import SQL, publish article blocks, create credentials, verify live admin saves, or migrate public article runtime to Supabase.
- Article source copy remains draft-only and claim-review gated. Do not treat extracted newsletter copy as approved public content without Jay/content review.
- Live completion still requires service-role form verification, first-admin/profile setup, browser-safe Supabase config, a real admin session, tagged admin write approval, and Cloudflare preview deployment.

### Next Handoff
- Continue source-only import/public-read preparation while credentials are unavailable.
- If credentials become available, run the existing live path in order: `npm run agent:forms-live`, first-admin readiness/bootstrap verification, admin live readiness, plan-only admin CRUD live verifier, then approval-gated tagged live writes.

## Entry - 2026-05-29 (Article Structured Import Draft Blocks)

### Scope
- Expanded `scripts/check-content-import-readiness.mjs` so the no-write static-to-Supabase import prepares draft structured article blocks from legacy newsletter HTML.
- The importer now extracts source-ordered `rich_text`, `image`, `cta`, and `project_spotlight` blocks, links image blocks to `media_assets` through `media_source_url`, and skips newsletter footer/contact/social artifacts.
- Claim-sensitive source text is not rewritten in this import path; it remains draft-only and carries `reviewFlags` plus `claimReviewStatus` metadata for later editorial review.
- No Supabase rows, Storage objects, Cloudflare state, credentials, public runtime code, or approved copy were changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-content-import-readiness.mjs`

### Verification Results
- `node --check scripts/check-content-import-readiness.mjs`: pass.
- `npm run agent:content-import`: pass with 115 media candidates, 4 articles, 95 article blocks, 0 warnings, and 0 blockers.
- `npm run agent:content-import -- --out .tmp/content-import-preview.json`: pass; local ignored review artifact confirms per-article block extraction and review flags.
- `npm run agent:content-import:apply-sql`: pass; generated ignored JSON, Markdown, preflight SQL, and guarded draft apply SQL artifacts.
- `npm run agent:public-supabase-readiness`: pass; import candidates remain draft-only and public runtime remains static/file-backed.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API mock checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Article source copy still needs editorial and claim review before publication; this checkpoint only prepares draft CMS-shaped rows.
- The generated apply SQL was not run against Supabase and remains approval-gated.
- Public article runtime still renders sanitized legacy HTML until a deliberate public-read migration is approved and verified.

### Next Handoff
- Continue source-only import/public-read preparation while credentials are unavailable.
- Do not publish imported article blocks or treat newsletter source copy as approved without Jay/content review.

## Entry - 2026-05-29 (Live Forms Notification Status Gate)

### Scope
- Tightened `scripts/check-forms-api-live.mjs` so future live form verification checks notification status consistency.
- Valid enquiry and sample-request live checks now assert that the response `notificationStatus` is final (`not_required`, `sent`, or `failed`) and matches the stored Supabase row's `notification_status`.
- This catches a failure where the lead row is created but the notification status patch silently fails.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-forms-api-live.mjs`

### Verification Results
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `npm run agent:forms-live`: expected credential-gated fail before Supabase calls because no local service-role key is configured.

### Risks and Gaps
- Live form persistence, live audit rows, and real notification delivery remain unverified until service-role and email environment variables are configured.
- The new assertion will run only when `npm run agent:forms-live` can make live submissions.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: configure the service-role key and run `npm run agent:forms-live`.
- `NOW-FORMS-SUPABASE-001`: add `--allow-email` or deployed email envs only when real notification delivery is intentionally being verified.

## Entry - 2026-05-29 (Forms Notification Mock Coverage)

### Scope
- Expanded `scripts/check-forms-api.mjs` so the no-secret Forms API gate covers configured Resend notification behavior.
- Added mocked enquiry notification success coverage: initial Supabase insert uses `notification_status = pending`, Resend is called with the configured enquiry recipient, and the row is patched to `sent`.
- Added mocked sample-request notification failure coverage: the visitor response still succeeds after the lead and sample item are stored, Resend failure is captured, and the row is patched to `failed`.
- No real Resend call, Supabase write, credential, or Cloudflare state change was performed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-forms-api.mjs`

### Verification Results
- `node --check scripts/check-forms-api.mjs`: pass.
- `node scripts/check-forms-api.mjs`: pass, including notification success/failure mocks.

### Risks and Gaps
- Live Supabase row creation remains unverified until `SUPABASE_SERVICE_ROLE_KEY` is configured.
- Real Resend delivery remains unverified until `RESEND_API_KEY`, sender, and recipient environment variables are configured in a controlled environment.
- Turnstile production verification remains staged but unverified until the Turnstile secret exists.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live` after service-role credentials exist.
- `NOW-FORMS-SUPABASE-001`: verify live persistence, real notification delivery, and admin-visible lead workflow after credentials and preview environment exist.

## Entry - 2026-05-29 (First Admin Bootstrap Runner)

### Scope
- Added `npm run agent:first-admin-bootstrap` as a guarded first-admin operational runner.
- Default mode prints the approved setup path and performs no Supabase calls, Auth invites, profile writes, or deletes.
- Added `--verify-only` for read-only service-role inspection of the Auth user, `admin_profiles` row, and baseline seed rows once Jay provides the first admin email and service-role key.
- Added live write mode guardrails: `--allow-writes` requires a matching `--confirm-email`; `--invite` is explicit; existing active owners block a new bootstrap unless `--allow-existing-owner` is intentional.
- Updated live readiness reporting and Harness docs so first-admin setup has a clear no-write, read-only, and approval-gated write path.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/bootstrap-first-admin.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/bootstrap-first-admin.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:first-admin-bootstrap`: pass; plan-only, no Supabase calls, invites, writes, or deletes attempted.
- `npm run agent:first-admin-bootstrap -- --verify-only --admin-email first@example.com`: expected fail-closed behavior because no service-role key is configured.
- `npm run agent:live-readiness`: pass in report-only mode and now reports the first-admin bootstrap verifier inputs.

### Risks and Gaps
- No first admin Auth user, profile row, invite, or credential was created in this checkpoint.
- Live first-admin bootstrap still requires Jay to confirm the email and approve write/invite mode, plus a service-role key in an untracked environment.
- Active-admin browser QA and admin CRUD live writes remain blocked until browser-safe keys, first-admin profile, admin session credentials, and write approval exist.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live` after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- `NOW-ADMIN-AUTH-RLS-001`: run `npm run agent:first-admin-bootstrap -- --verify-only --admin-email <first-admin-email>` after service-role key and first admin email are available; run write mode only after Jay approval.
- `NOW-ADMIN-CMS-001`: continue source-only content import/public-read preparation while credentials remain unavailable.

## Entry - 2026-05-29 (Stone Library Finish Image Import Payload)

### Scope
- Extended the static-to-Supabase content import dry run so Stone Library finish-specific imagery from `src/data/stoneFinishImages.ts` is represented as draft `stone_finish_images` rows.
- Added a TypeScript AST extractor for the static image map so Vite `import.meta.glob` runtime code is not executed by the Node import verifier.
- Added local `data/Product` media source validation, finish-image counts in the JSON/Markdown plan, read-only preflight SQL status/count checks, and guarded draft apply SQL inserts.
- Kept all imported finish image rows and linked media rows draft-only; no Supabase rows, Storage objects, Cloudflare state, credentials, or live admin writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-content-import-readiness.mjs`

### Verification Results
- `node --check scripts/check-content-import-readiness.mjs`: pass.
- `npm run agent:content-import`: pass with 104 media candidates, 13 stone groups, 15 stone variants, 153 finish capability rows, 53 stone finish image rows, 6 products, 28 product models, 18 product material defaults, 18 product specs, 5 projects, 41 project facts, 14 project media rows, 2 project materials, 1 material map, 2 hotspots, 4 articles, 4 article block placeholders, 0 warnings, and 0 blockers.
- `npm run agent:content-import:apply-sql`: pass and wrote ignored JSON, Markdown, preflight SQL, and guarded draft apply SQL artifacts.
- Static SQL artifact guard scan: pass. The generated apply SQL includes the approval guard, inserts `stone_finish_images`, has no `delete from`, `drop table`, or `truncate`, and has no `status = 'published'` import operation.
- `.tmp/` ignore check: pass. Generated import artifacts are ignored by Git.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API mock checks.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only mode; no Supabase writes, Storage uploads, or deletes were attempted.
- `npm run agent:live-readiness`: pass in report-only mode. It still reports missing service-role key, persistent browser-safe key env, first-admin email, admin session credentials, Jay approval for tagged live QA writes, and Cloudflare preview URL.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This checkpoint does not apply the generated import SQL to Supabase, publish content, create credentials, create a first admin, or verify live admin/form writes.
- The imported finish-image source URLs are local `data/Product` migration source locators; the rows remain draft until media is deliberately uploaded/approved through the CMS or a reviewed import path.
- Default/reference-only Stone Library imagery remains excluded from finish-specific `stone_finish_images` rows unless a later content decision maps it to a specific finish or media role.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live` after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- `NOW-ADMIN-AUTH-RLS-001`: run `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after browser-safe and service-role keys plus first-admin profile are available.
- `NOW-ADMIN-CONTENT-CRUD-001`: keep source-only import/public-read preparation moving while credentials remain unavailable; apply/import remains approval-gated.

## Entry - 2026-05-29 (Stone Library Finish Image Admin Source)

### Scope
- Expanded `/admin/stone-library` from group/variant/finish capability editing to include finish image links backed by `stone_finish_images`.
- The Stone Library admin screen now loads `media_assets`, lists finish image links for the selected stone group/variant, and lets active editor/admin/owner roles create, update, publish, and archive image links for selected variants and finishes.
- Published finish image links are guarded so they must reference a published media record.
- Added `stone_finish_image.create`, `stone_finish_image.update`, `stone_finish_image.publish`, and `stone_finish_image.archive` audit actions after successful primary saves.
- Updated admin source coverage and the plan-only live CRUD verifier so later credential-gated live runs include `stone_finish_images`.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`
- `src/pages/admin/AdminStoneLibraryPage.tsx`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass. Stone Library coverage now includes `stone_finish_images` and `media_assets`.
- `npm run agent:admin-crud-live`: pass in plan-only mode; no Supabase writes, Storage uploads, or deletes were attempted.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API mock checks.
- `npm run agent:live-readiness`: pass in report-only mode. It still reports missing service-role key, persistent browser-safe key env, first-admin email, admin session credentials, Jay approval for tagged live QA writes, and Cloudflare preview URL.
- `npm run agent:cloudflare-readiness`: pass.
- Playwright Firefox rendered check on `http://127.0.0.1:5182/admin/stone-library`: pass. With no browser-safe Supabase key configured, the route shows the configuration-required auth state, hides Stone Library private content including the new finish-image surface, suppresses WelcomePopup content, and reports 0 browser console warnings/errors.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This checkpoint is source-only. It does not verify live Stone Library saves, live media upload, live finish-image publish/archive, or audit row creation because browser-safe Supabase config and an active admin/editor profile are still missing.
- Static-to-Supabase content import still prepares media candidates and Stone Library records as draft review material; applying/importing production rows still requires Jay approval and the credential path.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live` after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- `NOW-ADMIN-AUTH-RLS-001`: run `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after browser-safe and service-role keys plus first-admin profile are available.
- `NOW-ADMIN-CONTENT-CRUD-001`: continue source-only content import/public-read preparation if credentials remain unavailable; run live Stone Library image-link verification only after browser-safe config and an active admin/editor profile exist.

## Entry - 2026-05-29 (Guarded Content Import Apply SQL)

### Scope
- Added `--apply-sql-out` support to `scripts/check-content-import-readiness.mjs`.
- Added `npm run agent:content-import:apply-sql` to write the ignored `.tmp/content-import-preview.json`, `.tmp/content-import-plan.md`, `.tmp/content-import-preflight.sql`, and `.tmp/content-import-apply.sql` review bundle in one command.
- The generated apply SQL is guarded: it aborts unless `urblo.import_approved=true` is explicitly set inside the transaction, imports static content candidates as `draft`, and is intended for review after Jay approves the import scope.
- Updated Harness docs to distinguish the generated SQL artifact from an approved production import.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-content-import-readiness.mjs`

### Verification Results
- `node --check scripts/check-content-import-readiness.mjs`: pass.
- `npm run agent:content-import`: pass with 51 media candidates, 13 stone groups, 15 stone variants, 153 finish capability rows, 6 products, 28 product models, 18 product material defaults, 18 product specs, 5 projects, 41 project facts, 14 project media rows, 2 project materials, 1 material map, 2 hotspots, 4 articles, 4 article block placeholders, 0 warnings, and 0 blockers.
- `npm run agent:content-import:apply-sql`: pass and wrote ignored JSON, Markdown, preflight SQL, and guarded draft apply SQL artifacts.
- Static SQL artifact guard scan: pass. The generated apply SQL includes the approval guard, has no `delete from`, `drop table`, or `truncate`, and has no `status = 'published'` import operation.
- `.tmp/` ignore check: pass. Generated import artifacts are ignored by Git.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API mock checks.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:live-readiness`: pass in report-only mode. It still reports missing service-role key, persistent browser-safe key env, first-admin email, admin session credentials, Jay approval for tagged live QA writes, and Cloudflare preview URL.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This checkpoint does not apply the generated import SQL to Supabase, publish content, create credentials, create a first admin, or verify live admin/form writes.
- The apply SQL should not be run until Jay approves import scope and the correct credential/environment path is confirmed.
- Article block rows remain draft placeholders that flag legacy newsletter content for structured review; article claim cleanup remains paused until explicitly resumed.

### Next Handoff
- Continue live form persistence after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- Continue live admin readiness after browser-safe Supabase config, service-role verification access, and first-admin email/profile are available.
- Use `npm run agent:content-import:apply-sql` only as a review artifact generator until Jay approves applying draft rows.

## Entry - 2026-05-29 (Supabase Private Helper Hardening)

### Scope
- Added and applied the `security_definer_private_helpers` Supabase migration.
- Moved admin-role RLS helper usage to `private.has_admin_role(...)` in a non-exposed schema and revoked exposed `public.current_admin_role()` / `public.has_admin_role(text[])` execution from browser roles.
- Rewrote public-table and Storage policies that previously called the public helper so they now call the private helper.
- Ran read-only Supabase advisor and policy/privilege checks to verify the hardening did not break public reads.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `supabase/migrations/README.md`
- `supabase/migrations/202605290001_security_definer_private_helpers.sql`

### Verification Results
- Supabase migration list: pass. `security_definer_private_helpers` is listed on project `npkidywzwddbnfrnxlmo`.
- Supabase security advisor: pass. 0 security lints after the helper migration.
- Supabase policy inspection: pass. 99 policies call `private.has_admin_role(...)`; 0 policies call `public.has_admin_role(...)`.
- Supabase privilege inspection: pass. `authenticated` cannot execute `public.current_admin_role()` or `public.has_admin_role(text[])`; `anon` cannot execute either public or private admin-role helper; `authenticated` can execute the private helpers used by RLS/Storage policies.
- Supabase role-read checks: pass. Role `anon` can still read 1 published `site_settings` row and 12 published `finish_definitions`; role `authenticated` without a JWT sees those public rows and 0 `admin_profiles`.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells and Forms API mock checks.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:live-readiness`: pass in report-only mode. It still reports missing service-role key, persistent browser-safe key env, first-admin email, admin session credentials, Jay approval for tagged live QA writes, and Cloudflare preview URL.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only mode. No Supabase writes, Storage uploads, or deletes were attempted.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Changed-file secret pattern scan: pass.

### Risks and Gaps
- This is non-destructive schema hardening. It does not create a first admin, verify active admin login, run CRUD writes, verify live form persistence, upload Storage objects, or touch Cloudflare.
- Supabase performance advisor still reports expected INFO/WARN items for unused indexes and multiple permissive policies on new/low-traffic tables. Those are not launch blockers yet; do not remove launch-pattern indexes before real traffic/import/live admin usage exists.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live` after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- `NOW-ADMIN-AUTH-RLS-001`: run `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after browser-safe and service-role keys plus first-admin profile are available.
- `NOW-ADMIN-CMS-001`: run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged QA writes and a real owner/admin session exists.

## Entry - 2026-05-29 (Admin Browser-Key Unauthenticated Gate)

### Scope
- Verified the admin shell with a real browser-safe Supabase publishable key supplied only through the local shell environment.
- Confirmed the configured-key unauthenticated state now shows the Supabase Auth login form instead of the configuration-required state.
- Confirmed unauthenticated direct visits to protected admin routes redirect to `/admin/login` with the intended `next` parameter and do not render private module content.
- No Supabase data was queried or mutated beyond normal unauthenticated Auth/session checks, no first-admin/profile changes were made, no live writes were run, and no key was written to `.env` files or committed.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Supabase changelog scan: pass. Current relevant breaking-change note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint performs no schema/API exposure change.
- Supabase connector read-only sanity: pass. Nine launch migrations remain listed on project `npkidywzwddbnfrnxlmo`, and checked core public tables report RLS enabled.
- Temporary Vite dev server with shell-only `VITE_SUPABASE_PUBLISHABLE_KEY`: pass.
- Playwright CLI with Firefox on `http://127.0.0.1:5177/admin`: pass. URL resolves to `/admin/login?next=%2Fadmin`, renders the `Admin login` form, does not show the configuration-required state, and does not render dashboard launch checks.
- Playwright CLI with Firefox on `http://127.0.0.1:5177/admin/media`: pass. URL resolves to `/admin/login?next=%2Fadmin%2Fmedia`, renders the `Admin login` form, and does not render Media Library private content.
- Playwright console inspection: pass. 0 errors and 0 warnings; only React DevTools info appears.
- `npm run agent:live-readiness`: pass in report-only mode. It still reports missing service-role key, persistent browser-safe key env, first-admin email, admin session credentials, Jay approval for tagged live QA writes, and Cloudflare preview URL.

### Risks and Gaps
- This proves the configured-key unauthenticated gate only. It does not prove active admin login, unprofiled-user unauthorized state, admin profile readiness, CRUD writes, media upload/export, lead workflow, or audit row creation.
- Persistent local/Cloudflare browser-safe Supabase env configuration is still pending; the key was used only for this local no-write check.
- First-admin email/profile, service-role key, real owner/admin session, Cloudflare preview URL, and Jay approval for tagged live QA writes remain required for the next live gates.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live` after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- `NOW-ADMIN-AUTH-RLS-001`: run `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after browser-safe and service-role keys plus first-admin profile are available.
- `NOW-ADMIN-CMS-001`: run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged QA writes and a real owner/admin session exists.

## Entry - 2026-05-28 (Live Readiness Non-Secret Overrides)

### Scope
- Refined `npm run agent:live-readiness` so non-secret manual inputs can be represented directly in the audit.
- Added support for `--base-url <origin>`, `--admin-email <email>`, and `--admin-writes-approved`.
- Kept secret-bearing inputs out of CLI flags: service-role keys, browser keys, and admin sessions still come only from env files or the shell.
- No Supabase queries, Supabase mutations, Cloudflare account changes, DNS changes, live writes, or credential storage were performed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:live-readiness`: pass in report-only mode, preserving the missing-input report when no env files are present.
- `npm run agent:live-readiness -- --base-url <preview-origin> --admin-email <first-admin-email> --admin-writes-approved`: pass in report-only mode. It marks the non-secret preview URL, admin email, and approval flag as present without printing those values, and still reports missing service-role/browser/admin-session inputs.
- `npm run agent:live-readiness -- --base-url <preview-origin> --admin-email <first-admin-email> --admin-writes-approved --strict`: expected fail because the service-role key, browser-safe key, and admin session credentials are still missing.

### Risks and Gaps
- `--admin-writes-approved` is only a readiness accounting flag. It does not run writes, create sessions, or replace Jay's actual approval requirement before `npm run agent:admin-crud-live -- --allow-writes`.
- This refinement still does not provide service-role credentials, browser-safe Supabase key configuration, first-admin profile setup, or Cloudflare preview deployment.

### Next Handoff
- Continue with `npm run agent:forms-live`, `npm run agent:admin-live-readiness`, `npm run agent:admin-crud-live -- --allow-writes`, and `npm run agent:cloudflare-preview-smoke` only after their required inputs exist and approvals are satisfied.

## Entry - 2026-05-28 (Live Verification Readiness Audit Runner)

### Scope
- Added `npm run agent:live-readiness` as a no-secret audit for the live inputs needed by form persistence, deployed form verification, first-admin readiness, tagged admin CRUD/audit writes, and Cloudflare preview smoke.
- Added optional local preview URL helper variables to `.env.example`.
- Updated Harness, architecture, Cloudflare, task, roadmap, and startup docs so this runner is visible before credential-gated checks.
- No Supabase queries, Supabase mutations, Cloudflare project changes, DNS changes, live writes, or credential handling were performed.

### Changed Files
- `.env.example`
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:init`: pass and lists `npm run agent:live-readiness`.
- `npm run agent:live-readiness`: pass in report-only mode. With no env files found, it reports missing service-role key, preview URL, browser-safe Supabase key, first-admin email, admin session credentials, and Jay approval for tagged live QA writes.
- `npm run agent:live-readiness -- --json`: pass.
- `npm run agent:live-readiness -- --strict`: expected fail. Strict mode exits non-zero when the same live inputs are missing or manually gated.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only mode; no writes, Storage uploads, or deletes were attempted.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, critical CTA contracts, redirects, and Forms API mock checks.

### Risks and Gaps
- This checkpoint improves live-verification ergonomics but does not replace credential-gated live checks.
- Live form persistence still needs `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_SERVICE_KEY`.
- Admin readiness still needs a browser-safe Supabase key, service-role verification key, and Jay-confirmed first-admin email/profile.
- Tagged admin CRUD/audit live writes still need a real owner/admin session and Jay approval.
- Cloudflare preview smoke still needs a Pages preview URL or explicit `--base-url`.

### Next Handoff
- `NOW-FORMS-BACKEND-001`: run `npm run agent:forms-live` after service-role credentials are configured.
- `NOW-ADMIN-AUTH-RLS-001`: run `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after browser/service keys and first-admin profile are available.
- `NOW-ADMIN-CMS-001`: run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged QA writes and a real owner/admin session exists.

## Entry - 2026-05-28 (Post-Alignment Baseline Verification)

### Scope
- Re-ran source/no-write, runtime, and credential-gated readiness checks after the Harness alignment and generated-artifact ignore commits.
- Verified the current blocker remains missing live credentials/account state, not source coverage.
- Queried Supabase through the connector in read-only mode to confirm migration/RLS/row-count posture after this checkpoint.
- No runtime source, Supabase schema/data, Cloudflare account state, credentials, or live content was changed.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`

### Verification Results
- `git status --short`: clean before recording this entry.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only mode; no writes, Storage uploads, or deletes were attempted.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- Supabase connector read-only sanity: pass. Nine launch migrations are present, latest migration is `security_definer_function_grants`, 12 checked core tables have RLS enabled, private workflow rows remain 0, `finish_definitions` remains 12, and `site_settings` remains 1.
- `npm run agent:forms-live`: expected credential-gated fail on missing `SUPABASE_SERVICE_ROLE_KEY`.
- `npm run agent:admin-live-readiness`: expected credential-gated fail on missing browser-safe Supabase key, service-role key, and first-admin email.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including public/admin route shells, critical CTAs, redirects, and Forms API mock checks.

### Risks and Gaps
- The active goal is not complete. Live form persistence, live admin auth/profile readiness, tagged admin CRUD/audit writes, live media upload/export, live lead workflow/export, Cloudflare preview smoke, deployed form verification, and production DNS/cutover remain unverified.
- Advancing those live checks requires server-side Supabase credentials, browser-safe Supabase configuration, first-admin details, Cloudflare preview/account state, and Jay approval for tagged admin QA writes where applicable.

### Next Handoff
- Configure `SUPABASE_SERVICE_ROLE_KEY`, then run `npm run agent:forms-live` locally and against Cloudflare preview when available.
- Configure browser-safe Supabase key and confirm first admin email/profile, then run `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>`.
- Run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged QA writes and a real owner/admin session exists.

## Entry - 2026-05-28 (Generated Test Artifact Ignore)

### Scope
- Added generated Playwright/test artifact directories to `.gitignore` so local verification output does not leave the goal worktree dirty.
- Existing `test-results/` files were not deleted or modified.
- No runtime source, Supabase data, Cloudflare state, credentials, or public content was changed.

### Changed Files
- `.gitignore`
- `docs/WORKLOG.md`

### Verification Results
- `git status --short`: after the ignore update, only the intended `.gitignore` and `docs/WORKLOG.md` edits remained visible before commit.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is repository hygiene only. It does not advance live credential-gated form/admin verification.

### Next Handoff
- Continue with credential-gated form/admin live checks when keys and first-admin details are available, or continue source-only readiness work if credentials remain unavailable.

## Entry - 2026-05-28 (Forms Current-State Harness Alignment)

### Scope
- Corrected current-state Harness wording that still implied Contact and Sample Request main submit behavior was mailto/local-only.
- Aligned `AGENTS.md`, `docs/HANDOFF.md`, `docs/ARCHITECTURE.md`, `docs/NEXT_STEPS.md`, and `docs/agent/tasks.json` with current source reality: Contact and Sample Request now post to Pages Functions, while production persistence still awaits service-role environment verification.
- Clarified that direct email/phone links remain manual contact channels, not the primary form submit path.
- Clarified that public content runtime is still static/file-backed until content import and public read migration are explicitly approved/applied, even though source CRUD screens now exist.
- No runtime source, Supabase schema/data, Cloudflare account state, credentials, or live content was changed.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:init`: pass. It showed this docs-only working tree plus an unrelated untracked `test-results/` directory.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates were intentionally skipped because this checkpoint only changes Harness/current-state documentation.

### Risks and Gaps
- This does not prove live form persistence, email notification, first-admin access, admin live writes, media upload/export, lead workflow, or Cloudflare preview behavior.
- The active goal remains incomplete until credential-gated live checks and approved QA writes pass.

### Next Handoff
- Continue `NOW-FORMS-BACKEND-001` with `npm run agent:forms-live` after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- Continue `NOW-ADMIN-AUTH-RLS-001` with `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after browser-safe/service keys and first-admin profile details are available.
- Run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged QA writes and a real owner/admin session exists.

## Entry - 2026-05-28 (Goal Resume Readiness Audit)

### Scope
- Resumed the active `/admin` CMS goal from the current worktree instead of relying on previous session memory.
- Re-read the Harness in the required order and ran no-write source/external readiness checks for the implemented admin, Cloudflare, public Supabase, and live credential gates.
- Confirmed the current blocker remains credentials/account state, not source coverage: live form persistence needs a server-side service-role key; live admin readiness needs a browser-safe Supabase key, service-role verification key, and first-admin email/profile.
- No runtime source, Supabase schema, Supabase data, Cloudflare account state, or live content was changed.

### Changed Files
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run agent:init`: pass. Branch reported clean and tracking `origin/main`.
- `npm run agent:admin-crud-coverage`: pass. Covered Dashboard, Settings/admin profiles, Media, Stone Library, Projects, Products, Articles, Leads, and Audit source/table/audit/export coverage.
- `npm run agent:admin-crud-live`: pass in plan-only mode. No writes, Storage uploads, or deletes were attempted.
- `npm run agent:cloudflare-readiness`: pass. Repo-side Pages build contract, SPA fallback, Function routing scope, headers, API handlers, env placeholders, and deployment runbook remain valid.
- `npm run agent:public-supabase-readiness`: pass. Import candidates remain draft-only, public RLS source remains published-only, anonymous grants remain read-only, public runtime remains static/file-backed, and Functions stay scoped to `/api/*`.
- Supabase connector migration sanity: pass. Nine launch migrations are listed on project `npkidywzwddbnfrnxlmo`.
- Supabase connector RLS sanity: pass. The checked core public tables all report RLS enabled.
- Supabase connector row-count sanity: pass. `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items` remain 0; `finish_definitions` remains 12; `site_settings` remains 1.
- `npm run agent:forms-live`: expected credential-gated fail. It stops on missing `SUPABASE_SERVICE_ROLE_KEY` before live form verification.
- `npm run agent:admin-live-readiness`: expected credential-gated fail. It stops on missing browser-safe Supabase key, service-role key, and first-admin email.

### Risks and Gaps
- The goal is not complete. Live form persistence, live admin auth/profile readiness, live admin CRUD/audit writes, live media upload/export, live lead workflow/export, Cloudflare preview smoke, and deployed form verification still require external credentials/account state and Jay approvals.
- No tagged QA writes were run, and no first-admin/profile changes were made.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification with `npm run agent:forms-live` after `SUPABASE_SERVICE_ROLE_KEY` is configured.
- `NOW-ADMIN-AUTH-RLS-001` live admin readiness with `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after browser-safe and service-role keys plus first-admin profile are available.
- `NOW-ADMIN-CMS-001` live tagged CRUD/audit verification with `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged QA writes and a real owner/admin session exists.

## Entry - 2026-05-28 (Admin Scaffold Cleanup)

### Scope
- Removed the retired `AdminModulePage` scaffold component now that all launch-critical admin modules have real source screens.
- Removed unused `scaffold` / `locked` module state branches from `adminContent`, `AdminShell`, and the dashboard rollout list.
- Updated admin CRUD coverage so the retired scaffold component cannot reappear unnoticed and the dashboard shows each module as `Source ready`.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `src/pages/admin/AdminDashboardPage.tsx`
- `src/pages/admin/AdminShell.tsx`
- `src/pages/admin/adminContent.ts`
- Deleted the retired admin module scaffold component.

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/*` route shells.
- `npm run agent:admin-crud-coverage`: pass. The runner now fails if the retired scaffold component reappears.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is a source cleanup only. It does not prove live admin login, live RLS writes, live audit rows, or Supabase-backed form persistence.

### Next Handoff
- `NOW-ADMIN-CMS-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-28 (Cloudflare Preview Smoke Runner)

### Scope
- Added `scripts/check-cloudflare-preview-smoke.mjs` as a no-secret HTTP verifier for deployed Cloudflare Pages preview URLs.
- Added `npm run agent:cloudflare-preview-smoke`.
- The runner verifies direct-refresh public/admin route shells, unknown-route fallback shell, deployed `/assets/*`, legacy product/article redirects, and no-write API safe-failure behavior for `/api/enquiries` and `/api/sample-requests`.
- Local Vite preview URLs are supported for script validation; Cloudflare-only redirect and Function checks are skipped on local hosts.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `scripts/check-cloudflare-preview-smoke.mjs`

### Verification Results
- Cloudflare docs check: pass. Current Pages documentation confirms `_redirects`-based routing and Pages Functions routing remain relevant for this preview smoke scope.
- `node --check scripts/check-cloudflare-preview-smoke.mjs`: pass.
- `npm run agent:cloudflare-preview-smoke -- --base-url http://127.0.0.1:4184`: pass against local Vite preview. Verified public/admin route shells, unknown-route fallback shell, and asset references. Redirect and Function checks were skipped because the base URL was local.

### Risks and Gaps
- This does not create a Cloudflare Pages project, deploy a preview, configure environment variables, validate production DNS, or prove live Supabase row creation.
- Cloudflare-only redirect and Function checks still need to run against the real `*.pages.dev` URL.
- Valid form persistence still requires `npm run agent:forms-live -- --base-url https://<preview>.pages.dev` after server-side `SUPABASE_SERVICE_ROLE_KEY` is configured.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-28 (Public Supabase Readiness Runner)

### Scope
- Tightened `scripts/check-content-import-readiness.mjs` so status-bearing static-to-Supabase import candidates stay `draft`, including Stone Library rows that previously inherited current public active/TBC source status.
- Added `scripts/check-public-supabase-readiness.mjs` and `npm run agent:public-supabase-readiness` as a no-write source verifier for public Supabase cutover preparation.
- The new runner verifies zero content import warnings/blockers, draft-only import statuses, local media availability, published-only public RLS policy source, read-only anonymous grants, static public runtime boundaries, Cloudflare SPA fallback, and `/api/*` Function routing scope.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-content-import-readiness.mjs`
- `scripts/check-public-supabase-readiness.mjs`

### Verification Results
- Supabase changelog check: pass. The recent Data API exposure breaking change remains relevant and is covered by explicit grants/RLS checks; no live schema or Data API exposure change was made.
- Supabase RLS documentation check: pass. The runner follows the documented exposed-schema posture by checking RLS/policy/grant source for public content tables before any browser-readable cutover.
- `node --check scripts/check-public-supabase-readiness.mjs`: pass.
- `npm run agent:content-import`: pass. Prepared 51 media candidates, 13 stone groups, 15 stone variants, 153 finish capability rows, 6 products, 28 product models, 5 projects, 4 articles, 0 warnings, and 0 blockers.
- `npm run agent:public-supabase-readiness`: pass. Verified 13 stone groups, 6 products, 5 projects, and 4 articles remain draft in the import dry run, plus published-only public RLS policy source, read-only anonymous grants, static public runtime boundary, Cloudflare SPA fallback, and `/api/*` Function routing scope.
- `npm run agent:content-import:preflight-sql`: pass. Wrote local ignored JSON, Markdown, and SQL review artifacts.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- Supabase connector read-only sanity: pass. Nine launch migrations are present, 24 public tables have RLS enabled, private workflow rows remain 0, finish definitions remain 12, and site settings remains 1.
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/*` route shells and Forms API mock checks.

### Risks and Gaps
- This is still no-write source verification. It does not apply imported rows, prove live browser-key reads, verify admin save flows, or replace `npm run agent:forms-live` / `npm run agent:admin-crud-live -- --allow-writes`.
- Public Projects, Stone Library, Products, and Articles remain file-backed until Jay approves content import scope and public read migration.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification with `npm run agent:forms-live` after credentials are configured.
- `NOW-ADMIN-AUTH-RLS-001` live admin profile readiness and browser QA after first-admin email/profile and browser-safe keys are available.
- `NOW-ADMIN-CONTENT-CRUD-001` approved content import/apply and public read migration only after live admin access and content scope are confirmed.

## Entry - 2026-05-28 (Admin CRUD Live Verifier)

### Scope
- Added `scripts/check-admin-crud-live.mjs` as a credential-gated live write verifier for the implemented `/admin` CMS.
- Added `npm run agent:admin-crud-live` and listed it in `npm run agent:init`.
- Default mode is plan-only and performs no Supabase writes, Storage uploads, or deletes.
- Live mode requires `--allow-writes`, a browser-safe Supabase key, and a real owner/admin Supabase Auth session through `URBLO_ADMIN_ACCESS_TOKEN` or `URBLO_ADMIN_EMAIL`/`URBLO_ADMIN_PASSWORD`.
- The live flow is designed to create tagged draft/archived QA rows across Settings, Media, Stone Library, Projects, Products, Articles, private lead workflow rows, and export audit actions through browser-key RLS. Optional `--include-storage` uploads a tiny private `urblo-admin-media` object.

### Changed Files
- `.env.example`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-admin-crud-live.mjs`

### Verification Results
- Supabase changelog check: pass. The relevant recent Data API exposure change is already covered by existing grants/RLS posture; no new schema or Data API exposure change was made.
- `node --check scripts/check-admin-crud-live.mjs`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only mode. It reported missing local admin credentials and performed no writes.
- `npm run agent:admin-crud-coverage`: pass. Existing admin source route/module/table/action/export coverage remains green.
- `npm run agent:cloudflare-readiness`: pass. Cloudflare Pages build contract, SPA fallback, Function routing scope, headers, API handlers, env placeholders, and deployment runbook remain valid after documentation updates.
- Supabase migration list: pass. The nine applied launch migrations are still present on project `npkidywzwddbnfrnxlmo`.
- Supabase RLS sanity: pass. All 24 public launch tables report `relrowsecurity = true`.
- Supabase private workflow row-count sanity: pass. `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, and `sample_request_items` remain at 0 rows after plan-only verification; `finish_definitions` remains 12 and `site_settings` remains 1.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/*` route shells and Forms API mock checks.

### Risks and Gaps
- Live admin writes remain unverified until browser-safe Supabase config, a real owner/admin session, and Jay approval for tagged QA writes are available.
- The live verifier intentionally does not create or change first-admin profile rows and intentionally does not physically delete tagged QA rows.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-CMS-001` live tagged CRUD/audit verification with `npm run agent:admin-crud-live -- --allow-writes`.
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.

## Entry - 2026-05-28 (Cloudflare Pages Readiness Runner)

### Scope
- Added `scripts/check-cloudflare-pages-readiness.mjs` as a no-secret repo-side Cloudflare Pages verifier.
- Added `npm run agent:cloudflare-readiness` and listed it in `npm run agent:init`.
- The runner checks the Cloudflare Pages build command, Vite root base, SPA fallback, `/api/*` Function routing scope, launch headers, Pages Function handler files, environment placeholders, and `docs/CLOUDFLARE_DEPLOYMENT.md`.
- It does not create a Cloudflare Pages project, set environment variables, validate a preview URL, change a custom domain, or touch DNS.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-cloudflare-pages-readiness.mjs`

### Verification Results
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `npm run agent:cloudflare-readiness`: pass. Verified build contract, SPA fallback, Function routing scope, headers, API handlers, env placeholders, and deployment runbook.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/*` route shells and Forms API mock checks.

### Risks and Gaps
- Cloudflare Pages project creation, preview deployment validation, production environment variables, custom domain, DNS cutover, and rollback still require account-level access and confirmation.
- Form persistence still depends on server-side `SUPABASE_SERVICE_ROLE_KEY` configuration before deployed Pages endpoint verification can pass.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001` account-level Pages setup after Jay confirms the Cloudflare account/project path.
- `NOW-FORMS-BACKEND-001` live form persistence/audit verification with `npm run agent:forms-live` after credentials are configured.

## Entry - 2026-05-28 (Admin CRUD Coverage Runner)

### Scope
- Added `scripts/check-admin-crud-coverage.mjs` as a no-secret source coverage verifier for the implemented `/admin` CMS.
- Added `npm run agent:admin-crud-coverage` and listed it in `npm run agent:init`.
- The runner checks `/admin` route registration, active module registration, `RequireAdmin` access states, browser-key-only Supabase client wiring, launch-critical table references, role-gated controls, publish/archive paths, shared admin audit writer actions, and audit-gated Media/Leads exports.
- It does not mutate Supabase and does not replace live browser QA with a configured admin profile.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-admin-crud-coverage.mjs`

### Verification Results
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `npm run agent:admin-crud-coverage`: pass. Covered Dashboard, Settings/admin profiles, Media, Stone Library, Projects, Products, Articles, Leads, and Audit table/action coverage.
- Supabase connector read-only sanity check: pass. The nine applied launch migrations are still present, 24 public tables have RLS enabled, live private workflow counts remain 0 admin profiles / 0 audit events / 0 enquiries / 0 sample requests / 0 sample items, and baseline seeds remain 12 finish definitions plus 1 site settings row.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/*` route shells and Forms API mock checks.

### Risks and Gaps
- Live admin save/upload/export/audit verification still requires browser-safe Supabase config and active admin profiles.
- The runner proves source coverage only; it cannot prove RLS write success or browser session behavior without credentials.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001` live admin profile readiness with `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after credentials are configured.
- `NOW-FORMS-BACKEND-001` live form persistence/audit verification with `npm run agent:forms-live`.

## Entry - 2026-05-28 (Admin Live Readiness Runner)

### Scope
- Added `scripts/check-admin-live-readiness.mjs` as a non-mutating readiness runner before live `/admin` browser QA.
- Added `npm run agent:admin-live-readiness`.
- The runner loads `.env.local`, `.env`, `.dev.vars`, and shell values; requires a browser-safe Supabase key, a service-role verification key, and a first-admin email.
- It verifies one active `admin_profiles` row for the named email, checks the required role, and confirms baseline `site_settings` and `finish_definitions` seed rows.
- It does not create Supabase Auth users, create/update admin profile rows, mutate content, or delete rows.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-admin-live-readiness.mjs`

### Verification Results
- `node --check scripts/check-admin-live-readiness.mjs`: pass.
- `npm run agent:admin-live-readiness`: expected credential-gated fail. No local browser-safe key, service-role key, or first-admin email is configured, and the command stops before any Supabase calls.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('json ok')"`: pass.
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/*` route shells and Forms API mock checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live admin auth/profile verification is still unverified until Jay confirms the first admin email and browser-safe/service-role keys are configured.
- First admin bootstrap still must happen outside this runner. Creating or changing admin profiles requires Jay confirmation because it changes access control.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001` live admin profile readiness with `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` after credentials are configured.
- `NOW-FORMS-BACKEND-001` live form persistence/audit verification with `npm run agent:forms-live`.

## Entry - 2026-05-28 (Live Forms Verification Runner)

### Scope
- Added `scripts/check-forms-api-live.mjs` as a credential-gated live verification runner for Contact and Sample Request persistence.
- Added `npm run agent:forms-live`.
- The runner supports direct handler verification by default and deployed endpoint verification with `--base-url`.
- It verifies valid enquiry rows, valid sample request rows, sample item rows, server-side audit rows, invalid enquiry no-write behavior, and invalid sample-request no-write behavior once a service-role key is configured.
- It intentionally fails when `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_SERVICE_KEY` is absent and keeps tagged test rows for auditability until Jay approves cleanup.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-forms-api-live.mjs`

### Verification Results
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('json ok')"`: pass.
- `npm run agent:forms-live`: expected credential-gated fail. No local secret file is present, and the command stops with missing `SUPABASE_SERVICE_ROLE_KEY` before any Supabase calls.
- Supabase connector pre-check: pass. Current live counts remain 0 admin profiles, 0 audit events, 0 enquiries, 0 sample requests, 0 sample request items, 12 finish definitions, and 1 site settings row.
- Supabase connector migration check: pass. Applied migrations still include foundation, hardening, anon read-only, baseline seed, admin settings/profile hardening, SECURITY DEFINER grant hardening, and media Storage migrations.
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/*` route shells and Forms API mock checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live form persistence is still unverified until a real server-side service-role key is configured locally or in Cloudflare Pages.
- The live runner creates tagged test rows by design and does not delete them automatically; cleanup requires Jay approval because it is a destructive database action.
- Turnstile and Resend production behavior remain staged; use `--turnstile-token` or `--allow-email` only when those checks are intentionally being exercised.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification with `npm run agent:forms-live` after credentials are configured.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification after browser-safe Supabase key and first admin profile are available.

## Entry - 2026-05-28 (Form Environment Example and Alias Docs)

### Scope
- Updated `.env.example` so local/Cloudflare configuration shows the server-side `SUPABASE_URL` plus supported compatibility aliases used by the Pages Function source.
- Updated `docs/CLOUDFLARE_DEPLOYMENT.md` and `docs/ARCHITECTURE.md` to distinguish canonical environment variable names from compatibility aliases.
- No secrets were added; all values remain blank placeholders except the public/project Supabase URL.

### Changed Files
- `.env.example`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live form persistence is still unverified until the actual server-side `SUPABASE_SERVICE_ROLE_KEY` is configured in the local/Cloudflare Pages Function environment.
- Turnstile and Resend remain staged but unverified until their real secrets are configured.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.

## Entry - 2026-05-28 (Content Import Preflight SQL Artifact)

### Scope
- Added `--preflight-sql-out` support to `scripts/check-content-import-readiness.mjs`.
- Added `npm run agent:content-import:preflight-sql` to write `.tmp/content-import-preview.json`, `.tmp/content-import-plan.md`, and `.tmp/content-import-preflight.sql`.
- The generated SQL artifact is read-only and covers planned-vs-current row counts, seed/import target counts, status distribution, RLS state, and policy inspection.
- Verified current Supabase target state without writing rows: seed tables have 12 finish definitions and one site settings row, content import target tables are empty, and all checked seed/import target tables have RLS enabled.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-content-import-readiness.mjs`

### Verification Results
- `npm run agent:content-import:preflight-sql`: pass. Wrote local ignored JSON, Markdown plan, and read-only SQL artifacts with 0 warnings and 0 blockers.
- Supabase connector target-count/RLS preflight: pass. `finish_definitions` has 12 rows, `site_settings` has 1 row, all checked content import target tables have 0 rows, and all checked seed/import target tables have RLS enabled.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('json ok')"`: pass.

### Risks and Gaps
- This is still a preflight artifact only. It must not be run as an import/apply step, and it does not write Supabase rows.
- Actual import remains blocked on Jay's content-scope approval, credential handling, backup/export posture, and live admin verification.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-CONTENT-CRUD-001` approved content import/apply checkpoint after credentials are available.

## Entry - 2026-05-28 (Admin Dashboard Launch Checks Refresh)

### Scope
- Updated the protected admin dashboard's open launch checklist so it no longer lists completed Storage bucket/media policy work as an open blocker.
- The dashboard now points active admins to the current blockers: server-side form service-role verification, first admin profile, live admin save/upload/export audit verification, and approved content import scope.
- Kept the change source-only; no Supabase rows or production configuration were changed.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/pages/admin/AdminDashboardPage.tsx`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin` route shell coverage and Forms API mock checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Active-admin dashboard rendering is still not live-verified because browser-safe Supabase configuration and a first active admin profile are still required.
- The checklist is operational copy only; it does not resolve the underlying credential and live verification blockers.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-CONTENT-CRUD-001` approved content import/apply checkpoint after credentials are available.

## Entry - 2026-05-28 (Media Manifest Export Source)

### Scope
- Added admin/editor CSV export to `/admin/media` for the currently visible media manifest.
- Export includes storage/external source fields, media type, dimensions, size, alt/caption/credit/usage notes, and status timestamps.
- Export is audit-gated: the screen attempts a `media_assets.export_manifest` row in `admin_audit_events` before creating the download and blocks export if the audit write fails.
- Kept live export verification pending until browser-safe Supabase config and an active admin/editor profile exist.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/pages/admin/AdminMediaPage.tsx`
- `src/pages/admin/adminContent.ts`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 432 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/media` route shell coverage and Forms API mock checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live media manifest export and its audit row are unverified until browser-safe Supabase configuration and an active admin/editor profile exist.
- The export is limited to records currently visible in the admin media screen. Date/status filtering can be added later if operational policy requires it.
- Server-side form row creation remains unverified until `SUPABASE_SERVICE_ROLE_KEY` is configured.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-MEDIA-LEADS-001` live media upload/save/export and lead save/export verification.

## Entry - 2026-05-28 (Content Import Plan Artifact)

### Scope
- Added `--plan-out` support to `scripts/check-content-import-readiness.mjs`.
- Added `npm run agent:content-import:plan` to write both `.tmp/content-import-preview.json` and `.tmp/content-import-plan.md`.
- The Markdown plan records no-write safety notes, preflight checks, table apply order, reverse rollback order, and verification expectations.
- Kept the flow non-destructive: generated files stay in ignored `.tmp/` and no Supabase rows are written.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-content-import-readiness.mjs`

### Verification Results
- `npm run agent:content-import:plan`: pass. Latest run prepared 51 media candidates, 13 stone groups, 15 stone variants, 153 finish capability rows, 6 products, 28 product models, 18 material defaults, 18 specs, 5 projects, 41 project facts, 14 project media rows, 2 project materials, 1 material map, 2 hotspots, 4 articles, and 4 article block placeholders with 0 warnings and 0 blockers.
- `npm run agent:content-import`: pass with the same zero-warning, zero-blocker content summary.
- `.tmp/content-import-preview.json`: pass. The local ignored artifact includes `importPlan` keys for safety, preflight checks, apply order, rollback order, and verification.
- `.tmp/content-import-plan.md`: pass. The local ignored Markdown plan renders the apply/rollback table and preflight checklist.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('json ok')"`: pass.

### Risks and Gaps
- This is still a planning artifact only. It must not be treated as an approved production import or client-approved published content.
- Actual apply/import still requires Jay approval, a backup/export posture, service-role credential handling, rollback review, and live Supabase verification.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-CONTENT-CRUD-001` explicit import/apply approval and implementation after credentials are available.

## Entry - 2026-05-28 (Leads CSV Export Source)

### Scope
- Added owner/admin CSV export to `/admin/leads` for the currently loaded enquiry and sample-request queue.
- Export includes contact details, workflow status, assignment labels, notification/Turnstile state, message/internal notes, shipping address, and sample item summaries.
- Export is audit-gated: the screen attempts a `leads.export_csv` row in `admin_audit_events` before creating the download and blocks the export if the audit write fails.
- Kept physical deletes hidden; live export verification still requires browser-safe Supabase config plus an active owner/admin profile.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/pages/admin/AdminLeadsPage.tsx`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 430 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/leads` route shell coverage and Forms API mock checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.

### Risks and Gaps
- Live CSV export and its audit row are unverified until browser-safe Supabase configuration and an active owner/admin profile exist.
- The export is limited to rows currently loaded by the admin screen; broader date/status-filtered export can be added after policy requirements are confirmed.
- Server-side form row creation remains unverified until `SUPABASE_SERVICE_ROLE_KEY` is configured.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-MEDIA-LEADS-001` live Leads save/export verification.

## Entry - 2026-05-28 (Content Import Artifact Output)

### Scope
- Added `--out` support to `scripts/check-content-import-readiness.mjs`.
- Added `.tmp/` to `.gitignore` so local review artifacts are not accidentally committed.
- Added `npm run agent:content-import:json` for stdout JSON output and documented the quieter artifact command through agent init.
- Kept the import flow strictly no-write: generated artifacts remain draft review payloads and do not write Supabase rows.

### Changed Files
- `.gitignore`
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-content-import-readiness.mjs`

### Verification Results
- `npm run agent:content-import`: pass. Latest run prepared 51 media candidates, 13 stone groups, 15 stone variants, 153 finish capability rows, 6 products, 28 product models, 18 product material defaults, 18 product specs, 5 projects, 41 project facts, 2 project materials, 1 material map, 2 hotspots, 4 articles, and 4 article block placeholders with 0 warnings and 0 blockers.
- `npm run agent:content-import -- --out .tmp/content-import-preview.json`: pass. Wrote the local ignored draft artifact and preserved the same summary counts.
- `npm run lint`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The artifact is intentionally draft/no-write material. It must not be applied to production Supabase or treated as client-approved published content without explicit approval.
- The future apply/import step still needs a separate approval gate, service-role credentials, rollback/export planning, and live verification.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-CONTENT-CRUD-001` explicit import/apply planning after Jay approves the draft content scope.

## Entry - 2026-05-28 (Admin Profile Management and RLS Hardening)

### Scope
- Added non-destructive admin profile management to `/admin/settings` for existing Supabase Auth users.
- Owner/admin roles can create/update profile rows once live auth is configured; the UI blocks self-lockout, preserves at least one active owner, and does not expose delete controls.
- Applied `admin_profile_owner_hardening` so admins can maintain non-owner profiles while owner-role assignment and owner-profile changes require owner.
- Applied `security_definer_function_grants` so anonymous users cannot directly execute admin SECURITY DEFINER helpers and `rls_auto_enable` is not directly executable by anon/authenticated.
- Kept live profile save verification pending until browser-safe Supabase config and first-admin access are available.

### Changed Files
- `src/pages/admin/AdminSettingsPage.tsx`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `supabase/migrations/202605280004_admin_profile_owner_hardening.sql`
- `supabase/migrations/202605280005_security_definer_function_grants.sql`
- `supabase/migrations/README.md`

### Verification Results
- Supabase migration list: pass. `admin_profile_owner_hardening` and `security_definer_function_grants` are listed on project `npkidywzwddbnfrnxlmo`.
- Supabase policy check: pass. `admin_profiles` INSERT/UPDATE allow owner broadly, allow admin only for `admin/editor/viewer` rows, and DELETE is owner-only for non-owner rows.
- Supabase function grant check: pass. `anon` cannot execute `current_admin_role()` or `has_admin_role(text[])`; `rls_auto_enable()` is not directly executable by anon/authenticated.
- Supabase security advisor: partial pass. The previous anonymous SECURITY DEFINER warnings are cleared; authenticated warnings remain for `current_admin_role()` and `has_admin_role(text[])` because they remain executable for RLS policy evaluation.
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 427 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live admin profile create/update is still unverified until `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`, an active first-admin profile, and a browser session are available.
- First admin bootstrap still happens outside `/admin/settings` and requires Jay to confirm the first admin email/profile.
- Authenticated SECURITY DEFINER helper warnings remain because moving RLS helpers out of the exposed public schema would require a separate helper-function refactor and policy migration.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-SETTINGS-CRUD-001` live settings/admin-profile save verification.
- Source-only content import/public-read preparation if credentials remain unavailable.

## Entry - 2026-05-28 (Server-Side Form Audit Source)

### Scope
- Updated the Cloudflare Pages Function form helpers so successful enquiry and sample-request inserts attempt server-side `admin_audit_events` writes with `actor_user_id = null`.
- Added audit metadata for source route, Turnstile result, initial notification status, and sample-request item context.
- Kept visitor responses resilient: audit logging failure is swallowed after the primary lead row has been stored.
- Expanded Forms API mocks to cover audit writes, audit-failure resilience, missing service-role fail-closed behavior before Supabase calls, and existing Turnstile fail-closed behavior.

### Changed Files
- `functions/_lib/forms.js`
- `scripts/check-forms-api.mjs`
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `node scripts/check-forms-api.mjs`: pass.
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 416 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including all current `/admin/*` route shells and Forms API mock checks.

### Risks and Gaps
- Live form row creation and live form audit-row creation are still unverified until `SUPABASE_SERVICE_ROLE_KEY` exists in the local/Cloudflare Pages Function environment.
- Transactional email delivery remains staged but unverified until Resend/email secrets are configured.
- The source intentionally does not fail visitor submissions because audit logging failed after the primary lead row was stored.

### Next Handoff
- `NOW-FORMS-BACKEND-001` live Supabase row/audit verification.
- `NOW-ADMIN-AUTH-RLS-001` live auth/profile verification.
- `NOW-ADMIN-CONTENT-CRUD-001` source-only public-read preparation if credentials remain unavailable.

## Entry - 2026-05-28 (Content Import Dry Run)

### Scope
- Added `scripts/check-content-import-readiness.mjs` and `npm run agent:content-import`.
- The script reads current static Stone Library JSON, Products data, Projects data, Articles manifest/source HTML, and referenced local media.
- It prepares Supabase-shaped draft import candidates with natural keys and fails before any database write if local media is missing, slugs/keys duplicate, or project material-map references use unknown stone/finish keys.
- The script is intentionally no-write and does not treat provisional static content as final client-approved published content.

### Changed Files
- `package.json`
- `scripts/agent-init.sh`
- `scripts/check-content-import-readiness.mjs`
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`

### Verification Results
- Supabase read-only count check: content tables and `admin_audit_events` currently have zero rows before import.
- `npm run agent:content-import`: pass. Prepared 51 media candidates, 13 stone groups, 15 stone variants, 153 finish capability rows, 6 products, 28 product models, 18 product material defaults, 18 product specs, 5 projects, 41 project facts, 2 project materials, 1 material map, 2 hotspots, 4 articles, and 4 article block placeholders with 0 warnings and 0 blockers.
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 416 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including all current `/admin/*` route shells and Forms API mock checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is import preparation only; no rows were written to Supabase.
- Draft import candidates still need review before any production import, especially article structured-block cleanup and project claim approval.
- Live content import and public read migration still require browser-safe Supabase config, active admin profiles, and an explicit import/apply checkpoint.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CONTENT-CRUD-001` live import/apply and public-read migration after credentials and approval.

## Entry - 2026-05-28 (Admin Audit Writer Source)

### Scope
- Added `src/lib/adminAudit.ts` as the shared browser-side audit writer for admin save flows.
- Wired Settings, Media, Stone Library, Projects, Products, Articles, and Leads save workflows to call the audit writer after successful primary mutations.
- Audit insert failures are appended to the success notice and do not roll back the already-saved primary record.
- Kept live audit-row verification pending until browser-safe Supabase config and an active admin/editor or owner/admin profile exist.

### Changed Files
- `src/lib/adminAudit.ts`
- `src/pages/admin/AdminSettingsPage.tsx`
- `src/pages/admin/AdminMediaPage.tsx`
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `src/pages/admin/AdminProductsPage.tsx`
- `src/pages/admin/AdminArticlesPage.tsx`
- `src/pages/admin/AdminLeadsPage.tsx`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 416 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including all current `/admin/*` route shells and Forms API mock checks.

### Risks and Gaps
- Live audit row creation is not verified because browser-safe Supabase key configuration and an active admin profile are still required.
- Server-side form audit events are not implemented yet; form persistence itself still requires `SUPABASE_SERVICE_ROLE_KEY` verification first.
- Audit insert failure currently notifies the admin but does not retry automatically.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CONTENT-CRUD-001` content import/public-read preparation if credentials remain unavailable.

## Entry - 2026-05-28 (Admin Audit Visibility Source)

### Scope
- Replaced the `/admin/audit` scaffold with a protected owner/admin read-only review screen behind the existing Supabase Auth/profile gate.
- The screen reads audit events and active admin profile labels from Supabase.
- Owner/admin roles can inspect actor, action, entity, timestamp, and metadata JSON once browser-safe Supabase config and an active profile exist.
- Added loading, empty, filter, detail, metadata JSON, restricted-role, read-only, and error states.
- Kept audit event mutation out of this screen; shared mutation helpers still need to write audit rows from admin CRUD and form workflows.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminAuditPage.tsx`
- `src/pages/admin/adminContent.ts`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/audit` route shell coverage.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Playwright CLI with Firefox: pass for `/admin/audit` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than Audit content.

### Risks and Gaps
- Live Audit visibility verification is not complete because browser-safe Supabase key configuration and an active owner/admin profile are still required.
- The admin CRUD and form workflows do not yet write audit event rows; this screen will be empty until mutation helpers or server-side event writers are added.
- Export, retention policy, and sensitive-operation review rules remain pending.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- Shared audit event writers for admin CRUD and form workflows.
- Source-only content import preparation if credentials remain unavailable.

## Entry - 2026-05-28 (Admin Leads Workflow Source)

### Scope
- Replaced the `/admin/leads` scaffold with a protected source workflow screen behind the existing Supabase Auth/profile gate.
- The screen reads enquiries, sample requests, sample request items, active admin profiles, Stone Library labels, and finish labels from Supabase.
- Active owner/admin roles can update lead status, assignment, and internal notes once browser-safe Supabase config and an active profile exist.
- Added loading, empty, contact detail, sample item, notification state, Turnstile state, status, assignment, internal notes, read-only, and error states.
- Kept lead row creation server-side only through the existing Pages Function form endpoints; manual lead creation, export, and physical delete controls remain intentionally hidden.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminLeadsPage.tsx`
- `src/pages/admin/adminContent.ts`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/leads` route shell coverage.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Playwright CLI with Firefox: pass for `/admin/leads` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than Leads workflow content.

### Risks and Gaps
- Live Leads save verification is not complete because browser-safe Supabase key configuration and an active owner/admin profile are still required.
- Live lead row creation is still not verified because server-side `SUPABASE_SERVICE_ROLE_KEY` is not configured for the Pages Function environment.
- Transactional email, Turnstile production secret verification, lead export, and audit review remain pending.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-MEDIA-LEADS-001` live verification and export/notification follow-ups.
- Next source-only checkpoint without credentials: useful audit visibility.

## Entry - 2026-05-28 (Admin Articles CRUD Source)

### Scope
- Replaced the `/admin/articles` scaffold with a protected source CRUD screen behind the existing Supabase Auth/profile gate.
- The screen reads article metadata, structured article blocks, media records, project references, and Stone Library references from Supabase.
- Active editor/admin/owner roles can create/update article and block records, publish/archive articles and blocks, and keep legacy newsletter source material as provenance rather than the normal authoring model once browser-safe Supabase config and an active profile exist.
- Added loading, empty, validation, save, publish/archive, structured-block JSON, reference-linking, legacy-source provenance, read-only, and error states.
- Kept public Article runtime static/file-backed with sanitized legacy HTML; static-to-Supabase content import and public read migration remain separate follow-ups.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminArticlesPage.tsx`
- `src/pages/admin/adminContent.ts`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 386 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/articles` route shell coverage.
- Playwright CLI with Firefox: pass for `/admin/articles` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than Articles CRUD content, and console output had 0 errors/warnings.

### Risks and Gaps
- Live Articles save verification is not complete because browser-safe Supabase key configuration and an active admin/editor profile are still required.
- Public Article routes still read `public/articles/index.json` and legacy HTML content; public runtime migration from static data to Supabase remains pending.
- Structured block schemas are intentionally JSON-backed in this source checkpoint; richer per-block form controls can be added after the client confirms editorial needs.
- Physical delete controls are intentionally not exposed in this checkpoint; archive is the safe operational path until destructive-delete policy is confirmed.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-MEDIA-LEADS-001` next source-only checkpoint: lead inbox status/notes workflow.
- `NOW-ADMIN-CONTENT-CRUD-001` live save verification and static-to-Supabase content imports.

## Entry - 2026-05-28 (Admin Products CRUD Source)

### Scope
- Replaced the `/admin/products` scaffold with a protected source CRUD screen behind the existing Supabase Auth/profile gate.
- The screen reads product families, product models, material defaults, product specs, Stone Library references, and media options from Supabase.
- Active editor/admin/owner roles can create/update product, model, material-default, and spec records; publish/archive products and models; and keep product configuration structured once browser-safe Supabase config and an active profile exist.
- Added loading, empty, validation, save, publish/archive, material-default, read-only, and error states.
- Kept public Product runtime static/file-backed; static-to-Supabase content import and public read migration remain separate follow-ups.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminProductsPage.tsx`
- `src/pages/admin/adminContent.ts`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 364 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/products` route shell and Forms API checks.
- Playwright CLI with Firefox: pass for `/admin/products` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than Products CRUD content, and console output had 0 errors/warnings.

### Risks and Gaps
- Live Products save verification is not complete because browser-safe Supabase key configuration and an active admin/editor profile are still required.
- Public Product routes still read `src/data/productData.ts`; public runtime migration from static data to Supabase remains pending.
- Physical delete controls are intentionally not exposed in this checkpoint; archive is the safe operational path until destructive-delete policy is confirmed.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CONTENT-CRUD-001` next source-only checkpoint: Articles as structured blocks.
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-28 (Admin Projects CRUD Source)

### Scope
- Replaced the `/admin/projects` scaffold with a protected source CRUD screen behind the existing Supabase Auth/profile gate.
- The screen reads Projects, project facts, material schedule rows, material maps, hotspots, Stone Library references, finish references, and media options from Supabase.
- Active editor/admin/owner roles can create/update project, fact, material, map, and hotspot records; publish/archive projects, maps, and hotspots; and keep claim-review state explicit once browser-safe Supabase config and an active profile exist.
- Added loading, empty, validation, save, publish/archive, claim-review, read-only, and error states.
- Kept public Project runtime static/file-backed; static-to-Supabase content import and public read migration remain separate follow-ups.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `src/pages/admin/adminContent.ts`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 339 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/projects` route shell and Forms API checks.
- Playwright CLI with Firefox: pass for `/admin/projects` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than Projects CRUD content, and console output had 0 errors/warnings.

### Risks and Gaps
- Live Projects save verification is not complete because browser-safe Supabase key configuration and an active admin/editor profile are still required.
- Public Project routes still read `src/data/projectData.ts`; public runtime migration from static data to Supabase remains pending.
- Physical delete controls are intentionally not exposed in this checkpoint; archive is the safe operational path until destructive-delete policy is confirmed.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CONTENT-CRUD-001` next source-only checkpoint: Products.
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-28 (Admin Stone Library CRUD Source)

### Scope
- Replaced the `/admin/stone-library` scaffold with a protected source CRUD screen behind the existing Supabase Auth/profile gate.
- The screen reads Stone Library groups, variants, finish definitions, and finish capability rows from Supabase.
- Active editor/admin/owner roles can create/update stone groups, create/update variants, publish/archive group and variant records, and save per-finish capability rows once browser-safe Supabase config and an active profile exist.
- Added loading, empty, validation, save, publish/archive, read-only, and error states.
- Kept public Stone Library runtime static/file-backed; static-to-Supabase content import and public read migration remain separate follow-ups.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `src/pages/admin/adminContent.ts`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Supabase policy inspection: pass. `stone_groups`, `stone_variants`, `stone_finish_capabilities`, and `finish_definitions` keep active admin-role SELECT/INSERT/UPDATE policies, owner/admin DELETE policies, and published-only public SELECT policies.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 301 kB before gzip.
- `npm run agent:smoke`: pass, including `/admin/stone-library` route shell and Forms API checks.
- Playwright browser QA: pass for `/admin/stone-library` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than Stone Library CRUD content, and console output had 0 errors/warnings. Firefox was installed for local Playwright because local Chrome was unavailable.

### Risks and Gaps
- Live Stone Library save verification is not complete because browser-safe Supabase key configuration and an active editor/admin profile are still required.
- Supabase Stone Library tables currently have finish definitions seeded, but group/variant/capability content import has not been run; the admin UI can create records once live auth is available.
- Public Stone Library routes still read `data/clean/stone_library.json`; public runtime migration from static data to Supabase remains pending.
- Physical delete controls are intentionally not exposed in this checkpoint; archive is the safe operational path until destructive-delete policy is confirmed.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-CONTENT-CRUD-001` next source-only checkpoint: Projects with material maps and hotspots.
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-28 (Admin Media Storage and Library Source)

### Scope
- Added Supabase Storage foundation for Urblo media: `urblo-public-media` for public-safe assets and `urblo-admin-media` for private draft/review assets.
- Added Storage RLS policies for active admin roles and removed broad public object listing after Supabase advisor flagged the risk.
- Added `/admin/media` as the first media library source screen behind the Supabase Auth/profile gate.
- The media screen supports upload-backed draft records, external media records, metadata editing, role-aware read-only behavior, and publish/archive validation.
- Expanded smoke coverage to include `/admin/media`.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminMediaPage.tsx`
- `src/pages/admin/adminContent.ts`
- `supabase/migrations/202605280002_media_storage_foundation.sql`
- `supabase/migrations/202605280003_media_storage_listing_hardening.sql`
- `supabase/migrations/README.md`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Supabase migration list: pass. `media_storage_foundation` and `media_storage_listing_hardening` are listed on project `npkidywzwddbnfrnxlmo`.
- Supabase bucket check: pass. `urblo-public-media` exists as a public bucket with a 25 MB limit; `urblo-admin-media` exists as a private bucket with a 50 MB limit; both allow the launch image/PDF/MP4 MIME set.
- Supabase policy check: pass. Storage object SELECT is available to active admin viewer/editor/admin/owner roles; INSERT/UPDATE to editor/admin/owner; DELETE to owner/admin.
- Supabase security advisor follow-up: pass for the new public bucket listing issue. The broad public `storage.objects` SELECT policy was removed. Existing security-definer function warnings from the foundation helper functions remain as a separate hardening follow-up.
- `npm run build`: pass. Browserslist staleness notice remains; the admin chunk is about 271 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/media` route shell and Forms API checks.
- Playwright browser QA: pass for `/admin/media` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than media library content, and console output was limited to the React DevTools development notice.

### Risks and Gaps
- Live media upload/save verification is not complete because browser-safe Supabase key configuration and an active admin/editor profile are still required.
- The media screen is source-ready but does not yet migrate existing static launch assets into Supabase records.
- Lead inbox remains pending live form persistence and notification verification.
- Supabase advisors still report existing security-definer helper function warnings and expected early-stage unused-index/permissive-policy warnings; those were not introduced by this media checkpoint except where Storage policies depend on the existing admin role helper.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-MEDIA-LEADS-001`
- `NOW-ADMIN-CONTENT-CRUD-001`

## Entry - 2026-05-28 (Admin Settings CRUD and RLS Hardening)

### Scope
- Added `/admin/settings` as the first real admin CRUD source screen behind the Supabase Auth/profile gate.
- The settings form reads or creates the default `site_settings` row and supports status, company name, primary contact, social links, SEO defaults, and footer JSON editing.
- Added role-aware UI so owner/admin can save while editor/viewer sessions stay read-only.
- Added and applied Supabase migration `admin_settings_role_hardening` so `site_settings` INSERT/UPDATE/DELETE policies require owner/admin while SELECT remains available to active viewer/editor/admin/owner profiles.
- Expanded smoke coverage to include `/admin/settings`.

### Changed Files
- `scripts/agent-smoke.sh`
- `src/pages/admin/AdminApp.tsx`
- `src/pages/admin/AdminSettingsPage.tsx`
- `src/pages/admin/adminContent.ts`
- `supabase/migrations/202605280001_admin_settings_role_hardening.sql`
- `supabase/migrations/README.md`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Supabase migration list: pass. `admin_settings_role_hardening` is listed on project `npkidywzwddbnfrnxlmo`.
- Supabase policy check: pass. `site_settings_admin_insert`, `site_settings_admin_update`, and `site_settings_admin_delete` require owner/admin; `site_settings_admin_select` remains viewer/editor/admin/owner.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/settings` route shell and Forms API checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Playwright browser QA: pass for `/admin/settings` with no browser-safe Supabase key configured. The route shows the configuration-required state rather than settings data.

### Risks and Gaps
- Live settings save is not verified because browser-safe Supabase key configuration and an active owner/admin profile are still required.
- Settings is the only CRUD source screen so far; media, Stone Library, Projects, Products, Articles, leads, audit, and admin-user management remain pending.
- The database policy is stricter than the original generic admin-write policy for `site_settings`; this matches `docs/ADMIN_IA_ACCESS.md`.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-SETTINGS-CRUD-001`

## Entry - 2026-05-28 (Admin Auth Shell Source)

### Scope
- Added the first `/admin` runtime shell outside the public site chrome.
- Added browser-side Supabase client configuration using `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`, with no service-role key in browser code.
- Added real Supabase Auth email/password login flow, session validation through `getUser()`, active `admin_profiles` lookup, sign-out, unauthorized state, config-required state, and protected dashboard/module scaffolds.
- Suppressed the public WelcomePopup on admin routes.
- Added `.env.example` for public/server environment variable names and expanded smoke route coverage for `/admin`, `/admin/login`, and `/admin/unauthorized`.

### Changed Files
- `.env.example`
- `.gitignore`
- `package.json`
- `package-lock.json`
- `scripts/agent-smoke.sh`
- `src/App.tsx`
- `src/vite-env.d.ts`
- `src/lib/supabaseClient.ts`
- `src/lib/adminAuth.tsx`
- `src/lib/adminAuthHooks.ts`
- `src/lib/adminAuthState.ts`
- `src/pages/admin`
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains; admin chunk output is about 240 kB before gzip.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin`, `/admin/login`, `/admin/unauthorized`, public route shells, CTA contracts, and Forms API checks.
- Playwright browser QA: pass for `/admin` and `/admin/login` with no browser-safe Supabase key configured. Both routes show the configuration-required state, do not render dashboard content, suppress the public WelcomePopup, and report no console errors beyond React DevTools info.
- `npm audit --omit=dev`: reports existing production dependency advisories in React Router, Swiper, glob/minimatch/picomatch, PostCSS, yaml, and brace-expansion. This checkpoint did not widen into dependency upgrades.

### Risks and Gaps
- Live admin login is not verified because browser-safe Supabase key configuration and Jay's first admin email/profile are still required.
- Active-admin dashboard queries are implemented but unproven against a real authenticated admin session.
- Module routes are protected scaffolds only; content CRUD, media upload, lead management, settings, and audit workflows are still pending.
- Live form persistence still requires server-side `SUPABASE_SERVICE_ROLE_KEY` verification.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-22 (Old-Site Favicon Restoration)

### Scope
- Replaced the temporary SVG favicon with the original WordPress site icon files from the old Urblo site.
- Added controlled local PNG icon assets for 32x32, 192x192, 512x512, Apple touch, and Microsoft tile use.
- Updated `index.html` and `public/site.webmanifest` to reference the old-site-matched PNG icon set.
- Updated architecture and task queue docs so agents do not reintroduce the temporary SVG icon.

### Changed Files
- `index.html`
- `public/favicon.png`
- `public/favicon-32x32.png`
- `public/favicon-192x192.png`
- `public/apple-touch-icon.png`
- `public/mstile-270x270.png`
- Removed the temporary SVG favicon file.
- `public/site.webmanifest`
- `docs/ARCHITECTURE.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: homepage head exposes PNG favicon and Apple touch icon links, no `favicon.svg` reference remains.
- Static asset checks: favicon PNGs and manifest return HTTP 200 from the local dev server.

### Risks and Gaps
- Browser favicon caches can be sticky; production verification should use a hard refresh or a fresh browser profile after deployment.
- Final social share image is still `public/og-default.svg` and remains separate from favicon work.

### Next Handoff
- Continue `NOW-SEO-DELIVERY-001` with article media/HTML cleanup.
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-22 (Legacy Project and Stone Fallback Media)

### Scope
- Migrated legacy project listing/detail images from old WordPress URLs into `public/media/launch/projects`.
- Migrated remaining Stone Library fallback images from old WordPress URLs into `public/media/launch/stone-library/fallbacks`.
- Updated `src/data/projectData.ts` and `src/data/stoneFinishImages.ts` to use controlled local paths.
- Updated asset audit, architecture, handoff, roadmap, and task queue docs to record that direct old WordPress media references are no longer present in runtime data.

### Changed Files
- `public/media/launch/projects`
- `public/media/launch/stone-library/fallbacks`
- `src/data/projectData.ts`
- `src/data/stoneFinishImages.ts`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `rg "urblo.com.au/wp-content/uploads" src public/articles data`: no results.
- Browser QA: Projects list, legacy project detail pages, Stone Library list, and Blueocean stone detail showed no broken images and no old WordPress image URLs.

### Risks and Gaps
- Article list/detail media still contains external Squarespace, Google, and Front email artifacts and should be cleaned through `NOW-SEO-DELIVERY-001` and the Article CMS migration.
- Local launch media remains a stopgap; Supabase/Cloudflare media records are still required for long-term customer-maintained content.

### Next Handoff
- Continue `NOW-SEO-DELIVERY-001` with article media/HTML cleanup.
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-22 (Homepage Video Replacement and P1 Visible Media)

### Scope
- Replaced the old local homepage MP4 with a web-ready H.264 720p export from the user-provided `Urblo_Homepage.mp4`.
- Kept the public runtime path as `public/media/launch/home/urblo-hero.mp4` so the existing homepage and video modal code continues to use the controlled source.
- Migrated homepage section imagery, latest-project thumbnails, Stone Showcase thumbnails, manifesto imagery, partner logos, and video CTA background away from old WordPress URLs.
- Migrated Our Story portraits away from old WordPress URLs and replaced the old carbon banner URL, which returned 404, with the controlled local route banner.
- Updated architecture, asset audit, handoff, roadmap, and task queue docs to reflect the new media state.

### Changed Files
- `public/media/launch/home/urblo-hero.mp4`
- `public/media/launch/homepage`
- `public/media/launch/our-story`
- `src/data/homepage.ts`
- `src/pages/OurStory.tsx`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: desktop homepage selected the new local MP4, reported `readyState=4`, `1280x720`, `17.67s`, and no broken first-screen images; mobile homepage selected no MP4 source and kept the local poster fallback.

### Risks and Gaps
- `NOW-ASSET-MIGRATION-001` remains open because legacy project media, Stone Library fallback media, and article media still need migration.
- The homepage MP4 is controlled locally for launch safety but should still be reviewed for Cloudflare R2 or Stream before production scale.
- The original user-provided HEVC source was not committed; only the web-ready export is in the repository.

### Next Handoff
- Continue `NOW-ASSET-MIGRATION-001` with legacy project media and Stone Library fallback media.
- `NOW-FORMS-SUPABASE-001`
- `NOW-SEO-DELIVERY-001`

## Entry - 2026-05-22 (P0 Launch Media Stopgap)

### Scope
- Downloaded and controlled the launch-critical logo, homepage poster, contact image, and homepage MP4 under `public/media/launch`.
- Generated controlled route banner stopgaps from existing project media because several old WordPress banner URLs now return 404.
- Repointed shared logo, homepage hero media, video modal source, route banners, Contact page imagery, and matching homepage proof imagery away from old WordPress URLs.
- Added mobile homepage video fallback behavior so mobile viewports keep the poster and do not select the 10 MB MP4 source.
- Added a Cloudflare Pages cache rule for unversioned `/media/*` launch assets.
- Updated architecture, handoff, roadmap, task queue, and asset audit docs so the current launch media posture is explicit.

### Changed Files
- `public/_headers`
- `public/media/launch`
- `src/App.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `src/data/siteChrome.ts`
- `src/pages/ContactPage.tsx`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: desktop homepage selected the local MP4 and local poster; mobile homepage selected no MP4 source and kept the local poster; Products, Product detail, Projects, Our Story, Contact, Articles, and Article detail route banners loaded from local `public/media/launch` paths with no broken images observed.

### Risks and Gaps
- `NOW-ASSET-MIGRATION-001` remains open because P1/P2 media still depends on old WordPress, Squarespace, Google, and Front URLs.
- The homepage MP4 is controlled locally for launch safety but should still be reviewed for Cloudflare R2 or Stream before production scale.
- Article cover GIFs and newsletter HTML media remain part of the article CMS cleanup path.
- React Helmet still emits the existing strict-mode dev-console warning.

### Next Handoff
- Continue `NOW-ASSET-MIGRATION-001` with P1 homepage/project/Stone Library media migration.
- `NOW-FORMS-SUPABASE-001`
- `NOW-SEO-DELIVERY-001`

## Entry - 2026-05-22 (Asset Migration Audit)

### Scope
- Added `docs/ASSET_MIGRATION_AUDIT.md` to inventory old WordPress and remote article media dependencies.
- Classified launch media risk into P0, P1, and P2 groups.
- Identified homepage video/poster, logo, route banners, contact image, and share image as pre-cutover risks.
- Documented storage targets for normal images, homepage video, and short-term local stopgap assets.
- Added verification commands for checking residual old-site media references before cutover.

### Changed Files
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/HANDOFF.md`
- `docs/agent/tasks.json`
- `docs/WORKLOG.md`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates intentionally skipped because this is a docs/asset-audit change only.

### Risks and Gaps
- `NOW-ASSET-MIGRATION-001` remains open because the audit is complete but actual media migration is not.
- Homepage video/poster and old WordPress route banners remain runtime dependencies.
- Article media cleanup remains tied to the future article CMS block migration.

### Next Handoff
- Continue `NOW-ASSET-MIGRATION-001` with P0 asset replacement.
- Continue `NOW-SEO-DELIVERY-001` article cleanup and claim-safety review.
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-22 (SEO Metadata Baseline)

### Scope
- Replaced the default Vite title and favicon references in `index.html`.
- Added Urblo favicon, web manifest, and default share image assets.
- Added route-level title, description, canonical, Open Graph, and Twitter metadata through `react-helmet`.
- Removed inactive footer social placeholders for Facebook and YouTube until real destinations are available.
- Tightened visible sustainability wording by replacing obvious typo/placeholder copy and avoiding the prior absolute "100%" carbon wording.

### Changed Files
- `index.html`
- Temporary SVG favicon asset, later replaced by old-site PNG icons.
- `public/og-default.svg`
- `public/site.webmanifest`
- Removed retired Vite favicon asset.
- `src/App.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `src/data/siteChrome.ts`
- `docs/ARCHITECTURE.md`
- `docs/agent/tasks.json`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- `NOW-SEO-DELIVERY-001` remains open because article cleanup and broader claim-safety review are not complete.
- Default share image is an SVG placeholder asset; a production PNG/JPEG share image should be considered after media migration.
- `react-helmet` strict-mode warning remains a known dev-console issue.

### Next Handoff
- Continue `NOW-SEO-DELIVERY-001`.
- `NOW-ASSET-MIGRATION-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-22 (Cloudflare Pages Repo Prep)

### Scope
- Switched routing from `HashRouter` to `BrowserRouter` for Cloudflare-friendly clean URLs.
- Changed Vite `base` to `/` for root-domain Pages deployment and direct-refresh asset loading.
- Added Cloudflare Pages static config: `public/_redirects`, `public/_routes.json`, and `public/_headers`.
- Updated smoke checks from hash routes to clean routes, including product and project detail paths.
- Added `docs/CLOUDFLARE_DEPLOYMENT.md` as the deployment, environment, preview, DNS, and rollback runbook.
- Marked `NEXT-ROUTER-SEO-001` done and marked `NOW-CLOUDFLARE-PAGES-DEPLOY-001` blocked at account-level setup after repo-side prep.

### Changed Files
- `src/App.tsx`
- `vite.config.ts`
- `public/_redirects`
- `public/_routes.json`
- `public/_headers`
- `scripts/agent-smoke.sh`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass for clean routes `/`, `/stone-library`, `/stone-library/alpine-white`, `/products`, `/products/primeBlock`, `/projects`, `/projects/moon-gate-woolley-street`, `/our-story`, `/contact`, `/articles`, plus `/articles/index.json`.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Cloudflare dashboard project creation, preview URL validation, custom domain, DNS cutover, and rollback still require account access.
- The current GitHub Pages workflow remains as a legacy path and may not represent final launch behavior.
- BrowserRouter clean URLs rely on the Cloudflare Pages SPA fallback when deployed.

### Next Handoff
- `NOW-SEO-DELIVERY-001`
- `NOW-ASSET-MIGRATION-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-22 (Supabase Schema Plan)

### Scope
- Closed `NOW-CLOUDFLARE-SUPABASE-ARCH-001` after the launch architecture and cost model were pushed to origin.
- Added `docs/SUPABASE_SCHEMA.md` as the first Supabase schema design contract.
- Covered admin roles, site settings, media assets, Stone Library, Products, Projects, Articles, enquiries, sample requests, RLS expectations, indexes, and migration phases.
- Added Products to the CMS and schema scope so product pages are not left as static code-only data.
- Updated launch, architecture, roadmap, task queue, and handoff docs to point at the schema plan.

### Changed Files
- `docs/SUPABASE_SCHEMA.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`
- `docs/WORKLOG.md`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates intentionally skipped because this is a docs/schema planning change only.

### Risks and Gaps
- The schema is documented but has not been implemented as Supabase migrations.
- RLS policies, storage buckets, admin users, seed scripts, and form APIs still need implementation and live verification.
- Actual Cloudflare and Supabase project setup requires account access.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-22 (Cloudflare + Supabase Launch Harness)

### Scope
- Recorded the launch decision to use Cloudflare Pages, Cloudflare Pages Functions, Supabase, and an Urblo-owned admin CMS.
- Added a long-form launch plan with monthly platform cost planning, required workstreams, and launch readiness gates.
- Recorded that `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md` is temporary before launch and must be consolidated into architecture, operations, and worklog docs after production launch.
- Updated machine task priority so Cloudflare/Supabase schema, deployment, forms, admin CMS, media migration, and SEO delivery are the active launch track.
- Added verification profiles for Cloudflare deployment, Supabase schema/data migration, backend API/forms, and admin CMS work.
- Updated handoff and roadmap docs to distinguish current static/file-backed runtime reality from the target launch architecture.

### Changed Files
- `AGENTS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates intentionally skipped because this is a docs/harness planning change only.

### Risks and Gaps
- Runtime code still deploys as a static app and still uses mailto/local-only form behavior until implementation tasks are completed.
- Supabase schema, RLS, Auth, Storage, Pages Functions, transactional email, and `/admin` are not yet implemented.
- Cloudflare Pages project, environment variables, DNS cutover, and rollback still need implementation and verification.
- Platform costs are estimates and must be rechecked before billing commitments or major usage changes.

### Next Handoff
- `NOW-CLOUDFLARE-SUPABASE-ARCH-001`
- `NOW-SUPABASE-SCHEMA-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-05-18 (Project Typography Alignment)

### Scope
- Verified the live Urblo project archive/detail title system against `urblo.com.au`: project H1 uses `Avenir LT Std`, light `300`, normal letter spacing, and no forced uppercase.
- Replaced the local project archive/detail title treatment that was inheriting the heavier `Space Grotesk` display style.
- Added project-specific typography utilities for project page titles, project hero titles, section headings, and material/card titles.
- Updated Project listing, Project detail, Project cards, and Material Map inspector headings to use the project typography system.
- Updated design and handoff docs so future project pages preserve the live Urblo title pattern.

### Changed Files
- `src/index.css`
- `src/pages/Projects.tsx`
- `src/pages/ProjectDetails.tsx`
- `src/components/ProjectCard.tsx`
- `src/components/projects/ProjectMaterialMap.tsx`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- Playwright visual QA: local Moon Gate project H1 computed styles matched the live Urblo project-title pattern for family, weight, size, line-height, letter spacing, and text transform.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The broader site still keeps its existing `urblo-page-title` display treatment outside project pages; this change intentionally scopes the live Avenir title correction to Projects.
- Bundle size warning (`>500kB`) remains out of scope.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-DELIVERY-READINESS-001`

## Entry - 2026-05-18 (Project Material Map Refinement)

### Scope
- Refined the Moon Gate project page from a broad editorial case-study layout into a material-first project detail flow.
- Removed the heavy conceptual `Surface / Void / Pause` narrative modules from the rendered page.
- Reworked `ProjectMaterialMap` so hotspots identify stone/finish/application placement and resolve stone labels, finish labels, preview imagery, and links through `StoneLibraryService`.
- Replaced large featured-material cards with a compact material schedule.
- Fixed the legacy project detail copy path so non-Moon Gate projects no longer inherit Moon Gate-specific narrative text.
- Updated architecture, design, and handoff docs to reflect the material-first hotspot contract.

### Changed Files
- `src/components/projects/ProjectMaterialMap.tsx`
- `src/data/projectData.ts`
- `src/pages/ProjectDetails.tsx`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass.
- `git diff --check`: pass.
- Playwright visual QA: desktop and mobile Moon Gate detail page checked locally; hotspot click changed the active material inspector.
- Playwright visual QA: legacy ACU project detail checked locally; Moon Gate-specific copy was absent.

### Risks and Gaps
- Moon Gate material/application notes remain MVP-inferred and need designer/project-team confirmation before final production claims.
- Other project pages still use legacy-level content until migrated.
- Bundle size warning (`>500kB`) remains out of scope.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-DELIVERY-READINESS-001`

## Entry - 2026-05-15 (Moon Gate Project Material Map MVP)

### Scope
- Built `Moon Gate | Woolley Street` as the first designer-facing project case study and Project Material Map MVP.
- Copied supplied Moon Garden imagery into controlled deployment assets under `public/images/projects/moon-gate`.
- Unified project listing/detail metadata through `src/data/projectData.ts` and closed the previous project data drift task.
- Added reusable hotspot interaction through `src/components/projects/ProjectMaterialMap.tsx`.
- Rebuilt project detail layout around a page-owned hero, project facts, design narrative, material map, Urblo scope, featured materials, gallery, and CTA.
- Linked Moon Gate featured materials to Stone Library entries for Angola Black and New Grey.
- Updated architecture/design/handoff/task docs for the new project data and interaction contract.

### Changed Files
- `.gitignore`
- `src/App.tsx`
- `src/components/projects/ProjectMaterialMap.tsx`
- `src/data/projectData.ts`
- `src/layouts/DefaultLayout.tsx`
- `src/pages/ProjectDetails.tsx`
- `src/pages/Projects.tsx`
- `public/images/projects/moon-gate/*`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass (existing bundle size warning and Browserslist staleness notice remain).
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- Playwright CLI visual QA: desktop and mobile Moon Gate detail page checked; hotspot hover/tap changed active cards.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Moon Gate scope/design copy is MVP-inferred from supplied imagery, confirmed finish notes, and public project context; designer confirmation is still needed before treating it as final project truth.
- New Grey finish is recorded as Flamed per user confirmation; Angola Black remains Polished.
- Quantity is presented as `5 bespoke stone elements` based on the previous `5 Units` field and should be confirmed later.
- Other projects still use legacy-level project detail content until migrated into the material-map model.
- React Helmet still emits an existing dev strict-mode lifecycle warning.
- Bundle size warning (`>500kB`) remains out of scope.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-DELIVERY-READINESS-001`

## Entry - 2026-05-15 (Agent Init and Static Smoke Harness)

### Scope
- Added `scripts/agent-init.sh` and package script `npm run agent:init` for quick repo/status/read-order briefing.
- Added `scripts/agent-smoke.sh` and package script `npm run agent:smoke` for lightweight Vite preview smoke checks across key hash routes and `public/articles/index.json`.
- Updated `AGENTS.md`, `docs/HANDOFF.md`, `docs/ARCHITECTURE.md`, `docs/NEXT_STEPS.md`, and `docs/agent/verification.md` to include the new Phase 2 commands.
- Removed the temporary missing-file allowance for `scripts/agent-smoke.sh` now that the script exists.

### Changed Files
- `AGENTS.md`
- `package.json`
- `docs/HANDOFF.md`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/verification.md`
- `scripts/agent-init.sh`
- `scripts/agent-smoke.sh`
- `scripts/check-doc-paths.mjs`
- `scripts/check-harness.mjs`

### Verification Results
- `npm run agent:check`: pass.
- `npm run agent:init`: pass.
- `npm run agent:smoke`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- `agent:smoke` is a static shell smoke using Vite preview; it does not replace future browser-rendered visual or interaction checks.
- Runtime application gates remain last measured on 2026-05-08 unless a runtime task reruns them.

## Entry - 2026-05-15 (AI Harness Root Entry + Design Contract)

### Scope
- Promoted the agent harness entry from `docs/README_AGENT.md` to root-level `AGENTS.md` so Codex has a clear project entry point.
- Added `docs/DESIGN.md` as the canonical design contract for visual rhythm, UX tone, page archetypes, Stone Library behavior, imagery, copy claim posture, and design QA.
- Updated brand/architecture/backlog docs to separate brand authority from design execution authority.
- Refreshed stale harness wording around quality gate measurement and the old live-browsing limitation note.
- Converted committed docs to repo-root relative paths and added a rule to keep local absolute paths out of repo docs.
- Rephrased archived source references in `docs/brand-baseline.md` and `docs/DESIGN.md` so external materials are not presented as repo files.
- Added Phase 1 harness artifacts: `docs/HANDOFF.md`, `docs/agent/tasks.json`, `docs/agent/verification.md`, `scripts/check-doc-paths.mjs`, and `scripts/check-harness.mjs`.
- Slimmed `docs/NEXT_STEPS.md` into a human-readable roadmap backed by the machine-readable task queue.

### Changed Files
- `AGENTS.md`
- `package.json`
- `docs/README_AGENT.md` (retired)
- `docs/HANDOFF.md`
- `docs/DESIGN.md`
- `docs/brand-baseline.md`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-doc-paths.mjs`
- `scripts/check-harness.mjs`

### Verification Results
- Documentation-only change; runtime gates were not rerun.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- `DESIGN.md` is a first canonical pass and should evolve after final Figma/WordPress parity decisions.
- Runtime quality gates remain last measured on 2026-05-08.

## Entry - 2026-05-08 (Stone Library Visual Density Polish)

### Scope
- Restyled Stone Library list/detail surfaces into a tighter material-library tool experience.
- Removed the empty black banner on Stone Library list/detail routes by using the header-only default layout spacer.
- Tightened list page hero spacing, filter control sizing, card image ratio, card typography, status badges, card borders, and placeholder imagery.
- Reduced Stone Library detail media stage scale and improved finish selector text contrast/readability, especially on mobile.
- Kept route behavior, filtering behavior, finish selection, centering, and lightbox behavior unchanged.

### Changed Files
- `src/App.tsx`
- `src/pages/StoneLibraryPage.tsx`
- `src/pages/StoneLibraryDetailPage.tsx`
- `src/components/stone-library/FilterBar.tsx`
- `src/components/stone-library/StoneCard.tsx`
- `src/components/stone-library/ImageStage.tsx`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/SpecsPanel.tsx`
- `src/service/StoneLibraryService.ts`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass
- Playwright CLI visual smoke check:
  - `/stone-library` desktop: compact header, tighter filter bar, four-column material cards, lighter missing-image placeholder.
  - `/stone-library` mobile: stacked filter controls and first card render without horizontal overflow.
  - `/stone-library/alpine-white` desktop: reduced media stage scale, readable finish selector, specs visible below the comparison surface.
  - `/stone-library/alpine-white` mobile: no horizontal document overflow (`scrollWidth` equals `clientWidth` at 390px).

### Risks and Gaps
- React Helmet still emits the known strict-mode `UNSAFE_componentWillMount` console warning via `SideEffect(NullComponent2)`.
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.
- Long-tail Stone Library image mapping gaps remain under existing image backlog items.

### Next Handoff
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-DELIVERY-READINESS-001`
- `NOW-ASSET-STRATEGY-001`
- `NOW-DEPLOY-PAGES-HARDEN-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-08 (Contact Route + Our Story Team Update + Docs Contract Sync)

### Scope
- Removed Bob Lu and Hunter from the Our Story team section.
- Replaced the four-person Swiper carousel with a stable two-person responsive grid for Natalie and Cameron.
- Added a `/contact` route with direct email/phone/address contact channels and a no-backend project-brief form that opens a prefilled email draft.
- Updated shared header/footer navigation so Contact Us points to `/contact`; Sample Request remains a `mailto:` fallback.
- Updated active harness docs to remove stale footer route mismatch claims and old component references in the backlog.

### Changed Files
- `src/App.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/OurStory.tsx`
- `src/data/siteChrome.ts`
- `src/components/site/SiteFooter.tsx`
- `docs/README_AGENT.md`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass
- Playwright CLI smoke check:
  - `/contact`: route loads with title `Urblo - Contact Us`; header/footer Contact links resolve to `#/contact`; Sample Request resolves to `mailto:info@urblo.com.au?subject=Sample%20Request`.
  - `/contact` mobile viewport: header collapses to the existing toggle menu and Contact Us remains available in the expanded menu.
  - `/our-story`: route loads with title `Urblo - Our Story`; team section renders only Natalie and Cameron.

### Risks and Gaps
- Contact form is intentionally not a backend submission; it opens a prefilled email draft through `mailto:`.
- React Helmet still emits the known strict-mode `UNSAFE_componentWillMount` console warning via `SideEffect(NullComponent2)`.
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.

### Next Handoff
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-DELIVERY-READINESS-001`
- `NOW-ASSET-STRATEGY-001`
- `NOW-DEPLOY-PAGES-HARDEN-001`
- `NEXT-UI-PARITY-001`
- `NEXT-SAMPLE-REQUEST-001`

## Entry - 2026-03-26 (Homepage Rebuild + Local Font Hosting)

### Scope
- Rebuilt the homepage from the legacy tabbed `FeatureSection` into a dedicated long-form landing page composed of:
  - hero
  - sustainability
  - trusted partner banner
  - product showcase
  - metrics
  - latest projects
  - stone showcase
  - manifesto
  - video CTA
- Added a homepage-only layout so the new Figma-style header/footer does not change non-home routes.
- Localized homepage fonts into `public/fonts/urblo`:
  - `Avenir LT Std`
  - `Didot LT Std`
  - `Space Grotesk`
- Removed the old home-only tab/panel component stack after confirming it was no longer referenced.
- Kept homepage images/video remote for this phase; only fonts were moved on-platform.

### Changed Files
- `src/App.tsx`
- `src/pages/Home.tsx`
- `src/index.css`
- `src/layouts/HomepageLayout.tsx`
- `src/components/homepage/HomepageHeader.tsx`
- `src/components/homepage/HomepageFooter.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `public/fonts/urblo/*`
- `docs/ARCHITECTURE.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Homepage still depends on remote WordPress-hosted image/video assets by design for this phase.
- Bundle size warning (`>500kB`) remains unchanged from prior sessions.
- `docs/NEXT_STEPS.md` already had user-side uncommitted changes and was left untouched in this session.

## Baseline Entry - 2026-02-09 (Docs Reset)

### Scope
- Full rewrite of active execution docs to code-truth baseline:
  - `docs/README_AGENT.md`
  - `docs/ARCHITECTURE.md`
  - `docs/NEXT_STEPS.md`
  - `docs/WORKLOG.md`
- `docs/brand-baseline.md` kept read-only.

### Rationale
- Active docs contained legacy project assumptions and outdated technical contracts.
- Objective of this reset: make docs executable for future agents using current repository facts, while keeping brand baseline linked as advisory decision rubric.

### Measured Current State
- `npm run build`: pass
- `npm run lint`: fail
  - 3 errors from linting generated file under `.vite/deps/react-router-dom.js`
  - 1 warning in `src/pages/ProductDetailPage.tsx`
- `npx tsc -b`: pass

### Key Risks at Handoff
- Navigation links to routes not declared in router (`/sample-request`, `/contact`, `/en-au/contact-us`).
- Internal anchor usage is inconsistent with `HashRouter` behavior.
- Duplicate `/products` route declaration exists in `src/App.tsx`.
- Lint gate is currently blocking and must be fixed before feature delivery closure.

### Next Handoff Focus
- Execute in order:
  - `NOW-ROUTE-001`
  - `NOW-LINT-001`
  - `NOW-RUNBOOK-001`
- Keep brand baseline advisory linkage in all user-facing tasks.

## Entry - 2026-02-09 (Stone Library Refactor + Docs Closure)

### Scope
- Replaced legacy Material/New Material route family with a unified Stone Library experience:
  - `/stone-library`
  - `/stone-library/:stoneGroupId`
- Introduced Stone Library typed contracts, service layer, filters, detail variant switching, and finish accordion UX.
- Migrated product body-stone options from removed `materialData.ts` to `StoneLibraryService` output.
- Removed obsolete material pages/components/data that were no longer referenced.
- Updated docs to match post-refactor route/data contracts and quality gate reality.

### Changed Files (This Session)
- `src/App.tsx`
- `src/components/Header.tsx`
- `src/pages/StoneLibraryPage.tsx`
- `src/pages/StoneLibraryDetailPage.tsx`
- `src/components/stone-library/FilterBar.tsx`
- `src/components/stone-library/StoneCard.tsx`
- `src/components/stone-library/VariantSwitch.tsx`
- `src/components/stone-library/ImageStage.tsx`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/SpecsPanel.tsx`
- `src/types/stone-library.ts`
- `src/service/StoneLibraryService.ts`
- `src/data/finishBehaviorMeta.ts`
- `src/data/stoneFinishImages.ts`
- `src/pages/ProductDetailPage.tsx`
- `src/data/productData.ts`
- `src/types/product.ts`
- `tsconfig.app.json`
- `eslint.config.js`
- `docs/README_AGENT.md`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Footer still links to undeclared in-app routes (`/sample-request`, `/contact`) and needs route-safe remediation.
- Stone finish HD imagery mapping is still partial and currently falls back to placeholders/defaults where missing.
- Finish behavior notes are currently generic defaults and should be replaced with approved production copy.
- Bundle warning (`>500kB`) remains and requires code-splitting work.

### Next Handoff
- `NOW-ROUTE-002`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-DATA-001`

## Entry - 2026-02-09 (Variant Correction + Product Group Mode)

### Scope
- Corrected Stone Library variant behavior to match business rules:
  - Golden Crust: only Light/Dark
  - Harcourt: no variant switch (single base stone)
  - Tuscany: only Vein Cut/Cross Cut
- Applied fixes in both clean runtime data and service-layer normalization to prevent future source regression from leaking into UI.
- Updated Products body-stone selector to group-level options only (no variant-level entries in selector UI).
- Deferred dual-side accordion and price-tier visualization to documented backlog with explicit acceptance criteria.

### Changed Files
- `data/clean/stone_library.json`
- `data/clean/stone_variants.csv`
- `src/service/StoneLibraryService.ts`
- `src/pages/ProductDetailPage.tsx`
- `src/types/product.ts`
- `src/data/productData.ts`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Sample-related clean files (`sample_catalog.json`, `sample_items.csv`, `stone_finish_capabilities.csv`) still contain legacy variant entries by design for this scope and may diverge from Stone Library display rules.
- Left-side media on detail page is not yet a true image accordion; right list still drives current active preview.
- Price range display remains textual (`$ / $$ / $$$`) and is pending tier-meter redesign.

### Next Handoff
- `NEXT-STONELIB-UX-ACC-001`
- `NEXT-STONELIB-PRICE-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-DATA-001`

## Entry - 2026-02-09 (Stone Library UI Interaction Closure)

### Scope
- Finalized Stone Library detail interaction contract for selection stability and texture inspection:
  - Right-side finish list switched to click-only selection (no hover-triggered active changes).
  - Left image accordion retained hover preview + click lock behavior.
- Removed heavy in-image dark overlay/caption treatment on active panels and kept cleaner finish-first visual treatment.
- Enforced active panel 3:2 presentation with narrow collapsed panels and horizontal overflow-safe behavior.
- Added finish lightbox for deep visual review:
  - full-screen open/close, prev/next, keyboard shortcuts, and 1x/2x zoom with drag-pan.
- Updated architecture/backlog docs to reflect new runtime interaction contract and completed UX task.

### Changed Files
- `src/components/stone-library/ImageStage.tsx`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/FinishLightbox.tsx`
- `src/pages/StoneLibraryDetailPage.tsx`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Bundle size warning (`>500kB`) remains and is unchanged by this scope.
- `react-helmet` strict-mode lifecycle warning remains unrelated and is not addressed in this session.

### Next Handoff
- `NEXT-STONELIB-LAYOUT-001`
- `NEXT-STONELIB-PRICE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-02-09 (Stone Library Click-Only + Finish Centering)

### Scope
- Converted Stone Library left image accordion from hover-preview behavior to click-only finish selection.
- Added active finish centering behavior so each finish selection click re-centers the left-stage active panel.
- Simplified finish state composition in detail page by removing preview state and adding a center-request token.
- Updated architecture and backlog docs to match the new interaction contract.

### Changed Files
- `src/pages/StoneLibraryDetailPage.tsx`
- `src/components/stone-library/ImageStage.tsx`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.
- Left-stage centering behavior currently assumes smooth scrolling; reduced-motion preference handling is not yet added.

### Next Handoff
- `NEXT-STONELIB-LAYOUT-001`
- `NEXT-STONELIB-PRICE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-02-09 (Stone Library Finish Visibility Guard)

### Scope
- Added a visibility guard to Stone Library left-stage auto-scroll behavior.
- Finish selection now keeps current scroll position when the active panel is fully visible in the horizontal viewport.
- Auto-scroll executes only when active panel is clipped or out of frame, then uses best-effort smooth centering.
- Updated architecture contract wording to match the new “visible then no-move” rule.

### Changed Files
- `src/components/stone-library/ImageStage.tsx`
- `docs/ARCHITECTURE.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.

### Next Handoff
- `NEXT-STONELIB-LAYOUT-001`
- `NEXT-STONELIB-PRICE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-02-09 (Stone Library Low-Finish Viewport Fill)

### Scope
- Added low-finish viewport fill behavior to Stone Library left media stage.
- Kept active panel fixed at 3:2 while expanding non-active panel widths when default widths do not fill the stage viewport.
- Added single-finish layout behavior that keeps the lone 3:2 panel centered instead of stretching full width.
- Kept existing visibility-guarded scrolling policy: no scroll movement when active panel is fully visible.
- Updated architecture/backlog docs to reflect this interaction contract.

### Changed Files
- `src/components/stone-library/ImageStage.tsx`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.
- Fill-width computation depends on runtime measurement and may need tuning if panel gap token changes in future style updates.

### Next Handoff
- `NEXT-STONELIB-LAYOUT-001`
- `NEXT-STONELIB-PRICE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-02-09 (Stone Library Motion Debounce Tuning)

### Scope
- Tuned ImageStage interaction to remove perceived “second tug” after finish selection.
- Removed delayed second-pass centering and replaced resize-driven width recompute with debounced scheduling.
- Added fill-width state change guard to avoid redundant updates when measured width drift is negligible.

### Changed Files
- `src/components/stone-library/ImageStage.tsx`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.

### Next Handoff
- `NEXT-STONELIB-LAYOUT-001`
- `NEXT-STONELIB-PRICE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-02-09 (Stone Library Width/Center Motion Refactor)

### Scope
- Refactored Stone Library ImageStage motion system to stabilize centering and remove race conditions between width recompute and scroll decisions.
- Separated layout engine (inactive fill width computation) from scroll engine (click-token visibility-check scroll).
- Replaced width animation with immediate width updates; retained smooth scrolling only when active panel is clipped.
- Added strict-mode guard using center token tracking to prevent duplicate scroll decisions from effect double-invocation.

### Changed Files
- `src/components/stone-library/ImageStage.tsx`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.
- Runtime width measurement still depends on current gap token values and should be re-checked if stage spacing styles change.

### Next Handoff
- `NEXT-STONELIB-LAYOUT-001`
- `NEXT-STONELIB-PRICE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-02-09 (Popup Persistence Fix + Price Tier Meter + Backlog Closure)

### Scope
- Fixed welcome popup persistence behavior so first display writes `seenPopup` and prevents repeat display on later visits.
- Replaced plain stone detail price text with a 3-level visual tier meter (`Budget / Balanced / Premium`) while preserving source notation (`$ / $$ / $$$`) for traceability.
- Applied graceful fallback to `Price on request` for `tbc` stones or missing/invalid tier values.
- Closed `NEXT-STONELIB-LAYOUT-001` by user acceptance and moved both layout/price tasks from `Next` to `Done` in backlog docs.
- Updated architecture and execution docs to keep runtime contracts synchronized.

### Changed Files
- `src/components/WelcomePopup.tsx`
- `src/types/stone-library.ts`
- `src/service/StoneLibraryService.ts`
- `src/components/stone-library/SpecsPanel.tsx`
- `src/pages/StoneLibraryDetailPage.tsx`
- `docs/README_AGENT.md`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass (chunk size warning `>500kB` unchanged; Browserslist data staleness notice shown)
- `npm run lint`: pass
- `npx tsc -b`: pass

### Risks and Gaps
- Footer still links to undeclared routes (`/sample-request`, `/contact`) until `NOW-ROUTE-002` closes.
- Bundle size warning (`>500kB`) remains and is not addressed in this scope.
- Stone Library image and finish-data completion work remains open under existing now/next tasks.

### Next Handoff
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-DELIVERY-READINESS-001`
- `NOW-ASSET-STRATEGY-001`
- `NOW-ROUTE-002`
- `NEXT-UI-PARITY-001`
- `NEXT-SAMPLE-REQUEST-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-IMG-002`
- `NEXT-STONELIB-DATA-001`
- `NEXT-DATA-001`

## Entry - 2026-05-22 (Article Media Launch Cleanup)

### Scope
- Replaced article list/detail cover GIF URLs with controlled local WebP still images under `public/media/launch/articles`.
- Added runtime article HTML preparation before DOMPurify sanitization so known Squarespace/Front/Google proxy images resolve to local media, Google emoji images become text, and known campaign/unsubscribe/old-upload links are stripped or rewritten.
- Kept raw newsletter HTML as migration source only; long-term article authoring remains Supabase structured blocks through the admin CMS.
- Updated architecture, asset audit, handoff, roadmap, and machine task queue to reflect the current article stopgap and remaining CMS work.

### Changed Files
- `public/media/launch/articles`
- `public/articles/index.json`
- `public/articles/*/meta.json`
- `src/lib/articleMedia.ts`
- `src/components/ArticleCard.tsx`
- `src/pages/ArticlePage.tsx`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass with existing bundle size warning and Browserslist staleness notice.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- Browser QA: `/articles` renders four local article covers; all four article detail routes render article text and, after lazy-load scroll, have zero known external/proxy article image URLs and zero known campaign/unsubscribe/Google redirect/old upload links.

### Risks and Gaps
- Raw newsletter HTML remains in `public/articles/*/content.html`; this is acceptable only as a migration source until Supabase structured article blocks are implemented.
- Article image ownership, alt text, and source metadata still need Supabase media records.
- React Helmet strict-mode warning remains an existing development-console issue.
- Bundle size warning remains and is not addressed in this scope.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-DELIVERY-READINESS-001`

## Entry - 2026-05-22 (Delivery Readiness Cleanup)

### Scope
- Replaced the default Vite starter README with an Urblo-specific project README.
- Removed the unused React starter SVG asset from the starter assets folder.
- Marked `NOW-DELIVERY-READINESS-001` done because the active app metadata, favicon, footer social destinations, README handoff, and starter asset cleanup no longer expose template defaults.

### Changed Files
- `README.md`
- `src/assets/*`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass with existing bundle size warning and Browserslist staleness notice.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Final share imagery and deeper claim-safety review remain under `NOW-SEO-DELIVERY-001`.
- Contact and Sample Request still need Supabase-backed implementation.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-ASSET-STRATEGY-001`

## Entry - 2026-05-22 (Asset Hosting Strategy Closure)

### Scope
- Closed `NOW-ASSET-STRATEGY-001` because the interim and delivery-phase media hosting policy is now explicit.
- Current phase: controlled local assets under `public/media/launch` for launch-critical static media until backend storage is available.
- Delivery phase: Supabase Storage for normal CMS-managed media, with Cloudflare R2 or Stream reviewed separately for large homepage video delivery.
- Kept migration sequence, owners, and residual risks in the asset audit and architecture docs.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The policy is documented, but Supabase Storage buckets, media records, and upload workflows are not implemented yet.
- Homepage video still needs a final R2/Stream decision before production scale.

### Next Handoff
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-22 (Stone Library Image Fast-Track Closure)

### Scope
- Confirmed the provided primary Stone Library finish assets are mapped through the runtime image layer.
- Recorded current Stone Library image coverage so future agents and the client can distinguish real mapped finish photos, controlled temporary fallback images, and true missing source images.
- Closed `NOW-STONELIB-IMG-FASTTRACK-001`; final HD image sourcing remains under `NEXT-STONELIB-IMG-001`, and secondary Juparana/Zen Grey frame behavior remains under `NEXT-STONELIB-IMG-002`.

### Changed Files
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass with existing bundle size warning and Browserslist staleness notice.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Golden Crust, Harcourt, and Tan Brown still need approved HD source images before the Stone Library can be called visually complete.
- Blueocean, Honey Comb, and Tuscany use controlled local fallback imagery but still need finish-specific HD coverage.
- Juparana and Zen Grey secondary source frames exist but need an approved presentation pattern before implementation.

### Next Handoff
- `NOW-SEO-DELIVERY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-22 (SEO Social and Claim-Safety Cleanup)

### Scope
- Added a controlled 1200 x 630 PNG social share image and updated default Open Graph/Twitter metadata to use it.
- Kept the SVG social image as the editable source and adjusted the source text so it does not clip when exported.
- Rewrote article excerpts away from unqualified carbon, cost, speed, and universal-performance claims.
- Added a runtime article cleanup layer for known high-risk newsletter phrases so public article detail pages render safer wording until the Supabase structured article system replaces raw newsletter HTML.
- Closed `NOW-SEO-DELIVERY-001`.

### Changed Files
- `index.html`
- `public/og-default.png`
- `public/og-default.svg`
- `public/articles/index.json`
- `public/articles/*/meta.json`
- `src/App.tsx`
- `src/lib/articleMedia.ts`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass with existing bundle size warning and Browserslist staleness notice.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Raw article newsletter HTML is still not the final article model; it should move to Supabase structured blocks with editorial review.
- The React Helmet strict-mode warning remains.
- Bundle size warning remains and is the next no-secret launch-quality task.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `LATER-PERF-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-22 (Route-Level Code Splitting)

### Scope
- Converted public page components in `src/App.tsx` to lazy-loaded route modules while keeping existing layouts, route paths, and metadata behavior intact.
- Added a small route-loading fallback inside the existing page layout surfaces.
- Reduced the initial JavaScript app shell from about 674 kB to about 255 kB in the Vite production build.
- Closed `LATER-PERF-001`; the previous `>500kB` JavaScript chunk warning no longer appears.

### Changed Files
- `AGENTS.md`
- `src/App.tsx`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass; no `>500kB` JavaScript chunk warning, with the existing Browserslist staleness notice only.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Future admin/CMS features can reintroduce large chunks if not split deliberately.
- React Helmet strict-mode warning remains.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `LATER-QA-001`

## Entry - 2026-05-22 (Smoke CTA Coverage)

### Scope
- Expanded `npm run agent:smoke` beyond route-shell and article-index checks.
- Added named CTA contract checks for Contact navigation, Sample Request mailto fallback, homepage Contact/Sample Request fallbacks, Moon Gate CTAs, Contact page Stone Library CTA, and stone detail phone CTA.
- Closed `LATER-QA-001` because smoke failures now report actionable route/CTA names.

### Changed Files
- `scripts/agent-smoke.sh`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Smoke checks are still contract-level checks, not full browser interaction tests.
- Supabase-backed forms are still not implemented, so Sample Request remains a verified mailto fallback only.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `NEXT-PROJECTS-INTAKE-001`
- `NEXT-STONELIB-DATA-001`

## Entry - 2026-05-22 (Homepage Stone Section Removal and Full-Site UI QA)

### Scope
- Removed the homepage `Browse by stone type` section by request, including the unused source type/data and four local showcase images.
- Polished obvious homepage/product copy issues surfaced during the QA pass: removed unfinished ellipses, corrected `student accommodation`, corrected `street furniture`, and fixed the product heading text spacing.
- Added runtime article safeguards for legacy newsletter HTML: mobile table/media constraints, dead-link unwrapping, stronger loading behavior, and additional claim-sensitive phrase rewrites.
- Initialized product detail default material selections and corrected duplicate `Timber Flush +` model labels where they were intended to be `Timber Rise +`.
- Used two read-only subagents for independent route/UI and customer/content QA, then converted the unresolved findings into machine-readable Harness tasks.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `src/data/productData.ts`
- `src/pages/ProductDetailPage.tsx`
- `src/pages/ArticlePage.tsx`
- `src/lib/articleMedia.ts`
- `src/index.css`
- Deleted four former homepage stone showcase images from `public/media/launch/homepage`.
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass; no `>500kB` JavaScript chunk warning, with the existing Browserslist staleness notice only.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser desktop QA on `http://127.0.0.1:4174`: Home no longer contains `Browse by stone type`, Home and Prime Block have no broken images or horizontal overflow, Prime Block initializes New Grey, Stainless Steel Finish, and Spotted-Gum Timber, and the known React Helmet strict-mode warning remains.
- Playwright mobile fallback QA at 390px: `/articles/Debunking-the-Cost-Myth-by-Urblo-Bluestone-Blocks` had `scrollWidth` 390, zero horizontal overflow, zero broken images, zero empty links, and no flagged `Guaranteed Quality`, `zero cracks`, `3-10-week curing cycle`, `30% faster`, or `flawless alignment` text.

### Risks and Gaps
- Unknown URLs still render Home until `NOW-ROUTE-ERROR-STATES-001`.
- Articles still need structured blocks and full editorial approval under `NOW-ARTICLE-STRUCTURE-CLAIMS-001`.
- Product detail configuration still needs stronger conversion feedback and CTA under `NEXT-PRODUCT-DETAIL-CONVERSION-001`.
- Stone Library still needs approved source imagery for Golden Crust, Harcourt, and Tan Brown under `NEXT-STONELIB-IMG-001`.
- Legacy project pages remain less complete than Moon Gate and need migration under `NEXT-PROJECTS-INTAKE-001`.
- URL slug normalization should be decided before production indexing under `NEXT-SLUG-URL-NORMALIZE-001`.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ROUTE-ERROR-STATES-001`
- `NOW-ARTICLE-STRUCTURE-CLAIMS-001`
- `NEXT-PRODUCT-DETAIL-CONVERSION-001`
- `NEXT-PROJECTS-INTAKE-001`

## Entry - 2026-05-22 (Stone Library Drive Source Task)

### Scope
- Recorded the Saistone Google Drive shared folder named `Urblo Digital Stone Library` as the temporary source of truth for Stone Library imagery.
- Added `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001` to compare the shared-drive source against current website mappings and identify stale, changed, or unpublished Stone Library images.
- Kept machine-specific local absolute paths out of committed Harness docs.

### Changed Files
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The image audit itself has not been run yet.
- Shared-drive source folders may need manual naming normalization before automated mapping is reliable.

### Next Handoff
- `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-22 (Harness Task Sequencing Cleanup)

### Scope
- Shortened `docs/HANDOFF.md` so it reads as a current handoff instead of a full verification history.
- Re-sequenced Stone Library image work so `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001` runs before final HD image coverage.
- Marked `NOW-ADMIN-CMS-001` as an umbrella objective and added smaller admin child tasks for IA/access planning, Auth/RLS, content CRUD, media, and lead management.
- Updated roadmap and root harness notes so future agents do not attempt the whole admin CMS in one pass.

### Changed Files
- `AGENTS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The new admin implementation child tasks remain blocked until Supabase/Auth/Storage/form secrets are available.
- `NEXT-ADMIN-IA-ACCESS-001` is the only admin task intended to proceed without secrets.

### Next Handoff
- `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001`
- `NEXT-ADMIN-IA-ACCESS-001`
- `NOW-ROUTE-ERROR-STATES-001`

## Entry - 2026-05-25 (Stone Library Drive Image Audit)

### Scope
- Ran the current-site-only Stone Library source audit against the Saistone shared-drive folder named `Urblo Digital Stone Library`.
- Followed user direction to ignore shared-drive products that are not currently present on the website.
- Compared current runtime mappings in `src/data/stoneFinishImages.ts` and repo media against shared-drive candidates without changing runtime mappings or assets in this pass.
- Recorded the update list for `NEXT-STONELIB-IMG-001`: Golden Crust Light/Dark, Tan Brown, Honey Comb, Tuscany, and Ivory Sand honed review.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates were not run because no runtime mappings or assets changed.

### Risks and Gaps
- `NEXT-STONELIB-IMG-001` still needs to normalize and map the approved shared-drive candidates.
- Ivory Sand honed needs visual review before replacing the current Sandstone-named asset.
- Blueocean and Harcourt still have no matching current-site source candidate in the shared-drive scope.

### Next Handoff
- `NEXT-STONELIB-IMG-001`
- `NEXT-ADMIN-IA-ACCESS-001`
- `NOW-ROUTE-ERROR-STATES-001`

## Entry - 2026-05-25 (Stone Library Current-Site Image Mapping)

### Scope
- Normalized current-site shared-drive Stone Library candidates into `data/Product`.
- Mapped Golden Crust Light/Dark, Tan Brown, and Honey Comb to finish-specific runtime images.
- Replaced old Ivory Sand `Sandstone` file paths with shared-drive `Ivory Sand` image paths after visual review.
- Mapped Tuscany Vein Cut and Cross Cut to variant-level default images only, avoiding false finish-specific claims.
- Removed obsolete old Sandstone-named assets and unused Tuscany fallback files; Blueocean keeps the controlled fallback and Harcourt keeps TBC placeholders.

### Changed Files
- `AGENTS.md`
- `data/Product/Golden Crust`
- `data/Product/Honey Comb`
- `data/Product/Ivory Sand`
- `data/Product/Tan Brown`
- `data/Product/Tuscany`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `public/media/launch/stone-library/fallbacks`
- `src/data/stoneFinishImages.ts`

### Verification Results
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- Browser QA: pass on `http://127.0.0.1:5173/stone-library`, `/stone-library/golden-crust`, `/stone-library/tan-brown`, `/stone-library/honey-comb`, and `/stone-library/tuscany`. Golden Crust Dark and Tuscany Cross Cut variant switches update to mapped images; only the known React Helmet strict-mode warning appeared in console logs.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Blueocean still needs approved finish imagery if Urblo wants more than the controlled fallback.
- Harcourt still needs approved source imagery before its TBC placeholder state can be removed.
- Tuscany still needs finish-specific photos before honed, polished, and sandblasted can be visually distinct.

### Next Handoff
- `NEXT-ADMIN-IA-ACCESS-001`
- `NOW-ROUTE-ERROR-STATES-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-25 (Admin IA and Access Contract)

### Scope
- Added `docs/ADMIN_IA_ACCESS.md` as the executable no-secret contract for the future Urblo-owned `/admin` site.
- Defined admin route map, unauthenticated/authenticated/unauthorized/loading states, viewer/editor/admin/owner role behavior, draft/review/published/archived/TBC content states, and module rollout sequence.
- Added first-pass field ownership models for leads, media, Stone Library, Projects, Products, and Articles.
- Recorded admin implementation boundaries so future agents do not ship fake production auth before Supabase credentials, RLS, Storage policies, form endpoints, and secrets are available.
- Updated architecture, launch plan, schema, design, handoff, roadmap, and task queue references to point future admin implementation work at the contract.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates were not run because no runtime routes, components, data, or assets changed.

### Risks and Gaps
- `/admin` is not implemented yet.
- Supabase Auth, RLS, Storage policies, Cloudflare Pages Functions, Turnstile, and email secrets remain blocked until account access is available.
- The next no-secret runtime task is `NOW-ROUTE-ERROR-STATES-001`.

### Next Handoff
- `NOW-ROUTE-ERROR-STATES-001`
- `NEXT-PRODUCT-DETAIL-CONVERSION-001`
- `NEXT-PROJECTS-INTAKE-001`

## Entry - 2026-05-25 (Route Error States)

### Scope
- Replaced the catch-all homepage fallback with a branded not-found page so unknown public URLs no longer look like valid homepage visits.
- Added a shared `RouteState` component for public route-level loading, not-found, and load-error states.
- Updated product detail and article detail routes so missing slugs, loading work, and fetch failures render deliberate recovery states instead of blank content, red text, or misleading fallback content.
- Added smoke coverage for one unknown route shell and one missing product detail route shell.
- Updated architecture, design, handoff, roadmap, and task queue docs so future agents treat this as an implemented launch-safety contract.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/agent-smoke.sh`
- `src/App.tsx`
- `src/components/RouteState.tsx`
- `src/pages/ArticlePage.tsx`
- `src/pages/NotFoundPage.tsx`
- `src/pages/ProductDetailPage.tsx`

### Verification Results
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including unknown-route and missing-product state route shells.
- Browser QA: pass on `/not-a-real-urblo-route`, `/products/not-a-real-product`, and `/articles/not-a-real-article`; each route rendered deliberate state copy and did not render the homepage title.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Browser screenshot capture timed out during this QA pass, so state verification used browser title and rendered text checks instead.
- React Helmet still emits an existing strict-mode lifecycle warning in dev console.
- Product detail pages still need the separate conversion/configuration polish task.

### Next Handoff
- `NEXT-PRODUCT-DETAIL-CONVERSION-001`
- `NEXT-PROJECTS-INTAKE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-25 (Product Detail Conversion)

### Scope
- Turned product detail configuration from button-only selection into a visible selected-configuration summary.
- Added a prefilled `mailto:` CTA so a visitor can discuss the exact product/model/material combination without waiting for Supabase forms.
- Added Contact and Stone Library recovery links inside the product configuration area.
- Added specification caveat copy so the current sample-level values are presented as discussion cues until final engineering/product data is approved.
- Added `OptionItem.imageState` and product selector treatment for missing stone imagery, including an explicit `Image pending` badge that does not pollute the button accessible name.
- Updated product/detail architecture, design contract, handoff, roadmap, and task queue docs.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/ModelSelector.tsx`
- `src/components/OptionSelector.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/service/StoneLibraryService.ts`
- `src/types/product.ts`

### Verification Results
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- Browser QA: desktop pass on `/products/primeBlock`; the page identity, meaningful content, selected summary, prefilled `mailto:` CTA, pending-image copy, and Timber Rise + / Harcourt interaction were verified. One screenshot was captured before the CTA row was adjusted, and a later browser reconnect failed before a fresh screenshot could be captured.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Browser mobile viewport override did not apply in the in-app Browser, and the Playwright CLI fallback was blocked because the local Chrome distribution is unavailable. Mobile layout still needs a fresh visual check when browser tooling is available.
- React Helmet still emits an existing strict-mode lifecycle warning in dev console.
- Product records remain static/file-backed; customer-editable product fields are still part of the Supabase/admin CRUD track.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NEXT-STONELIB-IMG-002`
- `NEXT-SLUG-URL-NORMALIZE-001`

## Entry - 2026-05-25 (Stone Library Secondary Frames)

### Scope
- Implemented secondary finish frames as support media for the active Stone Library finish, not separate finish states.
- Added secondary image mapping for approved Juparana and Zen Grey `_2` source frames in `src/data/stoneFinishImages.ts`.
- Extended the Stone Library service/type contract so `FinishVM.secondaryImages` carries approved secondary frame metadata.
- Added active-finish secondary thumbnails below the image stage; clicking a thumbnail opens the lightbox on that frame while preserving the active finish.
- Added frame selection inside `FinishLightbox` so primary and secondary frames can be inspected without changing finish state.
- Added active finish frame-count disclosure to `FinishAccordion`.
- Updated architecture, design, handoff, asset audit, roadmap, and task queue docs.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/FinishLightbox.tsx`
- `src/components/stone-library/ImageStage.tsx`
- `src/data/stoneFinishImages.ts`
- `src/pages/StoneLibraryDetailPage.tsx`
- `src/service/StoneLibraryService.ts`
- `src/types/stone-library.ts`

### Verification Results
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Fresh desktop/mobile browser visual QA is blocked: the in-app Browser reports no active pane, and the Playwright CLI fallback cannot launch because local Chrome is unavailable.
- Harcourt remains placeholder/TBC because no approved source imagery exists.
- Blueocean remains on the controlled fallback because no matching current-site shared-drive source exists.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NEXT-SLUG-URL-NORMALIZE-001`
- `NOW-ARTICLE-STRUCTURE-CLAIMS-001`

## Entry - 2026-05-25 (Public Slug Normalization)

### Scope
- Normalized canonical product slugs from camelCase to lowercase kebab-case.
- Normalized canonical article slugs from title-case export names to lowercase kebab-case.
- Added `legacySlugs` on products and articles so old public URLs still resolve inside the SPA.
- Added `sourceSlug` on article metadata so current raw HTML content can stay in the existing title-case source folders while public URLs become canonical.
- Added explicit Cloudflare 301 rules for old product and article URLs before the SPA fallback in `public/_redirects`.
- Updated smoke coverage to exercise canonical product/article route shells and assert representative redirect rules exist.
- Updated architecture, admin IA, handoff, roadmap, and task queue docs with the slug policy and redirect compatibility model.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `public/_redirects`
- `public/articles/index.json`
- `public/articles/Curving-the-Future-Greening-the-Pipelines-Sustainable-Legacy/meta.json`
- `public/articles/Debunking-the-Cost-Myth-by-Urblo-Bluestone-Blocks/meta.json`
- `public/articles/Modular-Mastery-How-PrimeBlock-Core-Transformed-Aitken-College/meta.json`
- `public/articles/Stone-Transformed-8-Ways-to-Redefine-Bluestones-Look-Feel/meta.json`
- `scripts/agent-smoke.sh`
- `src/data/productData.ts`
- `src/pages/ArticlePage.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/scripts/generate-article-index.ts`
- `src/service/ProductService.ts`
- `src/types/article.ts`
- `src/types/product.ts`

### Verification Results
- Article JSON metadata parse check: pass.
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including canonical product/article route shells and representative old-to-new redirect rule checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Cloudflare 301 behavior still needs live Pages preview validation after Cloudflare project setup.
- Raw article content folders are intentionally not renamed in this pass; `sourceSlug` keeps compatibility until structured article migration.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NOW-ARTICLE-STRUCTURE-CLAIMS-001`
- `NEXT-UI-PARITY-001`

## Entry - 2026-05-25 (Launch UI Hardening)

### Scope
- Implemented the approved UI/UX launch fixes except the two user-paused areas: article claim cleanup and broad legacy project-detail migration.
- Made the homepage hero full viewport, changed hero video loading to `preload="none"`, and preserved mobile poster-only behavior for performance.
- Added client-side scroll restoration so internal route changes land at the top instead of preserving deep scroll positions.
- Removed the duplicated Article detail route banner and hardened route-level loading, not-found, and error states for no-banner routes.
- Added mobile safeguards for legacy article newsletter HTML and shortened article previous/next controls.
- Made Product detail renders honest as geometry previews, with separate material preview rows for body stone, frame finish, and battens.
- Added Stone Library finish-image provenance roles so active imagery is labeled as finish-specific, reference, or pending.
- Added local Contact form validation before opening a mailto draft, improved mobile Our Story bio visibility, tightened global eyebrow contrast, fixed project facts mobile stacking, and made Product cards/copy more aligned with the current data.
- Replaced `react-helmet` with a native route metadata updater to remove React 19 strict-mode console noise.

### Changed Files
- `package.json`
- `package-lock.json`
- `src/App.tsx`
- `src/components/ProductCard.tsx`
- `src/components/RouteState.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/ImageStage.tsx`
- `src/data/stoneFinishImages.ts`
- `src/index.css`
- `src/pages/ArticlePage.tsx`
- `src/pages/ArticlesPage.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/NotFoundPage.tsx`
- `src/pages/OurStory.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/pages/ProductsPage.tsx`
- `src/pages/ProjectDetails.tsx`
- `src/service/StoneLibraryService.ts`
- `src/types/stone-library.ts`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Subagent review: completed as a sidecar UI/UX launch pass; it confirmed most dirty fixes and caught a temporary Stone Library `imageRole` type narrowing issue, which was fixed before final gates.
- Browser QA: pass on `/`, `/definitely-not-a-page`, `/projects/unknown-project`, `/articles/debunking-the-cost-myth-by-urblo-bluestone-blocks`, `/products/terra-line`, `/stone-library/new-grey`, `/our-story`, `/products`, and `/contact`.
- Browser QA metrics: homepage first section measured 900px at 1440x900 and 844px at 390x844; mobile homepage did not select the MP4 source; article detail at 320px had zero horizontal overflow; contact empty submit showed the inline validation message; homepage project-card navigation reset to `scrollY=0`.
- Fresh browser console check after removing `react-helmet`: no new warnings or errors after page load.
- Screenshot evidence was captured through the Playwright CLI fallback because Browser screenshot capture timed out in this environment.
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The desktop homepage MP4 is still large. Current mitigations reduce mobile cost and initial preload, but final performance sign-off still needs re-encoding or Cloudflare Stream/R2 review.
- Article claim cleanup is explicitly paused by user direction and remains open under `NOW-ARTICLE-STRUCTURE-CLAIMS-001`.
- Broad legacy project detail migration is explicitly paused by user direction and remains open under `NEXT-PROJECTS-INTAKE-001`.
- Raw article newsletter HTML remains a migration source and should still move to structured article blocks before customer CRUD is considered complete.
- Contact validation prevents empty mailto drafts but does not persist leads; Supabase-backed forms remain required.

### Next Handoff
- `NOW-ASSET-MIGRATION-001`
- `NOW-FORMS-SUPABASE-001`
- `NEXT-UI-PARITY-001`

## Entry - 2026-05-25 (Homepage Video Optimization)

### Scope
- Re-encoded the controlled homepage hero MP4 from the previous launch stopgap into a smaller production-friendly static asset.
- Preserved the existing public path `public/media/launch/home/urblo-hero.mp4` so no data contract or route changes were required.
- Kept desktop/tablet video behavior and mobile poster-only behavior from the launch UI hardening pass.
- Updated asset, architecture, handoff, roadmap, worklog, and machine task docs so agents no longer treat the desktop MP4 as an unresolved large-asset blocker.

### Changed Files
- `public/media/launch/home/urblo-hero.mp4`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Source size comparison: previous controlled MP4 was about 16MB; optimized MP4 is about 3MB.
- Encoding target: H.264 MP4, 1280x720, 30fps, no audio, fast-start.
- Browser QA on desktop 1440x900: homepage video selected `/media/launch/home/urblo-hero.mp4`, reached `readyState=4`, reported 1280x720 intrinsic size, first section height was 900px, and horizontal overflow was 0.
- Browser QA on mobile 390x844: homepage first section height was 844px, horizontal overflow was 0, and the video selected no MP4 source.
- Playwright CLI screenshot fallback captured the optimized desktop homepage first viewport.
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live Cloudflare preview should still verify actual LCP/network behavior after deployment.
- Cloudflare Stream/R2 remains optional if the client wants adaptive streaming, analytics, or non-repo video management later.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-05-25 (Motion Polish)

### Scope
- Added shared structured-number motion for Urblo proof metrics.
- Applied count-up behavior to homepage metrics and Our Story counters.
- Replaced `react-countup` scroll-spy behavior with an in-house `IntersectionObserver` plus `requestAnimationFrame` counter so numbers visibly grow when the user scrolls to them.
- Added restrained route enter transitions keyed by pathname so public page changes feel smoother without delaying route-state content.
- Kept dates, dimensions, specification text, filter counts, native select option counts, and Stone Library card scan counts static after motion review because those numbers support fast inspection rather than brand proof.
- Updated the design, architecture, handoff, roadmap, worklog, and machine task queue to record the motion boundary for future agents.

### Changed Files
- `src/App.tsx`
- `package.json`
- `package-lock.json`
- `src/components/AnimatedNumber.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/pages/OurStory.tsx`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: homepage proof metrics start at `0`, show intermediate values after scroll, and reach final values with zero horizontal overflow.
- Browser QA: Our Story proof counters start at `0`, show intermediate values after scroll, and reach final values with zero horizontal overflow.
- Browser QA: Stone Library result count and card finish/variant counts remain immediate/static scan text, not count-up targets.
- Browser QA: clicking from `/projects` at scroll depth into `/projects/moon-gate-woolley-street` lands on the detail page with `scrollY=0` and zero horizontal overflow.
- Browser QA: unknown public route still renders the deliberate Page not found state with zero horizontal overflow.

### Risks and Gaps
- Numeric count-up now intentionally runs on viewport entry so the growth is visible. If future accessibility review requires a reduced-motion opt-out for counters, add a scoped prop rather than reverting to library scroll-spy behavior.
- This pass does not change Supabase forms, admin CMS, article structure, or broad legacy project migration.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-25 (Page Title Typography)

### Scope
- Promoted the Projects page title typography to the global public page H1 style.
- Changed `.urblo-page-title` to use `Avenir LT Std`, light `300`, normal letter spacing, and no forced uppercase.
- Replaced Projects and legacy project detail H1s with the shared page title class.
- Replaced Article detail's previous Space Grotesk uppercase H1 with the shared page title class plus a white inverse modifier for the image hero.
- Left homepage hero, card titles, section headings, Stone Library specs headings, and project material-map hero typography unchanged because they are different hierarchy roles.
- Updated design, handoff, roadmap, worklog, and machine task docs.

### Changed Files
- `src/index.css`
- `src/pages/Projects.tsx`
- `src/pages/ProjectDetails.tsx`
- `src/pages/ArticlePage.tsx`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: `/projects`, `/products`, `/stone-library`, `/our-story`, `/contact`, `/articles`, one article detail route, one product detail route, one stone detail route, and one no-banner route state all use `Avenir LT Std`, weight `300`, no forced uppercase, and zero horizontal overflow for page H1s.
- Browser QA: mobile `/contact` and the long article detail title have zero horizontal overflow after adding page-title wrapping and increasing the article hero image height.

### Risks and Gaps
- Further editorial/title content can still create unusual wrapping, but current long Contact and article-detail cases are checked at desktop and 390px mobile.
- This pass does not change card, section, tool, or homepage hero typography.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-25 (Stone Library Image Label Readability)

### Scope
- Improved Stone Library image overlay labels after user feedback that small black-on-image labels were hard to read.
- Changed detail-stage image provenance labels, Zoom affordance, and collapsed finish labels to use dark translucent backplates with white text.
- Used Urblo lime as a restrained confirmed/action signal instead of a broad overlay fill, so pending/reference imagery does not read as approved and stone texture remains inspectable.
- Unified Stone Library list-card `Available` and `Upcoming` image badges with the same overlay language.
- Updated the design contract, handoff, roadmap, and machine task queue.

### Changed Files
- `src/components/stone-library/ImageStage.tsx`
- `src/components/stone-library/FinishLightbox.tsx`
- `src/components/stone-library/StoneCard.tsx`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: `/stone-library` list badges and `/stone-library/blueocean`, `/stone-library/harcourt`, `/stone-library/tuscany`, and `/stone-library/juparana` detail overlays render with generated dark translucent backgrounds and white text at 1280px.
- Browser QA: `/stone-library` and `/stone-library/harcourt`, `/stone-library/blueocean`, and `/stone-library/juparana` remain readable at 390px; `/stone-library/juparana` also remains readable at 320px, with no page-level horizontal overflow and no collision between the left provenance label and right Zoom action.

### Risks and Gaps
- This pass improves label contrast and UI consistency; it does not change remaining Stone Library source-image coverage gaps such as Harcourt pending imagery.
- Browser QA caught unsupported Tailwind opacity shorthands during the pass; the affected Stone Library classes were replaced with generated opacity tokens before final gates.
- Final production contrast should still be rechecked after any future HD image swap, especially on very bright or highly patterned stone photos.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-25 (Stone Library Status Pill Consistency)

### Scope
- Followed up on the external Stone Library `Available` states after user feedback that the outside status badges also needed the same polish.
- Added a shared `StatusPill` component for Stone Library status presentation across light, dark, and image-overlay contexts.
- Converted detail header status, variant status, finish selector status, Specs availability summary, Finish Capability rows, Cut Options rows, and card status badges to the same lightweight status system.
- Reworked external availability badges into a lighter lime ghost treatment after user feedback that black status blocks felt too heavy for Urblo.
- Removed broad lime fills from external availability badges; Urblo lime now appears as a thin outline/wash and small confirmed-available signal.
- Left missing-data and empty-state text as plain copy rather than turning every `TBC` or `No` string into status chrome.

### Changed Files
- `src/components/stone-library/StatusPill.tsx`
- `src/components/stone-library/StoneCard.tsx`
- `src/pages/StoneLibraryDetailPage.tsx`
- `src/components/stone-library/VariantSwitch.tsx`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/SpecsPanel.tsx`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: Stone Library list, Juparana detail, and Harcourt detail status pills render with no heavy black status blocks at desktop and 390px mobile widths, and the checked routes have no page-level horizontal overflow.

### Risks and Gaps
- The price tier meter still uses Urblo lime bars by design; it is a price scale, not an availability badge.
- Production contrast should be checked again after any future Stone Library visual system change or image source swap.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-25 (Homepage Edge Hero Reveal)

### Scope
- Reworked the homepage first viewport after user feedback that the logo, nav, and hero copy were too constrained by the centered page container.
- Added an edge-aligned container for the global header and homepage hero while leaving standard content pages on the normal readable page container.
- Replaced the old first-viewport `Stone Solutions for Street` headline and support copy with three sequential hero lines: `Design.`, `Source.`, `Deliver.`
- Restricted Urblo green to the punctuation dots and made the line reveal reduced-motion aware.
- Recorded the edge-aligned hero/header pattern in the design contract and machine task queue.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/components/site/SiteHeader.tsx`
- `src/data/homepage.ts`
- `src/index.css`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Playwright screenshot QA: homepage checked at 1440x900 and 390x844 after animation settle; header/hero edge alignment, full-viewport video/poster treatment, and no hero text overflow were verified visually.

### Risks and Gaps
- The desktop hero video remains the controlled static MP4 with mobile poster-only behavior; Cloudflare preview should still verify actual LCP/network behavior after deployment.
- The edge container is intentionally limited to the global header and homepage first viewport; future full-bleed sections should opt in deliberately rather than replacing the standard content container.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-26 (Homepage Hero Reference Alignment)

### Scope
- Adjusted the homepage hero after the user clarified the Richard Crookes reference target.
- Changed the verb stack to all caps: `DESIGN.`, `SOURCE.`, `DELIVER.`
- Offset the second line, reduced the hero type scale, and lowered the stack closer to the viewport bottom.
- Changed hero motion from an upward line reveal to a letter-by-letter left-to-right reveal, while preserving reduced-motion behavior.
- Rechecked desktop and mobile first-viewport rendering and mobile menu interaction.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA at 1440x900: all-caps hero, edge-aligned first line, second-line offset, smaller type, lower bottom anchoring, and no top clipping render correctly.
- Browser QA at 390x844: no horizontal overflow; all three lines fit and remain readable over the poster frame.
- Browser animation QA: mid-animation state shows `DESIGN.` complete while `SOURCE.` is partially revealed and `DELIVER.` is still hidden, matching the requested first-line, second-line, third-line sequencing.
- Browser interaction QA: mobile header menu button resolves uniquely, opens successfully, and exposes nav links.
- Browser console: only the expected Framer Motion reduced-motion warning was present because the test browser has reduced motion enabled.

### Risks and Gaps
- The Browser test environment had reduced motion enabled; the reduced-motion path still preserves visible letter sequencing with shorter fades, while the normal path keeps the same line and character delays with slightly more motion.
- The hero remains tied to the current controlled video/poster asset; Cloudflare preview should still verify real network and LCP behavior after deployment.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-26 (GitHub Pages SPA Fallback)

### Scope
- Investigated direct URL 404s on GitHub Pages for clean React routes such as `/stone-library/angola-black`.
- Confirmed direct GitHub Pages requests were returning the platform 404 before the React app loaded, while client-side navigation worked after the app was already running.
- Added a short-term GitHub Pages deploy step that copies `dist/index.html` to `dist/404.html` after build, allowing GitHub Pages missing-file fallback to load the SPA.
- Documented that this does not replace Cloudflare Pages routing; Cloudflare remains the production launch target and continues to rely on `public/_redirects`.

### Changed Files
- `.github/workflows/deploy.yml`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `curl -I https://jayyy-3.github.io/stone-library/angola-black`: confirmed current live GitHub Pages platform 404 before the fix is deployed.
- `git show origin/gh-pages:404.html`: confirmed the deployed branch currently has no `404.html`.
- `npm run build`: pass. Browserslist staleness notice remains.
- `test -f dist/index.html && cp dist/index.html dist/404.html && cmp -s dist/index.html dist/404.html`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Post-deploy `origin/gh-pages:404.html`: confirmed `404.html` exists and matches the Urblo app shell.
- Post-deploy `curl -sS -D - https://jayyy-3.github.io/stone-library/angola-black`: returns GitHub Pages HTTP 404 status with the Urblo app shell body, not the default GitHub platform 404 body.
- Browser verification: direct visit to `https://jayyy-3.github.io/stone-library/angola-black` renders `Stone Detail | Urblo`, `h1` = `Angola Black`, and the stone detail content.

### Risks and Gaps
- GitHub Pages may still return HTTP 404 status for fallback-served deep links even though the React app renders the requested route; this is acceptable only as a short-term preview fix.
- Cloudflare Pages should remove the need for this workaround by serving clean routes through `public/_redirects` with a 200 fallback.
- Live GitHub Pages behavior has been confirmed after the pushed workflow deployed `gh-pages`; keep treating it as a preview-only compatibility patch.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-26 (Homepage Proof Section Update)

### Scope
- Removed the rendered homepage sustainability/tabbed feature module from the page flow by request.
- Moved the homepage proof metrics section into the removed module's position, directly after the hero.
- Replaced the previous team-assistance copy with `Stone has always shaped cities.` and `We shape how stone is designed, specified, and delivered.`
- Replaced the metrics with 50+ projects delivered, 130+ tonnes of CO2 offset, 20+ landscape architects nominated, and 3500+ linear metres stone blocks delivered.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- Browser verification on `http://127.0.0.1:5174/`: pass. The old sustainability copy and old team copy are absent; the new proof copy appears in section 1 directly after the hero; the partner banner follows the proof metrics section.
- Browser scrolled verification: pass. Metrics animate to 50+, 130+, 20+, and 3,500+ with the requested labels.

### Risks and Gaps
- The old sustainability/tabbed module code remains available but is disabled from the rendered homepage flow. Treat any future reintroduction as a design/content rebuild, not a simple toggle-on.
- The updated CO2 and delivery metrics are client-supplied copy in this task; deeper substantiation should be handled during CMS/content governance.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-26 (Homepage Partner Banner Copy)

### Scope
- Replaced the homepage partner banner copy with `Design-led stone solutions for streetscapes & civil landscapes.`
- Changed the banner component to render the copy from `src/data/homepage.ts` instead of keeping a separate hardcoded JSX sentence.
- Highlighted `Design-led` in Urblo lime while keeping the remainder of the banner sentence white.
- Updated the brand baseline anchor line so future agents do not revive the old trusted-partner wording.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `docs/brand-baseline.md`
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser DOM verification on `http://127.0.0.1:5174/`: pass. The partner banner section text is `Design-led stone solutions for streetscapes & civil landscapes.`, and the old trusted-partner sentence is absent from the rendered section.
- Browser style verification on `http://127.0.0.1:5174/`: pass. `Design-led` renders as a separate span with computed color `rgb(0, 255, 25)`, matching `--urblo-lime`.
- `npx playwright screenshot --wait-for-timeout=2500 --full-page --viewport-size=1280,720 http://127.0.0.1:5174/ /tmp/urblo-home-fullpage-partner-banner-check.png`: captured supplemental visual evidence.

### Risks and Gaps
- Browser screenshot capture through the in-app Browser timed out once; DOM verification and Playwright screenshot fallback were used instead.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-26 (Capabilities CTA and Route)

### Scope
- Added a lightweight `Our Capabilities` CTA under the homepage proof-section intro copy.
- Added `/capabilities` as a dedicated provisional capability page covering design translation, specification support, sourcing/fabrication, and delivery coordination.
- Updated route metadata, smoke route coverage, and Harness docs so the new public route is tracked.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/pages/CapabilitiesPage.tsx`
- `src/App.tsx`
- `scripts/agent-smoke.sh`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/capabilities` route shell and the homepage capabilities CTA target.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- In-app Browser verification on `http://127.0.0.1:5174/`: pass. The homepage renders exactly one `Our Capabilities` link with `href="/capabilities"`, and clicking it navigates to `/capabilities` with title `Capabilities | Urblo`.
- In-app Browser rendered-content verification: pass. `/capabilities` renders `Our Capabilities`, `Design translation`, and `Delivery coordination`. Console warnings were limited to the existing reduced-motion environment notice.
- Playwright screenshot fallback on `http://127.0.0.1:5174/`: pass. Desktop and 390px mobile screenshots confirmed the homepage CTA placement and `/capabilities` page render with no console errors or mobile horizontal overflow. The fallback was used because in-app Browser screenshot capture timed out twice.

### Risks and Gaps
- `/capabilities` copy is provisional and should be replaced with client-approved capability content before treating it as final launch messaging.
- The route currently reuses the projects banner until dedicated capability imagery is approved.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-26 (Supabase Execution Task Breakdown)

### Scope
- Confirmed the Supabase execution path should start with the accessible Urblo project, not manual dashboard table creation.
- Split the Supabase work into foundation migration, baseline seed, forms backend, admin auth shell, and later content CRUD phases.
- Added explicit acceptance criteria for migrations, table existence, RLS policy inspection, lead row creation, and no browser-exposed service-role secrets.
- Added a reviewed migration directory scaffold for future SQL migration files.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `supabase/migrations/README.md`

### Verification Results
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The Supabase project exists and is connector-accessible, but no production migration has been applied yet.
- First admin email, browser-safe anon-key handling, Turnstile secrets, and transactional email secrets are still needed before the admin and form flows can be considered production-ready.
- Cloudflare Pages project creation remains separate from Supabase execution and may still require resolving Hunter account Pages API permissions or choosing Jay's account for Pages.

### Next Handoff
- `NOW-SUPABASE-FOUNDATION-001`
- `NOW-SUPABASE-SEED-BASELINE-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-27 (Supabase Foundation Applied)

### Scope
- Added reviewed Supabase foundation migrations under `supabase/migrations`.
- Applied `foundation_schema`, `foundation_hardening`, and `anon_read_only` to Supabase project `npkidywzwddbnfrnxlmo`.
- Created launch foundation tables for admin profiles, audit events, media assets, site settings, finish definitions, Stone Library, Products, Projects, Articles, enquiries, sample requests, and sample request items.
- Added `updated_at` triggers, admin-role helper functions, status/FK/listing indexes, operational new-lead partial indexes, anonymous read-only grants for public content, and RLS policies.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `supabase/migrations/README.md`
- `supabase/migrations/202605270001_foundation_schema.sql`
- `supabase/migrations/202605270002_foundation_hardening.sql`
- `supabase/migrations/202605270003_anon_read_only.sql`

### Verification Results
- Supabase migration list: pass. `foundation_schema`, `foundation_hardening`, and `anon_read_only` are listed on project `npkidywzwddbnfrnxlmo`.
- Supabase table existence check: pass. 24 expected foundation tables exist in `public`.
- Supabase RLS check: pass. 24/24 public foundation tables have RLS enabled.
- Supabase policy summary: pass. Public content tables have public-select policies plus admin policies; lead/admin private tables have admin policies and no public-select policies.
- Supabase private grant check: pass. `anon` has no SELECT/INSERT/UPDATE/DELETE grants on `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, or `sample_request_items`.
- Supabase public grant check: pass. `anon` has SELECT and no INSERT/UPDATE/DELETE on checked public content tables.
- Supabase FK index check: pass. No public-schema foreign-key columns are missing an index after hardening.
- Supabase operational queue index check: pass. `enquiries_new_queue_idx` and `sample_requests_new_queue_idx` exist.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass. Existing public route shells, redirects, and CTA contracts remain green.

### Risks and Gaps
- No seed data exists yet; `finish_definitions` and `site_settings` remain empty until `NOW-SUPABASE-SEED-BASELINE-001`.
- No first admin user has been created because that requires Jay to confirm the first admin email.
- No runtime code is connected to Supabase yet; public pages remain static/file-backed and forms remain mailto/local-only until the forms backend checkpoint.
- Supabase Storage buckets/policies are not implemented yet; media CRUD remains part of the admin media checkpoint.

### Next Handoff
- `NOW-SUPABASE-SEED-BASELINE-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-27 (Supabase Baseline Seed Applied)

### Scope
- Added the baseline seed migration under `supabase/migrations`.
- Applied `baseline_seed` to Supabase project `npkidywzwddbnfrnxlmo`.
- Seeded the first published finish dictionary from the current Stone Library data.
- Seeded one published default Urblo `site_settings` row with contact, social, footer, and SEO baseline values.
- Updated Harness docs so the next executable checkpoint is the forms backend.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `supabase/migrations/README.md`
- `supabase/migrations/202605270004_baseline_seed.sql`

### Verification Results
- Supabase migration list: pass. `baseline_seed` is listed on project `npkidywzwddbnfrnxlmo`.
- Supabase finish seed check: pass. `finish_definitions` contains 12 rows and 12 distinct finish keys.
- Supabase site settings check: pass. `site_settings` contains one published `default` row.
- Supabase idempotency check: pass. Rerunning the seed upsert kept counts at 12 distinct finishes and one default settings row.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- Public runtime is still static/file-backed and does not read this seed data yet.
- Contact and Sample Request still depend on local/mailto behavior until `NOW-FORMS-BACKEND-001`.
- No first admin user has been created because that requires Jay to confirm the first admin email.
- Supabase Storage buckets, media policies, Auth UI, and admin CRUD are still pending.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-27 (Forms Backend Source and Contact Submit Flow)

### Scope
- Added Cloudflare Pages Function source for `/api/enquiries` and `/api/sample-requests`.
- Added shared server-side validation, Turnstile fail-closed behavior when configured, Supabase REST writes using server-side credentials, and staged Resend notification handling.
- Reworked the Contact page so the main enquiry flow submits to `/api/enquiries` instead of opening a local email draft.
- Added Contact page Sample Request mode at `/contact?intent=sample-request`, with sample preference, finish, quantity, project name, shipping address, and notes fields that submit to `/api/sample-requests`.
- Updated footer/sample request CTA contracts to route to the Contact sample-request mode.
- Added `scripts/check-forms-api.mjs` and wired it into `npm run agent:smoke` so invalid submissions, valid Supabase write payloads, sample request item payloads, and Turnstile failure behavior are checked without secrets.

### Changed Files
- `functions/_lib/forms.js`
- `functions/api/enquiries.js`
- `functions/api/sample-requests.js`
- `scripts/check-forms-api.mjs`
- `scripts/agent-smoke.sh`
- `src/pages/ContactPage.tsx`
- `src/data/siteChrome.ts`
- `src/data/homepage.ts`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `node scripts/check-forms-api.mjs`: pass. Valid enquiry targets `enquiries`; invalid enquiry returns validation failure before Supabase calls; valid sample request targets `sample_requests` and `sample_request_items`; configured Turnstile failure returns 403 before Supabase calls.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including the Forms API checks and updated Sample Request CTA route contracts.
- Playwright screenshot check: partial pass. A 390px mobile screenshot of `/contact` rendered without visible first-viewport layout breakage. Follow-up screenshots for `/contact?intent=sample-request` were blocked by local Playwright browser launch failures after the first capture.

### Risks and Gaps
- Live API row creation through `/api/enquiries` and `/api/sample-requests` has not been run because no local or Cloudflare server-side `SUPABASE_SERVICE_ROLE_KEY` is configured in the environment.
- Turnstile and Resend notification code is staged but not production-verified because those secrets are not configured.
- `NOW-FORMS-BACKEND-001` should stay open until live endpoint tests prove valid submissions create Supabase rows and invalid submissions create no rows.
- Admin lead inbox and status updates are still pending under the admin auth/media/leads tasks.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-06-02 (Homepage Mobile Hero Video Source)

### Scope
- Added a mobile-specific homepage hero video so phone viewports no longer stay poster-only.
- Generated `public/media/launch/home/urblo-hero-mobile.mp4` from the controlled desktop MP4 as a 540x960, 9:16, no-audio, fast-start H.264 export at about 1.1MB.
- Updated homepage hero source selection so mobile uses `media="(max-width: 767px)"` and desktop/tablet keeps the existing `media="(min-width: 768px)"` MP4.

### Changed Files
- `public/media/launch/home/urblo-hero-mobile.mp4`
- `src/data/homepage.ts`
- `src/components/homepage/HomepageSections.tsx`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Transcode check: mobile MP4 is H.264 540x960, SAR 1:1, DAR 9:16, 30fps, no audio, 17.67s, about 530kbps / 1.1MB.
- Playwright local production-preview mobile 390x844: pass. `video.currentSrc` selected `/media/launch/home/urblo-hero-mobile.mp4`, `readyState=4`, `paused=false`, intrinsic video size 540x960, no horizontal overflow, no console issues.
- Playwright local production-preview desktop 1440x900: pass. `video.currentSrc` selected `/media/launch/home/urblo-hero.mp4`, `readyState=4`, `paused=false`, intrinsic video size 1280x720, no horizontal overflow, no console issues.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:smoke`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Production verification is required after Cloudflare Pages deploys this commit.
- Mobile video uses a center portrait crop from the landscape source. If the client wants shot-by-shot art direction, generate a dedicated mobile edit rather than a centered crop.
- The first-visit Welcome acknowledgement modal still overlays the mobile first viewport until dismissed.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-ASSET-MIGRATION-001`
- `LATER-PERF-001`

## Entry - 2026-06-02 (Homepage Hero Video Performance Investigation)

### Scope
- Investigated slow homepage video loading on `https://urblo.com.au` after Cloudflare Pages cutover.
- Compared production custom domain, Pages default domain, and GitHub Pages delivery for `public/media/launch/home/urblo-hero.mp4`.
- Found the MP4 is a 3.1MB Cloudflare-served, byte-range-capable asset, but the homepage initially loaded the hero MP4/poster plus heavy below-the-fold homepage images at the same time.
- Added an HTML preload for the hero poster, kept the poster as a hero section background fallback, changed desktop hero video to `preload="auto"`, and deferred partner banner, Product Showcase background, Latest Projects media, Manifesto background, and Video CTA imagery until their sections are near the viewport.

### Changed Files
- `index.html`
- `src/components/homepage/HomepageSections.tsx`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Production `curl -I https://urblo.com.au/media/launch/home/urblo-hero.mp4`: `200`, `content-type: video/mp4`, `content-length: 3107047`, `Cache-Control: public, max-age=86400`, `accept-ranges: bytes`, and Cloudflare cache hit observed.
- Production Playwright resource timing before the fix showed `urblo-hero.mp4`, `hero-poster.jpg`, `partner-banner-west-side-place.jpg`, Latest Projects images, and homepage background images all starting around the first homepage render.
- Local production-preview Playwright resource timing after the fix showed the initial hero-load set limited to `hero-poster.jpg`, app/home JS/CSS chunks, and `urblo-hero.mp4`.
- Desktop Playwright screenshot/DOM check on `http://127.0.0.1:4173/`: pass. Hero height was 900px, no horizontal overflow, video `readyState=4`, `paused=false`.
- Mobile Playwright check at 390x844: pass. No MP4 request, no selected `currentSrc`, hero height 844px, no horizontal overflow.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:smoke`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The production custom-domain timing still needs deployed-after-fix verification after Cloudflare Pages receives this build.
- Local forced IPv6 `curl -6` timed out across Cloudflare hosts from this machine; because `urblo.pages.dev` also timed out under forced IPv6, this appears environment/network-specific and was not treated as an Urblo DNS change.
- The first-visit Welcome acknowledgement modal still affects perceived first viewport composition but was outside this performance fix.
- The current MP4 remains static repo media. Cloudflare Stream/R2 or a smaller adaptive/mobile video variant remains optional if real-user production metrics still show slow hero playback.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-ASSET-MIGRATION-001`
- `LATER-PERF-001`

## Entry - 2026-06-03 (Homepage Section Order, Header Menu, and YouTube CTA)

### Scope
- Reduced the homepage `Design-led stone solutions for streetscapes & civil landscapes.` partner banner to a slimmer transition band.
- Moved Latest Projects directly below that partner banner, before Product Showcase.
- Replaced the bottom homepage local-video modal with a lazy `youtube-nocookie` iframe for YouTube video `UfRtQZSi7cM`, loaded only after the Play button is clicked.
- Updated the shared header so desktop keeps Projects, Capabilities, Stone Library, Our Story, and Contact Us visible while Articles and Products move into the right-side hamburger. Mobile keeps the full navigation list inside the hamburger.
- Updated Harness docs for the new homepage rhythm, header navigation contract, and video CTA contract.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/components/site/SiteHeader.tsx`
- `src/data/homepage.ts`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass for the touched runtime/Harness files.
- In-app Browser verification: attempted against local Vite preview, but the browser backend reported `net::ERR_BLOCKED_BY_CLIENT` for `http://127.0.0.1:4173/`; Playwright fallback was used.
- Playwright local production-preview desktop 1440x900: desktop primary nav showed Projects, Capabilities, Stone Library, Our Story, and Contact Us without Articles/Products; the hamburger exposed Articles and Products; the `Design-led` banner resolved to the slimmer 258px band; Latest Projects followed the banner; the Play modal mounted `https://www.youtube-nocookie.com/embed/UfRtQZSi7cM?autoplay=1&rel=0&modestbranding=1&playsinline=1`; no horizontal overflow.
- Playwright local production-preview mobile 390x844: hamburger exposed the full navigation including Articles and Products; no horizontal overflow.

### Risks and Gaps
- The YouTube iframe depends on the third-party YouTube player once the visitor clicks Play; this is intentionally lazy-loaded and not part of initial homepage render.
- Production Cloudflare smoke and browser verification are still required after this commit deploys.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-06-03 (Desktop Header Right Alignment)

### Scope
- Restored the desktop shared header layout so the visible primary nav and hamburger button are one right-aligned group rather than separate centered/right columns.
- Kept Articles and Products inside the desktop hamburger menu.
- Kept mobile behavior unchanged: the hamburger exposes the full navigation list.
- Updated Harness docs with the explicit right-aligned header contract to prevent future centered-nav regressions.

### Changed Files
- `src/components/site/SiteHeader.tsx`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- In-app Browser local production-preview check on `http://127.0.0.1:4173/`: pass. Desktop header opened successfully, console errors/warnings were empty, visible primary links were Projects, Capabilities, Stone Library, Our Story, and Contact Us, and the visible desktop hamburger menu links were Articles and Products.
- Playwright local production-preview desktop 1440x900: pass. Primary nav measured from x=736 to x=1310, hamburger x=1334 to x=1382, nav-to-button gap 24px, right gutter 58px, no horizontal overflow, and zero console issues.
- Playwright local production-preview mobile 390x844: pass. Desktop primary nav was hidden, hamburger right gutter was 20px, opened menu exposed Projects, Capabilities, Stone Library, Our Story, Articles, Products, and Contact Us, no horizontal overflow, and zero console issues.
- Production deploy check: pass. `https://urblo.com.au/` and `https://www.urblo.com.au/` now serve `/assets/index-DZ_ipi64.js` for commit `f21bbd4`.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://www.urblo.com.au`: pass.
- In-app Browser production desktop check on `https://urblo.com.au/`: pass. Visible primary links were Projects, Capabilities, Stone Library, Our Story, and Contact Us; nav-to-button gap was 24px, right gutter was 57px, desktop hamburger exposed only Articles and Products, and console errors/warnings were empty.
- Playwright production mobile 390x844: pass. Desktop primary nav was hidden, hamburger right gutter was 20px, opened menu exposed Projects, Capabilities, Stone Library, Our Story, Articles, Products, and Contact Us, no horizontal overflow, and zero console issues.

### Risks and Gaps
- No known header-alignment regression remains after local and production checks.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-06-03 (Harness Task-State Reconciliation)

### Scope
- Reconciled `docs/agent/tasks.json` against current code, deployed Cloudflare state, controlled launch media, and no-secret verification gates.
- Marked `NOW-CLOUDFLARE-PAGES-DEPLOY-001` complete because Cloudflare Pages production deployment, custom domains, DNS cutover, Function routing scope, route/asset/redirect/API smoke, and rollback documentation are verified.
- Marked `NOW-ASSET-MIGRATION-001` complete for launch-critical media because identity assets, route banners, Contact imagery, homepage desktop/mobile video, poster, priority project/Stone Library imagery, article covers, and known article runtime media cleanup use controlled launch paths.
- Kept Forms/Admin/Content tasks open where acceptance still requires browser-safe Supabase config, first-admin/profile setup, admin live QA, email/Turnstile proof, tagged live admin writes, approved content import, or public read cutover.
- Updated Handoff and roadmap wording so Cloudflare hosting and launch-critical asset migration no longer appear as current blockers.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm ci --cache .npm-cache`: pass after approved network access; dependencies installed from lockfile and audit reported 0 vulnerabilities.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass after approved local preview-server permission; sandbox-only run failed with `listen EPERM` on `127.0.0.1:4173`.
- `npm run agent:check`: pass.
- `npm run agent:forms-ui`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass after approved network access.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:content-import:apply-sql`: pass; regenerated ignored `.tmp` review artifacts only.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `git diff --check`: pass.

### Risks and Gaps
- `NOW-FORMS-BACKEND-001` remains open only because final private-row browser-key boundary, email, Turnstile, and admin-visible lead workflow proof are not complete.
- Admin auth/settings/media/content/leads/audit source is implemented and source-verified, but live verification still requires browser-safe Supabase configuration, first-admin/profile setup, real owner/admin session credentials, and Jay approval for tagged QA writes.
- Static-to-Supabase content import remains draft/no-write only; applying import SQL, allowing merge/upsert, and switching public reads require explicit Jay approval.
- Article claim cleanup remains paused and raw newsletter HTML remains a migration source rather than the final authoring model.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-06-04 (Admin Project Publish Readiness UX)

### Scope
- Improved `/admin/projects` publishing feedback after a live editor hit the claim-review validation while trying to publish a project.
- Added a visible Publish readiness panel that lists exact blockers for project claim review, missing summary/lead copy, project facts still marked `needs_review`, and project materials still marked `needs_review`.
- Made blocker items actionable so selecting a fact/material blocker loads the affected row into its editor instead of leaving the user to search manually.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-crud-coverage`: pass.

### Risks and Gaps
- This is a targeted Projects publish UX fix, not the broader CMS IA redesign requested after first live editing use.
- Imported CMS content remains draft until editors review and publish individual rows.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`

## Entry - 2026-06-04 (Admin CMS IA/UX Baseline)

### Scope
- Started the broader CMS productization pass for non-technical editors.
- Added shared CMS status primitives so Draft, Published, and Archived have one editor-facing meaning across admin surfaces.
- Reworked the admin shell navigation into Work queue, Content library, and Operations, with persistent copy explaining that only Published content can appear publicly.
- Expanded Dashboard from a technical health queue into an editor orientation screen with Draft/Published/Archived status counts and a clear Edit -> Review -> Publish workflow.
- Improved `/admin/projects` list UX with search, status filtering, status counts, shared CMS status pills, and plain-language readiness labels.

### Changed Files
- `src/pages/admin/AdminCmsPrimitives.tsx`
- `src/pages/admin/AdminShell.tsx`
- `src/pages/admin/AdminDashboardPage.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `src/pages/admin/adminContent.ts`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass after approved local preview-server permission; sandbox-only run failed with `Vite preview did not respond at http://127.0.0.1:4173`.
- `npm run agent:admin-config-gate`: pass for 11 admin routes after approved local preview/browser permission.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is the first IA/status-language batch, not the full CMS redesign. Projects still needs a deeper list/detail/preview editing flow; Media, Stone Library, Products, Articles, Leads, and Settings still need the shared UX system applied.
- Status counts are read from Supabase through the existing authenticated admin client and depend on the active admin session/RLS.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-04 (Admin Media and Stone Library UX Baseline)

### Scope
- Extended the CMS editor-experience baseline beyond Dashboard/Projects.
- Updated `/admin/media` with shared Draft/Published/Archived status language, status counts, list search, status filtering, and a website-visibility rule in the metadata editor.
- Updated `/admin/stone-library` group lists with search, status filtering, and clearer TBC language that treats TBC as needing confirmation rather than public-ready.

### Changed Files
- `src/pages/admin/AdminMediaPage.tsx`
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass after approved local preview-server permission; sandbox-only run failed with `Vite preview did not respond at http://127.0.0.1:4173`.
- `npm run agent:admin-config-gate`: pass for 11 admin routes after approved local preview/browser permission.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Media and Stone Library now have better list/state orientation, but Stone Library still needs deeper editor-flow simplification for variants, finish capabilities, and finish images.
- Products, Articles, Leads, and Settings still need the shared UX/status/list treatment.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-MEDIA-LEADS-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-04 (Admin Products and Articles UX Baseline)

### Scope
- Extended the shared CMS status/list baseline to Products and Articles.
- Updated `/admin/products` with shared Draft/Published/Archived status language, status counts, product search, status filtering, and a website-visibility rule in the product editor.
- Updated `/admin/articles` with shared Draft/Published/Archived status language, status counts, article search, status filtering, and a website-visibility rule in the article editor.

### Changed Files
- `src/pages/admin/AdminProductsPage.tsx`
- `src/pages/admin/AdminArticlesPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass after approved local preview-server permission; sandbox-only run failed with `Vite preview did not respond at http://127.0.0.1:4173`.
- `npm run agent:admin-config-gate`: pass for 11 admin routes after approved local preview/browser permission.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Products and Articles now have better list/status orientation, but their nested model/spec/block editors still need a deeper simplification pass.
- Leads and Settings still need the shared UX/status/list treatment, and a final non-technical editor usage guide remains outstanding.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-04 (Admin Leads and Settings UX Baseline)

### Scope
- Extended the CMS editor-experience baseline to Leads and Settings.
- Updated `/admin/leads` with inbox search plus kind/status filters for enquiry/sample workflow triage.
- Updated `/admin/settings` with shared Draft/Published/Archived status language and clearer guidance separating public site identity settings from admin team access.

### Changed Files
- `src/pages/admin/AdminLeadsPage.tsx`
- `src/pages/admin/AdminSettingsPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- `git diff --check`: pass.

### Risks and Gaps
- Leads and Settings now have better orientation, but Settings still exposes footer JSON and admin Auth user IDs; those remain the least non-technical parts of the CMS.
- Final non-technical editor usage guide remains outstanding.

### Next Handoff
- `NOW-ADMIN-MEDIA-LEADS-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-04 (Admin Articles Media Authoring UX)

### Scope
- Continued the CMS productization pass on `/admin/articles`.
- Replaced article cover and structured-block media ID entry with media selectors and previews.
- Added block-type-specific content guidance before the structured JSON field, so editors can understand the expected shape without treating raw newsletter HTML as the authoring model.
- Kept existing draft/publish/archive lifecycle, audit behavior, schema, and public-read contracts unchanged.

### Changed Files
- `src/pages/admin/AdminArticlesPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview/browser checks were blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Articles still need structured public block rendering; public detail pages continue using sanitized legacy HTML fallback until that adapter is built.
- The content JSON field is now guided but still technical; a future batch should add form-native editors for common block types.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-04 (Admin Settings Footer UX)

### Scope
- Continued the Settings productization pass for non-technical editors.
- Replaced raw footer JSON editing with a footer column/item editor for text values, internal links, and external links.
- Preserved the existing `site_settings.footer_columns` JSONB storage contract by serializing the form back into the current column/item shape on save.
- Added validation for blank footer titles/items, internal links that do not start with `/`, and external links that do not start with `http://` or `https://`.

### Changed Files
- `src/pages/admin/AdminSettingsPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview/browser checks were blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Settings no longer exposes footer JSON, but admin profile creation still requires an existing Supabase Auth user ID. That remains the most technical Settings handoff step until an invite/user-create flow is added.
- Footer form editing covers the current column/item contract. If future footer data gains richer fields, this editor should be extended before those fields are handed to non-technical users.

### Next Handoff
- `NOW-ADMIN-SETTINGS-CRUD-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-04 (Admin Settings Team Access UX)

### Scope
- Continued the Settings productization pass for non-technical editors.
- Reframed admin profile management as granting CMS access to existing login accounts instead of mapping Supabase Auth user IDs.
- Added an adding-a-person sequence, role labels/descriptions, shortened account IDs in the team list, and editor-facing duplicate-account validation copy.
- Preserved the existing Auth user/profile binding, owner/admin write permission model, owner-role protection, self-lockout guardrail, and audit writer behavior.

### Changed Files
- `src/pages/admin/AdminSettingsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview/browser checks were blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- `/admin/settings` still cannot create or invite the underlying login account from the browser. The current handoff flow is: create/invite the login account outside this screen, then grant CMS access here.
- A future service-role-backed invite flow would be the cleanest way to remove the remaining account-ID step from non-technical handoff.

### Next Handoff
- `NOW-ADMIN-SETTINGS-CRUD-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-04 (Admin Editor Handoff Guide)

### Scope
- Added the first customer-facing `/admin` editor guide.
- Documented the production admin URL, roles, account setup path, Draft/Published/Archived rules, editing flow, module coverage, publish checks, public fallback boundaries, and remaining handoff gaps.
- Connected the guide to the harness startup checklist, handoff entry points, roadmap, and machine task queue so future CMS changes keep the guide current.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview/browser checks were blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a written handoff guide, not a substitute for final production editor walkthrough after the local CMS UX commits are pushed and deployed.
- The guide intentionally records current gaps: login account creation still happens outside `/admin/settings`, Stone Library detail remains static-backed, and public Article bodies still use sanitized legacy HTML.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry Template (Use for Every Future Session)

### Date
- `YYYY-MM-DD`

### Scope
- What changed in this session.
- Why it changed.

### Changed Files
- Repo-root relative file path list only.

### Verification Results
- `npm run build`: pass/fail (+ key notes)
- `npm run lint`: pass/fail (+ key notes)
- `npx tsc -b`: pass/fail (+ key notes)

### Risks and Gaps
- Open defects, unresolved tradeoffs, blocked items.

### Next Handoff
- Exact task IDs from `NEXT_STEPS.md` to run next.
