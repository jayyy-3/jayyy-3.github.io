import stoneLibraryJson from '../../data/clean/stone_library.json';
import { getFinishBehaviorMeta } from '../data/finishBehaviorMeta';
import {
    getStoneDefaultImage,
    getStoneFinishImageResolution,
} from '../data/stoneFinishImages';
import { getPublicContentClient } from '../lib/publicContentClient';
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
    StoneFinishImageRole,
    StoneLibraryRaw,
    StonePriceTierLabel,
    StonePriceTierLevel,
    StoneStatus,
    StoneVariantRaw,
} from '../types/stone-library';

const stoneLibrary = stoneLibraryJson as StoneLibraryRaw;

type PublishedStoneGroupRow = {
    id: number;
    stone_group_key: string;
    display_name: string;
    status: 'published' | 'tbc';
    stone_type_display: string | null;
    origin_region: string | null;
    origin_country: string | null;
};

type PublishedVariantRow = {
    id: number;
    stone_group_id: number;
    variant_key: string;
};

type PublishedCapabilityRow = {
    stone_variant_id: number;
    capability: 'yes' | 'no' | 'tbc';
    finish_definitions?: {
        finish_key: string;
        display_name: string;
        sort_order: number;
    } | {
        finish_key: string;
        display_name: string;
        sort_order: number;
    }[] | null;
};

