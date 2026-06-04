# Urblo Admin Editor Guide

Last updated: 2026-06-04

## Admin Address

- Production admin: `https://urblo.com.au/admin`
- Login page: `https://urblo.com.au/admin/login`

Use the admin only with an approved Urblo login account. If a signed-in user does not have an active CMS role, the admin shows the unauthorized screen instead of private content.

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
1. Create or invite their login account outside `/admin/settings`.
2. Open `/admin/settings`.
3. In `CMS team` / `People and access`, follow Access setup checklist.
4. Use Copy ID where available, or paste the existing login account ID, email, display name, and lowest suitable role into Grant CMS access.
5. Keep `Active access` enabled, save, then ask the person to sign in at `/admin`.

The current browser admin cannot create the underlying login account by itself. Email alone is not enough to grant access; the login account ID links the login user to the CMS role.

## Status Rules

| Status | Meaning | Public Website |
|---|---|---|
| Draft | Work in progress or imported content waiting for review. | Never public. |
| Published | Approved content. | Can appear publicly where the public route reads Supabase content. |
| Archived | Hidden but retained. | Never public. |
| Needs confirmation | Stone Library confirmation state. | Treat as not public-ready unless the editor deliberately publishes a row that can carry this state. |

Only Published rows can appear on the public site. Imported production content is intentionally draft/review-only until an editor publishes it.

## Editing Flow

1. Start on `/admin`.
2. Check Dashboard quick actions, content status counts, and the Content health queue.
3. Open the relevant module from the Content library or Work queue.
4. Search/filter the list by status before choosing a record.
5. Open the record, edit fields, and save.
6. Review readiness guidance or publish blockers.
7. Publish only when the record is ready for the public site.
8. Use the editor header's Open public page control to confirm the live route after publishing. Draft and Archived records keep that control disabled or explain why the public page is hidden.
9. Archive content when it should be hidden without deleting it.

Physical delete is not part of the launch CMS workflow.

## Module Notes

| Module | Use It For | Current CMS State |
|---|---|---|
| Dashboard | Choose the next editing job, inspect live/draft counts, and open health-queue fixes. | Editor start page with lead/content/media quick actions and correct Stone Library status routing. |
| Projects | Edit case studies, facts, materials, images, maps, and hotspots. | CMS-ready with search/status filters, project proof review language, publish checklist, blocker links, and media selectors. |
| Stone Library | Edit stone families, variants, finish availability, and finish imagery. | CMS-ready with Needs confirmation language, family/variant publish checklists, finish-image media guidance; public listing and detail prefer Published CMS rows with static fallback. |
| Products | Edit product families, models, images, search title/description, materials, and specs. | CMS-ready with Website URL key / Model website key labels, product/model status help, media selectors, product/model publish checklists, and Stone Library link feedback. |
| Articles | Edit article metadata, search title/description, and Article sections through section-type forms. | CMS-ready for metadata/section rows; public detail prefers Published article sections and keeps sanitized original import HTML as fallback. |
| Media | Upload/manage media, metadata, status, and manifest export. | CMS-ready with editor-facing private/public library labels and a publish checklist. |
| Leads | Triage enquiries and sample requests, follow recommended next steps, assign owners, add internal notes, and export the current filtered queue with change history. | Workflow-ready for CMS managers. |
| Settings | Edit global contact/search defaults, footer content, and CMS access. | CMS-ready with People and access, Access setup checklist, Copy ID controls, Grant CMS access form, Active access, and role guide; creating/inviting the login account still happens outside this screen. |
| Change history | Inspect saved changes, exports, publish/archive actions, and sensitive operations. | Read-only visibility for Website owner and CMS manager roles. |

## Public Website Fallbacks

The public site currently behaves as follows:

- Projects list/detail: uses Published Supabase projects when available; otherwise falls back to static project data.
- Products list/detail: uses Published Supabase products when available; otherwise falls back to static product data.
- Articles listing/metadata: uses Published Supabase articles when available; otherwise falls back to static article metadata.
- Article detail body: uses Published Supabase article sections when available; otherwise falls back to sanitized original import HTML when needed.
- Stone Library listing/detail: uses Published Supabase stone data when available; otherwise falls back to static Stone Library data.
- Leads and form submissions: Supabase-backed production form persistence and SMTP2GO notification proof are complete.

The approved import has already written production Projects, Stone Library, Products, Articles, and Media candidates into Supabase as Draft rows. Those rows stay hidden until an editor reviews and publishes them.

## Leads Export

In Leads, CSV export uses the current search, lead-kind filter, and workflow-status filter. The visible count beside the export button shows how many rows will be exported out of the loaded queue. Clear filters before exporting the full loaded queue. Exports are recorded in change history before the CSV downloads.

## Publishing Checks

Before publishing:
- Projects need title, URL, public copy, proof reviewed for public use, reviewed facts, and reviewed materials.
- Stone Library families need name, URL key, website stone type, public summary, at least one variant, and reviewed finish availability before Publish is available. Variants need a URL key, editor-facing label, and at least one Available or Needs confirmation finish.
- Stone Library finish images need a selected media record that is already Published in Media.
- Products need name, URL, short description, hero image, at least one published model with image, material defaults, and specs before Publish is available. Models have their own checklist and need a clean model key, label, and image before Model Publish is available.
- Articles should clear the Article publish checklist: title, URL, date, excerpt, at least one Published article section, and required copy/link/media fields filled in for every Published section.
- Media should pass the on-screen checklist: source recorded, uploaded files moved to the Public website library, image alt text filled in, usage notes filled in, and Published status before public reuse.

If Publish is blocked, use the on-screen checklist or validation message to fix the named field, then save/publish again.

## Handoff Gaps

The CMS is much closer to editor-handoff state, but these are still open:
- Add a browser-safe invite/create-user flow if non-technical owners should create login accounts without outside help.
- Push and deploy the local CMS UX commits before expecting production editors to see the latest interface language.
- Run a final Stone Library publish walkthrough in production so editors can confirm family, variant, finish, and finish-image changes read correctly after review.
- Run a final Article publish walkthrough in production so editors can confirm the imported article sections read correctly after review.
- Run a final editor walkthrough on production after the local CMS UX commits are pushed and deployed.
