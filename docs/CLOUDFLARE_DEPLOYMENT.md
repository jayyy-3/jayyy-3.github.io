# Urblo Cloudflare Pages Deployment Runbook

Last updated: 2026-07-13

## Purpose
This runbook captures the repo-side Cloudflare Pages deployment contract and the manual account steps required before production cutover.

It records the current Cloudflare Pages project and the account-level steps that remain before production cutover.

Current account checkpoint: `urblo.com.au` is readable in Hunter's Cloudflare account (`077afae2c6f4e77badadf21e49e58eb7`), the zone ID is `544d6bf99e48f4b36d7abb24f053ab17`, and the `urblo` Pages project exists with default domain `urblo.pages.dev`. GitHub source is connected to `jayyy-3/jayyy-3.github.io`. Admin repair PR `#3` is verified at runtime deployment `6d193af5-cf8e-4541-a1e2-c73164d1a290` / merge `46d46b4`; Harness PR `#5` deployed as `4aef2ba1-3e00-4e43-b5d6-1ac962fbf02d` / merge `cb0ec9a`. Its immutable URL passes authenticated admin and static-fallback fault injection, but the production custom domain served cached SPA HTML with HTTP 200 for three exact hashed JS/CSS URLs. The status-only smoke had falsely accepted those responses. MIME/body-aware smoke and new asset hashes are prepared; production custom-domain health remains open until that newer deployment passes. Contact/Sample Request persistence and SMTP2GO notification delivery remain verified. SMTP2GO CNAME records for return-path, DKIM, and tracking are DNS-only; Google MX/SPF/TXT records and `qa.urblo.com.au` were not changed.

Repo-side readiness is checked by `npm run agent:cloudflare-readiness`. This command verifies the build contract, SPA fallback, Pages Functions routing scope, headers, API handler files, environment placeholders, and this runbook without touching Cloudflare account state.

After a preview deployment exists, preview HTTP smoke is checked by `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`. This command verifies direct-refresh route shells, recursively discovered deployed JS/CSS assets and route chunks, exact asset MIME/body integrity without cache-busting, the deployed admin config-required/profile-gate bundle contract, browser bundle service-role env boundaries, Cloudflare redirect behavior, and no-write API safe-failure behavior for `/api/enquiries` and `/api/sample-requests`.

Before running live form/admin/preview checks, `npm run agent:live-readiness` can be used to audit local inputs without printing secret values or mutating Supabase/Cloudflare. Use `--base-url <preview-origin>` and `--admin-email <first-admin-email>` for non-secret manual inputs; replace those placeholders with a real `http`/`https` origin and a real email, because copied placeholders or malformed values stay missing in the report. Use `--form-writes-approved` only after Jay approves tagged live form QA writes, use `--first-admin-writes-approved` only after Jay approves creating/upserting the first profile or sending an invite, and use `--admin-writes-approved` only after Jay approves tagged live admin CRUD QA writes. For the separate Media Storage role proof, use `--media-role-migration-verified` only after the pending migration is applied/read back and `--media-role-writes-approved` only after Jay approves that exact tagged Editor/owner proof. Use `--content-import-approved`, `--content-merge-approved`, and `--content-public-cutover-approved` only after Jay approves those guarded content migration operations, use `--turnstile-token-provided` only when a valid target-environment token will be passed to the live form verifier, and use `--strict` when missing or manual-gated live inputs should fail the command. Readiness flags record state only; they do not apply SQL or run writes.

## Repo-Side Contract

### Build Settings
- Framework preset: None or Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Production branch: `main`.
- Node version: use the Cloudflare default compatible with the project, or pin to the current repo-supported Node LTS if the dashboard requires an explicit value.

### Routing
- The app now uses React Router `BrowserRouter` for clean URLs.
- Vite `base` is `/`, matching a root-domain Cloudflare Pages deployment.
- `public/_redirects` provides the SPA fallback:
  - `/* /index.html 200`
- `public/_routes.json` limits future Pages Functions invocation to:
  - `/api/*`
- Static site requests should remain static and should not invoke Functions after API endpoints are added.
- Current Pages Function routes:
  - `/api/enquiries`
  - `/api/sample-requests`

### Headers
`public/_headers` adds conservative launch-safe headers:
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

