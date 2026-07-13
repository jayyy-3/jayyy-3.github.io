# Urblo Admin Editor Guide

Last updated: 2026-07-13

## Admin Address

- Production admin: `https://urblo.com.au/admin`
- Login page: `https://urblo.com.au/admin/login`

Use the admin only with an approved Urblo login account. If a signed-in user does not have an active CMS role, the admin shows the unauthorized screen instead of private content.

## Customer Handoff Summary

Current warning: this guide is the target operating flow, not proof that production is handoff-ready. Jay reported the production admin as not working on 2026-07-13, and the strengthened evidence gate remains `revalidation_required` until the fixed deployment completes every golden workflow in `docs/agent/admin-handoff-evidence.json`.

Give an editor the production admin address, their invited login email, and the lowest role they need. Most content-only users should be Editor; people who manage accounts, leads, exports, or global site settings should be CMS manager.

Daily editing starts on Dashboard. Editors follow Recommended next action, open the relevant module, search/filter by status, edit the selected item, and use the visible actions bar to save. They should publish only when the on-screen checklist is clear, then use Open public page to confirm the live route.

The CMS currently covers Projects, Stone Library, Products, Articles, Media, Leads, Settings, and Change history. Imported Projects, Stone Library, Products, Articles, and Media candidates are already in the CMS as Draft items; they stay hidden until reviewed and Published.

Public pages read Published CMS content where the public adapter is active, with static fallback still kept for safety. Draft and Archived content does not appear publicly.

## Quick Start For Editors

1. Sign in at `https://urblo.com.au/admin`.
2. Start with Dashboard Recommended next action.
3. Use the module list/search/status filters to find the item you need.
4. Edit the item, then use the visible actions bar to Save.
5. Check the publish checklist before changing anything to Published.
6. Use Open public page after publishing to confirm what the website shows.
7. Ask a CMS manager when Settings, Leads export, account access, or Change history is needed.

Most day-to-day editing should not require Supabase, code, table names, or developer help.

## One-Page Editor Handoff

Use this short version when handing the CMS to a new non-technical editor:

1. Admin address: `https://urblo.com.au/admin`.
2. Account setup: a Website owner or CMS manager invites the editor from Settings, People and access, using the lowest useful role.
3. Start screen: Dashboard shows Recommended next action, What the website can show now, and the Content health queue.
4. Find content: open the relevant module, then use search and status filters before selecting an item.
5. Edit safely: Draft is the safe workspace. Use the visible actions bar to Save.
6. Publish carefully: Published can appear on the public website. Publish only when the checklist is clear.
7. Confirm live content: after publishing, use Open public page to check the website route.
8. Hide content: Archive hides an item without deleting it.
9. CMS coverage: Projects, Stone Library, Products, Articles, Media, Leads, Settings, and Change history are in the CMS.
10. Imported content: Projects, Stone Library, Products, Articles, and Media candidates are already in the CMS as Draft items.
11. Static fallback: Draft and Archived CMS versions remain hidden, but a matching legacy static page can stay visible during migration until CMS-only cutover is approved.
12. Escalate: ask a CMS manager for account access, Leads export, Settings, Change history, or any Publish blocker that the checklist does not explain.

## First Handoff Walkthrough

Use this flow when giving a new editor their first CMS session:

1. Sign in together at `https://urblo.com.au/admin`.
2. On Dashboard, point out Recommended next action and What the website can show now.
3. Open one content module, usually Projects or Articles.
4. Filter to Draft so the editor sees content that is safe to review.
5. Select one imported Draft item and show the Website publish status or Article website status.
6. Make a small reversible edit, then use the visible actions bar to Save.
7. Try Publish only to read the checklist. If Publish is locked, use the named first repair item instead of guessing.
8. If the checklist is clear and publishing is approved, publish one controlled item and use Open public page to confirm the website route.
9. Explain that Draft and Archived CMS versions stay hidden, Published can appear publicly, and a matching legacy static page may still remain during migration.
10. Finish in Settings only if the editor also needs to understand account handoff; otherwise leave Settings to CMS managers.

Pass condition: the editor can explain where they start, how they know whether content is live, where Save/Publish lives, and what to do when Publish is locked.

## Roles

| Role | What It Can Do |
|---|---|
| Website owner | Full CMS control, including website settings and team access. |
| CMS manager | Manage settings, team access, content, media, leads, and publishing. |
| Editor | Edit and currently publish general content plus already-public/external media. Private-upload promotion needs a Website owner or CMS manager because safe rollback requires Storage delete permission. Editors cannot manage settings, delete Storage objects, or export leads. A separate enforced review-only publishing role does not exist yet. |
| Viewer | Inspect CMS content without saving changes. |

## Account Setup

First-admin bootstrap is already complete for `info@urblo.com.au`.

