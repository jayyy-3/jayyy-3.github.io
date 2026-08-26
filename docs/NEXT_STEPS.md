# NEXT_STEPS - Urblo Roadmap

Last updated: 2026-08-26

## Purpose
This is the human-readable roadmap. The machine-readable source of truth is `docs/agent/tasks.json`; the compact current-state snapshot is `docs/agent/status.json`; historical proof lives in `docs/WORKLOG.md`.

Use this file to choose direction. Use `docs/agent/tasks.json` to execute.

## Current Objective
Urblo is operating as a Cloudflare Pages + Supabase site with real forms, but the production `/admin` handoff remains reopened after a direct not-working report and a 2026-07-13 code/UX audit. PR `#9` promoted the page-shaped Projects Phase 1 runtime to production at merge `25c05ebb` / immutable deployment `877d13c4-1e28-45d7-a62a-afdd3b0e0dda`; deployment-bound smoke passed on the immutable URL, apex, and `www`, and production owner login passed all nine Admin routes. Expand A, minimum-disclosure C, and write-lockdown B are applied/read back. The operational edit freeze is lifted, and Jay tested the production result on 2026-08-02 and reported no issue/OK. Projects Phase 1 is user-accepted; the broader Admin handoff and later reshape phases remain open.

PR `#11` simplifies the Project editor and Dashboard to a single-editor Edit/Save/Preview/Publish/Hide workflow: legacy claim-review columns are normalized automatically and no longer appear as approval controls or Dashboard queues. Its first public-header repair made the translucent header render over the white Projects page, but Jay rejected that visual result. Commit `9d93624` gives Projects listing/detail the same 102px black `DefaultLayout` support band as Stone Library and removes the duplicate page-local offset. After Jay's approval, the PR merged as `59cded9b` and deployed as immutable production `76de2abf-a27b-4ecb-9e1f-fe229af4c8ed`; immutable/apex/`www` smoke, production owner login, desktop/mobile Projects display checks, and Jay's direct production acceptance pass.

The Projects cleanup has removed the raw-database `All 9` mismatch and is live through PR `#14` / merge `edd33465`. The default list/count excludes Archive, uses Projects/Drafts/Live, and shows Archive only when history exists. Three publish-ready canonical drafts are now Live and the four exact Archived QA Projects are permanently deleted; guarded production readback is five canonical Projects, four Live, one Draft, and zero Archived. Moon Gate remains Draft because its Stone Library dependencies and hotspot-material bindings do not yet satisfy the existing publish guard. The new immutable Cloudflare deployment URL remains unrecorded because current access would require a fresh OAuth grant; production asset switch plus authenticated Admin/public readback passed.

Public Stone Library origin disclosure is removed through PR `#16` / merge `160b4f1` from listing cards, detail specs, search matching, and route metadata while the underlying source/Supabase/Admin field remains intact. Immutable release `76ae7fe0`, apex, and `www` pass deployment-bound smoke; production desktop/mobile UI readback passes.

The public Navbar route-aware surface structure was deployed through PR `#18` / merge `93fd143c`, but Jay rejected its heavy 24px/40px blur after production review. PR `#19` / merge `36e69e5f` restores the original clear `backdrop-blur-sm` material: 4px blur without extra saturation for Header/menu, while retaining the lighter image-page/deeper white-page tints and light 102px clearance. Clean container gate, immutable Preview `ac951868`, deployment-bound apex/`www` smoke, and production desktop/390px readback pass.

Project image delivery is complete through PR `#24` / merge `d51fa26b` / immutable production deployment `4242d7c5-e78e-4f70-b6c2-51e9b9bb7dc8`. Every CMS upload remains the original visual master while public archive, list, hero, detail, and hotspot surfaces request separate responsive Supabase WebP profiles. The Grid black-bar repair keeps desktop images and frames at equal 348×261, List remains 120×90, the desktop hero selects 2500px quality-88, and the 390px hero selects 960px quality-88 without overflow or console warnings/errors. Immutable/apex/`www` deployment-bound smoke passes after edge asset propagation completed. Jay accepted the final Preview before promotion; this item is complete.

