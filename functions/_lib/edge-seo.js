import {
  buildEdgeSeoDataset,
  buildSitemapXml,
  buildStaticEdgeSeoDataset,
  renderEdgeHeadHtml,
  resolveEdgeSeoDocument,
} from '../../src/lib/edgeSeo.ts';

/**
 * Edge SEO for public HTML navigations (Pages Function middleware).
 *
 * - Injects per-route title/description/canonical/Open Graph/Twitter/JSON-LD into the SPA
 *   shell from the static route registry plus Published CMS rows.
 * - Returns 404 (still the SPA shell, so the client not-found page renders) for unknown
 *   public paths, and 301s trailing-slash variants to the canonical form.
 * - Serves /sitemap.xml from the same dataset.
 *
 * Published rows are read with the public browser key only (RLS decides visibility; no
 * service-role key is read here). The key and URL come from the build-emitted asset that
 * the browser bundle was built with, so Preview, production and the isolated local stack
 * each read their own public target.
 */

export const EDGE_CONFIG_ASSET_PATH = '/seo-edge-config.json';
export const DATASET_FRESH_MS = 5 * 60 * 1000;
export const DATASET_STALE_MS = 24 * 60 * 60 * 1000;
export const DATASET_MISS_RECHECK_MS = 30 * 1000;
const SUPABASE_READ_TIMEOUT_MS = 3500;
const CACHE_KEY_PATH = '/__edge-seo-cache/v1';
const SPA_ROOT_MARKER = '<div id="root"></div>';

const REMOVED_HEAD_SELECTORS = [
  'title',
  'meta[name="description"]',
  'meta[name="robots"]',
  'link[rel="canonical"]',
  'meta[property^="og:"]',
  'meta[name^="twitter:"]',
  'script#urblo-structured-data',
  'meta[name="urblo:edge-seo"]',
];

const MEDIA_FIELDS = 'status,source_kind,source_url,bucket,object_path';
const READS = {
  settings:
    'site_settings?select=settings_key,status,company_name,footer_columns,seo&settings_key=eq.default&status=eq.published&limit=1',
  projects: `projects?select=slug,title,summary,lead,seo,updated_at,cover_media:media_assets!projects_cover_media_id_fkey(${MEDIA_FIELDS}),hero_media:media_assets!projects_hero_media_id_fkey(${MEDIA_FIELDS})&status=eq.published&order=sort_order.asc`,
  products: `products?select=slug,name,short_description,seo,updated_at,sort_order,product_models(sort_order,media_assets:media_assets!product_models_image_media_id_fkey(${MEDIA_FIELDS}))&status=eq.published&order=sort_order.asc`,
  articles: `articles?select=slug,title,excerpt,seo,updated_at,published_on,cover_media:media_assets!articles_cover_media_id_fkey(${MEDIA_FIELDS})&status=eq.published&order=published_on.desc`,
};