Do not add project-authored `Cache-Control` rules for `/assets/*`, `/fonts/*`, or `/media/*`. Cloudflare Pages already provides asset caching and revalidation; after a deployment, the former one-year immutable asset rule was observed serving a cached SPA fallback HTML response under three hashed JS/CSS URLs on the custom domain. The exact cache-population sequence was not proven. New asset hashes recover the active release, while the source readiness gate keeps those custom cache overrides removed.

No Content Security Policy is added yet because current content still depends on remote legacy media, mailto links, video sources, and article content. CSP should be added after media migration.

## Required Dashboard Steps

### 1. Create Pages Project
1. Go to Cloudflare Workers & Pages.
2. Create a Pages project from the GitHub repository.
3. Select `main` as the production branch.
4. Set build command to `npm run build`.
5. Set output directory to `dist`.
6. Save and run the first build.

### 2. Configure Environment Variables
Initial production variables needed for forms and later admin work:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_PUBLISHABLE_KEY` (preferred when Supabase provides a publishable key; otherwise use the anon key)
- `VITE_TURNSTILE_SITE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SERVICE_KEY` (optional compatibility alias; prefer `SUPABASE_SERVICE_ROLE_KEY`)
- `TURNSTILE_SECRET_KEY`
- `CF_TURNSTILE_SECRET_KEY` (optional compatibility alias; prefer `TURNSTILE_SECRET_KEY`)
- `SMTP2GO_API_KEY`
- `RESEND_API_KEY`
- `LEAD_NOTIFICATION_FROM`
- `RESEND_FROM_EMAIL` (optional compatibility alias; prefer `LEAD_NOTIFICATION_FROM`)
- `LEAD_NOTIFICATION_TO` (optional fallback if enquiry/sample-specific recipients are not set)
- `ENQUIRY_NOTIFICATION_TO`
- `SAMPLE_REQUEST_NOTIFICATION_TO`

Optional local-only helper variables for verification commands:
- `CLOUDFLARE_PAGES_PREVIEW_URL`
- `PAGES_PREVIEW_URL` (compatibility alias)

Rules:
- Public `VITE_` values may be exposed to browser code.
- The admin shell requires either `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY` before login can run.
- The public Contact form renders the Turnstile widget only when `VITE_TURNSTILE_SITE_KEY` is configured; the server still requires `TURNSTILE_SECRET_KEY` or `CF_TURNSTILE_SECRET_KEY` to verify tokens.
- `SUPABASE_URL` is server-side for Pages Functions and may match `VITE_SUPABASE_URL`.
- Secret values must exist only in Cloudflare Pages project settings.
- Service-role and email API keys must never be committed or shipped to browser code.
- `SMTP2GO_API_KEY` is the preferred Urblo email provider secret; `RESEND_API_KEY` remains a compatibility provider path.
- `SUPABASE_SERVICE_KEY`, `CF_TURNSTILE_SECRET_KEY`, and `RESEND_FROM_EMAIL` are compatibility aliases only; prefer the canonical names above for new Cloudflare configuration.
- If no email provider variables are configured, form rows are stored with `notification_status = 'not_required'`.

### 2a. Local Secret File for Live Verification
For local verification, put secrets in an untracked file such as `.env.local` or `.dev.vars`. Both are ignored by git. Do not paste service-role keys, admin passwords, email API keys, or Turnstile secrets into chat or committed docs.

Recommended local flow:
1. Copy `.env.example` to `.env.local`.
2. Fill only the variables needed for the next verification step.
3. Run `npm run agent:live-readiness` to confirm which inputs are present or still missing. The runner prints variable names and sources only, never secret values.
4. Run the specific gated verifier only after the required approval flag or command guard is satisfied.

Useful local env groups:
- Form persistence: `SUPABASE_SERVICE_ROLE_KEY`.
- Private-row browser boundary: `SUPABASE_SERVICE_ROLE_KEY` plus `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`.
- Admin read-only readiness: browser-safe Supabase key, service-role key, and first admin email.
- First-admin bootstrap verification: `npm run agent:first-admin-bootstrap -- --verify-only --admin-email <first-admin-email>`.
- First-admin bootstrap write path, only after approval: `npm run agent:first-admin-bootstrap -- --allow-writes --admin-email <first-admin-email> --confirm-email <first-admin-email>`.
- Admin read-only live readiness: `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>`.
- Admin browser QA: browser-safe Supabase key plus `URBLO_ADMIN_EMAIL` and `URBLO_ADMIN_PASSWORD`.
- Unprofiled admin browser QA: browser-safe Supabase key plus `URBLO_UNPROFILED_EMAIL` and `URBLO_UNPROFILED_PASSWORD` for a valid Auth user with no active `admin_profiles` row.
- Admin CRUD live writes: browser-safe Supabase key plus either `URBLO_ADMIN_ACCESS_TOKEN` or `URBLO_ADMIN_EMAIL` and `URBLO_ADMIN_PASSWORD`.
- Media Storage role boundary: browser-safe Supabase key plus distinct active accounts in `URBLO_EDITOR_EMAIL`/`URBLO_EDITOR_PASSWORD` and `URBLO_ADMIN_EMAIL`/`URBLO_ADMIN_PASSWORD`. After the migration is applied/read back and Jay approves that exact tagged proof, run `npm run agent:admin-media-role-boundary-live -- --allow-writes --strict`; never place these QA passwords in Cloudflare dashboard variables.
- CMS invite flow: Cloudflare Pages Functions use `SUPABASE_SERVICE_ROLE_KEY` server-side at `/api/admin/invite-user`; signed-in Website owner/CMS manager sessions call it from `/admin/settings`, and the service key must never appear in browser source.
- `URBLO_FIRST_ADMIN_EMAIL` is only for bootstrap/readiness checks; live browser login and live admin-write verification use `URBLO_ADMIN_EMAIL` or an explicit admin access token.
- Email proof: `SMTP2GO_API_KEY`, sender, and recipient variables; `RESEND_API_KEY` is still supported as a compatibility provider.
- Turnstile proof: `VITE_TURNSTILE_SITE_KEY`, server-side Turnstile secret, and a valid target-environment token passed to the verifier.

### 3. Validate Preview Deployment
Before custom domain cutover, test the generated `*.pages.dev` URL:
- `/`
- `/projects`
- `/projects/moon-gate-woolley-street`
- `/products`
- `/products/prime-block`
- `/stone-library`
- `/stone-library/alpine-white`
- `/articles`
- `/articles/modular-mastery-how-primeblock-core-transformed-aitken-college`
- `/capabilities`
- `/contact`
- `/admin`
- `/admin/login`
- `/admin/leads`
- `/admin/media`
- `/admin/settings`
- `/admin/stone-library`
- `/admin/projects`
- `/admin/products`
- `/admin/articles`
- `/admin/audit`

Each route should:
- return HTTP 200 on direct refresh;
- render the correct route, not the homepage fallback;
- load CSS and JavaScript assets from `/assets/...`;
- avoid console errors related to missing base paths.

Legacy URLs such as `/products/primeBlock` and `/articles/Modular-Mastery-How-PrimeBlock-Core-Transformed-Aitken-College` should be validated as redirect checks, not as canonical direct-refresh route checks.

Run the deployed preview smoke runner:
- `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`
- For production promotion/readback, bind the custom origin to the exact immutable deployment: `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au --reference-url https://<deployment-id-prefix>.urblo.pages.dev`.

