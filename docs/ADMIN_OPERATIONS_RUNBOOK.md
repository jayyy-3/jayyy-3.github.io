# Urblo Admin Operations Runbook

Last updated: 2026-09-26

Developer and CMS-manager reference for running the `/admin` CMS. Colleagues use the one-screen quick guide in `docs/ADMIN_EDITOR_GUIDE.md`, which the admin Help button renders on every admin route; keep technical material here, not there. Route/role contracts live in `docs/ADMIN_IA_ACCESS.md`, stable technical contracts in `docs/ARCHITECTURE.md`, and production handoff truth in `docs/agent/admin-handoff-evidence.json`.

## Quick guide maintenance

- The quick guide is bundled into the admin build (`src/pages/admin/AdminHelp.tsx` imports it with `?raw`), so editing it classifies as a runtime change and redeploys.
- `npm run agent:admin-guide` (graph node `guide`) enforces the one-screen limit, forbids technical terms (Supabase, bucket, migration, localhost, handoff and similar), restricts the file to the Markdown subset the drawer renders, and requires every **bold** control label to exist in `src/pages/admin` or `src/features/stone-library`. When a UI label changes, update the guide in the same change.
- The guide is English only and written for desktop use by non-technical colleagues (owner decision, 2026-09-26).

## Handoff status

The CMS is not certified handoff-ready. `docs/agent/admin-handoff-evidence.json` stays `revalidation_required` until every golden workflow passes on one deployed SHA and immutable URL with a matching Admin CMS Golden Workflow Evidence section in `docs/WORKLOG.md` (see `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`). Route shells, source text, direct API writes and this runbook are not evidence. Required closure:
- Real browser golden workflow: sign in, draft save/refresh, private media publish, public readback, archive behaviour, Settings public readback, invite/password setup, logout/login, password recovery, responsive navigation at mobile/1116px/wide widths, the Projects editor, the Dashboard queue, and quick-guide usability by a non-technical colleague.
- Jay's fool test on Projects (replace one photo, make it live, confirm on the public site, unassisted, under five minutes).
- `npm run agent:admin-handoff-readiness -- --strict` passes only when the evidence file is complete and fresh.

## Admin address and roles

- Production admin: `https://urblo.com.au/admin`; login: `https://urblo.com.au/admin/login`. First-admin bootstrap is complete for `info@urblo.com.au`.
- A signed-in user without an active CMS role sees the unauthorized screen, never private content.

| Role | What it can do |
|---|---|
| Website owner | Full CMS control, including website settings and team access. |
| CMS manager | Settings, team access, content, media, leads (status/owner/notes/export) and publishing. |
| Editor | Edit and publish general content and already-public media; Projects and Stone Library publish through protected server endpoints. Cannot manage settings or team, change or export leads, or copy private Media uploads to the public library from the Media screen. |
| Viewer | Read-only CMS access. |

Give colleagues the lowest useful role. Most content-only users should be Editor; people who handle leads or site-wide settings need CMS manager.

## Account setup and Auth

1. In Settings, People and access, use Invite and grant access (email, optional display name, lowest role), then Send invite.
2. The invitee accepts the email, lands on `/admin/account-setup`, chooses a password, signs out and signs back in at `/admin`.
3. Grant existing login is only for someone who already has a login and has given you their setup code.
4. `Active access` controls whether a person may enter the CMS; turning it off is an access decision, not deletion of the login or history.

The invite flow uses a server endpoint and writes Change history. Auth callback configuration (Site URL and exact invite/recovery redirect allowlist) was corrected and read back on 2026-07-14 after a delivered QA invite fell back to `http://localhost:3000`; a fresh delivered invite, UI password setup, logout/login and password recovery are still unverified, as is Auth custom SMTP ownership. The Contact-form SMTP2GO proof does not cover Auth email.

## Content lifecycle by module

| Module | Save | Go live | Take down |
|---|---|---|---|
| Projects | Save stores one private aggregate draft (a live project shows Live · unpublished changes). | Publish, after the blocker list is clear. | Hide (archives; no physical delete). |
| Stone Library | Autosaves the draft workspace; Previous versions keeps history. | Publish (server-side media copy). | Hide from website. |
| Image QR | Changes apply directly; permanent QR addresses never change. | n/a | Hide / Restore the link. |
| Products, Articles, Media | Draft records: Save product / Save article / Save draft. Live records: Update live page, which writes the live row after a confirmation dialog. | Publish product / Publish article / Publish media (private uploads show Copy & publish, owner/manager only). | Archive. |
| Settings | Save settings writes Published values immediately (the Status control was removed in wave 1). | Immediate. | n/a |
| Leads | Save workflow stores status, owner and internal notes (owner/manager). | n/a | Status Spam or Closed. |

