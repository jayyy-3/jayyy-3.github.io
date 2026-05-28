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

Do not commit Supabase service role keys, database passwords, Turnstile secrets, or email provider secrets here.
