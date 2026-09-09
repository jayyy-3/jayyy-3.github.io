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

