# AGENTS - Urblo AI Harness Entry

Last updated: 2026-05-28

## Project Mission
Urblo web exists to communicate a design-led, engineering-backed, proof-driven natural stone solution system for streetscapes and civil landscapes.

The harness has two separate creative authorities:
- Brand strategy, positioning, copy claims, and audience framing live in `docs/brand-baseline.md`.
- Visual design, UX rhythm, page composition, interaction tone, and UI quality live in `docs/DESIGN.md`.

## Startup Checklist
1. Run `npm run agent:init` when you need a quick repo/status briefing.
2. Read this file first: `AGENTS.md`.
3. Read current handoff: `docs/HANDOFF.md`.
4. Read machine task queue: `docs/agent/tasks.json`.
5. Read verification matrix: `docs/agent/verification.md`.
6. Read brand rubric: `docs/brand-baseline.md`.
7. Read design contract: `docs/DESIGN.md`.
8. Read technical facts and contracts: `docs/ARCHITECTURE.md`.
9. Read human roadmap: `docs/NEXT_STEPS.md`.
10. Read admin IA/access contract when working on `/admin`: `docs/ADMIN_IA_ACCESS.md`.
11. Read latest session evidence when needed: `docs/WORKLOG.md`.
12. For docs/harness changes, run:
   - `npm run agent:check`
   - `git diff --check`
13. For runtime changes, run quality gates from repo root in this order:
   - `npm run build`
   - `npm run lint`
   - `npx tsc -b`
   - `npm run agent:smoke`
14. Treat any runtime gate failure as blocking unless `docs/agent/tasks.json` explicitly defines a temporary exception.

## Canonical Conflict Precedence
- Code reality wins over stale docs. If docs conflict with implemented behavior, verify code reality, update docs, then add remediation tasks if the behavior itself is wrong.
- Brand strategy, positioning, audience, voice, and claim safety: `docs/brand-baseline.md` is authoritative.
- Visual design, UX rhythm, layout density, imagery treatment, page archetypes, and interaction tone: `docs/DESIGN.md` is authoritative.
- Architecture, route, data, state, side-effect, and deployment contracts: `docs/ARCHITECTURE.md` is authoritative.
- Machine-readable execution priorities and task sequencing: `docs/agent/tasks.json` is authoritative.
- Human-readable roadmap and cycle shape: `docs/NEXT_STEPS.md` is advisory.
- Current handoff state: `docs/HANDOFF.md` is authoritative for the next recommended action.
- Session evidence and what was actually validated: `docs/WORKLOG.md` is authoritative.

When brand and design appear to disagree, preserve the brand promise first, then adjust UI execution through `DESIGN.md`.

## When Docs Must Be Updated
Update docs when any of the following changes:
- Route behavior, navigation behavior, or CTA behavior visible to users.
- Page-level design direction, visual system choices, or interaction patterns.
- Data contracts or typed models used by runtime pages.
- State/storage side effects (`zustand`, `localStorage`, client fetch contracts).
- Build/lint/typecheck gate status.
- Deployment behavior or release pipeline.
- Priority, risk posture, or handoff assumptions.

Committed docs should use repo-root relative paths such as `src/App.tsx` or `docs/DESIGN.md`. Do not write machine-specific absolute paths into repo docs. If an outside local archive informed a decision, summarize it as an external source instead of making it a canonical path.

