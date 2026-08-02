# Urblo Admin IA and Access Contract

Last updated: 2026-07-19

## Purpose
This document defines the executable contract for Urblo's `/admin` site.

Admin auth, CRUD shells, schema/RLS, import, and direct browser-key verification exist, but the production handoff is reopened after Jay's 2026-07-13 not-working report. Earlier verification proved route access and database mutations; it did not prove a non-technical editor completing the UI golden workflow. `NOW-ADMIN-RELIABILITY-UX-001` owns the incident, confirmed source failures, production revalidation, and task-oriented redesign. This document describes current code reality plus the required target; `docs/agent/admin-handoff-evidence.json` decides whether production handoff is actually verified.

## Product Principle
The admin site exists so Urblo can maintain launch-critical content without code edits while protecting public pages from drafts, unreviewed claims, missing media, and broken lead workflows.

The admin should feel like a calm operating workspace, not a marketing site or database console:
- compact, searchable lists paired with progressively disclosed editors;
- obvious content health warnings;
- clear draft/published state;
- stable record URLs, unsaved-change protection, and restrained editing stages;
- no decorative cards inside cards;
- no free-form page builder where structured content is safer.

## Route Map

| Route | Purpose | Access State | Notes |
|---|---|---|---|
| `/admin` | Admin dashboard redirect target | Authenticated admin only | Shows content health, recent leads, draft content, and launch warnings. |
| `/admin/login` | Login screen | Unauthenticated only | Uses Supabase Auth. Authenticated users redirect to `/admin`. |
| `/admin/account-setup` | Invite acceptance and password recovery | Valid Supabase invite/recovery callback session only | Current implicit flow captures and clears the callback fragment, keeps it out of the shared session, and server-validates then updates through one isolated callback client before returning to explicit sign-in. |
| `/admin/unauthorized` | Active session without admin profile or allowed role | Authenticated but not authorized | Do not reveal private content or row counts. |
| `/admin/loading` | Session/profile bootstrap state | Transitional | Use while Supabase Auth session and `admin_profiles` are loading. |
| `/admin/leads` | Enquiry and sample request inbox | Admin/editor/viewer read; owner/admin assign/export | First operational module after auth. |
| `/admin/media` | Media library and asset metadata | Admin/editor write; viewer read | New files always upload privately. Alt text and usage notes are required before publish; private-to-public Storage promotion is Website owner / CMS manager only, is bound to the selected row's original path/version, and retains objects when cleanup ownership is uncertain. |
| `/admin/stone-library` | Stone groups, variants, finishes, and images | Admin/editor write; viewer read | Missing image, media-not-published, and TBC states must stay explicit. |
| `/admin/projects`, `/admin/projects/:projectId` | Project list and page-shaped case study editor | Admin/editor write; viewer read | Stable record URL; one aggregate draft with progressively disclosed Overview/Facts/Materials/Media/Maps sections; one Save/preview/publish/hide action bar; visual hotspots; searchable inline private media; actionable publish blockers. |
| `/admin/products` | Product families, models, specs, and defaults | Admin/editor write; viewer read | Product/model media use selectors/previews; material defaults should reference Stone Library records where possible. |
| `/admin/articles` | Article editor | Admin/editor write; viewer read | Uses Article sections, media pickers/previews, and type-specific content guidance, not raw newsletter HTML as normal authoring. |
| `/admin/settings` | Website settings and CMS team access | Website owner / CMS manager only | Includes Invite and grant access, Grant existing login, role management, and global site settings. |
| `/admin/audit` | Change history | Website owner / CMS manager read | Saved changes, publish events, exports, and sensitive operations. |

## Access States

