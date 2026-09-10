# Verification entry points

Use `npm run agent:init -- --task <id>` to locate the task and scope. `npm run agent:doctor -- --target local` (or preview/production) reports prerequisites without writes or secret output. `--strict` fails on missing prerequisites; default doctor mode is advisory.

`npm run agent:verify -- --base <sha>` classifies all changes against the base, including working/staged/untracked paths. Without a base it uses the merge base with origin/main. `--plan` prints the graph without execution. `--out <path>` saves machine-readable results; every execution also retains a unique ignored `.tmp/verification/<attemptId>/` directory. Never use `--suite docs` to override classification before release.

| Category | Checks | Deploy |
| --- | --- | --- |
| Record docs | state, paths, harness and classifier; foundation dependency | No |
| Tooling | full source graph, build/lint and behavior checks | No, unless release/build input |
| Runtime or unknown | full graph plus browser config gate | Yes, then immutable smoke |
| Migration | runtime graph; isolated reset/journey proof before deployment | Yes; SQL application is a separate authorization boundary |

`npm run gate` runs the deduplicated source graph in clean Node 20. `agent:smoke`, `agent:admin-cms-predeploy`, `agent:check` remain compatible. Running separate aliases separately is a separate verification invocation; use the combined graph to avoid duplicate nodes. Configured and env-less builds are distinct configurations. No suite certifies live CMS golden workflows or production writes.

Use `agent:verify --plan` to identify the applicable checks. For runtime/tooling changes, the required clean container gate supplies the source-graph evidence; add only checks it does not cover, such as the no-config browser gate. Do not first repeat the complete source graph on the host. Record-only changes run the classified docs graph. The sections below describe coverage and additional checks, not cumulative command lists. After a graph passes, do not rerun its covered checks through standalone aliases for the same tested inputs and environment. Recheck affected coverage when code, check inputs or configuration change, or a new failure warrants investigation. Configured builds, isolated database journeys, deployed smoke and required CI remain distinct checks. Run `git diff --check` once for the final patch.

The registry in `scripts/_lib/verification.mjs` owns dependencies; classification tests cover actual Git rename/delete/untracked records and runtime fingerprints. `quality` always resolves on PRs, including record-only PRs; runtime smoke failure makes it fail. Main branch protection needs repository administrator access.

Runtime CI additionally runs `npm run local:verify` with Node 22 before deployment. That local configuration has its own build and real database; it is distinct from the configured production build. Synthetic journeys cover QR upload/material save/refresh/public readback; Projects private draft/publish/hide and delayed-load cancellation; Articles validation/API-failure recovery/parent-bound section saves/selection locks/public rendering; Contact/Sample Request persistence and owner inbox readback; and an unprofiled account boundary. External mail is disabled; notification-provider logic is separately covered by in-memory forms API checks.

## Retained specialized verification and live boundaries

## QR material-page release verification

`npm run agent:admin-image-qr` includes in-memory Function behavior checks for defaults, safe embedded JSON, public omission of internal fields, hidden/unknown links, HEAD/method behavior, role denial, invalid combinations, stale-save conflicts, persisted readback and stable slug/image selection across rename and Hide/Restore. No network or live writes are made by this verifier. `agent:content-import` and `agent:stone-library-detail` verify the shared finish-image catalog. Use the common release flow above; QR source checks are already included in the runtime graph. Live material save/refresh requires the additive migration and release-specific approval; an in-memory pass is not live evidence.

## Startup Check
Use when resuming work or handing off between agents.

Run:
- `npm run agent:init`
- `npm run agent:live-readiness` when continuing form/admin/Cloudflare live verification work.
- `npm run agent:supabase-foundation-readiness` when continuing Supabase foundation, seed, Storage, helper, or form-RPC contract work without live credentials.

This command is informational and does not replace verification gates. Use `--base-url <origin>` and `--admin-email <email>` only for non-secret manual inputs; the runner treats copied placeholders or malformed values as missing, and the base URL must be an `http`/`https` origin with no path/query/hash. For live form checks, use `--form-writes-approved` in readiness only after Jay has approved tagged live form QA writes; actual `npm run agent:forms-live` execution must also include `--allow-writes`. For the first-admin profile/invite write path, use `--first-admin-writes-approved` only after Jay has approved creating/upserting the first profile or sending an invite. For live admin CRUD writes, use `--admin-writes-approved` only after Jay has approved tagged live admin QA writes. For static-to-Supabase content import and public read cutover, use `--content-import-approved`, `--content-merge-approved`, and `--content-public-cutover-approved` only after Jay has approved the guarded draft import apply, any required merge/upsert behavior, and the public read-path switch. For final Turnstile proof, use `--turnstile-token-provided` only when a valid target-environment token will be supplied to `npm run agent:forms-live -- --allow-writes --require-turnstile --turnstile-token <token>`.

