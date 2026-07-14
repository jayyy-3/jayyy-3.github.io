# Supabase Migrations

This directory holds reviewed SQL migrations for the Urblo Supabase project.

The active project discovered through the Supabase connector is:

- Project name: Urblo
- Project ref: `npkidywzwddbnfrnxlmo`
- Region: `ap-southeast-2`

Applied foundation migrations on 2026-05-27:

- `foundation_schema`
- `foundation_hardening`
- `anon_read_only`

Applied baseline seed migration on 2026-05-27:

- `baseline_seed`

Applied admin hardening migration on 2026-05-28:

- `admin_settings_role_hardening`
- `admin_profile_owner_hardening`
- `security_definer_function_grants`

Applied admin helper hardening migration on 2026-05-29:

- `security_definer_private_helpers`
- `admin_profile_email_uniqueness`
- `sample_request_atomic_insert`

Applied media Storage migrations on 2026-05-28:

- `media_storage_foundation`
- `media_storage_listing_hardening`

Applied media Storage role hardening on 2026-07-14:

- `20260714050750_media_public_bucket_role_hardening.sql` — keeps Editor uploads in `urblo-admin-media`; only owner/admin may insert or update `urblo-public-media` objects. Migration/policy readback and the separately approved tagged Editor/owner role proof passed; do not rerun live writes without fresh approval.

Pending production approval and apply:

- `20260714052955_project_aggregate_drafts.sql` — expand step for private draft revisions, child lifecycle columns/backfill, service-role-only aggregate transactions, and archived-slug tombstones. It is non-breaking but does write the lifecycle backfill, so Jay must separately approve production application. Freeze all Project editing before any later approved authenticated preview writes and keep that freeze through the contract readback.
- `20260714052956_project_aggregate_write_lockdown.sql` — contract step that removes legacy browser Project table/sequence writes and hardens public parent/child reads. Apply only with separate approval after preview passes and the aggregate UI/endpoint is already promoted to production; freeze Project editing during apply/readback. After this step, do not Cloudflare-only roll back to the legacy direct-write UI.

Do not commit Supabase service role keys, database passwords, Turnstile secrets, or email provider secrets here.
