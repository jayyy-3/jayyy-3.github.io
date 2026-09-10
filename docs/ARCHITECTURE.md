# Urblo Web - Architecture and Contracts


## QR material association contract

The applied/read-back additive migration `20260909054816_image_qr_material_selection.sql` adds nullable `image_qr_resources.material_selection` JSON with exactly `stoneGroupId`, `stoneVariantId`, and `finishKey`. Existing server-only grants/RLS stay intact. Null uses a deterministic labelled default; an explicit selection survives resource renaming, replacement and Hide/Restore. Protected `GET /api/admin/image-qr?materials=1` returns Published-or-static material choices with a finish-specific image. `POST` action `assign-material` validates the combination and uses `expectedUpdatedAt` to reject stale saves; successful changes record `image_qr.assign_material`, with an explicit warning if the post-save audit fails. No draft CMS material is exposed. Public serialization excludes internal IDs, actors and history. `data/clean/stone_finish_images.json` is the shared image-capability catalog; browser assets and import payloads retain their previous paths and secondary-image order. The migration was applied on 2026-09-09 with all 32 existing rows still null and server-only privileges unchanged. The connected Preview and approved Zen Grey/Honed UI save/reload/public readback passed on 2026-09-09 with audit event 358.

Last updated: 2026-08-02

## System Boundary
- Current implementation: React application shipped as static assets plus Cloudflare Pages Functions under `/api/*` and stable public image resolution under `/image/*`.
- Current implementation: Cloudflare Pages Function source now exists for `/api/enquiries`, `/api/sample-requests`, the protected CMS invite endpoint `/api/admin/invite-user`, the protected Projects aggregate endpoint `/api/admin/projects`, the protected Image QR endpoint `/api/admin/image-qr`, the public QR-data endpoint `/api/image-qr/:slug`, and the material-page target `/image/:slug`.
- Current implementation: the public Contact page submits enquiries and sample requests to those API routes. The Capability Statement download form on `/capabilities` also submits an email-only lead to `/api/enquiries` with `project_type = Capability statement download` before revealing the PDF download link. The API source attempts server-side audit events after successful lead inserts, and Sample Request uses a service-role-only Supabase RPC so the request row and first item row are created atomically. Basic deployed Contact/Sample Request persistence is verified on `https://urblo.pages.dev`; the Capability-specific download capture path still needs separate live route verification.
- Current Supabase project: `Urblo` (`npkidywzwddbnfrnxlmo`, `ap-southeast-2`) has the foundation schema/RLS migrations, baseline seeds, admin settings/profile/helper hardening, admin profile email uniqueness, media Storage role hardening, and Projects aggregate expand A, minimum-disclosure C, and write-lockdown B applied/read back. B is `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql`: authenticated users retain reads but no direct writes to the six Project tables/sequences; service-role writes remain behind the protected aggregate endpoint, RLS remains enabled, and public children require approved Published parents. The aggregate runtime is deployed at merge `25c05ebb` / immutable Cloudflare deployment `877d13c4-1e28-45d7-a62a-afdd3b0e0dda`. Production deployment-bound smoke and all nine authenticated routes pass. The production editor handoff remains `revalidation_required` until Jay's fool test and the broader golden workflows are complete.
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
- Backend/API: Cloudflare Pages Functions scoped to `/api/*` plus `/image/*` for stable QR image targets.
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
- Local pre-push gate: `npm run gate` (`scripts/container-gate.sh`) checks whitespace, then runs the deduplicated verification graph in clean Node 20. Build includes TypeScript; the graph runs each selected check once per configuration. Ignored dotenv/local binding files are excluded from the image. CI uses Node 22 for pinned Wrangler and isolated Functions verification. Delivery/category rules live in `docs/OPERATING_PROTOCOL.md` and `docs/agent/verification.md`.
- Launch target deployment workflow:
  - Cloudflare Pages Git integration builds the repository.
  - Build command: `npm run build`
  - Output directory: `dist`
  - Production branch: `main` unless a later release process changes it.
  - Preview deployments are required for branch/PR review.
  - Cloudflare environment variables and secrets must not be committed.
  - Function routing must be restricted so only `/api/*` and `/image/*` invoke Pages Functions.
  - Deployed preview route/asset/redirect/API safe-failure smoke is staged through `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`. The command requires no secrets, rejects placeholder or non-origin base URLs before any network checks, rejects redirects on every direct-refresh route, requires every SPA route to reference the same entry assets as `/`, recursively discovers same-origin query-free `/assets/*` JS/CSS paths, requires JavaScript/CSS MIME types, and rejects an SPA HTML shell even when an asset URL returns HTTP 200. Absolute, protocol-relative, cross-origin, query-bearing, fragment-bearing, or namespace-escaping asset references fail instead of being rewritten to a different URL for verification. The gate also checks that the deployed admin bundle still contains the configuration-required/profile-gate contract without browser service-role env access patterns, checks Cloudflare-applied legacy redirects, verifies `/api/enquiries` and `/api/sample-requests` reject unsafe methods/malformed JSON/invalid payloads without creating rows, and verifies unauthenticated GET and POST requests to `/api/admin/projects` return structured `401` responses before database work while OPTIONS advertises GET/POST plus authorization/content-type. Production apex, `www`, and the moving `urblo.pages.dev` alias are matched after FQDN trailing-dot normalization and require an independent exact `--reference-url https://<8-hex-deployment>.urblo.pages.dev`; the full asset graph must match that immutable release byte-for-byte and by MIME. A removed long-lived cache header remains visible as a warning only after that comparison, and otherwise fails.
  - Current verified runtime: PR `#6` merge `a2a7ae5` is deployed as `c7a910df-6dd3-440b-8971-a6120353ed19`. Its immutable URL and both production custom domains pass the bound MIME/body-aware smoke. Four unchanged apex assets retain stale long-lived response-header warnings after exact immutable comparison; the latest `www` readback was warning-free.
