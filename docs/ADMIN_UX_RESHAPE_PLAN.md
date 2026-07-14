# Admin UX Reshape Plan - Directive For Executing Agent

Last updated: 2026-07-14
Issued by: Jay (project owner), via Claude review session
Executor: Codex (or any subsequent agent picking up this work)
Status: approved direction; supersedes further per-module copy/label polish

## Read This First

Before executing, read in this order:

1. `AGENTS.md` (harness entry, startup checklist, gates)
2. `docs/OPERATING_PROTOCOL.md` (delivery process: branch -> gate -> preview -> main)
3. `docs/HANDOFF.md` (current state, open P0 items)
4. This file
5. `docs/DESIGN.md` and `docs/brand-baseline.md` (visual/brand authority still applies to admin surfaces)

This plan changes the SHAPE of the admin, not its security posture. Every existing
security contract (RLS, draft-first imports, published-only public reads, audit
logging, no destructive deletes) remains in force.

## The Verdict Being Executed

On 2026-07-13 Jay reported the production `/admin` as not working and extremely
difficult to use. After review, the root cause of "difficult to use" is
structural, not cosmetic:

- The admin is a 1:1 projection of the normalized Postgres schema into forms.
  Editors are forced to think in tables, foreign keys, and row-level publish
  states instead of "the page I want to change".
- `src/pages/admin/AdminProjectsPage.tsx` (~4,000 lines) runs six parallel
  form state machines (project / fact / material / map / media block / hotspot),
  each with its own Save button, saving lock, dirty baseline, and
  `window.confirm` dirty-guard dialogs.
- Internal engineering state leaks to editors everywhere: "URL key",
  "Sort order", numeric `x_percent`/`y_percent` hotspot coordinates,
  private-to-public Storage "promotion", per-child-row draft/published status,
  and migration language like "a matching legacy static page may remain visible
  during migration".
- Publishing a stone finish image requires a cross-module manual dependency
  chain (publish the media row in Media, then return to Stone Library and
  publish the link row).
- The editor guide (`docs/ADMIN_EDITOR_GUIDE.md`) needs 198 lines and a
  12-step "one-page" handoff. A back office that needs a manual of that size
  has failed its purpose.

Jay's stated purpose for the admin: **a non-technical person ("a fool") must be
able to easily CRUD the website.** That is the metric. Thirty "Clarify label"
commits (2026-06-04) tried to fix this with copy; copy cannot fix shape. Do not
attempt another copy-only pass.

## Core Principle (Non-Negotiable)

**The admin must take the shape of the website, not the shape of the database.**

An editor thinks "I want to change that photo on the Camberwell project page".
They must never need to know that `project_media` references `media_assets`
which lives in a private bucket until promoted.

Five design rules follow. Every screen you build or rebuild must satisfy all five:

1. **Page-shaped information architecture.** Editors navigate the website's
   structure (Projects -> a specific project), and edit that page's sections in
   place. Child tables (facts, materials, maps, hotspots, media blocks) appear
   as sections of the page being edited, not as sibling table editors.
2. **Live preview at the center.** The public page components already exist in
   this repo. Feed draft data into the same components to render a faithful
   side-by-side (or toggleable) preview. Publish confidence must come from
   seeing the page, not from reading a 12-rule checklist.
3. **Two publish states in the editor's vocabulary.** Editors see only
   "Saved (not live)" and "Live" (plus "Hidden" for archived). Child-row-level
   publish states collapse: children follow their parent record. Internal
   states (claim review, needs-confirmation) move to an advanced/admin-only
   surface.
4. **One draft, one Save, autosave.** Each record edits as a single aggregate
   draft, saved atomically in one transaction. No parallel per-child Save
   buttons, no save-order knowledge, no `window.confirm` dirty guards.
   Autosave drafts (or at minimum a single sticky Save with an unsaved
   indicator) plus the existing audit trail as change history.
5. **Media inline, privilege server-side.** Every image field offers
   drag-and-drop upload and pick-from-library inline. The private->public
   promotion concept disappears from the UI: publishing a record triggers a
   server-side endpoint (Pages Function using the service role) that atomically
   promotes referenced media and flips publish state. Editors never see bucket
   names. RLS is not weakened; privileged steps move behind an audited server
   endpoint instead of requiring a higher-role human.

## Sequencing

### Phase 0 - Close the open reliability items first (unchanged)

The existing P0 configuration work in `docs/HANDOFF.md` is prerequisite and is
NOT replaced by this plan:

- Correct and read back the Supabase Auth Site URL and exact invite/recovery
  redirect allowlist (the observed `http://localhost:3000` callback fallback).
- With approval, apply and live-verify
  `supabase/migrations/20260713065628_media_public_bucket_role_hardening.sql`.

