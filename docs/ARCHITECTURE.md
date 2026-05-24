# Urblo Web - Architecture and Contracts

Last updated: 2026-05-25

## System Boundary
- Current implementation: frontend-only React application shipped as static assets.
- Current implementation: no runtime backend service exists in this repository yet.
- Current implementation: no production HTTP API contract has been implemented yet.
- Launch target: Cloudflare Pages static frontend, Cloudflare Pages Functions API endpoints, Supabase Postgres/Auth/Storage, and an Urblo-owned admin interface for content operations.
- Planning source: `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`.
- Supabase schema design source: `docs/SUPABASE_SCHEMA.md`.

## Runtime Stack
- Bundler/dev server: Vite 6
- UI runtime: React 19
- Routing: `react-router-dom` with `BrowserRouter`
- Styling: Tailwind CSS + project CSS (`src/index.css`, `src/App.css`)
- Client state: Zustand (`src/store/productStore.ts`)
- Motion/interaction: Framer Motion
- Supporting libraries: Swiper, DOMPurify, lodash.throttle, react-helmet
- Route loading: public page components are lazy-loaded in `src/App.tsx` so the initial app shell does not ship every route at once.

## Launch Target Stack
- Public hosting: Cloudflare Pages.
- Backend/API: Cloudflare Pages Functions scoped to `/api/*`.
- Database: Supabase Postgres.
- Authentication: Supabase Auth for the admin area.
- Admin UI: Urblo-owned `/admin` interface, not raw Supabase Studio for customer operation.
- Public form protection: Cloudflare Turnstile.
- Transactional email: external email API such as Resend, wired from server-side API code only.
- Media storage:
  - Current static stopgap: launch-critical identity, hero, contact, and route banner assets live under `public/media/launch`.
  - Supabase Storage for normal editorial, Stone Library, project, and article imagery.
  - Cloudflare R2 or Stream remains the review path for large homepage video assets if Supabase Storage or Pages asset limits are a poor fit.
- Cost planning:
  - Lean production target: about USD 30/month before tax/usage spikes.
  - Safer production target with paid transactional email headroom: about USD 50/month before tax/usage spikes.
  - See `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md` for the component-level cost table.
- Schema planning:
  - First production schema plan lives in `docs/SUPABASE_SCHEMA.md`.
  - Runtime is not considered migrated until migrations, RLS policies, seed scripts, admin UI, and API contracts are implemented and verified.

## Deployment and Build Contract
- Current deployment workflow: `.github/workflows/deploy.yml`
  - Trigger: push to `main`
  - Pipeline: `npm ci` -> `npm run build` -> deploy `dist/` to GitHub Pages
- Launch target deployment workflow:
  - Cloudflare Pages Git integration builds the repository.
  - Build command: `npm run build`
  - Output directory: `dist`
  - Production branch: `main` unless a later release process changes it.
  - Preview deployments are required for branch/PR review.
  - Cloudflare environment variables and secrets must not be committed.
  - Function routing must be restricted so only `/api/*` invokes Pages Functions.
- Vite base config: `vite.config.ts`
  - `base: '/'` for root-domain Cloudflare Pages clean URL routing.
- Cloudflare Pages static config:
  - `public/_redirects` provides SPA fallback with `/* /index.html 200`.
  - `public/_routes.json` scopes future Pages Functions to `/api/*`.
  - `public/_headers` sets conservative launch headers, long-cache rules for hashed assets/fonts, and one-day cache for unversioned launch media under `/media/*`.
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
  - Serves `dist/` with Vite preview and checks the React shell for key clean routes, `public/articles/index.json`, and critical CTA contracts.
  - Builds first only when `dist/` is missing; runtime tasks should still run `npm run build` before smoke.

## Route Interface Contract (`src/App.tsx`)

Routing uses clean paths through `BrowserRouter`. Cloudflare Pages direct refresh support depends on `public/_redirects`.

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

Current route risk: the catch-all still renders Home for unknown URLs. `NOW-ROUTE-ERROR-STATES-001` tracks replacing this with a branded 404/Not Found state before launch.

## Navigation Contract vs Implemented Routes

### Implemented navigation surfaces
- Shared header links: `/projects`, `/stone-library`, `/our-story`, `/articles`, `/products`, `/contact`
- Shared footer links: `mailto:info@urblo.com.au?subject=Sample%20Request`, `/contact`
- Shared footer social links: Instagram and LinkedIn use external links with `target="_blank"` plus `rel="noopener noreferrer"`; Facebook and YouTube are hidden until real destinations are available.

