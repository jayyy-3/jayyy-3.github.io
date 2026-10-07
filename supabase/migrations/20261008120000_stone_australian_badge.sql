-- NOW-STONE-AUSTRALIAN-BADGE-001 (Jay, 2026-10-08): public Stone Library pages show an
-- AUSTRALIAN STONE badge for stones whose published origin country is Australia.
-- Replaces public_stone_catalogue() only. The origin country string stays blank on the public
-- shape; only the computed boolean `australianStone` is added to each stones[].draft.stone.
-- No table change, no backfill, no data write. Every other field is identical to
-- 20261003120000_stone_available_as.sql.

create or replace function public.public_stone_catalogue()
returns jsonb language sql stable security definer set search_path = '' as $$
select jsonb_build_object(
 'managedKeys',coalesce((select jsonb_agg(stone_group_key order by stone_group_key) from public.stone_groups g
   where catalog_managed or exists(select 1 from private.stone_exclusions e where e.stone_key=g.stone_group_key)),'[]'::jsonb),
 'finishes',coalesce((select jsonb_agg(jsonb_build_object('id',id,'key',finish_key,'name',display_name,'sortOrder',sort_order) order by sort_order,id) from public.finish_definitions where status='published'),'[]'::jsonb),
 'availabilityOptions',coalesce((select jsonb_agg(jsonb_build_object('id',id,'key',option_key,'name',display_name,'sortOrder',sort_order) order by sort_order,id) from public.stone_availability_options where status='published'),'[]'::jsonb),
 'stones',coalesce((select jsonb_agg(jsonb_build_object('draft',jsonb_build_object('schemaVersion',1,
   'stone',(private.stone_current_draft(g.id)->'stone') - array['sourceName','originRegion','originCountry','internalNote'] || jsonb_build_object('sourceName','','originRegion','','originCountry','','internalNote','',
     'australianStone',lower(btrim(coalesce(g.origin_country,'')))='australia','cutOptions',coalesce((select jsonb_agg(c || jsonb_build_object('sources','[]'::jsonb)) from jsonb_array_elements(g.cut_options) c),'[]'::jsonb)),
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

revoke all on function public.public_stone_catalogue() from public;
grant execute on function public.public_stone_catalogue() to anon,authenticated,service_role;

notify pgrst,'reload schema';
