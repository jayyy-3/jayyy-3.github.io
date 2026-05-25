# Urblo Asset Migration Audit

Last updated: 2026-05-25

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
| Share image | `public/og-default.png` generated from the local SVG source | Controlled PNG at 1200 x 630 for stable social previews. | Replace only if Nat/Hunter approve a campaign-specific share image. |

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
| Share image | `public/og-default.png` | Local PNG and controlled; `public/og-default.svg` remains the editable source. | Replace only if Nat/Hunter approve a campaign-specific share image. |

### P1 - Should Resolve Before Public Launch If Time Allows
These are visible content quality and performance items.

| Area | Current source | Risk | Target |
|---|---|---|---|
| Homepage process and proof imagery | Local `public/media/launch/homepage` assets | Controlled local stopgap in place. | Move to Supabase media records during CMS migration. |
| Homepage latest project images | Local `public/media/launch/homepage` assets | Controlled local stopgap in place. | Move to Supabase media records during CMS migration. |
| Legacy project images | Local `public/media/launch/projects` assets | Controlled local stopgap in place. | Move to Supabase media records during project CMS migration. |
| Our Story portraits and banner | Local `public/media/launch/our-story` plus controlled route banner | Controlled local stopgap in place; old `carbon-neutral-banner.jpg` tested as 404 on 2026-05-22. | Move to Supabase media records during CMS migration. |
| Remote Stone Library finish fallbacks | Local `public/media/launch/stone-library/fallbacks` assets | Controlled local stopgap in place. | Replace with approved HD finish assets during full Stone Library image coverage. |

### Stone Library Image Coverage - 2026-05-25
The fast-track pass and current-site shared-drive follow-up confirm the approved current website source assets are wired through `src/data/stoneFinishImages.ts` and remain independent of the old WordPress site.

Current runtime coverage across available/TBC Stone Library finish states:

| Coverage type | Count | Meaning |
|---|---:|---|
| Finish-specific image | 45 | A matching finish photo is mapped from `data/Product` and appears on list/detail where that stone/finish is selected. |
| Controlled default/fallback image | 14 | A local fallback or variant-level image exists for the stone/variant, but not for each individual finish. |
| True missing image placeholder | 10 | No approved source image is committed/mapped in the repo yet, so the UI must not pretend to show a real stone finish. |

Finish-specific coverage currently includes Alpine White, Angola Black, Golden Crust Light and Dark, Honey Comb, Ivory Sand, Juparana, New Grey, Steel Blue, Tan Brown, and Zen Grey. Juparana and Zen Grey also have approved secondary frames wired as active-finish support media with lightbox frame selection.

Controlled default/fallback coverage currently includes Blueocean and Tuscany. Blueocean remains a controlled fallback because no matching shared-drive source exists in the current-site scope. Tuscany uses cut-level source images for Vein Cut and Cross Cut, but those images are intentionally treated as variant-level defaults rather than finish-specific honed/polished/sandblasted photos.

Visible placeholder groups after current-site source mapping:
- Harcourt: all TBC finishes.

This is the correct customer-safe posture for launch preparation: use real supplied imagery where available, use controlled local fallbacks where explicitly known, and keep visible placeholders only where Urblo still needs approved source images.

### Temporary Stone Library Source Folder
The temporary source of truth for Stone Library imagery is the Saistone Google Drive shared folder named `Urblo Digital Stone Library` under the shared-drive path ALVIN then Urblo. Do not commit machine-specific local absolute paths for this source.

### Stone Library Drive Image Audit - 2026-05-25
Scope is intentionally limited to stone groups and variants already present in the current website Stone Library. Shared-drive-only products that are not currently on the website are not included in this launch audit.

Inventory result:

| Area | Result |
|---|---:|
| Shared-drive image files found | 125 |
| Shared-drive folders found | 18 |
| Current website stone groups audited | 13 |
| Current website finish states audited | 69 |
| Finish states whose current mapped file matches the shared drive by checksum | 30 |
| Current mapped image differs from the shared-drive candidate | 1 |
| Runtime fallback states with a shared-drive candidate | 8 |
| Runtime placeholder states with a shared-drive candidate | 12 |
| Runtime states with no matching shared-drive source for the current website stone | 18 |

Current-website source status:

