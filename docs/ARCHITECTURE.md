# Urblo Web - Architecture and Contracts

Last updated: 2026-05-15

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
- Deployment workflow: `.github/workflows/deploy.yml`
  - Trigger: push to `main`
  - Pipeline: `npm ci` -> `npm run build` -> deploy `dist/` to GitHub Pages
- Vite base config: `vite.config.ts`
  - `base: './'` for relative asset paths
- Build script contract: `package.json`
  - `npm run build` => `tsc -b && vite build`
  - `npm run lint` => `eslint .`
  - typecheck path => `npx tsc -b`
- TypeScript contract update:
  - `resolveJsonModule: true` enabled in `tsconfig.app.json` to support `stone_library.json` imports.
- Lint scope contract update:
  - `.vite/**` ignored in `eslint.config.js`.

## Agent Harness Contract
- Root entry: `AGENTS.md`
- Current state handoff: `docs/HANDOFF.md`
- Machine-readable task queue: `docs/agent/tasks.json`
- Verification matrix: `docs/agent/verification.md`
- Harness checks:
  - `npm run agent:check` => `node scripts/check-harness.mjs`
  - `scripts/check-harness.mjs` verifies required harness files and delegates doc path/task checks.
  - `scripts/check-doc-paths.mjs` rejects machine-specific paths and validates repo-relative path references in docs/task state.
- Agent startup:
  - `npm run agent:init` => `bash scripts/agent-init.sh`
  - Prints repo path, git status, recent commits, runtime versions, read order, and common commands.
- Static smoke:
  - `npm run agent:smoke` => `bash scripts/agent-smoke.sh`
  - Serves `dist/` with Vite preview and checks the React shell for key hash routes plus `public/articles/index.json`.
  - Builds first only when `dist/` is missing; runtime tasks should still run `npm run build` before smoke.

## Route Interface Contract (`src/App.tsx`)

| Route pattern | Page component | Notes |
|---|---|---|
| `/` | `Home` | Wrapped by `HomepageLayout`; shared site chrome is used through homepage proxy components. |
| `/stone-library` | `StoneLibraryPage` | Stone list and filter surface. |
| `/stone-library/:stoneGroupId` | `StoneLibraryDetailPage` | Stone detail with variant switch, synchronized finish controls, and lightbox preview. |
| `/products` | `ProductsPage` | Bench/system product listing. |
| `/products/:slug` | `ProductDetailPage` | Product detail and material options. |
| `/projects` | `Projects` | Project listing page. |
| `/projects/:slug` | `ProjectDetails` | Project detail page. Uses page-owned project hero via `DefaultLayout showBanner={false}`. |
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
- Source JSON: `data/clean/stone_library.json`
- Type contract: `src/types/stone-library.ts`
  - `StoneLibraryRaw`, `StoneFinishRaw`, `StoneGroupRaw`, `StoneVariantRaw`
  - `StoneCardVM`, `StoneDetailVM`, `FinishVM`, `StoneStatus`
  - Price presentation fields on `StoneDetailVM`:
    - `priceRange` (source notation, e.g. `$ / $$ / $$$`)
    - `priceTierLevel` (`1 | 2 | 3 | null`)
    - `priceTierLabel` (`Budget | Balanced | Premium | null`)
    - `pricePrimaryLabel` (`Budget | Balanced | Premium | Price on request`)
- Service contract: `src/service/StoneLibraryService.ts`
  - `getStoneCards(filters)`
  - `getStoneDetail(stoneGroupId, variantId?)`
  - `getFilterFacets()`
  - `getStoneOptionsForProducts()`
  - Price mapping contract in `getStoneDetail`:
    - Active stones with valid tier (`1/2/3`) map to `Budget/Balanced/Premium`.
    - `tbc` status or missing/invalid tier degrades to `Price on request`.
- Supplemental metadata:
  - `src/data/finishBehaviorMeta.ts`
  - `src/data/stoneFinishImages.ts`

### Product Data Contract
- Source of product records: `src/data/productData.ts`
- Access layer: `src/service/ProductService.ts`
  - `getAll(): Promise<Product[]>`
  - `getBySlug(slug): Promise<Product | undefined>`
- Type contract: `src/types/product.ts`
  - `Product`, `ProductModel`, `MaterialCategory`, `SelectedMaterials`, `OptionItem`
- Runtime note:
  - `ProductDetailPage` material options now come from `StoneLibraryService.getStoneOptionsForProducts()`.

### Project Data Contract
- Source of project listing and detail records: `src/data/projectData.ts`
- Listing page: `src/pages/Projects.tsx`
  - Reads `projectListingMeta` from the shared data module.
- Detail page: `src/pages/ProjectDetails.tsx`
  - Reads the same `projects` array and renders optional material-map fields when present.
  - Falls back to fact/detail plus image rendering for projects that have not been migrated into the material-map model.
- Project material map component: `src/components/projects/ProjectMaterialMap.tsx`
  - Desktop interaction: hover/focus/click changes the active material inspector.
  - Mobile interaction: tap/focus changes the active material inspector directly below the project image; no hover-only dependency.
  - Hotspot coordinates are stored as image-percentage positions in `src/data/projectData.ts`.
  - Hotspots are material-placement records keyed by `stoneGroupId` and `finishKey`; stone names, finish labels, finish preview images, and detail links resolve through `StoneLibraryService` where possible.
- Moon Gate MVP assets:
  - Local deployment assets live under `public/images/projects/moon-gate`.
  - `Moon Gate | Woolley Street` is the first project using `hero`, `lead`, `materialMap`, `materials`, `gallery`, and `cta` fields.
  - Featured material links point to `/stone-library/angola-black` and `/stone-library/new-grey`.
- Current contract risk:
  - Moon Gate includes MVP-inferred material/application notes that should be confirmed with the designer before final public launch.
  - Other projects still use the legacy-level data shape and should be migrated one by one.

### Article Data Contract
- Public data root: `public/articles`
- Index manifest: `public/articles/index.json`
- Detail content: `public/articles/<slug>/content.html`
- Metadata type: `src/types/article.ts`
- Loading behavior:
  - list page fetches `${import.meta.env.BASE_URL}articles/index.json`
  - detail page fetches index then HTML content
  - HTML is sanitized via DOMPurify before render

### Contact Page Contract
- Route: `/contact`
- Page module: `src/pages/ContactPage.tsx`
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

## Last Runtime Quality Gate Status (Measured 2026-05-15)
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass

## Known Architecture Risks
- Sample Request has no backend/form workflow yet and remains a `mailto:` fallback.
- Project list data and project detail data are maintained in separate sources.
- Bundle size warning (`>500kB`) indicates code-splitting and chunk strategy debt.

## Brand and Design Linkage Rule
For UI/copy/IA changes, architecture and implementation decisions must be reviewed against:
- `docs/brand-baseline.md` for positioning, audience, voice, and claim safety.
- `docs/DESIGN.md` for visual rhythm, page composition, interaction tone, and responsive UI quality.

Brand and design linkage is advisory in execution flow, but required in task notes for high-impact user-facing changes.
