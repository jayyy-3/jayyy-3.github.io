# Public metadata and slug contract

Route metadata, SEO indexability, canonical slugs and redirects. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

## Metadata Contract
- `index.html` contains Urblo-owned default title, description, favicon, manifest, canonical, Open Graph, and Twitter metadata.
- `src/data/seoRoutes.ts` is the source-side SEO route registry for public indexable URLs, including title, description, canonical path, sitemap priority/change frequency, breadcrumbs, and safe structured-data inputs.
- `src/App.tsx` updates route-level title, description, robots, canonical, Open Graph, Twitter metadata, and client-side JSON-LD through a small native document-head updater driven by `src/data/seoRoutes.ts`. Resolved Published CMS detail pages then let `src/components/PublicContentSeo.tsx` replace that route-level JSON-LD with entity-specific Article or WebPage data plus Organization, WebSite, and BreadcrumbList data derived from the validated runtime record.
- Current Phase 1 SEO indexability foundation:
  - `public/robots.txt` is a real static crawler file, allows the public site, disallows `/admin` and `/api`, and points to `https://urblo.com.au/sitemap.xml`.
  - `public/sitemap.xml` is a real static XML sitemap with 35 approved public canonical URLs covering Home, core public listing pages, 5 Projects, 12 canonical Stone Library groups, 6 Products, and 4 Articles. The retired `/stone-library/steel-blue` duplicate redirects to canonical BlueOcean and is excluded.
  - Client-side JSON-LD is intentionally conservative: Organization, WebSite, BreadcrumbList, Article, and generic WebPage only. Product/Service schema remains deferred until pricing, availability, and claim scope can be represented safely.
  - `npm run agent:seo-readiness` verifies the source-side SEO contract: robots/sitemap are static files rather than SPA fallback HTML, sitemap URLs match current public data, admin/API/private paths are excluded, `src/App.tsx` is wired to the SEO registry, and detail routes do not regress to the old generic title source.
- First-response head (NOW-OPT-SEO-EDGE-HEAD-001): the edge SEO middleware writes the route's head into the first HTML response and serves the generated `/sitemap.xml`; `public/sitemap.xml` stays as the static-registry baseline checked by `agent:seo-readiness`. The body is still the SPA shell. Published CMS detail heads come from `src/lib/publicContentSeoMeta.ts`, which `PublicContentSeo` also uses, so the hydrated head equals the server head; `TitleUpdater` skips a path whose edge marker says `cms`. A CMS homepage SEO title shorter than 20 characters (production held just `Urblo` in 2026-09) no longer replaces the descriptive registry title.
- Phase 2 SEO follow-up is tracked in `docs/SEO_PHASE_2_PLAN.md`. Google Search Console review on 2026-06-12 showed stale sitemap history plus legacy WordPress/old-site URLs in indexing reports; selective legacy redirect cleanup is now implemented in `public/_redirects`, while junk WordPress/admin/feed/upload paths remain out of the sitemap and are not redirected to unrelated pages.
- Default share image asset: `public/og-default.png` at 1200 x 630. `public/og-default.svg` remains the editable source used to generate the PNG.
- Favicon assets: old-site-matched WordPress site icon PNGs in `public/favicon-32x32.png`, `public/favicon-192x192.png`, `public/favicon.png`, `public/apple-touch-icon.png`, and `public/mstile-270x270.png`.
- Web manifest: `public/site.webmanifest`, referencing PNG icon assets instead of the retired temporary SVG favicon.
- `react-helmet` was removed because it emitted React strict-mode lifecycle warnings under the current React 19 dev setup.

## Public Slug and Redirect Contract
- Canonical public slugs use lowercase kebab-case across Projects, Stone Library, Products, and Articles.
- Product records in `src/data/productData.ts` may retain `legacySlugs` for pre-normalization camelCase links; `ProductService.getBySlug()` resolves both canonical and legacy slugs, and `ProductDetailPage` redirects legacy matches to the canonical URL.
- Article records in `public/articles/index.json` may retain `sourceSlug` and `legacySlugs` while the legacy raw HTML folders remain title-case export folders. `ArticlePage` resolves those aliases, fetches from `sourceSlug`, and redirects legacy matches to the canonical URL.
- `public/_redirects` contains explicit Cloudflare 301 rules for the old product and article URLs before the SPA catch-all rule.
- Additional GSC-driven legacy redirects are part of the Phase 2 SEO cleanup. Semantically useful old URLs such as `/contact-us`, `/our-capacity`, `/product/creama`, `/product-category/limestone`, `/stone-product/bollard`, and `/article/discover-the-art-of-surface-finishes` now have explicit 301 rules. Old WordPress feeds, search URLs, admin/plugin endpoints, and upload globs stay out of the sitemap and are not redirected to unrelated pages.
- Future `/admin` slug editing should enforce lowercase kebab-case and preserve old public URLs as redirect aliases before changing published content slugs.