- Current Pages Function source lives under `functions/api/enquiries.js`, `functions/api/sample-requests.js`, `functions/api/admin/invite-user.js`, `functions/api/admin/projects.js`, `functions/api/admin/image-qr.js`, and `functions/image/[slug].js`; shared protected Projects and Image QR behavior lives in `functions/_lib/`.
- Browser-side admin Auth requires `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`; `VITE_SUPABASE_URL` may be configured, but defaults to the Urblo project URL if omitted.
- Browser-side auth-state callbacks must return synchronously. Any `getSession`, `getUser`, or profile query triggered by `onAuthStateChange` runs in a deferred task so it cannot deadlock the Supabase client lock.
- Invite and recovery callbacks land on `/admin/account-setup?mode=invite|recovery`. The page captures the implicit token pair before client creation, clears callback credentials from the address bar, keeps URL-session detection disabled on the shared browser client, creates a non-persistent/no-refresh/no-URL-detection isolated Auth client, explicitly installs that pair, verifies its user with the Auth server, and performs the password update through that same isolated client. Opening a password link cannot replace an unrelated shared admin session, and a login change in another tab cannot rebind the callback to another account. After a successful update the user returns to explicit password sign-in. Expired/reused links fail closed; PKCE callbacks remain intentionally unsupported.
- `/api/admin/invite-user` derives its callback from the request origin instead of accepting an arbitrary browser redirect, uses a non-persistent server Auth client, and deletes the newly invited Auth user if the matching `admin_profiles` insert fails.
- Supabase Auth invite/recovery mail is operationally separate from Contact/Sample Request SMTP2GO. A 2026-07-13 production invite reached the approved QA recipient but fell back to `http://localhost:3000`; after Jay's separate approval, the Auth Site URL was corrected to `https://urblo.com.au` and the exact invite/recovery account-setup Redirect URLs were added and read back on 2026-07-14. A repeated invite/recovery golden workflow and Auth SMTP ownership verification are still required before either flow can be called verified.
- Browser-side public form Turnstile uses `VITE_TURNSTILE_SITE_KEY`; without it, the Contact page keeps the submit flow usable and omits the widget. Server-side token verification still requires `TURNSTILE_SECRET_KEY` or `CF_TURNSTILE_SECRET_KEY`.
  - Current admin CRUD source: `/admin/settings` reads and saves the default `site_settings` row, validates/normalizes Published public fields through the same contract as the public consumer, invites new CMS users through `/api/admin/invite-user`, and manages existing Supabase Auth users' admin profile rows for Website owner / CMS manager roles, including clear form validation for duplicate Auth user IDs and duplicate profile emails before save. The invite endpoint verifies the signed-in admin session with a bearer token, requires an active Website owner/CMS manager profile, keeps the Supabase service key server-side, sends the Supabase Auth invite, creates the `admin_profiles` row, and records `admin_profile.invite` in `admin_audit_events`. First admin bootstrap is complete for `info@urblo.com.au`; future team management happens through `/admin/settings` after the latest Settings UX is deployed and live invite QA passes.
  - Current admin media source: `/admin/media` reads up to 500 current `media_assets` records, keeps new External media state stable, uploads every new file to `urblo-admin-media`, and exports the loaded manifest to CSV for active Website owner / CMS manager / editor roles. A metadata-insert failure is read back before any cleanup; Website owners/CMS managers can best-effort remove a confirmed unreferenced private orphan, while Editors receive an explicit private-orphan warning because current delete RLS blocks their cleanup. Website owners/CMS managers can publish an existing private upload through a create-only copy into `urblo-public-media`; the operation is bound to the selected row's original private path and `updated_at`, the destination is never overwritten, ambiguous database results are read back, and rollback/cleanup first checks for other `media_assets` references. Storage and database writes are not atomic, so unknown/reference/readback/rollback failures retain the object and report its path for manual repair. Editors cannot run private promotion because current Storage RLS does not give them the delete capability required for safe rollback. Applied production migration `20260714050750_media_public_bucket_role_hardening.sql` also prevents Editors from bypassing this UI through a direct public-bucket insert/update. CSV export must write a change-history row before downloading.
  - Image QR source: `/admin/image-qr` prepares selected JPG/PNG/WebP/AVIF images in the browser with a quality-first 2560px longest-edge/WebP-90 profile, keeps the smaller original when re-encoding would grow it, uploads temporary files privately under the signed-in user's path, then calls `/api/admin/image-qr`. The protected Function revalidates session/profile, path ownership, byte count, dimensions, real image signature/MIME, copies create-only into `urblo-public-media`, writes the server-only `image_qr_resources` record and change history, and removes temporary/retired objects when ownership is certain. Generated QR values always use the canonical `https://urblo.com.au/image/:slug` origin, including when managed from an immutable Preview, so printed codes never depend on a branch deployment. `/image/:slug` returns no-store/noindex HTML with an allowlisted active-resource payload; `/api/image-qr/:slug` supports client navigation and refresh. Both fail closed for hidden/unknown resources. The React route sits outside public navigation and popups and shows the original 3D image plus the selected Stone Library finish surface. Replacement does not invalidate printed QR codes. Hide makes the stable resolver return not found but does not claim the already-public object is private. Production migration `20260818074046_image_qr_resources.sql` was separately approved, applied, and read back on 2026-08-18.
  - Current Stone Library candidate: `/admin/stone-library` lists stones; `/admin/stone-library/:stoneId` autosaves a complete private draft via `/api/admin/stone-library`. Service-only `admin_stone_workspace` owns save/publish/archive, optimistic revision checks, idempotent receipts, canonical children and audit history. Two new migrations remain unapplied to production; see `docs/STONE_LIBRARY_WORKSPACE_RELEASE.md`.
  - Current Projects admin source: `/admin/projects` and `/admin/projects/:projectId` use one page-shaped `ProjectAggregateDraft` for project metadata, facts, materials, ordered media blocks, material maps, and hotspots. The browser sends authenticated GET/POST requests to `/api/admin/projects`, keeps optimistic `baseRevision` plus canonical `baseUpdatedAt` tokens, and has no direct child-table or Projects audit mutations. The timestamp token is required for an existing canonical Project even before its first private draft, closing the first-adoption overwrite window. Overview, Facts, Materials, Media, and Maps are progressively disclosed; accessible move controls reorder each public sequence without exposing sort indexes; the sticky action bar owns Save, Publish, Hide, and draft preview; dirty guards cover record switches, internal route navigation, refresh/unload, and browser history. The API list retains every lifecycle row for explicit recovery, while the UI's default `Projects` filter counts and displays only non-Archived rows; Drafts and Live are direct filters, and Archive is conditionally exposed as secondary history. Around 1116px the record list stays beside the editor with its own sticky scroll, while narrow section action groups wrap. The preview and public detail route share `src/components/projects/ProjectPageView.tsx`. Inline media selection uses searchable thumbnails and private upload with alt capture; the original upload remains the private visual master, and the editor explains that high-quality website versions are prepared automatically rather than advertising a destructive compression ratio. The picker keeps its latest-500 cap but exact-batch-fetches every referenced draft media ID, and referenced private signed previews refresh before their one-hour expiry. Hotspot coordinates are derived by direct pointer/keyboard placement on the map image.
  - The Projects endpoint verifies the bearer token with Supabase Auth, loads the active admin profile, keeps `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_SERVICE_KEY` server-side, validates aggregate/reference/media contracts, and invokes the single `admin_project_aggregate` RPC. The RPC locks/rechecks that profile and requires its role to exactly match the Function's initial trusted read, so a concurrent role change fails closed. Viewers may GET the list/aggregate but POST is rejected before its body is read. For active Website owner / CMS manager / editor writes, the Function normalizes the legacy project/fact/material review columns to `approved`; those columns are compatibility data, are not editor-facing decisions, and do not form a separate publish gate. Required copy, references, media, conflict detection, public promotion, and audit rules remain enforced. Canonical `updated_at` conflict checking occurs before either Publish or Hide writes. Expand A, minimum-disclosure C, and write-lockdown B `20260802105537_project_aggregate_write_lockdown.sql` are installed/read back, and the aggregate runtime is in production. Any real negative writes need their own approval, and Jay-owned fool-test acceptance remains required.
  - Current Products admin source: `/admin/products` reads and saves `products`, `product_models`, `product_material_defaults`, and `product_specs` records for active Website owner / CMS manager / editor roles once browser-safe Supabase config and an active profile exist.
  - Current Articles admin source: `/admin/articles` reads and saves `articles` and `article_blocks` records for active Website owner / CMS manager / editor roles once browser-safe Supabase config and an active profile exist. Article/block reads and saves are bound to the selected article and original row identity, late block loads are ignored, record switching is blocked while a save is active, and block updates constrain both block ID and article ID without rewriting `article_id`. Published CTA and video destinations must be a canonical root-relative path or an `http:`/`https:` URL; the public renderer repeats the check and omits unsafe links.
  - Current Leads admin source: `/admin/leads` reads `enquiries`, `sample_requests`, and `sample_request_items`; active Website owner / CMS manager roles can update lead status, assignment, internal notes, and export the currently loaded lead queue to CSV once browser-safe Supabase config and an active profile exist. CSV export must write a change-history row before downloading.
  - Current Change history admin source: `/admin/audit` reads `admin_audit_events` for active Website owner / CMS manager roles once browser-safe Supabase config and an active profile exist, while visible labels translate audit actions/entities into editor-facing language.
  - Current dashboard source: `/admin` counts published public-content rows, recent lead signal, and a content health queue for media metadata gaps, missing product/article media, TBC Stone Library records, and stale new leads. It offers drafts to continue but no Project claim-review queue. These queries run only after the Supabase Auth/profile gate has passed.
  - Projects and Stone aggregate writes include audit history in the canonical database transaction. Other admin modules use `src/lib/adminAudit.ts` after the primary mutation and disclose audit failures without undoing that primary change.
  - Admin credential/profile readiness verification is staged through `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>`. The command is read-only, requires a real email address rather than a copied placeholder, requires a browser-safe Supabase key plus a service-role key, verifies the named Auth user exists and is linked to the active admin profile with the required role, checks the baseline `site_settings` and `finish_definitions` seed rows, and uses the browser-safe key to verify the anonymous public/private REST boundary before browser login/save QA begins.
  - Admin login `next` redirects are constrained to true admin-console targets (`/admin`, `/admin?*`, or `/admin/*`) and deliberately reject login/unauthorized loop targets before redirecting authenticated users.
  - First-admin bootstrap is staged through `npm run agent:first-admin-bootstrap`. Default mode is no-write and makes no Supabase calls; `--verify-only` reads Auth/profile/seed state with a service-role key; `--allow-writes` requires a matching `--confirm-email` and Jay approval before inviting an Auth user or upserting the first `admin_profiles` row. The database has a case-insensitive unique index on normalized admin profile email, and the bootstrap/readiness scripts normalize profile email matching before refusing email/Auth-user mismatches or reporting readiness.
  - First-admin write mode records an `admin_profile.bootstrap` row in `admin_audit_events` with service-role setup metadata because the bootstrap is a setup operation rather than a signed-in browser admin mutation. The 2026-06-03 live bootstrap for `info@urblo.com.au` recorded `admin_audit_events.id = 8`.
  - `npm run agent:admin-crud-live` retains its no-write historical plan but rejects live mode before login or mutation: its legacy direct Stone DML is incompatible with the aggregate lockdown. Fresh Stone write verification must use the protected endpoint under separately approved tagged workflow scope.
  - `npm run agent:admin-media-role-boundary-live` is the separate approval-gated Storage policy verifier. Default/report mode performs no login or writes. With `--allow-writes --strict` and distinct active Editor plus owner/admin credentials, it proves Editor private insert/update succeeds, Editor public insert/update is denied, owner/admin public insert/update succeeds, and all tagged objects are removed. Byte/absence reads use a unique cache nonce to bypass Supabase CDN invalidation delay. The applied migration/policy readback and approved production proof passed on 2026-07-14 with independent zero-object cleanup readback; any rerun requires fresh approval.
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
  - `public/_headers` sets conservative launch security headers only. Project-authored `Cache-Control` overrides for `/assets/*`, `/fonts/*`, and `/media/*` are intentionally absent after a custom-domain cache stored SPA HTML under hashed asset URLs; Cloudflare Pages default cache/revalidation behavior is authoritative. Some unchanged apex assets can still expose the retired response header until Cloudflare revalidates them, so the deployed gate compares their exact bytes and MIME with the immutable deployment and reports the header as a warning rather than hiding it.
