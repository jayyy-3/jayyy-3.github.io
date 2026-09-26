# Admin UX Reshape Plan - Remaining Work

Last updated: 2026-09-26
Issued by: Jay (project owner), via Claude review session
Status: approved direction; supersedes further per-module copy/label polish

Completed phases (Phase 0 reliability, Phase 1 Projects, Phase 2 Stone Library, the wave 1 safety stopgaps and the Phase 3 guide shrink) were absorbed into `docs/ADMIN_OPERATIONS_RUNBOOK.md` (Completed admin reshape record) on 2026-09-26. The full 2026-07-14 directive, including its original diagnosis, is preserved in Git: `git show e1548af:docs/ADMIN_UX_RESHAPE_PLAN.md`. This file now holds only the rules and work that remain.

This plan changes the SHAPE of the admin, not its security posture. RLS, draft-first imports, published-only public reads, audit logging and no destructive deletes remain in force. Read `AGENTS.md`, `docs/OPERATING_PROTOCOL.md`, `docs/DESIGN.md` and `docs/brand-baseline.md` before executing.

## Core principle (non-negotiable)

**The admin must take the shape of the website, not the shape of the database.** Jay's metric: a non-technical person must be able to easily create, edit and remove website content. Every rebuilt screen satisfies all five rules:

1. **Page-shaped information architecture.** Editors navigate the website's structure and edit that page's sections in place; child tables appear as sections of the page, not sibling table editors.
2. **Live preview at the center.** Feed draft data into the same public components for a faithful preview.
3. **Two publish states in the editor's vocabulary.** "Saved (not live)" and "Live" (plus "Hidden"). Child rows follow their parent; internal states move to an admin-only surface.
4. **One draft, one Save, autosave.** One aggregate draft saved atomically; no parallel per-child Save buttons or `window.confirm` dirty guards.
5. **Media inline, privilege server-side.** Every image field offers upload and pick-from-library inline; publishing promotes referenced media through an audited server endpoint. Editors never see bucket names.

## Remaining work

1. **Articles** (Phase 2-1): aggregate = article + sections; preview reuses `src/pages/ArticlePage.tsx`. The 2026-09 maintenance split into `src/pages/admin/articles/` did not change the UX.
2. **Products** (Phase 2-2): product + models + specs + material defaults as one aggregate; preview reuses `src/pages/ProductDetailPage.tsx`. Remove the four parallel form state machines and the per-row Status dropdown.
3. **Media** (Phase 2-4): shrink to a maintenance/library view off the daily path; remove bucket/Storage/promotion wording.
4. **Settings, Leads and Change history** (Phase 2-5): align vocabulary and actions bar; decide the Leads role fit (who may change lead status) with Jay.
5. **Shared layer** (added by the 2026-09 audit): shared feedback/error messages and unsaved-changes protection for the older modules (optimization wave 2 task in progress), then a shared media picker.
6. **Phase 3 leftovers:** update `docs/agent/verification.md` golden workflows to the new shape and add the fool test as a named workflow; record the admin editing archetype (the five rules) in `docs/DESIGN.md`; update `docs/ARCHITECTURE.md` for any new save/publish endpoints.

## Acceptance for each rebuilt module

1. The fool test for that module is performed by a real naive tester or Jay and recorded with steps and timing; agents do not self-certify.
2. A full edit needs exactly one Save and no confirm dialogs.
3. Preview uses the same public components as the live page.
4. No editor-facing surface shows bucket names, promotion language, per-child publish controls, migration/fallback language or raw coordinates.
5. `npm run gate` passes before push; anonymous/public boundary proofs and bundle budgets still hold.

## Anti-goals

- No copy-only "clarify" pass in place of restructuring.
- Do not weaken RLS, remove draft-first imports or static fallback, or add destructive deletes (decision-gated by Jay).
- No off-the-shelf CMS; no new Supabase keys in the browser. Privileged steps go into `functions/api/admin/` with server-side session validation, role check and audit row.
- Update `scripts/check-admin-crud-coverage.mjs` expectations deliberately with the shape change; prefer behaviour-level checks.
- Live-write QA, schema changes and production migration apply each need Jay's explicit approval.

## Document lifecycle (Jay's directive)

This file is a temporary execution directive. When the remaining work completes: move the five rules into `docs/DESIGN.md`, endpoint contracts into `docs/ARCHITECTURE.md`, the fool test into `docs/agent/verification.md`, and outcomes into `docs/WORKLOG.md`; remove every reference (`git grep ADMIN_UX_RESHAPE_PLAN`); delete this file; run `npm run agent:check` and `git diff --check`. Do not mark `NOW-ADMIN-UX-RESHAPE-001` done while this file exists.
