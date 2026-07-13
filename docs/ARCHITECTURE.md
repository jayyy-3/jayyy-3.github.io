# Urblo Web - Architecture and Contracts

Last updated: 2026-07-13

## System Boundary
- Current implementation: React application shipped as static assets plus Cloudflare Pages Functions under `/api/*`.
- Current implementation: Cloudflare Pages Function source now exists for `/api/enquiries`, `/api/sample-requests`, and the protected CMS invite endpoint `/api/admin/invite-user`.
- Current implementation: the public Contact page submits enquiries and sample requests to those API routes. The Capability Statement download form on `/capabilities` also submits an email-only lead to `/api/enquiries` with `project_type = Capability statement download` before revealing the PDF download link. The API source attempts server-side audit events after successful lead inserts, and Sample Request uses a service-role-only Supabase RPC so the request row and first item row are created atomically. Basic deployed Contact/Sample Request persistence is verified on `https://urblo.pages.dev`; the Capability-specific download capture path still needs separate live route verification.
- Current Supabase project: `Urblo` (`npkidywzwddbnfrnxlmo`, `ap-southeast-2`) has the foundation schema/RLS migrations, baseline seeds, admin settings/profile/helper hardening, admin profile email uniqueness, and original media Storage policies applied. `supabase/migrations/20260713065628_media_public_bucket_role_hardening.sql` is new local source and is not yet applied; it restricts public-bucket insert/update to owner/admin while retaining editor writes to the private draft bucket. The `/admin` auth/CRUD source and first owner profile exist, but the production editor handoff is `revalidation_required` after the 2026-07-13 not-working report. Prior route-shell and direct browser-key/API proofs remain infrastructure evidence; they do not prove the UI save/publish/public-readback workflow. Current closure is defined by `NOW-ADMIN-RELIABILITY-UX-001` and `docs/agent/admin-handoff-evidence.json`.
- Launch target: Cloudflare Pages static frontend, Cloudflare Pages Functions API endpoints, Supabase Postgres/Auth/Storage, and an Urblo-owned admin interface for content operations.
- Planning source: `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`.
- Supabase schema design source: `docs/SUPABASE_SCHEMA.md`.
- Admin IA/access design source: `docs/ADMIN_IA_ACCESS.md`.

## Runtime Stack
- Bundler/dev server: Vite 6
- UI runtime: React 19
- Routing: `react-router-dom` with `BrowserRouter`
- Styling: Tailwind CSS + project CSS (`src/index.css`, `src/App.css`)
- Client state: Zustand (`src/store/productStore.ts`)
- Motion/interaction: Framer Motion
- Supporting libraries: Swiper, DOMPurify, lodash.throttle
- Route loading: public page components are lazy-loaded in `src/App.tsx`; admin page modules are independently lazy-loaded in `src/pages/admin/AdminApp.tsx`.

## Launch Target Stack
- Public hosting: Cloudflare Pages.
- Backend/API: Cloudflare Pages Functions scoped to `/api/*`.
- Database: Supabase Postgres.
- Authentication: Supabase Auth for the admin area.
- Admin UI: Urblo-owned `/admin` interface, not raw Supabase Studio for customer operation.
- Public form protection: Cloudflare Turnstile.
- Transactional email: SMTP2GO HTTP API preferred, with Resend compatibility retained, wired from server-side API code only.
- Media storage:
  - Current static stopgap: launch-critical identity, hero, contact, and route banner assets live under `public/media/launch`.
  - Supabase Storage for normal editorial, Stone Library, project, and article imagery. Initial buckets are applied: `urblo-public-media` for public-safe assets and `urblo-admin-media` for private draft/review assets.
  - Cloudflare R2 or Stream remains the review path for large homepage video assets if Supabase Storage or Pages asset limits are a poor fit.
- Cost planning:
  - Lean production target: about USD 30/month before tax/usage spikes.
  - Safer production target with paid transactional email headroom: about USD 50/month before tax/usage spikes.
  - See `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md` for the component-level cost table.
- Schema planning:
  - First production schema plan lives in `docs/SUPABASE_SCHEMA.md`.
  - First `/admin` route, access-state, role, module rollout, and field-ownership contract lives in `docs/ADMIN_IA_ACCESS.md`.
  - Foundation migrations and baseline seeds are applied; runtime is not considered migrated until admin UI and API contracts are implemented and verified.
  - Supabase execution order is foundation migration, baseline seeds, forms backend, admin auth shell, then content CRUD.

## Deployment and Build Contract
- Current deployment workflow: `.github/workflows/deploy.yml`
  - Trigger: push to `main`
  - Pipeline: `npm ci` -> `npm run build` -> copy `dist/index.html` to `dist/404.html` -> deploy `dist/` to GitHub Pages
  - GitHub Pages does not read Cloudflare `_redirects`; `dist/404.html` is a short-term SPA fallback so direct clean-route visits can load the React app during the GitHub Pages preview period.
  - This fallback does not change the launch target and should not be treated as the final Cloudflare Pages routing mechanism.
- Local pre-push gate: `npm run gate` (`scripts/container-gate.sh`) runs `git diff --check` host-side, then builds `Dockerfile.gate`, which runs `npm run build` (includes `tsc -b`), `npm run lint`, `npm run agent:smoke`, and `npm run agent:check` inside a clean Node 20 container. The gate is source-only: `.dockerignore` excludes `.env*`, `.dev.vars`, and `*.local` so no local secrets enter the image. The full delivery-flow contract is `docs/OPERATING_PROTOCOL.md`. Node 20 is the shared line for the gate image, `.github/workflows/deploy.yml`, and the host; Cloudflare Pages should pin `NODE_VERSION=20`.
- Launch target deployment workflow:
  - Cloudflare Pages Git integration builds the repository.
  - Build command: `npm run build`
  - Output directory: `dist`
  - Production branch: `main` unless a later release process changes it.
  - Preview deployments are required for branch/PR review.
  - Cloudflare environment variables and secrets must not be committed.
  - Function routing must be restricted so only `/api/*` invokes Pages Functions.
  - Deployed preview route/asset/redirect/API safe-failure smoke is staged through `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`. The command requires no secrets, rejects placeholder or non-origin base URLs before any network checks, verifies direct-refresh route shells, recursively discovers deployed JS/CSS assets, requires JavaScript/CSS MIME types and rejects an SPA HTML shell even when an asset URL returns HTTP 200, checks that the deployed admin bundle still contains the configuration-required/profile-gate contract without browser service-role env access patterns, checks Cloudflare-applied legacy redirects, and verifies `/api/enquiries` and `/api/sample-requests` reject unsafe methods, malformed JSON, and invalid payloads without creating rows.
