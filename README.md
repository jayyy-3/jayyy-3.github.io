# Urblo Web

Urblo web communicates a design-led, engineering-backed natural stone system for streetscapes and civil landscapes.

## Current Status

- Current implementation: React public site on Cloudflare Pages with Supabase-backed forms, public CMS reads, and an Urblo-owned `/admin` CMS.
- Production status: `https://urblo.com.au` and `https://www.urblo.com.au` are live on Cloudflare Pages, with deployed route/API smoke passing.
- Backend status: Pages Functions handle Contact, Sample Request, and admin invite paths; Supabase provides data, auth, storage, RLS, and CMS content.
- Admin CMS status: production active-admin browser QA and final editor handoff readiness have passed. Optional follow-ups remain for real Settings invite proof, customer content review/publish decisions, and final Turnstile proof.
- Planning, current state, and handoff evidence live in the AI Harness docs under `docs/`.

## Agent Entry Points

Start with:

```sh
npm run agent:init
```

Then read:

- `AGENTS.md`
- `docs/HANDOFF.md`
- `docs/agent/status.json`
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

Harness GC can be run when agent-facing state feels stale or noisy:

```sh
npm run agent:harness-gc
npm run agent:harness-gc:review
```

## Deployment Direction

Cloudflare Pages is the active launch target. The current GitHub Pages workflow is legacy fallback only unless the launch plan changes.

See:

- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
