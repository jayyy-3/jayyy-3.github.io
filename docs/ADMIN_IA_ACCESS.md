# Urblo Admin IA and Access Contract

Last updated: 2026-05-28

## Purpose
This document defines the executable contract for Urblo's `/admin` site.

Admin auth shell source is now implemented and config-gated. Settings, Media, Stone Library, and Projects are the first source CRUD screens. This does not mean live first-admin verification, live upload/save verification, Stone Library/Projects live save verification, or broader Products/Articles/Leads CRUD screens are complete; it defines and tracks what those implementation tasks must build next.

## Product Principle
The admin site exists so Urblo can maintain launch-critical content without code edits while protecting public pages from drafts, unreviewed claims, missing media, and broken lead workflows.

The first admin release should feel like an operating console, not a marketing site:
- dense but readable lists;
- obvious content health warnings;
- clear draft/published state;
- restrained editing screens;
- no decorative cards inside cards;
- no free-form page builder where structured content is safer.

## Route Map

| Route | Purpose | Access State | Notes |
|---|---|---|---|
| `/admin` | Admin dashboard redirect target | Authenticated admin only | Shows content health, recent leads, draft content, and launch warnings. |
| `/admin/login` | Login screen | Unauthenticated only | Uses Supabase Auth. Authenticated users redirect to `/admin`. |
| `/admin/unauthorized` | Active session without admin profile or allowed role | Authenticated but not authorized | Do not reveal private content or row counts. |
| `/admin/loading` | Session/profile bootstrap state | Transitional | Use while Supabase Auth session and `admin_profiles` are loading. |
| `/admin/leads` | Enquiry and sample request inbox | Admin/editor/viewer read; owner/admin assign/export | First operational module after auth. |
| `/admin/media` | Media library and asset metadata | Admin/editor write; viewer read | Uploads require Supabase Storage. Alt text and usage notes are required before publish. |
| `/admin/stone-library` | Stone groups, variants, finishes, and images | Admin/editor write; viewer read | Missing image and TBC states must stay explicit. |
| `/admin/projects` | Project list and case study editor | Admin/editor write; viewer read | Includes galleries, material schedules, and material-map hotspots. |
| `/admin/products` | Product families, models, specs, and defaults | Admin/editor write; viewer read | Material defaults should reference Stone Library records where possible. |
| `/admin/articles` | Structured article editor | Admin/editor write; viewer read | Uses approved blocks, not raw newsletter HTML as normal authoring. |
| `/admin/settings` | Site settings, admin users, notification settings | Owner/admin only | Includes admin profile management and global site settings. |
| `/admin/audit` | Audit event review | Owner/admin read | Mutation history, publish events, and sensitive operations. |

## Access States

| State | User Experience | Technical Rule |
|---|---|---|
| Loading | Minimal admin shell or loading panel. | Session and `admin_profiles` query not resolved. |
| Unauthenticated | Redirect to `/admin/login`. | No Supabase Auth session. |
| Authenticated but unprofiled | Redirect to `/admin/unauthorized`. | Supabase session exists, but no active `admin_profiles` row. |
| Inactive admin | Redirect to `/admin/unauthorized`. | `admin_profiles.is_active = false`. |
| Viewer | Read-only admin views. | Can inspect content/leads but cannot mutate, publish, delete, export, or manage users. |
| Editor | Draft and edit content, manage non-sensitive media metadata. | Cannot manage admin users, publish high-risk content without approval, delete records, or export leads. |
| Admin | Full content operations, publish, assign leads, export leads, manage media. | Cannot remove owner protection unless explicitly allowed by owner policy. |
| Owner | Full account-level admin. | Can manage admin profiles, dangerous deletes, settings, and audit access. |

## Workflow States

All content modules should use explicit public visibility states.

| State | Meaning | Public Site Behavior |
|---|---|---|
| `draft` | Work in progress. | Never public. |
| `review` | Ready for internal review or claim/media check. | Never public unless a later preview system is built. |
| `published` | Approved for public website. | Public reads can expose it. |
| `archived` | Hidden but retained. | Never public. |
| `tbc` | Valid domain state for incomplete Stone Library data. | Public only where the current public UX intentionally labels it as upcoming/TBC. |

Lead modules use operational status instead of public visibility:
- enquiries: `new`, `contacted`, `quoted`, `won`, `closed`, `spam`;
- sample requests: `new`, `confirmed`, `packed`, `sent`, `closed`, `spam`.

## Module Rollout Sequence

| Phase | Module | Why This Order | Dependencies |
|---|---|---|---|
| 1 | Auth shell and profile gate | Protects every later screen. | Supabase Auth, `admin_profiles`, RLS. |
| 2 | Leads inbox | Makes Contact and Sample Request business-safe. | Forms, Turnstile, email notification, RLS. |
| 3 | Media library | Needed by every content module. | Supabase Storage, `media_assets`, image validation. |
| 4 | Stone Library | Highest repeated maintenance value and clearest CRUD model. | Media, Stone Library tables, public read contract. |
| 5 | Projects | Enables material-map case studies and launch proof updates. | Media, Stone Library references, claim review fields. |
| 6 | Products | Depends on stable Stone Library references for material defaults. | Product tables, Stone Library references, media. |
| 7 | Articles | Most editorial complexity; use structured blocks after simpler modules prove the pattern. | Media, article block schema, claim-safe templates. |
| 8 | Settings and audit hardening | Needed before broader team handoff. | Admin roles, audit events, notification settings. |

## Field Ownership Model

### Leads

