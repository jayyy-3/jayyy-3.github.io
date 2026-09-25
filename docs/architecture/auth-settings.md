# Admin Auth and Settings contract

Browser Auth, invite/recovery, first-admin bootstrap, Settings and company locations. Route/role design: `docs/ADMIN_IA_ACCESS.md`. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

## Deployment and Build Contract — admin Auth, invite and Settings entries

- Browser-side admin Auth requires `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY`; `VITE_SUPABASE_URL` may be configured, but defaults to the Urblo project URL if omitted.
- Browser-side auth-state callbacks must return synchronously. Any `getSession`, `getUser`, or profile query triggered by `onAuthStateChange` runs in a deferred task so it cannot deadlock the Supabase client lock.
- Invite and recovery callbacks land on `/admin/account-setup?mode=invite|recovery`. The page captures the implicit token pair before client creation, clears callback credentials from the address bar, keeps URL-session detection disabled on the shared browser client, creates a non-persistent/no-refresh/no-URL-detection isolated Auth client, explicitly installs that pair, verifies its user with the Auth server, and performs the password update through that same isolated client. Opening a password link cannot replace an unrelated shared admin session, and a login change in another tab cannot rebind the callback to another account. After a successful update the user returns to explicit password sign-in. Expired/reused links fail closed; PKCE callbacks remain intentionally unsupported.
- `/api/admin/invite-user` derives its callback from the request origin instead of accepting an arbitrary browser redirect, uses a non-persistent server Auth client, and deletes the newly invited Auth user if the matching `admin_profiles` insert fails.
- Supabase Auth invite/recovery mail is operationally separate from Contact/Sample Request SMTP2GO. A 2026-07-13 production invite reached the approved QA recipient but fell back to `http://localhost:3000`; after Jay's separate approval, the Auth Site URL was corrected to `https://urblo.com.au` and the exact invite/recovery account-setup Redirect URLs were added and read back on 2026-07-14. A repeated invite/recovery golden workflow and Auth SMTP ownership verification are still required before either flow can be called verified.
  - Current admin CRUD source: `/admin/settings` reads and saves the default `site_settings` row, validates/normalizes Published public fields through the same contract as the public consumer, invites new CMS users through `/api/admin/invite-user`, and manages existing Supabase Auth users' admin profile rows for Website owner / CMS manager roles, including clear form validation for duplicate Auth user IDs and duplicate profile emails before save. The invite endpoint verifies the signed-in admin session with a bearer token, requires an active Website owner/CMS manager profile, keeps the Supabase service key server-side, sends the Supabase Auth invite, creates the `admin_profiles` row, and records `admin_profile.invite` in `admin_audit_events`. First admin bootstrap is complete for `info@urblo.com.au`; future team management happens through `/admin/settings` after the latest Settings UX is deployed and live invite QA passes.

### Supabase Launch Data Contract — site settings

- Site settings:
  - Global SEO, logo, favicon, social links, footer content, and default share image.
  - Public runtime reads only `settings_key = default` with `status = published`, validates JSON shapes, and falls back to `src/data/siteChrome.ts` when the row is missing or invalid. Draft/Archived settings never replace public fallback values. The admin reuses the same public field validators before a Published save, including email, social URL, homepage metadata, share-image, and footer-destination rules.
  - Homepage title and description settings apply only to `/`; the default share image can support route-level previews. Public settings requests are deduplicated only while in flight and are cleared after settlement, so returning from `/admin` refreshes Published settings and a transient fallback does not become a permanent session cache.

### Supabase Launch Data Contract — Admin IA/access (auth and settings)

- Admin IA/access:
  - `/admin` route, login, unauthorized, loading, module, settings, and audit states are defined in `docs/ADMIN_IA_ACCESS.md`.
  - `/admin/account-setup` is the invite/recovery password endpoint and is usable only when a valid callback identity matches the active session.
  - Current `/admin` source implements real Supabase Auth wiring, session/profile loading, login, unauthorized, dashboard, and protected module scaffolds.
  - The admin dashboard does not render private module content unless Supabase Auth returns a session and RLS allows the matching active `admin_profiles` row.
  - Admin login next-target handling is intentionally same-console only: `/admin`, `/admin?*`, and `/admin/*` are accepted, while `/administrator`-style prefixes and login/unauthorized loops fall back to `/admin`.
  - `/admin/settings` is the first settings/admin-access CRUD screen and uses the `site_settings` row plus `admin_profiles` rows with owner/admin save controls.
  - The one-time first-admin service-role bootstrap path must create an `admin_profile.bootstrap` audit event for its access-control change before live admin readiness is considered fully verified.
  - Admin profile management is non-destructive in source: it creates/updates profile rows for existing Supabase Auth users, preserves owner-role guardrails in UI, and is backed by the `admin_profile_owner_hardening` migration.
  - The admin CMS must not ship fake production auth; live verification still requires browser-safe Supabase key configuration and a confirmed first admin profile.

## Company contact locations — 2026-09-13

Office and Warehouse are maintained in Settings through dedicated fields, serialized as reserved text items in the existing Published `site_settings.footer_columns` JSON. `src/lib/companyLocations.ts` supplies parsing, serialization and current fallback addresses. Contact, the shared footer and both static/dynamic Organization structured data consume the same public settings locations. Legacy `Address` text is replaced by the two locations; other footer content is retained. No schema migration is required. The capability PDF remains a separately maintained artifact; four legacy article company-address paragraphs are removed in favor of the shared page footer.
