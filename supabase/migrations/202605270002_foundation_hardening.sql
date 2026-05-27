-- Tighten foundation privileges and complete foreign-key indexes.

revoke all on table public.admin_profiles from anon;
revoke all on table public.admin_audit_events from anon;
revoke all on table public.enquiries from anon;
revoke all on table public.sample_requests from anon;
revoke all on table public.sample_request_items from anon;
revoke all on all sequences in schema public from anon;

create index if not exists media_assets_created_by_idx on public.media_assets (created_by);
create index if not exists media_assets_updated_by_idx on public.media_assets (updated_by);

create index if not exists site_settings_logo_media_idx on public.site_settings (logo_media_id);
create index if not exists site_settings_favicon_media_idx on public.site_settings (favicon_media_id);
create index if not exists site_settings_default_share_media_idx on public.site_settings (default_share_media_id);
create index if not exists site_settings_created_by_idx on public.site_settings (created_by);
create index if not exists site_settings_updated_by_idx on public.site_settings (updated_by);

create index if not exists finish_definitions_created_by_idx on public.finish_definitions (created_by);
create index if not exists finish_definitions_updated_by_idx on public.finish_definitions (updated_by);

create index if not exists stone_groups_created_by_idx on public.stone_groups (created_by);
create index if not exists stone_groups_updated_by_idx on public.stone_groups (updated_by);
create index if not exists stone_variants_created_by_idx on public.stone_variants (created_by);
create index if not exists stone_variants_updated_by_idx on public.stone_variants (updated_by);
create index if not exists stone_finish_capabilities_created_by_idx on public.stone_finish_capabilities (created_by);
create index if not exists stone_finish_capabilities_updated_by_idx on public.stone_finish_capabilities (updated_by);
create index if not exists stone_finish_images_created_by_idx on public.stone_finish_images (created_by);
create index if not exists stone_finish_images_updated_by_idx on public.stone_finish_images (updated_by);

create index if not exists products_hero_media_idx on public.products (hero_media_id);
create index if not exists products_created_by_idx on public.products (created_by);
create index if not exists products_updated_by_idx on public.products (updated_by);
create index if not exists product_models_created_by_idx on public.product_models (created_by);
create index if not exists product_models_updated_by_idx on public.product_models (updated_by);
create index if not exists product_material_defaults_created_by_idx on public.product_material_defaults (created_by);
create index if not exists product_material_defaults_updated_by_idx on public.product_material_defaults (updated_by);
create index if not exists product_specs_created_by_idx on public.product_specs (created_by);
create index if not exists product_specs_updated_by_idx on public.product_specs (updated_by);

create index if not exists projects_created_by_idx on public.projects (created_by);
create index if not exists projects_updated_by_idx on public.projects (updated_by);
create index if not exists project_facts_created_by_idx on public.project_facts (created_by);
create index if not exists project_facts_updated_by_idx on public.project_facts (updated_by);
create index if not exists project_media_created_by_idx on public.project_media (created_by);
create index if not exists project_media_updated_by_idx on public.project_media (updated_by);
create index if not exists project_materials_created_by_idx on public.project_materials (created_by);
create index if not exists project_materials_updated_by_idx on public.project_materials (updated_by);
create index if not exists project_material_maps_created_by_idx on public.project_material_maps (created_by);
create index if not exists project_material_maps_updated_by_idx on public.project_material_maps (updated_by);
create index if not exists project_hotspots_created_by_idx on public.project_hotspots (created_by);
create index if not exists project_hotspots_updated_by_idx on public.project_hotspots (updated_by);

create index if not exists articles_created_by_idx on public.articles (created_by);
create index if not exists articles_updated_by_idx on public.articles (updated_by);
create index if not exists article_blocks_created_by_idx on public.article_blocks (created_by);
create index if not exists article_blocks_updated_by_idx on public.article_blocks (updated_by);
