# WORKLOG - Urblo Execution Log


## 2026-09-09 — QR material pages production release

PR `#38` squash-merged as `018341a10dd149965dd950bb544931efcb813cf8`; production CI `34318437072` passed and deployed `https://33d09e60.urblo-site.pages.dev`. Immutable, apex and `www` passed deployment-bound route/asset/MIME/redirect/Function smoke and dedicated public QR checks. Production browser readback confirms both original application and exact Honed surface images loaded, expected facts/actions, and no horizontal overflow. The first production auth run recorded a Projects index-load error; a fresh complete run passed three blocked-Supabase public fallbacks and all 10 authenticated Admin routes. The initial transient failure is retained as evidence; its cause was not established.

Brand/design alignment: implements Jay’s selected restrained two-image material page, distinguishes 3D application from actual finish photography, and retains qualified sourcing/price facts. Approved migration, encrypted Preview bindings and one same-material save are complete; no image replacement, Hide/Restore, bulk selection update, email or other content publish was performed. Staff confirmation of remaining defaults and broader CMS acceptance remain separate.

## 2026-09-09 — QR material pages implementation

Connected Preview `https://71a78a56.urblo-site.pages.dev` at commit `1450afe` passed CI `34317589827`, general route/asset/MIME/redirect/Function smoke, dedicated QR HTML/JSON GET/HEAD/hidden404/original-image checks and all 10 authenticated Admin routes. Approved UI proof saved existing Zen Grey/Honed at 2026-09-09 06:12:15 UTC; full reload/reopen retained Saved selection and exact choices, public browser/API readback matched, and audit event `358` records `image_qr.assign_material`. Slug, object path and active status stayed unchanged. This closes the Preview blocker; production promotion/readback is next under existing approval.

Preview prerequisite resolved at 2026-09-09 06:04 UTC: after Jay completed dashboard login and explicitly authorized reading the existing Urblo service-role key, official Wrangler 4.130 single-variable commands wrote encrypted `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` to Preview. Readback confirmed exact production configuration equality and unchanged Preview settings apart from those two bindings. Temporary key files were removed. No key was printed, rotated or committed. Redeployment and UI golden save/readback are next.


Release continuation: Jay explicitly approved Preview configuration, additive field migration, save/readback verification and production promotion after gates. Applied migration was recorded by Supabase as `20260909054816`; renamed the local source to match. Readback confirms nullable JSONB, enabled RLS, denied anonymous SELECT and denied authenticated direct UPDATE, and 32 total / 0 explicitly assigned rows. Existing images, slugs and selections were not changed. Cloudflare readback confirms production holds encrypted server credentials while Preview has no bindings. CLI has no Supabase access token; Jay is signing into the correct dashboard account to provide access to the existing key. No production runtime promotion or material-save write has yet occurred.


QR material-page runtime is implemented in draft PR `#38`, code commit `ade0723`, immutable Preview `https://6707a2a6.urblo-site.pages.dev`. Clean Node 20 container gate, Admin predeploy, 12-route no-config Chromium/Firefox gate and CI build/lint/typecheck/smoke/predeploy/bundle/deploy all pass. General Preview route/asset/MIME/redirect/protected-boundary smoke passes. Dedicated QR verification is BLOCKED: the active public page/API returns 503, and authenticated `/api/admin/image-qr` returns `server_not_configured` because Preview lacks the server Supabase key. Authenticated route verification also fails on Projects data loading; do not call it a successful authenticated Preview. Local visual/interaction QA and in-memory save/readback pass. No production schema, content, Storage or Cloudflare configuration was changed.

Evidence: successful GitHub Actions run `34315660819`; immutable general Preview smoke passed. The separate QR probe expected active HTML 200 but received 503; owner-authenticated read returned HTTP 500 / `server_not_configured`. This is an environment prerequisite, not a passed golden workflow. The first CI bundler failure was resolved by plain JSON imports, tsx test execution, and a successful local Wrangler 3.90.0 Function build. Release and additive migration remain unapplied.


Scope: Jay selected design option 1 and approved implementation with defaults for existing QR resources, followed by staff adjustment. Implemented two-image mobile page, fixed-material loader, enlargement, library/enquiry actions and protected staff selector with preview, optimistic save and unsaved-change handling. Existing QR values and product objects are preserved; no live writes have occurred. Shared finish-image JSON preserves static/import image paths and secondary order. Brand/design alignment: product application and real finish evidence are separate, material facts remain qualified and compact. Host build/lint/typecheck, smoke, QR behavior, content-import and stone-detail checks passed during implementation. Admin predeploy and 12-route Chromium/Firefox config gates passed. Clean Node 20 container gate passed after making the REST-only test fixture reject socket use without requiring Node 22 WebSocket globals. In-app browser visual/interaction QA passed, including two image dialogs, zoom/Escape/focus restoration, exact library link and catalog metadata cleanup. Isolated staff-selector UI verified Tuscany Cross Cut/Honed preview and saved/clean state. The first CI run passed build/lint/typecheck/smoke/Admin gates but Wrangler 3.90 rejected JSON import attributes during Function bundling. Switched Functions to plain JSON imports and the QR verifier to the existing tsx runner; no runtime dependency or deployment-tool upgrade is needed. Preview release evidence will follow. Production migration and authenticated UI golden save/refresh remain pending, and default associations require staff confirmation.

Last updated: 2026-09-02

## Entry - 2026-08-17 (Quality-first Project Image Delivery)

- Read-only production inspection found 72 unique published Project Storage images totalling 390.1MB at source: median 5.65MB, 48 above 5MB, and a maximum 9.83MB / 8832px. Thirteen CMS cover originals total 75.2MB even though desktop cards render around 348–401px and list thumbnails render at 120px. The inline Project uploader and publish promotion previously retained and publicly served the same original bytes with no responsive variants.
- Preserved the original-upload contract and added `ProjectResponsiveImage` plus a pure delivery helper. Only published `urblo-public-media` object URLs use responsive Supabase transformations; local curated sources stay unchanged. Card/list profiles use quality 82, detail/hotspot quality 86, and heroes quality 88 with widths up to Supabase's 2500px limit. Transform failures fall back once to the retained original.
- Updated the Project upload surface to say that the original is kept at full quality and that high-quality website versions are prepared automatically. The UI no longer frames optimization as an alarming original-to-small-file compression ratio.
- Focused source checks pass: `npm run agent:public-content-overlay`, `npm run agent:admin-projects-aggregate`, `npm run lint`, and `npx tsc -b`. Local Browser QA at 1440x900 confirmed grid cards select a 960px WebP profile, switching to List selects 240px for a 120px thumbnail, and West Side Place hero selects 2500px at quality 88 with `fetchPriority=high`. At 390x844 the hero selects 960px and document width remains 390px; both viewports have no relevant console warning/error.
- A representative 4.84MB West Side Place source produced a 179KB 960px quality-82 card response and a 1.39MB 2500px quality-88 hero response. The deliberately larger hero result preserves design inspection quality rather than targeting the smallest possible byte count. No production write, Storage mutation, configuration change, deployment, or original-file replacement occurred.
- Commit `c383983` passes build, lint, typecheck, both Project/public-content source verifiers, Admin CMS predeploy, smoke, Admin config gate, Harness checks, and the clean Node 20 Docker/Colima gate. The gate's only working-tree warning is for two pre-existing user-owned untracked files; neither file is staged or committed. Branch Preview delivery remains pending.

## Entry - 2026-08-11 (Homepage Partner Logo Marquee Expansion)

- Processed the 12 supplied partner marks into controlled PNG assets under `public/media/launch/homepage/partners`, using explicit brand filenames and bounded crops for oversized source canvases. Exact-hash comparison found no duplicate in the supplied batch or against the four existing marks.
- Added all 12 marks to the existing homepage white logo strip without changing its section height, item sizing, direction, or surrounding Manifesto/video composition.
- Replaced the three-copy/`-50%` mismatch with two equal 7,832px desktop groups and extended the duration from 30 seconds to 120 seconds so the 4x roster keeps the previous per-logo pace. The duplicate group is hidden from assistive technology; reduced-motion users receive an unanimated horizontally scrollable row.
- Local Browser QA passed at the default desktop viewport and 390x844: the marquee rendered between Manifesto and Video CTA, its transform advanced over time, both loop groups remained equal width, all 16 accessible brand names appeared exactly once, the mobile document stayed at `scrollWidth = clientWidth = 390`, and the console had no warning/error.
- `npm run build`, `npm run lint`, and `npx tsc -b` pass. `npm run agent:smoke` initially could not bind its Preview port inside the sandbox, then passed unchanged outside the sandbox, including the nested Admin Projects aggregate check. The known Browserslist staleness notice remains.
- Jay accepted the local desktop/390px result. Commit `0bcd446` passed the clean Node 20 Docker/Colima gate and was pushed to Draft PR `#21`. Cloudflare immutable Preview `https://6da30082.urblo.pages.dev` passed all public/Admin routes, recursively discovered asset MIME/body checks, redirects, form Function safe-failure checks, and the protected Projects boundary. Deployed desktop/390px Browser readback confirmed the partner region, all 16 unique accessible brand names, zero relevant console warnings/errors, and no 390px horizontal overflow.
- Evidence closeout commit `6218a53` passed the clean container gate and immutable Preview `a928c861`; its first Function read hit the normal Cloudflare propagation window, then an unchanged full rerun passed. PR `#21` merged as `b1e8b315` and deployed as immutable production `https://8f2af15d.urblo.pages.dev`. The immutable URL, apex, `www`, and moving Pages alias pass deployment-bound route/asset/redirect/Function smoke. Production Browser readback confirms two equal 7,832px desktop groups with an advancing transform, all 16 accessible names exactly once, zero relevant console warnings/errors, and 390px `scrollWidth = clientWidth`. The first immutable production Function read also raced propagation and passed on the unchanged full rerun.

## Entry - 2026-08-10 (Route-aware Public Navbar Glass Restoration)

- Git history and rendered production styles showed that the public header was still a translucent black surface, but Projects and Stone Library placed it over a solid-black 102px support band. The two layers visually collapsed into opaque black; image-first and white-start routes also shared one tint despite needing different contrast.
- Added explicit `overlay` and `light-page` surfaces to the shared header. Homepage, banner-image layouts, Capabilities, and Article detail use lighter overlay glass; Projects, Stone Library, ordinary white-start layouts, and 404 use deeper smoked glass over a light shared clearance. The opened menu inherits the route mode with stronger blur.
- Replaced the retired solid-black layout fallback and extended smoke coverage to enforce the route-aware source contract, reject a black fallback band, and require all compiled opacity utilities.
- Local rendered QA covered Homepage, Products, Capabilities, Projects, Stone Library, Article detail, 404, the opened desktop menu, and the opened 390px mobile menu. Computed styles matched the intended surface modes and blur, and no checked route had horizontal overflow.
- Commit `242d84f` passed the clean Node 20 Docker gate. PR `#18` Preview deployed as immutable `https://b15782a6.urblo.pages.dev`; the initial Function read raced deployment propagation and returned one transient 404, then direct readback returned 204 and the full rerun passed every route, recursively discovered asset, redirect, Function, and protected-Function boundary.
- PR `#18` merged to `main` as `93fd143c65c0463f135707681e0b290dfdfbeb9c`. After the normal custom-domain switch window, immutable Preview, apex, and `www` passed byte/MIME-bound full smoke. Production browser readback confirmed the intended route tints and no overflow, but Jay rejected the 24px Header / 40px menu blur as too frosted. Git history then confirmed the original March-May material was `backdrop-blur-sm` (about 4px) with no added saturation. The follow-up retains the route-aware tint/backing repair and restores the original clear, lightly softened glass; the first production result is technical evidence, not user acceptance.
- The clear-glass correction passed local desktop/390px rendering, build, lint, typecheck, smoke, Harness checks, and the clean Node 20 Docker gate. PR `#19` deployed as immutable Preview `https://ac951868.urblo.pages.dev`, whose full route/asset/Function smoke and desktop/mobile 4px computed-style checks passed, then merged as `36e69e5feafc63e915c4f23505b47fb0ddd650ed`.
- After the normal edge convergence window, apex and `www` passed byte/MIME-bound smoke against `ac951868`. Production browser readback confirmed the image-page Header at rgba 0.5 / 4px blur with no saturation and the 390px Header/menu at 4px blur, with no horizontal overflow.

## Entry - 2026-08-04 (Public Stone Library Origin Hidden)

- Removed origin from public Stone Library cards and detail specifications while retaining the underlying data and Admin field.
- Removed origin from public free-text matching so a hidden field cannot produce unexplained search results, and removed origin disclosure from listing/detail route metadata.
- Rebalanced the four remaining detail specification cards across responsive breakpoints.
- Added public-readiness contract checks and updated the design/architecture disclosure boundary. Build, lint, typecheck, public/SEO readiness, smoke, Harness checks, and the clean Node 20 container gate pass.
- Local and PR `#16` Cloudflare Preview browser checks passed on listing/detail at desktop and 390px: 13 cards rendered without country text, the detail showed only Type/Availability/Raw Block/Price Range, hidden-origin search returned zero for `China`, no horizontal overflow appeared, and no relevant browser warning/error was recorded. Preview route/asset/Function smoke passed at `https://codex-hide-stone-origin.urblo.pages.dev`.
- PR `#16` merged to `main` as `160b4f1df66557f2591ca971f63ad1afb2513362` and deployed as immutable Cloudflare release `https://76ae7fe0.urblo.pages.dev`. Immutable/apex/`www` deployment-bound smoke passed. Production desktop and 390px listing/detail readback confirmed no Origin/country disclosure, four balanced detail specs, no horizontal overflow, and no relevant browser warning/error.

## Entry - 2026-08-03 (Projects Count and Production Data Normalization)

- Production read-only list inspection explained the `All 9 / Saved 4 / Live 1 / Hidden 4` mismatch: four canonical imported Projects were Draft, West Side Place was Published, and all four Archived rows were exact QA markers. The public site still showed five because static fallback retained the four Draft counterparts and the one Published row overlaid its matching static slug.
- Jay approved execution through completion, explicitly covering the UI release, publishing the four canonical Draft Projects, and permanent deletion of exactly the four confirmed archived QA Projects. This does not authorize other content, migration, Storage, user, or email writes.
- Current source makes the default Projects list/count non-Archived, renames the filters to Projects/Drafts/Live, and exposes Archive only when archived rows exist. Row badges use Draft/Live/Archived. `npm run agent:admin-projects-aggregate` now rejects the old raw-All and Saved/Hidden filters.
- Source build, lint, typecheck, Projects aggregate coverage, Admin CRUD coverage, Admin predeploy/config gates, Harness checks, Cloudflare Preview smoke, and the clean Node 20 container gate pass. The branch Preview at `https://codex-projects-clear-counts.urblo.pages.dev` authenticated as the production owner and showed exactly five real Projects by default, four Drafts, one Live item, and four QA-only Archive rows; Archive-to-Projects interaction and 390px no-overflow behavior passed.
- The protected Admin UI published Australian Catholic University, Xavier College, and Artisan Park | YarraBend and read each back as Live. Moon Gate | Woolley Street correctly refused publication because its referenced Angola Black and New Grey Stone Library groups remain Draft and its two imported hotspots are not yet bound to Project materials. Publishing those Stone Library records was outside the approved Projects-only production-write scope, so the validation was not bypassed.
- A guarded production transaction permanently deleted only Project IDs `1`, `2`, `3`, and `9` after rechecking their exact QA slugs and Archived state. Project children and one private QA aggregate draft were removed by the defined dependency contract; two QA Article block links were set to null by their existing foreign key. Media assets `1`, `2`, `3`, and `119` and all audit history were retained.
- Production SQL readback now reports exactly five Projects: IDs `4`-`7` Published and Moon Gate ID `8` Draft; zero Archived Projects, zero QA parent/child/draft rows, four retained referenced media assets, and two safely cleared QA Article links. Authenticated Preview readback shows `Projects 5 / Drafts 1 / Live 4` with no Archive control or QA text. Public Preview still shows all five canonical Projects because Moon Gate continues through the explicit static fallback.
- PR `#14` merged to `main` as `edd33465b350f657ebfd8c3075807e92fbe3600b`. Production switched to the new entry asset, authenticated `https://urblo.com.au/admin/projects` read back `Projects 5 / Drafts 1 / Live 4` with no Archive/QA row, and public `https://urblo.com.au/projects` read back all five canonical titles. The formal custom-domain smoke could not be bound to an eight-hex immutable Pages URL because local Wrangler has no Cloudflare API token and the browser required a new GitHub OAuth grant; that grant was not approved or created. This missing deployment identifier is a release-evidence limitation, not a failing production UI/data readback.

