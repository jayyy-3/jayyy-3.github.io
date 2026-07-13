# Urblo Admin Production Walkthrough

Last updated: 2026-07-13

## Purpose
Use this checklist after the admin reliability stack is pushed and deployed. The 2026-07-13 incident invalidated the earlier handoff conclusion. This walkthrough must prove real editor outcomes, not route shells, source wording, or direct API mutations.

Do not use this checklist to create unreviewed public customer content. Prefer existing imported Draft items, reversible status changes, and clearly tagged QA notes.

## Preconditions
- Current local CMS UX stack is pushed and deployed to `https://urblo.com.au`.
- `npm run agent:admin-cms-predeploy`, `npm run agent:smoke`, and `npm run agent:admin-config-gate` passed before deployment; the expanded predeploy sequence is listed below.
- Production active-admin browser QA can run:
  - `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`
- The walkthrough user has Website owner or CMS manager access when testing Settings, Leads export, Change history, and private-to-public Media promotion. A separate active Editor login is available for the Storage role-boundary proof.
- `20260713065628_media_public_bucket_role_hardening.sql` has been applied to production and its migration history/policy definitions can be read back before the CMS handoff audit.
- Supabase Auth custom SMTP is configured for non-team recipient addresses, and exact production invite/recovery account-setup URLs are in the Auth Redirect URL allowlist.
- Jay has approved the tagged reversible content/settings/media writes and the controlled invite/recovery recipient used by this walkthrough.
- Keep `docs/CLOUDFLARE_DEPLOYMENT.md` rollback values intact.

## Deploy Sequence
Use this order after Jay approves push/deploy for the current CMS UX stack:

1. Rerun the local pre-deploy gates:
   - `npm run agent:admin-cms-predeploy`
   - `npm run agent:smoke`
   - `npm run agent:admin-config-gate`

   The predeploy command above runs the non-preview local gates below:
   - `npm run agent:admin-crud-coverage`
   - `npm run build`
   - `npm run lint`
   - `npx tsc -b`
   - `npm run agent:supabase-foundation-readiness`
   - `npm run agent:admin-media-role-boundary-live` in plan-only/no-network mode
   - `npm run agent:public-supabase-readiness`
   - `npm run agent:public-content-overlay`
   - `npm run agent:cloudflare-readiness`
   - `npm run agent:check`
   - `git diff --check`
   - `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au` in report-only mode. Missing live evidence is reported without failing predeploy; malformed source or documentation still fails.
2. After separate approval for the production migration and tagged Storage writes, apply `20260713065628_media_public_bucket_role_hardening.sql`, read back the applied migration/policies, and run:
   - `npm run agent:admin-media-role-boundary-live -- --allow-writes --strict`

   The role-boundary proof must show Editor private insert/update succeeds, Editor public insert/update is rejected, owner/admin public insert/update succeeds, and every tagged object is removed. The source-only foundation gate is not a substitute for this live proof.
3. Push the approved CMS UX stack and wait for the Cloudflare Pages deployment to finish.
4. Record the Cloudflare deployment identifier or commit in `docs/WORKLOG.md`.
5. Run the no-write deployed smoke:
   - `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au --reference-url https://<8-hex-deployment>.urblo.pages.dev`
6. Run active-admin browser QA when the required browser-safe key and admin login inputs are present:
   - `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`
7. Run the module walkthrough steps below and record results in `docs/WORKLOG.md`.
8. Run the final handoff readiness audit:
   - `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict`
9. Only after the walkthrough and strict readiness audit pass, update `docs/HANDOFF.md` and `docs/NEXT_STEPS.md` to say the CMS is production-handoff ready.

## Evidence To Record
Record each result in `docs/WORKLOG.md`:
- Deployment identifier or commit shown by Cloudflare Pages.
- Admin login route and account role used.
- Whether each module showed the expected editor-facing action language.
- Any saved items, publish/archive changes, or invite attempts.
- Before/after values proving a browser save survived refresh.
- Applied-migration readback plus tagged paths proving Editor private insert/update success, Editor public insert/update denial, owner/admin public insert/update success, and cleanup.
- Storage source/destination object paths proving private Media promotion created a real public object before publication.
- Public URL checked after publish.
- Screenshots location if browser tooling creates screenshots.
- Any residual editor confusion or copy that still feels technical.