- Only Published content can appear publicly; Draft and Archived never do. Imported Projects, Stone Library, Products, Articles and Media candidates entered the CMS as Draft.
- URL keys follow the name until first publish, then lock.
- Physical delete is not part of the CMS workflow.

## Public website fallbacks

- Projects, Products and Articles: Published CMS records overlay matching static records by URL key; unrelated static records remain until CMS-only cutover is approved. Archived project tombstones can suppress one of the five bundled fallback projects.
- Article body: Published article sections, otherwise sanitized original import HTML.
- Stone Library: the workspace release (2026-09-10, `docs/STONE_LIBRARY_WORKSPACE_RELEASE.md`) adopted the catalogue as CMS content; detail stays Published-first with static fallback.
- Leads and form submissions: production persistence and SMTP2GO notification proof are complete; each enquiry and sample request is emailed to the configured lead inbox.

## Media and storage

- Every upload lands in the private library first; the original is kept at full quality and the public site derives screen-sized versions.
- Projects and Stone Library copy referenced private media to the public library server-side at Publish, with compensation on failure.
- The standalone Media screen's Copy & publish is Website owner / CMS manager only (migration `20260714050750_media_public_bucket_role_hardening.sql`, applied and proven 2026-07-14) and is bound to the selected record's original path/version.
- Products take images from Media records (Hero image, Model image); a private upload must be copied and published before it can appear publicly.

## Leads export

CSV export uses the current search, lead-kind and status filters; the count beside the button shows how many rows are exported. Exports are written to Change history before download and use `Reference` values such as `enquiry-123` or `sample-123`.

## Verification and rollback

- Choose checks with `npm run agent:verify -- --plan`; the profile matrix is `docs/agent/verification.md`. Admin UI changes run the runtime graph (includes `guide`, `coverage`, `projects`, `qr`, unit tests and the browser config gate).
- Deployed Preview: `npm run agent:cloudflare-preview-smoke -- --base-url <preview>`. Preview uses production data and is read-only for maintenance QA.
- Authenticated no-write production check: `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au` (needs credentials supplied by Jay).
- Rollback: re-promote the last known-good Cloudflare Pages deployment recorded in `docs/agent/status.json`; procedure in `docs/CLOUDFLARE_DEPLOYMENT.md`. Migrations are forward-only and need their own authorization.

## Completed admin reshape record

Absorbed from `docs/ADMIN_UX_RESHAPE_PLAN.md` on 2026-09-26 (full original text: `git show e1548af:docs/ADMIN_UX_RESHAPE_PLAN.md`; the previous 213-line editor guide: `git show e1548af:docs/ADMIN_EDITOR_GUIDE.md`). Evidence is in `docs/WORKLOG.md`.

- Phase 0 reliability: Auth Site URL and invite/recovery redirect allowlist corrected and read back 2026-07-14; Media role migration applied and its tagged Editor/owner boundary proof passed. Invite and recovery UI journeys remain unverified.
- Phase 1 Projects template: one aggregate draft saved atomically by the protected admin-projects Function and aggregate RPC, page-shaped editor (Hero and overview / Project information / Page images and video / Material schedule), shared draft preview, visual material points on any page image, inline private-first media with server-side copy at Publish, plain-language blockers, Save / Publish / Hide. Live projects with unpublished edits show Live · unpublished changes (wave 1). Jay's fool test is still open.
- Phase 2 Stone Library: workspace with autosave, preview, Publish/Hide, Previous versions and server-side finish-image publishing, released 2026-09-10; the old cross-module "publish in Media, then return to Stone Library" chain no longer applies.
- Safety stopgaps (optimization wave 1, PR #62): Update live page confirmation on live Products/Articles/Media records, Settings Status control removed, URL keys generated from names until first publish.
- Phase 3 guide shrink: the editor guide is now a one-screen quick guide with an in-app Help drawer and a source-checked label list (this task, NOW-OPT-ADMIN-GUIDE-001).