| State | User Experience | Technical Rule |
|---|---|---|
| Loading | Minimal admin shell or loading panel. | Session and `admin_profiles` query not resolved. |
| Unauthenticated | Redirect to `/admin/login`. | No Supabase Auth session. |
| Authenticated but unprofiled | Redirect to `/admin/unauthorized`. | Supabase session exists, but no active `admin_profiles` row. |
| Inactive admin | Redirect to `/admin/unauthorized`. | `admin_profiles.is_active = false`. |
| Viewer | Read-only admin views. | Can inspect content/leads but cannot mutate, publish, delete, export, or manage users. |
| Editor | Draft and edit content, manage non-sensitive media metadata. | Current RLS/UI can publish general content and already-public/external media. In the Projects aggregate path, Editors cannot set project/fact/material proof-review decisions; claim-bearing edits return the affected decision to `needs_review`, while image-only replacement preserves review state. An Editor may publish when owner/admin proof decisions and all other blockers are ready; the protected Projects service may promote its referenced private upload with server-side compensation even though Editors cannot promote files directly from the standalone Media screen. Review-only high-risk publishing across every module is not enforced yet; Editors still cannot manage users, delete records, or export leads. |
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
- Archive hides the CMS version without deleting history. Expand migration A installed an archived-slug tombstone read so a hidden Project can suppress its matching bundled fallback once the aggregate runtime is promoted; a tombstone read failure preserves the existing availability-first static fallback. Applied/read-back repair `20260802103337_restrict_archived_project_tombstones.sql` restricts the RPC to archived canonical rows intersecting the five already-public fallback slugs and removes all private-draft reads.
- Physical deletes are destructive operations and remain outside the launch-critical CMS path until Jay approves a retention and destructive-delete policy.
- Live admin verification should prove publish/archive behavior, the documented hidden-or-static-fallback result, and auditability after archive; it should not physically delete production rows.

## Module Rollout Sequence

| Phase | Module | Why This Order | Dependencies |
|---|---|---|---|
| 1 | Auth shell and profile gate | Protects every later screen. | Supabase Auth, `admin_profiles`, RLS. |
| 2 | Leads inbox | Makes Contact and Sample Request business-safe. | Forms, Turnstile, email notification, RLS. |
| 3 | Media library | Needed by every content module. | Supabase Storage, `media_assets`, image validation. |
| 4 | Stone Library | Highest repeated maintenance value and clearest CRUD model. | Media, Stone Library tables, public read contract. |
| 5 | Projects | Enables case studies, material-map proof, and launch project updates. | Media, Stone Library references, claim review fields, `project_media` block migration. |
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
| Images | primary/secondary/detail/swatch media selection, preview, order, status, alt via media | image dimensions, missing-image health, selected-media publish state | storage policy and transformation presets |

### Projects