- Build script contract: `package.json`
  - `npm run build` => `tsc -b && vite build`
  - `npm run lint` => `eslint .`
  - typecheck path => `npx tsc -b`
- TypeScript contract update:
  - `resolveJsonModule: true` enabled in `tsconfig.app.json` to support `stone_library.json` imports.
- Lint scope contract update:
  - `.vite/**` ignored in `eslint.config.js`.

## Agent Harness Contract

`docs/agent/status.json` owns timestamped release/environment observations; `docs/agent/tasks.json` owns execution scope and blockers. HANDOFF, NEXT_STEPS and README summaries are generated. Use `docs/OPERATING_PROTOCOL.md`, `docs/agent/verification.md` and `docs/PROJECT_MAP.md` for workflow, checks and module discovery. Archived startup instructions and old release assertions are not active rules.

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
- `src/components/site/SiteHeader.tsx` exposes two explicit surface modes: `overlay` for image/video-first openings and `light-page` for white-start content. `HomepageHeader` selects `overlay`; `DefaultLayout` derives `overlay` when `bgImage` is present, otherwise `light-page`, with an explicit `headerSurface` override for page-owned image heroes such as Capabilities and Article detail.
- `DefaultLayout` retains a shared 102px clearance for bannerless white-start routes, but the clearance is light rather than solid black. The header and opened menu own their translucent tint and the original light `backdrop-blur-sm`; route components must not add duplicate top offsets, heavier blur/saturation, or recreate the retired black support band.
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
  - `public/sitemap.xml` is a real static XML sitemap with 35 approved public canonical URLs covering Home, core public listing pages, 5 Projects, 12 canonical Stone Library groups, 6 Products, and 4 Articles. The retired `/stone-library/steel-blue` duplicate redirects to canonical BlueOcean and is excluded.
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
- Published Project Storage images are delivered through `src/components/projects/ProjectResponsiveImage.tsx` and `src/lib/projectImageDelivery.ts`. Only `urblo-public-media` object URLs are rewritten to Supabase's `/storage/v1/render/image/public/` endpoint. Archive cards use 480–1280px at quality 82, list thumbnails use 240–480px at quality 82, detail/hotspot images use up to 2500px at quality 86, and heroes use up to 2500px at quality 88. All transformed requests use WebP plus fit/contain behavior; `srcset`/`sizes` lets the browser choose for viewport and pixel density. Curated local/external sources remain unchanged, and a failed transform falls back once to the retained original URL.
- Shared site logo path: `public/media/launch/identity/urblo-logo.png`, referenced by `src/data/siteChrome.ts` and `src/data/homepage.ts`.
- Homepage hero poster path: `public/media/launch/home/hero-poster.jpg`.
- Homepage hero video path: `public/media/launch/home/urblo-hero.mp4`.
- Homepage mobile hero video path: `public/media/launch/home/urblo-hero-mobile.mp4`; the mobile MP4 is encoded as H.264 Constrained Baseline level 3.1, yuv420p, 540x960, 30fps, no-audio, fast-start media for better mobile/WeChat/X5 compatibility.
- Current homepage video asset is a web-ready H.264 1280x720, 30fps, no-audio, fast-start export from the client-provided `Lark20260611-213730.mp4`; the 74MB source file was not committed.
- Homepage hero uses `100svh` so the first viewport reads as a full-screen hero across desktop and mobile.
- Homepage hero preloads the poster from `index.html`, uses the poster as the section background fallback, uses the 540x960 mobile MP4 for `media="(max-width: 767px)"`, and uses `preload="auto"` for the desktop/tablet MP4 constrained through `media="(min-width: 768px)"`. The hero keeps inline/X5 attributes, handles both an already-present Weixin bridge and the later `WeixinJSBridgeReady` event, retries on lifecycle/media readiness, and turns a rejected play promise into an explicit user-gesture recovery control that disappears after `playing`.
- Homepage below-the-fold heavy media, including the partner banner, Product Showcase background, Latest Projects imagery, Manifesto background, and Video CTA image, must stay deferred until the relevant section is near the viewport so those assets do not compete with first-viewport video loading.
- The current desktop MP4 is about 4.6MB and the current mobile MP4 is about 2.91MB. `npm run agent:homepage-video` locks the mobile codec profile, constraint flags, level, pixel format assumptions, dimensions, frame rate, no-audio, fast-start atom order, source recovery path, and a 4MB delivery ceiling. Cloudflare Stream/R2 remains optional if the client later wants adaptive delivery, analytics, or non-repo video management.
- Route banners are local launch media referenced from `src/App.tsx` through the `ROUTE_BANNERS` map. `/capabilities` now owns a full-bleed page hero sourced from the 2026 Capability Statement PDF instead of using a shared route banner.
- Capability Statement PDF download path: `public/downloads/urblo-capability-statement-2026.pdf`.
- Capability Statement web imagery path: `public/media/launch/capabilities`; these assets must be visually audited for orientation and crop quality before use.
- Our Story Natalie source portrait path: `public/media/launch/our-story/natalie-ma-2026.jpg`.
- Contact image path: `public/media/launch/contact/project-contact.jpg`, referenced by `src/pages/ContactPage.tsx`.
- Homepage partner banner image path: `public/media/launch/homepage/partner-banner-west-side-place.jpg`, referenced by `src/data/homepage.ts`.
- Homepage Latest Projects uses the published public Project collection and its existing order after the section nears the viewport. The five controlled records in `src/data/homepage.ts` remain the no-CMS/read-failure fallback, including their separate rail and feature image choices.
- Homepage section imagery and partner logos use controlled files under `public/media/launch/homepage`. Partner-logo metadata lives in `src/data/homepage.ts`; `LogoCarouselSection` renders one accessible group plus one hidden duplicate group so the CSS `translateX(-50%)` marquee remains seamless and exposes each brand name only once to assistive technology.
- Our Story portraits now use controlled files under `public/media/launch/our-story`; the carbon banner uses the controlled route banner because the old WordPress carbon banner returned 404.
- Legacy project listing/detail media now uses controlled files under `public/media/launch/projects`.
- Stone Library primary and secondary finish imagery is mapped from `data/Product` through `src/data/stoneFinishImages.ts`; controlled fallback media lives under `public/media/launch/stone-library/fallbacks`.
- Stone Library finish imagery carries `FinishVM.imageRole` as `finish-specific`, `reference`, or `placeholder`; the UI must disclose reference/placeholder imagery instead of implying a fallback is finish-specific.
- Stone Library current image status: Alpine White, Angola Black, BlueOcean, Golden Crust Light/Dark, Honey Comb, Ivory Sand, Juparana, New Grey, Tan Brown, and Zen Grey have finish-specific images. BlueOcean is the canonical `blueocean` record and retains the former Steel Blue specifications, sample options, and complete finish-image set; the duplicate old BlueOcean data and `steel-blue` record are retired, with the old public route redirected to BlueOcean. Tuscany Vein Cut and Cross Cut each expose only Honed and map that cut's approved image explicitly. Harcourt still uses TBC placeholders because no matching current-site shared-drive sources were found.
- Article cover and inline cleanup media now uses controlled files under `public/media/launch/articles`.
- Article email-export HTML is still stored as source material under `public/articles`, but `src/lib/articleMedia.ts` rewrites known Squarespace/Front/Google proxy images to local launch media and removes email campaign tracking links before DOMPurify sanitization.
- Article claim-safety and mobile stopgap: `src/lib/articleMedia.ts` rewrites known high-risk newsletter phrases at runtime, unwraps dead links, and `src/index.css` constrains legacy newsletter tables/media to reduce mobile overflow until structured article blocks replace the raw newsletter HTML.
- This is not the long-term CMS media contract. During Supabase migration, these assets should be represented as media records and moved to Supabase Storage or Cloudflare media storage according to final performance testing.

