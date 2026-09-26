/**
 * Pure edge SEO model shared by the Pages Function middleware (functions/_middleware.js)
 * and its vitest suite. It merges the static route registry with Published CMS rows read
 * through the public (RLS-bound) Supabase key, decides the HTTP status for a public
 * path, renders the head tags for the first HTML response, and builds the sitemap.
 *
 * Nothing here performs I/O; the Function supplies raw rows and caches the dataset.
 */
import articleIndexJson from '../../public/articles/index.json';
import stoneLibraryJson from '../../data/clean/stone_library.json';
import { products as staticProducts } from '../data/productData';
import { projects as staticProjects } from '../data/projectData';
import {
  DEFAULT_SHARE_IMAGE,
  SEO_LAST_MODIFIED,
  SEO_ROUTES,
  SITE_URL,
  getNotFoundSeoMeta,
  getSeoMetaForPathname,
  getSeoRouteForPathname,
  getStructuredDataForPathname,
  normalizePath,
  type SeoChangeFrequency,
} from '../data/seoRoutes';
import { stoneDraftToDetail, type StoneCatalogue, type StoneMedia } from '../features/stone-library/stoneDraft';
import { defaultCompanyLocations, readCompanyLocations, type CompanyLocations } from './companyLocations';
import {
  EDGE_SEO_MARKER_NAME,
  buildPublicContentSeoMeta,
  getImageMimeType,
  type PublicContentSeoInput,
} from './publicContentSeoMeta';
import { parsePublicEntitySeo } from './publicEntitySeo';
import { resolvePublicMediaUrl, type PublicMediaLocation } from './publicMediaUrl';
import {
  publicSiteSettingsFieldLimits,
  toBoundedPublicSiteSettingsText,
  toPublicSiteSettingsShareImage,
} from './siteSettingsPublicContract';
import { getStoneShareImageUrl } from './stoneImageDelivery';

export type EdgeCollectionKey = 'projects' | 'stone-library' | 'products' | 'articles';

const COLLECTION_KEYS: readonly EdgeCollectionKey[] = ['projects', 'stone-library', 'products', 'articles'];

const COLLECTION_SITEMAP_DEFAULTS: Record<EdgeCollectionKey, { changeFrequency: SeoChangeFrequency; priority: number }> = {
  projects: { changeFrequency: 'monthly', priority: 0.75 },
  'stone-library': { changeFrequency: 'monthly', priority: 0.76 },
  products: { changeFrequency: 'monthly', priority: 0.72 },
  articles: { changeFrequency: 'yearly', priority: 0.62 },
};

// Stone detail lookups are exact (StoneLibraryService compares slugs verbatim); the other
// detail services compare lower-cased canonical keys.
const CASE_SENSITIVE_COLLECTIONS = new Set<EdgeCollectionKey>(['stone-library']);

type MediaRelation = PublicMediaLocation | PublicMediaLocation[] | null | undefined;

export interface EdgeSiteSettingsRow {
  settings_key?: string | null;
  status?: string | null;
  company_name?: unknown;
  footer_columns?: unknown;
  seo?: unknown;
}

export interface EdgeProjectRow {
  slug: string;
  title: string;
  summary?: string | null;
  lead?: string | null;
  seo?: unknown;
  updated_at?: string | null;
  cover_media?: MediaRelation;
  hero_media?: MediaRelation;
}

export interface EdgeProductRow {
  slug: string;
  name: string;
  short_description?: string | null;
  seo?: unknown;
  updated_at?: string | null;
  product_models?: { sort_order?: number | null; media_assets?: MediaRelation }[] | null;
}

export interface EdgeArticleRow {
  slug: string;
  title: string;
  excerpt?: string | null;
  seo?: unknown;
  updated_at?: string | null;
  published_on?: string | null;
  cover_media?: MediaRelation;
}

/** Raw public reads. `null` means the read failed or was unavailable. */
export interface EdgeSeoRawData {
  supabaseUrl: string;
  settings: EdgeSiteSettingsRow | null;
  projects: EdgeProjectRow[] | null;
  archivedProjectSlugs: unknown[] | null;
  stoneCatalogue: unknown;
  products: EdgeProductRow[] | null;
  articles: EdgeArticleRow[] | null;
}