- Current Pages Function source lives under `functions/api/enquiries.js`, `functions/api/sample-requests.js`, and `functions/api/admin/invite-user.js`.
- Browser-side admin Auth requires `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`; `VITE_SUPABASE_URL` may be configured, but defaults to the Urblo project URL if omitted.
- Browser-side auth-state callbacks must return synchronously. Any `getSession`, `getUser`, or profile query triggered by `onAuthStateChange` runs in a deferred task so it cannot deadlock the Supabase client lock.
- Invite and recovery callbacks land on `/admin/account-setup?mode=invite|recovery`. The page captures the implicit token pair before client creation, clears callback credentials from the address bar, keeps URL-session detection disabled on the shared browser client, creates a non-persistent/no-refresh/no-URL-detection isolated Auth client, explicitly installs that pair, verifies its user with the Auth server, and performs the password update through that same isolated client. Opening a password link cannot replace an unrelated shared admin session, and a login change in another tab cannot rebind the callback to another account. After a successful update the user returns to explicit password sign-in. Expired/reused links fail closed; PKCE callbacks remain intentionally unsupported.
- `/api/admin/invite-user` derives its callback from the request origin instead of accepting an arbitrary browser redirect, uses a non-persistent server Auth client, and deletes the newly invited Auth user if the matching `admin_profiles` insert fails.
- Supabase Auth invite/recovery mail is operationally separate from Contact/Sample Request SMTP2GO. A 2026-07-13 production invite reached the approved QA recipient, but the generated callback fell back to `http://localhost:3000` even though `/api/admin/invite-user` supplied the production origin. Production therefore requires correction/readback of the Auth Site URL and exact account-setup Redirect URL entries, plus Auth SMTP ownership verification, before either flow can be called verified.
- Browser-side public form Turnstile uses `VITE_TURNSTILE_SITE_KEY`; without it, the Contact page keeps the submit flow usable and omits the widget. Server-side token verification still requires `TURNSTILE_SECRET_KEY` or `CF_TURNSTILE_SECRET_KEY`.
  - Current admin CRUD source: `/admin/settings` reads and saves the default `site_settings` row, validates/normalizes Published public fields through the same contract as the public consumer, invites new CMS users through `/api/admin/invite-user`, and manages existing Supabase Auth users' admin profile rows for Website owner / CMS manager roles, including clear form validation for duplicate Auth user IDs and duplicate profile emails before save. The invite endpoint verifies the signed-in admin session with a bearer token, requires an active Website owner/CMS manager profile, keeps the Supabase service key server-side, sends the Supabase Auth invite, creates the `admin_profiles` row, and records `admin_profile.invite` in `admin_audit_events`. First admin bootstrap is complete for `info@urblo.com.au`; future team management happens through `/admin/settings` after the latest Settings UX is deployed and live invite QA passes.
  - Current admin media source: `/admin/media` reads up to 500 current `media_assets` records, keeps new External media state stable, uploads every new file to `urblo-admin-media`, and exports the loaded manifest to CSV for active Website owner / CMS manager / editor roles. A metadata-insert failure is read back before any cleanup; Website owners/CMS managers can best-effort remove a confirmed unreferenced private orphan, while Editors receive an explicit private-orphan warning because current delete RLS blocks their cleanup. Website owners/CMS managers can publish an existing private upload through a create-only copy into `urblo-public-media`; the operation is bound to the selected row's original private path and `updated_at`, the destination is never overwritten, ambiguous database results are read back, and rollback/cleanup first checks for other `media_assets` references. Storage and database writes are not atomic, so unknown/reference/readback/rollback failures retain the object and report its path for manual repair. Editors cannot run private promotion because current Storage RLS does not give them the delete capability required for safe rollback. Once applied, the new pending Storage migration will also prevent Editors from bypassing this UI through a direct public-bucket insert/update. CSV export must write a change-history row before downloading.
  - Current Stone Library admin source: `/admin/stone-library` reads and saves `stone_groups`, `stone_variants`, `stone_finish_capabilities`, and `stone_finish_images` records, with `media_assets` available for finish-image linking, for active Website owner / CMS manager / editor roles once browser-safe Supabase config and an active profile exist.
  - Current Projects admin source: `/admin/projects` and `/admin/projects/:projectId` read and save `projects`, `project_facts`, `project_materials`, `project_media`, `project_material_maps`, and `project_hotspots` for active Website owner / CMS manager / editor roles once browser-safe Supabase config and an active profile exist. The record route restores selection after refresh; Overview, Facts, Materials, Media, and Maps/hotspots are progressively mounted workspaces; every editor form has baseline-derived unload/switch/navigation guards; child saves update only their own row/baseline; media selectors search up to 500 loaded items. Project, bundle, and hotspot reads use request-generation plus selected-parent checks so late responses cannot replace the newly selected record. Saves capture their original parent/row identity, block record switching while in flight, keep ownership columns immutable on update, and constrain child updates by both child ID and parent ID. Project fact JSON accepts only a string or an array of strings, with the same defensive public normalization in `src/service/ProjectService.ts`. Project media blocks support normal image, hotspot image, and optional YouTube video rows after `supabase/migrations/20260603142359_project_media_blocks.sql` is applied; that migration is applied and verified in production.
  - Current Products admin source: `/admin/products` reads and saves `products`, `product_models`, `product_material_defaults`, and `product_specs` records for active Website owner / CMS manager / editor roles once browser-safe Supabase config and an active profile exist.
  - Current Articles admin source: `/admin/articles` reads and saves `articles` and `article_blocks` records for active Website owner / CMS manager / editor roles once browser-safe Supabase config and an active profile exist. Article/block reads and saves are bound to the selected article and original row identity, late block loads are ignored, record switching is blocked while a save is active, and block updates constrain both block ID and article ID without rewriting `article_id`. Published CTA and video destinations must be a canonical root-relative path or an `http:`/`https:` URL; the public renderer repeats the check and omits unsafe links.
  - Current Leads admin source: `/admin/leads` reads `enquiries`, `sample_requests`, and `sample_request_items`; active Website owner / CMS manager roles can update lead status, assignment, internal notes, and export the currently loaded lead queue to CSV once browser-safe Supabase config and an active profile exist. CSV export must write a change-history row before downloading.
  - Current Change history admin source: `/admin/audit` reads `admin_audit_events` for active Website owner / CMS manager roles once browser-safe Supabase config and an active profile exist, while visible labels translate audit actions/entities into editor-facing language.
  - Current dashboard source: `/admin` counts published public-content rows, recent lead signal, and a content health queue for media metadata gaps, project claim review, missing product/article media, TBC Stone Library records, and stale new leads. These queries run only after the Supabase Auth/profile gate has passed.
  - Current change-history write source: `src/lib/adminAudit.ts` inserts `admin_audit_events` after successful admin Settings, admin profile, Media, Stone Library, Projects, Products, Articles, and Leads mutations. Change-history insert failures are appended to the success notice and do not roll back the already-saved primary change.
  - Admin credential/profile readiness verification is staged through `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>`. The command is read-only, requires a real email address rather than a copied placeholder, requires a browser-safe Supabase key plus a service-role key, verifies the named Auth user exists and is linked to the active admin profile with the required role, checks the baseline `site_settings` and `finish_definitions` seed rows, and uses the browser-safe key to verify the anonymous public/private REST boundary before browser login/save QA begins.
  - Admin login `next` redirects are constrained to true admin-console targets (`/admin`, `/admin?*`, or `/admin/*`) and deliberately reject login/unauthorized loop targets before redirecting authenticated users.
  - First-admin bootstrap is staged through `npm run agent:first-admin-bootstrap`. Default mode is no-write and makes no Supabase calls; `--verify-only` reads Auth/profile/seed state with a service-role key; `--allow-writes` requires a matching `--confirm-email` and Jay approval before inviting an Auth user or upserting the first `admin_profiles` row. The database has a case-insensitive unique index on normalized admin profile email, and the bootstrap/readiness scripts normalize profile email matching before refusing email/Auth-user mismatches or reporting readiness.
  - First-admin write mode records an `admin_profile.bootstrap` row in `admin_audit_events` with service-role setup metadata because the bootstrap is a setup operation rather than a signed-in browser admin mutation. The 2026-06-03 live bootstrap for `info@urblo.com.au` recorded `admin_audit_events.id = 8`.
  - Admin live write verification is staged through `npm run agent:admin-crud-live`. Default mode is a no-write plan. With `--allow-writes`, the command requires a browser-safe Supabase key plus a real owner/admin Supabase Auth session via `URBLO_ADMIN_ACCESS_TOKEN` or a valid email-shaped `URBLO_ADMIN_EMAIL`/`URBLO_ADMIN_PASSWORD` pair; `URBLO_FIRST_ADMIN_EMAIL` remains a bootstrap/readiness input and is not used as a live-login fallback. The verifier then creates tagged QA rows across Settings, Media, Stone Library including finish images, Projects, Products, Articles, Leads, and audit-export actions through normal browser-key RLS, verifies dashboard-health predicates against tagged QA rows before archive cleanup, publishes and archives public-facing QA rows, verifies the exact expected `admin_audit_events` action/entity coverage for the tagged run, then verifies tagged archived public-content QA rows and private lead QA rows are not anonymously visible through browser-key reads. With `--include-storage`, it verifies owner/admin private upload/readback and anonymous denial; it is not the Editor-versus-public-bucket policy proof. It does not physically delete rows.
  - `npm run agent:admin-media-role-boundary-live` is the separate approval-gated Storage policy verifier. Default/report mode performs no login or writes. With `--allow-writes --strict` and distinct active Editor plus owner/admin credentials, it must prove Editor private insert/update succeeds, Editor public insert/update is denied, owner/admin public insert/update succeeds, and all tagged objects are removed. Final handoff also requires applied-migration/policy readback evidence.
  - Form Functions require `SUPABASE_SERVICE_ROLE_KEY` server-side; `SUPABASE_SERVICE_KEY` remains a compatibility alias only. `SUPABASE_URL` may be configured, but defaults to the Urblo project URL if omitted.
  - Form Functions attempt `admin_audit_events` writes with `actor_user_id = null` after successful enquiry/sample request inserts. Audit write failure does not fail the visitor response.
  - Sample Request Functions call `submit_sample_request_with_item(jsonb, jsonb)` with the server-side service role key so the `sample_requests` row and first `sample_request_items` row are inserted in one database transaction. The RPC is `security invoker`, executable by `service_role`, and not executable by browser roles.
  - Form notification source uses SMTP2GO when `SMTP2GO_API_KEY` exists, otherwise Resend when `RESEND_API_KEY` exists. Mock checks verify configured notification paths start with `notification_status = pending`, call the configured provider, then patch the lead row to `sent` or `failed` without failing the already-stored visitor response.
  - Live form persistence verification is staged through `npm run agent:forms-live -- --allow-writes`. The command requires `--allow-writes`, a server-side Supabase service-role key, and Jay approval for tagged live form QA writes; HTTP mode rejects placeholder or non-origin `--base-url` values before any Supabase reads/writes; it verifies valid enquiry/sample request rows plus source-route audit metadata, verifies invalid enquiry/sample request payloads create no rows or matching audit events, verifies response-vs-stored notification status, and retains tagged test rows for auditability until Jay approves cleanup. The 2026-06-02 deployed proof against `https://urblo.pages.dev` created `enquiries.id = 1`, `sample_requests.id = 1`, `sample_request_items.id = 1`, and `admin_audit_events.id = 1/2`; invalid tagged payloads created zero rows or audit events. The 2026-06-03 SMTP2GO proof against `https://urblo.com.au` created `enquiries.id = 3`, `sample_requests.id = 2`, `sample_request_items.id = 2`, and `admin_audit_events.id = 4/5`, with both stored lead rows at `notification_status = sent`. The 2026-06-03 browser-key private-row boundary proof created `enquiries.id = 4`, `sample_requests.id = 3`, `sample_request_items.id = 3`, and `admin_audit_events.id = 6/7`; anonymous REST reads through the deployed publishable key returned HTTP 401 for all three private tables.
  - Optional public form key: `VITE_TURNSTILE_SITE_KEY`.
  - Optional server-side form secrets: `TURNSTILE_SECRET_KEY` or `CF_TURNSTILE_SECRET_KEY`, `SMTP2GO_API_KEY` or `RESEND_API_KEY`, `LEAD_NOTIFICATION_FROM` or `RESEND_FROM_EMAIL`, `LEAD_NOTIFICATION_TO`, `ENQUIRY_NOTIFICATION_TO`, and `SAMPLE_REQUEST_NOTIFICATION_TO`.
- Vite base config: `vite.config.ts`
  - `base: '/'` for root-domain Cloudflare Pages clean URL routing.
- Cloudflare Pages static config:
  - `public/_redirects` provides SPA fallback with `/* /index.html 200`.
  - Cloudflare Pages should continue to use `_redirects`; the GitHub Pages `404.html` fallback is harmless but not required on Cloudflare.
  - `public/_routes.json` scopes future Pages Functions to `/api/*`.
  - `public/_headers` sets conservative launch security headers only. Project-authored `Cache-Control` overrides for `/assets/*`, `/fonts/*`, and `/media/*` are intentionally absent after an immutable custom-domain cache stored SPA HTML under hashed asset URLs; Cloudflare Pages default cache/revalidation behavior is authoritative.
- Build script contract: `package.json`
  - `npm run build` => `tsc -b && vite build`
  - `npm run lint` => `eslint .`
  - typecheck path => `npx tsc -b`
- TypeScript contract update:
  - `resolveJsonModule: true` enabled in `tsconfig.app.json` to support `stone_library.json` imports.
- Lint scope contract update:
  - `.vite/**` ignored in `eslint.config.js`.

