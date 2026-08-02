# Agent Verification Matrix

Last updated: 2026-08-02

## Purpose
Use this matrix to choose the smallest verification set that proves a change is safe. Runtime changes still need the full build/lint/typecheck gate unless a task explicitly defines a temporary exception.

`npm run gate` is the preferred way to run the runtime gate set: it wraps build (incl. `tsc -b`), lint, `agent:smoke`, and `agent:check` in a clean Node 20 container and runs `git diff --check` host-side. It validates the working tree, not the last commit — commit everything before pushing. See `docs/OPERATING_PROTOCOL.md`.

## Startup Check
Use when resuming work or handing off between agents.

Run:
- `npm run agent:init`
- `npm run agent:live-readiness` when continuing form/admin/Cloudflare live verification work.
- `npm run agent:supabase-foundation-readiness` when continuing Supabase foundation, seed, Storage, helper, or form-RPC contract work without live credentials.

This command is informational and does not replace verification gates. Use `--base-url <origin>` and `--admin-email <email>` only for non-secret manual inputs; the runner treats copied placeholders or malformed values as missing, and the base URL must be an `http`/`https` origin with no path/query/hash. For live form checks, use `--form-writes-approved` in readiness only after Jay has approved tagged live form QA writes; actual `npm run agent:forms-live` execution must also include `--allow-writes`. For the first-admin profile/invite write path, use `--first-admin-writes-approved` only after Jay has approved creating/upserting the first profile or sending an invite. For live admin CRUD writes, use `--admin-writes-approved` only after Jay has approved tagged live admin QA writes. For static-to-Supabase content import and public read cutover, use `--content-import-approved`, `--content-merge-approved`, and `--content-public-cutover-approved` only after Jay has approved the guarded draft import apply, any required merge/upsert behavior, and the public read-path switch. For final Turnstile proof, use `--turnstile-token-provided` only when a valid target-environment token will be supplied to `npm run agent:forms-live -- --allow-writes --require-turnstile --turnstile-token <token>`.

The actual live runners use the same manual-input boundary: `agent:forms-live`, `agent:cloudflare-preview-smoke`, `agent:admin-auth-browser`, and `agent:admin-config-gate` reject placeholder or non-origin `--base-url` values before network or live-write work starts. `agent:admin-live-readiness`, active-admin/unprofiled browser QA, and admin CRUD live writes require real email-shaped inputs instead of copied placeholders.

## Verification Profiles

### Docs-Only
Use when changing Markdown, JSON task state, or harness instructions without touching runtime source.

Run:
- `npm run agent:check`
- `npm run agent:harness-gc` when current-state, task-state, README, AGENTS, or verification docs change.
- `git diff --check`

Evidence to record:
- Which docs changed.
- Whether any repo-path or harness checks failed.
- Whether runtime gates were intentionally skipped.

### Harness GC
Use when Jay asks to run Harness GC, when current-state docs feel noisy, after a major production proof, or before a new agent should rely on the Harness.

Run:
- `npm run agent:harness-gc`
- `npm run agent:harness-gc:review`
- `npm run agent:check`
- `git diff --check`

Evidence to record:
- Whether `docs/agent/status.json` still matches current production/local state.
- Task status counts and whether `now` tasks are too broad.
- Any stale README/HANDOFF/AGENTS/NEXT_STEPS wording found.
- Location of `.tmp/harness-gc-review.md` when review mode is run.
- Which suggested cleanups require Jay's judgment rather than automatic mutation.

### Runtime UI
Use when changing `src/**`, `public/**`, route behavior, visual layout, user-facing copy, or CTA behavior.

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`
- `npm run agent:capabilities-ui` when changing `/capabilities`, shared CTA data, Capability Statement assets, or the email-gated PDF download form.
- `npm run agent:seo-readiness` when changing public SEO metadata, `robots.txt`, `sitemap.xml`, structured data, public route slugs, or the SEO route registry.

Evidence to record:
- Affected routes.
- Brand/design alignment note.
- Residual visual or responsive risks.

### SEO Indexability
Use when changing public metadata, public route slugs, `robots.txt`, `sitemap.xml`, structured data, canonical URL behavior, or the source list of pages intended for search indexing.

Run:
- `npm run agent:seo-readiness`
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`
- `npm run agent:check`
- `git diff --check`

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

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:check`
- `npm run agent:content-import` when changing static-to-Supabase import mapping or source content used by that dry run.
- `npm run agent:content-import:apply-sql` when changing static-to-Supabase import or rollback SQL artifact generation.
- `npm run agent:public-supabase-readiness` when changing public-content import status rules, structured article-block import assumptions, public read cutover assumptions, static/public route boundaries, or Supabase published-only policy checks.
- `npm run agent:public-content-overlay` when changing a public Project, Product, Article, or Stone Library service adapter, canonical content key, Published/static merge rule, public media resolver, or list/detail/filter fallback behavior.
- `npm run agent:admin-projects-aggregate` when changing the Project aggregate type/mapping, shared draft/public renderer, archived Project tombstone merge, or publish-blocker behavior.
- `npm run agent:smoke` when route output changes.

Evidence to record:
- Source files changed.
- Any normalization, fallback, or missing-data behavior.
- Affected runtime pages.

### Route, Navigation, or CTA Contract
Use when changing `src/App.tsx`, shared header/footer links, route params, mailto/tel behavior, or form behavior.

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`

