import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const SITE_URL = 'https://urblo.com.au';

const failures = [];
const notes = [];

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

function fail(message) {
  failures.push(message);
}

function note(message) {
  notes.push(message);
}

function toUrl(pathname) {
  return new URL(pathname, SITE_URL).toString();
}

function extractStringLiteralSlugs(source, label) {
  const slugs = [...source.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1]);
  const duplicateSlugs = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);

  if (!slugs.length) {
    fail(`No ${label} slugs were found.`);
  }

  if (duplicateSlugs.length) {
    fail(`Duplicate ${label} slugs found: ${[...new Set(duplicateSlugs)].join(', ')}`);
  }

  return slugs;
}

function assertIncludes(text, expected, label) {
  if (!text.includes(expected)) {
    fail(`${label} is missing: ${expected}`);
  }
}

function assertNotIncludes(text, unexpected, label) {
  if (text.includes(unexpected)) {
    fail(`${label} should not include: ${unexpected}`);
  }
}

const robots = readText('public/robots.txt');
assertNotIncludes(robots.toLowerCase(), '<html', 'robots.txt');
assertIncludes(robots, 'User-agent: *', 'robots.txt');
assertIncludes(robots, 'Allow: /', 'robots.txt');
assertIncludes(robots, 'Disallow: /admin', 'robots.txt');
assertIncludes(robots, 'Disallow: /api', 'robots.txt');
assertIncludes(robots, 'Sitemap: https://urblo.com.au/sitemap.xml', 'robots.txt');

const sitemap = readText('public/sitemap.xml');
assertNotIncludes(sitemap.toLowerCase(), '<html', 'sitemap.xml');
assertIncludes(sitemap, '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', 'sitemap.xml');

const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const duplicateSitemapUrls = sitemapUrls.filter((url, index) => sitemapUrls.indexOf(url) !== index);

if (duplicateSitemapUrls.length) {
  fail(`Duplicate sitemap URLs found: ${[...new Set(duplicateSitemapUrls)].join(', ')}`);
}

for (const url of sitemapUrls) {
  if (!url.startsWith(`${SITE_URL}/`)) {
    fail(`Sitemap URL is outside ${SITE_URL}: ${url}`);
  }

  const pathname = new URL(url).pathname;
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    fail(`Sitemap must not expose admin/API paths: ${url}`);
  }

  if (url.includes('?') || url.includes('#')) {
    fail(`Sitemap should contain clean canonical URLs only: ${url}`);
  }
}

const projectSlugs = extractStringLiteralSlugs(readText('src/data/projectData.ts'), 'project');
const productSlugs = extractStringLiteralSlugs(readText('src/data/productData.ts'), 'product');
const stoneSlugs = readJson('data/clean/stone_library.json').stones.map((stone) => stone.stoneGroupId);
const articleSlugs = readJson('public/articles/index.json').map((article) => article.slug);

const expectedPaths = [
  '/',
  '/projects',
  '/stone-library',
  '/products',
  '/capabilities',
  '/our-story',
  '/articles',
  '/contact',
  ...projectSlugs.map((slug) => `/projects/${slug}`),
  ...stoneSlugs.map((slug) => `/stone-library/${slug}`),
  ...productSlugs.map((slug) => `/products/${slug}`),
  ...articleSlugs.map((slug) => `/articles/${slug}`),
];
const expectedUrls = expectedPaths.map(toUrl);

const missingUrls = expectedUrls.filter((url) => !sitemapUrls.includes(url));
const extraUrls = sitemapUrls.filter((url) => !expectedUrls.includes(url));

if (missingUrls.length) {
  fail(`Sitemap is missing expected URLs:\n- ${missingUrls.join('\n- ')}`);
}

if (extraUrls.length) {
  fail(`Sitemap includes URLs outside the approved public route set:\n- ${extraUrls.join('\n- ')}`);
}

if (sitemapUrls.length !== expectedUrls.length) {
  fail(`Sitemap URL count mismatch: expected ${expectedUrls.length}, found ${sitemapUrls.length}.`);
}

const seoRoutesSource = readText('src/data/seoRoutes.ts');
for (const marker of [
  'SEO_ROUTES',
  'getSeoMetaForPathname',
  'getStructuredDataForPathname',
  'Organization',
  'WebSite',
  'BreadcrumbList',
  'Article',
]) {
  assertIncludes(seoRoutesSource, marker, 'src/data/seoRoutes.ts');
}

for (const pathMarker of expectedPaths) {
  if (pathMarker === '/') continue;
  const segment = pathMarker.split('/')[1];
  if (!['projects', 'stone-library', 'products', 'articles', 'capabilities', 'our-story', 'contact'].includes(segment)) {
    fail(`Unexpected public SEO route segment: ${pathMarker}`);
  }
}

const appSource = readText('src/App.tsx');
assertIncludes(appSource, 'getSeoMetaForPathname', 'src/App.tsx');
assertIncludes(appSource, 'getStructuredDataForPathname', 'src/App.tsx');
assertIncludes(appSource, "upsertMeta('name', 'robots'", 'src/App.tsx');
assertIncludes(appSource, 'upsertJsonLd', 'src/App.tsx');
for (const oldGenericTitle of ['Stone Detail | Urblo', 'Product Detail | Urblo', 'Project Detail | Urblo', 'Article | Urblo']) {
  assertNotIncludes(appSource, oldGenericTitle, 'src/App.tsx');
}