## Agent Harness Contract
- Root entry: `AGENTS.md`
- Current state handoff: `docs/HANDOFF.md`
- Machine-readable task queue: `docs/agent/tasks.json`
- Verification matrix: `docs/agent/verification.md`
- Harness checks:
  - `npm run agent:check` => `node scripts/check-harness.mjs`
  - `scripts/check-harness.mjs` verifies required harness files, active operational `agent:*` package scripts, Contact form UI source-check smoke integration, and delegates doc path/task checks plus the Supabase foundation source-readiness gate. The guarded script map includes the form, admin, Cloudflare, first-admin, live-readiness, content-import, SEO readiness, Supabase foundation readiness, and public Supabase readiness runners so launch verification commands cannot be silently removed from `package.json`.
  - `scripts/check-doc-paths.mjs` rejects machine-specific paths and validates repo-relative path references in docs/task state.
- Local container gate:
  - `npm run gate` => `bash scripts/container-gate.sh`
  - Builds `Dockerfile.gate`; the runtime gates plus `agent:check` run as image build steps, so a red gate fails the build. Working-process contract: `docs/OPERATING_PROTOCOL.md`.
- Supabase foundation source readiness:
  - `npm run agent:supabase-foundation-readiness` => `node scripts/check-supabase-foundation-readiness.mjs`
  - Verifies the source contract for the 13 expected foundation/security migrations, 24 launch tables including `project_media`, RLS enablement, public-select policies, anonymous read-only grants, private-table anonymous revokes, 12 baseline finish rows, the default published site settings row, service-role-only Sample Request atomic RPC, Storage bucket/listing/public-write role hardening, private SECURITY DEFINER helper posture, and normalized admin profile email uniqueness.
  - This is a source/no-secret verifier. It does not query Supabase, apply migrations, create rows, validate live Auth, or replace connector/live browser verification.
- Content import dry run:
  - `npm run agent:content-import` => `node scripts/check-content-import-readiness.mjs`
  - Reads current static Stone Library JSON, Stone Library finish-image mappings, Projects data, Products data, Articles manifest, and referenced local media.
  - Produces Supabase-shaped import candidates with natural keys, forces content rows to `draft`, extracts legacy newsletter HTML into draft structured article blocks, and fails before any database write if local media is missing, slugs duplicate, or project/material references use unknown stone or finish keys.
  - Article block extraction currently creates draft `rich_text`, `image`, `cta`, and `project_spotlight` rows, links image blocks through `media_assets`, skips newsletter footer/contact/social artifacts, and flags claim-sensitive source copy for review instead of rewriting it.
  - Can write a local ignored review artifact with `npm run agent:content-import -- --out .tmp/content-import-preview.json`; the artifact remains a draft/no-write payload and must not be applied as final published content without approval.
  - `npm run agent:content-import:plan` writes both `.tmp/content-import-preview.json` and `.tmp/content-import-plan.md`, including import safety notes, preflight checks, table apply order, reverse rollback order, and verification expectations.
  - `npm run agent:content-import:preflight-sql` also writes `.tmp/content-import-preflight.sql`, a read-only Supabase target preflight SQL artifact for row-count, status, RLS, policy, Data API table privilege, and sequence usage inspection before any approved import/apply step.
  - `npm run agent:content-import:apply-sql` also writes `.tmp/content-import-apply.sql` and `.tmp/content-import-rollback.sql`. The apply artifact aborts unless `urblo.import_approved=true` is explicitly set inside the transaction, imports as draft only, contains no delete/publish operation, and now also aborts on existing parent natural-key matches unless `urblo.import_merge_approved=true` is explicitly set after reviewing merge/upsert behavior. The rollback artifact is also guarded, aborts unless `urblo.rollback_approved=true` is explicitly set, runs in reverse dependency order, and targets matching draft/import rows only.
- Public Supabase readiness:
  - `npm run agent:public-supabase-readiness` => `node scripts/check-public-supabase-readiness.mjs`
  - Verifies the content import dry run has no warnings/blockers, all import rows with status remain `draft`, article block imports stay structured rather than placeholder/newsletter-artifact payloads, the generated guarded draft apply SQL keeps the import and merge approval gates manual, avoids destructive/publish statements, forces imported status to `draft`, the generated guarded rollback SQL keeps its destructive approval gate manual and follows reverse dependency order, the generated preflight SQL includes Data API table/sequence grant inspection for `anon`, `authenticated`, and `service_role`, public RLS policy source is published-only, anonymous grants are read-only, public runtime uses browser-key Supabase published reads with static fallback, and Cloudflare routes only invoke Functions under `/api/*`.
  - This is a source/no-write verifier. It does not apply imported content, query Supabase, create a preview deployment, or replace live credential checks.
  - `npm run agent:live-readiness` reports the guarded content import apply, merge/upsert, and public read cutover approval gates with `--content-import-approved`, `--content-merge-approved`, and `--content-public-cutover-approved`. These flags only document manual readiness and never apply SQL, publish content, or switch runtime reads.
  - `npm run agent:public-content-overlay` executes the pure migration-overlay behavior contract: a Published CMS item replaces only the matching canonical static item, unmatched static items remain, and new Published items append. The admin predeploy gate runs this alongside the broader source boundary audit.
- Agent startup:
  - `npm run agent:init` => `bash scripts/agent-init.sh`
  - Prints repo path, git status, recent commits, runtime versions, read order, and common commands.
- Static smoke:
  - `npm run agent:smoke` => `bash scripts/agent-smoke.sh`
  - Serves `dist/` with Vite preview and checks the React shell for key clean routes, `public/articles/index.json`, and critical CTA contracts.
  - Builds first only when `dist/` is missing; runtime tasks should still run `npm run build` before smoke.
  - Runs `scripts/check-forms-api.mjs`, `scripts/check-contact-form-ui-source.mjs`, and `scripts/check-capabilities-page-source.mjs` after route/CTA shell checks so Contact submit routing, Capability Statement download routing, API mock behavior, Cloudflare Pages Function method boundaries, inline visitor states, and no-mailto main submit contracts stay covered without secrets.
- Contact form UI source verification:
  - `npm run agent:forms-ui` => `node scripts/check-contact-form-ui-source.mjs`
  - Verifies Contact page source keeps the main submit flow on `/api/enquiries` and `/api/sample-requests`, includes inline validation/success/error/submitting states, preserves sample-request mode fields, keeps direct email/phone fallback channels, includes the optional `VITE_TURNSTILE_SITE_KEY` widget/token path, and does not use submit-flow `mailto:` or window navigation.
  - This is a source-only verifier. It does not replace live Supabase form persistence, Turnstile, email, browser-responsive QA, or Cloudflare endpoint verification.
- Capability Statement UI source verification:
  - `npm run agent:capabilities-ui` => `node scripts/check-capabilities-page-source.mjs`
  - Verifies `/capabilities` keeps the Founder-sourced Capability Statement structure, the five concrete capability modules, selected-project proof ledger, shared CTA data, static PDF/media assets, email-gated `/api/enquiries` download lead capture, Turnstile widget/token reuse, and no-mailto/window-navigation submit contract.
  - This is a source-only verifier. It does not replace live Supabase lead persistence, final Turnstile proof, or browser-responsive QA.
- SEO readiness:
  - `npm run agent:seo-readiness` => `node scripts/check-seo-readiness.mjs`
  - Verifies `public/robots.txt`, `public/sitemap.xml`, `src/data/seoRoutes.ts`, `src/App.tsx`, and the current static public data agree on the Phase 1 SEO indexability contract.
  - Confirms sitemap URLs match the approved public route set, excludes `/admin` and `/api`, keeps clean canonical URLs only, and guards against the old generic detail-title source returning in `src/App.tsx`.
  - This is a source/no-secret verifier. It does not query Google, submit the sitemap to Search Console, prove production deployment has completed, or replace a future pre-render/SSR decision.
- Live form verification:
  - `npm run agent:forms-live -- --allow-writes` => `node scripts/check-forms-api-live.mjs --allow-writes`
  - Loads local environment values from `.env.local`, `.env`, `.dev.vars`, and the shell.
  - Requires `--allow-writes`, Jay approval for tagged live form QA writes, and `SUPABASE_SERVICE_ROLE_KEY` or the compatibility alias `SUPABASE_SERVICE_KEY`.
  - Default mode invokes the Pages Function handlers directly and suppresses Turnstile/email side effects unless `--turnstile-token` or `--allow-email` is supplied.
  - Final notification proof can be forced with `--allow-email --require-email`; this asserts both valid live submissions store `notification_status = 'sent'` instead of quietly accepting `not_required` or `failed`.
  - Final Turnstile proof can be forced with `--require-turnstile --turnstile-token <token>`; this now requires `VITE_TURNSTILE_SITE_KEY` before the live check starts and asserts both valid live submissions store `turnstile_success = true`.
  - Optional HTTP mode uses `--base-url <origin>` to test a local or deployed Pages endpoint while still querying Supabase to verify durable rows.
  - Valid live submissions must return a final `notificationStatus` that matches the stored lead row's `notification_status`, so email patch failures do not hide behind a successful insert.
  - Valid live submissions must have audit rows with matching source-route metadata, and invalid live submissions must create neither rows nor matching audit events.
  - Optional `--require-browser-boundary` requires `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY` and verifies the created enquiry, sample request, and sample item rows are not anonymously readable through browser-key REST access.
  - The command is write-gated and credential-gated; it intentionally fails when `--allow-writes` or service-role credentials are absent.
- Cloudflare Pages readiness:
  - `npm run agent:cloudflare-readiness` => `node scripts/check-cloudflare-pages-readiness.mjs`
  - Verifies the repo-side Pages contract: `npm run build`, Vite root base, SPA fallback, `/api/*` Function routing scope, launch headers, API handler files, environment placeholders, and deployment runbook coverage.
  - This command does not create a Cloudflare Pages project, set environment variables, validate a preview URL, change custom domains, or touch DNS.
- Cloudflare preview smoke:
  - `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev` => `node scripts/check-cloudflare-preview-smoke.mjs`
  - Verifies deployed direct-refresh shells for public/admin routes, deployed `/assets/*`, recursively discovered route chunks, JS/CSS MIME and body integrity (including cached SPA-shell false 200 denial), absence of the removed year-long immutable asset policy, the deployed admin config-required/profile-gate bundle markers, legacy `_redirects` behavior, and no-write API safe-failure behavior for `/api/enquiries` and `/api/sample-requests`, including malformed JSON. Optional `--reference-url https://<deployment>.urblo.pages.dev` compares root entry/style asset identity so a healthy but stale custom origin cannot pass as the newly promoted deployment.
  - Local Vite preview URLs are supported for route/asset/bundle validation; Cloudflare-only redirect and Function checks are skipped on local hosts.
  - This command does not create a Pages project, set environment variables, submit valid form rows, verify Supabase persistence, change custom domains, or touch DNS.
