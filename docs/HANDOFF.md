# HANDOFF - Current Agent State

Last updated: 2026-06-05

## Read First
Use this file as the short current-state entry. Detailed evidence lives in `docs/WORKLOG.md`; task execution state lives in `docs/agent/tasks.json`; compact machine state lives in `docs/agent/status.json`.

Recommended startup order:
- `AGENTS.md`
- `docs/HANDOFF.md`
- `docs/agent/status.json`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `docs/WORKLOG.md` only when evidence detail is needed

## Current Production State
Urblo is now running on Cloudflare Pages with Supabase-backed forms and an Urblo-owned `/admin` CMS.

Cloudflare:
- Production domains `https://urblo.com.au` and `https://www.urblo.com.au` are attached to the Cloudflare Pages project `urblo`.
- Apex and `www` website DNS point to `urblo.pages.dev`.
- Google MX/SPF/TXT, NS records, and `qa.urblo.com.au` were not changed.
- Latest verified CMS deployment for commit `7a318ab` passed deployed smoke on `https://urblo.com.au`.
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
- Remaining SEO limitation: the current public site is still a Vite React SPA, so deep-link first HTML is the shared app shell until JavaScript runs. Pre-rendered or server-rendered public detail HTML is a Phase 2 technical SEO decision.

Supabase:
- Project `Urblo` (`npkidywzwddbnfrnxlmo`, `ap-southeast-2`) has launch schema, RLS, policies, Storage buckets, baseline seeds, admin helper hardening, and admin profile email uniqueness applied and verified.
- Public Projects, Products, Articles, and Stone Library listing/detail prefer Published CMS content with static fallback.
- Public content import/public-read cutover remains guarded: imported production content stays Draft until reviewed, public reads expose Published CMS content only, and static fallback stays explicit.
- Imported production content is intentionally in CMS Draft state until an editor reviews and publishes items.

Admin CMS:
- Production admin address is `https://urblo.com.au/admin`.
- First admin bootstrap is complete for `info@urblo.com.au`, linked to one active Website owner profile.
- No-write active-admin browser QA passed on 2026-06-04 for all 9 authenticated admin route shells plus Sign out.
- Admin CRUD live proof passed on 2026-06-04, including Settings, Media, Stone Library, Products, Projects, Articles, Leads, Change history audit rows, dashboard health predicates, public/private visibility checks, and optional private Storage upload/readback/anonymous-denial proof.
- Production CMS handoff readiness passed after the production walkthrough evidence in `docs/WORKLOG.md` marked Final editor handoff as Pass.

## Active Executable Tasks
Only two tasks should currently be treated as `now` execution work:

- `NOW-FORMS-SUPABASE-001`: final Turnstile proof only. Persistence, SMTP2GO delivery, browser-key lead privacy, and admin-visible lead workflow are already verified.
- `NOW-ADMIN-SETTINGS-CRUD-001`: real Settings invite proof only after Jay supplies or approves a target editor email. Settings source, site settings save path, CMS access UI, RLS, and tagged admin live QA are otherwise complete.

The admin CMS umbrella is not an executable `now` task. `NOW-ADMIN-CMS-001` is complete as an umbrella after production walkthrough and strict handoff readiness.

## Deferred Or Decision-Gated Work
- Article claim cleanup is paused by user direction and now belongs in `next` until Jay explicitly resumes it.
- Imported Draft CMS content needs customer/editor review before public publishing decisions.
- Optional unprofiled unauthorized admin browser QA is available with `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` once an unprofiled Auth user is supplied.
- Destructive delete controls remain out of scope until Jay approves a retention/delete policy.
- Turnstile configuration is not required for the completed CMS handoff, but it is still the remaining forms proof.

## Harness GC State
Harness GC is installed and should be used as a periodic reality check:
- Read-only report: `npm run agent:harness-gc`
- Review artifact: `npm run agent:harness-gc:review`
- Current status snapshot: `docs/agent/status.json`
- Operating guide: `docs/agent/harness-gc.md`

The 2026-06-05 cleanup goal is to keep GC warnings meaningful:
- `now` should stay at 2 active executable tasks.
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
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`
- `npm run agent:seo-readiness` when public metadata, sitemap, robots, structured data, or indexable route slugs change

CMS predeploy and handoff:
- `npm run agent:admin-cms-predeploy`
- `npm run agent:smoke`
- `npm run agent:admin-config-gate`
- `npm run agent:admin-handoff-readiness -- --base-url https://urblo.com.au --admin-email info@urblo.com.au --strict`

Live-write checks require explicit approval and credentials. Do not run tagged live writes or invite emails without fresh approval for the target action.

## Next Recommended Action
For Harness GC repair, finish the queue/doc cleanup, then run the docs/harness checks above. A healthy post-cleanup GC report should have no failures and should leave only the known `docs/WORKLOG.md` size warning.

For product launch work, choose one of:
- Configure and prove Turnstile.
- Provide a target editor email for the real Settings invite proof.
- Have a customer/editor review Draft CMS content and decide what to publish first.
- Choose the depth of Phase 2 SEO content/conversion work and whether public route pre-rendering is worth the added implementation scope.

## Guardrails
- Code reality wins over stale docs; if docs and code disagree, verify code first, then update docs.
- Keep `docs/HANDOFF.md` short. Move historical detail to `docs/WORKLOG.md`.
- Keep `docs/agent/tasks.json` machine-readable and explicit about task status.
- Do not treat optional or user-paused work as a current launch blocker.
- Do not remove static fallback behavior unless Jay explicitly asks for public CMS-only cutover.
