import { describe, expect, it } from 'vitest';
import { emptyStone, stoneDraftToDetail, withPublishedFinishes, type StoneFinishDefinition } from './stoneDraft';
import { STATIC_AVAILABILITY_OPTIONS, expandAvailableAs, type StoneAvailabilityOption } from './availableAs';

const finishes: StoneFinishDefinition[] = [{ id: 1, key: 'flamed', name: 'Flamed', sortOrder: 1 }];
// Deliberately out of order: rendering follows sortOrder, never input order.
const options: StoneAvailabilityOption[] = [
    { id: 3, key: 'cladding', name: 'Cladding', sortOrder: 30 },
    { id: 1, key: 'blocks', name: 'Blocks', sortOrder: 10 },
    { id: 2, key: 'pavers', name: 'Pavers', sortOrder: 20 },
];

function draft(availableAs: string[]) {
    const d = emptyStone(finishes, options);
    d.stone.name = 'Fixture';
    d.stone.slug = 'fixture';
    d.stone.type = 'Granite';
    d.stone.availableAs = availableAs;
    d.variants[0].slug = 'fixture';
    d.variants[0].finishes[0].capability = 'yes';
    return d;
}

describe('Available as mapping', () => {
    it('lists every published option in order and marks each offered or not', () => {
        const detail = stoneDraftToDetail(draft(['cladding', 'blocks']), finishes, [], undefined, options);
        expect(detail?.availableAs).toEqual([
            { key: 'blocks', label: 'Blocks', offered: true },
            { key: 'pavers', label: 'Pavers', offered: false },
            { key: 'cladding', label: 'Cladding', offered: true },
        ]);
    });

    it('drops keys that are no longer published', () => {
        const detail = stoneDraftToDetail(draft(['blocks', 'kerbs']), finishes, [], undefined, options);
        expect(detail?.availableAs.map((o) => o.key)).toEqual(['blocks', 'pavers', 'cladding']);
        expect(detail?.availableAs.filter((o) => o.offered).map((o) => o.key)).toEqual(['blocks']);
    });

    it('defaults a new stone to every published option', () => {
        expect(emptyStone(finishes, options).stone.availableAs).toEqual(['blocks', 'pavers', 'cladding']);
        expect(emptyStone(finishes).stone.availableAs).toEqual([]);
    });

    it('treats a record without a selection as offering every option (static or pre-migration)', () => {
        expect(expandAvailableAs(STATIC_AVAILABILITY_OPTIONS, undefined).every((o) => o.offered)).toBe(true);
        expect(expandAvailableAs(options, []).some((o) => o.offered)).toBe(false);
    });

    it('no longer couples price tier or variants to a stone status', () => {
        const d = draft([]);
        d.stone.priceTier = 2;
        const detail = stoneDraftToDetail(d, finishes, [], undefined, options)!;
        expect(detail.pricePrimaryLabel).toBe('Balanced');
        expect(detail).not.toHaveProperty('status');
        expect(detail).not.toHaveProperty('availabilityLabel');
        expect(detail.variants[0]).not.toHaveProperty('status');
    });
});

describe('withPublishedFinishes', () => {
    const defs: StoneFinishDefinition[] = [
        { id: 1, key: 'flamed', name: 'Flamed', sortOrder: 10 },
        { id: 2, key: 'sawn', name: 'Sawn', sortOrder: 20 },
        { id: 3, key: 'honed', name: 'Honed', sortOrder: 15 },
        { id: 4, key: 'leather', name: 'Leather', sortOrder: 30 },
    ];
    const saved = () => {
        const d = emptyStone([defs[0], defs[1]], options);
        d.variants[0].finishes[0].capability = 'yes';
        d.variants[0].finishes[0].behaviorNote = 'kept';
        d.variants.push({ ...structuredClone(d.variants[0]), key: 'second' });
        return d;
    };

    it('adds every missing published finish to every variant as not offered', () => {
        const merged = withPublishedFinishes(saved(), defs);
        for (const v of merged.variants) {
            expect(v.finishes.map((f) => f.definitionId)).toEqual([1, 3, 2, 4]);
            expect(v.finishes[3]).toEqual({
                definitionId: 4, capability: 'no', behaviorNote: '', sources: [], internalNote: '', images: [],
            });
        }
    });

    it('keeps existing entries untouched and sorts by definition sortOrder', () => {
        const merged = withPublishedFinishes(saved(), defs);
        expect(merged.variants[0].finishes[0]).toMatchObject({ definitionId: 1, capability: 'yes', behaviorNote: 'kept' });
        expect(merged.variants[0].finishes.map((f) => f.definitionId)).toEqual([1, 3, 2, 4]);
    });

    it('keeps entries whose definition is no longer published, after the known ones', () => {
        const d = saved();
        d.variants[0].finishes.unshift({ definitionId: 99, capability: 'yes', behaviorNote: '', sources: [], internalNote: '', images: [] });
        const merged = withPublishedFinishes(d, defs);
        expect(merged.variants[0].finishes.map((f) => f.definitionId)).toEqual([1, 3, 2, 4, 99]);
        expect(merged.variants[0].finishes[4].capability).toBe('yes');
    });

    it('is idempotent and returns the same draft when nothing is missing', () => {
        const once = withPublishedFinishes(saved(), defs);
        expect(withPublishedFinishes(once, defs)).toBe(once);
        const complete = emptyStone(defs, options);
        expect(withPublishedFinishes(complete, defs)).toBe(complete);
    });

    it('does not mutate its input', () => {
        const d = saved();
        const copy = structuredClone(d);
        withPublishedFinishes(d, defs);
        expect(d).toEqual(copy);
    });
});
