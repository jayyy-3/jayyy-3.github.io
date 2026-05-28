# Urblo Web - Architecture and Contracts

Last updated: 2026-05-29

## System Boundary
- Current implementation: frontend-only React application shipped as static assets.
- Current implementation: Cloudflare Pages Function source now exists for `/api/enquiries` and `/api/sample-requests`.
- Current implementation: the public Contact page submits enquiries and sample requests to those API routes. The API source attempts server-side audit events after successful lead inserts, but live Supabase row creation still requires server-side Cloudflare environment variables.
- Current Supabase project: `Urblo` (`npkidywzwddbnfrnxlmo`, `ap-southeast-2`) has the foundation schema/RLS migrations, baseline seeds, admin settings/profile/helper hardening, and media Storage policies applied. Admin role helper RPC execution is revoked from browser roles in the exposed public schema, while RLS and Storage policies call private SECURITY DEFINER helpers from a non-exposed schema. The `/admin` auth shell source is implemented and config-gated, but live active-admin login still requires persistent browser-safe Supabase key configuration and a confirmed first admin profile. Settings/admin profiles, Media, Stone Library, Projects, Products, Articles, Leads, and Audit are the first source CRUD/workflow/review screens; admin CRUD/workflow save flows now call a shared audit writer after successful primary mutations, Stone Library finish image links have their own audit actions, and Media/Leads CSV exports are audit-gated, with live audit row creation still pending credentials.
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
- Route loading: public page components are lazy-loaded in `src/App.tsx` so the initial app shell does not ship every route at once.

