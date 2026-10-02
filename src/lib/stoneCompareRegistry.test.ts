import { describe, expect, it } from 'vitest';
import { finishOrder, staticSubject } from './stoneCompare.testUtils';
import {
    areCompareCellsEqual,
    buildCompareRows,
    filterCompareRows,
    formatBlockSize,
    getPublicCompareAttributes,
    listCompareFinishOptions,
    pickDefaultCompareFinish,
    stoneCompareRegistry,
    type StoneCompareContext,
} from './stoneCompareRegistry';

describe('attribute registry', () => {
    it('declares every field the page relies on, with unique keys', () => {
        const keys = stoneCompareRegistry.map((attribute) => attribute.key);
        expect(new Set(keys).size).toBe(keys.length);
        for (const attribute of stoneCompareRegistry) {
            expect(attribute.label).toBeTruthy();
            expect(attribute.source).toBeTruthy();
            expect(['text', 'number', 'boolean', 'matrix', 'image', 'list', 'checklist']).toContain(attribute.kind);
            expect(typeof attribute.public).toBe('boolean');
            expect(Number.isFinite(attribute.order)).toBe(true);
        }
    });

    it('ships the approved v1 rows in order and keeps origin internal', () => {
        expect(getPublicCompareAttributes().map((attribute) => attribute.key)).toEqual([
            'finish-image',
            'type',
            'available-as',
            'price-tier',
            'finish-capability',
            'cut-options',
            'raw-block',
            'variants',
            'used-in-projects',
        ]);
        const origin = stoneCompareRegistry.find((attribute) => attribute.key === 'origin');
        expect(origin?.public).toBe(false);
        // Finish behaviour text is deliberately not a comparison row (Jay, 2026-09-28).
        expect(stoneCompareRegistry.some((attribute) => /behaviou?r/i.test(`${attribute.key} ${attribute.label}`))).toBe(false);
    });

    it('resolves each row with the declared kind', () => {
        const subject = staticSubject('tuscany');
        const ctx: StoneCompareContext = { finishKey: 'honed', finishOrder };
        for (const attribute of stoneCompareRegistry) {
            expect(attribute.resolve(subject, ctx).kind).toBe(attribute.kind);
        }
    });

    it('never produces an origin row, even when the stone carries an origin value', () => {
        const subject = staticSubject('alpine-white');
        subject.detail = { ...subject.detail, originLabel: 'ZZ-origin-sentinel' };
        const rows = buildCompareRows([subject], { finishKey: null, finishOrder });
        expect(rows.some((row) => row.attribute.key === 'origin')).toBe(false);
        expect(JSON.stringify(rows.map((row) => row.cells))).not.toContain('ZZ-origin-sentinel');
    });
});

describe('row values', () => {
    it('formats raw block sizes from any source notation', () => {
        expect(formatBlockSize('2000x1000x750')).toBe('2000 × 1000 × 750');
        expect(formatBlockSize('2500*1500*1500')).toBe('2500 × 1500 × 1500');
        expect(formatBlockSize('2400 × 1200 × 750 mm')).toBe('2400 × 1200 × 750');
        expect(formatBlockSize('Confirm for your project')).toBe('Confirm for your project');
    });

    it('shows a finish photograph, a pending state or not offered, never another finish photo', () => {
        const juparana = staticSubject('juparana');
        const tuscany = staticSubject('tuscany');
        const attribute = stoneCompareRegistry.find((entry) => entry.key === 'finish-image')!;
        const flamed = { finishKey: 'flamed', finishOrder };
        const juparanaFlamed = attribute.resolve(juparana, flamed);
        expect(juparanaFlamed).toMatchObject({ kind: 'image', state: 'image' });
        // Tuscany offers Honed only.
        expect(attribute.resolve(tuscany, flamed)).toEqual({ kind: 'image', state: 'not-offered' });
    });

    it('lists every Available as option with its offered state', () => {
        const subject = staticSubject('juparana');
        subject.detail = {
            ...subject.detail,
            availableAs: [
                { key: 'blocks', label: 'Blocks', offered: true },
                { key: 'pavers', label: 'Pavers', offered: false },
                { key: 'cladding', label: 'Cladding', offered: true },
            ],
        };
        const cell = stoneCompareRegistry.find((entry) => entry.key === 'available-as')!.resolve(subject, {
            finishKey: null,
            finishOrder,
        });
        expect(cell).toEqual({
            kind: 'checklist',
            entries: [
                { label: 'Blocks', offered: true },
                { label: 'Pavers', offered: false },
                { label: 'Cladding', offered: true },
            ],
        });
        // Static stones offer every fallback option.
        const fallback = stoneCompareRegistry.find((entry) => entry.key === 'available-as')!.resolve(staticSubject('tuscany'), {
            finishKey: null,
            finishOrder,
        });
        expect(fallback).toEqual({
            kind: 'checklist',
            entries: ['Blocks', 'Pavers', 'Cladding'].map((label) => ({ label, offered: true })),
        });
    });

    it('aggregates finish capability across variants', () => {
        const golden = staticSubject('golden-crust');
        const matrix = stoneCompareRegistry.find((entry) => entry.key === 'finish-capability')!.resolve(golden, {
            finishKey: null,
            finishOrder,
        });
        expect(matrix.kind).toBe('matrix');
        if (matrix.kind !== 'matrix') return;
        for (const variant of golden.variants) {
            for (const capability of variant.finishCapabilities.filter((entry) => entry.capability === 'yes')) {
                expect(matrix.entries.find((entry) => entry.key === capability.finishKey)?.value).toBe('yes');
            }
        }
    });

    it('lists the finishes offered by any compared stone and defaults to the best-covered one', () => {
        const stones = [staticSubject('juparana'), staticSubject('tuscany')];
        const options = listCompareFinishOptions(stones, finishOrder);
        const sortOrders = options.map((option) => finishOrder.get(option.key)?.sortOrder ?? 999);
        expect(sortOrders).toEqual([...sortOrders].sort((a, b) => a - b));
        expect(options.find((option) => option.key === 'honed')?.offeredBy).toBe(2);
        expect(pickDefaultCompareFinish(stones, finishOrder)).toBe(
            [...options].sort((a, b) => b.withImage - a.withImage || b.offeredBy - a.offeredBy)[0].key,
        );
    });
});

