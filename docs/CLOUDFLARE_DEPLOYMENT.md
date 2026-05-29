# Urblo Cloudflare Pages Deployment Runbook

Last updated: 2026-05-29

## Purpose
This runbook captures the repo-side Cloudflare Pages deployment contract and the manual account steps required before production cutover.

It does not prove that the Cloudflare Pages project already exists. Account-level setup must still be completed in the Cloudflare dashboard.

Repo-side readiness is checked by `npm run agent:cloudflare-readiness`. This command verifies the build contract, SPA fallback, Pages Functions routing scope, headers, API handler files, environment placeholders, and this runbook without touching Cloudflare account state.

After a preview deployment exists, preview HTTP smoke is checked by `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`. This command verifies direct-refresh route shells, recursively discovered deployed JS/CSS assets and route chunks, the deployed admin config-required/profile-gate bundle contract, browser bundle service-role env boundaries, Cloudflare redirect behavior, and no-write API safe-failure behavior for `/api/enquiries` and `/api/sample-requests`.

Before running live form/admin/preview checks, `npm run agent:live-readiness` can be used to audit local inputs without printing secret values or mutating Supabase/Cloudflare. Use `--base-url <preview-origin>` and `--admin-email <first-admin-email>` for non-secret manual inputs, use `--form-writes-approved` only after Jay approves tagged live form QA writes, use `--first-admin-writes-approved` only after Jay approves creating/upserting the first profile or sending an invite, use `--admin-writes-approved` only after Jay approves tagged live admin QA writes, use `--turnstile-token-provided` only when a valid target-environment token will be passed to the live form verifier, and use `--strict` when missing or manual-gated live inputs should fail the command.

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
- long-cache headers for hashed assets and fonts.

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
- `SUPABASE_SERVICE_KEY`, `CF_TURNSTILE_SECRET_KEY`, and `RESEND_FROM_EMAIL` are compatibility aliases only; prefer the canonical names above for new Cloudflare configuration.
- If Resend variables are not configured, form rows are stored with `notification_status = 'not_required'`.

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
- Admin browser QA: browser-safe Supabase key plus `URBLO_ADMIN_EMAIL` and `URBLO_ADMIN_PASSWORD`.
- Unprofiled admin browser QA: browser-safe Supabase key plus `URBLO_UNPROFILED_EMAIL` and `URBLO_UNPROFILED_PASSWORD` for a valid Auth user with no active `admin_profiles` row.
- Admin CRUD live writes: browser-safe Supabase key plus either `URBLO_ADMIN_ACCESS_TOKEN` or `URBLO_ADMIN_EMAIL` and `URBLO_ADMIN_PASSWORD`.
- Email proof: `RESEND_API_KEY`, sender, and recipient variables.
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

This runner does not require secrets. It checks:
- direct refresh for public routes, unknown-route fallback, and `/admin/*` route shells;
- deployed `/assets/*` JavaScript/CSS availability, including recursively discovered route chunks referenced by deployed bundles;
- deployed admin bundle markers for the configuration-required state and `admin_profiles` profile gate, while rejecting browser-side service-role env access patterns;
- legacy product/article 301 redirects from `_redirects`;
- `/api/enquiries` and `/api/sample-requests` GET/OPTIONS/malformed JSON/invalid POST safe-failure behavior, including CORS preflight headers. Malformed and invalid POST checks are deliberately no-write and do not replace the credential-gated live form persistence command.

If `CLOUDFLARE_PAGES_PREVIEW_URL` or `PAGES_PREVIEW_URL` is set in a local untracked env file, or if `npm run agent:live-readiness -- --base-url <preview-origin>` is used, the readiness runner reports that the preview smoke input is available; the preview smoke runner still expects `--base-url` explicitly.

### 4. Validate Function Routing After API Work Exists
Current `/functions/api` endpoints:
- `/api/enquiries` and `/api/sample-requests` should invoke Pages Functions.
- Static routes like `/projects` and `/assets/...` should not invoke Functions.
- Cloudflare analytics should show static traffic and API traffic separately.
- Valid form tests require `SUPABASE_SERVICE_ROLE_KEY` in the Pages Function environment.
- Credential-gated live verification can be run with:
  - `npm run agent:forms-live -- --allow-writes` for direct handler verification against local service-role credentials after Jay approves tagged form QA writes.
  - `npm run agent:forms-live -- --allow-writes --require-browser-boundary` for final private-row proof after both service-role and browser-safe Supabase keys are configured and Jay approval is in place.
  - `npm run agent:forms-live -- --allow-writes --allow-email --require-email` for final email proof after Resend sender/recipient variables are configured and Jay approves tagged form QA writes. This asserts both valid live submissions store `notification_status = 'sent'`.
  - `npm run agent:forms-live -- --allow-writes --require-turnstile --turnstile-token <token>` for final Turnstile proof after the public Turnstile site key, server-side Turnstile secret, and a valid token are available for the target environment. The verifier refuses to start without `VITE_TURNSTILE_SITE_KEY`, then asserts both valid live submissions store `turnstile_success = true`.
  - `npm run agent:forms-live -- --allow-writes --base-url https://<preview>.pages.dev` for deployed endpoint verification, after the Pages environment has the service-role key and Jay approves tagged form QA writes against that target.
