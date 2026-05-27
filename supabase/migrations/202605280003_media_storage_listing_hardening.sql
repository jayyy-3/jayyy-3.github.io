-- Avoid public object listing for the public media bucket.
-- Public buckets can serve object URLs without a broad SELECT policy on storage.objects.

drop policy if exists urblo_storage_public_object_select on storage.objects;
