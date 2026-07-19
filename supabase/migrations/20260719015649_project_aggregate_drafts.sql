-- Expand phase for the Project aggregate rollout.
-- This migration is production-writing: it creates the private draft/RPC
-- contract and backfills child lifecycle columns. Apply only after Jay's
-- item-specific approval and read it back before authenticated preview writes.
-- It deliberately does not revoke legacy browser writes or harden final public
-- policies; those contract changes belong to 20260719015650 after the new
-- aggregate UI/endpoint is already running in production.
-- Draft saves stay private. Publishing applies the relational aggregate and audit row
-- in one Postgres transaction. Storage copies are orchestrated separately by the
-- authenticated Pages Function and are deliberately not represented as SQL-atomic.

create schema if not exists private;

create table private.project_drafts (
  project_id bigint primary key,
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  revision bigint not null default 1 check (revision > 0),
  base_updated_at timestamptz,
  published_revision bigint check (published_revision is null or published_revision > 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid not null references auth.users(id) on delete restrict,
  published_by uuid references auth.users(id) on delete set null,
  archived_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  archived_at timestamptz
);

revoke all on table private.project_drafts from public;
revoke all on table private.project_drafts from anon;
revoke all on table private.project_drafts from authenticated;

alter table public.project_facts
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  add column if not exists published_at timestamptz,
  add column if not exists archived_at timestamptz;

alter table public.project_materials
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  add column if not exists published_at timestamptz,
  add column if not exists archived_at timestamptz;

update public.project_facts facts
set
  status = projects.status,
  published_at = case when projects.status = 'published' then projects.published_at else null end,
  archived_at = case when projects.status = 'archived' then projects.archived_at else null end
from public.projects projects
where projects.id = facts.project_id;

update public.project_materials materials
set
  status = projects.status,
  published_at = case when projects.status = 'published' then projects.published_at else null end,
  archived_at = case when projects.status = 'archived' then projects.archived_at else null end
from public.projects projects
where projects.id = materials.project_id;

create index if not exists project_facts_project_status_claim_sort_idx
  on public.project_facts (project_id, status, claim_status, sort_order);

create index if not exists project_materials_project_status_claim_sort_idx
  on public.project_materials (project_id, status, claim_status, sort_order);

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
  v_media_out jsonb := '[]'::jsonb;
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

  if octet_length(p_draft::text) > 1048576 then
    raise exception 'draft_too_large' using errcode = '22023';
  end if;

  v_project_json := p_draft->'project';
  if jsonb_typeof(v_project_json) <> 'object'
     or jsonb_typeof(coalesce(p_draft->'facts', '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_draft->'materials', '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_draft->'maps', '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_draft->'mediaBlocks', '[]'::jsonb)) <> 'array'
     or jsonb_typeof(coalesce(p_draft->'hotspots', '[]'::jsonb)) <> 'array' then
    raise exception 'invalid_draft_shape' using errcode = '22023';
  end if;

  if jsonb_array_length(coalesce(p_draft->'facts', '[]'::jsonb)) > 100
     or jsonb_array_length(coalesce(p_draft->'materials', '[]'::jsonb)) > 100
     or jsonb_array_length(coalesce(p_draft->'maps', '[]'::jsonb)) > 30
     or jsonb_array_length(coalesce(p_draft->'mediaBlocks', '[]'::jsonb)) > 100
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
        'mediaBlocks', jsonb_array_length(coalesce(v_result_draft->'mediaBlocks', '[]'::jsonb)),
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
      update public.project_media set
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
  from jsonb_array_elements(coalesce(v_saved_draft.draft->'mediaBlocks', '[]'::jsonb)) blocks
  where blocks->>'mediaRole' = 'youtube_video';
  if v_youtube_count > 1 then
    raise sqlstate 'PGRST' using
      message = jsonb_build_object('code', 'publish_blocked', 'message', 'Keep one YouTube video on each project page.')::text,
      detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
  end if;

  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'mediaBlocks', '[]'::jsonb)) loop
    if v_item->>'mediaRole' = 'youtube_video' then
      if nullif(v_item->>'mediaAssetId', '') is not null
         or nullif(v_item->>'projectMaterialMapKey', '') is not null
         or not (
           btrim(coalesce(v_item->>'youtubeUrl', '')) ~ '^[A-Za-z0-9_-]{6,}$'
           or btrim(coalesce(v_item->>'youtubeUrl', '')) ~* '^https://youtu\.be/[A-Za-z0-9_-]{6,}([/?#&]|$)'
           or btrim(coalesce(v_item->>'youtubeUrl', '')) ~* '^https://(www\.|m\.)?youtube\.com/(watch\?[^#]*v=|embed/|shorts/)[A-Za-z0-9_-]{6,}'
           or btrim(coalesce(v_item->>'youtubeUrl', '')) ~* '^https://(www\.|m\.)?youtube\.com/([^?#]+/)?[A-Za-z0-9_-]{6,}([/?#&]|$)'
           or btrim(coalesce(v_item->>'youtubeUrl', '')) ~* '^https://(www\.)?youtube-nocookie\.com/(embed/|shorts/)[A-Za-z0-9_-]{6,}'
           or btrim(coalesce(v_item->>'youtubeUrl', '')) ~* '^https://(www\.)?youtube-nocookie\.com/([^?#]+/)?[A-Za-z0-9_-]{6,}([/?#&]|$)'
         ) then
        raise sqlstate 'PGRST' using
          message = jsonb_build_object('code', 'publish_blocked', 'message', 'Complete the YouTube video block before publishing.')::text,
          detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
      end if;
    elsif v_item->>'mediaRole' = 'hotspot_image' then
      if nullif(v_item->>'mediaAssetId', '') is not null
         or nullif(v_item->>'projectMaterialMapKey', '') is null then
        raise sqlstate 'PGRST' using
          message = jsonb_build_object('code', 'publish_blocked', 'message', 'Connect every map image block to its material map.')::text,
          detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
      end if;
    elsif v_item->>'mediaRole' in ('cover', 'hero', 'gallery', 'material_map', 'supporting', 'normal_image') then
      if nullif(v_item->>'mediaAssetId', '') is null
         or nullif(v_item->>'projectMaterialMapKey', '') is not null then
        raise sqlstate 'PGRST' using
          message = jsonb_build_object('code', 'publish_blocked', 'message', 'Choose an image for every project media block.')::text,
          detail = jsonb_build_object('status', 409, 'status_text', 'Conflict', 'headers', jsonb_build_object())::text;
      end if;
    else
      raise exception 'invalid_media_role' using errcode = '22023';
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
  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'mediaBlocks', '[]'::jsonb)) loop
    if v_item->>'mediaRole' not in ('youtube_video', 'hotspot_image') then
      v_media_id := nullif(v_item->>'mediaAssetId', '')::bigint;
      if v_media_id is not null and not (v_media_id = any(v_media_ids)) then v_media_ids := array_append(v_media_ids, v_media_id); end if;
    end if;
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
  update public.project_media set status = 'archived', archived_at = v_now, updated_by = p_actor_user_id where project_id = v_project_id;
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

  for v_item in select value from jsonb_array_elements(coalesce(v_saved_draft.draft->'mediaBlocks', '[]'::jsonb)) loop
    v_item_id := nullif(v_item->>'id', '')::bigint;
    v_key := nullif(v_item->>'projectMaterialMapKey', '');
    v_map_id := case when v_key is null then null else nullif(v_map_ids->>v_key, '')::bigint end;
    if v_key is not null and v_map_id is null then raise exception 'media_map_key_not_found' using errcode = '23503'; end if;

    if v_item->>'mediaRole' = 'hotspot_image' then
      if v_map_id is null then raise exception 'hotspot_image_map_required' using errcode = '22023'; end if;
      select maps.media_asset_id into v_map_media_id
      from public.project_material_maps maps
      where maps.id = v_map_id;
      v_media_id := v_map_media_id;
    elsif v_item->>'mediaRole' = 'youtube_video' then
      if v_map_id is not null then raise exception 'youtube_map_not_allowed' using errcode = '22023'; end if;
      v_media_id := null;
    else
      if v_map_id is not null then raise exception 'media_map_not_allowed' using errcode = '22023'; end if;
      v_media_id := nullif(v_item->>'mediaAssetId', '')::bigint;
    end if;

    if v_item_id is not null then
      select media.project_id into v_parent_id from public.project_media media where media.id = v_item_id for update;
      if v_parent_id is distinct from v_project_id then raise exception 'media_ownership_mismatch' using errcode = '42501'; end if;
      update public.project_media set
        media_asset_id = v_media_id,
        project_material_map_id = v_map_id, media_role = v_item->>'mediaRole',
        block_title = nullif(btrim(v_item->>'blockTitle'), ''), youtube_url = nullif(btrim(v_item->>'youtubeUrl'), ''),
        label = nullif(btrim(v_item->>'label'), ''), caption = nullif(btrim(v_item->>'caption'), ''),
        sort_order = coalesce(nullif(v_item->>'sortOrder', '')::integer, 0), status = 'published',
        updated_by = p_actor_user_id, published_at = coalesce(published_at, v_now), archived_at = null
      where id = v_item_id returning id into v_item_id;
    else
      insert into public.project_media (
        project_id, media_asset_id, project_material_map_id, media_role, block_title,
        youtube_url, label, caption, sort_order, status, created_by, updated_by, published_at
      ) values (
        v_project_id, v_media_id, v_map_id,
        v_item->>'mediaRole', nullif(btrim(v_item->>'blockTitle'), ''),
        nullif(btrim(v_item->>'youtubeUrl'), ''), nullif(btrim(v_item->>'label'), ''),
        nullif(btrim(v_item->>'caption'), ''), coalesce(nullif(v_item->>'sortOrder', '')::integer, 0),
        'published', p_actor_user_id, p_actor_user_id, v_now
      ) returning id into v_item_id;
    end if;
    v_item := jsonb_set(
      jsonb_set(v_item, '{id}', to_jsonb(v_item_id), true),
      '{mediaAssetId}',
      case
        when v_item->>'mediaRole' = 'hotspot_image' then 'null'::jsonb
        else coalesce(to_jsonb(v_media_id), 'null'::jsonb)
      end,
      true
    );
    v_media_out := v_media_out || jsonb_build_array(v_item);
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
    'facts', v_facts_out,
    'materials', v_materials_out,
    'maps', v_maps_out,
    'mediaBlocks', v_media_out,
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
      'mediaBlocks', jsonb_array_length(v_media_out),
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

-- Public pages use this narrow tombstone list only to suppress a matching
-- bundled fallback after an editor hides a CMS project. No private draft or
-- other archived content is exposed.
create or replace function public.get_archived_project_slugs()
returns table (slug text)
language sql
stable
security definer
set search_path = ''
as $function$
  select archived.slug
  from (
    select projects.slug::text as slug
    from public.projects as projects
    where projects.status = 'archived'
      and nullif(btrim(projects.slug), '') is not null

    union

    select btrim(drafts.draft #>> '{project,slug}')::text as slug
    from private.project_drafts as drafts
    where drafts.archived_at is not null
      and nullif(btrim(drafts.draft #>> '{project,slug}'), '') is not null
      and not exists (
        select 1
        from public.projects as published_projects
        where published_projects.id = drafts.project_id
          and published_projects.status = 'published'
          and lower(btrim(published_projects.slug)) = lower(btrim(drafts.draft #>> '{project,slug}'))
      )
  ) as archived
  order by archived.slug;
$function$;

revoke all on function public.get_archived_project_slugs() from public, anon, authenticated;
grant execute on function public.get_archived_project_slugs() to anon, authenticated, service_role;

notify pgrst, 'reload schema';
