-- Stone Library "Available as" (NOW-STONE-AVAILABLE-AS-001).
-- Published product-form options (Blocks, Pavers, Cladding, ...) replace the retired
-- stone-level Available / Upcoming state. Expand only: no column is dropped;
-- stone_groups.availability_status is kept (deprecated) and no longer read or written.
-- The migration runner applies this file as one transaction. Approved production backfill:
-- every stone offers all three seeded options. private.stone_history snapshots are unchanged.

-- 1. Editable option list (same shape as finish_definitions).
create table public.stone_availability_options (
  id bigint generated always as identity primary key,
  option_key text not null unique
    check (option_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(option_key) <= 60),
  display_name text not null check (length(btrim(display_name)) between 1 and 60),
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  archived_at timestamptz
);
create index stone_availability_options_status_sort_idx on public.stone_availability_options (status, sort_order);
create index stone_availability_options_created_by_idx on public.stone_availability_options (created_by);
create index stone_availability_options_updated_by_idx on public.stone_availability_options (updated_by);
create trigger stone_availability_options_set_updated_at before update on public.stone_availability_options
  for each row execute function public.set_updated_at();
alter table public.stone_availability_options enable row level security;
create policy stone_availability_options_public_select on public.stone_availability_options
  for select to anon, authenticated
  using (status = 'published');
-- Browser roles read published options only; every write goes through the service-only RPC.
revoke all on public.stone_availability_options from public, anon, authenticated;
grant select on public.stone_availability_options to anon, authenticated;
revoke all on sequence public.stone_availability_options_id_seq from public, anon, authenticated;
insert into public.stone_availability_options(option_key, display_name, sort_order) values
  ('blocks', 'Blocks', 10),
  ('pavers', 'Pavers', 20),
  ('cladding', 'Cladding', 30);

-- 2. Per-stone selection: option keys. Readers intersect with published options.
alter table public.stone_groups add column available_as text[] not null default '{}';

-- 3. Approved backfill: all stones (including hidden ones, so a restore is never empty)
--    offer every seeded option; the retired state is neutralised. The admin list already
--    shows status 'tbc' as Draft, so mapping it to 'draft' keeps behaviour unchanged.
update public.stone_groups set
  available_as = array['blocks','pavers','cladding'],
  availability_status = 'active',
  status = case when status = 'tbc' then 'draft' else status end;

