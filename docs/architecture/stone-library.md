# Stone Library public contract

Stone detail interaction and Stone Library data contract. Admin workspace: `docs/architecture/stone-library-admin.md`. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

## Stone Library Detail Interaction Contract (`src/pages/StoneLibraryDetailPage.tsx`)
- Public disclosure boundary:
  - Origin remains in the source, typed view models, Supabase records, and Admin editor for internal sourcing use.
  - Public Stone Library cards, detail specifications, free-text matching, and route metadata must not render or disclose origin.
  - Exception: only the boolean `australianStone` is public (badge; `docs/SUPABASE_SCHEMA.md`).
- State composition:
  - Effective active finish resolves by precedence: `lockedFinishKey` -> `defaultFinishKey`.
  - Each finish selection click increments a center-request token used by left media for one-shot visibility-check scroll handling.
  - Variant changes reset locked finish state and close lightbox state.
  - Global route scroll restoration reacts to pathname changes, not query-only Finish/Variant state changes. Variant refresh retains the current detail until replacement data resolves so layout collapse cannot pull the reader to the top.
- Left media contract (`src/components/stone-library/ImageStage.tsx`):
  - Desktop/mobile: click (or keyboard activation) selects finish; hover/focus does not mutate active finish.
  - Width/layout computation and scroll decision are decoupled into separate single-pass flows to avoid race conditions.
  - Width updates are immediate (no width transition); smooth motion is provided only by scroll when needed.
  - Any finish selection click (left media or right selector) runs visibility check once: if active panel is fully visible, keep scroll position; if clipped/out of frame, smooth-scroll to a best-effort centered position.
  - Strict-mode duplicate effect calls are guarded so one token triggers one effective scroll decision.
  - Active panel maintains fixed 3:2 ratio.
  - When finish count is low and default panel widths do not fill the stage viewport, non-active panels expand to consume remaining width.
  - Single-finish states keep the lone 3:2 panel centered in the stage viewport (no forced full-bleed stretch).
  - Secondary frames are not separate finishes. They display only for the active finish when `FinishVM.secondaryImages` exists.
  - Clicking a secondary frame opens the lightbox on that frame while preserving the active finish key.
  - Missing secondary frames are omitted entirely and must not introduce placeholder thumbnails.
- Right finish selector contract (`src/components/stone-library/FinishAccordion.tsx`):
  - Variant-bearing stones place `VariantSwitch` in the same right-side selection rail before Finish; cut-orientation variants are labelled `Cut direction`.
  - Click (or keyboard activation on focused button) is the only state-changing selection action.
  - Selection updates active finish and triggers the left-stage visibility-check scroll policy.
  - Active finishes with secondary frames disclose the primary-plus-secondary frame count in the behavior panel.
- Large-image inspection contract (`src/components/stone-library/FinishLightbox.tsx`):
  - Open via active-panel zoom action; close via button, backdrop, or `Esc`.
  - Supports previous/next finish navigation with buttons and arrow keys.
  - Supports 1x/2x zoom with 2x drag-pan and body-scroll lock while open.
  - Supports primary/secondary frame selection within the active finish without changing finish state.
- Used in projects contract (`src/components/stone-library/StoneProjectsSection.tsx`):
  - `StoneLibraryDetailPage` loads `ProjectService.getProjectsUsingStone(stoneGroupId)` in its own effect keyed by Stone only; it never blocks or resets the detail loading state, and failures render nothing.
  - Data is filtered client-side from the merged Published + static fallback Project collection, so static records such as Moon Gate count.
  - `StonePageView` renders the section after the specifications and before Enquiry only when `preview` is false and at least one Project matches; there is no empty state. The Admin Stone workspace preview neither requests nor renders it.
  - Project cards link to `/projects/:slug`; finish chips highlight the active finish and matching Projects sort first (stable within each group). A separate `See placement` link deep-links `?point=` when a matching point exists, avoiding nested links.

