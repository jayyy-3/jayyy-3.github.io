# Public routes and navigation contract

Route table, route state, motion and navigation surfaces. Design authority: `docs/DESIGN.md`; brand/claims: `docs/brand-baseline.md`. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

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
| `/capabilities` | `CapabilitiesPage` | Web-native 2026 Capability Statement page sourced from the Founder PDF, including a service-style capability hub, lifecycle support, national reach, selected proof ledger, and an email-gated PDF download form. |
| `/contact` | `ContactPage` | Contact surface with direct contact channels plus API-backed enquiry/sample-request submit flows. Sample mode is available at `/contact?intent=sample-request`; direct email and phone remain manual fallback channels. |
| `/articles` | `ArticlesPage` | Article list page. |
| `/articles/:slug` | `ArticlePage` | Article detail page. Uses page-owned article hero via `DefaultLayout showBanner={false}`. |
| `/admin/*` | `AdminApp` | Protected admin shell outside public site chrome. Config-gated until browser-safe Supabase key is set; uses Supabase Auth plus `admin_profiles` once configured. Current source CRUD/workflow/review screens: Settings/admin profiles, Media, Stone Library, Projects, Products, Articles, Leads, Audit. |
| `*` | `NotFoundPage` | Branded not-found state wrapped by `DefaultLayout showBanner={false}`. |

Route state contract:
- `src/components/site/SiteHeader.tsx` exposes two explicit surface modes: `overlay` for image/video-first openings and `light-page` for white-start content. `HomepageHeader` selects `overlay`; `DefaultLayout` derives `overlay` when `bgImage` is present, otherwise `light-page`, with an explicit `headerSurface` override for page-owned image heroes such as Capabilities and Article detail.
- `DefaultLayout` retains a shared 102px clearance for bannerless white-start routes, but the clearance is light rather than solid black. The header and opened menu own their translucent tint and the original light `backdrop-blur-sm`; route components must not add duplicate top offsets, heavier blur/saturation, or recreate the retired black support band.
- Shared route-level loading states use `src/components/RouteState.tsx` instead of plain text placeholders.
- Route states on no-banner routes use the `headerOffset` prop so loading, not-found, and error copy clears the absolute site header.
- Unknown public URLs render `src/pages/NotFoundPage.tsx`, not the homepage.
- Product detail and article detail routes render deliberate loading, not-found, and load-error states before showing detail content.
- `scripts/agent-smoke.sh` includes unknown-route and missing-product route-shell coverage; browser QA is still required for rendered copy/state checks.
- Client-side route navigation scrolls to the top for new PUSH/REPLACE navigations while preserving POP/back behavior.
- Public route changes are wrapped by `AnimatedRoutes` in `src/App.tsx` with a restrained Framer Motion enter transition keyed by pathname. Query/filter changes do not trigger full-page transitions, route-state content is not held behind exit animation, and reduced-motion preferences collapse the movement.

## UI Motion Contract
- `src/components/AnimatedNumber.tsx` is the shared count-up component for structured numeric UI.
- Approved current usages: homepage metrics and Our Story proof counters.
- Do not use count-up for dates, sizes, dimensions, product specifications, editorial body copy, prices, native select option labels, filter result counts, or Stone Library card scan counts.
- The component starts at `0`, waits until the number enters the viewport, then animates to the final value once with `IntersectionObserver` and `requestAnimationFrame`.
- The final value remains exposed through `aria-label` while the visible counter changes.

## Navigation Contract vs Implemented Routes

### Implemented navigation surfaces
- Shared desktop header primary links: `/projects`, `/capabilities`, `/stone-library`, `/our-story`, `/contact`
- Shared desktop header hamburger links: `/articles`, `/products`
- Shared desktop header layout: logo remains left; the primary links and hamburger are rendered as one right-aligned group, not as separate centered/right columns.
- Shared mobile header hamburger links: `/projects`, `/capabilities`, `/stone-library`, `/our-story`, `/articles`, `/products`, `/contact`
- Homepage proof-section CTA: `/capabilities`
- Shared footer links: `/capabilities`, `/contact?intent=sample-request`, `/contact`
- Shared footer social links: Instagram and LinkedIn use external links with `target="_blank"` plus `rel="noopener noreferrer"`; Facebook and YouTube are hidden until real destinations are available.

### Gaps
- Current implementation gap: basic live Contact and Sample Request persistence, real SMTP2GO notification delivery, and private-row browser-key denial are verified, but Turnstile, admin-visible lead workflow, and the Capability-specific download lead path still require production verification.
- Launch target: Contact and Sample Request submit through Cloudflare Pages Functions into Supabase, with Turnstile protection, email notification, and admin-visible lead records.