For the final machine gate, one WORKLOG section must contain this exact heading, the deployed commit, the unique Cloudflare deployment URL, the required production prerequisite, and all twelve workflow keys. Replace each Pending only after the live outcome and its evidence reference exist.

```md
### Admin CMS Golden Workflow Evidence

Deployment SHA: `<deployed-commit-sha>`
Deployment URL: `https://<deployment>.urblo.pages.dev`

| Production prerequisite key | Result | Evidence refs |
|---|---|---|
| mediaPublicBucketRoleBoundary | Pending | Applied migration/policy readback plus Editor private success/public denial and owner/admin public success. |

| Workflow key | Result | Evidence refs |
|---|---|---|
| authenticatedSignIn | Pending | Screenshot or dated browser log. |
| draftSaveRefresh | Pending | Before, saved, refreshed readback. |
| privateMediaPublish | Pending | Owner/admin private object, automatic public copy, row, working URL. |
| publishedPublicReadback | Pending | Admin publish plus matching public page. |
| archivePublicReadback | Pending | Admin archive plus documented public result. |
| settingsPublicReadback | Pending | Settings save plus matching public footer/meta result. |
| inviteSetPassword | Pending | Delivered invite, setup, logout, password login. |
| passwordRecovery | Pending | Delivered recovery, old-password failure, new-password login. |
| responsiveAdminNavigation | Pending | Mobile, 1116px, and wide desktop browser evidence. |
| projectsTaskWorkspace | Pending | Stable record URL, task stages, dirty guard, blocker jump, media search, refresh readback. |
| dashboardOperationalQueue | Pending | Real next action, leads/blockers/failures/activity queue evidence. |
| editorGuideUsability | Pending | Non-technical editor completes the guided path without technical assistance. |
```

The corresponding `docs/agent/admin-handoff-evidence.json` references must be Git-tracked repo-relative regular evidence files or `https://` URLs on the exact immutable deployment origin; ignored/untracked `.tmp` artifacts cannot satisfy strict handoff. Every prerequisite and workflow JSON reference must appear in its matching Pass row inside this one section. Its `deploymentSha` must resolve to a commit in the local Git repository, `verifiedAt` and `expiresAt` must fall within one seven-day window, and `deploymentUrl` must be the immutable `https://<deployment>.urblo.pages.dev` URL rather than the moving production alias.

## Results Template

Copy this table into `docs/WORKLOG.md` after the production walkthrough and fill it before claiming handoff readiness.

