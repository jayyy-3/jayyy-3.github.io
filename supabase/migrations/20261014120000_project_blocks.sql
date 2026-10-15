-- Project body blocks (NOW-PROJECT-BLOCKS-001, Phase 1A).
-- Jay approved a block-based Project body on 2026-10-14 (docs/plans/TMP-project-blocks.md).
-- Expand only. The migration runner applies this file as one transaction; the read-back
-- self-check at the end aborts the whole transaction when the copy or reshape is incomplete.
--   1. public.project_blocks: ordered body blocks (the 14 shared content-block types).
--   2. Copy every normal_image / hotspot_image / youtube_video project_media row (all statuses)
--      into project_blocks one to one. project_media is neither altered nor deleted; it keeps
--      its rows as history, and the runtime no longer reads or writes it.
--   3. Reshape private drafts: `mediaBlocks` become `blocks` with schemaVersion 2.
--   4. admin_project_aggregate reads and writes `blocks` (and upgrades a cached older
--      editor's `mediaBlocks` draft before validation).
--   5. Stone references from stone cards join the Stone Library reference guard.

-- 1. Table ------------------------------------------------------------------------------
create table public.project_blocks (
  id bigint generated always as identity primary key,
  project_id bigint not null references public.projects(id) on delete cascade,
  block_key text not null check (length(btrim(block_key)) between 1 and 200),
  block_type text not null check (block_type in (
    'heading', 'text', 'quote', 'callout', 'stats', 'steps', 'spec_table',
    'comparison_table', 'stone_cards', 'image', 'gallery', 'hotspot_image', 'video', 'cta'
  )),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  media_asset_id bigint references public.media_assets(id) on delete set null,
  project_material_map_id bigint references public.project_material_maps(id) on delete set null,
  linked_stone_group_ids bigint[] not null default '{}'::bigint[],
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz,
  constraint project_blocks_map_only_on_points check (project_material_map_id is null or block_type = 'hotspot_image'),
  constraint project_blocks_stones_only_on_cards check (linked_stone_group_ids = '{}'::bigint[] or block_type = 'stone_cards')
);

comment on table public.project_blocks is
  'Ordered Project page body (shared content blocks). Written only by admin_project_aggregate.';

create unique index project_blocks_project_key_idx
  on public.project_blocks (project_id, block_key) where status <> 'archived';
create index project_blocks_project_status_sort_idx on public.project_blocks (project_id, status, sort_order);
create index project_blocks_media_idx on public.project_blocks (media_asset_id);
create index project_blocks_material_map_idx on public.project_blocks (project_material_map_id);
create index project_blocks_stone_groups_idx on public.project_blocks using gin (linked_stone_group_ids);
create index project_blocks_created_by_idx on public.project_blocks (created_by);
create index project_blocks_updated_by_idx on public.project_blocks (updated_by);

create trigger project_blocks_set_updated_at before update on public.project_blocks
  for each row execute function public.set_updated_at();

alter table public.project_blocks enable row level security;

-- Same public boundary as project_media: Published blocks of a Published, approved project.
create policy project_blocks_public_select on public.project_blocks
  for select to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1 from public.projects projects
      where projects.id = project_blocks.project_id
        and projects.status = 'published'
        and projects.claim_review_status = 'approved'
    )
  );

create policy project_blocks_admin_select on public.project_blocks
  for select to authenticated
  using (private.has_admin_role(array['owner', 'admin', 'editor', 'viewer']));

-- Browser roles read only; every write goes through the service-role aggregate RPC.
revoke all on table public.project_blocks from public, anon, authenticated;
grant select on table public.project_blocks to anon, authenticated;
revoke all on sequence public.project_blocks_id_seq from public, anon, authenticated;

-- 2. Helpers (private, used by the RPC and the reshape below) --------------------------

-- Mirrors upgradeLegacyMediaBlock (src/features/blocks/upgrade.ts, functions/_lib/blocks.js).
create or replace function private.project_upgrade_media_block(p_item jsonb, p_index integer)
returns jsonb
language sql
immutable
set search_path = ''
as $function$
  select jsonb_build_object(
    'key', 'block:legacy:' || coalesce(nullif(p_item->>'key', ''), 'index-' || p_index),
    'id', null,
    'type', case p_item->>'mediaRole'
      when 'youtube_video' then 'video'
      when 'hotspot_image' then 'hotspot_image'
      else 'image'
    end,
    'sortOrder', case
      when jsonb_typeof(p_item->'sortOrder') = 'number' and p_item->>'sortOrder' ~ '^-?[0-9]+$' then p_item->'sortOrder'
      else to_jsonb(p_index)
    end,
    'content', case p_item->>'mediaRole'
      when 'youtube_video' then jsonb_build_object(
        'youtubeUrl', coalesce(p_item->>'youtubeUrl', ''))
      when 'hotspot_image' then jsonb_build_object(
        'projectMaterialMapKey', to_jsonb(nullif(p_item->>'projectMaterialMapKey', '')))
      else jsonb_build_object(
        'mediaAssetId', case
          when p_item->>'mediaRole' in ('cover', 'hero', 'gallery', 'material_map', 'supporting', 'normal_image')
            and jsonb_typeof(p_item->'mediaAssetId') = 'number' and p_item->>'mediaAssetId' ~ '^[0-9]+$'
            and (p_item->>'mediaAssetId')::numeric > 0
            then p_item->'mediaAssetId'
          else 'null'::jsonb
        end,
        'alt', '')
    end
    || jsonb_build_object(
      'title', coalesce(p_item->>'blockTitle', ''),
      'label', coalesce(p_item->>'label', ''),
      'caption', coalesce(p_item->>'caption', ''))
    || case
      when jsonb_typeof(p_item->'id') = 'number' and p_item->>'id' ~ '^[0-9]+$' and (p_item->>'id')::numeric > 0
        then jsonb_build_object('legacyProjectMediaId', p_item->'id')
      else '{}'::jsonb
    end
  );
$function$;