type PublishedImageRow = {
    stone_group_id: number | null;
    stone_variant_id: number | null;
    finish_definition_id: number | null;
    sort_order: number;
    media_assets?: {
        source_url: string | null;
        alt: string | null;
    } | {
        source_url: string | null;
        alt: string | null;
    }[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
    return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

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
    const imageResolution = getStoneFinishImageResolution(stoneVariantId, finishKey);
    const imageAsset = imageResolution.asset;
    const secondaryImages = (imageAsset?.secondaryImages ?? [])
        .filter((image) => image.imageUrl)
        .map((image, index) => ({
            imageUrl: image.imageUrl,
            thumbUrl: image.thumbUrl,
            imageAlt: image.alt,
            label: image.label || `Secondary frame ${index + 1}`,
        }));

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
        imageRole: imageResolution.role,
        secondaryImages,
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
<stop offset='0%' stop-color='#f4f4f1'/>
<stop offset='100%' stop-color='#d9dad5'/>
</linearGradient>
<pattern id='p' width='28' height='28' patternUnits='userSpaceOnUse'>
<path d='M0 28L28 0' stroke='rgba(0,0,0,0.08)' stroke-width='1'/>
</pattern>
</defs>
<rect width='960' height='640' fill='url(#g)'/>
<rect width='960' height='640' fill='url(#p)' opacity='0.35'/>
<rect x='72' y='72' width='816' height='496' fill='none' stroke='rgba(0,0,0,0.22)' stroke-width='2'/>
<text x='50%' y='48%' font-family='Arial, sans-serif' font-size='42' font-weight='700' fill='#33363F' text-anchor='middle' letter-spacing='4'>IMAGE COMING SOON</text>
<text x='50%' y='58%' font-family='Arial, sans-serif' font-size='30' fill='#6b6d72' text-anchor='middle'>${escapedLabel}</text>
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

    static async getPublishedStoneCards(filters: StoneCardFilters = {}): Promise<StoneCardVM[]> {
        const supabase = getPublicContentClient();
        if (!supabase) {
            return [];
        }

        const { data: groups, error: groupError } = await supabase
            .from('stone_groups')
            .select('id, stone_group_key, display_name, status, stone_type_display, origin_region, origin_country')
            .eq('status', 'published')
            .order('sort_order', { ascending: true });

        if (groupError || !groups?.length) {
            return [];
        }

        const groupRows = groups as PublishedStoneGroupRow[];
        const groupIds = groupRows.map((group) => group.id);
        const { data: variants } = await supabase
            .from('stone_variants')
            .select('id, stone_group_id, variant_key')
            .in('stone_group_id', groupIds)
            .eq('status', 'published')
            .order('sort_order', { ascending: true });

        const variantRows = (variants ?? []) as PublishedVariantRow[];
        const variantIds = variantRows.map((variant) => variant.id);
        const { data: capabilities } = variantIds.length
            ? await supabase
                .from('stone_finish_capabilities')
                .select('stone_variant_id, capability, finish_definitions (finish_key, display_name, sort_order)')
                .in('stone_variant_id', variantIds)
            : { data: [] };

        const { data: images } = await supabase
            .from('stone_finish_images')
            .select('stone_group_id, stone_variant_id, finish_definition_id, sort_order, media_assets (source_url, alt)')
            .in('stone_group_id', groupIds)
            .eq('status', 'published')
            .order('sort_order', { ascending: true });

        const variantsByGroup = new Map<number, PublishedVariantRow[]>();
        for (const variant of variantRows) {
            variantsByGroup.set(variant.stone_group_id, [...(variantsByGroup.get(variant.stone_group_id) ?? []), variant]);
        }

        const capabilitiesByVariant = new Map<number, PublishedCapabilityRow[]>();
        for (const capability of (capabilities ?? []) as unknown as PublishedCapabilityRow[]) {
            capabilitiesByVariant.set(capability.stone_variant_id, [
                ...(capabilitiesByVariant.get(capability.stone_variant_id) ?? []),
                capability,
            ]);
        }

        const imagesByGroup = new Map<number, PublishedImageRow[]>();
        for (const image of (images ?? []) as unknown as PublishedImageRow[]) {
            if (!image.stone_group_id) continue;
            imagesByGroup.set(image.stone_group_id, [...(imagesByGroup.get(image.stone_group_id) ?? []), image]);
        }

        const query = filters.query ? normalizeText(filters.query) : '';
        return groupRows
            .map((group) => {
                const groupVariants = variantsByGroup.get(group.id) ?? [];
                const finishKeys = Array.from(
                    new Set(
                        groupVariants.flatMap((variant) =>
                            (capabilitiesByVariant.get(variant.id) ?? [])
                                .filter((capability) => capability.capability !== 'no')
                                .map((capability) => firstRelation(capability.finish_definitions)?.finish_key)
                                .filter((finishKey): finishKey is string => Boolean(finishKey)),
                        ),
                    ),
                );
                const cover = imagesByGroup.get(group.id)?.find((image) => firstRelation(image.media_assets)?.source_url);
                const originLabel = [group.origin_region, group.origin_country].filter(Boolean).join(', ') || 'Origin TBC';

                return {
                    stoneGroupId: group.stone_group_key,
                    name: group.display_name,
                    status: group.status === 'tbc' ? 'tbc' as const : 'active' as const,
                    stoneType: group.stone_type_display || 'Stone',
                    originLabel,
                    finishCount: finishKeys.length,
                    availableFinishKeys: finishKeys,
                    coverImageUrl: firstRelation(cover?.media_assets)?.source_url || undefined,
                    coverImageAlt: firstRelation(cover?.media_assets)?.alt || group.display_name,
                    variantCount: groupVariants.length,
                };
            })
            .filter((card) => {
                if (filters.stoneType && card.stoneType !== filters.stoneType) return false;
                if (filters.finishKey && !card.availableFinishKeys.includes(filters.finishKey)) return false;
                if (!query) return true;
                return [card.name, card.stoneType, card.originLabel].join(' ').toLowerCase().includes(query);
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    static async getPublishedFilterFacets(): Promise<StoneFilterFacets | null> {
        const cards = await StoneLibraryService.getPublishedStoneCards();
        if (!cards.length) {
            return null;
        }

        const typeCounter = new Map<string, number>();
        const finishCounter = new Map<string, number>();
        cards.forEach((card) => {
            typeCounter.set(card.stoneType, (typeCounter.get(card.stoneType) ?? 0) + 1);
            card.availableFinishKeys.forEach((finishKey) => {
                finishCounter.set(finishKey, (finishCounter.get(finishKey) ?? 0) + 1);
            });
        });

        return {
            stoneTypes: Array.from(typeCounter.entries())
                .map(([value, count]) => ({ value, label: value, count }))
                .sort(compareByLabel),
            finishes: Array.from(finishCounter.entries())
                .map(([value, count]) => ({
                    value,
                    label: finishDefinitionByKey.get(value as FinishKey)?.displayName || toTitleCase(value),
                    count,
                }))
                .sort(compareByLabel),
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
                const imageRole: StoneFinishImageRole = fallbackImage?.imageUrl
                    ? 'reference'
                    : 'placeholder';
                return {
                    ...finish,
                    imageUrl:
                        fallbackImage?.imageUrl || placeholderStoneImage(stone.displayName),
                    imageAlt: fallbackImage?.alt || `${stone.displayName} finish preview`,
                    imageRole,
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
                    const imageState: OptionItem['imageState'] = defaultImage?.imageUrl
                        ? 'ready'
                        : 'pending';

                    return {
                        slug: variant.stoneVariantId,
                        name,
                        img: defaultImage?.imageUrl || placeholderStoneImage(name),
                        imageState,
                    };
                });
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    static getStoneGroupOptionsForProducts(): OptionItem[] {
        return stoneLibrary.stones
            .map((stone) => {
                const cover = pickCoverImage(stone);
                const imageState: OptionItem['imageState'] = cover.coverImageUrl
                    ? 'ready'
                    : 'pending';

                return {
                    slug: stone.stoneGroupId,
                    name: stone.displayName,
                    img:
                        cover.coverImageUrl || placeholderStoneImage(stone.displayName),
                    imageState,
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    static getStatusLabel(status: StoneStatus): string {
        return toStatusLabel(status);
    }
}

export default StoneLibraryService;
