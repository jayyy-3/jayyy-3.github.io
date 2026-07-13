# HANDOFF - Current Agent State

Last updated: 2026-07-13

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
- Admin reliability PR `#3` is merged. Cloudflare production deployment `6d193af5-cf8e-4541-a1e2-c73164d1a290` for merge commit `46d46b4` passed no-write deployed smoke on `https://6d193af5.urblo.pages.dev` and `https://urblo.com.au`.
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
- Local migration `supabase/migrations/20260713065628_media_public_bucket_role_hardening.sql` closes the remaining direct-API media boundary by keeping editor uploads private and requiring owner/admin for public-bucket insert/update. It is source-verified but not applied or live-read back in production.
- Public Projects, Products, Articles, and Stone Library listing/detail prefer Published CMS content with static fallback.
- Public content import/public-read cutover remains guarded: imported production content stays Draft until reviewed, public reads expose Published CMS content only, and static fallback stays explicit.
- Imported production content is intentionally in CMS Draft state until an editor reviews and publishes items.

Admin CMS:
- Production admin address is `https://urblo.com.au/admin`.
- First admin bootstrap is complete for `info@urblo.com.au`, linked to one active Website owner profile.
- The prior June proof covered authenticated route shells and direct browser-key/API mutations, not a real editor completing save, refresh, publish, public readback, archive, invite, or recovery through the UI.
- On 2026-07-13 Jay reported that the admin is not working and is extremely difficult to use. The handoff is reopened and production state is `revalidation_required`.
- Confirmed source failures include a Supabase auth-listener deadlock pattern, incomplete invite/password setup, Media new-record reset and 80-row truncation, false private-to-public Storage publication, missing public Storage media URLs, category-wide fallback replacement, and site settings with no public consumer.
- The deployed repairs cover the auth callback and non-blocking same-user refresh; isolated-session invite/recovery password writes that cannot replace the shared browser session; Media loading, private-only initial upload, owner/admin-only public-bucket write policy source, and create-only Storage promotion bound to the selected row's original path/version with reference-safe cleanup disclosure. They also cover public Storage URL resolution, per-record public overlay with Project fallback-field preservation, normalized/refetchable Published settings consumption, parent-bound/stale-safe child saves across Projects, Products, Articles, and Stone Library, loading-state interaction locks, the Articles validation lockup, admin route chunks/provider continuity, medium-desktop header clipping, and the first Projects task-workspace redesign with all-editor dirty guards.
- Deployment and anonymous/no-write route/API smoke are proven. Production login, editor writes, Storage role boundaries, invite/recovery delivery, and the twelve UI golden workflows are not; `docs/agent/admin-handoff-evidence.json` intentionally remains `revalidation_required`.
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict` must fail until one deployed SHA has fresh evidence for the applied Storage role-boundary prerequisite and every required golden workflow. A WORKLOG `Pass` string is no longer sufficient.

## Active Executable Tasks
Only three tasks should currently be treated as `now` execution work:

- `NOW-ADMIN-RELIABILITY-UX-001`: P0 admin incident. The repaired build is deployed; now provision the separate QA Editor, complete the Storage prerequisite, prove the editor golden workflows, then continue task-oriented UX work. Do not mark done from deployment or source checks alone.
- `NOW-FORMS-SUPABASE-001`: final Turnstile proof only. Persistence, SMTP2GO delivery, browser-key lead privacy, and admin-visible lead workflow are already verified.
- `NOW-ADMIN-SETTINGS-CRUD-001`: Published settings public-consumer proof plus a real Settings invite proof after Jay supplies or approves a target editor email and Supabase Auth SMTP/redirect configuration is verified.

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
- `npm run agent:smoke`
- `npm run agent:admin-config-gate`
- After approved production migration/readback and tagged Storage writes: `npm run agent:admin-media-role-boundary-live -- --allow-writes --strict`
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict`

Live-write checks require explicit approval and credentials. Do not run tagged live writes or invite emails without fresh approval for the target action.

## Next Recommended Action
For Harness GC repair, finish the queue/doc cleanup, then run the docs/harness checks above. A healthy post-cleanup GC report should have no failures and should leave only the known `docs/WORKLOG.md` size warning.

Required product action: provision a separate QA Editor, then with explicit production-write approval apply/read back the pending Storage role migration and pass the Editor/owner role-boundary verifier. Configure Supabase Auth SMTP/redirect URLs and run all twelve approved production golden workflows against one immutable deployment, including the Projects record URLs/task workspaces/all-editor dirty guards/searchable media. If runtime code changes again, use the resulting newer deployment for the complete evidence set. Only after the strict handoff passes should pagination/preview or another editor-module redesign be selected.

Other decision-gated follow-ups:
- Choose a generated sitemap/release-manifest or pre-render strategy for CMS-only published slugs; current runtime entity metadata does not add new slugs to the static sitemap or the first HTML response.
- Configure and prove Turnstile.
- Complete the separate QA Editor provisioning; a real Settings invite email remains a distinct Auth-delivery proof.
- Have a customer/editor review Draft CMS content and decide what to publish first.
- Monitor production/GSC after the Phase 2 redirect deployment, then plan the Phase 3 non-brand content pass for Product, Stone Library, Project, and Article pages.

## Guardrails
- Code reality wins over stale docs; if docs and code disagree, verify code first, then update docs.
- Keep `docs/HANDOFF.md` short. Move historical detail to `docs/WORKLOG.md`.
- Keep `docs/agent/tasks.json` machine-readable and explicit about task status.
- Do not treat optional or user-paused work as a current launch blocker.
- Do not remove static fallback behavior unless Jay explicitly asks for public CMS-only cutover.
