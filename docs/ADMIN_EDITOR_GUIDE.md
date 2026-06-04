# Urblo Admin Editor Guide

Last updated: 2026-06-04

## Admin Address

- Production admin: `https://urblo.com.au/admin`
- Login page: `https://urblo.com.au/admin/login`

Use the admin only with an approved Urblo login account. If a signed-in user does not have an active CMS role, the admin shows the unauthorized screen instead of private content.

## Roles

| Role | What It Can Do |
|---|---|
| Owner | Full CMS and account-level access, including owner/admin access management. |
| Admin | Manage settings, team access, content, media, leads, and publishing. |
| Editor | Edit content and media. Cannot manage settings or export leads. |
| Viewer | Inspect CMS content without saving changes. |

## Account Setup

First-admin bootstrap is already complete for `info@urblo.com.au`.

For additional people:
1. Create or invite their Supabase Auth login account outside `/admin/settings`.
2. Open `/admin/settings`.
3. In `Admin team`, add the person by pasting the login account ID, email, display name, and role.
4. Keep `Active profile` enabled and save.

The current browser admin cannot create the underlying login account by itself. Email alone is not enough to grant access; the login account ID links the Auth user to the CMS role.

## Status Rules

| Status | Meaning | Public Website |
|---|---|---|
| Draft | Work in progress or imported content waiting for review. | Never public. |
| Published | Approved content. | Can appear publicly where the public route reads Supabase content. |
| Archived | Hidden but retained. | Never public. |
| TBC | Stone Library confirmation state. | Treat as not public-ready unless the public UI deliberately labels it TBC. |

Only Published rows can appear on the public site. Imported production content is intentionally draft/review-only until an editor publishes it.

## Editing Flow

1. Start on `/admin`.
2. Check Dashboard status counts and the Content health queue.
3. Open the relevant module from the Content library or Work queue.
4. Search/filter the list by status.
5. Open the record, edit fields, and save.
6. Review readiness guidance or publish blockers.
7. Publish only when the record is ready for the public site.
8. Archive content when it should be hidden without deleting it.

Physical delete is not part of the launch CMS workflow.

## Module Notes

| Module | Use It For | Current CMS State |
|---|---|---|
| Dashboard | See work queue, status counts, and content health warnings. | Source-ready and verified. |
| Projects | Edit case studies, facts, materials, images, maps, and hotspots. | CMS-ready with publish checklist and media selectors. |
| Stone Library | Edit stone groups, variants, finish capabilities, and finish imagery. | CMS-ready for listing data; detail page still uses static-backed detail adapter. |
| Products | Edit product families, models, images, materials, and specs. | CMS-ready with media selectors and Stone Library link feedback. |
| Articles | Edit article metadata and structured blocks. | CMS-ready for metadata/block rows; public detail still renders sanitized legacy HTML until structured public block rendering is built. |
| Media | Upload/manage media, metadata, status, and manifest export. | CMS-ready; publish media before using it publicly. |
| Leads | Triage enquiries and sample requests, assign, add internal notes, export with audit logging. | Workflow-ready for owner/admin. |
| Settings | Edit global identity, footer content, SEO defaults, and CMS access. | CMS-ready; creating/inviting the login account still happens outside this screen. |
| Audit | Inspect admin mutation history. | Read-only visibility for owner/admin. |

## Public Website Fallbacks

The public site currently behaves as follows:

- Projects list/detail: uses Published Supabase projects when available; otherwise falls back to static project data.
- Products list/detail: uses Published Supabase products when available; otherwise falls back to static product data.
- Articles listing/metadata: uses Published Supabase articles when available; otherwise falls back to static article metadata.
- Article detail body: still renders sanitized legacy HTML from the legacy source path.
- Stone Library listing: uses Published Supabase stone cards when available; otherwise falls back to static Stone Library data.
- Stone Library detail: still uses the static-backed detail service.
- Leads and form submissions: Supabase-backed production form persistence and SMTP2GO notification proof are complete.

## Publishing Checks

Before publishing:
- Projects need title, URL, public copy, reviewed project claim status, reviewed facts, and reviewed materials.
- Stone Library finish images need a selected media record that is already Published in Media.
- Products should have public-ready product/model media and confirmed Stone Library material defaults.
- Articles should have title, slug, date, excerpt, cover image where needed, and structured blocks.
- Media should have useful alt text, caption/credit where relevant, usage notes, and Published status before it is used publicly.

If Publish is blocked, use the on-screen checklist or validation message to fix the named field, then save/publish again.

## Handoff Gaps

The CMS is much closer to editor-handoff state, but these are still open:
- Add a browser-safe invite/create-user flow if non-technical owners should create login accounts without outside help.
- Finish Stone Library public detail adapter so published Supabase variant/finish detail data drives the detail page.
- Finish public structured Article block rendering so article bodies no longer depend on sanitized legacy HTML.
- Run a final editor walkthrough on production after the local CMS UX commits are pushed and deployed.
