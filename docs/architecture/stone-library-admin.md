# Stone Library admin contract

Stone workspace aggregate, drafts, publish and adoption boundary. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

## Deployment and Build Contract — Stone Library admin entry

  - Current Stone Library candidate: `/admin/stone-library` lists stones; `/admin/stone-library/:stoneId` autosaves a complete private draft via `/api/admin/stone-library`. Service-only `admin_stone_workspace` owns save/publish/archive, optimistic revision checks, idempotent receipts, canonical children and audit history. Two new migrations remain unapplied to production; see `docs/STONE_LIBRARY_WORKSPACE_RELEASE.md`.

### Supabase Launch Data Contract — Stone Library

- Stone Library:
  - Stone groups, variants, finishes, finish imagery, specifications, availability, and display ordering.

### Supabase Launch Data Contract — Admin IA/access (Stone Library)

- Admin IA/access:
  - `/admin/stone-library` is the first content CRUD screen and uses Stone Library group, variant, finish definition, finish capability, finish image, and linked media records.

## Stone aggregate contract — candidate 2026-09-10

- `src/features/stone-library/stoneDraft.ts` defines the versioned whole-page draft and exact-image mapper. `StoneSaveQueue` serializes/coalesces changes, preserves uncertain request identities, waits for the latest value before navigation/publish, and retains edits on conflict.
- `private.stone_drafts`, `private.stone_requests`, `private.stone_history`, `private.stone_exclusions`, and `private.stone_static_references` separate editable data, receipts, snapshots, known historical keys and active bundled references. Public output comes from `public_stone_catalogue()` with public-only fields and managed keys.
- Publishing checks the revision and canonical/media version, validates parent ownership, preserves stable IDs, prepares create-only `stone-assets` public copies, then commits canonical parent/children/media/audit together. Definite failure compensates unreferenced new public copies; unknown commit outcomes retain copies for receipt readback. Private originals are never deleted by Stone publication.
- The separate lockdown revokes browser DML on all four Stone tables/sequences and removes their mutation policies. Statement-entry advisory locks plus deferred reference guards serialize Stone, Media, Product, Project and Article changes. Public references, including active bundled pages, prevent invalid hide/finish/image changes. Draft references and historical sample requests are preserved.
- `src/service/stoneCatalogueOptions.ts` supplies published choices to Projects, Products and Articles. Existing unavailable selections remain explicit. The public Stone list/detail and dependent Product/Project material views consume the same catalogue. Managed Stone Library keys never fall back to static content.
- Available as (NOW-STONE-AVAILABLE-AS-001, migration `supabase/migrations/20261003120000_stone_available_as.sql`, unapplied to production until Phase 4): `public.stone_availability_options` (`option_key` slug fixed at creation, `display_name`, `sort_order`, `status` published/archived, at most 24 published) holds the list; `stone_groups.available_as text[]` holds each stone's keys. Drafts keep `schemaVersion: 1` with `stone.availableAs` (the migration rewrote existing drafts; `stone.availability` is ignored and stripped by the Function and RPC). Save/prepare/publish reject unknown or hidden keys (`stone_availability_option_unavailable`) and store the canonical published-order list; publish writes `available_as` and no longer writes `availability_status` (kept, deprecated). Readers intersect with published options.
- Option writes go through `POST /api/admin/stone-library` `{ action: 'availability-option', op: create|rename|reorder|archive|restore, requestId, option }` → service-only `admin_stone_availability_options` (owner/admin only, `stone_option_forbidden` otherwise; list via `GET ?view=availability-options` for every active role). Writes take the Stone advisory lock, reuse `private.stone_requests` receipts and audit `stone.availability_option.<op>`. Archive removes the key from every `stone_groups.available_as` and private draft in the same transaction; restore does not re-add it; reorder must name exactly the current published set (`stone_option_order_stale`). New stones default to every published option. The editor loads options on every open.
- Adoption is a separate approval-gated operation. `agent:stone-adoption-plan` is no-network/no-write by default. Exact SHA approval, baseline comparisons, resumable receipts, content/Storage readback and protected-module fingerprints are required for live mode. The 55 photos are privately uploaded and copied publicly through normal publication; no existing original or non-Stone content is deleted.