## Stone Library Detail Interaction Contract (`src/pages/StoneLibraryDetailPage.tsx`)
- Public disclosure boundary:
  - Origin remains in the source, typed view models, Supabase records, and Admin editor for internal sourcing use.
  - Public Stone Library cards, detail specifications, free-text matching, and route metadata must not render or disclose origin.
- State composition:
  - Effective active finish resolves by precedence: `lockedFinishKey` -> `defaultFinishKey`.
  - Each finish selection click increments a center-request token used by left media for one-shot visibility-check scroll handling.
  - Variant changes reset locked finish state and close lightbox state.
  - Global route scroll restoration reacts to pathname changes, not query-only Finish/Variant state changes. Variant refresh retains the current detail until replacement data resolves so layout collapse cannot pull the reader to the top.
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
  - Variant-bearing stones place `VariantSwitch` in the same right-side selection rail before Finish; cut-orientation variants are labelled `Cut direction`.
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
  - `ProductDetailPage` body-stone selector options come from `StoneLibraryService.getPublicStoneGroupOptionsForProducts()` so product configuration uses stone-group choices rather than variant-level entries.
  - Product detail pages initialize configured default material selections, show selected model/material feedback, expose a prefilled configuration enquiry `mailto:`, and mark missing selector imagery as pending.
  - Product render imagery is treated as a geometry preview; selected body stone, frame finish, and battens are shown as separate material previews instead of pretending the render is composited live.
  - Product model geometry is keyed semantically: Rise is proud of the stone, Flush is inset/level, and `+` adds a backrest. `npm run agent:product-model-images` locks every current product key, label, reviewed asset path, asset existence, and per-product image uniqueness; filenames alone are not treated as semantic truth.