Homepage Latest Projects is complete through PR `#26` / merge `f3fe5647`, rail-alignment PR `#27` / merge `ccab9c12`, and immutable production deployment `b85d8718-18ae-4180-8a2c-371c63e18a31`. It reads the complete Published Project collection in CMS order instead of the hand-maintained five-record list, while retaining those five as the no-CMS fallback and deferring the read until the section nears the viewport. Immutable/apex/`www` smoke passes. Production desktop/mobile Browser QA reads all 15 projects, reaches and opens `15 / 15`, returns to visible `01 / 15` at rail origin, preserves the one-viewport composition, and has no relevant console warning/error or horizontal page overflow.

Image QR is live through PR `#29` / merge `19e2b41` / immutable Cloudflare deployment `d6816c71-b33e-46ae-860d-121a81c8bca0`. The scalable UI uses a compact searchable/sortable resource list and focused details drawer. Jay-approved intake added 18 automatically named, quality-first 2560×1707/WebP-90 Stone/Finish resources; with one pre-existing resource production reads 19 active / 0 hidden. Immutable/apex/`www` deployment-bound smoke passes, authenticated production Admin readback passes, and a canonical `urblo.com.au/image/:slug` resolver redirects directly to the expected 2560×1707 WebP image.

PR `#21` merged as `b1e8b315` and deployed the 12 supplied partner marks into the existing homepage white marquee, preserving the section composition while correcting the loop to two equal groups, hiding the duplicate accessibility copy, and adding a reduced-motion fallback. Jay accepted the local result; the clean Node 20 container gate, immutable Preview checks, production deployment `8f2af15d`, apex/`www`/Pages-alias binding smoke, and production desktop/390px readback pass. This item is complete.

## What Is Complete
- Cloudflare Pages production compute and CI/CD are migrated to the Urblo-owned account/project `urblo-site`; PR `#33` / main `aec4dce` is deployed at `https://7e668551.urblo-site.pages.dev`, both production domains pass exact immutable-reference smoke, the `.au` registry delegates to the new Urblo-owned nameservers, and the new Active zone contains all 24 intended website/mail/verification/qa records. GitHub Actions deploys branches as Preview and `main` as production using a minimal account-owned Pages token. Only normal expiry of some old recursive DNS caches remains to observe.
- Contact and Sample Request persistence is complete, including server-side audit rows, SMTP2GO notification proof, and browser-key private-row denial. Fresh post-migration production marker `urblo-live-20260826-cf-migration-01` proved the Urblo-owned Cloudflare project end to end: Contact `#10`, Sample Request `#6` / item `#6`, audit events `#354/#355`, and both stored notification states `sent`.
- The original Supabase foundation, baseline seeds, table RLS, Storage bucket/listing hardening, admin helper hardening, admin profile uniqueness, Editor-versus-public-bucket role migration/readback, and separately approved live role proof are complete.
- First admin bootstrap is complete for `info@urblo.com.au`.
- A separate active QA Editor is provisioned; password sign-in and its own Editor-profile RLS readback pass. This is test readiness, not invite-flow completion.
- `/admin` route shells, schema/RLS, source CRUD surfaces, and direct API-level tagged QA exist for Dashboard, Projects, Stone Library, Products, Articles, Media, Leads, Settings, and Change history. This does not prove editor workflow completion.
- The June route-shell, private Storage, and direct browser-key/API proofs remain historical infrastructure evidence; they no longer count as a completed CMS handoff.
- Public Projects, Products, Articles, and Stone Library have Published CMS read paths with static fallback; migration-safe per-record overlay and real Storage URL consumption are deployed. Projects has authenticated Preview publish/public-readback evidence, while the equivalent production handoff proof remains open.
- Static production content has been imported into the CMS as Draft items for editor review.
- Phase 1 SEO indexability foundation is implemented in source: real `robots.txt`, real `sitemap.xml` with 36 approved public URLs, centralized public route metadata in `src/data/seoRoutes.ts`, conservative client-side JSON-LD, and `npm run agent:seo-readiness`.
- Google Search Console was reviewed on 2026-06-12 and `https://urblo.com.au/sitemap.xml` was submitted/refreshed the same day. The current SEO follow-up belongs to Phase 2: monitor when Google reads the refreshed sitemap, map old URLs with search signal, add selective 301 redirects for valuable legacy paths, and then expand non-brand long-tail Product/Stone/Project/Article content.
- Phase 2 SEO legacy URL cleanup is implemented in source: GSC-recovered old URLs now have selective 301 redirects, representative smoke checks guard those mappings, and junk WordPress/admin/feed/upload paths remain out of the sitemap.
- Harness GC first pass is implemented.
- PR `#6` merge `a2a7ae5` is deployed as `c7a910df-6dd3-440b-8971-a6120353ed19`; its immutable URL and both custom domains pass the deployment-bound MIME/body asset smoke, and production auth passes three blocked-Supabase static fallbacks plus all nine authenticated routes. Four unchanged apex assets retain stale cache-header warnings only after exact immutable bytes/MIME comparison.
- Phase 0 of the approved Admin reshape is complete. Phase 1 Projects is deployed and Jay-accepted with one aggregate draft/action bar, shared public/draft rendering, visual hotspots, inline private-first media, a protected server aggregate path, and source-level security hardening. Phase 2 starts with Articles, then Products, Stone Library, Media, and light-touch Settings/Leads/Audit alignment in the approved order.
- Image QR is deployed to production as a deliberately simple single-user resource library; its migration, approved 18-image intake, canonical QR resolver, and production readback are complete.

