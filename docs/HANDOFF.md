# HANDOFF - Current Agent State

Last updated: 2026-05-22

## Current Focus
The launch direction is now Cloudflare Pages + Supabase + an Urblo-owned admin CMS:
- Public website hosting should move to Cloudflare Pages.
- Contact and Sample Request should move from mailto/local-only behavior to Supabase-backed submissions.
- Projects, Stone Library, Products, Articles, media records, and lead records should become customer-maintainable through `/admin`.
- The current runtime remains static/file-backed until implementation tasks are completed.
- The long-form plan and cost baseline live in `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`.

## Current Branch State
- Branch: `main`
- Remote tracking: `origin/main`
- Current work includes runtime UI, data, local project assets, and harness doc updates.

## Canonical Entry Points
- Agent entry: `AGENTS.md`
- Current state: `docs/HANDOFF.md`
- Machine task queue: `docs/agent/tasks.json`
- Verification guide: `docs/agent/verification.md`
- Brand authority: `docs/brand-baseline.md`
- Design authority: `docs/DESIGN.md`
- Architecture contract: `docs/ARCHITECTURE.md`
- Historical evidence: `docs/WORKLOG.md`

## Latest Verification Snapshot
- `npm run build`: pass on 2026-05-22; the previous bundle size warning remains resolved, with the existing Browserslist staleness notice only.
- `npm run lint`: pass on 2026-05-22.
- `npx tsc -b`: pass on 2026-05-22.
- Playwright visual QA: desktop and mobile Moon Gate detail page checked locally; hotspot click changed the active material inspector, the legacy ACU detail page no longer showed Moon Gate copy, and project heading computed styles matched the live Avenir project-title pattern.
- `npm run agent:check`: pass on 2026-05-18.
- `npm run agent:smoke`: pass on 2026-05-18.
- `git diff --check`: pass on 2026-05-18.
- Cloudflare/Supabase launch plan docs: `npm run agent:check` and `git diff --check` pass on 2026-05-22.
- Supabase schema planning docs: `npm run agent:check` and `git diff --check` pass on 2026-05-22.
- `npm run agent:smoke`: pass on 2026-05-22 for clean routes and article index.
- Cloudflare Pages repo-side routing/runbook work: runtime and harness verification pass on 2026-05-22.
- SEO metadata baseline: runtime and harness verification pass on 2026-05-22.
- Asset migration audit: `npm run agent:check` and `git diff --check` pass on 2026-05-22.
- P0 launch media stopgap: runtime and harness verification pass on 2026-05-22.
- Browser media QA on 2026-05-22: desktop homepage selects local MP4 and poster; mobile homepage selects no MP4 source and uses the local poster; Products, Product detail, Projects, Our Story, Contact, Articles, and Article detail banners load from local `public/media/launch` assets with no broken images observed.
- Homepage video replacement and P1 visible homepage/Our Story media pass: runtime, harness, and browser media QA pass on 2026-05-22.
- Legacy project media and Stone Library fallback migration: runtime, harness, old WordPress scan, and browser media QA pass on 2026-05-22.
- Old-site favicon restoration: runtime, harness, local asset, and browser head verification pass on 2026-05-22.
- Article media cleanup: runtime build/lint/typecheck pass on 2026-05-22; Browser QA confirms `/articles` uses local article covers and all four article detail routes render text with zero known external/proxy article images or campaign/unsubscribe/Google redirect/old upload links after lazy-load scroll.
- Delivery-readiness cleanup: Vite starter README content and the unused React starter SVG asset were removed on 2026-05-22.
- Asset hosting strategy: current local `public/media/launch` stopgap plus delivery-phase Supabase Storage and Cloudflare R2/Stream review policy are documented and `NOW-ASSET-STRATEGY-001` is closed.
- Stone Library image fast-track: provided primary finish assets are mapped, controlled fallback usage is documented, and remaining missing image groups are recorded for the full coverage task.
- SEO/social launch cleanup: default social metadata now uses a 1200 x 630 PNG share image, article excerpts are claim-safe, and known high-risk newsletter phrases are rewritten at runtime.
- Performance cleanup: route-level lazy loading is implemented in `src/App.tsx`; build output no longer emits the previous `>500kB` JavaScript chunk warning.
- Smoke coverage cleanup: `npm run agent:smoke` now checks declared route shells, article index availability, and key CTA targets including Contact, Sample Request mailto fallback, Moon Gate CTAs, Contact page Stone Library CTA, and stone detail phone CTA.
- Homepage Browse by stone type removal: requested section, section data, and four unused local stone showcase images were removed on 2026-05-22.
- Full-site UI/UX QA on 2026-05-22 covered Home, Stone Library list/detail, Products list/detail, Projects list/detail, Our Story, Contact, Articles list/detail, plus mobile spot checks. No broken images or broad horizontal overflow were found outside the known article newsletter HTML issue; article mobile overflow now has a runtime CSS stopgap.
- Final browser QA on 2026-05-22 confirms Home no longer contains `Browse by stone type`, Prime Block initializes default material selections, and the Debunking article has zero horizontal overflow at 390px after the article stopgap.

