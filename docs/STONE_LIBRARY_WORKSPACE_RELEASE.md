# Stone Library workspace release review

Prepared 2026-09-10. Jay approved the ordered production release scope below on 2026-09-10 (发布上线). Execution evidence and remaining acceptance are recorded in WORKLOG and structured state.

## Content inventory

The current public baseline becomes editable CMS content. Existing original drafts are captured in private history before adoption, not discarded. Stone/variant IDs and established URLs remain stable.

| Stone ID | Canonical name | Adoption | Photos |
| --- | --- | --- | --- |
| 4 | Alpine White | archived → Published | 4 |
| 5 | Angola Black | draft → Published | 5 |
| 6 | BlueOcean | draft → Published | 7 |
| 7 | Golden Crust | draft → Published | 8 |
| 8 | Harcourt | draft → Published | 0 |
| 9 | Honey Comb | draft → Published | 2 |
| 10 | Ivory Sand | draft → Published | 3 |
| 11 | Juparana | draft → Published | 8 |
| 12 | New Grey | draft → Published | 4 |
| 14 | Tan Brown | draft → Published | 4 |
| 15 | Tuscany | draft → Published | 2 |
| 16 | Zen Grey | draft → Published | 8 |

Harcourt remains Upcoming/TBC with no invented photography. Golden Crust retains Light/Dark; Tuscany retains Vein/Cross Cut and only Honed imagery. BlueOcean uses the current canonical baseline's seven exact former Steel Blue photographs.

Archive, never delete: Stone **1** (`admin-live-1780496442071-f27c2b7d`, exact published test) and **13** (`steel-blue`, retired duplicate). Keep already archived tests **2** and **3** unchanged. Default editor lists and public output exclude the exact historical keys.

Preserve all six formal Product drafts and defaults, four formal Article drafts and blocks, all Project content including Moon Gate draft and material IDs, historical sample requests, and all 32 Image QR records. Current-main integration also makes active QR material references block destructive Stone changes and makes QR material choices honor managed catalogue tombstones; no QR record or permanent address is changed. The adoption runner fingerprints Products, Articles, Projects and Image QR before/after and writes none of those modules. Old originals/media remain intact; create 55 uniquely named private uploads and verified public copies, about 66.24 MB per set.

Machine inventory: `docs/agent/stone-library-adoption-plan.json`. Exact file SHA-256: `b9a4e1f1c3fce163793263641139cc69c7620cce3853b2e03ed1a5a114784f9f`. `npm run agent:stone-adoption-plan` prints the plan without network or writes. Changed baseline rows or files cause live adoption to stop for review.

## Approved live sequence

1. Freeze Stone editing; back up canonical Stone tables, private draft/history state and relevant media metadata. Apply **20260910064551_stone_library_workspace.sql** (expand, protected RPC, public catalogue, exact historical exclusions and static-reference registry). Read back grants/functions and run security checks.
2. Deploy the already gated branch Preview. Verify real login, no-write catalogue/API behavior and service binding against the expanded database. Before expansion the new editor intentionally reports unavailable and cannot be functionally reviewed against production data.
3. Execute the exact inventory through the protected Preview endpoint with the approved plan SHA: archive IDs 1/13, private-upload 55 photos, adopt and publish the 12 baseline stones. Record resumable receipts and verify public catalogue, all variant/finish/photo links, private originals denial and unchanged protected-module fingerprints. Do not publish Moon Gate or modify Products/Articles/Image QR.
4. Promote the tested runtime to main, then apply **20260910065803_stone_library_reference_lockdown.sql** to close browser direct Stone writes and enforce cross-module transaction guards. Keep the edit freeze until readback and deployment-bound immutable/apex/www smoke pass.
5. Run the separately approved tagged Owner/Editor/Viewer browser workflow: edit/save/refresh, upload/preview/publish/public readback, hide/restore, invalid reference rejection, failed publication and draft privacy. Inventory and archive its tagged test content; retain originals if cleanup is uncertain. Record evidence against one deployment SHA. Jay then performs the five-minute image-replacement test without instructions. Do not self-certify usability or broader CMS handoff.

## Rollback boundaries

Before adoption, the old runtime can be retained; expand is additive. After adoption, restore reviewed Stone canonical/draft snapshots under an edit freeze if necessary, preserving originals and audit/history. Do not bulk-delete draft content or public copies. Old runtime is not a safe rollback after lockdown because its direct Stone writes are revoked; prefer a forward fix or an explicitly reviewed grant/runtime rollback together. Do not drop expand tables/history as a routine rollback. Shared media copies may be removed only after a fresh reference check proves them unreferenced.

## Verification record

Local database and browser evidence is in `docs/WORKLOG.md`. Local fixtures use synthetic sessions and cannot establish production Auth/RLS or Jay's usability acceptance. Preview URL and final gate result are recorded there when available; production actions 1–4 are complete; live Viewer proof and Jay acceptance remain open.

Candidate Preview verified: `3771ad89dd09821ef5ced3d39ae6ebbd35bd7106`, CI `34467099328`, immutable `https://3bbca096.urblo-site.pages.dev`. All selected source checks, isolated database/Functions workflows and deployment smoke passed. Earlier immediate API 404 failures and the bounded consecutive-readiness repair are retained in `docs/WORKLOG.md`. This was no-write Preview evidence; the production completion below supersedes the earlier pending state.

Preflight readback: historical ID 1 was already archived by audit event 379 at 2026-09-10 06:41:20 UTC. The approved archive operation is retained as a no-op only after all non-state fields match; formal baseline records and historical content changes still fail closed. The approved plan file and SHA remain unchanged.

Production completed 2026-09-10: PR #47 merge `d612fcd23ada54b1bf94e75fcdb52e79875da074`, CI `34469804985`, immutable `https://24e7566f.urblo-site.pages.dev`, apex and www passed. Expand source `20260910064551` was applied by the connector as version `20260910105905`; lockdown source `20260910065803` as `20260910111627`. Both were read back. Twelve stones and 55 photos (media 196–250) adopted; original private files and previous content snapshots retained. Protected modules were unchanged. Stone browser DML is revoked and reference guards installed. Editing freeze is lifted.

Tagged production Owner/Editor UI proof passed save/refresh, private upload, shared preview, publish/anonymous readback, draft privacy, pre-network failure recovery, mobile overflow, hide/restore and referenced New Grey rejection. Stone 17 and media 251 are archived; QA Storage objects retained. The failure simulation does not establish behavior under a real Storage-copy outage. Viewer live setup was blocked by automatic review of the QA profile role change; the profile remains Editor. Jay's five-minute acceptance and broader CMS handoff are not self-certified.