The actual live runners use the same manual-input boundary: `agent:forms-live`, `agent:cloudflare-preview-smoke`, `agent:admin-auth-browser`, and `agent:admin-config-gate` reject placeholder or non-origin `--base-url` values before network or live-write work starts. `agent:admin-live-readiness`, active-admin/unprofiled browser QA, and admin CRUD live writes require real email-shaped inputs instead of copied placeholders.

### Harness GC
Use when Jay asks to run Harness GC, when current-state docs feel noisy, after a major production proof, or before a new agent should rely on the Harness.

Run:
- `npm run agent:harness-gc`
- `npm run agent:harness-gc:review`

Evidence to record:
- Whether `docs/agent/status.json` still matches current production/local state.
- Task status counts and whether `now` tasks are too broad.
- Any stale README/HANDOFF/AGENTS/NEXT_STEPS wording found.
- Location of `.tmp/harness-gc-review.md` when review mode is run.
- Which suggested cleanups require Jay's judgment rather than automatic mutation.

### Runtime UI

Run the classified graph, then rendered QA of affected routes against `docs/DESIGN.md` and `docs/brand-baseline.md`. Record responsive states and browser errors. Specialized checks below add coverage; do not repeat graph nodes in the same run.

### SEO Indexability
Use when changing public metadata, public route slugs, `robots.txt`, `sitemap.xml`, structured data, canonical URL behavior, or the source list of pages intended for search indexing.

Additional check: `npm run agent:seo-readiness`. Homepage media, product images and Stone detail integrity are covered by the runtime graph.

Evidence to record:
- Sitemap URL count and covered page families.
- Whether `/admin`, `/api`, draft, or private content is excluded.
- Metadata and canonical source file touched.
- Structured data types added or changed.
- Whether production `robots.txt` and `sitemap.xml` were verified after deployment, or why that remains pending.
- Any remaining SPA, pre-render, or SSR limitation.
- Any Google Search Console follow-up: sitemap read status, discovered URL count, legacy URL examples, and whether those legacy URLs should be redirected, retired, or investigated.

### Data or Content Contract
Use when changing `data/**`, `public/articles/**`, service-layer view models, or typed data contracts.

Graph coverage includes build/typecheck, lint, harness, public-content readiness/overlay and Project aggregate checks. Verify normalization, Published/static merge rules, canonical keys, media resolution and draft/public boundaries as applicable.

Additional checks:
- `npm run agent:content-import` when changing static-to-Supabase import mapping or source content used by that dry run.
- `npm run agent:content-import:apply-sql` when changing static-to-Supabase import or rollback SQL artifact generation.

Evidence to record:
- Source files changed.
- Any normalization, fallback, or missing-data behavior.
- Affected runtime pages.

For Project Stone Library material-point changes, also verify:
- Stone → Variant → supported Finish filtering in `/admin/projects`.
- Project material/point title or image overrides are absent from the editor and normalized saves.
- Public hotspot and Featured Materials cards resolve Published Stone Library imagery and deep-link the selected variant/finish.
- Draft Project editing exposes and labels non-Archived Stone Library records and imagery; publish validation still rejects any selected Stone, Variant, Finish, finish-image link, or linked media asset that is not Published.
- `npm run agent:admin-projects-aggregate` covers the aggregate compatibility contract before any separately approved migration apply.

### Route, Navigation, or CTA Contract
Use when changing `src/App.tsx`, shared header/footer links, route params, mailto/tel behavior, or form behavior.

Use the common verification entry point above.

Evidence to record:
- Declared routes changed.
- Navigation surfaces changed.
- Any backend absence or mailto fallback remains explicit.

### Deployment or Tooling
Use when changing `.github/**`, `package.json`, `vite.config.ts`, `tsconfig*.json`, ESLint config, or scripts.

Build, lint and harness checks are selected by the graph. Add a tool-specific dry run where applicable.

Evidence to record:
- Command output summary.
- Any credentials, environment, or CI assumptions.