### Gaps
- Current implementation gap: Sample Request is still a `mailto:` fallback.
- Launch target: Contact and Sample Request submit through Cloudflare Pages Functions into Supabase, with Turnstile protection, email notification, and admin-visible lead records.

## Metadata Contract
- `index.html` contains Urblo-owned default title, description, favicon, manifest, canonical, Open Graph, and Twitter metadata.
- `src/App.tsx` updates route-level title, description, canonical, Open Graph, and Twitter metadata through `react-helmet`.
- Default share image asset: `public/og-default.png` at 1200 x 630. `public/og-default.svg` remains the editable source used to generate the PNG.
- Favicon assets: old-site-matched WordPress site icon PNGs in `public/favicon-32x32.png`, `public/favicon-192x192.png`, `public/favicon.png`, `public/apple-touch-icon.png`, and `public/mstile-270x270.png`.
- Web manifest: `public/site.webmanifest`, referencing PNG icon assets instead of the retired temporary SVG favicon.
- `react-helmet` still has a known strict-mode warning in development and should be replaced or upgraded during a later SEO/runtime cleanup.

## Current Static Media Contract
- P0 launch media lives under `public/media/launch` as a short-term controlled stopgap until Supabase Storage and Cloudflare media delivery are implemented.
- Shared site logo path: `public/media/launch/identity/urblo-logo.png`, referenced by `src/data/siteChrome.ts` and `src/data/homepage.ts`.
- Homepage hero poster path: `public/media/launch/home/hero-poster.jpg`.
- Homepage hero video path: `public/media/launch/home/urblo-hero.mp4`.
- Current homepage video asset is a web-ready H.264 720p export from the user-provided `Urblo_Homepage.mp4`; the original HEVC source was not committed.
- Homepage hero video source is constrained to desktop/tablet width through `media="(min-width: 768px)"`; mobile viewports keep the poster and do not select the MP4 source.
- Route banners are local launch media referenced from `src/App.tsx` through the `ROUTE_BANNERS` map.
- Contact image path: `public/media/launch/contact/project-contact.jpg`, referenced by `src/pages/ContactPage.tsx` and reused in homepage data where the same old WordPress image was previously used.
- Homepage section imagery and partner logos now use controlled files under `public/media/launch/homepage`.
- Our Story portraits now use controlled files under `public/media/launch/our-story`; the carbon banner uses the controlled route banner because the old WordPress carbon banner returned 404.
- Legacy project listing/detail media now uses controlled files under `public/media/launch/projects`.
- Stone Library primary finish imagery is mapped from `data/Product` through `src/data/stoneFinishImages.ts`; controlled fallback media lives under `public/media/launch/stone-library/fallbacks`.
- Stone Library current image status: Alpine White, Angola Black, Golden Crust Light/Dark, Honey Comb, Ivory Sand, Juparana, New Grey, Steel Blue, Tan Brown, and Zen Grey have finish-specific images. Tuscany Vein Cut and Cross Cut use variant-level shared-drive images as defaults rather than pretending to have finish-specific honed/polished/sandblasted photos. Blueocean still uses the controlled local fallback, and Harcourt still uses TBC placeholders because no matching current-site shared-drive sources were found.
- Article cover and inline cleanup media now uses controlled files under `public/media/launch/articles`.
- Article email-export HTML is still stored as source material under `public/articles`, but `src/lib/articleMedia.ts` rewrites known Squarespace/Front/Google proxy images to local launch media and removes email campaign tracking links before DOMPurify sanitization.
- Article claim-safety and mobile stopgap: `src/lib/articleMedia.ts` rewrites known high-risk newsletter phrases at runtime, unwraps dead links, and `src/index.css` constrains legacy newsletter tables/media to reduce mobile overflow until structured article blocks replace the raw newsletter HTML.
- This is not the long-term CMS media contract. During Supabase migration, these assets should be represented as media records and moved to Supabase Storage or Cloudflare media storage according to final performance testing.

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
  - Product detail pages initialize their configured default material selections, but selector changes still need stronger conversion feedback under `NEXT-PRODUCT-DETAIL-CONVERSION-001`.

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
- Cover images in the article manifest use local controlled paths under `public/media/launch/articles`.
- Detail HTML passes through `prepareArticleHtml` in `src/lib/articleMedia.ts` before DOMPurify sanitization.
- Runtime cleanup rewrites known email proxy image URLs to local article media, converts Google-hosted emoji images to text, removes Squarespace campaign wrappers where possible, and rewrites old product-PDF links to `/products`.
- Raw newsletter HTML remains committed only as migration source; do not treat it as the long-term authoring format.
- Launch target:
  - Articles move to Supabase-backed structured article blocks.
  - Raw newsletter HTML remains migration source material, not the long-term authoring format.
  - Approved block types are tracked in `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`.

