# SEO Phase 2 Plan - Google Search Console Follow-Up

Last updated: 2026-06-12

## Purpose
Phase 1 made the current public site discoverable: real `robots.txt`, real `sitemap.xml`, route metadata, canonical URLs, and conservative structured data.

Phase 2 should turn that foundation into search value. The priority is not broad traffic volume; Urblo is a low-volume, high-value B2B niche. The practical goal is to help architects, landscape designers, councils, builders, and specifiers find the right public pages and then enquire.

## Search Console Baseline
Google Search Console was reviewed on 2026-06-12 after Phase 1 source work was deployed, but before Google had refreshed the new sitemap. The Page indexing report was last updated on 2026-06-05, so its current counts still reflect the old site state.

`https://urblo.com.au/sitemap.xml` was submitted/refreshed in Google Search Console on 2026-06-12. GSC confirmed the submission, and the submitted date changed to 12 Jun 2026. At that moment, the `Last read` value still showed the old 3 Aug 2023 read, so Phase 2 should monitor when Google actually processes the refreshed sitemap.

Observed signals:
- GSC showed 21 indexed pages and 29 not indexed pages.
- The submitted sitemap history was stale: `https://urblo.com.au/sitemap.xml` had an old read date and low discovered-page count, while `https://www.urblo.com.au/sitemap.xml` appeared as an old zero-page sitemap-index entry.
- Most non-indexed examples were historical WordPress or old-site URLs, not the new canonical route set.
- Organic search clicks were mostly branded queries such as `urblo`; non-brand product/material/project discovery was still thin.
- HTTPS and Breadcrumb enhancement status did not show a launch-blocking issue. Core Web Vitals had insufficient field data rather than a failing score.
- GSC reported one unused verification token. That is a property-security cleanup item, not a ranking issue.

## Phase 2 Priorities
1. **Refresh Google's source of truth**
   - Monitor whether Google reads the 36 current canonical URLs from the refreshed sitemap.
   - Keep `/admin`, `/api`, draft content, private lead/admin surfaces, and legacy alias paths out of the sitemap.

2. **Map old URLs before changing redirects**
   - Export or record GSC examples from Page indexing and Performance.
   - Split old URLs into three groups:
     - **Recover:** old pages with impressions/clicks and a clear current equivalent.
     - **Retire:** old WordPress feeds, search URLs, admin/plugin endpoints, upload globs, or other junk that should disappear naturally.
     - **Investigate:** old URLs with search signal but no obvious new equivalent.
   - Do not add redirects for every old WordPress artifact. Redirect only when the destination is semantically useful.

3. **Implement redirect cleanup for valuable legacy URLs**
   - Add Cloudflare Pages 301 rules in `public/_redirects` for recoverable old URLs before the SPA fallback.
   - Add runtime alias handling only when local/SPA navigation also needs to resolve the old slug.
   - Likely first candidates from GSC include old contact, capability, product, stone-product, product-category, article, and project URLs that still receive impressions or clicks.

4. **Strengthen non-brand long-tail landing pages**
   - Expand Stone Library, Product, Project, and Article pages around specifier search intent.
   - Prioritize practical queries such as stone bollards, bluestone seating, natural stone streetscape furniture, urban landscape stone products, material/finish combinations, and project proof terms.
   - Keep claims evidence-backed and aligned with `docs/brand-baseline.md`.

5. **Review the technical SEO ceiling after data comes back**
   - If Google still struggles to index important detail pages after sitemap refresh, redirects, and content improvements, decide whether public detail routes need pre-rendered/static HTML or another server-rendered approach.
   - This is a Phase 2 technical decision, not a Phase 1 blocker.

## Acceptance Criteria
- GSC has a current successful read for `https://urblo.com.au/sitemap.xml`.
- The current canonical sitemap URL count remains aligned with `npm run agent:seo-readiness`.
- Valuable legacy URLs with search signal have explicit 301 redirects to relevant current pages.
- Junk WordPress/admin/plugin/feed/search/upload URLs are not promoted into the sitemap and are not redirected to unrelated pages.
- GSC indexing issues are understood as either current canonical pages needing work or old URLs expected to decay.
- Non-brand query coverage improves through useful Product, Stone Library, Project, and Article copy rather than generic SEO filler.

## Verification
For source changes:
- `npm run agent:seo-readiness`
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`
- `npm run agent:check`
- `git diff --check`

For deployed redirect changes:
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`
- Spot-check selected old URLs in Google Search Console or a browser after deployment.

For Search Console:
- Confirm sitemap read status, discovered URL count, and any new indexing issues after Google recrawls.
- Recheck performance after enough time has passed for crawl and ranking data to update.