| Area | Result | Evidence | Changes Made | Public URL / Screenshot | Follow-up |
|---|---|---|---|---|---|
| Deployment | Pending | Cloudflare deployment id or commit. | None expected. | Production origin checked. | None. |
| Deployed smoke | Pending | Command output for `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au --reference-url https://<8-hex-deployment>.urblo.pages.dev`. | None expected. | Smoke output or screenshot folder. | None. |
| Active-admin browser QA | Pending | Command output for `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`. | None expected. | Screenshot folder if generated. | None. |
| Media Storage role boundary | Pending | Applied migration/policy readback and `npm run agent:admin-media-role-boundary-live -- --allow-writes --strict`. | Tagged private/public Storage objects, removed before completion. | Dated command evidence. | Record retained paths if cleanup is uncertain. |
| Draft save and refresh | Pending | Browser before/after value plus refreshed readback on one tagged Draft. | Reversible tagged Draft edit. | Editor screenshot. | Restore or retain tagged note. |
| Private Media publish | Pending | Private upload, automatic public Storage copy, Published row, and working public URL. | Tagged media upload/publish. | Media and public URL screenshots. | Archive metadata; retain audit evidence. |
| Settings public readback | Pending | Safe Published setting changed through UI and matching public footer/meta result. | Reversible tagged setting change. | Settings and public screenshots. | Restore original value. |
| Invite and password setup | Pending | Delivered Auth invite, account setup, logout, and password login. | Approved controlled editor account. | Account-setup/login screenshots. | Keep or deactivate by approved policy. |
| Password recovery | Pending | Delivered Auth recovery email; old password fails and new password succeeds. | Approved controlled editor account. | Recovery/login evidence. | None. |
| Dashboard operational queue | Pending | Recommended next action plus real leads, blockers, failed operations, and recent activity checked. | None expected. | Dashboard screenshot. | Note any confusing or non-operational copy. |
| Responsive admin navigation | Pending | Browser evidence at mobile, exactly 1116px, and wide desktop widths. | None expected. | Three screenshots or dated browser log. | Record clipping or undiscoverable actions. |
| Settings account handoff | Pending | People and access, Invite and grant access, Grant existing login, and role guide checked. | Invite only if separately approved. | Settings screenshot. | Mark invite proof deferred if not approved. |
| Media readiness | Pending | Media actions and publish checklist checked on one existing item. | Reversible save only if approved. | Media screenshot. | Note blocked checklist item. |
| Projects task workspace | Pending | Stable record URL, task stages, Overview dirty guard, blocker jump, searchable media, save/refresh readback, and Project actions checked. | Reversible tagged Draft edit. | Project editor and public URL if published. | Note child-editor guard, pagination, or preview gaps. |
| Stone Library publish path | Pending | Stone family actions, Variant actions, Needs confirmation guidance, and finish-image media guidance checked. | Reversible save/publish only if approved. | Public stone URL if published. | Note blocker or deferral. |
| Products publish path | Pending | Product actions, Model actions, material feedback, and media selector status checked. | Reversible save/publish only if approved. | Public product URL if published. | Note blocker or deferral. |
| Articles publish path | Pending | Article actions, Section actions, section forms, and Open public page checked. | Reversible save/publish only if approved. | Public article URL if published. | Note blocker or deferral. |
| Leads workflow | Pending | Lead workflow status, Recommended next step, actions, and export explanation checked. | Reversible workflow note only if approved. | Leads screenshot. | Note write/export deferral. |
| Change history | Pending | Recent saves/exports/invites/publish/archive entries checked. | None expected. | Change history screenshot. | Note any unclear action label. |
| Editor-guide usability | Pending | A non-technical editor used `docs/ADMIN_EDITOR_GUIDE.md` to complete the agreed path without technical assistance. | Docs update only if mismatch found. | Handoff guide section plus browser evidence. | List every point needing verbal help. |

Result values:
- Pass: production evidence proves the area is ready.
- Deferred: Jay explicitly chose not to run a live action. Deferred is a blocker for final handoff, not a passing result.
- Fail: the deployed CMS does not match the guide or a non-technical editor would be blocked.

## Handoff Evidence Matrix

Use this matrix before claiming the CMS handoff goal is complete.

