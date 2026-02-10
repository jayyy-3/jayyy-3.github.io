export type StoneStatus = 'active' | 'tbc';
export type FinishCapability = 'yes' | 'no' | 'tbc';
export type FinishKey = string;
export type StonePriceTierLevel = 1 | 2 | 3;
export type StonePriceTierLabel = 'Budget' | 'Balanced' | 'Premium';

export interface StoneFinishRaw {
    finishId: string;
    finishVariantId: string | null;
    displayName: string;
    sourceNames: string[];
    sortOrder: number;
}

export interface StoneFinishCapabilityRaw {
    finishId: string;
    finishVariantId: string | null;
    capability: FinishCapability;
    sources: string[];
    notes?: string | null;
}

export interface StoneVariantRaw {
    stoneVariantId: string;
    displayVariant: string | null;
    sourceVariant: string | null;
    variantType: string;
    status: StoneStatus;
    sortOrder: number;
    finishCapabilities: StoneFinishCapabilityRaw[];
}

export interface StoneCutOptionRaw {
    cutOrientation: string;
    available: boolean;
    sources: string[];
}

export interface StoneGroupRaw {
    stoneGroupId: string;
    displayName: string;
    sourceName: string;
    status: StoneStatus;
    dlName: string | null;
    type: {
        source: string;
        display: string;
    };
    origin: {
        source: string;
        regionDisplay: string | null;
        countryDisplay: string | null;
    };
    price: {
        source: string;
        tier: number | null;
    };
    rawBlock: {
        source: string;
        lengthMm: number | null;
        widthMm: number | null;
        heightMm: number | null;
    };
    cutOptions: StoneCutOptionRaw[];
    variants: StoneVariantRaw[];
}

export interface StoneLibraryRaw {
    generatedAt: string;
    finishes: StoneFinishRaw[];
    stones: StoneGroupRaw[];
}

export interface FinishBehaviorMeta {
    summary: string;
    slip: string;
    glare: string;
    maintenance: string;
}

export interface FinishVM {
    finishKey: FinishKey;
    finishId: string;
    finishVariantId: string | null;
    label: string;
    sortOrder: number;
    capability: Exclude<FinishCapability, 'no'>;
    sources: string[];
    behavior: FinishBehaviorMeta;
    imageUrl?: string;
    thumbUrl?: string;
    imageAlt?: string;
}

export interface FinishCapabilityVM {
    finishKey: FinishKey;
    label: string;
    capability: FinishCapability;
}

export interface StoneVariantVM {
    stoneVariantId: string;
    label: string;
    variantType: string;
    status: StoneStatus;
    sortOrder: number;
}

export interface StoneCardVM {
    stoneGroupId: string;
    name: string;
    status: StoneStatus;
    stoneType: string;
    originLabel: string;
    finishCount: number;
    availableFinishKeys: FinishKey[];
    coverImageUrl?: string;
    coverImageAlt?: string;
    variantCount: number;
}

export interface StoneDetailVM {
    stoneGroupId: string;
    name: string;
    status: StoneStatus;
    stoneType: string;
    originLabel: string;
    rawBlockLabel: string;
    dlName: string | null;
    priceRange: string;
    priceTierLevel: StonePriceTierLevel | null;
    priceTierLabel: StonePriceTierLabel | null;
    pricePrimaryLabel: string;
    availabilityLabel: string;
    cutOptions: StoneCutOptionRaw[];
    variants: StoneVariantVM[];
    activeVariantId: string;
    finishes: FinishVM[];
    finishCapabilities: FinishCapabilityVM[];
    defaultFinishKey: FinishKey | null;
}

export interface StoneCardFilters {
    query?: string;
    stoneType?: string;
    finishKey?: FinishKey;
}

export interface StoneFilterFacet {
    value: string;
    label: string;
    count: number;
}

export interface StoneFilterFacets {
    stoneTypes: StoneFilterFacet[];
    finishes: StoneFilterFacet[];
}
