import { describe, expect, test } from 'vitest';
import { groupBodyBlocks, imageOrientation, LANDSCAPE_MIN_RATIO } from './imageLayout';
import { resolveBlockView, toBlockImageSize, type BlockResolveContext } from './resolve';
import type { ContentBlockView, ImageBlockView } from './view';

const image = (id: string, width?: number, height?: number, presentation: 'photo' | 'drawing' = 'photo'): ImageBlockView => ({
    id,
    type: 'image',
    src: `/media/${id}.jpg`,
    alt: id,
    presentation,
    ...(width && height ? { width, height } : {}),
});
const text: ContentBlockView = { id: 't', type: 'text', body: 'Copy' };

describe('body image orientation', () => {
    test('landscape from about 1.3, square and portrait below, unknown without a size', () => {
        expect(LANDSCAPE_MIN_RATIO).toBe(1.3);
        expect(imageOrientation({ width: 1600, height: 900 })).toBe('landscape'); // 16:9
        expect(imageOrientation({ width: 1500, height: 1000 })).toBe('landscape'); // 3:2
        expect(imageOrientation({ width: 1600, height: 1200 })).toBe('landscape'); // 4:3 (1.33)
        expect(imageOrientation({ width: 1300, height: 1000 })).toBe('landscape');
        expect(imageOrientation({ width: 1290, height: 1000 })).toBe('upright');
        expect(imageOrientation({ width: 1250, height: 1000 })).toBe('upright'); // 5:4
        expect(imageOrientation({ width: 1000, height: 1000 })).toBe('upright'); // 1:1
        expect(imageOrientation({ width: 1000, height: 1500 })).toBe('upright'); // 2:3
        expect(imageOrientation(null)).toBe('unknown');
        expect(imageOrientation({ width: 0, height: 100 })).toBe('unknown');
    });

    test('recorded sizes must be positive numbers', () => {
        expect(toBlockImageSize(1200, 800)).toEqual({ width: 1200, height: 800 });
        expect(toBlockImageSize(null, 800)).toBeNull();
        expect(toBlockImageSize(0, 800)).toBeNull();
        expect(toBlockImageSize('1200', 800)).toBeNull();
    });
});

describe('body grouping', () => {
    const kinds = (blocks: ContentBlockView[]) => groupBodyBlocks(blocks).map((group) =>
        group.kind === 'image_pair' ? `pair(${group.blocks.map((block) => block.id).join(',')})` : group.block.id);

    test('two consecutive square/portrait photos become one pair; landscape stays single', () => {
        expect(kinds([image('a', 1000, 1500), image('b', 1000, 1000), image('c', 1600, 900)])).toEqual(['pair(a,b)', 'c']);
        expect(kinds([image('a', 1000, 1500), text, image('b', 1000, 1500)])).toEqual(['a', 't', 'b']);
    });

    test('pairs read left to right; a third portrait starts the next pair', () => {
        expect(kinds([image('a', 2, 3), image('b', 2, 3), image('c', 2, 3)])).toEqual(['pair(a,b)', 'c']);
        expect(kinds([image('a', 2, 3), image('b', 2, 3), image('c', 2, 3), image('d', 1, 1)])).toEqual(['pair(a,b)', 'pair(c,d)']);
    });

    test('drawings and images without a known size are never paired', () => {
        expect(kinds([image('a', 1000, 1500, 'drawing'), image('b', 1000, 1500)])).toEqual(['a', 'b']);
        expect(kinds([image('a'), image('b', 1000, 1500)])).toEqual(['a', 'b']);
        const measured = groupBodyBlocks([image('a'), image('b', 1000, 1500)], (block) =>
            block.id === 'a' ? { width: 900, height: 1200 } : { width: block.width!, height: block.height! });
        expect(measured[0].kind).toBe('image_pair');
    });
});

describe('image block view', () => {
    const context: BlockResolveContext = {
        fallbackAlt: 'Project',
        mediaUrl: (id) => (id ? `/media/${id}.jpg` : ''),
        mediaAlt: () => 'Media alt',
        stoneKey: () => null,
        mediaSize: (id) => (id === 7 ? { width: 1200, height: 1800 } : null),
    };

    test('carries the recorded size and the presentation (photo by default)', () => {
        expect(resolveBlockView({ type: 'image', content: { mediaAssetId: 7, alt: 'Portrait', presentation: 'drawing' } }, 'x', context))
            .toMatchObject({ width: 1200, height: 1800, presentation: 'drawing' });
        const plain = resolveBlockView({ type: 'image', content: { mediaAssetId: 8, alt: 'Plain' } }, 'y', context);
        expect(plain).toMatchObject({ presentation: 'photo' });
        expect(plain).not.toHaveProperty('width');
    });

    test('step images carry their size too', () => {
        const steps = resolveBlockView({ type: 'steps', content: { items: [{ title: 'Cut', body: 'Cut', mediaAssetId: 7, alt: 'Saw' }] } }, 's', context);
        expect(steps).toMatchObject({ items: [{ image: { src: '/media/7.jpg', width: 1200, height: 1800 } }] });
    });
});
