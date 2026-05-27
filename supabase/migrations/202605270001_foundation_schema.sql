-- Urblo Supabase foundation schema.
-- Project: Urblo / npkidywzwddbnfrnxlmo
-- Scope: launch foundation tables, constraints, indexes, helper functions, grants, and RLS.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id bigint generated always as identity primary key,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  bucket text,
  object_path text,
  source_url text,
  source_kind text not null default 'storage' check (source_kind in ('storage', 'external_legacy', 'r2', 'stream')),
  media_type text not null check (media_type in ('image', 'video', 'document', 'other')),
  mime_type text,
  width_px integer check (width_px is null or width_px > 0),
  height_px integer check (height_px is null or height_px > 0),
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  alt text,
  caption text,
  credit text,
  usage_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz
);

create table public.site_settings (
  id bigint generated always as identity primary key,
  settings_key text not null unique,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  logo_media_id bigint references public.media_assets(id) on delete set null,
  favicon_media_id bigint references public.media_assets(id) on delete set null,
  default_share_media_id bigint references public.media_assets(id) on delete set null,
  company_name text not null default 'Urblo',
  primary_email text,
  primary_phone text,
  social_links jsonb not null default '{}'::jsonb,
  footer_columns jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz
);

create table public.finish_definitions (
  id bigint generated always as identity primary key,
  finish_key text not null unique,
  display_name text not null,
  description text,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz
);

create table public.stone_groups (
  id bigint generated always as identity primary key,
  stone_group_key text not null unique,
  display_name text not null,
  source_name text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived', 'tbc')),
  stone_type_source text,
  stone_type_display text,
  origin_region text,
  origin_country text,
  price_source text,
  price_tier integer check (price_tier in (1, 2, 3)),
  raw_block_length_mm integer check (raw_block_length_mm is null or raw_block_length_mm > 0),
  raw_block_width_mm integer check (raw_block_width_mm is null or raw_block_width_mm > 0),
  raw_block_height_mm integer check (raw_block_height_mm is null or raw_block_height_mm > 0),
  summary text,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz
);

create table public.stone_variants (
  id bigint generated always as identity primary key,
  stone_group_id bigint not null references public.stone_groups(id) on delete cascade,
  variant_key text not null,
  display_name text,
  source_variant text,
  variant_type text not null default 'none',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived', 'tbc')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz,
  unique (stone_group_id, variant_key)
);

create table public.stone_finish_capabilities (
  id bigint generated always as identity primary key,
  stone_variant_id bigint not null references public.stone_variants(id) on delete cascade,
  finish_definition_id bigint not null references public.finish_definitions(id) on delete restrict,
  capability text not null check (capability in ('yes', 'no', 'tbc')),
  sources text[] not null default '{}'::text[],
  behavior_note text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz,
  unique (stone_variant_id, finish_definition_id)
);

create table public.stone_finish_images (
  id bigint generated always as identity primary key,
  stone_group_id bigint references public.stone_groups(id) on delete cascade,
  stone_variant_id bigint references public.stone_variants(id) on delete cascade,
  finish_definition_id bigint references public.finish_definitions(id) on delete set null,
  media_asset_id bigint not null references public.media_assets(id) on delete restrict,
  image_role text not null default 'primary' check (image_role in ('primary', 'secondary', 'detail', 'swatch')),
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz
);

create table public.products (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  short_description text,
  hero_media_id bigint references public.media_assets(id) on delete set null,
  seo jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz
);

create table public.product_models (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  model_key text not null,
  label text not null,
  image_media_id bigint references public.media_assets(id) on delete set null,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz,
  unique (product_id, model_key)
);

create table public.product_material_defaults (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  material_category text not null check (material_category in ('body', 'frame', 'battens')),
  stone_group_id bigint references public.stone_groups(id) on delete set null,
  material_slug text,
  display_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  unique (product_id, material_category)
);

