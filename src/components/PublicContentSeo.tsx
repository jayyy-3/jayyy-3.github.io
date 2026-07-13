import { useEffect } from 'react';
import { DEFAULT_SHARE_IMAGE, SITE_URL } from '../data/seoRoutes';
import { usePublicSiteSettings } from '../lib/publicSiteSettings';
import type { PublicEntitySeo } from '../lib/publicEntitySeo';

interface PublicContentSeoProps {
  canonicalPath: string;
  fallbackTitle: string;
  fallbackDescription: string;
  image?: string;
  ogType?: 'website' | 'article';
  seo?: PublicEntitySeo;
}

/**
 * Applies metadata after a Published CMS-only detail record resolves in the SPA.
 * The static route map remains the first-render fallback for established routes.
 */
export default function PublicContentSeo({
  canonicalPath,
  fallbackTitle,
  fallbackDescription,
  image,
  ogType = 'website',
  seo,
}: PublicContentSeoProps) {
  const settings = usePublicSiteSettings();

  useEffect(() => {
    const title = normalizeText(seo?.title, 180) || normalizeText(fallbackTitle, 180) || 'Urblo';
    const description =
      normalizeText(seo?.description, 158) ||
      normalizeText(fallbackDescription, 158) ||
      'Urblo natural stone systems for streetscapes and civil landscapes.';
    const canonicalUrl = new URL(canonicalPath, SITE_URL).toString();
    const shareImage = toSafeAbsoluteHttpUrl(
      image || settings.seo.defaultShareImage || DEFAULT_SHARE_IMAGE,
    );

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', 'index,follow');
    upsertMeta('property', 'og:site_name', settings.companyName);
    upsertMeta('property', 'og:type', ogType);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', shareImage);
    upsertMeta('property', 'og:image:type', getImageMimeType(shareImage));
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', shareImage);
    upsertCanonical(canonicalUrl);
    upsertDynamicJsonLd(
      buildPublicContentStructuredData({
        canonicalUrl,
        companyName: settings.companyName,
        description,
        image: shareImage,
        ogType,
        title,
      }),
    );

    return () => {
      const tag = document.head.querySelector<HTMLScriptElement>('script#urblo-structured-data');
      if (tag?.dataset.owner === 'public-content-seo') {
        tag.remove();
      }
    };
  }, [
    canonicalPath,
    fallbackDescription,
    fallbackTitle,
    image,
    ogType,
    seo?.description,
    seo?.title,
    settings.companyName,
    settings.seo.defaultShareImage,
  ]);

  return null;
}

function normalizeText(value: string | null | undefined, maximumLength: number) {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  return normalized.length <= maximumLength
    ? normalized
    : `${normalized.slice(0, Math.max(0, maximumLength - 1)).trimEnd()}…`;
}

function toSafeAbsoluteHttpUrl(value: string) {
  try {
    const url = new URL(value, SITE_URL);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : DEFAULT_SHARE_IMAGE;
  } catch {
    return DEFAULT_SHARE_IMAGE;
  }
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.rel = 'canonical';
    document.head.appendChild(tag);
  }
  tag.href = href;
}

function getImageMimeType(imageUrl: string) {
  const pathname = new URL(imageUrl, SITE_URL).pathname.toLowerCase();
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
  if (pathname.endsWith('.webp')) return 'image/webp';
  if (pathname.endsWith('.avif')) return 'image/avif';
  if (pathname.endsWith('.gif')) return 'image/gif';
  return 'image/png';
}

function upsertDynamicJsonLd(structuredData: Record<string, unknown>[]) {
  let tag = document.head.querySelector<HTMLScriptElement>('script#urblo-structured-data');
  if (!tag) {
    tag = document.createElement('script');
    tag.id = 'urblo-structured-data';
    tag.type = 'application/ld+json';
    document.head.appendChild(tag);
  }
  tag.dataset.owner = 'public-content-seo';
  tag.textContent = JSON.stringify(structuredData);
}

function buildPublicContentStructuredData({
  canonicalUrl,
  companyName,
  description,
  image,
  ogType,
  title,
}: {
  canonicalUrl: string;
  companyName: string;
  description: string;
  image: string;
  ogType: 'website' | 'article';
  title: string;
}) {
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
