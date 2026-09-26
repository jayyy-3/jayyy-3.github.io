import assert from 'node:assert/strict';
import { describe, test } from 'vitest';
import {
  buildEdgeSeoDataset,
  buildSitemapXml,
  buildStaticEdgeSeoDataset,
  collectSitemapEntries,
  renderEdgeHeadHtml,
  resolveEdgeSeoDocument,
  type EdgeSeoRawData,
} from '../src/lib/edgeSeo.ts';
import { getSeoMetaForPathname } from '../src/data/seoRoutes.ts';
import { buildPublicContentSeoMeta } from '../src/lib/publicContentSeoMeta.ts';
import { defaultCompanyLocations } from '../src/lib/companyLocations.ts';
import {
  createEdgeSeoHandler,
  isBrowserSafeKey,
  loadPublicContentConfig,
} from '../functions/_lib/edge-seo.js';

const SUPABASE_URL = 'https://example-project.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_test_only_key';
const media = (objectPath: string) => ({
  status: 'published',
  source_kind: 'storage',
  source_url: null,
  bucket: 'urblo-public-media',
  object_path: objectPath,
});

function rawFixture(overrides: Partial<EdgeSeoRawData> = {}): EdgeSeoRawData {
  return {
    supabaseUrl: SUPABASE_URL,
    settings: {
      settings_key: 'default',
      status: 'published',
      company_name: 'Urblo',
      footer_columns: null,
      seo: { title: 'Urblo', description: 'Design-led stone solutions for streetscapes and civil landscapes.' },
    },
    projects: [
      {
        slug: 'the-glen',
        title: 'The Glen',
        summary: 'Stone paving and seating for a suburban shopping centre forecourt.',
        seo: { title: 'The Glen public realm stone | Urblo' },
        updated_at: '2026-09-20T03:00:00Z',
        hero_media: media('projects/the-glen/hero.jpg'),
        cover_media: media('projects/the-glen/cover.jpg'),
      },
      {
        slug: 'xavier-college',
        title: 'Xavier College',
        summary: 'CMS summary for Xavier College.',
        updated_at: '2026-09-01T00:00:00Z',
        cover_media: null,
        hero_media: null,
      },
    ],
    archivedProjectSlugs: [{ slug: 'moon-gate-woolley-street' }],
    stoneCatalogue: {
      managedKeys: ['harcourt', 'ausred'],
      finishes: [{ id: 1, key: 'honed', name: 'Honed', sortOrder: 1 }],
      stones: [
        {
          draft: {
            schemaVersion: 1,
            stone: { slug: 'ausred', name: 'AusRed', type: 'Granite', availability: 'active' },
            variants: [
              {
                key: 'v1',
                id: 1,
                slug: 'ausred',
                label: '',
                type: 'none',
                enabled: true,
                finishes: [
                  {
                    definitionId: 1,
                    capability: 'yes',
                    behaviorNote: '',
                    sources: [],
                    internalNote: '',
                    images: [{ key: 'i1', id: 10, mediaAssetId: 100, role: 'primary' }],
                  },
                ],
              },
            ],
          },
          media: [
            { id: 100, status: 'published', sourceUrl: null, bucket: 'urblo-public-media', objectPath: 'stones/ausred/honed.jpeg', alt: 'AusRed honed', name: 'AusRed honed' },
          ],
        },
      ],
    },
    products: [],
    articles: [
      {
        slug: 'new-cms-article',
        title: 'A New CMS Article',
        excerpt: 'An article that only exists in the CMS.',
        updated_at: '2026-09-15T00:00:00Z',
        cover_media: media('articles/new/cover.webp'),
      },
    ],
    ...overrides,
  };
}

