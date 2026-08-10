# HANDOFF - Current Agent State

Last updated: 2026-08-02

## Read First
Use this file as the short current-state entry. Detailed evidence lives in `docs/WORKLOG.md`; task execution state lives in `docs/agent/tasks.json`; compact machine state lives in `docs/agent/status.json`.

Recommended startup order:
- `AGENTS.md`
- `docs/OPERATING_PROTOCOL.md`
- `docs/HANDOFF.md`
- `docs/agent/status.json`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `docs/WORKLOG.md` only when evidence detail is needed

## Current Production State
Urblo is now running on Cloudflare Pages with Supabase-backed forms and an Urblo-owned `/admin` CMS.

Working process is governed by `docs/OPERATING_PROTOCOL.md`: branch -> local container gate (`npm run gate`) -> Cloudflare preview smoke -> promote to `main`, plus the design review -> implement -> remember loop.

Cloudflare:
- Production domains `https://urblo.com.au` and `https://www.urblo.com.au` are attached to the Cloudflare Pages project `urblo`.
- Apex and `www` website DNS point to `urblo.pages.dev`.
- Google MX/SPF/TXT, NS records, and `qa.urblo.com.au` were not changed.
- Admin reliability PR `#3` is merged. Cloudflare production deployment `6d193af5-cf8e-4541-a1e2-c73164d1a290` for merge commit `46d46b4` passed the then-current status-only smoke; that result was later invalidated by the cached-HTML asset incident.
- Harness PR `#5` is merged as `cb0ec9a`; immutable deployment `https://4aef2ba1.urblo.pages.dev` passes the new static-fallback fault injection and all nine authenticated admin route checks.
- Cache repair PR `#6` is merged as `a2a7ae5` and deployed as `c7a910df-6dd3-440b-8971-a6120353ed19` at `https://c7a910df.urblo.pages.dev`. Its immutable URL, `https://urblo.com.au`, and `https://www.urblo.com.au` pass the MIME/body-aware smoke bound to that exact deployment. The apex readback retains warnings for four unchanged assets with stale long-lived response headers, but their bytes and MIME exactly match the immutable deployment; the latest `www` readback had no such warning.
- Rollback DNS values are recorded in `docs/CLOUDFLARE_DEPLOYMENT.md`.

Forms:
- `/api/enquiries` and `/api/sample-requests` are implemented as Cloudflare Pages Functions.
- Contact and Sample Request persistence is verified in Supabase.
- Server-side audit rows are verified for valid lead submissions.
- SMTP2GO delivery is verified for Contact and Sample Request; stored `notification_status = sent` was confirmed for tagged live proof rows.
- Browser-key privacy boundary is verified: anonymous reads cannot see private lead rows.
- Final Turnstile proof remains the only active forms follow-up.

SEO:
- Phase 1 SEO indexability source is implemented: `public/robots.txt`, `public/sitemap.xml`, `src/data/seoRoutes.ts`, conservative client-side JSON-LD, and `npm run agent:seo-readiness`.
- The sitemap currently covers 36 approved public canonical URLs: Home, public listing pages, 5 Projects, 13 Stone Library groups, 6 Products, and 4 Articles. `/admin` and `/api` are intentionally excluded.
- Production readback after commit `4952e93` confirmed `https://urblo.com.au/robots.txt` returns static robots text and `https://urblo.com.au/sitemap.xml` returns static XML with 36 `<loc>` entries.
- Google Search Console review on 2026-06-12 showed stale sitemap reads and mostly legacy WordPress/old-site URLs in indexing issues. Phase 2 SEO is documented in `docs/SEO_PHASE_2_PLAN.md`: refresh the sitemap, map valuable old URLs, add selective 301 redirects, then improve non-brand long-tail content.
- `https://urblo.com.au/sitemap.xml` was submitted/refreshed in GSC on 2026-06-12. GSC showed the submitted date as 12 Jun 2026 and confirmed submission, but `Last read` still showed 3 Aug 2023 immediately after submission; monitor for Google's next processing pass.
- Phase 2 legacy URL cleanup is implemented in source: selected old contact/capacity/product/category/stone-product/article URLs now have semantic 301 rules in `public/_redirects`, representative redirect checks are in smoke runners, and junk WordPress/admin/feed/upload paths remain intentionally unrescued.
- Remaining SEO limitation: the current public site is still a Vite React SPA, so deep-link first HTML is the shared app shell until JavaScript runs. CMS-only sitemap/route discovery and any pre-rendered or server-rendered detail HTML decision are tracked under `NEXT-SEO-CONTENT-GROWTH-001` rather than the completed Phase 2 redirect cleanup.

