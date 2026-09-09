## Entry - 2026-05-22 (Delivery Readiness Cleanup)

### Scope
- Replaced the default Vite starter README with an Urblo-specific project README.
- Removed the unused React starter SVG asset from the starter assets folder.
- Marked `NOW-DELIVERY-READINESS-001` done because the active app metadata, favicon, footer social destinations, README handoff, and starter asset cleanup no longer expose template defaults.

### Changed Files
- `README.md`
- `src/assets/*`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass with existing bundle size warning and Browserslist staleness notice.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Final share imagery and deeper claim-safety review remain under `NOW-SEO-DELIVERY-001`.
- Contact and Sample Request still need Supabase-backed implementation.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-ASSET-STRATEGY-001`

## Entry - 2026-05-22 (Asset Hosting Strategy Closure)

### Scope
- Closed `NOW-ASSET-STRATEGY-001` because the interim and delivery-phase media hosting policy is now explicit.
- Current phase: controlled local assets under `public/media/launch` for launch-critical static media until backend storage is available.
- Delivery phase: Supabase Storage for normal CMS-managed media, with Cloudflare R2 or Stream reviewed separately for large homepage video delivery.
- Kept migration sequence, owners, and residual risks in the asset audit and architecture docs.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The policy is documented, but Supabase Storage buckets, media records, and upload workflows are not implemented yet.
- Homepage video still needs a final R2/Stream decision before production scale.

### Next Handoff
- `NOW-STONELIB-IMG-FASTTRACK-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-05-22 (Stone Library Image Fast-Track Closure)

### Scope
- Confirmed the provided primary Stone Library finish assets are mapped through the runtime image layer.
- Recorded current Stone Library image coverage so future agents and the client can distinguish real mapped finish photos, controlled temporary fallback images, and true missing source images.
- Closed `NOW-STONELIB-IMG-FASTTRACK-001`; final HD image sourcing remains under `NEXT-STONELIB-IMG-001`, and secondary Juparana/Zen Grey frame behavior remains under `NEXT-STONELIB-IMG-002`.

### Changed Files
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass with existing bundle size warning and Browserslist staleness notice.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Golden Crust, Harcourt, and Tan Brown still need approved HD source images before the Stone Library can be called visually complete.
- Blueocean, Honey Comb, and Tuscany use controlled local fallback imagery but still need finish-specific HD coverage.
- Juparana and Zen Grey secondary source frames exist but need an approved presentation pattern before implementation.

