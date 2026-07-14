-- Keep draft upload permission for active editors in the private media bucket,
-- while requiring an active owner/admin role for any direct write to the public
-- bucket. This makes the UI's private-first publish workflow a Storage RLS
-- boundary instead of relying only on browser controls.
-- Supabase recorded this production migration as version 20260714050750.

drop policy if exists urblo_storage_admin_object_insert on storage.objects;
create policy urblo_storage_admin_object_insert
on storage.objects
for insert
to authenticated
with check (
  (
    bucket_id = 'urblo-admin-media'
    and private.has_admin_role(array['owner', 'admin', 'editor'])
  )
  or
  (
    bucket_id = 'urblo-public-media'
    and private.has_admin_role(array['owner', 'admin'])
  )
);

drop policy if exists urblo_storage_admin_object_update on storage.objects;
create policy urblo_storage_admin_object_update
on storage.objects
for update
to authenticated
using (
  (
    bucket_id = 'urblo-admin-media'
    and private.has_admin_role(array['owner', 'admin', 'editor'])
  )
  or
  (
    bucket_id = 'urblo-public-media'
    and private.has_admin_role(array['owner', 'admin'])
  )
)
with check (
  (
    bucket_id = 'urblo-admin-media'
    and private.has_admin_role(array['owner', 'admin', 'editor'])
  )
  or
  (
    bucket_id = 'urblo-public-media'
    and private.has_admin_role(array['owner', 'admin'])
  )
);
