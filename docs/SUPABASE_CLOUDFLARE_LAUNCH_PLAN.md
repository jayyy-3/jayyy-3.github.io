# Urblo Cloudflare + Supabase Launch Plan

Last updated: 2026-05-28

## Decision
The launch target is Cloudflare Pages for the public website, Cloudflare Pages Functions for small API endpoints, Supabase for the operational database/auth/storage layer, and a Urblo-owned admin interface for customer-maintained content.

This changes the delivery posture from a static marketing site into a lightweight operating system for Urblo content, enquiries, project evidence, and future feature growth.

## Document Lifecycle
This file is a pre-launch control document, not a permanent production source of truth.

Before launch:
- Keep this file as the single high-level Cloudflare + Supabase launch plan.
- Use `docs/agent/tasks.json` for executable task status.
- Keep `docs/ARCHITECTURE.md` aligned when runtime contracts change.

After launch:
- Move final production architecture facts into `docs/ARCHITECTURE.md`.
- Move deployment, rollback, environment, admin, form, lead-management, and monthly cost operations into a dedicated operations runbook.
- Preserve launch-history evidence in `docs/WORKLOG.md`.
- Archive or remove this file once its durable content has been moved, so the harness does not retain a stale launch plan.

## Current Reality
- The current app is still a Vite/React static site.
- The current deployment workflow still targets GitHub Pages.
- Contact and Sample Request form source now posts to Cloudflare Pages Function routes; live Supabase persistence still requires server-side environment variables and preview verification.
- Public Projects, Stone Library, Products, and Articles are still file-backed content. Admin source CRUD/workflow/review now exists for Settings/admin profiles, Stone Library, Projects, Products, Articles, Leads, and Audit, and admin CRUD/workflow save flows now call a shared audit writer. Form API source also attempts server-side audit events after successful lead inserts. Live save verification, public read migration, live form-row creation, live audit row creation, and content import work still require browser-safe Supabase config, active admin profiles, server-side form secrets, and follow-up verification.
- Source-only static-to-Supabase import preparation now exists through `npm run agent:content-import`. It dry-runs current static Stone Library, Products, Projects, Articles, and media candidates into draft payloads without writing Supabase rows.
- The Supabase project `Urblo` (`npkidywzwddbnfrnxlmo`, `ap-southeast-2`) is active and connector-accessible. Foundation schema/RLS migrations, baseline seeds, admin profile owner hardening, SECURITY DEFINER grant hardening, and media Storage migrations are applied; live runtime verification is not complete yet.
- P0/P1 visible runtime media now uses controlled local launch assets; raw article HTML remains migration source material and should still be converted into structured Supabase article blocks.

## Target Architecture
- Public site: Cloudflare Pages, built from the GitHub repository.
- Production branch: main unless a later release process chooses a dedicated release branch.
- Preview deployments: Cloudflare Pages branch/PR previews for client review before publishing.
- API layer: Cloudflare Pages Functions under `/api/*` only.
- Deployment runbook: `docs/CLOUDFLARE_DEPLOYMENT.md`.
- Asset migration audit: `docs/ASSET_MIGRATION_AUDIT.md`.
- Database: Supabase Postgres.
- Auth: Supabase Auth for the admin area.
- Admin UI: Urblo-owned `/admin` interface, not raw Supabase Studio for customers.
- Admin IA/access contract: `docs/ADMIN_IA_ACCESS.md` defines the route map, role behavior, module rollout order, and field ownership model before CRUD implementation.
- Structured content: Projects, Stone Library, Products, Articles, and site settings live in Supabase.
- Forms: Contact and Sample Request write to Supabase and send notification email.
- Bot protection: Cloudflare Turnstile on public forms.
- Media: Supabase Storage for normal editorial/product imagery; Cloudflare R2 or Stream remains the preferred review path for large homepage video assets.
- Schema design: `docs/SUPABASE_SCHEMA.md` defines the first production content, media, admin, and lead-capture model.

## Monthly Cost Baseline
Platform pricing is mostly USD. The AUD estimates below use a planning rate of about 1 USD = 1.4 AUD, based on the May 2026 USD/AUD range checked during planning. Actual invoices vary with exchange rate, tax, and usage.

| Item | Production recommendation | Approx USD/month | Approx AUD/month | Why it exists |
|---|---:|---:|---:|---|
| Cloudflare Pages | Free plan | 0 | 0 | Hosts the static public website and preview deployments. |
| Cloudflare Workers / Pages Functions | Workers Paid / Standard | 5 | 7 | Gives safer headroom for `/api/*`, form handling, and future small backend endpoints. |
| Cloudflare Turnstile | Free | 0 | 0 | Protects public forms without CAPTCHA friction. |
| Supabase | Pro | 25 | 35 | Production Postgres, Auth, Storage, daily backups, and no free-plan project pause. |
| Transactional email | Resend Free initially, Pro when needed | 0 to 20 | 0 to 28 | Sends enquiry/sample notifications. Free may be enough early; paid removes tighter daily limits. |
| Cloudflare R2 for large static media | Usually 0 early, usage-based later | 0 to 2 | 0 to 3 | Optional controlled storage for larger media; depends on storage and read operations. |