| Status | Stone groups / variants | Action |
|---|---|---|
| Current mapped files match shared drive | Alpine White, Angola Black, Juparana primary frames, New Grey, Steel Blue, Zen Grey primary frames, Ivory Sand bush hammered and sparrow peck | No replacement needed before Supabase/Cloudflare setup. |
| Current mapped file reviewed and remapped | Ivory Sand honed previously mapped `Sandstone/Sandstone_Sawn_Urblo.jpeg`, while the shared drive had `Ivory Sand/Ivory Sand_Sawn_Urblo.jpeg` with a different checksum. | Visual review completed; runtime now uses the shared-drive Ivory Sand source. |
| Placeholder but source candidate exists | Golden Crust Light and Dark, Tan Brown | Completed under `NEXT-STONELIB-IMG-001`; finish-specific images are now mapped. |
| Controlled fallback but source candidate exists | Honey Comb; Tuscany vein cut; Tuscany cross cut | Honey Comb now uses finish-specific images. Tuscany now uses variant-level source images and still waits for finish-specific photos if honed/polished/sandblasted need to be visually distinct. |
| No source candidate in current shared-drive scope | Blueocean; Harcourt | Keep current controlled fallback or placeholder behavior unless Urblo supplies approved source imagery. Harcourt remains TBC. |

Current-website update list for `NEXT-STONELIB-IMG-001`:

| Source filename | Target stone / variant | Finish key | Current runtime status | Recommended action |
|---|---|---|---|---|
| `Ivory Sand/Ivory Sand_Sawn_Urblo.jpeg` | Ivory Sand | `honed` | Finish-specific image exists but differs from shared drive | Review visually, then either remap to the shared-drive source or record why the current Sandstone-named file is preferred. |
| `Golden Crust/Golden Crust Light_Flamed_Urblo.JPG` | Golden Crust Light | `flamed` | Placeholder | Add normalized controlled asset and map finish-specific image. |
| `Golden Crust/Golden Crust Light_Sawn_Urblo.JPG` | Golden Crust Light | `sawn` | Placeholder | Add normalized controlled asset and map finish-specific image. |
| `Golden Crust/Golden Crust Light_Honed_Urblo.JPG` | Golden Crust Light | `honed` | Placeholder | Add normalized controlled asset and map finish-specific image. |
| `Golden Crust/Golden Crust Light_Polished_Urblo.JPG` | Golden Crust Light | `polished` | Placeholder | Add normalized controlled asset and map finish-specific image. |
| `Golden Crust(Dark)_虾红/Golden Crust Dark_Flamed_Urblo.JPG` | Golden Crust Dark | `flamed` | Placeholder | Add normalized controlled asset and map finish-specific image. |
| `Golden Crust(Dark)_虾红/Golden Crust Dark_Sawn_Urblo.JPG` | Golden Crust Dark | `sawn` | Placeholder | Add normalized controlled asset and map finish-specific image. |
| `Golden Crust(Dark)_虾红/Golden Crust Dark_Honed_Urblo.JPG` | Golden Crust Dark | `honed` | Placeholder | Add normalized controlled asset and map finish-specific image. |
| `Golden Crust(Dark)_虾红/Golden Crust Dark_Polished_Urblo.JPG` | Golden Crust Dark | `polished` | Placeholder | Add normalized controlled asset and map finish-specific image. |
| `Honey Comb/Honey Comb_Sawn_Urblo.JPG` | Honey Comb | `sawn` | Controlled default fallback using Blueocean fallback | Replace fallback with Honey Comb source image. |
| `Honey Comb/Honey Comb_Honed_Urblo.JPG` | Honey Comb | `honed` | Controlled default fallback using Blueocean fallback | Replace fallback with Honey Comb source image. |
| `Tan Brown/Tan Brown_Flamed_副本.JPG` | Tan Brown | `flamed` | Placeholder | Add normalized controlled asset and map finish-specific image. |
| `Tan Brown/Tan Brown_Sawn_副本.JPG` | Tan Brown | `sawn` | Placeholder | Add normalized controlled asset and map finish-specific image. |
| `Tan Brown/Tan Brown_Honed_副本.JPG` | Tan Brown | `honed` | Placeholder | Add normalized controlled asset and map finish-specific image. |
| `Tan Brown/Tan Brown_Polished_副本.JPG` | Tan Brown | `polished` | Placeholder | Add normalized controlled asset and map finish-specific image. |
| `Toscany_Vein Cut/Toscany_Vein Cut_Urblo.JPG` | Tuscany Vein Cut | `honed`, `polished`, `sandblasted` | Controlled default fallback | Use as a variant-level source only, or wait for finish-specific photos before mapping individual finish states. |
| `Toscany_Cross Cut/Toscany_Cross Cut_Urblo.JPG` | Tuscany Cross Cut | `honed`, `polished`, `sandblasted` | Controlled default fallback | Use as a variant-level source only, or wait for finish-specific photos before mapping individual finish states. |
| No matching shared-drive source | Blueocean | `sawn`, `honed`, `bush_hammered`, `combed`, `rippling`, `rock_face`, `rippling__fine`, `rippling__rough` | Controlled default fallback | Keep fallback until approved Blueocean finish sources are supplied. |
| No matching shared-drive source | Harcourt | all TBC finish states | Placeholder | Keep placeholder/TBC state until approved Harcourt source imagery is supplied. |