-- Mirrors upgradeLegacyProjectDraft: drafts without schemaVersion 2 get `blocks`.
create or replace function private.project_upgrade_draft(p_draft jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $function$
  select case
    when jsonb_typeof(p_draft) is distinct from 'object' or p_draft->'schemaVersion' = '2'::jsonb then p_draft
    else (p_draft - 'mediaBlocks') || jsonb_build_object(
      'schemaVersion', 2,
      'blocks', case
        when jsonb_typeof(p_draft->'mediaBlocks') = 'array' then coalesce((
          select jsonb_agg(private.project_upgrade_media_block(items.value, (items.ordinality - 1)::integer) order by items.ordinality)
          from jsonb_array_elements(p_draft->'mediaBlocks') with ordinality as items(value, ordinality)
        ), '[]'::jsonb)
        when jsonb_typeof(p_draft->'blocks') = 'array' then p_draft->'blocks'
        else '[]'::jsonb
      end
    )
  end;
$function$;

-- Media asset IDs a block's content references (image, gallery items, step images).
create or replace function private.project_block_media_ids(p_block jsonb)
returns bigint[]
language sql
immutable
set search_path = ''
as $function$
  select coalesce(array_agg(distinct ids.id order by ids.id), '{}'::bigint[])
  from (
    select (p_block->'content'->>'mediaAssetId')::bigint as id
    where p_block->>'type' = 'image'
      and jsonb_typeof(p_block->'content'->'mediaAssetId') = 'number'
    union all
    select (items.value->>'mediaAssetId')::bigint
    from jsonb_array_elements(
      case when p_block->>'type' in ('gallery', 'steps') and jsonb_typeof(p_block->'content'->'items') = 'array'
        then p_block->'content'->'items' else '[]'::jsonb end
    ) items
    where jsonb_typeof(items.value->'mediaAssetId') = 'number'
  ) ids;
$function$;

-- Stone Library stone IDs a stone_cards block names.
create or replace function private.project_block_stone_ids(p_block jsonb)
returns bigint[]
language sql
immutable
set search_path = ''
as $function$
  select coalesce(array_agg(distinct (items.value->>'stoneGroupId')::bigint order by (items.value->>'stoneGroupId')::bigint), '{}'::bigint[])
  from jsonb_array_elements(
    case when p_block->>'type' = 'stone_cards' and jsonb_typeof(p_block->'content'->'items') = 'array'
      then p_block->'content'->'items' else '[]'::jsonb end
  ) items
  where jsonb_typeof(items.value->'stoneGroupId') = 'number';
$function$;

revoke all on function
  private.project_upgrade_media_block(jsonb, integer),
  private.project_upgrade_draft(jsonb),
  private.project_block_media_ids(jsonb),
  private.project_block_stone_ids(jsonb)
from public, anon, authenticated;

-- 3. Copy project_media body rows one to one -----------------------------------------
-- Baseline for the self-check (project_media must be unchanged by this migration).
select set_config('urblo.project_media_rows_before', (select count(*) from public.project_media)::text, false);

insert into public.project_blocks (
  project_id, block_key, block_type, content, media_asset_id, project_material_map_id,
  sort_order, status, created_at, updated_at, created_by, updated_by, published_at, archived_at
)
select
  media.project_id,
  'block:legacy-media:' || media.id,
  case media.media_role
    when 'normal_image' then 'image'
    when 'hotspot_image' then 'hotspot_image'
    else 'video'
  end,
  case media.media_role
    when 'normal_image' then jsonb_build_object(
      'mediaAssetId', media.media_asset_id,
      -- The description visitors saw is the media item's; keep it with the block.
      'alt', coalesce(assets.alt, ''))
    when 'youtube_video' then jsonb_build_object('youtubeUrl', coalesce(media.youtube_url, ''))
    else '{}'::jsonb
  end
  || jsonb_build_object(
    'title', coalesce(media.block_title, ''),
    'label', coalesce(media.label, ''),
    'caption', coalesce(media.caption, ''),
    'legacyProjectMediaId', media.id),
  case when media.media_role in ('normal_image', 'hotspot_image') then media.media_asset_id end,
  case when media.media_role = 'hotspot_image' then media.project_material_map_id end,
  media.sort_order,
  media.status,
  media.created_at,
  media.updated_at,
  media.created_by,
  media.updated_by,
  media.published_at,
  media.archived_at
from public.project_media media
left join public.media_assets assets on assets.id = media.media_asset_id
where media.media_role in ('normal_image', 'hotspot_image', 'youtube_video')
order by media.id;

-- Copied rows take the canonical `block:<id>` key once their ID exists.
update public.project_blocks set block_key = 'block:' || id
where block_key like 'block:legacy-media:%';

-- 4. Reshape private drafts -------------------------------------------------------------
-- Each draft media block becomes a block; one copied from a project_media row takes that
-- row's project_blocks ID and key, and an image keeps its media description.
update private.project_drafts drafts
set draft = (drafts.draft - 'mediaBlocks') || jsonb_build_object(
  'schemaVersion', 2,
  'blocks', coalesce((
    select jsonb_agg(
      case
        when copied.id is not null then
          upgraded.block
          || jsonb_build_object('id', copied.id, 'key', 'block:' || copied.id)
          || case when upgraded.block->>'type' = 'image'
               and upgraded.block->'content'->>'mediaAssetId' = copied.media_asset_id::text then jsonb_build_object(
               'content', (upgraded.block->'content') || jsonb_build_object('alt', coalesce(copied.content->>'alt', '')))
             else '{}'::jsonb end
        else upgraded.block
      end
      order by items.ordinality)
    from jsonb_array_elements(
      case when jsonb_typeof(drafts.draft->'mediaBlocks') = 'array' then drafts.draft->'mediaBlocks' else '[]'::jsonb end
    ) with ordinality as items(value, ordinality)
    cross join lateral (
      select private.project_upgrade_media_block(items.value, (items.ordinality - 1)::integer) as block
    ) upgraded
    left join public.project_blocks copied
      on copied.project_id = drafts.project_id
     and copied.content->>'legacyProjectMediaId' = upgraded.block->'content'->>'legacyProjectMediaId'
  ), '[]'::jsonb)
)
where drafts.draft->'schemaVersion' is distinct from '2'::jsonb;

-- 5. Aggregate RPC ----------------------------------------------------------------------
create or replace function public.admin_project_aggregate(
  p_action text,
  p_project_id bigint,
  p_base_revision bigint,
  p_base_updated_at timestamptz,
  p_draft jsonb,
  p_actor_user_id uuid,
  p_expected_actor_role text,
  p_promotions jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := statement_timestamp();
  v_actor_role text;
  v_project_id bigint := p_project_id;
  v_project public.projects%rowtype;
  v_project_exists boolean := false;
  v_saved_draft private.project_drafts%rowtype;
  v_draft_exists boolean := false;
  v_next_revision bigint;
  v_project_json jsonb;
  v_item jsonb;
  v_item_id bigint;
  v_parent_id bigint;
  v_claim_status text;
  v_item_claim_status text;
  v_result_draft jsonb;
  v_facts_out jsonb := '[]'::jsonb;
  v_materials_out jsonb := '[]'::jsonb;
  v_maps_out jsonb := '[]'::jsonb;
  v_blocks_out jsonb := '[]'::jsonb;
  v_hotspots_out jsonb := '[]'::jsonb;
  v_map_ids jsonb := '{}'::jsonb;
  v_material_ids jsonb := '{}'::jsonb;
  v_map_id bigint;
  v_material_id bigint;
  v_map_media_id bigint;
  v_youtube_count integer;
  v_key text;
  v_media_ids bigint[] := '{}'::bigint[];
  v_media_id bigint;
  v_media public.media_assets%rowtype;
  v_promotion jsonb;
  v_source_updated_at timestamptz;
  v_live_status text;
  v_block_type text;
  v_content jsonb;
  v_stone_ids bigint[];
  v_used_block_ids bigint[] := '{}'::bigint[];
begin
  if p_action not in ('list', 'get', 'save', 'publish', 'archive') then
    raise exception 'invalid_action' using errcode = '22023';
  end if;

  if p_expected_actor_role is null
     or p_expected_actor_role not in ('owner', 'admin', 'editor', 'viewer') then
    raise exception 'invalid_expected_actor_role' using errcode = '22023';
  end if;

  select profiles.role
  into v_actor_role
  from public.admin_profiles profiles
  where profiles.user_id = p_actor_user_id
    and profiles.is_active
    and profiles.role in ('owner', 'admin', 'editor', 'viewer')
  limit 1
  for share;

  if v_actor_role is null then
    raise exception 'not_allowed' using errcode = '42501';
  end if;

  if v_actor_role is distinct from p_expected_actor_role then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object('code', 'actor_role_changed', 'message', 'Your Projects access changed. Reload the workspace before continuing.')::text,
      detail = jsonb_build_object('status', 403, 'status_text', 'Forbidden', 'headers', jsonb_build_object())::text;
  end if;

  if v_actor_role = 'viewer' and p_action not in ('list', 'get') then
    raise exception 'read_only' using errcode = '42501';
  end if;

  if p_action = 'list' then
    return (
      select jsonb_build_object(
        'projects',
        coalesce(
          jsonb_agg(
            jsonb_build_object(
              'id', listing.project_id,
              'revision', listing.revision,
              'status', listing.editing_status,
              'title', listing.title,
              'slug', listing.slug,
              'location', listing.location,
              'sortOrder', listing.sort_order,
              'updatedAt', listing.updated_at
            )
            order by listing.sort_order, listing.title, listing.project_id
          ),
          '[]'::jsonb
        )
      )
      from (
        select
          coalesce(projects.id, drafts.project_id) as project_id,
          coalesce(drafts.revision, 0) as revision,
          case
            when drafts.archived_at is not null then 'archived'
            when drafts.project_id is not null
              and drafts.published_revision = drafts.revision
              and projects.status = 'published' then 'published'
            when drafts.project_id is not null then 'draft'
            else projects.status
          end as editing_status,
          coalesce(nullif(drafts.draft #>> '{project,title}', ''), projects.title, 'Untitled project') as title,
          coalesce(nullif(drafts.draft #>> '{project,slug}', ''), projects.slug, '') as slug,
          coalesce(nullif(drafts.draft #>> '{project,location}', ''), projects.location, '') as location,
          coalesce(nullif(drafts.draft #>> '{project,sortOrder}', '')::integer, projects.sort_order, 0) as sort_order,
          coalesce(drafts.updated_at, projects.updated_at) as updated_at
        from public.projects projects
        full join private.project_drafts drafts on drafts.project_id = projects.id
      ) listing
    );
  end if;

  if p_action = 'get' then
    if v_project_id is null then
      raise exception 'project_id_required' using errcode = '22023';
    end if;

    select drafts.* into v_saved_draft
    from private.project_drafts drafts
    where drafts.project_id = v_project_id;

    if found then
      select projects.status into v_live_status
      from public.projects projects
      where projects.id = v_project_id;

      return jsonb_build_object(
        'found', true,
        'projectId', v_project_id,
        'revision', v_saved_draft.revision,
        'baseUpdatedAt', v_saved_draft.base_updated_at,
        'status', case
          when v_saved_draft.archived_at is not null then 'archived'
          when v_saved_draft.published_revision = v_saved_draft.revision and v_live_status = 'published' then 'published'
          else 'draft'
        end,
        'draft', v_saved_draft.draft
      );
    end if;

    return jsonb_build_object('found', false, 'projectId', v_project_id);
  end if;

  if p_base_revision is null or p_base_revision < 0 then
    raise exception 'invalid_base_revision' using errcode = '22023';
  end if;

  if p_draft is null or jsonb_typeof(p_draft) <> 'object' then
    raise exception 'invalid_draft' using errcode = '22023';
  end if;

  -- A cached older editor may still send the pre-block draft shape.
  p_draft := private.project_upgrade_draft(p_draft);

  if octet_length(p_draft::text) > 1048576 then
    raise exception 'draft_too_large' using errcode = '22023';
  end if;

  v_project_json := p_draft->'project';
  if jsonb_typeof(v_project_json) <> 'object'
     or jsonb_typeof(coalesce(p_draft->'facts', '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_draft->'materials', '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_draft->'maps', '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_draft->'blocks', '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_draft->'hotspots', '[]'::jsonb)) <> 'array' then
    raise exception 'invalid_draft_shape' using errcode = '22023';
  end if;

  if jsonb_array_length(coalesce(p_draft->'facts', '[]'::jsonb)) > 100
     or jsonb_array_length(coalesce(p_draft->'materials', '[]'::jsonb)) > 100
     or jsonb_array_length(coalesce(p_draft->'maps', '[]'::jsonb)) > 30
     or jsonb_array_length(coalesce(p_draft->'blocks', '[]'::jsonb)) > 100
     or jsonb_array_length(coalesce(p_draft->'hotspots', '[]'::jsonb)) > 300 then
    raise exception 'draft_row_limit_exceeded' using errcode = '22023';
  end if;

  if v_project_id is null then
    if p_action not in ('save', 'publish')
       or p_base_revision <> 0
       or p_base_updated_at is not null then
      raise sqlstate 'PGRST' using
        message = jsonb_build_object('code', 'revision_conflict', 'message', 'Start a new project from revision 0 with no existing page version.')::text,
        detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
    end if;
    v_project_id := nextval(pg_get_serial_sequence('public.projects', 'id'));
  else
    select projects.* into v_project
    from public.projects projects
    where projects.id = v_project_id
    for update;
    v_project_exists := found;

    select drafts.* into v_saved_draft
    from private.project_drafts drafts
    where drafts.project_id = v_project_id
    for update;
    v_draft_exists := found;

    if not v_project_exists and not v_draft_exists then
      raise sqlstate 'PGRST' using
        message = jsonb_build_object('code', 'project_not_found', 'message', 'The project was not found.')::text,
        detail = jsonb_build_object('status', 404, 'status_text', 'Not Found', 'headers', jsonb_build_object())::text;
    end if;
  end if;

  -- The Project row is locked above, making this first-adoption token check
  -- atomic with every following private-draft or canonical write. Existing
  -- canonical Projects require a non-null exact token; draft-only new Projects
  -- retain a null token until their first publish creates the canonical row.
  if v_project_exists
     and (
       p_base_updated_at is null
       or p_base_updated_at is distinct from v_project.updated_at
     ) then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object('code', 'revision_conflict', 'message', 'The live project changed after it was loaded. Reload before saving.')::text,
      detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
  end if;

  if not v_project_exists and p_base_updated_at is not null then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object('code', 'revision_conflict', 'message', 'This project has no matching live page version. Reload before saving.')::text,
      detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
  end if;

  if v_draft_exists
     and p_base_updated_at is distinct from v_saved_draft.base_updated_at then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object('code', 'revision_conflict', 'message', 'This project draft has a different live-page baseline. Reload before saving.')::text,
      detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
  end if;

  if v_draft_exists then
    if p_base_revision <> v_saved_draft.revision then
      raise sqlstate 'PGRST' using
        message = jsonb_build_object('code', 'revision_conflict', 'message', 'This project changed after it was loaded. Reload before saving.')::text,
        detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
    end if;
  elsif p_base_revision <> 0 then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object('code', 'revision_conflict', 'message', 'This project has no matching saved revision. Reload before saving.')::text,
      detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
  end if;

  if p_action = 'save' then
    v_next_revision := case when v_draft_exists then v_saved_draft.revision + 1 else 1 end;
    v_result_draft := jsonb_set(
      jsonb_set(p_draft, '{project,id}', to_jsonb(v_project_id), true),
      '{project,status}',
      to_jsonb('draft'::text),
      true
    );

    insert into private.project_drafts (
      project_id,
      draft,
      revision,
      base_updated_at,
      published_revision,
      created_by,
      updated_by,
      published_by,
      archived_by,
      published_at,
      archived_at
    ) values (
      v_project_id,
      v_result_draft,
      v_next_revision,
      case when v_project_exists then v_project.updated_at else null end,
      case when v_draft_exists then v_saved_draft.published_revision else null end,
      p_actor_user_id,
      p_actor_user_id,
      case when v_draft_exists then v_saved_draft.published_by else null end,
      null,
      case when v_draft_exists then v_saved_draft.published_at else null end,
      null
    )
    on conflict (project_id) do update set
      draft = excluded.draft,
      revision = excluded.revision,
      updated_by = excluded.updated_by,
      updated_at = v_now,
      archived_by = null,
      archived_at = null;

    insert into public.admin_audit_events (
      actor_user_id, action, entity_type, entity_id, metadata
    ) values (
      p_actor_user_id,
      'project.aggregate_draft.save',
      'projects',
      v_project_id,
      jsonb_build_object(
        'revision', v_next_revision,
        'liveStatus', case when v_project_exists then v_project.status else null end,
        'facts', jsonb_array_length(coalesce(v_result_draft->'facts', '[]'::jsonb)),
        'materials', jsonb_array_length(coalesce(v_result_draft->'materials', '[]'::jsonb)),
        'maps', jsonb_array_length(coalesce(v_result_draft->'maps', '[]'::jsonb)),
        'blocks', jsonb_array_length(coalesce(v_result_draft->'blocks', '[]'::jsonb)),
        'hotspots', jsonb_array_length(coalesce(v_result_draft->'hotspots', '[]'::jsonb)),
        'source', 'functions/api/admin/projects.js'
      )
    );

    return jsonb_build_object(
      'projectId', v_project_id,
      'revision', v_next_revision,
      'baseUpdatedAt', case when v_project_exists then v_project.updated_at else null end,
      'status', 'draft',
      'draft', v_result_draft,
      'message', 'Project draft saved.'
    );
  end if;

  -- The project row is already locked above. Compare the private draft's
  -- canonical baseline before either publish or archive mutates live rows, so
  -- an out-of-band service-role/manual edit cannot be silently overwritten.
  if p_action in ('publish', 'archive')
     and v_project_exists
     and v_draft_exists
     and v_saved_draft.base_updated_at is distinct from v_project.updated_at then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object(
        'code',
        'revision_conflict',
        'message',
        case
          when p_action = 'archive' then 'The live project changed after this draft began. Reload before hiding it.'
          else 'The live project changed after this draft began. Reload before publishing.'
        end
      )::text,
      detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
  end if;

  if p_action = 'archive' then
    v_next_revision := case when v_draft_exists then v_saved_draft.revision + 1 else 1 end;
    v_result_draft := jsonb_set(
      jsonb_set(p_draft, '{project,id}', to_jsonb(v_project_id), true),
      '{project,status}',
      to_jsonb('archived'::text),
      true
    );
    v_source_updated_at := case when v_project_exists then v_project.updated_at else null end;

    if v_project_exists then
      update public.project_hotspots hotspots set
        status = 'archived', archived_at = v_now, updated_by = p_actor_user_id
      where exists (
        select 1 from public.project_material_maps maps
        where maps.id = hotspots.project_material_map_id
          and maps.project_id = v_project_id
      );
      update public.project_blocks set
        status = 'archived', archived_at = v_now, updated_by = p_actor_user_id
      where project_id = v_project_id;
      update public.project_material_maps set
        status = 'archived', archived_at = v_now, updated_by = p_actor_user_id
      where project_id = v_project_id;
      update public.project_materials set
        status = 'archived', archived_at = v_now, updated_by = p_actor_user_id
      where project_id = v_project_id;
      update public.project_facts set
        status = 'archived', archived_at = v_now, updated_by = p_actor_user_id
      where project_id = v_project_id;
      update public.projects set
        status = 'archived', archived_at = v_now, updated_by = p_actor_user_id
      where id = v_project_id
      returning updated_at into v_source_updated_at;
    end if;

    insert into private.project_drafts (
      project_id, draft, revision, base_updated_at, published_revision,
      created_by, updated_by, published_by, archived_by,
      published_at, archived_at
    ) values (
      v_project_id, v_result_draft, v_next_revision, v_source_updated_at,
      case when v_draft_exists then v_saved_draft.published_revision else null end,
      p_actor_user_id, p_actor_user_id,
      case when v_draft_exists then v_saved_draft.published_by else null end,
      p_actor_user_id,
      case when v_draft_exists then v_saved_draft.published_at else null end,
      v_now
    )
    on conflict (project_id) do update set
      draft = excluded.draft,
      revision = excluded.revision,
      base_updated_at = excluded.base_updated_at,
      updated_by = excluded.updated_by,
      updated_at = v_now,
      archived_by = excluded.archived_by,
      archived_at = excluded.archived_at;

    insert into public.admin_audit_events (
      actor_user_id, action, entity_type, entity_id, metadata
    ) values (
      p_actor_user_id,
      'project.aggregate.archive',
      'projects',
      v_project_id,
      jsonb_build_object('revision', v_next_revision, 'source', 'functions/api/admin/projects.js')
    );

    return jsonb_build_object(
      'projectId', v_project_id,
      'revision', v_next_revision,
      'baseUpdatedAt', v_source_updated_at,
      'status', 'archived',
      'draft', v_result_draft,
      'message', 'Project hidden.'
    );
  end if;

  -- Publish always persists the request's current aggregate as a new private
  -- revision inside this transaction before applying it to canonical tables.
  v_next_revision := case when v_draft_exists then v_saved_draft.revision + 1 else 1 end;
  v_result_draft := jsonb_set(
    jsonb_set(p_draft, '{project,id}', to_jsonb(v_project_id), true),
    '{project,status}',
    to_jsonb('draft'::text),
    true
  );

  insert into private.project_drafts (
    project_id, draft, revision, base_updated_at, published_revision,
    created_by, updated_by, published_by, archived_by,
    published_at, archived_at
  ) values (
    v_project_id, v_result_draft, v_next_revision,
    case when v_project_exists then v_project.updated_at else null end,
    case when v_draft_exists then v_saved_draft.published_revision else null end,
    p_actor_user_id, p_actor_user_id,
    case when v_draft_exists then v_saved_draft.published_by else null end,
    null,
    case when v_draft_exists then v_saved_draft.published_at else null end,
    null
  )
  on conflict (project_id) do update set
    draft = excluded.draft,
    revision = excluded.revision,
    updated_by = excluded.updated_by,
    updated_at = v_now,
    archived_by = null,
    archived_at = null
  returning * into v_saved_draft;
  v_draft_exists := true;

  v_project_json := v_saved_draft.draft->'project';
  v_claim_status := coalesce(nullif(v_project_json->>'claimReviewStatus', ''), 'needs_review');
  if v_claim_status <> 'approved' then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object('code', 'publish_blocked', 'message', 'Project proof review must be approved before publishing.')::text,
      detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
  end if;

  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'facts', '[]'::jsonb)) loop
    v_item_claim_status := nullif(v_item->>'claimStatus', '');
    if v_item_claim_status is null or v_item_claim_status not in ('approved', 'deferred') then
      raise sqlstate 'PGRST' using
        message = jsonb_build_object('code', 'publish_blocked', 'message', 'Every project fact needs an approved or deferred proof decision.')::text,
        detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
    end if;
  end loop;

  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'materials', '[]'::jsonb)) loop
    v_item_claim_status := nullif(v_item->>'claimStatus', '');
    if v_item_claim_status is null or v_item_claim_status not in ('approved', 'deferred') then
      raise sqlstate 'PGRST' using
        message = jsonb_build_object('code', 'publish_blocked', 'message', 'Every project material needs an approved or deferred proof decision.')::text,
        detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
    end if;
  end loop;

  select count(*) into v_youtube_count
  from jsonb_array_elements(coalesce(v_saved_draft.draft->'blocks', '[]'::jsonb)) blocks
  where blocks->>'type' = 'video';
  if v_youtube_count > 1 then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object('code', 'publish_blocked', 'message', 'Keep one YouTube video on each project page.')::text,
      detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
  end if;

  -- The Function validates every block field against the shared block contract
  -- (functions/_lib/blocks.js); this transaction re-checks what publication integrity needs.
  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'blocks', '[]'::jsonb)) loop
    v_block_type := v_item->>'type';
    v_content := v_item->'content';
    if v_block_type is null or v_block_type not in (
         'heading', 'text', 'quote', 'callout', 'stats', 'steps', 'spec_table',
         'comparison_table', 'stone_cards', 'image', 'gallery', 'hotspot_image', 'video', 'cta'
       ) then
      raise exception 'invalid_block_type' using errcode = '22023';
    end if;
    if nullif(v_item->>'key', '') is null
       or length(v_item->>'key') > 200
       or jsonb_typeof(v_content) is distinct from 'object' then
      raise exception 'invalid_block' using errcode = '22023';
    end if;
    if v_block_type = 'video' then
      if not (
           btrim(coalesce(v_content->>'youtubeUrl', '')) ~ '^[A-Za-z0-9_-]{6,}$'
           or btrim(coalesce(v_content->>'youtubeUrl', '')) ~* '^https://youtu\.be/[A-Za-z0-9_-]{6,}([/?#&]|$)'
           or btrim(coalesce(v_content->>'youtubeUrl', '')) ~* '^https://(www\.|m\.)?youtube\.com/(watch\?[^#]*v=|embed/|shorts/)[A-Za-z0-9_-]{6,}'
           or btrim(coalesce(v_content->>'youtubeUrl', '')) ~* '^https://(www\.|m\.)?youtube\.com/([^?#]+/)?[A-Za-z0-9_-]{6,}([/?#&]|$)'
           or btrim(coalesce(v_content->>'youtubeUrl', '')) ~* '^https://(www\.)?youtube-nocookie\.com/(embed/|shorts/)[A-Za-z0-9_-]{6,}'
           or btrim(coalesce(v_content->>'youtubeUrl', '')) ~* '^https://(www\.)?youtube-nocookie\.com/([^?#]+/)?[A-Za-z0-9_-]{6,}([/?#&]|$)'
         ) then
        raise sqlstate 'PGRST' using
          message = jsonb_build_object('code', 'publish_blocked', 'message', 'Complete the YouTube video block before publishing.')::text,
          detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
      end if;
    elsif v_block_type = 'hotspot_image' then
      if nullif(v_content->>'projectMaterialMapKey', '') is null then
        raise sqlstate 'PGRST' using
          message = jsonb_build_object('code', 'publish_blocked', 'message', 'Connect every map image block to its material map.')::text,
          detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
      end if;
    elsif v_block_type = 'image' then
      if nullif(v_content->>'mediaAssetId', '') is null then
        raise sqlstate 'PGRST' using
          message = jsonb_build_object('code', 'publish_blocked', 'message', 'Choose an image for every project media block.')::text,
          detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
      end if;
    elsif v_block_type = 'gallery' then
      if jsonb_typeof(v_content->'items') is distinct from 'array'
         or jsonb_array_length(v_content->'items') < 2
         or exists (
           select 1 from jsonb_array_elements(v_content->'items') items
           where nullif(items.value->>'mediaAssetId', '') is null
         ) then
        raise sqlstate 'PGRST' using
          message = jsonb_build_object('code', 'publish_blocked', 'message', 'Choose an image for every gallery item.')::text,
          detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
      end if;
    end if;
  end loop;

  if nullif(btrim(v_project_json->>'title'), '') is null
     or coalesce(v_project_json->>'slug', '') !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'invalid_project_identity' using errcode = '22023';
  end if;

  -- Collect every media reference before accepting a promotion plan.
  foreach v_media_id in array array[
    nullif(v_project_json->>'heroMediaId', '')::bigint,
    nullif(v_project_json->>'coverMediaId', '')::bigint
  ] loop
    if v_media_id is not null and not (v_media_id = any(v_media_ids)) then
      v_media_ids := array_append(v_media_ids, v_media_id);
    end if;
  end loop;

  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'materials', '[]'::jsonb)) loop
    v_media_id := nullif(v_item->>'mediaAssetId', '')::bigint;
    if v_media_id is not null and not (v_media_id = any(v_media_ids)) then v_media_ids := array_append(v_media_ids, v_media_id); end if;
  end loop;
  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'maps', '[]'::jsonb)) loop
    v_media_id := nullif(v_item->>'mediaAssetId', '')::bigint;
    if v_media_id is not null and not (v_media_id = any(v_media_ids)) then v_media_ids := array_append(v_media_ids, v_media_id); end if;
  end loop;
  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'blocks', '[]'::jsonb)) loop
    foreach v_media_id in array private.project_block_media_ids(v_item) loop
      if not (v_media_id = any(v_media_ids)) then v_media_ids := array_append(v_media_ids, v_media_id); end if;
    end loop;
  end loop;
  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'hotspots', '[]'::jsonb)) loop
    v_media_id := nullif(v_item->>'previewMediaId', '')::bigint;
    if v_media_id is not null and not (v_media_id = any(v_media_ids)) then v_media_ids := array_append(v_media_ids, v_media_id); end if;
  end loop;

  select coalesce(array_agg(media_ids.id order by media_ids.id), '{}'::bigint[])
  into v_media_ids
  from unnest(v_media_ids) media_ids(id);

  if jsonb_typeof(coalesce(p_promotions, '[]'::jsonb)) <> 'array' then
    raise exception 'invalid_promotion_plan' using errcode = '22023';
  end if;

  for v_promotion in
    select value
    from jsonb_array_elements(coalesce(p_promotions, '[]'::jsonb))
    order by (value->>'mediaAssetId')::bigint
  loop
    v_media_id := nullif(v_promotion->>'mediaAssetId', '')::bigint;
    if v_media_id is null or not (v_media_id = any(v_media_ids)) then
      raise exception 'promotion_not_referenced' using errcode = '22023';
    end if;

    select assets.* into v_media
    from public.media_assets assets
    where assets.id = v_media_id
    for update;
    if not found then raise exception 'promotion_media_not_found' using errcode = '23503'; end if;
    if v_media.status = 'archived' then
      raise sqlstate 'PGRST' using
        message = jsonb_build_object('code', 'media_archived', 'message', 'A referenced media item is hidden and cannot be published.')::text,
        detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
    end if;

    v_source_updated_at := (v_promotion->>'sourceUpdatedAt')::timestamptz;
    if v_promotion->>'promotionKind' = 'external_reference' then
      if v_media.source_kind not in ('external_legacy', 'r2', 'stream')
         or v_media.updated_at is distinct from v_source_updated_at
         or nullif(btrim(v_media.source_url), '') is null
         or v_media.source_url <> btrim(v_media.source_url)
         or v_media.source_url ~ '[[:cntrl:]]'
         or position(E'\\' in v_media.source_url) > 0
         or not (
           (left(v_media.source_url, 1) = '/' and left(v_media.source_url, 2) <> '//')
           or (
             v_media.source_url ~* '^https://[^[:space:]]+$'
             and v_media.source_url !~* '^https://[^/]*@'
           )
         ) then
        raise sqlstate 'PGRST' using
          message = jsonb_build_object('code', 'unsafe_media_source', 'message', 'A referenced media URL is unsafe or changed. Reload before publishing.')::text,
          detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
      end if;

      update public.media_assets set
        status = 'published',
        updated_by = p_actor_user_id,
        published_at = coalesce(published_at, v_now),
        archived_at = null
      where id = v_media_id;
    elsif v_promotion->>'promotionKind' = 'storage_copy' then
      if v_media.source_kind <> 'storage'
         or v_media.bucket <> 'urblo-admin-media'
         or v_media.object_path is distinct from nullif(v_promotion->>'sourcePath', '')
         or v_media.updated_at is distinct from v_source_updated_at
         or v_promotion->>'destinationBucket' <> 'urblo-public-media'
         or nullif(v_promotion->>'destinationPath', '') is null then
        raise sqlstate 'PGRST' using
          message = jsonb_build_object('code', 'media_changed', 'message', 'Referenced media changed during promotion. Reload before publishing.')::text,
          detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
      end if;

      update public.media_assets set
        status = 'published',
        bucket = 'urblo-public-media',
        object_path = v_promotion->>'destinationPath',
        updated_by = p_actor_user_id,
        published_at = coalesce(published_at, v_now),
        archived_at = null
      where id = v_media_id;
    else
      raise exception 'invalid_promotion_kind' using errcode = '22023';
    end if;
  end loop;

  -- All referenced media must be public-ready after the guarded promotion updates.
  foreach v_media_id in array v_media_ids loop
    select assets.* into v_media from public.media_assets assets where assets.id = v_media_id for update;
    if not found
       or v_media.status <> 'published'
       or v_media.media_type <> 'image'
       or (v_media.media_type = 'image' and nullif(btrim(v_media.alt), '') is null)
       or (v_media.source_kind = 'storage' and (v_media.bucket <> 'urblo-public-media' or v_media.object_path is null))
       or (
         v_media.source_kind <> 'storage'
         and (
           nullif(btrim(v_media.source_url), '') is null
           or v_media.source_url <> btrim(v_media.source_url)
           or v_media.source_url ~ '[[:cntrl:]]'
           or position(E'\\' in v_media.source_url) > 0
           or not (
             (left(v_media.source_url, 1) = '/' and left(v_media.source_url, 2) <> '//')
             or (
               v_media.source_url ~* '^https://[^[:space:]]+$'
               and v_media.source_url !~* '^https://[^/]*@'
             )
           )
         )
       ) then
      raise sqlstate 'PGRST' using
        message = jsonb_build_object('code', 'media_not_public_ready', 'message', 'Every referenced image must be published, public, and have alt text.')::text,
        detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
    end if;
  end loop;

  -- The Function checks these before Storage work for a useful early error,
  -- but only this transaction-local lock closes the publish race. Hold each
  -- referenced taxonomy row through the canonical aggregate writes below.
  for v_item_id in
    select distinct nullif(materials.value->>'stoneGroupId', '')::bigint
    from jsonb_array_elements(coalesce(v_saved_draft.draft->'materials', '[]'::jsonb)) materials
    order by 1 nulls first
  loop
    select groups.id into v_parent_id
    from public.stone_groups groups
    where groups.id = v_item_id
      and groups.status = 'published'
    for share;
    if not found then
      raise sqlstate 'PGRST' using
        message = jsonb_build_object('code', 'publish_blocked', 'message', 'Every material must use a published stone and finish.')::text,
        detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
    end if;
  end loop;

  for v_item_id in
    select distinct nullif(materials.value->>'finishDefinitionId', '')::bigint
    from jsonb_array_elements(coalesce(v_saved_draft.draft->'materials', '[]'::jsonb)) materials
    order by 1 nulls first
  loop
    select finishes.id into v_parent_id
    from public.finish_definitions finishes
    where finishes.id = v_item_id
      and finishes.status = 'published'
    for share;
    if not found then
      raise sqlstate 'PGRST' using
        message = jsonb_build_object('code', 'publish_blocked', 'message', 'Every material must use a published stone and finish.')::text,
        detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
    end if;
  end loop;

  -- Stone cards may only name Live Stone Library stones; hold them like material stones.
  for v_item_id in
    select distinct stones.id
    from jsonb_array_elements(coalesce(v_saved_draft.draft->'blocks', '[]'::jsonb)) blocks
    cross join lateral unnest(private.project_block_stone_ids(blocks.value)) as stones(id)
    order by 1
  loop
    select groups.id into v_parent_id
    from public.stone_groups groups
    where groups.id = v_item_id
      and groups.status = 'published'
    for share;
    if not found then
      raise sqlstate 'PGRST' using
        message = jsonb_build_object('code', 'publish_blocked', 'message', 'Use only Live Stone Library stones in stone cards.')::text,
        detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
    end if;
  end loop;

  if v_project_exists then
    update public.projects set
      slug = btrim(v_project_json->>'slug'),
      title = btrim(v_project_json->>'title'),
      status = 'published',
      location = nullif(btrim(v_project_json->>'location'), ''),
      project_date_label = nullif(btrim(v_project_json->>'projectDateLabel'), ''),
      completed_on = nullif(v_project_json->>'completedOn', '')::date,
      summary = nullif(btrim(v_project_json->>'summary'), ''),
      lead = nullif(btrim(v_project_json->>'lead'), ''),
      client = nullif(btrim(v_project_json->>'client'), ''),
      landscape_architect = nullif(btrim(v_project_json->>'landscapeArchitect'), ''),
      contractor = nullif(btrim(v_project_json->>'contractor'), ''),
      address = nullif(btrim(v_project_json->>'address'), ''),
      quantity_label = nullif(btrim(v_project_json->>'quantityLabel'), ''),
      carbon_status = nullif(v_project_json->>'carbonStatus', ''),
      carbon_note = nullif(btrim(v_project_json->>'carbonNote'), ''),
      claim_review_status = v_claim_status,
      hero_media_id = nullif(v_project_json->>'heroMediaId', '')::bigint,
      cover_media_id = nullif(v_project_json->>'coverMediaId', '')::bigint,
      seo = coalesce(v_project_json->'seo', seo),
      sort_order = coalesce(nullif(v_project_json->>'sortOrder', '')::integer, 0),
      updated_by = p_actor_user_id,
      published_at = coalesce(published_at, v_now),
      archived_at = null
    where id = v_project_id
    returning * into v_project;
  else
    insert into public.projects (
      id, slug, title, status, location, project_date_label, completed_on,
      summary, lead, client, landscape_architect, contractor, address,
      quantity_label, carbon_status, carbon_note, claim_review_status,
      hero_media_id, cover_media_id, seo, sort_order, created_by, updated_by,
      published_at, archived_at
    ) overriding system value values (
      v_project_id,
      btrim(v_project_json->>'slug'),
      btrim(v_project_json->>'title'),
      'published',
      nullif(btrim(v_project_json->>'location'), ''),
      nullif(btrim(v_project_json->>'projectDateLabel'), ''),
      nullif(v_project_json->>'completedOn', '')::date,
      nullif(btrim(v_project_json->>'summary'), ''),
      nullif(btrim(v_project_json->>'lead'), ''),
      nullif(btrim(v_project_json->>'client'), ''),
      nullif(btrim(v_project_json->>'landscapeArchitect'), ''),
      nullif(btrim(v_project_json->>'contractor'), ''),
      nullif(btrim(v_project_json->>'address'), ''),
      nullif(btrim(v_project_json->>'quantityLabel'), ''),
      nullif(v_project_json->>'carbonStatus', ''),
      nullif(btrim(v_project_json->>'carbonNote'), ''),
      v_claim_status,
      nullif(v_project_json->>'heroMediaId', '')::bigint,
      nullif(v_project_json->>'coverMediaId', '')::bigint,
      coalesce(v_project_json->'seo', '{}'::jsonb),
      coalesce(nullif(v_project_json->>'sortOrder', '')::integer, 0),
      p_actor_user_id,
      p_actor_user_id,
      v_now,
      null
    ) returning * into v_project;
    v_project_exists := true;
  end if;

  -- Archive every old child first. Included rows are restored below; no row is deleted.
  update public.project_hotspots hotspots set status = 'archived', archived_at = v_now, updated_by = p_actor_user_id
  where exists (select 1 from public.project_material_maps maps where maps.id = hotspots.project_material_map_id and maps.project_id = v_project_id);
  update public.project_blocks set status = 'archived', archived_at = v_now, updated_by = p_actor_user_id where project_id = v_project_id;
  update public.project_material_maps set status = 'archived', archived_at = v_now, updated_by = p_actor_user_id where project_id = v_project_id;
  update public.project_materials set status = 'archived', archived_at = v_now, updated_by = p_actor_user_id where project_id = v_project_id;
  update public.project_facts set status = 'archived', archived_at = v_now, updated_by = p_actor_user_id where project_id = v_project_id;

  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'facts', '[]'::jsonb)) loop
    v_item_claim_status := v_item->>'claimStatus';
    v_item_id := nullif(v_item->>'id', '')::bigint;
    if v_item_id is not null then
      select facts.project_id into v_parent_id from public.project_facts facts where facts.id = v_item_id for update;
      if v_parent_id is distinct from v_project_id then raise exception 'fact_ownership_mismatch' using errcode = '42501'; end if;
      update public.project_facts set
        fact_label = btrim(v_item->>'factLabel'), fact_value = nullif(btrim(v_item->>'factValue'), ''),
        fact_value_json = v_item->'factValueJson', claim_status = v_item_claim_status,
        sort_order = coalesce(nullif(v_item->>'sortOrder', '')::integer, 0), status = 'published',
        updated_by = p_actor_user_id, published_at = coalesce(published_at, v_now), archived_at = null
      where id = v_item_id returning id into v_item_id;
    else
      insert into public.project_facts (
        project_id, fact_label, fact_value, fact_value_json, claim_status, sort_order,
        status, created_by, updated_by, published_at
      ) values (
        v_project_id, btrim(v_item->>'factLabel'), nullif(btrim(v_item->>'factValue'), ''),
        v_item->'factValueJson', v_item_claim_status, coalesce(nullif(v_item->>'sortOrder', '')::integer, 0),
        'published', p_actor_user_id, p_actor_user_id, v_now
      ) returning id into v_item_id;
    end if;
    v_facts_out := v_facts_out || jsonb_build_array(jsonb_set(v_item, '{id}', to_jsonb(v_item_id), true));
  end loop;

  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'materials', '[]'::jsonb)) loop
    v_item_claim_status := v_item->>'claimStatus';
    v_key := nullif(v_item->>'key', '');
    if v_key is null then raise exception 'material_key_required' using errcode = '22023'; end if;
    v_item_id := nullif(v_item->>'id', '')::bigint;
    if v_item_id is not null then
      select materials.project_id into v_parent_id from public.project_materials materials where materials.id = v_item_id for update;
      if v_parent_id is distinct from v_project_id then raise exception 'material_ownership_mismatch' using errcode = '42501'; end if;
      update public.project_materials set
        stone_group_id = nullif(v_item->>'stoneGroupId', '')::bigint,
        finish_definition_id = nullif(v_item->>'finishDefinitionId', '')::bigint,
        application = btrim(v_item->>'application'), note = nullif(btrim(v_item->>'note'), ''),
        media_asset_id = nullif(v_item->>'mediaAssetId', '')::bigint, claim_status = v_item_claim_status,
        sort_order = coalesce(nullif(v_item->>'sortOrder', '')::integer, 0), status = 'published',
        updated_by = p_actor_user_id, published_at = coalesce(published_at, v_now), archived_at = null
      where id = v_item_id returning id into v_item_id;
    else
      insert into public.project_materials (
        project_id, stone_group_id, finish_definition_id, application, note, media_asset_id,
        claim_status, sort_order, status, created_by, updated_by, published_at
      ) values (
        v_project_id, nullif(v_item->>'stoneGroupId', '')::bigint,
        nullif(v_item->>'finishDefinitionId', '')::bigint, btrim(v_item->>'application'),
        nullif(btrim(v_item->>'note'), ''), nullif(v_item->>'mediaAssetId', '')::bigint,
        v_item_claim_status, coalesce(nullif(v_item->>'sortOrder', '')::integer, 0),
        'published', p_actor_user_id, p_actor_user_id, v_now
      ) returning id into v_item_id;
    end if;
    v_material_ids := v_material_ids || jsonb_build_object(v_key, v_item_id);
    v_materials_out := v_materials_out || jsonb_build_array(jsonb_set(v_item, '{id}', to_jsonb(v_item_id), true));
  end loop;

  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'maps', '[]'::jsonb)) loop
    v_key := nullif(v_item->>'key', '');
    if v_key is null then raise exception 'map_key_required' using errcode = '22023'; end if;
    v_item_id := nullif(v_item->>'id', '')::bigint;
    if v_item_id is not null then
      select maps.project_id into v_parent_id from public.project_material_maps maps where maps.id = v_item_id for update;
      if v_parent_id is distinct from v_project_id then raise exception 'map_ownership_mismatch' using errcode = '42501'; end if;
      update public.project_material_maps set
        media_asset_id = nullif(v_item->>'mediaAssetId', '')::bigint,
        title = nullif(btrim(v_item->>'title'), ''), intro = nullif(btrim(v_item->>'intro'), ''),
        sort_order = coalesce(nullif(v_item->>'sortOrder', '')::integer, 0), status = 'published',
        updated_by = p_actor_user_id, published_at = coalesce(published_at, v_now), archived_at = null
      where id = v_item_id returning id into v_item_id;
    else
      insert into public.project_material_maps (
        project_id, media_asset_id, title, intro, sort_order, status,
        created_by, updated_by, published_at
      ) values (
        v_project_id, nullif(v_item->>'mediaAssetId', '')::bigint,
        nullif(btrim(v_item->>'title'), ''), nullif(btrim(v_item->>'intro'), ''),
        coalesce(nullif(v_item->>'sortOrder', '')::integer, 0), 'published',
        p_actor_user_id, p_actor_user_id, v_now
      ) returning id into v_item_id;
    end if;
    v_map_ids := v_map_ids || jsonb_build_object(v_key, v_item_id);
    v_maps_out := v_maps_out || jsonb_build_array(jsonb_set(v_item, '{id}', to_jsonb(v_item_id), true));
  end loop;

  -- Explicit block row IDs first, so the adoption below never claims a row twice.
  select coalesce(array_agg(nullif(blocks.value->>'id', '')::bigint), '{}'::bigint[])
  into v_used_block_ids
  from jsonb_array_elements(coalesce(v_saved_draft.draft->'blocks', '[]'::jsonb)) blocks
  where nullif(blocks.value->>'id', '') is not null;

  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'blocks', '[]'::jsonb)) loop
    v_key := v_item->>'key';
    v_block_type := v_item->>'type';
    v_content := v_item->'content';
    v_item_id := nullif(v_item->>'id', '')::bigint;

    -- A block without a row ID adopts this project's row with the same key, or the row
    -- copied from the same former media row, so republishing keeps row IDs stable.
    if v_item_id is null then
      select blocks.id into v_item_id
      from public.project_blocks blocks
      where blocks.project_id = v_project_id
        and not (blocks.id = any(v_used_block_ids))
        and (
          blocks.block_key = v_key
          or (
            nullif(v_content->>'legacyProjectMediaId', '') is not null
            and blocks.content->>'legacyProjectMediaId' = v_content->>'legacyProjectMediaId'
          )
        )
      order by (blocks.block_key = v_key) desc, blocks.id
      limit 1
      for update;
      if v_item_id is not null then
        v_used_block_ids := array_append(v_used_block_ids, v_item_id);
      end if;
    end if;

    v_map_id := null;
    v_media_id := null;
    if v_block_type = 'hotspot_image' then
      v_map_id := nullif(v_map_ids->>(v_content->>'projectMaterialMapKey'), '')::bigint;
      if v_map_id is null then raise exception 'hotspot_image_map_required' using errcode = '22023'; end if;
      select maps.media_asset_id into v_map_media_id
      from public.project_material_maps maps
      where maps.id = v_map_id;
      v_media_id := v_map_media_id;
    elsif v_block_type = 'image' then
      v_media_id := nullif(v_content->>'mediaAssetId', '')::bigint;
    end if;
    v_stone_ids := private.project_block_stone_ids(v_item);

    if v_item_id is not null then
      select blocks.project_id into v_parent_id from public.project_blocks blocks where blocks.id = v_item_id for update;
      if v_parent_id is distinct from v_project_id then raise exception 'block_ownership_mismatch' using errcode = '42501'; end if;
      update public.project_blocks set
        block_key = v_key,
        block_type = v_block_type,
        -- The map column is authoritative; the draft-only map key is not stored.
        content = v_content - 'projectMaterialMapKey',
        media_asset_id = v_media_id,
        project_material_map_id = v_map_id,
        linked_stone_group_ids = v_stone_ids,
        sort_order = coalesce(nullif(v_item->>'sortOrder', '')::integer, 0), status = 'published',
        updated_by = p_actor_user_id, published_at = coalesce(published_at, v_now), archived_at = null
      where id = v_item_id returning id into v_item_id;
    else
      insert into public.project_blocks (
        project_id, block_key, block_type, content, media_asset_id, project_material_map_id,
        linked_stone_group_ids, sort_order, status, created_by, updated_by, published_at
      ) values (
        v_project_id, v_key, v_block_type, v_content - 'projectMaterialMapKey', v_media_id, v_map_id,
        v_stone_ids, coalesce(nullif(v_item->>'sortOrder', '')::integer, 0),
        'published', p_actor_user_id, p_actor_user_id, v_now
      ) returning id into v_item_id;
    end if;
    v_blocks_out := v_blocks_out || jsonb_build_array(jsonb_set(v_item, '{id}', to_jsonb(v_item_id), true));
  end loop;

  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'hotspots', '[]'::jsonb)) loop
    if nullif(v_item->>'key', '') is null then raise exception 'hotspot_key_required' using errcode = '22023'; end if;
    v_key := nullif(v_item->>'projectMaterialMapKey', '');
    v_map_id := case when v_key is null then null else nullif(v_map_ids->>v_key, '')::bigint end;
    if v_map_id is null then raise exception 'hotspot_map_key_not_found' using errcode = '23503'; end if;
    v_key := nullif(v_item->>'projectMaterialKey', '');
    v_material_id := case when v_key is null then null else nullif(v_material_ids->>v_key, '')::bigint end;
    if v_key is not null and v_material_id is null then raise exception 'hotspot_material_key_not_found' using errcode = '23503'; end if;
    v_item_id := nullif(v_item->>'id', '')::bigint;
    if v_item_id is not null then
      select maps.project_id into v_parent_id
      from public.project_hotspots hotspots
      join public.project_material_maps maps on maps.id = hotspots.project_material_map_id
      where hotspots.id = v_item_id for update of hotspots;
      if v_parent_id is distinct from v_project_id then raise exception 'hotspot_ownership_mismatch' using errcode = '42501'; end if;
    else
      select hotspots.id into v_item_id from public.project_hotspots hotspots
      where hotspots.project_material_map_id = v_map_id
        and hotspots.hotspot_key = v_item->>'key'
      for update;
    end if;

    if v_item_id is not null then
      update public.project_hotspots set
        project_material_map_id = v_map_id, project_material_id = v_material_id,
        hotspot_key = v_item->>'key', x_percent = (v_item->>'xPercent')::numeric,
        y_percent = (v_item->>'yPercent')::numeric, label = nullif(btrim(v_item->>'label'), ''),
        application = nullif(btrim(v_item->>'application'), ''), note = nullif(btrim(v_item->>'note'), ''),
        preview_media_id = nullif(v_item->>'previewMediaId', '')::bigint,
        sort_order = coalesce(nullif(v_item->>'sortOrder', '')::integer, 0), status = 'published',
        updated_by = p_actor_user_id, published_at = coalesce(published_at, v_now), archived_at = null
      where id = v_item_id;
    else
      insert into public.project_hotspots (
        project_material_map_id, project_material_id, hotspot_key, x_percent, y_percent,
        label, application, note, preview_media_id, sort_order, status,
        created_by, updated_by, published_at
      ) values (
        v_map_id, v_material_id, v_item->>'key', (v_item->>'xPercent')::numeric,
        (v_item->>'yPercent')::numeric, nullif(btrim(v_item->>'label'), ''),
        nullif(btrim(v_item->>'application'), ''), nullif(btrim(v_item->>'note'), ''),
        nullif(v_item->>'previewMediaId', '')::bigint,
        coalesce(nullif(v_item->>'sortOrder', '')::integer, 0), 'published',
        p_actor_user_id, p_actor_user_id, v_now
      ) returning id into v_item_id;
    end if;
    v_hotspots_out := v_hotspots_out || jsonb_build_array(jsonb_set(v_item, '{id}', to_jsonb(v_item_id), true));
  end loop;

  v_result_draft := v_saved_draft.draft || jsonb_build_object(
    'schemaVersion', 2,
    'facts', v_facts_out,
    'materials', v_materials_out,
    'maps', v_maps_out,
    'blocks', v_blocks_out,
    'hotspots', v_hotspots_out
  );
  v_result_draft := jsonb_set(
    jsonb_set(v_result_draft, '{project,id}', to_jsonb(v_project_id), true),
    '{project,status}',
    to_jsonb('published'::text),
    true
  );

  update private.project_drafts set
    draft = v_result_draft,
    base_updated_at = v_project.updated_at,
    published_revision = revision,
    updated_by = p_actor_user_id,
    updated_at = v_now,
    published_by = p_actor_user_id,
    published_at = v_now,
    archived_by = null,
    archived_at = null
  where project_id = v_project_id;

  insert into public.admin_audit_events (
    actor_user_id, action, entity_type, entity_id, metadata
  ) values (
    p_actor_user_id,
    'project.aggregate.publish',
    'projects',
    v_project_id,
    jsonb_build_object(
      'revision', v_saved_draft.revision,
      'slug', v_project.slug,
      'promotions', coalesce(p_promotions, '[]'::jsonb),
      'facts', jsonb_array_length(v_facts_out),
      'materials', jsonb_array_length(v_materials_out),
      'maps', jsonb_array_length(v_maps_out),
      'blocks', jsonb_array_length(v_blocks_out),
      'hotspots', jsonb_array_length(v_hotspots_out),
      'source', 'functions/api/admin/projects.js'
    )
  );

  return jsonb_build_object(
    'projectId', v_project_id,
    'revision', v_saved_draft.revision,
    'baseUpdatedAt', v_project.updated_at,
    'status', 'published',
    'draft', v_result_draft,
    'message', 'Project published.'
  );