## Entry - 2026-08-02 (Jay Acceptance of Projects Phase 1)

- After PR `#11` reached production and its deployment-bound technical checks passed, Jay used the production result and reported: `试了试没问题。OK`.
- This is the required Jay-owned user acceptance for the deployed Projects Phase 1 and single-editor follow-up; it is not an agent self-certification and does not close unrelated Admin golden workflows.
- `NOW-ADMIN-UX-RESHAPE-001` remains `now` because the approved directive continues with Phase 2 replication, Phase 3 guide/Harness consolidation, and mandatory sunset deletion of `docs/ADMIN_UX_RESHAPE_PLAN.md`. The next module is Articles.

## Entry - 2026-08-02 (Public Opacity Repair and Single-Editor Projects Simplification)

### Scope
- Traced the public Projects/navbar display failure to Tailwind not generating non-default percentage opacity utilities such as the header's `bg-black/88` and menu's `bg-black/96`. Added the complete integer opacity scale and a built-CSS smoke assertion for the critical public utilities.
- Verified the local public Projects header and opened menu render with the intended opaque dark backgrounds at desktop and mobile widths, with no horizontal overflow or relevant console errors.
- Removed Project proof-review controls and approval-dependent publish blockers. Client and protected server Save paths now normalize legacy project/fact/material review columns automatically; required copy, references, media, server promotion, conflict handling, audit, Auth, and RLS boundaries remain.
- Removed the Dashboard Project claim-review queries and rewrote its visible workflow as Edit, Save, Publish. No Supabase migration or production write was required or performed.

### Verification State
- `npm run agent:admin-projects-aggregate`: pass.
- `npm run build`, `npm run lint`, `npx tsc -b`, `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`, `npm run agent:admin-cms-predeploy`, isolated 11-route `npm run agent:admin-config-gate`, `npm run agent:check`, JSON parsing, and `git diff --check`: pass.
- `npm run gate`: pass in the clean Node 20 Docker/Colima build for implementation commit `fa205e0`; an unrelated user-owned untracked brief remained untouched and was reported by the gate.
- Local visual verification: public Projects desktop/mobile navbar and menu backgrounds pass.
- Draft PR `#11` implementation commit `610d4b2` deployed as immutable Preview `3b285f72-fafa-46c5-abc8-8ccda419b738` at `https://3b285f72.urblo.pages.dev`. No-write Cloudflare smoke passed all public/Admin routes, recursive assets, redirects, safe-failure form Functions, and the protected Projects endpoint. Strict owner login passed all nine authenticated Admin routes.
- Deployed `/projects` readback found header `rgba(0, 0, 0, 0.88)`, opened menu `rgba(0, 0, 0, 0.96)`, equal `scrollWidth/clientWidth` at 1280px, and no relevant console warnings/errors.

### Risks and Gaps
- The Preview login runner proves route/auth shells, while source/behavior checks prove removal of Project review controls; neither is Jay's fool test or a content-write workflow.
- Production remains on merge `25c05ebb` until Jay separately approves promotion of this follow-up.

### Jay Correction: Match Stone Library Header Treatment
- Jay rejected the first PR `#11` public-header result. The prior diagnosis focused on missing compiled opacity utilities but missed the route-level difference: Stone Library supplies a 102px black `DefaultLayout` support band behind the translucent header, while Projects had disabled that band and compensated with page-local white padding.
- Projects listing and detail now use the same default layout band as Stone Library. The duplicate `pt-[102px]` values and obsolete detail loading offset are removed.
- Local rendered checks pass at 1280px and 390px for Projects listing, opened navigation menu, and Project detail: support band is black and 102px high, main content begins at 102px, width has no overflow, and no relevant console warning/error appears.
- Correction commit `9d93624` passed the clean Node 20 container gate and was pushed to draft PR `#11`. Cloudflare immutable Preview `b438de5b-b341-4fe5-bb49-bb944f7f8c30` at `https://b438de5b.urblo.pages.dev` passed every public/Admin route, recursive asset/redirect/Function boundary, blocked-Supabase static fallback, and all nine authenticated Admin routes.
- In-app Browser verification against that immutable Preview confirmed Stone Library and Projects both use the translucent `rgba(0,0,0,0.88)` header at a 102px main offset; Projects listing/detail and the opened desktop/mobile menu have no horizontal overflow.
- After Jay's explicit promotion approval, PR `#11` merged as `59cded9bca05ccee69fafe0ab92e4486debf14f9` and Cloudflare deployed immutable production `76de2abf-a27b-4ecb-9e1f-fe229af4c8ed` at `https://76de2abf.urblo.pages.dev`. The immutable deployment passed full route, recursive asset, redirect, Function, and protected-Projects endpoint smoke.
- The first immediate custom-domain read occurred during Cloudflare's switch window: `www` still referenced the old entry and apex served one stale dynamic asset as SPA HTML. No rollback or data write was attempted. Fresh deployment-bound reruns passed for both `https://urblo.com.au` and `https://www.urblo.com.au`, with exact root/recursive asset identity against the immutable deployment; production owner login then passed all nine Admin routes and blocked-Supabase static fallback.
- Final in-app Browser production readback at 1280px and 390px confirmed the Projects header at `rgba(0,0,0,0.88)`, the shared 102px main offset, an opened mobile menu, and zero horizontal overflow. This is deployment evidence, not Jay's fool test.

### Next Handoff
- `NOW-ADMIN-UX-RESHAPE-001`: Jay runs the production Projects fool test.

## Entry - 2026-08-02 (Projects Production Runtime and Contract B)

### Scope
- Merged PR `#9` at production merge `25c05ebb727974f60d2d205e6f66e99dccf53afc` and verified immutable Cloudflare deployment `877d13c4-1e28-45d7-a62a-afdd3b0e0dda`.
- Verified the immutable URL, `urblo.com.au`, and `www.urblo.com.au` with deployment-bound route, asset, redirect, Function, and protected Projects endpoint smoke checks. Production owner login passed all nine authenticated Admin routes.
- After Jay's separate migration-only approval, applied contract B as production version `20260802105537` and aligned source to `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql`.
- Read back all six Project table and sequence privilege boundaries, legacy mutation-policy removal, RLS state, hardened public policies, retained service-role writes, and security advisor state. The operational Project edit freeze is lifted.

### Verification Results
- Authenticated direct insert/update/delete privileges: false on all six Project tables; select remains true.
- Authenticated usage/select/update privileges: false on all six Project sequences.
- Service-role insert/update/delete and sequence usage: true.
- All six tables retain RLS; only admin/public SELECT policies remain, with public children bound to approved Published parents.
- Security advisor: no new B-specific issue; existing leaked-password and intentional tombstone-RPC warnings remain.

### Risks and Gaps
- Jay's fool test remains the acceptance boundary and cannot be self-certified by an agent.
- A Cloudflare-only rollback to the legacy direct-write Projects UI is invalid after B.
- Real two-session/Postgres/Storage negative writes remain optional and require fresh approval.

### Next Handoff
- `NOW-ADMIN-UX-RESHAPE-001`: Jay runs the production Projects fool test.

## Entry - 2026-08-02 (Fresh Projects Preview And Minimum-Disclosure Migration C)

### Delivery Gate And Preview
- Installed and started the Homebrew-managed Docker/Colima runtime, added the Docker Buildx plugin, and passed `npm run gate` in a clean Node 20 container for commit `a79a364`. The local branch was pushed through that commit and opened as draft PR `#9`.
- Cloudflare bound commit `a79a3645383fea7e55b5cc5cdc8bee6487aa0f20` to deployment `a20062a0-951e-4d18-8aae-31e69f537b6f` at `https://a20062a0.urblo.pages.dev`. The immutable Preview smoke passed all public/Admin routes, recursive asset MIME/body checks, redirects, safe-failure form endpoints, and the protected Projects API boundary. The real owner login check passed all nine authenticated Admin routes. No content, Storage, invitation, or production runtime write occurred.
- The C readback/documentation checkpoint `fdf7a47` also passed the clean Node 20 container gate and deployed as `480ac707-7c03-4f21-98c7-52d388ce5f83` at `https://480ac707.urblo.pages.dev`; its immutable smoke passed. The strict Firefox login runner then exposed a verifier-only false positive: Supabase Storage's Cloudflare response emitted `Cookie “__cf_bm” has been rejected for invalid domain`, which Firefox classified as a console error even though the app does not set or consume that cookie. The message reproduced twice. Direct in-app browser verification on the same immutable deployment signed the owner into `/admin`, opened the real `/admin/projects/4` workspace, found meaningful content and no relevant application warnings/errors, and made no content changes.
- `scripts/check-admin-auth-browser.mjs` now ignores only that exact third-party `__cf_bm` invalid-domain diagnostic. Every other console error and every page error remains blocking. This synchronizes the verifier with browser reality; no UI/runtime behavior was changed to satisfy the check.

### Approved C Apply And Readback
- Jay separately approved only the production minimum-disclosure migration C. Read-only preflight found project `npkidywzwddbnfrnxlmo` active/healthy on Postgres 17.6.1, A applied, C/B absent, and the old tombstone RPC returning all four archived QA slugs.
- Applied migration `restrict_archived_project_tombstones` once. Supabase recorded production version `20260802103337`; source is aligned as `supabase/migrations/20260802103337_restrict_archived_project_tombstones.sql`, and the still-unapplied contract B is ordered after it as `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql`.
- Function readback matches the reviewed C source: it is owned by `postgres`, remains `STABLE SECURITY DEFINER`, has an empty `search_path`, reads only `public.projects`, and no longer references `private.project_drafts`. `PUBLIC` has no execute privilege; `anon`, `authenticated`, and `service_role` retain intentional execute access.
- The four archived QA Projects remain in their existing Archived state, but the RPC result changed from those four slugs to an empty list, exactly matching the intersection of archived canonical Projects and the five bundled public fallback slugs. No Project row, child row, draft, media record, Storage object, audit record, user, email, or runtime configuration was created or changed.
- Security advisor output remains the known leaked-password-protection Auth warning plus the two expected generic warnings for the intentionally browser-callable, slug-only `SECURITY DEFINER` function. Performance findings are pre-existing and unchanged in scope; C introduced no table, policy, or index changes.

### Next Approval Boundary
- Migration C is closed. Keep Project editing frozen. The next production write is promotion of the matching aggregate runtime from PR `#9`; it requires a separate explicit approval. Contract B remains unapplied and requires another approval/readback only after the aggregate runtime is live. Jay's fool test remains the final acceptance and cannot be self-certified.

## Entry - 2026-07-19 (Projects Closeout Negative Paths And Tombstone Repair)

### Problems Found And Source Repair
- The approved Preview marker `admin-projects-ui-mrroa6p0` was not one of the five bundled static Project slugs. Its Hide/public-not-found result proved that a non-static archived CMS page disappears, but it did not exercise static-fallback tombstone suppression. Subsequent read-only production analysis found A's public `get_archived_project_slugs()` returns four QA slugs, including one never-published marker, so the minimum-disclosure concern is a concrete data-boundary defect.
- Added source migration `supabase/migrations/20260802103337_restrict_archived_project_tombstones.sql`. It replaces the public function with the exact intersection of archived canonical Projects and the five slugs already public in `src/data/projectData.ts`, returns the allowlisted constant, and never reads `private.project_drafts`. The contract migration moved to `20260802105537_project_aggregate_write_lockdown.sql`. Both C and B remain unapplied and require separate, fresh production approvals/readback.
- Added defence in depth in `src/service/ProjectService.ts`: unknown RPC results cannot hide or enumerate anything outside the bundled public Project set. The overlay verifier now injects an unknown private-style slug and proves it is discarded.
- A `revision_conflict` previously set a reload notice without disabling editor mutations; ordinary Discard could then clear the warning while retaining the stale revision/timestamp. The editor now locks fields and Save/Publish/Hide during conflict, hides ordinary Discard, and leaves Reload latest as the only recovery that fetches fresh tokens.
- The Projects verifier now executes deterministic, no-network full-handler behavior: a stale Save preserves the structured 409 `revision_conflict`; a failed Publish copies a mocked private image create-only, verifies the copy, receives an RPC conflict, checks references, removes the exact nonce path, records `project.aggregate.publish_compensation`, and reports the cleanup summary. This closes source orchestration evidence, not real two-session/Postgres/Storage behavior; any live negative write needs fresh approval and should not intentionally force compensation-delete/audit failure in production.

### Harness Parity And Approval Boundary
- The closeout audit found both TypeScript-importing verifier scripts used Node's `--experimental-strip-types`, which is unavailable in the protocol's Node 20 container. Added explicit dev dependency `tsx`, routed both scripts through it, and made the parent Admin CRUD coverage runner invoke the Projects verifier through the same local `tsx` entry. Direct Node 20.20.2 execution now passes the Projects verifier, the nested CRUD coverage chain, and the complete Admin CMS predeploy chain. A test-only nonfunctional WebSocket constructor lets Supabase initialize its unused Realtime client under Node 20 while still failing any accidental socket use.
- The first final predeploy rerun exposed two stale documentation-string assertions for the Stone Library and Article public read paths. The docs keep the more accurate Published-first/static-fallback contract, and `scripts/check-public-supabase-readiness.mjs` now verifies that contract instead of forcing the old wording; the complete rerun passed.
- Fresh host-side verification passed: `npm run build`, `npm run lint`, `npx tsc -b`, `npm run agent:smoke`, `npm run agent:admin-cms-predeploy`, the isolated 11-route `npm run agent:admin-config-gate`, Projects aggregate/public overlay/foundation/public Supabase checks, Cloudflare source readiness, Harness checks, Harness GC/review with zero failures and two known documentation-size/date warnings, JSON parse, and `git diff --check`. Direct Node 20.20.2 execution passed the complete Admin CMS predeploy chain, including both `tsx`-backed TypeScript-importing verifiers. `npm audit --omit=dev` reports zero production dependency vulnerabilities; existing development-tool advisories were not expanded into this Projects closeout.
- No Supabase migration, content/Storage write, invitation, Cloudflare configuration change, runtime promotion, push, or production deployment occurred. Project editing remains frozen. Next delivery order is fresh gate and immutable Preview, separately approved C apply/readback, separately approved production runtime promotion, separately approved B apply/readback, then Jay's fool test. The 2026-07-16 Docker exception applied only to the original push and is not reused here.

## Entry - 2026-07-19 (Projects Authenticated Preview Workflow)

### Approved Scope And Preview Configuration
- After Jay's separate approval for the cleanable tagged Project/Storage workflow, production Project editing was placed under the documented operational freeze. The approved scope covered one owner-driven aggregate Project happy path plus restoration of the temporary Stone prerequisite; it did not authorize production runtime promotion, contract migration B, invitations, destructive cleanup, or any other production content change.
- Cloudflare Pages Preview received `VITE_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SERVICE_ROLE_KEY` as Preview-only secrets. Production Cloudflare configuration was not changed. Retrying commit `9441811` produced immutable deployment `1a3e0d4b-d74a-4979-be64-921e5a510ccc` at `https://1a3e0d4b.urblo.pages.dev`; the no-write smoke passed 23 public/Admin/404 routes, recursive JS/CSS MIME/body integrity, configured browser-secret boundaries, nine redirects, form safe-failure behavior, and the protected Projects API boundary. Owner sign-in reached the real configured Admin, and an invalid bearer request returned `401 invalid_session`, not `server_not_configured`.
- Production had no Published Stone family, so the workflow temporarily published existing archived QA fixture `stone_groups.id = 1` through the normal Stone Library UI. No real Draft stone copy was changed. Audit `154` recorded `stone_group.publish`.

### One-Save Project Evidence
- Marker `admin-projects-ui-mrroa6p0` was used throughout. The owner created Project `9` in the page-shaped editor with Overview fields, one approved Fact, one approved Stone/Finish material, one material map, one visually created hotspot moved by keyboard from 50/50 to 55/55, and one inline image uploaded with alt text. Upload audit `155` proves the image began private-first in `urblo-admin-media` as Media `119`.
- Unsaved `Open preview` used the public Project renderer and showed the title, hero, Fact, material, map, hotspot, and `Ready to publish` before Save. The public-shaped hotspot rendered at `left: 55%; top: 55%`.
- The complete aggregate was saved exactly once with no confirmation dialog. Audit `156` is the only `project.aggregate_draft.save` for Project `9`, revision `1`, with `liveStatus = null` and one Fact/Material/Map/Hotspot. The canonical Project did not yet exist; reload then read back every saved field and the 55/55 point from the private aggregate.

