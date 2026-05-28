# NEXT_STEPS - Urblo Roadmap

Last updated: 2026-05-28

## Purpose
This file is the human-readable roadmap. The machine-readable task queue lives in `docs/agent/tasks.json` and is the source of truth for active task status, file ownership, acceptance criteria, and verification commands.

Use this file to understand priority shape. Use `docs/agent/tasks.json` to execute.

## Current Objective
Move Urblo from a static website toward a launchable Cloudflare + Supabase operating system: public site hosting, real forms, customer-maintained content, controlled media, and a durable admin workflow.

## Blocking Quality Gate Policy
A task touching runtime behavior is not complete unless all three pass:
- `npm run build`
- `npm run lint`
- `npx tsc -b`

Docs-only and harness-only work should run:
- `npm run agent:check`
- `git diff --check`

Cloudflare/Supabase implementation work should also follow the new verification profiles in `docs/agent/verification.md`.

## Last Runtime Baseline
Measured 2026-05-28 during the admin media checkpoint:
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass
- `npm run agent:smoke`: pass

## Advisory Brand + Design Gate
For any user-facing layout/copy/IA task:
- Reference relevant sections in `docs/brand-baseline.md`.
- Reference relevant sections in `docs/DESIGN.md`.
- Include a short brand/design alignment note in task delivery.
- If implementation cannot satisfy baseline yet, record explicit gap and follow-up ID.

## Now
Source of truth: `docs/agent/tasks.json`.

- `NOW-FORMS-BACKEND-001`: complete live verification for Cloudflare Pages Functions after server-side `SUPABASE_SERVICE_ROLE_KEY` is configured. Source and mock API checks are implemented.
- `NOW-FORMS-SUPABASE-001`: replace mailto-only Contact and Sample Request flows with Supabase-backed submissions.
- `NOW-ADMIN-AUTH-RLS-001`: complete live admin auth verification after browser-safe Supabase key configuration and first admin email/profile are available. Source shell and config-gated routes are implemented.
- `NOW-ADMIN-SETTINGS-CRUD-001`: complete live `/admin/settings` save verification after owner/admin profile access is available. Source form and owner/admin RLS hardening are implemented.
- `NOW-ADMIN-MEDIA-LEADS-001`: continue after the media checkpoint. Supabase Storage buckets/policies and `/admin/media` source are implemented; live upload/save verification still requires browser-safe Supabase key configuration and an active admin/editor profile, and the lead inbox remains pending.
- `NOW-ADMIN-CONTENT-CRUD-001`: continue after the Products checkpoint. `/admin/stone-library`, `/admin/projects`, and `/admin/products` source CRUD are implemented; live save verification and static-to-Supabase content import still require browser-safe Supabase key configuration and an active admin/editor profile. The next source-only checkpoint is Articles as structured blocks.
- `NOW-ADMIN-CMS-001`: umbrella objective for customer-maintained Projects, Stone Library, Products, Articles, media, and leads; execute through the smaller admin child tasks.
- `NOW-ASSET-MIGRATION-001`: migrate priority media away from old WordPress URLs and define controlled storage for launch.
- `NOW-ARTICLE-STRUCTURE-CLAIMS-001`: move article details from raw newsletter HTML to mobile-safe, claim-reviewed structured article templates.

## Next
- `NEXT-UI-PARITY-001`: bring Home, Our Story, Articles, and Contact Us toward approved visual references.
- `NEXT-STONELIB-DATA-001`: replace generic finish behavior text with approved notes.
- `NEXT-PROJECTS-INTAKE-001`: define the project intake template and migrate the next project into the material-map case study model.

## Later
- `LATER-BRAND-001`: align homepage modules with brand pillars and proof framing.
- `LATER-LAUNCH-DOCS-CONSOLIDATE-001`: after production launch, split the temporary launch plan into durable architecture, operations, and worklog docs.
- `NEXT-SAMPLE-REQUEST-001`: legacy fallback only if Supabase-backed forms are not implemented.