Minimum required updates for major changes:
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md` when current state, next action, or risk posture changed
- `docs/agent/tasks.json` when task status, files, acceptance, or verification changed
- `docs/ARCHITECTURE.md` when contracts changed
- `docs/DESIGN.md` when visual or UX direction changed

## Delivery Closure Guardrail
Before declaring implementation complete, verify all checks below:
- Code gates passed for runtime changes (`build`, `lint`, `tsc`).
- Harness checks passed for docs/tooling changes (`npm run agent:check`, `git diff --check`).
- Contract docs reflect current routes and runtime data sources.
- User-facing changes include a brand/design alignment note when relevant.
- `docs/HANDOFF.md` reflects current next action and risks.
- `WORKLOG.md` includes scope, verification evidence, and residual risks.
- `docs/agent/tasks.json` and `NEXT_STEPS.md` leave explicit follow-ups.

## Current Critical Risk Snapshot
- Root harness entry is `AGENTS.md`; the old `docs/README_AGENT.md` path is retired.
- Current-state handoff is `docs/HANDOFF.md`; machine task state is `docs/agent/tasks.json`.
- Launch target is now Cloudflare Pages + Supabase + Urblo-owned `/admin`; the long-form plan is `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`.
- Supabase foundation migrations are applied and verified for project `Urblo` (`npkidywzwddbnfrnxlmo`): 24 launch tables, RLS, policies, FK indexes, private lead/admin protection, and read-only anonymous public-content grants.
- Supabase baseline seed migration is applied and verified: 12 distinct published finish definitions and one published default site settings row.
- Supabase admin settings/profile hardening migrations are applied and verified: `site_settings` writes are owner/admin only, admin profile owner-role changes are owner-protected, and anonymous direct execution of admin SECURITY DEFINER helpers is revoked.
- Supabase media Storage migrations are applied and verified: `urblo-public-media` and `urblo-admin-media` buckets exist, public object listing is disabled, and Storage object writes require active admin/editor roles.
- Forms backend source is implemented for `/api/enquiries` and `/api/sample-requests`, including server-side audit-event attempts after successful lead inserts, but live Supabase row creation still requires server-side `SUPABASE_SERVICE_ROLE_KEY` verification.
- `npm run agent:forms-live` is the credential-gated live form verification runner; it proves valid enquiry/sample-request rows plus audit rows and invalid-payload no-write behavior once a service-role key is available, and intentionally fails without credentials.
- `npm run agent:admin-live-readiness -- --admin-email <first-admin-email>` is the read-only admin credential/profile readiness runner; it requires browser-safe and service-role keys, verifies the named active profile and baseline seed rows, and never mutates Supabase.
- Current content runtime remains static/file-backed until content CRUD is implemented and public routes are migrated from static data.
- `/admin` auth shell source is implemented and config-gated: routes exist outside public site chrome, use Supabase Auth/profile checks when browser-safe keys are configured, and show a configuration-required state without rendering dashboard content when keys are absent.
- `/admin/settings` source can read/create/update the default `site_settings` row and manage existing Supabase Auth users' admin profile rows for owner/admin roles after live auth is configured; first admin bootstrap still requires Jay confirmation and external setup.
- `/admin/media` source is implemented as the first media library screen: active admin/editor roles can upload Storage-backed draft records, edit media metadata, export the currently loaded media manifest to CSV after audit logging, and use publish/archive validation that keeps private draft assets from being marked public.
- `/admin/stone-library` source is implemented as the first content CRUD screen: active admin/editor roles can maintain stone groups, variants, and finish capability rows after live auth is configured.
- `/admin/projects` source is implemented as the next content CRUD screen: active admin/editor roles can maintain project records, facts, material schedule rows, material maps, and hotspots after live auth is configured.
- `/admin/products` source is implemented as the next content CRUD screen: active admin/editor roles can maintain product families, models, material defaults, and specs after live auth is configured.
- `/admin/articles` source is implemented as the next content CRUD screen: active admin/editor roles can maintain article metadata and structured article blocks after live auth is configured.
- `/admin/leads` source is implemented as the first lead inbox screen: active owner/admin roles can update enquiry and sample request status, assignment, internal notes, and export the currently loaded queue to CSV after live auth is configured. CSV export is blocked unless an audit event is recorded first.
- `/admin/audit` source is implemented as the first audit visibility screen: active owner/admin roles can inspect audit rows after live auth is configured, and admin CRUD/workflow save flows now call a shared audit writer after successful primary mutations.
- `npm run agent:admin-crud-coverage` is implemented as a source-only admin verifier for route/module registration, protected shell coverage, launch-critical table references, role-gated controls, publish/archive paths, audit actions, and Media/Leads export audit gates. It does not mutate Supabase and does not replace live browser QA.
- `npm run agent:content-import` is implemented as a no-write content import dry run. It maps current static Stone Library, Products, Projects, Articles, and media candidates into Supabase-shaped payloads and fails on missing local assets or unknown stone/finish references before any production data import is attempted. Use `npm run agent:content-import -- --out .tmp/content-import-preview.json` for a local ignored review artifact, `npm run agent:content-import:plan` to also write a local ignored Markdown apply/rollback plan, or `npm run agent:content-import:preflight-sql` to also write a local ignored read-only Supabase target preflight SQL artifact.
- `NOW-ADMIN-CMS-001` is an umbrella objective, not a single executable implementation task; admin IA/access is defined in `docs/ADMIN_IA_ACCESS.md`, and implementation still uses the smaller auth/CRUD/media/leads tasks in `docs/agent/tasks.json`.
- Stone Library migration is complete: old `/materials*` route family has been removed and replaced with `/stone-library` plus `/stone-library/:stoneGroupId`.
- `NEXT-STONELIB-DRIVE-IMAGE-AUDIT-001` and `NEXT-STONELIB-IMG-001` are complete for current website stones only; Drive-only products remain out of scope until the client decides to add them.
- Contact route is declared at `/contact`; shared header/footer navigation points to declared routes, with Sample Request remaining a `mailto:` fallback until `NOW-FORMS-SUPABASE-001` is implemented.
- Last runtime gates were measured on 2026-05-28 and were green (`npm run build`, `npm run lint`, `npx tsc -b`, `npm run agent:smoke`) during the Media manifest export source checkpoint.
- Route-level code splitting is in place and the previous `>500kB` chunk warning is resolved; continue monitoring bundle output as features are added.
- GitHub Pages hardening is now a legacy fallback; Cloudflare Pages deployment is the active launch path.
- Routing now uses clean paths through `BrowserRouter` with Cloudflare Pages SPA fallback files in `public/`; unknown public URLs render a branded not-found state instead of the homepage.
