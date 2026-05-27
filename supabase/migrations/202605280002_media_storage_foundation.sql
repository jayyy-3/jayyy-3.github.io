-- Urblo media Storage foundation.
-- Creates launch media buckets and Storage RLS policies for admin-managed media.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'urblo-public-media',
    'urblo-public-media',
    true,
    26214400,
    array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'application/pdf',
      'video/mp4'
    ]
  ),
  (
    'urblo-admin-media',
    'urblo-admin-media',
    false,
    52428800,
    array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'application/pdf',
      'video/mp4'
    ]
  )
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();

grant select on storage.buckets to anon, authenticated;
grant select on storage.objects to anon, authenticated;
grant insert, update, delete on storage.objects to authenticated;

drop policy if exists urblo_storage_buckets_public_select on storage.buckets;
create policy urblo_storage_buckets_public_select
on storage.buckets
for select
to anon, authenticated
using (id = 'urblo-public-media' and public = true);

drop policy if exists urblo_storage_buckets_admin_select on storage.buckets;
create policy urblo_storage_buckets_admin_select
on storage.buckets
for select
to authenticated
using (
  id in ('urblo-public-media', 'urblo-admin-media')
  and public.has_admin_role(array['owner', 'admin', 'editor', 'viewer'])
);

drop policy if exists urblo_storage_public_object_select on storage.objects;
create policy urblo_storage_public_object_select
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'urblo-public-media');

drop policy if exists urblo_storage_admin_object_select on storage.objects;
create policy urblo_storage_admin_object_select
on storage.objects
for select
to authenticated
using (
  bucket_id in ('urblo-public-media', 'urblo-admin-media')
  and public.has_admin_role(array['owner', 'admin', 'editor', 'viewer'])
);

drop policy if exists urblo_storage_admin_object_insert on storage.objects;
create policy urblo_storage_admin_object_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('urblo-public-media', 'urblo-admin-media')
  and public.has_admin_role(array['owner', 'admin', 'editor'])
);

drop policy if exists urblo_storage_admin_object_update on storage.objects;
create policy urblo_storage_admin_object_update
on storage.objects
for update
to authenticated
using (
  bucket_id in ('urblo-public-media', 'urblo-admin-media')
  and public.has_admin_role(array['owner', 'admin', 'editor'])
)
with check (
  bucket_id in ('urblo-public-media', 'urblo-admin-media')
  and public.has_admin_role(array['owner', 'admin', 'editor'])
);

drop policy if exists urblo_storage_admin_object_delete on storage.objects;
create policy urblo_storage_admin_object_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('urblo-public-media', 'urblo-admin-media')
  and public.has_admin_role(array['owner', 'admin'])
);
