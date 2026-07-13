import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolvePublicMediaUrl, toSafePublicMediaSourceUrl } from '../src/lib/publicMediaUrl.ts';
import { parsePublicEntitySeo, validatePublicEntitySeoDraft } from '../src/lib/publicEntitySeo.ts';
import { parseProjectFactJsonDraft } from '../src/lib/projectFactValue.ts';
import { toSafePublicContentDestination } from '../src/lib/publicContentLink.ts';
import {
  createRefreshablePublicSiteSettingsLoader,
  staticPublicSiteSettings,
} from '../src/lib/publicSiteSettings.ts';
import { toSafeInternalFooterDestination } from '../src/lib/siteSettingsFooterContract.ts';
import {
  normalizePublishedSiteSettingsFields,
  validatePublishedSiteSettingsFields,
} from '../src/lib/siteSettingsPublicContract.ts';
import {
  getPublishedProjects,
  mergeProjectsWithPublishedOverlay,
  normalizePublicProjectFactValue,
} from '../src/service/ProjectService.ts';
import { overlayPublishedContent } from '../src/service/publicContentOverlay.ts';

const fallbackAlpha = { slug: 'alpha', source: 'static' };
const fallbackBeta = { slug: 'beta', source: 'static' };
const publishedAlpha = { slug: ' Alpha ', source: 'published' };
const publishedGamma = { slug: 'gamma', source: 'published' };

const merged = overlayPublishedContent(
  [fallbackAlpha, fallbackBeta],
  [publishedAlpha, publishedGamma],
  (item) => item.slug,
);

assert.deepEqual(
  merged.map((item) => [item.slug.trim().toLowerCase(), item.source]),
  [
    ['alpha', 'published'],
    ['beta', 'static'],
    ['gamma', 'published'],
  ],
  'Published records must replace the same canonical key without hiding unmatched static records',
);
assert.equal(merged[0], publishedAlpha, 'The Published record must win for a matching canonical key');
assert.equal(merged[1], fallbackBeta, 'An unmatched static record must remain visible');
assert.equal(merged[2], publishedGamma, 'A new Published record must be appended');

assert.equal(toSafePublicMediaSourceUrl('/media/example.jpg'), '/media/example.jpg');
assert.equal(toSafePublicMediaSourceUrl('https://cdn.example.com/example.jpg'), 'https://cdn.example.com/example.jpg');
assert.equal(toSafePublicMediaSourceUrl('javascript:alert(1)'), undefined);
assert.equal(toSafePublicMediaSourceUrl('//untrusted.example/example.jpg'), undefined);
assert.equal(
  resolvePublicMediaUrl(
    {
      status: 'published',
      source_kind: 'external_legacy',
      source_url: 'javascript:alert(1)',
      bucket: null,
      object_path: null,
    },
    null,
  ),
  undefined,
  'Published external media must reject unsafe URL schemes',
);
assert.equal(
  resolvePublicMediaUrl(
    {
      status: 'draft',
      source_kind: 'external_legacy',
      source_url: 'https://cdn.example.com/draft.jpg',
      bucket: null,
      object_path: null,
    },
    null,
  ),
  undefined,
  'Draft media must never resolve publicly',
);
assert.deepEqual(parsePublicEntitySeo({ title: ' CMS title ', description: ' CMS description ' }), {
  title: 'CMS title',
  description: 'CMS description',
});
assert.equal(normalizePublicProjectFactValue('Structured text', 'Fallback'), 'Structured text');
assert.deepEqual(normalizePublicProjectFactValue(['One', 'Two'], 'Fallback'), ['One', 'Two']);
assert.equal(
  normalizePublicProjectFactValue({ unsafe: 'object' }, 'Safe fallback'),
  'Safe fallback',
  'Object-shaped fact JSON must never reach React rendering',
);
assert.equal(
  normalizePublicProjectFactValue(42, null),
  '',
  'Non-renderable fact JSON without text fallback must normalize to empty text',
);
assert.deepEqual(parseProjectFactJsonDraft('"Structured text"'), {
  error: null,
  value: 'Structured text',
});
assert.deepEqual(parseProjectFactJsonDraft('["One", "Two"]'), {
  error: null,
  value: ['One', 'Two'],
});
assert.match(parseProjectFactJsonDraft('{"unsafe":true}').error, /JSON string or an array/);
assert.match(parseProjectFactJsonDraft('42').error, /JSON string or an array/);
assert.deepEqual(toSafePublicContentDestination('/projects/../contact?intent=sample-request'), {
  kind: 'internal',
  href: '/contact?intent=sample-request',
});
assert.deepEqual(toSafePublicContentDestination('https://example.com/video'), {
  kind: 'external',
  href: 'https://example.com/video',
});
for (const unsafeContentDestination of [
  '//evil.example/path',
  'javascript:alert(1)',
  'data:text/html,unsafe',
  '/%5cevil.example/path',
  '/%0aevil',
]) {
  assert.equal(
    toSafePublicContentDestination(unsafeContentDestination),
    null,
    `Unsafe article destination must be rejected: ${unsafeContentDestination}`,
  );
}
assert.equal(
  validatePublicEntitySeoDraft('x'.repeat(181), '').error,
  'Search title must be 180 characters or fewer.',
);