- Admin live readiness:
  - `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` => `node scripts/check-admin-live-readiness.mjs`
  - Loads local environment values from `.env.local`, `.env`, `.dev.vars`, and the shell.
  - Requires `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`, plus `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY`.
  - Reads `admin_profiles`, `site_settings`, and `finish_definitions` with the service key; also verifies the browser-safe key can read published public seed rows while `admin_profiles` stays unreadable or empty without an authenticated admin session.
  - It does not create users, create profiles, mutate content, or delete rows.
  - Defaults to requiring an active `owner` profile. Use `--required-role owner,admin` only when intentionally verifying a non-owner admin profile.
- First-admin bootstrap:
  - `npm run agent:first-admin-bootstrap` => `node scripts/bootstrap-first-admin.mjs`
  - Default mode prints the approved bootstrap path and performs no Supabase calls, invites, profile writes, or deletes.
  - `--verify-only --admin-email <first-admin-email>` requires a service-role key and checks whether the Supabase Auth user, exactly one active `admin_profiles` row linked to that Auth user with the planned role (`owner` by default or explicit `--role admin`), and baseline seed rows are ready.
  - `--allow-writes --admin-email <first-admin-email> --confirm-email <first-admin-email>` is the guarded live mode for creating/upserting the first `admin_profiles` row for an existing Auth user. Add `--invite` only when Jay explicitly approves sending the Supabase Auth invitation. The write path refuses duplicate profile emails or an email already linked to another Auth user before the upsert.
  - Live write mode also inserts an `admin_profile.bootstrap` audit event; if that audit insert fails, the command fails instead of silently treating the access-control change as fully verified.
  - Existing active owner profiles block a new first-admin bootstrap unless `--allow-existing-owner` is intentionally supplied.
- Live input readiness:
  - `npm run agent:live-readiness` => `node scripts/check-live-readiness.mjs`
  - Loads local environment values from `.env.local`, `.env`, `.dev.vars`, and the shell.
  - Reports, without printing secret values, whether the inputs for local/deployed form persistence, final email proof, final Turnstile proof, form private-row browser-key proof, `agent:admin-live-readiness`, `agent:first-admin-bootstrap -- --allow-writes`, active-admin browser QA, unprofiled unauthorized browser QA, `agent:admin-crud-live -- --allow-writes`, owner/admin private Storage proof, the separate `agent:admin-media-role-boundary-live -- --allow-writes --strict` Editor/public-bucket proof, guarded content import apply/merge/cutover approval, and `agent:cloudflare-preview-smoke` are present.
  - Accepts non-secret readiness overrides: `--base-url <origin>`, `--admin-email <email>`, `--form-writes-approved`, `--first-admin-writes-approved`, `--admin-writes-approved`, `--media-role-migration-verified`, `--media-role-writes-approved`, `--content-import-approved`, `--content-merge-approved`, `--content-public-cutover-approved`, and `--turnstile-token-provided`. Secret keys and admin/editor session credentials must still come from env files or the shell and must not be printed.
  - Manual `--base-url` and `--admin-email` values are validated before they count as present. Copied placeholders such as `<preview-origin>` / `<first-admin-email>`, malformed emails, or preview URLs with path/query/hash remain missing in the readiness report.
  - `--form-writes-approved` only represents Jay's approval to run tagged live form QA writes; it does not provide service-role credentials, browser-safe credentials, or a preview URL.
  - `--first-admin-writes-approved` only represents Jay's approval to run the first-admin profile/invite write path; it does not provide a service-role key or replace the `--allow-writes` and `--confirm-email` guards on `agent:first-admin-bootstrap`.
  - `--media-role-migration-verified` only records that `20260713065628_media_public_bucket_role_hardening.sql` was applied and its policies were read back in production. `--media-role-writes-approved` records Jay's approval for that exact tagged Editor/owner Storage proof rather than reusing general admin CRUD approval. Neither flag applies SQL, runs writes, or replaces distinct active Editor/owner credentials and the live role-boundary verifier.
  - `--content-import-approved`, `--content-merge-approved`, and `--content-public-cutover-approved` only represent Jay's approval state for those guarded operations; they do not apply SQL, publish content, or switch public runtime reads.
  - `--turnstile-token-provided` only represents that a valid target-environment token will be supplied to `agent:forms-live -- --require-turnstile`; it does not provide the public site key, server secret, or the actual token value.
  - Default mode is report-only and exits 0 even when inputs are missing; `--strict` exits 1 when live inputs are missing or manually gated.
  - This command does not query Supabase, create users, run live writes, create Cloudflare projects, or touch DNS.
- Admin CRUD source coverage:
  - `npm run agent:admin-crud-coverage` => `node scripts/check-admin-crud-coverage.mjs`
  - Verifies `/admin` route registration, active module registration, `RequireAdmin` state coverage, browser-safe Supabase client wiring, launch-critical table references, dashboard content-health checks, role-gated mutation controls, publish/archive paths, structured Article block authoring guardrails, shared audit writer usage, Media/Leads export audit gates, and the non-destructive archive/removal contract.
  - Also guards launch-critical admin UI state coverage: mutating screens must keep validation feedback and save paths, while content/media screens must keep publish/archive lifecycle save paths and published/archived state controls.
  - Also scans admin source and the live admin verifier for destructive removal regressions: Supabase `.delete()` mutations, HTTP `DELETE` requests, destructive RPC names, and visible `Delete`/`Remove` controls are not allowed in the launch-critical CMS path.
  - Also guards the admin auth shell source contract: protected routes must preserve encoded admin-only `next` targets, login must reject non-admin or login/unauthorized loop targets, and session bootstrap must validate Supabase sessions with `getUser()` before looking up an active `admin_profiles` row.
  - Also scans browser source for actual service-role Supabase env/client usage patterns, guards the config-missing admin gate plus admin-route WelcomePopup suppression, and verifies the live admin CRUD verifier remains browser-key/RLS based rather than service-role based.
  - This is a source-only verifier. It never mutates Supabase and does not replace live browser QA with a configured admin profile.
- Admin config-gate browser coverage:
  - `npm run agent:admin-config-gate` => `node scripts/check-admin-config-gate.mjs`
  - When no `--base-url` is supplied, creates a dedicated Vite build under `.tmp/admin-config-gate/dist` with every browser-safe Supabase key explicitly cleared, then runs a generated Playwright Firefox spec against `/admin`, `/admin/login`, `/admin/unauthorized`, `/admin/leads`, `/admin/media`, `/admin/settings`, `/admin/stone-library`, `/admin/projects`, `/admin/products`, `/admin/articles`, and `/admin/audit`.
  - Verifies each route renders `Configuration required`, rejects the stable login-form marker plus private admin/module text, captures ignored screenshots under `.tmp/admin-config-gate/screenshots`, and does not require Supabase credentials or live writes. This prevents a previously configured `dist/` or local `.env` from turning the no-config test into a false failure.
  - Use `--base-url <origin>` only for an origin intentionally built without browser-safe Supabase configuration.
- Admin auth browser coverage:
  - `npm run agent:admin-auth-browser` => `node scripts/check-admin-auth-browser.mjs`
  - Loads local environment values from `.env.local`, `.env`, `.dev.vars`, and the shell without printing secret values.
  - Default mode is plan-only and prints required variable names/sources. It does not sign in unless `--allow-login` is supplied.
  - Live mode builds current source into an isolated configured bundle when no `--base-url` is supplied, enforces a 500,000-byte entry budget plus no eager Supabase vendor module preload, aborts the Supabase chunk and verifies Products/Projects/Articles retain static fallback, signs in through `/admin/login` with `URBLO_ADMIN_EMAIL` and `URBLO_ADMIN_PASSWORD`, uses the stable `admin-login-form` marker instead of display-copy matching, verifies authenticated admin route shells in Firefox, then signs out and reopens a protected route to prove the session is gone. It captures ignored screenshots under `.tmp/admin-auth-browser/screenshots` and creates no content rows, Storage objects, or audit events. `VITE_SUPABASE_URL` is optional because the browser client defaults to the Urblo project URL. The configured local 2026-07-13 run covered all 9 authenticated route shells, Sign out, and the protected-route revisit; production must be rerun after deployment of this verifier follow-up.
  - Unauthorized-profile mode uses `--allow-login --expect-unauthorized --strict` with `URBLO_UNPROFILED_EMAIL` and `URBLO_UNPROFILED_PASSWORD` for a valid Auth user that has no active `admin_profiles` row; it must land on `/admin/unauthorized`, then probe all launch-critical admin routes while signed in and keep them on `/admin/unauthorized` without rendering private admin module content. It still creates no rows or Storage objects.
  - Use `--base-url <origin>` to run the same authenticated browser check against another preview origin after browser-safe Supabase config exists there.
- Admin CRUD live verification:
  - `npm run agent:admin-crud-live` => `node scripts/check-admin-crud-live.mjs`
  - Default mode prints the live verification plan and performs no writes.
  - Live write mode uses `npm run agent:admin-crud-live -- --allow-writes` after browser-safe Supabase config and a real owner/admin session are available.
  - The command uses browser-key PostgREST/Auth requests, not a service-role key, so writes exercise RLS for the signed-in admin profile.
  - The command creates tagged QA rows, verifies dashboard-health predicates against tagged QA rows before archive cleanup, publishes then archives public-facing parents where possible, verifies the exact tagged audit action/entity set, verifies those tagged archived public-content rows and private lead rows are not anonymously visible, and intentionally avoids physical deletes. `--include-storage` uploads a tiny private `urblo-admin-media` object, verifies signed-in admin readback, and verifies anonymous browser-key reads are denied through private and public Storage object endpoints for the final media upload policy proof.

## Route Interface Contract (`src/App.tsx`)

Routing uses clean paths through `BrowserRouter`. Cloudflare Pages direct refresh support depends on `public/_redirects`.

