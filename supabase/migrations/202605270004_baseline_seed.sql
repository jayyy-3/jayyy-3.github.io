-- Baseline data required before forms and admin work.

insert into public.finish_definitions (
  finish_key,
  display_name,
  description,
  sort_order,
  status,
  published_at
)
values
  ('flamed', 'Flamed', 'Textured surface finish used where grip and outdoor durability matter.', 10, 'published', now()),
  ('sawn', 'Sawn', 'Clean sawn surface finish for precise stone geometry and modular detailing.', 20, 'published', now()),
  ('honed', 'Honed', 'Smooth matte finish for refined civic and streetscape applications.', 30, 'published', now()),
  ('polished', 'Polished', 'High-sheen finish used selectively where reflectivity and inspection context are appropriate.', 40, 'published', now()),
  ('bush_hammered', 'Bush Hammered', 'Mechanically textured finish for robust public-realm surface character.', 50, 'published', now()),
  ('combed', 'Combed', 'Directional textured finish for tactile and visual grain expression.', 60, 'published', now()),
  ('rippling', 'Rippling', 'Rippled surface finish with a directional stone texture.', 70, 'published', now()),
  ('rippling__fine', 'Rippling (Fine)', 'Fine rippled texture variant for lighter surface movement.', 71, 'published', now()),
  ('rippling__rough', 'Rippling (Rough)', 'Rough rippled texture variant for stronger surface movement.', 72, 'published', now()),
  ('rock_face', 'Rock Face', 'Split or rugged face finish for heavier texture and edge expression.', 80, 'published', now()),
  ('sparrow_peck', 'Sparrow Peck', 'Fine pecked texture finish for subtle tactile variation.', 90, 'published', now()),
  ('sandblasted', 'Sandblasted', 'Even blasted finish for a softened and consistent stone surface.', 100, 'published', now())
on conflict (finish_key) do update
set
  display_name = excluded.display_name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = coalesce(public.finish_definitions.published_at, excluded.published_at),
  updated_at = now();

insert into public.site_settings (
  settings_key,
  status,
  company_name,
  primary_email,
  primary_phone,
  social_links,
  footer_columns,
  seo,
  published_at
)
values (
  'default',
  'published',
  'Urblo',
  'info@urblo.com.au',
  '1300 1URBLO',
  '{
    "instagram": "https://www.instagram.com/urb.lo?igsh=MThyZ3g1NnoyMXc0cg%3D%3D&utm_source=qr",
    "linkedin": "https://au.linkedin.com/company/urblo"
  }'::jsonb,
  '[
    {
      "title": "Contact",
      "items": [
        {"label": "Email", "value": "info@urblo.com.au"},
        {"label": "Phone", "value": "1300 1URBLO"},
        {"label": "Address", "value": "5 Hamilton St, Oakleigh VIC 3166"}
      ]
    },
    {
      "title": "Navigation",
      "items": [
        {"label": "Projects", "to": "/projects"},
        {"label": "Stone Library", "to": "/stone-library"},
        {"label": "Our Story", "to": "/our-story"},
        {"label": "Articles", "to": "/articles"},
        {"label": "Products", "to": "/products"},
        {"label": "Contact Us", "to": "/contact"}
      ]
    }
  ]'::jsonb,
  '{
    "title": "Urblo",
    "description": "Design-led stone solutions for streetscapes and civil landscapes.",
    "defaultShareImage": "/og-default.png"
  }'::jsonb,
  now()
)
on conflict (settings_key) do update
set
  status = excluded.status,
  company_name = excluded.company_name,
  primary_email = excluded.primary_email,
  primary_phone = excluded.primary_phone,
  social_links = excluded.social_links,
  footer_columns = excluded.footer_columns,
  seo = excluded.seo,
  published_at = coalesce(public.site_settings.published_at, excluded.published_at),
  updated_at = now();
