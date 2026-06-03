-- Extend project media from gallery records into ordered project detail media blocks.
-- Applied to the live Supabase project during the approved 2026-06-04 admin QA run.

alter table public.project_media
  alter column media_asset_id drop not null;

alter table public.project_media
  add column if not exists project_material_map_id bigint references public.project_material_maps(id) on delete set null,
  add column if not exists block_title text,
  add column if not exists youtube_url text;

alter table public.project_media
  drop constraint if exists project_media_media_role_check;

alter table public.project_media
  add constraint project_media_media_role_check
  check (
    media_role in (
      'cover',
      'hero',
      'gallery',
      'material_map',
      'supporting',
      'normal_image',
      'hotspot_image',
      'youtube_video'
    )
  );

alter table public.project_media
  drop constraint if exists project_media_block_contract_check;

alter table public.project_media
  add constraint project_media_block_contract_check
  check (
    (
      media_role = 'youtube_video'
      and media_asset_id is null
      and project_material_map_id is null
      and youtube_url is not null
      and btrim(youtube_url) <> ''
    )
    or (
      media_role = 'hotspot_image'
      and media_asset_id is not null
      and project_material_map_id is not null
      and (youtube_url is null or btrim(youtube_url) = '')
    )
    or (
      media_role <> 'youtube_video'
      and media_role <> 'hotspot_image'
      and media_asset_id is not null
      and project_material_map_id is null
      and (youtube_url is null or btrim(youtube_url) = '')
    )
  );

create index if not exists project_media_project_material_map_idx
  on public.project_media (project_material_map_id);

create index if not exists project_media_project_role_sort_idx
  on public.project_media (project_id, media_role, sort_order);

create unique index if not exists project_media_one_active_youtube_idx
  on public.project_media (project_id)
  where media_role = 'youtube_video' and status <> 'archived';