The `--base-url` value must be a real `http`/`https` origin with no path, query, or hash. Copied placeholders are rejected before any route, asset, redirect, or Function request runs.

This runner does not require secrets. It checks:
- direct refresh for public routes, unknown-route fallback, and `/admin/*` route shells;
- deployed `/assets/*` JavaScript/CSS availability, including recursively discovered route chunks referenced by deployed bundles, with real JavaScript/CSS MIME types, explicit rejection of an SPA HTML shell returned with HTTP 200, and denial of the removed year-long immutable custom cache policy;
- deployed admin bundle markers for the configuration-required state and `admin_profiles` profile gate, while rejecting browser-side service-role env access patterns;
- legacy product/article and GSC-recovered SEO 301 redirects from `_redirects`;
- `/api/enquiries` and `/api/sample-requests` GET/OPTIONS/malformed JSON/invalid POST safe-failure behavior, including CORS preflight headers. Malformed and invalid POST checks are deliberately no-write and do not replace the credential-gated live form persistence command.

If `CLOUDFLARE_PAGES_PREVIEW_URL` or `PAGES_PREVIEW_URL` is set in a local untracked env file, or if `npm run agent:live-readiness -- --base-url <preview-origin>` is used with a real `http`/`https` origin, the readiness runner reports that the preview smoke input is available; copied placeholders and URLs with path/query/hash remain missing. The preview smoke runner still expects `--base-url` explicitly.