### Project Data Contract
- Static migration fallback: `src/data/projectData.ts`
- Public access layer: `src/service/ProjectService.ts`
  - `getAll()` uses the browser-safe public Supabase client to read Published `projects`, approved Published facts/materials, Published ordered media, material maps, and hotspots, resolves only public-safe media URLs, then overlays each Published Project onto the matching static Project by canonical slug.
  - The adapter also reads `get_archived_project_slugs()`. Applied/read-back migration C restricts output to archived canonical rows intersecting the five bundled public fallback slugs, while `ProjectService` applies the same allowlist as defence in depth. Once the aggregate runtime is promoted, an allowlisted archived slug suppresses its matching bundled fallback. A read failure keeps the availability-first static fallback, and a Published CMS row wins over a stale tombstone.
  - Unmatched non-archived static Projects remain visible during migration, new Published Projects append, and a missing public client or Published-query error leaves the static fallback collection intact.
  - `getBySlug(slug)` resolves the merged collection by normalized canonical slug.
  - Published `project_facts.fact_value_json` is treated as untrusted JSON. Only a string or an array containing strings is exposed to the public Project detail; other shapes normalize to a safe empty value instead of leaking arbitrary objects into the view model.
- Listing page: `src/pages/Projects.tsx`
  - Calls `ProjectService.getAll()` and uses page-owned opening content below the shared 102px light `DefaultLayout` clearance used by Stone Library; the shared `light-page` header supplies the deeper smoked-glass contrast.
  - Functional archive state includes equal-sized image cards, sector filters, and grid/list view controls.