Recommended launch budget:
- Lean production: about USD 30/month, roughly AUD 42/month. This assumes Supabase Pro, Workers Paid, and free email quota.
- Safer production: about USD 50/month, roughly AUD 70/month. This adds Resend Pro for more reliable transactional email headroom.
- Media-heavy later phase: keep a reserve of USD 5-20/month for R2/Stream or video delivery changes if homepage video traffic grows.

The key client-facing tradeoff is simple: the recurring platform cost is modest compared with the cost of losing enquiries, publishing broken content, or needing a developer for every project/article update.

## Required Workstreams

### 1. Cloudflare Pages Deployment
Outcome: the website can launch through Cloudflare with preview links, safer DNS cutover, and rollback.

Required work:
- Create the Cloudflare Pages project connected to GitHub.
- Set build command to `npm run build`.
- Set output directory to `dist`.
- Configure production and preview environment variables.
- Add function routing so only `/api/*` invokes backend code.
- Confirm SPA refresh behavior on direct URLs.
- Define DNS cutover and rollback steps.

Validation:
- Production and preview builds complete from a clean commit.
- Direct refresh works on key routes: home, Projects, Project detail, Products, Product detail, Stone Library, Article detail, Contact, Admin.
- Static routes do not invoke Functions.
- Secrets are configured in Cloudflare/Supabase dashboards and are not committed.

### 2. Supabase Data Model
Outcome: content moves from code files into a maintainable structured database.

Current execution split:
- `NOW-SUPABASE-FOUNDATION-001`: complete; schema, constraints, indexes, helper functions, grants, and RLS posture are applied and verified.
- `NOW-SUPABASE-SEED-BASELINE-001`: complete; finish definitions and default site settings are seeded and idempotency was verified.
- `NOW-FORMS-BACKEND-001`: in progress; Pages Function source and public Contact UI wiring are implemented, with live Supabase insert verification pending server-side secrets.
- `NOW-ADMIN-SETTINGS-CRUD-001`: source implemented; `/admin/settings` can manage the default settings row and existing Supabase Auth users' admin profile rows after live owner/admin access is configured. Owner-role profile changes are owner-protected in UI and RLS.
- `NOW-ADMIN-MEDIA-LEADS-001`: media and lead source screens implemented; Supabase Storage buckets/policies, `/admin/media`, and `/admin/leads` are in place, with live upload/save and lead workflow verification pending browser-safe Supabase key configuration and active admin profiles.
- Audit visibility source is implemented under `/admin/audit`; admin CRUD/workflow saves now call a shared audit writer, while live audit row creation and server-side form audit events remain pending.
- `NOW-ADMIN-CONTENT-CRUD-001`: Stone Library, Projects, Products, and Articles source implemented; `/admin/stone-library` can manage stone groups, variants, and finish capability rows, `/admin/projects` can manage project records, facts, material schedule rows, material maps, and hotspots, `/admin/products` can manage product families, models, material defaults, and specs, and `/admin/articles` can manage article metadata and structured article block rows after live admin/editor access is configured. Leads remain pending.
- Static content import dry run is implemented through `scripts/check-content-import-readiness.mjs`; it prepares draft candidates and blocks missing local media or unknown stone/finish references before any apply step.

Core tables:
- `site_settings`
- `media_assets`
- `projects`
- `project_gallery`
- `project_hotspots`
- `stone_groups`
- `stone_variants`
- `stone_finishes`
- `stone_finish_images`
- `products`
- `product_models`
- `product_material_defaults`
- `product_specs`
- `articles`
- `article_blocks`
- `enquiries`
- `sample_requests`
- `admin_audit_events`

Required work:
- Define schema and relationships before UI implementation.
- Add status fields such as draft, published, archived.
- Add slug uniqueness rules for public content.
- Add sort/order fields where customer ordering matters.
- Add audit fields: created_at, updated_at, created_by, updated_by.
- Add RLS policies and service-role access boundaries.
- Define public read views or API access patterns.

Validation:
- Migrations can create the database from scratch.
- Seed/migration scripts can import current project, stone, and article data.
- Public read access exposes only published content.
- Admin users can only mutate content after login.
- RLS is enabled on exposed tables.

### 3. Admin CMS
Outcome: Urblo can maintain the site without changing code.

Implementation contract:
- Build against `docs/ADMIN_IA_ACCESS.md`.
- Do not expose a fake production `/admin` experience before Supabase Auth, admin profile checks, RLS, and required secrets exist.
- Keep viewer/editor/admin/owner behavior aligned with the admin IA/access role matrix.

First release scope:
- Login/logout.
- Dashboard with content health warnings.
- Projects CRUD, including gallery and hotspot records.
- Stone Library CRUD, including finishes and images.
- Products CRUD, including models, specs, and default material selections.
- Articles CRUD using structured blocks, not arbitrary newsletter HTML.
- Enquiry and Sample Request inbox with status, owner, notes, and export.
- Media upload and alt text management.