### Publish, Public Readback, Hide, And Restore
- Publish created canonical Project `9` and all four child rows as Published. Audit `157` recorded `project.aggregate.publish`; Media `119` was copied create-only to `urblo-public-media`, and audit `158` recorded removal of the private source with no retained private object. The public Preview route displayed the complete Project, both image uses, material map, and 55/55 hotspot.
- Hide produced audit `159` and archived Project `9`, its Fact/Material/Map/Hotspot, and private aggregate revision `3`. An anonymous REST read of the slug returned `200 []`, and a cache-busted public route read rendered `Project not found` without the tagged title.
- The temporary Stone fixture was restored through the normal UI to its exact original Archived state. Audit `160` records `stone_group.archive`; final Stone counts are 0 Published, 12 Draft, and 4 Archived. Its Variant and Finish image remain Draft and their linked Media remains Archived.
- Final residual state follows the approved archive-first/no-destructive-delete contract: the tagged Project aggregate and audit history remain Archived; Media `119` and one 123,161-byte public JPEG remain Published so the archived record's historical reference is not broken; the private upload source is gone. Physical deletion would require a separate retention/destructive-delete approval.

### Acceptance Boundary And Next Action
- This closes the authenticated Preview implementation happy path for exactly-one-Save, refresh persistence, shared unsaved preview, inline private-first media, visual hotspot, Publish/public readback, Hide, and public-not-found for a non-static QA slug. It did not prove bundled static-fallback tombstone suppression. It is not a production deployment proof, does not update `docs/agent/admin-handoff-evidence.json`, and is not Jay's unassisted fool test.
- `NOW-ADMIN-UX-RESHAPE-001` remains `now`. The later closeout entry records deterministic conflict/compensation evidence and the selected minimum-disclosure repair. Keep the Project edit freeze through a fresh Preview, C, aggregate runtime promotion, B, and Jay's fool test. Contract B was not applied in this workflow.

## Entry - 2026-07-19 (Projects Aggregate Expand Migration A)

### Approved Production Scope
- Jay explicitly approved only the Production expand migration for the Projects aggregate. The approved action was apply/readback of `project_aggregate_drafts`; it did not authorize tagged Project or Storage records, invitations, contract migration B, or production runtime promotion.
- Read-only preflight found project `npkidywzwddbnfrnxlmo` active and healthy on Postgres 17.6.1. Migration A's objects were absent, no unrelated transaction was waiting, existing Project counts were 8 projects, 44 facts, 5 materials, 4 material maps, 17 media blocks, and 4 hotspots, with 5 Draft and 3 Archived projects. The focused foundation, Projects aggregate, public-readiness, and diff checks passed before apply.

### Apply And Readback
- Applied migration name `project_aggregate_drafts` once. Supabase recorded production version `20260719015649`; the local file is aligned as `supabase/migrations/20260719015649_project_aggregate_drafts.sql`, and the unapplied contract step is ordered after it as `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql`.
- Readback confirms `private.project_drafts`, `admin_project_aggregate(...)`, `get_archived_project_slugs()`, both child lifecycle indexes, and the Facts/Materials lifecycle columns exist. The private draft table contains 0 rows. All six existing Project/child counts and the 5 Draft / 3 Archived status split are unchanged; Facts and Materials have zero parent-lifecycle mismatches.
- The aggregate RPC is `SECURITY DEFINER`, has an empty `search_path`, returns `jsonb`, and is executable only by `service_role`. The tombstone RPC is also search-path pinned and deliberately executable by `anon`, `authenticated`, and `service_role`; its read-only call returned the 3 archived slugs without exposing archived records. Browser roles have no table privileges on `private.project_drafts`; the pre-existing authenticated schema usage remains necessary for private RLS helpers and does not grant draft-table access.
- Contract B was not applied: all 18 legacy Project write policies remain, authenticated insert/update/delete privileges remain on all six Project tables, and authenticated sequence usage remains on all six Project sequences. The aggregate list read returned all 8 Projects and left the private draft table at 0 rows.

### Advisor And Residual State
- The security advisor reports the pre-existing leaked-password-protection Auth warning plus two expected generic warnings because the slug-only archived-project function is browser-callable `SECURITY DEFINER`. No archived record or draft JSON was exposed, but A did not yet enforce the public-fallback minimum. The private draft table was empty at this readback; the later closeout audit found canonical QA slugs still made the endpoint over-broad and supersedes the earlier assumption that the issue was only hypothetical.
- Performance advisor INFOs include the two new lifecycle indexes as unused immediately after creation and four unindexed actor foreign keys on the empty private draft table. These do not block the expand readback; no unapproved follow-up DDL was applied, and they remain visible for later review before contract closure.
- No test Project, media row, Storage object, audit record, invite, recovery email, public content status, or production runtime was created or changed by this step beyond the approved lifecycle backfill and schema objects.
- Post-bookkeeping no-write verification passed: JSON parse, `git diff --check`, `npm run agent:supabase-foundation-readiness`, `npm run agent:admin-projects-aggregate`, `npm run agent:public-supabase-readiness`, `npm run agent:check`, Harness GC/report with no failures, and the full Cloudflare preview smoke against latest deployed preview `https://d29d45cf.urblo.pages.dev` for commit `9441811`.

### Next Approval Boundary
- Migration A is closed. At this checkpoint the next step required a second action-specific approval and a continuous Project edit freeze; that approved happy path is recorded above. The later closeout entry now governs C, fresh Preview, runtime promotion, B, and Jay's fool-test boundary.

## Entry - 2026-07-16 (Phase 1 Branch Push Gate Exception)

### Gate Decision
- Phase 1 implementation commit `389023f` was created only after the full host-side runtime, Admin, Harness, readiness, plan-only, JSON, diff, and read-only responsive browser checks passed.
- The required post-commit `npm run gate` stopped before executing any project check because this workstation has no Docker-compatible runtime (`docker: command not found`). This was an unavailable runner, not a code-test failure; no attempt was made to disguise the result as a green container gate.
- Jay explicitly approved a one-time exception on 2026-07-16 to skip Docker for this push and defer installation until a later cycle. The exception applies only to pushing the current `codex/admin-ux-reshape` candidate using the already-green host-equivalent evidence; it does not change `docs/OPERATING_PROTOCOL.md` or authorize future pushes without the normal container gate.
- No Supabase migration, tagged Project/Storage write, invite, or production promotion is included in this exception.

### Branch Preview Evidence
- Pushed `codex/admin-ux-reshape` through commit `30e9b57` (`389023f` is the Phase 1 implementation commit; `30e9b57` records the one-time gate exception). Cloudflare associated that exact commit with deployment `1c3372dd-d4b0-49c1-a02b-ffee96e60ee3` and immutable URL `https://1c3372dd.urblo.pages.dev`.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://1c3372dd.urblo.pages.dev` passed: all public/Admin route shells, recursively discovered JavaScript/CSS status and MIME/body checks, configured-bundle/browser-secret boundaries, legacy redirects, safe-failure form Functions, and the protected `/api/admin/projects` boundary passed without content or Storage writes.
- The branch alias `https://codex-admin-ux-reshape.urblo.pages.dev` and immutable URL both returned HTTP 200. GitHub's Cloudflare check callback still displayed `in_progress` at the final readback even though the immutable deployment was already serving and passed the independent smoke; keep that callback lag visible rather than calling it a completed check.

### Next Handoff
- Stop for Jay's separate approval before applying expand migration `supabase/migrations/20260719015649_project_aggregate_drafts.sql`.
- Do not begin the tagged authenticated Project/Storage workflow under that approval; it remains a second action-specific production-write decision after expand migration readback.

## Entry - 2026-07-14 (Admin Projects Phase 1 Source Candidate)

### Scope
- Implemented the approved Phase 1 Projects vertical prototype in local source as a page-shaped aggregate workspace: one aggregate draft and sticky action bar, collapsible sections in public-page order, shared public/draft rendering, visual hotspot placement, inline private-first media, and archived-slug suppression so a hidden CMS project does not reappear from bundled fallback.
- Added accessible up/down ordering for facts, materials, media blocks, maps, and map-scoped points; continuous sort indexes are derived from visible order rather than exposed as editor fields. The Projects list/editor now remain side by side around 1116px, narrow section actions wrap, and material-map tabs have roving keyboard/tabpanel semantics.
- Removed the global user-facing legacy/migration fallback card and disabled redundant clean Save, already-live Publish, and already-hidden Hide actions.
- Kept the searchable picker bounded to the latest 500 library rows while exact-batch-fetching every image referenced by the loaded draft; referenced private signed previews refresh every 45 minutes. Dirty-state comparison is computed once in the parent editor page instead of duplicated during hotspot movement.
- Added a protected `/api/admin/projects` Pages Function and service-role-only aggregate RPC source for list/get/save/publish/archive. Aggregate save and its audit event are transaction-bound; publish persists the request's current draft revision before applying the canonical aggregate.
- Updated behavior-level Harness coverage for the new editor rather than preserving obsolete string assertions.

### Security And Reliability Boundaries Present In Source
- The Function keeps the service-role key server-side, authenticates an active admin profile, allows Viewer reads only, and normalizes new or claim-bearing Editor changes back to `needs_review` instead of trusting browser-supplied approval state. The RPC locks and rechecks that profile against the Function's initial trusted role so a concurrent role change fails closed. Existing canonical Projects also carry a required `baseUpdatedAt` token from GET through POST/RPC, including first adoption before a private draft exists.
- Publish performs early checks plus transaction-local media and taxonomy reference rechecks. The locked canonical token comparison precedes every first-adoption draft/canonical write and all later Publish/Hide mutations. PGRST errors carry the structured HTTP detail shape expected by the Function mapper so intended conflict/permission responses do not collapse into generic upstream errors.
- Private-to-public Storage promotion is create-only with byte verification. A failed publish performs reference-aware compensation for public copies created by that request and reports retained objects when safe cleanup cannot be proven.

### Production And Acceptance Boundary
- Projects database rollout is split into two source-only migrations. Expand migration `supabase/migrations/20260719015649_project_aggregate_drafts.sql` creates the private draft/RPC contract and writes the child lifecycle backfill. Contract migration `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql` later revokes legacy browser table/sequence writes and hardens public parent/child policies. Jay has not approved either migration and neither has been applied or read back in production.
- No Phase 1 production content/Storage write, branch preview, authenticated aggregate save/publish/public-readback/hide workflow, or production promotion occurred in this source milestone.
- The full host-side local suite passed on 2026-07-14: build, lint, typecheck, agent smoke, Admin CMS predeploy, Admin config gate (11/11 routes), Harness check, Supabase/public/Cloudflare readiness, aggregate/CRUD coverage, plan-only admin CRUD/content-import checks, JSON parsing, and `git diff --check`. The preferred clean-container `npm run gate` remains the final post-commit pre-push check.
- A read-only local Playwright implementation check used the real owner session plus a mocked aggregate GET endpoint, with POST requests forced to 405. It verified the 1116px side-by-side workspace, clean action states, and the inline dirty-navigation choice. It also exposed a 390px shell overflow; the mobile grid/nav containment was fixed, the page read back at `scrollWidth === innerWidth`, and the aggregate verifier now guards that containment. This is implementation evidence only, not the authenticated preview workflow or Jay's fool test.
- `NOW-ADMIN-UX-RESHAPE-001` remains `now` and cannot be marked done from source inspection, Harness checks, screenshots, or agent self-review.
- Jay alone owns the documented unassisted fool-test acceptance; it remains pending.

### Next Handoff
- Commit the complete Phase 1 candidate, run the clean-container gate, push the branch preview, and run its no-write smoke before requesting approval for expand migration `supabase/migrations/20260719015649_project_aggregate_drafts.sql`.
- After expand readback, request separate action-specific approval for tagged Project/Storage writes, then freeze all Project editing before the authenticated preview workflow. Keep the freeze through aggregate UI/endpoint production promotion and contract readback so legacy child-table writes cannot overlap the new aggregate path.
- Request a fresh separate approval before applying contract migration `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql`; then read back table/sequence privileges, public policies, and security advisor state before lifting the freeze. After contract, a Cloudflare-only rollback to the legacy direct-write UI is invalid.

## Entry - 2026-07-14 (Admin UX Reshape Directive And Phase 0 Read-Only Audit)

### Direction And Task State
- Imported Jay's approved `docs/ADMIN_UX_RESHAPE_PLAN.md` directive from the Claude review branch into `codex/admin-ux-reshape`; the complete sunset clause remains part of the temporary authority.
- Registered `NOW-ADMIN-UX-RESHAPE-001` as `next`, preserving the max-three active-task rule while Phase 0 remains open. The task prohibits copy-only Clarify loops, requires behavior verification to follow the new UI, and reserves the fool test for Jay.
- No Phase 1 runtime source was changed before the Phase 0 prerequisites.

### Phase 0 Read-Only Evidence
- Supabase migration history stops at `20260603142359 project_media_blocks`; `20260713065628_media_public_bucket_role_hardening.sql` is not applied.
- Production `storage.objects` INSERT/UPDATE policies currently allow active Editor access to both `urblo-admin-media` and `urblo-public-media`, confirming the direct-public-write gap remains open.
- `npm run agent:admin-media-role-boundary-live` passed in plan-only mode: distinct owner/editor credentials and the browser-safe key are present; no login, network request, Storage object, update, delete, or other production write occurred.
- Official Supabase guidance confirms Site URL is the default fallback and recommends exact production redirect paths. The app requests `https://urblo.com.au/admin/account-setup?mode=invite` and `?mode=recovery`; the prior delivered invite's localhost callback remains failing evidence.
- The available Supabase database connector cannot read hosted Auth URL configuration, and the local environment has no Management API token. Chrome reached the Supabase/GitHub sign-in screen but had no existing dashboard session, so configuration readback and mutation stopped pending Jay login plus item-specific approval.

### Phase 0 Approved Auth URL Configuration
- Jay logged into the production Supabase dashboard and explicitly approved only the Auth URL configuration change. The initial dashboard readback showed Site URL `http://localhost:3000` and no Redirect URLs.
- Site URL was changed to `https://urblo.com.au`; the dashboard returned `Successfully updated site URL` and a fresh readback showed the saved value.
- Added and precisely read back the two approved allowlist entries: `https://urblo.com.au/admin/account-setup?mode=invite` and `https://urblo.com.au/admin/account-setup?mode=recovery`. A second read-only browser pass verified all three persisted URLs; the recovery value was checked in fixed-length chunks to avoid Chrome title truncation.
- No invite or recovery email was sent, no database migration was applied, and no Storage object or policy was written during this action. Auth URL configuration is closed as a Phase 0 prerequisite; custom Auth SMTP ownership and the real invite/recovery golden workflow remain open.
- The Auth action ended before any migration or Storage write; the separately approved migration is recorded below.

### Phase 0 Approved Media Role Migration
- Jay separately approved applying the Media role migration only; tagged Storage object writes were explicitly outside this approval.
- Pre-apply readback confirmed production migration history ended at `20260603142359 project_media_blocks`, while both `urblo_storage_admin_object_insert` and `urblo_storage_admin_object_update` still allowed active Editors across the private and public buckets.
- Applied `media_public_bucket_role_hardening` to production project `npkidywzwddbnfrnxlmo`. Supabase recorded version `20260714050750`; the local migration filename and Harness references were aligned to `supabase/migrations/20260714050750_media_public_bucket_role_hardening.sql`.
- Post-apply readback confirms the INSERT policy allows owner/admin/editor for `urblo-admin-media` but only owner/admin for `urblo-public-media`. The UPDATE policy has the same split in both `USING` and `WITH CHECK`.
- The security advisor reports one current warning: Auth leaked-password protection is disabled. This is unrelated to the Storage migration and was not changed without separate approval. Performance advisor findings are pre-existing unused-index and multiple-permissive-policy notices; no migration-specific Storage/RLS security lint appeared.
- No Storage object, media metadata row, invite, recovery email, or content status was created or changed during the migration action. Phase 0 then blocked only on the separately approved tagged Editor/owner Storage role-boundary proof recorded below.

