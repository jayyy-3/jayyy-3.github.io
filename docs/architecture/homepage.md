# Homepage contract

Homepage structure, sections and typography. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

## Homepage Contract
- Homepage structure is driven by dedicated internal config in `src/data/homepage.ts`, not the legacy tabbed `FeatureSection`.
- Homepage uses `HomepageLayout` with `HomepageHeader`/`HomepageFooter` proxy components that currently render the shared `SiteHeader`/`SiteFooter`.
- The previous homepage `Browse by stone type` showcase has been removed by request; homepage material discovery should be reintroduced only through a new Urblo-aligned section if the client wants that pathway.
- The previous homepage sustainability/tabbed feature section is currently not rendered by request. The proof metrics block now appears directly after the hero and uses the approved stone/city framing plus four proof metrics.
- Homepage partner banner is the slim `Design-led stone solutions for streetscapes & civil landscapes.` transition band, using the West Side Place aerial image and roughly half the original vertical space.
- Homepage Latest Projects reads the same published Project collection as `/projects`, in the same `sort_order`, and maps each record into the homepage browser when the section nears the viewport. The controlled five-project `homepageData.latestProjects.projects` array is fallback content only. `HomepageSections.tsx` renders the data as a sketch-aligned two-row/four-column browser: the upper copy and upper feature image each span two columns, the lower draggable rail shows four portrait project images on desktop, and the active `View project` link navigates to `/projects/:slug`.
- Homepage Latest Projects is intentionally rendered immediately below the partner banner, before the Product Showcase, so project proof follows the positioning line rather than appearing later as a filler block.
- Homepage bottom video CTA is configured by `homepageData.videoCta.youtubeId` and opens a lazy `youtube-nocookie.com/embed/UfRtQZSi7cM` iframe only inside the Play modal. Closing the modal unmounts the iframe and stops playback.
- Homepage typography is self-hosted from local static assets under `/public/fonts/urblo`:
  - `Avenir LT Std` weights `300/400/500/600/800`
  - `Didot LT Std` italic `400` and normal `600`
  - `Space Grotesk` local WOFF2
- Homepage runtime no longer depends on remote WordPress font CSS/TTF/WOFF assets.
