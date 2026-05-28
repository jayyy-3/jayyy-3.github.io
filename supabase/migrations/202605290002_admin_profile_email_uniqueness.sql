-- Keep admin profile email lookups unambiguous for first-admin and readiness checks.
create unique index if not exists admin_profiles_email_ci_unique_idx
on public.admin_profiles (lower(btrim(email)));
