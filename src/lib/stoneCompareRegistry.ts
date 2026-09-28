/**
 * Stone Library comparison attribute registry (NOW-STONE-COMPARE-001).
 *
 * The compare page iterates this ordered array and never hard-codes an attribute: adding a
 * descriptor adds a row. Each descriptor declares its source, label, optional unit, kind,
 * public flag and order, and resolves one cell per stone. Only `public: true` descriptors
 * ever reach the page (origin stays internal, see docs/architecture/stone-library.md).
 *
 * Layer 2 (future task): the same descriptor shape is meant to be fed from CMS-managed
 * attribute definitions once Stone data is fully CMS-managed; `resolve` then reads a stored
 * value instead of a view-model field.
 */
import type { StoneProjectUsage } from '../service/ProjectService';
import type {
    FinishCapability,
    FinishKey,
    StoneDetailVM,
    StoneFinishImageRole,
} from '../types/stone-library';

export type CompareAttributeKind = 'text' | 'number' | 'boolean' | 'matrix' | 'image' | 'list';

export interface CompareLink {
    label: string;
    to?: string;
}

export type CompareCell =
    | {
          kind: 'text';
          text: string | null;
          /** Optional stepped meter (price tier): `value` of `max` steps. */
          meter?: { value: number; max: number };
      }
    | { kind: 'number'; value: number | null; display?: string; links?: CompareLink[] }
    | { kind: 'boolean'; value: boolean | null }
    | { kind: 'matrix'; entries: { key: FinishKey; value: FinishCapability }[] }
    | {
          kind: 'image';
          /** image: a photograph exists · pending: offered, no photograph yet · not-offered: finish not offered. */
          state: 'image' | 'pending' | 'not-offered';
          src?: string;
          alt?: string;
          role?: StoneFinishImageRole;
          caption?: string;
          to?: string;
      }
    | { kind: 'list'; items: CompareLink[] };

export type CompareCellOf<K extends CompareAttributeKind> = Extract<CompareCell, { kind: K }>;

/** One compared stone: default-variant detail, all enabled variants and public Project usages. */
export interface StoneCompareSubject {
    detail: StoneDetailVM;
    variants: StoneDetailVM[];
    usages: StoneProjectUsage[];
}

export interface StoneCompareContext {
    /** Finish shown in the image row, shared across every column. */
    finishKey: FinishKey | null;
    finishOrder: ReadonlyMap<FinishKey, { label: string; sortOrder: number }>;
}

export interface StoneCompareAttribute {
    key: string;
    label: string;
    unit?: string;
    /** Short reading aid under the label, e.g. `L × W × H`. */
    hint?: string;
    kind: CompareAttributeKind;
    /** False keeps the attribute internal: it is never rendered on a public page. */
    public: boolean;
    order: number;
    /** Where the value comes from, for reviewers and the future CMS-managed definitions. */
    source: string;
    resolve: (stone: StoneCompareSubject, ctx: StoneCompareContext) => CompareCell;
}