## Launch Target Stack
- Public hosting: Cloudflare Pages.
- Backend/API: Cloudflare Pages Functions scoped to `/api/*`.
- Database: Supabase Postgres.
- Authentication: Supabase Auth for the admin area.
- Admin UI: Urblo-owned `/admin` interface, not raw Supabase Studio for customer operation.
- Public form protection: Cloudflare Turnstile.
- Transactional email: external email API such as Resend, wired from server-side API code only.
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
- Launch target deployment workflow:
  - Cloudflare Pages Git integration builds the repository.
  - Build command: `npm run build`
  - Output directory: `dist`
  - Production branch: `main` unless a later release process changes it.
  - Preview deployments are required for branch/PR review.
  - Cloudflare environment variables and secrets must not be committed.
  - Function routing must be restricted so only `/api/*` invokes Pages Functions.
  - Deployed preview route/asset/redirect/API safe-failure smoke is staged through `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`. The command requires no secrets, verifies direct-refresh route shells and static assets, checks Cloudflare-applied legacy redirects, and verifies `/api/enquiries` and `/api/sample-requests` reject unsafe methods/invalid payloads without creating rows.
  - Current Pages Function source lives under `functions/api/enquiries.js` and `functions/api/sample-requests.js`.
  - Browser-side admin Auth requires `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`; `VITE_SUPABASE_URL` may be configured, but defaults to the Urblo project URL if omitted.
  - Current admin CRUD source: `/admin/settings` reads and saves the default `site_settings` row and manages existing Supabase Auth users' admin profile rows for owner/admin roles. First admin bootstrap still happens outside the screen after Jay confirms the email.
  - Current admin media source: `/admin/media` reads and saves `media_assets` records, uploads Storage objects, and exports the currently loaded media manifest to CSV for active owner/admin/editor roles once browser-safe Supabase config and an active profile exist. CSV export must write an `admin_audit_events` row before downloading.
  - Current Stone Library admin source: `/admin/stone-library` reads and saves `stone_groups`, `stone_variants`, `stone_finish_capabilities`, and `stone_finish_images` records, with `media_assets` available for finish-image linking, for active owner/admin/editor roles once browser-safe Supabase config and an active profile exist.
  - Current Projects admin source: `/admin/projects` reads and saves `projects`, `project_facts`, `project_materials`, `project_material_maps`, and `project_hotspots` records for active owner/admin/editor roles once browser-safe Supabase config and an active profile exist.
  - Current Products admin source: `/admin/products` reads and saves `products`, `product_models`, `product_material_defaults`, and `product_specs` records for active owner/admin/editor roles once browser-safe Supabase config and an active profile exist.
  - Current Articles admin source: `/admin/articles` reads and saves `articles` and `article_blocks` records for active owner/admin/editor roles once browser-safe Supabase config and an active profile exist.
  - Current Leads admin source: `/admin/leads` reads `enquiries`, `sample_requests`, and `sample_request_items`; active owner/admin roles can update lead status, assignment, internal notes, and export the currently loaded lead queue to CSV once browser-safe Supabase config and an active profile exist. CSV export must write an `admin_audit_events` row before downloading.
  - Current Audit admin source: `/admin/audit` reads `admin_audit_events` for active owner/admin roles once browser-safe Supabase config and an active profile exist.
  - Current audit-write source: `src/lib/adminAudit.ts` inserts `admin_audit_events` after successful admin Settings, admin profile, Media, Stone Library, Projects, Products, Articles, and Leads mutations. Audit insert failures are appended to the success notice and do not roll back the already-saved primary change.
  - Admin credential/profile readiness verification is staged through `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>`. The command is read-only, requires a browser-safe Supabase key plus a service-role key, verifies the named active admin profile role, checks the baseline `site_settings` and `finish_definitions` seed rows, and uses the browser-safe key to verify the anonymous public/private REST boundary before browser login/save QA begins.
  - First-admin bootstrap is staged through `npm run agent:first-admin-bootstrap`. Default mode is no-write and makes no Supabase calls; `--verify-only` reads Auth/profile/seed state with a service-role key; `--allow-writes` requires a matching `--confirm-email` and Jay approval before inviting an Auth user or upserting the first `admin_profiles` row.
  - Admin live write verification is staged through `npm run agent:admin-crud-live`. Default mode is a no-write plan. With `--allow-writes`, the command requires a browser-safe Supabase key plus a real owner/admin Supabase Auth session via `URBLO_ADMIN_ACCESS_TOKEN` or `URBLO_ADMIN_EMAIL`/`URBLO_ADMIN_PASSWORD`; it then creates tagged draft/archived QA rows across Settings, Media, Stone Library including finish images, Projects, Products, Articles, Leads, and audit-export actions through normal browser-key RLS, then verifies tagged public-content QA rows and private lead QA rows are not anonymously visible through browser-key reads. It does not physically delete rows.
  - Form Functions require `SUPABASE_SERVICE_ROLE_KEY` server-side; `SUPABASE_SERVICE_KEY` remains a compatibility alias only. `SUPABASE_URL` may be configured, but defaults to the Urblo project URL if omitted.
  - Form Functions attempt `admin_audit_events` writes with `actor_user_id = null` after successful enquiry/sample request inserts. Audit write failure does not fail the visitor response.
  - Form notification source uses Resend only when server-side notification inputs exist. Mock checks verify configured notification paths start with `notification_status = pending`, call Resend, then patch the lead row to `sent` or `failed` without failing the already-stored visitor response.
  - Live form persistence verification is staged through `npm run agent:forms-live`. The command requires a server-side Supabase service-role key, verifies valid enquiry/sample request rows plus audit rows, verifies invalid enquiry/sample request payloads create no rows, verifies response-vs-stored notification status, and retains tagged test rows for auditability until Jay approves cleanup. When a browser-safe key is configured, the verifier checks that created private lead rows are not anonymously readable; `--require-browser-boundary` makes that browser-key boundary mandatory for final launch proof.
  - Optional server-side form secrets: `TURNSTILE_SECRET_KEY` or `CF_TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `LEAD_NOTIFICATION_FROM` or `RESEND_FROM_EMAIL`, `LEAD_NOTIFICATION_TO`, `ENQUIRY_NOTIFICATION_TO`, and `SAMPLE_REQUEST_NOTIFICATION_TO`.
- Vite base config: `vite.config.ts`
  - `base: '/'` for root-domain Cloudflare Pages clean URL routing.
- Cloudflare Pages static config:
  - `public/_redirects` provides SPA fallback with `/* /index.html 200`.
  - Cloudflare Pages should continue to use `_redirects`; the GitHub Pages `404.html` fallback is harmless but not required on Cloudflare.
  - `public/_routes.json` scopes future Pages Functions to `/api/*`.
  - `public/_headers` sets conservative launch headers, long-cache rules for hashed assets/fonts, and one-day cache for unversioned launch media under `/media/*`.
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
  - `scripts/check-harness.mjs` verifies required harness files and delegates doc path/task checks.
  - `scripts/check-doc-paths.mjs` rejects machine-specific paths and validates repo-relative path references in docs/task state.
- Content import dry run:
  - `npm run agent:content-import` => `node scripts/check-content-import-readiness.mjs`
  - Reads current static Stone Library JSON, Stone Library finish-image mappings, Projects data, Products data, Articles manifest, and referenced local media.
  - Produces Supabase-shaped import candidates with natural keys, forces content rows to `draft`, extracts legacy newsletter HTML into draft structured article blocks, and fails before any database write if local media is missing, slugs duplicate, or project/material references use unknown stone or finish keys.
  - Article block extraction currently creates draft `rich_text`, `image`, `cta`, and `project_spotlight` rows, links image blocks through `media_assets`, skips newsletter footer/contact/social artifacts, and flags claim-sensitive source copy for review instead of rewriting it.
  - Can write a local ignored review artifact with `npm run agent:content-import -- --out .tmp/content-import-preview.json`; the artifact remains a draft/no-write payload and must not be applied as final published content without approval.
  - `npm run agent:content-import:plan` writes both `.tmp/content-import-preview.json` and `.tmp/content-import-plan.md`, including import safety notes, preflight checks, table apply order, reverse rollback order, and verification expectations.
  - `npm run agent:content-import:preflight-sql` also writes `.tmp/content-import-preflight.sql`, a read-only Supabase target preflight SQL artifact for row-count, status, RLS, and policy inspection before any approved import/apply step.
  - `npm run agent:content-import:apply-sql` also writes `.tmp/content-import-apply.sql`, a guarded draft import SQL artifact. It aborts unless `urblo.import_approved=true` is explicitly set inside the transaction, imports as draft only, and contains no delete/publish operation.
- Public Supabase readiness:
  - `npm run agent:public-supabase-readiness` => `node scripts/check-public-supabase-readiness.mjs`
  - Verifies the content import dry run has no warnings/blockers, all import rows with status remain `draft`, article block imports stay structured rather than placeholder/newsletter-artifact payloads, public RLS policy source is published-only, anonymous grants are read-only, public runtime code is still static/file-backed, and Cloudflare routes only invoke Functions under `/api/*`.
  - This is a source/no-write verifier. It does not apply imported content, query Supabase, create a preview deployment, or replace live credential checks.
- Agent startup:
  - `npm run agent:init` => `bash scripts/agent-init.sh`
  - Prints repo path, git status, recent commits, runtime versions, read order, and common commands.
- Static smoke:
  - `npm run agent:smoke` => `bash scripts/agent-smoke.sh`
  - Serves `dist/` with Vite preview and checks the React shell for key clean routes, `public/articles/index.json`, and critical CTA contracts.
  - Builds first only when `dist/` is missing; runtime tasks should still run `npm run build` before smoke.
- Live form verification:
  - `npm run agent:forms-live` => `node scripts/check-forms-api-live.mjs`
  - Loads local environment values from `.env.local`, `.env`, `.dev.vars`, and the shell.
  - Requires `SUPABASE_SERVICE_ROLE_KEY` or the compatibility alias `SUPABASE_SERVICE_KEY`.
  - Default mode invokes the Pages Function handlers directly and suppresses Turnstile/email side effects unless `--turnstile-token` or `--allow-email` is supplied.
  - Optional HTTP mode uses `--base-url <origin>` to test a local or deployed Pages endpoint while still querying Supabase to verify durable rows.
  - Valid live submissions must return a final `notificationStatus` that matches the stored lead row's `notification_status`, so email patch failures do not hide behind a successful insert.
  - Optional `--require-browser-boundary` requires `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY` and verifies the created enquiry, sample request, and sample item rows are not anonymously readable through browser-key REST access.
  - The command is credential-gated and intentionally fails when service-role credentials are absent.
- Cloudflare Pages readiness:
  - `npm run agent:cloudflare-readiness` => `node scripts/check-cloudflare-pages-readiness.mjs`
  - Verifies the repo-side Pages contract: `npm run build`, Vite root base, SPA fallback, `/api/*` Function routing scope, launch headers, API handler files, environment placeholders, and deployment runbook coverage.
  - This command does not create a Cloudflare Pages project, set environment variables, validate a preview URL, change custom domains, or touch DNS.
- Cloudflare preview smoke:
  - `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev` => `node scripts/check-cloudflare-preview-smoke.mjs`
  - Verifies deployed direct-refresh shells for public/admin routes, deployed `/assets/*`, legacy `_redirects` behavior, and no-write API safe-failure behavior for `/api/enquiries` and `/api/sample-requests`.
  - Local Vite preview URLs are supported for route/asset script validation; Cloudflare-only redirect and Function checks are skipped on local hosts.
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
  - `--verify-only --admin-email <first-admin-email>` requires a service-role key and checks whether the Supabase Auth user, `admin_profiles` row, and baseline seed rows are ready.
  - `--allow-writes --admin-email <first-admin-email> --confirm-email <first-admin-email>` is the guarded live mode for creating/upserting the first `admin_profiles` row for an existing Auth user. Add `--invite` only when Jay explicitly approves sending the Supabase Auth invitation.
  - Existing active owner profiles block a new first-admin bootstrap unless `--allow-existing-owner` is intentionally supplied.
- Live input readiness:
  - `npm run agent:live-readiness` => `node scripts/check-live-readiness.mjs`
  - Loads local environment values from `.env.local`, `.env`, `.dev.vars`, and the shell.
  - Reports, without printing secret values, whether the inputs for `agent:forms-live`, deployed form verification, `agent:forms-live -- --require-browser-boundary`, `agent:admin-live-readiness`, `agent:admin-crud-live -- --allow-writes`, and `agent:cloudflare-preview-smoke` are present.
  - Accepts non-secret readiness overrides: `--base-url <origin>`, `--admin-email <email>`, and `--admin-writes-approved`. Secret keys and admin session credentials must still come from env files or the shell and must not be printed.
  - Default mode is report-only and exits 0 even when inputs are missing; `--strict` exits 1 when live inputs are missing or manually gated.
  - This command does not query Supabase, create users, run live writes, create Cloudflare projects, or touch DNS.
- Admin CRUD source coverage:
  - `npm run agent:admin-crud-coverage` => `node scripts/check-admin-crud-coverage.mjs`
  - Verifies `/admin` route registration, active module registration, `RequireAdmin` state coverage, browser-safe Supabase client wiring, launch-critical table references, role-gated mutation controls, publish/archive paths, structured Article block authoring guardrails, shared audit writer usage, and Media/Leads export audit gates.
  - This is a source-only verifier. It never mutates Supabase and does not replace live browser QA with a configured admin profile.
- Admin CRUD live verification:
  - `npm run agent:admin-crud-live` => `node scripts/check-admin-crud-live.mjs`
  - Default mode prints the live verification plan and performs no writes.
  - Live write mode uses `npm run agent:admin-crud-live -- --allow-writes` after browser-safe Supabase config and a real owner/admin session are available.
  - The command uses browser-key PostgREST/Auth requests, not a service-role key, so writes exercise RLS for the signed-in admin profile.
  - The command creates tagged QA rows, archives public-facing parents where possible, verifies those tagged public-content rows and private lead rows are not anonymously visible, and intentionally avoids physical deletes. Optional `--include-storage` uploads a tiny private `urblo-admin-media` object for Storage-policy verification.

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
| `/capabilities` | `CapabilitiesPage` | Provisional capability framework page for design translation, specification support, sourcing/fabrication, and delivery coordination. |
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
- Shared header links: `/projects`, `/stone-library`, `/our-story`, `/articles`, `/products`, `/contact`
- Homepage proof-section CTA: `/capabilities`
- Shared footer links: `/contact?intent=sample-request`, `/contact`
- Shared footer social links: Instagram and LinkedIn use external links with `target="_blank"` plus `rel="noopener noreferrer"`; Facebook and YouTube are hidden until real destinations are available.

### Gaps
- Current implementation gap: live Contact and Sample Request persistence still requires server-side Cloudflare environment variables and production endpoint verification.
- Launch target: Contact and Sample Request submit through Cloudflare Pages Functions into Supabase, with Turnstile protection, email notification, and admin-visible lead records.

## Metadata Contract
- `index.html` contains Urblo-owned default title, description, favicon, manifest, canonical, Open Graph, and Twitter metadata.
- `src/App.tsx` updates route-level title, description, canonical, Open Graph, and Twitter metadata through a small native document-head updater.
- Default share image asset: `public/og-default.png` at 1200 x 630. `public/og-default.svg` remains the editable source used to generate the PNG.
- Favicon assets: old-site-matched WordPress site icon PNGs in `public/favicon-32x32.png`, `public/favicon-192x192.png`, `public/favicon.png`, `public/apple-touch-icon.png`, and `public/mstile-270x270.png`.
- Web manifest: `public/site.webmanifest`, referencing PNG icon assets instead of the retired temporary SVG favicon.
- `react-helmet` was removed because it emitted React strict-mode lifecycle warnings under the current React 19 dev setup.

## Public Slug and Redirect Contract
- Canonical public slugs use lowercase kebab-case across Projects, Stone Library, Products, and Articles.
- Product records in `src/data/productData.ts` may retain `legacySlugs` for pre-normalization camelCase links; `ProductService.getBySlug()` resolves both canonical and legacy slugs, and `ProductDetailPage` redirects legacy matches to the canonical URL.
- Article records in `public/articles/index.json` may retain `sourceSlug` and `legacySlugs` while the legacy raw HTML folders remain title-case export folders. `ArticlePage` resolves those aliases, fetches from `sourceSlug`, and redirects legacy matches to the canonical URL.
- `public/_redirects` contains explicit Cloudflare 301 rules for the old product and article URLs before the SPA catch-all rule.
- Future `/admin` slug editing should enforce lowercase kebab-case and preserve old public URLs as redirect aliases before changing published content slugs.

## Current Static Media Contract
- P0 launch media lives under `public/media/launch` as a short-term controlled stopgap until Supabase Storage and Cloudflare media delivery are implemented.
- Shared site logo path: `public/media/launch/identity/urblo-logo.png`, referenced by `src/data/siteChrome.ts` and `src/data/homepage.ts`.
- Homepage hero poster path: `public/media/launch/home/hero-poster.jpg`.
- Homepage hero video path: `public/media/launch/home/urblo-hero.mp4`.
- Current homepage video asset is a web-ready H.264 1280x720, 30fps, no-audio, fast-start export from the user-provided `Urblo_Homepage.mp4`; the original HEVC source was not committed.
- Homepage hero uses `100svh` so the first viewport reads as a full-screen hero across desktop and mobile.
- Homepage hero video uses `preload="none"` and is constrained to desktop/tablet width through `media="(min-width: 768px)"`; mobile viewports keep the poster and do not select the MP4 source.
- The desktop MP4 was re-encoded from about 16MB to about 3MB for launch. Cloudflare Stream/R2 remains optional if the client later wants adaptive delivery, analytics, or non-repo video management.
- Route banners are local launch media referenced from `src/App.tsx` through the `ROUTE_BANNERS` map. `/capabilities` currently reuses the projects banner until dedicated capability imagery is approved.
- Contact image path: `public/media/launch/contact/project-contact.jpg`, referenced by `src/pages/ContactPage.tsx` and reused in homepage data where the same old WordPress image was previously used.
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
- Source of project listing and detail records: `src/data/projectData.ts`
- Listing page: `src/pages/Projects.tsx`
  - Reads `projectListingMeta` from the shared data module.
- Detail page: `src/pages/ProjectDetails.tsx`
  - Reads the same `projects` array and renders optional material-map fields when present.
  - Falls back to fact/detail plus image rendering for projects that have not been migrated into the material-map model.
- Project material map component: `src/components/projects/ProjectMaterialMap.tsx`
  - Desktop interaction: hover/focus/click changes the active material inspector.
  - Mobile interaction: tap/focus changes the active material inspector directly below the project image; no hover-only dependency.
  - Hotspot coordinates are stored as image-percentage positions in `src/data/projectData.ts`.
  - Hotspots are material-placement records keyed by `stoneGroupId` and `finishKey`; stone names, finish labels, finish preview images, and detail links resolve through `StoneLibraryService` where possible.
- Moon Gate MVP assets:
  - Local deployment assets live under `public/images/projects/moon-gate`.
  - `Moon Gate | Woolley Street` is the first project using `hero`, `lead`, `materialMap`, `materials`, `gallery`, and `cta` fields.
  - Featured material links point to `/stone-library/angola-black` and `/stone-library/new-grey`.
- Current contract risk:
  - Moon Gate includes MVP-inferred material/application notes that should be confirmed with the designer before final public launch.
  - Other projects still use the legacy-level data shape and should be migrated one by one.

### Article Data Contract
- Public data root: `public/articles`
- Index manifest: `public/articles/index.json`
- Detail content: `public/articles/<sourceSlug-or-slug>/content.html`
- Metadata type: `src/types/article.ts`
- Canonical article slugs are lowercase kebab-case. `sourceSlug` keeps the legacy content folder name when the source HTML still lives in a title-case export folder, and `legacySlugs` preserves old public URLs for redirect compatibility.
- Loading behavior:
  - list page fetches `${import.meta.env.BASE_URL}articles/index.json`
  - detail page fetches index then HTML content from `sourceSlug || slug`
- Cover images in the article manifest use local controlled paths under `public/media/launch/articles`.
- Detail HTML passes through `prepareArticleHtml` in `src/lib/articleMedia.ts` before DOMPurify sanitization.
- Runtime cleanup rewrites known email proxy image URLs to local article media, converts Google-hosted emoji images to text, removes Squarespace campaign wrappers where possible, and rewrites old product-PDF links to `/products`.
- Raw newsletter HTML remains committed only as migration source; do not treat it as the long-term authoring format.
- Launch target:
  - Articles move to Supabase-backed structured article blocks.
  - Raw newsletter HTML remains migration source material, not the long-term authoring format.
  - Approved block types are tracked in `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`.

### Supabase Launch Data Contract (Target)
- Site settings:
  - Global SEO, logo, favicon, social links, footer content, and default share image.
- Media:
  - Storage-backed or external media records with source, status, alt text, credit, usage notes, technical metadata, and public/private bucket state.
- Projects:
  - Project metadata, hero/gallery media, published status, SEO, evidence facts, material schedules, and hotspot records.
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
  - The optional `--apply-sql-out` flag writes a local ignored guarded draft import SQL artifact. It is not executed by the harness, aborts by default unless an explicit in-transaction approval setting is added, and keeps imported content in `draft`.
- Admin IA/access:
  - `/admin` route, login, unauthorized, loading, module, settings, and audit states are defined in `docs/ADMIN_IA_ACCESS.md`.
  - Current `/admin` source implements real Supabase Auth wiring, session/profile loading, login, unauthorized, dashboard, and protected module scaffolds.
  - The admin dashboard does not render private module content unless Supabase Auth returns a session and RLS allows the matching active `admin_profiles` row.
  - `/admin/settings` is the first settings/admin-access CRUD screen and uses the `site_settings` row plus `admin_profiles` rows with owner/admin save controls.
  - `/admin/media` is the first media CRUD screen and uses `media_assets` plus Supabase Storage buckets for upload-backed draft records, external records, metadata editing, audit-gated manifest export, and publish/archive guardrails.
  - `/admin/stone-library` is the first content CRUD screen and uses Stone Library group, variant, finish definition, finish capability, finish image, and linked media records.
  - `/admin/projects` is the next content CRUD screen and uses project records, facts, material schedule rows, material maps, and hotspots.
  - `/admin/products` is the next content CRUD screen and uses product family, model, material default, and spec records.
  - `/admin/articles` is the next content CRUD screen and uses article metadata plus structured article block records.
  - `/admin/leads` is the first lead workflow screen and uses enquiries, sample requests, sample request items, active admin profile options, Stone Library labels, and finish labels. Owner/admin CSV export is limited to the currently loaded queue and blocked if its audit event cannot be recorded.
  - `/admin/audit` is the first audit visibility screen and uses admin audit events plus active admin profile labels.
  - Admin profile management is non-destructive in source: it creates/updates profile rows for existing Supabase Auth users, preserves owner-role guardrails in UI, and is backed by the `admin_profile_owner_hardening` migration.
  - The admin CMS must not ship fake production auth; live verification still requires browser-safe Supabase key configuration and a confirmed first admin profile.
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
  - Turnstile fails closed when the Turnstile secret is configured; when absent, `turnstile_success` is stored as `null`.
  - Email notification is staged through optional Resend environment variables; when absent, rows use `notification_status = 'not_required'`.
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
  - Static JSON/HTML from `public/articles`
  - Contact form POST requests to `/api/enquiries` and `/api/sample-requests`
  - Admin routes use `@supabase/supabase-js` only when `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY` is configured.
- Contact side effects:
  - Contact page submit sends validated form payloads to Cloudflare Pages Functions.
  - Direct email and phone links remain available as manual contact channels.
- Launch target side effects:
  - Public read paths fetch published Supabase content either at build time or through a controlled API contract.
  - Admin paths require authenticated Supabase sessions.
  - Media uploads use Supabase Storage only from authenticated admin/editor sessions and create/update `media_assets` metadata through RLS.
  - Form submissions create durable Supabase records and email notifications.
  - Old WordPress media URLs must not remain first-viewport production dependencies.

## Homepage Contract
- Homepage structure is driven by dedicated internal config in `src/data/homepage.ts`, not the legacy tabbed `FeatureSection`.
- Homepage uses `HomepageLayout` with `HomepageHeader`/`HomepageFooter` proxy components that currently render the shared `SiteHeader`/`SiteFooter`.
- The previous homepage `Browse by stone type` showcase has been removed by request; homepage material discovery should be reintroduced only through a new Urblo-aligned section if the client wants that pathway.
- The previous homepage sustainability/tabbed feature section is currently not rendered by request. The proof metrics block now appears directly after the hero and uses the approved stone/city framing plus four proof metrics.
- Homepage typography is self-hosted from local static assets under `/public/fonts/urblo`:
  - `Avenir LT Std` weights `300/400/500/600/800`
  - `Didot LT Std` italic `400` and normal `600`
  - `Space Grotesk` local WOFF2
- Homepage runtime no longer depends on remote WordPress font CSS/TTF/WOFF assets.

## Last Runtime Quality Gate Status (Measured 2026-05-29)
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass
- `npm run agent:smoke`: pass

## Known Architecture Risks
- Cloudflare + Supabase is the approved launch target, and Supabase foundation schema/RLS plus baseline seeds are applied. Form endpoint source is implemented, but live row creation still needs server-side environment variables and Cloudflare endpoint verification.
- Supabase Auth shell source now exists, but live admin access still needs browser-safe key configuration, first admin email/profile creation, and authenticated browser verification.
- Supabase Storage policies and `/admin/media` source are implemented, but live upload verification still requires browser-safe Supabase key configuration and an active admin/editor profile. Admin profile source management and owner-role RLS hardening are implemented, but live team-management verification still requires first-admin access. Broader content CRUD is still needed before Supabase can replace static/file-backed content behavior.
- Cloudflare Pages repo-side clean URL configuration is in place, but dashboard project creation, preview validation, custom domain, DNS cutover, and rollback still require account access.
- Sample Request now routes through the Contact page sample-request mode and Pages Function source, but production persistence has not been verified without the server-side service-role environment variable.
- Public Projects, Stone Library, Products, and Articles remain file-backed until Supabase migration work is implemented.
- Admin shell exists, with Settings/admin profiles, Media, Stone Library, Projects, Products, Articles, Leads, and Audit as the first source CRUD/workflow/review screens. Stone Library source now includes finish image links to media records. Shared audit event writes are implemented in source for admin CRUD/workflow saves, but live row creation verification and live admin-user management are not complete yet.
- Project and Stone Library content migration needs strict separation between confirmed facts and inferred MVP copy.
- Raw article newsletter HTML still contains external source URLs as migration source material, but runtime article rendering now rewrites known email proxy image URLs and campaign links before render.
- Long-term article quality still requires Supabase structured blocks, approved article image records, editorial review, and claim-safe copy approval.
- Route-level code splitting has resolved the previous `>500kB` JavaScript chunk warning; continue monitoring build output as admin/CMS features are added.

## Brand and Design Linkage Rule
For UI/copy/IA changes, architecture and implementation decisions must be reviewed against:
- `docs/brand-baseline.md` for positioning, audience, voice, and claim safety.
- `docs/DESIGN.md` for visual rhythm, page composition, interaction tone, and responsive UI quality.

Brand and design linkage is advisory in execution flow, but required in task notes for high-impact user-facing changes.
