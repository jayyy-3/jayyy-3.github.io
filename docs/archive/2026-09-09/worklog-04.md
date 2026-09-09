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