## Blocked
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`: repo-side Cloudflare Pages configuration is prepared; dashboard project creation, preview URL validation, production custom domain, DNS cutover, and rollback require Cloudflare account access.
- `NOW-ADMIN-AUTH-RLS-001` live verification: protected admin shell source exists, but active admin access still waits for first admin email/profile and browser-safe Supabase key configuration.
- `NOW-ADMIN-CONTENT-CRUD-001`: admin CRUD modules require the protected admin shell and Supabase content tables. Source-only CRUD can continue behind the config gate, but live write verification still requires browser-safe Supabase key configuration and active admin profiles.
- `NOW-ADMIN-MEDIA-LEADS-001` live media verification and lead management: media source exists, but live uploads need browser-safe Supabase key configuration and an active admin/editor profile; lead management still requires live form persistence, Turnstile, and email-secret verification.

## Completed This Cycle
- `DONE-DOCS-HARNESS-ROOT-001`: promoted `docs/README_AGENT.md` to root `AGENTS.md`, added `docs/DESIGN.md`, moved repo docs to relative paths, and separated brand authority from design execution authority.
- Phase 1 harness hygiene committed: `docs/HANDOFF.md`, `docs/agent/tasks.json`, `docs/agent/verification.md`, `scripts/check-doc-paths.mjs`, and `scripts/check-harness.mjs`.
- Phase 2 verification harness completed: `scripts/agent-init.sh`, `scripts/agent-smoke.sh`, and package-level `agent:*` scripts.
- `NEXT-DATA-001`: project list/detail metadata now comes from `src/data/projectData.ts`; Moon Gate is the first material-map case study.
- `NOW-CLOUDFLARE-SUPABASE-ARCH-001`: Cloudflare Pages + Supabase launch architecture, cost model, and customer-facing approval PDF are documented.
- `NOW-SUPABASE-SCHEMA-001`: Supabase schema plan is documented for Projects, Stone Library, Products, Articles, media, admin access, and lead capture.
- `NOW-SUPABASE-FOUNDATION-001`: Supabase foundation migrations are applied and verified for the Urblo project: 24 launch tables, RLS, policies, FK indexes, private lead/admin protection, and read-only anonymous public-content grants.
- `NOW-SUPABASE-SEED-BASELINE-001`: Supabase baseline seed is applied and verified: 12 distinct finish definitions and one published default Urblo site settings row, with idempotent upsert behavior.
- `NOW-FORMS-BACKEND-001` partial source implementation: `/api/enquiries` and `/api/sample-requests` Pages Function source exists, Contact page posts to those endpoints, sample CTAs route to `/contact?intent=sample-request`, and mock API checks cover valid/invalid/Turnstile-failure behavior. Live Supabase row verification still requires server-side environment variables before this task can be marked done.
- `NEXT-ROUTER-SEO-001`: clean Cloudflare Pages routing is implemented with `BrowserRouter`, root Vite base, and SPA fallback.
- Asset migration stopgap: direct old WordPress media references have been removed from runtime data and replaced with controlled local assets under `public/media/launch`; article covers and known article detail images now use a local runtime cleanup layer, while CMS media records and structured article blocks remain open under the article/admin tracks.
- Homepage video launch optimization: the controlled desktop MP4 is now about 3MB, H.264 1280x720, no-audio, fast-start media; mobile still uses poster-only behavior until a mobile-specific variant is approved.
- `NOW-DELIVERY-READINESS-001`: removed Vite starter README content and deleted the unused React starter SVG asset.
- `NOW-ASSET-STRATEGY-001`: interim local stopgap and delivery-phase Supabase/Cloudflare media hosting policy are documented.
- `NOW-STONELIB-IMG-FASTTRACK-001`: provided primary finish assets are mapped, controlled fallback usage is documented, and remaining true missing image groups are recorded for full coverage.
- `NOW-SEO-DELIVERY-001`: default metadata/icons/social image are launch-owned, Open Graph/Twitter image now uses a PNG, and high-risk article excerpt/runtime newsletter claims are qualified.
- `LATER-PERF-001`: route-level lazy loading is implemented, initial app shell JS is reduced, and the previous `>500kB` JavaScript chunk warning is resolved.
- `LATER-QA-001`: `npm run agent:smoke` now verifies key route shells, article index availability, and critical CTA targets with actionable names.
- `DONE-HOMEPAGE-STONE-SHOWCASE-REMOVE-001`: homepage Browse by stone type section and unused local showcase images were removed by request; article/mobile and product/detail polish discovered during the full-site QA pass is tracked in the active queue.
- `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001`: completed current-website-only audit of the Saistone Google Drive `Urblo Digital Stone Library` source. Drive-only products are excluded for now.
- `NEXT-STONELIB-IMG-001`: normalized and mapped current-site shared-drive images for Golden Crust, Tan Brown, Honey Comb, Ivory Sand, and Tuscany. Blueocean remains a controlled fallback and Harcourt remains placeholder/TBC because no matching current-site source imagery was found.
- `NEXT-ADMIN-IA-ACCESS-001`: defined the executable `/admin` route map, access states, role behavior, module rollout order, content field ownership model, and implementation boundaries in `docs/ADMIN_IA_ACCESS.md`.
- `NOW-ROUTE-ERROR-STATES-001`: unknown URLs now render a branded not-found state, and article/product detail routes now have deliberate loading, not-found, and load-error states.
- `NEXT-PRODUCT-DETAIL-CONVERSION-001`: product details now show selected configuration feedback, a prefilled discussion CTA, specification caveats, and pending-image treatment for missing selector imagery.
- `NEXT-STONELIB-IMG-002`: secondary finish frames are implemented for approved Juparana and Zen Grey source frames as active-finish support media with lightbox frame selection.
- `NEXT-SLUG-URL-NORMALIZE-001`: product and article public slugs now use lowercase kebab-case with explicit Cloudflare 301 redirects and runtime alias handling for old URLs.
- `NEXT-MOTION-POLISH-001`: homepage and Our Story proof metrics now visibly count up from zero when scrolled into view, and public route changes use restrained reduced-motion-aware enter transitions.
- `NEXT-PAGE-TITLE-TYPOGRAPHY-001`: Projects page title typography is now the global public page H1 system, including Article detail.
- `NEXT-STONELIB-IMAGE-LABEL-READABILITY-001`: Stone Library list/detail image overlay labels now use readable dark translucent surfaces with restrained Urblo lime status/action accents.
- `NEXT-STONELIB-STATUS-PILL-CONSISTENCY-001`: Stone Library external Available/Upcoming/No states now use shared lightweight status pills instead of heavy black blocks or full lime badge fills.
- `NEXT-HOME-HERO-EDGE-REVEAL-001`: homepage first viewport now uses edge-aligned header/hero gutters and a sequential all-caps `DESIGN. SOURCE. DELIVER.` hero title, with letter-by-letter reveal motion, the second line offset, and Urblo-green punctuation.
- `NOW-DEPLOY-PAGES-HARDEN-001`: GitHub Pages preview deploy now generates `404.html` from `index.html` so direct clean-route visits can load the React app until Cloudflare Pages goes live.
- `NEXT-UI-PARITY-001` partial launch polish: homepage hero now fills the first viewport, route transitions reset to top, no-banner error/loading states clear the header, article detail no longer double-renders a route banner, article mobile overflow has a CSS stopgap, Contact blocks empty email drafts, product renders are labeled as geometry previews with separate material previews, Stone Library images disclose finish-specific/reference status, and `react-helmet` was removed to clear React 19 strict-mode console noise.
- `NEXT-UI-PARITY-001` homepage proof update: the old rendered sustainability/tabbed feature module was removed from the homepage flow by request; proof metrics now sit directly after the hero with approved stone/city copy and updated project, CO2, landscape architect, and delivered-stone metrics.
- `NEXT-UI-PARITY-001` capabilities bridge: the homepage proof section now includes a lightweight `Our Capabilities` CTA, and `/capabilities` exists as a provisional design/specification/sourcing/delivery capability page pending final client copy.
- `NOW-ADMIN-AUTH-RLS-001` partial source implementation: `/admin`, `/admin/login`, `/admin/unauthorized`, protected admin module scaffolds, Supabase Auth session/profile checks, config-required state, and dashboard query shell are implemented. Live active-admin verification remains pending first admin email/profile and browser-safe Supabase key configuration.
- `NOW-ADMIN-SETTINGS-CRUD-001` partial source implementation: `/admin/settings` reads/creates/updates the default site settings row behind the admin gate, and Supabase `site_settings` write policies now require owner/admin. Live save verification remains pending first admin email/profile and browser-safe Supabase key configuration.
- `NOW-ADMIN-MEDIA-LEADS-001` partial source implementation: Supabase Storage buckets `urblo-public-media` and `urblo-admin-media` are applied with admin/editor write policies and public object listing disabled; `/admin/media` supports upload-backed draft records, external media records, metadata editing, and publish/archive guardrails behind the admin gate. Live upload/save verification remains pending first admin email/profile and browser-safe Supabase key configuration.
- `NOW-ADMIN-CONTENT-CRUD-001` Stone Library source checkpoint: `/admin/stone-library` now supports Stone Library group, variant, and finish capability CRUD behind the admin gate, with loading, empty, validation, save, publish/archive, read-only, and error states. Public Stone Library runtime remains static/file-backed until content import and public read migration are completed.
- `NOW-ADMIN-CONTENT-CRUD-001` Projects source checkpoint: `/admin/projects` now supports project records, facts, material schedule rows, material maps, and hotspots behind the admin gate, with loading, empty, validation, save, publish/archive, claim-review, read-only, and error states. Public Project runtime remains static/file-backed until content import and public read migration are completed.
- `NOW-ADMIN-CONTENT-CRUD-001` Products source checkpoint: `/admin/products` now supports product families, models, material defaults, and specs behind the admin gate, with loading, empty, validation, save, publish/archive, read-only, and error states. Public Product runtime remains static/file-backed until content import and public read migration are completed.

Older completion details live in `docs/WORKLOG.md`.

## Exit Criteria for Current Delivery Cycle
- Active `now` tasks in `docs/agent/tasks.json` are complete or explicitly deferred.
- Cloudflare Pages can deploy production and preview builds.
- Supabase schema, Auth, Storage, and RLS assumptions are implemented and verified.
- Contact and Sample Request persist records and send notifications.
- Admin users can CRUD Projects, Stone Library, Products, Articles, media, and lead records without code edits.
- Priority media no longer depends on old WordPress URLs for first-viewport production experience.
- All applicable quality gates pass per `docs/agent/verification.md`.
- Navigation and route contracts remain consistent with `src/App.tsx`, `src/data/siteChrome.ts`, and `src/components/site/SiteFooter.tsx`.
- Delivery shell is free of template/default app metadata and dead social links.
- Stone Library data/image follow-ups are explicit, not implied complete.