Supabase:
- Project `Urblo` (`npkidywzwddbnfrnxlmo`, `ap-southeast-2`) has launch schema, RLS, policies, Storage buckets, baseline seeds, admin helper hardening, and admin profile email uniqueness applied and verified.
- Production migration `supabase/migrations/20260714050750_media_public_bucket_role_hardening.sql` is applied/read back. Editors retain insert/update access to `urblo-admin-media`; only owner/admin may insert/update `urblo-public-media`. The separately approved live Editor/owner proof passed, and independent readback confirmed zero tagged objects remained.
- Production expand migration `supabase/migrations/20260719015649_project_aggregate_drafts.sql`, minimum-disclosure migration `supabase/migrations/20260802103337_restrict_archived_project_tombstones.sql`, and contract migration `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql` are applied/read back. B removed authenticated direct writes across all six Project tables/sequences and all legacy mutation policies, retained service-role writes, left RLS enabled, and hardened public child reads behind approved Published parents. The security advisor added no migration-specific warning.
- The 2026-08-02 security advisor readback still reports the existing leaked-password-protection Auth warning plus two expected generic warnings for the intentionally browser-callable archived-project tombstone function. The function is search-path pinned, returns only an allowlisted public slug, and is executable by `anon`, `authenticated`, and `service_role`, not `PUBLIC`.
- Public Projects, Products, Articles, and Stone Library listing/detail prefer Published CMS content with static fallback.
- PR `#16` / merge `160b4f1` makes Stone Library origin an internal-only sourcing field: public cards, detail specs, search matching, and route metadata omit it without deleting the source/Supabase/Admin value. Immutable release `76ae7fe0`, apex, and `www` pass deployment-bound smoke; production desktop/mobile UI readback passes.
- Public content import/public-read cutover remains guarded: imported production content stays Draft until reviewed, public reads expose Published CMS content only, and static fallback stays explicit.
- Imported production content is intentionally in CMS Draft state until an editor reviews and publishes items.

