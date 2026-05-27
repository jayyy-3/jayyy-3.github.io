-- Restrict global site settings writes to owner/admin roles.

drop policy if exists site_settings_admin_insert on public.site_settings;
drop policy if exists site_settings_admin_update on public.site_settings;
drop policy if exists site_settings_admin_delete on public.site_settings;

create policy site_settings_admin_insert on public.site_settings
  for insert to authenticated
  with check (public.has_admin_role(array['owner', 'admin']));

create policy site_settings_admin_update on public.site_settings
  for update to authenticated
  using (public.has_admin_role(array['owner', 'admin']))
  with check (public.has_admin_role(array['owner', 'admin']));

create policy site_settings_admin_delete on public.site_settings
  for delete to authenticated
  using (public.has_admin_role(array['owner', 'admin']));