describe('edge SEO dataset and head resolution', () => {
  const dataset = buildEdgeSeoDataset(rawFixture());

  test('a CMS-only project gets its own title, description, self canonical and a sized share image', () => {
    const result = resolveEdgeSeoDocument('/projects/the-glen', dataset);
    assert.equal(result.kind, 'document');
    if (result.kind !== 'document') return;
    assert.equal(result.status, 200);
    assert.equal(result.head.source, 'cms');
    assert.equal(result.head.title, 'The Glen public realm stone | Urblo');
    assert.equal(result.head.description, 'Stone paving and seating for a suburban shopping centre forecourt.');
    assert.equal(result.head.canonicalUrl, 'https://urblo.com.au/projects/the-glen');
    assert.equal(
      result.head.image,
      `${SUPABASE_URL}/storage/v1/render/image/public/urblo-public-media/projects/the-glen/hero.jpg?width=1200&height=630&quality=82&format=origin&resize=cover`,
    );
    assert.equal(result.head.includeImageSize, true);
    assert.ok(result.head.structuredData.some((entry) => entry['@type'] === 'WebPage'));
  });

  test('the edge head for a CMS record equals what PublicContentSeo writes after hydration', () => {
    const result = resolveEdgeSeoDocument('/projects/the-glen', dataset);
    assert.equal(result.kind, 'document');
    if (result.kind !== 'document') return;
    const client = buildPublicContentSeoMeta({
      canonicalPath: '/projects/the-glen',
      fallbackTitle: 'The Glen Stone Streetscape Project | Urblo',
      fallbackDescription: 'Stone paving and seating for a suburban shopping centre forecourt.',
      image: `${SUPABASE_URL}/storage/v1/object/public/urblo-public-media/projects/the-glen/hero.jpg`,
      seo: { title: 'The Glen public realm stone | Urblo' },
      companyName: 'Urblo',
      locations: defaultCompanyLocations,
      defaultShareImage: null,
    });
    assert.equal(result.head.title, client.title);
    assert.equal(result.head.description, client.description);
    assert.equal(result.head.canonicalUrl, client.canonicalUrl);
    assert.equal(result.head.image, client.image);
    assert.deepEqual(result.head.structuredData, client.structuredData);
  });

  test('a Published CMS row overrides its static fallback and keeps its canonical slug', () => {
    const result = resolveEdgeSeoDocument('/projects/Xavier-College', dataset);
    assert.equal(result.kind, 'document');
    if (result.kind !== 'document') return;
    assert.equal(result.head.source, 'cms');
    assert.equal(result.head.canonicalUrl, 'https://urblo.com.au/projects/xavier-college');
    assert.equal(result.head.description, 'CMS summary for Xavier College.');
  });

  test('archived static projects, managed stones and unknown slugs return 404', () => {
    for (const path of ['/projects/moon-gate-woolley-street', '/stone-library/harcourt', '/projects/not-a-project', '/nope', '/wp-content/uploads/x.jpg']) {
      const result = resolveEdgeSeoDocument(path, dataset);
      assert.equal(result.kind, 'document', path);
      if (result.kind !== 'document') continue;
      assert.equal(result.status, 404, path);
      assert.equal(result.head.robots, 'noindex,follow', path);
      assert.equal(result.head.title, 'Page Not Found | Urblo', path);
    }
  });

  test('stone lookups are exact while other detail lookups are case-insensitive', () => {
    const stone = resolveEdgeSeoDocument('/stone-library/ausred', dataset);
    assert.equal(stone.kind === 'document' && stone.status, 200);
    if (stone.kind === 'document') {
      assert.equal(stone.head.title, 'AusRed Granite | Urblo Stone Library');
      assert.match(stone.head.image, /render\/image\/public\/urblo-public-media\/stones\/ausred\/honed\.jpeg\?width=1200&height=630/);
    }
    const upper = resolveEdgeSeoDocument('/stone-library/AusRed', dataset);
    assert.equal(upper.kind === 'document' && upper.status, 404);
    const staticStone = resolveEdgeSeoDocument('/stone-library/alpine-white', dataset);
    assert.equal(staticStone.kind === 'document' && staticStone.head.source, 'static');
  });

  test('static routes use the registry and legacy aliases resolve to the canonical record', () => {
    const product = resolveEdgeSeoDocument('/products/primeBlock', dataset);
    assert.equal(product.kind === 'document' && product.head.canonicalUrl, 'https://urblo.com.au/products/prime-block');
    const article = resolveEdgeSeoDocument('/articles/new-cms-article', dataset);
    assert.equal(article.kind === 'document' && article.head.ogType, 'article');
    const contact = resolveEdgeSeoDocument('/contact', dataset);
    assert.equal(contact.kind === 'document' && contact.head.title, 'Contact Urblo for Stone Streetscape Projects');
  });

  test('admin shells pass through and a failed CMS read never asserts a 404 for a detail slug', () => {
    assert.equal(resolveEdgeSeoDocument('/admin/leads', dataset).kind, 'passthrough');
    const degraded = buildEdgeSeoDataset(rawFixture({ projects: null }));
    assert.equal(resolveEdgeSeoDocument('/projects/the-glen', degraded).kind, 'passthrough');
    const staticRoute = resolveEdgeSeoDocument('/projects/xavier-college', degraded);
    assert.equal(staticRoute.kind === 'document' && staticRoute.status, 200);
    // Unknown non-detail paths are still 404 even when the CMS is unavailable.
    const unknown = resolveEdgeSeoDocument('/not-a-route', degraded);
    assert.equal(unknown.kind === 'document' && unknown.status, 404);
    // A build without a public key is static-only and therefore complete.
    const staticOnly = buildStaticEdgeSeoDataset({ complete: true });
    const missing = resolveEdgeSeoDocument('/projects/the-glen', staticOnly);
    assert.equal(missing.kind === 'document' && missing.status, 404);
  });

  test('the homepage keeps its descriptive title when the CMS SEO title is only the brand', () => {
    const home = resolveEdgeSeoDocument('/', dataset);
    assert.equal(home.kind === 'document' && home.head.title, 'Urblo | Natural Stone Streetscape Systems');
    assert.equal(
      getSeoMetaForPathname('/', { homepageTitle: 'Urblo' }).title,
      'Urblo | Natural Stone Streetscape Systems',
    );
    assert.equal(
      getSeoMetaForPathname('/', { homepageTitle: 'Urblo | Natural Stone for Public Realm Projects' }).title,
      'Urblo | Natural Stone for Public Realm Projects',
    );
    assert.equal(
      getSeoMetaForPathname('/', { homepageDescription: 'Too short.' }).description,
      getSeoMetaForPathname('/').description,
    );
  });

  test('rendered head escapes attribute values and cannot break out of the JSON-LD script', () => {
    const html = renderEdgeHeadHtml({
      path: '/projects/x',
      source: 'cms',
      title: 'A "quoted" <title>',
      description: "It's & more",
      robots: 'index,follow',
      canonicalUrl: 'https://urblo.com.au/projects/x',
      siteName: 'Urblo',
      ogType: 'website',
      image: 'https://urblo.com.au/og-default.png',
      imageType: 'image/png',
      includeImageSize: false,
      structuredData: [{ name: '</script><script>alert(1)</script>' }],
    });
    assert.ok(html.includes('<title>A &quot;quoted&quot; &lt;title&gt;</title>'));
    assert.ok(html.includes('content="It&#39;s &amp; more"'));
    assert.ok(!html.includes('</script><script>'));
    assert.ok(html.includes('\\u003c/script\\u003e'));
    assert.ok(!html.includes('og:image:width'));
    assert.ok(html.includes('<meta name="urblo:edge-seo" content="/projects/x" data-source="cms" />'));
  });
});

