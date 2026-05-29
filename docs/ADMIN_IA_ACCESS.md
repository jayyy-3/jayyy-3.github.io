# Urblo Admin IA and Access Contract

Last updated: 2026-05-29

## Purpose
This document defines the executable contract for Urblo's `/admin` site.

Admin auth shell source is now implemented and config-gated. Settings/admin profiles, Media, Stone Library, Projects, Products, Articles, Leads, and Audit are the first source CRUD/workflow/review screens. The dashboard now has source-side content health checks for media metadata gaps, project claim review, missing Product/Article media, TBC Stone Library rows, and stale new leads. Stone Library source now includes finish image links from `stone_finish_images` to `media_assets`. Admin CRUD/workflow save flows now call a shared audit writer after successful primary mutations. Media and Leads now have CSV export paths that must record audit events before downloading. This does not mean live first-admin verification, live admin-profile save verification, live upload/save/export verification, Stone Library/Projects/Products/Articles/Leads live save/export verification, or live audit row creation verification are complete; it defines and tracks what those implementation tasks must build next.

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

Current launch removal model:
- Content and media records use archive/publish state changes as the customer-facing removal path.
- Physical deletes are destructive operations and remain outside the launch-critical CMS path until Jay approves a retention and destructive-delete policy.
- Live admin verification should prove publish/archive behavior, public invisibility, and auditability after archive; it should not physically delete production rows.

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
- `npm run agent:admin-config-gate` is the repeatable no-secret browser gate for this state. It starts built Vite preview by default, checks every launch-critical admin route in Firefox for the configuration-required state, rejects private admin/module text, and writes ignored screenshots under `.tmp/admin-config-gate/screenshots`.
- `npm run agent:admin-auth-browser` is the gated no-write browser login check for the configured state. It reads `.env.local`, `.env`, `.dev.vars`, and shell values without printing secrets. Default mode only prints required variable names/sources; `--allow-login --strict` signs in with `URBLO_ADMIN_EMAIL` and `URBLO_ADMIN_PASSWORD`, verifies authenticated admin route shells, and creates no content rows, Storage objects, or audit events.
- `/admin` dashboard reads content and lead counts after authentication, including a `Content health queue` for published media missing alt/usage notes, project claim-review rows, published Products/Articles missing key media, TBC Stone Library rows, and stale new leads older than 48 hours.
- Protected-route login redirects preserve a `next` target only for true `/admin`, `/admin?*`, or `/admin/*` paths, and block login/unauthorized self-loop targets before redirecting authenticated admins.
- `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` is the read-only readiness check before live browser QA. It verifies browser-safe key presence, service-role verification access, the named Auth user linked to the active admin profile, baseline seed rows, and the browser-key anonymous public/private REST boundary without creating or changing users.
- `npm run agent:first-admin-bootstrap` is the guarded first-admin setup runner. Default mode is no-write and prints the approved path; `--verify-only` reads existing Auth/profile/seed state and checks the profile is linked to the matching Auth user; `--allow-writes` plus matching `--confirm-email` is required before any invite or `admin_profiles` upsert, and that write mode needs Jay approval. The live table now also has a case-insensitive unique index on normalized profile email, and bootstrap/readiness scripts normalize profile email matching before refusing an email already linked to a different Auth user or reporting readiness.
- When first-admin write mode is approved and run, the bootstrap script records a server-side `admin_profile.bootstrap` audit event with `actor_user_id = null` because the operation is performed by the guarded service-role setup path, not a signed-in browser admin.
- `/admin/settings` is the first CRUD source screen behind the auth gate, with owner/admin save controls for the default `site_settings` row.
- `/admin/settings` also includes a non-destructive admin team manager for existing Supabase Auth users, with owner/admin profile create/update controls, owner-role guardrails, self-lockout prevention, and no delete controls.
- `/admin/settings` validates duplicate Supabase Auth user IDs and duplicate admin profile emails before save so database uniqueness failures are not the first user-facing feedback.
- `/admin/media` is the first media CRUD source screen behind the auth gate, with admin/editor upload and metadata controls, audit-gated media manifest export, viewer read-only behavior, and publish/archive guardrails.
- `/admin/stone-library` is the first content CRUD source screen behind the auth gate, with group, variant, finish capability, finish image link, validation, publish/archive, and read-only states.
- `/admin/projects` is the next content CRUD source screen behind the auth gate, with project, fact, material schedule, material map, hotspot, validation, claim-review, publish/archive, and read-only states.
- `/admin/products` is the next content CRUD source screen behind the auth gate, with product family, model, material default, spec, validation, publish/archive, and read-only states.
- `/admin/articles` is the next content CRUD source screen behind the auth gate, with article metadata, structured block rows, reference links, legacy-source provenance, validation, publish/archive, and read-only states.
- `/admin/leads` is the first lead workflow source screen behind the auth gate, with enquiry/sample request queues, contact detail, sample items, status updates, assignment, internal notes, notification state, read-only states, and an owner/admin CSV export action that is blocked unless an audit event is recorded.
- `/admin/audit` is the first audit visibility source screen behind the auth gate, with owner/admin read access, actor/entity filters, metadata inspection, empty states, and no mutation/delete controls.
- `src/lib/adminAudit.ts` is the shared browser-side audit writer used by admin Settings, Media, Stone Library, Projects, Products, Articles, and Leads save flows. It records successful primary mutations into `admin_audit_events`; audit insert failure is surfaced in the success notice without rolling back the primary save.
- `npm run agent:admin-crud-coverage` is the source-only admin coverage check. It verifies active route/module registration, protected shell coverage, launch-critical table references, role-gated controls, validation/save state paths, publish/archive lifecycle paths, shared audit writer usage, and audit-gated Media/Leads exports before live credential QA.
- The same source-only coverage now fails if admin source or the live verifier introduces Supabase `.delete()` mutations, HTTP `DELETE` requests, destructive RPC names, or visible `Delete`/`Remove` controls; launch removal stays archive-first until Jay approves a destructive-delete/retention policy.
- `npm run agent:admin-crud-live` is the credential-gated live admin write check. Default mode is plan-only and performs no writes. With `--allow-writes`, it requires a browser-safe key plus a real owner/admin Supabase Auth session, then creates tagged QA records across launch-critical admin tables, verifies dashboard-health predicates against tagged QA rows before archive cleanup, publishes and archives public-facing QA rows through normal RLS, records audit-gated export actions, and verifies tagged archived public-content QA rows plus private lead QA rows are not anonymously visible through browser-key reads. With `--include-storage`, it also verifies the uploaded private `urblo-admin-media` object can be read back by the signed-in admin and is denied to anonymous browser-key reads. It does not physically delete live data.
- Supabase `admin_profile_owner_hardening` keeps owner-role assignment and owner-profile changes owner-protected, while admins can maintain non-owner profiles.
- Supabase `security_definer_function_grants` and `security_definer_private_helpers` revoke exposed public helper RPC execution from browser roles; authenticated RLS/Storage policy evaluation now uses private SECURITY DEFINER helpers from a non-exposed schema.
- Supabase `admin_profile_email_uniqueness` keeps admin profile email lookups unambiguous for first-admin bootstrap and readiness checks.

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
