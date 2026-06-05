# Urblo Admin Production Walkthrough

Last updated: 2026-06-05

## Purpose
Use this checklist after the current local CMS UX stack is pushed and deployed. The walkthrough proves the production `/admin` interface matches `docs/ADMIN_EDITOR_GUIDE.md` and is ready for a non-technical editor handoff.

Do not use this checklist to create unreviewed public customer content. Prefer existing imported Draft items, reversible status changes, and clearly tagged QA notes.

## Preconditions
- Current local CMS UX stack is pushed and deployed to `https://urblo.com.au`.
- `npm run build`, `npm run lint`, `npx tsc -b`, `npm run agent:smoke`, `npm run agent:admin-crud-coverage`, `npm run agent:admin-config-gate`, `npm run agent:check`, and `git diff --check` passed before deployment.
- Production active-admin browser QA can run:
  - `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`
- The walkthrough user has Website owner or CMS manager access when testing Settings, Leads export, and Change history.
- Keep `docs/CLOUDFLARE_DEPLOYMENT.md` rollback values intact.

## Deploy Sequence
Use this order after Jay approves push/deploy for the current CMS UX stack:

1. Rerun the local pre-deploy gates:
   - `npm run agent:admin-cms-predeploy`
   - `npm run agent:smoke`
   - `npm run agent:admin-config-gate`

   The predeploy command above runs the non-preview local gates below:
   - `npm run build`
   - `npm run lint`
   - `npx tsc -b`
   - `npm run agent:admin-crud-coverage`
   - `npm run agent:cloudflare-readiness`
   - `npm run agent:check`
   - `git diff --check`
2. Push the approved CMS UX stack and wait for the Cloudflare Pages deployment to finish.
3. Record the Cloudflare deployment identifier or commit in `docs/WORKLOG.md`.
4. Run the no-write deployed smoke:
   - `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`
5. Run active-admin browser QA when the required browser-safe key and admin login inputs are present:
   - `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`
6. Run the module walkthrough steps below and record results in `docs/WORKLOG.md`.
7. Run the final handoff readiness audit:
   - `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict`
8. Only after the walkthrough and strict readiness audit pass, update `docs/HANDOFF.md` and `docs/NEXT_STEPS.md` to say the CMS is production-handoff ready.

## Evidence To Record
Record each result in `docs/WORKLOG.md`:
- Deployment identifier or commit shown by Cloudflare Pages.
- Admin login route and account role used.
- Whether each module showed the expected editor-facing action language.
- Any saved items, publish/archive changes, or invite attempts.
- Public URL checked after publish.
- Screenshots location if browser tooling creates screenshots.
- Any residual editor confusion or copy that still feels technical.

## Results Template

Copy this table into `docs/WORKLOG.md` after the production walkthrough and fill it before claiming handoff readiness.

| Area | Result | Evidence | Changes Made | Public URL / Screenshot | Follow-up |
|---|---|---|---|---|---|
| Deployment | Pending | Cloudflare deployment id or commit. | None expected. | Production origin checked. | None. |
| Deployed smoke | Pending | Command output for `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`. | None expected. | Smoke output or screenshot folder. | None. |
| Active-admin browser QA | Pending | Command output for `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`. | None expected. | Screenshot folder if generated. | None. |
| Dashboard orientation | Pending | Recommended next action, website status counts, and Content health queue checked. | None expected. | Dashboard screenshot. | Note any confusing copy. |
| Settings account handoff | Pending | People and access, Invite and grant access, Grant existing login, and role guide checked. | Invite only if separately approved. | Settings screenshot. | Mark invite proof deferred if not approved. |
| Media readiness | Pending | Media actions and publish checklist checked on one existing item. | Reversible save only if approved. | Media screenshot. | Note blocked checklist item. |
| Projects publish path | Pending | Project actions, proof-review labels, blocker guidance, and Open public page checked. | Reversible save/publish only if approved. | Public project URL if published. | Note blocker or deferral. |
| Stone Library publish path | Pending | Stone family actions, Variant actions, Needs confirmation guidance, and finish-image media guidance checked. | Reversible save/publish only if approved. | Public stone URL if published. | Note blocker or deferral. |
| Products publish path | Pending | Product actions, Model actions, material feedback, and media selector status checked. | Reversible save/publish only if approved. | Public product URL if published. | Note blocker or deferral. |
| Articles publish path | Pending | Article actions, Section actions, section forms, and Open public page checked. | Reversible save/publish only if approved. | Public article URL if published. | Note blocker or deferral. |
| Leads workflow | Pending | Lead workflow status, Recommended next step, actions, and export explanation checked. | Reversible workflow note only if approved. | Leads screenshot. | Note write/export deferral. |
| Change history | Pending | Recent saves/exports/invites/publish/archive entries checked. | None expected. | Change history screenshot. | Note any unclear action label. |
| Final editor handoff | Pending | `docs/ADMIN_EDITOR_GUIDE.md` matched the deployed interface. | Docs update only if mismatch found. | Handoff guide section reference. | List remaining customer-facing gaps. |