| Area | Customer Editable | System Computed | Developer / Admin-Only |
|---|---|---|---|
| Enquiry status | status, assigned owner, internal notes | created/updated timestamps, source route, notification status | Turnstile result, raw request metadata, spam rules |
| Sample request status | status, assigned owner, internal notes, item fulfilment notes | created/updated timestamps, source route, notification status | Turnstile result, request validation rules |
| Export | date/status filters | export generated timestamp | export permission and storage policy |

### Media

| Area | Customer Editable | System Computed | Developer / Admin-Only |
|---|---|---|---|
| Asset metadata | alt, caption, credit, usage notes, status | width, height, mime type, size, upload timestamp | bucket policy, object path conventions, transformation rules |
| Publication | draft/published/archived | public URL after storage write | storage bucket selection, signed URL policy |
| Reuse | usage notes, tags later if needed | linked usage count later if implemented | orphan cleanup scripts |

### Stone Library

| Area | Customer Editable | System Computed | Developer / Admin-Only |
|---|---|---|---|
| Stone group | display name, type display, origin fields, price source/tier, status, sort order, summary/notes | updated timestamps, public slug/key validation | source import keys, schema constraints |
| Variants | display label, variant type, status, order | active variant fallback | source variant key migration |
| Finishes | capability, behavior note, admin note, source list | finish key normalization | canonical finish dictionary changes |
| Images | primary/secondary/detail/swatch media, order, status, alt via media | image dimensions, missing-image health | storage policy and transformation presets |

### Projects

| Area | Customer Editable | System Computed | Developer / Admin-Only |
|---|---|---|---|
| Project record | title, summary, lead, location, date labels, collaborators, status, SEO, order | slug uniqueness, timestamps | legacy migration source fields |
| Facts and claims | fact labels/values, claim status, display order | content health warnings for unapproved claims | claim taxonomy if later formalized |
| Media and gallery | cover, hero, gallery, captions, order | image dimensions and usage records | storage policy |
| Material map | map image, hotspot positions, labels, linked material rows | coordinate validation | advanced editor calibration rules |

### Products

| Area | Customer Editable | System Computed | Developer / Admin-Only |
|---|---|---|---|
| Product family | name, description, status, SEO, sort order | lowercase kebab-case slug uniqueness and redirect alias preservation | model key migration |
| Models | labels, images, status, order | default active model | model key migration |
| Material defaults | linked stone group, display label, category | fallback image and option resolution | category enum changes |
| Specs | spec label/value/order | content health if required specs missing | validation rules for future configurators |

### Articles

| Area | Customer Editable | System Computed | Developer / Admin-Only |
|---|---|---|---|
| Article metadata | title, excerpt, author, publish date, cover, tags, SEO, status | slug uniqueness, reading metadata if later added | legacy source path |
| Blocks | approved block content, media, order, status | block rendering and sanitization | block schema changes |
| Claims | proof metrics, comparison tables, project/stone references | broken reference warnings | claim rules and migration tooling |
| Legacy imports | review and rewrite source material | migration diagnostics | raw newsletter HTML importer |

## Module Health Checks

The dashboard should surface these before content can be considered publish-ready:
- published content missing title, slug, cover image, or SEO essentials;
- Stone Library record with published status but missing image where an approved source exists;
- Stone Library TBC records visible publicly without deliberate TBC copy;
- project claims marked `needs_review`;
- product pages with missing default materials or missing model images;
- article blocks with legacy tracking links, raw newsletter artifacts, or missing alt text;
- leads stuck in `new` for more than a configured threshold;
- media assets missing alt text while used publicly.

## Implementation Boundaries

Do now, before credentials:
- keep this contract and task queue current;
- design route map, access states, field ownership, and rollout order;
- keep follow-up implementation tasks blocked where they require secrets;
- keep `/admin` protected by a configuration-required state when no browser-safe Supabase key is present.

Current implementation:
- `/admin`, `/admin/login`, `/admin/unauthorized`, and protected module routes exist outside the public site chrome.
- The admin shell uses Supabase Auth and `admin_profiles` lookup when browser-safe Supabase configuration is present.
- Without `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`, admin routes render a configuration-required state and do not show dashboard content.
- `/admin/settings` is the first CRUD source screen behind the auth gate, with owner/admin save controls for the default `site_settings` row.
- `/admin/media` is the first media CRUD source screen behind the auth gate, with admin/editor upload and metadata controls, viewer read-only behavior, and publish/archive guardrails.
- `/admin/stone-library` is the first content CRUD source screen behind the auth gate, with group, variant, finish capability, validation, publish/archive, and read-only states.
- `/admin/projects` is the next content CRUD source screen behind the auth gate, with project, fact, material schedule, material map, hotspot, validation, claim-review, publish/archive, and read-only states.
- Products, Articles, Leads, and Audit module screens are scaffolded behind the auth gate only; they are not editable CRUD modules yet.

Do not do before credentials:
- fake authentication in production routes;
- ship a public `/admin` placeholder that implies login works;
- create browser-side Supabase service-role access;
- allow anonymous inserts directly into lead tables without Turnstile/server validation;
- treat raw article HTML as the long-term admin authoring format.

## Follow-Up Task Mapping

| Follow-up | Uses This Contract For |
|---|---|
| `NOW-ADMIN-AUTH-RLS-001` | Auth shell, access states, roles, RLS expectations. |
| `NOW-ADMIN-CONTENT-CRUD-001` | Stone Library, Projects, Products, Articles modules and field ownership. |
| `NOW-ADMIN-MEDIA-LEADS-001` | Media library, Storage policies, leads inbox, sample request workflow. |
| `NOW-FORMS-SUPABASE-001` | Lead statuses, source route, notification, Turnstile assumptions. |
| `NOW-CLOUDFLARE-PAGES-DEPLOY-001` | `/admin` route protection, Pages Functions, environment variables, rollback expectations. |