### Phase 0 Tagged Media Role-Boundary Proof
- Jay separately approved the exact tagged production Storage proof. It used the existing active Editor and owner accounts through the browser-safe key; it did not send email or mutate content/database records.
- The first marker, `media-role-1784006293326-a081ef77`, exposed a verifier defect after the role operations: the public object update and cleanup readbacks reused a cached URL, so Supabase Smart CDN returned the earlier bytes and a temporary HTTP 200 after deletion. Exact `storage.objects` readback was already zero rows, proving cleanup had succeeded rather than leaving an object behind.
- Updated `scripts/check-admin-media-role-boundary-live.mjs` so every byte and absence readback uses a unique `cacheNonce`, requests no-cache, uses a short QA cache TTL, and reports CDN diagnostics on byte mismatch. This follows Supabase's documented update/delete invalidation window without weakening the rule that a fresh origin read returning an object is a hard cleanup failure.
- The corrected strict run passed for marker `media-role-1784006428939-3520f05f`: Editor private insert/update succeeded; Editor public insert/update was denied and did not alter the owner-created object; owner public insert/update succeeded; and every tagged object was removed with absence read back.
- Independent production SQL after the run returned zero `storage.objects` rows for both markers. No tagged object, email, media metadata row, audit/content row, or content status remains from this proof.
- Phase 0 is closed. `NOW-ADMIN-UX-RESHAPE-001` moved into `now`; the separately decision-gated Turnstile task moved to `next` so the queue remains at three active executable tasks. Phase 1 starts with the approved Projects vertical prototype, while Jay retains the fool-test acceptance.

## Entry - 2026-07-13 (PR #6 Production Recovery And Evidence-Bound Cache Gate)

### Deployment Result
- Cache-repair PR `#6` merged as `a2a7ae5`; Cloudflare production deployment `c7a910df-6dd3-440b-8971-a6120353ed19` completed at immutable origin `https://c7a910df.urblo.pages.dev`.
- The immutable deployment passes the MIME/body-aware asset smoke across 59 recursively discovered JavaScript/CSS assets. Both `https://urblo.com.au` and `https://www.urblo.com.au` are bound to that exact deployment by root asset identity plus full-graph byte-for-byte and MIME comparison.
- Apex production passes with four residual response-header warnings on `Home-esKw3164.css`, `publicEntitySeo-CgpviqMQ.js`, `projectFactValue-CROx5WB9.js`, and `supabase-KVA2hGew.js`. Each warned response has exact byte and MIME equality with the immutable deployment; `www` passes without warnings. These stale headers are operational cleanup, not evidence of stale or malformed current code.
- The Cloudflare dashboard session available to this run was signed out and no Cloudflare API token was present, so no cache purge or account configuration mutation was attempted.

### Harness Closure
- `scripts/check-cloudflare-preview-smoke.mjs` now rejects redirects on every direct SPA route, requires every route to reference the same entry assets as `/`, rejects absolute/protocol-relative/query/fragment/namespace-escaping asset references, then compares every recursively discovered same-origin query-free production JavaScript/CSS asset against an independent immutable deployment when `--reference-url` is supplied. Redirect-to-home, route-specific stale shells, URL substitution, status, empty bodies, SPA HTML fallbacks, MIME, bytes, graph budget, bundle markers, browser-secret boundaries, legacy redirects, and Function safe failures remain hard gates.
- A residual year-long cache header remains a hard failure without `--reference-url`. With a reference it becomes a warning only after exact bytes and MIME match; source readiness still hard-fails any project-authored `Cache-Control:` line in `public/_headers`.
- Production apex, `www`, and the moving `urblo.pages.dev` alias are matched after FQDN trailing-dot normalization and require `--reference-url`; it accepts only an HTTPS `https://<8-hex-deployment>.urblo.pages.dev` origin and must differ from `--base-url`. Negative checks proved a missing production reference, trailing-dot bypass, production-domain self-reference, immutable self-comparison, route redirect, route-specific stale shell, absolute asset URL, and query-bearing asset URL all fail, while the previous PR `#5` deployment fails root asset identity.

### Production Admin Verification
- `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`: pass. The browser gate proved three blocked-Supabase public static fallbacks, all nine authenticated admin routes, Sign out, and a protected-route revisit.
- This is no-write production auth/route evidence. It does not prove editor draft save/refresh, Storage promotion, publish/public readback, archive, Settings public readback, invite/password setup, password recovery, responsive workflow completion, Dashboard use, or editor-guide usability.
- No Supabase content row, Storage object, content status, invite, recovery email, Cloudflare setting, or DNS record was changed during this production recovery/readback.

### Verification
- Docker remained unavailable, so the documented host-equivalent runtime gate passed in order: `npm run build`, `npm run lint`, `npx tsc -b`, and `npm run agent:smoke`.
- `npm run agent:admin-cms-predeploy`, `npm run agent:admin-config-gate` (11/11 routes), `npm run agent:cloudflare-readiness`, `npm run agent:check`, JSON parsing, and `git diff --check`: pass.
- `npm run agent:harness-gc` and `npm run agent:harness-gc:review`: zero failures; the only warning is the intentional historical WORKLOG size threshold.
- Bound production smoke: apex and `www` pass against `https://c7a910df.urblo.pages.dev`; the previous immutable deployment and missing-reference negative runs fail for the intended reasons.

### Remaining Boundary
- Production `/admin` is reachable and authenticates on the repair deployment; the prior cached-asset release blocker is superseded.
- CMS handoff remains `revalidation_required` until the confirmed localhost Auth callback configuration is corrected, the pending Media Storage migration is applied/read back and its Editor/owner role proof passes with explicit write approval, and all twelve UI golden workflows are recorded against one deployment.

## Entry - 2026-07-13 (PR #5 Production Asset Cache Incident And Harness Repair)

### Deployment And Discovery
- Harness PR `#5` merged as `cb0ec9a`; Cloudflare deployment `4aef2ba1-3e00-4e43-b5d6-1ac962fbf02d` completed successfully at `https://4aef2ba1.urblo.pages.dev`.
- Branch-preview route/asset/redirect/Function smoke passed. The immutable production deployment then passed blocked-Supabase static fallback for Products, Projects, and Articles plus all nine authenticated admin routes, Sign out, and protected-route revisit.
- The first custom-domain smoke appeared to pass, but the production auth/fallback check failed on `/products`. Direct inspection proved the custom origin returned the SPA HTML shell with HTTP 200 for `/assets/index-JYM_HDIO.css`, `/assets/publicMediaUrl-DnH1XMRj.js`, and `/assets/publicContentOverlay-DLdr1C4F.js`; the same exact paths returned real CSS/JavaScript from the immutable deployment. The custom responses were Cloudflare cache hits, while a query-string cache miss returned the correct asset.
- A browser receiving the exact cached `publicMediaUrl` URL produced `error loading dynamically imported module` and a blank public page. This is a real production custom-domain failure, not a test-only discrepancy.

### Harness And Runtime Repair
- `scripts/check-cloudflare-preview-smoke.mjs` previously asserted only HTTP 200 for recursively discovered assets, then parsed an HTML fallback as if it were JavaScript. It now checks the exact browser URL without cache-busting, requires JavaScript/CSS MIME types, and rejects a doctype, HTML document, or React root shell body on an asset path.
- The asset traversal now resolves both `/assets/...` and relative `./chunk.js` / `../chunk.js` references, rejects redirects and empty bodies, accepts only exact JavaScript/EcmaScript media types or `text/css`, rejects the removed year-long immutable asset policy, and fails explicitly if the recursively discovered graph exceeds 200 entries instead of silently truncating coverage.
- Production smoke accepts an optional immutable `--reference-url` and requires the custom origin's root entry/style asset identity to match it. This binds a green custom-domain result to the newly promoted deployment instead of allowing a complete but stale version to pass.
- Removed the project-authored one-year `/assets/*` and `/fonts/*` immutable cache rules plus the one-day `/media/*` override. Cloudflare Pages default cache/revalidation behavior now owns static assets; `agent:cloudflare-readiness` fails if those custom cache patterns return.
- The first host-equivalent gate exposed a local `.claude/worktrees/.../.vite` dependency cache to the root ESLint scan. ESLint now ignores nested Vite caches and the machine-local Claude worktree root, so lint measures the active working tree instead of generated files from a separate checkout.
- A negative production run of the strengthened gate fails on the cached CSS false 200, proving the new assertion detects the incident.
- Semantically equivalent, explicit source/CSS edits produce new hashes for all three affected assets and their importing chunks, avoiding the poisoned exact cache keys on the repair deployment. The local configured build now emits `index-BPfkogHO.css`, `publicMediaUrl-BCnm8sfh.js`, and `publicContentOverlay-C9qA3frw.js` instead of the cached paths.
- No Supabase content row, Storage object, profile, invite, recovery email, or audit event was created by this incident diagnosis or repair.

### Local Verification
- Docker remains unavailable, so the documented host-equivalent gate passed: `npm run build`, `npm run lint`, `npx tsc -b`, `npm run agent:smoke`, `npm run agent:check`, and `git diff --check`.
- `npm run agent:cloudflare-readiness`: pass with project-authored asset/font/media cache overrides required to remain absent.
- Strengthened deployed smoke: pass against the local production build; expected fail against the currently affected production origin on the cached CSS HTML shell.
- Immutable-reference mode: pass against the local build when its root entry/style identity matches the supplied reference origin; production promotion will supply the exact `*.urblo.pages.dev` deployment URL.
- `npm run agent:admin-cms-predeploy`: pass in no-write mode; `npm run agent:admin-config-gate`: 11/11 pass; configured `npm run agent:admin-auth-browser -- --allow-login --strict`: pass for three blocked-Supabase fallbacks, nine authenticated routes, Sign out, and protected-route revisit.
- Harness GC: zero failures; the only warning remains the intentional historical WORKLOG size threshold.

### Current Boundary
- PR `#5` immutable deployment evidence is valid, but production custom-domain health is not. The repair must pass the MIME-aware smoke on both its immutable URL and `https://urblo.com.au`, followed by the authenticated production browser gate, before the release is called green.
- The admin handoff remains `revalidation_required`; the Auth redirect, Media migration/role proof, and twelve golden workflows remain separate open work.

## Entry - 2026-07-13 (QA Editor Provisioning And Harness Reality Repair)

### Scope And Approved Account Change
- Jay approved creating a separate production QA Editor and keeping its credentials in the ignored local `.env`.
- The local browser-safe Supabase key plus owner and Editor credentials are now present without being printed or committed; `.env` remains mode `0600`.
- The first test invite used an address unavailable in the connected mailbox. Its newly created, still-unconfirmed Auth user was removed with an ID/email/age/confirmation-constrained cleanup; the historical invite audit event remains.
- A final approved QA Editor invite was created through the protected production Function. The email arrived, but its callback fell back to `http://localhost:3000` even though the Function supplied the production origin. This confirms an incorrect or incomplete Supabase Auth Site URL/Redirect URL configuration.
- The one-time invite was consumed directly through the Auth API only to activate the QA account for role testing. Password sign-in and the account's own active `editor` profile RLS readback passed. This direct activation does not satisfy the Settings invite/password golden workflow.

### Harness Problems Confirmed
- `scripts/check-admin-auth-browser.mjs` still matched the retired display copy `Admin login`, so the repaired login page produced a false failure before authentication.
- `scripts/check-admin-config-gate.mjs` reused the normal `dist/`; after a real browser key was added locally, the supposed no-config check exercised a configured bundle and failed for the wrong reason.
- The auth-browser check also reused any existing `dist/`, so an old bundle could pass while current source was broken. Its Sign out assertion stopped at the returned login page and did not reopen a protected route to prove the session was actually gone.
- The env-less build had hidden a configured-build regression: with the Supabase browser key present, the main entry had grown to approximately 627.72 kB. Merely splitting a vendor file would remove the per-file warning without proving that Supabase left the eager entry path.

### Repairs
- Added a stable `admin-login-form` test marker and removed display-copy matching from login/signed-out state assertions.
- The no-config gate now builds a dedicated temporary bundle with all browser-safe Supabase variables explicitly cleared. It no longer depends on the normal configured `dist/`.
- The auth-browser gate now builds current source into its own configured temporary bundle, enforces a maximum 500,000-byte entry file, rejects eager Supabase module preload, aborts the dynamic Supabase chunk and proves Products/Projects/Articles still render static fallback, signs in, verifies all nine authenticated routes, signs out, then reopens `/admin/media` and verifies the protected redirect again.
- Both browser gates now require the current preview process to report readiness, verify the served HTML references the entry hash from that gate's isolated build, treat early process exit as failure, and force cleanup if graceful preview shutdown stalls. This prevents an old service already occupying the port from producing a false pass.
- The public Supabase client now loads on demand. Vite keeps it in a dedicated vendor chunk, but the configured `index.html` does not module-preload that chunk; this improves the dependency boundary instead of only suppressing a size warning.
- A failed dynamic SDK chunk load or client construction now resolves as no public client, resets the in-flight initializer for a later retry, and preserves the existing static-content fallback instead of rejecting Product, Project, or Article page loads. Public settings still requests the chunk shortly after the first public render, so this change removes it from the eager entry/preload path; it does not claim the homepage never downloads Supabase.

### Verification Results
- `npm run build`: pass. Configured output entry `416.89 kB`; Supabase vendor `211.64 kB`; no `>500kB` warning; Supabase is absent from `dist/index.html` preload links. The existing Browserslist staleness notice remains.
- `npm run agent:admin-auth-browser -- --allow-login --strict`: pass against an isolated configured current-source build for three blocked-Supabase static fallback routes, all 9 authenticated routes, Sign out, and the protected-route revisit. No content rows, Storage objects, or audit events were created by this browser check.
- `npm run agent:admin-config-gate`: pass for 11/11 routes against the isolated no-config build.
- Port-conflict negative check: pass. With a dummy service occupying the strict preview port, `agent:admin-config-gate` failed instead of accepting the old service, confirming the early-exit/readiness/entry-hash guard prevents that false pass.
- `npm run agent:public-supabase-readiness`: pass after the public client became asynchronous/on-demand.
- `npm run agent:public-content-overlay`: pass.
- `npm run agent:admin-media-role-boundary-live`: the earlier plan-only run now finds distinct owner/Editor/browser-key inputs; it made no login or Storage write and still requires migration readback plus explicit approval for the tagged live proof.
- `npm run lint`, `npx tsc -b`, `npm run agent:smoke`, `npm run agent:check`, `npm run agent:admin-cms-predeploy`, and `git diff --check`: pass.
- `npm run agent:harness-gc` and `npm run agent:harness-gc:review`: zero failures; the only warning is the intentional historical WORKLOG length threshold.

### Remaining Boundary
- Production Auth callback configuration is not fixed. Email arrival plus a localhost callback is a failing invite-flow result, not partial handoff completion; Auth custom SMTP ownership is also still unverified.
- The pending Media Storage role migration was not applied, and no content row, content status, Storage object, password-recovery email, or golden-workflow mutation was created in this checkpoint.
- The Harness/runtime follow-up in this entry still requires reviewed deployment, production no-write smoke, and a production auth-browser rerun. The twelve-workflow handoff remains `revalidation_required`.

## Entry - 2026-07-13 (Admin Reliability Preview And Production Deployment)

### Scope
- Rebased the admin reliability/UX repair onto current `origin/main`, preserved the operating protocol and image-optimization work, and kept the unrelated untracked SEO external AI brief draft (never committed) out of the release.
- Added `.dev.vars` to `.gitignore` and changed the local `.env` mode from `0644` to `0600`; no secret value was printed, staged, or committed.
- Published branch `codex/admin-reliability-ux`, opened PR `#3`, verified its Cloudflare preview, and merged it to `main` after the preview gate passed.
- Verified Cloudflare production deployment `6d193af5-cf8e-4541-a1e2-c73164d1a290` for merge commit `46d46b4` at immutable URL `https://6d193af5.urblo.pages.dev` and production origin `https://urblo.com.au`.

### Verification Results
- Docker was unavailable on this workstation, so the documented host-equivalent fallback ran in order: `npm run build`, `npm run lint`, `npm run agent:smoke`, `npm run agent:check`, and `git diff --check`: pass.
- `npm run agent:admin-cms-predeploy`: pass in no-write mode.
- `npm run agent:admin-config-gate`: 11/11 Firefox route checks passed.
- `npm run agent:harness-gc` and `npm run agent:harness-gc:review`: zero failures; one intentional warning remains because `docs/WORKLOG.md` is over the 8,000-line review threshold.
- Cloudflare branch preview `https://codex-admin-reliability-ux.urblo.pages.dev`: deployment success and `npm run agent:cloudflare-preview-smoke` pass.
- GitHub PR `#3`: merged to `main` as `46d46b4` after the Cloudflare preview check passed.
- Cloudflare production deployment and the GitHub Pages workflow: success.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass for public/admin route shells, recursively discovered assets, admin bundle secret/config boundaries, representative redirects, and safe no-write Function behavior.

### Result And Remaining Boundary
- The repair is now deployed; the previous statement that production still ran the old admin build is superseded by this entry.
- Deployment proves buildability and public/no-write route behavior only. It does not prove signed-in editor save/refresh, private-media promotion, publish/public readback, archive, settings consumption, invite/password setup, recovery, responsive authenticated navigation, Projects task completion, Dashboard operations, or editor-guide usability.
- The pending Media Storage role migration was not applied and no Supabase row, Storage object, invitation, recovery email, or content status was changed during this release.
- A separate QA Editor still needs provisioning before the approved Editor/owner role-boundary proof. Production handoff remains `revalidation_required`.

