import { describe, expect, it } from 'vitest';
import {
    COMPARE_STORAGE_KEY,
    MAX_COMPARE_STONES,
    compareFullMessage,
    compareHref,
    libraryHrefWithSelection,
    parseStoneIdList,
    readStoredCompareSelection,
    sampleRequestHref,
    toCompareSelection,
    toggleCompareId,
    writeStoredCompareSelection,
} from './stoneCompareSelection';

function memoryStorage(initial: Record<string, string> = {}) {
    const values = new Map(Object.entries(initial));
    return {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => void values.set(key, value),
        removeItem: (key: string) => void values.delete(key),
        values,
    };
}

describe('compare selection parsing', () => {
    it('trims, de-duplicates and drops malformed ids in first-seen order', () => {
        expect(parseStoneIdList(' juparana,zen-grey,,juparana, bad id ,<x>,tuscany ')).toEqual([
            'juparana',
            'zen-grey',
            'tuscany',
        ]);
        expect(parseStoneIdList(null)).toEqual([]);
    });

    it('caps a URL or stored selection at four stones', () => {
        expect(MAX_COMPARE_STONES).toBe(4);
        expect(toCompareSelection('a,b,c,d,e,f')).toEqual(['a', 'b', 'c', 'd']);
    });
});

describe('compare toggle', () => {
    it('adds, removes and refuses a fifth stone without changing the selection', () => {
        expect(toggleCompareId([], 'a')).toEqual({ ids: ['a'], outcome: 'added' });
        expect(toggleCompareId(['a', 'b'], 'a')).toEqual({ ids: ['b'], outcome: 'removed' });
        const full = ['a', 'b', 'c', 'd'];
        expect(toggleCompareId(full, 'e')).toEqual({ ids: full, outcome: 'full' });
        expect(toggleCompareId(full, 'c')).toEqual({ ids: ['a', 'b', 'd'], outcome: 'removed' });
        expect(compareFullMessage('Juparana')).toBe('Compare holds up to 4 stones. Remove one to add Juparana.');
    });
});

describe('compare links', () => {
    it('builds the compare page, list-with-tray and sample request URLs', () => {
        expect(compareHref(['juparana', 'zen-grey'])).toBe('/stone-library/compare?stones=juparana,zen-grey');
        expect(libraryHrefWithSelection(['juparana'])).toBe('/stone-library?compare=juparana');
        expect(libraryHrefWithSelection([])).toBe('/stone-library');
        const sample = new URL(sampleRequestHref(['Juparana', 'Zen Grey']), 'https://urblo.com.au');
        expect(sample.pathname).toBe('/contact');
        expect(sample.searchParams.get('intent')).toBe('sample-request');
        expect(sample.searchParams.get('stone')).toBe('Juparana, Zen Grey');
    });

    it('keeps the prefill within the form Function limit', () => {
        const long = sampleRequestHref(Array.from({ length: 4 }, () => 'x'.repeat(60)));
        const stone = new URL(long, 'https://urblo.com.au').searchParams.get('stone') ?? '';
        expect(stone.length).toBeLessThanOrEqual(160);
    });
});

describe('compare storage', () => {
    it('round-trips the selection and removes the key when empty', () => {
        const storage = memoryStorage();
        writeStoredCompareSelection(['a', 'b'], storage);
        expect(storage.values.get(COMPARE_STORAGE_KEY)).toBe('a,b');
        expect(readStoredCompareSelection(storage)).toEqual(['a', 'b']);
        writeStoredCompareSelection([], storage);
        expect(storage.values.has(COMPARE_STORAGE_KEY)).toBe(false);
    });

    it('treats missing or throwing storage as an empty selection', () => {
        expect(readStoredCompareSelection(null)).toEqual([]);
        const throwing = {
            getItem: () => {
                throw new Error('blocked');
            },
            setItem: () => {
                throw new Error('blocked');
            },
            removeItem: () => {
                throw new Error('blocked');
            },
        };
        expect(readStoredCompareSelection(throwing)).toEqual([]);
        expect(() => writeStoredCompareSelection(['a'], throwing)).not.toThrow();
    });
});
