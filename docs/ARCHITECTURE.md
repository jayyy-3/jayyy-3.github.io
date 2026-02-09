# Urblo Web - Architecture and Contracts

Last updated: 2026-02-09

## System Boundary
- Frontend-only React application shipped as static assets.
- No runtime backend service in this repository.
- No backend HTTP API contract currently exists for production runtime.

## Runtime Stack
- Bundler/dev server: Vite 6
- UI runtime: React 19
- Routing: `react-router-dom` with `HashRouter`
- Styling: Tailwind CSS + project CSS (`src/index.css`, `src/App.css`)
- Client state: Zustand (`src/store/productStore.ts`)
- Motion/interaction: Framer Motion
- Supporting libraries: Swiper, DOMPurify, lodash.throttle, react-helmet

## Deployment and Build Contract
- Deployment workflow: `/Users/lee/Documents/SAI/urblo/urblo-react/.github/workflows/deploy.yml`
  - Trigger: push to `main`
  - Pipeline: `npm ci` -> `npm run build` -> deploy `dist/` to GitHub Pages
- Vite base config: `/Users/lee/Documents/SAI/urblo/urblo-react/vite.config.ts`
  - `base: './'` for relative asset paths
- Build script contract: `/Users/lee/Documents/SAI/urblo/urblo-react/package.json`
  - `npm run build` => `tsc -b && vite build`
  - `npm run lint` => `eslint .`
  - typecheck path => `npx tsc -b`
- TypeScript contract update:
  - `resolveJsonModule: true` enabled in `/Users/lee/Documents/SAI/urblo/urblo-react/tsconfig.app.json` to support `stone_library.json` imports.
- Lint scope contract update:
  - `.vite/**` ignored in `/Users/lee/Documents/SAI/urblo/urblo-react/eslint.config.js`.

## Route Interface Contract (`src/App.tsx`)

| Route pattern | Page component | Notes |
|---|---|---|
| `/` | `Home` | Wrapped by `DefaultLayout`. |
| `/stone-library` | `StoneLibraryPage` | Stone list and filter surface. |
| `/stone-library/:stoneGroupId` | `StoneLibraryDetailPage` | Stone detail with variant switch, synchronized finish controls, and lightbox preview. |
| `/products` | `ProductsPage` | Bench/system product listing. |
| `/products/:slug` | `ProductDetailPage` | Product detail and material options. |
| `/projects` | `Projects` | Project listing page. |
| `/projects/:slug` | `ProjectDetails` | Project detail page. |
| `/our-story` | `OurStory` | About page. |
| `/articles` | `ArticlesPage` | Article list page. |
| `/articles/:slug` | `ArticlePage` | Article detail page. |
| `*` | `Home` | Fallback to home content. |

## Navigation Contract vs Implemented Routes

### Implemented navigation surfaces
- Header links: `/projects`, `/stone-library`, `/our-story`, `/articles`, `/products`, `mailto:info@urblo.com.au`
- Footer links: `/sample-request`, `/contact`

### Gaps
- `/sample-request` is not declared in router.
- `/contact` is not declared in router.
- Footer internal links use raw anchors and are inconsistent with `HashRouter` contract.

## Stone Library Detail Interaction Contract (`src/pages/StoneLibraryDetailPage.tsx`)
- State composition:
  - Effective active finish resolves by precedence: `previewFinishKey` -> `lockedFinishKey` -> `defaultFinishKey`.
  - Variant changes reset finish preview/lock state.
- Left media contract (`src/components/stone-library/ImageStage.tsx`):
  - Desktop: hover/focus previews finish, click locks finish.
  - Mobile: tap locks finish.
  - Active panel maintains fixed 3:2 ratio; collapsed panels stay narrow and horizontally scrollable.
- Right finish selector contract (`src/components/stone-library/FinishAccordion.tsx`):
  - Click (or keyboard activation on focused button) is the only state-changing selection action.
  - Hover/focus does not alter active finish state.
