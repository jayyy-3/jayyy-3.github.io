-- Keep anonymous access explicitly read-only for public content tables.

revoke insert, update, delete, truncate, references, trigger on all tables in schema public from anon;

grant select on
  public.media_assets,
  public.site_settings,
  public.finish_definitions,
  public.stone_groups,
  public.stone_variants,
  public.stone_finish_capabilities,
  public.stone_finish_images,
  public.products,
  public.product_models,
  public.product_material_defaults,
  public.product_specs,
  public.projects,
  public.project_facts,
  public.project_media,
  public.project_materials,
  public.project_material_maps,
  public.project_hotspots,
  public.articles,
  public.article_blocks
to anon;