| Requirement | Current Evidence | Final Proof Still Needed |
|---|---|---|
| Editor can log in and know where to start. | Source UX has Dashboard Recommended next action, What the website can show now, Content health queue, and Quick Start For Editors. Local no-config gate passes for all admin routes. | Current CMS UX stack must be deployed, then active-admin browser QA and the real Dashboard operational-queue walkthrough must pass on `https://urblo.com.au`. |
| Navigation works at required widths. | Source shell has route-lazy modules plus responsive navigation/header repairs. | Browser evidence must pass at mobile, exactly 1116px, and wide desktop widths with no clipped or undiscoverable routes/actions. |
| Projects supports one safe task at a time. | Source has stable record URLs, task workspaces, Overview dirty guards, blocker jumps, and searchable media. | One deployed browser workflow must prove record refresh, task switching, dirty protection, blocker targeting, media search, save, and refresh readback. |
| Draft / Published / Archived is clear. | Shared CMS status language, module status summaries, and editor guide status rules are source-guarded. | Production walkthrough must confirm the deployed module screens show the same status language. |
| Publish readiness is visible before Publish. | Projects, Stone Library, Products, Articles, and Media have source-guarded publish checklists, action bars, and first repair guidance. | Production walkthrough must confirm at least one Stone Library path and one Article path, plus representative content module blockers, against real imported Draft items. |
| Editors can find, filter, save, publish, archive, and confirm public pages. | Module list/search/status filters, action bars, and Open public page controls are source-guarded; local runtime gates passed. | Deployed walkthrough must use the visible module controls and record any saved/published/archived items or explicit deferrals. |
| Media publication is enforced by role, not only UI controls. | Pending migration source keeps Editor writes in the private bucket and owner/admin writes in the public bucket. | Apply/read back the migration, then live-prove Editor private insert/update success, Editor public insert/update denial, and owner/admin public insert/update success before handoff. |
| Technical terms are hidden from editor tasks. | Harness rejects old backend login, profile, proof-status, structured-data, raw media ID, and activity-log wording in the editor guide and coverage checks. | Production walkthrough must record any copy that still feels technical. |
| Account handoff works. | Settings has People and access, Invite and grant access, Grant existing login, role guide, and server-side invite Function source. | The current stack must be deployed and live invite/setup/login/recovery proof must pass; unavailable or deferred account setup blocks editor handoff. |
| CMS coverage and fallback boundary are explained. | Customer Handoff Summary and Public Website Fallbacks document CMS coverage, imported Draft items, Published-only public content, and static fallback. | Production walkthrough must confirm the guide matches deployed behavior before editor handoff. |
| The editor guide works without technical translation. | The guide documents the target daily path, safety boundary, account flow, module coverage, and escalation path. | A non-technical editor must complete the agreed deployed path from the guide without verbal technical assistance, and every mismatch must be recorded. |

## Current CMS UX Stack Scope
The deployment approval for this stack covers:
- Dashboard operational queue: Recommended next action driven by real work, Draft / Published / Archived status counts, focused Content health queue, failed-operation visibility, recent activity, and All clear checks.
- Projects editor: stable record URLs, task workspaces, Overview dirty guard, search/status filtering, searchable media, publish-blocker jumps, Project actions, proof-review language, and public-page confirmation.
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
7. Confirm real new leads, publish blockers, failed operations, and recent editor activity determine the operational queue and Recommended next action; record the visible empty state when a category has no current item.

Pass condition: a non-technical editor can identify the next real operational task without knowing table names, RLS, or Supabase.

### 2. Settings Account Handoff
1. Open Settings.
2. Confirm Website settings status explains whether global settings are Live settings, Draft settings, or Hidden.
3. Confirm Site settings actions appears beside the Draft / Published / Archived settings meaning.
4. Confirm CMS access handoff actions appears in People and access.
5. Confirm Invite and grant access explains the new-editor path.
6. Confirm Grant existing login explains the setup-code fallback path.
7. Confirm roles are Website owner, CMS manager, Editor, and Viewer.
8. If Jay approves a live invite proof, send a tagged invite to a controlled test address and verify Change history records it.
9. Open the delivered invite in a clean browser, choose a password on `/admin/account-setup`, sign out, then sign back in with that password.
10. Request password recovery, set a second password, verify the old password fails and the new password succeeds.

Pass condition: a CMS manager can explain how to give someone access without mentioning backend login or profile setup terms.

### 3. Media Readiness
1. Open Media.
2. Search or filter the library.
3. Select an existing media item.
4. Confirm Media actions appears beside the publish checklist.
5. Confirm Draft, Published, and Archived visibility language is clear.
6. Confirm Publish is locked until source, public location, alt text, and usage notes are ready.
7. As a Website owner or CMS manager, upload one controlled private Draft, add the required metadata, use Copy & publish, and verify the public Storage URL loads before the item is treated as passed.
8. Separately, use the approved Editor and owner/admin test accounts to run the role-boundary verifier. Confirm the Editor can insert/update the private bucket, cannot insert/update the public bucket directly, the owner/admin can insert/update the public bucket, and tagged objects are cleaned up.

