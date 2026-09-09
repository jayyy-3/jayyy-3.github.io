# Urblo Web

Urblo web communicates a design-led, engineering-backed natural stone system for streetscapes and civil landscapes.

<!-- agent:status:start -->
## Current status

Observed 2026-09-09: public site **live**, QR **material_page_deployed**, CMS handoff **revalidation_required**.

Current task: **NOW-MAINTAINABILITY-001**. See [handoff](docs/HANDOFF.md), [task overview](docs/NEXT_STEPS.md) and [project map](docs/PROJECT_MAP.md). These summaries are generated from repository-owned state.
<!-- agent:status:end -->

## Agent Entry Points

Start with:

```sh
npm run agent:init
```

Read `AGENTS.md` and the module-specific files printed by init. Current state and tasks are structured; historical evidence is archived and not required on startup.

## Local Development

```sh
npm install
npm run dev
```

## Verification

Runtime changes should pass:

```sh
npm run build
npm run lint
npx tsc -b
npm run agent:smoke
```

Docs and harness changes should pass:

```sh
npm run agent:check
git diff --check
```

Harness GC can be run when agent-facing state feels stale or noisy:

```sh
npm run agent:harness-gc
npm run agent:harness-gc:review
```

## Deployment Direction

Cloudflare Pages is the active launch target. GitHub Actions deploys the Urblo-owned Pages project. Historical hosting resources are rollback evidence; consult current structured state for observations.

See:

- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
