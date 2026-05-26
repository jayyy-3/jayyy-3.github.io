# Urblo Supabase Schema Plan

Last updated: 2026-05-26

## Purpose
This document defines the first production Supabase data model for the Urblo website launch.

It is a schema design contract, not proof that the database has already been created. Runtime work must still implement migrations, seed scripts, RLS policies, Cloudflare Pages Functions, and admin UI.

## Current Supabase Project

The Supabase connector can access the Urblo project directly. Do not ask the user to manually create tables in the dashboard unless a connector or migration path is blocked.

| Field | Value |
|---|---|
| Project name | `Urblo` |
| Project ref | `npkidywzwddbnfrnxlmo` |
| Region | `ap-southeast-2` |
| Status checked | `ACTIVE_HEALTHY` on 2026-05-26 |

Secrets still must not be committed or pasted into repo docs. Service-role keys, database passwords, Turnstile secrets, and email provider secrets belong only in server-side environment variable stores.

## Supabase Execution Plan

### Phase 1 - Foundation Migration
Outcome: the production Supabase project has the core schema, constraints, helper functions, indexes, and RLS posture needed before public forms or admin screens are connected.

Scope:
- Admin/access tables: `admin_profiles`, `admin_audit_events`.
- Lead tables: `enquiries`, `sample_requests`, `sample_request_items`.
- Shared tables needed by later content work: `media_assets`, `site_settings`, `finish_definitions`.
- Core content table skeletons for Stone Library, Products, Projects, and Articles as defined below.
- Common `updated_at` trigger helper.
- Foreign-key and status indexes required by the RLS and listing patterns.
- RLS enabled on all public/admin/lead tables.

Acceptance:
- Supabase migration list includes the applied foundation migration on project `npkidywzwddbnfrnxlmo`.
- Table listing confirms every foundation table exists in the `public` schema.
- `pg_class.relrowsecurity` confirms RLS is enabled for all exposed tables.
- `pg_policies` confirms anonymous users can only read published public content and cannot read leads, admin profiles, or audit events.
- Private form tables have operational partial indexes for new lead queues.
- The migration is represented in repo review material under `supabase/migrations`.

### Phase 2 - Baseline Seeds
Outcome: the database has enough safe baseline data for forms/admin work without moving all public content yet.

Scope:
- Seed canonical `finish_definitions`.
- Seed one published `site_settings` row for Urblo contact/site identity.
- Seed initial media placeholder records only where needed for future migration references.

Acceptance:
- `finish_definitions` contains the approved first finish dictionary.
- `site_settings` contains one published `default` row.
- Seed scripts are idempotent: rerunning them does not duplicate rows.

### Phase 3 - Forms Backend
Outcome: Contact and Sample Request become durable business workflows.

Scope:
- Build `/api/enquiries` and `/api/sample-requests` as Cloudflare Pages Functions.
- Server-side validation and normalization.
- Turnstile verification when keys are configured.
- Insert validated submissions into Supabase.
- Add notification status handling and later email notification.
- Replace public mailto-only submit flows with clear success/failure states.

Acceptance:
- Valid enquiry and sample request submissions create Supabase rows.
- Invalid submissions return a clear validation error and create no rows.
- Turnstile failure fails closed when Turnstile is enabled.
- Visitor UI no longer depends on opening a local email client for the main submit action.
- Admin/lead-management follow-up can read submitted records through protected access.

### Phase 4 - Admin Auth Shell
Outcome: `/admin` exists as a protected operating console, not a public placeholder.

Scope:
- Supabase Auth client configuration.
- `/admin/login`, `/admin`, `/admin/unauthorized`, and loading/session bootstrap states.
- `admin_profiles` role check.
- Read-only dashboard shell with content/lead health placeholders.

Acceptance:
- Unauthenticated users cannot view admin content.
- Authenticated users without an active admin profile see unauthorized state.
- Active admin users can reach the dashboard.
- No service-role key is shipped to browser code.

### Phase 5 - Content Migration and CRUD
Outcome: content can move out of static files in a controlled order.