### 4. Validate Function Routing After API Work Exists
Current `/functions/api` endpoints:
- `/api/enquiries` and `/api/sample-requests` should invoke Pages Functions.
- Static routes like `/projects` and `/assets/...` should not invoke Functions.
- Cloudflare analytics should show static traffic and API traffic separately.
- Valid form tests require `SUPABASE_SERVICE_ROLE_KEY` in the Pages Function environment.
- Basic deployed form persistence is already verified on `https://urblo.pages.dev` for one tagged valid enquiry and one tagged valid sample request, including the sample item and source-route audit rows; invalid tagged payloads created no rows or audit events. The QA rows are retained for auditability until Jay approves cleanup.
- Credential-gated live verification can be run with:
  - `npm run agent:forms-live -- --allow-writes` for direct handler verification against local service-role credentials after Jay approves tagged form QA writes.
  - Browser-key private-row proof is verified on production for the current Supabase publishable-key path: approved tagged Contact/Sample Request submissions against `https://urblo.com.au` created private lead rows, and anonymous REST reads through the deployed publishable key returned HTTP 401 for `enquiries`, `sample_requests`, and `sample_request_items`.
  - SMTP2GO email proof is verified on production for the current provider path: approved tagged Contact/Sample Request submissions against `https://urblo.com.au` returned `notificationStatus = sent`, and Supabase readback confirmed both stored lead rows are `sent`.
  - `npm run agent:forms-live -- --allow-writes --require-turnstile --turnstile-token <token>` for final Turnstile proof after the public Turnstile site key, server-side Turnstile secret, and a valid token are available for the target environment. The verifier refuses to start without `VITE_TURNSTILE_SITE_KEY`, then asserts both valid live submissions store `turnstile_success = true`.
  - `npm run agent:forms-live -- --allow-writes --base-url https://<preview>.pages.dev` for deployed endpoint verification, after the Pages environment has the service-role key and Jay approves tagged form QA writes against that target. The base URL must be an origin only; placeholders or URLs with path/query/hash fail before any live writes.
- The live verification command creates tagged test enquiry and sample-request rows, verifies their `admin_audit_events`, verifies invalid payloads create no rows, checks response-vs-stored notification status, and keeps the test rows until Jay approves cleanup. With `--require-browser-boundary`, it also proves those private lead rows are not anonymously readable through browser-key REST access.
- Admin route tests require a browser-safe Supabase key, a Supabase Auth user, and a matching active `admin_profiles` row.
- First-admin data-layer bootstrap is complete for `info@urblo.com.au`: the confirmed Auth user has one active `owner` profile, and `admin_audit_events.id = 8` records `admin_profile.bootstrap`.
- Before browser admin QA, run `npm run agent:admin-live-readiness -- --admin-email info@urblo.com.au` with local verification credentials when intentionally rechecking the browser-safe key, service-role verification key, active admin profile, and baseline seed rows without mutating Supabase.
- Before live admin save/export QA, run `npm run agent:admin-crud-live` in plan-only mode, then run `npm run agent:admin-crud-live -- --allow-writes` only after a real owner/admin Supabase Auth session is available and Jay approves tagged QA writes. Use `--include-storage` only for owner/admin private-upload/readback plus anonymous denial; it does not prove the Editor public-bucket boundary.
- Before claiming Media role enforcement complete, apply/read back `20260713065628_media_public_bucket_role_hardening.sql`, obtain fresh approval for tagged Storage writes, then run `npm run agent:admin-media-role-boundary-live -- --allow-writes --strict` with distinct active Editor and owner/admin credentials.
- Settings save tests require an active owner/admin profile because `site_settings` write RLS is owner/admin only. Admin profile save tests require existing Supabase Auth users and must verify owner-role changes are owner-protected.
- Media draft upload/save tests require an active owner/admin/editor profile. Public-bucket insert/update must be owner/admin only after the pending role-hardening migration is applied; the dedicated role verifier proves this boundary through normal browser-key RLS.
- Leads workflow save tests require an active owner/admin profile because lead status, assignment, and internal notes are private operational fields.
- Stone Library save tests require an active owner/admin/editor profile because `stone_groups`, `stone_variants`, and `stone_finish_capabilities` mutations are admin/editor only.
- Projects save tests require an active owner/admin/editor profile because `projects`, `project_facts`, `project_materials`, `project_material_maps`, and `project_hotspots` mutations are admin/editor only.
- Products save tests require an active owner/admin/editor profile because `products`, `product_models`, `product_material_defaults`, and `product_specs` mutations are admin/editor only.
- Articles save tests require an active owner/admin/editor profile because `articles` and `article_blocks` mutations are admin/editor only.
- Audit visibility tests require an active owner/admin profile because `admin_audit_events` is private operational history.