- Large-image inspection contract (`src/components/stone-library/FinishLightbox.tsx`):
  - Open via active-panel zoom action; close via button, backdrop, or `Esc`.
  - Supports previous/next finish navigation with buttons and arrow keys.
  - Supports 1x/2x zoom with 2x drag-pan and body-scroll lock while open.

## Data Contracts

### Stone Library Data Contract (Primary for Materials)
- Source JSON: `/Users/lee/Documents/SAI/urblo/urblo-react/data/clean/stone_library.json`
- Type contract: `/Users/lee/Documents/SAI/urblo/urblo-react/src/types/stone-library.ts`
  - `StoneLibraryRaw`, `StoneFinishRaw`, `StoneGroupRaw`, `StoneVariantRaw`
  - `StoneCardVM`, `StoneDetailVM`, `FinishVM`, `StoneStatus`
- Service contract: `/Users/lee/Documents/SAI/urblo/urblo-react/src/service/StoneLibraryService.ts`
  - `getStoneCards(filters)`
  - `getStoneDetail(stoneGroupId, variantId?)`
  - `getFilterFacets()`
  - `getStoneOptionsForProducts()`
- Supplemental metadata:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/finishBehaviorMeta.ts`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/stoneFinishImages.ts`

### Product Data Contract
- Source of product records: `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/productData.ts`
- Access layer: `/Users/lee/Documents/SAI/urblo/urblo-react/src/service/ProductService.ts`
  - `getAll(): Promise<Product[]>`
  - `getBySlug(slug): Promise<Product | undefined>`
- Type contract: `/Users/lee/Documents/SAI/urblo/urblo-react/src/types/product.ts`
  - `Product`, `ProductModel`, `MaterialCategory`, `SelectedMaterials`, `OptionItem`
- Runtime note:
  - `ProductDetailPage` material options now come from `StoneLibraryService.getStoneOptionsForProducts()`.

### Project Data Contract
- Listing source in page module: `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/Projects.tsx`
- Detail source in data module: `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/projectData.ts`
- Current contract risk: list and detail data are split across two sources and can drift.

### Article Data Contract
- Public data root: `/Users/lee/Documents/SAI/urblo/urblo-react/public/articles`
- Index manifest: `/Users/lee/Documents/SAI/urblo/urblo-react/public/articles/index.json`
- Detail content: `/Users/lee/Documents/SAI/urblo/urblo-react/public/articles/<slug>/content.html`
- Metadata type: `/Users/lee/Documents/SAI/urblo/urblo-react/src/types/article.ts`
- Loading behavior:
  - list page fetches `${import.meta.env.BASE_URL}articles/index.json`
  - detail page fetches index then HTML content
  - HTML is sanitized via DOMPurify before render

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

## Storage and Side-Effect Contract
- Local storage keys:
  - `urblo:feat` written by `FeatureSection` tab changes
  - `seenPopup` read by `WelcomePopup`; not currently written due commented line
- Dangerous HTML render points:
  - `ArticlePage` renders sanitized article HTML
- Runtime fetches:
  - Static JSON/HTML from `public/articles`
  - No authenticated or server API fetches

## Quality Gate Status (Measured 2026-02-09)
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass

## Known Architecture Risks
- Footer contains undeclared in-app routes (`/sample-request`, `/contact`).
- `WelcomePopup` persistence (`seenPopup`) write is commented, causing repeat popups.
- Project list data and project detail data are maintained in separate sources.
- Bundle size warning (`>500kB`) indicates code-splitting and chunk strategy debt.

## Brand Linkage Rule
For UI/copy/IA changes, architecture and implementation decisions must be reviewed against `/Users/lee/Documents/SAI/urblo/urblo-react/docs/brand-baseline.md`. Brand linkage is advisory in execution flow, but required in task notes for high-impact user-facing changes.