-- 4. Private drafts adopt the new shape in place (history snapshots are not rewritten).
update private.stone_drafts
  set draft = jsonb_set(draft #- '{stone,availability}', '{stone,availableAs}', '["blocks","pavers","cladding"]'::jsonb)
  where jsonb_typeof(draft->'stone') = 'object';

-- 5. Functions.
create or replace function private.stone_current_draft(p_id bigint)
returns jsonb language sql stable security definer set search_path = '' as $$
select jsonb_build_object('schemaVersion',1,'stone',jsonb_build_object(
 'id',g.id,'slug',g.stone_group_key,'name',g.display_name,'type',coalesce(g.stone_type_display,''),
 'availableAs',coalesce((select jsonb_agg(o.option_key order by o.sort_order,o.id) from public.stone_availability_options o
   where o.status='published' and o.option_key=any(g.available_as)),'[]'::jsonb),
 'summary',coalesce(g.summary,''),'sourceName',coalesce(g.source_name,''),
 'originRegion',coalesce(g.origin_region,''),'originCountry',coalesce(g.origin_country,''),
 'pricingNote',coalesce(g.price_source,''),'priceTier',g.price_tier,
 'blockLength',g.raw_block_length_mm,'blockWidth',g.raw_block_width_mm,'blockHeight',g.raw_block_height_mm,
 'internalNote',coalesce(g.notes,''),'cutOptions',g.cut_options),
 'variants',coalesce((select jsonb_agg(jsonb_build_object(
  'key','variant-'||v.id,'id',v.id,'slug',v.variant_key,'label',coalesce(v.display_name,''),
  'type',case when v.variant_type='cut_orientation' then 'cut_orientation' when v.variant_type='none' then 'none' else 'shade' end,
  'enabled',v.status<>'archived','finishes',coalesce((select jsonb_agg(jsonb_build_object(
   'definitionId',f.id,'capability',coalesce(c.capability,'no'),
   'behaviorNote',coalesce(c.behavior_note,''),'sources',coalesce(to_jsonb(c.sources),'[]'::jsonb),
   'internalNote',coalesce(c.admin_note,''),'images',coalesce((select jsonb_agg(jsonb_build_object(
     'key','image-'||i.id,'id',i.id,'mediaAssetId',i.media_asset_id,'role',i.image_role
   ) order by i.sort_order,i.id) from public.stone_finish_images i
   where i.stone_group_id=g.id and (i.stone_variant_id=v.id or (i.stone_variant_id is null and v.id=(select min(vv.id) from public.stone_variants vv where vv.stone_group_id=g.id)))
    and i.finish_definition_id=f.id and i.status<>'archived'),'[]'::jsonb)
  ) order by f.sort_order,f.id)
  from public.finish_definitions f left join public.stone_finish_capabilities c
    on c.stone_variant_id=v.id and c.finish_definition_id=f.id
  where f.status='published'),'[]'::jsonb)
 ) order by v.sort_order,v.id) from public.stone_variants v where v.stone_group_id=g.id),'[]'::jsonb))
from public.stone_groups g where g.id=p_id;
$$;

create or replace function public.admin_stone_workspace(
 p_action text,p_stone_id bigint,p_revision bigint,p_live_version text,p_request_id uuid,
 p_draft jsonb,p_actor uuid,p_role text,p_promotions jsonb default '[]'::jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 g public.stone_groups%rowtype; d private.stone_drafts%rowtype; v jsonb; f jsonb; i jsonb;
 s jsonb; out_draft jsonb; out_variants jsonb:='[]'; out_finishes jsonb; out_images jsonb;
 variant_id bigint; image_id bigint; ids bigint[]:='{}'; image_ids bigint[]:='{}'; n bigint; idx integer:=0;
 actor_role text; result jsonb; blockers jsonb; req private.stone_requests%rowtype;
 fingerprint text; promotion jsonb; asset public.media_assets%rowtype; promoted_ids bigint[]:='{}';
begin
 select role into actor_role from public.admin_profiles where user_id=p_actor and is_active;
 if actor_role is null or actor_role<>p_role or actor_role not in ('owner','admin','editor','viewer') then
  raise exception 'stone_access_denied' using errcode='42501';
 end if;
 if p_action not in ('list','get','history','usage','save','prepare','publish','archive') then raise exception 'stone_invalid_action' using errcode='22023'; end if;
 if p_action='list' then
  return jsonb_build_object('stones',coalesce((select jsonb_agg(jsonb_build_object(
   'id',sg.id,'slug',sg.stone_group_key,'name',coalesce(sd.draft->'stone'->>'name',sg.display_name),
   'type',coalesce(sd.draft->'stone'->>'type',sg.stone_type_display,''),'status',case when sg.status='tbc' then 'draft' else sg.status end,
   'isTest',exists(select 1 from private.stone_exclusions e where e.stone_key=sg.stone_group_key),
   'hasChanges',sd.revision is distinct from sd.published_revision and sd.revision is not null,
   'coverMediaId',coalesce((select (im->>'mediaAssetId')::bigint from jsonb_array_elements(sd.draft->'variants') vr cross join lateral jsonb_array_elements(vr->'finishes') fi cross join lateral jsonb_array_elements(fi->'images') im limit 1),(select si.media_asset_id from public.stone_finish_images si where si.stone_group_id=sg.id and si.status<>'archived' order by si.sort_order,si.id limit 1)),
   'updatedAt',coalesce(sd.updated_at,sg.updated_at)) order by sg.sort_order,sg.display_name)
   from public.stone_groups sg left join private.stone_drafts sd on sd.stone_id=sg.id),'[]'::jsonb));
 end if;
 if p_action='history' then
  return jsonb_build_object('history',coalesce((select jsonb_agg(jsonb_build_object('id',id,'reason',reason,'createdAt',created_at,'snapshot',snapshot) order by created_at desc,id desc) from private.stone_history where stone_id=p_stone_id),'[]'::jsonb));
 end if;
 if p_action in ('get','usage') then
  result:=private.stone_envelope(p_stone_id);
  if result is null then raise exception 'stone_not_found' using errcode='P0002'; end if;
  return case when p_action='usage' then jsonb_build_object('references',private.stone_usage(p_stone_id)) else result end;
 end if;
 if actor_role='viewer' then raise exception 'stone_read_only' using errcode='42501'; end if;
 -- Lock before row locks: all cross-module reference statements share this mutex.
 perform pg_advisory_xact_lock(20260910,1);
 if p_request_id is null or p_revision is null or p_revision<0 then raise exception 'stone_invalid_request' using errcode='22023'; end if;
 fingerprint:=md5(jsonb_build_object('action',case when p_action='prepare' then 'publish' else p_action end,'id',p_stone_id,'revision',p_revision,'version',p_live_version,'draft',p_draft)::text);
 select * into req from private.stone_requests where request_id=p_request_id;
 if found then
  if req.actor_id<>p_actor or req.fingerprint<>fingerprint then raise exception 'stone_request_reused' using errcode='23505'; end if;
  return req.result || jsonb_build_object('replayed',true);
 end if;
 -- Older cached clients may still send the retired stone-level availability: ignore it.
 if jsonb_typeof(p_draft->'stone')='object' then p_draft:=p_draft #- '{stone,availability}'; end if;
 if p_stone_id is not null then
  select * into g from public.stone_groups where id=p_stone_id for update;
  if not found then raise exception 'stone_not_found' using errcode='P0002'; end if;
  select * into d from private.stone_drafts where stone_id=p_stone_id for update;
  if p_revision<>coalesce(d.revision,0) or p_live_version is distinct from private.stone_version(p_stone_id) then
   raise exception 'stone_conflict' using errcode='40001';
  end if;
 elsif p_revision<>0 or p_action<>'save' then raise exception 'stone_save_first' using errcode='22023';
 end if;
 if p_action in ('save','prepare','publish') then
  if jsonb_typeof(p_draft) is distinct from 'object' or p_draft->>'schemaVersion' is distinct from '1' or jsonb_typeof(p_draft->'stone') is distinct from 'object'
    or jsonb_typeof(p_draft->'variants') is distinct from 'array' or jsonb_array_length(p_draft->'variants')>24 then
   raise exception 'stone_invalid_draft' using errcode='22023';
  end if;
  if jsonb_typeof(p_draft->'stone'->'availableAs') is distinct from 'array' or jsonb_array_length(p_draft->'stone'->'availableAs')>24
    or exists(select 1 from jsonb_array_elements(p_draft->'stone'->'availableAs') x where jsonb_typeof(x)<>'string') then
   raise exception 'stone_invalid_draft' using errcode='22023';
  end if;
  if exists(select 1 from jsonb_array_elements_text(p_draft->'stone'->'availableAs') k where not exists(
    select 1 from public.stone_availability_options o where o.option_key=k.value and o.status='published')) then
   raise exception 'stone_availability_option_unavailable' using errcode='23514';
  end if;
  -- Canonical form: distinct published keys in option order.
  p_draft:=jsonb_set(p_draft,'{stone,availableAs}',coalesce((select jsonb_agg(o.option_key order by o.sort_order,o.id)
   from public.stone_availability_options o where o.status='published'
   and o.option_key in (select jsonb_array_elements_text(p_draft->'stone'->'availableAs'))),'[]'::jsonb));
  s:=p_draft->'stone';
  if nullif(s->>'id','')::bigint is distinct from p_stone_id then raise exception 'stone_parent_mismatch' using errcode='42501'; end if;
  if coalesce(s->>'slug','') !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or length(s->>'slug')>100 or length(btrim(coalesce(s->>'name','')))=0 then raise exception 'stone_name_required' using errcode='22023'; end if;
  if p_stone_id is not null and (g.published_at is not null or g.catalog_managed) and s->>'slug'<>g.stone_group_key then
   raise exception 'stone_address_locked' using errcode='23514';
  end if;
  if exists(select 1 from public.stone_groups sg where sg.stone_group_key=s->>'slug' and sg.id is distinct from p_stone_id) then raise exception 'stone_duplicate_address' using errcode='23505'; end if;
  for v in select value from jsonb_array_elements(p_draft->'variants') loop
   if v->>'id' is not null and not exists(select 1 from public.stone_variants sv where sv.id=(v->>'id')::bigint and sv.stone_group_id=p_stone_id) then raise exception 'stone_variant_mismatch' using errcode='42501'; end if;
   if v->>'id' is not null and exists(select 1 from public.stone_variants sv where sv.id=(v->>'id')::bigint and sv.published_at is not null and sv.variant_key<>v->>'slug') then raise exception 'stone_variant_address_locked' using errcode='23514'; end if;
   for f in select value from jsonb_array_elements(v->'finishes') loop
    if not exists(select 1 from public.finish_definitions fd where fd.id=(f->>'definitionId')::bigint and fd.status='published') then raise exception 'stone_finish_unavailable' using errcode='23514'; end if;
    for i in select value from jsonb_array_elements(f->'images') loop
     if i->>'id' is not null and not exists(select 1 from public.stone_finish_images si where si.id=(i->>'id')::bigint and si.stone_group_id=p_stone_id and (si.stone_variant_id is null or si.stone_variant_id=nullif(v->>'id','')::bigint)) then raise exception 'stone_image_mismatch' using errcode='42501'; end if;
     if not exists(select 1 from public.media_assets ma where ma.id=(i->>'mediaAssetId')::bigint and ma.status<>'archived' and ma.media_type='image') then raise exception 'stone_media_unavailable' using errcode='23514'; end if;
    end loop;
   end loop;
  end loop;
 end if;
 if p_action in ('prepare','publish') then
  if exists(select 1 from private.stone_exclusions e where e.stone_key=g.stone_group_key or e.stone_key=s->>'slug') then raise exception 'stone_history_only' using errcode='23514'; end if;
  if length(btrim(coalesce(s->>'type','')))=0 or not exists(select 1 from jsonb_array_elements(p_draft->'variants') pv where (pv->>'enabled')::boolean) then raise exception 'stone_publish_incomplete' using errcode='23514'; end if;
  for v in select value from jsonb_array_elements(p_draft->'variants') where (value->>'enabled')::boolean loop
   if not exists(select 1 from jsonb_array_elements(v->'finishes') pf where pf->>'capability' in ('yes','tbc')) then raise exception 'stone_finish_required' using errcode='23514'; end if;
  end loop;
 end if;
 if p_action in ('prepare','publish','archive') then
  blockers:=private.stone_blockers(p_stone_id,p_draft,p_action='archive');
  if jsonb_array_length(blockers)>0 then raise exception 'stone_in_use' using errcode='23514',detail=blockers::text; end if;
 end if;
 if p_action='prepare' then return private.stone_envelope(p_stone_id); end if;
 if p_stone_id is null then
  insert into public.stone_groups(stone_group_key,display_name,status,created_by,updated_by)
   values(s->>'slug',s->>'name','draft',p_actor,p_actor) returning * into g;
  p_stone_id:=g.id;
  p_draft:=jsonb_set(p_draft,'{stone,id}',to_jsonb(p_stone_id));
 end if;
 if d.stone_id is null then
  insert into private.stone_history(stone_id,snapshot,reason,actor_id)
   values(p_stone_id,private.stone_current_draft(p_stone_id),'Before workspace adoption',p_actor);
 end if;
 if p_action='archive' then
  update public.stone_groups set status='archived',catalog_managed=true,archived_at=now(),updated_by=p_actor where id=p_stone_id;
  update public.stone_variants set status='archived',archived_at=now(),updated_by=p_actor where stone_group_id=p_stone_id;
  update public.stone_finish_images set status='archived',archived_at=now(),updated_by=p_actor where stone_group_id=p_stone_id;
  -- Keep the complete draft for restore; hidden child statuses are not the draft.
  if d.stone_id is null then
   insert into private.stone_drafts(stone_id,draft,updated_by) values(p_stone_id,coalesce(p_draft,private.stone_current_draft(p_stone_id)),p_actor);
  end if;
 else
  n:=coalesce(d.revision,0)+1;
  out_draft:=p_draft;
  if p_action='publish' then
   for promotion in select value from jsonb_array_elements(p_promotions) loop
    select * into asset from public.media_assets where id=(promotion->>'mediaAssetId')::bigint for update;
    if not found or asset.status='archived' or asset.updated_at is distinct from (promotion->>'sourceUpdatedAt')::timestamptz then raise exception 'stone_media_conflict' using errcode='40001'; end if;
    if promotion->>'promotionKind'='reference_check' then
     if asset.status<>'published' or asset.source_kind is distinct from promotion->>'sourceKind' or asset.bucket is distinct from promotion->>'sourceBucket' or asset.object_path is distinct from promotion->>'sourcePath' or asset.source_url is distinct from promotion->>'sourceUrl' then raise exception 'stone_media_conflict' using errcode='40001'; end if;
    elsif promotion->>'promotionKind'='storage_copy' then
     if asset.bucket<>'urblo-admin-media' or asset.object_path is distinct from promotion->>'sourcePath'
       or promotion->>'destinationBucket'<>'urblo-public-media' or promotion->>'destinationPath' not like 'stone-assets/%' then raise exception 'stone_media_copy_invalid' using errcode='23514'; end if;
     update public.media_assets set bucket='urblo-public-media',object_path=promotion->>'destinationPath',source_url=null,status='published',published_at=coalesce(published_at,now()),updated_by=p_actor where id=asset.id;
    elsif promotion->>'promotionKind'='external_reference' and asset.source_kind<>'storage' then
     update public.media_assets set status='published',published_at=coalesce(published_at,now()),updated_by=p_actor where id=asset.id;
    else raise exception 'stone_media_copy_invalid' using errcode='23514'; end if;
    promoted_ids:=array_append(promoted_ids,asset.id);
   end loop;
   update public.stone_groups set stone_group_key=s->>'slug',display_name=s->>'name',stone_type_display=nullif(s->>'type',''),
    available_as=array(select jsonb_array_elements_text(s->'availableAs')),summary=nullif(s->>'summary',''),source_name=nullif(s->>'sourceName',''),
    origin_region=nullif(s->>'originRegion',''),origin_country=nullif(s->>'originCountry',''),price_source=nullif(s->>'pricingNote',''),
    price_tier=nullif(s->>'priceTier','')::integer,raw_block_length_mm=nullif(s->>'blockLength','')::integer,
    raw_block_width_mm=nullif(s->>'blockWidth','')::integer,raw_block_height_mm=nullif(s->>'blockHeight','')::integer,
    notes=nullif(s->>'internalNote',''),cut_options=s->'cutOptions',status='published',catalog_managed=true,
    published_at=coalesce(published_at,now()),archived_at=null,updated_by=p_actor where id=p_stone_id;
   for v in select value from jsonb_array_elements(p_draft->'variants') loop
    variant_id:=nullif(v->>'id','')::bigint;
    if variant_id is null then
     insert into public.stone_variants(stone_group_id,variant_key,created_by) values(p_stone_id,v->>'slug',p_actor) returning id into variant_id;
    end if;
    ids:=array_append(ids,variant_id);
    update public.stone_variants set variant_key=v->>'slug',display_name=nullif(v->>'label',''),variant_type=v->>'type',sort_order=idx,
     status=case when (v->>'enabled')::boolean then 'published' else 'archived' end,
     published_at=case when (v->>'enabled')::boolean then coalesce(published_at,now()) else published_at end,
     archived_at=case when (v->>'enabled')::boolean then null else now() end,updated_by=p_actor where id=variant_id;
    out_finishes:='[]';
    for f in select value from jsonb_array_elements(v->'finishes') loop
     insert into public.stone_finish_capabilities(stone_variant_id,finish_definition_id,capability,sources,behavior_note,admin_note,created_by,updated_by)
      values(variant_id,(f->>'definitionId')::bigint,f->>'capability',array(select jsonb_array_elements_text(f->'sources')),
       nullif(f->>'behaviorNote',''),nullif(f->>'internalNote',''),p_actor,p_actor)
      on conflict(stone_variant_id,finish_definition_id) do update set capability=excluded.capability,sources=excluded.sources,
       behavior_note=excluded.behavior_note,admin_note=excluded.admin_note,updated_by=p_actor;
     out_images:='[]';
     for i in select value from jsonb_array_elements(f->'images') loop
      if (v->>'enabled')::boolean and f->>'capability'<>'no' and not exists(select 1 from public.media_assets ma where ma.id=(i->>'mediaAssetId')::bigint and ma.status='published' and (ma.source_kind<>'storage' or ma.bucket='urblo-public-media')) then raise exception 'stone_media_not_ready' using errcode='23514'; end if;
      image_id:=nullif(i->>'id','')::bigint;
      if image_id is null then
       insert into public.stone_finish_images(stone_group_id,stone_variant_id,finish_definition_id,media_asset_id,created_by)
        values(p_stone_id,variant_id,(f->>'definitionId')::bigint,(i->>'mediaAssetId')::bigint,p_actor) returning id into image_id;
      end if;
      image_ids:=array_append(image_ids,image_id);
      update public.stone_finish_images set stone_variant_id=variant_id,finish_definition_id=(f->>'definitionId')::bigint,
       media_asset_id=(i->>'mediaAssetId')::bigint,image_role=i->>'role',sort_order=jsonb_array_length(out_images),
       status=case when (v->>'enabled')::boolean and f->>'capability'<>'no' then 'published' else 'archived' end,
       published_at=case when (v->>'enabled')::boolean and f->>'capability'<>'no' then coalesce(published_at,now()) else published_at end,
       archived_at=case when (v->>'enabled')::boolean and f->>'capability'<>'no' then null else now() end,updated_by=p_actor where id=image_id;
      out_images:=out_images||jsonb_build_array(jsonb_set(i,'{id}',to_jsonb(image_id)));
     end loop;
     out_finishes:=out_finishes||jsonb_build_array(jsonb_set(f,'{images}',out_images));
    end loop;
    -- Omitted finish rows must not remain publicly available.
    update public.stone_finish_capabilities set capability='no',updated_by=p_actor where stone_variant_id=variant_id
      and finish_definition_id not in (select (value->>'definitionId')::bigint from jsonb_array_elements(v->'finishes'));
    out_variants:=out_variants||jsonb_build_array(jsonb_set(jsonb_set(v,'{id}',to_jsonb(variant_id)),'{finishes}',out_finishes));
    idx:=idx+1;
   end loop;
   update public.stone_variants set status='archived',archived_at=now(),updated_by=p_actor where stone_group_id=p_stone_id and not(id=any(ids));
   update public.stone_finish_images set status='archived',archived_at=now(),updated_by=p_actor where stone_group_id=p_stone_id and not(id=any(image_ids));
   out_draft:=jsonb_set(out_draft,'{variants}',out_variants);
  end if;
  insert into private.stone_drafts(stone_id,draft,revision,published_revision,updated_by)
   values(p_stone_id,out_draft,n,case when p_action='publish' then n else null end,p_actor)
   on conflict(stone_id) do update set draft=excluded.draft,revision=n,
    published_revision=case when p_action='publish' then n else private.stone_drafts.published_revision end,
    updated_at=now(),updated_by=p_actor;
  if p_action='publish' then insert into private.stone_history(stone_id,snapshot,reason,actor_id) values(p_stone_id,out_draft,'Published',p_actor); end if;
 end if;
 insert into public.admin_audit_events(actor_user_id,action,entity_type,entity_id,metadata)
  values(p_actor,'stone.aggregate.'||p_action,'stone_groups',p_stone_id,jsonb_build_object('requestId',p_request_id,'revision',n));
 result:=private.stone_envelope(p_stone_id);
 insert into private.stone_requests(request_id,actor_id,fingerprint,result) values(p_request_id,p_actor,fingerprint,result);
 return result;
end;
$$;

-- One read snapshot; adds the published option list for "Available as".
create or replace function public.public_stone_catalogue()
returns jsonb language sql stable security definer set search_path = '' as $$
select jsonb_build_object(
 'managedKeys',coalesce((select jsonb_agg(stone_group_key order by stone_group_key) from public.stone_groups g
   where catalog_managed or exists(select 1 from private.stone_exclusions e where e.stone_key=g.stone_group_key)),'[]'::jsonb),
 'finishes',coalesce((select jsonb_agg(jsonb_build_object('id',id,'key',finish_key,'name',display_name,'sortOrder',sort_order) order by sort_order,id) from public.finish_definitions where status='published'),'[]'::jsonb),
 'availabilityOptions',coalesce((select jsonb_agg(jsonb_build_object('id',id,'key',option_key,'name',display_name,'sortOrder',sort_order) order by sort_order,id) from public.stone_availability_options where status='published'),'[]'::jsonb),
 'stones',coalesce((select jsonb_agg(jsonb_build_object('draft',jsonb_build_object('schemaVersion',1,
   'stone',(private.stone_current_draft(g.id)->'stone') - array['sourceName','originRegion','originCountry','internalNote'] || jsonb_build_object('sourceName','','originRegion','','originCountry','','internalNote','','cutOptions',coalesce((select jsonb_agg(c || jsonb_build_object('sources','[]'::jsonb)) from jsonb_array_elements(g.cut_options) c),'[]'::jsonb)),
   'variants',coalesce((select jsonb_agg(v || jsonb_build_object('finishes',coalesce((select jsonb_agg(f || jsonb_build_object('sources','[]'::jsonb,'internalNote','',
     'images',coalesce((select jsonb_agg(i) from jsonb_array_elements(f->'images') i join public.media_assets m on m.id=(i->>'mediaAssetId')::bigint where m.status='published' and (m.source_kind<>'storage' or m.bucket='urblo-public-media') and exists(select 1 from public.stone_finish_images si where si.id=(i->>'id')::bigint and si.status='published')),'[]'::jsonb)))
    from jsonb_array_elements(v->'finishes') f),'[]'::jsonb)))
    from jsonb_array_elements(private.stone_current_draft(g.id)->'variants') v
    join public.stone_variants sv on sv.id=(v->>'id')::bigint where sv.status='published'),'[]'::jsonb)),
   'media',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'status',m.status,'sourceUrl',m.source_url,'bucket',m.bucket,'objectPath',m.object_path,'alt',coalesce(m.alt,''),'name',coalesce(m.alt,'')))
    from public.media_assets m where m.status='published' and (m.source_kind<>'storage' or m.bucket='urblo-public-media') and exists(select 1 from public.stone_finish_images i where i.media_asset_id=m.id and i.stone_group_id=g.id and i.status='published')),'[]'::jsonb)
  ) order by g.sort_order,g.display_name) from public.stone_groups g
  where g.status='published' and not exists(select 1 from private.stone_exclusions e where e.stone_key=g.stone_group_key)
   and exists(select 1 from public.stone_variants v join public.stone_finish_capabilities c on c.stone_variant_id=v.id where v.stone_group_id=g.id and v.status='published' and c.capability<>'no')),'[]'::jsonb));
