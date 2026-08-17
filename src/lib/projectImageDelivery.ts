export type ProjectImageProfile = 'card' | 'list' | 'hero' | 'detail' | 'hotspot';

type ProjectImageProfileConfig = {
  widths: readonly number[];
  fallbackWidth: number;
  quality: number;
  sizes: string;
};

const PUBLIC_STORAGE_MARKER = '/storage/v1/object/public/';
const PUBLIC_RENDER_MARKER = '/storage/v1/render/image/public/';
const PROJECT_PUBLIC_BUCKET = 'urblo-public-media';

export const projectImageProfiles: Record<ProjectImageProfile, ProjectImageProfileConfig> = {
  card: {
    widths: [480, 768, 960, 1280],
    fallbackWidth: 960,
    quality: 82,
    sizes:
      '(min-width: 1024px) calc((100vw - 96px) / 3), (min-width: 640px) calc((100vw - 64px) / 2), calc(100vw - 40px)',
  },
  list: {
    widths: [240, 360, 480],
    fallbackWidth: 360,
    quality: 82,
    sizes: '(min-width: 768px) 120px, calc(100vw - 40px)',
  },
  hero: {
    widths: [960, 1440, 1920, 2500],
    fallbackWidth: 1920,
    quality: 88,
    sizes: '100vw',
  },
  detail: {
    widths: [768, 1280, 1920, 2500],
    fallbackWidth: 1920,
    quality: 86,
    sizes: '(min-width: 1280px) 1200px, calc(100vw - 40px)',
  },
  hotspot: {
    widths: [768, 1280, 1920, 2500],
    fallbackWidth: 1920,
    quality: 86,
    sizes: '(min-width: 1280px) 820px, (min-width: 1024px) calc(100vw - 440px), calc(100vw - 40px)',
  },
};

function parsePublicProjectStorageUrl(source: string): URL | null {
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.supabase.co')) return null;
    const markerIndex = url.pathname.indexOf(PUBLIC_STORAGE_MARKER);
    if (markerIndex === -1) return null;

    const storagePath = url.pathname.slice(markerIndex + PUBLIC_STORAGE_MARKER.length);
    if (!storagePath.startsWith(`${PROJECT_PUBLIC_BUCKET}/`)) return null;

    return url;
  } catch {
    return null;
  }
}

export function toProjectImageVariantUrl(
  source: string,
  width: number,
  quality: number,
): string | null {
  const url = parsePublicProjectStorageUrl(source);
  if (!url) return null;

  const safeWidth = Math.min(2500, Math.max(1, Math.round(width)));
  const safeQuality = Math.min(100, Math.max(20, Math.round(quality)));
  url.pathname = url.pathname.replace(PUBLIC_STORAGE_MARKER, PUBLIC_RENDER_MARKER);
  url.search = '';
  url.searchParams.set('width', String(safeWidth));
  url.searchParams.set('quality', String(safeQuality));
  url.searchParams.set('format', 'webp');
  url.searchParams.set('resize', 'contain');
  return url.toString();
}

export function getProjectImageDelivery(source: string, profile: ProjectImageProfile) {
  const config = projectImageProfiles[profile];
  const fallback = toProjectImageVariantUrl(source, config.fallbackWidth, config.quality);

  if (!fallback) {
    return {
      optimized: false,
      src: source,
      srcSet: undefined,
      sizes: undefined,
    } as const;
  }

  return {
    optimized: true,
    src: fallback,
    srcSet: config.widths
      .map((width) => `${toProjectImageVariantUrl(source, width, config.quality)} ${width}w`)
      .join(', '),
    sizes: config.sizes,
  } as const;
}
