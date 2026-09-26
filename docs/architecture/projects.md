# Projects public contract

Public Project data, listing/detail rendering, media blocks and hotspots. Admin and aggregate: `docs/architecture/projects-admin.md`. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

## Data Contracts

### Project Data Contract
- Static migration fallback: `src/data/projectData.ts`
- Public access layer: `src/service/ProjectService.ts`
  - `getAll()` uses the browser-safe public Supabase client to read Published `projects`, approved Published facts/materials, Published ordered media, material maps, and hotspots, resolves only public-safe media URLs, then overlays each Published Project onto the matching static Project by canonical slug.
  - The adapter also reads `get_archived_project_slugs()`. Applied/read-back migration C restricts output to archived canonical rows intersecting the five bundled public fallback slugs, while `ProjectService` applies the same allowlist as defence in depth. Once the aggregate runtime is promoted, an allowlisted archived slug suppresses its matching bundled fallback. A read failure keeps the availability-first static fallback, and a Published CMS row wins over a stale tombstone.
  - Unmatched non-archived static Projects remain visible during migration, new Published Projects append, and a missing public client or Published-query error leaves the static fallback collection intact.
  - `getBySlug(slug)` resolves the merged collection by normalized canonical slug.
  - Concurrent `getAll()` calls share one in-flight request that is cleared when it settles; there is no TTL cache, so a later page mount always reads the current publication.
  - `getProjectsUsingStone(stoneGroupId)` is the public Stone → Project reverse lookup over that merged collection (`findStoneProjectUsages`). It matches `materials[]` and `hotspot_image` points by canonical Stone key, returns each Project with de-duplicated finish keys, application copy and the first matching point (`{ hotspotId, blockId }`) in `getAll()` order, and returns `[]` on any read failure.
  - Published `project_facts.fact_value_json` is treated as untrusted JSON. Only a string or an array containing strings is exposed to the public Project detail; other shapes normalize to a safe empty value instead of leaking arbitrary objects into the view model.
- Listing page: `src/pages/Projects.tsx`
  - Calls `ProjectService.getAll()` and uses page-owned opening content below the shared 102px light `DefaultLayout` clearance used by Stone Library; the shared `light-page` header supplies the deeper smoked-glass contrast.
  - Functional archive state includes equal-sized image cards, sector filters, and grid/list view controls.
- Detail page: `src/pages/ProjectDetails.tsx`
  - Reads the same merged `ProjectService` collection and delegates the case-study structure to `src/components/projects/ProjectPageView.tsx`: breadcrumb, oversized title, previous/next navigation, full-width hero, Project Information facts, narrative, ordered media blocks, Featured Materials when configured, and final CTA.
  - `src/pages/admin/projects/ProjectDraftPreview.tsx` uses that same renderer in preview mode, intercepting navigation while preserving page composition.
  - Uses `mediaBlocks` when present and falls back to `images` as normal image blocks for older records.
- Project media block contract:
  - `normal_image`: full-width responsive image proof with optional label/caption.
  - `hotspot_image`: full-width responsive project image with quiet material points, per-point cards and a text legend.
  - `youtube_video`: optional one-per-project video block rendered with `youtube-nocookie` when project data or future Supabase content provides a YouTube ID. Current static project data has no live YouTube block because no client-approved Urblo project video is configured.
- Project hotspot component: `src/components/projects/ProjectHotspotImage.tsx`
  - Default state is a clean image with small unnumbered point buttons; there is no side inspector. Hover or focus opens that point's card transiently; click/tap pins it and a second tap on the same point closes it. A pointer-down outside the figure or `Esc` closes any open card.
  - Each card follows its point button in DOM order (button → card link in Tab order) and shows the Published finish image, Stone name, finish, `Where it is used`, an optional two-line note and `View stone` → `/stone-library/{stoneGroupId}?variant=…&finish=…`. Cards open away from the nearest edges (left of the point past 55% x, above it past 60% y) and are clamped to the image width.
  - A legend below the image lists `NN Stone · Finish` buttons that pin the matching point; it is the no-hover fallback and indexable text.
  - Deep link: `/projects/:slug?point=<encoded hotspot id>` makes `ProjectPageView` pass `focusHotspotId` to the block containing that point, which pins it once on mount and scrolls its figure (`id="project-media-{block.id}"`) to the viewport centre. Preview mode ignores the parameter. CMS hotspot ids are `hotspot_key` values and contain `:`, so links must URL-encode them.
  - Hotspot coordinates are stored as image-percentage positions in `src/data/projectData.ts`.
  - Hotspots are material-placement records keyed by `stoneGroupId`, `stoneVariantId`, and `finishKey`. Project owns placement and application; the published Stone catalogue owns names, valid relationships, exact finish image/alt and links. Admin selectors share that catalogue; saved unavailable selections remain visible for correction. Managed keys do not revive static data, and no alternate finish image fills a missing finish.
- Admin points-on-image contract (`src/features/projects/projectAggregate.ts`, `src/pages/admin/projects/ProjectEditor.tsx`; the Media and Materials sections and shared field controls live in `src/pages/admin/projects/sections/`):
  - A `project_material_maps` draft row is the hidden child of the `hotspot_image` media block that carries its points; editors never see or manage maps. `enableMediaBlockPoints` creates the map from the block image (block `mediaAssetId` becomes `null`, as the RPC requires), `disableMediaBlockPoints` deletes the points and map and restores the plain image, `setMediaBlockImage` replaces the map image while points keep their percentages, and `removeMediaBlock` cascades.
  - `adoptLegacyMaterialMaps` runs on every loaded/returned envelope before it becomes both draft and clean baseline: maps without a points block get a trailing `hotspot_image` block in map order (the position the public adapter already renders), and an untitled points block takes its map title. The next Save persists them; nothing is dirty on open.
  - `normalizeProjectDraftForSave` copies each points block title (or `Stone and finish placement`) into its map title, clears the retired map `intro`, and fills an empty point use from its material so server publish validation passes. Publish blockers point to `media`/`materials`; there is no `maps` section. No Function, RPC or schema change.
- Moon Gate MVP assets:
  - Local deployment assets live under `public/images/projects/moon-gate`.
  - `Moon Gate | Woolley Street` is the first project using `hero`, `lead`, `materialMap`, `materials`, `gallery`, and `cta` fields.
  - Featured material links point to `/stone-library/angola-black` and `/stone-library/new-grey`.
- Current contract risk:
  - Moon Gate includes MVP-inferred material/application notes that should be confirmed with the designer before final public launch.
  - Other projects still use the legacy-level data shape and should be migrated one by one.
