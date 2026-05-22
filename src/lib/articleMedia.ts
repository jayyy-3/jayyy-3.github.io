const ARTICLE_IMAGE_REPLACEMENTS: Record<string, string | null> = {
  'e5ca1a01-2f2b-4a8b-937b-cda74b36a915': '/media/launch/identity/urblo-logo.png',
  '46806a34-afb6-40eb-a9d8-852268088911':
    '/media/launch/articles/curving-greening-pipelines/01-greening-pipeline.webp',
  'e49906b3-adb6-41e0-866d-bbbd18cf43f0':
    '/media/launch/articles/curving-greening-pipelines/01-greening-pipeline.webp',
  '71cc88e1-9272-4bdf-9336-d096d83344eb':
    '/media/launch/articles/curving-greening-pipelines/02-greening-pipeline.webp',
  '9b283b4d-f4aa-408d-bc6d-75d9d001438d':
    '/media/launch/articles/curving-greening-pipelines/03-greening-pipeline.webp',
  '94c8a039-7e26-46ef-9a1a-1d3d32e1ebcf':
    '/media/launch/articles/curving-greening-pipelines/04-greening-pipeline.webp',
  '66d5a03c-b265-48ea-a0e4-b493bfe8aac3':
    '/media/launch/articles/debunking-cost-myth/04-sports-centre.webp',
  '0c6bfe1f-9182-4518-92fc-e9b0435652f5':
    '/media/launch/articles/debunking-cost-myth/01-sports-centre.webp',
  '1ea66f7e-2b52-415e-b2c7-6665f9832a78':
    '/media/launch/articles/debunking-cost-myth/02-sports-centre.webp',
  '58eb3e86-9abe-4c32-ad7a-07cc08f7cc8a':
    '/media/launch/articles/debunking-cost-myth/03-sports-centre.webp',
  '7561f5e3-8e70-4813-9615-55104ceb620f':
    '/media/launch/articles/debunking-cost-myth/04-sports-centre.webp',
  '47d234c6-aa9c-4a90-9c11-6bc686aac998':
    '/media/launch/articles/modular-mastery-aitken/02-aitken-college.webp',
  'b06a11a8-8709-4a28-bae9-782944de1013':
    '/media/launch/articles/modular-mastery-aitken/01-aitken-college.webp',
  'c1aa460d-f0dd-4d0a-a1b2-2fc8766213ea':
    '/media/launch/articles/modular-mastery-aitken/02-aitken-college.webp',
  'b328fc31-c14d-4d8c-b3f0-e3b40e3389c5':
    '/media/launch/articles/modular-mastery-aitken/03-aitken-college.webp',
  '0adfab88-2fee-4d0d-b4ec-207c3068585e':
    '/media/launch/articles/modular-mastery-aitken/04-aitken-college.webp',
  '2768f42d-cdf8-4635-a06f-e4d2259e2dda':
    '/media/launch/articles/modular-mastery-aitken/05-aitken-college.webp',
  '32b54bab-880c-42a0-9362-cf4d6ffdfcaa':
    '/media/launch/articles/stone-transformed/01-stone-finishes.webp',
  '7510f2b8-694a-4589-a5ae-4243cc965a5b':
    '/media/launch/articles/stone-transformed/01-stone-finishes.webp',
  '76f4567d-61a0-4f88-b8ae-e4fd833a2aa3':
    '/media/launch/articles/stone-transformed/02-stone-finishes.webp',
  '9a2cc590-da9d-4b20-8122-181da295c5dd':
    '/media/launch/articles/shared/linkedin-banner.webp',
  'c20fec8e-498e-4e01-b65c-fb12baeac20d': null,
};

const MAIL_CAMPAIGN_HOSTS = new Set([
  'engage.squarespace-mail.com',
  'campaign-preferences.com',
  'www.squarespace.com',
]);

export function resolveArticleAssetPath(assetPath: string | undefined): string {
  if (!assetPath) {
    return '';
  }

  if (/^(https?:|data:|mailto:|tel:)/i.test(assetPath)) {
    return assetPath;
  }

  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;

  return `${base}${assetPath.replace(/^\/+/, '')}`;
}