Admin CMS:
- Production admin address is `https://urblo.com.au/admin`.
- First admin bootstrap is complete for `info@urblo.com.au`, linked to one active Website owner profile.
- A separate QA Editor is active. Its password sign-in and own-profile RLS readback passed, and its credentials are stored only in the ignored mode-`0600` local `.env`.
- A real invite reached the approved QA recipient, but its callback incorrectly fell back to `http://localhost:3000`. The account was activated through the Auth API only to unblock role testing; this does not count as the Settings invite/password UI proof. On 2026-07-14, after Jay's item-specific approval, production Auth Site URL was changed to `https://urblo.com.au` and the exact invite/recovery account-setup Redirect URLs were added and read back. Custom Auth SMTP ownership and a fresh approved invite/recovery workflow remain open.
- The prior June proof covered authenticated route shells and direct browser-key/API mutations, not a real editor completing save, refresh, publish, public readback, archive, invite, or recovery through the UI.
- On 2026-07-13 Jay reported that the admin is not working and is extremely difficult to use. The handoff is reopened and production state is `revalidation_required`.
- Confirmed source failures include a Supabase auth-listener deadlock pattern, incomplete invite/password setup, Media new-record reset and 80-row truncation, false private-to-public Storage publication, missing public Storage media URLs, category-wide fallback replacement, and site settings with no public consumer.
- The deployed repairs cover the auth callback and non-blocking same-user refresh; isolated-session invite/recovery password writes that cannot replace the shared browser session; Media loading, private-only initial upload, owner/admin-only public-bucket write policy source, and create-only Storage promotion bound to the selected row's original path/version with reference-safe cleanup disclosure. They also cover public Storage URL resolution, per-record public overlay with Project fallback-field preservation, normalized/refetchable Published settings consumption, parent-bound/stale-safe child saves across Projects, Products, Articles, and Stone Library, loading-state interaction locks, the Articles validation lockup, admin route chunks/provider continuity, medium-desktop header clipping, and the first Projects task-workspace redesign with all-editor dirty guards.
- The PR `#6` production runtime proves static public fallback for Products, Projects, and Articles under a blocked Supabase chunk plus all nine authenticated admin routes, sign-out, and protected-route revisit. The applied Media policy has also passed the separately approved Editor/owner tagged role proof with zero tagged objects remaining. Editor UI writes, valid invite/recovery callbacks, and the twelve UI golden workflows are still not proven. `docs/agent/admin-handoff-evidence.json` intentionally remains `revalidation_required`.
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict` must fail until one deployed SHA has fresh evidence for the applied Storage role-boundary prerequisite and every required golden workflow. A WORKLOG `Pass` string is no longer sufficient.
- Jay approved `docs/ADMIN_UX_RESHAPE_PLAN.md` on 2026-07-14 as the temporary execution authority for rebuilding Admin around website pages rather than database tables. Auth URL, Media migration/readback, and the live Editor/owner role proof are closed. The Phase 1 Projects source candidate now implements one page-shaped aggregate draft/action bar, shared public/draft rendering, visual hotspots, inline private-first media, and a protected server aggregate path. The source also contains server-enforced Editor claim normalization, transaction-local reference rechecks, PGRST/HTTP error mapping, and reference-aware failed-publish media compensation.
- Phase 1's aggregate runtime reached production through merge `25c05ebb` and immutable Cloudflare deployment `877d13c4-1e28-45d7-a62a-afdd3b0e0dda`. The immutable URL, apex, and `www` passed deployment-bound no-write smoke; production owner login passed all nine authenticated routes. Expand A, minimum-disclosure C, and contract B are applied/read back, so the operational Project edit freeze is lifted. The earlier approved marker `admin-projects-ui-mrroa6p0` remains the write-workflow implementation evidence. On 2026-08-02 Jay tested the production result and explicitly reported no issue/OK, closing the Jay-owned Phase 1 usability acceptance boundary; no agent self-certification is substituted for that result.
- PR `#11` removes Project proof-review controls and Dashboard claim-review queues; Save normalizes the legacy columns automatically while required content/media, auth, RLS, promotion, conflict, and audit checks remain. Its historical fix aligned Projects with Stone Library by adding a 102px black `DefaultLayout` support band, but Jay later identified that stacking translucent black over solid black destroyed the intended glass effect. PR `#18` / merge `93fd143c` replaces that obsolete backing rule with explicit `overlay` and `light-page` glass modes plus a shared light 102px clearance for white-start pages. Clean container gate, immutable Preview `b15782a6`, deployment-bound apex/`www` smoke, and production desktop/390px browser checks pass without overflow.
- Jay approved the bounded Projects count/data normalization on 2026-08-03. PR `#14` Preview passed route/asset/Function smoke, authenticated desktop list/filter checks, and 390px no-overflow readback, then merged as `edd33465b350f657ebfd8c3075807e92fbe3600b`. Australian Catholic University, Xavier College, and Artisan Park | YarraBend were published through the protected Admin UI. Moon Gate remains Draft because its two referenced Stone Library groups are not Published and its imported hotspots are not yet material-bound; the server/client publish guard was preserved. A guarded transaction deleted only the four exact Archived QA Projects. Production Admin readback is five canonical Projects, four Live, one Draft, zero Archived/QA rows, with retained media/audit history; the public production listing still shows all five through the explicit Published-overlay/static-fallback contract. The only missing release evidence is the new eight-hex immutable Pages deployment URL: Wrangler has no local Cloudflare API token and no new GitHub OAuth grant was approved, so the strict custom-domain-to-immutable smoke remains unbound for this merge.

## Active Executable Tasks
Only three tasks should currently be treated as `now` execution work:

- `NOW-ADMIN-RELIABILITY-UX-001`: P0 admin incident. The repaired build, MIME-aware asset verifier, immutable-reference binding, production auth/fallback checks, Auth URL correction/readback, Media migration/readback, and live role proof are complete, and a separate QA Editor is active. The task remains open for the editor golden workflows; do not mark it done from deployment, account existence, route-shell checks, or source checks alone.
- `NOW-ADMIN-SETTINGS-CRUD-001`: Published settings public-consumer proof plus a real Settings invite/recovery proof. Exact production redirects are now configured and read back; custom Auth SMTP ownership and the approved end-to-end email/password workflows remain open.
- `NOW-ADMIN-UX-RESHAPE-001`: the approved page-shaped `/admin/projects` Phase 1 runtime and PR `#11` single-editor follow-up are deployed and Jay-accepted in production. Keep the umbrella task open for Phase 2 replication, Phase 3 canonical-doc/harness absorption, and the directive's required sunset deletion; next module is Articles per the approved sequence.

Decision-gated in `next`: `NOW-FORMS-SUPABASE-001` retains only the final Turnstile proof; its persistence, SMTP2GO, lead privacy, and admin-visible workflow evidence are already complete.

