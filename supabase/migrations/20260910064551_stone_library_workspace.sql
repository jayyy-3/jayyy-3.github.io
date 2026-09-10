-- Stone Library workspace: independent drafts; one audited publication transaction.
-- Expand only. The subsequent lockdown migration is applied after the new runtime.
-- Production apply and the separate content adoption require the reviewed release approval.
create schema if not exists private;
alter table public.stone_groups
  add column if not exists catalog_managed boolean not null default false,
  add column if not exists availability_status text not null default 'active'
    check (availability_status in ('active','tbc')),
  add column if not exists cut_options jsonb not null default '[]'::jsonb;

create table private.stone_drafts (
  stone_id bigint primary key references public.stone_groups(id) on delete restrict,
  draft jsonb not null,
  revision bigint not null default 1,
  published_revision bigint,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id),
  check (revision > 0 and jsonb_typeof(draft) = 'object')
);
create table private.stone_requests (
  request_id uuid primary key,
  actor_id uuid not null references auth.users(id),
  fingerprint text not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);
create table private.stone_history (
  id bigint generated always as identity primary key,
  stone_id bigint not null references public.stone_groups(id),
  snapshot jsonb not null,
  reason text not null,
  actor_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create table private.stone_exclusions (
  stone_key text primary key,
  reason text not null check (reason in ('test','retired'))
);
-- Exact, source-verified identifiers; never a fuzzy name-based cleanup.
insert into private.stone_exclusions values
 ('admin-live-1780496442071-f27c2b7d','test'),
 ('admin-live-1780496690772-b8a47213','test'),
 ('admin-live-1780497462544-23b1d5e3','test'),
 ('steel-blue','retired');
create table private.stone_static_references (
  module text not null check (module in ('products','projects','articles')),
  slug text not null,
  name text not null,
  stone_key text not null,
  variant_key text not null default '',
  finish_key text not null default '',
  primary key(module,slug,stone_key,variant_key,finish_key)
);

-- Static fallback references extracted from the reviewed repository baseline.
insert into private.stone_static_references(module,slug,name,stone_key,variant_key,finish_key) values
 ('products','prime-block','Prime Block','new-grey','',''),
 ('products','prime-lume','Prime Lume','new-grey','',''),
 ('products','terra-line','Terra Line','new-grey','',''),
 ('products','strata-bench','Strata Bench','new-grey','',''),
 ('products','prime-curve','Prime Curve','new-grey','',''),
 ('products','terra-arc','Terra Arc','new-grey','',''),
 ('projects','moon-gate-woolley-street','Moon Gate | Woolley Street','angola-black','','polished'),
 ('projects','moon-gate-woolley-street','Moon Gate | Woolley Street','new-grey','','flamed');

alter table private.stone_drafts enable row level security;
alter table private.stone_requests enable row level security;
alter table private.stone_history enable row level security;
alter table private.stone_exclusions enable row level security;
alter table private.stone_static_references enable row level security;
revoke all on private.stone_drafts, private.stone_requests, private.stone_history,
 private.stone_exclusions, private.stone_static_references from public, anon, authenticated;

create or replace function private.stone_current_draft(p_id bigint)
returns jsonb language sql stable security definer set search_path = '' as $$
select jsonb_build_object('schemaVersion',1,'stone',jsonb_build_object(
 'id',g.id,'slug',g.stone_group_key,'name',g.display_name,'type',coalesce(g.stone_type_display,''),
 'availability',case when g.status='tbc' then 'tbc' else g.availability_status end,
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

create or replace function private.stone_version(p_id bigint)
returns text language sql stable security definer set search_path = '' as $$
select md5(coalesce((select to_jsonb(g)::text from public.stone_groups g where g.id=p_id),'') ||
 coalesce(private.stone_current_draft(p_id)::text,'') ||
 coalesce((select jsonb_agg(to_jsonb(i) order by i.id)::text from public.stone_finish_images i where i.stone_group_id=p_id),'') ||
 coalesce((select jsonb_agg(to_jsonb(v) order by v.id)::text from public.stone_variants v where v.stone_group_id=p_id),'') ||
 coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'updatedAt',m.updated_at,'status',m.status,'bucket',m.bucket,'path',m.object_path,'source',m.source_url,'alt',m.alt) order by m.id)::text
  from public.media_assets m where m.id in (select i.media_asset_id from public.stone_finish_images i where i.stone_group_id=p_id
   union select (im->>'mediaAssetId')::bigint from private.stone_drafts d cross join lateral jsonb_array_elements(d.draft->'variants') vr cross join lateral jsonb_array_elements(vr->'finishes') fi cross join lateral jsonb_array_elements(fi->'images') im where d.stone_id=p_id)),''));
