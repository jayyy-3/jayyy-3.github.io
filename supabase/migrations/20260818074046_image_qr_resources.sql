-- Stable Urblo image links used by downloadable QR codes.
-- The table is intentionally server-only: admin mutations and public slug
-- resolution go through Cloudflare Pages Functions using the service role.

create table public.image_qr_resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null
    check (char_length(btrim(name)) between 1 and 160),
  status text not null default 'active'
    check (status in ('active', 'hidden')),
  object_path text not null unique,
  mime_type text not null
    check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  width_px integer not null check (width_px > 0),
  height_px integer not null check (height_px > 0),
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create index image_qr_resources_status_updated_idx
  on public.image_qr_resources (status, updated_at desc);

create trigger image_qr_resources_set_updated_at
  before update on public.image_qr_resources
  for each row execute function public.set_updated_at();

alter table public.image_qr_resources enable row level security;

revoke all on table public.image_qr_resources from anon, authenticated;
grant select, insert, update, delete on table public.image_qr_resources to service_role;

comment on table public.image_qr_resources is
  'Server-only stable image links for Urblo QR downloads. Hidden rows stop resolving publicly without deleting their stored image.';
