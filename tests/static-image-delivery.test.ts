import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import manifest from '../src/data/staticImageVariants.json';
import {
  getStaticImageAttributes,
  getStaticImageDelivery,
  getStaticImageUrl,
} from '../src/lib/staticImageDelivery.ts';
import { getProjectImageDelivery } from '../src/lib/projectImageDelivery.ts';
import { getStoneImageDelivery } from '../src/lib/stoneImageDelivery.ts';

const images = manifest.images as unknown as Record<string, [number, number, number[], number]>;

describe('static image variant manifest', () => {
  test('every original and every srcset candidate exists in public/', () => {
    for (const path of Object.keys(images)) {
      expect(existsSync(`public${path}`), path).toBe(true);
      const delivery = getStaticImageDelivery(path);
      for (const candidate of delivery.srcSet!.split(', ')) {
        const url = candidate.split(' ')[0];
        expect(existsSync(`public${url}`), url).toBe(true);
      }
    }
  });

  test('no generated variant is wider than its original', () => {
    for (const [path, [width, , widths]] of Object.entries(images)) {
      for (const variantWidth of widths) expect(variantWidth, path).toBeLessThanOrEqual(width);
    }
  });
});

describe('getStaticImageDelivery', () => {
  test('full-width section image gets WebP srcset, sizes and intrinsic size', () => {
    const delivery = getStaticImageDelivery('/media/launch/banners/our-story.jpg', '100vw');
    expect(delivery.optimized).toBe(true);
    expect(delivery.src).toBe('/media/variants/media/launch/banners/our-story-1200w.webp');
    expect(delivery.srcSet).toContain('/media/variants/media/launch/banners/our-story-480w.webp 480w');
    expect(delivery.sizes).toBe('100vw');
    expect([delivery.width, delivery.height]).toEqual([1800, 1200]);
  });

  test('CMS, remote, data and unknown sources pass through unchanged', () => {
    for (const source of [
      'https://example.supabase.co/storage/v1/object/public/urblo-public-media/a.jpg',
      'https://cdn.example.com/media/launch/banners/products.jpg',
      'data:image/png;base64,AAAA',
      '/media/launch/identity/urblo-logo.png',
      '',
    ]) {
      expect(getStaticImageDelivery(source)).toEqual({ optimized: false, src: source });
      expect(getStaticImageUrl(source, 800)).toBe(source);
    }
  });

  test('absolute urblo.com.au URLs and query strings resolve to the manifest entry', () => {
    expect(getStaticImageDelivery('https://urblo.com.au/media/launch/banners/our-story.jpg?v=1').optimized).toBe(true);
  });

  test('original is the top candidate when the full-width WebP was not smaller', () => {
    const entry = Object.entries(images).find(([, value]) => value[3] === 1);
    expect(entry).toBeDefined();
    const [path, [width]] = entry!;
    expect(getStaticImageDelivery(path).srcSet).toContain(`${path} ${width}w`);
  });

  test('attribute helper exposes only DOM attributes', () => {
    expect(Object.keys(getStaticImageAttributes('/media/launch/banners/our-story.jpg')).sort()).toEqual([
      'height',
      'sizes',
      'src',
      'srcSet',
      'width',
    ]);
  });

  test('hero poster URL matches the homepage-only preload in index.html', () => {
    const poster = getStaticImageUrl('/media/launch/home/hero-poster.jpg', Infinity);
    expect(poster).toBe('/media/variants/media/launch/home/hero-poster-1280w.webp');
    expect(readFileSync('index.html', 'utf8')).toContain(`heroPosterPreload.href = '${poster}'`);
  });
});

describe('profile helpers fall back to static variants for curated sources', () => {
  test('project fallback imagery uses the profile sizes', () => {
    const delivery = getProjectImageDelivery('/images/projects/moon-gate/moon-gate-hero.jpg', 'hero');
    expect(delivery.optimized).toBe(true);
    expect(delivery.srcSet).toContain('/media/variants/images/projects/moon-gate/moon-gate-hero-480w.webp 480w');
    expect(delivery.sizes).toBe('100vw');
  });

  test('stone/product swatches use static variants; unknown local files stay untouched', () => {
    expect(getStoneImageDelivery('/products/battens/spotted-gum.jpg', 'swatch').src).toBe(
      '/media/variants/products/battens/spotted-gum-480w.webp',
    );
    expect(getStoneImageDelivery('/media/launch/identity/urblo-logo.png', 'swatch')).toEqual({
      optimized: false,
      src: '/media/launch/identity/urblo-logo.png',
      srcSet: undefined,
      sizes: undefined,
    });
  });
});
