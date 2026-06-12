# NEXT_STEPS - Urblo Roadmap

Last updated: 2026-06-12

## Purpose
This is the human-readable roadmap. The machine-readable source of truth is `docs/agent/tasks.json`; the compact current-state snapshot is `docs/agent/status.json`; historical proof lives in `docs/WORKLOG.md`.

Use this file to choose direction. Use `docs/agent/tasks.json` to execute.

## Current Objective
Urblo is now operating as a Cloudflare Pages + Supabase site with real forms and a production `/admin` CMS. The next cycle should focus on proof polish and customer handoff decisions rather than rebuilding the launch stack.

## What Is Complete
- Cloudflare Pages production hosting is complete for `https://urblo.com.au` and `https://www.urblo.com.au`.
- Contact and Sample Request persistence is complete, including server-side audit rows, SMTP2GO notification proof, and browser-key private-row denial.
- Supabase foundation, baseline seeds, RLS, Storage hardening, admin helper hardening, and admin profile uniqueness are complete.
- First admin bootstrap is complete for `info@urblo.com.au`.
- `/admin` CMS source and production handoff are complete for Dashboard, Projects, Stone Library, Products, Articles, Media, Leads, Settings, and Change history.
- Admin CRUD live QA, private Storage proof, deployed smoke, active-admin browser QA, and strict handoff readiness have passed.
- Public Projects, Products, Articles, and Stone Library listing/detail prefer Published CMS content with static fallback.
- Static production content has been imported into the CMS as Draft items for editor review.
- Phase 1 SEO indexability foundation is implemented in source: real `robots.txt`, real `sitemap.xml` with 36 approved public URLs, centralized public route metadata in `src/data/seoRoutes.ts`, conservative client-side JSON-LD, and `npm run agent:seo-readiness`.
- Google Search Console was reviewed on 2026-06-12 and `https://urblo.com.au/sitemap.xml` was submitted/refreshed the same day. The current SEO follow-up belongs to Phase 2: monitor when Google reads the refreshed sitemap, map old URLs with search signal, add selective 301 redirects for valuable legacy paths, and then expand non-brand long-tail Product/Stone/Project/Article content.
- Harness GC first pass is implemented.

## Active Now
Only these task IDs should be treated as current executable work:

- `NOW-FORMS-SUPABASE-001`: final Turnstile proof. The public widget key, server secret, and valid token must be available before running the strict live proof.
- `NOW-ADMIN-SETTINGS-CRUD-001`: real Settings invite proof. This waits for Jay to approve a target editor email and the invite action.

## Next Decisions
- Decide whether Turnstile proof is required before the next public launch checkpoint.
- Choose who should receive the first real CMS invite proof email.
- Ask a customer/editor to review imported Draft CMS content and decide what to publish first.
- Decide whether to resume article claim cleanup, currently paused by user direction.
- Decide whether physical delete controls are needed, and define retention/destructive-delete policy before adding them.
- Decide how deep the Phase 2 SEO pass should go after the GSC follow-up in `docs/SEO_PHASE_2_PLAN.md`: refreshed-sitemap monitoring plus selective legacy URL redirects, content/CTA polish, standard Stone/Product/Project landing-page expansion, or deeper pre-render/SSR-style static HTML output for public detail routes.

## Deferred Follow-Ups
- `NOW-ADMIN-CMS-001` is complete as an umbrella. Future CMS work should use specific child/follow-up task IDs.
- `NOW-ADMIN-AUTH-RLS-001`, `NOW-ADMIN-CONTENT-CRUD-001`, and `NOW-ADMIN-MEDIA-LEADS-001` are complete for launch handoff.
- Optional unprofiled unauthorized browser QA remains available but is not required for completed CMS handoff.
- Capability-specific download capture can receive its own live check, but base `/api/enquiries` persistence is already verified.
- Static fallback should remain until Jay explicitly approves a CMS-only public cutover.

## Quality Gates
Runtime changes must pass:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`

Docs and harness changes should pass:
- `npm run agent:check`
- `npm run agent:harness-gc`
- `npm run agent:harness-gc:review`
- `git diff --check`
- `npm run agent:seo-readiness` when public SEO metadata, sitemap, robots, structured data, or public route slugs change.

CMS handoff checks:
- `npm run agent:admin-cms-predeploy`
- `npm run agent:admin-config-gate`
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict`

Live writes and invite emails require explicit approval for the specific target action.

## Agent Command Index
These scripts are intentionally documented so harness GC can check command coverage:
- `npm run agent:admin-auth-browser`
- `npm run agent:admin-cms-predeploy`
- `npm run agent:admin-config-gate`
- `npm run agent:admin-crud-coverage`
- `npm run agent:admin-crud-live`
- `npm run agent:admin-handoff-readiness`
- `npm run agent:admin-live-readiness`
- `npm run agent:capabilities-ui`
- `npm run agent:check`
- `npm run agent:cloudflare-preview-smoke`
- `npm run agent:cloudflare-readiness`
- `npm run agent:content-import`
- `npm run agent:content-import:apply-sql`
- `npm run agent:content-import:json`
- `npm run agent:content-import:live`
- `npm run agent:content-import:plan`
- `npm run agent:content-import:preflight-sql`
- `npm run agent:first-admin-bootstrap`
- `npm run agent:forms-live`
- `npm run agent:forms-ui`
- `npm run agent:harness-gc`
- `npm run agent:harness-gc:fix`
- `npm run agent:harness-gc:review`
- `npm run agent:init`
- `npm run agent:live-readiness`
- `npm run agent:public-supabase-readiness`
- `npm run agent:seo-readiness`
- `npm run agent:smoke`
- `npm run agent:supabase-foundation-readiness`

## Last Verified
Latest relevant 2026-06-05 proof set:
- `npm run agent:admin-crud-coverage`: pass
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass
- `npm run agent:smoke`: pass
- `npm run agent:supabase-foundation-readiness`: pass
- `npm run agent:public-supabase-readiness`: pass
- `npm run agent:cloudflare-readiness`: pass
- `npm run agent:admin-config-gate`: pass
- `npm run agent:seo-readiness`: pass
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass
- `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`: pass
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict`: pass

Build still shows the known Browserslist staleness notice and AdminApp chunk-size warning. Treat those as monitoring items unless they change materially.

## Exit Criteria For The Current Cycle
- `docs/agent/tasks.json` keeps only true active execution work in `now`.
- Harness GC reports no failures and only intentional warnings.
- Turnstile and Settings invite decisions are explicit.
- Editor/customer content review decisions are explicit.
- Any new runtime work passes the runtime gate set above.