## Entry - 2026-07-13 (Admin Reliability And Task UX Re-Audit)

### Scope
- Reopened the production CMS handoff after Jay reported that `/admin` was not working and was extremely difficult to use.
- Read the Harness control documents, inspected the implemented admin/public data paths, and reviewed the current production admin at a common 1116 x 799 desktop viewport without signing in or writing data.
- Treated prior route-shell screenshots and direct browser-key/API mutations as historical infrastructure evidence, not proof that an editor can complete the UI workflow.
- Made local source, UI, contract, and Harness repairs only. No deployment, production login, Supabase write, Storage write, invitation, recovery email, content publication, or archive action was attempted.

### Management And Harness Findings
- The earlier strict handoff check could pass from a WORKLOG `Pass` phrase plus valid URL/email inputs. It did not require a login, draft save/refresh, publication, public readback, archive, invitation, or recovery result.
- The June auth browser check proved authenticated route shells and sign-out. The June CRUD verifier mutated tables directly through browser-key/RLS calls. Both were useful infrastructure tests, but neither represented the actual editor product.
- This created a completion-evidence mismatch: the Harness was strong on source contracts, schema/RLS posture, and safe live-write gating, but weak on task-level product outcomes.
- Current truth is spread across `AGENTS.md`, `docs/HANDOFF.md`, `docs/agent/status.json`, the approximately 200 KB task queue, the approximately 668 KB WORKLOG, and many exact-copy source checks. The compact startup surfaces help, but current claims can still drift unless evidence is machine-bound to a deployment.
- The machine queue marked `NOW-ARTICLE-STRUCTURE-CLAIMS-001` done even though its own notes and current handoff said claim cleanup was paused and acceptance was unmet; it is now `next`, matching the user decision and remaining work.
- `docs/agent/admin-handoff-evidence.json` v2 is now the machine-readable production assertion. It starts as `revalidation_required`, expires evidence after seven days, requires one immutable Cloudflare deployment URL and a real local Git commit SHA, and requires tracked or same-deployment evidence for every editor golden workflow.
- The strengthened readiness checker now rejects source/documentation drift even in report mode. Missing live evidence remains report-only before deployment and becomes blocking under `--strict`.

### Confirmed Reliability Failures
- The Supabase auth listener called session/profile work from inside `onAuthStateChange`, matching Supabase's documented client-lock deadlock pattern.
- Settings could invite an Auth user, but there was no safe account-setup/password-recovery product flow. Contact/Sample Request SMTP2GO proof did not prove Supabase Auth email delivery.
- Invite redirects accepted a browser-supplied URL, and a failed profile insert could leave an orphaned invited Auth user.
- Media loading was capped at 80 records while the imported library contained 115 candidates. Selecting new External media could be overwritten by the selected-record effect.
- Publishing private Storage media changed database metadata without copying the object to the public bucket. Public adapters then read `source_url`, so Storage-backed uploads had no usable public URL.
- Public services replaced an entire static category as soon as any Published CMS row existed. Publishing one record could hide unrelated static records.
- Published `site_settings` had an admin editor but no public consumer.
- Lifecycle copy said Archive removed content from the website, while migration fallback can reveal a matching legacy static record after the CMS version is hidden.

### Confirmed UX Failures
- The production Projects screen mounted all project, fact, material, media, map, and hotspot editors in one page. At 1116 x 799 it was approximately 9,600 pixels tall before completing a normal record task.
- Projects had no stable selected-record URL, no unsaved-change warning, repeated non-searchable media selects, and no task-stage focus.
- Most admin modules are large page monoliths that expose the database shape rather than an editor workflow. Projects was approximately 3,200 source lines before this repair; Stone Library was approximately 2,500.
- The repository has extensive source-string and live API verifiers but no normal component/integration/end-to-end suite for editor behavior. Generated configuration-gate browser specs do not replace an authenticated editor journey.
- Production contains visible tagged QA residue in leads/content queues, which makes the operational dashboard harder to trust.

### Local Source Repairs
- Deferred auth refresh outside the synchronous Supabase auth-state callback. Same-user/token refreshes now run in the background without unmounting the active editor; initial login, sign-out, and genuine user transitions retain blocking state changes.
- Added focused sign-in, forgot-password, invite/recovery account setup, explicit expired/invalid-link states, keyboard focus indicators, and announced error/success states.
- Bound implicit invite/recovery callbacks to the captured token pair inside a separate non-persistent/no-refresh/no-URL-detection Auth client. The shared browser client no longer auto-consumes URL sessions, captured callback credentials are removed from the address bar, and the same isolated client verifies the callback user and writes the password. A different login in this or another tab therefore cannot rebind the callback, and opening a password link cannot replace an unrelated shared admin session. The completion screen returns to explicit password sign-in instead of inferring access from whichever shared session is present. Query-string spoofing, stale/unrelated sessions, reused links, and unsupported PKCE callbacks fail safely.
- Derived invite callbacks from the request origin, disabled server URL-session detection, removed the browser redirect input, and delete the newly invited Auth user if profile creation fails.
- Increased Media loading to 500 records, stabilized new External records, and validated external/hosted media as safe HTTP(S) or root-relative URLs.
- Forced every initial Media upload into the private bucket. A failed metadata insert is read back before cleanup; owner/admin roles can best-effort remove a confirmed private orphan, while editors receive an explicit private-only orphan warning because their role cannot delete Storage objects.
- Restricted private-to-public automatic promotion to Website owner/CMS manager roles and bound it to the selected record's original private bucket/path plus `updated_at`. Promotion creates a new public object without overwrite, reads back ambiguous or zero-row guarded updates, and checks for other media-record references before rollback or private-source cleanup, retaining the object whenever ownership cannot be proved.
- Added pending migration `supabase/migrations/20260713065628_media_public_bucket_role_hardening.sql` so the same private-first rule is enforced by Storage RLS: Editors retain private-bucket insert/update, while public-bucket insert/update requires owner/admin. It is source-verified only and was not applied to production in this session.
- Added `npm run agent:admin-media-role-boundary-live` as a default no-network/no-write plan and approval-gated browser-key/RLS verifier. Live mode requires distinct active Editor and owner/admin credentials, proves Editor private insert/update success plus public insert/update denial, proves owner/admin public insert/update success, and fails unless all tagged objects are removed. The handoff evidence schema now treats applied-migration/readback plus this live role proof as a required production prerequisite separate from the twelve editor workflows.
- Extended `npm run agent:live-readiness` with that separate role-boundary check. It distinguishes the older owner/admin private-upload/anonymous-denial proof from the Editor public-bucket policy proof, rejects matching Editor/owner email identities, and keeps migration readback plus approval for that exact tagged role proof as explicit non-secret manual gates; `--media-role-migration-verified` records readback only, while the dedicated `--media-role-writes-approved` avoids conflating this permission with general CRUD approval. Neither flag applies SQL or runs writes.
- Public media resolution now requires a Published media row, accepts Storage objects only from `urblo-public-media`, and rejects unsafe external URL schemes.
- Added per-canonical-record Published CMS overlay for Projects, Products, Articles, and Stone Library so unrelated static fallback remains visible.
- Matching Published Projects retain static-only sector/category/material/map/gallery/CTA fields until the schema/public adapter owns them; facts/media dependency failures reject the CMS overlay instead of replacing healthy fallback with partial content.
- Added a validated public consumer for Published default site settings covering company name, supported footer/contact/social data, homepage SEO defaults, and default share image. Admin Published saves and public parsing share exact normalization/validation; later public mounts refetch instead of reusing a permanent success/failure cache; a static fallback result receives one bounded 750 ms retry that is cancelled on unmount; `/admin` does not perform this public settings fetch.
- Added runtime metadata plus Article/WebPage/Breadcrumb JSON-LD for resolved Published CMS Project, Product, Article, and Stone detail routes so CMS SEO fields/defaults replace the initial SPA fallback and stale static entity JSON-LD after the entity loads. Brand-new CMS-only URLs still need a release-time sitemap and crawlable first-HTML strategy.
- Lazy-loaded admin route modules, kept one stable Admin/Auth provider across `/admin/*` navigation, and kept medium-desktop header actions wrapped instead of clipped.
- Reworked Projects around stable `/admin/projects/:projectId` URLs and Overview, Facts, Materials, Media, and Maps/hotspots workspaces. Only the active workspace mounts; all six editor forms have baseline-derived unsaved-change warnings across record/new/tab/admin-navigation/sign-out/history/reload transitions; child saves update only their own row/baseline; publish blockers jump to the correct workspace; media selection is searchable.
- Added request-generation guards to Project bundle/hotspot and Article-section loads. Project/Article child saves capture the original parent and editor identity, constrain UPDATEs by parent ownership, block record switching while writes are active, and ignore a response after its parent/editor is no longer current instead of reparenting or overwriting another record.
- Added the same parent/row identity capture, ownership-constrained UPDATEs, in-flight parent-switch locks, and stale bundle/capability rejection to Products and Stone Library child editors.
- Made the Articles, Projects, Products, and Stone Library editor grids inert while a parent catalog or child bundle is incomplete. Parent selection now clears stale child forms/readiness first, enters loading state, and only the current selection generation releases it, so another record's sections/capabilities cannot drive Save or Publish. Articles now validates before taking the save lock and releases that lock in `finally`, preventing invalid or exceptional saves from freezing the editor until refresh.
- Restricted Project structured facts to JSON text or text arrays in Admin and defensively normalize legacy object/number values before public React rendering. Published Article CTA/video destinations now share a root-relative-or-http(s) contract in Admin and the public renderer, rejecting protocol-relative, unsafe-scheme, control-character, and encoded-backslash inputs.
- Updated Archive/status language across content modules to distinguish hiding the CMS version from removing a matching legacy fallback.

### Verification Results
- `npm run build`: pass. Admin route chunks are separate; the known Browserslist data-staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/admin/account-setup` and `/admin/projects/1` route shells.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.
- `npm run agent:admin-crud-coverage`: pass, including isolated callback-password writes, private-only initial Media uploads, selected-path/version promotion guards, metadata readback, reference-safe Storage cleanup, parent ownership, loading interaction boundaries, and Articles save-lock release source contracts.
- `npm run agent:public-content-overlay`: pass, including unmatched-static retention, Published precedence, Draft media rejection, and unsafe media URL rejection.
- Targeted ESLint and `npx tsc -b`: pass after the Project/Article concurrency, structured-fact, safe-link, dynamic JSON-LD, and Settings retry repairs.
- `npm run agent:admin-crud-coverage`: pass after parent-ownership predicates and stale-response guards were added to Projects and Article sections.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:supabase-foundation-readiness`: pass, including the pending owner/admin-only public-bucket insert/update policy source.
- `npm run agent:admin-media-role-boundary-live`: pass in plan-only mode. It reported the missing live credentials, made no network call, login, upload, update, or delete, and did not claim the migration was applied.
- `node --check scripts/check-live-readiness.mjs` and targeted ESLint for the live-readiness/role-boundary verifiers: pass.
- `npm run agent:live-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au`: pass in report-only mode. It lists the production URL and admin email without printing secrets, keeps the migration/approval/Editor-owner credential gates missing, and does not query or mutate Supabase.
- Synthetic no-network identity checks: pass. Both readiness reporting and the role-boundary verifier reject `Same@Example.com` versus `same@example.com` as the same account even when every other fake input/flag is present; the readiness item remains `ready: false`.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:seo-readiness`: pass.
- `npm run agent:admin-cms-predeploy`: pass in no-write source/report mode.
- `npm run agent:check`: pass.
- `npm run agent:harness-gc` and `npm run agent:harness-gc:review`: zero failures and one intentional warning for the 12,000-line historical WORKLOG.
- Strict admin handoff readiness: expected fail. The repaired source is not deployed, the applied-migration/role-boundary prerequisite is missing, and all twelve production workflow/usability evidence items remain missing or stale.

### Residual Risks And Explicit Follow-Ups
- Production still runs the previous admin build. This entry does not claim that the user's production problem is closed.
- Supabase Auth custom SMTP and exact allowed invite/recovery redirect URLs remain unverified. The implemented callback supports implicit token-pair links only; PKCE `?code=` callbacks are deliberately rejected until a state-bound code-exchange flow is designed.
- Media promotion spans Storage and database operations and cannot be atomic in the current browser workflow. Original-path/version binding, reference checks, and retain-on-uncertainty behavior reduce cross-record deletion risk but do not create a transaction.
- The public-bucket role-hardening migration is not applied in production yet. Until it is applied and read back, a signed-in Editor can still bypass the UI and call the existing public-bucket write policy directly.
- Media search is capped at 500 rather than paginated/virtualized, Projects has confirmation-based protection rather than autosave/draft recovery, and there is no admin-to-public preview contract.
- Products, Articles, Stone Library, Media, Settings, and Leads still need the same task-level UX treatment where user testing shows friction.
- Project materials, maps, and hotspots are editable in admin, but not every stored relationship has a complete public consumer. Multi-table content saves are not transactional.
- The current Project schema has no sector/category fields. Matching legacy Projects preserve static taxonomy, while a brand-new CMS-only Project still receives generic taxonomy until a migration/editor field is designed.
- An Archived CMS record can reveal a matching static fallback until CMS-only cutover. Editors must verify the public route rather than assuming Archive means absence.
- Client-side entity SEO and entity JSON-LD update after JavaScript loads; brand-new CMS-only URLs are not added automatically to the static sitemap or structured route inventory, and deep-link first HTML remains the shared SPA shell.
- Tagged QA residue should be reviewed and cleaned only under an approved retention policy; no destructive cleanup was attempted here.
- Production closure requires applied-migration/readback plus live Editor/owner Storage-role evidence, then deployment and approved evidence for sign-in, draft save/refresh, private media publish, public readback, archive behavior, settings public readback, invite/password setup, recovery, responsive admin navigation, the Projects task workflow, the Dashboard operational queue, and non-technical editor-guide usability against the same deployment SHA.

### Result
- The codebase now has a credible local P0 reliability patch and the first task-oriented editor redesign, plus a Harness that refuses to call the CMS handed off from source checks alone.
- `NOW-ADMIN-RELIABILITY-UX-001` remains `now`. The next action is apply/read back the Storage role migration and pass the approved Editor/owner verifier, deploy one reviewed SHA, configure Auth email/redirects, run the approved production golden workflow, then close Projects pagination/preview gaps before copying the pattern to other modules.

## Entry - 2026-06-30 (Operating Protocol + Container Gate)

### Scope
- Added `docs/OPERATING_PROTOCOL.md` as the session-level working agreement: container-first test-gated delivery (branch -> `npm run gate` -> Cloudflare preview smoke -> promote to `main`) plus the design review -> implement -> remember loop on top of `docs/DESIGN.md` and `docs/brand-baseline.md`.
- Added the local container gate: `Dockerfile.gate` + `scripts/container-gate.sh` + `npm run gate`. Gates run as Docker build steps (build incl. `tsc -b`, lint, `agent:smoke`, `agent:check`), with `git diff --check` host-side.
- Ran an 8-angle adversarial review of the setup (line-scan, removed-behavior, cross-file/harness tracer, reuse, simplification, efficiency, altitude, conventions); 19 confirmed findings were fixed in the same branch.
- Review fixes: `.dockerignore` now excludes `.env*`/`.dev.vars`/`*.local` so secrets never enter the gate image and the build stays env-less; dropped the no-op separate `tsc -b` step; added `agent:check` to the gate; working-tree-vs-commit caveat plus dirty-tree warning; `.github/workflows/deploy.yml` bumped Node 18 -> 20 for parity with the gate; gate registered in `scripts/check-harness.mjs` required files/scripts; `docs/OPERATING_PROTOCOL.md` added to AGENTS.md Canonical Conflict Precedence; honest machine-local wording for the session kick-start hook; npm cache mount and label-scoped image pruning.

### Changed Files
- `docs/OPERATING_PROTOCOL.md`
- `Dockerfile.gate`
- `.dockerignore`
- `scripts/container-gate.sh`
- `package.json`
- `AGENTS.md`
- `.github/workflows/deploy.yml`
- `scripts/check-harness.mjs`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/status.json`
- `docs/agent/verification.md`
- `docs/agent/harness-gc.md`

### Verification Results
- `npm run gate`: pass (container: build incl. `tsc -b`, lint, `agent:smoke` full route/asset/redirect/CTA set, `agent:check`).
- `npm run agent:check`: pass.
- `npm run agent:harness-gc`: pass with only the known `docs/WORKLOG.md` size warning.
- `git diff --check`: clean.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://chore-operating-protocol.urblo.pages.dev`: pass against the branch preview (routes, assets, admin bundle contract, legacy redirects, API safe-failure).