The historical admin CMS umbrella is not an executable `now` task. Its former handoff conclusion has been superseded by `NOW-ADMIN-RELIABILITY-UX-001`.

## Deferred Or Decision-Gated Work
- Article claim cleanup is paused by user direction and now belongs in `next` until Jay explicitly resumes it.
- Imported Draft CMS content needs customer/editor review before public publishing decisions.
- Optional unprofiled unauthorized admin browser QA remains useful, but it cannot substitute for the reopened golden workflow.
- Destructive delete controls remain out of scope until Jay approves a retention/delete policy.
- Turnstile remains a separate forms proof and is not a substitute for admin incident closure.

## Harness GC State
Harness GC is installed and should be used as a periodic reality check:
- Read-only report: `npm run agent:harness-gc`
- Review artifact: `npm run agent:harness-gc:review`
- Current status snapshot: `docs/agent/status.json`
- Operating guide: `docs/agent/harness-gc.md`

The 2026-06-05 cleanup goal is to keep GC warnings meaningful:
- `now` should stay at 3 active executable tasks while the admin incident is open.
- Umbrella objectives should not appear in the active executable list.
- Done tasks should not use current-blocker wording.
- `docs/HANDOFF.md` should stay under the configured 220-line target.
- `docs/WORKLOG.md` is allowed to remain long as historical evidence, but it should not be the primary startup surface.

## Verification Commands
Docs/harness changes:
- `jq empty docs/agent/tasks.json`
- `npm run agent:check`
- `npm run agent:harness-gc`
- `npm run agent:harness-gc:review`
- `git diff --check`

Runtime changes:
- `npm run gate` (containerized: `git diff --check` host-side, then build incl. `tsc -b`, lint, `agent:smoke`, `agent:check` in a clean Node 20 container — the preferred pre-push gate)
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`
- `npm run agent:seo-readiness` when public metadata, sitemap, robots, structured data, or indexable route slugs change

CMS predeploy and handoff:
- `npm run agent:admin-cms-predeploy`
- `npm run agent:admin-projects-aggregate`
- `npm run agent:smoke`
- `npm run agent:admin-config-gate`
- Passed after item-specific approval: `npm run agent:admin-media-role-boundary-live -- --allow-writes --strict`
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict`

Live-write checks require explicit approval and credentials. Do not run tagged live writes or invite emails without fresh approval for the target action.

## Next Recommended Action
PR `#6` has restored the production no-write runtime and Harness baseline. Keep the four apex cache-header warnings visible until Cloudflare revalidation or an approved purge removes them, but do not confuse those exact-bytes/MIME warnings with the remaining CMS handoff blockers.

Required delivery action: the count/data normalization and production UI readback are complete. If Cloudflare account access becomes available, record the immutable deployment URL for merge `edd33465` and run the strict custom-domain binding smoke; do not create a new OAuth grant solely to manufacture that evidence. Moon Gate can become the fifth Live CMS Project only after separately approving and completing its Stone Library dependencies and material-hotspot bindings; do not bypass the publish guard. Then begin Phase 2 with Articles, replicating the Jay-accepted Projects pattern without weakening content/media, auth, RLS, audit, or public-read boundaries. Keep `docs/ADMIN_UX_RESHAPE_PLAN.md` until every later phase is absorbed into canonical docs and its sunset clause is satisfied.

Other decision-gated follow-ups:
- Choose a generated sitemap/release-manifest or pre-render strategy for CMS-only published slugs; current runtime entity metadata does not add new slugs to the static sitemap or the first HTML response.
- Configure and prove Turnstile.
- After separate approval, verify custom Auth SMTP ownership and repeat the Settings invite/password/recovery workflow against the corrected callbacks; the active QA Editor account is only a test prerequisite, not that workflow proof.
- Have a customer/editor review Draft CMS content and decide what to publish first.
- Monitor production/GSC after the Phase 2 redirect deployment, then plan the Phase 3 non-brand content pass for Product, Stone Library, Project, and Article pages.

## Guardrails
- Code reality wins over stale docs; if docs and code disagree, verify code first, then update docs.
- Keep `docs/HANDOFF.md` short. Move historical detail to `docs/WORKLOG.md`.
- Keep `docs/agent/tasks.json` machine-readable and explicit about task status.
- Do not treat optional or user-paused work as a current launch blocker.
- Do not remove static fallback behavior unless Jay explicitly asks for public CMS-only cutover.
