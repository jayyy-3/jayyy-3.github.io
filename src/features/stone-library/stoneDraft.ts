import { getFinishBehaviorMeta } from '../../data/finishBehaviorMeta';
import type {
  StoneCardVM,
  StoneDetailVM,
  StoneCutOptionRaw,
} from '../../types/stone-library';

export type StoneLifecycle = 'draft' | 'published' | 'archived';
export interface StoneImageDraft {
  key: string;
  id: number | null;
  mediaAssetId: number;
  role: 'primary' | 'secondary' | 'detail' | 'swatch';
}
export interface StoneFinishDraft {
  definitionId: number;
  capability: 'yes' | 'no' | 'tbc';
  behaviorNote: string;
  sources: string[];
  internalNote: string;
  images: StoneImageDraft[];
}
export interface StoneVariantDraft {
  key: string;
  id: number | null;
  slug: string;
  label: string;
  type: 'none' | 'shade' | 'cut_orientation';
  enabled: boolean;
  finishes: StoneFinishDraft[];
}
export interface StoneDraft {
  schemaVersion: 1;
  stone: {
    id: number | null;
    slug: string;
    name: string;
    type: string;
    availability: 'active' | 'tbc';
    summary: string;
    sourceName: string;
    originRegion: string;
    originCountry: string;
    pricingNote: string;
    priceTier: 1 | 2 | 3 | null;
    blockLength: number | null;
    blockWidth: number | null;
    blockHeight: number | null;
    internalNote: string;
    cutOptions: StoneCutOptionRaw[];
  };
  variants: StoneVariantDraft[];
}
export interface StoneFinishDefinition {
  id: number;
  key: string;
  name: string;
  sortOrder: number;
}
export interface StoneMedia {
  id: number;
  status: string;
  url: string | null;
  alt: string;
  name: string;
}
export interface StoneReference {
  module: 'projects' | 'products' | 'articles' | 'leads';
  id: number | null;
  name: string;
  path: string;
  live: boolean;
  variantId: number | null;
  finishId: number | null;
  source: 'content' | 'draft' | 'website' | 'history';
}
export interface StoneEnvelope {
  stoneId: number;
  revision: number;
  liveVersion: string;
  publishedRevision: number | null;
  status: StoneLifecycle;
  addressLocked: boolean;
  isTest: boolean;
  updatedAt: string;
  draft: StoneDraft;
}
export interface StoneListItem {
  id: number;
  slug: string;
  name: string;
  type: string;
  status: StoneLifecycle;
  availability: 'active' | 'tbc';
  isTest: boolean;
  hasChanges: boolean;
  cover: string | null;
  updatedAt: string;
}
export interface PublicStoneRecord {
  draft: StoneDraft;
  media: StoneMedia[];
}
export interface StoneCatalogue {
  managedKeys: string[];
  stones: PublicStoneRecord[];
  finishes: StoneFinishDefinition[];
}

