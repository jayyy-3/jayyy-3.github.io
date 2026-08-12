-- Make Stone Library the canonical material source for Project map points.
-- This is an expand/compatibility migration: legacy Project image/title fields
-- remain for rollback, but the new runtime no longer writes or reads them.

alter table public.project_materials
  add column if not exists stone_variant_id bigint
    references public.stone_variants(id) on delete set null;

create index if not exists project_materials_stone_variant_idx
  on public.project_materials (stone_variant_id);

-- Only backfill when exactly one published/non-negative Stone Library variant
-- supports the existing stone + finish pair. Ambiguous rows stay null for an
-- editor to resolve; the migration never guesses a variant.
with candidates as (
  select
    materials.id as project_material_id,
    min(variants.id) as stone_variant_id,
    count(*) as candidate_count
  from public.project_materials materials
  join public.stone_variants variants
    on variants.stone_group_id = materials.stone_group_id
   and variants.status = 'published'
  join public.stone_finish_capabilities capabilities
    on capabilities.stone_variant_id = variants.id
   and capabilities.finish_definition_id = materials.finish_definition_id
   and capabilities.capability <> 'no'
  where materials.stone_variant_id is null
  group by materials.id
)
update public.project_materials materials
set stone_variant_id = candidates.stone_variant_id
from candidates
where materials.id = candidates.project_material_id
  and candidates.candidate_count = 1;

create or replace function private.sync_project_material_variants_from_draft()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_item jsonb;
  v_material_id bigint;
  v_variant_id bigint;
  v_stone_group_id bigint;
  v_finish_definition_id bigint;
begin
  if new.published_revision is not distinct from old.published_revision then
    return new;
  end if;

  for v_item in
    select value
    from jsonb_array_elements(coalesce(new.draft->'materials', '[]'::jsonb))
  loop
    v_material_id := nullif(v_item->>'id', '')::bigint;
    v_variant_id := nullif(v_item->>'stoneVariantId', '')::bigint;
    v_stone_group_id := nullif(v_item->>'stoneGroupId', '')::bigint;
    v_finish_definition_id := nullif(v_item->>'finishDefinitionId', '')::bigint;

    if v_material_id is null then
      raise exception 'project_material_id_required' using errcode = '22023';
    end if;

    if v_variant_id is not null and not exists (
      select 1
      from public.stone_variants variants
      join public.stone_finish_capabilities capabilities
        on capabilities.stone_variant_id = variants.id
       and capabilities.finish_definition_id = v_finish_definition_id
       and capabilities.capability <> 'no'
      where variants.id = v_variant_id
        and variants.stone_group_id = v_stone_group_id
        and variants.status = 'published'
    ) then
      raise exception 'project_material_stone_library_mismatch' using errcode = '23514';
    end if;

    update public.project_materials materials
    set stone_variant_id = v_variant_id
    where materials.id = v_material_id
      and materials.project_id = new.project_id;

    if not found then
      raise exception 'project_material_variant_ownership_mismatch' using errcode = '42501';
    end if;
  end loop;

  return new;
end;
$function$;

revoke all on function private.sync_project_material_variants_from_draft() from public, anon, authenticated;

drop trigger if exists sync_project_material_variants_from_draft
  on private.project_drafts;
create trigger sync_project_material_variants_from_draft
before update of published_revision on private.project_drafts
for each row
execute function private.sync_project_material_variants_from_draft();

notify pgrst, 'reload schema';
