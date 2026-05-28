-- Preserve owner protection while allowing admins to manage non-owner profiles.

drop policy if exists admin_profiles_admin_insert on public.admin_profiles;
drop policy if exists admin_profiles_admin_update on public.admin_profiles;
drop policy if exists admin_profiles_owner_delete on public.admin_profiles;

create policy admin_profiles_admin_insert on public.admin_profiles
  for insert to authenticated
  with check (
    public.has_admin_role(array['owner'])
    or (
      public.has_admin_role(array['admin'])
      and role in ('admin', 'editor', 'viewer')
    )
  );

create policy admin_profiles_admin_update on public.admin_profiles
  for update to authenticated
  using (
    public.has_admin_role(array['owner'])
    or (
      public.has_admin_role(array['admin'])
      and role in ('admin', 'editor', 'viewer')
    )
  )
  with check (
    public.has_admin_role(array['owner'])
    or (
      public.has_admin_role(array['admin'])
      and role in ('admin', 'editor', 'viewer')
    )
  );

create policy admin_profiles_owner_delete on public.admin_profiles
  for delete to authenticated
  using (
    public.has_admin_role(array['owner'])
    and role <> 'owner'
  );
