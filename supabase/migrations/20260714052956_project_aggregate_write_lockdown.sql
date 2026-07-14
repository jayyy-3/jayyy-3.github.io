-- Contract phase for the Project aggregate rollout.
-- Apply only after preview verification AND after the aggregate UI/endpoint
-- have been promoted to production. Freeze Project editing during this brief
-- contract step; a preview deployment alone is not sufficient authorization.
-- This removes legacy browser mutation paths and hardens every public child
-- read behind an approved, published parent.
-- After this migration, do not Cloudflare-only roll back to the legacy
-- direct-write UI. Retain the aggregate runtime or use a separately reviewed
-- and approved forward-compatibility migration.

drop policy if exists projects_admin_insert on public.projects;
drop policy if exists projects_admin_update on public.projects;
drop policy if exists projects_admin_delete on public.projects;
drop policy if exists project_facts_admin_insert on public.project_facts;
drop policy if exists project_facts_admin_update on public.project_facts;
drop policy if exists project_facts_admin_delete on public.project_facts;
drop policy if exists project_materials_admin_insert on public.project_materials;
drop policy if exists project_materials_admin_update on public.project_materials;
drop policy if exists project_materials_admin_delete on public.project_materials;
drop policy if exists project_material_maps_admin_insert on public.project_material_maps;
drop policy if exists project_material_maps_admin_update on public.project_material_maps;
drop policy if exists project_material_maps_admin_delete on public.project_material_maps;
drop policy if exists project_media_admin_insert on public.project_media;
drop policy if exists project_media_admin_update on public.project_media;
drop policy if exists project_media_admin_delete on public.project_media;
drop policy if exists project_hotspots_admin_insert on public.project_hotspots;
drop policy if exists project_hotspots_admin_update on public.project_hotspots;
drop policy if exists project_hotspots_admin_delete on public.project_hotspots;

revoke insert, update, delete, truncate, references, trigger on table
  public.projects,
  public.project_facts,
  public.project_materials,
  public.project_material_maps,
  public.project_media,
  public.project_hotspots
from authenticated;

revoke all privileges on sequence
  public.projects_id_seq,
  public.project_facts_id_seq,
  public.project_materials_id_seq,
  public.project_material_maps_id_seq,
  public.project_media_id_seq,
  public.project_hotspots_id_seq
from authenticated;

drop policy if exists projects_public_select on public.projects;
create policy projects_public_select on public.projects
  for select to anon, authenticated
  using (status = 'published' and claim_review_status = 'approved');

drop policy if exists project_facts_public_select on public.project_facts;
create policy project_facts_public_select on public.project_facts
  for select to anon, authenticated
  using (
    status = 'published'
    and claim_status = 'approved'
    and exists (
      select 1 from public.projects projects
      where projects.id = project_facts.project_id
        and projects.status = 'published'
        and projects.claim_review_status = 'approved'
    )
  );

drop policy if exists project_materials_public_select on public.project_materials;
create policy project_materials_public_select on public.project_materials
  for select to anon, authenticated
  using (
    status = 'published'
    and claim_status = 'approved'
    and exists (
      select 1 from public.projects projects
      where projects.id = project_materials.project_id
        and projects.status = 'published'
        and projects.claim_review_status = 'approved'
    )
  );

drop policy if exists project_media_public_select on public.project_media;
create policy project_media_public_select on public.project_media
  for select to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1 from public.projects projects
      where projects.id = project_media.project_id
        and projects.status = 'published'
        and projects.claim_review_status = 'approved'
    )
  );

drop policy if exists project_material_maps_public_select on public.project_material_maps;
create policy project_material_maps_public_select on public.project_material_maps
  for select to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1 from public.projects projects
      where projects.id = project_material_maps.project_id
        and projects.status = 'published'
        and projects.claim_review_status = 'approved'
    )
  );

drop policy if exists project_hotspots_public_select on public.project_hotspots;
create policy project_hotspots_public_select on public.project_hotspots
  for select to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.project_material_maps maps
      join public.projects projects on projects.id = maps.project_id
      join public.project_materials materials
        on materials.id = project_hotspots.project_material_id
        and materials.project_id = maps.project_id
      where maps.id = project_hotspots.project_material_map_id
        and maps.status = 'published'
        and projects.status = 'published'
        and projects.claim_review_status = 'approved'
        and materials.status = 'published'
        and materials.claim_status = 'approved'
    )
  );

notify pgrst, 'reload schema';
