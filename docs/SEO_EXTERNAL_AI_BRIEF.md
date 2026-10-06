# Urblo SEO External AI Brief

Last updated: 2026-06-14

## Intended Reader

This brief is for an external SEO consultant, agency, or AI assistant that has been asked to advise on Urblo SEO. It explains what Urblo is, how the website is built, what SEO work has already been completed, what remains, and what access or deliverables should be requested.

Use this document before asking for code access, CMS access, Google Search Console access, or implementation responsibility.

## Executive Summary

Urblo is not a Framer or WordPress site. It is a code-controlled web application deployed on Cloudflare Pages, with a Supabase-backed CMS/admin system and Cloudflare Pages Functions for form/API workflows.

That means the main limitation described in the screenshots, namely "Claude Code cannot directly edit a visual builder site", does not apply here. Urblo is already in the preferred category for AI-assisted implementation: a framework-based site where Codex can directly edit source code, SEO metadata, sitemap, redirects, structured data, form behavior, and verification scripts.

The correct collaboration model is therefore:

1. External SEO party or AI provides strategy, keyword mapping, content briefs, analytics interpretation, and page-level recommendations.
2. Urblo's AI Harness/Codex implementation flow applies code/CMS changes, runs gates, commits, pushes, and deploys.
3. Google Search Console and GA4 data are monitored after Google recrawls the site.

Do not assume that direct GitHub, Cloudflare, Supabase service-role, or production deployment access is needed at the start.

## What The Screenshots Are Asking

The screenshots are trying to classify the website into one of three implementation paths:

| Scenario in screenshots | Meaning | Applies to Urblo? |
|---|---|---|
| Framer or visual builder | AI cannot fully edit the site; it can only generate snippets/content for humans to paste. | No. |
| Next.js/Astro/static JAMstack | AI can directly edit code, generate pages, metadata, sitemap, JSON-LD, forms, and tracking. | Mostly yes. Urblo is React/Vite on Cloudflare Pages. |
| Headless CMS + framework | AI edits framework code and works with CMS data/API. | Yes. Urblo uses Supabase-backed content/admin workflows. |

Conclusion: Urblo does not need a migration just to make SEO implementation possible. The site is already controllable by Codex through the repository and deployment pipeline.

## Confirmed Urblo Web Architecture

Production domains:
- `https://urblo.com.au`
- `https://www.urblo.com.au`

Runtime and hosting:
- Frontend: React 19 + Vite 6.
- Routing: React Router with clean public URLs.
- Hosting: Cloudflare Pages.
- Build output: `dist`.
- API/backend: Cloudflare Pages Functions under `/api/*`.
- Database/CMS/auth/storage: Supabase.
- Admin CMS: Urblo-owned `/admin` interface, not raw Supabase Studio for customer operations.

Current public content model:
- Public Projects, Products, Articles, and Stone Library pages prefer Published CMS/Supabase content where available.
- Static fallback remains in place so public pages continue working if CMS content is not yet published.
- Imported production content currently requires editor/customer review before broader publishing decisions.

Current form/conversion model:
- `/contact` supports enquiry and sample-request flows.
- `/api/enquiries` and `/api/sample-requests` persist leads server-side.
- SMTP2GO notification proof has passed.
- Turnstile is the remaining optional/final anti-spam proof.
- `/admin/leads` exists for lead review/workflow after admin login.

## Current SEO State

Phase 1 technical SEO foundation is complete:
- Real `public/robots.txt`.
- Real `public/sitemap.xml`.
- Centralized route metadata in `src/data/seoRoutes.ts`.
- Conservative client-side JSON-LD.
- Canonical URL handling.
- `npm run agent:seo-readiness` source gate.
- Sitemap currently contains 36 approved public canonical URLs.
- `/admin` and `/api` are intentionally excluded from indexing.

Phase 2 legacy cleanup is implemented in source:
- Valuable old URLs from the previous site are mapped with selective 301 redirects in `public/_redirects`.
- Examples include old contact, capacity, product, article, product-category, and stone-product paths.
- Junk WordPress/admin/feed/upload/search paths are intentionally not rescued.
- Representative redirect checks are included in smoke/readiness scripts.

Google Search Console status from the 2026-06-12 review:
- GSC showed 21 indexed pages and 29 not indexed pages at that time.
- That data reflected the old/stale crawl state because the page-indexing update predated the new sitemap work.
- `https://urblo.com.au/sitemap.xml` was submitted/refreshed in GSC on 2026-06-12.
- Immediately after submission, GSC confirmed submission but had not yet re-read the sitemap.
- Most observed indexing issues were legacy WordPress/old-site URLs, not the new canonical route set.