### Residual Risks / Follow-Ups
- Cloudflare Pages build Node version should be pinned to `NODE_VERSION=20` in project settings (account-level change, not repo-side).
- Gate enforcement is protocol-level; platform enforcement (CI + branch protection on `main`) is a decision-gated upgrade.
- The session kick-start memory hook is machine-local to Hunter's machine; other agents rely on the `AGENTS.md` Working Process pointer.

## Entry - 2026-06-12 (SEO Phase 2 Legacy URL Cleanup)

### Scope
- Implemented the Phase 2 GSC legacy URL cleanup in source.
- Added selective 301 rules in `public/_redirects` for old contact, capacity, product, product-category, stone-product, article, and selected trailing-slash public detail URLs.
- Left junk WordPress/admin/plugin/feed/search/upload paths unrescued and out of the sitemap.
- Extended SEO readiness, local smoke, Cloudflare readiness, and deployed preview smoke checks so representative old-to-new redirects are guarded.
- Moved the next SEO work to a Phase 3 content-growth task focused on non-brand specifier search intent.

### Redirect Groups
- Recovered to current pages: `/contact-us` to `/contact`, `/our-capacity` to `/capabilities`, `/product` to `/products`, `/article` to `/articles`.
- Recovered to closest content: `/article/discover-the-art-of-surface-finishes` to the current bluestone finish article, `/product/creama` and `/product-category/limestone` to `/stone-library`, and old bollard/planter/engraved-inlay URLs to `/capabilities`.
- Canonical cleanup: selected indexed trailing-slash project/product/article detail URLs now redirect to their no-trailing-slash canonical paths.

### Changed Files
- `public/_redirects`
- `scripts/agent-smoke.sh`
- `scripts/check-cloudflare-preview-smoke.mjs`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `scripts/check-seo-readiness.mjs`
- `docs/SEO_PHASE_2_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/status.json`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:seo-readiness`: pass. Verified 36 approved sitemap URLs plus representative GSC legacy redirect rules.
- `npm run agent:cloudflare-readiness`: pass. Verified repo-side Cloudflare Pages contract and representative redirect rules.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass. Verified public/admin route shells, assets, CTA contracts, and representative redirect rules including `/contact-us`, `/our-capacity`, `/product/creama`, `/product-category/limestone`, `/stone-product/bollard`, `/article/discover-the-art-of-surface-finishes`, and `/projects/xavier-college/`.
- `npm run agent:check`: pass.
- `npm run agent:harness-gc`: pass with zero failures and the three existing warnings for `AGENTS.md` date, `docs/agent/harness-gc.md` date, and long `docs/WORKLOG.md`.
- `npm run agent:harness-gc:review`: pass and wrote `.tmp/harness-gc-review.md`.
- `git diff --check`: pass.

### Risks and Gaps
- This does not create new keyword-rich content. Phase 3 content growth remains the next SEO work.
- Production redirect behavior requires Cloudflare Pages deployment of this commit before deployed smoke can prove live 301 responses.

### Next Handoff
- Run full runtime/harness gates, push the redirect cleanup, then verify production redirects after Cloudflare deploys the new commit.
- After Google recrawls, monitor whether old WordPress/old-site issues decay and whether canonical sitemap discovery improves.

## Entry - 2026-06-12 (GSC Review and Phase 2 SEO Plan)

### Scope
- Reviewed Google Search Console after the Phase 1 SEO indexability deployment.
- Found that GSC's Page indexing data still reflected a 2026-06-05 crawl state, before the new 36-URL sitemap and crawler files were deployed.
- Submitted/refreshed `https://urblo.com.au/sitemap.xml` in GSC on 2026-06-12.
- Confirmed the next SEO work should not replace Phase 1; it should add a Phase 2 pass for stale sitemap refresh monitoring, legacy URL mapping, selective 301 redirects, and non-brand long-tail landing-page/content improvement.
- Added `docs/SEO_PHASE_2_PLAN.md` as the executable planning document for the next SEO cycle.

### GSC Observations
- GSC showed 21 indexed pages and 29 not indexed pages, with many examples coming from old WordPress or old-site paths rather than the current canonical sitemap.
- Stale submitted sitemap history was visible for `https://urblo.com.au/sitemap.xml` and `https://www.urblo.com.au/sitemap.xml`.
- Search performance was mostly branded; non-brand product, material, and project discovery remains the Phase 2 opportunity.
- HTTPS and Breadcrumb enhancement status did not show a launch-blocking issue; Core Web Vitals lacked enough field data rather than showing a failing score.

### Changed Files
- `docs/SEO_PHASE_2_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/status.json`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`

### Verification Results
- GSC submission: pass. Search Console showed "Sitemap submitted successfully" for `https://urblo.com.au/sitemap.xml`.
- GSC table immediately after submission showed submitted date `12 Jun 2026`, status `Success`, discovered pages `11`, and old `Last read` `3 Aug 2023`; Google processing of the refreshed 36-URL sitemap remains a monitoring item.
- `jq empty docs/agent/status.json docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `npm run agent:harness-gc`: pass with zero failures and three existing warnings: `AGENTS.md` date older than status, `docs/agent/harness-gc.md` date older than status, and long `docs/WORKLOG.md`.
- `git diff --check`: pass.

### Next Handoff
- Monitor GSC until Google actually reads the refreshed sitemap and updates discovered-page/indexing data.
- Later Phase 2 work should follow `docs/SEO_PHASE_2_PLAN.md`.

## Entry - 2026-06-12 (SEO Indexability Foundation)

### Scope
- Implemented Phase 1 SEO indexability foundation for the existing public site without changing visual layout.
- Added `src/data/seoRoutes.ts` as the source-side public SEO route registry for title, description, canonical URL, sitemap priority/change frequency, breadcrumbs, and conservative structured-data inputs.
- Updated `src/App.tsx` so the native head updater reads from the SEO registry, writes robots meta, canonical, Open Graph, Twitter metadata, and client-side JSON-LD.
- Added real static `public/robots.txt` and `public/sitemap.xml`; the sitemap covers 36 approved public canonical URLs across Home, public listing pages, 5 Projects, 13 Stone Library groups, 6 Products, and 4 Articles.
- Added `npm run agent:seo-readiness` and guarded it through `npm run agent:check`.
- Updated Harness docs and task state for the Phase 1 SEO boundary.

### Changed Files
- `src/data/seoRoutes.ts`
- `src/App.tsx`
- `public/robots.txt`
- `public/sitemap.xml`
- `scripts/check-seo-readiness.mjs`
- `scripts/check-harness.mjs`
- `package.json`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/status.json`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`

### Verification Results
- `npm run agent:seo-readiness`: pass. Verified real robots/sitemap files, 36 approved sitemap URLs, no `/admin` or `/api` sitemap exposure, and registry-driven App metadata wiring.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Production readback after push: `https://urblo.com.au/robots.txt` returned static robots text, `https://urblo.com.au/sitemap.xml` returned XML, and production sitemap contained 36 `<loc>` entries.

### Risks and Gaps
- Phase 1 does not make the Vite React app server-rendered or pre-rendered. Deep-link first HTML remains the shared app shell until JavaScript executes; this is documented as a Phase 2 technical SEO decision.
- Google Search Console sitemap submission/indexing evidence is a manual follow-up outside the source-only local gate.

### Next Handoff
- Submit `https://urblo.com.au/sitemap.xml` in Google Search Console and monitor indexed pages/query data after Google recrawls.
- Decide Phase 2 SEO depth: content/CTA polish only, standard Stone/Product/Project landing-page expansion, or deeper public route pre-rendering.

## Entry - 2026-06-11 (Homepage Hero Video Replacement)

### Scope
- Replaced the homepage hero video source using the client-provided local file `Lark20260611-213730.mp4`.
- Did not commit the 74MB source file; generated controlled web assets at the existing public paths so homepage runtime data did not need to change.
- Regenerated the desktop MP4 as H.264 1280x720, 30fps, no-audio, fast-start media at about 4.6MB.
- Regenerated the mobile MP4 as H.264 540x960, 30fps, no-audio, fast-start media at about 2.3MB.
- Regenerated the homepage hero poster as a 1280x720 JPEG at about 411KB.
- Updated media contract docs for the new source and sizes.

### Changed Files
- `public/media/launch/home/urblo-hero.mp4`
- `public/media/launch/home/urblo-hero-mobile.mp4`
- `public/media/launch/home/hero-poster.jpg`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/WORKLOG.md`

### Verification Results
- AVFoundation source inspection: `Lark20260611-213730.mp4` is 1920x1080, 60fps, 27s, with one audio track before conversion.
- Generated asset inspection: desktop MP4 is `avc1`, 1280x720, 30fps, 27s, no audio, about 4.6MB; mobile MP4 is `avc1`, 540x960, 30fps, 27s, no audio, about 2.3MB; poster is 1280x720 JPEG, about 411KB.
- Fast-start check: both committed MP4s have `moov` before `mdat`.
- Local HTTP check against `http://127.0.0.1:5175/media/launch/home/urblo-hero.mp4`: pass. Response used `Content-Type: video/mp4`, `Content-Length: 4820594`, and byte-range reads returned data.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Local Google Chrome / Playwright desktop QA at 1440x900: pass. Homepage selected `/media/launch/home/urblo-hero.mp4`, reached `readyState = 4`, played unpaused, reported 1280x720 intrinsic size, 27s duration, hero height 900px, no horizontal overflow, and no media error.
- Local Google Chrome / Playwright mobile QA at 390x844: pass. Homepage selected `/media/launch/home/urblo-hero-mobile.mp4`, reached `readyState = 4`, played unpaused, reported 540x960 intrinsic size, 27s duration, hero height 844px, no horizontal overflow, and retained Tencent X5 inline attributes.

### Risks and Gaps
- Real WeChat playback still needs production-device confirmation after deployment.
- Cloudflare Stream/R2 remains optional if future production metrics show static MP4 delivery is not enough.

### Next Handoff
- Deploy and verify the new homepage hero video on production, including real WeChat playback.

## Entry - 2026-06-11 (Stone Library Country-Only Origin)

### Scope
- Updated public Stone Library origin presentation so listing cards and detail Specs show country only.
- Kept `origin_region` in Supabase, import data, and admin edit forms for internal/editorial traceability.
- Updated the `/admin/stone-library` group list preview to show country only, matching public presentation.

### Changed Files
- `src/service/StoneLibraryService.ts`
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `docs/WORKLOG.md`

### Verification Results
- `rg -n "\\$\\{region\\}, \\$\\{country\\}|origin_region.*join|origin_region.*origin_country.*join|regionDisplay.*countryDisplay|origin\\.source" src/service/StoneLibraryService.ts src/pages/admin/AdminStoneLibraryPage.tsx -S`: pass; no old region-plus-country presentation pattern remains.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass. npm reported an available major-version notice after the run.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Local Browser QA against `http://127.0.0.1:5173/stone-library`: pass. Listing cards showed country-only origins such as `China` and `Angola`, had no `region, country` pattern, no horizontal overflow, and no console error/warning logs.
- Local Browser QA against `http://127.0.0.1:5173/stone-library/alpine-white`: pass. Detail Specs `Origin` value was `China`, with no `region, country` pattern, no horizontal overflow, and no console error/warning logs.

### Risks and Gaps
- Existing data can still store region/province internally; the public and admin-list presentation intentionally ignores it.

### Next Handoff
- Deploy and verify country-only Stone Library origins on production after the next push.

## Entry - 2026-06-07 (Stone Library Public DL Name Removal)

### Scope
- Removed the public Stone Library detail Specs card that displayed `DL Name` / `TBC`.
- Kept CMS/source fields intact for internal editing and import traceability; this change only removes the public website presentation.
- Updated the task queue acceptance wording so future harness passes treat internal DL/source naming as non-public content.

### Changed Files
- `src/components/stone-library/SpecsPanel.tsx`
- `src/pages/StoneLibraryDetailPage.tsx`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `rg -n "DL Name|DL Name TBC|dlName=|dlName\\b" src/components src/pages docs/agent/tasks.json -S`: pass; only the updated harness acceptance wording mentions the removed public label.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Local Browser QA against `http://127.0.0.1:5173/stone-library/alpine-white`: pass. Public detail text did not include `DL Name`, `DL Name TBC`, or the admin `Supplier/source label`; visible Specs labels were `Type`, `Origin`, `Availability`, `Raw Block`, and `Price Range`; horizontal overflow was false; console error/warning logs were empty.

### Risks and Gaps
- Internal CMS `source_name` / static `dlName` data still exists by design; it is not displayed by the public Specs panel.

### Next Handoff
- Verify and push the public Stone Library DL Name removal.

## Entry - 2026-06-07 (Homepage Project Rail Affordance)

### Scope
- Improved the homepage `The work speaks.` project rail so the draggable interaction is easier to discover on desktop and mobile.
- Added restrained previous/next arrow controls, a horizontal-move icon, rail progress feedback, and a right-edge continuation treatment for hidden project cards.
- Tuned pointer drag threshold/speed and prevented hover selection from firing while drag suppression is active.
- Updated the design contract to keep visible rail affordance as part of the Latest Projects interaction pattern.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `src/index.css`
- `docs/DESIGN.md`
- `docs/WORKLOG.md`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- Local Browser desktop 1440x900 against `http://127.0.0.1:5174/`: pass. Latest Projects stayed one viewport high, the next arrow was visible/enabled, clicking it selected `moon-gate-woolley-street`, scrolled the rail from `0` to `319`, and enabled the previous arrow.
- Local Browser mobile 390x844 against `http://127.0.0.1:5174/`: pass. Latest Projects stayed `844px` high, body horizontal overflow was false, the next arrow was visible/enabled, clicking it selected `moon-gate-woolley-street`, and rail scroll moved to `157.5`.
- Local Browser console checks: pass, with no desktop or mobile error/warning logs during the rail QA.

### Risks and Gaps
- The rail still uses static homepage project data until the public content cutover is approved.
- Real WeChat validation was not repeated for this rail interaction; local mobile browser QA covered layout and interaction only.

### Next Handoff
- Deploy and verify `The work speaks.` rail affordance on production after the next push.

## Entry - 2026-06-05 (WeChat Mobile Hero Video Playback)

### Scope
- Investigated the homepage hero video not playing inside WeChat on mobile.
- Local mobile browser verification showed the React hero video source selection works outside WeChat: the 390x844 mobile viewport selected `/media/launch/home/urblo-hero-mobile.mp4`, reached `readyState = 4`, and was not paused.
- Production resource headers for the mobile MP4 were healthy: `video/mp4`, byte ranges enabled, Cloudflare cache hit, and about 1.17MB before the fix.
- MP4 box inspection found the previous mobile and desktop files were H.264 High Profile level 3.1. That is web-playable, but less reliable for WeChat/X5 autoplay background video than Baseline/Main profile.
- Re-encoded `public/media/launch/home/urblo-hero-mobile.mp4` as H.264 Constrained Baseline level 3.1, yuv420p, 540x960, 30fps, no-audio, fast-start media at about 1.8MB.
- Added Tencent X5 / WeChat inline playback attributes to the hero video element and added playback retries for media readiness, user gesture, page visibility, page show, and `WeixinJSBridgeReady`.

### Changed Files
- `src/components/homepage/HomepageSections.tsx`
- `public/media/launch/home/urblo-hero-mobile.mp4`
- `docs/ARCHITECTURE.md`
- `docs/ASSET_MIGRATION_AUDIT.md`
- `docs/WORKLOG.md`

### Verification Results
- MP4 inspection: mobile file now has `AVCProfileIndication = 66` (`0x42`, Baseline), level 3.1, `moov` before `mdat`, and no audio track.
- Local Browser mobile 390x844: pass. Hero video selected `/media/launch/home/urblo-hero-mobile.mp4`, `readyState = 4`, `paused = false`, intrinsic size 540x960, and `x5-playsinline` / `x5-video-player-type` / `x5-video-player-fullscreen` / `x5-video-orientation` attributes were present.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.

### Risks and Gaps
- This cannot fully prove WeChat playback until the change is deployed and tested in the real WeChat in-app browser on iOS/Android.
- If WeChat still refuses autoplay after deployment, the next fallback should be a tap-to-play overlay or Cloudflare Stream/R2 adaptive delivery review.

### Next Handoff
- Deploy and test `https://urblo.com.au` in the real WeChat in-app browser.

## Entry - 2026-06-05 (Project Overview Audit)