| Route pattern | Page component | Notes |
|---|---|---|
| `/` | `Home` | Wrapped by `HomepageLayout`; shared site chrome is used through homepage proxy components. |
| `/stone-library` | `StoneLibraryPage` | Stone list and filter surface. |
| `/stone-library/:stoneGroupId` | `StoneLibraryDetailPage` | Stone detail with variant switch, synchronized finish controls, and lightbox preview. |
| `/products` | `ProductsPage` | Bench/system product listing. |
| `/products/:slug` | `ProductDetailPage` | Product detail and material options. |
| `/projects` | `Projects` | Project listing page. |
| `/projects/:slug` | `ProjectDetails` | Project detail page. Uses page-owned project hero via `DefaultLayout showBanner={false}`. |
| `/our-story` | `OurStory` | About page. |
| `/capabilities` | `CapabilitiesPage` | Web-native 2026 Capability Statement page sourced from the Founder PDF, including a service-style capability hub, lifecycle support, national reach, selected proof ledger, and an email-gated PDF download form. |
| `/contact` | `ContactPage` | Contact surface with direct contact channels plus API-backed enquiry/sample-request submit flows. Sample mode is available at `/contact?intent=sample-request`; direct email and phone remain manual fallback channels. |
| `/articles` | `ArticlesPage` | Article list page. |
| `/articles/:slug` | `ArticlePage` | Article detail page. Uses page-owned article hero via `DefaultLayout showBanner={false}`. |
| `/admin/*` | `AdminApp` | Protected admin shell outside public site chrome. Config-gated until browser-safe Supabase key is set; uses Supabase Auth plus `admin_profiles` once configured. Current source CRUD/workflow/review screens: Settings/admin profiles, Media, Stone Library, Projects, Products, Articles, Leads, Audit. |
| `*` | `NotFoundPage` | Branded not-found state wrapped by `DefaultLayout showBanner={false}`. |

Route state contract:
- Shared route-level loading states use `src/components/RouteState.tsx` instead of plain text placeholders.
- Route states on no-banner routes use the `headerOffset` prop so loading, not-found, and error copy clears the absolute site header.
- Unknown public URLs render `src/pages/NotFoundPage.tsx`, not the homepage.
- Product detail and article detail routes render deliberate loading, not-found, and load-error states before showing detail content.
- `scripts/agent-smoke.sh` includes unknown-route and missing-product route-shell coverage; browser QA is still required for rendered copy/state checks.
- Client-side route navigation scrolls to the top for new PUSH/REPLACE navigations while preserving POP/back behavior.
- Public route changes are wrapped by `AnimatedRoutes` in `src/App.tsx` with a restrained Framer Motion enter transition keyed by pathname. Query/filter changes do not trigger full-page transitions, route-state content is not held behind exit animation, and reduced-motion preferences collapse the movement.

## UI Motion Contract
- `src/components/AnimatedNumber.tsx` is the shared count-up component for structured numeric UI.
- Approved current usages: homepage metrics and Our Story proof counters.
- Do not use count-up for dates, sizes, dimensions, product specifications, editorial body copy, prices, native select option labels, filter result counts, or Stone Library card scan counts.
- The component starts at `0`, waits until the number enters the viewport, then animates to the final value once with `IntersectionObserver` and `requestAnimationFrame`.
- The final value remains exposed through `aria-label` while the visible counter changes.

## Navigation Contract vs Implemented Routes

### Implemented navigation surfaces
- Shared desktop header primary links: `/projects`, `/capabilities`, `/stone-library`, `/our-story`, `/contact`
- Shared desktop header hamburger links: `/articles`, `/products`
- Shared desktop header layout: logo remains left; the primary links and hamburger are rendered as one right-aligned group, not as separate centered/right columns.
- Shared mobile header hamburger links: `/projects`, `/capabilities`, `/stone-library`, `/our-story`, `/articles`, `/products`, `/contact`
- Homepage proof-section CTA: `/capabilities`
- Shared footer links: `/capabilities`, `/contact?intent=sample-request`, `/contact`
- Shared footer social links: Instagram and LinkedIn use external links with `target="_blank"` plus `rel="noopener noreferrer"`; Facebook and YouTube are hidden until real destinations are available.

### Gaps
- Current implementation gap: basic live Contact and Sample Request persistence, real SMTP2GO notification delivery, and private-row browser-key denial are verified, but Turnstile, admin-visible lead workflow, and the Capability-specific download lead path still require production verification.
- Launch target: Contact and Sample Request submit through Cloudflare Pages Functions into Supabase, with Turnstile protection, email notification, and admin-visible lead records.

## Metadata Contract
- `index.html` contains Urblo-owned default title, description, favicon, manifest, canonical, Open Graph, and Twitter metadata.
- `src/data/seoRoutes.ts` is the source-side SEO route registry for public indexable URLs, including title, description, canonical path, sitemap priority/change frequency, breadcrumbs, and safe structured-data inputs.
- `src/App.tsx` updates route-level title, description, robots, canonical, Open Graph, Twitter metadata, and client-side JSON-LD through a small native document-head updater driven by `src/data/seoRoutes.ts`. Resolved Published CMS detail pages then let `src/components/PublicContentSeo.tsx` replace that route-level JSON-LD with entity-specific Article or WebPage data plus Organization, WebSite, and BreadcrumbList data derived from the validated runtime record.
- Current Phase 1 SEO indexability foundation:
  - `public/robots.txt` is a real static crawler file, allows the public site, disallows `/admin` and `/api`, and points to `https://urblo.com.au/sitemap.xml`.
  - `public/sitemap.xml` is a real static XML sitemap with 36 approved public canonical URLs covering Home, core public listing pages, 5 Projects, 13 Stone Library groups, 6 Products, and 4 Articles.
  - Client-side JSON-LD is intentionally conservative: Organization, WebSite, BreadcrumbList, Article, and generic WebPage only. Product/Service schema remains deferred until pricing, availability, and claim scope can be represented safely.
  - `npm run agent:seo-readiness` verifies the source-side SEO contract: robots/sitemap are static files rather than SPA fallback HTML, sitemap URLs match current public data, admin/API/private paths are excluded, `src/App.tsx` is wired to the SEO registry, and detail routes do not regress to the old generic title source.
- Important limitation: because the current public app is still a Vite React SPA, the first network response for route deep links is still the shared app shell. Phase 1 improves discoverability, canonical URL declaration after hydration, route metadata consistency, sitemap submission readiness, and structured data after JavaScript executes. CMS-only sitemap/route discovery and any server-rendered or pre-rendered detail HTML decision are tracked under `NEXT-SEO-CONTENT-GROWTH-001`, after the Phase 2 redirect cleanup.
- Phase 2 SEO follow-up is tracked in `docs/SEO_PHASE_2_PLAN.md`. Google Search Console review on 2026-06-12 showed stale sitemap history plus legacy WordPress/old-site URLs in indexing reports; selective legacy redirect cleanup is now implemented in `public/_redirects`, while junk WordPress/admin/feed/upload paths remain out of the sitemap and are not redirected to unrelated pages.
- Default share image asset: `public/og-default.png` at 1200 x 630. `public/og-default.svg` remains the editable source used to generate the PNG.
- Favicon assets: old-site-matched WordPress site icon PNGs in `public/favicon-32x32.png`, `public/favicon-192x192.png`, `public/favicon.png`, `public/apple-touch-icon.png`, and `public/mstile-270x270.png`.
- Web manifest: `public/site.webmanifest`, referencing PNG icon assets instead of the retired temporary SVG favicon.
- `react-helmet` was removed because it emitted React strict-mode lifecycle warnings under the current React 19 dev setup.

## Public Slug and Redirect Contract
- Canonical public slugs use lowercase kebab-case across Projects, Stone Library, Products, and Articles.
- Product records in `src/data/productData.ts` may retain `legacySlugs` for pre-normalization camelCase links; `ProductService.getBySlug()` resolves both canonical and legacy slugs, and `ProductDetailPage` redirects legacy matches to the canonical URL.
- Article records in `public/articles/index.json` may retain `sourceSlug` and `legacySlugs` while the legacy raw HTML folders remain title-case export folders. `ArticlePage` resolves those aliases, fetches from `sourceSlug`, and redirects legacy matches to the canonical URL.
- `public/_redirects` contains explicit Cloudflare 301 rules for the old product and article URLs before the SPA catch-all rule.
- Additional GSC-driven legacy redirects are part of the Phase 2 SEO cleanup. Semantically useful old URLs such as `/contact-us`, `/our-capacity`, `/product/creama`, `/product-category/limestone`, `/stone-product/bollard`, and `/article/discover-the-art-of-surface-finishes` now have explicit 301 rules. Old WordPress feeds, search URLs, admin/plugin endpoints, and upload globs stay out of the sitemap and are not redirected to unrelated pages.
- Future `/admin` slug editing should enforce lowercase kebab-case and preserve old public URLs as redirect aliases before changing published content slugs.

