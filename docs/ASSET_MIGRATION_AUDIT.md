# Urblo Asset Migration Audit

Last updated: 2026-05-22

## Purpose
This audit turns the current "some media is slow or still on the old site" concern into an actionable launch checklist.

It does not mean the assets have already been migrated. It records what must be moved, what can wait, and how to verify that first-viewport launch risk is removed.

## Current Scan Summary
Scan scope: `src`, `public/articles`, and `data`.

Findings:
- 64 unique remote URLs were detected in the raw scan after article covers were moved to local media.
- 12 unique URLs point at `urblo.com.au`, primarily from article/email-import source links and article cleanup fallback code rather than first-viewport runtime image references.
- 0 direct URLs point at old `urblo.com.au/wp-content/uploads` assets after the legacy project and Stone Library fallback pass.
- Article HTML still contains remote proxy and tracking URLs from Google, Front, Squarespace, and Squarespace email campaigns as raw migration source material. Runtime rendering now rewrites known image URLs to local launch media and strips campaign links before DOMPurify sanitization.
- `public` is about 64 MB after the local launch media stopgap plus article media cleanup.
- `public/media/launch` is about 40 MB, including the local homepage MP4 plus controlled homepage, Our Story, legacy project, Stone Library fallback, and article imagery.
- Current `dist` is about 148 MB after build, largely because large stone imagery is bundled into build output plus controlled launch media.

## Launch Risk
The key cutover risk is not only speed. If the production domain moves to Cloudflare Pages while the new site still references `https://urblo.com.au/wp-content/uploads/...`, those references may break unless old WordPress media stays reachable or the assets are migrated before DNS cutover.

The safest launch posture is:
- No first-viewport asset depends on old WordPress URLs.
- Homepage video and poster are controlled and have a mobile fallback.
- Logo and favicon are controlled.
- Critical page banners and contact imagery are controlled.
- Legacy article HTML is either cleaned or explicitly deferred from launch-critical traffic.

## Priority Groups

### P0 - Must Resolve Before DNS Cutover
These affect first impression, navigation identity, or direct business contact.

| Area | Current source | Risk | Target |
|---|---|---|---|
| Homepage hero video | `src/data/homepage.ts` old WordPress MP4 | Slow load, domain cutover breakage, no controlled mobile strategy | Cloudflare R2/Stream review, or controlled compressed source with poster and mobile fallback. |
| Homepage hero poster | `src/data/homepage.ts` old WordPress image | Blank/slow first viewport if video delays | Controlled image asset with explicit dimensions. |
| Site logo | `src/data/siteChrome.ts`, `src/data/homepage.ts` old WordPress PNG | Brand identity depends on old site | Controlled local/Supabase media asset. |
| Default layout banners | `src/App.tsx` old WordPress background images | Main route visual chrome depends on old site | Controlled media or local stopgap assets. |
| Contact page image | `src/pages/ContactPage.tsx` old WordPress image | Lead-generation page depends on old site | Controlled media asset. |
| Share image | `public/og-default.svg` temporary local asset | Acceptable for now, but social platforms may prefer PNG/JPEG | Replace with production PNG/JPEG after media direction is approved. |

### P0 Stopgap Status - 2026-05-22
The launch-critical first-viewport dependency risk has a local stopgap in place:

| Area | Current controlled path | Status | Follow-up |
|---|---|---|---|
| Homepage hero video | `public/media/launch/home/urblo-hero.mp4` | Controlled local H.264 720p export from the user-provided `Urblo_Homepage.mp4`, about 16 MB. Desktop selects this source. | Review whether final delivery should move to Cloudflare R2 or Stream before production scale. |
| Homepage hero poster | `public/media/launch/home/hero-poster.jpg` | Controlled local poster. | Replace only if Nat/Hunter approve a different first-frame or campaign image. |
| Mobile hero fallback | `src/components/homepage/HomepageSections.tsx` | Mobile viewport does not select the MP4 source; it shows the poster instead. | Keep this policy unless a compressed mobile video is intentionally produced. |
| Site logo | `public/media/launch/identity/urblo-logo.png` | Controlled local logo, resized for web use. | Move to CMS site settings/media record during Supabase migration. |
| Default layout banners | `public/media/launch/banners/*.jpg` | Controlled local route banners. The old banner URLs tested as 404 on 2026-05-22. | Treat these as launch-safe placeholders until CMS-managed page banners are approved. |
| Contact page image | `public/media/launch/contact/project-contact.jpg` | Controlled local image used by the Contact page and reused on homepage proof cards where the same old URL appeared. | Move to CMS media record during Supabase migration. |
| Share image | `public/og-default.svg` | Local and controlled. | Replace with production PNG/JPEG after final social preview review. |

