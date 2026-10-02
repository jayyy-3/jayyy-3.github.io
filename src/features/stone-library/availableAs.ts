import type { StoneAvailableAsVM } from '../../types/stone-library';

/** One published "Available as" option (product form a stone can be supplied as). */
export interface StoneAvailabilityOption {
  id: number;
  key: string;
  name: string;
  sortOrder: number;
}

/** Owner/admin option list returned by `?view=availability-options`. */
export interface StoneAvailabilityOptionList {
  published: StoneAvailabilityOption[];
  archived: (StoneAvailabilityOption & { archivedAt: string | null })[];
}

/**
 * Static fallback options. They match the seeded database rows and are used when the
 * catalogue is unavailable or predates the Available as migration.
 */
export const STATIC_AVAILABILITY_OPTIONS: readonly StoneAvailabilityOption[] = [
  { id: 0, key: 'blocks', name: 'Blocks', sortOrder: 10 },
  { id: 0, key: 'pavers', name: 'Pavers', sortOrder: 20 },
  { id: 0, key: 'cladding', name: 'Cladding', sortOrder: 30 },
];

function byOptionOrder(a: StoneAvailabilityOption, b: StoneAvailabilityOption): number {
  return a.sortOrder - b.sortOrder || a.id - b.id || a.name.localeCompare(b.name);
}

/**
 * Every published option, in option order, marked Offered or Not offered for one stone.
 * `selected` undefined means a record without a selection field (static fallback, or a
 * catalogue read before the migration): every option is offered, matching the approved
 * backfill. Keys that are no longer published are ignored.
 */
export function expandAvailableAs(
  options: readonly StoneAvailabilityOption[],
  selected: readonly string[] | undefined,
): StoneAvailableAsVM[] {
  const chosen = selected ? new Set(selected) : null;
  return [...options].sort(byOptionOrder).map((option) => ({
    key: option.key,
    label: option.name,
    offered: chosen ? chosen.has(option.key) : true,
  }));
}

/** Keys of every option, in option order: the default selection for a new stone. */
export function allAvailabilityKeys(options: readonly StoneAvailabilityOption[]): string[] {
  return [...options].sort(byOptionOrder).map((option) => option.key);
}