create table public.product_specs (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  spec_label text not null,
  spec_value text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create table public.projects (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  location text,
  project_date_label text,
  completed_on date,
  summary text,
  lead text,
  client text,
  landscape_architect text,
  contractor text,
  address text,
  quantity_label text,
  carbon_status text check (carbon_status in ('yes', 'no', 'not_available', 'tbc')),
  carbon_note text,
  claim_review_status text not null default 'needs_review' check (claim_review_status in ('needs_review', 'approved', 'deferred')),
  hero_media_id bigint references public.media_assets(id) on delete set null,
  cover_media_id bigint references public.media_assets(id) on delete set null,
  seo jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz
);

create table public.project_facts (
  id bigint generated always as identity primary key,
  project_id bigint not null references public.projects(id) on delete cascade,
  fact_label text not null,
  fact_value text,
  fact_value_json jsonb,
  claim_status text not null default 'needs_review' check (claim_status in ('needs_review', 'approved', 'deferred')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create table public.project_media (
  id bigint generated always as identity primary key,
  project_id bigint not null references public.projects(id) on delete cascade,
  media_asset_id bigint not null references public.media_assets(id) on delete restrict,
  media_role text not null check (media_role in ('cover', 'hero', 'gallery', 'material_map', 'supporting')),
  label text,
  caption text,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz
);

create table public.project_materials (
  id bigint generated always as identity primary key,
  project_id bigint not null references public.projects(id) on delete cascade,
  stone_group_id bigint references public.stone_groups(id) on delete set null,
  finish_definition_id bigint references public.finish_definitions(id) on delete set null,
  application text not null,
  note text,
  media_asset_id bigint references public.media_assets(id) on delete set null,
  claim_status text not null default 'needs_review' check (claim_status in ('needs_review', 'approved', 'deferred')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create table public.project_material_maps (
  id bigint generated always as identity primary key,
  project_id bigint not null references public.projects(id) on delete cascade,
  media_asset_id bigint not null references public.media_assets(id) on delete restrict,
  title text,
  intro text,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz
);

create table public.project_hotspots (
  id bigint generated always as identity primary key,
  project_material_map_id bigint not null references public.project_material_maps(id) on delete cascade,
  project_material_id bigint references public.project_materials(id) on delete set null,
  hotspot_key text not null,
  x_percent numeric(5,2) not null check (x_percent >= 0 and x_percent <= 100),
  y_percent numeric(5,2) not null check (y_percent >= 0 and y_percent <= 100),
  label text,
  application text,
  note text,
  preview_media_id bigint references public.media_assets(id) on delete set null,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz,
  unique (project_material_map_id, hotspot_key)
);

create table public.articles (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_on date,
  author text,
  excerpt text,
  cover_media_id bigint references public.media_assets(id) on delete set null,
  tags text[] not null default '{}'::text[],
  seo jsonb not null default '{}'::jsonb,
  legacy_source_path text,
  legacy_source_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz
);

create table public.article_blocks (
  id bigint generated always as identity primary key,
  article_id bigint not null references public.articles(id) on delete cascade,
  block_type text not null check (block_type in ('rich_text', 'image', 'gallery', 'quote', 'faq', 'cta', 'project_spotlight', 'stone_reference', 'comparison_table', 'proof_metric', 'video_embed', 'callout')),
  content jsonb not null default '{}'::jsonb,
  media_asset_id bigint references public.media_assets(id) on delete set null,
  linked_project_id bigint references public.projects(id) on delete set null,
  linked_stone_group_id bigint references public.stone_groups(id) on delete set null,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  archived_at timestamptz
);

create table public.enquiries (
  id bigint generated always as identity primary key,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'closed', 'spam')),
  name text not null,
  email text not null,
  phone text,
  company text,
  project_type text,
  message text,
  source_route text,
  turnstile_success boolean,
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sent', 'failed', 'not_required')),
  assigned_to uuid references auth.users(id) on delete set null,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sample_requests (
  id bigint generated always as identity primary key,
  status text not null default 'new' check (status in ('new', 'confirmed', 'packed', 'sent', 'closed', 'spam')),
  name text not null,
  email text not null,
  phone text,
  company text,
  shipping_address text,
  project_name text,
  message text,
  source_route text,
  turnstile_success boolean,
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sent', 'failed', 'not_required')),
  assigned_to uuid references auth.users(id) on delete set null,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sample_request_items (
  id bigint generated always as identity primary key,
  sample_request_id bigint not null references public.sample_requests(id) on delete cascade,
  stone_group_id bigint references public.stone_groups(id) on delete set null,
  finish_definition_id bigint references public.finish_definitions(id) on delete set null,
  quantity integer not null default 1 check (quantity > 0),
  notes text,
  created_at timestamptz not null default now()
);

create table public.admin_audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select ap.role
  from public.admin_profiles ap
  where ap.user_id = (select auth.uid())
    and ap.is_active = true
  limit 1;
$$;

create or replace function public.has_admin_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() = any(allowed_roles), false);
$$;

revoke all on function public.current_admin_role() from public;
revoke all on function public.has_admin_role(text[]) from public;
grant execute on function public.current_admin_role() to authenticated;
grant execute on function public.has_admin_role(text[]) to authenticated;

create trigger admin_profiles_set_updated_at before update on public.admin_profiles for each row execute function public.set_updated_at();
create trigger media_assets_set_updated_at before update on public.media_assets for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
create trigger finish_definitions_set_updated_at before update on public.finish_definitions for each row execute function public.set_updated_at();
create trigger stone_groups_set_updated_at before update on public.stone_groups for each row execute function public.set_updated_at();
create trigger stone_variants_set_updated_at before update on public.stone_variants for each row execute function public.set_updated_at();
create trigger stone_finish_capabilities_set_updated_at before update on public.stone_finish_capabilities for each row execute function public.set_updated_at();
create trigger stone_finish_images_set_updated_at before update on public.stone_finish_images for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger product_models_set_updated_at before update on public.product_models for each row execute function public.set_updated_at();
create trigger product_material_defaults_set_updated_at before update on public.product_material_defaults for each row execute function public.set_updated_at();
create trigger product_specs_set_updated_at before update on public.product_specs for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger project_facts_set_updated_at before update on public.project_facts for each row execute function public.set_updated_at();
create trigger project_media_set_updated_at before update on public.project_media for each row execute function public.set_updated_at();
create trigger project_materials_set_updated_at before update on public.project_materials for each row execute function public.set_updated_at();
create trigger project_material_maps_set_updated_at before update on public.project_material_maps for each row execute function public.set_updated_at();
create trigger project_hotspots_set_updated_at before update on public.project_hotspots for each row execute function public.set_updated_at();
create trigger articles_set_updated_at before update on public.articles for each row execute function public.set_updated_at();
create trigger article_blocks_set_updated_at before update on public.article_blocks for each row execute function public.set_updated_at();
create trigger enquiries_set_updated_at before update on public.enquiries for each row execute function public.set_updated_at();
create trigger sample_requests_set_updated_at before update on public.sample_requests for each row execute function public.set_updated_at();

create index admin_profiles_role_active_idx on public.admin_profiles (role, is_active);
create index media_assets_status_sort_idx on public.media_assets (status, updated_at desc);
create index site_settings_status_key_idx on public.site_settings (status, settings_key);
create index finish_definitions_status_sort_idx on public.finish_definitions (status, sort_order);
create index stone_groups_status_sort_idx on public.stone_groups (status, sort_order, display_name);
create index stone_variants_group_status_sort_idx on public.stone_variants (stone_group_id, status, sort_order);
create index stone_finish_capabilities_variant_idx on public.stone_finish_capabilities (stone_variant_id);
create index stone_finish_capabilities_finish_idx on public.stone_finish_capabilities (finish_definition_id);
create index stone_finish_images_group_status_sort_idx on public.stone_finish_images (stone_group_id, status, sort_order);
create index stone_finish_images_variant_idx on public.stone_finish_images (stone_variant_id);
create index stone_finish_images_finish_idx on public.stone_finish_images (finish_definition_id);
create index stone_finish_images_media_idx on public.stone_finish_images (media_asset_id);
create index products_status_sort_idx on public.products (status, sort_order, name);
create index product_models_product_status_sort_idx on public.product_models (product_id, status, sort_order);
create index product_models_image_media_idx on public.product_models (image_media_id);
create index product_material_defaults_product_idx on public.product_material_defaults (product_id);
create index product_material_defaults_stone_group_idx on public.product_material_defaults (stone_group_id);
create index product_specs_product_sort_idx on public.product_specs (product_id, sort_order);
create index projects_status_sort_idx on public.projects (status, sort_order, title);
create index projects_hero_media_idx on public.projects (hero_media_id);
create index projects_cover_media_idx on public.projects (cover_media_id);
create index project_facts_project_claim_sort_idx on public.project_facts (project_id, claim_status, sort_order);
create index project_media_project_status_sort_idx on public.project_media (project_id, status, sort_order);
create index project_media_media_idx on public.project_media (media_asset_id);
create index project_materials_project_claim_sort_idx on public.project_materials (project_id, claim_status, sort_order);
create index project_materials_stone_group_idx on public.project_materials (stone_group_id);
create index project_materials_finish_idx on public.project_materials (finish_definition_id);
create index project_materials_media_idx on public.project_materials (media_asset_id);
create index project_material_maps_project_status_sort_idx on public.project_material_maps (project_id, status, sort_order);
create index project_material_maps_media_idx on public.project_material_maps (media_asset_id);
create index project_hotspots_map_status_sort_idx on public.project_hotspots (project_material_map_id, status, sort_order);
create index project_hotspots_material_idx on public.project_hotspots (project_material_id);
create index project_hotspots_preview_media_idx on public.project_hotspots (preview_media_id);
create index articles_status_published_idx on public.articles (status, published_on desc, sort_order);
create index articles_cover_media_idx on public.articles (cover_media_id);
create index article_blocks_article_status_sort_idx on public.article_blocks (article_id, status, sort_order);
create index article_blocks_media_idx on public.article_blocks (media_asset_id);
create index article_blocks_project_idx on public.article_blocks (linked_project_id);
create index article_blocks_stone_group_idx on public.article_blocks (linked_stone_group_id);
create index enquiries_status_created_idx on public.enquiries (status, created_at desc);
create index enquiries_assigned_to_idx on public.enquiries (assigned_to);
create index enquiries_new_queue_idx on public.enquiries (created_at desc) where status = 'new';
create index sample_requests_status_created_idx on public.sample_requests (status, created_at desc);
create index sample_requests_assigned_to_idx on public.sample_requests (assigned_to);
create index sample_requests_new_queue_idx on public.sample_requests (created_at desc) where status = 'new';
create index sample_request_items_request_idx on public.sample_request_items (sample_request_id);
create index sample_request_items_stone_group_idx on public.sample_request_items (stone_group_id);
create index sample_request_items_finish_idx on public.sample_request_items (finish_definition_id);
create index admin_audit_actor_idx on public.admin_audit_events (actor_user_id, created_at desc);
create index admin_audit_entity_idx on public.admin_audit_events (entity_type, entity_id, created_at desc);

alter table public.admin_profiles enable row level security;
alter table public.admin_audit_events enable row level security;
alter table public.media_assets enable row level security;
alter table public.site_settings enable row level security;
alter table public.finish_definitions enable row level security;
alter table public.stone_groups enable row level security;
alter table public.stone_variants enable row level security;
alter table public.stone_finish_capabilities enable row level security;
alter table public.stone_finish_images enable row level security;
alter table public.products enable row level security;
alter table public.product_models enable row level security;
alter table public.product_material_defaults enable row level security;
alter table public.product_specs enable row level security;
alter table public.projects enable row level security;
alter table public.project_facts enable row level security;
alter table public.project_media enable row level security;
alter table public.project_materials enable row level security;
alter table public.project_material_maps enable row level security;
alter table public.project_hotspots enable row level security;
alter table public.articles enable row level security;
alter table public.article_blocks enable row level security;
alter table public.enquiries enable row level security;
alter table public.sample_requests enable row level security;
alter table public.sample_request_items enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.media_assets, public.site_settings, public.finish_definitions, public.stone_groups, public.stone_variants, public.stone_finish_capabilities, public.stone_finish_images, public.products, public.product_models, public.product_material_defaults, public.product_specs, public.projects, public.project_facts, public.project_media, public.project_materials, public.project_material_maps, public.project_hotspots, public.articles, public.article_blocks to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

create policy admin_profiles_select_own on public.admin_profiles
  for select to authenticated
  using (user_id = (select auth.uid()) and is_active = true);
create policy admin_profiles_admin_select on public.admin_profiles
  for select to authenticated
  using (public.has_admin_role(array['owner', 'admin']));
create policy admin_profiles_admin_insert on public.admin_profiles
  for insert to authenticated
  with check (public.has_admin_role(array['owner', 'admin']));
create policy admin_profiles_admin_update on public.admin_profiles
  for update to authenticated
  using (public.has_admin_role(array['owner', 'admin']))
  with check (public.has_admin_role(array['owner', 'admin']));
create policy admin_profiles_owner_delete on public.admin_profiles
  for delete to authenticated
  using (public.has_admin_role(array['owner']));

create policy admin_audit_admin_select on public.admin_audit_events
  for select to authenticated
  using (public.has_admin_role(array['owner', 'admin']));
create policy admin_audit_admin_insert on public.admin_audit_events
  for insert to authenticated
  with check (public.has_admin_role(array['owner', 'admin', 'editor']) and (actor_user_id is null or actor_user_id = (select auth.uid())));

create policy media_assets_public_select on public.media_assets
  for select to anon, authenticated
  using (status = 'published');
create policy site_settings_public_select on public.site_settings
  for select to anon, authenticated
  using (status = 'published');
create policy finish_definitions_public_select on public.finish_definitions
  for select to anon, authenticated
  using (status = 'published');
create policy stone_groups_public_select on public.stone_groups
  for select to anon, authenticated
  using (status = 'published');
create policy stone_variants_public_select on public.stone_variants
  for select to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1 from public.stone_groups sg
      where sg.id = stone_variants.stone_group_id
        and sg.status = 'published'
    )
  );
create policy stone_finish_capabilities_public_select on public.stone_finish_capabilities
  for select to anon, authenticated
  using (
    exists (
      select 1
      from public.stone_variants sv
      join public.stone_groups sg on sg.id = sv.stone_group_id
      join public.finish_definitions fd on fd.id = stone_finish_capabilities.finish_definition_id
      where sv.id = stone_finish_capabilities.stone_variant_id
        and sv.status = 'published'
        and sg.status = 'published'
        and fd.status = 'published'
    )
  );
create policy stone_finish_images_public_select on public.stone_finish_images
  for select to anon, authenticated
  using (
    status = 'published'
    and exists (select 1 from public.media_assets ma where ma.id = stone_finish_images.media_asset_id and ma.status = 'published')
    and (stone_group_id is null or exists (select 1 from public.stone_groups sg where sg.id = stone_finish_images.stone_group_id and sg.status = 'published'))
    and (stone_variant_id is null or exists (select 1 from public.stone_variants sv where sv.id = stone_finish_images.stone_variant_id and sv.status = 'published'))
    and (finish_definition_id is null or exists (select 1 from public.finish_definitions fd where fd.id = stone_finish_images.finish_definition_id and fd.status = 'published'))
  );

create policy products_public_select on public.products
  for select to anon, authenticated
  using (status = 'published');
create policy product_models_public_select on public.product_models
  for select to anon, authenticated
  using (status = 'published' and exists (select 1 from public.products p where p.id = product_models.product_id and p.status = 'published'));
create policy product_material_defaults_public_select on public.product_material_defaults
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_material_defaults.product_id and p.status = 'published'));
create policy product_specs_public_select on public.product_specs
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_specs.product_id and p.status = 'published'));