For additional people:
1. Open `/admin/settings`.
2. In `CMS team` / `People and access`, use Invite and grant access for a new CMS user.
3. Enter their email, optional display name, and the lowest suitable role, then send the invite.
4. Ask them to accept the invite email, land on `/admin/account-setup`, and choose a password.
5. Ask them to sign out, then sign back in at `/admin` with that password before treating access as complete.
6. Use Grant existing login only when the person already has a login account and you have the setup code.

The invite flow uses a secure server endpoint and adds the access change to Change history. It also needs Supabase Auth custom SMTP and exact invite/recovery Redirect URL entries; the Contact form SMTP2GO proof does not prove Auth email delivery. The repaired flow still needs deployment and approved live invite/recovery proof before production editors rely on it.

`Active access` controls whether an existing person may enter the CMS. Turning it off should be treated as an access decision, not as deleting the person's login or history.

## Status Rules

| Status | Meaning | Public Website |
|---|---|---|
| Draft | Work in progress or imported content waiting for review. | Never public. |
| Published | Approved content. | Can appear publicly where the public route reads CMS content. |
| Archived | Hidden but retained. | Never public. |
| Needs confirmation | Stone Library confirmation state. | Treat as not public-ready unless the editor deliberately publishes an item that can carry this state. |

Only Published items can appear on the public site. Imported production content is intentionally draft/review-only until an editor publishes it.

## Editing Flow

1. Start on `/admin`.
2. Check the Dashboard Recommended next action, content status counts, and the Content health queue.
3. Open the relevant module from the Content library or Work queue.
4. Search/filter the list by status before choosing an item.
5. Open the item, edit fields, and use the module's actions bar to save.
6. Review readiness guidance or publish blockers.
7. Publish only when the item is ready for the public site.
8. Use the editor header's Open public page control to confirm the live route after publishing. Draft and Archived CMS versions keep that control disabled; check the public route separately when a legacy fallback may exist.
9. Archive content to hide the CMS version without deleting it, then confirm whether the documented migration fallback remains visible.

Physical delete is not part of the launch CMS workflow.

## Where Editors Start

Dashboard is the first screen after login. Use it in this order:

1. Follow Recommended next action when it points to new leads, publish blockers, or hidden draft content.
2. Use What the website can show now to see how many items are Draft, Published, or Archived.
3. Use Content health queue for items that need attention before they are safe to publish.
4. Use All clear checks as reassurance, not as the next editing job.

If a module has a long editor, use its actions bar rather than hunting for a button at the bottom:
- Project actions, Stone family actions, Variant actions, Product actions, Model actions, Article actions, Section actions, Media actions, Site settings actions, and Lead workflow actions keep the relevant Save / Publish / Archive / workflow controls beside the checklist or next-step guidance.
- When Publish is locked, fix the named checklist item first, then save or publish again.

## Module Notes

| Module | Use It For | Current CMS State |
|---|---|---|
| Dashboard | Choose the next editing job, inspect live/draft counts, and open health-queue fixes. | Editor start page with Recommended next action, content status counts, focused attention queue, and correct Stone Library status routing. |
| Projects | Edit case studies, facts, materials, images, maps, and hotspots. | First task-oriented source repair is implemented: stable record URLs, Overview/Facts/Materials/Media/Maps workspaces, all-editor unsaved-change warnings, isolated child saves, blocker jumps, and searchable media. Pagination, preview, and deployed editor proof remain open. |
| Stone Library | Edit stone families, variants, finish availability, and finish imagery. | CMS-ready with Needs confirmation language, family/variant publish checklists, Stone family actions, Variant actions, Finish image public status, and finish-image media guidance; public listing and detail prefer Published CMS items with static fallback. |
| Products | Edit product families, models, images, search title/description, materials, and specs. | CMS-ready with Product website status, Model publish status, Website URL key / Model website key labels, media selectors, product/model publish checklists, Product actions, Model actions, and Stone Library link feedback. |
| Articles | Edit article metadata, search title/description, and Article sections through section-type forms. | CMS-ready for metadata and section content with Article website status, Section publish status, Article actions, and Section actions; public detail prefers Published article sections and keeps sanitized original import HTML as fallback. |
| Media | Upload/manage media, metadata, status, and manifest export. | Source repair now loads the full current library, preserves External media creation, and sends every initial file upload to the private library. Website owners/CMS managers can copy the selected record's original private path/version to public Storage with create-only/reference-safe safeguards; deployed write proof remains required. |
| Leads | Triage enquiries and sample requests, follow recommended next steps, assign owners, add internal notes, and export the current filtered queue with change history. | Workflow-ready for CMS managers with Lead workflow status, Lead workflow actions beside the recommended next step, owner/notes handoff guidance, and filtered visible-queue export. |
| Settings | Edit global contact/footer details, homepage search metadata, the default share image, and CMS access. | Published values now use the public website's validation rules and refresh when an editor returns from Admin; deployed public readback, Auth SMTP, redirect allowlist, and live invite/recovery proof remain required. |
| Change history | Inspect saved changes, exports, publish/archive actions, and sensitive operations. | Read-only visibility for Website owner and CMS manager roles. |