Result values:
- Pass: production evidence proves the area is ready.
- Deferred: Jay explicitly chose not to run a live write, invite, or publish path during this walkthrough.
- Fail: the deployed CMS does not match the guide or a non-technical editor would be blocked.

## Handoff Evidence Matrix

Use this matrix before claiming the CMS handoff goal is complete.

| Requirement | Current Evidence | Final Proof Still Needed |
|---|---|---|
| Editor can log in and know where to start. | Source UX has Dashboard Recommended next action, What the website can show now, Content health queue, and Quick Start For Editors. Local no-config gate passes for all admin routes. | Current CMS UX stack must be deployed, then active-admin browser QA and Dashboard walkthrough must pass on `https://urblo.com.au`. |
| Draft / Published / Archived is clear. | Shared CMS status language, module status summaries, and editor guide status rules are source-guarded. | Production walkthrough must confirm the deployed module screens show the same status language. |
| Publish readiness is visible before Publish. | Projects, Stone Library, Products, Articles, and Media have source-guarded publish checklists, action bars, and first repair guidance. | Production walkthrough must confirm at least one Stone Library path and one Article path, plus representative content module blockers, against real imported Draft items. |
| Editors can find, filter, save, publish, archive, and confirm public pages. | Module list/search/status filters, action bars, and Open public page controls are source-guarded; local runtime gates passed. | Deployed walkthrough must use the visible module controls and record any saved/published/archived items or explicit deferrals. |
| Technical terms are hidden from editor tasks. | Harness rejects old backend login, profile, proof-status, structured-data, raw media ID, and activity-log wording in the editor guide and coverage checks. | Production walkthrough must record any copy that still feels technical. |
| Account handoff works. | Settings has People and access, Invite and grant access, Grant existing login, role guide, and server-side invite Function source. | The current stack must be deployed; live invite proof must pass or Settings invite must stay marked unavailable for customer use. |
| CMS coverage and fallback boundary are explained. | Customer Handoff Summary and Public Website Fallbacks document CMS coverage, imported Draft items, Published-only public content, and static fallback. | Production walkthrough must confirm the guide matches deployed behavior before editor handoff. |

## Current CMS UX Stack Scope
The deployment approval for this stack covers:
- Dashboard orientation: Recommended next action, Draft / Published / Archived status counts, focused Content health queue, and All clear checks.
- Projects editor: search/status filtering, publish blockers, Project actions, proof-review language, and public-page confirmation.
- Media editor: Media actions, publish checklist, public/private library language, and readable media item labels.
- Stone Library editor: Stone family actions, Variant actions, Needs confirmation language, finish-image Media library guidance, and publish readiness.
- Products editor: Product actions, Model actions, product/model publish checklists, media selectors, and Stone Library status feedback.
- Articles editor: Article actions, Section actions, Article sections forms, media selectors, and article publish checklist.
- Leads workflow: Lead workflow status, Recommended next step, Lead workflow actions, filtered visible-queue export, and Change history language.
- Settings handoff: Website settings status, Site settings actions, CMS access handoff actions, Invite and grant access, Grant existing login, and role guide language.
- Handoff docs: `docs/ADMIN_EDITOR_GUIDE.md`, this production walkthrough, and verification-matrix guardrails.

This deployment approval does not cover:
- Final Turnstile proof.
- Destructive delete controls.
- Publishing all imported Draft content in bulk.
- Removing static fallback behavior.
- Sending real Settings invite emails unless Jay separately approves live invite proof.

## Walkthrough Steps

### 1. Admin Login And Orientation
1. Open `https://urblo.com.au/admin`.
2. Sign in with an approved active admin account.
3. Confirm Dashboard appears.
4. Confirm Dashboard shows Recommended next action.
5. Confirm What the website can show now distinguishes Draft, Published, and Archived.
6. Confirm Content health queue shows only items needing attention, with clear checks under All clear checks.

Pass condition: a non-technical editor can tell where to start without knowing table names, RLS, or Supabase.

