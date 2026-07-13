# AGENTS - Urblo AI Harness Entry

Last updated: 2026-07-13

## Project Mission
Urblo web exists to communicate a design-led, engineering-backed, proof-driven natural stone solution system for streetscapes and civil landscapes.

The harness has two separate creative authorities:
- Brand strategy, positioning, copy claims, and audience framing live in `docs/brand-baseline.md`.
- Visual design, UX rhythm, page composition, interaction tone, and UI quality live in `docs/DESIGN.md`.

## Working Process
Day-to-day delivery and design-consistency process is governed by `docs/OPERATING_PROTOCOL.md`. Read it right after this file at session start.
- No change reaches production untested: branch -> local container gate (`npm run gate`) -> Cloudflare preview smoke -> promote to `main`. The gate validates the working tree, so commit everything before pushing.
- Every UI/claim/composition change runs the review -> implement -> remember design loop on top of `docs/DESIGN.md` and `docs/brand-baseline.md`.

## Startup Checklist
1. Run `npm run agent:init` when you need a quick repo/status briefing.
2. Read this file first: `AGENTS.md`.
3. Read current handoff: `docs/HANDOFF.md`.
4. Read compact current status: `docs/agent/status.json`.
5. Read machine task queue: `docs/agent/tasks.json`.
6. Read verification matrix: `docs/agent/verification.md`.
7. Read brand rubric: `docs/brand-baseline.md`.
8. Read design contract: `docs/DESIGN.md`.
9. Read technical facts and contracts: `docs/ARCHITECTURE.md`.
10. Read human roadmap: `docs/NEXT_STEPS.md`.
11. Read admin IA/access contract when working on `/admin`: `docs/ADMIN_IA_ACCESS.md`.
12. Read admin editor handoff guide when preparing CMS handoff or customer-facing admin instructions: `docs/ADMIN_EDITOR_GUIDE.md`.
13. Read latest session evidence when needed: `docs/WORKLOG.md`.
14. For docs/harness changes, run:
   - `npm run agent:check`
   - `git diff --check`
15. For runtime changes, run quality gates from repo root in this order:
   - `npm run build`
   - `npm run lint`
   - `npx tsc -b`
   - `npm run agent:smoke`
16. Treat any runtime gate failure as blocking unless `docs/agent/tasks.json` explicitly defines a temporary exception.
17. Before deploying the current `/admin` CMS UX stack, run:
   - `npm run agent:admin-cms-predeploy`
   - `npm run agent:smoke`
   - `npm run agent:admin-config-gate`
18. Before the final CMS handoff audit, and only after Jay approves the production migration plus tagged Storage writes, apply/read back the pending Media role migration and run:
   - `npm run agent:admin-media-role-boundary-live -- --allow-writes --strict`
19. Before claiming CMS handoff complete, fresh production-prerequisite and golden-workflow evidence tied to one deployment SHA must be recorded in `docs/agent/admin-handoff-evidence.json`, supporting detail must exist in `docs/WORKLOG.md`, and this strict audit must pass:
   - `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict`
20. When Jay asks to run Harness GC, run:
   - `npm run agent:harness-gc`
   - `npm run agent:harness-gc:review`

## Canonical Conflict Precedence
- Code reality wins over stale docs. If docs conflict with implemented behavior, verify code reality, update docs, then add remediation tasks if the behavior itself is wrong.
- Working process (delivery gates, session kick-start, design loop): `docs/OPERATING_PROTOCOL.md` is authoritative. `AGENTS.md` remains the root entry point and wins on startup order.
- Brand strategy, positioning, audience, voice, and claim safety: `docs/brand-baseline.md` is authoritative.
- Visual design, UX rhythm, layout density, imagery treatment, page archetypes, and interaction tone: `docs/DESIGN.md` is authoritative.
- Architecture, route, data, state, side-effect, and deployment contracts: `docs/ARCHITECTURE.md` is authoritative.
- Machine-readable execution priorities and task sequencing: `docs/agent/tasks.json` is authoritative.
- Human-readable roadmap and cycle shape: `docs/NEXT_STEPS.md` is advisory.
- Current handoff state: `docs/HANDOFF.md` is authoritative for the next recommended action.
- Session evidence and what was actually validated: `docs/WORKLOG.md` is authoritative.