export interface EdgeSeoSettings {
  companyName: string;
  locations: CompanyLocations;
  homepageTitle: string | null;
  homepageDescription: string | null;
  defaultShareImage: string | null;
}

export interface EdgeSeoEntity {
  collection: EdgeCollectionKey;
  path: string;
  slug: string;
  aliases: string[];
  source: 'static' | 'cms';
  lastModified: string;
  cms?: Omit<PublicContentSeoInput, 'companyName' | 'locations' | 'defaultShareImage'>;
}

export interface EdgeSeoCollection {
  /** False when the CMS read failed: unknown slugs are then not asserted to be missing. */
  complete: boolean;
  entities: EdgeSeoEntity[];
  lookup: Map<string, EdgeSeoEntity>;
}

export interface EdgeSeoDataset {
  settings: EdgeSeoSettings;
  collections: Record<EdgeCollectionKey, EdgeSeoCollection>;
}

export interface EdgeHeadDocument {
  path: string;
  source: 'static' | 'cms' | 'not-found';
  title: string;
  description: string;
  robots: string;
  canonicalUrl: string;
  siteName: string;
  ogType: 'website' | 'article';
  image: string;
  imageType: string;
  includeImageSize: boolean;
  structuredData: Record<string, unknown>[];
}

export type EdgeSeoResolution =
  | { kind: 'passthrough' }
  | { kind: 'document'; status: 200 | 404; head: EdgeHeadDocument };

type ArticleIndexEntry = {
  slug: string;
  sourceSlug?: string;
  legacySlugs?: string[];
};

const staticArticles = articleIndexJson as ArticleIndexEntry[];
const staticStoneIds = (stoneLibraryJson as { stones: { stoneGroupId: string }[] }).stones.map(
  (stone) => stone.stoneGroupId,
);

export const staticEdgeSeoSettings: EdgeSeoSettings = {
  companyName: 'Urblo',
  locations: defaultCompanyLocations,
  homepageTitle: null,
  homepageDescription: null,
  defaultShareImage: null,
};

/**
 * Dataset without CMS rows. `complete` is true only when the build has no public Supabase
 * key (the browser then renders static content only, so unknown slugs are truly missing);
 * when the CMS target is merely unreachable, unknown detail slugs are not asserted missing.
 */
export function buildStaticEdgeSeoDataset({ complete = false }: { complete?: boolean } = {}): EdgeSeoDataset {
  const dataset = buildEdgeSeoDataset({
    supabaseUrl: '',
    settings: null,
    projects: null,
    archivedProjectSlugs: null,
    stoneCatalogue: null,
    products: null,
    articles: null,
  });
  if (complete) {
    for (const key of COLLECTION_KEYS) dataset.collections[key].complete = true;
  }
  return dataset;
}

export function buildEdgeSeoDataset(raw: EdgeSeoRawData): EdgeSeoDataset {
  const storage = createPublicStorageAdapter(raw.supabaseUrl);
  return {
    settings: parseSettings(raw.settings),
    collections: {
      projects: buildProjects(raw, storage),
      'stone-library': buildStones(raw),
      products: buildProducts(raw, storage),
      articles: buildArticles(raw, storage),
    },
  };
}

/**
 * Decides status and head for a navigational GET of `pathname`. Admin shells and paths
 * whose existence cannot be decided (a CMS read failed) are passed through unchanged.
 */
export function resolveEdgeSeoDocument(pathname: string, dataset: EdgeSeoDataset): EdgeSeoResolution {
  const path = normalizePath(pathname);
  if (path === '/admin' || path.startsWith('/admin/')) return { kind: 'passthrough' };

  const segments = path.split('/').filter(Boolean);
  const settings = dataset.settings;

  if (segments.length <= 1 && getSeoRouteForPathname(path)) {
    return { kind: 'document', status: 200, head: staticHead(path, settings) };
  }

  if (segments.length === 2 && isCollectionKey(segments[0])) {
    const collection = dataset.collections[segments[0]];
    const entity = collection.lookup.get(lookupKey(segments[0], safeDecode(segments[1])));
    if (entity?.source === 'cms' && entity.cms) {
      return { kind: 'document', status: 200, head: cmsHead(entity, settings) };
    }
    if (entity) {
      return { kind: 'document', status: 200, head: staticHead(entity.path, settings) };
    }
    if (!collection.complete) return { kind: 'passthrough' };
  }

  return { kind: 'document', status: 404, head: notFoundHead(path, settings) };
}