## Current Static Media Contract
- P0 launch media lives under `public/media/launch` as a short-term controlled stopgap until Supabase Storage and Cloudflare media delivery are implemented.
- Shared site logo path: `public/media/launch/identity/urblo-logo.png`, referenced by `src/data/siteChrome.ts` and `src/data/homepage.ts`.
- Homepage hero poster path: `public/media/launch/home/hero-poster.jpg`.
- Homepage hero video path: `public/media/launch/home/urblo-hero.mp4`.
- Homepage mobile hero video path: `public/media/launch/home/urblo-hero-mobile.mp4`; the mobile MP4 is encoded as H.264, 540x960, 30fps, no-audio, fast-start media for better mobile/WeChat/X5 compatibility.
- Current homepage video asset is a web-ready H.264 1280x720, 30fps, no-audio, fast-start export from the client-provided `Lark20260611-213730.mp4`; the 74MB source file was not committed.
- Homepage hero uses `100svh` so the first viewport reads as a full-screen hero across desktop and mobile.
- Homepage hero preloads the poster from `index.html`, uses the poster as the section background fallback, uses the 540x960 mobile MP4 for `media="(max-width: 767px)"`, and uses `preload="auto"` for the desktop/tablet MP4 constrained through `media="(min-width: 768px)"`. The hero video element keeps `playsinline`, `webkit-playsinline`, and Tencent X5 inline playback attributes, and retries playback on media readiness, user gesture, page visibility, page show, and `WeixinJSBridgeReady`.
- Homepage below-the-fold heavy media, including the partner banner, Product Showcase background, Latest Projects imagery, Manifesto background, and Video CTA image, must stay deferred until the relevant section is near the viewport so those assets do not compete with first-viewport video loading.
- The current desktop MP4 is about 4.6MB and the current mobile MP4 is about 2.3MB. Cloudflare Stream/R2 remains optional if the client later wants adaptive delivery, analytics, or non-repo video management.
- Route banners are local launch media referenced from `src/App.tsx` through the `ROUTE_BANNERS` map. `/capabilities` now owns a full-bleed page hero sourced from the 2026 Capability Statement PDF instead of using a shared route banner.
- Capability Statement PDF download path: `public/downloads/urblo-capability-statement-2026.pdf`.
- Capability Statement web imagery path: `public/media/launch/capabilities`; these assets must be visually audited for orientation and crop quality before use.
- Our Story Natalie source portrait path: `public/media/launch/our-story/natalie-ma-2026.jpg`.
- Contact image path: `public/media/launch/contact/project-contact.jpg`, referenced by `src/pages/ContactPage.tsx`.
- Homepage partner banner image path: `public/media/launch/homepage/partner-banner-west-side-place.jpg`, referenced by `src/data/homepage.ts`.
- Homepage Latest Projects rail image paths are the five controlled project sources referenced by `src/data/homepage.ts`: `public/media/launch/homepage/project-west-side-place.jpg`, `public/media/launch/homepage/project-moon-gate.jpg`, `public/media/launch/homepage/project-artisan-park.jpg`, `public/media/launch/homepage/project-xavier-college.jpg`, and `public/media/launch/contact/project-contact.jpg`. The upper feature image can be selected separately through each homepage project record's `featureImage`/`featureImageAlt` fields and currently defaults to second-detail project media where available: `public/media/launch/projects/west-side-place/detail-2.jpg`, `public/images/projects/moon-gate/moon-gate-seat-detail.jpg`, `public/media/launch/projects/artisan-park-yarrabend/detail-2.png`, `public/media/launch/projects/xavier-college/detail-2.jpg`, and `public/media/launch/projects/australian-catholic-university/detail-2.jpg`.
- Homepage section imagery and partner logos now use controlled files under `public/media/launch/homepage`.
- Our Story portraits now use controlled files under `public/media/launch/our-story`; the carbon banner uses the controlled route banner because the old WordPress carbon banner returned 404.
- Legacy project listing/detail media now uses controlled files under `public/media/launch/projects`.
- Stone Library primary and secondary finish imagery is mapped from `data/Product` through `src/data/stoneFinishImages.ts`; controlled fallback media lives under `public/media/launch/stone-library/fallbacks`.
- Stone Library finish imagery carries `FinishVM.imageRole` as `finish-specific`, `reference`, or `placeholder`; the UI must disclose reference/placeholder imagery instead of implying a fallback is finish-specific.
- Stone Library current image status: Alpine White, Angola Black, Golden Crust Light/Dark, Honey Comb, Ivory Sand, Juparana, New Grey, Steel Blue, Tan Brown, and Zen Grey have finish-specific images. Tuscany Vein Cut and Cross Cut use variant-level shared-drive images as defaults rather than pretending to have finish-specific honed/polished/sandblasted photos. Blueocean still uses the controlled local fallback, and Harcourt still uses TBC placeholders because no matching current-site shared-drive sources were found.
- Article cover and inline cleanup media now uses controlled files under `public/media/launch/articles`.
- Article email-export HTML is still stored as source material under `public/articles`, but `src/lib/articleMedia.ts` rewrites known Squarespace/Front/Google proxy images to local launch media and removes email campaign tracking links before DOMPurify sanitization.
- Article claim-safety and mobile stopgap: `src/lib/articleMedia.ts` rewrites known high-risk newsletter phrases at runtime, unwraps dead links, and `src/index.css` constrains legacy newsletter tables/media to reduce mobile overflow until structured article blocks replace the raw newsletter HTML.
- This is not the long-term CMS media contract. During Supabase migration, these assets should be represented as media records and moved to Supabase Storage or Cloudflare media storage according to final performance testing.

## Stone Library Detail Interaction Contract (`src/pages/StoneLibraryDetailPage.tsx`)
- State composition:
  - Effective active finish resolves by precedence: `lockedFinishKey` -> `defaultFinishKey`.
  - Each finish selection click increments a center-request token used by left media for one-shot visibility-check scroll handling.
  - Variant changes reset locked finish state and close lightbox state.
- Left media contract (`src/components/stone-library/ImageStage.tsx`):
  - Desktop/mobile: click (or keyboard activation) selects finish; hover/focus does not mutate active finish.
  - Width/layout computation and scroll decision are decoupled into separate single-pass flows to avoid race conditions.
  - Width updates are immediate (no width transition); smooth motion is provided only by scroll when needed.
  - Any finish selection click (left media or right selector) runs visibility check once: if active panel is fully visible, keep scroll position; if clipped/out of frame, smooth-scroll to a best-effort centered position.
  - Strict-mode duplicate effect calls are guarded so one token triggers one effective scroll decision.
  - Active panel maintains fixed 3:2 ratio.
  - When finish count is low and default panel widths do not fill the stage viewport, non-active panels expand to consume remaining width.
  - Single-finish states keep the lone 3:2 panel centered in the stage viewport (no forced full-bleed stretch).
  - Secondary frames are not separate finishes. They display only for the active finish when `FinishVM.secondaryImages` exists.
  - Clicking a secondary frame opens the lightbox on that frame while preserving the active finish key.
  - Missing secondary frames are omitted entirely and must not introduce placeholder thumbnails.
- Right finish selector contract (`src/components/stone-library/FinishAccordion.tsx`):
  - Click (or keyboard activation on focused button) is the only state-changing selection action.
  - Selection updates active finish and triggers the left-stage visibility-check scroll policy.
  - Active finishes with secondary frames disclose the primary-plus-secondary frame count in the behavior panel.
- Large-image inspection contract (`src/components/stone-library/FinishLightbox.tsx`):
  - Open via active-panel zoom action; close via button, backdrop, or `Esc`.
  - Supports previous/next finish navigation with buttons and arrow keys.
  - Supports 1x/2x zoom with 2x drag-pan and body-scroll lock while open.
  - Supports primary/secondary frame selection within the active finish without changing finish state.

## Data Contracts

### Stone Library Data Contract (Primary for Materials)
- Source JSON: `data/clean/stone_library.json`
- Type contract: `src/types/stone-library.ts`
  - `StoneLibraryRaw`, `StoneFinishRaw`, `StoneGroupRaw`, `StoneVariantRaw`
  - `StoneCardVM`, `StoneDetailVM`, `FinishVM`, `FinishSecondaryImageVM`, `StoneFinishImageRole`, `StoneStatus`
  - Price presentation fields on `StoneDetailVM`:
    - `priceRange` (source notation, e.g. `$ / $$ / $$$`)
    - `priceTierLevel` (`1 | 2 | 3 | null`)
    - `priceTierLabel` (`Budget | Balanced | Premium | null`)
    - `pricePrimaryLabel` (`Budget | Balanced | Premium | Price on request`)
- Service contract: `src/service/StoneLibraryService.ts`
  - `getStoneCards(filters)`
  - `getStoneDetail(stoneGroupId, variantId?)`
  - `getFilterFacets()`
  - `getStoneOptionsForProducts()`
  - `getStoneGroupOptionsForProducts()`
  - Price mapping contract in `getStoneDetail`:
    - Active stones with valid tier (`1/2/3`) map to `Budget/Balanced/Premium`.
    - `tbc` status or missing/invalid tier degrades to `Price on request`.
- Supplemental metadata:
  - `src/data/finishBehaviorMeta.ts`
  - `src/data/stoneFinishImages.ts`

### Product Data Contract
- Source of product records: `src/data/productData.ts`
- Access layer: `src/service/ProductService.ts`
  - `getAll(): Promise<Product[]>`
  - `getBySlug(slug): Promise<Product | undefined>`
- Type contract: `src/types/product.ts`
  - `Product`, `ProductModel`, `MaterialCategory`, `SelectedMaterials`, `OptionItem`
  - `OptionItem.imageState` may mark selector imagery as `ready` or `pending`.
- Runtime note:
  - Canonical product slugs are lowercase kebab-case; old camelCase product slugs are stored in `legacySlugs` for redirect compatibility.
  - `ProductDetailPage` body-stone selector options come from `StoneLibraryService.getStoneGroupOptionsForProducts()` so product configuration uses stone-group choices rather than variant-level entries.
  - Product detail pages initialize configured default material selections, show selected model/material feedback, expose a prefilled configuration enquiry `mailto:`, and mark missing selector imagery as pending.
  - Product render imagery is treated as a geometry preview; selected body stone, frame finish, and battens are shown as separate material previews instead of pretending the render is composited live.

### Project Data Contract
- Static migration fallback: `src/data/projectData.ts`
- Public access layer: `src/service/ProjectService.ts`
  - `getAll()` uses the browser-safe public Supabase client to read Published `projects`, their facts, and Published `project_media`, resolves only public-safe media URLs, then overlays each Published Project onto the matching static Project by canonical slug.
  - Unmatched static Projects remain visible during migration, new Published Projects append, and a missing public client or empty/error Published query leaves the static fallback collection intact.
  - `getBySlug(slug)` resolves the merged collection by normalized canonical slug.
  - Published `project_facts.fact_value_json` is treated as untrusted JSON. Only a string or an array containing strings is exposed to the public Project detail; other shapes normalize to a safe empty value instead of leaking arbitrary objects into the view model.
- Listing page: `src/pages/Projects.tsx`
  - Calls `ProjectService.getAll()` and uses page-owned opening content because `/projects` is wrapped with `DefaultLayout showBanner={false}`.
  - Functional archive state includes equal-sized image cards, sector filters, and grid/list view controls.
- Detail page: `src/pages/ProjectDetails.tsx`
  - Reads the same merged `ProjectService` collection and renders the shared case-study structure: breadcrumb, oversized title, previous/next navigation, full-width hero, Project Information facts, narrative, ordered media blocks, Featured Materials when configured, and final CTA.
  - Uses `mediaBlocks` when present and falls back to `images` as normal image blocks for older records.
