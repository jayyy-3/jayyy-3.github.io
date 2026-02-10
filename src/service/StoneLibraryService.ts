import stoneLibraryJson from '../../data/clean/stone_library.json';
import { getFinishBehaviorMeta } from '../data/finishBehaviorMeta';
import {
    getStoneDefaultImage,
    getStoneFinishImage,
} from '../data/stoneFinishImages';
import type { OptionItem } from '../types/product';
import type {
    FinishCapabilityVM,
    FinishKey,
    FinishVM,
    StoneCardFilters,
    StoneCardVM,
    StoneDetailVM,
    StoneFilterFacets,
    StoneFinishCapabilityRaw,
    StoneFinishRaw,
    StoneGroupRaw,
    StoneLibraryRaw,
    StonePriceTierLabel,
    StonePriceTierLevel,
    StoneStatus,
    StoneVariantRaw,
} from '../types/stone-library';

const stoneLibrary = stoneLibraryJson as StoneLibraryRaw;

const finishDefinitionByKey = new Map<FinishKey, StoneFinishRaw>(
    stoneLibrary.finishes.map((finish) => [
        toFinishKey(finish.finishId, finish.finishVariantId),
        finish,
    ]),
);

const variantAllowlistByStoneGroup: Record<string, string[]> = {
    'golden-crust': ['golden-crust--light', 'golden-crust--dark'],
    harcourt: ['harcourt'],
    tuscany: ['tuscany--vein-cut', 'tuscany--cross-cut'],
};

