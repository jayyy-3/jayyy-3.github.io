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

note(`robots.txt points crawlers to ${SITE_URL}/sitemap.xml and excludes /admin and /api.`);
note(`sitemap.xml contains ${sitemapUrls.length} approved public URLs.`);
note(`Route metadata is centralized in src/data/seoRoutes.ts and wired into src/App.tsx.`);

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