end;
$$;

revoke all on function public.admin_project_aggregate(text, bigint, bigint, timestamptz, jsonb, uuid, text, jsonb) from public;
revoke execute on function public.admin_project_aggregate(text, bigint, bigint, timestamptz, jsonb, uuid, text, jsonb) from anon;
revoke execute on function public.admin_project_aggregate(text, bigint, bigint, timestamptz, jsonb, uuid, text, jsonb) from authenticated;
grant execute on function public.admin_project_aggregate(text, bigint, bigint, timestamptz, jsonb, uuid, text, jsonb) to service_role;

-- 6. Stone Library reference guard covers stone cards ----------------------------------
-- stone_usage gains Project body stone cards (live and draft); the definition is otherwise
-- unchanged from 20260910064551_stone_library_workspace.sql.
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
 -- Stone cards in a Project body: live while the block, its Project and approval are live.
 select jsonb_build_object('module','projects','id',p.id,'name',p.title,'path','/admin/projects/'||p.id,
 'live',p.status='published' and p.claim_review_status='approved' and b.status='published','variantId',null,'finishId',null,
 'source',case when p.status='archived' then 'history' else 'content' end)
 from public.project_blocks b join public.projects p on p.id=b.project_id where p_id=any(b.linked_stone_group_ids)
 union all
 select jsonb_build_object('module','projects','id',d.project_id,'name',coalesce(d.draft->'project'->>'title','Project draft'),
 'path','/admin/projects/'||d.project_id,'live',false,'variantId',null,'finishId',null,'source','draft')
 from private.project_drafts d cross join lateral jsonb_array_elements(coalesce(d.draft->'blocks','[]'::jsonb)) b
 where p_id=any(private.project_block_stone_ids(b.value))
 union all
 select jsonb_build_object('module','image-qr','id',q.id,'name',q.name,'path','/admin/image-qr',
 'live',q.status='active','variantId',coalesce((select v.id from public.stone_variants v where v.stone_group_id=p_id and v.variant_key=sel.value->>'stoneVariantId' limit 1),-1),
 'finishId',coalesce((select f.id from public.finish_definitions f where f.finish_key=sel.value->>'finishKey'),-1),'source',case when q.status='active' then 'content' else 'history' end)
 from public.image_qr_resources q cross join lateral (select coalesce(q.material_selection,private.stone_qr_default(q.name)) value) sel
 where sel.value->>'stoneGroupId'=(select stone_group_key from public.stone_groups where id=p_id)
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
revoke all on function private.stone_usage(bigint) from public, anon, authenticated;

