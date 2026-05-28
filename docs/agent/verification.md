# Agent Verification Matrix

Last updated: 2026-05-29

## Purpose
Use this matrix to choose the smallest verification set that proves a change is safe. Runtime changes still need the full build/lint/typecheck gate unless a task explicitly defines a temporary exception.

## Startup Check
Use when resuming work or handing off between agents.

Run:
- `npm run agent:init`
- `npm run agent:live-readiness` when continuing form/admin/Cloudflare live verification work.

This command is informational and does not replace verification gates. For live form checks, use `--form-writes-approved` in readiness only after Jay has approved tagged live form QA writes; actual `npm run agent:forms-live` execution must also include `--allow-writes`. For live admin writes, use `--admin-writes-approved` only after Jay has approved tagged live admin QA writes.

## Verification Profiles

### Docs-Only
Use when changing Markdown, JSON task state, or harness instructions without touching runtime source.

Run:
- `npm run agent:check`
- `git diff --check`

Evidence to record:
- Which docs changed.
- Whether any repo-path or harness checks failed.
- Whether runtime gates were intentionally skipped.

### Runtime UI
Use when changing `src/**`, `public/**`, route behavior, visual layout, user-facing copy, or CTA behavior.

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`

Evidence to record:
- Affected routes.
- Brand/design alignment note.
- Residual visual or responsive risks.

### Data or Content Contract
Use when changing `data/**`, `public/articles/**`, service-layer view models, or typed data contracts.

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:check`
- `npm run agent:content-import` when changing static-to-Supabase import mapping or source content used by that dry run.
- `npm run agent:content-import:apply-sql` when changing static-to-Supabase import SQL artifact generation.
- `npm run agent:public-supabase-readiness` when changing public-content import status rules, structured article-block import assumptions, public read cutover assumptions, static/public route boundaries, or Supabase published-only policy checks.
- `npm run agent:smoke` when route output changes.

Evidence to record:
- Source files changed.
- Any normalization, fallback, or missing-data behavior.
- Affected runtime pages.

### Route, Navigation, or CTA Contract
Use when changing `src/App.tsx`, shared header/footer links, route params, mailto/tel behavior, or form behavior.

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`

Evidence to record:
- Declared routes changed.
- Navigation surfaces changed.
- Any backend absence or mailto fallback remains explicit.

### Deployment or Tooling
Use when changing `.github/**`, `package.json`, `vite.config.ts`, `tsconfig*.json`, ESLint config, or scripts.

Run:
- `npm run agent:check`
- `npm run lint`
- `npm run build` when bundling/deploy behavior might change.
- Tool-specific dry run where available.

Evidence to record:
- Command output summary.
- Any credentials, environment, or CI assumptions.

### Cloudflare Deployment
Use when changing the Cloudflare Pages launch contract, Pages Functions routing, environment variables, redirects, headers, preview deployments, DNS cutover docs, or rollback docs.

Run:
- `npm run agent:cloudflare-readiness`
- `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev` after a Pages preview URL exists
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`
- `npm run agent:check`
- `git diff --check`

Evidence to record:
- Cloudflare project name/environment if known.
- Build command and output directory.
- Preview URL and production URL if available.
- Whether static routes avoid Function invocation.
- Direct-refresh checks for declared public routes.
- DNS cutover and rollback assumptions.

### Supabase Schema or Data Migration
Use when adding Supabase schema, RLS policies, seed/migration scripts, public read contracts, or moving Projects, Stone Library, Articles, media, enquiries, or sample requests out of static files.

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:check`
- Tool-specific migration dry run or local Supabase verification when available.
- `npm run agent:public-supabase-readiness` when public content import/cutover safety is in scope.

Evidence to record:
- Tables/relations changed.
- RLS status and public/admin access assumptions.
- Migration source files and row counts where available.
- Rollback or restore path.
- Any customer-facing data not yet migrated.

### Backend API and Forms
Use when adding or changing `/api/*` endpoints, form submission behavior, Turnstile verification, Supabase writes, transactional email, or lead-status workflow.

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`
- API-level positive and negative submission tests when endpoints exist.

Evidence to record:
- Endpoint paths changed.
- Valid submission result.
- Invalid/spam submission result.
- Supabase record creation proof.
- Email notification proof or reason it was mocked.
- Secret/env assumptions.

### Admin CMS
Use when adding or changing `/admin`, authenticated content CRUD, article block editing, media upload, or lead-management views.

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`
- `npm run agent:admin-crud-coverage` when changing admin routes, module screens, table coverage, audit writers, export controls, or role gates.
- `npm run agent:first-admin-bootstrap` when changing first-admin bootstrap tooling. Use `--verify-only` only after a service-role key and first admin email are configured; write mode requires explicit approval.
- `npm run agent:admin-crud-live` in plan-only mode when changing live admin verification contracts; run `npm run agent:admin-crud-live -- --allow-writes` only after browser-safe Supabase config and a real owner/admin session are available and Jay has approved tagged QA writes.
- Browser or Playwright checks for authenticated and unauthenticated admin routes when possible.

Evidence to record:
- Admin routes touched.
- CRUD flows manually or automatically checked.
- Draft/published visibility behavior.
- Auth/RLS assumptions.
- Any content type still requiring code edits.

## Output Rule
Every completed task should leave a short verification note in `docs/WORKLOG.md` and should keep `docs/HANDOFF.md` current if it changes the next recommended action.
