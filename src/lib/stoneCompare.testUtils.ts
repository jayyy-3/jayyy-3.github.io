// Static Stone Library fixtures for the comparison vitest suites.
import stoneLibraryJson from '../../data/clean/stone_library.json';
import StoneLibraryService, { toFinishKey } from '../service/StoneLibraryService';
import type { StoneLibraryRaw } from '../types/stone-library';
import type { StoneCompareContext, StoneCompareSubject } from './stoneCompareRegistry';

export const finishOrder: StoneCompareContext['finishOrder'] = new Map(
    (stoneLibraryJson as StoneLibraryRaw).finishes.map((finish) => [
        toFinishKey(finish.finishId, finish.finishVariantId),
        { label: finish.displayName, sortOrder: finish.sortOrder },
    ]),
);

export function staticSubject(id: string): StoneCompareSubject {
    const detail = StoneLibraryService.getStoneDetail(id);
    if (!detail) throw new Error(`missing static stone ${id}`);
    const variants = detail.variants.map((variant) => StoneLibraryService.getStoneDetail(id, variant.stoneVariantId)!);
    return { detail, variants, usages: [] };
}