These are environment-level fixes needed regardless of UI shape. However, the
twelve golden-workflow UI proofs should be executed against the reshaped
Projects module (Phase 1) rather than proving the old UI twice — confirm this
sequencing with Jay only if Phase 1 slips badly and handoff pressure returns.

### Phase 1 - Projects vertical prototype (the template)

Rebuild `/admin/projects` as the vertical sample implementing all five rules.
Scope:

1. **Aggregate draft model.** One TypeScript draft type covering the project
   row plus facts, materials, maps, media blocks, and hotspots. Load once,
   edit locally, save atomically.
2. **Single-transaction save.** A Supabase RPC (SECURITY DEFINER or
   RLS-checked, your call after reading existing migration patterns in
   `supabase/migrations/`) that upserts the parent and diffs/upserts children
   in one transaction. Alternatively a Pages Function under `functions/api/admin/`
   following the existing `functions/_lib/admin-invite.js` auth pattern. Either
   way: one request, all-or-nothing, audit row written server-side.
3. **Page-shaped editor layout.** Sections in public-page order (hero/overview,
   facts, material schedule, media, material maps + hotspots), collapsible,
   with one sticky actions bar: Save / Publish / Hide (archive) / Open preview.
4. **Live preview.** Reuse the public detail rendering (see
   `src/pages/ProjectDetails.tsx`, `src/components/projects/ProjectMaterialMap.tsx`,
   `src/components/projects/ProjectHotspotImage.tsx`, and the data mapping in
   `src/service/ProjectService.ts` / `src/service/publicContentOverlay.ts`).
   Extract the pure rendering into components that accept mapped props if
   needed. Preview renders the current unsaved draft.
5. **Visual hotspot editing.** Place/drag hotspots by clicking on the map
   image; `x_percent`/`y_percent` become derived values, never typed numbers.
6. **Inline media.** Image fields open a picker (search + thumbnails from
   `media_assets`) with drag-and-drop upload directly in the field. Upload
   still lands private-first (contract preserved); publish-time promotion is
   handled by the server endpoint from rule 5. Alt text is prompted at upload
   time, not policed later by a checklist.
7. **Status collapse.** Child rows inherit parent visibility. Where the schema
   keeps per-row status columns, the save path sets them mechanically; the UI
   does not expose them. Publish blockers become at most 3 plain-language
   items rendered as annotations on the preview, with a click that scrolls to
   the offending section.

Tables involved (verified against current source): `projects`, `project_facts`,
`project_materials`, `project_material_maps`, `project_media`,
`project_hotspots`, plus `media_assets`, `stone_groups`, `finish_definitions`
for pickers.

### Phase 2 - Replicate the template

After Phase 1 passes acceptance (below), apply the same pattern to, in order:

1. Articles (closest analog: aggregate = article + sections; preview reuses
   `src/pages/ArticlePage.tsx` rendering)
2. Products (product + models + specs; preview reuses `src/pages/ProductDetailPage.tsx`)
3. Stone Library (group + variants + finish capabilities + finish images;
   kill the cross-module publish chain — publishing a finish image link
   promotes its media server-side in the same action)
4. Media module shrinks to a maintenance/library view; it is no longer part of
   the editor's daily path.
5. Settings/Leads/Audit: light-touch only — align vocabulary and actions bar;
   their workflows are acceptable.

### Phase 3 - Shrink the manual, update the harness

- Rewrite `docs/ADMIN_EDITOR_GUIDE.md` to fit one screen (~30 lines). If the
  guide cannot shrink, the UI is not done.
- Update `docs/agent/verification.md` golden workflows to run against the new
  shape, and add the acceptance test below as a named workflow.
- Update `docs/ADMIN_IA_ACCESS.md`, `docs/ARCHITECTURE.md` (new save/publish
  endpoints and contracts), `docs/DESIGN.md` (admin editing archetype),
  `docs/agent/tasks.json`, `docs/HANDOFF.md`, `docs/WORKLOG.md` per the
  minimum-update rules in `AGENTS.md`.

## Acceptance Criteria

Phase 1 is done only when ALL of the following hold:

1. **The fool test.** A person who has never seen the admin or any
   documentation, given only the login, completes: "replace one photo on a
   project page and make it live, confirm it on the public site" in under
   5 minutes, unassisted. Record this as a scripted golden workflow
   (steps + timing) in the handoff evidence. If a real naive tester is not
   available, Jay performs it; do not self-certify.
2. Editing a full project (fields + one fact + one hotspot moved + one image
   swapped) requires exactly one Save action and zero confirm dialogs.
3. Draft preview is pixel-faithful to the public page for published-equivalent
   data (same components, not a lookalike).
4. No editor-facing surface shows: bucket names, promotion language, per-child
   publish status controls, migration/fallback language, or raw coordinate
   inputs.
