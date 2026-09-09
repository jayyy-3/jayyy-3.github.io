import stoneFinishSources from '../../data/clean/stone_finish_images.json';
import type { FinishKey, StoneFinishImageRole } from '../types/stone-library';

export interface StoneImageAsset {
    imageUrl: string;
    thumbUrl?: string;
    alt?: string;
    secondaryImages?: SecondaryStoneImageAsset[];
}

export interface SecondaryStoneImageAsset {
    imageUrl: string;
    thumbUrl?: string;
    alt?: string;
    label?: string;
}

type VariantImageMap = Partial<Record<FinishKey | 'default', StoneImageAsset>>;

interface StoneFinishImageResolution {
    asset?: StoneImageAsset;
    role: StoneFinishImageRole;
}

const productImageAssets = import.meta.glob('../../data/Product/**/*.jpeg', {
    eager: true,
    import: 'default',
}) as Record<string, string>;

function resolveProductImage(relativePath: string): string {
    const moduleKey = `../../data/Product/${relativePath}`;
    const imageUrl = productImageAssets[moduleKey];

    if (!imageUrl && import.meta.env.DEV) {
        console.warn(`[stoneFinishImages] Missing product image: ${moduleKey}`);
    }

    return imageUrl || '';
}

function productImage(
    relativePath: string,
    alt: string,
    thumbPath?: string,
    secondaryImages: SecondaryStoneImageAsset[] = [],
): StoneImageAsset {
    return {
        imageUrl: resolveProductImage(relativePath),
        thumbUrl: thumbPath ? resolveProductImage(thumbPath) : undefined,
        alt,
        secondaryImages,
    };
}

function secondaryProductImage(
    relativePath: string,
    alt: string,
    label = 'Secondary frame',
    thumbPath?: string,
): SecondaryStoneImageAsset {
    return {
        imageUrl: resolveProductImage(relativePath),
        thumbUrl: thumbPath ? resolveProductImage(thumbPath) : undefined,
        alt,
        label,
    };
}


interface StoneImageSource {
    path: string;
    alt: string;
    thumbPath?: string;
    secondaryImages?: (Omit<StoneImageSource, 'secondaryImages'> & { label?: string })[];
}
const stoneFinishImages: Record<string, VariantImageMap> = Object.fromEntries(
    Object.entries(stoneFinishSources as Record<string, Record<string, StoneImageSource>>).map(([variant, finishes]) => [
        variant,
        Object.fromEntries(Object.entries(finishes).map(([finish, source]) => [
            finish,
            productImage(source.path, source.alt, source.thumbPath, source.secondaryImages?.map((image) =>
                secondaryProductImage(image.path, image.alt, image.label, image.thumbPath),
            )),
        ])),
    ]),
);

const finishSpecificOnlyVariants = new Set<string>();

export function requiresFinishSpecificImages(stoneVariantId: string): boolean {
    return finishSpecificOnlyVariants.has(stoneVariantId);
}

function baseFinishKey(finishKey: FinishKey): FinishKey {
    return finishKey.split('__')[0] ?? finishKey;
}

function getVariantMap(stoneVariantId: string): VariantImageMap | undefined {
    return stoneFinishImages[stoneVariantId];
}

export function getStoneDefaultImage(
    stoneVariantId: string,
): StoneImageAsset | undefined {
    const variantMap = getVariantMap(stoneVariantId);

    if (variantMap?.default) {
        return variantMap.default;
    }

    const baseVariantId = stoneVariantId.split('--')[0] ?? stoneVariantId;
    return getVariantMap(baseVariantId)?.default;
}

export function getStoneFinishImage(
    stoneVariantId: string,
    finishKey: FinishKey,
): StoneImageAsset | undefined {
    return getStoneFinishImageResolution(stoneVariantId, finishKey).asset;
}

export function getStoneFinishImageResolution(
    stoneVariantId: string,
    finishKey: FinishKey,
): StoneFinishImageResolution {
    const variantMap = getVariantMap(stoneVariantId);
    const finishBaseKey = baseFinishKey(finishKey);

    if (variantMap?.[finishKey]) {
        return { asset: variantMap[finishKey], role: 'finish-specific' };
    }
    if (variantMap?.[finishBaseKey]) {
        return { asset: variantMap[finishBaseKey], role: 'finish-specific' };
    }

    const baseVariantId = stoneVariantId.split('--')[0] ?? stoneVariantId;
    const groupMap = getVariantMap(baseVariantId);

    if (groupMap?.[finishKey]) {
        return { asset: groupMap[finishKey], role: 'finish-specific' };
    }
    if (groupMap?.[finishBaseKey]) {
        return { asset: groupMap[finishBaseKey], role: 'finish-specific' };
    }

    if (requiresFinishSpecificImages(stoneVariantId)) {
        return { role: 'placeholder' };
    }

    return {
        asset: variantMap?.default || groupMap?.default,
        role: variantMap?.default || groupMap?.default ? 'reference' : 'placeholder',
    };
}