Pass condition: an editor can tell whether a media item can be reused on public CMS-backed pages.

### 4. Projects Task Workspace And Publish Path
1. Open Projects.
2. Search/filter by status and choose an imported Draft project.
3. Copy the selected `/admin/projects/:projectId` URL, refresh it, and confirm the same Project remains selected.
4. Move through Overview, Facts, Materials, Media, and Maps; confirm only one task workspace is the primary editing stage at a time.
5. Change one safe Overview field, attempt to switch task and Project, and confirm the unsaved-change warning prevents accidental loss. Save, refresh, and confirm the value persists.
6. Confirm Project actions appears beside the Publish checklist.
7. Select the first blocker and confirm it opens the relevant Overview, Facts, or Materials task and highlights the repair target.
8. Search the Media library selector by a readable label or URL fragment and confirm the intended item can be selected without scanning the full list.
9. Confirm proof review wording uses Needs review, Approved for public use, and Deferred / keep private.
10. If publishing is approved, publish only after the checklist is clear, then use Open public page to check the public route.

Pass condition: an editor can return to a stable record, make and verify a safe edit, avoid accidental loss, find media, and fix a Publish blocker through the task workspace.

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

### 10. Admin Navigation Widths
1. At a representative mobile width such as 390px, confirm the menu or drawer exposes every permitted module, the current page is identifiable, and account/sign-out actions remain discoverable.
2. At exactly 1116px, confirm the header, navigation, account identity, and primary page actions wrap or reflow without clipping or horizontal page overflow.
3. At a wide desktop width such as 1440px, confirm the same navigation and actions remain visible without excessive empty navigation states.
4. Open Dashboard, Projects, Media, and Settings at each width and confirm route-level loading does not strand the editor on a blank or inaccessible screen.

Pass condition: permitted routes and primary actions are discoverable, readable, and unclipped at mobile, 1116px, and wide desktop widths.

### 11. Editor Guide Usability
1. Give a non-technical editor `docs/ADMIN_EDITOR_GUIDE.md` and only the approved account credentials; do not explain the interface verbally.
2. Ask them to identify where to start, find one Draft Project, make the approved safe change, save and refresh it, locate the first publish blocker, and explain how they would confirm a public result.
3. Ask them to identify where teammate invitation, password recovery, Media publication, and support escalation live.
4. Record every place where the guide differs from production or verbal help is required.

Pass condition: the editor completes the agreed path and explains the safe save/publish boundary from the guide without technical assistance.

## Final Handoff Decision
The CMS can be handed to non-technical editors only when all are true:
- The current CMS UX stack is deployed to production.
- `20260713065628_media_public_bucket_role_hardening.sql` is applied/read back and `mediaPublicBucketRoleBoundary` has passed with live Editor/owner evidence.
- Active-admin browser QA passes on `https://urblo.com.au`.
- The walkthrough above passes with production evidence.
- Draft save/refresh, private Media promotion, Published public readback, archive behavior, and Settings public readback have all passed through the deployed UI.
- Settings invite/password setup and password recovery have passed through delivered Supabase Auth email; deferral is not a handoff pass.
- Responsive admin navigation has passed at mobile, exactly 1116px, and wide desktop widths.
- The Projects stable-record/task-workspace/dirty-guard/blocker-jump/search/save-refresh workflow has passed through the deployed UI.
- Dashboard operational queue evidence and non-technical editor-guide usability evidence have passed.
- At least one representative content publish path has been checked against its public page, and every required workflow in `docs/agent/admin-handoff-evidence.json` is `passed` with an evidence reference.
- `docs/ADMIN_EDITOR_GUIDE.md` matches the deployed production interface.
- `docs/agent/admin-handoff-evidence.json` records the production deployment SHA, immutable Cloudflare deployment URL, admin identity, and a `verifiedAt` / `expiresAt` window no longer than seven days.
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict` passes.
