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

Applied production migrations:

- `20260714050750_media_public_bucket_role_hardening.sql` — keeps Editor uploads in `urblo-admin-media`; only owner/admin may insert or update `urblo-public-media` objects. Migration/policy readback and the separately approved tagged Editor/owner role proof passed; do not rerun live writes without fresh approval.
- `20260719015649_project_aggregate_drafts.sql` — applied/read back on 2026-07-19 after migration-only approval. It adds private draft revisions, child lifecycle columns/backfill, the service-role-only aggregate transaction, and archived-slug tombstones. Initial apply left the private draft table empty and existing Project counts/statuses unchanged. A later separately approved preview workflow created one tagged aggregate and finished with it Archived; contract B is still unapplied.

Pending production approval and apply:

- `20260719015650_project_aggregate_write_lockdown.sql` — contract step that removes legacy browser Project table/sequence writes and hardens public parent/child reads. Apply only with separate approval after preview passes and the aggregate UI/endpoint is already promoted to production; freeze Project editing during apply/readback. After this step, do not Cloudflare-only roll back to the legacy direct-write UI.

Do not commit Supabase service role keys, database passwords, Turnstile secrets, or email provider secrets here.