- Project media block contract:
  - `normal_image`: full-width responsive image proof with optional label/caption.
  - `hotspot_image`: full-width responsive project image with material/finish hotspot inspector.
  - `youtube_video`: optional one-per-project video block rendered with `youtube-nocookie` when project data or future Supabase content provides a YouTube ID. Current static project data has no live YouTube block because no client-approved Urblo project video is configured.
- Project hotspot component: `src/components/projects/ProjectHotspotImage.tsx`
  - Desktop interaction: hover/focus/click changes the active material inspector.
  - Mobile interaction: tap/focus changes the active material inspector directly below the project image; no hover-only dependency.
  - Hotspot coordinates are stored as image-percentage positions in `src/data/projectData.ts`.
  - Hotspots are material-placement records keyed by `stoneGroupId` and `finishKey`; stone names, finish labels, finish preview images, and detail links resolve through `StoneLibraryService` where possible.
- Legacy wrapper: `src/components/projects/ProjectMaterialMap.tsx` now delegates to `ProjectHotspotImage` so older imports keep the same runtime behavior.
- Moon Gate MVP assets:
  - Local deployment assets live under `public/images/projects/moon-gate`.
  - `Moon Gate | Woolley Street` is the first project using `hero`, `lead`, `materialMap`, `materials`, `gallery`, and `cta` fields.
  - Featured material links point to `/stone-library/angola-black` and `/stone-library/new-grey`.
- Current contract risk:
  - Moon Gate includes MVP-inferred material/application notes that should be confirmed with the designer before final public launch.
  - Other projects still use the legacy-level data shape and should be migrated one by one.

### Article Data Contract
- Static migration fallback root: `public/articles`
- Static index manifest: `public/articles/index.json`
- Static detail fallback: `public/articles/<sourceSlug-or-slug>/content.html`
- Public access layer: `src/service/ArticleService.ts`
  - `getAll()` loads the static manifest and Published Supabase article metadata, overlays matching canonical slugs, carries forward missing legacy/source slugs from the matching static item, retains unmatched static articles, and appends new Published articles.
  - `getBySlug(slug)` resolves canonical, source, and legacy slugs from that merged collection.
  - `getBody(meta)` prefers Published structured `article_blocks`; when no Published structured body exists it returns the legacy HTML source slug for the page fallback.
- Metadata type: `src/types/article.ts`
  - Canonical article slugs are lowercase kebab-case. `sourceSlug` keeps the legacy content folder name when the source HTML still lives in a title-case export folder, and `legacySlugs` preserves old public URLs for redirect compatibility.
- Loading behavior:
  - `src/pages/ArticlesPage.tsx` calls `ArticleService.getAll()` for the Published/static overlay.
  - `src/pages/ArticlePage.tsx` uses the same merged metadata and renders Published structured blocks when available; otherwise it fetches legacy HTML from `sourceSlug || slug`.
  - Published structured CTA/video destinations are rendered only after `src/lib/publicContentLink.ts` accepts and canonicalizes a root-relative path or an `http:`/`https:` URL. Protocol-relative, script/data schemes, encoded control characters, and backslash variants are omitted.
- Cover images in the article manifest use local controlled paths under `public/media/launch/articles`.
- Legacy detail HTML passes through `prepareArticleHtml` in `src/lib/articleMedia.ts` before DOMPurify sanitization.
- Runtime cleanup rewrites known email proxy image URLs to local article media, converts Google-hosted emoji images to text, removes Squarespace campaign wrappers where possible, and rewrites old product-PDF links to `/products`.
- Raw newsletter HTML remains committed only as migration source; do not treat it as the long-term authoring format.
- Approved structured block types are tracked in `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`; raw newsletter HTML remains migration source material, not the long-term authoring format.

### Supabase Launch Data Contract
- Site settings:
  - Global SEO, logo, favicon, social links, footer content, and default share image.
  - Public runtime reads only `settings_key = default` with `status = published`, validates JSON shapes, and falls back to `src/data/siteChrome.ts` when the row is missing or invalid. Draft/Archived settings never replace public fallback values. The admin reuses the same public field validators before a Published save, including email, social URL, homepage metadata, share-image, and footer-destination rules.
  - Homepage title and description settings apply only to `/`; the default share image can support route-level previews. Public settings requests are deduplicated only while in flight and are cleared after settlement, so returning from `/admin` refreshes Published settings and a transient fallback does not become a permanent session cache.
- Media:
  - Storage-backed or external media records with source, status, alt text, credit, usage notes, technical metadata, and public/private bucket state.
  - Public adapters resolve `source_url` for published external/R2/Stream records. Published Storage records resolve only when `bucket = urblo-public-media` and `object_path` exists; private or Draft media never produces a public Storage URL.
- Projects:
  - Project metadata, hero/gallery/detail media, published status, SEO, evidence facts, material schedules, ordered media block rows, material maps, and hotspot records.
  - `project_media` stores ordered detail modules through `media_role` values including `normal_image`, `hotspot_image`, and `youtube_video`; `hotspot_image` rows link to `project_material_maps`, while YouTube rows store the normalized YouTube ID/URL without a media asset.
  - Hotspots store image-percentage coordinates and references to Stone Library records where possible.
- Stone Library:
  - Stone groups, variants, finishes, finish imagery, specifications, availability, and display ordering.
- Products:
  - Product families, model images, editable specs, and default material selections.
  - Product material defaults should reference Stone Library records where possible.
- Articles:
  - Article metadata plus structured block records.
  - Blocks cover rich text, image, gallery, quote, FAQ, CTA, project spotlight, stone reference, comparison table, proof metric, video embed, and callout.
- Forms:
  - Enquiries and sample requests store submitted fields, source route, Turnstile result, notification status, admin status, owner, and internal notes.
- Admin audit:
  - Admin mutations should be attributable through audit fields or audit-event records.
  - Public form submissions should create server-side audit events after successful lead inserts when server-side Supabase credentials are configured.
- Content import readiness:
  - `scripts/check-content-import-readiness.mjs` is the source-only dry run for static-to-Supabase import preparation.
  - It intentionally marks import candidates as `draft` and uses natural keys/source URLs so provisional static content is not treated as final published client-approved content.
  - It extracts current legacy article newsletter HTML into draft structured blocks with claim-review metadata, while keeping source copy unpublished and review-gated.
  - The optional `--out` flag writes a local ignored JSON artifact for review without writing Supabase rows.
  - The optional `--plan-out` flag writes a local ignored Markdown apply/rollback plan for review without writing Supabase rows.
  - The optional `--preflight-sql-out` flag writes a local ignored read-only SQL artifact for reviewing current target table counts, status distribution, RLS state, and policies before any import is approved.
  - The optional `--apply-sql-out` flag writes a local ignored guarded draft import SQL artifact. It is not executed by the harness, aborts by default unless an explicit in-transaction approval setting is added, keeps imported content in `draft`, and requires a second explicit merge approval if target parent natural keys already exist.
  - Project import now prefers structured `mediaBlocks` from `src/data/projectData.ts` over legacy gallery fields, maps `normal_image` and `hotspot_image` rows into `project_media`, prepares `project_material_maps` for hotspot images, and keeps YouTube rows supported when future project data includes a client-approved video.
- Public migration overlay:
  - Published Projects, Products, and Articles overlay the matching static item by canonical slug; unrelated static items remain until an explicit CMS-only cutover.
  - Matching Published Projects keep static `sector`/`category` taxonomy and static-only material/CTA display structures until those values are fully represented by the public CMS adapter. CMS-owned title, summary, facts, media, and metadata still win. If either dependent Project facts or media read fails, the CMS Project collection is rejected for that read so the intact static fallback remains.
  - Published Stone Library cards overlay matching static cards by `stoneGroupId`; detail remains Published-first with static fallback.
  - Draft or Archived rows do not replace static migration fallback. This is an explicit migration rule, so archiving a migrated CMS row can reveal its static fallback until CMS-only cutover is approved.
  - Project public detail still needs full consumption of admin-managed `project_materials`, `project_material_maps`, and `project_hotspots`; database write coverage alone does not prove those structures render publicly.
- Admin IA/access:
  - `/admin` route, login, unauthorized, loading, module, settings, and audit states are defined in `docs/ADMIN_IA_ACCESS.md`.
  - `/admin/account-setup` is the invite/recovery password endpoint and is usable only when a valid callback identity matches the active session.
  - Current `/admin` source implements real Supabase Auth wiring, session/profile loading, login, unauthorized, dashboard, and protected module scaffolds.
  - The admin dashboard does not render private module content unless Supabase Auth returns a session and RLS allows the matching active `admin_profiles` row.
  - Admin login next-target handling is intentionally same-console only: `/admin`, `/admin?*`, and `/admin/*` are accepted, while `/administrator`-style prefixes and login/unauthorized loops fall back to `/admin`.
  - `/admin/settings` is the first settings/admin-access CRUD screen and uses the `site_settings` row plus `admin_profiles` rows with owner/admin save controls.
  - The one-time first-admin service-role bootstrap path must create an `admin_profile.bootstrap` audit event for its access-control change before live admin readiness is considered fully verified.
  - `/admin/media` is the first media CRUD screen and uses `media_assets` plus Supabase Storage buckets for upload-backed draft records, external records, metadata editing, audit-gated manifest export, and publish/archive guardrails.
  - `/admin/stone-library` is the first content CRUD screen and uses Stone Library group, variant, finish definition, finish capability, finish image, and linked media records.
  - `/admin/projects` is the next content CRUD screen and uses project records, facts, material schedule rows, media blocks, material maps, and hotspots. Media block source writes depend on `supabase/migrations/20260603142359_project_media_blocks.sql`, which is now applied and verified in the live Supabase project.
  - `/admin/products` is the next content CRUD screen and uses product family, model, material default, and spec records.
  - `/admin/articles` is the next content CRUD screen and uses article metadata plus structured article block records.
  - `/admin/leads` is the first lead workflow screen and uses enquiries, sample requests, sample request items, active admin profile options, Stone Library labels, and finish labels. Owner/admin CSV export is limited to the currently loaded queue and blocked if its audit event cannot be recorded.
  - `/admin/audit` is the first audit visibility screen and uses admin audit events plus active admin profile labels.
  - Admin profile management is non-destructive in source: it creates/updates profile rows for existing Supabase Auth users, preserves owner-role guardrails in UI, and is backed by the `admin_profile_owner_hardening` migration.
  - Launch content removal is non-destructive in source: admin content and media workflows use archive/publish state changes, while physical deletes remain outside the launch-critical CMS path until Jay approves a retention/destructive-delete policy.
  - The admin CMS must not ship fake production auth; live verification still requires browser-safe Supabase key configuration and a confirmed first admin profile.
  - Multi-table admin editors currently issue separate mutations rather than one database transaction. Partial failure must be surfaced accurately; atomic RPCs or explicit compensating actions remain a follow-up for high-risk Project/Stone/Product/Article saves.
