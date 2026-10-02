import { describe, expect, it } from 'vitest';
import { emptyStone, stoneDraftToDetail, type StoneFinishDefinition } from './stoneDraft';
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