create policy projects_public_select on public.projects
  for select to anon, authenticated
  using (status = 'published');
create policy project_facts_public_select on public.project_facts
  for select to anon, authenticated
  using (claim_status = 'approved' and exists (select 1 from public.projects p where p.id = project_facts.project_id and p.status = 'published'));
create policy project_media_public_select on public.project_media
  for select to anon, authenticated
  using (status = 'published' and exists (select 1 from public.projects p where p.id = project_media.project_id and p.status = 'published'));
create policy project_materials_public_select on public.project_materials
  for select to anon, authenticated
  using (claim_status = 'approved' and exists (select 1 from public.projects p where p.id = project_materials.project_id and p.status = 'published'));
create policy project_material_maps_public_select on public.project_material_maps
  for select to anon, authenticated
  using (status = 'published' and exists (select 1 from public.projects p where p.id = project_material_maps.project_id and p.status = 'published'));
create policy project_hotspots_public_select on public.project_hotspots
  for select to anon, authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.project_material_maps pmm
      join public.projects p on p.id = pmm.project_id
      where pmm.id = project_hotspots.project_material_map_id
        and pmm.status = 'published'
        and p.status = 'published'
    )
  );

create policy articles_public_select on public.articles
  for select to anon, authenticated
  using (status = 'published');