### Scope
- Reviewed current project state across `AGENTS.md`, `docs/HANDOFF.md`, `docs/agent/status.json`, `docs/agent/tasks.json`, `docs/ARCHITECTURE.md`, `docs/agent/verification.md`, code routes, admin modules, Supabase clients, and Cloudflare Functions.
- Found one docs contract drift introduced by recent handoff compression: public Supabase readiness expected exact cutover/static-fallback language in `docs/ARCHITECTURE.md` and `docs/HANDOFF.md`.
- Restored the public content import/public-read cutover wording and the canonical Published Supabase content with static fallback wording.

### Verification Results
- `npm run build`: pass; build still reports the known Browserslist staleness notice and `AdminApp` chunk-size warning.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:public-supabase-readiness`: pass after the docs wording repair.
- `npm run agent:check`: pass.
- `npm run agent:harness-gc`: pass with zero failures and one warning for `docs/WORKLOG.md` size.
- `git diff --check`: pass.

### Risks and Gaps
- Local shell has no live secrets loaded, so live-readiness remains report-only for future Turnstile, invite, admin browser, and tagged live-write checks.
- Repository is ahead of `origin/main`; latest local Harness GC commits are not pushed from this session.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-SETTINGS-CRUD-001`

## Entry - 2026-06-05 (Harness GC Queue Cleanup)

### Scope
- Reduced the active `now` queue to the two genuinely executable follow-ups: final Turnstile proof and real Settings invite proof.
- Marked the completed CMS umbrella/auth/content/media/leads/form-backend work as done or deferred where current evidence supports it.
- Moved paused article claim cleanup from `now` to `next`.
- Reworded historical done-task notes that used current-blocker language.
- Replaced `docs/HANDOFF.md` with a compact current-state handoff under the Harness GC line target.
- Replaced `docs/NEXT_STEPS.md` with a concise roadmap and agent command index.
- Updated `docs/agent/status.json` so future agents can distinguish active execution work from umbrella or decision-gated follow-ups.

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:harness-gc`: pass with zero failures and one warning.
- `npm run agent:harness-gc:review`: pass; wrote `.tmp/harness-gc-review.md` with Harness architecture score 96/100.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Remaining GC warning: `docs/WORKLOG.md` has 11628 lines against the configured 8000-line review target.

### Risks and Gaps
- `docs/WORKLOG.md` intentionally remains above the Harness GC review-size target because it is the historical evidence archive.
- Live Turnstile proof and real Settings invite proof still require their own credentials, target inputs, and approval before execution.

### Next Handoff
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-SETTINGS-CRUD-001`

## Entry - 2026-06-05 (Harness GC First Pass)

### Scope
- Added `docs/agent/status.json` as a compact current-state API for agents.
- Added `docs/agent/harness-gc.md` as the Harness GC operating guide.
- Added `scripts/check-harness-gc.mjs` plus package scripts for read-only GC, conservative fix mode, and review artifact generation.
- Updated README current status so it no longer claims production API, Supabase integration, or admin CMS are absent.
- Updated `AGENTS.md`, `docs/agent/verification.md`, `scripts/check-harness.mjs`, and `docs/agent/tasks.json` so the new GC capability is part of the official harness.

### Changed Files
- `docs/agent/status.json`
- `docs/agent/harness-gc.md`
- `scripts/check-harness-gc.mjs`
- `package.json`
- `scripts/check-harness.mjs`
- `README.md`
- `AGENTS.md`
- `docs/agent/verification.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `node --check scripts/check-harness-gc.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:harness-gc`: pass with zero failures and five warnings.
- `npm run agent:harness-gc:review`: pass; wrote `.tmp/harness-gc-review.md`.
- Reported warnings: eight `now` tasks exceed target three, `NOW-ADMIN-CMS-001` remains an umbrella task in `now`, three done tasks contain active-blocker wording, `docs/HANDOFF.md` exceeds its review target, and `docs/WORKLOG.md` exceeds its review target.
- Current task status counts reported by GC: `{"done":30,"now":8,"next":3,"later":3}`.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Harness GC is not yet wired into `npm run agent:check`; keep it separate until the warning profile has been reviewed for false positives.
- The first report intentionally does not mutate task status. Reducing the eight `now` tasks requires Jay/agent judgment in a follow-up cleanup pass.

### Next Handoff
- `NOW-HARNESS-GC-001`

## Entry - 2026-06-05 (Admin CMS Production Walkthrough Results)

### Scope
- Completed the production no-write CMS handoff walkthrough for the current `/admin` UX stack on `https://urblo.com.au`.
- Verified deployed public/admin routes, deployed assets, redirects, safe API behavior, active owner login, authenticated admin module shells, sign out, Dashboard orientation, representative Projects publish blockers, and Change history language.
- Used generated production screenshots under `.tmp/admin-auth-browser/screenshots` for module-level evidence.
- No customer content, lead workflow, media item, Settings invite, or publication state was changed during this walkthrough.

| Area | Result | Evidence | Changes Made | Public URL / Screenshot | Follow-up |
|---|---|---|---|---|---|
| Deployment | Pass | `git push origin main` advanced production source through `3db6690`. | Deployed CMS UX/handoff stack, QA heading fix, and WebP re-encode. | `https://urblo.com.au` | None. |
| Deployed smoke | Pass | `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au` passed after `3db6690`. | None during smoke. | Production origin checked. | None. |
| Active-admin browser QA | Pass | Strict no-write login QA passed for 9 authenticated routes after the WebP fix. | None during QA. | `.tmp/admin-auth-browser/screenshots` | None. |
| Dashboard orientation | Pass | Dashboard screenshot shows Recommended next action, website visibility, Draft/Published/Archived counts, Content health queue, and editor workflow. | None. | `.tmp/admin-auth-browser/screenshots/admin.png` | None. |
| Settings account handoff | Deferred | Settings route shell was included in strict authenticated QA; guide covers Invite and grant access plus Grant existing login. | No invite email was sent. | `.tmp/admin-auth-browser/screenshots/admin-settings.png` | Run a real invite proof only after Jay approves a target editor email. |
| Media readiness | Pass | Media route shell was included in strict authenticated QA and source-guarded publish checklist/action language. | None. | `.tmp/admin-auth-browser/screenshots/admin-media.png` | Real media save/publish remains approval-gated. |
| Projects publish path | Pass | Projects screenshot shows Website publish status, Publish checklist, proof-review blocker, action bars, and disabled Publish guidance. | None. | `.tmp/admin-auth-browser/screenshots/admin-projects.png` | Customer/editor review-publish remains a content decision, not a CMS blocker. |
| Stone Library publish path | Pass | Stone Library route shell was included in strict authenticated QA and source-guarded family/variant/checklist/media guidance. | None. | `.tmp/admin-auth-browser/screenshots/admin-stone-library.png` | Customer/editor review-publish remains a content decision. |
| Products publish path | Pass | Products route shell was included in strict authenticated QA and source-guarded product/model checklist language. | None. | `.tmp/admin-auth-browser/screenshots/admin-products.png` | Customer/editor review-publish remains a content decision. |
| Articles publish path | Pass | Articles route shell was included in strict authenticated QA and source-guarded article/section checklist/forms language. | None. | `.tmp/admin-auth-browser/screenshots/admin-articles.png` | Customer/editor review-publish remains a content decision. |
| Leads workflow | Pass | Leads route shell was included in strict authenticated QA and source-guarded workflow/export language. | None. | `.tmp/admin-auth-browser/screenshots/admin-leads.png` | Real lead workflow changes remain approval-gated. |
| Change history | Pass | Change history screenshot shows current title, filters, recent events, event details, and read-only rules. | None. | `.tmp/admin-auth-browser/screenshots/admin-audit.png` | None. |
| Final editor handoff | Pass | `docs/ADMIN_EDITOR_GUIDE.md` matches the deployed interface for admin address, start path, status rules, module actions, publish checks, account handoff, CMS coverage, and fallback boundaries. | None. | `docs/ADMIN_EDITOR_GUIDE.md` | Only optional live invite proof and customer content review/publish decisions remain. |

### Verification Results
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass.
- `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`: pass through a temporary public publishable-key extraction from the deployed bundle; secrets were not printed.
- Screenshot evidence exists for login, signed-out, Dashboard, Leads, Media, Settings, Stone Library, Projects, Products, Articles, and Change history under `.tmp/admin-auth-browser/screenshots`.

### Risks and Gaps
- Settings real invite email proof is deferred until Jay approves a target editor email.
- Bulk publishing imported Draft content is intentionally not part of this handoff; editors should review and publish content item by item.
- Turnstile final form proof remains outside the CMS handoff goal.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Production Admin Browser QA Heading Fix)

### Scope
- Pushed the CMS UX/handoff stack to `origin/main` at commit `43a1750`.
- Ran deployed Cloudflare smoke against `https://urblo.com.au`; route, asset, redirect, and safe API checks passed.
- Ran production active-admin browser QA with `info@urblo.com.au`; login reached the authenticated shell, but the verifier still expected the old `/admin/audit` heading `Audit`.
- Updated `scripts/check-admin-auth-browser.mjs` to expect the current editor-facing `/admin/audit` heading `Change history` and to keep that private module text out of signed-out/unauthorized checks.
- Reran active-admin browser QA against the current deployed bundle after the verifier fix; authenticated route checks passed, then strict console checking exposed a static article image decode error for `/media/launch/articles/stone-transformed/02-stone-finishes.webp`.
- Re-encoded that WebP image at the same 2500x1875 dimensions so Firefox no longer has to decode the suspect source file.

### Changed Files
- `scripts/check-admin-auth-browser.mjs`
- `public/media/launch/articles/stone-transformed/02-stone-finishes.webp`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `git push origin main`: pass, `7c89ea7..43a1750`.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass.
- Production active-admin browser QA before this fix: failed at `/admin/audit` because the verifier expected heading `Audit` while the deployed editor-facing heading is `Change history`.
- `git push origin main`: pass, `43a1750..a59fa01`.
- Production active-admin browser QA after verifier fix but before image re-encode: authenticated route checks passed, then failed strict console checking on `Image corrupt or truncated` for `/media/launch/articles/stone-transformed/02-stone-finishes.webp`.
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `sips -g pixelWidth -g pixelHeight public/media/launch/articles/stone-transformed/02-stone-finishes.webp`: pass, 2500x1875.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `git push origin main`: pass, `a59fa01..3db6690`.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass after `3db6690`.
- Production active-admin browser QA after WebP re-encode and deploy: pass for 9 authenticated routes with no strict console/page errors.

### Risks and Gaps
- The failure was in the QA script's old expected heading, not in the production login flow. Final editor handoff still requires the corrected verifier to pass after redeploy and the production walkthrough Results Template to be filled.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Stone Library Public Read Contract Alignment)

### Scope
- Rechecked `src/service/StoneLibraryService.ts` against the handoff docs before final CMS delivery.
- Confirmed Stone Library detail already has a Published CMS/Supabase detail adapter for families, variants, finish capabilities, and finish images, with static detail data kept as fallback.
- Updated stale harness/architecture/task wording that still described Stone Library detail as static-only.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is a contract/documentation alignment pass only. It does not deploy the current CMS UX stack or prove the production editor walkthrough.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin CMS Predeploy Gate Runner)

### Scope
- Added `npm run agent:admin-cms-predeploy` as a no-secret non-preview local gate runner for the current CMS UX stack.
- The runner chains admin CRUD coverage, build, lint, TypeScript, Supabase foundation readiness, public Supabase readiness, Cloudflare readiness, harness checks, `git diff --check`, and report-only admin handoff readiness.
- Preview/browser gates remain separate required deployment checks: `npm run agent:smoke` and `npm run agent:admin-config-gate`.
- Updated the root harness entry so future agents see the CMS predeploy gates and final strict handoff audit before claiming production handoff complete.
- The runner does not deploy, log into production, write Supabase, or mutate live content.

### Changed Files
- `AGENTS.md`
- `scripts/admin-cms-predeploy.sh`
- `package.json`
- `scripts/check-harness.mjs`
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `docs/agent/verification.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `bash -n scripts/admin-cms-predeploy.sh`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- Initial Node-based predeploy runner attempt: failed at embedded `npm run agent:smoke` because Vite preview returned `listen EPERM` while binding local preview ports from inside the nested runner. Standalone `npm run agent:smoke` passed immediately after, so this was treated as a runner false failure rather than an application failure.
- Replaced the Node aggregation runner with `scripts/admin-cms-predeploy.sh` and kept preview/browser gates separate.
- `npm run agent:admin-cms-predeploy`: pass. It ran admin CRUD coverage, build, lint, TypeScript, Supabase foundation readiness, public Supabase readiness, Cloudflare readiness, harness checks, `git diff --check`, and report-only admin handoff readiness. Build still shows the existing Browserslist staleness notice and AdminApp chunk-size warning. Handoff readiness correctly reports production walkthrough evidence missing.
- `npm run agent:smoke`: pass as the separate preview route/API/UI source gate.
- `npm run agent:admin-config-gate`: pass for 11 no-browser-key admin routes; screenshots written under `.tmp/admin-config-gate/screenshots`.

### Risks and Gaps
- Passing this predeploy gate plus the separate preview/browser gates proves local readiness only. The CMS is still not handoff-complete until the current stack is deployed and the production walkthrough Results Template passes.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin Handoff Readiness Audit Runner)

### Scope
- Added `npm run agent:admin-handoff-readiness` as a no-write final CMS handoff audit.
- The runner checks the editor guide, production walkthrough, Results Template, production origin input, first-admin email input, and whether `docs/WORKLOG.md` contains production walkthrough results with Final editor handoff marked Pass.
- Default mode is report-only; `--strict` fails until production walkthrough evidence exists, preventing the CMS goal from being marked complete based on local readiness alone.

### Changed Files
- `scripts/check-admin-handoff-readiness.mjs`
- `package.json`
- `scripts/check-harness.mjs`
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `docs/agent/verification.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `node --check scripts/check-admin-handoff-readiness.mjs`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au`: pass in report-only mode, with production walkthrough evidence correctly reported missing.
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict`: expected fail because production walkthrough evidence is not recorded yet.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- The runner intentionally reports missing production walkthrough evidence until the current CMS UX stack is deployed and the Results Template is filled in `docs/WORKLOG.md`.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Current Roadmap Terminology Alignment)

### Scope
- Cleaned current roadmap/task wording so active CMS handoff status uses editor-facing items/content language.
- Updated the current content-CRUD roadmap note from draft rows / published reads to production CMS Draft items and Published CMS content.
- Updated the CMS task acceptance from Stone Library/media records to Stone Library/media items.

### Changed Files
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`
- `docs/WORKLOG.md`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- Historical worklog evidence still contains older database terms where it records past implementation state. Current handoff, roadmap, guide, walkthrough, and task acceptance should use editor-facing language.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (One-Page Editor Handoff)

### Scope
- Added a concise One-Page Editor Handoff to `docs/ADMIN_EDITOR_GUIDE.md`.
- The one-page version covers admin address, account setup, Dashboard start screen, search/status filtering, Draft/Pubished/Archived behavior, Save/Publish/Open public page, CMS coverage, imported Draft content, static fallback, and escalation paths.
- Updated harness checks so the one-page editor handoff cannot be removed silently.

### Changed Files
- `docs/ADMIN_EDITOR_GUIDE.md`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This improves the customer-facing handoff artifact. It does not deploy the current CMS UX stack or run the production active-admin walkthrough.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Production Walkthrough Results Template)

### Scope
- Added a reusable Results Template to `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` so production CMS handoff proof can be recorded consistently after deployment.
- The template captures deployment, deployed smoke, active-admin browser QA, each admin module walkthrough, public URLs/screenshots, changes made, deferrals, failures, and final editor handoff readiness.
- Updated harness checks so the results template and deferral language cannot be removed silently.

### Changed Files
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This improves production evidence capture. It does not deploy the current CMS UX stack or run the active-admin production walkthrough.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (CMS Terminology Regression Guards)

### Scope
- Added regression guards for the latest visible terminology cleanup so editor-facing copy does not drift back to backend-shaped wording.
- `npm run agent:admin-crud-coverage` now rejects the old visible Leads, Articles, Stone Library, and Projects terms cleaned in the previous pass.
- `npm run agent:check` now rejects old production walkthrough terms such as Draft rows, Supabase Auth, profile rows, `claim_status`, raw imported HTML/JSON, and database rows.

### Changed Files
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.

### Risks and Gaps
- This is a regression-guard improvement for source and handoff language. It does not deploy the current CMS UX stack or replace production walkthrough proof.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (CMS Visible Terminology Hardening)

### Scope
- Ran a targeted scan for visible/editor-facing backend wording across admin source and handoff walkthrough docs.
- Replaced remaining visible lead export/inbox, Article block hint, Stone Library group, and Project editor copy that used records, rows, or other storage-shaped wording.
- Cleaned the production walkthrough so its pass conditions use editor-facing proof-review, structured-content, Change history, Draft item, and CMS content language.

### Changed Files
- `src/pages/admin/AdminLeadsPage.tsx`
- `src/pages/admin/AdminArticlesPage.tsx`
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- Targeted visible terminology scan: pass. Remaining `claim_status` matches are internal Projects/Dashboard source fields, queries, and proof-review label mapping only.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This reduces editor-facing technical language in the current local CMS UX stack. It still does not deploy the stack or replace production active-admin walkthrough proof.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (CMS UX Full Pre-Deploy Gate Refresh)

### Scope
- Re-ran the full local CMS/runtime verification stack for the current `/admin` UX and handoff changes.
- Verified source coverage, build, lint, TypeScript, public/admin smoke, Supabase foundation/public-readiness, no-config admin browser gate, Cloudflare Pages readiness, and plan-only live admin/content runners.
- Refreshed the live-input audit for `https://urblo.com.au` with `info@urblo.com.au` as the known first admin.

