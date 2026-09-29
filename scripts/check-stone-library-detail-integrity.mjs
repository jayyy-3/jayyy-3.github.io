import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [appSource, detailSource, imageStageSource, imageSource, serviceSource, capabilityCsv, stoneLibrarySource, sampleCatalogSource, redirectsSource, sitemapSource] = await Promise.all([
  readFile(new URL('../src/App.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/pages/StoneLibraryDetailPage.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/stone-library/ImageStage.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../data/clean/stone_finish_images.json', import.meta.url), 'utf8'),
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
  /setDetail\(\(current\) =>\s*current\?\.stoneGroupId === stoneGroupId \? current : null/.test(detailSource),
  'Variant refresh must retain the current detail while the replacement loads.',
);
assert(
  detailSource.includes("status === 'loading' && !detail"),
  'Only the initial Stone detail load may replace the page with the loading shell.',
);
const stoneViewSource = await readFile(new URL('../src/pages/StonePageView.tsx', import.meta.url), 'utf8');
const stoneDraftSource = await readFile(new URL('../src/features/stone-library/stoneDraft.ts', import.meta.url), 'utf8');
const selectionRailIndex = stoneViewSource.indexOf('aria-label="Stone selection"');
const cutSelectorIndex = stoneViewSource.indexOf('<VariantSwitch', selectionRailIndex);
const finishSelectorIndex = stoneViewSource.indexOf('<FinishAccordion', selectionRailIndex);
assert(selectionRailIndex >= 0, 'Stone detail must expose one right-side selection rail.');
assert(
  cutSelectorIndex > selectionRailIndex && finishSelectorIndex > cutSelectorIndex,
  'The selection rail must order Cut direction before Finish.',
);

const blueoceanImageMap = JSON.parse(imageSource).blueocean;
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
assert(Boolean(blueoceanImageMap.default), 'Blueocean must retain a default cover image.');
assert(Boolean(blueoceanImageMap.sawn), 'Blueocean Sawn must have an explicit finish image.');
assert(
  blueoceanImageMap.honed.path === 'Steel Blue/Steel Blue_Honed_Urblo.jpeg' &&
    blueoceanImageMap.rock_face.path === 'Steel Blue/Steel Blue_Rock Face_Urblo.jpeg',
  'BlueOcean must use the complete former Steel Blue finish image set.',
);
assert(
  !JSON.parse(imageSource)['steel-blue'] && !imageSource.includes('fallbacks/blueocean-sawn.jpg'),
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
  stoneDraftSource.includes('mediaById.get(primary.mediaAssetId)') && !stoneDraftSource.includes('getStoneDefaultImage'),
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

// Stone Library comparison (NOW-STONE-COMPARE-001): lazy route ahead of the detail slug,
// registry-driven rows, origin kept internal, noindex head canonical to the list.
const [compareRegistrySource, compareViewSource, seoRoutesSource, edgeSeoSource] = await Promise.all([
  readFile(new URL('../src/lib/stoneCompareRegistry.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/components/stone-library/StoneCompareView.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../src/data/seoRoutes.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/lib/edgeSeo.ts', import.meta.url), 'utf8'),
]);
const compareRouteIndex = appSource.indexOf('path="/stone-library/compare"');
assert(
  appSource.includes("lazy(() => import('./pages/StoneComparePage'))"),
  'The compare page must be lazy-loaded.',
);
assert(
  compareRouteIndex >= 0 && compareRouteIndex < appSource.indexOf('path="/stone-library/:stoneGroupId"'),
  'The compare route must be registered before the Stone detail route.',
);
assert(
  !stoneLibrary.stones.some((stone) => stone.stoneGroupId === 'compare'),
  '"compare" is reserved for the comparison route and cannot be a Stone slug.',
);
assert(
  /key: 'origin',[\s\S]*?public: false,/.test(compareRegistrySource),
  'Origin must stay a non-public comparison attribute.',
);
assert(
  compareRegistrySource.includes('.filter((attribute) => attribute.public === true)'),
  'Only public registry attributes may reach the compare page.',
);
for (const label of ['Raw block', 'Price tier', 'Cut options', 'Used in projects', 'Origin']) {
  assert(!compareViewSource.includes(`'${label}'`) && !compareViewSource.includes(`>${label}<`), `The compare view must not hard-code the "${label}" attribute.`);
}
assert(
  /path: '\/stone-library\/compare',[\s\S]*?isIndexable: false,[\s\S]*?canonicalPath: '\/stone-library'/.test(seoRoutesSource),
  'The compare route must be noindex with a canonical to /stone-library.',
);
assert(
  seoRoutesSource.includes("seoRoute.isIndexable ? 'index,follow' : 'noindex,follow'") &&
    edgeSeoSource.includes('!registryRoute.isIndexable'),
  'Client and edge heads must honour non-indexable registry routes.',
);

console.log('Stone Library detail integrity checks passed.');