## Active Risks
- Cloudflare + Supabase is approved as the launch target, but runtime implementation has not started.
- Clean URL routing is implemented repo-side for Cloudflare Pages, but the live Cloudflare project, preview deployment, custom domain, DNS cutover, and rollback still require account access.
- Supabase schema design is documented, but migrations, RLS implementation, Auth, Storage, admin CRUD, form APIs, and transactional email are not implemented yet.
- Contact and Sample Request remain mailto/local-only in current runtime.
- Unknown URLs still render the homepage through the catch-all route; `NOW-ROUTE-ERROR-STATES-001` tracks a proper 404/not-found state.
- Projects, Stone Library, Products, and Articles are still file-backed rather than customer-editable.
- The admin CMS does not exist yet.
- P0/P1 old WordPress media references in runtime data have been migrated to controlled local assets under `public/media/launch`; article covers and known detail images now have a local runtime stopgap under `public/media/launch/articles`.
- Stone Library fast-track imagery is mapped/documented, but final HD coverage still needs approved source images for Golden Crust, Harcourt, and Tan Brown plus a decision on secondary Juparana/Zen Grey frames.
- Raw article newsletter HTML remains source material and still needs Supabase structured-block migration, claim-safety review, mobile-safe templates, and full editorial cleanup before the article system is considered final.
- Product detail pages now initialize default material selections, but still need a stronger conversion/configuration experience with clear CTA, selected-summary feedback, and deliberate missing-image states.
- Legacy project detail pages remain weaker than the Moon Gate material-map case study model; at least one more project should be migrated before the project system feels consistent.
- Public URL styles are mixed across products, articles, projects, and Stone Library; normalize before production indexing if URLs will be changed.
- App shell default Vite metadata, starter README content, and default social image issues have been replaced; launch polish debt remains around future campaign-specific share imagery only if the client wants a bespoke preview.
- Image hosting policy must now be resolved against the Cloudflare/Supabase launch plan.
- GitHub Pages deployment hardening is a legacy fallback only; Cloudflare Pages is the active target and currently blocked at account-level project setup.
- Route-level code splitting resolved the previous bundle size warning; future admin/CMS additions should keep chunk output under review.
- Moon Gate material/application notes are intentionally MVP-inferred from supplied imagery and public project context; designer confirmation is still needed before final production claims.
- Other project pages still have legacy-level content and need migration into the material-map model.
- React Helmet still emits an existing strict-mode lifecycle warning in dev console.

## Next Recommended Action
Start `NOW-FORMS-SUPABASE-001` once Supabase project credentials and Turnstile/email secrets are available. Return to `NOW-CLOUDFLARE-PAGES-DEPLOY-001` once Cloudflare dashboard access is available. If account access is still unavailable, the next useful non-secret launch tasks are `NOW-ROUTE-ERROR-STATES-001`, `NOW-ARTICLE-STRUCTURE-CLAIMS-001`, `NEXT-PRODUCT-DETAIL-CONVERSION-001`, and `NEXT-PROJECTS-INTAKE-001`.

## Guardrails
- Use repo-root relative paths in committed docs.
- Keep current state short here; write detailed history in `docs/WORKLOG.md`.
- Do not use `docs/NEXT_STEPS.md` as the machine task queue; update `docs/agent/tasks.json` for task state.