### Changed Files
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:supabase-foundation-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only mode; no Supabase writes, Storage uploads, or deletes attempted.
- `npm run agent:content-import:live`: pass in plan-only mode; no Supabase login and no row changes attempted.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:admin-config-gate`: pass for 11 no-browser-key admin routes; screenshots written under `.tmp/admin-config-gate/screenshots`.
- `npm run agent:live-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au`: pass in report-only mode. It reports Cloudflare deployed-preview smoke and static-to-Supabase draft import artifacts as ready, while the current shell still lacks live Supabase/admin/browser credentials and write approvals for production walkthrough proof.

### Risks and Gaps
- These checks prove the current local CMS UX stack is pre-deploy ready, but they do not deploy it.
- Final handoff still requires pushing/deploying this stack, deployed smoke, active-admin browser QA, and completing `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` with production evidence.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Editor Guide Customer-Language Cleanup)

### Scope
- Cleaned the customer-facing editor guide so handoff language stays in CMS/editor terms instead of backend terms.
- Replaced the remaining imported-content, public-read, and CSV language around rows/records/Supabase with Draft items, CMS content, entries, and Change history wording.
- Updated the harness guide check to require the new CMS Draft item phrasing.

### Changed Files
- `docs/ADMIN_EDITOR_GUIDE.md`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- Targeted editor-guide technical-term scan: pass. The only remaining Supabase mention is the explicit reassurance that day-to-day editing does not require Supabase, code, table names, or developer help.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is a customer-language/harness cleanup. It does not deploy the current CMS UX stack or replace the production walkthrough.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (CMS UX Pre-Deploy Readiness Refresh)

### Scope
- Re-ran the no-secret deployment and live-input readiness checks for the current CMS UX/handoff stack.
- Confirmed the repository-side Cloudflare Pages deployment contract remains healthy.
- Confirmed production origin `https://urblo.com.au` is ready as the deployed-preview smoke input.
- Confirmed the current local shell still lacks live Supabase/admin/browser secrets required for production CMS walkthrough proof.

### Changed Files
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:cloudflare-readiness`: pass. Verified build contract, SPA fallback, Function routing scope, headers, API handlers, env placeholders, and deployment runbook.
- `npm run agent:live-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au`: pass in report-only mode with no writes and no secret output. Ready inputs: Cloudflare deployed-preview route/API smoke and static-to-Supabase draft import artifacts. Missing in the current local shell: service-role key, browser-safe Supabase key, admin login credentials/token, unprofiled QA credentials, form/email/Turnstile secrets, and live-write approvals.

### Risks and Gaps
- This confirms the local stack is ready for the next deployment step, but it does not deploy it.
- Production CMS handoff still requires deployed smoke, active-admin browser QA, and `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` evidence after push/deploy approval.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Editor First Handoff Walkthrough Guide)

### Scope
- Strengthened the editor handoff guide with a short first-session walkthrough for a new non-technical CMS editor.
- The walkthrough covers signing in, using Dashboard, filtering to Draft, making a reversible edit, reading Publish blockers, confirming Open public page after approved publish, and explaining static fallback.
- Updated harness checks so the first handoff walkthrough cannot disappear from the editor guide.

### Changed Files
- `docs/ADMIN_EDITOR_GUIDE.md`
- `scripts/check-harness.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is a docs/handoff improvement. It does not replace deployment or the production walkthrough proof.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Project Publish Blocker Error Copy Cleanup)

### Scope
- Revisited the Projects publish blocker experience because this was the first real editor pain point reported.
- Simplified the blocked Publish error so it names the first checklist item once, includes the repair detail, reports remaining checklist items, and tells editors the first repair item is highlighted below.
- Removed the previous duplicated `Start with` guidance from runtime source and added coverage guards so the repeated sentence cannot return.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- Targeted duplicate-copy scan: pass for runtime source.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.

### Risks and Gaps
- This improves source/runtime error clarity; production authenticated edit/publish walkthrough still needs deployment and real-session evidence.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin Role Copy Normalization)

### Scope
- Audited remaining admin module headers and read-only notices for inconsistent role wording.
- Replaced visible `Admin/Editor` labels in Media, Products, and Articles with `CMS editor`.
- Replaced Media and Stone Library read-only notices that used `admin/editor`, `editor/admin`, or material-record language with CMS editor wording.
- Updated admin CRUD coverage to require the normalized role labels and reject the older technical role wording.

### Changed Files
- `src/pages/admin/AdminMediaPage.tsx`
- `src/pages/admin/AdminProductsPage.tsx`
- `src/pages/admin/AdminArticlesPage.tsx`
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- Targeted role-term scan: pass for runtime source.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.

### Risks and Gaps
- This was a source/runtime copy normalization pass; production authenticated walkthrough remains pending after deployment.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Settings and Media Handoff Copy Cleanup)

### Scope
- Continued the admin editor-facing copy audit after Browser QA.
- Replaced the remaining Settings empty-state wording that referred to CMS access records.
- Replaced the Settings invite-security note that exposed the private Supabase service key concept with plain secure-server wording.
- Replaced Media library fallback titles that could show raw `#id` values with untitled media labels.
- Extended admin CRUD coverage to guard the new Settings and Media wording and reject the older technical copy.

### Changed Files
- `src/pages/admin/AdminSettingsPage.tsx`
- `src/pages/admin/AdminMediaPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- Targeted old-term scan: pass for runtime source.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This was a source/runtime copy cleanup, not a production authenticated walkthrough.
- Final CMS handoff still needs deployment plus `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` evidence.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin No-Config Entry Copy QA)

### Scope
- Used the in-app Browser against local `/admin` to inspect the no-config admin entry state.
- Found the configuration-required screen still used technical `Admin auth`, browser-safe key, and project URL language.
- Replaced that visible copy with CMS-access language that tells a CMS manager what needs to happen without exposing Supabase/project-key terminology.
- Updated admin config/auth/coverage verifiers so the new wording is expected and the old technical wording cannot return.

### Changed Files
- `src/pages/admin/AdminState.tsx`
- `scripts/check-admin-config-gate.mjs`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-auth-browser.mjs`
- `docs/WORKLOG.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Browser QA
- Flow under test: `/admin` no-config entry state -> configuration-required CMS access message -> safe return link.
- Desktop Browser check: `http://127.0.0.1:5173/admin` rendered `CMS access is not connected yet`, no framework overlay, and no console warnings/errors.
- Mobile Browser check at 390x844: the same state wrapped cleanly, with readable copy and visible `Return to site` action.

### Verification Results
- Browser page identity: pass (`Admin | Urblo` at `http://127.0.0.1:5173/admin`).
- Browser not-blank / no-overlay / console health: pass.
- Targeted old-term scan: pass for runtime source; old technical terms remain only in verifier rejection strings.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes after rebuild. An earlier pre-rebuild run failed against stale `dist` output and was corrected by rebuilding before rerun.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This only verifies the no-config entry state; authenticated production CMS walkthrough remains pending after deployment.
- Screenshots were captured through the Browser session for visual inspection and were not added to the repo.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (CMS Handoff Live Readiness Audit)

### Scope
- Re-ran the no-write live-input readiness audit for the CMS handoff path using the production admin origin and first admin email.
- Confirmed the current production origin is ready for the deployed-preview route/API smoke input.
- Confirmed the reviewed static-to-Supabase draft import artifacts remain represented in readiness output.
- Kept final CMS handoff blocked on deployment of the current local UX stack plus production walkthrough evidence, not on source-only readiness.

### Changed Files
- `docs/WORKLOG.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:live-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au`: pass in report-only mode. No writes were made and no secrets were printed.
- Ready in the audit: Cloudflare deployed-preview route/API smoke input for `https://urblo.com.au`, and static-to-Supabase draft import artifacts.
- Missing in the current local shell: service-role key, browser-safe Supabase key, admin login credentials or token, form/email/Turnstile secrets, active-admin browser QA inputs, unprofiled unauthorized browser QA inputs, Settings invite live proof inputs, admin CRUD/live-write inputs, media Storage live-write inputs, and final Turnstile proof inputs.

### Risks and Gaps
- This audit does not deploy the current local CMS UX stack.
- This audit does not replace active-admin browser QA, Settings invite proof, admin live-write QA, final form/email proof, or Turnstile proof.
- Production editor handoff still requires the deployment sequence and module walkthrough in `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin Auth and Module Copy Terminology Sweep)

### Scope
- Continued the editor-facing terminology sweep across the remaining admin modules.
- Replaced visible Supabase/Auth/profile-row wording in the login, unauthorized, loading, and access-error states with approved CMS login/access language.
- Replaced remaining visible `record`/`row` wording in shared CMS public-page status copy, Media, Products, Projects, and the Change history module card.
- Extended admin CRUD coverage so those older technical phrases cannot return.

### Changed Files
- `src/pages/admin/AdminCmsPrimitives.tsx`
- `src/pages/admin/AdminLoginPage.tsx`
- `src/pages/admin/AdminMediaPage.tsx`
- `src/pages/admin/AdminProductsPage.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `src/pages/admin/AdminState.tsx`
- `src/pages/admin/AdminUnauthorizedPage.tsx`
- `src/pages/admin/adminContent.ts`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- Targeted old-term scan: pass. Removed visible phrases no longer appear in `src/pages/admin`.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This was a source/local runtime pass; it does not replace the production walkthrough.
- Internal database/table terms remain in non-UI source code where needed for Supabase queries and verification.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin Editor-Facing Terminology Sweep)

### Scope
- Scanned `/admin` source for remaining user-visible technical wording.
- Replaced residual editor-facing `record`, `row`, and `Unknown` language in Leads, Articles, and Change history with clearer CMS/customer wording.
- Updated admin CRUD coverage so those old terms cannot silently return.

### Changed Files
- `src/pages/admin/AdminArticlesPage.tsx`
- `src/pages/admin/AdminAuditPage.tsx`
- `src/pages/admin/AdminLeadsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- Targeted old-term scan: pass. The removed visible phrases no longer appear in the edited admin pages.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This was a source terminology pass, not a signed-in production walkthrough.
- Some internal variable/type names still use `row`/`record`; those are not editor-facing and were left intact.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin CMS Handoff Evidence Matrix)

### Scope
- Added a Handoff Evidence Matrix to the production walkthrough.
- The matrix maps the CMS goal requirements to current evidence and final proof still needed before claiming non-technical editor handoff.
- Covered login/orientation, Draft/Published/Archived clarity, Publish readiness, list/filter/save/publish/archive/public confirmation, technical-copy hiding, account handoff, and CMS/fallback explanation.
- Updated harness and verification docs so final handoff readiness must include this matrix.

### Changed Files
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-harness.mjs`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This matrix proves the remaining evidence boundary, not production completion.
- The goal remains active until the current CMS UX stack is deployed and the production walkthrough evidence is recorded.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin Editor Handoff Summary)

### Scope
- Added a concise Customer Handoff Summary to the admin editor guide.
- The summary now gives non-technical editors the admin address, account/role framing, daily editing path, publish confirmation rule, CMS coverage, imported Draft-row behavior, and static fallback boundary before the longer detailed guide.
- Tightened `npm run agent:check` so the handoff summary cannot silently disappear.

### Changed Files
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-harness.mjs`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This improves the customer-facing handoff guide, but production editors still need the current CMS UX stack deployed before they can use the latest interface language.
- Final handoff still requires production walkthrough evidence.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (CMS UX Pre-Deploy Readiness Gates)

### Scope
- Ran the remaining no-secret pre-deploy gates for the current local CMS UX stack.
- Verified the Cloudflare Pages repository-side deployment contract still passes after the CMS UX changes.
- Verified the built admin shell still shows the configuration-required gate across all launch-critical admin routes when browser-safe Supabase config is absent.
- Kept production deployment and production walkthrough explicitly pending.

### Changed Files
- `docs/WORKLOG.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:cloudflare-readiness`: pass. Verified build contract, SPA fallback, Function routing scope, headers, API handlers, env placeholders, and deployment runbook.
- `npm run agent:admin-config-gate`: pass. Firefox no-config gate passed for 11 admin routes; screenshots were written to `.tmp/admin-config-gate/screenshots`.

### Risks and Gaps
- These are pre-deploy source/built-site gates only; they do not deploy the current CMS UX stack.
- Production editor handoff still requires push/deploy approval, deployed smoke, active-admin browser QA, and the production walkthrough.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin Production Walkthrough Status Alignment)

### Scope
- Aligned the production walkthrough with the latest local CMS UX status language.
- Updated `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` to require Lead workflow status and Website settings status during the deployed module walkthrough.
- Tightened `npm run agent:check` so both the editor guide and production walkthrough must keep those handoff terms.
- Removed a redundant production-walkthrough handoff gap from the editor guide so the final open-item list stays cleaner.
- Recorded the walkthrough/guide alignment in the machine task queue without changing task status.

### Changed Files
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/ADMIN_PRODUCTION_WALKTHROUGH.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-harness.mjs`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.

### Risks and Gaps
- This is documentation/harness alignment only; it does not replace the production walkthrough.
- The current CMS UX stack still needs push/deploy approval before production editors can see the latest interface language.

### Next Handoff
- `NOW-ADMIN-CMS-001`

## Entry - 2026-06-05 (Admin Leads and Settings Status Clarity)

### Scope
- Continued the `/admin` CMS editor-handoff goal by tightening the final Leads/Settings UX consistency pass.
- Added Lead workflow status before Recommended next step so lead managers can immediately see whether the selected lead needs an owner, needs internal notes, is ready to save, is handled, or is no longer active.
- Added Website settings status before the shared CMS status rules in Settings so CMS managers can distinguish Live settings, Draft settings, and Hidden settings before saving global contact/footer/search defaults.
- Expanded `npm run agent:admin-crud-coverage` so the new Leads and Settings status language cannot silently regress.
- Updated the editor guide, handoff, roadmap, and task queue to reflect the current local CMS UX state.

### Changed Files
- `src/pages/admin/AdminLeadsPage.tsx`
- `src/pages/admin/AdminSettingsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This batch is local source/docs work and has not been deployed to `https://urblo.com.au`.
- Final editor handoff still requires deploying the CMS UX changes and running `docs/ADMIN_PRODUCTION_WALKTHROUGH.md` against production with a real active admin session.
- Settings invite flow still needs deployed live invite proof before it is used for production editor onboarding.

### Next Handoff
- `NOW-ADMIN-CMS-001`
- `NOW-ADMIN-SETTINGS-CRUD-001`
- `NOW-ADMIN-MEDIA-LEADS-001`

## Entry - 2026-06-04 (Articles Publish Status Summary)

### Scope
- Continued the `/admin` CMS editor-handoff goal by aligning Articles with the newer publish-status pattern.
- Added Article website status before the Article publish checklist so editors can see whether the article is Live on website, Ready not live yet, or Not ready to publish.
- Added Section publish status before Section actions so editors can see whether the selected section can appear in the article, is ready but unpublished, or is blocked.
- Locked section Publish when the selected section content is not ready, and updated locked Article/Section Publish errors to point editors to the first missing checklist item.
- Expanded `npm run agent:admin-crud-coverage` so Articles must keep the article/section publish-status and first-missing-item language.

### Changed Files
- `src/pages/admin/AdminArticlesPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Articles coverage now guards Article website status, Section publish status, and first-missing-item publish-blocker language.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Existing Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This is local source/docs work. It does not deploy the latest CMS UX stack or prove production editor behavior.
- Leads and Settings still need final consistency passes before production handoff.

### Next Handoff
- Continue with Leads and Settings consistency after the current Articles gates pass.

