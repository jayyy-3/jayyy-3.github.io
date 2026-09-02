import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [appSource, detailSource, imageStageSource, imageSource, serviceSource, capabilityCsv, stoneLibrarySource, sampleCatalogSource, redirectsSource, sitemapSource] = await Promise.all([
  readFile(new URL('../src/App.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/StoneLibraryDetailPage.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/stone-library/ImageStage.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/data/stoneFinishImages.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/service/StoneLibraryService.ts', import.meta.url), 'utf8'),
  readFile(new URL('../data/clean/stone_finish_capabilities.csv', import.meta.url), 'utf8'),
  readFile(new URL('../data/clean/stone_library.json', import.meta.url), 'utf8'),
  readFile(new URL('../data/clean/sample_catalog.json', import.meta.url), 'utf8'),
  readFile(new URL('../public/_redirects', import.meta.url), 'utf8'),
  readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8'),
]);

const stoneLibrary = JSON.parse(stoneLibrarySource);
const sampleCatalog = JSON.parse(sampleCatalogSource);
const tuscany = stoneLibrary.stones.find((stone) => stone.stoneGroupId === 'tuscany');
assert(tuscany, 'Tuscany must remain in the Stone Library source.');
assert.deepEqual(
  tuscany.variants.map((variant) => variant.stoneVariantId).sort(),
  ['tuscany--cross-cut', 'tuscany--vein-cut'],
  'Tuscany must keep its Vein Cut and Cross Cut variants.',
);

for (const variant of tuscany.variants) {
  const availableFinishKeys = variant.finishCapabilities
    .filter((finish) => finish.capability !== 'no')
    .map((finish) => finish.finishVariantId
      ? `${finish.finishId}__${finish.finishVariantId}`
      : finish.finishId);
  assert.deepEqual(
    availableFinishKeys,
    ['honed'],
    `${variant.stoneVariantId} must expose Honed as its only selectable finish.`,
  );
}

const tuscanyCapabilityRows = capabilityCsv
  .trim()
  .split('\n')
  .slice(1)
  .map((line) => line.replace(/\r$/, '').split(','))
  .filter(([variantId]) => variantId.startsWith('tuscany--'));
for (const variant of tuscany.variants) {
  const csvAvailableFinishKeys = tuscanyCapabilityRows
    .filter(([variantId, , , capability]) => variantId === variant.stoneVariantId && capability !== 'no')
    .map(([, finishId, finishVariantId]) => finishVariantId ? `${finishId}__${finishVariantId}` : finishId);
  assert.deepEqual(
    csvAvailableFinishKeys,
    ['honed'],
    `${variant.stoneVariantId} CSV and JSON finish availability must agree.`,
  );
}

const scrollRestorationSource = appSource.slice(
  appSource.indexOf('function ScrollRestoration()'),
  appSource.indexOf('function WelcomePopupGate()'),
);
assert(scrollRestorationSource.includes('pathnameChanged'), 'Scroll restoration must distinguish path changes.');
assert(!scrollRestorationSource.includes('location.search'), 'Query-only selection changes must not reset page scroll.');

assert(
  detailSource.includes("setDetail((current) => current?.stoneGroupId === stoneGroupId ? current : null)"),
  'Variant refresh must retain the current detail while the replacement loads.',
);
assert(
  detailSource.includes("status === 'loading' && !detail"),
  'Only the initial Stone detail load may replace the page with the loading shell.',
);
const selectionRailIndex = detailSource.indexOf('aria-label="Stone selection"');
const cutSelectorIndex = detailSource.indexOf('<VariantSwitch', selectionRailIndex);
const finishSelectorIndex = detailSource.indexOf('<FinishAccordion', selectionRailIndex);
assert(selectionRailIndex >= 0, 'Stone detail must expose one right-side selection rail.');
assert(
  cutSelectorIndex > selectionRailIndex && finishSelectorIndex > cutSelectorIndex,
  'The selection rail must order Cut direction before Finish.',
);

const blueoceanImageMap = imageSource.slice(
  imageSource.indexOf('blueocean: {'),
  imageSource.indexOf('juparana: {'),
);
const blueocean = stoneLibrary.stones.find((stone) => stone.stoneGroupId === 'blueocean');
assert(blueocean, 'BlueOcean must remain under the canonical blueocean route key.');
assert.equal(blueocean.displayName, 'BlueOcean', 'BlueOcean must use the approved display name.');
assert.equal(blueocean.origin.regionDisplay, 'Guangdong', 'BlueOcean must retain the former Steel Blue product data.');
assert.equal(blueocean.price.tier, 1, 'BlueOcean must retain the former Steel Blue price tier.');
assert.equal(
  stoneLibrary.stones.some((stone) => stone.stoneGroupId === 'steel-blue'),
  false,
  'The duplicate Steel Blue Stone Library record must be removed.',
);
assert.deepEqual(
  blueocean.variants.map((variant) => variant.stoneVariantId),
  ['blueocean'],
  'The retained product variant must use the canonical BlueOcean key.',
);
assert(blueoceanImageMap.includes('default:'), 'Blueocean must retain a default cover image.');
assert(blueoceanImageMap.includes('sawn:'), 'Blueocean Sawn must have an explicit finish image.');
assert(
  blueoceanImageMap.includes('Steel Blue/Steel Blue_Honed_Urblo.jpeg') &&
    blueoceanImageMap.includes('Steel Blue/Steel Blue_Rock Face_Urblo.jpeg'),
  'BlueOcean must use the complete former Steel Blue finish image set.',
);
assert(
  !imageSource.includes("'steel-blue': {") && !imageSource.includes('fallbacks/blueocean-sawn.jpg'),
  'Neither the duplicate Steel Blue map nor the old BlueOcean fallback may remain.',
);
assert(!sampleCatalog.byStoneVariant['steel-blue'], 'Sample catalog must not retain a Steel Blue variant bucket.');
assert(
  sampleCatalog.items.every((item) => item.stoneVariantId !== 'steel-blue'),
  'Sample items must be re-keyed to BlueOcean.',
);
assert(
  redirectsSource.includes('/stone-library/steel-blue /stone-library/blueocean 301'),
  'The retired Steel Blue route must redirect to canonical BlueOcean.',
);
assert(!sitemapSource.includes('/stone-library/steel-blue'), 'The retired duplicate route must leave the sitemap.');
assert(
  serviceSource.includes('requiresFinishSpecificImages(activeVariant.variant_key)'),
  'Published CMS image resolution must retain its finish-image boundary.',
);
assert(
  serviceSource.includes("if (finish.imageRole === 'placeholder')"),
  'Missing finish imagery must remain pending instead of falling through to the default image.',
);
assert(
  imageStageSource.includes('Finish image pending') && imageStageSource.includes("return 'Image pending'"),
  'The image stage must render a deliberate pending state when a finish has no image.',
);

console.log('Stone Library detail integrity checks passed.');