Current SEO engineering progress:

| Area | Status | Notes |
|---|---:|---|
| Architecture fit for AI SEO implementation | 100% | Code-controlled site; no Framer limitation. |
| Technical indexability foundation | 100% | Sitemap, robots, metadata, JSON-LD source gate complete. |
| Legacy URL cleanup | 100% source implemented | Live deployment/readback and GSC decay should be monitored. |
| GSC sitemap refresh | Submitted | Google recrawl timing is external and not immediate. |
| Content SEO growth | Next phase | Needs keyword-led copy expansion and useful landing-page depth. |
| Analytics/conversion reporting | Partially ready | GSC exists; GA4/conversion-event requirements should be confirmed. |

Overall SEO engineering foundation is roughly 60-65% complete. The remaining high-value work is not basic crawlability; it is content depth, keyword targeting, conversion tracking, and ongoing measurement.

## Important Technical Caveat

The current public site is a Vite React single-page app. Google can render JavaScript, and the current sitemap/metadata/JSON-LD foundation is useful, but the first HTML response for deep routes is still the shared app shell until JavaScript runs.

This is not a blocker for the current phase. However, if GSC still shows weak indexing for important Product, Stone Library, Project, or Article detail pages after recrawl and content improvements, the next technical SEO decision should be whether to add pre-rendered/static public detail HTML or move specific public surfaces toward a more server-rendered/static-generated approach.

Do not recommend a full framework migration before checking the post-recrawl data.

## Recommended External SEO Role

The external SEO party should focus on the work that requires market judgment, content strategy, and search interpretation:

1. Keyword research and intent mapping
   - Map high-value, low-volume B2B queries to existing or new pages.
   - Prioritize specifier, architect, council, contractor, and public-realm procurement intent.
   - Avoid generic traffic chasing.

2. Page-level content briefs
   - Products: stone seating systems, modular stone furniture, bollards, planters, public realm products.
   - Stone Library: material, finish, origin, application, maintenance, and specification intent.
   - Projects: case-study proof, material use, install context, specifier relevance.
   - Articles: educational long-tail topics that support specifier decisions.

3. Metadata and structured-data recommendations
   - Suggest improved titles/descriptions only when they map to real page content.
   - Recommend schema additions where useful, but avoid fake or unsupported claims.

4. GSC/GA4 review
   - Identify non-brand queries beginning to show impressions.
   - Separate old URL decay from current canonical-page indexing issues.
   - Track enquiry-driving pages and queries.

5. Conversion-path recommendations
   - Define which actions count as conversions: enquiry submit, sample request, capability PDF download, phone/email clicks, or future CRM events.
   - Recommend GA4/Ads event naming and reporting structure.

6. Off-site SEO
   - Google Business Profile.
   - Backlinks and industry relationships.
   - PR, project features, CPD/event visibility.
   - LinkedIn/Instagram distribution if API/account access exists.

7. Content asset requests
   - Project photographs.
   - Installation photos.
   - Shop drawing examples safe for public use.
   - Material/finish images.
   - Proof points and claim evidence.

## Access Guidance

Start with the minimum access needed.

Reasonable first access:
- Google Search Console read access.
- GA4 viewer access, if GA4 is configured.
- Exported GSC screenshots/CSV if direct access is not available.
- Public website URLs and sitemap.
- CMS editor access only if the person will draft or review content in the admin interface.

Do not grant by default:
- GitHub write access.
- Cloudflare admin access.
- Supabase service-role access.
- DNS access.
- Production deploy permissions.

If the external party needs a technical change, they should provide a task brief. Urblo's Codex/Harness flow can implement it and run verification.

## What To Ask The External Party To Clarify

Ask them to answer these questions before giving broader access:

1. Which part of SEO are you optimizing?
   - Technical SEO, content SEO, analytics/tracking, conversion rate, Google Business Profile, backlinks, or all of the above?

2. What exact access do you need and why?
   - GSC, GA4, CMS editor, GitHub, Cloudflare, Supabase, or CRM.

3. What is your deliverable?
   - Keyword map, page brief, metadata spreadsheet, technical audit, monthly report, content calendar, conversion tracking plan, or implementation PR.

4. Will you implement changes directly or provide recommendations for Urblo's implementation flow?

5. What metrics define success?
   - Indexed canonical pages, non-brand impressions, non-brand clicks, enquiry volume, sample requests, conversion rate, or qualified specifier enquiries.

## Recommended Next SEO Phases

### Phase 3: Content Growth And Long-Tail Coverage