const packageJson = readJson('package.json');
if (packageJson.scripts?.['agent:seo-readiness'] !== 'node scripts/check-seo-readiness.mjs') {
  fail('package.json is missing the agent:seo-readiness script.');
}

const redirects = readText('public/_redirects');
const expectedLegacyRedirects = [
  ['/contact-us', '/contact'],
  ['/contact-us/', '/contact'],
  ['/our-capacity', '/capabilities'],
  ['/our-capacity/', '/capabilities'],
  ['/product', '/products'],
  ['/product/', '/products'],
  ['/article', '/articles'],
  ['/article/', '/articles'],
  ['/article/discover-the-art-of-surface-finishes', '/articles/stone-transformed-8-ways-to-redefine-bluestones-look-feel'],
  ['/article/discover-the-art-of-surface-finishes/', '/articles/stone-transformed-8-ways-to-redefine-bluestones-look-feel'],
  ['/product/creama', '/stone-library'],
  ['/product/creama/', '/stone-library'],
  ['/product-category/limestone', '/stone-library'],
  ['/product-category/limestone/', '/stone-library'],
  ['/stone-product/bollard', '/capabilities'],
  ['/stone-product/bollard/', '/capabilities'],
  ['/stone-product/planter', '/capabilities'],
  ['/stone-product/planter/', '/capabilities'],
  ['/stone-product/engraved-stone-inlays', '/capabilities'],
  ['/stone-product/engraved-stone-inlays/', '/capabilities'],
  ['/projects/xavier-college/', '/projects/xavier-college'],
];

for (const [from, to] of expectedLegacyRedirects) {
  assertIncludes(redirects, `${from} ${to} 301`, 'public/_redirects');
}

for (const retiredPath of ['/wp-', '/wp/', '/wp-admin', '/wp-json', '/feed/', '/hello-world']) {
  assertNotIncludes(sitemap, retiredPath, 'sitemap.xml');
}

// Edge SEO (NOW-OPT-SEO-EDGE-HEAD-001): first-response head, real 404s, trailing-slash 301s
// and the generated sitemap. Behaviour is covered by tests/edge-seo.test.ts; these source
// assertions keep the wiring from silently regressing.
const middlewareSource = readText('functions/_middleware.js');
const edgeHandlerSource = readText('functions/_lib/edge-seo.js');
const edgeModelSource = readText('src/lib/edgeSeo.ts');
const routesJson = readJson('public/_routes.json');
assertIncludes(middlewareSource, 'createEdgeSeoHandler', 'functions/_middleware.js');
for (const marker of [
  "path === '/sitemap.xml'",
  'buildSitemapXml(dataset)',
  "'Content-Type': 'application/xml; charset=utf-8'",
  'status: 301',
  'resolution.status',
  'renderEdgeHeadHtml',
  'REMOVED_HEAD_SELECTORS',
  'SPA_ROOT_MARKER',
  'DATASET_FRESH_MS',
  "status=eq.published",
  'rpc/public_stone_catalogue',
  'rpc/get_archived_project_slugs',
]) {
  assertIncludes(edgeHandlerSource, marker, 'functions/_lib/edge-seo.js');
}
for (const marker of [
  'export function resolveEdgeSeoDocument',
  'export function buildSitemapXml',
  "status: 404, head: notFoundHead",
  'getStructuredDataForPathname',
  'buildPublicContentSeoMeta',
  'getStoneShareImageUrl',
]) {
  assertIncludes(edgeModelSource, marker, 'src/lib/edgeSeo.ts');
}
if (!Array.isArray(routesJson.include) || !routesJson.include.includes('/*')) {
  fail('public/_routes.json must route page navigations through the edge SEO middleware ("/*").');
}
for (const staticPrefix of ['/assets/*', '/fonts/*', '/media/*']) {
  if (!routesJson.exclude?.includes(staticPrefix)) {
    fail(`public/_routes.json must exclude ${staticPrefix} from Functions.`);
  }
}
assertIncludes(readText('vite.config.ts'), "fileName: 'seo-edge-config.json'", 'vite.config.ts');
assertIncludes(readText('src/components/PublicContentSeo.tsx'), 'buildPublicContentSeoMeta', 'src/components/PublicContentSeo.tsx');
assertIncludes(appSource, 'hasEdgeEntityHead(location.pathname)', 'src/App.tsx');
// Homepage title floor: a bare-brand CMS SEO title must not replace the descriptive title.
assertIncludes(seoRoutesSource, 'MIN_DESCRIPTIVE_HOMEPAGE_TITLE_LENGTH', 'src/data/seoRoutes.ts');
assertIncludes(seoRoutesSource, 'toDescriptiveHomepageTitle(defaults.homepageTitle)', 'src/data/seoRoutes.ts');
assertIncludes(seoRoutesSource, "title: 'Urblo | Natural Stone Streetscape Systems'", 'src/data/seoRoutes.ts');

note(`robots.txt points crawlers to ${SITE_URL}/sitemap.xml and excludes /admin and /api.`);
note('Edge middleware serves per-route head, 404 for unknown paths, trailing-slash 301s and the generated sitemap; public/sitemap.xml remains the static-registry baseline.');
note(`sitemap.xml contains ${sitemapUrls.length} approved public URLs.`);
note(`Route metadata is centralized in src/data/seoRoutes.ts and wired into src/App.tsx.`);
note(`public/_redirects contains ${expectedLegacyRedirects.length} GSC legacy/canonical cleanup rules.`);

if (failures.length) {
  console.error('SEO readiness failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('SEO readiness passed:');
for (const message of notes) {
  console.log(`- ${message}`);
}