/** Head tags appended to <head> after the shell's generic tags are removed. */
export function renderEdgeHeadHtml(head: EdgeHeadDocument): string {
  const tags = [
    `<title>${escapeHtml(head.title)}</title>`,
    meta('name', 'description', head.description),
    meta('name', 'robots', head.robots),
    `<link rel="canonical" href="${escapeHtml(head.canonicalUrl)}" />`,
    meta('property', 'og:site_name', head.siteName),
    meta('property', 'og:type', head.ogType),
    meta('property', 'og:title', head.title),
    meta('property', 'og:description', head.description),
    meta('property', 'og:url', head.canonicalUrl),
    meta('property', 'og:image', head.image),
    meta('property', 'og:image:type', head.imageType),
    ...(head.includeImageSize
      ? [meta('property', 'og:image:width', '1200'), meta('property', 'og:image:height', '630')]
      : []),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', head.title),
    meta('name', 'twitter:description', head.description),
    meta('name', 'twitter:image', head.image),
  ];
  if (head.structuredData.length) {
    tags.push(
      `<script type="application/ld+json" id="urblo-structured-data" data-owner="edge">${serializeJsonForHtml(head.structuredData)}</script>`,
    );
  }
  tags.push(
    `<meta name="${EDGE_SEO_MARKER_NAME}" content="${escapeHtml(head.path)}" data-source="${head.source}" />`,
  );
  return tags.join('\n    ');
}

export interface SitemapEntry {
  loc: string;
  lastModified: string;
  changeFrequency: SeoChangeFrequency;
  priority: number;
}

export function collectSitemapEntries(dataset: EdgeSeoDataset): SitemapEntry[] {
  const entries = new Map<string, SitemapEntry>();
  for (const seoRoute of SEO_ROUTES) {
    if (seoRoute.path.split('/').filter(Boolean).length > 1 || !seoRoute.isIndexable) continue;
    entries.set(seoRoute.path, {
      loc: new URL(seoRoute.path, SITE_URL).toString(),
      lastModified: seoRoute.lastModified,
      changeFrequency: seoRoute.changeFrequency,
      priority: seoRoute.priority,
    });
  }
  for (const key of COLLECTION_KEYS) {
    for (const entity of dataset.collections[key].entities) {
      if (entries.has(entity.path)) continue;
      const registry = getSeoRouteForPathname(entity.path);
      const defaults = COLLECTION_SITEMAP_DEFAULTS[key];
      entries.set(entity.path, {
        loc: new URL(entity.path, SITE_URL).toString(),
        lastModified: entity.lastModified,
        changeFrequency: registry?.changeFrequency ?? defaults.changeFrequency,
        priority: registry?.priority ?? defaults.priority,
      });
    }
  }
  return [...entries.values()];
}

