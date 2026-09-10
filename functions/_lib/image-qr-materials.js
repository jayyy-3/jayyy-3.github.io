import stoneLibrary from '../../data/clean/stone_library.json';
import imageSources from '../../data/clean/stone_finish_images.json';

export const defaultQrMaterial = Object.freeze({ stoneGroupId: 'zen-grey', stoneVariantId: 'zen-grey', finishKey: 'honed' });
const finishKey = (finish) => finish.finishVariantId ? `${finish.finishId}__${finish.finishVariantId}` : finish.finishId;
const normalized = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

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

// The same managed catalogue drives QR selections, public pages and admin modules.
export async function listQrMaterialOptions(supabase) {
  const { data: catalogue, error } = await supabase.rpc('public_stone_catalogue');
  if (error || !catalogue?.stones || !catalogue?.managedKeys || !catalogue?.finishes) throw error || new Error('Stone catalogue unavailable');
  const options = catalogue.stones.flatMap(({draft}) => draft.variants.filter(v => v.enabled).flatMap(v => v.finishes.flatMap(f => {
    const finish = catalogue.finishes.find(item => item.id === f.definitionId);
    if (!finish || f.capability !== 'yes' || !f.images.some(image => image.role !== 'swatch')) return [];
    return [{stoneGroupId:draft.stone.slug,stoneVariantId:v.slug,finishKey:finish.key,stoneName:draft.stone.name,variantName:v.label || 'Standard',finishName:finish.name}];
  })));
  const excluded = new Set([...catalogue.managedKeys, ...catalogue.stones.map(s => s.draft.stone.slug)]);
  return [...staticQrMaterialOptions().filter(o => !excluded.has(o.stoneGroupId)), ...options]
    .sort((a,b) => a.stoneName.localeCompare(b.stoneName) || a.variantName.localeCompare(b.variantName));
}