function titleCase(value: string): string {
    return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function finishLabel(key: FinishKey, ctx: StoneCompareContext): string {
    return ctx.finishOrder.get(key)?.label || titleCase(key.replace('__', ' '));
}

function stoneHref(detail: StoneDetailVM, params: Record<string, string> = {}): string {
    const query = new URLSearchParams(params).toString();
    return `/stone-library/${detail.stoneGroupId}${query ? `?${query}` : ''}`;
}

const DIMENSIONS = /(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)/i;

/** `2000x1000x750`, `2500*1500*1500` and `2000 × 1000 × 750 mm` read as `2000 × 1000 × 750`. */
export function formatBlockSize(label: string): string | null {
    const match = DIMENSIONS.exec(label);
    if (match) return `${match[1]} × ${match[2]} × ${match[3]}`;
    const trimmed = label.trim();
    return trimmed || null;
}

const CAPABILITY_RANK: Record<FinishCapability, number> = { no: 0, tbc: 1, yes: 2 };

/** Group-level capability: a finish counts as offered when any enabled variant offers it. */
export function stoneFinishCapabilities(stone: StoneCompareSubject): Map<FinishKey, FinishCapability> {
    const result = new Map<FinishKey, FinishCapability>();
    for (const variant of stone.variants.length ? stone.variants : [stone.detail]) {
        for (const entry of variant.finishCapabilities) {
            const current = result.get(entry.finishKey);
            if (!current || CAPABILITY_RANK[entry.capability] > CAPABILITY_RANK[current]) {
                result.set(entry.finishKey, entry.capability);
            }
        }
    }
    return result;
}

function resolveFinishImage(stone: StoneCompareSubject, ctx: StoneCompareContext): CompareCellOf<'image'> {
    const { finishKey } = ctx;
    if (!finishKey) return { kind: 'image', state: 'pending' };
    const variants = [stone.detail, ...stone.variants.filter((v) => v.activeVariantId !== stone.detail.activeVariantId)];
    const multiVariant = stone.variants.length > 1;
    let offered: { variant: StoneDetailVM; finish: StoneDetailVM['finishes'][number] } | null = null;
    for (const variant of variants) {
        const finish = variant.finishes.find((entry) => entry.finishKey === finishKey);
        if (!finish) continue;
        offered ??= { variant, finish };
        if (finish.imageUrl && finish.imageRole !== 'placeholder') {
            offered = { variant, finish };
            break;
        }
    }
    if (!offered) return { kind: 'image', state: 'not-offered' };
    const { variant, finish } = offered;
    const variantLabel = multiVariant ? variant.variants.find((v) => v.stoneVariantId === variant.activeVariantId)?.label : null;
    const caption = [finish.label, variantLabel, finish.capability === 'tbc' ? 'To be confirmed' : null]
        .filter(Boolean)
        .join(' · ');
    const to = stoneHref(stone.detail, {
        ...(multiVariant ? { variant: variant.activeVariantId } : {}),
        finish: finishKey,
    });
    if (!finish.imageUrl || finish.imageRole === 'placeholder') {
        return { kind: 'image', state: 'pending', caption, to };
    }
    return {
        kind: 'image',
        state: 'image',
        src: finish.imageUrl,
        alt: finish.imageAlt || `${stone.detail.name} ${finish.label}`,
        role: finish.imageRole,
        caption,
        to,
    };
}

export const stoneCompareRegistry: readonly StoneCompareAttribute[] = [
    {
        key: 'finish-image',
        label: 'Finish',
        kind: 'image',
        public: true,
        order: 10,
        source: 'StoneDetailVM.finishes[finishKey] (sized Stone image variants)',
        resolve: resolveFinishImage,
    },
    {
        key: 'type',
        label: 'Type',
        kind: 'text',
        public: true,
        order: 20,
        source: 'StoneDetailVM.stoneType',
        resolve: ({ detail }) => ({ kind: 'text', text: detail.stoneType || null }),
    },
    {
        key: 'price-tier',
        label: 'Price tier',
        hint: 'Indicative',
        kind: 'text',
        public: true,
        order: 30,
        source: 'StoneDetailVM.pricePrimaryLabel / priceTierLevel',
        resolve: ({ detail }) => ({
            kind: 'text',
            text: detail.pricePrimaryLabel,
            ...(detail.priceTierLevel ? { meter: { value: detail.priceTierLevel, max: 3 } } : {}),
        }),
    },
    {
        key: 'finish-capability',
        label: 'Finish capability',
        kind: 'matrix',
        public: true,
        order: 40,
        source: 'StoneDetailVM.finishCapabilities across enabled variants',
        resolve: (stone) => ({
            kind: 'matrix',
            entries: [...stoneFinishCapabilities(stone)].map(([key, value]) => ({ key, value })),
        }),
    },
    {
        key: 'cut-options',
        label: 'Cut options',
        kind: 'list',
        public: true,
        order: 50,
        source: 'StoneDetailVM.cutOptions (available only)',
        resolve: ({ detail }) => ({
            kind: 'list',
            items: detail.cutOptions
                .filter((cut) => cut.available)
                .map((cut) => ({ label: `${titleCase(cut.cutOrientation)} cut` })),
        }),
    },
    {
        key: 'raw-block',
        label: 'Raw block',
        unit: 'mm',
        hint: 'L × W × H',
        kind: 'text',
        public: true,
        order: 60,
        source: 'StoneDetailVM.rawBlockLabel',
        resolve: ({ detail }) => ({ kind: 'text', text: formatBlockSize(detail.rawBlockLabel) }),
    },
    {
        key: 'variants',
        label: 'Variants',
        kind: 'list',
        public: true,
        order: 70,
        source: 'StoneDetailVM.variants',
        resolve: ({ detail }) => ({
            kind: 'list',
            items: detail.variants.map((variant) => ({
                label: variant.label,
                to:
                    detail.variants.length > 1
                        ? stoneHref(detail, { variant: variant.stoneVariantId })
                        : undefined,
            })),
        }),
    },
    {
        key: 'used-in-projects',
        label: 'Used in projects',
        kind: 'number',
        public: true,
        order: 80,
        source: 'findStoneProjectUsages over the public Project collection',
        resolve: ({ usages }) => ({
            kind: 'number',
            value: usages.length,
            display: usages.length === 1 ? '1 project' : `${usages.length} projects`,
            links: usages.map(({ project }) => ({
                label: project.listing.title || project.name,
                to: `/projects/${project.slug}`,
            })),
        }),
    },
    {
        // Internal sourcing field: public Stone Library surfaces must not disclose origin.
        key: 'origin',
        label: 'Origin',
        kind: 'text',
        public: false,
        order: 900,
        source: 'StoneDetailVM.originLabel (internal)',
        resolve: ({ detail }) => ({ kind: 'text', text: detail.originLabel || null }),
    },
];

/** The only way attributes reach the page: public descriptors in `order`. */
export function getPublicCompareAttributes(
    registry: readonly StoneCompareAttribute[] = stoneCompareRegistry,
): StoneCompareAttribute[] {
    return registry
        .filter((attribute) => attribute.public === true)
        .sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
}

// ---------------------------------------------------------------------------------------
// Differences rule
// ---------------------------------------------------------------------------------------

function normalizeText(value: string | null | undefined): string {
    return (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function linkSignature(links: readonly CompareLink[] | undefined): string {
    return (links ?? []).map((link) => normalizeText(link.label)).sort().join('|');
}

/**
 * Equality per kind. text: normalised text and meter · number: value and display (plus
 * linked labels) · boolean: value · list: the same set of labels in any order · image: the
 * same state and the same photograph (two stones never share one, so images differ unless
 * every column is equally without a photograph) · matrix: compared per finish by the row
 * builder, never as a whole.
 */
export function areCompareCellsEqual(a: CompareCell, b: CompareCell): boolean {
    if (a.kind !== b.kind) return false;
    switch (a.kind) {
        case 'text': {
            const other = b as CompareCellOf<'text'>;
            return (
                normalizeText(a.text) === normalizeText(other.text) &&
                (a.meter?.value ?? null) === (other.meter?.value ?? null)
            );
        }
        case 'number': {
            const other = b as CompareCellOf<'number'>;
            return a.value === other.value && linkSignature(a.links) === linkSignature(other.links);
        }
        case 'boolean':
            return a.value === (b as CompareCellOf<'boolean'>).value;
        case 'list':
            return linkSignature(a.items) === linkSignature((b as CompareCellOf<'list'>).items);
        case 'image': {
            const other = b as CompareCellOf<'image'>;
            return a.state === other.state && (a.src ?? null) === (other.src ?? null);
        }
        case 'matrix': {
            const other = b as CompareCellOf<'matrix'>;
            const left = new Map(a.entries.map((entry) => [entry.key, entry.value]));
            const right = new Map(other.entries.map((entry) => [entry.key, entry.value]));
            const keys = new Set([...left.keys(), ...right.keys()]);
            return [...keys].every((key) => (left.get(key) ?? 'no') === (right.get(key) ?? 'no'));
        }
    }
}

function allEqual<T>(values: readonly T[], equal: (a: T, b: T) => boolean): boolean {
    return values.every((value) => equal(values[0], value));
}

export interface CompareMatrixRow {
    key: FinishKey;
    label: string;
    values: FinishCapability[];
    identical: boolean;
}

export interface CompareRow {
    attribute: StoneCompareAttribute;
    cells: CompareCell[];
    /** Every column holds the same value (always true with one stone). */
    identical: boolean;
    /** Matrix attributes only: one row per finish across the compared stones. */
    matrixRows?: CompareMatrixRow[];
}

/** Resolves every public attribute for every stone, in registry order. */
export function buildCompareRows(
    stones: readonly StoneCompareSubject[],
    ctx: StoneCompareContext,
    registry: readonly StoneCompareAttribute[] = stoneCompareRegistry,
): CompareRow[] {
    return getPublicCompareAttributes(registry).map((attribute) => {
        const cells = stones.map((stone) => attribute.resolve(stone, ctx));
        if (attribute.kind !== 'matrix') {
            return { attribute, cells, identical: allEqual(cells, areCompareCellsEqual) };
        }
        const maps = cells.map(
            (cell) => new Map(cell.kind === 'matrix' ? cell.entries.map((e) => [e.key, e.value] as const) : []),
        );
        const keys = [...new Set(maps.flatMap((map) => [...map.keys()]))].sort(
            (a, b) =>
                (ctx.finishOrder.get(a)?.sortOrder ?? 999) - (ctx.finishOrder.get(b)?.sortOrder ?? 999) ||
                finishLabel(a, ctx).localeCompare(finishLabel(b, ctx)),
        );
        // A finish no compared stone offers carries no information, so it gets no row.
        const matrixRows = keys
            .map((key) => {
                const values = maps.map((map) => map.get(key) ?? 'no');
                return { key, label: finishLabel(key, ctx), values, identical: values.every((v) => v === values[0]) };
            })
            .filter((row) => row.values.some((value) => value !== 'no'));
        return { attribute, cells, identical: matrixRows.every((row) => row.identical), matrixRows };
    });
}

/** "Differences only": drops identical rows, and identical finish rows inside a matrix. */
export function filterCompareRows(rows: readonly CompareRow[], differencesOnly: boolean): CompareRow[] {
    if (!differencesOnly) return [...rows];
    return rows
        .filter((row) => !row.identical)
        .map((row) => (row.matrixRows ? { ...row, matrixRows: row.matrixRows.filter((m) => !m.identical) } : row));
}

/**
 * Default finish for the shared image row: the finish with a photograph for the most
 * compared stones, then the finish offered by the most stones, then catalogue order.
 */
export function pickDefaultCompareFinish(
    stones: readonly StoneCompareSubject[],
    finishOrder: StoneCompareContext['finishOrder'],
): FinishKey | null {
    const options = listCompareFinishOptions(stones, finishOrder);
    if (!options.length) return null;
    return [...options].sort((a, b) => b.withImage - a.withImage || b.offeredBy - a.offeredBy)[0].key;
}

export interface CompareFinishOption {
    key: FinishKey;
    label: string;
    /** Compared stones that offer this finish (yes or to be confirmed). */
    offeredBy: number;
    withImage: number;
}

/** Finishes offered by at least one compared stone, in catalogue order. */
export function listCompareFinishOptions(
    stones: readonly StoneCompareSubject[],
    finishOrder: StoneCompareContext['finishOrder'],
): CompareFinishOption[] {
    const byKey = new Map<FinishKey, CompareFinishOption>();
    for (const stone of stones) {
        const variants = stone.variants.length ? stone.variants : [stone.detail];
        const offered = new Map<FinishKey, boolean>();
        for (const variant of variants) {
            for (const finish of variant.finishes) {
                const hasImage = Boolean(finish.imageUrl) && finish.imageRole !== 'placeholder';
                offered.set(finish.finishKey, (offered.get(finish.finishKey) ?? false) || hasImage);
            }
        }
        for (const [key, hasImage] of offered) {
            const option = byKey.get(key) ?? {
                key,
                label: finishOrder.get(key)?.label || titleCase(key.replace('__', ' ')),
                offeredBy: 0,
                withImage: 0,
            };
            option.offeredBy += 1;
            if (hasImage) option.withImage += 1;
            byKey.set(key, option);
        }
    }
    return [...byKey.values()].sort(
        (a, b) =>
            (finishOrder.get(a.key)?.sortOrder ?? 999) - (finishOrder.get(b.key)?.sortOrder ?? 999) ||
            a.label.localeCompare(b.label),
    );
}