function toTitleCase(token: string): string {
    return token
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toStatusLabel(status: StoneStatus): string {
    return status === 'tbc' ? 'Upcoming' : 'Available';
}

function toAvailabilityLabel(status: StoneStatus): string {
    return status === 'tbc'
        ? 'Upcoming (TBC)'
        : 'Available for project sourcing';
}

function normalizeText(value: string): string {
    return value.trim().toLowerCase();
}

function toDisplayFinishLabel(capability: StoneFinishCapabilityRaw): string {
    const finishKey = toFinishKey(
        capability.finishId,
        capability.finishVariantId,
    );
    const finishDefinition = finishDefinitionByKey.get(finishKey);

    if (finishDefinition?.displayName) {
        return finishDefinition.displayName;
    }

    if (capability.finishVariantId) {
        return `${toTitleCase(capability.finishId)} (${toTitleCase(capability.finishVariantId)})`;
    }

    return toTitleCase(capability.finishId);
}

function toOriginLabel(stone: StoneGroupRaw): string {
    const region = stone.origin.regionDisplay;
    const country = stone.origin.countryDisplay;

    if (region && country) {
        return `${region}, ${country}`;
    }
    if (country) {
        return country;
    }
    if (stone.origin.source) {
        return stone.origin.source;
    }

    return 'Origin TBC';
}

function toRawBlockLabel(stone: StoneGroupRaw): string {
    if (stone.rawBlock.source) {
        return stone.rawBlock.source;
    }

    const { lengthMm, widthMm, heightMm } = stone.rawBlock;
    if (lengthMm && widthMm && heightMm) {
        return `${lengthMm} x ${widthMm} x ${heightMm} mm`;
    }

    return 'Raw block size on request';
}

function isPriceTierLevel(value: number | null): value is StonePriceTierLevel {
    return value === 1 || value === 2 || value === 3;
}

const priceTierLabelByLevel: Record<StonePriceTierLevel, StonePriceTierLabel> = {
    1: 'Budget',
    2: 'Balanced',
    3: 'Premium',
};

function toPricePresentation(stone: StoneGroupRaw): {
    priceRange: string;
    priceTierLevel: StonePriceTierLevel | null;
    priceTierLabel: StonePriceTierLabel | null;
    pricePrimaryLabel: string;
} {
    const priceRange = stone.price.source?.trim() || 'Price on request';

    if (stone.status !== 'active' || !isPriceTierLevel(stone.price.tier)) {
        return {
            priceRange,
            priceTierLevel: null,
            priceTierLabel: null,
            pricePrimaryLabel: 'Price on request',
        };
    }

    const priceTierLevel = stone.price.tier;
    const priceTierLabel = priceTierLabelByLevel[priceTierLevel];

    return {
        priceRange,
        priceTierLevel,
        priceTierLabel,
        pricePrimaryLabel: priceTierLabel,
    };
}

function compareBySortOrder<T extends { sortOrder: number }>(a: T, b: T): number {
    return a.sortOrder - b.sortOrder;
}

function compareByLabel<T extends { label: string }>(a: T, b: T): number {
    return a.label.localeCompare(b.label);
}

export function toFinishKey(
    finishId: string,
    finishVariantId?: string | null,
): FinishKey {
    return finishVariantId ? `${finishId}__${finishVariantId}` : finishId;
}

function getAvailableFinishCapabilities(
    variant: StoneVariantRaw,
): StoneFinishCapabilityRaw[] {
    return variant.finishCapabilities.filter(
        (capability) => capability.capability !== 'no',
    );
}

function mapFinishCapabilityVM(
    capability: StoneFinishCapabilityRaw,
): FinishCapabilityVM {
    return {
        finishKey: toFinishKey(
            capability.finishId,
            capability.finishVariantId,
        ),
        label: toDisplayFinishLabel(capability),
        capability: capability.capability,
    };
}

function mapAvailableFinishVM(
    stoneVariantId: string,
    capability: StoneFinishCapabilityRaw,
): FinishVM {
    const finishKey = toFinishKey(
        capability.finishId,
        capability.finishVariantId,
    );
    const finishDefinition = finishDefinitionByKey.get(finishKey);
    const imageAsset = getStoneFinishImage(stoneVariantId, finishKey);

    return {
        finishKey,
        finishId: capability.finishId,
        finishVariantId: capability.finishVariantId,
        label: toDisplayFinishLabel(capability),
        sortOrder: finishDefinition?.sortOrder ?? 999,
        capability: capability.capability === 'tbc' ? 'tbc' : 'yes',
        sources: capability.sources,
        behavior: getFinishBehaviorMeta(finishKey, capability.finishId),
        imageUrl: imageAsset?.imageUrl,
        thumbUrl: imageAsset?.thumbUrl,
        imageAlt: imageAsset?.alt,
    };
}

function getNormalizedVariants(stone: StoneGroupRaw): StoneVariantRaw[] {
    const allowlist = variantAllowlistByStoneGroup[stone.stoneGroupId];
    const sortedOriginal = [...stone.variants].sort(compareBySortOrder);

    if (!allowlist) {
        return sortedOriginal;
    }

    const allowed = sortedOriginal.filter((variant) =>
        allowlist.includes(variant.stoneVariantId),
    );

    return allowed.length ? allowed : sortedOriginal;
}

function pickCoverImage(stone: StoneGroupRaw): {
    coverImageUrl?: string;
    coverImageAlt?: string;
} {
    const sortedVariants = getNormalizedVariants(stone);

    for (const variant of sortedVariants) {
        const availableCapabilities = getAvailableFinishCapabilities(variant);
        const firstAvailable = availableCapabilities
            .map((capability) =>
                mapAvailableFinishVM(variant.stoneVariantId, capability),
            )
            .sort(compareBySortOrder)[0];

        if (firstAvailable?.imageUrl) {
            return {
                coverImageUrl: firstAvailable.imageUrl,
                coverImageAlt: firstAvailable.imageAlt,
            };
        }

        const defaultImage = getStoneDefaultImage(variant.stoneVariantId);
        if (defaultImage?.imageUrl) {
            return {
                coverImageUrl: defaultImage.imageUrl,
                coverImageAlt: defaultImage.alt,
            };
        }
    }

    return {};
}

function mapStoneCard(stone: StoneGroupRaw): StoneCardVM {
    const normalizedVariants = getNormalizedVariants(stone);
    const availableFinishKeys = Array.from(
        new Set(
            normalizedVariants
                .flatMap(getAvailableFinishCapabilities)
                .map((capability) =>
                    toFinishKey(capability.finishId, capability.finishVariantId),
                ),
        ),
    );

    const cover = pickCoverImage(stone);

    return {
        stoneGroupId: stone.stoneGroupId,
        name: stone.displayName,
        status: stone.status,
        stoneType: stone.type.display,
        originLabel: toOriginLabel(stone),
        finishCount: availableFinishKeys.length,
        availableFinishKeys,
        coverImageUrl: cover.coverImageUrl,
        coverImageAlt: cover.coverImageAlt,
        variantCount: normalizedVariants.length,
    };
}

function sortCapabilitiesByFinishOrder(
    capabilities: StoneFinishCapabilityRaw[],
): StoneFinishCapabilityRaw[] {
    return [...capabilities].sort((a, b) => {
        const finishA = finishDefinitionByKey.get(
            toFinishKey(a.finishId, a.finishVariantId),
        );
        const finishB = finishDefinitionByKey.get(
            toFinishKey(b.finishId, b.finishVariantId),
        );

        return (finishA?.sortOrder ?? 999) - (finishB?.sortOrder ?? 999);
    });
}

function placeholderStoneImage(label: string): string {
    const escapedLabel = label.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 960 640'>
<defs>
<linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
<stop offset='0%' stop-color='#161616'/>
<stop offset='100%' stop-color='#3a3a3a'/>
</linearGradient>
</defs>
<rect width='960' height='640' fill='url(#g)'/>
<text x='50%' y='48%' font-family='Arial, sans-serif' font-size='48' fill='#00FF19' text-anchor='middle'>IMAGE COMING SOON</text>
<text x='50%' y='58%' font-family='Arial, sans-serif' font-size='36' fill='#f5f5f5' text-anchor='middle'>${escapedLabel}</text>
</svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

class StoneLibraryService {
    static getStoneCards(filters: StoneCardFilters = {}): StoneCardVM[] {
        const query = filters.query ? normalizeText(filters.query) : '';

        return stoneLibrary.stones
            .map(mapStoneCard)
            .filter((card) => {
                if (filters.stoneType && card.stoneType !== filters.stoneType) {
                    return false;
                }

                if (
                    filters.finishKey &&
                    !card.availableFinishKeys.includes(filters.finishKey)
                ) {
                    return false;
                }

                if (!query) {
                    return true;
                }

                const searchable = [card.name, card.stoneType, card.originLabel]
                    .join(' ')
                    .toLowerCase();

                return searchable.includes(query);
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    static getFilterFacets(): StoneFilterFacets {
        const cards = stoneLibrary.stones.map(mapStoneCard);

        const typeCounter = new Map<string, number>();
        cards.forEach((card) => {
            typeCounter.set(
                card.stoneType,
                (typeCounter.get(card.stoneType) || 0) + 1,
            );
        });

        const finishCounter = new Map<FinishKey, number>();
        cards.forEach((card) => {
            card.availableFinishKeys.forEach((finishKey) => {
                finishCounter.set(finishKey, (finishCounter.get(finishKey) || 0) + 1);
            });
        });

        const stoneTypes = Array.from(typeCounter.entries())
            .map(([stoneType, count]) => ({
                value: stoneType,
                label: stoneType,
                count,
            }))
            .sort(compareByLabel);

        const finishes = stoneLibrary.finishes
            .map((finish) => {
                const finishKey = toFinishKey(
                    finish.finishId,
                    finish.finishVariantId,
                );
                return {
                    value: finishKey,
                    label: finish.displayName,
                    count: finishCounter.get(finishKey) || 0,
                    sortOrder: finish.sortOrder,
                };
            })
            .filter((finish) => finish.count > 0)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(({ value, label, count }) => ({ value, label, count }));

        return {
            stoneTypes,
            finishes,
        };
    }

    static getStoneDetail(
        stoneGroupId: string,
        variantId?: string,
    ): StoneDetailVM | null {
        const stone = stoneLibrary.stones.find(
            (entry) => entry.stoneGroupId === stoneGroupId,
        );

        if (!stone) {
            return null;
        }

        const sortedVariants = getNormalizedVariants(stone);
        const activeVariant =
            sortedVariants.find((variant) => variant.stoneVariantId === variantId) ||
            sortedVariants[0];

        if (!activeVariant) {
            return null;
        }

        const availableFinishes = sortCapabilitiesByFinishOrder(
            getAvailableFinishCapabilities(activeVariant),
        )
            .map((capability) =>
                mapAvailableFinishVM(activeVariant.stoneVariantId, capability),
            )
            .map((finish) => {
                if (finish.imageUrl) {
                    return finish;
                }

                const fallbackImage = getStoneDefaultImage(activeVariant.stoneVariantId);
                return {
                    ...finish,
                    imageUrl:
                        fallbackImage?.imageUrl || placeholderStoneImage(stone.displayName),
                    imageAlt: fallbackImage?.alt || `${stone.displayName} finish preview`,
                };
            });

        const finishCapabilities = sortCapabilitiesByFinishOrder(
            activeVariant.finishCapabilities,
        ).map(mapFinishCapabilityVM);

        const defaultFinishKey = availableFinishes[0]?.finishKey || null;
        const pricePresentation = toPricePresentation(stone);

        return {
            stoneGroupId: stone.stoneGroupId,
            name: stone.displayName,
            status: stone.status,
            stoneType: stone.type.display,
            originLabel: toOriginLabel(stone),
            rawBlockLabel: toRawBlockLabel(stone),
            dlName: stone.dlName,
            priceRange: pricePresentation.priceRange,
            priceTierLevel: pricePresentation.priceTierLevel,
            priceTierLabel: pricePresentation.priceTierLabel,
            pricePrimaryLabel: pricePresentation.pricePrimaryLabel,
            availabilityLabel: toAvailabilityLabel(stone.status),
            cutOptions: stone.cutOptions,
            variants: sortedVariants.map((variant) => ({
                stoneVariantId: variant.stoneVariantId,
                label: variant.displayVariant || 'Standard',
                variantType: variant.variantType,
                status: variant.status,
                sortOrder: variant.sortOrder,
            })),
            activeVariantId: activeVariant.stoneVariantId,
            finishes: availableFinishes,
            finishCapabilities,
            defaultFinishKey,
        };
    }

    static getStoneOptionsForProducts(): OptionItem[] {
        return stoneLibrary.stones
            .flatMap((stone) => {
                const sortedVariants = getNormalizedVariants(stone);
                return sortedVariants.map((variant) => {
                    const defaultImage = getStoneDefaultImage(variant.stoneVariantId);
                    const name = variant.displayVariant
                        ? `${stone.displayName} (${variant.displayVariant})`
                        : stone.displayName;

                    return {
                        slug: variant.stoneVariantId,
                        name,
                        img: defaultImage?.imageUrl || placeholderStoneImage(name),
                    };
                });
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    static getStoneGroupOptionsForProducts(): OptionItem[] {
        return stoneLibrary.stones
            .map((stone) => {
                const cover = pickCoverImage(stone);

                return {
                    slug: stone.stoneGroupId,
                    name: stone.displayName,
                    img:
                        cover.coverImageUrl || placeholderStoneImage(stone.displayName),
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    static getStatusLabel(status: StoneStatus): string {
        return toStatusLabel(status);
    }
}

export default StoneLibraryService;