- Access control:
  - Public reads expose only published content.
  - Admin writes require Supabase Auth.
  - RLS must be enabled for exposed tables before any public integration is considered complete.

### Contact Page Contract
- Route: `/contact`
- Page module: `src/pages/ContactPage.tsx`
- Runtime behavior:
  - The main form submits through `/api/enquiries` by default.
  - Selecting `Sample request` or visiting `/contact?intent=sample-request` submits through `/api/sample-requests`.
  - Sample Request mode shows sample preference, finish preference, quantity, project name, shipping address, and notes fields.
  - Visitor-facing success/failure states are rendered inline and no longer depend on opening a local email client.
  - Direct contact channels use `mailto:` and `tel:` links.
  - The page links back to `/stone-library` as a material discovery path.
- Server API behavior:
  - Cloudflare Pages Functions validate payloads before Supabase writes.
  - Sample Request writes create the request row and first item row through a service-role-only atomic RPC rather than separate REST inserts.
  - Turnstile fails closed when the Turnstile secret is configured; when absent, `turnstile_success` is stored as `null`.
  - Email notification is staged through optional SMTP2GO or Resend environment variables; when absent, rows use `notification_status = 'not_required'`.
  - No Supabase service-role key is referenced by browser code.

## State Contract (`src/store/productStore.ts`)
- Store keys:
  - `selectedMaterials: Partial<Record<MaterialCategory, string>>`
  - `currentModelKey: string`
  - `productSlug?: string`
- Mutations:
  - `setMaterial(category, slug)`
  - `setProduct(slug, defaultModel)`
  - `selectModel(modelKey)`
- Usage:
  - Product detail page initializes store per product slug.
  - Model and material selectors read/write this shared state.

## Storage and Side-Effect Contract
- Local storage keys:
  - `seenPopup` read and written by `WelcomePopup` on first display
- Dangerous HTML render points:
  - `ArticlePage` renders sanitized article HTML
- Runtime fetches:
  - Static JSON/HTML from `public/articles` remains the legacy Article fallback.
  - `src/lib/publicContentClient.ts` creates a non-session browser client from `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`; no public client is created when neither key exists.
  - Projects, Products, Articles, Stone Library, and default site settings read Published Supabase data directly through that browser client and public RLS, then apply their documented static fallback/overlay contracts.
  - Published Storage media resolves only from `urblo-public-media`; Draft, private, invalid, or unsafe media locations do not become public URLs.
  - Contact form POST requests to `/api/enquiries` and `/api/sample-requests`
  - Admin routes use `@supabase/supabase-js` only when `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY` is configured.
- Contact side effects:
  - Contact page submit sends validated form payloads to Cloudflare Pages Functions.
  - Direct email and phone links remain available as manual contact channels.
- Supabase and API side effects:
  - Public content/settings reads use the browser-safe public Supabase client and published-only RLS; service-role credentials never enter browser code.
  - Admin paths require authenticated Supabase sessions.
  - Media uploads use Supabase Storage only from authenticated admin/editor sessions, always enter the private `urblo-admin-media` bucket first, and create/update `media_assets` metadata through RLS. Public Storage is reached only through the guarded owner/admin promotion path.
  - Form submissions create durable Supabase records and email notifications.
  - Old WordPress media URLs must not remain first-viewport production dependencies.

## Homepage Contract
- Homepage structure is driven by dedicated internal config in `src/data/homepage.ts`, not the legacy tabbed `FeatureSection`.
- Homepage uses `HomepageLayout` with `HomepageHeader`/`HomepageFooter` proxy components that currently render the shared `SiteHeader`/`SiteFooter`.
- The previous homepage `Browse by stone type` showcase has been removed by request; homepage material discovery should be reintroduced only through a new Urblo-aligned section if the client wants that pathway.
- The previous homepage sustainability/tabbed feature section is currently not rendered by request. The proof metrics block now appears directly after the hero and uses the approved stone/city framing plus four proof metrics.
- Homepage partner banner is the slim `Design-led stone solutions for streetscapes & civil landscapes.` transition band, using the West Side Place aerial image and roughly half the original vertical space.
- Homepage Latest Projects is driven by `homepageData.latestProjects.projects`, currently a five-project array with slug, title, location, category, year, summary, rail image, rail image alt text, optional feature image, and optional feature image alt text. `HomepageSections.tsx` renders the data as a sketch-aligned two-row/four-column browser: the upper copy and upper feature image each span two columns, the lower draggable rail shows four portrait project images on desktop, and the active `View project` link navigates to `/projects/:slug`. The feature image falls back to the rail image when no separate `featureImage` is configured.
- Homepage Latest Projects is intentionally rendered immediately below the partner banner, before the Product Showcase, so project proof follows the positioning line rather than appearing later as a filler block.
- Homepage bottom video CTA is configured by `homepageData.videoCta.youtubeId` and opens a lazy `youtube-nocookie.com/embed/UfRtQZSi7cM` iframe only inside the Play modal. Closing the modal unmounts the iframe and stops playback.
- Homepage typography is self-hosted from local static assets under `/public/fonts/urblo`:
  - `Avenir LT Std` weights `300/400/500/600/800`
  - `Didot LT Std` italic `400` and normal `600`
  - `Space Grotesk` local WOFF2
- Homepage runtime no longer depends on remote WordPress font CSS/TTF/WOFF assets.

## Last Runtime Quality Gate Status (Measured 2026-07-13)
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass
- `npm run agent:smoke`: pass
- `npm run agent:check`: pass

## Known Architecture Risks
- Cloudflare + Supabase is the approved launch target, and Supabase foundation schema/RLS plus baseline seeds are applied. Form endpoint source, basic deployed row/audit creation, SMTP2GO notification delivery, and browser-key private-row denial are verified; final form proof still needs Turnstile and admin lead workflow verification.
- Supabase Auth shell, first-owner profile, and a separate active QA Editor exist. The configured local auth-browser check passes after the auth-listener repair, but production must be rerun after the stable-marker verifier deploys. A real invite delivered on 2026-07-13 then redirected to `http://localhost:3000`, proving the production Auth Site URL/Redirect URL configuration is incorrect or incomplete; custom SMTP ownership is still unverified. Auth/admin handoff remains `revalidation_required`.
- The June Storage proof covered private upload/readback/anonymous denial only. Local source now forces initial uploads private, binds promotion to the selected row's original path/version, performs a real private-to-public copy before publication, and resolves public Storage URLs, but this fixed path still needs a deployed write/public-readback proof.
- Source CRUD screens exist for Stone Library, Projects, Products, Articles, Leads, Settings, Media, and Audit. Their direct browser-key/API mutation proof does not establish editor UI reliability, multi-table atomicity, or public consumption.
- Cloudflare Pages repo-side clean URL configuration is in place, the `urblo` Pages project is deployed on `urblo.pages.dev`, production custom domains `urblo.com.au` and `www.urblo.com.au` are cut over, and deployed smoke passes on Pages plus both custom domains. Rollback DNS values are recorded in `docs/CLOUDFLARE_DEPLOYMENT.md`.
- Sample Request now routes through the Contact page sample-request mode and Pages Function source, and basic production persistence through the atomic request/item path is verified. SMTP2GO email and browser-key private-row denial are verified; Turnstile and admin workflow proof remain open.
- Public Projects, Stone Library listing/detail, Products, and Articles use migration-safe Published overlays with static fallback in local source. An explicit CMS-only cutover policy is still required because Draft/Archived migrated slugs currently retain their static fallback.
- Published site settings now have a validated, refreshable public-consumer path in local source, including one bounded retry after a static fallback result, pending deployed Settings save/readback proof. Resolved Published CMS detail entities apply safe runtime metadata and entity-specific JSON-LD through `src/components/PublicContentSeo.tsx`; logo/favicon media IDs, automatic CMS-only sitemap/route inventory generation, and first-response server/prerendered metadata remain outside this initial consumer.
- Admin editors remain large schema-shaped components. Projects no longer mounts all relation editors at once and now has record URLs, all-editor unsaved protection, child-save isolation, searchable media, and progressive task workspaces; media is capped rather than paginated and no admin-to-public preview exists.
- The Project schema still has no sector/category columns. Matching static Projects preserve those fallback-only taxonomy fields during Published overlay; brand-new CMS-only Projects use generic taxonomy until a migration and editor contract are approved.
- Project public detail does not yet consume every admin-managed material/map/hotspot relationship. Do not call Projects end-to-end complete until a saved relationship renders on the matching public route.
- Project and Stone Library content migration needs strict separation between confirmed facts and inferred MVP copy.
- Raw article newsletter HTML still contains external source URLs as migration source material, but runtime article rendering now rewrites known email proxy image URLs and campaign links before render.
- Long-term article quality still requires Supabase structured blocks, approved article image records, editorial review, and claim-safe copy approval.
- Public and admin route-level code splitting plus on-demand `publicContentClient` loading remove Supabase from the eager entry dependency path. Dynamic SDK/client initialization failure resolves to `null`, resets its initializer, and preserves static fallback. The public settings provider still requests the chunk shortly after first public render, so this is an entry/preload boundary rather than a claim of zero homepage Supabase traffic. The configured auth-browser build gate enforces an entry size of at most 500,000 bytes and rejects eager Supabase module preload; continue monitoring total route loads and shared chunks as editors are refactored.

## Brand and Design Linkage Rule
For UI/copy/IA changes, architecture and implementation decisions must be reviewed against:
- `docs/brand-baseline.md` for positioning, audience, voice, and claim safety.
- `docs/DESIGN.md` for visual rhythm, page composition, interaction tone, and responsive UI quality.

Brand and design linkage is advisory in execution flow, but required in task notes for high-impact user-facing changes.