export function createEdgeSeoHandler(deps = {}) {
  const now = deps.now ?? (() => Date.now());
  const rewriteHtml = deps.rewriteHtml ?? rewriteHtmlWithHtmlRewriter;
  const cacheStore = deps.cacheStore === undefined ? defaultCacheStore() : deps.cacheStore;
  let configPromise = null;
  let memory = null;
  let inflight = null;

  async function readConfig(env, requestUrl) {
    if (!configPromise) {
      configPromise = loadPublicContentConfig(env, requestUrl).catch(() => null);
    }
    const config = await configPromise;
    if (!config) configPromise = null;
    return config;
  }

  async function refresh(config, origin) {
    if (!inflight) {
      inflight = (async () => {
        const raw = await readPublishedRows(config, deps.fetch ?? fetch);
        const allFailed = ['settings', 'projects', 'products', 'articles'].every((key) => raw[key] === null)
          && raw.stoneCatalogue === null;
        if (allFailed && memory?.configKey === config.key) return memory;
        const entry = { configKey: config.key, fetchedAt: now(), raw, dataset: buildEdgeSeoDataset(raw) };
        memory = entry;
        if (cacheStore && !allFailed) await cacheStore.put(cacheKey(origin, config), entry).catch(() => {});
        return entry;
      })().finally(() => {
        inflight = null;
      });
    }
    return inflight;
  }

  async function getDataset(context, config, origin, { maxAgeMs } = {}) {
    if (!config || config.staticOnly) {
      return { fetchedAt: now(), dataset: buildStaticEdgeSeoDataset({ complete: Boolean(config?.staticOnly) }) };
    }
    if (!memory || memory.configKey !== config.key) {
      const cached = cacheStore ? await cacheStore.get(cacheKey(origin, config)).catch(() => null) : null;
      if (cached && cached.configKey === config.key && now() - cached.fetchedAt < DATASET_STALE_MS) {
        memory = { ...cached, dataset: buildEdgeSeoDataset(cached.raw) };
      }
    }
    if (memory && memory.configKey === config.key) {
      const age = now() - memory.fetchedAt;
      if (maxAgeMs !== undefined && age > maxAgeMs) return refresh(config, origin);
      if (age < DATASET_FRESH_MS) return memory;
      if (age < DATASET_STALE_MS) {
        context.waitUntil?.(refresh(config, origin).catch(() => {}));
        return memory;
      }
    }
    return refresh(config, origin);
  }

  return async function handleEdgeSeoRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api' || path.startsWith('/api/') || path.startsWith('/image/')) return context.next();
    if (request.method !== 'GET' && request.method !== 'HEAD') return context.next();

    if (path === EDGE_CONFIG_ASSET_PATH) {
      return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
    }

    if (path === '/sitemap.xml') {
      const config = await readConfig(env, url);
      const { dataset } = await getDataset(context, config, url.origin).catch(() => ({ dataset: buildStaticEdgeSeoDataset() }));
      return new Response(request.method === 'HEAD' ? null : buildSitemapXml(dataset), {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // Let static assets and the _redirects rules (legacy 301s) answer first. HEAD reads the
    // upstream with GET so HEAD and GET always share status and headers.
    const isHead = request.method === 'HEAD';
    const upstream = isHead ? new Request(request, { method: 'GET' }) : request;
    const upstreamResponse = await context.next(withoutConditionalHeaders(upstream));
    const response = isHead ? withoutBody(upstreamResponse) : upstreamResponse;
    if (response.status >= 300 && response.status < 400) return response;

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (response.status !== 200 || !contentType.includes('text/html')) return response;
    // Real HTML files (article body fragments, also served at their pretty URL) are content,
    // not routes: only the SPA shell is rewritten.
    if (/\.html?$/i.test(path)) return response;
    const html = await upstreamResponse.text();
    const shell = () => new Response(isHead ? null : html, upstreamResponse);
    if (!html.includes(SPA_ROOT_MARKER)) return shell();

    if (path.length > 1 && path.endsWith('/')) {
      const canonicalPath = `/${path.replace(/^\/+/, '').replace(/\/+$/, '')}`;
      return new Response(null, {
        status: 301,
        headers: { Location: `${url.origin}${canonicalPath}${url.search}`, 'Cache-Control': 'public, max-age=3600' },
      });
    }

    let resolution;
    try {
      const config = await readConfig(env, url);
      let entry = await getDataset(context, config, url.origin);
      resolution = resolveEdgeSeoDocument(path, entry.dataset);
      // A just-published record may be newer than the cached dataset: recheck once before a 404.
      if (config && resolution.kind === 'document' && resolution.status === 404 && isDetailPath(path)) {
        entry = await getDataset(context, config, url.origin, { maxAgeMs: DATASET_MISS_RECHECK_MS });
        resolution = resolveEdgeSeoDocument(path, entry.dataset);
      }
    } catch (error) {
      console.error('Edge SEO resolution failed; serving the unchanged shell.', error);
      return shell();
    }
    if (resolution.kind === 'passthrough') return shell();

    const headers = new Headers(upstreamResponse.headers);
    headers.delete('content-length');
    headers.delete('etag');
    headers.delete('last-modified');
    headers.set('X-Urblo-Edge-Seo', resolution.head.source);
    if (isHead) return new Response(null, { status: resolution.status, headers });
    const body = await rewriteHtml(
      new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
      renderEdgeHeadHtml(resolution.head),
      REMOVED_HEAD_SELECTORS,
    );
    return new Response(body, { status: resolution.status, headers });
  };
}

// Status and headers of a GET upstream response, without its body (HEAD answers).
function withoutBody(response) {
  return new Response(null, { status: response.status, statusText: response.statusText, headers: response.headers });
}

function isDetailPath(path) {
  return /^\/(projects|stone-library|products|articles)\/[^/]+$/.test(path);
}

function withoutConditionalHeaders(request) {
  if (!request.headers.has('if-none-match') && !request.headers.has('if-modified-since')) return request;
  const headers = new Headers(request.headers);
  headers.delete('if-none-match');
  headers.delete('if-modified-since');
  return new Request(request, { headers });
}

/* global HTMLRewriter */
function rewriteHtmlWithHtmlRewriter(response, headHtml, removedSelectors) {
  let rewriter = new HTMLRewriter();
  for (const selector of removedSelectors) {
    rewriter = rewriter.on(selector, { element: (element) => element.remove() });
  }
  rewriter = rewriter.on('head', { element: (element) => element.append(`    ${headHtml}\n  `, { html: true }) });
  return rewriter.transform(response).body;
}

export async function loadPublicContentConfig(env, requestUrl) {
  let emitted = null;
  if (env?.ASSETS?.fetch) {
    const response = await env.ASSETS.fetch(new Request(new URL(EDGE_CONFIG_ASSET_PATH, requestUrl.origin)));
    if (response.ok && (response.headers.get('content-type') || '').includes('json')) {
      emitted = await response.json().catch(() => null);
    } else {
      await response.body?.cancel?.();
    }
  }
  // The build had no public key: the browser renders static content only, and so does the edge.
  if (emitted && emitted.publicKey === null) return { staticOnly: true, key: 'static' };
  const supabaseUrl = emitted?.supabaseUrl || env?.SUPABASE_URL || '';
  const publicKey =
    emitted?.publicKey ||
    (emitted ? '' : env?.SUPABASE_PUBLISHABLE_KEY || env?.VITE_SUPABASE_PUBLISHABLE_KEY || env?.VITE_SUPABASE_ANON_KEY || '');
  if (!supabaseUrl || !publicKey || !isBrowserSafeKey(publicKey)) return null;
  const normalizedUrl = supabaseUrl.replace(/\/+$/, '');
  return { supabaseUrl: normalizedUrl, publicKey, key: normalizedUrl };
}

/** Refuses anything that is not a browser-safe key (secret or service-role keys never reach this reader). */
export function isBrowserSafeKey(key) {
  if (typeof key !== 'string' || !key) return false;
  if (key.startsWith('sb_secret_')) return false;
  if (key.startsWith('sb_publishable_')) return true;
  const parts = key.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload?.role === 'anon';
  } catch {
    return false;
  }
}

export async function readPublishedRows(config, fetchImpl) {
  const headers = {
    apikey: config.publicKey,
    Authorization: `Bearer ${config.publicKey}`,
    Accept: 'application/json',
  };
  const rest = `${config.supabaseUrl}/rest/v1`;
  const read = async (path, init = {}) => {
    try {
      const response = await fetchImpl(`${rest}/${path}`, {
        ...init,
        headers: { ...headers, ...(init.headers || {}) },
        signal: AbortSignal.timeout(SUPABASE_READ_TIMEOUT_MS),
      });
      if (!response.ok) {
        await response.body?.cancel?.();
        return null;
      }
      return await response.json();
    } catch {
      return null;
    }
  };
  const [settings, projects, archivedProjectSlugs, stoneCatalogue, products, articles] = await Promise.all([
    read(READS.settings),
    read(READS.projects),
    read('rpc/get_archived_project_slugs'),
    read('rpc/public_stone_catalogue', {
      method: 'POST',
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
    }),
    read(READS.products),
    read(READS.articles),
  ]);
  return {
    supabaseUrl: config.supabaseUrl,
    settings: Array.isArray(settings) ? settings[0] ?? null : null,
    projects: Array.isArray(projects) ? projects : null,
    archivedProjectSlugs: Array.isArray(archivedProjectSlugs) ? archivedProjectSlugs : null,
    stoneCatalogue: stoneCatalogue ?? null,
    products: Array.isArray(products) ? products : null,
    articles: Array.isArray(articles) ? articles : null,
  };
}

function cacheKey(origin, config) {
  return `${origin}${CACHE_KEY_PATH}?target=${encodeURIComponent(config.key)}`;
}

function defaultCacheStore() {
  const cache = globalThis.caches?.default;
  if (!cache) return null;
  return {
    async get(key) {
      const hit = await cache.match(new Request(key));
      if (!hit) return null;
      const stored = await hit.json();
      return stored && typeof stored.fetchedAt === 'number' && stored.raw ? stored : null;
    },
    async put(key, entry) {
      const body = JSON.stringify({ configKey: entry.configKey, fetchedAt: entry.fetchedAt, raw: entry.raw });
      await cache.put(
        new Request(key),
        new Response(body, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=${Math.floor(DATASET_STALE_MS / 1000)}`,
          },
        }),
      );
    },
  };
}
