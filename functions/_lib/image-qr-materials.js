import stoneLibrary from '../../data/clean/stone_library.json' with { type: 'json' };
import imageSources from '../../data/clean/stone_finish_images.json' with { type: 'json' };

export const defaultQrMaterial = Object.freeze({ stoneGroupId: 'zen-grey', stoneVariantId: 'zen-grey', finishKey: 'honed' });
const finishKey = (finish) => finish.finishVariantId ? `${finish.finishId}__${finish.finishVariantId}` : finish.finishId;
const normalized = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const relation = (value) => Array.isArray(value) ? value[0] : value;

export function hasStaticFinishImage(variant, finish) {
  return [imageSources[variant], imageSources[variant.split('--')[0]]].some((map) =>
    Boolean(map?.[finish]?.path || map?.[finish.split('__')[0]]?.path));
}

export function staticQrMaterialOptions() {
  return stoneLibrary.stones.filter((stone) => stone.status === 'active').flatMap((stone) =>
    stone.variants.filter((variant) => variant.status === 'active').flatMap((variant) =>
      variant.finishCapabilities.filter((finish) => finish.capability === 'yes' && hasStaticFinishImage(variant.stoneVariantId, finishKey(finish))).map((finish) => ({
        stoneGroupId: stone.stoneGroupId,
        stoneVariantId: variant.stoneVariantId,
        finishKey: finishKey(finish),
        stoneName: stone.displayName,
        variantName: variant.displayVariant || 'Standard',
        finishName: stoneLibrary.finishes.find((item) => finishKey(item) === finishKey(finish))?.displayName || finish.finishId,
      })),
    ),
  );
}

export function sameQrMaterial(a, b) {
  return Boolean(a && b && a.stoneGroupId === b.stoneGroupId && a.stoneVariantId === b.stoneVariantId && a.finishKey === b.finishKey);
}

export function defaultQrMaterialForName(name) {
  const [rawStone, rawFinish] = String(name || '').split(/\s*[·_]\s*/);
  const aliases = { steelblue: 'blueocean', toscany: 'tuscany', glodencrust: 'goldencrust' };
  const stoneName = aliases[normalized(rawStone)] || normalized(rawStone);
  const matches = staticQrMaterialOptions().filter((option) => normalized(option.stoneName) === stoneName && (
    normalized(option.finishName) === normalized(rawFinish) ||
    (option.stoneGroupId === 'tuscany' && normalized(option.variantName) === normalized(rawFinish) && option.finishKey === 'honed')
  ));
  const selected = matches.length === 1 ? matches[0] : defaultQrMaterial;
  return { stoneGroupId: selected.stoneGroupId, stoneVariantId: selected.stoneVariantId, finishKey: selected.finishKey };
}

export function validateQrMaterialShape(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const keys = ['stoneGroupId', 'stoneVariantId', 'finishKey'];
  if (!keys.every((key) => typeof value[key] === 'string' && /^[a-z0-9][a-z0-9_-]{0,119}$/.test(value[key]))) return null;
  return Object.fromEntries(keys.map((key) => [key, value[key]]));
}

function hasPublicMedia(row) {
  const media = relation(row.media_assets);
  if (media?.status !== 'published') return false;
  if (media.source_kind === 'storage') return media.bucket === 'urblo-public-media' && Boolean(media.object_path);
  return /^https?:\/\//.test(media.source_url || '') || /^\/(?!\/)/.test(media.source_url || '');
}

// Query only public content, even though this server also holds admin credentials.
// Draft content never becomes a selectable/public QR material through this path.
export async function listQrMaterialOptions(supabase) {
  const { data: groups, error } = await supabase.from('stone_groups')
    .select('id,stone_group_key,display_name').eq('status', 'published');
  if (error) throw error;
  const options = staticQrMaterialOptions();
  if (!groups?.length) return options;
  const ids = groups.map((group) => group.id);
  const [variantResult, imageResult] = await Promise.all([
    supabase.from('stone_variants').select('id,stone_group_id,variant_key,display_name').in('stone_group_id', ids).eq('status', 'published').order('sort_order'),
    supabase.from('stone_finish_images').select('stone_group_id,stone_variant_id,finish_definition_id,media_assets!stone_finish_images_media_asset_id_fkey(status,source_kind,source_url,bucket,object_path)')
      .in('stone_group_id', ids).eq('status', 'published'),
  ]);
  if (variantResult.error || imageResult.error) throw variantResult.error || imageResult.error;
  const variants = variantResult.data || [];
  const images = (imageResult.data || []).filter(hasPublicMedia);
  const caps = variants.length ? await supabase.from('stone_finish_capabilities')
    .select('stone_variant_id,finish_definition_id,finish_definitions!stone_finish_capabilities_finish_definition_id_fkey(finish_key,display_name,status)')
    .in('stone_variant_id', variants.map((variant) => variant.id)).eq('capability', 'yes') : { data: [] };
  if (caps.error) throw caps.error;
  const cmsOptions = groups.flatMap((group) => variants.filter((variant) => variant.stone_group_id === group.id).flatMap((variant) =>
    (caps.data || []).filter((capability) => capability.stone_variant_id === variant.id).flatMap((capability) => {
      const finish = relation(capability.finish_definitions);
      if (!finish || finish.status !== 'published') return [];
      const hasImage = images.some((image) => image.stone_group_id === group.id && (image.stone_variant_id === variant.id || image.stone_variant_id === null) && image.finish_definition_id === capability.finish_definition_id);
      if (!hasImage && !hasStaticFinishImage(variant.variant_key, finish.finish_key)) return [];
      return [{ stoneGroupId: group.stone_group_key, stoneVariantId: variant.variant_key, finishKey: finish.finish_key, stoneName: group.display_name, variantName: variant.display_name || 'Standard', finishName: finish.display_name }];
    }),
  ));
  const publishedKeys = new Set(groups.map((group) => group.stone_group_key));
  return [...options.filter((option) => !publishedKeys.has(option.stoneGroupId)), ...cmsOptions]
    .sort((a, b) => a.stoneName.localeCompare(b.stoneName) || a.variantName.localeCompare(b.variantName));
}