| Area | Customer Editable | System Computed | Developer / Admin-Only |
|---|---|---|---|
| Project aggregate | title, summary, lead, location, date labels, collaborators, cover/hero media, facts, materials, ordered media, maps, hotspots, SEO, order | one private draft revision, slug uniqueness, timestamps, plain-language publish blockers | aggregate RPC, legacy migration source fields |
| Facts and claims | fact labels/values and display order; owner/admin proof-review decisions | Publish checklist and content health warnings for unreviewed claims | claim taxonomy if later formalized; Editor claim-decision enforcement |
| Media blocks | cover/hero media, block type, selected media, hotspot map link, optional YouTube ID, block title, label, caption, and order | thumbnail preview, alt readiness, public-copy verification, usage records | Storage policy, create-only promotion/compensation, one-active-YouTube constraint |
| Material map | map image, linked material, point labels/notes, direct point placement and dragging | validated x/y percentage coordinates derived from the image | raw coordinate storage and calibration rules |

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
- `/admin/account-setup` handles invite and recovery callbacks in an isolated non-persistent session, clears callback credentials from the address bar, keeps the shared session unchanged, allows password setup even while profile access is pending, returns to explicit sign-in, and blocks expired/reused links from changing an unrelated existing session.
- The admin shell uses Supabase Auth and `admin_profiles` lookup when browser-safe Supabase configuration is present.
- Without `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`, admin routes render a configuration-required state and do not show dashboard content.
- `npm run agent:admin-config-gate` is the repeatable no-secret browser gate for this state. It creates an isolated temporary build with browser-safe Supabase values explicitly cleared, checks every launch-critical admin route in Firefox for the configuration-required state, rejects the login form plus private admin/module text, and writes ignored screenshots under `.tmp/admin-config-gate/screenshots`.
- `npm run agent:admin-auth-browser` is the gated no-write browser login check for the configured state. It reads `.env.local`, `.env`, `.dev.vars`, and shell values without printing secrets. Default mode only prints required variable names/sources; `--allow-login --strict` builds an isolated configured bundle from current source, checks the entry-size/no-eager-Supabase boundary, signs in with `URBLO_ADMIN_EMAIL` and `URBLO_ADMIN_PASSWORD`, verifies authenticated admin route shells using stable semantic markers, then signs out and revisits a protected route. It creates no content rows, Storage objects, or audit events. `--allow-login --expect-unauthorized --strict` signs in with `URBLO_UNPROFILED_EMAIL` and `URBLO_UNPROFILED_PASSWORD` to prove a valid Auth user without an active `admin_profiles` row lands on `/admin/unauthorized` and stays unauthorized when all launch-critical admin routes are probed, without seeing private admin module content.
- `/admin` dashboard reads content and lead counts after authentication, including a `Content health queue` for published media missing alt/usage notes, project claim-review rows, published Products/Articles missing key media, TBC Stone Library rows, and stale new leads older than 48 hours.
- Protected-route login redirects preserve a `next` target only for true `/admin`, `/admin?*`, or `/admin/*` paths, and block login/unauthorized self-loop targets before redirecting authenticated admins.
- `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` is the read-only readiness check before live browser QA. It verifies browser-safe key presence, service-role verification access, the named Auth user linked to the active admin profile, baseline seed rows, and the browser-key anonymous public/private REST boundary without creating or changing users.
- `npm run agent:first-admin-bootstrap` is the guarded first-admin setup runner. Default mode is no-write and prints the approved path; `--verify-only` reads existing Auth/profile/seed state and checks the profile is linked to the matching Auth user; `--allow-writes` plus matching `--confirm-email` is required before any invite or `admin_profiles` upsert, and that write mode needs Jay approval. The live table now also has a case-insensitive unique index on normalized profile email, and bootstrap/readiness scripts normalize profile email matching before refusing an email already linked to a different Auth user or reporting readiness.
- When first-admin write mode is approved and run, the bootstrap script records a server-side `admin_profile.bootstrap` audit event with `actor_user_id = null` because the operation is performed by the guarded service-role setup path, not a signed-in browser admin.
- `/admin/settings` is the first CRUD source screen behind the auth gate, with owner/admin save controls for the default `site_settings` row.
- `/admin/settings` also includes a non-destructive admin team manager. New CMS users can be invited through protected server Function `/api/admin/invite-user`; existing login accounts can still be granted access through the setup-code fallback. Owner/admin profile create/update controls, owner-role guardrails, self-lockout prevention, role explanations, and no delete controls remain required.
- `/api/admin/invite-user` must verify the signed-in bearer session, require an active Website owner or CMS manager profile, keep the Supabase service key server-side, derive a same-origin account-setup redirect, send the Supabase Auth invite, create the `admin_profiles` row, roll back an orphan Auth user if profile creation fails, and record `admin_profile.invite` in Change history.
- A real QA invite reached its approved recipient on 2026-07-13, but its callback fell back to `http://localhost:3000`; the account was activated directly only to prepare role testing. Production Auth Site URL and exact account-setup redirects were corrected/read back on 2026-07-14, but invite/recovery handoff still requires a fresh approved UI workflow. Auth custom SMTP ownership also remains unverified. The Contact/Sample Request SMTP2GO proof is a different email path and does not satisfy this requirement.
- `/admin/settings` validates duplicate login account IDs and duplicate admin profile emails before save so database uniqueness failures are not the first user-facing feedback.
- `/admin/media` is the first media CRUD source screen behind the auth gate, with private-only admin/editor upload, metadata-failure readback, path/version-bound owner/admin promotion, audit-gated media manifest export, viewer read-only behavior, and publish/archive guardrails.
- Production Storage role migration `20260714050750_media_public_bucket_role_hardening.sql` is applied/read back. The separately approved 2026-07-14 `npm run agent:admin-media-role-boundary-live -- --allow-writes --strict` run proved Editor private insert/update success, public insert/update denial, owner/admin public insert/update success, and tagged-object cleanup; independent SQL returned zero objects for both attempted markers. The command remains plan-only by default and any new live run requires fresh approval.
- `/admin/stone-library` is the first content CRUD source screen behind the auth gate, with group, variant, finish capability, finish image link, media selector/preview, validation, publish/archive, and read-only states.
- `/admin/projects` and `/admin/projects/:projectId` now have a Phase 1 page-shaped aggregate editor in source and on the authenticated branch Preview. The browser loads and submits the whole draft through authenticated `/api/admin/projects` GET/POST requests with private revision and canonical page-version tokens; one action bar owns Save, Publish, Hide, and a draft preview rendered by the same `ProjectPageView` component as the public route. The canonical token also protects the first Save of an existing Project that has no private draft yet. Overview, Facts, Materials, Media, and Maps are collapsible stages, publish blockers jump to the relevant stage, and dirty guards cover record/route/refresh changes. Facts, materials, media blocks, maps, and map-scoped points use accessible up/down ordering with no raw sort fields; the list/editor remain side by side around 1116px, while narrow section headers wrap their actions.
- Project media is selected through searchable thumbnails or uploaded inline to private `urblo-admin-media` with alt capture and a 10 MiB Project-image limit. Material-map points are created and dragged on the image, with keyboard movement retained; editors never enter raw percentages. Publish remains a server-orchestrated operation that can create-only copy private media to a nonce-scoped public path, verify the copy, compensate ambiguous/failed attempts with durable warning evidence, and separately clean private sources after a committed publish.
- Expand migration `supabase/migrations/20260719015649_project_aggregate_drafts.sql` and minimum-disclosure migration `supabase/migrations/20260802103337_restrict_archived_project_tombstones.sql` are applied/read back. The separately approved production-backed preview workflow passed one Save/refresh, unsaved shared preview, private-first upload, visual hotspot, Publish/public readback, and Hide/public-not-found. Its tagged Project aggregate is retained Archived and its promoted Media/public object is retained Published under the archive-first policy. Deterministic local checks cover stale-Save/reload-only recovery and failed-Publish compensation; the fresh container gate and immutable Preview smoke/owner login pass. Contract migration `supabase/migrations/20260802103338_project_aggregate_write_lockdown.sql` remains source-only and needs fresh approval/readback. Keep Project editing frozen through aggregate runtime promotion, B approval/apply/readback, and privilege/policy verification; any live negative write proof needs its own approval. After B, do not Cloudflare-only roll back to the legacy direct-write UI. Until this sequence and Jay's fool test are complete, this is not a production-deployed or accepted Projects workflow.
- `/admin/products` is the next content CRUD source screen behind the auth gate, with product family, model, material default, spec, media selectors/previews, validation, publish/archive, and read-only states.
- `/admin/articles` is the next content CRUD source screen behind the auth gate, with article metadata, structured block rows, reference links, legacy-source provenance, validation, publish/archive, and read-only states.
- `/admin/leads` is the first lead workflow source screen behind the auth gate, with enquiry/sample request queues, contact detail, sample items, status updates, assignment, internal notes, notification state, read-only states, and an owner/admin CSV export action that is blocked unless an audit event is recorded.
- `/admin/audit` is the first audit visibility source screen behind the auth gate, with owner/admin read access, actor/entity filters, metadata inspection, empty states, and no mutation/delete controls.
- `src/lib/adminAudit.ts` remains the shared browser-side audit writer for Settings, Media, Stone Library, Products, Articles, and Leads. Projects aggregate Save/Publish/Hide audit rows move into the same database transaction as the relational mutation through the installed service-role-only RPC, so the browser does not issue a second Projects audit write.
- `npm run agent:admin-crud-coverage` is the source-only admin coverage check. It verifies active route/module registration, protected shell coverage, launch-critical table references, role-gated controls, validation/save state paths, publish/archive lifecycle paths, shared audit writer usage outside the Projects aggregate, and audit-gated Media/Leads exports before live credential QA. Projects-specific aggregate behavior is delegated to `npm run agent:admin-projects-aggregate` so the old schema-shaped string assertions cannot dictate the new UI.
- The same source-only coverage now fails if admin source or the live verifier introduces Supabase `.delete()` mutations, HTTP `DELETE` requests, destructive RPC names, or visible `Delete`/`Remove` controls; launch removal stays archive-first until Jay approves a destructive-delete/retention policy.
- `npm run agent:admin-crud-live` is the credential-gated live write check for Settings, Media, Stone Library, Products, Articles, Leads, and audit/export boundaries. It is plan-only by default and retains its explicit write approval, browser-key RLS, dashboard, audit, anonymous-boundary, optional private Storage, and no-physical-delete checks. It intentionally does not write any Project table; Projects must be verified through the protected aggregate endpoint so the old schema-shaped verifier cannot bypass the new workflow.
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
