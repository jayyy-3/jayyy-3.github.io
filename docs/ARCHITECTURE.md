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

## Route Interface Contract (`src/App.tsx`)

| Route pattern | Page component | Notes |
|---|---|---|
| `/` | `Home` | Wrapped by `DefaultLayout`. |
| `/products` | `ProductsPage` | Defined twice in router (duplicate declaration). |
| `/products/:slug` | `ProductDetailPage` | Product details via slug. |
| `/materials` | `Materials` | Featured stone range page. |
| `/materials-home` | `MaterialsHome` | Category landing page. |
| `/materials/:category` | `CategoryPage` | Category detail listing. |
| `/materials/:category/:subcategory/:slug` | `MaterialDetailPage` | Material detail page. |
| `/projects` | `Projects` | Project listing page. |
| `/projects/:slug` | `ProjectDetails` | Declared as `projects/:slug` in code; resolves as project detail route. |
| `/our-story` | `OurStory` | Declared as `our-story` in code. |
| `/articles` | `ArticlesPage` | Article list page. |
| `/articles/:slug` | `ArticlePage` | Article detail page. |
| `*` | `Home` | Fallback to home content. |

## Navigation Contract vs Implemented Routes

### Implemented navigation surfaces
- Header links: `/projects`, `/materials`, `/materials-home`, `/our-story`, `/articles`, `/products`, `/sample-request`, `/contact`
- Footer links: `/sample-request`, `/contact`
- CTA links:
  - `src/pages/Materials.tsx` -> `/sample-request`
  - `src/components/EnquiryStrip.tsx` -> `/en-au/contact-us`

### Gaps
- `/sample-request` is not declared in router.
- `/contact` is not declared in router.
- `/en-au/contact-us` is not declared in router.
- Internal links using raw anchors (`<a href="/...">`) are inconsistent with `HashRouter` navigation behavior.

## Data Contracts

### Product Data Contract
- Source of product records: `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/productData.ts`
- Access layer: `/Users/lee/Documents/SAI/urblo/urblo-react/src/service/ProductService.ts`
  - `getAll(): Promise<Product[]>`
  - `getBySlug(slug): Promise<Product | undefined>`
- Type contract: `/Users/lee/Documents/SAI/urblo/urblo-react/src/types/product.ts`
  - `Product`, `ProductModel`, `MaterialCategory`, `SelectedMaterials`, `OptionItem`

### Material Data Contract
- Source: `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/materialData.ts`
  - Category tree: `materialCategories`
  - Flattened list: `stoneMaterials`
- Consumer routes:
  - `/materials` page and category/detail routes
  - product detail option selectors
- Additional option datasets:
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/frameFinishData.ts`
  - `/Users/lee/Documents/SAI/urblo/urblo-react/src/data/battenData.ts`

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
  - `MaterialDetailPage` renders `item.description` as HTML
- Runtime fetches:
  - Static JSON/HTML from `public/articles`
  - No authenticated or server API fetches

## Quality Gate Status (Measured 2026-02-09)
- `npm run build`: pass
- `npm run lint`: fail
  - 3 errors from linting `.vite/deps/react-router-dom.js`
  - 1 warning in `src/pages/ProductDetailPage.tsx` (`react-hooks/exhaustive-deps`)
- `npx tsc -b`: pass

## Known Architecture Risks
- Duplicate `/products` route declaration in `src/App.tsx` increases maintenance risk.
- Router/navigation contract mismatch: existing nav points to undeclared routes.
- HashRouter consistency risk from raw anchor links for internal navigation.
- Lint scope includes generated dependency output under `.vite`, causing non-source gate failures.
- Product detail hook dependency warning indicates effect contract ambiguity.
- Project list data and project detail data are maintained in separate sources.
- Bundle size warning (`> 500kB`) indicates code-splitting and chunk strategy debt.

## Brand Linkage Rule
For UI/copy/IA changes, architecture and implementation decisions must be reviewed against `/Users/lee/Documents/SAI/urblo/urblo-react/docs/brand-baseline.md`. Brand linkage is advisory in execution flow, but required in task notes for high-impact user-facing changes.
