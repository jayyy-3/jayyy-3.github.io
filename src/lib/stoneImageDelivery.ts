import { toPublicMediaRenderUrl } from './projectImageDelivery.ts';

/**
 * Responsive delivery for Stone Library media (finish, cover and swatch images).
 *
 * The uploaded original stays the visual master and is only ever requested
 * through an explicit "View original" link on the Stone detail stage. Every
 * rendered <img> asks the existing Supabase render endpoint for a variant sized
 * to its box; the zoom profile keeps a high quality and reaches the transform's
 * 3000px ceiling so texture remains inspectable on large Retina displays.
 */
export type StoneImageProfile =
  | 'swatch'
  | 'thumb'
  | 'preview'
  | 'material'
  | 'card'
  | 'stage'
  | 'qr'
  | 'zoom';

type StoneImageProfileConfig = {
  widths: readonly number[];
  fallbackWidth: number;
  quality: number;
  sizes: string;
};

/** Supabase image transformation never returns more than 3000px wide. */
export const STONE_RENDER_MAX_WIDTH = 3000;

export const stoneImageProfiles: Record<StoneImageProfile, StoneImageProfileConfig> = {
  // Product option swatch: 112 x 80 box.
  swatch: { widths: [240, 360], fallbackWidth: 240, quality: 82, sizes: '112px' },
  // Secondary-frame and hotspot thumbnails: 72-120px boxes.
  thumb: { widths: [240, 360], fallbackWidth: 240, quality: 82, sizes: '120px' },
  // Product detail "selected configuration" preview tiles (3 across from 640px).
  preview: {
    widths: [240, 480, 768],
    fallbackWidth: 480,
    quality: 82,
    sizes: '(min-width: 640px) 200px, calc(100vw - 72px)',
  },
  // Project detail material rows: 140px column from 768px, full width below.
  material: {
    widths: [240, 480, 768, 1024],
    fallbackWidth: 480,
    quality: 82,
    sizes: '(min-width: 768px) 140px, calc(100vw - 40px)',
  },
  // Stone Library listing cards (1 / 2 / 3 / 4 columns).
  card: {
    widths: [360, 480, 720, 960],
    fallbackWidth: 480,
    quality: 82,
    sizes: '(min-width: 1280px) 25vw, (min-width: 1024px) 34vw, (min-width: 640px) 50vw, 100vw',
  },
  // Detail stage panels: height clamp(190px, 29vw, 340px) x 1.5 wide.
  stage: {
    widths: [480, 768, 1024, 1536, 2048, 2560],
    fallbackWidth: 1024,
    quality: 88,
    sizes: '(min-width: 1173px) 510px, (min-width: 656px) 43.5vw, 285px',
  },
  // QR material page surface figure inside the 560px column.
  qr: {
    widths: [640, 1024, 1536],
    fallbackWidth: 1024,
    quality: 88,
    sizes: '(min-width: 560px) 496px, calc(100vw - 40px)',
  },
  // Full-screen inspection (lightbox / enlarged view).
  zoom: {
    widths: [1280, 1920, 2560, STONE_RENDER_MAX_WIDTH],
    fallbackWidth: 1920,
    quality: 90,
    sizes: '100vw',
  },
};

export type StoneImageDelivery = {
  optimized: boolean;
  src: string;
  srcSet: string | undefined;
  sizes: string | undefined;
};

export function getStoneImageDelivery(
  source: string,
  profile: StoneImageProfile,
): StoneImageDelivery {
  const config = stoneImageProfiles[profile];
  const variant = (width: number) =>
    toPublicMediaRenderUrl(source, {
      width,
      quality: config.quality,
      maxWidth: STONE_RENDER_MAX_WIDTH,
    });
  const fallback = variant(config.fallbackWidth);

  if (!fallback) {
    return { optimized: false, src: source, srcSet: undefined, sizes: undefined };
  }

  return {
    optimized: true,
    src: fallback,
    srcSet: config.widths.map((width) => `${variant(width)} ${width}w`).join(', '),
    sizes: config.sizes,
  };
}

/**
 * 1200 x 630 share image in the uploaded format, for og:image / twitter:image.
 * Non-Storage sources (static fallback imagery) are returned unchanged.
 */
export function getStoneShareImageUrl(source: string | undefined): string | undefined {
  if (!source) return undefined;
  return (
    toPublicMediaRenderUrl(source, {
      width: 1200,
      height: 630,
      quality: 82,
      format: 'origin',
      resize: 'cover',
    }) || source
  );
}