### Cloudflare Deployment
Use when changing the Cloudflare Pages launch contract, Pages Functions routing, environment variables, redirects, headers, preview deployments, DNS cutover docs, or rollback docs.

Cloudflare source readiness is included in the graph. Additional deployed verification:
- `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev` after a Pages preview URL exists
- Production apex, `www`, and the moving `urblo.pages.dev` alias are matched after FQDN trailing-dot normalization and require an independent exact `--reference-url https://<8-hex-deployment>.urblo.pages.dev`; default/branch aliases and self-comparison are invalid references.
- The deployed smoke must reject redirects on every direct SPA route, require every route to reference the same entry assets as `/`, reject absolute/cross-origin/query/fragment asset references, verify exact same-origin query-free recursively discovered asset URLs without cache-busting, require JavaScript/CSS MIME types, reject an SPA HTML shell returned with HTTP 200, and require byte-for-byte plus MIME equality with the immutable reference across the full graph. A residual long-lived response header is warning-only after that comparison; without it the header remains a failure. Status-only asset checks are insufficient.

Evidence to record:
- Cloudflare project name/environment if known.
- Build command and output directory.
- Preview URL and production URL if available.
- Whether static routes avoid Function invocation.
- Direct-refresh checks for declared public routes.
- Deployed route chunk discovery, admin bundle config/profile-gate contract, and browser service-role secret boundary checks.
- API safe-failure results for unsafe methods, OPTIONS/CORS preflight, malformed JSON, and invalid payloads.
- For protected `/api/admin/projects`, unauthenticated GET and POST must return structured `401` responses before configuration/body/database work; OPTIONS must advertise GET/POST plus authorization/content-type. This no-write preview check does not exercise an authenticated aggregate mutation.
- DNS cutover and rollback assumptions.

### Supabase Schema or Data Migration
Use when adding Supabase schema, RLS policies, seed/migration scripts, public read contracts, or moving Projects, Stone Library, Articles, media, enquiries, or sample requests out of static files.

Graph coverage includes build/typecheck, lint, harness, foundation grants/RLS, public-content readiness/overlay and Project aggregate checks. For Project migrations, verify private drafts, the service-role-only RPC, table/sequence write lockdown, public parent/child reads and archived-slug tombstones.

Additional checks:
- Tool-specific migration dry run or isolated local Supabase verification.
- `npm run agent:content-import:apply-sql` when changing guarded static-to-Supabase import or rollback artifacts.

Evidence to record:
- Tables/relations changed.
- RLS status and public/admin access assumptions.
- Data API role grants for tables and generated sequences when PostgREST or `supabase-js` access is in scope.
- Migration source files and row counts where available.
- Rollback or restore path.
- Any customer-facing data not yet migrated.

### Backend API and Forms
Use when adding or changing `/api/*` endpoints, form submission behavior, Turnstile verification, Supabase writes, transactional email, or lead-status workflow.

Graph coverage includes form API/UI, Capability download and Project aggregate checks. These cover submission routing, request validation, authorization, service-role boundaries and media promotion/compensation. Add API-level positive and negative tests for changed behavior not already covered.

Additional live checks:
- `npm run agent:forms-live -- --allow-writes --allow-email --require-email` when verifying real notification delivery after SMTP2GO variables and Jay approval are available.
- `npm run agent:forms-live -- --allow-writes --require-turnstile --turnstile-token <token>` when verifying real Turnstile handling after `VITE_TURNSTILE_SITE_KEY`, the Turnstile secret/token, and Jay approval are available.

Evidence to record:
- Endpoint paths changed.
- Valid submission result.
- Invalid/spam submission result.
- Malformed JSON result and confirmation that it creates no Supabase calls.
- Supabase record creation proof.
- Email notification proof or reason it was mocked.
- Whether final live email proof required stored `notification_status = sent`.
- Whether final live Turnstile proof required stored `turnstile_success = true`.
- Whether the public Turnstile widget path was configured with `VITE_TURNSTILE_SITE_KEY` or intentionally omitted for local/source-only verification.
- Secret/env assumptions.

### Admin CMS
Use when adding or changing `/admin`, authenticated content CRUD, article block editing, media upload, or lead-management views.

The runtime graph includes admin CRUD coverage, QR, Projects, Stone, report-only handoff readiness and the no-config browser gate. Do not append CMS predeploy, smoke or these individual source checks after their graph coverage has passed.