Order:
1. Media records and Storage policy.
2. Stone Library data.
3. Projects and project material maps.
4. Products.
5. Articles as structured blocks.

Acceptance:
- Public routes continue exposing only published content.
- Static-file fallback remains available until each content type is fully migrated.
- Customer-editable fields match `docs/ADMIN_IA_ACCESS.md`.
- Raw newsletter HTML is not the normal admin article authoring model.

## Design Goals
- Let Urblo maintain site content without code edits.
- Keep public pages fast and safe by exposing only published content.
- Keep enquiries and sample requests durable, searchable, and private.
- Make Projects, Stone Library, Products, Articles, media, and leads editable from `/admin`.
- Preserve clear separation between confirmed facts, draft content, and inferred MVP notes.
- Keep the model friendly to future AI Agent work by using explicit tables, predictable names, and migration-ready contracts.

## Naming and Type Rules
- Table names use lowercase `snake_case`.
- Internal content tables use `bigint generated always as identity` primary keys.
- References to Supabase Auth users use `uuid` because `auth.users.id` is a UUID.
- Public URLs use stable text slugs, not database IDs.
- Time fields use `timestamptz`.
- Flexible content blocks use `jsonb` only where the editor truly needs block-specific shape.
- Status fields use `text` plus `check` constraints unless a later migration introduces Postgres enum types.
- All foreign key columns should be indexed.

## Shared Fields
Most editable content tables should include:

| Field | Type | Purpose |
|---|---|---|
| `id` | `bigint identity primary key` | Internal row identity. |
| `status` | `text` | `draft`, `published`, `archived`, or more specific workflow values. |
| `sort_order` | `integer` | Customer-controlled ordering. |
| `created_at` | `timestamptz` | Audit timestamp. |
| `updated_at` | `timestamptz` | Audit timestamp. |
| `created_by` | `uuid` | Supabase Auth user who created the row. |
| `updated_by` | `uuid` | Supabase Auth user who last updated the row. |
| `published_at` | `timestamptz` | Public visibility timestamp where relevant. |
| `archived_at` | `timestamptz` | Archive timestamp where relevant. |

## Admin and Access Tables
The `/admin` route map, access states, role behavior, module rollout order, and first-pass field ownership model are defined in `docs/ADMIN_IA_ACCESS.md`. This schema plan defines the tables that support that contract.

### `admin_profiles`
Purpose: maps Supabase Auth users to Urblo admin roles.

Fields:
- `user_id uuid primary key references auth.users(id)`
- `email text not null`
- `display_name text`
- `role text not null check (role in ('owner', 'admin', 'editor', 'viewer'))`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Access:
- Owners/admins can manage admin profiles.
- Editors can manage content but not admin users.
- Viewers can read admin content but not publish or delete.

### `admin_audit_events`
Purpose: records admin mutations and operationally important actions.

