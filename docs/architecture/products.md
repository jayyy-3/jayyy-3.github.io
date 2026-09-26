# Products contract

Product data, product store state and the Products admin screen. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

## Data Contracts

### Product Data Contract
- Source of product records: `src/data/productData.ts`
- Access layer: `src/service/ProductService.ts`
  - `getAll(): Promise<Product[]>`
  - `getBySlug(slug): Promise<Product | undefined>`
- Type contract: `src/types/product.ts`
  - `Product`, `ProductModel`, `MaterialCategory`, `SelectedMaterials`, `OptionItem`
  - `OptionItem.imageState` may mark selector imagery as `ready` or `pending`.
- Runtime note:
  - Canonical product slugs are lowercase kebab-case; old camelCase product slugs are stored in `legacySlugs` for redirect compatibility.
  - `ProductDetailPage` body-stone selector options come from `StoneLibraryService.getPublicStoneGroupOptionsForProducts()` so product configuration uses stone-group choices rather than variant-level entries.
  - Product detail pages initialize configured default material selections, show selected model/material feedback, expose a prefilled configuration enquiry `mailto:`, and mark missing selector imagery as pending.
  - Product render imagery is treated as a geometry preview; selected body stone, frame finish, and battens are shown as separate material previews instead of pretending the render is composited live.
  - Product model geometry is keyed semantically: Rise is proud of the stone, Flush is inset/level, and `+` adds a backrest. `npm run agent:product-model-images` locks every current product key, label, reviewed asset path, asset existence, and per-product image uniqueness; filenames alone are not treated as semantic truth.

## State Contract (`src/store/productStore.ts`)
- Store keys:
  - `selectedMaterials: Partial<Record<MaterialCategory, string>>`
  - `currentModelKey: string`
  - `productSlug?: string`
- Mutations:
  - `setMaterial(category, slug)`
  - `setProduct(slug, defaultModel)`
  - `selectModel(modelKey)`
- Usage:
  - Product detail page initializes store per product slug.
  - Model and material selectors read/write this shared state.

## Deployment and Build Contract — Products admin entry

  - Current Products admin source: `/admin/products` reads and saves `products`, `product_models`, `product_material_defaults`, and `product_specs` records for active Website owner / CMS manager / editor roles once browser-safe Supabase config and an active profile exist.

### Supabase Launch Data Contract — Products

- Products:
  - Product families, model images, editable specs, and default material selections.
  - Product material defaults should reference Stone Library records where possible.

### Supabase Launch Data Contract — Admin IA/access (Products)

- Admin IA/access:
  - `/admin/products` is the next content CRUD screen and uses product family, model, material default, and spec records.
