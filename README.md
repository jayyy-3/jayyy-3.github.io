# Urblo Web

Urblo web communicates a design-led, engineering-backed natural stone system for streetscapes and civil landscapes.

## Current Status

- Current implementation: static React frontend with file-backed content.
- Launch direction: Cloudflare Pages, Supabase, and an Urblo-owned `/admin` CMS.
- Current backend status: no production API, Supabase integration, or admin CMS is implemented yet.
- Planning and handoff live in the AI Harness docs under `docs/`.

## Agent Entry Points

Start with:

```sh
npm run agent:init
```

Then read:

- `AGENTS.md`
- `docs/HANDOFF.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `docs/ARCHITECTURE.md`
- `docs/NEXT_STEPS.md`

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

## Deployment Direction

Cloudflare Pages is the active launch target. The current GitHub Pages workflow is legacy fallback only unless the launch plan changes.

See:

- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