export function stoneSlug(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

export function emptyVariant(
  finishes: StoneFinishDefinition[],
  type: StoneVariantDraft['type'] = 'none',
): StoneVariantDraft {
  return {
    key: crypto.randomUUID(),
    id: null,
    slug: '',
    label: '',
    type,
    enabled: true,
    finishes: finishes.map((f) => ({
      definitionId: f.id,
      capability: 'no',
      behaviorNote: '',
      sources: [],
      internalNote: '',
      images: [],
    })),
  };
}

export function emptyStone(finishes: StoneFinishDefinition[]): StoneDraft {
  return {
    schemaVersion: 1,
    stone: {
      id: null,
      slug: '',
      name: '',
      type: '',
      availability: 'active',
      summary: '',
      sourceName: '',
      originRegion: '',
      originCountry: '',
      pricingNote: '',
      priceTier: null,
      blockLength: null,
      blockWidth: null,
      blockHeight: null,
      internalNote: '',
      cutOptions: [],
    },
    variants: [emptyVariant(finishes)],
  };
}

/** A single mapper drives both the real page and the current unsaved preview. */
export function stoneDraftToDetail(
  draft: StoneDraft,
  definitions: StoneFinishDefinition[],
  media: readonly StoneMedia[],
  variantSlug?: string,
): StoneDetailVM | null {
  const variants = draft.variants.filter((v) => v.enabled);
  const variant = variants.find((v) => v.slug === variantSlug) || variants[0];
  if (!variant) return null;
  const mediaById = new Map(media.map((m) => [m.id, m]));
  const definitionsById = new Map(definitions.map((f) => [f.id, f]));
  const sorted = [...variant.finishes].sort(
    (a, b) =>
      (definitionsById.get(a.definitionId)?.sortOrder ?? 0) -
      (definitionsById.get(b.definitionId)?.sortOrder ?? 0),
  );
  const finishes = sorted
    .filter((f) => f.capability !== 'no')
    .flatMap((finish) => {
      const definition = definitionsById.get(finish.definitionId);
      if (!definition) return [];
      const [finishId, finishVariantId] = definition.key.split('__');
      const images = finish.images.filter(
        (i) => i.role !== 'swatch' && mediaById.get(i.mediaAssetId)?.url,
      );
      const primary = images.find((i) => i.role === 'primary') || images[0];
      const asset = primary ? mediaById.get(primary.mediaAssetId) : null;
      const behavior = getFinishBehaviorMeta(definition.key, finishId);
      return [
        {
          finishKey: definition.key,
          finishId,
          finishVariantId: finishVariantId || null,
          label: definition.name,
          sortOrder: definition.sortOrder,
          capability: finish.capability as 'yes' | 'tbc',
          sources: [],
          behavior: finish.behaviorNote
            ? { ...behavior, summary: finish.behaviorNote }
            : behavior,
          imageUrl: asset?.url || undefined,
          imageAlt: asset?.alt || `${draft.stone.name} ${definition.name}`,
          imageRole: asset?.url
            ? ('finish-specific' as const)
            : ('placeholder' as const),
          secondaryImages: images
            .filter((i) => i !== primary)
            .map((i) => ({
              imageUrl: mediaById.get(i.mediaAssetId)!.url!,
              imageAlt: mediaById.get(i.mediaAssetId)!.alt,
              label: i.role === 'detail' ? 'Detail frame' : 'Secondary frame',
            })),
        },
      ];
    });
  const s = draft.stone;
  const tiers = { 1: 'Budget', 2: 'Balanced', 3: 'Premium' } as const;
  const tier = s.availability === 'active' ? s.priceTier : null;
  return {
    stoneGroupId: s.slug,
    name: s.name,
    stoneType: s.type,
    status: s.availability,
    originLabel: '',
    rawBlockLabel: [s.blockLength, s.blockWidth, s.blockHeight].every(Boolean)
      ? `${s.blockLength} × ${s.blockWidth} × ${s.blockHeight} mm`
      : 'Confirm for your project',
    dlName: null,
    priceRange: s.pricingNote || 'Price on request',
    priceTierLevel: tier,
    priceTierLabel: tier ? tiers[tier] : null,
    pricePrimaryLabel: tier ? tiers[tier] : 'Price on request',
    availabilityLabel:
      s.availability === 'tbc'
        ? 'Availability to be confirmed'
        : 'Available for project sourcing',
    cutOptions: s.cutOptions,
    variants: variants.map((v) => ({
      stoneVariantId: v.slug,
      label: v.label || 'Standard',
      variantType: v.type,
      status: s.availability,
      sortOrder: variants.indexOf(v),
    })),
    activeVariantId: variant.slug,
    finishes,
    finishCapabilities: sorted.flatMap((f) => {
      const d = definitionsById.get(f.definitionId);
      return d
        ? [{ finishKey: d.key, label: d.name, capability: f.capability }]
        : [];
    }),
    defaultFinishKey: finishes[0]?.finishKey || null,
    contentSource: 'cms',
    summary: s.summary,
  };
}

export function stoneRecordToCard(
  record: PublicStoneRecord,
  definitions: StoneFinishDefinition[],
): StoneCardVM {
  const details = record.draft.variants
    .filter((v) => v.enabled)
    .map((v) =>
      stoneDraftToDetail(record.draft, definitions, record.media, v.slug),
    );
  const finishes = details.flatMap((d) => d?.finishes || []);
  const keys = [...new Set(finishes.map((f) => f.finishKey))];
  const cover = finishes.find((f) => f.imageUrl);
  return {
    stoneGroupId: record.draft.stone.slug,
    name: record.draft.stone.name,
    stoneType: record.draft.stone.type,
    status: record.draft.stone.availability,
    originLabel: '',
    finishCount: keys.length,
    availableFinishKeys: keys,
    coverImageUrl: cover?.imageUrl,
    coverImageAlt: cover?.imageAlt,
    variantCount: details.length,
  };
}

export function stoneMediaIds(draft: StoneDraft): number[] {
  return [
    ...new Set(
      draft.variants.flatMap((v) =>
        v.finishes.flatMap((f) => f.images.map((i) => i.mediaAssetId)),
      ),
    ),
  ];
}
