import { companyLocationSchema, type CompanyLocations } from './companyLocations';
import type { PublicEntitySeo } from './publicEntitySeo';
import { getStoneShareImageUrl } from './stoneImageDelivery';

// Kept local (not imported from src/data/seoRoutes) so this helper stays small in the
// browser entry bundle; the values must match seoRoutes.ts.
const SITE_URL = 'https://urblo.com.au';
const DEFAULT_SHARE_IMAGE = `${SITE_URL}/og-default.png`;

/** Marker the edge head renderer writes so the client can tell which path it described. */
export const EDGE_SEO_MARKER_NAME = 'urblo:edge-seo';

export interface PublicContentSeoInput {
  canonicalPath: string;
  fallbackTitle: string;
  fallbackDescription: string;
  image?: string;
  ogType?: 'website' | 'article';
  seo?: PublicEntitySeo;
  companyName: string;
  locations: CompanyLocations;
  defaultShareImage?: string | null;
}

export interface PublicContentSeoMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  image: string;
  imageType: string;
  ogType: 'website' | 'article';
  robots: string;
  structuredData: Record<string, unknown>[];
}

/**
 * Metadata for a Published CMS detail record. The edge head renderer
 * (functions/_lib/edge-seo.js) and the client PublicContentSeo component both call
 * this, so the first-response head and the hydrated head carry identical values.
 */
export function buildPublicContentSeoMeta(input: PublicContentSeoInput): PublicContentSeoMeta {
  const ogType = input.ogType ?? 'website';
  const title =
    normalizeText(input.seo?.title, 180) || normalizeText(input.fallbackTitle, 180) || 'Urblo';
  const description =
    normalizeText(input.seo?.description, 158) ||
    normalizeText(input.fallbackDescription, 158) ||
    'Urblo natural stone systems for streetscapes and civil landscapes.';
  const canonicalUrl = new URL(input.canonicalPath, SITE_URL).toString();
  // Supabase Storage originals are replaced by a 1200 x 630 render variant; other
  // sources (static site files, external URLs) are kept.
  const image = toSafeAbsoluteHttpUrl(
    getStoneShareImageUrl(input.image || input.defaultShareImage || DEFAULT_SHARE_IMAGE) ||
      DEFAULT_SHARE_IMAGE,
  );

  return {
    title,
    description,
    canonicalUrl,
    image,
    imageType: getImageMimeType(image),
    ogType,
    robots: 'index,follow',
    structuredData: buildPublicContentStructuredData({
      canonicalUrl,
      companyName: input.companyName,
      locations: input.locations,
      description,
      image,
      ogType,
      title,
    }),
  };
}

/**
 * True when the first-response head was rendered at the edge for a Published CMS
 * record at this exact path. The route-level client updater then leaves the head to
 * PublicContentSeo instead of briefly writing registry or not-found metadata.
 */
export function hasEdgeEntityHead(pathname: string): boolean {
  if (typeof document === 'undefined') return false;
  const marker = document.head.querySelector<HTMLMetaElement>(`meta[name="${EDGE_SEO_MARKER_NAME}"]`);
  return Boolean(marker && marker.dataset.source === 'cms' && marker.content === pathname);
}

export function normalizeText(value: string | null | undefined, maximumLength: number) {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  return normalized.length <= maximumLength
    ? normalized
    : `${normalized.slice(0, Math.max(0, maximumLength - 1)).trimEnd()}…`;
}

export function toSafeAbsoluteHttpUrl(value: string) {
  try {
    const url = new URL(value, SITE_URL);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : DEFAULT_SHARE_IMAGE;
  } catch {
    return DEFAULT_SHARE_IMAGE;
  }
}

export function getImageMimeType(imageUrl: string) {
  let pathname = imageUrl;
  let format: string | null = null;
  try {
    const url = new URL(imageUrl, SITE_URL);
    pathname = url.pathname;
    format = url.searchParams.get('format');
  } catch {
    // Keep the raw value and fall through to the extension check.
  }
  if (format === 'webp') return 'image/webp';
  const normalized = pathname.toLowerCase();
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg';
  if (normalized.endsWith('.webp')) return 'image/webp';
  if (normalized.endsWith('.avif')) return 'image/avif';
  if (normalized.endsWith('.gif')) return 'image/gif';
  return 'image/png';
}

function buildPublicContentStructuredData({
  canonicalUrl,
  companyName,
  locations,
  description,
  image,
  ogType,
  title,
}: {
  canonicalUrl: string;
  companyName: string;
  locations: CompanyLocations;
  description: string;
  image: string;
  ogType: 'website' | 'article';
  title: string;
}): Record<string, unknown>[] {
  const url = new URL(canonicalUrl);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const collectionPath = pathParts.length > 1 ? `/${pathParts[0]}` : '/';
  const collectionName = getCollectionName(pathParts[0]);
  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    ...(collectionPath === '/'
      ? []
      : [{ '@type': 'ListItem', position: 2, name: collectionName, item: new URL(collectionPath, SITE_URL).toString() }]),
    {
      '@type': 'ListItem',
      position: collectionPath === '/' ? 2 : 3,
      name: title,
      item: canonicalUrl,
    },
  ];
  const page =
    ogType === 'article'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          '@id': `${canonicalUrl}#article`,
          headline: title,
          description,
          image: [image],
          mainEntityOfPage: canonicalUrl,
          publisher: { '@id': `${SITE_URL}/#organization` },
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: title,
          description,
          primaryImageOfPage: image,
          isPartOf: { '@id': `${SITE_URL}/#website` },
        };

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      ...companyLocationSchema(locations),
      name: companyName,
      url: SITE_URL,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: companyName,
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs,
    },
    page,
  ];
}

function getCollectionName(value: string | undefined) {
  if (value === 'stone-library') return 'Stone Library';
  if (value === 'products') return 'Products';
  if (value === 'projects') return 'Projects';
  if (value === 'articles') return 'Articles';
  return 'Urblo';
}