### 2. Settings Account Handoff
1. Open Settings.
2. Confirm Website settings status explains whether global settings are Live settings, Draft settings, or Hidden.
3. Confirm Site settings actions appears beside the Draft / Published / Archived settings meaning.
4. Confirm CMS access handoff actions appears in People and access.
5. Confirm Invite and grant access explains the new-editor path.
6. Confirm Grant existing login explains the setup-code fallback path.
7. Confirm roles are Website owner, CMS manager, Editor, and Viewer.
8. If Jay approves a live invite proof, send a tagged invite to a controlled test address and verify Change history records it.

Pass condition: a CMS manager can explain how to give someone access without mentioning backend login or profile setup terms.

### 3. Media Readiness
1. Open Media.
2. Search or filter the library.
3. Select an existing media item.
4. Confirm Media actions appears beside the publish checklist.
5. Confirm Draft, Published, and Archived visibility language is clear.
6. Confirm Publish is locked until source, public location, alt text, and usage notes are ready.

Pass condition: an editor can tell whether a media item can be reused on public CMS-backed pages.

### 4. Projects Publish Path
1. Open Projects.
2. Search/filter by status and choose an imported Draft project.
3. Confirm Project actions appears beside the Publish checklist.
4. Confirm blockers name the exact missing field or review decision.
5. Confirm proof review wording uses Needs review, Approved for public use, and Deferred / keep private.
6. Save a reversible note or status-only change if approved.
7. If publishing is approved, publish only after the checklist is clear, then use Open public page to check the public route.

Pass condition: an editor can fix a Publish blocker by following proof-review labels and checklist guidance.

### 5. Stone Library Publish Path
1. Open Stone Library.
2. Search/filter by status and choose an imported Draft or Needs confirmation family.
3. Confirm Stone family actions appears beside the family publish checklist.
4. Confirm Variant actions appears in the variant editor.
5. Confirm Needs confirmation is explained as private/not public-ready until the checklist is clear.
6. Confirm selected finish imagery points to Media library items and warns when chosen media is not Published in Media.
7. If publishing is approved, publish a controlled family/variant path and use Open public page to check the public route.

Pass condition: an editor can understand family, variant, finish availability, and finish-image readiness without raw media IDs.

### 6. Products Publish Path
1. Open Products.
2. Search/filter by status and choose an imported Draft product.
3. Confirm Product actions appears beside the product publish checklist.
4. Confirm Model actions appears beside the model publish checklist.
5. Confirm material defaults show Stone Library status feedback.
6. Confirm media selectors show readable Media library item names and Published in Media state.

Pass condition: an editor can tell why a product or model is not ready to appear on the website.

### 7. Articles Publish Path
1. Open Articles.
2. Search/filter by status and choose an imported Draft article.
3. Confirm Article actions appears beside the article publish checklist.
4. Confirm Section actions appears in Article sections.
5. Confirm block forms use editor-facing fields instead of raw imported markup or structured-data internals as the normal editing task.
6. If publishing is approved, publish a controlled article/section path and use Open public page to check the public route.

Pass condition: an editor can publish article metadata and section content without touching structured data internals.

### 8. Leads Workflow
1. Open Leads.
2. Search/filter the visible queue by type and status.
3. Select a lead.
4. Confirm Lead workflow status explains whether the lead needs an owner, needs notes, is ready to save, is handled, or is no longer active.
5. Confirm Recommended next step appears.
6. Confirm Lead workflow actions appears beside status, assigned owner, and internal notes.
7. Save a reversible internal note/status update only if Jay approves live workflow writes.
8. Confirm Export visible queue explains that only current filters are exported and Change history is recorded.

Pass condition: a CMS manager can triage leads and explain what will be exported.

### 9. Change History
1. Open Change history.
2. Filter by recent admin actions if needed.
3. Confirm saves, exports, invites, publish, and archive actions are understandable to Website owner / CMS manager users.

Pass condition: a manager can audit what changed from Change history without reading backend storage.

## Final Handoff Decision
The CMS can be handed to non-technical editors only when all are true:
- The current CMS UX stack is deployed to production.
- Active-admin browser QA passes on `https://urblo.com.au`.
- The walkthrough above passes with production evidence.
- Settings invite/access has either passed live invite proof or is clearly marked as not yet available for customer use.
- At least one Stone Library publish path and one Article publish path have been checked against public pages, or Jay has explicitly deferred those publish walkthroughs.
- `docs/ADMIN_EDITOR_GUIDE.md` matches the deployed production interface.
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict` passes.