describe('differences rule', () => {
    it('compares text case- and space-insensitively and includes the meter', () => {
        expect(areCompareCellsEqual({ kind: 'text', text: 'Granite' }, { kind: 'text', text: ' granite ' })).toBe(true);
        expect(
            areCompareCellsEqual(
                { kind: 'text', text: 'Budget', meter: { value: 1, max: 3 } },
                { kind: 'text', text: 'Budget', meter: { value: 2, max: 3 } },
            ),
        ).toBe(false);
    });

    it('compares lists as sets and numbers with their links', () => {
        expect(
            areCompareCellsEqual(
                { kind: 'list', items: [{ label: 'Vein cut' }, { label: 'Cross cut' }] },
                { kind: 'list', items: [{ label: 'Cross cut' }, { label: 'Vein cut' }] },
            ),
        ).toBe(true);
        expect(
            areCompareCellsEqual(
                { kind: 'number', value: 1, links: [{ label: 'The Glen', to: '/projects/the-glen' }] },
                { kind: 'number', value: 1, links: [{ label: 'Moon Gate', to: '/projects/moon-gate' }] },
            ),
        ).toBe(false);
        expect(areCompareCellsEqual({ kind: 'boolean', value: true }, { kind: 'boolean', value: true })).toBe(true);
    });

    it('treats photographs as different and equal empty states as the same', () => {
        expect(
            areCompareCellsEqual(
                { kind: 'image', state: 'image', src: 'a.jpg' },
                { kind: 'image', state: 'image', src: 'b.jpg' },
            ),
        ).toBe(false);
        expect(
            areCompareCellsEqual({ kind: 'image', state: 'not-offered' }, { kind: 'image', state: 'not-offered' }),
        ).toBe(true);
        expect(areCompareCellsEqual({ kind: 'image', state: 'pending' }, { kind: 'image', state: 'not-offered' })).toBe(false);
    });

    it('hides identical rows and identical finish rows inside the matrix', () => {
        // Alpine White and Angola Black are both Granite with different price tiers.
        const stones = [staticSubject('alpine-white'), staticSubject('angola-black')];
        const rows = buildCompareRows(stones, { finishKey: 'flamed', finishOrder });
        const byKey = new Map(rows.map((row) => [row.attribute.key, row]));
        expect(byKey.get('type')?.identical).toBe(true);
        expect(byKey.get('price-tier')?.identical).toBe(false);

        const visible = filterCompareRows(rows, true);
        expect(visible.some((row) => row.attribute.key === 'type')).toBe(false);
        expect(visible.some((row) => row.attribute.key === 'price-tier')).toBe(true);
        const matrix = rows.find((row) => row.attribute.key === 'finish-capability')!;
        const visibleMatrix = visible.find((row) => row.attribute.key === 'finish-capability');
        if (visibleMatrix) {
            expect(visibleMatrix.matrixRows!.every((row) => !row.identical)).toBe(true);
            expect(visibleMatrix.matrixRows!.length).toBe(matrix.matrixRows!.filter((row) => !row.identical).length);
        } else {
            expect(matrix.matrixRows!.every((row) => row.identical)).toBe(true);
        }
        expect(filterCompareRows(rows, false)).toHaveLength(rows.length);
    });

    it('detects Available as differences per option and ignores order', () => {
        const entries = (pavers: boolean) => [
            { label: 'Blocks', offered: true },
            { label: 'Pavers', offered: pavers },
        ];
        expect(
            areCompareCellsEqual(
                { kind: 'checklist', entries: entries(true) },
                { kind: 'checklist', entries: [...entries(true)].reverse() },
            ),
        ).toBe(true);
        expect(
            areCompareCellsEqual({ kind: 'checklist', entries: entries(true) }, { kind: 'checklist', entries: entries(false) }),
        ).toBe(false);

        const alpine = staticSubject('alpine-white');
        const angola = staticSubject('angola-black');
        const same = buildCompareRows([alpine, angola], { finishKey: null, finishOrder });
        expect(same.find((row) => row.attribute.key === 'available-as')?.identical).toBe(true);
        expect(filterCompareRows(same, true).some((row) => row.attribute.key === 'available-as')).toBe(false);
        angola.detail = {
            ...angola.detail,
            availableAs: angola.detail.availableAs.map((option) =>
                option.key === 'cladding' ? { ...option, offered: false } : option,
            ),
        };
        const differ = buildCompareRows([alpine, angola], { finishKey: null, finishOrder });
        expect(filterCompareRows(differ, true).some((row) => row.attribute.key === 'available-as')).toBe(true);
    });

    it('treats every row as identical for a single stone', () => {
        const rows = buildCompareRows([staticSubject('juparana')], { finishKey: 'flamed', finishOrder });
        expect(rows.every((row) => row.identical)).toBe(true);
    });
});
