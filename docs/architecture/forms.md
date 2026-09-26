# Forms and leads contract

Contact and Sample Request forms, form Functions, notifications, Turnstile and the Leads admin screen. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

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

## Deployment and Build Contract — forms and leads entries

- Browser-side public form Turnstile uses `VITE_TURNSTILE_SITE_KEY`; without it, the Contact page keeps the submit flow usable and omits the widget. Server-side token verification still requires `TURNSTILE_SECRET_KEY` or `CF_TURNSTILE_SECRET_KEY`.
  - Current Leads admin source: `/admin/leads` reads `enquiries`, `sample_requests`, and `sample_request_items`; active Website owner / CMS manager roles can update lead status, assignment, internal notes, and export the currently loaded lead queue to CSV once browser-safe Supabase config and an active profile exist. CSV export must write a change-history row before downloading.
  - Form Functions require `SUPABASE_SERVICE_ROLE_KEY` server-side; `SUPABASE_SERVICE_KEY` remains a compatibility alias only. `SUPABASE_URL` may be configured, but defaults to the Urblo project URL if omitted.
  - Form Functions attempt `admin_audit_events` writes with `actor_user_id = null` after successful enquiry/sample request inserts. Audit write failure does not fail the visitor response.
  - Sample Request Functions call `submit_sample_request_with_item(jsonb, jsonb)` with the server-side service role key so the `sample_requests` row and first `sample_request_items` row are inserted in one database transaction. The RPC is `security invoker`, executable by `service_role`, and not executable by browser roles.
  - Form notification source uses SMTP2GO when `SMTP2GO_API_KEY` exists, otherwise Resend when `RESEND_API_KEY` exists. Mock checks verify configured notification paths start with `notification_status = pending`, call the configured provider, then patch the lead row to `sent` or `failed` without failing the already-stored visitor response.
  - Live form persistence verification is staged through `npm run agent:forms-live -- --allow-writes`. The command requires `--allow-writes`, a server-side Supabase service-role key, and Jay approval for tagged live form QA writes; HTTP mode rejects placeholder or non-origin `--base-url` values before any Supabase reads/writes; it verifies valid enquiry/sample request rows plus source-route audit metadata, verifies invalid enquiry/sample request payloads create no rows or matching audit events, verifies response-vs-stored notification status, and retains tagged test rows for auditability until Jay approves cleanup. The 2026-06-02 deployed proof against `https://urblo.pages.dev` created `enquiries.id = 1`, `sample_requests.id = 1`, `sample_request_items.id = 1`, and `admin_audit_events.id = 1/2`; invalid tagged payloads created zero rows or audit events. The 2026-06-03 SMTP2GO proof against `https://urblo.com.au` created `enquiries.id = 3`, `sample_requests.id = 2`, `sample_request_items.id = 2`, and `admin_audit_events.id = 4/5`, with both stored lead rows at `notification_status = sent`. The 2026-06-03 browser-key private-row boundary proof created `enquiries.id = 4`, `sample_requests.id = 3`, `sample_request_items.id = 3`, and `admin_audit_events.id = 6/7`; anonymous REST reads through the deployed publishable key returned HTTP 401 for all three private tables.
  - Optional public form key: `VITE_TURNSTILE_SITE_KEY`.
  - Optional server-side form secrets: `TURNSTILE_SECRET_KEY` or `CF_TURNSTILE_SECRET_KEY`, `SMTP2GO_API_KEY` or `RESEND_API_KEY`, `LEAD_NOTIFICATION_FROM` or `RESEND_FROM_EMAIL`, `LEAD_NOTIFICATION_TO`, `ENQUIRY_NOTIFICATION_TO`, and `SAMPLE_REQUEST_NOTIFICATION_TO`.

### Supabase Launch Data Contract — forms

- Forms:
  - Enquiries and sample requests store submitted fields, source route, Turnstile result, notification status, admin status, owner, and internal notes.

### Supabase Launch Data Contract — Admin IA/access (leads)

- Admin IA/access:
  - `/admin/leads` is the first lead workflow screen and uses enquiries, sample requests, sample request items, active admin profile options, Stone Library labels, and finish labels. Owner/admin CSV export is limited to the currently loaded queue and blocked if its audit event cannot be recorded.