When brand and design appear to disagree, preserve the brand promise first, then adjust UI execution through `DESIGN.md`.

## When Docs Must Be Updated
Update docs when any of the following changes:
- Route behavior, navigation behavior, or CTA behavior visible to users.
- Page-level design direction, visual system choices, or interaction patterns.
- Data contracts or typed models used by runtime pages.
- State/storage side effects (`zustand`, `localStorage`, client fetch contracts).
- Build/lint/typecheck gate status.
- Deployment behavior or release pipeline.
- Priority, risk posture, or handoff assumptions.

Committed docs should use repo-root relative paths such as `src/App.tsx` or `docs/DESIGN.md`. Do not write machine-specific absolute paths into repo docs. If an outside local archive informed a decision, summarize it as an external source instead of making it a canonical path.

Minimum required updates for major changes:
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md` when current state, next action, or risk posture changed
- `docs/agent/tasks.json` when task status, files, acceptance, or verification changed
- `docs/ARCHITECTURE.md` when contracts changed
- `docs/DESIGN.md` when visual or UX direction changed

## Delivery Closure Guardrail
Before declaring implementation complete, verify all checks below:
- Code gates passed for runtime changes (`build`, `lint`, `tsc`).
- Harness checks passed for docs/tooling changes (`npm run agent:check`, `git diff --check`).
- Contract docs reflect current routes and runtime data sources.
- User-facing changes include a brand/design alignment note when relevant.
- `docs/HANDOFF.md` reflects current next action and risks.
- `WORKLOG.md` includes scope, verification evidence, and residual risks.
- `docs/agent/tasks.json` and `NEXT_STEPS.md` leave explicit follow-ups.

## Current Critical Risk Snapshot
- Jay reported the production `/admin` as not working and extremely difficult to use on 2026-07-13. The previous CMS handoff conclusion is invalidated; `docs/agent/admin-handoff-evidence.json` is `revalidation_required`, and `NOW-ADMIN-RELIABILITY-UX-001` is the P0 executable incident.
- Prior active-admin proof covered route shells, while admin CRUD proof used direct browser-key/API mutations. Neither proved an editor completing UI save/refresh, private-media promotion, publish/public readback, archive, Settings public readback, invite/password setup, or password recovery.
- Incident repairs for the Supabase auth callback deadlock pattern and same-user background refresh, isolated-session implicit invite/recovery password setup, Media reliability/private-first promotion, public Storage URLs, per-record overlays, Published settings consumption, parent-bound child updates, loading-state locks, the Articles invalid-save lockup, route chunks, medium-desktop header clipping, and Projects task-workspace UX were deployed through PR `#3` on 2026-07-13. Cloudflare preview and production no-write smoke passed for merge commit `46d46b4`; approved production-prerequisite and authenticated golden-workflow verification are still required before handoff.
- Harness hardening was deployed through PR `#5` / merge `cb0ec9a` / immutable deployment `4aef2ba1-3e00-4e43-b5d6-1ac962fbf02d`. The immutable deployment passes static-fallback fault injection and all nine authenticated admin routes, but the production custom domain exposed a separate Cloudflare cache incident: three exact hashed JS/CSS URLs returned a cached SPA HTML shell with HTTP 200. The former deployed smoke accepted those false 200s. A MIME/body-aware asset gate and new content hashes are the immediate P0 release repair; do not claim the custom origin healthy until that newer deployment passes.
- A real Supabase Auth invite reached the approved QA recipient on 2026-07-13, but its callback fell back to `http://localhost:3000` even though the invite Function supplied the production origin. This confirms that the Auth Site URL and/or exact invite/recovery Redirect URL allowlist is wrong or incomplete. Custom SMTP ownership remains unverified. Contact/Sample Request SMTP2GO proof is a separate mail path and does not prove production-ready admin Auth delivery.
- Root harness entry is `AGENTS.md`; the old `docs/README_AGENT.md` path is retired.
- Compact machine-readable current state now lives in `docs/agent/status.json`; Harness GC policy and command behavior live in `docs/agent/harness-gc.md`.
- Current-state handoff is `docs/HANDOFF.md`; machine task state is `docs/agent/tasks.json`.
- Launch target is now Cloudflare Pages + Supabase + Urblo-owned `/admin`; the long-form plan is `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`.
- Supabase foundation migrations are applied and verified for project `Urblo` (`npkidywzwddbnfrnxlmo`): 24 launch tables, RLS, policies, FK indexes, private lead/admin protection, and read-only anonymous public-content grants.
- `npm run agent:supabase-foundation-readiness` is the no-secret source gate for the foundation contract: expected migrations, 24-table schema, RLS source, anonymous read-only posture, baseline seeds, atomic Sample Request RPC, Storage buckets/listing hardening, private SECURITY DEFINER helpers, and admin profile email uniqueness.
- Supabase baseline seed migration is applied and verified: 12 distinct published finish definitions and one published default site settings row.
- Supabase admin settings/profile/helper hardening migrations are applied and verified: `site_settings` writes are owner/admin only, admin profile owner-role changes are owner-protected, admin profile emails are case-insensitively unique, public helper RPC execution is revoked from browser roles, RLS/Storage policies call private SECURITY DEFINER helpers, and the Supabase security advisor currently reports no security lints.
- Supabase media Storage buckets/listing hardening are applied and verified: `urblo-public-media` and `urblo-admin-media` exist and public object listing is disabled. The applied write policy still permits active editors to call the public bucket directly; `supabase/migrations/20260713065628_media_public_bucket_role_hardening.sql` now restricts public insert/update to owner/admin while retaining editor writes to the private draft bucket, but still requires production apply and live role-boundary verification.
- `npm run agent:admin-media-role-boundary-live` is the dedicated browser-key/RLS proof for that pending policy. It is no-network/no-write by default; after explicit approval, `--allow-writes --strict` requires distinct active Editor and owner/admin credentials, verifies Editor private insert/update success plus public insert/update denial, verifies owner/admin public insert/update success, and fails unless every tagged Storage object is removed.
- Forms backend source is implemented for `/api/enquiries` and `/api/sample-requests`, including server-side audit-event attempts after successful lead inserts. Basic deployed persistence is verified on `https://urblo.pages.dev`: valid tagged Contact and Sample Request submissions created `enquiries` row `1`, `sample_requests` row `1`, `sample_request_items` row `1`, and `admin_audit_events` rows `1`/`2`; invalid tagged payloads created zero lead or audit rows.
- Final form proof now has explicit verifier flags for real notification and Turnstile behavior: `--allow-email --require-email` must prove stored `notification_status = 'sent'`, and `--require-turnstile --turnstile-token <token>` must prove stored `turnstile_success = true`; that Turnstile proof now refuses to start unless the public Contact widget key `VITE_TURNSTILE_SITE_KEY` is configured, while server verification still requires `TURNSTILE_SECRET_KEY` or `CF_TURNSTILE_SECRET_KEY`.
- `npm run agent:forms-live -- --allow-writes` is the credential-gated and approval-gated live form verification runner; it proves valid enquiry/sample-request rows plus source-route audit metadata, invalid-payload no-row/no-audit behavior, and response-vs-stored notification status. The 2026-06-02 deployed proof used approved tagged writes plus Supabase connector readback for the base persistence/audit case; the 2026-06-03 SMTP2GO proof against `https://urblo.com.au` created `enquiries.id = 3`, `sample_requests.id = 2`, `sample_request_items.id = 2`, and `admin_audit_events.id = 4/5`, with both stored lead rows at `notification_status = sent`. The 2026-06-03 browser-key private-row boundary proof created `enquiries.id = 4`, `sample_requests.id = 3`, `sample_request_items.id = 3`, and `admin_audit_events.id = 6/7`; anonymous REST reads through the deployed Supabase publishable key returned 401 for all three private tables. `--require-turnstile --turnstile-token <token>` remains a separate final proof once Turnstile inputs are configured.
- `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` is the read-only admin credential/profile readiness runner; it requires browser-safe and service-role keys, verifies the named active profile, baseline seed rows, and browser-key anonymous public/private REST boundary, and never mutates Supabase. Equivalent connector verification on 2026-06-03 confirmed `info@urblo.com.au` exists as a confirmed Supabase Auth user, has one active `owner` profile, has bootstrap audit row `admin_audit_events.id = 8`, can read public seed rows through the deployed publishable key, and cannot anonymously read `admin_profiles`.
- `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au` passed on 2026-06-04 for `info@urblo.com.au`: it signed in through production `/admin/login`, verified all 9 authenticated admin route shells, verified Sign out, created no content rows/Storage objects/audit events, and wrote ignored screenshots under `.tmp/admin-auth-browser/screenshots`.
- `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` is the no-write browser QA gate for a valid Supabase Auth user without an active `admin_profiles` row; it requires `URBLO_UNPROFILED_EMAIL`/`URBLO_UNPROFILED_PASSWORD`, must land on `/admin/unauthorized`, must keep all launch-critical admin route probes on the unauthorized shell without private module content, and never mutates Supabase.
- First-admin bootstrap is complete for `info@urblo.com.au`: Supabase Auth user `74b9e1d1-5f29-482c-836e-4feec8cd0087` is linked to an active `owner` profile, with bootstrap audit row `admin_audit_events.id = 8`.
- A separate active QA Editor was provisioned on 2026-07-13 and its password sign-in plus own-profile RLS readback were verified. Credentials remain only in the ignored mode-`0600` local `.env`. The invitation was activated through the Auth API because the delivered link redirected to localhost, so this proves account readiness but does not satisfy the Settings invite/password golden workflow.
- First-admin and admin-readiness scripts normalize `admin_profiles.email` before matching the supplied first-admin email, matching the database's case-insensitive normalized email uniqueness contract.
- `npm run agent:live-readiness` is the no-secret live-input audit runner; it reports which form/admin/content-import/Cloudflare live verification inputs are present or missing, including active-admin browser QA, unprofiled unauthorized browser QA, and the separate Editor-versus-public-Media Storage role proof, without printing secrets or mutating Supabase/Cloudflare. Non-secret manual inputs can be passed with `--base-url`, `--admin-email`, `--form-writes-approved`, `--first-admin-writes-approved`, `--admin-writes-approved`, `--media-role-migration-verified`, `--media-role-writes-approved`, `--content-import-approved`, `--content-merge-approved`, `--content-public-cutover-approved`, and `--turnstile-token-provided`; use `--strict` when missing/manual-gated live inputs should fail the command. The Media flags record completed policy readback and approval for that exact tagged role proof only; they do not apply SQL or run writes.
- `npm run agent:cloudflare-readiness` is the no-secret repo-side Cloudflare Pages readiness runner; it verifies build settings, clean-route fallback, `/api/*` Function routing scope, launch headers, API handlers, env placeholders, and the deployment runbook before account-level Pages setup.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev` is the no-secret deployed-preview smoke runner; it verifies direct-refresh public/admin route shells, recursively discovered JS/CSS status plus MIME/body integrity so an SPA HTML fallback cannot masquerade as an asset, Cloudflare-applied legacy redirects, and `/api/enquiries` / `/api/sample-requests` safe-failure behavior after a Pages preview URL exists.
- Cloudflare account access has been rechecked for the production zone: `urblo.com.au` is readable in Hunter's account (`077afae2c6f4e77badadf21e49e58eb7`), the `urblo` Pages project exists with default domain `urblo.pages.dev`, GitHub source is connected to `jayyy-3/jayyy-3.github.io`, and the latest verified admin-repair deployment `6d193af5-cf8e-4541-a1e2-c73164d1a290` for merge commit `46d46b4` is successful. Its immutable URL is `https://6d193af5.urblo.pages.dev`; production custom domains `urblo.com.au` and `www.urblo.com.au` are attached, `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au` passes, and website DNS points apex and `www` to `urblo.pages.dev`; Google MX/SPF/TXT, NS records, and `qa.urblo.com.au` were not changed. Rollback DNS values are recorded in `docs/CLOUDFLARE_DEPLOYMENT.md`.
- Public Projects, Products, Articles, and the Stone Library listing/detail now prefer Published CMS/Supabase content with static fallback; imported production content is intentionally draft/review-only until an editor publishes items in `/admin`.
- `/admin` auth shell source is implemented and config-gated: routes exist outside public site chrome, use Supabase Auth/profile checks when browser-safe keys are configured, and show a configuration-required state without rendering dashboard content when keys are absent.
- `/admin/settings` source can read/create/update the default `site_settings` row and manage existing Supabase Auth users' admin profile rows for owner/admin roles after live auth is configured; first admin bootstrap and active-admin browser QA are complete for `info@urblo.com.au`, while settings/team-management save proof still requires approval-gated admin live-write QA.
- `/admin/media` source is implemented as the first media library screen: active admin/editor roles can upload private Storage-backed drafts, edit metadata, and export the loaded manifest after audit logging. Metadata-insert failure is read back before any owner/admin best-effort orphan cleanup. Private-to-public Storage promotion is owner/admin only under current delete RLS; it uses the selected row's original bucket/path and `updated_at`, create-only destination writes, database/reference readback, and retain-on-uncertainty error disclosure because browser Storage/database writes are not atomic.
- `/admin/stone-library` source is implemented as the first content CRUD screen: active admin/editor roles can maintain stone groups, variants, finish capability rows, and finish image links to media records after live auth is configured.
- `/admin/projects` source is implemented as the next content CRUD screen: active admin/editor roles can maintain project records, facts, material schedule rows, material maps, and hotspots after live auth is configured.
- `/admin/products` source is implemented as the next content CRUD screen: active admin/editor roles can maintain product families, models, material defaults, and specs after live auth is configured.
- `/admin/articles` source is implemented as the next content CRUD screen: active admin/editor roles can maintain article metadata and structured article blocks after live auth is configured.
- `/admin/leads` source is implemented as the first lead inbox screen: active owner/admin roles can update enquiry and sample request status, assignment, internal notes, and export the currently loaded queue to CSV after live auth is configured. CSV export is blocked unless an audit event is recorded first.
- `/admin/audit` source is implemented as the first audit visibility screen: active owner/admin roles can inspect audit rows after live auth is configured, and admin CRUD/workflow save flows now call a shared audit writer after successful primary mutations.
- `supabase/migrations/20260603142359_project_media_blocks.sql` is applied and verified on production. `npm run agent:admin-crud-live -- --allow-writes` passed on 2026-06-04 for marker `admin-live-1780496690772-b8a47213`: tagged QA rows were created across Settings, Media, Stone Library, Products, Projects, Articles, Leads, and audit-export paths; 48 audit rows were recorded; dashboard health predicates matched before archive cleanup; tagged public-content rows were published then archived; anonymous browser-key reads returned zero tagged public-content/private lead rows. `npm run agent:admin-crud-live -- --allow-writes --include-storage` also passed for marker `admin-live-1780497462544-23b1d5e3`, uploaded `urblo-admin-media/live-check/admin-live-1780497462544-23b1d5e3.png`, verified signed-in admin readback, and verified anonymous private/public Storage object denial.
- `npm run agent:admin-crud-coverage` is implemented as a source-only admin verifier for route/module registration, protected shell coverage, launch-critical table references, role-gated controls, publish/archive paths, audit actions, Media/Leads export audit gates, browser-source service-role boundaries, browser-key/RLS live verifier boundaries, and config-missing admin gate contracts. It does not mutate Supabase and does not replace live browser QA.
- `npm run agent:admin-crud-live` is implemented as a credential-gated live admin write verifier. Default mode is plan-only and no-write; `--allow-writes` requires a real owner/admin Supabase Auth session, creates tagged QA rows plus exact expected audit actions through browser-key RLS, verifies dashboard-health predicates against tagged rows before archive cleanup, and verifies tagged public-content QA rows plus private lead QA rows are not anonymously visible.
- `npm run agent:content-import` is implemented as a no-write content import dry run. It maps current static Stone Library groups, variants, finish capabilities, finish image links, Products, Projects, Articles, and media candidates into Supabase-shaped draft payloads and fails on missing local assets or unknown stone/finish references. `npm run agent:content-import:live` is plan-only by default; with `--allow-writes`, browser-safe key, and owner/admin credentials it imports/upserts the reviewed payload through normal browser-key RLS, keeps all status-bearing rows as `draft`, and verifies anonymous public reads expose zero imported draft parent rows. The approved 2026-06-04 live import passed, writing/upserting 115 media assets, 13 stone groups, 6 products, 5 projects, 4 articles, and dependent rows.
- `npm run agent:public-supabase-readiness` is implemented as a no-write public cutover verifier for draft-only import payloads, guarded draft apply/merge/rollback SQL posture, published-only public RLS policy source, read-only anonymous grants, static public runtime boundaries, and Cloudflare `/api/*` Function routing scope.
- `NOW-ADMIN-CMS-001` is an umbrella objective, not a single executable implementation task; admin IA/access is defined in `docs/ADMIN_IA_ACCESS.md`, and implementation still uses the smaller auth/CRUD/media/leads tasks in `docs/agent/tasks.json`.
- `npm run agent:admin-cms-predeploy` is the no-secret non-preview local gate before deploying the current CMS UX stack; it runs the Media role-boundary verifier in plan-only mode. Run `npm run agent:smoke` and `npm run agent:admin-config-gate` separately for preview/browser gates. `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict` is the final no-write CMS handoff audit after the applied-migration role proof and production walkthrough evidence are recorded.
- Follow-up email notification requirement is complete for the current provider path: Contact and Sample Request notifications use SMTP2GO, Function code keeps Resend compatibility, and approved live proof stored `notification_status = sent` for tagged Contact and Sample Request rows on 2026-06-03.
- Stone Library migration is complete: old `/materials*` route family has been removed and replaced with `/stone-library` plus `/stone-library/:stoneGroupId`.
- `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001` and `NEXT-STONELIB-IMG-001` are complete for current website stones only; Drive-only products remain out of scope until the client decides to add them.
- `/capabilities` now uses Natalie Ma's 2026 Capability Statement as the client-supplied source, with Founder-sourced imagery, shared CTA data, an email-gated PDF download flow through `/api/enquiries`, and `npm run agent:capabilities-ui` as its no-secret source gate; base form persistence is configured, but the Capability-specific download lead path still needs its own live capture check.
- Contact route is declared at `/contact`; shared header/footer navigation points to declared routes, and Sample Request routes to `/contact?intent=sample-request`. The main Contact/Sample Request submit source now posts to Pages Functions; direct email/phone links remain manual contact channels, and basic production persistence/audit behavior is verified. SMTP2GO email and browser-key privacy boundary proof are complete; Turnstile and admin-visible workflow proof remain pending.
- Latest local runtime gates were measured on 2026-07-13 and were green (`npm run build`, `npm run lint`, `npx tsc -b`, `npm run agent:smoke`) for the reopened admin reliability/UX patch; branch-preview and production no-write Cloudflare smoke also passed after deployment. A configured local auth-browser run now passes all nine authenticated route shells plus sign-out using a stable login-form marker, but production must be rerun after the verifier follow-up is deployed. This is still not authenticated golden-workflow proof.
- Route-level code splitting plus on-demand public Supabase loading keep the configured entry below 500,000 bytes and prevent the dedicated Supabase vendor chunk from being module-preloaded. The configured auth-browser gate now enforces both boundaries; continue monitoring configured as well as env-less bundle output as features are added.
- GitHub Pages hardening is now a legacy fallback; Cloudflare Pages deployment is the active launch path.
- Routing now uses clean paths through `BrowserRouter` with Cloudflare Pages SPA fallback files in `public/`; unknown public URLs render a branded not-found state instead of the homepage.
