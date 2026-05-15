# Agent Verification Matrix

Last updated: 2026-05-15

## Purpose
Use this matrix to choose the smallest verification set that proves a change is safe. Runtime changes still need the full build/lint/typecheck gate unless a task explicitly defines a temporary exception.

## Startup Check
Use when resuming work or handing off between agents.

Run:
- `npm run agent:init`

This command is informational and does not replace verification gates.

## Verification Profiles

### Docs-Only
Use when changing Markdown, JSON task state, or harness instructions without touching runtime source.

Run:
- `npm run agent:check`
- `git diff --check`

Evidence to record:
- Which docs changed.
- Whether any repo-path or harness checks failed.
- Whether runtime gates were intentionally skipped.

### Runtime UI
Use when changing `src/**`, `public/**`, route behavior, visual layout, user-facing copy, or CTA behavior.

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`

Evidence to record:
- Affected routes.
- Brand/design alignment note.
- Residual visual or responsive risks.

### Data or Content Contract
Use when changing `data/**`, `public/articles/**`, service-layer view models, or typed data contracts.

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:check`
- `npm run agent:smoke` when route output changes.

Evidence to record:
- Source files changed.
- Any normalization, fallback, or missing-data behavior.
- Affected runtime pages.

### Route, Navigation, or CTA Contract
Use when changing `src/App.tsx`, shared header/footer links, route params, mailto/tel behavior, or form behavior.

Run:
- `npm run build`
- `npm run lint`
- `npx tsc -b`
- `npm run agent:smoke`

Evidence to record:
- Declared routes changed.
- Navigation surfaces changed.
- Any backend absence or mailto fallback remains explicit.

### Deployment or Tooling
Use when changing `.github/**`, `package.json`, `vite.config.ts`, `tsconfig*.json`, ESLint config, or scripts.

Run:
- `npm run agent:check`
- `npm run lint`
- `npm run build` when bundling/deploy behavior might change.
- Tool-specific dry run where available.

Evidence to record:
- Command output summary.
- Any credentials, environment, or CI assumptions.

## Output Rule
Every completed task should leave a short verification note in `docs/WORKLOG.md` and should keep `docs/HANDOFF.md` current if it changes the next recommended action.