Article block types:
- Rich text section.
- Image.
- Gallery.
- Quote.
- FAQ.
- CTA.
- Project spotlight.
- Stone reference.
- Comparison table.
- Proof metric.
- Video embed.
- Callout.

Validation:
- A non-developer can add a project and publish it without code changes.
- A non-developer can update a stone finish image and see it reflected on the public site.
- A non-developer can publish an article from approved block types.
- Unpublished content does not appear publicly.
- Admin sessions expire and unauthenticated users cannot access `/admin`.

### 4. Forms and Lead Capture
Outcome: Contact and Sample Request become real business workflows, not email-draft fallbacks.

Required work:
- Replace mailto-only submit paths with `/api/enquiries` and `/api/sample-requests`. Source implemented.
- Add server-side validation. Source implemented.
- Add Cloudflare Turnstile verification. Source implemented and fails closed when a secret is configured.
- Insert submissions into Supabase. Source implemented; live verification pending `SUPABASE_SERVICE_ROLE_KEY`.
- Record server-side audit events for successful lead inserts. Source implemented; live verification pending `SUPABASE_SERVICE_ROLE_KEY`.
- Send transactional email notification. Resend integration is staged behind server-side environment variables.
- Show clear success/error states to the visitor. Source implemented.
- Add admin status workflow: new, contacted, quoted, won, closed, spam.
- Lead inbox source is implemented under `/admin/leads`; live usefulness still depends on verified Supabase form persistence and notification secrets.

Validation:
- Valid public submissions create Supabase records.
- Invalid submissions fail without creating records.
- Bot-protection failures fail closed.
- Audit logging failure does not fail a visitor submission after the lead row is stored.
- Notification email arrives with enough context to act.
- Admin can update status and add internal notes.

### 5. Media and Performance
Outcome: the launch no longer depends on uncontrolled old-site media and the homepage remains usable on mobile.

Required work:
- Inventory all remote old-site URLs.
- Migrate priority homepage, logo, project, product, Stone Library, and article assets to controlled storage.
- Replace homepage video with a launch-safe source, poster, compression profile, and mobile fallback.
- Add image alt text and dimensions where possible.
- Keep large files out of the main JavaScript bundle.
- Decide R2/Stream only after the actual video size and usage pattern are known.

Validation:
- No first-viewport critical asset depends on old WordPress URLs.
- Homepage has a working poster and mobile fallback when video is slow or disabled.
- Public images load from controlled sources.
- Build output remains below Cloudflare Pages file limits.
- Lighthouse or Playwright checks cover mobile homepage, Projects, Products, Stone Library, Articles, and Contact.

### 6. SEO, Brand, and Content Trust
Outcome: the launched site looks credible to customers and search engines.

Required work:
- Replace default Vite title/favicon/meta.
- Add route-level title, description, canonical, and Open Graph basics.
- Clean article imports so newsletter artifacts, unsubscribe links, old tracking, and stale CTAs are removed.
- Confirm project facts before public claims.
- Review carbon, cost, speed, safety, and durability claims against the brand baseline.
- Fix visible copy issues before launch.
- Complete social links or intentionally hide inactive ones.

Validation:
- No Vite/default metadata remains.
- Search/social previews show Urblo-owned copy and imagery.
- Claims are qualified or backed by evidence.
- Article pages read as website articles, not pasted newsletters.
- Footer/social/icon details are coherent.

### 7. Operations and Handoff
Outcome: the client can safely operate the site, and future AI Agent work has clear contracts.

Required work:
- Document environment variables and where they live.
- Document deployment, preview, rollback, and DNS cutover.
- Document admin roles and allowed actions.
- Document content publishing workflow.
- Document form notification and lead management workflow.
- Record residual risks in handoff.
- Keep task state in `docs/agent/tasks.json`.

Validation:
- A new agent can run `npm run agent:init` and understand the launch architecture.
- A new agent can identify the next task from `docs/agent/tasks.json`.
- Runtime changes still pass build/lint/typecheck/smoke gates.
- Docs-only changes pass harness checks.

## Launch Readiness Gate
The site is not production-ready until all of the following are true:
- Cloudflare Pages preview and production deployment work.
- Supabase schema, RLS, Auth, and Storage are configured.
- Forms submit to Supabase and send notifications.
- Admin users can CRUD Projects, Stone Library, Products, Articles, and lead records.
- Priority media no longer depends on old WordPress URLs.
- Homepage video has a controlled delivery and mobile fallback.
- Default metadata and placeholder UI are removed.
- Key routes pass responsive QA.
- DNS cutover and rollback are documented.

## Source References
- Cloudflare Pages limits and build behavior: https://developers.cloudflare.com/pages/platform/limits/
- Cloudflare Pages Functions routing: https://developers.cloudflare.com/pages/functions/routing/
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare R2 pricing: https://developers.cloudflare.com/r2/pricing/
- Cloudflare Turnstile pricing: https://www.cloudflare.com/en-gb/application-services/products/turnstile/
- Supabase pricing and billing: https://supabase.com/pricing and https://supabase.com/docs/guides/platform/billing-on-supabase
- Resend pricing: https://resend.com/pricing