## Active Now
Only these task IDs should be treated as current executable work:

- `NOW-ADMIN-RELIABILITY-UX-001`: P0. Reliability fixes and the first Projects task-workspace redesign are deployed through PR `#3`; Harness hardening is deployed through PR `#5`; the cache repair, deployment binding, and production auth/fallback proof are deployed through PR `#6`; a separate QA Editor is active; production Auth callbacks are corrected/read back; and the Storage migration plus live Editor/owner role boundary have passed. Complete the browser golden workflow before closing the incident.
- `NOW-ADMIN-SETTINGS-CRUD-001`: Published settings public readback plus a real invite/password/recovery proof. The previous invite callback fell back to localhost; production Site URL and the exact callbacks are now corrected and read back. Custom Auth SMTP ownership and a separately approved complete UI email/password workflow remain open.
- `NOW-ADMIN-UX-RESHAPE-001`: Phase 0 is closed and Projects Phase 1 is deployed and Jay-accepted. The clean Node 20 container gate, deterministic conflict/compensation checks, Preview and production smoke/login, A/C/B migrations, authenticated Preview happy path, single-editor follow-up, and public header correction pass. Keep the umbrella task active through Phase 2 replication, Phase 3 canonical-doc/harness absorption, and the directive's sunset deletion.
- `NOW-PROJECT-STONE-POINTS-001`: production migration `20260812062636` and runtime merge `0593389d` / Cloudflare deployment `b160e33f` are live and verified. Moon Gate's Draft Angola Black / Polished and New Grey / Flamed rows are linked to variants `5` and `13`; editing admits non-Archived Stone Library records while Project publication requires the full chain and media to be Live. Next and only remaining acceptance is Jay's fool test in production.
  - Current follow-up: keep Moon Gate Draft until its separately scoped Stone Library and hotspot dependencies are approved and complete; record PR `#14`'s immutable Cloudflare URL if existing account access becomes available; then apply the accepted page-shaped single-editor pattern to Articles.

`NOW-FORMS-SUPABASE-001` is now `next`: only the configuration/approval-gated Turnstile proof remains, so it yielded the active slot to the approved Admin reshape.