### P1 - Should Resolve Before Public Launch If Time Allows
These are visible content quality and performance items.

| Area | Current source | Risk | Target |
|---|---|---|---|
| Homepage process and proof imagery | Local `public/media/launch/homepage` assets | Controlled local stopgap in place. | Move to Supabase media records during CMS migration. |
| Homepage latest project images | Local `public/media/launch/homepage` assets | Controlled local stopgap in place. | Move to Supabase media records during CMS migration. |
| Legacy project images | Local `public/media/launch/projects` assets | Controlled local stopgap in place. | Move to Supabase media records during project CMS migration. |
| Our Story portraits and banner | Local `public/media/launch/our-story` plus controlled route banner | Controlled local stopgap in place; old `carbon-neutral-banner.jpg` tested as 404 on 2026-05-22. | Move to Supabase media records during CMS migration. |
| Remote Stone Library finish fallbacks | Local `public/media/launch/stone-library/fallbacks` assets | Controlled local stopgap in place. | Replace with approved HD finish assets during full Stone Library image coverage. |

### P2 - Migrate Through CMS Cleanup
These should not block infrastructure setup but must be cleaned before the article system is considered launch-quality.

| Area | Current source | Risk | Target |
|---|---|---|---|
| Article cover GIFs | `public/articles/index.json` Squarespace CDN GIFs | Slow article list, animated assets, external dependency | Replace with controlled still images or optimized media. |
| Article email HTML images | `public/articles/*/content.html` Google/Front/Squarespace proxy URLs | Email-export artifacts, tracking, broken proxy URLs, poor SEO | Convert article HTML into structured article blocks. |
| Email campaign links | `public/articles/*/content.html` Squarespace campaign links | Tracking/unsubscribe/old CTA residue | Remove during article cleanup. |
| Emoji image assets | article HTML `fonts.gstatic.com` emoji images | Cosmetic external dependency | Remove or replace with text/icons during article block conversion. |

### P2 Runtime Cleanup Status - 2026-05-22
The static launch version now has a runtime safety layer for articles:

| Area | Current controlled path or behavior | Status | Follow-up |
|---|---|---|---|
| Article cover GIFs | `public/media/launch/articles/*/*.webp` plus local cover paths in `public/articles/index.json` and article `meta.json` files | Controlled local still-image stopgap in place. | Move to Supabase media records during article CMS migration. |
| Article email HTML images | `src/lib/articleMedia.ts` maps known Squarespace image IDs to local launch media before DOMPurify sanitization | Runtime-rendered article details no longer load known Google/Front/Squarespace proxy image URLs. | Convert raw newsletter HTML into structured article blocks. |
| Email campaign links | `src/lib/articleMedia.ts` unwraps or strips known Google/Squarespace campaign links | Runtime-rendered article links no longer expose known campaign, unsubscribe, Google redirect, or old upload URLs. | Replace article CTAs with approved CMS-managed CTA blocks. |
| Emoji image assets | Google emoji images become text during article preparation | External emoji image dependency removed at render time. | Use approved icon/text treatment in structured article blocks. |

## Detailed Old WordPress URL Inventory
The current scan finds no direct old `wp-content/uploads` dependencies in `src`, `public/articles`, or `data`.

Resolved in the local launch stopgap:
- `src/App.tsx`: route banner backgrounds.
- `src/data/homepage.ts`: logo, hero video, poster, sustainability, process, project, stone, client logo, manifesto, and video CTA media.
- `src/data/siteChrome.ts`: shared logo.
- `src/data/projectData.ts`: legacy project covers and galleries.
- `src/data/stoneFinishImages.ts`: remote Stone Library fallback images.
- `src/pages/ContactPage.tsx`: contact image.
- `src/pages/OurStory.tsx`: portraits and carbon banner.
- `public/articles/index.json` and article `meta.json` files: article covers.
- `src/lib/articleMedia.ts`: runtime cleanup for known article proxy images, campaign links, emoji images, and old upload links.

