import type { FinishKey } from '../types/stone-library';

export interface StoneImageAsset {
    imageUrl: string;
    thumbUrl?: string;
    alt?: string;
}

type VariantImageMap = Partial<Record<FinishKey | 'default', StoneImageAsset>>;

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
): StoneImageAsset {
    return {
        imageUrl: resolveProductImage(relativePath),
        thumbUrl: thumbPath ? resolveProductImage(thumbPath) : undefined,
        alt,
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
        ),
        flamed: productImage(
            'Zen Grey/Zen Grey_Flamed_Urblo_1.jpeg',
            'Zen Grey flamed finish',
        ),
        sawn: productImage(
            'Zen Grey/Zen Grey_Sawn_Urblo_1.jpeg',
            'Zen Grey sawn finish',
        ),
        honed: productImage(
            'Zen Grey/Zen Grey_Honed_Urblo_1.jpeg',
            'Zen Grey honed finish',
        ),
        polished: productImage(
            'Zen Grey/Zen Grey_Polished_Urblo_1.jpeg',
            'Zen Grey polished finish',
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
        ),
        flamed: productImage(
            'Juparana/Juparana_Flamed_Urblo_1.jpeg',
            'Juparana flamed finish',
        ),
        sawn: productImage(
            'Juparana/Juparana_Sawn_Urblo_1.jpeg',
            'Juparana sawn finish',
        ),
        honed: productImage(
            'Juparana/Juparana_Honed_Urblo_1.jpeg',
            'Juparana honed finish',
        ),
        polished: productImage(
            'Juparana/Juparana_Polished_Urblo_1.jpeg',
            'Juparana polished finish',
        ),
    },
    'ivory-sand': {
        default: productImage(
            'Sandstone/Sandstone_Sawn_Urblo.jpeg',
            'Ivory Sand honed finish',
        ),
        honed: productImage(
            'Sandstone/Sandstone_Sawn_Urblo.jpeg',
            'Ivory Sand honed finish',
        ),
        bush_hammered: productImage(
            'Sandstone/Sandstone_Bush-hammered_Urblo.jpeg',
            'Ivory Sand bush hammered finish',
        ),
        sparrow_peck: productImage(
            'Sandstone/Sandstone_Sparrow_Urblo.jpeg',
            'Ivory Sand sparrow peck finish',
        ),
    },
    'blueocean': {
        default: {
            imageUrl: 'https://urblo.com.au/wp-content/uploads/2024/12/Blueocean-Sawn-1.jpg',
            alt: 'Blueocean stone surface',
        },
    },
    'honey-comb': {
        default: {
            imageUrl: 'https://urblo.com.au/wp-content/uploads/2024/12/Blueocean-Sawn-1.jpg',
            alt: 'Honey Comb stone surface',
        },
    },
    'tuscany': {
        default: {
            imageUrl: 'https://urblo.com.au/wp-content/uploads/2024/12/Toscany-1-1.jpg',
            alt: 'Tuscany stone surface',
        },
    },
    'tuscany--vein-cut': {
        default: {
            imageUrl: 'https://urblo.com.au/wp-content/uploads/2024/12/Toscany-1-1.jpg',
            alt: 'Tuscany vein cut surface',
        },
    },
    'tuscany--cross-cut': {
        default: {
            imageUrl: 'https://urblo.com.au/wp-content/uploads/2024/12/Creama-1-1.jpg',
            alt: 'Tuscany cross cut surface',
        },
    },
};

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
    const variantMap = getVariantMap(stoneVariantId);
    const finishBaseKey = baseFinishKey(finishKey);

    if (variantMap?.[finishKey]) {
        return variantMap[finishKey];
    }
    if (variantMap?.[finishBaseKey]) {
        return variantMap[finishBaseKey];
    }

    const baseVariantId = stoneVariantId.split('--')[0] ?? stoneVariantId;
    const groupMap = getVariantMap(baseVariantId);

    if (groupMap?.[finishKey]) {
        return groupMap[finishKey];
    }
    if (groupMap?.[finishBaseKey]) {
        return groupMap[finishBaseKey];
    }

    return variantMap?.default || groupMap?.default;
}
