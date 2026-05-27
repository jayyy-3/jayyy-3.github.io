# Urblo Cloudflare Pages Deployment Runbook

Last updated: 2026-05-28

## Purpose
This runbook captures the repo-side Cloudflare Pages deployment contract and the manual account steps required before production cutover.

It does not prove that the Cloudflare Pages project already exists. Account-level setup must still be completed in the Cloudflare dashboard.

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
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `LEAD_NOTIFICATION_FROM`
- `ENQUIRY_NOTIFICATION_TO`
- `SAMPLE_REQUEST_NOTIFICATION_TO`

Rules:
- Public `VITE_` values may be exposed to browser code.
- The admin shell requires either `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY` before login can run.
- `SUPABASE_URL` is server-side for Pages Functions and may match `VITE_SUPABASE_URL`.
- Secret values must exist only in Cloudflare Pages project settings.
- Service-role and email API keys must never be committed or shipped to browser code.
- `TURNSTILE_SECRET_KEY` may also be named `CF_TURNSTILE_SECRET_KEY`.
- If Resend variables are not configured, form rows are stored with `notification_status = 'not_required'`.

### 3. Validate Preview Deployment
Before custom domain cutover, test the generated `*.pages.dev` URL:
- `/`
- `/projects`
- `/projects/moon-gate-woolley-street`
- `/products`
- `/products/primeBlock`
- `/stone-library`
- `/stone-library/alpine-white`
- `/articles`
- `/contact`
- `/admin`
- `/admin/login`

Each route should:
- return HTTP 200 on direct refresh;
- render the correct route, not the homepage fallback;
- load CSS and JavaScript assets from `/assets/...`;
- avoid console errors related to missing base paths.

### 4. Validate Function Routing After API Work Exists
Current `/functions/api` endpoints:
- `/api/enquiries` and `/api/sample-requests` should invoke Pages Functions.
- Static routes like `/projects` and `/assets/...` should not invoke Functions.
- Cloudflare analytics should show static traffic and API traffic separately.
- Valid form tests require `SUPABASE_SERVICE_ROLE_KEY` in the Pages Function environment.
- Admin route tests require a browser-safe Supabase key, a Supabase Auth user, and a matching active `admin_profiles` row.

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
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`
- `npm run agent:check`
- `git diff --check`

## Current Blocker
Repo-side Cloudflare Pages preparation can be committed now.

The following still require account access:
- creating the Cloudflare Pages project;
- adding environment variables;
- validating the `*.pages.dev` preview URL;
- adding the production custom domain;
- DNS cutover and rollback testing.

## Sources
- Cloudflare Pages redirects: https://developers.cloudflare.com/pages/configuration/redirects/
- Cloudflare Pages Functions routing: https://developers.cloudflare.com/pages/functions/routing/
- Cloudflare Pages headers: https://developers.cloudflare.com/pages/configuration/headers/