$$;

create or replace function private.stone_usage(p_id bigint)
returns jsonb language sql stable security definer set search_path = '' as $$
select coalesce(jsonb_agg(r order by r->>'module',r->>'name'),'[]'::jsonb) from (
 select jsonb_build_object('module','projects','id',p.id,'name',p.title,'path','/admin/projects/'||p.id,
 'live',p.status='published' and p.claim_review_status='approved' and m.status='published' and m.claim_status='approved','variantId',m.stone_variant_id,'finishId',m.finish_definition_id,
 'source',case when p.status='archived' then 'history' else 'content' end) r
 from public.project_materials m join public.projects p on p.id=m.project_id where m.stone_group_id=p_id
 union all
 select jsonb_build_object('module','products','id',p.id,'name',p.name,'path','/admin/products',
 'live',p.status='published','variantId',null,'finishId',null,'source',case when p.status='archived' then 'history' else 'content' end)
 from public.product_material_defaults m join public.products p on p.id=m.product_id where m.stone_group_id=p_id or (m.stone_group_id is null and m.material_category='body' and m.material_slug=(select stone_group_key from public.stone_groups where id=p_id))
 union all
 select jsonb_build_object('module','articles','id',a.id,'name',a.title,'path','/admin/articles',
 'live',a.status='published' and b.status='published','variantId',null,'finishId',null,'source',case when a.status='archived' then 'history' else 'content' end)
 from public.article_blocks b join public.articles a on a.id=b.article_id where b.linked_stone_group_id=p_id or exists(select 1 from public.stone_groups sg where sg.id=p_id and b.content::text ~ ('/stone-library/'||sg.stone_group_key||'([/?#"\\[:space:]]|$)'))
 union all
 select jsonb_build_object('module','projects','id',p.project_id,'name',coalesce(p.draft->'project'->>'title','Project draft'),
 'path','/admin/projects/'||p.project_id,'live',false,'variantId',nullif(m->>'stoneVariantId','')::bigint,
 'finishId',nullif(m->>'finishDefinitionId','')::bigint,'source','draft')
 from private.project_drafts p cross join lateral jsonb_array_elements(coalesce(p.draft->'materials','[]'::jsonb)) m
 where nullif(m->>'stoneGroupId','')::bigint=p_id
 union all
 select jsonb_build_object('module','leads','id',i.sample_request_id,'name','Sample request #'||i.sample_request_id,
 'path','/admin/leads','live',false,'variantId',null,'finishId',i.finish_definition_id,'source','history')
 from public.sample_request_items i where i.stone_group_id=p_id
 union all
 select jsonb_build_object('module',s.module,'id',null,'name',s.name,'path','/admin/'||s.module,
 'live',true,'variantId',case when s.variant_key<>'' then (select v.id from public.stone_variants v where v.stone_group_id=p_id and v.variant_key=s.variant_key limit 1) else null end,
 'finishId',(select f.id from public.finish_definitions f where f.finish_key=s.finish_key),'source','website')
 from private.stone_static_references s join public.stone_groups g on g.stone_group_key=s.stone_key
 where g.id=p_id and (
  (s.module='products' and not exists(select 1 from public.products p where p.slug=s.slug and p.status='published'))
  or (s.module='projects' and not exists(select 1 from public.projects p where p.slug=s.slug and (p.status='archived' or (p.status='published' and p.claim_review_status='approved'))))
  or (s.module='articles' and not exists(select 1 from public.articles a where a.slug=s.slug and a.status='published'))
 )
) refs;
$$;