- Detail page: `src/pages/ProjectDetails.tsx`
  - Reads the same merged `ProjectService` collection and delegates the case-study structure to `src/components/projects/ProjectPageView.tsx`: breadcrumb, oversized title, previous/next navigation, full-width hero, Project Information facts, narrative, ordered media blocks, Featured Materials when configured, and final CTA.
  - `src/pages/admin/projects/ProjectDraftPreview.tsx` uses that same renderer in preview mode, intercepting navigation while preserving page composition.
  - Uses `mediaBlocks` when present and falls back to `images` as normal image blocks for older records.
- Project media block contract:
  - `normal_image`: full-width responsive image proof with optional label/caption.
  - `hotspot_image`: full-width responsive project image with material/finish hotspot inspector.
  - `youtube_video`: optional one-per-project video block rendered with `youtube-nocookie` when project data or future Supabase content provides a YouTube ID. Current static project data has no live YouTube block because no client-approved Urblo project video is configured.
- Project hotspot component: `src/components/projects/ProjectHotspotImage.tsx`
  - Desktop interaction: hover/focus/click changes the active material inspector.
  - Mobile interaction: tap/focus changes the active material inspector directly below the project image; no hover-only dependency.
  - Hotspot coordinates are stored as image-percentage positions in `src/data/projectData.ts`.
  - Hotspots are material-placement records keyed by `stoneGroupId`, `stoneVariantId`, and `finishKey`. Project owns placement and application; the published Stone catalogue owns names, valid relationships, exact finish image/alt and links. Admin selectors share that catalogue; saved unavailable selections remain visible for correction. Managed keys do not revive static data, and no alternate finish image fills a missing finish.
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
  - Applied expand migration A stores the editable page aggregate in `private.project_drafts` with an optimistic revision and canonical-project baseline timestamp. Draft JSON is not directly granted to browser roles; `/api/admin/projects` is the authenticated boundary. Production readback found the table empty before authenticated workflow testing.
  - `public.admin_project_aggregate(...)` is the only Projects aggregate RPC. It is `SECURITY DEFINER`, uses an empty search path, is executable only by `service_role`, rechecks the active actor role, and implements list/get/save/publish/archive. Save updates only the private draft plus audit; Publish persists the current request as a new revision, applies the relational aggregate and its audit row in one database transaction, and archives omitted child rows rather than deleting them; Archive hides the aggregate without physical deletion.
  - Storage cannot share the Postgres transaction. Before Publish invokes the RPC, the server Function create-only copies referenced private uploads into `urblo-public-media`, reads back and hashes the copy, and supplies a source-version-bound promotion plan. RPC failure triggers reference-aware best-effort compensation; uncertain or referenced objects are retained and reported instead of being deleted blindly. Safe external/R2/Stream references are promoted inside the database transaction.
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
  - Matching Published Projects keep static `sector`/`category` taxonomy and static-only CTA display structures until those values are fully represented by the public CMS adapter. CMS-owned title, summary, approved facts/materials, ordered media, maps/hotspots, and metadata win. If any dependent Project relation read fails, the CMS Project collection is rejected for that read so the intact static fallback remains.
  - Stone Library uses one published catalogue snapshot; managed keys never fall back to static content. Configured RPC/client failures show a retry state. Successful reads may add only unmanaged bundled fallback keys; unconfigured local builds use static data.
  - Draft rows do not replace static migration fallback. Applied migration A added `get_archived_project_slugs()` so Archive can suppress a matching bundled Project. Applied/read-back migration `20260802103337_restrict_archived_project_tombstones.sql` removes private-draft reads and returns only the archived-canonical/five-public-fallback intersection; the public adapter rejects any unexpected slug independently. The 2026-08-02 result is the expected empty list. If the RPC is unavailable, source preserves healthy static pages.
  - Public Project material/map/hotspot consumption and shared draft/public rendering are deployed. Deterministic tests cover stale-Save 409, the conflict reload-only lock, and full failed-Publish public-copy compensation; production deployment-bound smoke/login and A/C/B readbacks pass. Optional live negative proof needs separate approval, and User acceptance and optional live negative proof are tracked separately in the task queue and WORKLOG.
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
  - `/admin/projects` and `/admin/projects/:projectId` are the Phase 1 page-shaped vertical prototype. The browser edits one aggregate draft and calls protected `/api/admin/projects`; it does not issue direct Project child-table writes. One action bar owns Save/Publish/Hide/preview, and preview shares the public Project renderer.
  - The endpoint's GET without `projectId` returns the private-draft-aware index; GET with `projectId` returns the saved private aggregate or assembles revision `0` from canonical rows; POST accepts `action`, `projectId`, `baseRevision`, and `draft` for `save`, `publish`, or `archive`. Missing/invalid bearer identity fails before request body or database mutation work.
  - The relational/private-draft contract from expand A, minimum-disclosure C, and write-lockdown B `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql` are applied/read back.
  - The authenticated Preview happy path, deterministic conflict/compensation checks, production runtime deployment, deployment-bound production smoke/login, and B privilege/policy readback are complete. The operational edit freeze is lifted. Real two-session/Postgres/Storage negative proof is optional but needs its own approval. A Cloudflare-only rollback to the legacy direct-write UI is invalid; runtime rollback must retain the aggregate UI/endpoint or use a separately reviewed and approved forward-compatibility migration. User acceptance and optional live negative proof are tracked separately in the task queue and WORKLOG.
  - `/admin/products` is the next content CRUD screen and uses product family, model, material default, and spec records.
  - `/admin/articles` is the next content CRUD screen and uses article metadata plus structured article block records.
  - `/admin/leads` is the first lead workflow screen and uses enquiries, sample requests, sample request items, active admin profile options, Stone Library labels, and finish labels. Owner/admin CSV export is limited to the currently loaded queue and blocked if its audit event cannot be recorded.
  - `/admin/audit` is the first audit visibility screen and uses admin audit events plus active admin profile labels.
  - Admin profile management is non-destructive in source: it creates/updates profile rows for existing Supabase Auth users, preserves owner-role guardrails in UI, and is backed by the `admin_profile_owner_hardening` migration.
  - Launch content removal is non-destructive in source: admin content and media workflows use archive/publish state changes, while physical deletes remain outside the launch-critical CMS path until Jay approves a retention/destructive-delete policy.
  - The admin CMS must not ship fake production auth; live verification still requires browser-safe Supabase key configuration and a confirmed first admin profile.
  - Stone Library, Products, and Articles still issue separate browser mutations rather than one database transaction. Projects is the deployed exception through the installed aggregate RPC. Storage promotion remains explicitly non-atomic and uses verification plus compensation. Partial failure must remain accurate in every module.
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
- Homepage Latest Projects reads the same published Project collection as `/projects`, in the same `sort_order`, and maps each record into the homepage browser when the section nears the viewport. The controlled five-project `homepageData.latestProjects.projects` array is fallback content only. `HomepageSections.tsx` renders the data as a sketch-aligned two-row/four-column browser: the upper copy and upper feature image each span two columns, the lower draggable rail shows four portrait project images on desktop, and the active `View project` link navigates to `/projects/:slug`.
- Homepage Latest Projects is intentionally rendered immediately below the partner banner, before the Product Showcase, so project proof follows the positioning line rather than appearing later as a filler block.
- Homepage bottom video CTA is configured by `homepageData.videoCta.youtubeId` and opens a lazy `youtube-nocookie.com/embed/UfRtQZSi7cM` iframe only inside the Play modal. Closing the modal unmounts the iframe and stops playback.
- Homepage typography is self-hosted from local static assets under `/public/fonts/urblo`:
  - `Avenir LT Std` weights `300/400/500/600/800`
  - `Didot LT Std` italic `400` and normal `600`
  - `Space Grotesk` local WOFF2
