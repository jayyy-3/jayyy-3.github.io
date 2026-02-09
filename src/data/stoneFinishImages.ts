import type { FinishKey } from '../types/stone-library';

export interface StoneImageAsset {
    imageUrl: string;
    thumbUrl?: string;
    alt?: string;
}

type VariantImageMap = Partial<Record<FinishKey | 'default', StoneImageAsset>>;

const stoneFinishImages: Record<string, VariantImageMap> = {
    'new-grey': {
        default: {
            imageUrl: 'https://urblo.com.au/wp-content/uploads/2024/12/New-Grey-1.jpg',
            alt: 'New Grey stone surface',
        },
    },
    'zen-grey': {
        default: {
            imageUrl: 'https://urblo.com.au/wp-content/uploads/2024/12/New-Grey-1-1.jpg',
            alt: 'Zen Grey stone surface',
        },
    },
    'alpine-white': {
        default: {
            imageUrl: 'https://urblo.com.au/wp-content/uploads/2024/12/Sesame-White-1.jpg',
            alt: 'Alpine White stone surface',
        },
    },
    'angola-black': {
        default: {
            imageUrl: 'https://urblo.com.au/wp-content/uploads/2024/12/Ken-Black-1.jpg',
            alt: 'Angola Black stone surface',
        },
    },
    'steel-blue': {
        default: {
            imageUrl: 'https://urblo.com.au/wp-content/uploads/2024/12/Antline-scaled-1.jpg',
            alt: 'Steel Blue stone surface',
        },
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
    'ivory-sand': {
        default: {
            imageUrl: 'https://urblo.com.au/wp-content/uploads/2024/12/Creama-1-1.jpg',
            alt: 'Ivory Sand stone surface',
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