### Next Handoff
- `NOW-SEO-DELIVERY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-22 (SEO Social and Claim-Safety Cleanup)

### Scope
- Added a controlled 1200 x 630 PNG social share image and updated default Open Graph/Twitter metadata to use it.
- Kept the SVG social image as the editable source and adjusted the source text so it does not clip when exported.
- Rewrote article excerpts away from unqualified carbon, cost, speed, and universal-performance claims.
- Added a runtime article cleanup layer for known high-risk newsletter phrases so public article detail pages render safer wording until the Supabase structured article system replaces raw newsletter HTML.
- Closed `NOW-SEO-DELIVERY-001`.

### Changed Files
- `index.html`
- `public/og-default.png`
- `public/og-default.svg`
- `public/articles/index.json`
- `public/articles/*/meta.json`
- `src/App.tsx`
- `src/lib/articleMedia.ts`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass with existing bundle size warning and Browserslist staleness notice.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Raw article newsletter HTML is still not the final article model; it should move to Supabase structured blocks with editorial review.
- The React Helmet strict-mode warning remains.
- Bundle size warning remains and is the next no-secret launch-quality task.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `LATER-PERF-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-22 (Route-Level Code Splitting)

### Scope
- Converted public page components in `src/App.tsx` to lazy-loaded route modules while keeping existing layouts, route paths, and metadata behavior intact.
- Added a small route-loading fallback inside the existing page layout surfaces.
- Reduced the initial JavaScript app shell from about 674 kB to about 255 kB in the Vite production build.
- Closed `LATER-PERF-001`; the previous `>500kB` JavaScript chunk warning no longer appears.

### Changed Files
- `AGENTS.md`
- `src/App.tsx`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass; no `>500kB` JavaScript chunk warning, with the existing Browserslist staleness notice only.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Future admin/CMS features can reintroduce large chunks if not split deliberately.
- React Helmet strict-mode warning remains.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `LATER-QA-001`

## Entry - 2026-05-22 (Smoke CTA Coverage)

### Scope
- Expanded `npm run agent:smoke` beyond route-shell and article-index checks.
- Added named CTA contract checks for Contact navigation, Sample Request mailto fallback, homepage Contact/Sample Request fallbacks, Moon Gate CTAs, Contact page Stone Library CTA, and stone detail phone CTA.
- Closed `LATER-QA-001` because smoke failures now report actionable route/CTA names.

### Changed Files
- `scripts/agent-smoke.sh`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Smoke checks are still contract-level checks, not full browser interaction tests.
- Supabase-backed forms are still not implemented, so Sample Request remains a verified mailto fallback only.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CMS-001`
- `NEXT-PROJECTS-INTAKE-001`
- `NEXT-STONELIB-DATA-001`

## Entry - 2026-05-22 (Homepage Stone Section Removal and Full-Site UI QA)

### Scope
- Removed the homepage `Browse by stone type` section by request, including the unused source type/data and four local showcase images.
- Polished obvious homepage/product copy issues surfaced during the QA pass: removed unfinished ellipses, corrected `student accommodation`, corrected `street furniture`, and fixed the product heading text spacing.
- Added runtime article safeguards for legacy newsletter HTML: mobile table/media constraints, dead-link unwrapping, stronger loading behavior, and additional claim-sensitive phrase rewrites.
- Initialized product detail default material selections and corrected duplicate `Timber Flush +` model labels where they were intended to be `Timber Rise +`.
- Used two read-only subagents for independent route/UI and customer/content QA, then converted the unresolved findings into machine-readable Harness tasks.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `src/data/productData.ts`
- `src/pages/ProductDetailPage.tsx`
- `src/pages/ArticlePage.tsx`
- `src/lib/articleMedia.ts`
- `src/index.css`
- Deleted four former homepage stone showcase images from `public/media/launch/homepage`.
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass; no `>500kB` JavaScript chunk warning, with the existing Browserslist staleness notice only.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser desktop QA on `http://127.0.0.1:4174`: Home no longer contains `Browse by stone type`, Home and Prime Block have no broken images or horizontal overflow, Prime Block initializes New Grey, Stainless Steel Finish, and Spotted-Gum Timber, and the known React Helmet strict-mode warning remains.
- Playwright mobile fallback QA at 390px: `/articles/Debunking-the-Cost-Myth-by-Urblo-Bluestone-Blocks` had `scrollWidth` 390, zero horizontal overflow, zero broken images, zero empty links, and no flagged `Guaranteed Quality`, `zero cracks`, `3-10-week curing cycle`, `30% faster`, or `flawless alignment` text.

### Risks and Gaps
- Unknown URLs still render Home until `NOW-ROUTE-ERROR-STATES-001`.
- Articles still need structured blocks and full editorial approval under `NOW-ARTICLE-STRUCTURE-CLAIMS-001`.
- Product detail configuration still needs stronger conversion feedback and CTA under `NEXT-PRODUCT-DETAIL-CONVERSION-001`.
- Stone Library still needs approved source imagery for Golden Crust, Harcourt, and Tan Brown under `NEXT-STONELIB-IMG-001`.
- Legacy project pages remain less complete than Moon Gate and need migration under `NEXT-PROJECTS-INTAKE-001`.
- URL slug normalization should be decided before production indexing under `NEXT-SLUG-URL-NORMALIZE-001`.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ROUTE-ERROR-STATES-001`
- `NOW-ARTICLE-STRUCTURE-CLAIMS-001`
- `NEXT-PRODUCT-DETAIL-CONVERSION-001`
- `NEXT-PROJECTS-INTAKE-001`

## Entry - 2026-05-22 (Stone Library Drive Source Task)

### Scope
- Recorded the Saistone Google Drive shared folder named `Urblo Digital Stone Library` as the temporary source of truth for Stone Library imagery.
- Added `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001` to compare the shared-drive source against current website mappings and identify stale, changed, or unpublished Stone Library images.
- Kept machine-specific local absolute paths out of committed Harness docs.

### Changed Files
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The image audit itself has not been run yet.
- Shared-drive source folders may need manual naming normalization before automated mapping is reliable.

### Next Handoff
- `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001`
- `NEXT-STONELIB-IMG-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-22 (Harness Task Sequencing Cleanup)

### Scope
- Shortened `docs/HANDOFF.md` so it reads as a current handoff instead of a full verification history.
- Re-sequenced Stone Library image work so `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001` runs before final HD image coverage.
- Marked `NOW-ADMIN-CMS-001` as an umbrella objective and added smaller admin child tasks for IA/access planning, Auth/RLS, content CRUD, media, and lead management.
- Updated roadmap and root harness notes so future agents do not attempt the whole admin CMS in one pass.

### Changed Files
- `AGENTS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The new admin implementation child tasks remain blocked until Supabase/Auth/Storage/form secrets are available.
- `NEXT-ADMIN-IA-ACCESS-001` is the only admin task intended to proceed without secrets.

### Next Handoff
- `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001`
- `NEXT-ADMIN-IA-ACCESS-001`
- `NOW-ROUTE-ERROR-STATES-001`

## Entry - 2026-05-25 (Stone Library Drive Image Audit)

### Scope
- Ran the current-site-only Stone Library source audit against the Saistone shared-drive folder named `Urblo Digital Stone Library`.
- Followed user direction to ignore shared-drive products that are not currently present on the website.
- Compared current runtime mappings in `src/data/stoneFinishImages.ts` and repo media against shared-drive candidates without changing runtime mappings or assets in this pass.
- Recorded the update list for `NEXT-STONELIB-IMG-001`: Golden Crust Light/Dark, Tan Brown, Honey Comb, Tuscany, and Ivory Sand honed review.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates were not run because no runtime mappings or assets changed.

### Risks and Gaps
- `NEXT-STONELIB-IMG-001` still needs to normalize and map the approved shared-drive candidates.
- Ivory Sand honed needs visual review before replacing the current Sandstone-named asset.
- Blueocean and Harcourt still have no matching current-site source candidate in the shared-drive scope.

### Next Handoff
- `NEXT-STONELIB-IMG-001`
- `NEXT-ADMIN-IA-ACCESS-001`
- `NOW-ROUTE-ERROR-STATES-001`

## Entry - 2026-05-25 (Stone Library Current-Site Image Mapping)

### Scope
- Normalized current-site shared-drive Stone Library candidates into `data/Product`.
- Mapped Golden Crust Light/Dark, Tan Brown, and Honey Comb to finish-specific runtime images.
- Replaced old Ivory Sand `Sandstone` file paths with shared-drive `Ivory Sand` image paths after visual review.
- Mapped Tuscany Vein Cut and Cross Cut to variant-level default images only, avoiding false finish-specific claims.
- Removed obsolete old Sandstone-named assets and unused Tuscany fallback files; Blueocean keeps the controlled fallback and Harcourt keeps TBC placeholders.

### Changed Files
- `AGENTS.md`
- `data/Product/Golden Crust`
- `data/Product/Honey Comb`
- `data/Product/Ivory Sand`
- `data/Product/Tan Brown`
- `data/Product/Tuscany`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `public/media/launch/stone-library/fallbacks`
- `src/data/stoneFinishImages.ts`

### Verification Results
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- Browser QA: pass on `http://127.0.0.1:5173/stone-library`, `/stone-library/golden-crust`, `/stone-library/tan-brown`, `/stone-library/honey-comb`, and `/stone-library/tuscany`. Golden Crust Dark and Tuscany Cross Cut variant switches update to mapped images; only the known React Helmet strict-mode warning appeared in console logs.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Blueocean still needs approved finish imagery if Urblo wants more than the controlled fallback.
- Harcourt still needs approved source imagery before its TBC placeholder state can be removed.
- Tuscany still needs finish-specific photos before honed, polished, and sandblasted can be visually distinct.

### Next Handoff
- `NEXT-ADMIN-IA-ACCESS-001`
- `NOW-ROUTE-ERROR-STATES-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-25 (Admin IA and Access Contract)

### Scope
- Added `docs/ADMIN_IA_ACCESS.md` as the executable no-secret contract for the future Urblo-owned `/admin` site.
- Defined admin route map, unauthenticated/authenticated/unauthorized/loading states, viewer/editor/admin/owner role behavior, draft/review/published/archived/TBC content states, and module rollout sequence.
- Added first-pass field ownership models for leads, media, Stone Library, Projects, Products, and Articles.
- Recorded admin implementation boundaries so future agents do not ship fake production auth before Supabase credentials, RLS, Storage policies, form endpoints, and secrets are available.
- Updated architecture, launch plan, schema, design, handoff, roadmap, and task queue references to point future admin implementation work at the contract.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Runtime gates were not run because no runtime routes, components, data, or assets changed.

### Risks and Gaps
- `/admin` is not implemented yet.
- Supabase Auth, RLS, Storage policies, Cloudflare Pages Functions, Turnstile, and email secrets remain blocked until account access is available.
- The next no-secret runtime task is `NOW-ROUTE-ERROR-STATES-001`.

### Next Handoff
- `NOW-ROUTE-ERROR-STATES-001`
- `NEXT-PRODUCT-DETAIL-CONVERSION-001`
- `NEXT-PROJECTS-INTAKE-001`

## Entry - 2026-05-25 (Route Error States)

### Scope
- Replaced the catch-all homepage fallback with a branded not-found page so unknown public URLs no longer look like valid homepage visits.
- Added a shared `RouteState` component for public route-level loading, not-found, and load-error states.
- Updated product detail and article detail routes so missing slugs, loading work, and fetch failures render deliberate recovery states instead of blank content, red text, or misleading fallback content.
- Added smoke coverage for one unknown route shell and one missing product detail route shell.
- Updated architecture, design, handoff, roadmap, and task queue docs so future agents treat this as an implemented launch-safety contract.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/agent-smoke.sh`
- `src/App.tsx`
- `src/components/RouteState.tsx`
- `src/pages/ArticlePage.tsx`
- `src/pages/NotFoundPage.tsx`
- `src/pages/ProductDetailPage.tsx`

### Verification Results
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including unknown-route and missing-product state route shells.
- Browser QA: pass on `/not-a-real-urblo-route`, `/products/not-a-real-product`, and `/articles/not-a-real-article`; each route rendered deliberate state copy and did not render the homepage title.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Browser screenshot capture timed out during this QA pass, so state verification used browser title and rendered text checks instead.
- React Helmet still emits an existing strict-mode lifecycle warning in dev console.
- Product detail pages still need the separate conversion/configuration polish task.

### Next Handoff
- `NEXT-PRODUCT-DETAIL-CONVERSION-001`
- `NEXT-PROJECTS-INTAKE-001`
- `NEXT-STONELIB-IMG-002`

## Entry - 2026-05-25 (Product Detail Conversion)

### Scope
- Turned product detail configuration from button-only selection into a visible selected-configuration summary.
- Added a prefilled `mailto:` CTA so a visitor can discuss the exact product/model/material combination without waiting for Supabase forms.
- Added Contact and Stone Library recovery links inside the product configuration area.
- Added specification caveat copy so the current sample-level values are presented as discussion cues until final engineering/product data is approved.
- Added `OptionItem.imageState` and product selector treatment for missing stone imagery, including an explicit `Image pending` badge that does not pollute the button accessible name.
- Updated product/detail architecture, design contract, handoff, roadmap, and task queue docs.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/ModelSelector.tsx`
- `src/components/OptionSelector.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/service/StoneLibraryService.ts`
- `src/types/product.ts`

### Verification Results
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- Browser QA: desktop pass on `/products/primeBlock`; the page identity, meaningful content, selected summary, prefilled `mailto:` CTA, pending-image copy, and Timber Rise + / Harcourt interaction were verified. One screenshot was captured before the CTA row was adjusted, and a later browser reconnect failed before a fresh screenshot could be captured.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Browser mobile viewport override did not apply in the in-app Browser, and the Playwright CLI fallback was blocked because the local Chrome distribution is unavailable. Mobile layout still needs a fresh visual check when browser tooling is available.
- React Helmet still emits an existing strict-mode lifecycle warning in dev console.
- Product records remain static/file-backed; customer-editable product fields are still part of the Supabase/admin CRUD track.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NEXT-STONELIB-IMG-002`
- `NEXT-SLUG-URL-NORMALIZE-001`

## Entry - 2026-05-25 (Stone Library Secondary Frames)

### Scope
- Implemented secondary finish frames as support media for the active Stone Library finish, not separate finish states.
- Added secondary image mapping for approved Juparana and Zen Grey `_2` source frames in `src/data/stoneFinishImages.ts`.
- Extended the Stone Library service/type contract so `FinishVM.secondaryImages` carries approved secondary frame metadata.
- Added active-finish secondary thumbnails below the image stage; clicking a thumbnail opens the lightbox on that frame while preserving the active finish.
- Added frame selection inside `FinishLightbox` so primary and secondary frames can be inspected without changing finish state.
- Added active finish frame-count disclosure to `FinishAccordion`.
- Updated architecture, design, handoff, asset audit, roadmap, and task queue docs.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/FinishLightbox.tsx`
- `src/components/stone-library/ImageStage.tsx`
- `src/data/stoneFinishImages.ts`
- `src/pages/StoneLibraryDetailPage.tsx`
- `src/service/StoneLibraryService.ts`
- `src/types/stone-library.ts`

### Verification Results
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Fresh desktop/mobile browser visual QA is blocked: the in-app Browser reports no active pane, and the Playwright CLI fallback cannot launch because local Chrome is unavailable.
- Harcourt remains placeholder/TBC because no approved source imagery exists.
- Blueocean remains on the controlled fallback because no matching current-site shared-drive source exists.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NEXT-SLUG-URL-NORMALIZE-001`
- `NOW-ARTICLE-STRUCTURE-CLAIMS-001`

## Entry - 2026-05-25 (Public Slug Normalization)

### Scope
- Normalized canonical product slugs from camelCase to lowercase kebab-case.
- Normalized canonical article slugs from title-case export names to lowercase kebab-case.
- Added `legacySlugs` on products and articles so old public URLs still resolve inside the SPA.
- Added `sourceSlug` on article metadata so current raw HTML content can stay in the existing title-case source folders while public URLs become canonical.
- Added explicit Cloudflare 301 rules for old product and article URLs before the SPA fallback in `public/_redirects`.
- Updated smoke coverage to exercise canonical product/article route shells and assert representative redirect rules exist.
- Updated architecture, admin IA, handoff, roadmap, and task queue docs with the slug policy and redirect compatibility model.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `public/_redirects`
- `public/articles/index.json`
- `public/articles/Curving-the-Future-Greening-the-Pipelines-Sustainable-Legacy/meta.json`
- `public/articles/Debunking-the-Cost-Myth-by-Urblo-Bluestone-Blocks/meta.json`
- `public/articles/Modular-Mastery-How-PrimeBlock-Core-Transformed-Aitken-College/meta.json`
- `public/articles/Stone-Transformed-8-Ways-to-Redefine-Bluestones-Look-Feel/meta.json`
- `scripts/agent-smoke.sh`
- `src/data/productData.ts`
- `src/pages/ArticlePage.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/scripts/generate-article-index.ts`
- `src/service/ProductService.ts`
- `src/types/article.ts`
- `src/types/product.ts`

### Verification Results
- Article JSON metadata parse check: pass.
- `npm run build`: pass. Build emits the existing Browserslist staleness notice; no JavaScript chunk-size warning returned.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including canonical product/article route shells and representative old-to-new redirect rule checks.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Cloudflare 301 behavior still needs live Pages preview validation after Cloudflare project setup.
- Raw article content folders are intentionally not renamed in this pass; `sourceSlug` keeps compatibility until structured article migration.

### Next Handoff
- `NEXT-PROJECTS-INTAKE-001`
- `NOW-ARTICLE-STRUCTURE-CLAIMS-001`
- `NEXT-UI-PARITY-001`

## Entry - 2026-05-25 (Launch UI Hardening)

### Scope
- Implemented the approved UI/UX launch fixes except the two user-paused areas: article claim cleanup and broad legacy project-detail migration.
- Made the homepage hero full viewport, changed hero video loading to `preload="none"`, and preserved mobile poster-only behavior for performance.
- Added client-side scroll restoration so internal route changes land at the top instead of preserving deep scroll positions.
- Removed the duplicated Article detail route banner and hardened route-level loading, not-found, and error states for no-banner routes.
- Added mobile safeguards for legacy article newsletter HTML and shortened article previous/next controls.
- Made Product detail renders honest as geometry previews, with separate material preview rows for body stone, frame finish, and battens.
- Added Stone Library finish-image provenance roles so active imagery is labeled as finish-specific, reference, or pending.
- Added local Contact form validation before opening a mailto draft, improved mobile Our Story bio visibility, tightened global eyebrow contrast, fixed project facts mobile stacking, and made Product cards/copy more aligned with the current data.
- Replaced `react-helmet` with a native route metadata updater to remove React 19 strict-mode console noise.

### Changed Files
- `package.json`
- `package-lock.json`
- `src/App.tsx`
- `src/components/ProductCard.tsx`
- `src/components/RouteState.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/ImageStage.tsx`
- `src/data/stoneFinishImages.ts`
- `src/index.css`
- `src/pages/ArticlePage.tsx`
- `src/pages/ArticlesPage.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/NotFoundPage.tsx`
- `src/pages/OurStory.tsx`
- `src/pages/ProductDetailPage.tsx`
- `src/pages/ProductsPage.tsx`
- `src/pages/ProjectDetails.tsx`
- `src/service/StoneLibraryService.ts`
- `src/types/stone-library.ts`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Subagent review: completed as a sidecar UI/UX launch pass; it confirmed most dirty fixes and caught a temporary Stone Library `imageRole` type narrowing issue, which was fixed before final gates.
- Browser QA: pass on `/`, `/definitely-not-a-page`, `/projects/unknown-project`, `/articles/debunking-the-cost-myth-by-urblo-bluestone-blocks`, `/products/terra-line`, `/stone-library/new-grey`, `/our-story`, `/products`, and `/contact`.
- Browser QA metrics: homepage first section measured 900px at 1440x900 and 844px at 390x844; mobile homepage did not select the MP4 source; article detail at 320px had zero horizontal overflow; contact empty submit showed the inline validation message; homepage project-card navigation reset to `scrollY=0`.
- Fresh browser console check after removing `react-helmet`: no new warnings or errors after page load.
- Screenshot evidence was captured through the Playwright CLI fallback because Browser screenshot capture timed out in this environment.
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The desktop homepage MP4 is still large. Current mitigations reduce mobile cost and initial preload, but final performance sign-off still needs re-encoding or Cloudflare Stream/R2 review.
- Article claim cleanup is explicitly paused by user direction and remains open under `NOW-ARTICLE-STRUCTURE-CLAIMS-001`.
- Broad legacy project detail migration is explicitly paused by user direction and remains open under `NEXT-PROJECTS-INTAKE-001`.
- Raw article newsletter HTML remains a migration source and should still move to structured article blocks before customer CRUD is considered complete.
- Contact validation prevents empty mailto drafts but does not persist leads; Supabase-backed forms remain required.

### Next Handoff
- `NOW-ASSET-MIGRATION-001`
- `NOW-FORMS-SUPABASE-001`
- `NEXT-UI-PARITY-001`

## Entry - 2026-05-25 (Homepage Video Optimization)

### Scope
- Re-encoded the controlled homepage hero MP4 from the previous launch stopgap into a smaller production-friendly static asset.
- Preserved the existing public path `public/media/launch/home/urblo-hero.mp4` so no data contract or route changes were required.
- Kept desktop/tablet video behavior and mobile poster-only behavior from the launch UI hardening pass.
- Updated asset, architecture, handoff, roadmap, worklog, and machine task docs so agents no longer treat the desktop MP4 as an unresolved large-asset blocker.

### Changed Files
- `public/media/launch/home/urblo-hero.mp4`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Source size comparison: previous controlled MP4 was about 16MB; optimized MP4 is about 3MB.
- Encoding target: H.264 MP4, 1280x720, 30fps, no audio, fast-start.
- Browser QA on desktop 1440x900: homepage video selected `/media/launch/home/urblo-hero.mp4`, reached `readyState=4`, reported 1280x720 intrinsic size, first section height was 900px, and horizontal overflow was 0.
- Browser QA on mobile 390x844: homepage first section height was 844px, horizontal overflow was 0, and the video selected no MP4 source.
- Playwright CLI screenshot fallback captured the optimized desktop homepage first viewport.
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Live Cloudflare preview should still verify actual LCP/network behavior after deployment.
- Cloudflare Stream/R2 remains optional if the client wants adaptive streaming, analytics, or non-repo video management later.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-05-25 (Motion Polish)

### Scope
- Added shared structured-number motion for Urblo proof metrics.
- Applied count-up behavior to homepage metrics and Our Story counters.
- Replaced `react-countup` scroll-spy behavior with an in-house `IntersectionObserver` plus `requestAnimationFrame` counter so numbers visibly grow when the user scrolls to them.
- Added restrained route enter transitions keyed by pathname so public page changes feel smoother without delaying route-state content.
- Kept dates, dimensions, specification text, filter counts, native select option counts, and Stone Library card scan counts static after motion review because those numbers support fast inspection rather than brand proof.
- Updated the design, architecture, handoff, roadmap, worklog, and machine task queue to record the motion boundary for future agents.

### Changed Files
- `src/App.tsx`
- `package.json`
- `package-lock.json`
- `src/components/AnimatedNumber.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/pages/OurStory.tsx`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: homepage proof metrics start at `0`, show intermediate values after scroll, and reach final values with zero horizontal overflow.
- Browser QA: Our Story proof counters start at `0`, show intermediate values after scroll, and reach final values with zero horizontal overflow.
- Browser QA: Stone Library result count and card finish/variant counts remain immediate/static scan text, not count-up targets.
- Browser QA: clicking from `/projects` at scroll depth into `/projects/moon-gate-woolley-street` lands on the detail page with `scrollY=0` and zero horizontal overflow.
- Browser QA: unknown public route still renders the deliberate Page not found state with zero horizontal overflow.

### Risks and Gaps
- Numeric count-up now intentionally runs on viewport entry so the growth is visible. If future accessibility review requires a reduced-motion opt-out for counters, add a scoped prop rather than reverting to library scroll-spy behavior.
- This pass does not change Supabase forms, admin CMS, article structure, or broad legacy project migration.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-25 (Page Title Typography)

### Scope
- Promoted the Projects page title typography to the global public page H1 style.
- Changed `.urblo-page-title` to use `Avenir LT Std`, light `300`, normal letter spacing, and no forced uppercase.
- Replaced Projects and legacy project detail H1s with the shared page title class.
- Replaced Article detail's previous Space Grotesk uppercase H1 with the shared page title class plus a white inverse modifier for the image hero.
- Left homepage hero, card titles, section headings, Stone Library specs headings, and project material-map hero typography unchanged because they are different hierarchy roles.
- Updated design, handoff, roadmap, worklog, and machine task docs.

### Changed Files
- `src/index.css`
- `src/pages/Projects.tsx`
- `src/pages/ProjectDetails.tsx`
- `src/pages/ArticlePage.tsx`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: `/projects`, `/products`, `/stone-library`, `/our-story`, `/contact`, `/articles`, one article detail route, one product detail route, one stone detail route, and one no-banner route state all use `Avenir LT Std`, weight `300`, no forced uppercase, and zero horizontal overflow for page H1s.
- Browser QA: mobile `/contact` and the long article detail title have zero horizontal overflow after adding page-title wrapping and increasing the article hero image height.

### Risks and Gaps
- Further editorial/title content can still create unusual wrapping, but current long Contact and article-detail cases are checked at desktop and 390px mobile.
- This pass does not change card, section, tool, or homepage hero typography.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-25 (Stone Library Image Label Readability)

### Scope
- Improved Stone Library image overlay labels after user feedback that small black-on-image labels were hard to read.
- Changed detail-stage image provenance labels, Zoom affordance, and collapsed finish labels to use dark translucent backplates with white text.
- Used Urblo lime as a restrained confirmed/action signal instead of a broad overlay fill, so pending/reference imagery does not read as approved and stone texture remains inspectable.
- Unified Stone Library list-card `Available` and `Upcoming` image badges with the same overlay language.
- Updated the design contract, handoff, roadmap, and machine task queue.

### Changed Files
- `src/components/stone-library/ImageStage.tsx`
- `src/components/stone-library/FinishLightbox.tsx`
- `src/components/stone-library/StoneCard.tsx`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: `/stone-library` list badges and `/stone-library/blueocean`, `/stone-library/harcourt`, `/stone-library/tuscany`, and `/stone-library/juparana` detail overlays render with generated dark translucent backgrounds and white text at 1280px.
- Browser QA: `/stone-library` and `/stone-library/harcourt`, `/stone-library/blueocean`, and `/stone-library/juparana` remain readable at 390px; `/stone-library/juparana` also remains readable at 320px, with no page-level horizontal overflow and no collision between the left provenance label and right Zoom action.

### Risks and Gaps
- This pass improves label contrast and UI consistency; it does not change remaining Stone Library source-image coverage gaps such as Harcourt pending imagery.
- Browser QA caught unsupported Tailwind opacity shorthands during the pass; the affected Stone Library classes were replaced with generated opacity tokens before final gates.
- Final production contrast should still be rechecked after any future HD image swap, especially on very bright or highly patterned stone photos.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-25 (Stone Library Status Pill Consistency)

### Scope
- Followed up on the external Stone Library `Available` states after user feedback that the outside status badges also needed the same polish.
- Added a shared `StatusPill` component for Stone Library status presentation across light, dark, and image-overlay contexts.
- Converted detail header status, variant status, finish selector status, Specs availability summary, Finish Capability rows, Cut Options rows, and card status badges to the same lightweight status system.
- Reworked external availability badges into a lighter lime ghost treatment after user feedback that black status blocks felt too heavy for Urblo.
- Removed broad lime fills from external availability badges; Urblo lime now appears as a thin outline/wash and small confirmed-available signal.
- Left missing-data and empty-state text as plain copy rather than turning every `TBC` or `No` string into status chrome.

### Changed Files
- `src/components/stone-library/StatusPill.tsx`
- `src/components/stone-library/StoneCard.tsx`
- `src/pages/StoneLibraryDetailPage.tsx`
- `src/components/stone-library/VariantSwitch.tsx`
- `src/components/stone-library/FinishAccordion.tsx`
- `src/components/stone-library/SpecsPanel.tsx`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: Stone Library list, Juparana detail, and Harcourt detail status pills render with no heavy black status blocks at desktop and 390px mobile widths, and the checked routes have no page-level horizontal overflow.

### Risks and Gaps
- The price tier meter still uses Urblo lime bars by design; it is a price scale, not an availability badge.
- Production contrast should be checked again after any future Stone Library visual system change or image source swap.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-25 (Homepage Edge Hero Reveal)

### Scope
- Reworked the homepage first viewport after user feedback that the logo, nav, and hero copy were too constrained by the centered page container.
- Added an edge-aligned container for the global header and homepage hero while leaving standard content pages on the normal readable page container.
- Replaced the old first-viewport `Stone Solutions for Street` headline and support copy with three sequential hero lines: `Design.`, `Source.`, `Deliver.`
- Restricted Urblo green to the punctuation dots and made the line reveal reduced-motion aware.
- Recorded the edge-aligned hero/header pattern in the design contract and machine task queue.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/components/site/SiteHeader.tsx`
- `src/data/homepage.ts`
- `src/index.css`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Playwright screenshot QA: homepage checked at 1440x900 and 390x844 after animation settle; header/hero edge alignment, full-viewport video/poster treatment, and no hero text overflow were verified visually.

### Risks and Gaps
- The desktop hero video remains the controlled static MP4 with mobile poster-only behavior; Cloudflare preview should still verify actual LCP/network behavior after deployment.
- The edge container is intentionally limited to the global header and homepage first viewport; future full-bleed sections should opt in deliberately rather than replacing the standard content container.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-26 (Homepage Hero Reference Alignment)

### Scope
- Adjusted the homepage hero after the user clarified the Richard Crookes reference target.
- Changed the verb stack to all caps: `DESIGN.`, `SOURCE.`, `DELIVER.`
- Offset the second line, reduced the hero type scale, and lowered the stack closer to the viewport bottom.
- Changed hero motion from an upward line reveal to a letter-by-letter left-to-right reveal, while preserving reduced-motion behavior.
- Rechecked desktop and mobile first-viewport rendering and mobile menu interaction.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA at 1440x900: all-caps hero, edge-aligned first line, second-line offset, smaller type, lower bottom anchoring, and no top clipping render correctly.
- Browser QA at 390x844: no horizontal overflow; all three lines fit and remain readable over the poster frame.
- Browser animation QA: mid-animation state shows `DESIGN.` complete while `SOURCE.` is partially revealed and `DELIVER.` is still hidden, matching the requested first-line, second-line, third-line sequencing.
- Browser interaction QA: mobile header menu button resolves uniquely, opens successfully, and exposes nav links.
- Browser console: only the expected Framer Motion reduced-motion warning was present because the test browser has reduced motion enabled.

### Risks and Gaps
- The Browser test environment had reduced motion enabled; the reduced-motion path still preserves visible letter sequencing with shorter fades, while the normal path keeps the same line and character delays with slightly more motion.
- The hero remains tied to the current controlled video/poster asset; Cloudflare preview should still verify real network and LCP behavior after deployment.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-26 (GitHub Pages SPA Fallback)

### Scope
- Investigated direct URL 404s on GitHub Pages for clean React routes such as `/stone-library/angola-black`.
- Confirmed direct GitHub Pages requests were returning the platform 404 before the React app loaded, while client-side navigation worked after the app was already running.
- Added a short-term GitHub Pages deploy step that copies `dist/index.html` to `dist/404.html` after build, allowing GitHub Pages missing-file fallback to load the SPA.
- Documented that this does not replace Cloudflare Pages routing; Cloudflare remains the production launch target and continues to rely on `public/_redirects`.

### Changed Files
- `.github/workflows/deploy.yml`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `curl -I https://jayyy-3.github.io/stone-library/angola-black`: confirmed current live GitHub Pages platform 404 before the fix is deployed.
- `git show origin/gh-pages:404.html`: confirmed the deployed branch currently has no `404.html`.
- `npm run build`: pass. Browserslist staleness notice remains.
- `test -f dist/index.html && cp dist/index.html dist/404.html && cmp -s dist/index.html dist/404.html`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Post-deploy `origin/gh-pages:404.html`: confirmed `404.html` exists and matches the Urblo app shell.
- Post-deploy `curl -sS -D - https://jayyy-3.github.io/stone-library/angola-black`: returns GitHub Pages HTTP 404 status with the Urblo app shell body, not the default GitHub platform 404 body.
- Browser verification: direct visit to `https://jayyy-3.github.io/stone-library/angola-black` renders `Stone Detail | Urblo`, `h1` = `Angola Black`, and the stone detail content.

### Risks and Gaps
- GitHub Pages may still return HTTP 404 status for fallback-served deep links even though the React app renders the requested route; this is acceptable only as a short-term preview fix.
- Cloudflare Pages should remove the need for this workaround by serving clean routes through `public/_redirects` with a 200 fallback.
- Live GitHub Pages behavior has been confirmed after the pushed workflow deployed `gh-pages`; keep treating it as a preview-only compatibility patch.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-26 (Homepage Proof Section Update)

### Scope
- Removed the rendered homepage sustainability/tabbed feature module from the page flow by request.
- Moved the homepage proof metrics section into the removed module's position, directly after the hero.
- Replaced the previous team-assistance copy with `Stone has always shaped cities.` and `We shape how stone is designed, specified, and delivered.`
- Replaced the metrics with 50+ projects delivered, 130+ tonnes of CO2 offset, 20+ landscape architects nominated, and 3500+ linear metres stone blocks delivered.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- Browser verification on `http://127.0.0.1:5174/`: pass. The old sustainability copy and old team copy are absent; the new proof copy appears in section 1 directly after the hero; the partner banner follows the proof metrics section.
- Browser scrolled verification: pass. Metrics animate to 50+, 130+, 20+, and 3,500+ with the requested labels.

### Risks and Gaps
- The old sustainability/tabbed module code remains available but is disabled from the rendered homepage flow. Treat any future reintroduction as a design/content rebuild, not a simple toggle-on.
- The updated CO2 and delivery metrics are client-supplied copy in this task; deeper substantiation should be handled during CMS/content governance.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-26 (Homepage Partner Banner Copy)

### Scope
- Replaced the homepage partner banner copy with `Design-led stone solutions for streetscapes & civil landscapes.`
- Changed the banner component to render the copy from `src/data/homepage.ts` instead of keeping a separate hardcoded JSX sentence.
- Highlighted `Design-led` in Urblo lime while keeping the remainder of the banner sentence white.
- Updated the brand baseline anchor line so future agents do not revive the old trusted-partner wording.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `docs/brand-baseline.md`
- `docs/HANDOFF.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser DOM verification on `http://127.0.0.1:5174/`: pass. The partner banner section text is `Design-led stone solutions for streetscapes & civil landscapes.`, and the old trusted-partner sentence is absent from the rendered section.
- Browser style verification on `http://127.0.0.1:5174/`: pass. `Design-led` renders as a separate span with computed color `rgb(0, 255, 25)`, matching `--urblo-lime`.
- `npx playwright screenshot --wait-for-timeout=2500 --full-page --viewport-size=1280,720 http://127.0.0.1:5174/ /tmp/urblo-home-fullpage-partner-banner-check.png`: captured supplemental visual evidence.

### Risks and Gaps
- Browser screenshot capture through the in-app Browser timed out once; DOM verification and Playwright screenshot fallback were used instead.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-26 (Capabilities CTA and Route)

### Scope
- Added a lightweight `Our Capabilities` CTA under the homepage proof-section intro copy.
- Added `/capabilities` as a dedicated provisional capability page covering design translation, specification support, sourcing/fabrication, and delivery coordination.
- Updated route metadata, smoke route coverage, and Harness docs so the new public route is tracked.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/pages/CapabilitiesPage.tsx`
- `src/App.tsx`
- `scripts/agent-smoke.sh`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/capabilities` route shell and the homepage capabilities CTA target.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- In-app Browser verification on `http://127.0.0.1:5174/`: pass. The homepage renders exactly one `Our Capabilities` link with `href="/capabilities"`, and clicking it navigates to `/capabilities` with title `Capabilities | Urblo`.
- In-app Browser rendered-content verification: pass. `/capabilities` renders `Our Capabilities`, `Design translation`, and `Delivery coordination`. Console warnings were limited to the existing reduced-motion environment notice.
- Playwright screenshot fallback on `http://127.0.0.1:5174/`: pass. Desktop and 390px mobile screenshots confirmed the homepage CTA placement and `/capabilities` page render with no console errors or mobile horizontal overflow. The fallback was used because in-app Browser screenshot capture timed out twice.

### Risks and Gaps
- `/capabilities` copy is provisional and should be replaced with client-approved capability content before treating it as final launch messaging.
- The route currently reuses the projects banner until dedicated capability imagery is approved.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-05-26 (Supabase Execution Task Breakdown)

### Scope
- Confirmed the Supabase execution path should start with the accessible Urblo project, not manual dashboard table creation.
- Split the Supabase work into foundation migration, baseline seed, forms backend, admin auth shell, and later content CRUD phases.
- Added explicit acceptance criteria for migrations, table existence, RLS policy inspection, lead row creation, and no browser-exposed service-role secrets.
- Added a reviewed migration directory scaffold for future SQL migration files.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `supabase/migrations/README.md`

### Verification Results
- `node -e "JSON.parse(require('fs').readFileSync('docs/agent/tasks.json','utf8')); console.log('tasks json ok')"`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The Supabase project exists and is connector-accessible, but no production migration has been applied yet.
- First admin email, browser-safe anon-key handling, Turnstile secrets, and transactional email secrets are still needed before the admin and form flows can be considered production-ready.
- Cloudflare Pages project creation remains separate from Supabase execution and may still require resolving Hunter account Pages API permissions or choosing Jay's account for Pages.

### Next Handoff
- `NOW-SUPABASE-FOUNDATION-001`
- `NOW-SUPABASE-SEED-BASELINE-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-05-27 (Supabase Foundation Applied)

### Scope
- Added reviewed Supabase foundation migrations under `supabase/migrations`.
- Applied `foundation_schema`, `foundation_hardening`, and `anon_read_only` to Supabase project `npkidywzwddbnfrnxlmo`.
- Created launch foundation tables for admin profiles, audit events, media assets, site settings, finish definitions, Stone Library, Products, Projects, Articles, enquiries, sample requests, and sample request items.
- Added `updated_at` triggers, admin-role helper functions, status/FK/listing indexes, operational new-lead partial indexes, anonymous read-only grants for public content, and RLS policies.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `supabase/migrations/README.md`
- `supabase/migrations/202605270001_foundation_schema.sql`
- `supabase/migrations/202605270002_foundation_hardening.sql`
- `supabase/migrations/202605270003_anon_read_only.sql`

### Verification Results
- Supabase migration list: pass. `foundation_schema`, `foundation_hardening`, and `anon_read_only` are listed on project `npkidywzwddbnfrnxlmo`.
- Supabase table existence check: pass. 24 expected foundation tables exist in `public`.
- Supabase RLS check: pass. 24/24 public foundation tables have RLS enabled.
- Supabase policy summary: pass. Public content tables have public-select policies plus admin policies; lead/admin private tables have admin policies and no public-select policies.
- Supabase private grant check: pass. `anon` has no SELECT/INSERT/UPDATE/DELETE grants on `admin_profiles`, `admin_audit_events`, `enquiries`, `sample_requests`, or `sample_request_items`.
- Supabase public grant check: pass. `anon` has SELECT and no INSERT/UPDATE/DELETE on checked public content tables.
- Supabase FK index check: pass. No public-schema foreign-key columns are missing an index after hardening.
- Supabase operational queue index check: pass. `enquiries_new_queue_idx` and `sample_requests_new_queue_idx` exist.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass. Existing public route shells, redirects, and CTA contracts remain green.

### Risks and Gaps
- No seed data exists yet; `finish_definitions` and `site_settings` remain empty until `NOW-SUPABASE-SEED-BASELINE-001`.
- No first admin user has been created because that requires Jay to confirm the first admin email.
- No runtime code is connected to Supabase yet; public pages remain static/file-backed and forms remain mailto/local-only until the forms backend checkpoint.
- Supabase Storage buckets/policies are not implemented yet; media CRUD remains part of the admin media checkpoint.

### Next Handoff
- `NOW-SUPABASE-SEED-BASELINE-001`
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-05-27 (Supabase Baseline Seed Applied)

### Scope
- Added the baseline seed migration under `supabase/migrations`.
- Applied `baseline_seed` to Supabase project `npkidywzwddbnfrnxlmo`.
- Seeded the first published finish dictionary from the current Stone Library data.
- Seeded one published default Urblo `site_settings` row with contact, social, footer, and SEO baseline values.
- Updated Harness docs so the next executable checkpoint is the forms backend.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `supabase/migrations/README.md`
- `supabase/migrations/202605270004_baseline_seed.sql`

### Verification Results
- Supabase migration list: pass. `baseline_seed` is listed on project `npkidywzwddbnfrnxlmo`.
- Supabase finish seed check: pass. `finish_definitions` contains 12 rows and 12 distinct finish keys.
- Supabase site settings check: pass. `site_settings` contains one published `default` row.
- Supabase idempotency check: pass. Rerunning the seed upsert kept counts at 12 distinct finishes and one default settings row.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- Public runtime is still static/file-backed and does not read this seed data yet.
- Contact and Sample Request still depend on local/mailto behavior until `NOW-FORMS-BACKEND-001`.
- No first admin user has been created because that requires Jay to confirm the first admin email.
- Supabase Storage buckets, media policies, Auth UI, and admin CRUD are still pending.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-05-27 (Forms Backend Source and Contact Submit Flow)

### Scope
- Added Cloudflare Pages Function source for `/api/enquiries` and `/api/sample-requests`.
- Added shared server-side validation, Turnstile fail-closed behavior when configured, Supabase REST writes using server-side credentials, and staged Resend notification handling.
- Reworked the Contact page so the main enquiry flow submits to `/api/enquiries` instead of opening a local email draft.
- Added Contact page Sample Request mode at `/contact?intent=sample-request`, with sample preference, finish, quantity, project name, shipping address, and notes fields that submit to `/api/sample-requests`.
- Updated footer/sample request CTA contracts to route to the Contact sample-request mode.
- Added `scripts/check-forms-api.mjs` and wired it into `npm run agent:smoke` so invalid submissions, valid Supabase write payloads, sample request item payloads, and Turnstile failure behavior are checked without secrets.

### Changed Files
- `functions/_lib/forms.js`
- `functions/api/enquiries.js`
- `functions/api/sample-requests.js`
- `scripts/check-forms-api.mjs`
- `scripts/agent-smoke.sh`
- `src/pages/ContactPage.tsx`
- `src/data/siteChrome.ts`
- `src/data/homepage.ts`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `node scripts/check-forms-api.mjs`: pass. Valid enquiry targets `enquiries`; invalid enquiry returns validation failure before Supabase calls; valid sample request targets `sample_requests` and `sample_request_items`; configured Turnstile failure returns 403 before Supabase calls.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including the Forms API checks and updated Sample Request CTA route contracts.
- Playwright screenshot check: partial pass. A 390px mobile screenshot of `/contact` rendered without visible first-viewport layout breakage. Follow-up screenshots for `/contact?intent=sample-request` were blocked by local Playwright browser launch failures after the first capture.

### Risks and Gaps
- Live API row creation through `/api/enquiries` and `/api/sample-requests` has not been run because no local or Cloudflare server-side `SUPABASE_SERVICE_ROLE_KEY` is configured in the environment.
- Turnstile and Resend notification code is staged but not production-verified because those secrets are not configured.
- `NOW-FORMS-BACKEND-001` should stay open until live endpoint tests prove valid submissions create Supabase rows and invalid submissions create no rows.
- Admin lead inbox and status updates are still pending under the admin auth/media/leads tasks.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-06-02 (Homepage Mobile Hero Video Source)

### Scope
- Added a mobile-specific homepage hero video so phone viewports no longer stay poster-only.
- Generated `public/media/launch/home/urblo-hero-mobile.mp4` from the controlled desktop MP4 as a 540x960, 9:16, no-audio, fast-start H.264 export at about 1.1MB.
- Updated homepage hero source selection so mobile uses `media="(max-width: 767px)"` and desktop/tablet keeps the existing `media="(min-width: 768px)"` MP4.

### Changed Files
- `public/media/launch/home/urblo-hero-mobile.mp4`
- `src/data/homepage.ts`
- `src/components/homepage/HomepageSections.tsx`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Transcode check: mobile MP4 is H.264 540x960, SAR 1:1, DAR 9:16, 30fps, no audio, 17.67s, about 530kbps / 1.1MB.
- Playwright local production-preview mobile 390x844: pass. `video.currentSrc` selected `/media/launch/home/urblo-hero-mobile.mp4`, `readyState=4`, `paused=false`, intrinsic video size 540x960, no horizontal overflow, no console issues.
- Playwright local production-preview desktop 1440x900: pass. `video.currentSrc` selected `/media/launch/home/urblo-hero.mp4`, `readyState=4`, `paused=false`, intrinsic video size 1280x720, no horizontal overflow, no console issues.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:smoke`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Production verification is required after Cloudflare Pages deploys this commit.
- Mobile video uses a center portrait crop from the landscape source. If the client wants shot-by-shot art direction, generate a dedicated mobile edit rather than a centered crop.
- The first-visit Welcome acknowledgement modal still overlays the mobile first viewport until dismissed.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-ASSET-MIGRATION-001`
- `LATER-PERF-001`

## Entry - 2026-06-02 (Homepage Hero Video Performance Investigation)

### Scope
- Investigated slow homepage video loading on `https://urblo.com.au` after Cloudflare Pages cutover.
- Compared production custom domain, Pages default domain, and GitHub Pages delivery for `public/media/launch/home/urblo-hero.mp4`.
- Found the MP4 is a 3.1MB Cloudflare-served, byte-range-capable asset, but the homepage initially loaded the hero MP4/poster plus heavy below-the-fold homepage images at the same time.
- Added an HTML preload for the hero poster, kept the poster as a hero section background fallback, changed desktop hero video to `preload="auto"`, and deferred partner banner, Product Showcase background, Latest Projects media, Manifesto background, and Video CTA imagery until their sections are near the viewport.

### Changed Files
- `index.html`
- `src/components/homepage/HomepageSections.tsx`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Production `curl -I https://urblo.com.au/media/launch/home/urblo-hero.mp4`: `200`, `content-type: video/mp4`, `content-length: 3107047`, `Cache-Control: public, max-age=86400`, `accept-ranges: bytes`, and Cloudflare cache hit observed.
- Production Playwright resource timing before the fix showed `urblo-hero.mp4`, `hero-poster.jpg`, `partner-banner-west-side-place.jpg`, Latest Projects images, and homepage background images all starting around the first homepage render.
- Local production-preview Playwright resource timing after the fix showed the initial hero-load set limited to `hero-poster.jpg`, app/home JS/CSS chunks, and `urblo-hero.mp4`.
- Desktop Playwright screenshot/DOM check on `http://127.0.0.1:4173/`: pass. Hero height was 900px, no horizontal overflow, video `readyState=4`, `paused=false`.
- Mobile Playwright check at 390x844: pass. No MP4 request, no selected `currentSrc`, hero height 844px, no horizontal overflow.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:smoke`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The production custom-domain timing still needs deployed-after-fix verification after Cloudflare Pages receives this build.
- Local forced IPv6 `curl -6` timed out across Cloudflare hosts from this machine; because `urblo.pages.dev` also timed out under forced IPv6, this appears environment/network-specific and was not treated as an Urblo DNS change.
- The first-visit Welcome acknowledgement modal still affects perceived first viewport composition but was outside this performance fix.
- The current MP4 remains static repo media. Cloudflare Stream/R2 or a smaller adaptive/mobile video variant remains optional if real-user production metrics still show slow hero playback.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-ASSET-MIGRATION-001`
- `LATER-PERF-001`

## Entry - 2026-06-03 (Homepage Section Order, Header Menu, and YouTube CTA)

### Scope
- Reduced the homepage `Design-led stone solutions for streetscapes & civil landscapes.` partner banner to a slimmer transition band.
- Moved Latest Projects directly below that partner banner, before Product Showcase.
- Replaced the bottom homepage local-video modal with a lazy `youtube-nocookie` iframe for YouTube video `UfRtQZSi7cM`, loaded only after the Play button is clicked.
- Updated the shared header so desktop keeps Projects, Capabilities, Stone Library, Our Story, and Contact Us visible while Articles and Products move into the right-side hamburger. Mobile keeps the full navigation list inside the hamburger.
- Updated Harness docs for the new homepage rhythm, header navigation contract, and video CTA contract.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/components/site/SiteHeader.tsx`
- `src/data/homepage.ts`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass for the touched runtime/Harness files.
- In-app Browser verification: attempted against local Vite preview, but the browser backend reported `net::ERR_BLOCKED_BY_CLIENT` for `http://127.0.0.1:4173/`; Playwright fallback was used.
- Playwright local production-preview desktop 1440x900: desktop primary nav showed Projects, Capabilities, Stone Library, Our Story, and Contact Us without Articles/Products; the hamburger exposed Articles and Products; the `Design-led` banner resolved to the slimmer 258px band; Latest Projects followed the banner; the Play modal mounted `https://www.youtube-nocookie.com/embed/UfRtQZSi7cM?autoplay=1&rel=0&modestbranding=1&playsinline=1`; no horizontal overflow.
- Playwright local production-preview mobile 390x844: hamburger exposed the full navigation including Articles and Products; no horizontal overflow.

### Risks and Gaps
- The YouTube iframe depends on the third-party YouTube player once the visitor clicks Play; this is intentionally lazy-loaded and not part of initial homepage render.
- Production Cloudflare smoke and browser verification are still required after this commit deploys.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-06-03 (Desktop Header Right Alignment)

### Scope
- Restored the desktop shared header layout so the visible primary nav and hamburger button are one right-aligned group rather than separate centered/right columns.
- Kept Articles and Products inside the desktop hamburger menu.
- Kept mobile behavior unchanged: the hamburger exposes the full navigation list.
- Updated Harness docs with the explicit right-aligned header contract to prevent future centered-nav regressions.

### Changed Files
- `src/components/site/SiteHeader.tsx`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- In-app Browser local production-preview check on `http://127.0.0.1:4173/`: pass. Desktop header opened successfully, console errors/warnings were empty, visible primary links were Projects, Capabilities, Stone Library, Our Story, and Contact Us, and the visible desktop hamburger menu links were Articles and Products.
- Playwright local production-preview desktop 1440x900: pass. Primary nav measured from x=736 to x=1310, hamburger x=1334 to x=1382, nav-to-button gap 24px, right gutter 58px, no horizontal overflow, and zero console issues.
- Playwright local production-preview mobile 390x844: pass. Desktop primary nav was hidden, hamburger right gutter was 20px, opened menu exposed Projects, Capabilities, Stone Library, Our Story, Articles, Products, and Contact Us, no horizontal overflow, and zero console issues.
- Production deploy check: pass. `https://urblo.com.au/` and `https://www.urblo.com.au/` now serve `/assets/index-DZ_ipi64.js` for commit `f21bbd4`.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://www.urblo.com.au`: pass.
- In-app Browser production desktop check on `https://urblo.com.au/`: pass. Visible primary links were Projects, Capabilities, Stone Library, Our Story, and Contact Us; nav-to-button gap was 24px, right gutter was 57px, desktop hamburger exposed only Articles and Products, and console errors/warnings were empty.
- Playwright production mobile 390x844: pass. Desktop primary nav was hidden, hamburger right gutter was 20px, opened menu exposed Projects, Capabilities, Stone Library, Our Story, Articles, Products, and Contact Us, no horizontal overflow, and zero console issues.

### Risks and Gaps
- No known header-alignment regression remains after local and production checks.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-06-03 (Harness Task-State Reconciliation)

### Scope
- Reconciled `docs/agent/tasks.json` against current code, deployed Cloudflare state, controlled launch media, and no-secret verification gates.
- Marked `NOW-CLOUDFLARE-PAGES-DEPLOY-001` complete because Cloudflare Pages production deployment, custom domains, DNS cutover, Function routing scope, route/asset/redirect/API smoke, and rollback documentation are verified.
- Marked `NOW-ASSET-MIGRATION-001` complete for launch-critical media because identity assets, route banners, Contact imagery, homepage desktop/mobile video, poster, priority project/Stone Library imagery, article covers, and known article runtime media cleanup use controlled launch paths.
- Kept Forms/Admin/Content tasks open where acceptance still requires browser-safe Supabase config, first-admin/profile setup, admin live QA, email/Turnstile proof, tagged live admin writes, approved content import, or public read cutover.
- Updated Handoff and roadmap wording so Cloudflare hosting and launch-critical asset migration no longer appear as current blockers.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm ci --cache .npm-cache`: pass after approved network access; dependencies installed from lockfile and audit reported 0 vulnerabilities.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass after approved local preview-server permission; sandbox-only run failed with `listen EPERM` on `127.0.0.1:4173`.
- `npm run agent:check`: pass.
- `npm run agent:forms-ui`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass after approved network access.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:content-import:apply-sql`: pass; regenerated ignored `.tmp` review artifacts only.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `git diff --check`: pass.

### Risks and Gaps
- `NOW-FORMS-BACKEND-001` remains open only because final private-row browser-key boundary, email, Turnstile, and admin-visible lead workflow proof are not complete.
- Admin auth/settings/media/content/leads/audit source is implemented and source-verified, but live verification still requires browser-safe Supabase configuration, first-admin/profile setup, real owner/admin session credentials, and Jay approval for tagged QA writes.
- Static-to-Supabase content import remains draft/no-write only; applying import SQL, allowing merge/upsert, and switching public reads require explicit Jay approval.
- Article claim cleanup remains paused and raw newsletter HTML remains a migration source rather than the final authoring model.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-06-04 (Admin Project Publish Readiness UX)

### Scope
- Improved `/admin/projects` publishing feedback after a live editor hit the claim-review validation while trying to publish a project.
- Added a visible Publish readiness panel that lists exact blockers for project claim review, missing summary/lead copy, project facts still marked `needs_review`, and project materials still marked `needs_review`.
- Made blocker items actionable so selecting a fact/material blocker loads the affected row into its editor instead of leaving the user to search manually.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-crud-coverage`: pass.

### Risks and Gaps
- This is a targeted Projects publish UX fix, not the broader CMS IA redesign requested after first live editing use.
- Imported CMS content remains draft until editors review and publish individual rows.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`

## Entry - 2026-06-04 (Admin CMS IA/UX Baseline)

### Scope
- Started the broader CMS productization pass for non-technical editors.
- Added shared CMS status primitives so Draft, Published, and Archived have one editor-facing meaning across admin surfaces.
- Reworked the admin shell navigation into Work queue, Content library, and Operations, with persistent copy explaining that only Published content can appear publicly.
- Expanded Dashboard from a technical health queue into an editor orientation screen with Draft/Published/Archived status counts and a clear Edit -> Review -> Publish workflow.
- Improved `/admin/projects` list UX with search, status filtering, status counts, shared CMS status pills, and plain-language readiness labels.

### Changed Files
- `src/pages/admin/AdminCmsPrimitives.tsx`
- `src/pages/admin/AdminShell.tsx`
- `src/pages/admin/AdminDashboardPage.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `src/pages/admin/adminContent.ts`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass after approved local preview-server permission; sandbox-only run failed with `Vite preview did not respond at http://127.0.0.1:4173`.
- `npm run agent:admin-config-gate`: pass for 11 admin routes after approved local preview/browser permission.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is the first IA/status-language batch, not the full CMS redesign. Projects still needs a deeper list/detail/preview editing flow; Media, Stone Library, Products, Articles, Leads, and Settings still need the shared UX system applied.
- Status counts are read from Supabase through the existing authenticated admin client and depend on the active admin session/RLS.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-04 (Admin Media and Stone Library UX Baseline)

### Scope
- Extended the CMS editor-experience baseline beyond Dashboard/Projects.
- Updated `/admin/media` with shared Draft/Published/Archived status language, status counts, list search, status filtering, and a website-visibility rule in the metadata editor.
- Updated `/admin/stone-library` group lists with search, status filtering, and clearer TBC language that treats TBC as needing confirmation rather than public-ready.

### Changed Files
- `src/pages/admin/AdminMediaPage.tsx`
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass after approved local preview-server permission; sandbox-only run failed with `Vite preview did not respond at http://127.0.0.1:4173`.
- `npm run agent:admin-config-gate`: pass for 11 admin routes after approved local preview/browser permission.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Media and Stone Library now have better list/state orientation, but Stone Library still needs deeper editor-flow simplification for variants, finish capabilities, and finish images.
- Products, Articles, Leads, and Settings still need the shared UX/status/list treatment.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-MEDIA-LEADS-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-04 (Admin Products and Articles UX Baseline)

### Scope
- Extended the shared CMS status/list baseline to Products and Articles.
- Updated `/admin/products` with shared Draft/Published/Archived status language, status counts, product search, status filtering, and a website-visibility rule in the product editor.
- Updated `/admin/articles` with shared Draft/Published/Archived status language, status counts, article search, status filtering, and a website-visibility rule in the article editor.

### Changed Files
- `src/pages/admin/AdminProductsPage.tsx`
- `src/pages/admin/AdminArticlesPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass after approved local preview-server permission; sandbox-only run failed with `Vite preview did not respond at http://127.0.0.1:4173`.
- `npm run agent:admin-config-gate`: pass for 11 admin routes after approved local preview/browser permission.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Products and Articles now have better list/status orientation, but their nested model/spec/block editors still need a deeper simplification pass.
- Leads and Settings still need the shared UX/status/list treatment, and a final non-technical editor usage guide remains outstanding.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-04 (Admin Leads and Settings UX Baseline)

### Scope
- Extended the CMS editor-experience baseline to Leads and Settings.
- Updated `/admin/leads` with inbox search plus kind/status filters for enquiry/sample workflow triage.
- Updated `/admin/settings` with shared Draft/Published/Archived status language and clearer guidance separating public site identity settings from admin team access.

### Changed Files
- `src/pages/admin/AdminLeadsPage.tsx`
- `src/pages/admin/AdminSettingsPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- `git diff --check`: pass.

### Risks and Gaps
- Leads and Settings now have better orientation, but Settings still exposes footer JSON and admin Auth user IDs; those remain the least non-technical parts of the CMS.
- Final non-technical editor usage guide remains outstanding.

### Next Handoff
- `NOW-ADMIN-MEDIA-LEADS-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-04 (Admin Articles Media Authoring UX)

### Scope
- Continued the CMS productization pass on `/admin/articles`.
- Replaced article cover and structured-block media ID entry with media selectors and previews.
- Added block-type-specific content guidance before the structured JSON field, so editors can understand the expected shape without treating raw newsletter HTML as the authoring model.
- Kept existing draft/publish/archive lifecycle, audit behavior, schema, and public-read contracts unchanged.

### Changed Files
- `src/pages/admin/AdminArticlesPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview/browser checks were blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Articles still need structured public block rendering; public detail pages continue using sanitized legacy HTML fallback until that adapter is built.
- The content JSON field is now guided but still technical; a future batch should add form-native editors for common block types.

### Next Handoff
- `NOW-ADMIN-CONTENT-CRUD-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-04 (Admin Settings Footer UX)

### Scope
- Continued the Settings productization pass for non-technical editors.
- Replaced raw footer JSON editing with a footer column/item editor for text values, internal links, and external links.
- Preserved the existing `site_settings.footer_columns` JSONB storage contract by serializing the form back into the current column/item shape on save.
- Added validation for blank footer titles/items, internal links that do not start with `/`, and external links that do not start with `http://` or `https://`.

### Changed Files
- `src/pages/admin/AdminSettingsPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview/browser checks were blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Settings no longer exposes footer JSON, but admin profile creation still requires an existing Supabase Auth user ID. That remains the most technical Settings handoff step until an invite/user-create flow is added.
- Footer form editing covers the current column/item contract. If future footer data gains richer fields, this editor should be extended before those fields are handed to non-technical users.

### Next Handoff
- `NOW-ADMIN-SETTINGS-CRUD-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-04 (Admin Settings Team Access UX)

### Scope
- Continued the Settings productization pass for non-technical editors.
- Reframed admin profile management as granting CMS access to existing login accounts instead of mapping Supabase Auth user IDs.
- Added an adding-a-person sequence, role labels/descriptions, shortened account IDs in the team list, and editor-facing duplicate-account validation copy.
- Preserved the existing Auth user/profile binding, owner/admin write permission model, owner-role protection, self-lockout guardrail, and audit writer behavior.

### Changed Files
- `src/pages/admin/AdminSettingsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview/browser checks were blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- `/admin/settings` still cannot create or invite the underlying login account from the browser. The current handoff flow is: create/invite the login account outside this screen, then grant CMS access here.
- A future service-role-backed invite flow would be the cleanest way to remove the remaining account-ID step from non-technical handoff.

### Next Handoff
- `NOW-ADMIN-SETTINGS-CRUD-001`
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-04 (Admin Editor Handoff Guide)

### Scope
- Added the first customer-facing `/admin` editor guide.
- Documented the production admin URL, roles, account setup path, Draft/Published/Archived rules, editing flow, module coverage, publish checks, public fallback boundaries, and remaining handoff gaps.
- Connected the guide to the harness startup checklist, handoff entry points, roadmap, and machine task queue so future CMS changes keep the guide current.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview/browser checks were blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is a written handoff guide, not a substitute for final production editor walkthrough after the local CMS UX commits are pushed and deployed.
- The guide intentionally records current gaps: login account creation still happens outside `/admin/settings`, Stone Library detail remains static-backed, and public Article bodies still use sanitized legacy HTML.

### Next Handoff
- `NOW-ADMIN-CMS-001`