### Supabase Launch Data Contract (Target)
- Site settings:
  - Global SEO, logo, favicon, social links, footer content, and default share image.
- Projects:
  - Project metadata, hero/gallery media, published status, SEO, evidence facts, material schedules, and hotspot records.
  - Hotspots store image-percentage coordinates and references to Stone Library records where possible.
- Stone Library:
  - Stone groups, variants, finishes, finish imagery, specifications, availability, and display ordering.
- Products:
  - Product families, model images, editable specs, and default material selections.
  - Product material defaults should reference Stone Library records where possible.
- Articles:
  - Article metadata plus structured block records.
  - Blocks cover rich text, image, gallery, quote, FAQ, CTA, project spotlight, stone reference, comparison table, proof metric, video embed, and callout.
- Forms:
  - Enquiries and sample requests store submitted fields, source route, Turnstile result, notification status, admin status, owner, and internal notes.
- Admin audit:
  - Admin mutations should be attributable through audit fields or audit-event records.
- Access control:
  - Public reads expose only published content.
  - Admin writes require Supabase Auth.
  - RLS must be enabled for exposed tables before any public integration is considered complete.

### Contact Page Contract
- Route: `/contact`
- Page module: `src/pages/ContactPage.tsx`
- Runtime behavior:
  - No backend submission is attempted.
  - Direct contact channels use `mailto:` and `tel:` links.
  - The project-brief form is local React state only; submit builds a prefilled `mailto:info@urblo.com.au` draft through `window.location.href`.
  - The page links back to `/stone-library` as a material discovery path.
- Launch target behavior:
  - Contact and Sample Request submit to server-side endpoints.
  - Server-side endpoints validate payloads, verify Turnstile, write Supabase records, and send transactional email.
  - Visitor-facing success/failure states must not depend on opening a local email client.

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
- Launch target side effects:
  - Public read paths fetch published Supabase content either at build time or through a controlled API contract.
  - Admin paths require authenticated Supabase sessions.
  - Form submissions create durable Supabase records and email notifications.
  - Old WordPress media URLs must not remain first-viewport production dependencies.

## Homepage Contract
- Homepage structure is driven by dedicated internal config in `src/data/homepage.ts`, not the legacy tabbed `FeatureSection`.
- Homepage uses `HomepageLayout` with `HomepageHeader`/`HomepageFooter` proxy components that currently render the shared `SiteHeader`/`SiteFooter`.
- The previous homepage `Browse by stone type` showcase has been removed by request; homepage material discovery should be reintroduced only through a new Urblo-aligned section if the client wants that pathway.
- Homepage typography is self-hosted from local static assets under `/public/fonts/urblo`:
  - `Avenir LT Std` weights `300/400/500/600/800`
  - `Didot LT Std` italic `400` and normal `600`
  - `Space Grotesk` local WOFF2
- Homepage runtime no longer depends on remote WordPress font CSS/TTF/WOFF assets.

## Last Runtime Quality Gate Status (Measured 2026-05-22)
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass
- `npm run agent:smoke`: pass

## Known Architecture Risks
- Cloudflare + Supabase is the approved launch target, but implementation has not started in runtime code.
- Cloudflare Pages repo-side clean URL configuration is in place, but dashboard project creation, preview validation, custom domain, DNS cutover, and rollback still require account access.
- Sample Request has no backend/form workflow yet and remains a `mailto:` fallback in current runtime.
- Projects, Stone Library, Products, and Articles remain file-backed until Supabase migration work is implemented.
- Admin CMS does not exist yet; customers cannot CRUD content without code changes.
- Project and Stone Library content migration needs strict separation between confirmed facts and inferred MVP copy.
- Raw article newsletter HTML still contains external source URLs as migration source material, but runtime article rendering now rewrites known email proxy image URLs and campaign links before render.
- Long-term article quality still requires Supabase structured blocks, approved article image records, editorial review, and claim-safe copy approval.
- Unknown URLs still render the homepage through the catch-all route until `NOW-ROUTE-ERROR-STATES-001` is implemented.
- Route-level code splitting has resolved the previous `>500kB` JavaScript chunk warning; continue monitoring build output as admin/CMS features are added.

## Brand and Design Linkage Rule
For UI/copy/IA changes, architecture and implementation decisions must be reviewed against:
- `docs/brand-baseline.md` for positioning, audience, voice, and claim safety.
- `docs/DESIGN.md` for visual rhythm, page composition, interaction tone, and responsive UI quality.

Brand and design linkage is advisory in execution flow, but required in task notes for high-impact user-facing changes.
