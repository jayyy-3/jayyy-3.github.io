# Urblo Admin Editor Guide

Last updated: 2026-06-05

## Admin Address

- Production admin: `https://urblo.com.au/admin`
- Login page: `https://urblo.com.au/admin/login`

Use the admin only with an approved Urblo login account. If a signed-in user does not have an active CMS role, the admin shows the unauthorized screen instead of private content.

## Customer Handoff Summary

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
11. Static fallback: public pages still keep static fallback content where needed, so Draft and Archived CMS content remains hidden.
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
9. Explain that Draft and Archived stay hidden, Published can appear publicly, and static fallback remains in place where the public page still needs a safe backup.
10. Finish in Settings only if the editor also needs to understand account handoff; otherwise leave Settings to CMS managers.

Pass condition: the editor can explain where they start, how they know whether content is live, where Save/Publish lives, and what to do when Publish is locked.

## Roles

| Role | What It Can Do |
|---|---|
| Website owner | Full CMS control, including website settings and team access. |
| CMS manager | Manage settings, team access, content, media, leads, and publishing. |
| Editor | Edit content and media. Cannot manage settings or export leads. |
| Viewer | Inspect CMS content without saving changes. |

## Account Setup

First-admin bootstrap is already complete for `info@urblo.com.au`.

For additional people:
1. Open `/admin/settings`.
2. In `CMS team` / `People and access`, use Invite and grant access for a new CMS user.
3. Enter their email, optional display name, and the lowest suitable role, then send the invite.
4. Ask them to accept the invite email and sign in at `/admin`.
5. Use Grant existing login only when the person already has a login account and you have the setup code.

The invite flow uses a secure server endpoint and adds the access change to Change history. The latest invite UI still needs deployment and live invite proof before production editors rely on it.

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
8. Use the editor header's Open public page control to confirm the live route after publishing. Draft and Archived items keep that control disabled or explain why the public page is hidden.
9. Archive content when it should be hidden without deleting it.

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
| Projects | Edit case studies, facts, materials, images, maps, and hotspots. | CMS-ready with search/status filters, Website publish status summary, project proof review language, publish checklist, blocker links, media selectors, and Project actions. |
| Stone Library | Edit stone families, variants, finish availability, and finish imagery. | CMS-ready with Needs confirmation language, family/variant publish checklists, Stone family actions, Variant actions, Finish image public status, and finish-image media guidance; public listing and detail prefer Published CMS items with static fallback. |
| Products | Edit product families, models, images, search title/description, materials, and specs. | CMS-ready with Product website status, Model publish status, Website URL key / Model website key labels, media selectors, product/model publish checklists, Product actions, Model actions, and Stone Library link feedback. |
| Articles | Edit article metadata, search title/description, and Article sections through section-type forms. | CMS-ready for metadata and section content with Article website status, Section publish status, Article actions, and Section actions; public detail prefers Published article sections and keeps sanitized original import HTML as fallback. |
| Media | Upload/manage media, metadata, status, and manifest export. | CMS-ready with editor-facing private/public library labels, Website media status, Media actions, and a publish checklist. |
| Leads | Triage enquiries and sample requests, follow recommended next steps, assign owners, add internal notes, and export the current filtered queue with change history. | Workflow-ready for CMS managers with Lead workflow status, Lead workflow actions beside the recommended next step, owner/notes handoff guidance, and filtered visible-queue export. |
| Settings | Edit global contact/search defaults, footer content, and CMS access. | CMS-ready with Website settings status, Site settings actions, CMS access handoff actions, People and access, Access setup checklist, Invite and grant access, Grant existing login, Copy setup code controls, Active access, and role guide; the invite path needs deployment/live proof before production handoff. |
| Change history | Inspect saved changes, exports, publish/archive actions, and sensitive operations. | Read-only visibility for Website owner and CMS manager roles. |

## Account Handoff Flow

Use `/admin/settings` when giving someone access:

1. Open Settings, then People and access.
2. Read CMS access handoff actions.
3. For a new editor, use Invite and grant access.
4. For someone who already has a login, use Grant existing login and paste their Login setup code.
5. Choose the lowest useful role. Most content-only users should be Editor.
6. Keep at least one Website owner active.

Website settings status tells editors whether the current settings are Live settings, Draft settings, or Hidden. Site settings actions only change global website settings such as contact details, footer content, and search defaults. CMS access handoff actions only change who can use the CMS.

## Public Website Fallbacks

The public site currently behaves as follows:

- Projects list/detail: uses Published CMS projects when available; otherwise falls back to static project data.
- Products list/detail: uses Published CMS products when available; otherwise falls back to static product data.
- Articles listing/metadata: uses Published CMS articles when available; otherwise falls back to static article metadata.
- Article detail body: uses Published CMS article sections when available; otherwise falls back to sanitized original import HTML when needed.
- Stone Library listing/detail: uses Published CMS stone data when available; otherwise falls back to static Stone Library data.
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
- Media should pass Website media status and the on-screen checklist: source recorded, uploaded files moved to the Public website library, image alt text filled in, usage notes filled in, and Published status before public reuse.

If Publish is blocked, use the on-screen checklist, Website publish status, or validation message to fix the named field, then save/publish again.

## Handoff Gaps

The CMS is much closer to editor-handoff state, but these are still open:
- Deploy and live-test the new Settings invite flow before relying on browser-side account creation for production editors.
- Push and deploy the local CMS UX commits before expecting production editors to see the latest interface language.
- Run a final Stone Library publish walkthrough in production so editors can confirm family, variant, finish, and finish-image changes read correctly after review.
- Run a final Article publish walkthrough in production so editors can confirm the imported article sections read correctly after review.
- Run a final editor walkthrough on production after the local CMS UX commits are pushed and deployed.
