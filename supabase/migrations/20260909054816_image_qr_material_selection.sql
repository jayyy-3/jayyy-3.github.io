-- Additive: legacy QR links and images are unchanged. Null means the runtime
-- supplies a default material until an editor saves an explicit selection.
alter table public.image_qr_resources
  add column material_selection jsonb;

alter table public.image_qr_resources
  add constraint image_qr_material_selection_shape check (
    material_selection is null or (
      jsonb_typeof(material_selection) = 'object'
      and material_selection ?& array['stoneGroupId', 'stoneVariantId', 'finishKey']
      and jsonb_typeof(material_selection -> 'stoneGroupId') = 'string'
      and jsonb_typeof(material_selection -> 'stoneVariantId') = 'string'
      and jsonb_typeof(material_selection -> 'finishKey') = 'string'
      and material_selection ->> 'stoneGroupId' ~ '^[a-z0-9][a-z0-9_-]{0,119}$'
      and material_selection ->> 'stoneVariantId' ~ '^[a-z0-9][a-z0-9_-]{0,119}$'
      and material_selection ->> 'finishKey' ~ '^[a-z0-9][a-z0-9_-]{0,119}$'
      and material_selection - array['stoneGroupId', 'stoneVariantId', 'finishKey'] = '{}'::jsonb
    )
  );

comment on column public.image_qr_resources.material_selection is
  'Public Stone Library keys only. Null uses a labelled default; explicit editor selections are saved through the protected QR Function.';
-- Existing server-only grants and RLS remain unchanged. No content is published,
-- no existing row is updated, and no image or printed QR is replaced.