- Homepage runtime no longer depends on remote WordPress font CSS/TTF/WOFF assets.

## Release evidence

Timestamped release observations are maintained in `docs/agent/status.json`; verification history is indexed by `docs/WORKLOG.md`. Do not infer a current passing gate from old prose.

## Known Architecture Risks

- Production CMS/Auth handoff, SMTP ownership, Turnstile, content facts and user/device acceptance have their own evidence boundaries in `docs/agent/tasks.json` and `docs/agent/admin-handoff-evidence.json`. Synthetic local workflows do not certify those outcomes.
- Stone Library, Products, Articles and Settings use separate browser-key/RLS writes. They do not become atomic merely because their UI save succeeds. Projects uses its deployed aggregate RPC; Media promotion remains non-atomic and retains explicit compensation/readback handling.
- Published overlays retain static fallback. The installed Projects minimum-disclosure tombstone contract is limited to the approved bundled fallback keys; other content types still need an explicit CMS-only cutover/removal policy.
- Published settings have a validated public consumer with bounded retry. Logo/favicon media IDs, automatic CMS-only sitemap inventory and first-response server/prerendered metadata remain outside that contract.
- Products, Stone Library and Media remain larger modules. Follow-up refactors must first add representative behavior/failure tests, preserve existing roles and data contracts, and target a specific change boundary; file size alone is not a defect.
- Raw article newsletter HTML remains migration source material. Known proxy images and campaign links are normalized by the public renderer; safe link and content rendering boundaries must remain enforced.
- Current deployment/version/account observations belong in structured status and the Cloudflare runbook, not duplicated mutable snapshots here. Cloudflare-only rollback to legacy direct-write Projects is invalid under the installed write-lockdown migration.