Purpose:
- Move from "Google can understand the site" to "Google has useful pages to rank for specific specifier searches."

Likely targets:
- stone bollards australia
- bluestone seating
- natural stone streetscape furniture
- public realm stone furniture
- modular stone seating
- urban landscape stone products
- natural stone benches
- stone planters public realm
- bluestone finishes
- stone material library for landscape architecture

Expected outputs:
- Keyword-to-page map.
- Content briefs for Product, Stone Library, Project, and Article pages.
- Better internal linking between materials, finishes, products, and proof projects.
- More useful CTAs for enquiries and sample requests.

### Phase 4: Measurement And Conversion Reporting

Purpose:
- Connect SEO visibility to business outcomes.

Expected outputs:
- GA4 conversion-event definitions.
- GSC/GA4 monthly report template.
- Query/page performance monitoring.
- Enquiry attribution where feasible.
- Optional rank-tracking list for priority terms.

### Phase 5: Authority And Asset Growth

Purpose:
- Build credibility outside the website.

Expected outputs:
- Google Business Profile optimization.
- Project/story distribution plan.
- Industry publication/backlink targets.
- LinkedIn/Instagram support if account/API access is available.
- CPD/event/content partnership recommendations.

## What Codex Can Implement

Codex can directly implement:
- Route metadata.
- Titles/descriptions.
- JSON-LD.
- Sitemap and robots updates.
- 301 redirects.
- Page templates.
- Content model changes.
- Internal linking.
- Image optimization scripts.
- Form and conversion-path changes.
- Cloudflare Pages Function changes.
- Supabase-backed CMS/admin workflow changes.
- Verification scripts and deployment checks.

Codex cannot independently create:
- Real project photography.
- Real backlinks or business relationships.
- Strategic material/photo selections without business approval.
- Offline CPD/event participation.
- Unsupported technical, sustainability, or cost claims.

## Guardrails For SEO Recommendations

Urblo is a low-volume, high-value B2B niche. The goal is qualified enquiries, not mass traffic.

All recommendations must preserve the brand baseline:
- Urblo is a design-led, engineering-backed natural stone solution partner.
- Claims must be proof-driven and evidence-backed.
- Do not turn the website into generic SEO filler.
- Do not create thin programmatic pages unless each page has meaningful product/material/project value.
- Do not publish sustainability, cost, certification, or performance claims without source evidence.

## Suggested Prompt For The External AI

Use this prompt if another AI is reviewing Urblo SEO:

```text
You are reviewing SEO for Urblo, a design-led natural stone streetscape and public realm product/system company in Australia.

The website is not Framer or WordPress. It is a React/Vite codebase deployed on Cloudflare Pages, with Cloudflare Pages Functions for API/form workflows and Supabase for CMS/admin/auth/storage. Codex can implement source-code changes through the repository and run project verification gates.

Technical SEO Phase 1 is complete: robots.txt, sitemap.xml with 36 public canonical URLs, route metadata, canonical URLs, and conservative JSON-LD. Phase 2 source work is complete: selective 301 redirects recover valuable old URLs while junk WordPress/admin/feed/upload paths are not rescued. The sitemap was refreshed in Google Search Console on 2026-06-12, but Google recrawl data will lag.

Please do not ask for broad production credentials first. Start by producing an SEO strategy or audit that includes:
1. keyword-to-page mapping for high-value B2B/specifier queries,
2. page-level content briefs for Products, Stone Library, Projects, and Articles,
3. GSC/GA4 data questions or required exports,
4. conversion tracking recommendations,
5. off-site SEO and content asset requests,
6. any technical changes as implementation tasks for the Urblo Codex/Harness flow.

Optimize for qualified architect/specifier/council/contractor enquiries, not generic traffic volume. Keep all claims evidence-backed.
```

## Short Reply Jay Can Send

```text
Urblo is not Framer or WordPress. It is a code-controlled React/Vite site on Cloudflare Pages, with Supabase CMS/admin and Cloudflare Functions for forms/API. So the site is already suitable for AI-assisted SEO implementation; we do not need a migration just to make SEO changes possible.

We have already completed the technical SEO foundation: sitemap, robots, route metadata, canonical URLs, structured data, and selective 301 redirects for valuable old URLs. The sitemap has also been refreshed in Google Search Console.

For your SEO access, please clarify exactly what you need: GSC/GA4 read access, CMS content access, keyword/content strategy work, conversion tracking, or code-level implementation. Code and deployment changes can be handled by our Codex/Harness flow, so you can first provide the audit, keyword map, content briefs, and tracking recommendations.
```