const publishedProjectRow = {
  id: 1,
  slug: 'moon-gate-woolley-street',
  title: 'CMS Moon Gate',
  location: 'Dickson ACT',
  project_date_label: '2026',
  summary: 'CMS summary',
  lead: 'CMS lead',
  landscape_architect: null,
  contractor: null,
  address: null,
  quantity_label: null,
  carbon_status: null,
  seo: { title: 'CMS project search title', description: 'CMS project search description' },
  sort_order: 0,
  cover_media: null,
  hero_media: null,
};

function createQueryBuilder(result) {
  const builder = {
    select() {
      return builder;
    },
    eq() {
      return builder;
    },
    in() {
      return builder;
    },
    order() {
      return builder;
    },
    then(onFulfilled, onRejected) {
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
  };

  return builder;
}

function createProjectClient(resultsByTable) {
  return {
    from(table) {
      assert.ok(table in resultsByTable, `Unexpected public project query: ${table}`);
      return createQueryBuilder(resultsByTable[table]);
    },
  };
}

const successfulProjectClient = createProjectClient({
  projects: { data: [publishedProjectRow], error: null },
  project_facts: { data: [], error: null },
  project_media: { data: [], error: null },
});
const mappedPublishedProjects = await getPublishedProjects(successfulProjectClient);
assert.equal(mappedPublishedProjects[0].contentSource, 'cms');
assert.deepEqual(mappedPublishedProjects[0].seo, {
  title: 'CMS project search title',
  description: 'CMS project search description',
});

const mergedProjects = mergeProjectsWithPublishedOverlay(mappedPublishedProjects);
const mergedMoonGate = mergedProjects.find((project) => project.slug === 'moon-gate-woolley-street');
assert.equal(mergedMoonGate.name, 'CMS Moon Gate', 'CMS-owned project copy must still win');
assert.equal(mergedMoonGate.listing.sector, 'Civic landscape', 'Static project sector must survive a matching CMS overlay');
assert.equal(
  mergedMoonGate.listing.category,
  'Urban sculpture and public realm',
  'Static project category must survive a matching CMS overlay',
);
assert.ok(mergedMoonGate.materials?.length, 'Static-only public material display must remain available');
assert.equal(mergedMoonGate.cta?.primaryTo, '/contact', 'Static-only project CTA routing must remain available');

for (const failingTable of ['project_facts', 'project_media']) {
  const resultsByTable = {
    projects: { data: [publishedProjectRow], error: null },
    project_facts: { data: [], error: null },
    project_media: { data: [], error: null },
  };
  resultsByTable[failingTable] = { data: null, error: { message: `${failingTable} failed` } };
  const failedPublishedProjects = await getPublishedProjects(createProjectClient(resultsByTable));
  assert.deepEqual(
    failedPublishedProjects,
    [],
    `${failingTable} errors must reject the CMS overlay so static projects remain intact`,
  );
}

const validPublishedSettings = {
  companyName: 'Urblo',
  primaryEmail: 'info@urblo.com.au',
  primaryPhone: '+61 3 0000 0000',
  instagram: 'https://www.instagram.com/urblo/',
  linkedin: 'https://www.linkedin.com/company/urblo/',
  seoTitle: 'Urblo homepage title',
  seoDescription: 'Urblo homepage search description.',
  defaultShareImage: '/og-default.png',
};
assert.equal(validatePublishedSiteSettingsFields(validPublishedSettings), null);
assert.deepEqual(
  normalizePublishedSiteSettingsFields({
    ...validPublishedSettings,
    companyName: '  Urblo   Studio ',
    primaryPhone: ' +61  3 0000 0000 ',
    instagram: 'https://instagram.com',
    seoDescription: ' Homepage\nsearch   description. ',
    defaultShareImage: '/images/../og-default.png',
  }),
  {
    error: null,
    value: {
      companyName: 'Urblo Studio',
      primaryEmail: 'info@urblo.com.au',
      primaryPhone: '+61 3 0000 0000',
      instagram: 'https://instagram.com/',
      linkedin: 'https://www.linkedin.com/company/urblo/',
      seoTitle: 'Urblo homepage title',
      seoDescription: 'Homepage search description.',
      defaultShareImage: '/og-default.png',
    },
  },
  'Published settings must write the same normalized values the public parser exposes',
);
assert.match(
  validatePublishedSiteSettingsFields({ ...validPublishedSettings, primaryEmail: 'invalid' }),
  /valid primary email/,
);
assert.match(
  validatePublishedSiteSettingsFields({ ...validPublishedSettings, instagram: 'javascript:alert(1)' }),
  /Instagram links/,
);
assert.match(
  validatePublishedSiteSettingsFields({ ...validPublishedSettings, seoTitle: 'x'.repeat(181) }),
  /homepage search title/,
);
assert.match(
  validatePublishedSiteSettingsFields({ ...validPublishedSettings, defaultShareImage: '//private.example/image.jpg' }),
  /default share image/,
);

assert.equal(
  toSafeInternalFooterDestination('/projects/../contact?intent=sample-request#form'),
  '/contact?intent=sample-request#form',
  'Internal footer destinations must resolve to a canonical same-origin path',
);
for (const unsafeDestination of [
  '//evil.example/path',
  '/\\evil.example/path',
  '/%5cevil.example/path',
  '/%0aevil',
  '/contact\n',
  'https://urblo.com.au/contact',
]) {
  assert.equal(
    toSafeInternalFooterDestination(unsafeDestination),
    null,
    `Unsafe internal footer destination must be rejected: ${unsafeDestination}`,
  );
}

let settingsFetchAttempts = 0;
const refreshedSettings = {
  ...staticPublicSiteSettings,
  source: 'cms',
  companyName: 'Fresh Urblo settings',
};
const retryingSettingsLoader = createRefreshablePublicSiteSettingsLoader(async () => {
  settingsFetchAttempts += 1;
  if (settingsFetchAttempts === 1) {
    throw new Error('Transient settings read failure');
  }
  return refreshedSettings;
});
const firstSettingsRequest = retryingSettingsLoader();
assert.equal(
  retryingSettingsLoader(),
  firstSettingsRequest,
  'Concurrent settings reads must share the same in-flight request',
);
assert.equal((await firstSettingsRequest).source, 'static');
assert.equal((await retryingSettingsLoader()).companyName, 'Fresh Urblo settings');
await retryingSettingsLoader();
assert.equal(settingsFetchAttempts, 3, 'Settled settings reads must refresh on the next provider mount');

const requiredSourceFragments = new Map([
  ['src/service/ProjectService.ts', ['mergeProjectsWithPublishedOverlay', 'seo: parsePublicEntitySeo(row.seo)', 'factsResult.error || mediaResult.error']],
  ['src/pages/admin/AdminProjectsPage.tsx', ['projectBundleLoadGenerationRef', ".eq('project_id', projectId)", 'selectedProjectIdRef.current !== projectId', 'parseProjectFactJsonDraft']],
  ['src/pages/ProjectDetails.tsx', ['<PublicContentSeo', "contentSource === 'cms'"]],
  ['src/components/PublicContentSeo.tsx', ['upsertDynamicJsonLd', "'@type': 'Article'", "'@type': 'WebPage'", "'@type': 'BreadcrumbList'", "tag?.dataset.owner === 'public-content-seo'"]],
  ['src/service/ProductService.ts', ['mergeProductsWithPublishedOverlay', 'await ProductService.getAll()', 'seo: parsePublicEntitySeo(row.seo)']],
  ['src/service/ArticleService.ts', ['mergeArticlesWithPublishedOverlay', 'static async getBySlug', 'seo: parsePublicEntitySeo(row.seo)']],
  ['src/pages/admin/AdminArticlesPage.tsx', ['blockLoadGenerationRef', ".eq('article_id', articleId)", 'toSafePublicContentDestination']],
  ['src/pages/ArticlePage.tsx', ['toSafePublicContentDestination', 'destination?.kind === \'internal\'']],
  ['src/service/StoneLibraryService.ts', ['getPublicStoneCards', '(card) => card.stoneGroupId', "contentSource: 'cms'"]],
  ['src/pages/StoneLibraryPage.tsx', ['getFilterFacets(publicCards)', 'filterStoneCards(publicCards']],
  ['src/pages/StoneLibraryDetailPage.tsx', ['<PublicContentSeo', "contentSource === 'cms'"]],
  ['src/pages/ProductDetailPage.tsx', ['<PublicContentSeo', 'contentSource === \'cms\'']],
  ['src/pages/ArticlePage.tsx', ['<PublicContentSeo', 'contentSource === \'cms\'']],
  ['src/pages/admin/AdminSettingsPage.tsx', ["form.status === 'published'", 'normalizePublishedSiteSettingsFields', 'Homepage search settings']],
  ['src/lib/publicSiteSettings.ts', ['createRefreshablePublicSiteSettingsLoader', 'toPublicSiteSettingsShareImage']],
  ['src/lib/PublicSiteSettingsProvider.tsx', ["nextSettings.source === 'static' && attempt === 0", 'window.clearTimeout(retryTimer)']],
]);

for (const [file, fragments] of requiredSourceFragments) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  for (const fragment of fragments) {
    assert.ok(source.includes(fragment), `${file} must include ${fragment}`);
  }
}

console.log('Public content overlay checks passed.');