- The live verification command creates tagged test enquiry and sample-request rows, verifies their `admin_audit_events`, verifies invalid payloads create no rows, checks response-vs-stored notification status, and keeps the test rows until Jay approves cleanup. With `--require-browser-boundary`, it also proves those private lead rows are not anonymously readable through browser-key REST access.
- Admin route tests require a browser-safe Supabase key, a Supabase Auth user, and a matching active `admin_profiles` row.
- Before creating/upserting the first admin profile or sending an invitation, run `npm run agent:first-admin-bootstrap -- --verify-only --admin-email <first-admin-email>` with the service-role key to inspect the existing Auth/profile/seed state.
- First-admin profile/invite writes require Jay approval, `--allow-writes`, and a matching `--confirm-email`: `npm run agent:first-admin-bootstrap -- --allow-writes --admin-email <first-admin-email> --confirm-email <first-admin-email>`. Add `--invite` only when Jay explicitly approves sending the Supabase Auth invitation.
- Before browser admin QA, run `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` to verify the browser-safe key, service-role verification key, active admin profile, and baseline seed rows without mutating Supabase.
- Before live admin save/export QA, run `npm run agent:admin-crud-live` in plan-only mode, then run `npm run agent:admin-crud-live -- --allow-writes` only after a real owner/admin Supabase Auth session is available and Jay approves tagged QA writes. Use `--include-storage` when intentionally verifying private Storage object upload policy.
- Settings save tests require an active owner/admin profile because `site_settings` write RLS is owner/admin only. Admin profile save tests require existing Supabase Auth users and must verify owner-role changes are owner-protected.
- Media upload/save tests require an active owner/admin/editor profile because Storage object writes and `media_assets` mutations are admin/editor only.
- Leads workflow save tests require an active owner/admin profile because lead status, assignment, and internal notes are private operational fields.
- Stone Library save tests require an active owner/admin/editor profile because `stone_groups`, `stone_variants`, and `stone_finish_capabilities` mutations are admin/editor only.
- Projects save tests require an active owner/admin/editor profile because `projects`, `project_facts`, `project_materials`, `project_material_maps`, and `project_hotspots` mutations are admin/editor only.
- Products save tests require an active owner/admin/editor profile because `products`, `product_models`, `product_material_defaults`, and `product_specs` mutations are admin/editor only.
- Articles save tests require an active owner/admin/editor profile because `articles` and `article_blocks` mutations are admin/editor only.
- Audit visibility tests require an active owner/admin profile because `admin_audit_events` is private operational history.

### 5. Custom Domain Cutover
Before switching production DNS:
- Confirm current DNS records and owner.
- Lower TTL if needed.
- Confirm email DNS records are not touched.
- Confirm old WordPress media dependency plan, especially `/wp-content/uploads` URLs.
- Keep GitHub Pages or the old site available as rollback until the new site has passed production smoke tests.

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

After form secrets are configured and Jay approves tagged form QA writes, run:
- `npm run agent:forms-live -- --allow-writes`
- `npm run agent:forms-live -- --allow-writes --require-browser-boundary` after the browser-safe Supabase key is configured
- `npm run agent:forms-live -- --allow-writes --allow-email --require-email` after Resend sender/recipient variables are configured and the team is ready to send real verification emails
- `npm run agent:forms-live -- --allow-writes --require-turnstile --turnstile-token <token>` after the Turnstile site key/secret are configured and a valid target-environment token is available

For deployed Pages preview form verification after Jay approves tagged writes against that target, run:
- `npm run agent:forms-live -- --allow-writes --base-url https://<preview>.pages.dev`

For deployed Pages preview route/asset/redirect/API safe-failure smoke, run:
- `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`

After admin browser-safe keys and the first admin profile are configured, run:
- `npm run agent:first-admin-bootstrap -- --verify-only --admin-email <first-admin-email>`
- `npm run agent:first-admin-bootstrap -- --allow-writes --admin-email <first-admin-email> --confirm-email <first-admin-email>` only after Jay approves creating/upserting the first profile or sending an invite
- `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>`
- `npm run agent:admin-auth-browser -- --allow-login --strict`
- `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` after a valid unprofiled Auth test user is available

After a real owner/admin browser session is available and tagged QA writes are approved, run:
- `npm run agent:admin-crud-live -- --allow-writes`
- `npm run agent:admin-crud-live -- --allow-writes --include-storage` when verifying Storage upload policy too.

## Current Blocker
Repo-side Cloudflare Pages preparation can be committed now.

The following still require account access:
- creating the Cloudflare Pages project;
- adding environment variables;
- validating the `*.pages.dev` preview URL with `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`;
- adding the production custom domain;
- DNS cutover and rollback testing.

## Sources
- Cloudflare Pages redirects: https://developers.cloudflare.com/pages/configuration/redirects/
- Cloudflare Pages Functions routing: https://developers.cloudflare.com/pages/functions/routing/
- Cloudflare Pages headers: https://developers.cloudflare.com/pages/configuration/headers/
