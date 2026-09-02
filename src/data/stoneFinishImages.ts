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

const stoneFinishImages: Record<string, VariantImageMap> = {
    'new-grey': {
        default: productImage(
            'New Grey/New Grey_Flamed_Urblo.jpeg',
            'New Grey flamed finish',
        ),
        flamed: productImage(
            'New Grey/New Grey_Flamed_Urblo.jpeg',
            'New Grey flamed finish',
        ),
        sawn: productImage(
            'New Grey/New Grey_Sawn_Urblo.jpeg',
            'New Grey sawn finish',
        ),
        honed: productImage(
            'New Grey/New Grey_Honed_Urblo.jpeg',
            'New Grey honed finish',
        ),
        polished: productImage(
            'New Grey/New Grey_Polished_Urblo.jpeg',
            'New Grey polished finish',
        ),
    },
    'zen-grey': {
        default: productImage(
            'Zen Grey/Zen Grey_Flamed_Urblo_1.jpeg',
            'Zen Grey flamed finish',
            undefined,
            [
                secondaryProductImage(
                    'Zen Grey/Zen Grey_Flamed_Urblo_2.jpeg',
                    'Zen Grey flamed finish alternate frame',
                ),
            ],
        ),
        flamed: productImage(
            'Zen Grey/Zen Grey_Flamed_Urblo_1.jpeg',
            'Zen Grey flamed finish',
            undefined,
            [
                secondaryProductImage(
                    'Zen Grey/Zen Grey_Flamed_Urblo_2.jpeg',
                    'Zen Grey flamed finish alternate frame',
                ),
            ],
        ),
        sawn: productImage(
            'Zen Grey/Zen Grey_Sawn_Urblo_1.jpeg',
            'Zen Grey sawn finish',
            undefined,
            [
                secondaryProductImage(
                    'Zen Grey/Zen Grey_Sawn_Urblo_2.jpeg',
                    'Zen Grey sawn finish alternate frame',
                ),
            ],
        ),
        honed: productImage(
            'Zen Grey/Zen Grey_Honed_Urblo_1.jpeg',
            'Zen Grey honed finish',
            undefined,
            [
                secondaryProductImage(
                    'Zen Grey/Zen Grey_Honed_Urblo_2.jpeg',
                    'Zen Grey honed finish alternate frame',
                ),
            ],
        ),
        polished: productImage(
            'Zen Grey/Zen Grey_Polished_Urblo_1.jpeg',
            'Zen Grey polished finish',
            undefined,
            [
                secondaryProductImage(
                    'Zen Grey/Zen Grey_Polished_Urblo_2.jpeg',
                    'Zen Grey polished finish alternate frame',
                ),
            ],
        ),
    },
    'alpine-white': {
        default: productImage(
            'Alpine White/Alpine White_Flamed_Urblo.jpeg',
            'Alpine White flamed finish',
        ),
        flamed: productImage(
            'Alpine White/Alpine White_Flamed_Urblo.jpeg',
            'Alpine White flamed finish',
        ),
        sawn: productImage(
            'Alpine White/Alpine White_Sawn_Urblo.jpeg',
            'Alpine White sawn finish',
        ),
        honed: productImage(
            'Alpine White/Alpine White_Honed_Urblo.jpeg',
            'Alpine White honed finish',
        ),
        polished: productImage(
            'Alpine White/Alpine White_Polished_Urblo.jpeg',
            'Alpine White polished finish',
        ),
    },
    'angola-black': {
        default: productImage(
            'Angola Black/Angola Black_Bush-hammered_Urblo.jpeg',
            'Angola Black bush hammered finish',
        ),
        bush_hammered: productImage(
            'Angola Black/Angola Black_Bush-hammered_Urblo.jpeg',
            'Angola Black bush hammered finish',
        ),
        flamed: productImage(
            'Angola Black/Angola Black_Bush-hammeredFlamed_Urblo.jpeg',
            'Angola Black flamed finish',
        ),
        sawn: productImage(
            'Angola Black/Angola Black_Bush-hammeredSawn_Urblo.jpeg',
            'Angola Black sawn finish',
        ),
        honed: productImage(
            'Angola Black/Angola Black_Bush-hammeredHoned_Urblo.jpeg',
            'Angola Black honed finish',
        ),
        polished: productImage(
            'Angola Black/Angola Black_Bush-hammeredPolished_Urblo.jpeg',
            'Angola Black polished finish',
        ),
    },
    'steel-blue': {
        default: productImage(
            'Steel Blue/Steel Blue_Sawn_Urblo.jpeg',
            'Steel Blue sawn finish',
        ),
        sawn: productImage(
            'Steel Blue/Steel Blue_Sawn_Urblo.jpeg',
            'Steel Blue sawn finish',
        ),
        honed: productImage(
            'Steel Blue/Steel Blue_Honed_Urblo.jpeg',
            'Steel Blue honed finish',
        ),
        bush_hammered: productImage(
            'Steel Blue/Steel Blue_Bush-hammered_Urblo.jpeg',
            'Steel Blue bush hammered finish',
        ),
        combed: productImage(
            'Steel Blue/Steel Blue_Antline_Urblo.jpeg',
            'Steel Blue combed finish',
        ),
        rock_face: productImage(
            'Steel Blue/Steel Blue_Rock Face_Urblo.jpeg',
            'Steel Blue rock face finish',
        ),
        rippling__fine: productImage(
            'Steel Blue/Steel Blue_Rippling Fine_Urblo.jpeg',
            'Steel Blue rippling fine finish',
        ),
        rippling__rough: productImage(
            'Steel Blue/Steel Blue_Rippling Rough_Urblo.jpeg',
            'Steel Blue rippling rough finish',
        ),
    },
    juparana: {
        default: productImage(
            'Juparana/Juparana_Flamed_Urblo_1.jpeg',
            'Juparana flamed finish',
            undefined,
            [
                secondaryProductImage(
                    'Juparana/Juparana_Flamed _Urblo_2.jpeg',
                    'Juparana flamed finish alternate frame',
                ),
            ],
        ),
        flamed: productImage(
            'Juparana/Juparana_Flamed_Urblo_1.jpeg',
            'Juparana flamed finish',
            undefined,
            [
                secondaryProductImage(
                    'Juparana/Juparana_Flamed _Urblo_2.jpeg',
                    'Juparana flamed finish alternate frame',
                ),
            ],
        ),
        sawn: productImage(
            'Juparana/Juparana_Sawn_Urblo_1.jpeg',
            'Juparana sawn finish',
            undefined,
            [
                secondaryProductImage(
                    'Juparana/Juparana_Sawn _Urblo_2.jpeg',
                    'Juparana sawn finish alternate frame',
                ),
            ],
        ),
        honed: productImage(
            'Juparana/Juparana_Honed_Urblo_1.jpeg',
            'Juparana honed finish',
            undefined,
            [
                secondaryProductImage(
                    'Juparana/Juparana_Honed _Urblo_2.jpeg',
                    'Juparana honed finish alternate frame',
                ),
            ],
        ),
        polished: productImage(
            'Juparana/Juparana_Polished_Urblo_1.jpeg',
            'Juparana polished finish',
            undefined,
            [
                secondaryProductImage(
                    'Juparana/Juparana_Polished_Urblo_2.jpeg',
                    'Juparana polished finish alternate frame',
                ),
            ],
        ),
    },
    'ivory-sand': {
        default: productImage(
            'Ivory Sand/Ivory Sand_Sawn_Urblo.jpeg',
            'Ivory Sand honed finish',
        ),
        honed: productImage(
            'Ivory Sand/Ivory Sand_Sawn_Urblo.jpeg',
            'Ivory Sand honed finish',
        ),
        bush_hammered: productImage(
            'Ivory Sand/Ivory Sand_Bush-hammered_Urblo.jpeg',
            'Ivory Sand bush hammered finish',
        ),
        sparrow_peck: productImage(
            'Ivory Sand/Ivory Sand_Sparrow_Urblo.jpeg',
            'Ivory Sand sparrow peck finish',
        ),
    },
    'blueocean': {
        default: {
            imageUrl: '/media/launch/stone-library/fallbacks/blueocean-sawn.jpg',
            alt: 'Blueocean sawn finish',
        },
        sawn: {
            imageUrl: '/media/launch/stone-library/fallbacks/blueocean-sawn.jpg',
            alt: 'Blueocean sawn finish',
        },
    },
    'honey-comb': {
        default: productImage(
            'Honey Comb/Honey Comb_Sawn_Urblo.jpeg',
            'Honey Comb sawn finish',
        ),
        sawn: productImage(
            'Honey Comb/Honey Comb_Sawn_Urblo.jpeg',
            'Honey Comb sawn finish',
        ),
        honed: productImage(
            'Honey Comb/Honey Comb_Honed_Urblo.jpeg',
            'Honey Comb honed finish',
        ),
    },
    'golden-crust--light': {
        default: productImage(
            'Golden Crust/Golden Crust Light_Flamed_Urblo.jpeg',
            'Golden Crust Light flamed finish',
        ),
        flamed: productImage(
            'Golden Crust/Golden Crust Light_Flamed_Urblo.jpeg',
            'Golden Crust Light flamed finish',
        ),
        sawn: productImage(
            'Golden Crust/Golden Crust Light_Sawn_Urblo.jpeg',
            'Golden Crust Light sawn finish',
        ),
        honed: productImage(
            'Golden Crust/Golden Crust Light_Honed_Urblo.jpeg',
            'Golden Crust Light honed finish',
        ),
        polished: productImage(
            'Golden Crust/Golden Crust Light_Polished_Urblo.jpeg',
            'Golden Crust Light polished finish',
        ),
    },
    'golden-crust--dark': {
        default: productImage(
            'Golden Crust/Golden Crust Dark_Flamed_Urblo.jpeg',
            'Golden Crust Dark flamed finish',
        ),
        flamed: productImage(
            'Golden Crust/Golden Crust Dark_Flamed_Urblo.jpeg',
            'Golden Crust Dark flamed finish',
        ),
        sawn: productImage(
            'Golden Crust/Golden Crust Dark_Sawn_Urblo.jpeg',
            'Golden Crust Dark sawn finish',
        ),
        honed: productImage(
            'Golden Crust/Golden Crust Dark_Honed_Urblo.jpeg',
            'Golden Crust Dark honed finish',
        ),
        polished: productImage(
            'Golden Crust/Golden Crust Dark_Polished_Urblo.jpeg',
            'Golden Crust Dark polished finish',
        ),
    },
    'tan-brown': {
        default: productImage(
            'Tan Brown/Tan Brown_Flamed_Urblo.jpeg',
            'Tan Brown flamed finish',
        ),
        flamed: productImage(
            'Tan Brown/Tan Brown_Flamed_Urblo.jpeg',
            'Tan Brown flamed finish',
        ),
        sawn: productImage(
            'Tan Brown/Tan Brown_Sawn_Urblo.jpeg',
            'Tan Brown sawn finish',
        ),
        honed: productImage(
            'Tan Brown/Tan Brown_Honed_Urblo.jpeg',
            'Tan Brown honed finish',
        ),
        polished: productImage(
            'Tan Brown/Tan Brown_Polished_Urblo.jpeg',
            'Tan Brown polished finish',
        ),
    },
    'tuscany': {
        default: productImage(
            'Tuscany/Tuscany_Vein Cut_Urblo.jpeg',
            'Tuscany stone surface',
        ),
    },
    'tuscany--vein-cut': {
        default: productImage(
            'Tuscany/Tuscany_Vein Cut_Urblo.jpeg',
            'Tuscany vein cut surface',
        ),
        honed: productImage(
            'Tuscany/Tuscany_Vein Cut_Urblo.jpeg',
            'Tuscany vein cut honed finish',
        ),
    },
    'tuscany--cross-cut': {
        default: productImage(
            'Tuscany/Tuscany_Cross Cut_Urblo.jpeg',
            'Tuscany cross cut surface',
        ),
        honed: productImage(
            'Tuscany/Tuscany_Cross Cut_Urblo.jpeg',
            'Tuscany cross cut honed finish',
        ),
    },
};

const finishSpecificOnlyVariants = new Set(['blueocean']);

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