create or replace function private.stone_blockers(p_id bigint,p_draft jsonb,p_hide boolean)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare r jsonb; v jsonb; f jsonb; result jsonb := '[]'; ok boolean;
begin
 for r in select value from jsonb_array_elements(private.stone_usage(p_id)) loop
  if not (r->>'live')::boolean then continue; end if;
  ok := not p_hide;
  if ok and (r->>'variantId' is not null or r->>'finishId' is not null) then
   ok := false;
   for v in select value from jsonb_array_elements(p_draft->'variants') where (value->>'enabled')::boolean
    and (r->>'variantId' is null or value->>'id'=r->>'variantId') loop
    if r->>'finishId' is null then ok:=true; exit; end if;
    select value into f from jsonb_array_elements(v->'finishes') where value->>'definitionId'=r->>'finishId' and value->>'capability'<>'no';
    if f is not null and exists(select 1 from jsonb_array_elements(f->'images') i join public.media_assets m on m.id=(i->>'mediaAssetId')::bigint where i->>'role'<>'swatch' and m.status<>'archived') then ok:=true; exit; end if;
   end loop;
  end if;
  if not ok then result := result || jsonb_build_array(r); end if;
 end loop;
 return result;
end;
$$;

create or replace function private.stone_envelope(p_id bigint)
returns jsonb language sql stable security definer set search_path = '' as $$
select jsonb_build_object('stoneId',g.id,'revision',coalesce(d.revision,0),'liveVersion',private.stone_version(g.id),
 'publishedRevision',d.published_revision,'status',case when g.status='tbc' then 'draft' else g.status end,
 'addressLocked',g.published_at is not null or g.catalog_managed,'isTest',exists(select 1 from private.stone_exclusions e where e.stone_key=g.stone_group_key),
 'updatedAt',coalesce(d.updated_at,g.updated_at),'draft',coalesce(d.draft,private.stone_current_draft(g.id)))
from public.stone_groups g left join private.stone_drafts d on d.stone_id=g.id where g.id=p_id;
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
   'availability',sg.availability_status,'isTest',exists(select 1 from private.stone_exclusions e where e.stone_key=sg.stone_group_key),
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
    availability_status=s->>'availability',summary=nullif(s->>'summary',''),source_name=nullif(s->>'sourceName',''),
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

-- One read snapshot avoids list/detail races and returns no private notes, sourcing,
-- draft content, private object paths, or storage credentials.
create or replace function public.public_stone_catalogue()
returns jsonb language sql stable security definer set search_path = '' as $$
select jsonb_build_object(
 'managedKeys',coalesce((select jsonb_agg(stone_group_key order by stone_group_key) from public.stone_groups g
   where catalog_managed or exists(select 1 from private.stone_exclusions e where e.stone_key=g.stone_group_key)),'[]'::jsonb),
 'finishes',coalesce((select jsonb_agg(jsonb_build_object('id',id,'key',finish_key,'name',display_name,'sortOrder',sort_order) order by sort_order,id) from public.finish_definitions where status='published'),'[]'::jsonb),
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

revoke all on function public.admin_stone_workspace(text,bigint,bigint,text,uuid,jsonb,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.admin_stone_workspace(text,bigint,bigint,text,uuid,jsonb,uuid,text,jsonb) to service_role;
revoke all on function public.public_stone_catalogue() from public;
grant execute on function public.public_stone_catalogue() to anon,authenticated,service_role;
revoke all on function private.stone_current_draft(bigint),private.stone_version(bigint),private.stone_usage(bigint),private.stone_blockers(bigint,jsonb,boolean),private.stone_envelope(bigint) from public,anon,authenticated;
notify pgrst,'reload schema';
