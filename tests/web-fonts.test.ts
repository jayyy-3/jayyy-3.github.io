import { describe, expect, test } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

// NOW-OPT-WEB-FONTS-001: every font preload in index.html must be exactly a WOFF2 URL that an
// @font-face rule requests first, or Chrome downloads it twice and warns "preloaded but not used".
const html = readFileSync('index.html', 'utf8');
const css = readFileSync('src/index.css', 'utf8');
const preloadTags = [...html.matchAll(/<link\b[^>]*\brel="preload"[^>]*\bas="font"[^>]*>/g)].map((match) => match[0]);
const fontFaces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map((match) => match[1]);

describe('web font delivery', () => {
  test('preloads Avenir 45 Book and 35 Light only, as crossorigin WOFF2', () => {
    const hrefs = preloadTags.map((tag) => /\bhref="([^"]+)"/.exec(tag)?.[1]);
    expect(hrefs).toEqual(['/fonts/urblo/Avenir-LT-Std-45-Book.woff2', '/fonts/urblo/Avenir-LT-Std-35-Light.woff2']);
    for (const tag of preloadTags) {
      expect(tag).toContain('type="font/woff2"');
      expect(tag).toMatch(/\scrossorigin[\s/>]/);
    }
  });

  test('each preload is the first src of an @font-face rule and exists in public/', () => {
    for (const tag of preloadTags) {
      const href = /\bhref="([^"]+)"/.exec(tag)![1];
      expect(existsSync(`public${href}`)).toBe(true);
      expect(fontFaces.some((face) => face.includes(`src: url('${href}') format('woff2')`))).toBe(true);
    }
  });

  test('every TTF face lists its WOFF2 first and keeps font-display swap', () => {
    const ttfFaces = fontFaces.filter((face) => face.includes(".ttf')"));
    expect(ttfFaces).toHaveLength(7);
    for (const face of ttfFaces) {
      expect(face).toMatch(/src: url\('([^']+)\.woff2'\) format\('woff2'\), url\('\1\.ttf'\) format\('truetype'\);/);
      expect(face).toContain('font-display: swap;');
    }
  });
});
