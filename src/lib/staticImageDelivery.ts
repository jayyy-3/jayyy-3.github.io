import staticImageVariants from '../data/staticImageVariants.json';

/**
 * Responsive delivery for static images shipped in `public/` (launch banners, homepage imagery,
 * article covers, product renders, static project fallbacks).
 *
 * `scripts/generate-static-image-variants.mjs` writes WebP variants to
 * `/media/variants/<original path without extension>-<width>w.webp` and records every processed original in
 * `src/data/staticImageVariants.json` as [width, height, variant widths, original-is-top flag].
 * Anything not in the manifest (CMS media, logos, small files) is returned unchanged.
 */
type StaticImageEntry = [width: number, height: number, variantWidths: number[], originalIsTop: number];

const images = staticImageVariants.images as unknown as Record<string, StaticImageEntry>;
const variantRoot = staticImageVariants.variantRoot;

export type StaticImageDelivery = {
  optimized: boolean;
  src: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
};

type Candidate = { url: string; width: number };

function manifestKey(source: string): string | null {
  if (!source || /^(data:|blob:)/i.test(source)) return null;
  let path = source;
  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      if (url.hostname !== 'urblo.com.au' && url.hostname !== 'www.urblo.com.au') return null;
      path = url.pathname;
    } catch {
      return null;
    }
  }
  path = path.split(/[?#]/)[0];
  if (!path.startsWith('/')) path = `/${path}`;
  return images[path] ? path : null;
}

function variantUrl(path: string, width: number): string {
  return `${variantRoot}${path.replace(/\.[a-z0-9]+$/i, '')}-${width}w.webp`;
}

function candidates(path: string, source: string): Candidate[] {
  const [width, , widths, originalIsTop] = images[path];
  const list = widths.map((variantWidth) => ({ url: variantUrl(path, variantWidth), width: variantWidth }));
  if (originalIsTop) list.push({ url: source, width });
  return list;
}

/**
 * srcset/sizes for an <img>. `fallbackWidth` picks the plain `src` for browsers that ignore
 * srcset: the largest candidate at or below it.
 */
export function getStaticImageDelivery(
  source: string,
  sizes = '100vw',
  fallbackWidth = 1200,
): StaticImageDelivery {
  const path = manifestKey(source);
  if (!path) return { optimized: false, src: source };

  const list = candidates(path, source);
  const fallback = [...list].reverse().find((candidate) => candidate.width <= fallbackWidth) ?? list[0];
  const [width, height] = images[path];
  return {
    optimized: true,
    src: fallback.url,
    srcSet: list.map((candidate) => `${candidate.url} ${candidate.width}w`).join(', '),
    sizes,
    width,
    height,
  };
}

/**
 * One URL for a CSS background or <video poster>: the smallest candidate that covers
 * `boxWidth` CSS pixels at the current device pixel ratio (largest when none does).
 * Pass `Infinity` for the largest candidate (a URL that must match a preload exactly).
 */
export function getStaticImageUrl(source: string, boxWidth: number): string {
  const path = manifestKey(source);
  if (!path) return source;
  const list = candidates(path, source);
  const ratio = typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  const needed = boxWidth * ratio;
  return (list.find((candidate) => candidate.width >= needed) ?? list[list.length - 1]).url;
}

/** Spreadable <img> attributes (src, srcSet, sizes, width, height) for elements that cannot use the component. */
export function getStaticImageAttributes(source: string, sizes?: string, fallbackWidth?: number) {
  const delivery = getStaticImageDelivery(source, sizes, fallbackWidth);
  return {
    src: delivery.src,
    srcSet: delivery.srcSet,
    sizes: delivery.sizes,
    width: delivery.width,
    height: delivery.height,
  };
}