Fields:
- `id bigint identity primary key`
- `actor_user_id uuid references auth.users(id)`
- `action text not null`
- `entity_type text not null`
- `entity_id bigint`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`

Access:
- Admin read only.
- Writes should be created by server-side code or admin mutation helpers.

## Site Settings

### `site_settings`
Purpose: global site identity and reusable site chrome.

Fields:
- `id bigint identity primary key`
- `settings_key text not null unique`
- `status text not null default 'published' check (status in ('draft', 'published', 'archived'))`
- `logo_media_id bigint references media_assets(id)`
- `favicon_media_id bigint references media_assets(id)`
- `default_share_media_id bigint references media_assets(id)`
- `company_name text not null default 'Urblo'`
- `primary_email text`
- `primary_phone text`
- `social_links jsonb not null default '{}'::jsonb`
- `footer_columns jsonb not null default '[]'::jsonb`
- `seo jsonb not null default '{}'::jsonb`
- shared audit fields

Public behavior:
- Public pages read only the active published settings row.

## Media

### Storage Buckets
Recommended first buckets:
- `urblo-public-media`: public-read assets used on the live site.
- `urblo-admin-media`: private draft/review assets for admin work.

Policy:
- Public users can read `urblo-public-media`.
- Only active admin users can upload/update/delete objects.
- Draft or unapproved assets should stay in the private bucket until publication.
- Large homepage video should be reviewed separately for Cloudflare R2 or Stream if Supabase Storage is not the best delivery path.

### `media_assets`
Purpose: metadata layer over storage objects and legacy external URLs.

Fields:
- `id bigint identity primary key`
- `status text not null default 'draft' check (status in ('draft', 'published', 'archived'))`
- `bucket text`
- `object_path text`
- `source_url text`
- `source_kind text not null default 'storage' check (source_kind in ('storage', 'external_legacy', 'r2', 'stream'))`
- `media_type text not null check (media_type in ('image', 'video', 'document', 'other'))`
- `mime_type text`
- `width_px integer`
- `height_px integer`
- `size_bytes bigint`
- `alt text`
- `caption text`
- `credit text`
- `usage_notes text`
- shared audit fields

Migration note:
- Old WordPress/Squarespace URLs should first be imported as `external_legacy` records, then replaced with controlled storage records as assets are migrated.

## Stone Library

### `finish_definitions`
Purpose: canonical surface finish dictionary.

Fields:
- `id bigint identity primary key`
- `finish_key text not null unique`
- `display_name text not null`
- `description text`
- `sort_order integer not null default 0`
- `status text not null default 'published' check (status in ('draft', 'published', 'archived'))`
- shared audit fields

Initial examples:
- `flamed`
- `sawn`
- `honed`
- `polished`
- `bush_hammered`
- `combed`
- `rippling`
- `rock_face`
- `sparrow_peck`
- `sandblasted`

### `stone_groups`
Purpose: public stone family records.

Fields:
- `id bigint identity primary key`
- `stone_group_key text not null unique`
- `display_name text not null`
- `source_name text`
- `status text not null default 'draft' check (status in ('draft', 'published', 'archived', 'tbc'))`
- `stone_type_source text`
- `stone_type_display text`
- `origin_region text`
- `origin_country text`
- `price_source text`
- `price_tier integer check (price_tier in (1, 2, 3))`
- `raw_block_length_mm integer`
- `raw_block_width_mm integer`
- `raw_block_height_mm integer`
- `summary text`
- `notes text`
- shared audit fields

Public behavior:
- Public Stone Library reads rows with `status = 'published'`.
- `tbc` can remain admin-visible until approved for public display.

### `stone_variants`
Purpose: variants inside a stone group.

Fields:
- `id bigint identity primary key`
- `stone_group_id bigint not null references stone_groups(id) on delete cascade`
- `variant_key text not null`
- `display_name text`
- `source_variant text`
- `variant_type text not null default 'none'`
- `status text not null default 'draft' check (status in ('draft', 'published', 'archived', 'tbc'))`
- `sort_order integer not null default 0`
- shared audit fields

Constraints:
- Unique `stone_group_id, variant_key`.

### `stone_finish_capabilities`
Purpose: which finish is available for which stone variant.

Fields:
- `id bigint identity primary key`
- `stone_variant_id bigint not null references stone_variants(id) on delete cascade`
- `finish_definition_id bigint not null references finish_definitions(id)`
- `capability text not null check (capability in ('yes', 'no', 'tbc'))`
- `sources text[] not null default '{}'::text[]`
- `behavior_note text`
- `admin_note text`
- shared audit fields

Constraints:
- Unique `stone_variant_id, finish_definition_id`.

### `stone_finish_images`
Purpose: primary and secondary images per stone/variant/finish.

Fields:
- `id bigint identity primary key`
- `stone_group_id bigint references stone_groups(id) on delete cascade`
- `stone_variant_id bigint references stone_variants(id) on delete cascade`
- `finish_definition_id bigint references finish_definitions(id)`
- `media_asset_id bigint not null references media_assets(id)`
- `image_role text not null default 'primary' check (image_role in ('primary', 'secondary', 'detail', 'swatch'))`
- `sort_order integer not null default 0`
- `status text not null default 'published' check (status in ('draft', 'published', 'archived'))`
- shared audit fields

## Products

### `products`
Purpose: product families shown on `/products` and product detail pages.

Fields:
- `id bigint identity primary key`
- `slug text not null unique`
- `name text not null`
- `status text not null default 'draft' check (status in ('draft', 'published', 'archived'))`
- `short_description text`
- `hero_media_id bigint references media_assets(id)`
- `seo jsonb not null default '{}'::jsonb`
- `sort_order integer not null default 0`
- shared audit fields

### `product_models`
Purpose: model options such as Core, Timber Rise, and Timber Flush.

Fields:
- `id bigint identity primary key`
- `product_id bigint not null references products(id) on delete cascade`
- `model_key text not null`
- `label text not null`
- `image_media_id bigint references media_assets(id)`
- `status text not null default 'published' check (status in ('draft', 'published', 'archived'))`
- `sort_order integer not null default 0`
- shared audit fields

Constraints:
- Unique `product_id, model_key`.

### `product_material_defaults`
Purpose: default material selections by product category.

Fields:
- `id bigint identity primary key`
- `product_id bigint not null references products(id) on delete cascade`
- `material_category text not null check (material_category in ('body', 'frame', 'battens'))`
- `stone_group_id bigint references stone_groups(id)`
- `material_slug text`
- `display_label text`
- shared audit fields

Constraints:
- Unique `product_id, material_category`.

### `product_specs`
Purpose: editable product specification key-value rows.

Fields:
- `id bigint identity primary key`
- `product_id bigint not null references products(id) on delete cascade`
- `spec_label text not null`
- `spec_value text not null`
- `sort_order integer not null default 0`
- shared audit fields

## Projects

### `projects`
Purpose: project listing and detail pages.

Fields:
- `id bigint identity primary key`
- `slug text not null unique`
- `title text not null`
- `status text not null default 'draft' check (status in ('draft', 'published', 'archived'))`
- `location text`
- `project_date_label text`
- `completed_on date`
- `summary text`
- `lead text`
- `client text`
- `landscape_architect text`
- `contractor text`
- `address text`
- `quantity_label text`
- `carbon_status text check (carbon_status in ('yes', 'no', 'not_available', 'tbc'))`
- `carbon_note text`
- `claim_review_status text not null default 'needs_review' check (claim_review_status in ('needs_review', 'approved', 'deferred'))`
- `hero_media_id bigint references media_assets(id)`
- `cover_media_id bigint references media_assets(id)`
- `seo jsonb not null default '{}'::jsonb`
- `sort_order integer not null default 0`
- shared audit fields

### `project_facts`
Purpose: flexible project fact list for client/designer/contractor/quantity/detail rows.

Fields:
- `id bigint identity primary key`
- `project_id bigint not null references projects(id) on delete cascade`
- `fact_label text not null`
- `fact_value text`
- `fact_value_json jsonb`
- `claim_status text not null default 'needs_review' check (claim_status in ('needs_review', 'approved', 'deferred'))`
- `sort_order integer not null default 0`
- shared audit fields

### `project_media`
Purpose: galleries, covers, map images, and supporting images.

Fields:
- `id bigint identity primary key`
- `project_id bigint not null references projects(id) on delete cascade`
- `media_asset_id bigint not null references media_assets(id)`
- `media_role text not null check (media_role in ('cover', 'hero', 'gallery', 'material_map', 'supporting'))`
- `label text`
- `caption text`
- `sort_order integer not null default 0`
- `status text not null default 'published' check (status in ('draft', 'published', 'archived'))`
- shared audit fields

### `project_materials`
Purpose: material schedule rows.

Fields:
- `id bigint identity primary key`
- `project_id bigint not null references projects(id) on delete cascade`
- `stone_group_id bigint references stone_groups(id)`
- `finish_definition_id bigint references finish_definitions(id)`
- `application text not null`
- `note text`
- `media_asset_id bigint references media_assets(id)`
- `claim_status text not null default 'needs_review' check (claim_status in ('needs_review', 'approved', 'deferred'))`
- `sort_order integer not null default 0`
- shared audit fields

### `project_material_maps`
Purpose: one or more clickable project images.

Fields:
- `id bigint identity primary key`
- `project_id bigint not null references projects(id) on delete cascade`
- `media_asset_id bigint not null references media_assets(id)`
- `title text`
- `intro text`
- `sort_order integer not null default 0`
- `status text not null default 'published' check (status in ('draft', 'published', 'archived'))`
- shared audit fields

### `project_hotspots`
Purpose: clickable material points on project photos.

Fields:
- `id bigint identity primary key`
- `project_material_map_id bigint not null references project_material_maps(id) on delete cascade`
- `project_material_id bigint references project_materials(id) on delete set null`
- `hotspot_key text not null`
- `x_percent numeric(5,2) not null check (x_percent >= 0 and x_percent <= 100)`
- `y_percent numeric(5,2) not null check (y_percent >= 0 and y_percent <= 100)`
- `label text`
- `application text`
- `note text`
- `preview_media_id bigint references media_assets(id)`
- `sort_order integer not null default 0`
- `status text not null default 'published' check (status in ('draft', 'published', 'archived'))`
- shared audit fields

Constraints:
- Unique `project_material_map_id, hotspot_key`.

## Articles

### `articles`
Purpose: website article metadata.

Fields:
- `id bigint identity primary key`
- `slug text not null unique`
- `title text not null`
- `status text not null default 'draft' check (status in ('draft', 'published', 'archived'))`
- `published_on date`
- `author text`
- `excerpt text`
- `cover_media_id bigint references media_assets(id)`
- `tags text[] not null default '{}'::text[]`
- `seo jsonb not null default '{}'::jsonb`
- `legacy_source_path text`
- `legacy_source_url text`
- `sort_order integer not null default 0`
- shared audit fields

### `article_blocks`
Purpose: structured article body blocks.

Fields:
- `id bigint identity primary key`
- `article_id bigint not null references articles(id) on delete cascade`
- `block_type text not null check (block_type in ('rich_text', 'image', 'gallery', 'quote', 'faq', 'cta', 'project_spotlight', 'stone_reference', 'comparison_table', 'proof_metric', 'video_embed', 'callout'))`
- `content jsonb not null default '{}'::jsonb`
- `media_asset_id bigint references media_assets(id)`
- `linked_project_id bigint references projects(id)`
- `linked_stone_group_id bigint references stone_groups(id)`
- `sort_order integer not null default 0`
- `status text not null default 'published' check (status in ('draft', 'published', 'archived'))`
- shared audit fields

Migration note:
- Current newsletter HTML should be treated as source material and converted into blocks.
- Raw HTML should not be the normal admin authoring format.

## Forms and Leads

### `enquiries`
Purpose: Contact form submissions.

Fields:
- `id bigint identity primary key`
- `status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'closed', 'spam'))`
- `name text not null`
- `email text not null`
- `phone text`
- `company text`
- `project_type text`
- `message text`
- `source_route text`
- `turnstile_success boolean`
- `notification_status text not null default 'pending' check (notification_status in ('pending', 'sent', 'failed', 'not_required'))`
- `assigned_to uuid references auth.users(id)`
- `internal_notes text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `sample_requests`
Purpose: sample request workflow.