## Next Decisions
- Allow remaining recursive DNS caches to expire naturally; Google Public DNS already returns `mckenzie.ns.cloudflare.com` / `norman.ns.cloudflare.com`, the new zone is Active, and final apex/`www` proxy state is confirmed. Do not delete the old Hunter-account project or unrelated Hunter resources during the rollback observation window.
- The tagged Projects Preview happy path is complete; separately approve any additional live failure-recovery or non-Projects golden-workflow writes before they run.
- Jay-approved Image QR import and runtime promotion are complete. Obtain fresh approval for any additional replace/Hide/Restore proof write; later usability acceptance remains user-owned.
- Configure Supabase Auth custom SMTP separately from the already verified Contact/Sample SMTP2GO Function path.
- Production migration `20260714050750_media_public_bucket_role_hardening.sql`, its INSERT/UPDATE policy readback, and the separately approved tagged Editor/owner Storage proof are complete with zero tagged objects remaining.
- Exact production invite and recovery callback URLs were added to the Supabase Auth redirect allowlist and read back on 2026-07-14.
- Expand migration `supabase/migrations/20260719015649_project_aggregate_drafts.sql` is applied/read back. Commit `9441811` was rebuilt as Preview deployment `1a3e0d4b-d74a-4979-be64-921e5a510ccc`; no-write smoke passed, then marker `admin-projects-ui-mrroa6p0` passed one Save/refresh, unsaved preview, private-first upload, 55/55 hotspot, Publish/public readback, and Hide/public-not-found. The Project aggregate is Archived; the promoted Media/public object remains under the archive-first retention policy and the private source is gone.
- The Project edit freeze was lifted after production promotion and contract B readback. The clean-container gate, immutable Preview, production deployment-bound smoke/login, and A/C/B readbacks are complete. Local stale-Save and failed-Publish compensation behavior is covered; real two-session/Postgres/Storage negative proof needs its own approval if requested.
- The tombstone choice is applied: `20260802103337_restrict_archived_project_tombstones.sql` returns only archived canonical rows whose slug is one of the five already-public bundled fallbacks, and the client independently rejects any other result. Production readback changed from four QA slugs to the expected empty intersection without mutating those Archived rows.
- Jay's production Projects usability acceptance passed on 2026-08-02. Contract migration `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql` is applied/read back, and the edit freeze is lifted. Never Cloudflare-only roll back to the legacy direct-write UI.
- Decide whether Turnstile proof is required before the next public launch checkpoint.
- After separate approval, verify custom Auth SMTP ownership and repeat the real CMS invite/recovery proof against the corrected callback configuration.
- Ask a customer/editor to review imported Draft CMS content and decide what to publish first.
- Decide whether to resume article claim cleanup, currently paused by user direction.
- Decide whether physical delete controls are needed, and define retention/destructive-delete policy before adding them.
- Decide Phase 3 SEO content scope: light copy/CTA polish, standard Stone/Product/Project landing-page expansion, or deeper pre-render/SSR-style static HTML output if post-refresh GSC data still shows indexing weakness.
- Choose how CMS-only published slugs enter the sitemap/structured route inventory and first-response HTML; runtime metadata alone does not make a newly created CMS route fully search-discoverable.

## Deferred Follow-Ups
- `NOW-ADMIN-CMS-001` remains a historical launch umbrella, but its handoff conclusion is superseded by the active reliability incident.
- `NOW-ADMIN-AUTH-RLS-001`, `NOW-ADMIN-CONTENT-CRUD-001`, and `NOW-ADMIN-MEDIA-LEADS-001` are complete only for their source/schema/data-layer scopes; their historical evidence does not complete the reopened production editor handoff.
- Optional unprofiled unauthorized browser QA remains available but is not required for completed CMS handoff.
- Capability-specific download capture can receive its own live check, but base `/api/enquiries` persistence is already verified.
- Static fallback should remain until Jay explicitly approves a CMS-only public cutover.

## Quality Gates
Runtime changes must pass:
- `npm run gate` (preferred: wraps the gates below plus `agent:check` and `git diff --check` in a clean Node 20 container; see `docs/OPERATING_PROTOCOL.md`)
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`

Docs and harness changes should pass:
- `npm run agent:check`
- `npm run agent:harness-gc`
- `npm run agent:harness-gc:review`
- `git diff --check`
- `npm run agent:seo-readiness` when public SEO metadata, sitemap, robots, structured data, or public route slugs change.

CMS handoff checks:
- `npm run agent:admin-cms-predeploy`
- `npm run agent:admin-config-gate`
- Passed after item-specific approval: `npm run agent:admin-media-role-boundary-live -- --allow-writes --strict`
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict`

The strict handoff command is expected to fail while `docs/agent/admin-handoff-evidence.json` is `revalidation_required`. It may pass only after the Storage role-boundary production prerequisite and all twelve recorded golden workflows have fresh evidence tied to one production deployment SHA.

Live writes and invite emails require explicit approval for the specific target action.