Excluded from this launch audit by scope: Cloud Whisper, Mica Grey, Romeo's Vow, Rosy Mist, and Verdant Grey shared-drive folders because those products are not currently on the website Stone Library.

### Stone Library Current-Site Image Mapping - 2026-05-25
`NEXT-STONELIB-IMG-001` normalized and mapped the current-site shared-drive candidates into `data/Product`:

| Stone / variant | Runtime result |
|---|---|
| Golden Crust Light and Dark | Flamed, sawn, honed, and polished now use finish-specific images. |
| Honey Comb | Sawn and honed now use finish-specific images instead of the Blueocean fallback. |
| Ivory Sand | Runtime paths now use the shared-drive `Ivory Sand` filenames instead of the old `Sandstone` file paths; the honed image uses the shared-drive candidate after visual review. |
| Tan Brown | Flamed, sawn, honed, and polished now use finish-specific images. |
| Tuscany Vein Cut and Cross Cut | Each cut now uses its shared-drive variant-level image as the default image; finish tabs still share the cut-level image because no finish-specific photos were supplied. |
| Blueocean | Still uses the controlled `blueocean-sawn` fallback because no matching current-site shared-drive source was found. |
| Harcourt | Still uses placeholder/TBC imagery because no matching current-site shared-drive source was found. |

The obsolete `Sandstone` image folder and unused Tuscany fallback files were removed so the build does not carry duplicate Stone Library assets.

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
Default social preview metadata now uses `public/og-default.png`; `public/og-default.svg` is retained as the editable source image.

## Migration Sequence

1. Replace P0 site identity and first-viewport assets.
2. Add mobile fallback behavior for homepage video.
3. Migrate route banner/contact imagery.
4. Migrate homepage proof/process/project imagery.
5. Add article launch stopgap: local covers plus runtime cleanup of known email proxy images and campaign links.
6. Source approved HD images for the remaining Stone Library gaps and decide secondary finish frame behavior.
7. Convert articles to CMS blocks and remove raw newsletter HTML dependency.
8. Move local stopgap media into Supabase/Cloudflare media records during CMS migration.

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
- Article media cleanup browser QA: `/articles` renders four local article cover images; all four article detail routes render article text, use zero external/proxy article images after lazy-load scroll, and expose zero known campaign/unsubscribe/Google redirect/old upload links.
- Stone Library fast-track coverage audit: provided primary finish assets are mapped for 31 finish states; 16 finish states use controlled local default/fallback imagery; 22 finish states remain true missing-image placeholders pending approved source images.
- SEO/social cleanup: default Open Graph/Twitter image now points at `public/og-default.png`, and high-risk article excerpt/runtime newsletter phrases are qualified or rewritten before public rendering.
- 2026-05-25 launch UI hardening QA: homepage hero renders as a full viewport on desktop/mobile, desktop selects the controlled MP4 with `preload="none"`, mobile still selects no MP4 source, and fresh console checks show no React Helmet strict-mode warning after removing that dependency.
- 2026-05-25 video optimization QA: desktop homepage MP4 was re-encoded from about 16MB to about 3MB as H.264 1280x720, 30fps, no-audio, fast-start media. Browser QA confirmed 1280x720 playback, `readyState=4`, no horizontal overflow, and mobile still selects no MP4 source.

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