## Account Handoff Flow

Use `/admin/settings` when giving someone access:

1. Open Settings, then People and access.
2. Read CMS access handoff actions.
3. For a new editor, use Invite and grant access.
4. For someone who already has a login, use Grant existing login and paste their Login setup code.
5. Choose the lowest useful role. Most content-only users should be Editor.
6. Keep at least one Website owner active.

Website settings status tells editors whether the current settings are Live settings, Draft settings, or Hidden. Site settings actions change site-wide contact/footer details, homepage-only title and description, and the default share image. CMS access handoff actions only change who can use the CMS. Invalid email, social-link, homepage-metadata, share-image, or footer destinations must be fixed before Published settings can save.

## Public Website Fallbacks

The public site currently behaves as follows:

- Projects list/detail: Published CMS projects overlay matching static projects by URL key; matching projects keep their existing static sector/category and static-only material/CTA display fields until the public CMS adapter owns those fields, while unrelated static projects remain during migration.
- Products list/detail: Published CMS products overlay matching static products by URL key; unrelated static products remain during migration.
- Articles listing/metadata: Published CMS articles overlay matching static articles by URL key; unrelated static articles remain during migration.
- Article detail body: uses Published CMS article sections when available; otherwise falls back to sanitized original import HTML when needed.
- Stone Library listing: Published CMS cards overlay matching static stone groups while detail remains Published-first with static fallback.
- Leads and form submissions: production form persistence and SMTP2GO notification proof are complete.

The approved import has already written production Projects, Stone Library, Products, Articles, and Media candidates into the CMS as Draft items. Those items stay hidden until an editor reviews and publishes them.

## Leads Export

In Leads, CSV export uses the current search, lead-kind filter, and workflow-status filter. The visible count beside the export button shows how many entries will be exported out of the loaded queue. Clear filters before exporting the full loaded queue. Exports are recorded in change history before the CSV downloads. Exported entries use a `Reference` value such as `enquiry-123` or `sample-123` so the file can be shared without explaining internal database IDs.

Lead workflow status tells managers whether a lead needs an owner, needs internal notes, is ready to save, is handled, or is no longer active. Use Recommended next step for the customer action, then Lead workflow actions to save the status, owner, and notes together.

## Publishing Checks

Before publishing:
- Projects need title, URL, public copy, proof reviewed for public use, reviewed facts, and reviewed materials. Use Website publish status to see whether the project is Live on website, Ready not live yet, or Not ready to publish. If Publish is locked, use Start with to jump to the first repair item.
- Stone Library families need name, URL key, website stone type, public summary, at least one variant, and reviewed finish availability before Publish is available. Variants need a URL key, editor-facing label, and at least one Available or Needs confirmation finish.
- Stone Library finish images need a selected Media library item that is already Published in Media. Use Finish image public status in Stone Library to see whether the image can appear on the website. If it says Open Media first, publish the media item in Media, then return to Stone Library and publish the finish image link.
- Products need name, URL, short description, hero image, at least one published model with image, material defaults, and specs before Publish is available. Use Product website status to see whether the product is Live on website, Ready not live yet, or Not ready to publish. Models have their own Model publish status and checklist; they need a clean model website key, label, and image before Model Publish is available.
- Articles should clear Article website status and the Article publish checklist: title, URL, date, excerpt, at least one Published article section, and required copy/link/media fields filled in for every Published section. Use Section publish status to see whether a section can appear in the article before publishing that section.
- Media should pass Website media status and the on-screen checklist: source recorded, image alt text filled in, usage notes filled in, and Published status before public reuse. New uploads always start private. A Website owner/CMS manager can publish an existing private upload through a create-only public copy bound to that record's original path/version plus database/reference confirmation; Editors need one of those roles to perform that promotion safely.

If Publish is blocked, use the on-screen checklist, Website publish status, or validation message to fix the named field, then save/publish again.

## Handoff Gaps

The CMS is not currently handoff-ready. Required closure:
- Deploy the reliability/public-consumer fixes and record the deployment SHA.
- Configure and verify Supabase Auth custom SMTP plus exact invite/recovery redirect allowlist entries.
- Complete the real browser golden workflow: sign in, draft edit/save/refresh, private media copy/publish, public readback, archive behavior, settings public readback, invite/password setup, logout/login, password recovery, responsive navigation at mobile/1116px/wide widths, the Projects task workspace, the Dashboard operational queue, and this guide's usability with a non-technical editor.
- Deploy and browser-test the Projects stable record route, task workspaces, all-editor dirty guards, blocker jumps, child-save isolation, searchable media, and save/refresh readback; then add paginated media and public preview before reusing the pattern in Products, Articles, and Stone Library.
- Record fresh evidence and expiry in `docs/agent/admin-handoff-evidence.json`; do not infer readiness from route shells, source text, direct API writes, or this guide.
