# WORKLOG - Urblo Execution Log

Last updated: 2026-05-28

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
