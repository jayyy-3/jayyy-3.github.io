/**
 * Stone Library comparison selection: pure helpers shared by the list tray, the detail
 * toggle and the compare page. The selection is an ordered list of stone group ids,
 * capped at MAX_COMPARE_STONES, persisted in `?compare=` on the list and in localStorage.
 */
export const MAX_COMPARE_STONES = 4;
export const COMPARE_STORAGE_KEY = 'urblo:stone-compare';
/** List-page query parameter carrying the tray selection. */
export const COMPARE_SELECTION_PARAM = 'compare';
/** Compare-page query parameter carrying the compared stones. */
export const COMPARE_PAGE_PARAM = 'stones';
const COMPARE_PAGE_PATH = '/stone-library/compare';

const STONE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{0,199}$/;

export type CompareToggleResult = { ids: string[]; outcome: 'added' | 'removed' | 'full' };

/**
 * Parses a comma-separated id list: trims, drops empty and malformed values and
 * duplicates, keeps the first-seen order. It does not cap; callers decide what to do with
 * extra ids so they can tell the reader.
 */
export function parseStoneIdList(value: string | null | undefined): string[] {
    if (!value) return [];
    const ids: string[] = [];
    for (const part of value.split(',')) {
        const id = part.trim();
        if (id && STONE_ID_PATTERN.test(id) && !ids.includes(id)) ids.push(id);
    }
    return ids;
}

export function serializeStoneIdList(ids: readonly string[]): string {
    return ids.join(',');
}

/** Selection from a URL or storage value, capped at MAX_COMPARE_STONES. */
export function toCompareSelection(value: string | null | undefined): string[] {
    return parseStoneIdList(value).slice(0, MAX_COMPARE_STONES);
}

export function toggleCompareId(ids: readonly string[], id: string): CompareToggleResult {
    if (ids.includes(id)) return { ids: ids.filter((entry) => entry !== id), outcome: 'removed' };
    if (ids.length >= MAX_COMPARE_STONES) return { ids: [...ids], outcome: 'full' };
    return { ids: [...ids, id], outcome: 'added' };
}

export function compareHref(ids: readonly string[]): string {
    return ids.length
        ? `${COMPARE_PAGE_PATH}?${COMPARE_PAGE_PARAM}=${serializeStoneIdList(ids)}`
        : COMPARE_PAGE_PATH;
}

/** The list page with the tray reopened on this selection ("Edit selection"). */
export function libraryHrefWithSelection(ids: readonly string[]): string {
    return ids.length
        ? `/stone-library?${COMPARE_SELECTION_PARAM}=${serializeStoneIdList(ids)}`
        : '/stone-library';
}

/** The Contact form Function stores the stone preference up to 160 characters. */
const SAMPLE_STONE_MAX_LENGTH = 160;

/**
 * Sample request prefill: the existing Contact sample form already reads
 * `intent=sample-request` and `stone` (free text), so no new parameter is needed.
 */
export function sampleRequestHref(stoneNames: readonly string[]): string {
    const params = new URLSearchParams({ intent: 'sample-request' });
    const stone = stoneNames.join(', ').slice(0, SAMPLE_STONE_MAX_LENGTH);
    if (stone) params.set('stone', stone);
    return `/contact?${params.toString()}`;
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function defaultStorage(): StorageLike | null {
    try {
        return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
        return null;
    }
}

/** Storage can be missing or throw (private windows, blocked site data); selection then lives in the URL only. */
export function readStoredCompareSelection(storage: StorageLike | null = defaultStorage()): string[] {
    try {
        return toCompareSelection(storage?.getItem(COMPARE_STORAGE_KEY));
    } catch {
        return [];
    }
}

export function writeStoredCompareSelection(
    ids: readonly string[],
    storage: StorageLike | null = defaultStorage(),
): void {
    try {
        if (!storage) return;
        if (ids.length) storage.setItem(COMPARE_STORAGE_KEY, serializeStoneIdList(ids));
        else storage.removeItem(COMPARE_STORAGE_KEY);
    } catch {
        // Selection still works for this page view.
    }
}

export function compareFullMessage(name?: string): string {
    return name
        ? `Compare holds up to ${MAX_COMPARE_STONES} stones. Remove one to add ${name}.`
        : `Compare holds up to ${MAX_COMPARE_STONES} stones. Remove one to add another.`;
}
