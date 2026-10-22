// Body image presentation rules (docs/DESIGN.md "Content blocks", 2026-10-22).
// Landscape images run full width at their natural ratio; square and portrait images sit in a
// narrower centred measure; two consecutive square/portrait photos form one pair. Pure helpers
// so the public page, the admin preview and the tests share one decision.
import type { BlockImageSize, ContentBlockView, ImageBlockView } from './view.ts';

/** Width / height at or above which an image is treated as landscape. */
export const LANDSCAPE_MIN_RATIO = 1.3;

/** Tallest a square or portrait body image may render, as a share of the small viewport height. */
export const UPRIGHT_MAX_VIEWPORT_HEIGHT = 0.8;

export type ImageOrientation = 'landscape' | 'upright' | 'unknown';

export function imageRatio(size: Partial<BlockImageSize> | null | undefined): number | null {
    const width = size?.width;
    const height = size?.height;
    if (typeof width !== 'number' || typeof height !== 'number' || !(width > 0) || !(height > 0)) return null;
    return width / height;
}

/** `unknown` when no size is recorded (older media); renderers then measure the loaded image. */
export function imageOrientation(size: Partial<BlockImageSize> | null | undefined): ImageOrientation {
    const ratio = imageRatio(size);
    if (ratio === null) return 'unknown';
    return ratio >= LANDSCAPE_MIN_RATIO ? 'landscape' : 'upright';
}

export type BodyBlockGroup =
    | { kind: 'block'; block: ContentBlockView }
    | { kind: 'image_pair'; id: string; blocks: [ImageBlockView, ImageBlockView] };

function isPairableImage(block: ContentBlockView, sizeOf: (block: ImageBlockView) => BlockImageSize | null): block is ImageBlockView {
    return block.type === 'image' && block.presentation !== 'drawing' && imageOrientation(sizeOf(block)) === 'upright';
}

/**
 * Groups the ordered body: two consecutive square/portrait photo `image` blocks become one pair,
 * read left to right (a third such image starts the next pair). Drawings and images of unknown
 * size are never paired. `sizeOf` may add sizes measured in the browser.
 */
export function groupBodyBlocks(
    blocks: readonly ContentBlockView[],
    sizeOf: (block: ImageBlockView) => BlockImageSize | null = (block) =>
        block.width && block.height ? { width: block.width, height: block.height } : null,
): BodyBlockGroup[] {
    const groups: BodyBlockGroup[] = [];
    for (let index = 0; index < blocks.length; index += 1) {
        const block = blocks[index];
        const next = blocks[index + 1];
        if (next && isPairableImage(block, sizeOf) && isPairableImage(next, sizeOf)) {
            groups.push({ kind: 'image_pair', id: `${block.id}+${next.id}`, blocks: [block, next] });
            index += 1;
        } else {
            groups.push({ kind: 'block', block });
        }
    }
    return groups;
}