Evidence to record:
- Declared routes changed.
- Navigation surfaces changed.
- Any backend absence or mailto fallback remains explicit.

### Deployment or Tooling
Use when changing `.github/**`, `package.json`, `vite.config.ts`, `tsconfig*.json`, ESLint config, or scripts.

Run:
- `npm run agent:check`
- `npm run lint`
- `npm run build` when bundling/deploy behavior might change.
- Tool-specific dry run where available.

Evidence to record:
- Command output summary.
- Any credentials, environment, or CI assumptions.

### Cloudflare Deployment
Use when changing the Cloudflare Pages launch contract, Pages Functions routing, environment variables, redirects, headers, preview deployments, DNS cutover docs, or rollback docs.

Run:
- `npm run agent:cloudflare-readiness`
- `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev` after a Pages preview URL exists
- Production apex, `www`, and the moving `urblo.pages.dev` alias are matched after FQDN trailing-dot normalization and require an independent exact `--reference-url https://<8-hex-deployment>.urblo.pages.dev`; default/branch aliases and self-comparison are invalid references.
- The deployed smoke must reject redirects on every direct SPA route, require every route to reference the same entry assets as `/`, reject absolute/cross-origin/query/fragment asset references, verify exact same-origin query-free recursively discovered asset URLs without cache-busting, require JavaScript/CSS MIME types, reject an SPA HTML shell returned with HTTP 200, and require byte-for-byte plus MIME equality with the immutable reference across the full graph. A residual long-lived response header is warning-only after that comparison; without it the header remains a failure. Status-only asset checks are insufficient.
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`
- `npm run agent:check`
- `git diff --check`

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

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:check`
- `npm run agent:supabase-foundation-readiness` when changing foundation migrations, baseline seeds, Storage policy source, helper grants, or service-role form RPC source.
- Tool-specific migration dry run or local Supabase verification when available.
- `npm run agent:content-import:apply-sql` when changing guarded static-to-Supabase import or rollback SQL artifacts.
- `npm run agent:public-supabase-readiness` when public content import/cutover safety is in scope.
- `npm run agent:public-content-overlay` when the Published/static migration merge or canonical route keys change.
- `npm run agent:admin-projects-aggregate` when changing `20260719015649_project_aggregate_drafts.sql`, `20260802103337_restrict_archived_project_tombstones.sql`, or `20260802105537_project_aggregate_write_lockdown.sql`, `private.project_drafts`, the service-role-only aggregate RPC, Project table/sequence privilege lockdown, Project public parent/child reads, or archived-slug tombstones.

Evidence to record:
- Tables/relations changed.
- RLS status and public/admin access assumptions.
- Data API role grants for tables and generated sequences when PostgREST or `supabase-js` access is in scope.
- Migration source files and row counts where available.
- Rollback or restore path.
- Any customer-facing data not yet migrated.