## Brand and Design Linkage Rule
For UI/copy/IA changes, architecture and implementation decisions must be reviewed against:
- `docs/brand-baseline.md` for positioning, audience, voice, and claim safety.
- `docs/DESIGN.md` for visual rhythm, page composition, interaction tone, and responsive UI quality.

Brand and design linkage is advisory in execution flow, but required in task notes for high-impact user-facing changes.

## Isolated verification environment

`supabase/config.toml` and the guarded local scripts define `urblo-isolated-v1` with synthetic Auth profiles, draft Articles and a generated test image. Local app execution uses actual Wrangler Pages Functions and local Storage/Postgres, with separate Vite envDir and generated local-only bindings; no production dotenv fallback is used. Preview remains production-backed/read-only. The historical helper-grant migration is conditional on the hosted-only helper existing, preserving its original privilege result. See `docs/LOCAL_DEVELOPMENT.md`.

## Articles and protected Function module boundaries

`src/pages/admin/AdminArticlesPage.tsx` owns only the protected route wrapper. Under `src/pages/admin/articles/`, `types.ts` defines row/form shapes, `forms.ts` owns conversions/validation/publish readiness, `data.ts` owns browser-key reads and parent-bound writes, and `useArticleEditor.ts` owns selected identities, stale-load guards, save locks and audit sequencing. `ArticlesWorkspace.tsx`, `ArticleEditorComponents.tsx` and `BlockContentEditor.tsx` retain the existing presentation and action bindings. The module continues separate primary and audit writes, with the same partial-audit warning contract; it is not an aggregate API.

`functions/_lib/admin-runtime.js` shares service configuration/client creation and verified user/active-profile reads for QR and Projects. Each caller still owns allowed roles, viewer behavior, exact errors/statuses and response shape. Missing bearer checks remain before configuration, request body or database work. Client-side source never imports this server module.

## Stone aggregate contract — candidate 2026-09-10

- `src/features/stone-library/stoneDraft.ts` defines the versioned whole-page draft and exact-image mapper. `StoneSaveQueue` serializes/coalesces changes, preserves uncertain request identities, waits for the latest value before navigation/publish, and retains edits on conflict.
- `private.stone_drafts`, `private.stone_requests`, `private.stone_history`, `private.stone_exclusions`, and `private.stone_static_references` separate editable data, receipts, snapshots, known historical keys and active bundled references. Public output comes from `public_stone_catalogue()` with public-only fields and managed keys.
- Publishing checks the revision and canonical/media version, validates parent ownership, preserves stable IDs, prepares create-only `stone-assets` public copies, then commits canonical parent/children/media/audit together. Definite failure compensates unreferenced new public copies; unknown commit outcomes retain copies for receipt readback. Private originals are never deleted by Stone publication.
- The separate lockdown revokes browser DML on all four Stone tables/sequences and removes their mutation policies. Statement-entry advisory locks plus deferred reference guards serialize Stone, Media, Product, Project and Article changes. Public references, including active bundled pages, prevent invalid hide/finish/image changes. Draft references and historical sample requests are preserved.
- `src/service/stoneCatalogueOptions.ts` supplies published choices to Projects, Products and Articles. Existing unavailable selections remain explicit. The public Stone list/detail and dependent Product/Project material views consume the same catalogue. Managed Stone Library keys never fall back to static content.
- Adoption is a separate approval-gated operation. `agent:stone-adoption-plan` is no-network/no-write by default. Exact SHA approval, baseline comparisons, resumable receipts, content/Storage readback and protected-module fingerprints are required for live mode. The 55 photos are privately uploaded and copied publicly through normal publication; no existing original or non-Stone content is deleted.
