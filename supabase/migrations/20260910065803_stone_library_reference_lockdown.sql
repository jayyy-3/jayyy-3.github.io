-- Apply after the Stone Library workspace runtime and adoption have been verified.
-- Browser roles may read canonical content; only the audited server transaction writes it.
revoke insert,update,delete,truncate,references,trigger on
 public.stone_groups,public.stone_variants,public.stone_finish_capabilities,public.stone_finish_images
 from authenticated,anon;
revoke all on sequence public.stone_groups_id_seq,public.stone_variants_id_seq,
 public.stone_finish_capabilities_id_seq,public.stone_finish_images_id_seq from authenticated,anon;

-- Lock at statement entry, before individual parent/child row locks. Deferred guards
-- inspect the final transaction state after publish has finished replacing its children.
create or replace function private.stone_reference_mutex()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(20260910,1);
 return null;
end;
$$;
create or replace function private.stone_reference_guard()
returns trigger language plpgsql security definer set search_path='' as $$
declare g record; blockers jsonb; invalid_media record;
begin
 for g in select id,status from public.stone_groups where catalog_managed loop
  blockers:=private.stone_blockers(g.id,private.stone_current_draft(g.id),g.status<>'published');
  if jsonb_array_length(blockers)>0 then
   raise exception 'Update the linked public pages before changing this stone reference.' using errcode='23514',detail=blockers::text;
  end if;
 end loop;
 -- A shared published image cannot be hidden, deleted or moved private while
 -- it is still part of a published managed stone. Remove/replace its link first.
 select m.id into invalid_media from public.stone_finish_images i
 join public.stone_groups sg on sg.id=i.stone_group_id
 left join public.media_assets m on m.id=i.media_asset_id
 where sg.catalog_managed and sg.status='published' and i.status='published'
  and (m.id is null or m.status<>'published' or (m.source_kind='storage' and m.bucket is distinct from 'urblo-public-media')) limit 1;
 if found then raise exception 'This image is used by a published stone. Replace or remove its finish image link before hiding the image.' using errcode='23514'; end if;
 return null;
end;
$$;
revoke all on function private.stone_reference_mutex(),private.stone_reference_guard() from public,anon,authenticated;

do $$
declare table_name text; policy_row record;
begin
 for policy_row in select tablename,policyname from pg_policies where schemaname='public'
   and tablename in ('stone_groups','stone_variants','stone_finish_capabilities','stone_finish_images')
   and cmd in ('INSERT','UPDATE','DELETE','ALL') loop
  execute format('drop policy %I on public.%I',policy_row.policyname,policy_row.tablename);
 end loop;
 foreach table_name in array array['stone_groups','stone_variants','stone_finish_capabilities','stone_finish_images',
  'finish_definitions','media_assets','image_qr_resources','products','product_material_defaults','projects','project_materials','articles','article_blocks'] loop
  execute format('create trigger stone_reference_mutex before insert or update or delete on public.%I for each statement execute function private.stone_reference_mutex()',table_name);
  execute format('create constraint trigger stone_reference_guard after insert or update or delete on public.%I deferrable initially deferred for each row execute function private.stone_reference_guard()',table_name);
 end loop;
end;
$$;
-- Project private drafts are warnings, but serialize them with publication so the
-- editor's reference readback and preservation do not race with Stone changes.
create trigger stone_reference_mutex before insert or update or delete on private.project_drafts
 for each statement execute function private.stone_reference_mutex();
notify pgrst,'reload schema';
