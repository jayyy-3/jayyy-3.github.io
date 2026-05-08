# Urblo Web - Architecture and Contracts

Last updated: 2026-05-08

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
| `/` | `Home` | Wrapped by `HomepageLayout`; shared site chrome is used through homepage proxy components. |
| `/stone-library` | `StoneLibraryPage` | Stone list and filter surface. |
| `/stone-library/:stoneGroupId` | `StoneLibraryDetailPage` | Stone detail with variant switch, synchronized finish controls, and lightbox preview. |
| `/products` | `ProductsPage` | Bench/system product listing. |
| `/products/:slug` | `ProductDetailPage` | Product detail and material options. |
| `/projects` | `Projects` | Project listing page. |
| `/projects/:slug` | `ProjectDetails` | Project detail page. |
| `/our-story` | `OurStory` | About page. |
| `/contact` | `ContactPage` | Contact surface with direct contact channels and a local mailto project-brief composer. |
| `/articles` | `ArticlesPage` | Article list page. |
| `/articles/:slug` | `ArticlePage` | Article detail page. |
| `*` | `Home` | Fallback to homepage content wrapped by `HomepageLayout`. |

## Navigation Contract vs Implemented Routes

### Implemented navigation surfaces
- Shared header links: `/projects`, `/stone-library`, `/our-story`, `/articles`, `/products`, `/contact`
- Shared footer links: `mailto:info@urblo.com.au?subject=Sample%20Request`, `/contact`
- Shared footer social links: Instagram and LinkedIn use external links with `target="_blank"` plus `rel="noopener noreferrer"`; Facebook and YouTube are rendered as non-linked labels until real destinations are available.

### Gaps
- Sample Request is intentionally a `mailto:` fallback until a backend/form submission path is approved.

## Stone Library Detail Interaction Contract (`src/pages/StoneLibraryDetailPage.tsx`)
- State composition:
  - Effective active finish resolves by precedence: `lockedFinishKey` -> `defaultFinishKey`.
  - Each finish selection click increments a center-request token used by left media for one-shot visibility-check scroll handling.
  - Variant changes reset locked finish state and close lightbox state.
- Left media contract (`src/components/stone-library/ImageStage.tsx`):
  - Desktop/mobile: click (or keyboard activation) selects finish; hover/focus does not mutate active finish.
  - Width/layout computation and scroll decision are decoupled into separate single-pass flows to avoid race conditions.
  - Width updates are immediate (no width transition); smooth motion is provided only by scroll when needed.
  - Any finish selection click (left media or right selector) runs visibility check once: if active panel is fully visible, keep scroll position; if clipped/out of frame, smooth-scroll to a best-effort centered position.
  - Strict-mode duplicate effect calls are guarded so one token triggers one effective scroll decision.
  - Active panel maintains fixed 3:2 ratio.
  - When finish count is low and default panel widths do not fill the stage viewport, non-active panels expand to consume remaining width.
  - Single-finish states keep the lone 3:2 panel centered in the stage viewport (no forced full-bleed stretch).
- Right finish selector contract (`src/components/stone-library/FinishAccordion.tsx`):
  - Click (or keyboard activation on focused button) is the only state-changing selection action.
  - Selection updates active finish and triggers the left-stage visibility-check scroll policy.
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
  - Price presentation fields on `StoneDetailVM`:
    - `priceRange` (source notation, e.g. `$ / $$ / $$$`)
    - `priceTierLevel` (`1 | 2 | 3 | null`)
    - `priceTierLabel` (`Budget | Balanced | Premium | null`)
    - `pricePrimaryLabel` (`Budget | Balanced | Premium | Price on request`)
- Service contract: `/Users/lee/Documents/SAI/urblo/urblo-react/src/service/StoneLibraryService.ts`
  - `getStoneCards(filters)`
  - `getStoneDetail(stoneGroupId, variantId?)`
  - `getFilterFacets()`
  - `getStoneOptionsForProducts()`
  - Price mapping contract in `getStoneDetail`:
    - Active stones with valid tier (`1/2/3`) map to `Budget/Balanced/Premium`.
    - `tbc` status or missing/invalid tier degrades to `Price on request`.
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

### Contact Page Contract
- Route: `/contact`
- Page module: `/Users/lee/Documents/SAI/urblo/urblo-react/src/pages/ContactPage.tsx`
- Runtime behavior:
  - No backend submission is attempted.
  - Direct contact channels use `mailto:` and `tel:` links.
  - The project-brief form is local React state only; submit builds a prefilled `mailto:info@urblo.com.au` draft through `window.location.href`.
  - The page links back to `/stone-library` as a material discovery path.

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
  - `seenPopup` read and written by `WelcomePopup` on first display
- Dangerous HTML render points:
  - `ArticlePage` renders sanitized article HTML
- Runtime fetches:
  - Static JSON/HTML from `public/articles`
  - No authenticated or server API fetches
- Contact side effects:
  - Contact page submit opens a local email draft via `mailto:`; no form payload is stored in this application.

## Homepage Contract
- Homepage structure is driven by dedicated internal config in `src/data/homepage.ts`, not the legacy tabbed `FeatureSection`.
- Homepage uses `HomepageLayout` with `HomepageHeader`/`HomepageFooter` proxy components that currently render the shared `SiteHeader`/`SiteFooter`.
- Homepage typography is self-hosted from local static assets under `/public/fonts/urblo`:
  - `Avenir LT Std` weights `300/400/500/600/800`
  - `Didot LT Std` italic `400` and normal `600`
  - `Space Grotesk` local WOFF2
- Homepage runtime no longer depends on remote WordPress font CSS/TTF/WOFF assets.

## Quality Gate Status (Measured 2026-05-08)
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass

## Known Architecture Risks
- Sample Request has no backend/form workflow yet and remains a `mailto:` fallback.
- Project list data and project detail data are maintained in separate sources.
- Bundle size warning (`>500kB`) indicates code-splitting and chunk strategy debt.

## Brand Linkage Rule
For UI/copy/IA changes, architecture and implementation decisions must be reviewed against `/Users/lee/Documents/SAI/urblo/urblo-react/docs/brand-baseline.md`. Brand linkage is advisory in execution flow, but required in task notes for high-impact user-facing changes.
