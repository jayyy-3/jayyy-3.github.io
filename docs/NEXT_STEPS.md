# NEXT_STEPS - Urblo Roadmap

Last updated: 2026-05-22

## Purpose
This file is the human-readable roadmap. The machine-readable task queue lives in `docs/agent/tasks.json` and is the source of truth for active task status, file ownership, acceptance criteria, and verification commands.

Use this file to understand priority shape. Use `docs/agent/tasks.json` to execute.

## Current Objective
Move Urblo from a static website toward a launchable Cloudflare + Supabase operating system: public site hosting, real forms, customer-maintained content, controlled media, and a durable admin workflow.

## Blocking Quality Gate Policy
A task touching runtime behavior is not complete unless all three pass:
- `npm run build`
- `npm run lint`
- `npx tsc -b`

Docs-only and harness-only work should run:
- `npm run agent:check`
- `git diff --check`

Cloudflare/Supabase implementation work should also follow the new verification profiles in `docs/agent/verification.md`.

## Last Runtime Baseline
Measured 2026-05-22:
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass
- `npm run agent:smoke`: pass

## Advisory Brand + Design Gate
For any user-facing layout/copy/IA task:
- Reference relevant sections in `docs/brand-baseline.md`.
- Reference relevant sections in `docs/DESIGN.md`.
- Include a short brand/design alignment note in task delivery.
- If implementation cannot satisfy baseline yet, record explicit gap and follow-up ID.

## Now
Source of truth: `docs/agent/tasks.json`.

- `NOW-FORMS-SUPABASE-001`: replace mailto-only Contact and Sample Request flows with Supabase-backed submissions.
- `NOW-ADMIN-CMS-001`: build the Urblo admin CMS for customer-maintained Projects, Stone Library, Products, Articles, media, and leads.
- `NOW-ASSET-MIGRATION-001`: migrate priority media away from old WordPress URLs and define controlled storage for launch.

## Next
- `NEXT-UI-PARITY-001`: bring Home, Our Story, Articles, and Contact Us toward approved visual references.
- `NEXT-STONELIB-IMG-001`: complete Stone Library HD finish image coverage.
- `NEXT-STONELIB-IMG-002`: decide and implement secondary finish frame behavior.
- `NEXT-STONELIB-DATA-001`: replace generic finish behavior text with approved notes.
- `NEXT-PROJECTS-INTAKE-001`: define the project intake template and migrate the next project into the material-map case study model.

## Later
- `LATER-BRAND-001`: align homepage modules with brand pillars and proof framing.
- `LATER-LAUNCH-DOCS-CONSOLIDATE-001`: after production launch, split the temporary launch plan into durable architecture, operations, and worklog docs.
- `NOW-DEPLOY-PAGES-HARDEN-001`: legacy fallback only if Cloudflare Pages is reversed.
- `NEXT-SAMPLE-REQUEST-001`: legacy fallback only if Supabase-backed forms are not implemented.

## Blocked
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`: repo-side Cloudflare Pages configuration is prepared; dashboard project creation, preview URL validation, production custom domain, DNS cutover, and rollback require Cloudflare account access.

## Completed This Cycle
- `DONE-DOCS-HARNESS-ROOT-001`: promoted `docs/README_AGENT.md` to root `AGENTS.md`, added `docs/DESIGN.md`, moved repo docs to relative paths, and separated brand authority from design execution authority.
- Phase 1 harness hygiene committed: `docs/HANDOFF.md`, `docs/agent/tasks.json`, `docs/agent/verification.md`, `scripts/check-doc-paths.mjs`, and `scripts/check-harness.mjs`.
- Phase 2 verification harness completed: `scripts/agent-init.sh`, `scripts/agent-smoke.sh`, and package-level `agent:*` scripts.
- `NEXT-DATA-001`: project list/detail metadata now comes from `src/data/projectData.ts`; Moon Gate is the first material-map case study.
- `NOW-CLOUDFLARE-SUPABASE-ARCH-001`: Cloudflare Pages + Supabase launch architecture, cost model, and customer-facing approval PDF are documented.
- `NOW-SUPABASE-SCHEMA-001`: Supabase schema plan is documented for Projects, Stone Library, Products, Articles, media, admin access, and lead capture.
- `NEXT-ROUTER-SEO-001`: clean Cloudflare Pages routing is implemented with `BrowserRouter`, root Vite base, and SPA fallback.
- Asset migration stopgap: direct old WordPress media references have been removed from runtime data and replaced with controlled local assets under `public/media/launch`; article covers and known article detail images now use a local runtime cleanup layer, while CMS media records and structured article blocks remain open under the article/admin tracks.
- `NOW-DELIVERY-READINESS-001`: removed Vite starter README content and deleted the unused React starter SVG asset.
- `NOW-ASSET-STRATEGY-001`: interim local stopgap and delivery-phase Supabase/Cloudflare media hosting policy are documented.
- `NOW-STONELIB-IMG-FASTTRACK-001`: provided primary finish assets are mapped, controlled fallback usage is documented, and remaining true missing image groups are recorded for full coverage.
- `NOW-SEO-DELIVERY-001`: default metadata/icons/social image are launch-owned, Open Graph/Twitter image now uses a PNG, and high-risk article excerpt/runtime newsletter claims are qualified.
- `LATER-PERF-001`: route-level lazy loading is implemented, initial app shell JS is reduced, and the previous `>500kB` JavaScript chunk warning is resolved.
- `LATER-QA-001`: `npm run agent:smoke` now verifies key route shells, article index availability, and critical CTA targets with actionable names.

Older completion details live in `docs/WORKLOG.md`.

## Exit Criteria for Current Delivery Cycle
- Active `now` tasks in `docs/agent/tasks.json` are complete or explicitly deferred.
- Cloudflare Pages can deploy production and preview builds.
- Supabase schema, Auth, Storage, and RLS assumptions are implemented and verified.
- Contact and Sample Request persist records and send notifications.
- Admin users can CRUD Projects, Stone Library, Products, Articles, media, and lead records without code edits.
- Priority media no longer depends on old WordPress URLs for first-viewport production experience.
- All applicable quality gates pass per `docs/agent/verification.md`.
- Navigation and route contracts remain consistent with `src/App.tsx`, `src/data/siteChrome.ts`, and `src/components/site/SiteFooter.tsx`.
- Delivery shell is free of template/default app metadata and dead social links.
- Stone Library data/image follow-ups are explicit, not implied complete.
