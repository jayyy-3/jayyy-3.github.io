# Urblo agent entry

## Start
1. Read `docs/OPERATING_PROTOCOL.md`.
2. Run `npm run agent:init -- --task <task-id>` (omit the ID to resume the current task).
3. Read only the module rules and source files listed by init. History is reference material, not startup instructions.

## Authorities
- Current release/environment observations: `docs/agent/status.json`.
- Execution scope, acceptance, authorization and blockers: `docs/agent/tasks.json`.
- Working process: `docs/OPERATING_PROTOCOL.md`.
- Brand, audience and claims: `docs/brand-baseline.md`.
- Visual design and UX: `docs/DESIGN.md`.
- Routes, data and side effects: `docs/ARCHITECTURE.md`; module index: `docs/PROJECT_MAP.md`.
- HANDOFF, NEXT_STEPS and the README status block are generated views. Edit their inputs, then run `npm run agent:state`.
- `docs/WORKLOG.md` and its archive are evidence history. Historical approval or a past passing test does not certify a different operation or current deployment.

## Boundaries
- Preserve unrelated dirty files. Work on a task branch; use an isolated worktree when the main checkout is dirty. Never commit directly to main.
- Follow the user's current task scope. Record authorization already given; never invent it. Continue authorized reversible work without repeated confirmation. Ask only for scope changes, new costs, destructive operations or required unavailable access.
- Live business-data/Storage writes, real email, user invitation, content publication, DNS and credential changes need explicit inclusion in the task's authorization. Read-only inspection and isolated synthetic local tests are separate.
- Never print or commit secrets, copy production customer data into tests, or expose service credentials in browser code.
- Local reset/seed tools must validate an isolated local target before any write. Preview currently uses production data and is read-only for maintenance QA.
- Preserve draft/public visibility, existing role/RLS checks, permanent QR addresses and static content fallback. No physical content deletion or broad CMS/API redesign as incidental refactoring.
- Preserve the brand promise first when brand and design conflict. For UI/claims changes, review the selected design and brand rules before implementation, verify rendered behavior, and record new durable decisions.

## Delivery
- Use the smallest applicable profile in `docs/agent/verification.md`. Unknown/build/security-sensitive changes require full verification. A failing required check blocks promotion.
- Record-only changes use the classified docs graph. Tooling/runtime changes use `npm run gate` for clean Node 20 verification before push. Commit the tested tree before pushing.
- Runtime delivery: branch checks → immutable Preview and smoke → approved merge → immutable/apex/www readback. Pure evidence docs run their required checks without deploying.
- Report code verification, deployment verification, and user acceptance separately. Route-shell or direct-API checks do not establish a working editor journey.
- CMS handoff remains `revalidation_required` until the existing strict production golden-workflow audit passes. Local tests cannot promote that status.

## Closeout
Update task phase/blockers and current observations; regenerate summaries; record scope, exact evidence, failures/retries and residual risks in WORKLOG. Preserve historical IDs and references when archiving. Run harness/path checks for docs and the required change-profile checks for code. Final response states the result, validation and any concrete remaining dependency.
