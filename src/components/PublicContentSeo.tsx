import { useEffect } from 'react';
import { usePublicSiteSettings } from '../lib/publicSiteSettings';
import type { PublicEntitySeo } from '../lib/publicEntitySeo';
import { buildPublicContentSeoMeta } from '../lib/publicContentSeoMeta';

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
 * The edge head renderer (functions/_middleware.js) writes the same values into the
 * first response through the shared buildPublicContentSeoMeta helper, and every
 * write below updates the existing tag in place, so hydration never duplicates or
 * contradicts the server head.
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
  const seoTitle = seo?.title;
  const seoDescription = seo?.description;

  useEffect(() => {
    const meta = buildPublicContentSeoMeta({
      canonicalPath,
      fallbackTitle,
      fallbackDescription,
      image,
      ogType,
      seo: { title: seoTitle, description: seoDescription },
      companyName: settings.companyName,
      locations: settings.locations,
      defaultShareImage: settings.seo.defaultShareImage,
    });

    document.title = meta.title;
    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'robots', meta.robots);
    upsertMeta('property', 'og:site_name', settings.companyName);
    upsertMeta('property', 'og:type', meta.ogType);
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', meta.canonicalUrl);
    upsertMeta('property', 'og:image', meta.image);
    upsertMeta('property', 'og:image:type', meta.imageType);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertMeta('name', 'twitter:image', meta.image);
    upsertCanonical(meta.canonicalUrl);
    upsertDynamicJsonLd(meta.structuredData);

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
    seoDescription,
    seoTitle,
    settings.companyName,
    settings.locations,
    settings.seo.defaultShareImage,
  ]);

  return null;
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