Coverage and additional acceptance:
- Source coverage includes route/module registration, table references, audit/export controls, role boundaries and publish/archive paths. QR coverage includes image optimization, resolution, Function behavior and routing; it does not apply a migration or upload an object.
- Project coverage includes one complete draft, a protected endpoint, revision guards, shared public/preview rendering, visual hotspots, private media, transactional audit, public-copy compensation and a service-role-only RPC. It does not establish applied migration state.
- Project verification must reject visible proof-review controls/permissions and prove that client/server Save normalization makes legacy review columns compatibility-only. Public smoke must verify the route-aware `overlay`/`light-page` header contract, reject a solid-black 102px fallback and medium/heavy backdrop blur, and confirm that critical non-default opacity utilities used by the navbar, menu, homepage controls, and detail surfaces exist in built CSS. Rendered Projects listing/detail QA must compare against Stone Library: both use the same light 102px layout clearance and deeper clear-glass header/menu, without page-local duplicate top padding; image/video-first routes must retain recognizable media detail beneath the lighter overlay glass.
- The graph’s no-config browser check covers protected routes and configuration-missing behavior using an isolated bundle with browser-safe Supabase variables cleared, or its freshly verified env-less `dist/`; it never reuses a configured `dist/`. Real authenticated editing remains separate acceptance below.
- `npm run agent:admin-auth-browser` in plan-only mode when changing admin browser auth QA tooling; run `npm run agent:admin-auth-browser -- --allow-login --strict` only after browser-safe Supabase config and a real active admin email/password are available. Without `--base-url`, it must build current source into an isolated configured bundle, enforce the entry-size/no-eager-Supabase boundary, prove static public fallback with the Supabase chunk blocked, use stable semantic login markers, and revisit a protected route after Sign out.
- `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` when a valid Auth user without an active `admin_profiles` row is available through `URBLO_UNPROFILED_EMAIL` and `URBLO_UNPROFILED_PASSWORD`; the check must keep all launch-critical admin route probes on `/admin/unauthorized` without private module content.
- `npm run agent:first-admin-bootstrap` when changing first-admin bootstrap tooling. Use `--verify-only` only after a service-role key and first admin email are configured; write mode requires explicit approval.
- `npm run agent:admin-crud-live` in plan-only mode when changing live admin verification contracts; run `npm run agent:admin-crud-live -- --allow-writes` only after browser-safe Supabase config and a real owner/admin session are available and Jay has approved tagged QA writes.
- `npm run agent:admin-crud-live -- --allow-writes --include-storage` for owner/admin private-upload/readback plus anonymous-denial proof after the same credentials/session/approval gate is satisfied; this is not the Editor public-bucket boundary proof.
- `npm run agent:admin-media-role-boundary-live` in plan-only mode when changing the Storage role verifier; after the migration is applied/read back and Jay approves tagged Storage writes, run `npm run agent:admin-media-role-boundary-live -- --allow-writes --strict` with distinct active Editor and owner/admin credentials to prove Editor private insert/update success, Editor public insert/update denial, owner/admin public insert/update success, and cleanup.
- `npm run agent:live-readiness -- --base-url <production-origin> --admin-email <first-admin-email>` before requesting live inputs. The Media role check must remain blocked until the migration readback is complete, distinct Editor/owner credentials exist, Jay approves that exact tagged Storage role proof, and `--media-role-migration-verified --media-role-writes-approved` records those non-secret prerequisites.
- Browser checks are mandatory for any handoff claim. Route-shell checks are useful but do not prove editing.
- Phase 1 Projects acceptance is evidence-composed, never inferred from its verifier alone. Expand migration `20260719015649_project_aggregate_drafts.sql`, minimum-disclosure migration `20260802103337_restrict_archived_project_tombstones.sql`, aggregate production runtime, and contract B are deployed/applied/read back. Preview marker `admin-projects-ui-mrroa6p0` passed one-Save/refresh, unsaved shared-preview parity, a saved 55/55 material-map hotspot, private-first upload and committed promotion/private-source cleanup, Publish/public readback, Hide, anonymous row denial, and public-not-found. Deterministic tests cover stale-Save 409 and failed-Publish compensation; production deployment-bound smoke/login and the PR `#11` single-editor/header follow-up pass. Jay then used production on 2026-08-02 and reported no issue/OK, supplying the user-owned acceptance that agents cannot self-certify. Real two-session/Postgres/Storage negative proof remains optional and requires its own approval; B makes Cloudflare-only rollback to the old direct-write UI invalid.
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` after the current CMS UX stack is deployed and before final non-technical editor handoff.
- Update `docs/agent/admin-handoff-evidence.json` only after the fixed production deployment completes the Storage role-boundary prerequisite and every required golden workflow with evidence references, one deployment SHA, verified/expiry timestamps, and the actual admin identity.
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict` after structured evidence is complete. WORKLOG prose or a `Pass` table cell cannot satisfy this gate by itself.