Fields:
- `id bigint identity primary key`
- `status text not null default 'new' check (status in ('new', 'confirmed', 'packed', 'sent', 'closed', 'spam'))`
- `name text not null`
- `email text not null`
- `phone text`
- `company text`
- `shipping_address text`
- `project_name text`
- `message text`
- `source_route text`
- `turnstile_success boolean`
- `notification_status text not null default 'pending' check (notification_status in ('pending', 'sent', 'failed', 'not_required'))`
- `assigned_to uuid references auth.users(id)`
- `internal_notes text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### `sample_request_items`
Purpose: requested stone/finish samples.

Fields:
- `id bigint identity primary key`
- `sample_request_id bigint not null references sample_requests(id) on delete cascade`
- `stone_group_id bigint references stone_groups(id)`
- `finish_definition_id bigint references finish_definitions(id)`
- `quantity integer not null default 1 check (quantity > 0)`
- `notes text`

## Public Read Contract
Public routes should read only published data:
- Site settings with `status = 'published'`.
- Media with `status = 'published'` and public-safe storage location.
- Stone groups, variants, finishes, finish images with public statuses.
- Products and models with public statuses.
- Projects and related records with public statuses.
- Articles and blocks with public statuses.

Implementation options:
- Prefer build-time fetching for public pages when content can be published through rebuild hooks.
- Use read-only API endpoints when content freshness matters more than full static generation.
- Keep form writes and admin writes server-side or protected by authenticated RLS policies.

## RLS Contract
RLS must be enabled on every public or admin table before production launch.

Baseline policies:
- Anonymous users can read published public content only.
- Anonymous users cannot read admin-only tables, enquiries, sample requests, audit events, or draft content.
- Public form submissions should normally go through Cloudflare Pages Functions using server-side credentials after Turnstile validation, rather than allowing broad anonymous inserts directly from the browser.
- Authenticated admin users can read and write according to their active `admin_profiles.role`.
- `service_role` keys must never be shipped to browser code.

Policy performance:
- Wrap `auth.uid()` calls with `(select auth.uid())` in policies.
- Index columns used in RLS predicates, especially `status`, `created_by`, `updated_by`, `assigned_to`, and foreign keys.
- Use security-definer helper functions only for role checks that need to bypass nested RLS, and keep their search path explicit.

## Index Plan
Minimum indexes:
- Unique slugs on `products.slug`, `projects.slug`, `articles.slug`, `stone_groups.stone_group_key`, and `finish_definitions.finish_key`.
- Foreign key indexes for all `*_id` relationship columns.
- Composite public listing indexes such as `(status, sort_order)` and `(status, published_at)` where pages filter by status and order.
- Partial indexes for operational queues, such as new enquiries and new sample requests.
- Indexes on `admin_profiles.user_id`, `admin_profiles.role`, and `admin_profiles.is_active`.

## Migration Plan

### Phase 1 - Schema and Security
- Create tables, constraints, indexes, and RLS policies.
- Create storage buckets and storage policies.
- Create one or more admin users.
- Add seed data for finish definitions and site settings.

### Phase 2 - Media Inventory
- Import current asset references into `media_assets`.
- Mark old WordPress/Squarespace URLs as `external_legacy`.
- Prioritize homepage video/poster, logo, first-viewport images, project media, Stone Library finish images, and article covers for controlled hosting.

### Phase 3 - Stone Library
- Import `data/clean/stone_library.json` into Stone Library tables.
- Preserve source fields such as source name, finish source list, raw block dimensions, and status.
- Keep placeholder/missing images explicit in admin content health.

### Phase 4 - Products
- Import `src/data/productData.ts` into products, models, specs, and material defaults.
- Preserve material defaults that point to Stone Library records where possible.

### Phase 5 - Projects
- Import `src/data/projectData.ts`.
- Preserve legacy projects with simple facts and images.
- Import Moon Gate material map into project map, material, and hotspot tables.
- Keep inferred material notes as `needs_review` until designer/project-team confirmation.

### Phase 6 - Articles
- Import article metadata from `public/articles/index.json`.
- Convert current HTML files into article blocks.
- Remove newsletter-only artifacts, tracking, unsubscribe links, and stale CTAs during editorial review.

### Phase 7 - Forms
- Implement Cloudflare Pages Functions for Contact and Sample Request.
- Verify Turnstile, Supabase insert, notification email, and admin lead workflow.

## Acceptance Checklist
- Every content type required for launch has a table owner and admin workflow.
- Draft, published, archived, and review states are explicit.
- Public read behavior is constrained to published content.
- Forms create durable private records.
- Admin roles and RLS rules are documented before implementation.
- Products are included in the CMS scope, not left as static code data.
- Old media URLs have a migration status rather than being hidden inside content fields.

## Sources
- Supabase Row Level Security docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase secure data docs: https://supabase.com/docs/guides/database/secure-data/
- Supabase Storage access control docs: https://supabase.com/docs/guides/storage/security/access-control
- PostgreSQL data type, constraints, index, and foreign key guidance via local Supabase/Postgres best-practice references.
