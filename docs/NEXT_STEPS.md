# NEXT_STEPS - Urblo Roadmap

Last updated: 2026-05-29

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
Measured 2026-05-29 during the Stone Library finish-image import checkpoint:
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

- `NOW-FORMS-BACKEND-001`: complete live verification for Cloudflare Pages Functions after server-side `SUPABASE_SERVICE_ROLE_KEY` is configured and Jay approves tagged live form QA writes. Source and mock API checks are implemented, including server-side audit-event attempts after successful lead inserts; `.env.example` and Cloudflare docs now list canonical variables plus supported compatibility aliases; `npm run agent:forms-ui` now guards the Contact form visitor-state/source contract; `npm run agent:forms-live -- --allow-writes` is ready as the credential-gated live persistence/audit/no-write verifier, and `npm run agent:forms-live -- --allow-writes --require-browser-boundary` is the final private-row browser-key boundary proof once a browser-safe key is configured.
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`: repo-side Cloudflare readiness is now checkable with `npm run agent:cloudflare-readiness`; deployed preview route/asset/redirect/API safe-failure smoke is staged with `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`; the runbook includes `npm run agent:forms-live -- --allow-writes --require-browser-boundary` for final private-row form proof and the guarded first-admin bootstrap commands before admin browser QA; account-level project creation, production environment variables, preview URL, custom domain, DNS cutover, and rollback remain blocked on Cloudflare access/confirmation.
- Cloudflare deployed-preview route checklist now treats canonical `/products/prime-block`, article detail, and `/capabilities` as direct-refresh checks; old product/article URLs remain redirect checks only.
- `NOW-FORMS-SUPABASE-001`: complete live verification for Supabase-backed Contact and Sample Request submissions, notification acceptance, and admin-visible lead workflow.
- `NOW-ADMIN-AUTH-RLS-001`: complete live admin auth verification after persistent browser-safe Supabase key configuration and first admin email/profile are available. Source shell and config-gated routes are implemented; a shell-only publishable-key Playwright check now proves unauthenticated protected routes show the login form and hide private content. `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` remains the non-mutating profile/config readiness gate before active-admin browser QA and now verifies the browser-key anonymous public/private REST boundary.
- First-admin bootstrap: `npm run agent:first-admin-bootstrap` now provides the no-write setup plan. Use `--verify-only` with the service-role key and confirmed email to inspect existing Auth/profile state; use `--allow-writes` with matching `--confirm-email` only after Jay approves creating/upserting the first profile or sending an invite.
- `NOW-ADMIN-SETTINGS-CRUD-001`: complete live `/admin/settings` and admin profile save verification after owner/admin profile access is available. Source form, admin team manager, owner/admin RLS hardening, owner-role protection, and SECURITY DEFINER helper hardening are implemented; security advisor currently reports zero security lints.
- `NOW-ADMIN-MEDIA-LEADS-001`: continue after the Media manifest export checkpoint. Supabase Storage buckets/policies, `/admin/media`, and `/admin/leads` source are implemented; Media and Leads now have audit-gated CSV export paths for currently loaded/visible records. Live upload/save/export and lead workflow verification still require browser-safe Supabase key configuration and active admin profiles. Live lead creation still requires server-side form persistence verification.
- `NOW-ADMIN-CONTENT-CRUD-001`: continue after the Stone Library finish-image checkpoint. `/admin/stone-library`, `/admin/projects`, `/admin/products`, and `/admin/articles` source CRUD are implemented; Stone Library now includes finish image links to media records. Live save verification and static-to-Supabase content import still require browser-safe Supabase key configuration and an active admin/editor profile.
- `NOW-ADMIN-CMS-001`: umbrella objective for customer-maintained Projects, Stone Library, Products, Articles, media, leads, and audit visibility; execute through the smaller admin child tasks. Shared browser-side audit writers now exist for admin CRUD/workflow saves, and `npm run agent:admin-crud-live` is staged for live tagged QA writes plus tagged public-content and private-lead invisibility checks once browser-safe Supabase config, a real owner/admin session, and Jay approval are available.
- Admin removal model: launch-critical CMS verification should use create/update/publish/archive flows, not physical deletes. Physical delete controls remain approval-gated until Jay approves a retention/destructive-delete policy.
- Admin source coverage: `npm run agent:admin-crud-coverage` now verifies `/admin` route/module registration, protected shell coverage, expected Supabase table references, role-gated controls, publish/archive paths, structured Article block authoring guardrails, audit writer actions, Media/Leads export audit gates, and the non-destructive archive/removal contract without mutating Supabase.
- Live input readiness: `npm run agent:live-readiness` reports whether the required form, first-admin, admin-write, admin Storage upload, and Cloudflare preview live verification inputs are present, without printing secrets or mutating Supabase/Cloudflare. Non-secret manual inputs can be passed with `--base-url`, `--admin-email`, `--form-writes-approved`, `--first-admin-writes-approved`, and `--admin-writes-approved`; use `--strict` only when missing/manual-gated live inputs should fail the command.
- Admin live write verification: `npm run agent:admin-crud-live` now prints a no-write plan by default. Use `npm run agent:admin-crud-live -- --allow-writes` only after credentials/session exist and tagged QA writes are approved; it will also verify tagged public-content QA rows and private lead QA rows are not anonymously visible. Use `npm run agent:admin-crud-live -- --allow-writes --include-storage` for the final private Storage upload policy proof.
- Source-only import preparation: `npm run agent:content-import` now dry-runs the current static Stone Library groups, variants, finish capabilities, finish image links, Products, Projects, Articles, and media candidates into Supabase-shaped draft payloads without writing production rows. Use `npm run agent:content-import -- --out .tmp/content-import-preview.json` for a local ignored review artifact, `npm run agent:content-import:plan` for the paired JSON artifact plus Markdown apply/rollback plan, `npm run agent:content-import:preflight-sql` for the paired artifacts plus a read-only SQL target preflight, or `npm run agent:content-import:apply-sql` for the paired artifacts plus a guarded draft import SQL bundle.
- Public Supabase cutover readiness: `npm run agent:public-supabase-readiness` verifies the no-write import payload stays draft-only, structured article blocks do not regress to placeholder/newsletter-artifact imports, public RLS policy source remains published-only, anonymous grants stay read-only, public runtime code is still static/file-backed, and Cloudflare Functions stay scoped to `/api/*`.
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
- `NOW-ADMIN-AUTH-RLS-001` live verification: protected admin shell source exists, and the configured-key unauthenticated redirect/login gate has been verified with a temporary shell-only publishable key. Active admin access still waits for first admin email/profile and persistent browser-safe Supabase key configuration. Tagged admin write verification also waits for Jay approval plus a real owner/admin session before running `npm run agent:admin-crud-live -- --allow-writes`.
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
- `NOW-FORMS-BACKEND-001` partial source implementation: `/api/enquiries` and `/api/sample-requests` Pages Function source exists, Contact page posts to those endpoints, sample CTAs route to `/contact?intent=sample-request`, and mock API checks cover valid/invalid/Turnstile-failure behavior, server-side audit attempts, audit-failure resilience, and missing-service-role fail-closed behavior. Live Supabase row verification still requires server-side environment variables before this task can be marked done.
- `NOW-FORMS-BACKEND-001` notification mock checkpoint: `scripts/check-forms-api.mjs` now proves configured Resend notification success/failure handling without real email secrets, including pending initial status, Resend call shape, and final `notification_status` patch to `sent` or `failed`.
- `NOW-FORMS-BACKEND-001` live verification runner checkpoint: `npm run agent:forms-live -- --allow-writes` now verifies valid enquiry/sample request rows, sample item rows, server-side audit rows, invalid-payload no-write behavior, and response-vs-stored `notification_status` consistency once a service-role key is configured and Jay approves tagged live form QA writes. With `--require-browser-boundary`, it also requires a browser-safe key and proves created private lead rows are not anonymously readable. The runner intentionally fails without `--allow-writes` or required credentials and retains tagged test rows until Jay approves cleanup.
- `NOW-FORMS-BACKEND-001` Contact form UI source contract checkpoint: `npm run agent:forms-ui` now verifies the Contact form source keeps the main submit flow on `/api/enquiries` and `/api/sample-requests`, preserves inline validation/success/error/submitting states and sample-request fields, keeps direct email/phone fallback channels, and blocks submit-flow mailto/window-navigation regressions. `npm run agent:smoke` runs this after the Forms API mock checks.
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
- `NOW-ADMIN-AUTH-RLS-001` partial source implementation: `/admin`, `/admin/login`, `/admin/unauthorized`, protected admin module routes, Supabase Auth session/profile checks, config-required state, dashboard query shell, and current launch-check copy are implemented. Live active-admin verification remains pending first admin email/profile and browser-safe Supabase key configuration.
- `NOW-ADMIN-AUTH-RLS-001` admin readiness runner checkpoint: `npm run agent:admin-live-readiness` now verifies browser-safe key presence, service-role verification access, the named active first-admin profile, baseline seed rows, and browser-key anonymous public/private REST boundary without creating users or mutating Supabase.
- First-admin bootstrap runner checkpoint: `npm run agent:first-admin-bootstrap` now prints the approved no-write setup path, supports service-role read-only verification, and gates live invite/profile writes behind Jay approval plus `--allow-writes` and a matching `--confirm-email`.
- `NOW-ADMIN-SETTINGS-CRUD-001` partial source implementation: `/admin/settings` reads/creates/updates the default site settings row behind the admin gate, and Supabase `site_settings` write policies now require owner/admin. Live save verification remains pending first admin email/profile and browser-safe Supabase key configuration.
- `NOW-ADMIN-MEDIA-LEADS-001` partial source implementation: Supabase Storage buckets `urblo-public-media` and `urblo-admin-media` are applied with admin/editor write policies and public object listing disabled; `/admin/media` supports upload-backed draft records, external media records, metadata editing, audit-gated visible manifest export, and publish/archive guardrails behind the admin gate. Live upload/save/export verification remains pending first admin email/profile and browser-safe Supabase key configuration.
- `NOW-ADMIN-CONTENT-CRUD-001` Stone Library source checkpoint: `/admin/stone-library` now supports Stone Library group, variant, finish capability, and finish image link CRUD behind the admin gate, with loading, empty, validation, save, publish/archive, image-link, published-media, read-only, and error states. Public Stone Library runtime remains static/file-backed until content import and public read migration are completed.
- `NOW-ADMIN-CONTENT-CRUD-001` Projects source checkpoint: `/admin/projects` now supports project records, facts, material schedule rows, material maps, and hotspots behind the admin gate, with loading, empty, validation, save, publish/archive, claim-review, read-only, and error states. Public Project runtime remains static/file-backed until content import and public read migration are completed.
- `NOW-ADMIN-CONTENT-CRUD-001` Products source checkpoint: `/admin/products` now supports product families, models, material defaults, and specs behind the admin gate, with loading, empty, validation, save, publish/archive, read-only, and error states. Public Product runtime remains static/file-backed until content import and public read migration are completed.
- `NOW-ADMIN-CONTENT-CRUD-001` Articles source checkpoint: `/admin/articles` now supports article metadata and structured article block rows behind the admin gate, with loading, empty, validation, save, publish/archive, legacy-source provenance, reference linking, read-only, and error states. Public Article runtime remains static/file-backed and sanitized legacy HTML until content import and public read migration are completed.
- `NOW-ADMIN-MEDIA-LEADS-001` Leads source checkpoint: `/admin/leads` now supports enquiry and sample request queues behind the admin gate, with contact detail, sample item inspection, status, assignment, internal notes, notification state, audit-gated owner/admin CSV export, read-only, and error states. Live lead row creation, notification emails, export audit rows, and save/export verification remain pending credentials.
- Audit visibility source checkpoint: `/admin/audit` now supports owner/admin audit event inspection behind the admin gate, with event filters, actor/entity detail, metadata JSON, restricted-role, empty, and error states.
- Admin audit-writer source checkpoint: Settings, Media, Stone Library, Projects, Products, Articles, and Leads save flows now call `src/lib/adminAudit.ts` after successful primary mutations. Audit insert failures are surfaced in the success notice without rolling back the saved content. Live audit row verification remains pending credentials.
- Admin profile management and hardening checkpoint: `/admin/settings` now includes non-destructive admin profile create/update controls for existing Supabase Auth users, owner/self-lockout guardrails, and profile audit-event attempts. Supabase `admin_profile_owner_hardening`, `security_definer_function_grants`, and `security_definer_private_helpers` are applied and verified; public helper RPC execution is revoked from browser roles, RLS/Storage policies call private helpers, and live team-management verification remains pending first-admin access and browser-safe Supabase config.
- Admin CRUD coverage checkpoint: `npm run agent:admin-crud-coverage` is available as a source-only verifier for admin routes, active modules, table coverage, role gates, publish/archive controls, audit actions, and audit-gated exports before live credential/browser QA.
- Admin scaffold cleanup checkpoint: the retired admin module scaffold component and unused scaffold/locked module branches are removed; all launch-critical admin routes now point to real source screens behind the auth/config gate.
- Admin CRUD live verifier checkpoint: `npm run agent:admin-crud-live` is available as a credential-gated live write verifier. It defaults to no-write plan-only mode; `--allow-writes` uses browser-key RLS with a real owner/admin session to create tagged QA rows, publish then archive public-facing QA rows, record audit events, verify tagged archived public-content QA rows plus private lead QA rows are not anonymously visible, and avoid physical deletes.
- Cloudflare readiness checkpoint: `npm run agent:cloudflare-readiness` verifies the repo-side Pages build contract, clean-route fallback, `/api/*` Function routing scope, launch headers, API handler files, env placeholders, and deployment runbook without touching Cloudflare account state.
- Cloudflare preview smoke checkpoint: `npm run agent:cloudflare-preview-smoke` now verifies deployed direct-refresh public/admin route shells, deployed assets, legacy redirects, and no-write API safe-failure behavior after a `*.pages.dev` URL exists. Local Vite preview mode validates route/asset checks and skips Cloudflare-only redirect/Function checks.
- Content import dry-run checkpoint: `npm run agent:content-import` maps current static content and local media into Supabase-shaped draft import candidates. The latest run produced zero warnings/blockers and confirmed the import can be staged without writing production rows.
- Content import artifact checkpoint: the dry run now supports `--out` for a local ignored JSON review artifact, `--plan-out` for a local ignored Markdown apply/rollback plan, `--preflight-sql-out` for a local ignored read-only target preflight SQL artifact, `--apply-sql-out` for a guarded draft import SQL artifact, and `.tmp/` is ignored so review payloads are not accidentally committed.
- Stone Library finish-image import checkpoint: the content import dry run now extracts current static finish-specific Stone Library image mappings from `src/data/stoneFinishImages.ts` into 53 draft `stone_finish_images` rows and includes them in the apply/rollback plan, preflight SQL, guarded draft apply SQL, and public-readiness count checks.
- Article structured import checkpoint: the content import dry run now extracts legacy newsletter HTML into 95 draft structured article blocks, links image blocks to `media_assets`, skips newsletter footer/contact/social artifacts, and carries claim-review flags without treating source copy as approved.
- Public Supabase readiness checkpoint: Stone Library import candidates now stay `draft` instead of inheriting active/TBC public source states, and `npm run agent:public-supabase-readiness` verifies draft-only import rows, structured article block extraction, published-only public RLS source, read-only anonymous grants, static public runtime boundaries, and `/api/*` Function routing scope.
- Public Supabase article-block readiness guard: the public-readiness gate now fails if article block import regresses to placeholder blocks, imports newsletter footer/contact/social artifacts, loses image-to-media candidate links, or loses claim-review metadata on rich text and flagged blocks.
- Admin Article structured-authoring coverage: `npm run agent:admin-crud-coverage` now fails if `/admin/articles` loses approved schema block type options, structured-content validation, or starts introducing raw HTML/newsletter authoring helpers.

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
