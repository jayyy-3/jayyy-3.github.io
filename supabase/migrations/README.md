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
- `20260719015649_project_aggregate_drafts.sql` — applied/read back on 2026-07-19 after migration-only approval. It adds private draft revisions, child lifecycle columns/backfill, the service-role-only aggregate transaction, and archived-slug tombstones. Initial apply left the private draft table empty and existing Project counts/statuses unchanged. A later separately approved preview workflow created one tagged aggregate and finished with it Archived.
- `20260802103337_restrict_archived_project_tombstones.sql` — applied/read back on 2026-08-02 after separate migration-only approval. It limits the public RPC to archived canonical Projects intersecting the five bundled fallback slugs, never reads private drafts, and changed the live result from four QA slugs to the expected empty list without changing content rows.
- `20260802105537_project_aggregate_write_lockdown.sql` — applied/read back on 2026-08-02 after separate migration-only approval and aggregate runtime promotion. It removes authenticated direct writes from all six Project tables/sequences and legacy mutation policies, retains the service-role aggregate path, and hardens public parent/child reads. Do not Cloudflare-only roll back to the legacy direct-write UI.

Migration A is already applied and remains byte-for-byte immutable. Its historical comment names the originally planned contract step; production-history alignment inserted C at recorded version `20260802103337`, and contract B was applied/read back at recorded version `20260802105537` after the aggregate runtime reached production.

Do not commit Supabase service role keys, database passwords, Turnstile secrets, or email provider secrets here.
