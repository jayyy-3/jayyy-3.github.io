import StoneLibraryService from './StoneLibraryService';
/** Admin selectors share the public snapshot; saved legacy IDs stay on their record. */
export async function loadStoneCatalogueOptions() {
  const catalogue = await StoneLibraryService.getCatalogue();
  if (!catalogue)
    throw new Error(
      'Connect the published Stone Library before selecting a stone.',
    );
  return {
    stones: catalogue.stones.map(({ draft }) => ({
      id: draft.stone.id!,
      stone_group_key: draft.stone.slug,
      display_name: draft.stone.name,
      status: 'published',
    })),
    variants: catalogue.stones.flatMap(({ draft }) =>
      draft.variants
        .filter((v) => v.enabled)
        .map((v, index) => ({
          id: v.id!,
          stone_group_id: draft.stone.id!,
          variant_key: v.slug,
          display_name: v.label,
          status: 'published',
          sort_order: index,
        })),
    ),
    finishes: catalogue.finishes.map((f) => ({
      id: f.id,
      finish_key: f.key,
      display_name: f.name,
      status: 'published',
    })),
    capabilities: catalogue.stones.flatMap(({ draft }) =>
      draft.variants
        .filter((v) => v.enabled)
        .flatMap((v) =>
          v.finishes.map((f) => ({
            stone_variant_id: v.id!,
            finish_definition_id: f.definitionId,
            capability: f.capability,
          })),
        ),
    ),
    images: catalogue.stones.flatMap(({ draft }) =>
      draft.variants
        .filter((v) => v.enabled)
        .flatMap((v) =>
          v.finishes
            .filter((f) => f.capability !== 'no')
            .flatMap((f) =>
              f.images.map((i, index) => ({
                stone_group_id: draft.stone.id!,
                stone_variant_id: v.id!,
                finish_definition_id: f.definitionId,
                media_asset_id: i.mediaAssetId,
                image_role: i.role,
                status: 'published',
                sort_order: index,
              })),
            ),
        ),
    ),
  };
}
export async function loadStoneGroupOptionResult() {
  try {
    return { data: (await loadStoneCatalogueOptions()).stones, error: null };
  } catch (error) {
    return {
      data: [],
      error:
        error instanceof Error
          ? error
          : new Error('Stone choices could not load.'),
    };
  }
}