### Backend API and Forms
Use when adding or changing `/api/*` endpoints, form submission behavior, Turnstile verification, Supabase writes, transactional email, or lead-status workflow.

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`
- `npm run agent:forms-ui` when changing Contact form UI state, submit routing, or sample-request mode.
- `npm run agent:capabilities-ui` when changing the Capability Statement download form, PDF asset path, shared CTA data, or Turnstile reuse on `/capabilities`.
- API-level positive and negative submission tests when endpoints exist.
- `npm run agent:admin-projects-aggregate` when changing the protected `/api/admin/projects` handler, bearer/profile authorization, request validation, service-role boundary, media promotion/compensation, or aggregate RPC invocation.
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

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`
- `npm run agent:admin-cms-predeploy` when preparing the current CMS UX stack for deployment; it runs the non-preview local admin/content/deployment gates and finishes with report-only handoff readiness. Run `npm run agent:smoke` and `npm run agent:admin-config-gate` separately for preview/browser gates.
- `npm run agent:admin-crud-coverage` when changing admin routes, module screens, table coverage, audit writers, export controls, role gates, or launch-critical removal/archive behavior.
- `npm run agent:admin-projects-aggregate` when changing the Projects vertical prototype. It verifies the one-draft shape, one protected endpoint, revision guard, one action bar, shared public/preview renderer, visual hotspots, inline private media, server audit transaction, create-only public-media copy/compensation, private draft table, and service-role-only aggregate RPC. It performs no Supabase writes, does not apply any migration, and does not prove live migration state.
- Project verification must reject visible proof-review controls/permissions and prove that client/server Save normalization makes legacy review columns compatibility-only. Public smoke must also verify that critical non-default opacity utilities used by the navbar, menu, homepage controls, and detail surfaces exist in built CSS. Rendered Projects listing/detail QA must compare against Stone Library: both use the same 102px black layout support band behind the translucent header, without page-local duplicate top padding.
- `npm run agent:admin-config-gate` when changing admin route protection, config-missing behavior, or no-config browser QA coverage. Without `--base-url`, it must build an isolated temporary bundle with browser-safe Supabase variables explicitly cleared; it must not reuse the normal configured `dist/`.
- `npm run agent:admin-auth-browser` in plan-only mode when changing admin browser auth QA tooling; run `npm run agent:admin-auth-browser -- --allow-login --strict` only after browser-safe Supabase config and a real active admin email/password are available. Without `--base-url`, it must build current source into an isolated configured bundle, enforce the entry-size/no-eager-Supabase boundary, prove static public fallback with the Supabase chunk blocked, use stable semantic login markers, and revisit a protected route after Sign out.
- `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` when a valid Auth user without an active `admin_profiles` row is available through `URBLO_UNPROFILED_EMAIL` and `URBLO_UNPROFILED_PASSWORD`; the check must keep all launch-critical admin route probes on `/admin/unauthorized` without private module content.
- `npm run agent:first-admin-bootstrap` when changing first-admin bootstrap tooling. Use `--verify-only` only after a service-role key and first admin email are configured; write mode requires explicit approval.
- `npm run agent:admin-crud-live` in plan-only mode when changing live admin verification contracts; run `npm run agent:admin-crud-live -- --allow-writes` only after browser-safe Supabase config and a real owner/admin session are available and Jay has approved tagged QA writes.
- `npm run agent:admin-crud-live -- --allow-writes --include-storage` for owner/admin private-upload/readback plus anonymous-denial proof after the same credentials/session/approval gate is satisfied; this is not the Editor public-bucket boundary proof.
- `npm run agent:admin-media-role-boundary-live` in plan-only mode when changing the Storage role verifier; after the migration is applied/read back and Jay approves tagged Storage writes, run `npm run agent:admin-media-role-boundary-live -- --allow-writes --strict` with distinct active Editor and owner/admin credentials to prove Editor private insert/update success, Editor public insert/update denial, owner/admin public insert/update success, and cleanup.
- `npm run agent:live-readiness -- --base-url <production-origin> --admin-email <first-admin-email>` before requesting live inputs. The Media role check must remain blocked until the migration readback is complete, distinct Editor/owner credentials exist, Jay approves that exact tagged Storage role proof, and `--media-role-migration-verified --media-role-writes-approved` records those non-secret prerequisites.
- Browser checks are mandatory for any handoff claim. Route-shell checks are useful but do not prove editing.
- The Phase 1 Projects source is not accepted by its own verifier. Expand migration `20260719015649_project_aggregate_drafts.sql` and minimum-disclosure migration `20260802103337_restrict_archived_project_tombstones.sql` are applied/read back. Under Jay's separate tagged-write approval, Preview deployment `1a3e0d4b-d74a-4979-be64-921e5a510ccc` passed authenticated one-Save/refresh, unsaved shared-preview parity, a saved 55/55 material-map hotspot, private-first upload and committed promotion/private-source cleanup, Publish/public readback, Hide, anonymous row denial, and public-not-found for non-static marker `admin-projects-ui-mrroa6p0`. Deterministic local handler tests cover stale-Save 409 plus full failed-Publish public-copy compensation; fresh commit `a79a364` passed the clean Node 20 container gate and immutable Preview `a20062a0` passed no-write smoke/owner login. C readback proves the live minimum-disclosure result. Keep the Project edit freeze through separately approved aggregate runtime production promotion and separately approved contract B plus readback of all six table privileges, six sequence privileges, public policies, and the security advisor. Real two-session/Postgres/Storage negative proof requires its own approval. B makes Cloudflare-only rollback to the old direct-write UI invalid. Jay alone passes the fool test; an implementing or reviewing agent must not self-certify it.
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
- Supabase Auth custom SMTP delivery/log evidence and readback of the Auth Site URL plus exact allowed invite/recovery Redirect URLs. A delivered email whose callback falls back to localhost is a failing result, not partial handoff completion. Contact/Sample Request SMTP proof is not equivalent.
- Final handoff readiness audit result, including whether the strict command passed or which production evidence is still missing.

## Output Rule
Every completed task should leave a short verification note in `docs/WORKLOG.md` and should keep `docs/HANDOFF.md` current if it changes the next recommended action.