create policy article_blocks_public_select on public.article_blocks
  for select to anon, authenticated
  using (status = 'published' and exists (select 1 from public.articles a where a.id = article_blocks.article_id and a.status = 'published'));

do $$
declare
  tbl text;
  admin_read_roles text := 'array[''owner'', ''admin'', ''editor'', ''viewer'']';
  admin_write_roles text := 'array[''owner'', ''admin'', ''editor'']';
  admin_delete_roles text := 'array[''owner'', ''admin'']';
  editable_tables text[] := array[
    'media_assets',
    'site_settings',
    'finish_definitions',
    'stone_groups',
    'stone_variants',
    'stone_finish_capabilities',
    'stone_finish_images',
    'products',
    'product_models',
    'product_material_defaults',
    'product_specs',
    'projects',
    'project_facts',
    'project_media',
    'project_materials',
    'project_material_maps',
    'project_hotspots',
    'articles',
    'article_blocks',
    'enquiries',
    'sample_requests',
    'sample_request_items'
  ];
begin
  foreach tbl in array editable_tables loop
    execute format('create policy %I on public.%I for select to authenticated using (public.has_admin_role(%s));', tbl || '_admin_select', tbl, admin_read_roles);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.has_admin_role(%s));', tbl || '_admin_insert', tbl, admin_write_roles);
    execute format('create policy %I on public.%I for update to authenticated using (public.has_admin_role(%s)) with check (public.has_admin_role(%s));', tbl || '_admin_update', tbl, admin_write_roles, admin_write_roles);
    execute format('create policy %I on public.%I for delete to authenticated using (public.has_admin_role(%s));', tbl || '_admin_delete', tbl, admin_delete_roles);
  end loop;
end $$;