export function buildSitemapXml(dataset: EdgeSeoDataset): string {
  const urls = collectSitemapEntries(dataset).map(
    (entry) =>
      `  <url>\n    <loc>${escapeHtml(entry.loc)}</loc>\n    <lastmod>${entry.lastModified}</lastmod>\n    <changefreq>${entry.changeFrequency}</changefreq>\n    <priority>${entry.priority === 1 ? '1.0' : String(entry.priority)}</priority>\n  </url>`,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

function staticHead(path: string, settings: EdgeSeoSettings): EdgeHeadDocument {
  const meta = getSeoMetaForPathname(path, {
    homepageTitle: settings.homepageTitle,
    homepageDescription: settings.homepageDescription,
    defaultShareImage: settings.defaultShareImage,
  });
  return {
    path,
    source: 'static',
    title: meta.title,
    description: meta.description,
    robots: meta.robots,
    canonicalUrl: meta.canonicalUrl,
    siteName: settings.companyName,
    ogType: meta.ogType,
    image: meta.image,
    imageType: getImageMimeType(meta.image),
    includeImageSize: true,
    structuredData: getStructuredDataForPathname(path, settings.locations),
  };
}

function notFoundHead(path: string, settings: EdgeSeoSettings): EdgeHeadDocument {
  const meta = getNotFoundSeoMeta(path, { defaultShareImage: settings.defaultShareImage });
  return {
    path,
    source: 'not-found',
    title: meta.title,
    description: meta.description,
    robots: meta.robots,
    canonicalUrl: meta.canonicalUrl,
    siteName: settings.companyName,
    ogType: meta.ogType,
    image: meta.image,
    imageType: getImageMimeType(meta.image),
    includeImageSize: true,
    structuredData: [],
  };
}

function cmsHead(entity: EdgeSeoEntity, settings: EdgeSeoSettings): EdgeHeadDocument {
  const meta = buildPublicContentSeoMeta({
    ...entity.cms!,
    companyName: settings.companyName,
    locations: settings.locations,
    defaultShareImage: settings.defaultShareImage,
  });
  return {
    path: entity.path,
    source: 'cms',
    title: meta.title,
    description: meta.description,
    robots: meta.robots,
    canonicalUrl: meta.canonicalUrl,
    siteName: settings.companyName,
    ogType: meta.ogType,
    image: meta.image,
    imageType: meta.imageType,
    includeImageSize: meta.image.includes('/storage/v1/render/image/') || meta.image === DEFAULT_SHARE_IMAGE,
    structuredData: meta.structuredData,
  };
}

function parseSettings(row: EdgeSiteSettingsRow | null): EdgeSeoSettings {
  if (!row || row.settings_key !== 'default' || row.status !== 'published') return staticEdgeSeoSettings;
  const seo = isRecord(row.seo) ? row.seo : {};
  return {
    companyName:
      toBoundedPublicSiteSettingsText(row.company_name, publicSiteSettingsFieldLimits.companyName) ||
      staticEdgeSeoSettings.companyName,
    locations: readCompanyLocations(row.footer_columns),
    homepageTitle: toBoundedPublicSiteSettingsText(seo.title, publicSiteSettingsFieldLimits.seoTitle),
    homepageDescription: toBoundedPublicSiteSettingsText(seo.description, publicSiteSettingsFieldLimits.seoDescription),
    defaultShareImage: toPublicSiteSettingsShareImage(seo.defaultShareImage),
  };
}

function buildProjects(raw: EdgeSeoRawData, storage: PublicStorageAdapter | null): EdgeSeoCollection {
  const archived = new Set(
    (raw.archivedProjectSlugs ?? [])
      .map((row) => (isRecord(row) && typeof row.slug === 'string' ? row.slug.trim().toLowerCase() : ''))
      .filter(Boolean),
  );
  const staticEntities = staticProjects
    .filter((project) => !archived.has(project.slug.toLowerCase()))
    .map((project) => staticEntity('projects', project.slug));
  const cmsEntities = (raw.projects ?? []).flatMap((row) => {
    if (!isPublicSlug(row.slug) || typeof row.title !== 'string') return [];
    const cover =
      resolveMedia(row.cover_media, storage) || '/media/launch/contact/project-contact.jpg';
    const hero = resolveMedia(row.hero_media, storage) || cover;
    return [
      cmsEntity('projects', row.slug, row.updated_at, {
        canonicalPath: `/projects/${row.slug}`,
        fallbackTitle: `${row.title} Stone Streetscape Project | Urblo`,
        fallbackDescription:
          row.summary ||
          row.lead ||
          `Review ${row.title}, an Urblo public realm stone project with project facts, material notes, and delivery proof.`,
        image: hero,
        seo: parsePublicEntitySeo(row.seo),
      }),
    ];
  });
  return overlayCollection('projects', staticEntities, cmsEntities, raw.projects !== null);
}

function buildStones(raw: EdgeSeoRawData): EdgeSeoCollection {
  const catalogue = parseStoneCatalogue(raw.stoneCatalogue, raw.supabaseUrl);
  if (!catalogue) {
    return overlayCollection(
      'stone-library',
      staticStoneIds.map((id) => staticEntity('stone-library', id)),
      [],
      false,
    );
  }
  const cmsEntities: EdgeSeoEntity[] = [];
  const liveSlugs = new Set<string>();
  for (const record of catalogue.stones) {
    const slug = record.draft?.stone?.slug;
    if (!isPublicSlug(slug)) continue;
    liveSlugs.add(slug);
    const detail = stoneDraftToDetail(record.draft, catalogue.finishes, record.media);
    // The public detail route renders "not found" for a record without an enabled variant.
    if (!detail) continue;
    const activeFinish =
      detail.finishes.find((finish) => finish.finishKey === detail.defaultFinishKey) || detail.finishes[0];
    cmsEntities.push(
      cmsEntity('stone-library', slug, null, {
        canonicalPath: `/stone-library/${slug}`,
        fallbackTitle: `${detail.name} ${detail.stoneType} | Urblo Stone Library`,
        fallbackDescription: `Review ${detail.name} in the Urblo Stone Library, including finish options, sourcing notes, and public realm application guidance.`,
        image: getStoneShareImageUrl(activeFinish?.imageUrl),
      }),
    );
  }
  const excluded = new Set([...catalogue.managedKeys, ...liveSlugs]);
  const staticEntities = staticStoneIds
    .filter((id) => !excluded.has(id))
    .map((id) => staticEntity('stone-library', id));
  return overlayCollection('stone-library', staticEntities, cmsEntities, true);
}

function buildProducts(raw: EdgeSeoRawData, storage: PublicStorageAdapter | null): EdgeSeoCollection {
  const staticEntities = staticProducts.map((product) =>
    staticEntity('products', product.slug, product.legacySlugs ?? []),
  );
  const cmsEntities = (raw.products ?? []).flatMap((row) => {
    if (!isPublicSlug(row.slug) || typeof row.name !== 'string') return [];
    const firstModel = (row.product_models ?? [])
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
    const image =
      (firstModel && resolveMedia(firstModel.media_assets, storage)) || '/products/primeBlock/core.png';
    return [
      cmsEntity('products', row.slug, row.updated_at, {
        canonicalPath: `/products/${row.slug}`,
        fallbackTitle: `${row.name} Stone Streetscape Product | Urblo`,
        fallbackDescription:
          row.short_description ||
          `Explore ${row.name}, an Urblo modular stone product system for streetscape and public realm projects.`,
        image,
        seo: parsePublicEntitySeo(row.seo),
      }),
    ];
  });
  return overlayCollection('products', staticEntities, cmsEntities, raw.products !== null);
}

function buildArticles(raw: EdgeSeoRawData, storage: PublicStorageAdapter | null): EdgeSeoCollection {
  const staticEntities = staticArticles.map((article) =>
    staticEntity('articles', article.slug, [
      ...(article.legacySlugs ?? []),
      ...(article.sourceSlug ? [article.sourceSlug] : []),
    ]),
  );
  const cmsEntities = (raw.articles ?? []).flatMap((row) => {
    if (!isPublicSlug(row.slug) || typeof row.title !== 'string') return [];
    return [
      cmsEntity('articles', row.slug, row.updated_at, {
        canonicalPath: `/articles/${row.slug}`,
        fallbackTitle: `${row.title} | Urblo`,
        fallbackDescription:
          row.excerpt ||
          `Read ${row.title}, an Urblo article on natural stone, public realm design, and streetscape delivery.`,
        image: resolveMedia(row.cover_media, storage),
        ogType: 'article',
        seo: parsePublicEntitySeo(row.seo),
      }),
    ];
  });
  return overlayCollection('articles', staticEntities, cmsEntities, raw.articles !== null);
}

function staticEntity(collection: EdgeCollectionKey, slug: string, aliases: string[] = []): EdgeSeoEntity {
  const path = `/${collection}/${slug}`;
  return {
    collection,
    path,
    slug,
    aliases,
    source: 'static',
    lastModified: getSeoRouteForPathname(path)?.lastModified ?? SEO_LAST_MODIFIED,
  };
}

function cmsEntity(
  collection: EdgeCollectionKey,
  slug: string,
  updatedAt: string | null | undefined,
  cms: NonNullable<EdgeSeoEntity['cms']>,
): EdgeSeoEntity {
  return {
    collection,
    path: `/${collection}/${slug}`,
    slug,
    aliases: [],
    source: 'cms',
    lastModified: toSitemapDate(updatedAt),
    cms,
  };
}

/**
 * Same order and precedence as publicContentOverlay: fallback order, Published record
 * replaces its fallback, unmatched Published records are appended. Fallback aliases
 * (legacy/source slugs) stay attached to the canonical record.
 */
function overlayCollection(
  collection: EdgeCollectionKey,
  staticEntities: EdgeSeoEntity[],
  cmsEntities: EdgeSeoEntity[],
  complete: boolean,
): EdgeSeoCollection {
  const cmsByKey = new Map(cmsEntities.map((entity) => [lookupKey(collection, entity.slug), entity]));
  const seen = new Set<string>();
  const entities: EdgeSeoEntity[] = [];
  for (const fallback of staticEntities) {
    const key = lookupKey(collection, fallback.slug);
    const published = cmsByKey.get(key);
    entities.push(published ? { ...published, aliases: [...published.aliases, ...fallback.aliases] } : fallback);
    seen.add(key);
  }
  for (const [key, entity] of cmsByKey) {
    if (!seen.has(key)) {
      entities.push(entity);
      seen.add(key);
    }
  }
  const lookup = new Map<string, EdgeSeoEntity>();
  for (const entity of entities) {
    for (const alias of entity.aliases) lookup.set(lookupKey(collection, alias), entity);
  }
  for (const entity of entities) lookup.set(lookupKey(collection, entity.slug), entity);
  return { complete, entities, lookup };
}

function parseStoneCatalogue(value: unknown, supabaseUrl: string): StoneCatalogue | null {
  if (!isRecord(value) || !Array.isArray(value.stones) || !Array.isArray(value.managedKeys) || !Array.isArray(value.finishes)) {
    return null;
  }
  const storage = createPublicStorageAdapter(supabaseUrl);
  const stones = (value.stones as unknown[]).flatMap((record) => {
    if (!isRecord(record) || !isRecord(record.draft) || !Array.isArray(record.media)) return [];
    const media: StoneMedia[] = (record.media as unknown[]).flatMap((entry) => {
      if (!isRecord(entry) || typeof entry.id !== 'number') return [];
      const bucket = typeof entry.bucket === 'string' ? entry.bucket : null;
      const url =
        resolvePublicMediaUrl(
          {
            status: typeof entry.status === 'string' ? entry.status : null,
            source_kind: bucket ? 'storage' : 'external',
            source_url: typeof entry.sourceUrl === 'string' ? entry.sourceUrl : null,
            bucket,
            object_path: typeof entry.objectPath === 'string' ? entry.objectPath : null,
          },
          storage,
        ) || null;
      return [
        {
          id: entry.id,
          status: String(entry.status ?? ''),
          url,
          alt: typeof entry.alt === 'string' ? entry.alt : '',
          name: typeof entry.name === 'string' ? entry.name : '',
        },
      ];
    });
    return [{ draft: record.draft as unknown as StoneCatalogue['stones'][number]['draft'], media }];
  });
  return {
    managedKeys: (value.managedKeys as unknown[]).filter((key): key is string => typeof key === 'string'),
    finishes: value.finishes as StoneCatalogue['finishes'],
    stones,
  };
}

type PublicStorageAdapter = Parameters<typeof resolvePublicMediaUrl>[1];

/** Mirrors supabase-js `storage.from(bucket).getPublicUrl(path)` without the client bundle. */
function createPublicStorageAdapter(supabaseUrl: string): PublicStorageAdapter {
  if (!supabaseUrl) return null;
  const base = supabaseUrl.replace(/\/+$/, '');
  return {
    storage: {
      from: (bucket: string) => ({
        getPublicUrl: (objectPath: string) => ({
          data: { publicUrl: encodeURI(`${base}/storage/v1/object/public/${bucket}/${objectPath.replace(/^\/+/, '')}`) },
        }),
      }),
    },
  } as unknown as PublicStorageAdapter;
}

function resolveMedia(relation: MediaRelation, storage: PublicStorageAdapter | null): string | undefined {
  const media = Array.isArray(relation) ? relation[0] ?? null : relation ?? null;
  return resolvePublicMediaUrl(media, storage ?? null);
}

function lookupKey(collection: EdgeCollectionKey, slug: string): string {
  const trimmed = slug.trim();
  return CASE_SENSITIVE_COLLECTIONS.has(collection) ? trimmed : trimmed.toLowerCase();
}

function isCollectionKey(value: string): value is EdgeCollectionKey {
  return (COLLECTION_KEYS as readonly string[]).includes(value);
}

function isPublicSlug(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]{0,199}$/.test(value);
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toSitemapDate(value: string | null | undefined): string {
  const match = typeof value === 'string' ? /^(\d{4}-\d{2}-\d{2})/.exec(value) : null;
  return match ? match[1] : SEO_LAST_MODIFIED;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function meta(attribute: 'name' | 'property', key: string, content: string) {
  return `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function serializeJsonForHtml(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