describe('sitemap builder', () => {
  test('includes static routes and every published record, excludes archived and managed records', () => {
    const dataset = buildEdgeSeoDataset(rawFixture());
    const xml = buildSitemapXml(dataset);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    assert.equal(new Set(locs).size, locs.length);
    for (const expected of [
      'https://urblo.com.au/',
      'https://urblo.com.au/projects/the-glen',
      'https://urblo.com.au/stone-library/ausred',
      'https://urblo.com.au/articles/new-cms-article',
      'https://urblo.com.au/products/prime-block',
    ]) {
      assert.ok(locs.includes(expected), expected);
    }
    for (const excluded of ['moon-gate-woolley-street', 'stone-library/harcourt', '/admin', '/api', 'primeBlock']) {
      assert.ok(!locs.some((loc) => loc.includes(excluded)), excluded);
    }
    const glen = collectSitemapEntries(dataset).find((entry) => entry.loc.endsWith('/projects/the-glen'));
    assert.deepEqual(glen, {
      loc: 'https://urblo.com.au/projects/the-glen',
      lastModified: '2026-09-20',
      changeFrequency: 'monthly',
      priority: 0.75,
    });
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
    assert.ok(xml.includes('<priority>1.0</priority>'));
  });

  test('the static-only sitemap matches the checked-in public/sitemap.xml URL set', async () => {
    const { readFileSync } = await import('node:fs');
    const checkedIn = [...readFileSync('public/sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const generated = collectSitemapEntries(buildStaticEdgeSeoDataset()).map((entry) => entry.loc);
    assert.deepEqual([...generated].sort(), [...checkedIn].sort());
  });
});

describe('edge SEO Pages middleware', () => {
  const shell =
    '<!doctype html><html><head><title>Urblo | Natural Stone Streetscape Systems</title><link rel="canonical" href="https://urblo.com.au/" /></head><body><div id="root"></div></body></html>';

  function fakeRewrite(response: Response, headHtml: string) {
    return response.text().then((html) =>
      html
        .replace(/<title>[^<]*<\/title>/, '')
        .replace(/<link rel="canonical"[^>]*>/, '')
        .replace('</head>', `${headHtml}</head>`),
    );
  }

  function createContext(path: string, options: { method?: string; env?: Record<string, unknown>; nextResponse?: Response } = {}) {
    const request = new Request(`https://preview.example.pages.dev${path}`, { method: options.method ?? 'GET' });
    const seen: { nextCalls: number; waitUntil: Promise<unknown>[] } = { nextCalls: 0, waitUntil: [] };
    return {
      seen,
      context: {
        request,
        env: {
          ASSETS: {
            fetch: async () =>
              new Response(JSON.stringify({ supabaseUrl: SUPABASE_URL, publicKey: PUBLISHABLE_KEY }), {
                headers: { 'Content-Type': 'application/json' },
              }),
          },
          SUPABASE_SERVICE_ROLE_KEY: 'service-role-secret-must-not-be-used',
          ...options.env,
        },
        next: async () => {
          seen.nextCalls += 1;
          return (
            options.nextResponse?.clone() ??
            new Response(shell, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ETag: '"shell"' } })
          );
        },
        waitUntil: (promise: Promise<unknown>) => seen.waitUntil.push(promise),
      },
    };
  }

  function fakeSupabase() {
    const requests: { url: string; headers: Record<string, string> }[] = [];
    const raw = rawFixture();
    const fetchImpl = async (url: string, init: RequestInit & { headers: Record<string, string> }) => {
      requests.push({ url, headers: init.headers });
      const path = new URL(url).pathname.replace('/rest/v1/', '');
      const body =
        path === 'site_settings' ? [raw.settings]
        : path === 'projects' ? raw.projects
        : path === 'rpc/get_archived_project_slugs' ? raw.archivedProjectSlugs
        : path === 'rpc/public_stone_catalogue' ? raw.stoneCatalogue
        : path === 'products' ? raw.products
        : path === 'articles' ? raw.articles
        : null;
      return new Response(JSON.stringify(body), { status: body === null ? 404 : 200 });
    };
    return { requests, fetchImpl };
  }

  test('serves CMS heads, real 404s and the sitemap with the public key only', async () => {
    const supabase = fakeSupabase();
    const handler = createEdgeSeoHandler({ fetch: supabase.fetchImpl, rewriteHtml: fakeRewrite, cacheStore: null, now: () => 1_000_000 });

    const project = createContext('/projects/the-glen');
    const projectResponse = await handler(project.context);
    assert.equal(projectResponse.status, 200);
    const html = await projectResponse.text();
    assert.ok(html.includes('<title>The Glen public realm stone | Urblo</title>'));
    assert.ok(html.includes('<link rel="canonical" href="https://urblo.com.au/projects/the-glen" />'));
    assert.equal((html.match(/<title>/g) || []).length, 1);
    assert.equal(projectResponse.headers.get('etag'), null);
    assert.equal(projectResponse.headers.get('x-urblo-edge-seo'), 'cms');

    const missing = createContext('/projects/not-a-project');
    const missingResponse = await handler(missing.context);
    assert.equal(missingResponse.status, 404);
    assert.ok((await missingResponse.text()).includes('<div id="root"></div>'));

    const sitemap = await handler(createContext('/sitemap.xml').context);
    assert.equal(sitemap.status, 200);
    assert.match(sitemap.headers.get('content-type') || '', /application\/xml/);
    assert.ok((await sitemap.text()).includes('<loc>https://urblo.com.au/projects/the-glen</loc>'));

    assert.ok(supabase.requests.length > 0);
    for (const request of supabase.requests) {
      assert.equal(request.headers.apikey, PUBLISHABLE_KEY);
      assert.equal(request.headers.Authorization, `Bearer ${PUBLISHABLE_KEY}`);
      assert.ok(!JSON.stringify(request).includes('service-role-secret'));
      assert.ok(request.url.startsWith(`${SUPABASE_URL}/rest/v1/`));
    }
    // One dataset read serves all three requests inside the freshness window.
    assert.equal(supabase.requests.length, 6);
  });

  test('HEAD mirrors GET status, trailing slashes 301 on the same origin, redirects and APIs pass through', async () => {
    const handler = createEdgeSeoHandler({ fetch: fakeSupabase().fetchImpl, rewriteHtml: fakeRewrite, cacheStore: null });

    const head = await handler(createContext('/not-a-route', { method: 'HEAD' }).context);
    assert.equal(head.status, 404);
    assert.equal(head.body, null);

    const slash = await handler(createContext('/projects/?view=list').context);
    assert.equal(slash.status, 301);
    assert.equal(slash.headers.get('location'), 'https://preview.example.pages.dev/projects?view=list');

    const protocolRelative = await handler(createContext('//evil.example/').context);
    assert.equal(protocolRelative.status, 301);
    assert.equal(protocolRelative.headers.get('location'), 'https://preview.example.pages.dev/evil.example');

    const legacy = createContext('/contact-us', {
      nextResponse: new Response(null, { status: 301, headers: { Location: '/contact' } }),
    });
    const legacyResponse = await handler(legacy.context);
    assert.equal(legacyResponse.status, 301);
    assert.equal(legacyResponse.headers.get('location'), '/contact');

    const api = createContext('/api/enquiries', {
      nextResponse: new Response('{"error":"method_not_allowed"}', { status: 405 }),
    });
    const apiResponse = await handler(api.context);
    assert.equal(apiResponse.status, 405);

    const fragment = createContext('/articles/Some-Article/content', {
      nextResponse: new Response('<table><tr><td>Body</td></tr></table>', { headers: { 'Content-Type': 'text/html' } }),
    });
    const fragmentResponse = await handler(fragment.context);
    assert.equal(fragmentResponse.status, 200);
    assert.equal(await fragmentResponse.text(), '<table><tr><td>Body</td></tr></table>');

    const configAsset = await handler(createContext('/seo-edge-config.json').context);
    assert.equal(configAsset.status, 404);
  });

  test('only browser-safe keys are accepted for public reads', async () => {
    const jwt = (role: string) => `x.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.y`;
    assert.equal(isBrowserSafeKey('sb_publishable_abc'), true);
    assert.equal(isBrowserSafeKey(jwt('anon')), true);
    assert.equal(isBrowserSafeKey('sb_secret_abc'), false);
    assert.equal(isBrowserSafeKey(jwt('service_role')), false);
    assert.equal(isBrowserSafeKey(''), false);

    const requestUrl = new URL('https://preview.example.pages.dev/');
    const noAsset = { ASSETS: { fetch: async () => new Response('missing', { status: 404 }) } };
    assert.equal(await loadPublicContentConfig({ ...noAsset, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY: jwt('service_role') }, requestUrl), null);
    assert.equal(await loadPublicContentConfig({ ...noAsset, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: 'secret' }, requestUrl), null);
    const staticOnly = await loadPublicContentConfig(
      { ASSETS: { fetch: async () => new Response('{"supabaseUrl":"https://x.supabase.co","publicKey":null}', { headers: { 'Content-Type': 'application/json' } }) } },
      requestUrl,
    );
    assert.deepEqual(staticOnly, { staticOnly: true, key: 'static' });
  });

  test('a stale dataset is served while it refreshes in the background, and a miss rechecks once', async () => {
    const supabase = fakeSupabase();
    let clock = 0;
    const handler = createEdgeSeoHandler({ fetch: supabase.fetchImpl, rewriteHtml: fakeRewrite, cacheStore: null, now: () => clock });
    await handler(createContext('/').context);
    assert.equal(supabase.requests.length, 6);

    clock = 6 * 60 * 1000;
    const stale = createContext('/projects/the-glen');
    const staleResponse = await handler(stale.context);
    assert.equal(staleResponse.status, 200);
    assert.equal(stale.seen.waitUntil.length, 1);
    await Promise.all(stale.seen.waitUntil);
    assert.equal(supabase.requests.length, 12);

    clock += 31 * 1000;
    const miss = await handler(createContext('/projects/brand-new-project').context);
    assert.equal(miss.status, 404);
    assert.equal(supabase.requests.length, 18);
  });
});