### 5. Custom Domain Cutover
Current custom-domain state:
- `urblo.com.au` is attached to the `urblo` Pages project.
- `www.urblo.com.au` is attached to the `urblo` Pages project.
- Both custom domains are active in the Cloudflare Pages domain API.
- Apex website DNS record is now `CNAME urblo.com.au -> urblo.pages.dev`, proxied, TTL auto.
- `www` website DNS record is now `CNAME www.urblo.com.au -> urblo.pages.dev`, proxied, TTL auto.
- Google Workspace MX records, apex TXT/SPF/verification records, NS records, and `qa.urblo.com.au` were not changed.
- The former status-only smoke passes for `urblo.com.au` and `www.urblo.com.au` are invalidated by the 2026-07-13 cached-HTML asset incident. Both origins require a fresh MIME-aware pass bound to the repair deployment's immutable URL before custom-domain health is restored.
- SMTP2GO DNS-only CNAME records are present:
  - `em905485.urblo.com.au -> return.smtp2go.net`, record id `999d935aa8b2323d0d1b613aa5bcc276`.
  - `s905485._domainkey.urblo.com.au -> dkim.smtp2go.net`, record id `15b74562f23fb255774c77ad46c7d473`.
  - `link.urblo.com.au -> track.smtp2go.net`, record id `86625766121803fd24d38c7e84c785e5`.

Original website DNS backup for rollback:
- Apex record id `9bc69b26cbeef071e02f4a1bd5f715e7` was `A urblo.com.au -> 159.198.65.164`, proxied, TTL auto.
- `www` record id `4ce8ffa7ee003ae79acac67096ca33ab` was `CNAME www.urblo.com.au -> urblo.com.au`, proxied, TTL auto.
- `qa.urblo.com.au` remains `A qa.urblo.com.au -> 159.198.65.164`, proxied, TTL auto, and can be used as an old-site reference while it remains unchanged.

Rollback DNS action if the launch must be reversed:
- Overwrite apex record `9bc69b26cbeef071e02f4a1bd5f715e7` back to `type = A`, `name = urblo.com.au`, `content = 159.198.65.164`, `proxied = true`, `ttl = 1`.
- Overwrite `www` record `4ce8ffa7ee003ae79acac67096ca33ab` back to `type = CNAME`, `name = www.urblo.com.au`, `content = urblo.com.au`, `proxied = true`, `ttl = 1`.
- Do not touch MX, TXT, SPF, NS, or `qa` records during rollback.

### 6. Rollback
Rollback options:
- In Cloudflare Pages, roll back to the previous successful deployment.
- If custom domain cutover fails, restore the prior DNS target.
- If forms fail after launch, temporarily route CTAs back to direct email while preserving visible contact channels.

## Verification Commands
Run from the repo root before deploying:
- `npm run agent:cloudflare-readiness`
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`
- `npm run agent:check`
- `git diff --check`

SMTP2GO notification proof has been run for the current provider path:
- Approved tagged HTTP submissions against `https://urblo.com.au` returned `notificationStatus = sent`.
- Supabase connector readback confirmed `enquiries.id = 3`, `sample_requests.id = 2`, and `sample_request_items.id = 2`, with both stored lead rows at `notification_status = sent`.

After remaining form secrets are configured and Jay approves tagged form QA writes, run:
- `npm run agent:forms-live -- --allow-writes`
- Re-run `npm run agent:forms-live -- --allow-writes --require-browser-boundary` only when intentionally rechecking private-row denial with local service-role verification credentials available.
- Re-run `npm run agent:forms-live -- --allow-writes --allow-email --require-email` only when intentionally rechecking real notification delivery with local service-role verification credentials available.
- `npm run agent:forms-live -- --allow-writes --require-turnstile --turnstile-token <token>` after the Turnstile site key/secret are configured and a valid target-environment token is available

