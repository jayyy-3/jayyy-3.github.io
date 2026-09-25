# Shared admin CMS contract

Dashboard, Change history, audit and cross-module admin rules and live verifiers. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

## Deployment and Build Contract — shared admin entries

  - Current Change history admin source: `/admin/audit` reads `admin_audit_events` for active Website owner / CMS manager roles once browser-safe Supabase config and an active profile exist, while visible labels translate audit actions/entities into editor-facing language.
  - Current dashboard source: `/admin` counts published public-content rows, recent lead signal, and a content health queue for media metadata gaps, missing product/article media, TBC Stone Library records, and stale new leads. It offers drafts to continue but no Project claim-review queue. These queries run only after the Supabase Auth/profile gate has passed.
  - Projects and Stone aggregate writes include audit history in the canonical database transaction. Other admin modules use `src/lib/adminAudit.ts` after the primary mutation and disclose audit failures without undoing that primary change.
  - Admin credential/profile readiness verification is staged through `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>`. The command is read-only, requires a real email address rather than a copied placeholder, requires a browser-safe Supabase key plus a service-role key, verifies the named Auth user exists and is linked to the active admin profile with the required role, checks the baseline `site_settings` and `finish_definitions` seed rows, and uses the browser-safe key to verify the anonymous public/private REST boundary before browser login/save QA begins.
  - Admin login `next` redirects are constrained to true admin-console targets (`/admin`, `/admin?*`, or `/admin/*`) and deliberately reject login/unauthorized loop targets before redirecting authenticated users.
  - First-admin bootstrap is staged through `npm run agent:first-admin-bootstrap`. Default mode is no-write and makes no Supabase calls; `--verify-only` reads Auth/profile/seed state with a service-role key; `--allow-writes` requires a matching `--confirm-email` and Jay approval before inviting an Auth user or upserting the first `admin_profiles` row. The database has a case-insensitive unique index on normalized admin profile email, and the bootstrap/readiness scripts normalize profile email matching before refusing email/Auth-user mismatches or reporting readiness.
  - First-admin write mode records an `admin_profile.bootstrap` row in `admin_audit_events` with service-role setup metadata because the bootstrap is a setup operation rather than a signed-in browser admin mutation. The 2026-06-03 live bootstrap for `info@urblo.com.au` recorded `admin_audit_events.id = 8`.
  - `npm run agent:admin-crud-live` retains its no-write historical plan but rejects live mode before login or mutation: its legacy direct Stone DML is incompatible with the aggregate lockdown. Fresh Stone write verification must use the protected endpoint under separately approved tagged workflow scope.

### Supabase Launch Data Contract — admin audit

- Admin audit:
  - Admin mutations should be attributable through audit fields or audit-event records.
  - Public form submissions should create server-side audit events after successful lead inserts when server-side Supabase credentials are configured.

### Supabase Launch Data Contract — Admin IA/access (shared)

- Admin IA/access:
  - `/admin/audit` is the first audit visibility screen and uses admin audit events plus active admin profile labels.
  - Launch content removal is non-destructive in source: admin content and media workflows use archive/publish state changes, while physical deletes remain outside the launch-critical CMS path until Jay approves a retention/destructive-delete policy.
  - Stone Library, Products, and Articles still issue separate browser mutations rather than one database transaction. Projects is the deployed exception through the installed aggregate RPC. Storage promotion remains explicitly non-atomic and uses verification plus compensation. Partial failure must remain accurate in every module.