Evidence to record:
- Admin routes touched.
- CRUD flows manually or automatically checked.
- Validation/save/publish/archive/error/read-only state coverage when source-only verification is used.
- Draft/published visibility behavior.
- Auth/RLS assumptions.
- Applied Storage migration/policy readback plus Editor private insert/update success, Editor public insert/update denial, and owner/admin public insert/update success.
- Any content type still requiring code edits.
- Production walkthrough results for the Handoff Evidence Matrix, Dashboard operational queue, responsive navigation at mobile/1116px/wide widths, Projects task-workspace usability, Settings invite/access, Stone Library publish path, Article publish path, editor-guide usability, and Open public page confirmation when claiming editor-handoff readiness.
- Golden workflow results for authenticated sign-in, draft save/refresh persistence, private Media Storage promotion, Published public readback, archive behavior, Published Settings public readback, invite/password setup, logout/password sign-in, password recovery, responsive navigation at mobile/1116px/wide widths, the Projects stable-record/page-shaped aggregate/dirty-guard/blocker-jump/shared-preview/inline-media/visual-hotspot flow, the Dashboard operational queue, and non-technical editor-guide usability.
- Image QR acceptance remains user-owned: upload multiple images, confirm visible before/after sizes, download PNG and SVG, scan/open the direct image, replace it and confirm the original QR still works, then Hide/Restore it. Production Storage/database writes require explicit approval.
- Supabase Auth custom SMTP delivery/log evidence and readback of the Auth Site URL plus exact allowed invite/recovery Redirect URLs. A delivered email whose callback falls back to localhost is a failing result, not partial handoff completion. Contact/Sample Request SMTP proof is not equivalent.
- Final handoff readiness audit result, including whether the strict command passed or which production evidence is still missing.

## Output Rule
Every completed task should leave a short verification note in `docs/WORKLOG.md` and should keep `docs/HANDOFF.md` current if it changes the next recommended action.

The local doctor requires Node 22+ for Wrangler; the clean source gate uses Node 20. Preview diagnostics require an explicit `--base-url https://<preview>.urblo-site.pages.dev`; the doctor never substitutes the recorded production immutable deployment for a missing Preview target. `agent:init --json` distinguishes the current checkout from observed production, exposes next action and module paths, and supports an explicit idle repository state after completed work is archived.

## Stone Library workspace candidate

- Graph coverage: deterministic save-queue, request validation, media pagination, access/privacy, exact-image mapping, publication compensation and protected-boundary checks via `agent:stone-workspace`; no separate rerun is required.
- `scripts/fixtures/stone-workspace.sql`: disposable local database only, with both Stone migrations applied; transactional assertions cover draft isolation, ID preservation, replay/conflict, access and reference constraints. Never execute this fixture on production.
- `scripts/fixtures/start-stone-browser.mjs`: loopback-only local UI fixture using a disposable PostgREST database and synthetic sessions. Browser save/refresh, private upload/preview/publish, >160 media pagination, failed-save navigation, lost-response replay and two-editor conflict were exercised. Synthetic sessions are not production Auth proof.
- `npm run agent:stone-adoption-plan`: reviewed no-write inventory. Live flags require fresh item-specific approval for the exact plan SHA; see `docs/STONE_LIBRARY_WORKSPACE_RELEASE.md`.
- Use the common release flow above. For a release involving migration or adoption, apply the approved plan and verify its production results. Tagged browser workflows must cover save/refresh, private-draft isolation, upload/preview, publish/public readback and reference-safe hide/restore. Jay's usability acceptance remains separate from technical verification.

Deployment readiness behavior is covered by `node scripts/check-deployment-readiness.mjs` in the container/runtime graphs: bounded recovery and timeout, no credential/body forwarding, immutable-only GETs, immediate redirect/access/contract rejection and safe diagnostics. This adds no live writes or relaxation of the complete deployed smoke.