## Stone Library Comparison Contract (NOW-STONE-COMPARE-001)
- Selection (`src/lib/stoneCompareSelection.ts`): ordered stone ids, max 4; list cards (`StoneCard`) and the detail page (`StoneDetailCompare`) toggle it. The list keeps it in `?compare=a,b` (a URL selection wins on arrival) and localStorage `urblo:stone-compare`; the detail page uses storage only. The list tray (`CompareTray`) is sticky to the list bottom; a fifth stone is refused with a visible message; unknown ids are dropped once the list loads.
- Route `/stone-library/compare?stones=a,b,c` (lazy `StoneComparePage`, before `:stoneGroupId`; `compare` is a reserved slug). Ids beyond 4 and ids that are not public stones are left out with a notice; none shows an empty state linking back. `StoneLibraryService.getPublishedStoneComparison` reads the catalogue once with Published-first precedence, per enabled variant; Project usage comes from `findStoneProjectUsages` and never blocks the page.
- Registry rule (`src/lib/stoneCompareRegistry.ts`): the page renders only `getPublicCompareAttributes()` in `order`; it never hard-codes an attribute. Descriptor: `key, label, unit?, hint?, kind (text|number|boolean|matrix|image|list|checklist), public, order, source, resolve(stone, ctx)`. v1: finish image (shared finish switch, sized `card` variants, pending/not-offered states, never another finish's photo), type, Available as (`checklist` kind, order 25), price tier, finish capability (per finish across variants), cut options, raw block, variants, used in projects. Origin is `public: false`; finish behaviour text is excluded. Tests cover both.
- Differences only: checklist by offered state per option label, text by normalised value and meter, number by value and links, boolean by value, list as a label set, image by state and source, matrix per finish (rows no stone offers are omitted).
- Sample CTA links to `/contact?intent=sample-request&stone=<names>` (existing prefill, 160 characters); no Contact change.
- SEO: noindex, canonical `/stone-library`, out of the sitemap (utility route in `src/data/seoRoutes.ts`; edge honours it).
- Future: attribute definitions become CMS-managed once Stone data is fully in the CMS; the descriptor shape is the contract to keep.

## Data Contracts

### Stone Library Data Contract (Primary for Materials)
- Source JSON: `data/clean/stone_library.json`
- Type contract: `src/types/stone-library.ts`
  - `StoneLibraryRaw`, `StoneFinishRaw`, `StoneGroupRaw`, `StoneVariantRaw`
  - `StoneCardVM`, `StoneDetailVM`, `FinishVM`, `FinishSecondaryImageVM`, `StoneFinishImageRole`, `StoneStatus`
  - Price presentation fields on `StoneDetailVM`:
    - `priceRange` (source notation, e.g. `$ / $$ / $$$`)
    - `priceTierLevel` (`1 | 2 | 3 | null`)
    - `priceTierLabel` (`Budget | Balanced | Premium | null`)
    - `pricePrimaryLabel` (`Budget | Balanced | Premium | Price on request`)
  - `availableAs: { key, label, offered }[]`: every published option, in order; static/pre-migration records offer all (`src/features/stone-library/availableAs.ts`). No stone-level `status`/`availabilityLabel` on any VM.
- Service contract: `src/service/StoneLibraryService.ts`
  - `getStoneCards(filters)`
  - `getStoneDetail(stoneGroupId, variantId?)`
  - `getFilterFacets()`
  - `getStoneOptionsForProducts()`
  - `getStoneGroupOptionsForProducts()`
  - Price mapping contract in `getStoneDetail`:
    - A valid tier (`1/2/3`) maps to `Budget/Balanced/Premium`; a missing/invalid tier degrades to `Price on request`. The retired `tbc` status no longer affects price.
- Supplemental metadata:
  - `src/data/finishBehaviorMeta.ts`
  - `src/data/stoneFinishImages.ts`