export function prepareArticleHtml(rawHtml: string): string {
  if (typeof DOMParser === 'undefined') {
    return rawHtml;
  }

  const document = new DOMParser().parseFromString(rawHtml, 'text/html');

  document.querySelectorAll('.a6S, [data-is-tooltip-wrapper="true"]').forEach((element) => {
    element.remove();
  });

  document.querySelectorAll('img').forEach((image) => {
    const src = image.getAttribute('src') ?? '';

    if (src.includes('fonts.gstatic.com/s/e/notoemoji')) {
      image.replaceWith(document.createTextNode(image.getAttribute('data-emoji') ?? image.alt));
      return;
    }

    const replacement = resolveSquarespaceArticleImage(src);
    if (replacement === null) {
      image.remove();
      return;
    }

    if (replacement) {
      image.setAttribute('src', resolveArticleAssetPath(replacement));
      image.removeAttribute('srcset');
    }

    image.setAttribute('loading', 'lazy');
    image.setAttribute('decoding', 'async');
    image.removeAttribute('data-saferedirecturl');
    image.removeAttribute('data-bit');
    image.removeAttribute('tabindex');
  });

  document.querySelectorAll<HTMLElement>('[background]').forEach((element) => {
    const background = element.getAttribute('background') ?? '';
    const replacement = resolveSquarespaceArticleImage(background);

    if (replacement === null) {
      element.removeAttribute('background');
      return;
    }

    if (replacement) {
      element.setAttribute('background', resolveArticleAssetPath(replacement));
    }
  });

  document.querySelectorAll<HTMLAnchorElement>('a').forEach((anchor) => {
    const cleanedHref = cleanArticleHref(anchor.getAttribute('href'), anchor.textContent ?? '');
    anchor.removeAttribute('data-saferedirecturl');

    if (!cleanedHref) {
      const parentParagraph = anchor.closest('p');
      if (parentParagraph?.textContent?.toLowerCase().includes('unsubscribe')) {
        parentParagraph.remove();
        return;
      }

      anchor.removeAttribute('href');
      anchor.removeAttribute('target');
      anchor.removeAttribute('rel');
      return;
    }

    anchor.setAttribute('href', cleanedHref);

    if (/^https?:/i.test(cleanedHref)) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
      return;
    }

    anchor.removeAttribute('target');
    anchor.removeAttribute('rel');
  });

  document.querySelectorAll('p').forEach((element) => {
    const text = element.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() ?? '';
    if (text === 'powered by' || text.includes('powered by squarespace')) {
      element.remove();
    }
  });

  return document.body.innerHTML;
}

function resolveSquarespaceArticleImage(rawValue: string): string | null | undefined {
  const assetId = getSquarespaceAssetId(rawValue);

  if (!assetId) {
    return undefined;
  }

  return ARTICLE_IMAGE_REPLACEMENTS[assetId];
}

function getSquarespaceAssetId(rawValue: string): string | undefined {
  const source = extractSourceUrl(rawValue);

  try {
    const url = new URL(source);
    if (url.hostname !== 'images.squarespace-cdn.com') {
      return undefined;
    }

    const parts = url.pathname.split('/').filter(Boolean);
    const contentIndex = parts.indexOf('content');
    return contentIndex >= 0 ? parts[contentIndex + 2] : undefined;
  } catch {
    return undefined;
  }
}

function cleanArticleHref(rawHref: string | null, linkText: string): string | undefined {
  if (!rawHref) {
    return undefined;
  }

  const isEngageButton = linkText.replace(/\s+/g, ' ').trim().toLowerCase() === 'engage us';
  let href = extractSourceUrl(rawHref);

  for (let index = 0; index < 3; index += 1) {
    const parsed = parseUrl(href);

    if (!parsed) {
      return href;
    }

    if (parsed.hostname === 'www.google.com' && parsed.pathname === '/url') {
      href = parsed.searchParams.get('q') ?? href;
      continue;
    }

    if (parsed.hostname === 'engage.squarespace-mail.com') {
      href = parsed.searchParams.get('u') ?? '';
      continue;
    }

    break;
  }

  const finalUrl = parseUrl(href);

  if (!finalUrl) {
    return href;
  }

  if (MAIL_CAMPAIGN_HOSTS.has(finalUrl.hostname)) {
    return undefined;
  }

  if (finalUrl.hostname === 'octopus-begonia-xasd.squarespace.com') {
    return isEngageButton ? '/contact' : '/';
  }

  if (finalUrl.hostname === 'urblo.com.au' || finalUrl.hostname === 'www.urblo.com.au') {
    if (isEngageButton) {
      return '/contact';
    }

    if (finalUrl.pathname.startsWith('/wp-content/uploads/')) {
      return '/products';
    }

    return `${finalUrl.pathname}${finalUrl.hash}`;
  }

  stripTrackingParams(finalUrl);
  return finalUrl.toString();
}

function parseUrl(value: string): URL | undefined {
  try {
    return new URL(value, 'https://urblo.com.au');
  } catch {
    return undefined;
  }
}

function extractSourceUrl(rawValue: string): string {
  const htmlDecoded = rawValue.replace(/&amp;/g, '&');
  const fragmentIndex = htmlDecoded.indexOf('#https://images.squarespace-cdn.com');

  return fragmentIndex >= 0 ? htmlDecoded.slice(fragmentIndex + 1) : htmlDecoded;
}

function stripTrackingParams(url: URL): void {
  for (const key of Array.from(url.searchParams.keys())) {
    if (key.startsWith('utm_') || key.startsWith('ss_')) {
      url.searchParams.delete(key);
    }
  }
}