5. `npm run build`, `npm run lint`, `npx tsc -b`, `npm run agent:smoke` pass;
   `npm run gate` passes before push (per `docs/OPERATING_PROTOCOL.md`).
6. Anonymous/public boundary proofs still pass: draft content invisible
   publicly, tagged QA rows cleaned, no service-role key in browser code
   (service role lives only in Pages Functions env).
7. Bundle boundaries hold (entry < 500 KB, Supabase vendor chunk not
   module-preloaded — enforced by the existing auth-browser gate).

## Anti-Goals (Do Not Do These)

- Do NOT run another label/copy-only "clarify" pass in place of restructuring.
- Do NOT weaken or bypass RLS, remove draft-first import posture, remove
  static fallback, or add destructive deletes (still decision-gated by Jay).
- Do NOT switch to an off-the-shelf CMS; the decision is rebuild-in-place to
  keep the RLS architecture and exploit same-repo preview fidelity.
- Do NOT expose new Supabase keys to the browser. Privileged publish/promotion
  logic goes into `functions/api/admin/` with server-side auth verification
  (mirror the existing invite endpoint's session validation).
- Do NOT keep the six-form parallel state machine and merely restyle it.
- Do NOT contort the new UI to keep `scripts/check-admin-crud-coverage.mjs`
  string assertions green. That verifier asserts literal UI copy; it WILL fail
  when the shape changes. Update the verifier's expectations deliberately as
  part of the same change, and prefer replacing dead string assertions with
  behavior-level checks. The verifier serves the product, not the reverse.

## Verification Notes For The Executor

- Work on a branch, gate locally (`npm run gate`), verify on a Cloudflare
  preview deployment, then promote to `main` per `docs/OPERATING_PROTOCOL.md`.
- Any new server endpoint needs: session validation, role check, audit row,
  and coverage in `npm run agent:smoke` safe-failure checks (no-secret mode
  must fail safely, mirroring `/api/enquiries` behavior).
- Live-write QA (tagged rows, Storage objects) still requires Jay's explicit
  per-action approval. Plan-only/dry-run modes stay the default for any new
  verification script you add.
- If schema changes are needed (e.g., an RPC for atomic aggregate save), add a
  migration under `supabase/migrations/` following existing naming, keep it
  source-verified, and flag production apply as an approval-gated step in
  `docs/HANDOFF.md` — the same discipline as the pending media role migration.

## Key File Map

- Admin (current shape): `src/pages/admin/AdminProjectsPage.tsx`,
  `AdminMediaPage.tsx`, `AdminCmsPrimitives.tsx`, `AdminState.tsx`,
  `RequireAdmin.tsx`, `src/lib/adminAuth.tsx`, `src/lib/adminAudit.ts`
- Public rendering to reuse for preview: `src/pages/ProjectDetails.tsx`,
  `src/components/projects/`, `src/service/ProjectService.ts`,
  `src/service/publicContentOverlay.ts`, `src/lib/publicMediaUrl.ts`
- Server endpoint patterns: `functions/api/admin/`, `functions/_lib/admin-invite.js`,
  `functions/_lib/forms.js`
- Harness: `AGENTS.md`, `docs/OPERATING_PROTOCOL.md`, `docs/agent/tasks.json`,
  `docs/agent/verification.md`, `scripts/check-admin-crud-coverage.mjs`

## Task Bookkeeping

When picking this up, register it in `docs/agent/tasks.json` (e.g.
`NOW-ADMIN-UX-RESHAPE-001`) once a `now` slot frees up from the current P0
closure, keeping the max-3 `now` rule from `docs/agent/harness-gc.md`. This
plan document is the design authority for that task; `docs/HANDOFF.md` should
point at it while the work is active.

## Document Lifecycle (Sunset Clause - Jay's Directive)

This file is a temporary execution directive, not a permanent canonical doc.
It MUST be deleted once the reshape work completes, so it never competes with
canonical docs as a stale authority. Deletion is part of the task's definition
of done, in this order:

1. Absorb the durable content into the canonical owners first:
   - The five design rules -> `docs/DESIGN.md` as the admin editing archetype
     (future admin surfaces are judged against them there).
   - New save/publish/promotion endpoint and RPC contracts -> `docs/ARCHITECTURE.md`.
   - The fool test -> `docs/agent/verification.md` as a permanent golden workflow.
   - Execution evidence and outcomes -> `docs/WORKLOG.md`.
2. Remove every reference to this file from other docs (`docs/HANDOFF.md`,
   `docs/agent/tasks.json`, and any others `git grep ADMIN_UX_RESHAPE_PLAN`
   finds).
3. Delete this file in the same change, then run `npm run agent:check` and
   `git diff --check` to confirm no dangling references.

Do not mark `NOW-ADMIN-UX-RESHAPE-001` done while this file still exists.
While the earlier phases are still in progress, this file remains the design
authority and must be kept accurate.