## Agent Command Index
These scripts are intentionally documented so harness GC can check command coverage:
- `npm run gate`
- `npm run agent:admin-auth-browser`
- `npm run agent:admin-cms-predeploy`
- `npm run agent:admin-config-gate`
- `npm run agent:admin-crud-coverage`
- `npm run agent:admin-crud-live`
- `npm run agent:admin-media-role-boundary-live`
- `npm run agent:admin-projects-aggregate`
- `npm run agent:admin-handoff-readiness`
- `npm run agent:admin-live-readiness`
- `npm run agent:capabilities-ui`
- `npm run agent:check`
- `npm run agent:cloudflare-preview-smoke`
- `npm run agent:cloudflare-readiness`
- `npm run agent:content-import`
- `npm run agent:content-import:apply-sql`
- `npm run agent:content-import:json`
- `npm run agent:content-import:live`
- `npm run agent:content-import:plan`
- `npm run agent:content-import:preflight-sql`
- `npm run agent:first-admin-bootstrap`
- `npm run agent:forms-live`
- `npm run agent:forms-ui`
- `npm run agent:harness-gc`
- `npm run agent:harness-gc:fix`
- `npm run agent:harness-gc:review`
- `npm run agent:init`
- `npm run agent:live-readiness`
- `npm run agent:public-content-overlay`
- `npm run agent:public-supabase-readiness`
- `npm run agent:seo-readiness`
- `npm run agent:smoke`
- `npm run agent:supabase-foundation-readiness`

## Last Verified
Latest host-side source/runtime proof set for the current unpushed Projects closeout source on 2026-07-19:
- `npm run agent:admin-crud-coverage`: pass
- `npm run build`: pass
- `npm run lint`: pass
- `npx tsc -b`: pass
- `npm run agent:smoke`: pass
- `npm run agent:supabase-foundation-readiness`: pass
- `npm run agent:public-supabase-readiness`: pass
- `npm run agent:cloudflare-readiness`: pass
- `npm run agent:admin-config-gate`: pass
- `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`: last passed on 2026-07-13 against the PR `#6` production runtime for three blocked-Supabase static fallbacks, all 9 authenticated routes, Sign out, and protected-route revisit
- `npm run agent:seo-readiness`: pass
- `npm run agent:public-content-overlay`: pass
- `npm run agent:admin-cms-predeploy`: pass in no-write source/report mode
- Node 20.20.2 `npm run agent:admin-cms-predeploy`: pass, including the nested Projects/CRUD verifier chain
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict`: expected fail because handoff evidence remains `revalidation_required` and the twelve deployed golden workflows are not recorded; the Storage role-boundary prerequisite itself passed on 2026-07-14

The Projects Phase 1 candidate is newer than the production runtime proof set. Commit `a79a364` passed the clean Node 20 container gate; immutable Preview `a20062a0` passed no-write smoke and owner login. Expand migration A, the approved authenticated Preview happy path, deterministic stale-Save/conflict/compensation checks, and minimum-disclosure C application/readback pass. Runtime promotion, contract B/privilege-policy readback, any separately approved live negative proof, and Jay's fool test remain pending. Preview evidence must not inherit the 2026-07-13 production status.

Admin repair PR `#3` merge commit `46d46b4` passed branch preview and the former status-only production smoke on 2026-07-13; the later cache incident invalidated that production result. Harness PR `#5` merge `cb0ec9a` exposed the false-200 condition. Cache repair PR `#6` merge `a2a7ae5` / deployment `c7a910df-6dd3-440b-8971-a6120353ed19` now passes immutable, apex, and `www` asset smoke with exact deployment binding plus the production auth/fallback gate. Four apex assets still report stale cache headers, but their bytes and MIME match the immutable deployment exactly.

Build still shows the known Browserslist staleness notice. The configured local build now loads public Supabase on demand into its own vendor chunk; the auth-browser gate confirms the entry stays below 500,000 bytes and the Supabase chunk is not module-preloaded. Admin route chunks and the browser-secret boundary also pass.

## Exit Criteria For The Current Cycle
- `docs/agent/tasks.json` keeps only true active execution work in `now`.
- Harness GC reports no failures and only intentional warnings.
- Runtime candidate `a2a7ae5` is deployed at immutable URL `https://c7a910df.urblo.pages.dev` and promoted to the production origin. If runtime code changes before the golden workflow, bind the complete evidence set to the resulting newer deployment instead.
- `20260714050750_media_public_bucket_role_hardening.sql` is applied/read back and the `mediaPublicBucketRoleBoundary` prerequisite has fresh Editor/owner live evidence.
- Each Projects expand/contract migration is applied/read back only after its own approval and in the documented order; the reshaped Projects workflow is verified on preview/production without treating source checks as user acceptance.
- All twelve golden workflows in `docs/agent/admin-handoff-evidence.json` have fresh `Pass` evidence against that same deployment and admin identity.
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict` passes, and Jay's reported production incident has been revalidated through the real UI.
- Turnstile and Settings invite decisions are explicit.
- Editor/customer content review decisions are explicit.
- Any new runtime work passes the runtime gate set above.