$$;

create or replace function private.stone_availability_option_list()
returns jsonb language sql stable security definer set search_path = '' as $$
select jsonb_build_object(
 'published',coalesce((select jsonb_agg(jsonb_build_object('id',id,'key',option_key,'name',display_name,'sortOrder',sort_order) order by sort_order,id)
   from public.stone_availability_options where status='published'),'[]'::jsonb),
 'archived',coalesce((select jsonb_agg(jsonb_build_object('id',id,'key',option_key,'name',display_name,'sortOrder',sort_order,'archivedAt',archived_at) order by display_name,id)
   from public.stone_availability_options where status='archived'),'[]'::jsonb));
$$;

-- Owner/admin manage the option list; editor/viewer may list. Archive removes the key from
-- every stone and private draft in the same transaction; restore never re-adds it.
create or replace function public.admin_stone_availability_options(
 p_action text,p_actor uuid,p_role text,p_request_id uuid,p_option jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 actor_role text; req private.stone_requests%rowtype; fingerprint text; result jsonb;
 o public.stone_availability_options%rowtype; new_name text; new_key text; ids bigint[]; target_id bigint;
begin
 select role into actor_role from public.admin_profiles where user_id=p_actor and is_active;
 if actor_role is null or actor_role<>p_role or actor_role not in ('owner','admin','editor','viewer') then
  raise exception 'stone_access_denied' using errcode='42501';
 end if;
 if p_action not in ('list','create','rename','reorder','archive','restore') then raise exception 'stone_invalid_action' using errcode='22023'; end if;
 if p_action='list' then return private.stone_availability_option_list(); end if;
 if actor_role not in ('owner','admin') then raise exception 'stone_option_forbidden' using errcode='42501'; end if;
 -- Same mutex as Stone writes: option changes and stone publication never interleave.
 perform pg_advisory_xact_lock(20260910,1);
 if p_request_id is null or jsonb_typeof(p_option) is distinct from 'object' then raise exception 'stone_invalid_request' using errcode='22023'; end if;
 fingerprint:=md5(jsonb_build_object('scope','availability-option','action',p_action,'option',p_option)::text);
 select * into req from private.stone_requests where request_id=p_request_id;
 if found then
  if req.actor_id<>p_actor or req.fingerprint<>fingerprint then raise exception 'stone_request_reused' using errcode='23505'; end if;
  return req.result || jsonb_build_object('replayed',true);
 end if;
 if p_action in ('create','rename') then
  new_name:=btrim(coalesce(p_option->>'name',''));
  if length(new_name) not between 1 and 60 then raise exception 'stone_option_name_required' using errcode='22023'; end if;
 end if;
 if p_action in ('rename','archive','restore') then
  if jsonb_typeof(p_option->'id') is distinct from 'number' then raise exception 'stone_invalid_request' using errcode='22023'; end if;
  target_id:=(p_option->>'id')::bigint;
  select * into o from public.stone_availability_options where id=target_id for update;
  if not found then raise exception 'stone_option_not_found' using errcode='P0002'; end if;
 end if;
 if p_action='create' then
  new_key:=btrim(left(btrim(regexp_replace(lower(new_name),'[^a-z0-9]+','-','g'),'-'),60),'-');
  if new_key='' then raise exception 'stone_option_name_required' using errcode='22023'; end if;
  if exists(select 1 from public.stone_availability_options x where x.option_key=new_key or lower(x.display_name)=lower(new_name)) then
   raise exception 'stone_option_duplicate' using errcode='23505';
  end if;
  if (select count(*) from public.stone_availability_options where status='published')>=24 then raise exception 'stone_option_limit' using errcode='23514'; end if;
  insert into public.stone_availability_options(option_key,display_name,sort_order,created_by,updated_by)
   values(new_key,new_name,coalesce((select max(sort_order) from public.stone_availability_options),0)+10,p_actor,p_actor)
   returning * into o;
 elsif p_action='rename' then
  if exists(select 1 from public.stone_availability_options x where x.id<>o.id and lower(x.display_name)=lower(new_name)) then
   raise exception 'stone_option_duplicate' using errcode='23505';
  end if;
  update public.stone_availability_options set display_name=new_name,updated_by=p_actor where id=o.id;
 elsif p_action='reorder' then
  if jsonb_typeof(p_option->'ids') is distinct from 'array' or exists(select 1 from jsonb_array_elements(p_option->'ids') x where jsonb_typeof(x)<>'number') then
   raise exception 'stone_invalid_request' using errcode='22023';
  end if;
  ids:=array(select (x.value)::bigint from jsonb_array_elements_text(p_option->'ids') x);
  -- The list must be exactly the current published options, so a stale screen cannot reorder.
  if cardinality(ids)<>(select count(distinct v) from unnest(ids) v)
    or (select array_agg(id order by id) from public.stone_availability_options where status='published')
       is distinct from (select array_agg(v order by v) from unnest(ids) v) then
   raise exception 'stone_option_order_stale' using errcode='40001';
  end if;
  update public.stone_availability_options a set sort_order=x.ord*10,updated_by=p_actor
   from unnest(ids) with ordinality as x(id,ord) where a.id=x.id and a.sort_order is distinct from x.ord*10;
 elsif p_action='archive' then
  if o.status='published' then
   update public.stone_availability_options set status='archived',archived_at=now(),updated_by=p_actor where id=o.id;
   update public.stone_groups set available_as=array_remove(available_as,o.option_key),updated_by=p_actor where o.option_key=any(available_as);
   update private.stone_drafts set draft=jsonb_set(draft,'{stone,availableAs}',coalesce((select jsonb_agg(x) from jsonb_array_elements(draft->'stone'->'availableAs') x where x<>to_jsonb(o.option_key)),'[]'::jsonb))
    where jsonb_typeof(draft->'stone'->'availableAs')='array' and draft->'stone'->'availableAs' ? o.option_key;
  end if;
 elsif p_action='restore' then
  if o.status='archived' then
   if (select count(*) from public.stone_availability_options where status='published')>=24 then raise exception 'stone_option_limit' using errcode='23514'; end if;
   update public.stone_availability_options set status='published',archived_at=null,updated_by=p_actor where id=o.id;
  end if;
 end if;
 insert into public.admin_audit_events(actor_user_id,action,entity_type,entity_id,metadata)
  values(p_actor,'stone.availability_option.'||p_action,'stone_availability_options',o.id,
   jsonb_build_object('requestId',p_request_id,'key',o.option_key,'option',p_option));
 result:=private.stone_availability_option_list();
 insert into private.stone_requests(request_id,actor_id,fingerprint,result) values(p_request_id,p_actor,fingerprint,result);
 return result;
end;
$$;

revoke all on function public.admin_stone_workspace(text,bigint,bigint,text,uuid,jsonb,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.admin_stone_workspace(text,bigint,bigint,text,uuid,jsonb,uuid,text,jsonb) to service_role;
revoke all on function public.admin_stone_availability_options(text,uuid,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.admin_stone_availability_options(text,uuid,text,uuid,jsonb) to service_role;
revoke all on function public.public_stone_catalogue() from public;
grant execute on function public.public_stone_catalogue() to anon,authenticated,service_role;
revoke all on function private.stone_current_draft(bigint),private.stone_availability_option_list() from public,anon,authenticated;

-- 6. Read-back self-check: fails the transaction if the approved backfill is incomplete.
do $$
begin
 if (select array_agg(option_key order by sort_order) from public.stone_availability_options where status='published')
    is distinct from array['blocks','pavers','cladding'] then
  raise exception 'stone_available_as_check: seeded options missing';
 end if;
 if exists(select 1 from public.stone_groups where status='published'
    and available_as is distinct from array['blocks','pavers','cladding']) then
  raise exception 'stone_available_as_check: a published stone does not offer all three options';
 end if;
 if exists(select 1 from public.stone_groups where status='tbc' or availability_status<>'active') then
  raise exception 'stone_available_as_check: retired availability state remains';
 end if;
 if exists(select 1 from private.stone_drafts where draft->'stone' ? 'availability'
    or jsonb_typeof(draft->'stone'->'availableAs') is distinct from 'array') then
  raise exception 'stone_available_as_check: a private draft has the old shape';
 end if;
end;
$$;

notify pgrst,'reload schema';