## Recommended Storage Targets

### Normal Images
Use Supabase Storage when CMS migration starts:
- project images;
- product images;
- Stone Library images;
- article covers;
- site settings media;
- page banners.

### Homepage Video
Evaluate separately:
- Cloudflare R2 can host large static video with controlled delivery.
- Cloudflare Stream may be better if adaptive video delivery and playback control become important.
- Supabase Storage can hold media, but homepage video needs performance testing before choosing it as the final delivery path.

### Immediate Stopgap
For P0 assets, local `public` files are acceptable as a short-term launch stopgap when a controlled storage bucket is not ready. This should not become the long-term media management workflow.

Current stopgap location:
- `public/media/launch/identity`
- `public/media/launch/home`
- `public/media/launch/homepage`
- `public/media/launch/contact`
- `public/media/launch/our-story`
- `public/media/launch/banners`
- `public/media/launch/projects`
- `public/media/launch/stone-library/fallbacks`
- `public/media/launch/articles`

Runtime references were moved from old WordPress URLs to these paths in `src/App.tsx`, `src/data/homepage.ts`, `src/data/siteChrome.ts`, `src/data/projectData.ts`, `src/data/stoneFinishImages.ts`, `src/pages/ContactPage.tsx`, and `src/pages/OurStory.tsx`.
Article cover references and runtime article cleanup now use `public/media/launch/articles` through `public/articles/index.json`, article `meta.json` files, and `src/lib/articleMedia.ts`.

## Migration Sequence

1. Replace P0 site identity and first-viewport assets.
2. Add mobile fallback behavior for homepage video.
3. Migrate route banner/contact imagery.
4. Migrate homepage proof/process/project imagery.
5. Add article launch stopgap: local covers plus runtime cleanup of known email proxy images and campaign links.
6. Convert articles to CMS blocks and remove raw newsletter HTML dependency.
7. Move local stopgap media into Supabase/Cloudflare media records during CMS migration.

## Verification

Before production cutover:
- `rg "urblo.com.au/wp-content" src/App.tsx src/data/siteChrome.ts src/data/homepage.ts src/pages/ContactPage.tsx`
  should return no P0 launch-critical hits.
- Homepage loads with a controlled poster even if video is blocked.
- Mobile homepage does not wait on the full video before showing useful content.
- Logo, favicon, and share image load from controlled assets.
- Project and Stone Library pages remain visually usable when old WordPress URLs are blocked in the browser.

Verified on 2026-05-22:
- `npm run build`: pass with existing bundle warning and Browserslist notice.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Browser QA: desktop homepage selects the local MP4 and local poster; mobile homepage selects no MP4 source and uses the local poster; Products, Product detail, Projects, Our Story, Contact, Articles, and Article detail route banners load from local `public/media/launch` paths with no broken images observed.
- Browser QA after the homepage video replacement: desktop homepage selects `public/media/launch/home/urblo-hero.mp4`, reports `readyState=4`, `1280x720`, and `17.67s`; mobile homepage still selects no MP4 source and keeps the poster fallback.
- Direct old WordPress media scan after legacy project and Stone Library fallback migration: `rg "urblo.com.au/wp-content/uploads" src public/articles data` returns no results.
- Browser QA after legacy project and Stone Library fallback migration: Projects list, legacy project detail pages, Stone Library list, and Blueocean stone detail show no broken images and no old WordPress image URLs.
- Article media cleanup browser QA: `/articles` renders four local article cover images; all four article detail routes render article text, use zero external/proxy article images after lazy-load scroll, expose zero known campaign/unsubscribe/Google redirect/old upload links, and keep only the existing React Helmet strict-mode development warning.

Before declaring asset migration complete:
- `rg "urblo.com.au/wp-content/uploads" src public/articles data`
  returns no direct old WordPress media references.
- Article list covers are controlled assets.
- Article detail runtime rendering no longer depends on known email proxy image URLs.
- All migrated assets have alt text, owner, and source recorded in Supabase media records.

## Owner Notes
- Technical owner: implementation agent.
- Content owner: Urblo/Nat/Hunter or delegated content reviewer for image selection and claim context.
- Storage owner: whoever has Cloudflare/Supabase account access.
- Client review trigger: homepage video replacement, final logo asset, article image replacement, and any project image substitution.