-- Created after the copy above so the backfill does not run the guard row by row.
create trigger stone_reference_mutex before insert or update or delete on public.project_blocks
  for each statement execute function private.stone_reference_mutex();
create constraint trigger stone_reference_guard after insert or update or delete on public.project_blocks
  deferrable initially deferred for each row execute function private.stone_reference_guard();

-- 7. Read-back self-check: any mismatch aborts the whole transaction --------------------
do $$
declare
  v_body_media_rows bigint;
  v_mismatch bigint;
begin
  if (select count(*) from public.project_media)::text <> current_setting('urblo.project_media_rows_before') then
    raise exception 'project_blocks_check: project_media row count changed';
  end if;

  select count(*) into v_body_media_rows
  from public.project_media
  where media_role in ('normal_image', 'hotspot_image', 'youtube_video');
  if (select count(*) from public.project_blocks) <> v_body_media_rows then
    raise exception 'project_blocks_check: copied block count % differs from % body media rows',
      (select count(*) from public.project_blocks), v_body_media_rows;
  end if;

  -- Per project and status, including every published project's published body.
  select count(*) into v_mismatch
  from (
    select project_id, status, count(*) as rows
    from public.project_media
    where media_role in ('normal_image', 'hotspot_image', 'youtube_video')
    group by project_id, status
  ) source
  full join (
    select project_id, status, count(*) as rows
    from public.project_blocks
    group by project_id, status
  ) copied using (project_id, status)
  where source.rows is distinct from copied.rows;
  if v_mismatch > 0 then
    raise exception 'project_blocks_check: % project/status groups differ', v_mismatch;
  end if;

  if exists (
    select 1
    from public.project_media media
    left join public.project_blocks blocks
      on blocks.content->>'legacyProjectMediaId' = media.id::text
     and blocks.project_id = media.project_id
     and blocks.sort_order = media.sort_order
     and blocks.status = media.status
     and blocks.block_type = case media.media_role
       when 'normal_image' then 'image' when 'hotspot_image' then 'hotspot_image' else 'video' end
     and blocks.media_asset_id is not distinct from case when media.media_role = 'youtube_video' then null else media.media_asset_id end
     and blocks.project_material_map_id is not distinct from case when media.media_role = 'hotspot_image' then media.project_material_map_id end
    where media.media_role in ('normal_image', 'hotspot_image', 'youtube_video')
      and blocks.id is null
  ) then
    raise exception 'project_blocks_check: a body media row has no identical block';
  end if;

  if exists (
    select 1 from private.project_drafts
    where draft ? 'mediaBlocks'
       or jsonb_typeof(draft->'blocks') is distinct from 'array'
       or draft->'schemaVersion' is distinct from '2'::jsonb
  ) then
    raise exception 'project_blocks_check: a private draft keeps the pre-block shape';
  end if;
end;
$$;

notify pgrst, 'reload schema';
