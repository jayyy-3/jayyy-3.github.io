# Verification entry points

Use `npm run agent:init -- --task <id>` to locate the task and scope. `npm run agent:doctor -- --target local` (or preview/production) reports prerequisites without writes or secret output. `--strict` fails on missing prerequisites; default doctor mode is advisory.

`npm run agent:verify -- --base <sha>` classifies all changes against the base, including working/staged/untracked paths. Without a base it uses the merge base with origin/main. `--plan` prints the graph without execution. `--out <path>` saves machine-readable results; every execution also retains a unique ignored `.tmp/verification/<attemptId>/` directory. Never use `--suite docs` to override classification before release.

The category table is under [Which suite runs](#which-suite-runs).

`npm run gate` runs the deduplicated source graph in clean Node 20. `agent:smoke`, `agent:admin-cms-predeploy`, `agent:check` remain compatible. Running separate aliases separately is a separate verification invocation; use the combined graph to avoid duplicate nodes. Configured and env-less builds are distinct configurations. No suite certifies live CMS golden workflows or production writes.

Use `agent:verify --plan` to identify the applicable checks. For runtime/tooling changes, the required clean container gate supplies the source-graph evidence; add only checks it does not cover, such as the no-config browser gate. Do not first repeat the complete source graph on the host. Record-only changes run the classified docs graph. The sections below describe coverage and additional checks, not cumulative command lists. After a graph passes, do not rerun its covered checks through standalone aliases for the same tested inputs and environment. Recheck affected coverage when code, check inputs or configuration change, or a new failure warrants investigation. Configured builds, isolated database journeys, deployed smoke and required CI remain distinct checks. Run `git diff --check` once for the final patch.

The registry in `scripts/_lib/verification.mjs` owns dependencies; classification tests cover actual Git rename/delete/untracked records and runtime fingerprints. `quality` always resolves on PRs, including record-only PRs; runtime smoke failure makes it fail. Main branch protection needs repository administrator access.

## Unit tests (vitest)

`npm test` runs vitest 4 once in Node 20+ (`vitest.config.ts` extends the Vite config). Behaviour assertions live in `tests/*.test.ts` (forms API, public overlay, Stone workspace, Image QR, Projects aggregate, admin identity) and beside the code as `src/**/*.test.ts` (admin editors). `tests/setup/no-network.ts` fails any unmocked fetch or WebSocket; suites use in-memory Supabase/HTTP doubles and never reach Preview or production.
- Graph node `unit` sits in the smoke and admin suites, so every tooling, runtime and migration graph runs it; record docs do not.
- `tests/**`, `src/**/*.test.ts(x)` and `vitest.config.*` classify as tooling: full source graph, no deployment. A test file under `functions/` or `public/` still deploys.
- `agent:stone-workspace` and `agent:public-content-overlay` delegate to their vitest files. `agent:admin-image-qr` and `agent:admin-projects-aggregate` run their source checks, then their vitest file; the graph passes `--source-only` to avoid running it twice.
- Add new behaviour checks as `*.test.ts`, not as new `scripts/check-*.mjs` assertions.
- Exception: `scripts/check-admin-guide.mjs` (graph node `guide`, in the docs and admin suites) is a docs-to-source consistency check. It keeps the colleague quick guide `docs/ADMIN_EDITOR_GUIDE.md` to one screen, free of technical terms, in the Markdown subset the admin Help drawer renders, and naming only control labels present in the admin source. The guide is bundled into the admin build, so editing it classifies as runtime.

Runtime CI additionally runs `npm run local:verify` with Node 22 before deployment. That local configuration has its own build and real database; it is distinct from the configured production build. Synthetic journeys cover QR upload/material save/refresh/public readback; Projects private draft/publish/hide, delayed-load cancellation and material points on a page image (enable, add point and material, Save/refresh, turn off); Articles validation/API-failure recovery/parent-bound section saves/selection locks/public rendering; Contact/Sample Request persistence and owner inbox readback; and an unprofiled account boundary. External mail is disabled; notification-provider logic is separately covered by in-memory forms API checks.

## Which suite runs

`scripts/_lib/verification.mjs` (`pathCategory` and `classify`) owns the selection; this table only illustrates it. The highest category among all changed paths wins.

| You change | Category → suite | Checks | Deploy |
| --- | --- | --- | --- |
| Only `docs/**`, `AGENTS.md`, `README.md` | Record docs → `docs` | state, paths, startup budget, harness and classifier; foundation dependency | No |
| `scripts/**` (except container-gate/deploy/build/release), `tests/**`, `*.test.ts`, `vitest.config.*` | Tooling → `container` | full source graph, build/lint, knip (unused files/dependencies) and behavior checks | No, unless release/build input |
| `src/**`, `public/**`, `functions/**`, `.github/**`, `package.json`, lockfile, Vite/TS/ESLint/Tailwind config, `index.html`, unknown paths | Runtime or unknown → `runtime` | full graph plus browser config gate | Yes, then immutable smoke |
| `supabase/migrations/**` | Migration → `migrations` | runtime graph; isolated reset/journey proof before deployment | Yes; SQL application is a separate authorization boundary |

Specialized evidence lists (SEO, data, routes, Cloudflare, migrations, forms, Admin CMS), live-runner flags and their approval gates are in `docs/agent/live-verification.md`; read the section for your change on demand. The pre-2026-09-26 full text is archived byte-for-byte at `docs/archive/2026-09-26/docs__agent__verification.md`.

## Output Rule
Every completed task should leave a short verification note in `docs/WORKLOG.md` and should keep `docs/HANDOFF.md` current if it changes the next recommended action.

The local doctor requires Node 22+ for Wrangler; the clean source gate uses Node 20. Preview diagnostics require an explicit `--base-url https://<preview>.urblo-site.pages.dev`; the doctor never substitutes the recorded production immutable deployment for a missing Preview target. `agent:init --json` distinguishes the current checkout from observed production, exposes next action and module paths, and supports an explicit idle repository state after completed work is archived.

Deployment readiness behavior is covered by `node scripts/check-deployment-readiness.mjs` in the container/runtime graphs: bounded recovery and timeout, no credential/body forwarding, immutable-only GETs, immediate redirect/access/contract rejection and safe diagnostics. This adds no live writes or relaxation of the complete deployed smoke.