For deployed Pages preview form verification after Jay approves tagged writes against that target, run:
- `npm run agent:forms-live -- --allow-writes --base-url https://<preview>.pages.dev`

For deployed Pages preview route/asset/redirect/API safe-failure smoke, run:
- `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`

For active-admin browser QA after the first admin profile is configured, run:
- `npm run agent:admin-live-readiness -- --admin-email info@urblo.com.au` when intentionally rechecking the read-only readiness proof with local verification credentials
- `npm run agent:admin-auth-browser -- --allow-login --strict`
- `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` after a valid unprofiled Auth test user is available; this also probes all launch-critical admin routes and keeps them unauthorized without private module content

Active-admin browser QA has been run for the current production path:
- `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au` passed on 2026-06-04 for `info@urblo.com.au`, covering all 9 authenticated admin route shells plus Sign out with no content writes.
- A 2026-07-13 configured local current-source run passes all 9 authenticated routes, Sign out, and a protected-route revisit. Production must be rerun after the stable-marker/isolated-build verifier follow-up is deployed.

After a real owner/admin browser session is available and tagged QA writes are approved, run:
- `npm run agent:admin-crud-live -- --allow-writes`
- `npm run agent:admin-crud-live -- --allow-writes --include-storage` when verifying owner/admin private Storage upload/readback and anonymous denial.

After the Media role migration is applied/read back, a distinct active Editor account exists, and Jay separately approves the tagged role proof, run:
- `npm run agent:admin-media-role-boundary-live -- --allow-writes --strict`

Admin CRUD/live lead workflow QA has been run for the current non-Storage path:
- `supabase/migrations/20260603142359_project_media_blocks.sql` is applied and verified in production.
- `npm run agent:admin-crud-live -- --allow-writes` passed on 2026-06-04 for marker `admin-live-1780496690772-b8a47213`, recording 48 audit rows and verifying tagged archived public-content/private lead rows are not anonymously visible.
- `npm run agent:admin-crud-live -- --allow-writes --include-storage` passed on 2026-06-04 for marker `admin-live-1780497462544-23b1d5e3`, verifying private Storage upload/readback and anonymous private/public object denial.
- The failed pre-migration marker `admin-live-1780496442071-f27c2b7d` left partial public-facing QA rows; those rows were archived non-destructively and audit rows `73`-`77` recorded the cleanup.

## Current Account State
Repo-side Cloudflare Pages preparation is complete, account read access is verified for the production zone, and the Hunter-account Pages project `urblo` now exists with a successful production deployment.

Current project:
- Account: Hunter (`077afae2c6f4e77badadf21e49e58eb7`)
- Project: `urblo`
- Project ID: `3c4c5af3-a2a8-4058-bc0e-0ee6e8cfcaca`
- Default domain: `urblo.pages.dev`
- Production branch: `main`
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `/`
- Latest verified admin-repair runtime deployment: `6d193af5-cf8e-4541-a1e2-c73164d1a290`
- Latest verified admin-repair runtime URL: `https://6d193af5.urblo.pages.dev`
- Production URL: `https://urblo.pages.dev`
- Deployment status: `success`
- Runtime deployment commit: `46d46b4`

The next account-level action is deciding whether Turnstile proof is required before launch; first Supabase Auth user/profile bootstrap, active-admin browser QA, project media block migration, admin CRUD/live lead workflow QA, Storage upload proof, draft content import, and public published-read cutover are complete.

Still pending after preview validation:
- Cloudflare Pages production already has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; preview environment variables remain empty;
- adding Turnstile variables if bot-protection proof is required before launch;
- running the remaining Turnstile live form proof after those inputs exist;
- running tagged admin workflow/content QA only after explicit approval and a real owner/admin session.

## Sources
- Cloudflare Pages redirects: https://developers.cloudflare.com/pages/configuration/redirects/
- Cloudflare Pages Functions routing: https://developers.cloudflare.com/pages/functions/routing/
- Cloudflare Pages headers: https://developers.cloudflare.com/pages/configuration/headers/
