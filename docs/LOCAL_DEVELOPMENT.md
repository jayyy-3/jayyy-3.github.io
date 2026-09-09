# Isolated local development

This environment uses synthetic data only. Cloudflare Preview still connects to production and remains read-only for maintenance QA.

## Start from a clean checkout

Prerequisites: Docker running on a local Unix socket, Node 22+ for Wrangler 4.130.0, and `npm ci`. The source/container gate continues to use Node 20; `.nvmrc` describes that verification baseline. Supabase CLI is pinned at 2.117.0 and its local PostgreSQL major version is 17.

1. Run `npm run agent:doctor -- --target local` for prerequisite diagnostics.
2. Run `npm run local:start` to start `urblo-isolated-v1`, apply migrations and seed synthetic accounts, two draft Articles and a test image.
3. Run `npm run local:dev` for the real Pages Functions and configured public/admin app at `http://127.0.0.1:8788`.
4. Sign in with `owner@urblo.example.test` or `editor@urblo.example.test`, password `Urblo-local-only-2026!`. These are public synthetic fixture credentials; never use them on a real account. `outsider@urblo.example.test` is a valid local Auth user without an admin profile.

The local API is `http://127.0.0.1:57321`, Postgres uses port 57322, and captured Auth mail is available at `http://127.0.0.1:57324`. Global self-registration is disabled; the email/password provider is enabled for the synthetic accounts. No SMTP2GO, Resend, Turnstile or production credentials are supplied. Existing deterministic Forms tests use notification substitutes; local Functions persistence is not evidence of real mail delivery.

`local:dev` builds into an ignored isolated directory with a separate Vite envDir, copies actual Function/shared-source/catalog modules, writes local-only bindings to a mode-0600 `.dev.vars`, and runs pinned Wrangler. It never modifies normal `dist/` or reads production dotenv files. Browser tests block non-local requests. QR download values remain canonical production URLs by design; the editor's relative Open page link is exercised on the local origin with the synthetic slug.

## Rebuild and verify

Stop `local:dev`, then run `npm run local:verify`. It checks target guards, starts the stack, resets and reseeds twice, transactionally tests hosted-helper revocation, starts real Functions, and runs the QR upload/save/refresh/public/Hide/Restore/unauthenticated-denial journey. Each run preserves its own JSON/log/screenshot evidence under ignored `.tmp/local/`. The app process is stopped afterward; the isolated database remains available for investigation.

- `npm run local:reset` replaces only this synthetic local database with migrations and fixtures.
- `npm run local:journeys` repeats the current browser journey against an already running `local:dev`.
- `npm run local:status` reads local prerequisites without printing keys.
- `npm run local:stop` stops this local project's containers while preserving its Docker data.

The wrappers reject cloud targets, linked projects, remote Docker contexts, inherited provider credentials and a same-named container belonging to another checkout. They do not accept `--linked`, `--project-ref` or arbitrary database URLs. To demonstrate fail-closed behavior, `npm run local:reset -- --api-url https://urblo.com.au` must fail before any Docker command or write. Do not use raw linked CLI reset commands as substitutes.

## Migration compatibility

The historical helper-grant migration assumed hosted `public.rls_auto_enable()` existed. Its revocations are now conditional on function existence, allowing a fresh local database to rebuild. When the helper exists, the exact same Public/anon/authenticated execution revocations apply. `local:migrations` proves that branch inside a rolled-back local transaction. The already applied production migration is not rerun or changed in the live database.

## Verification boundary

The current local journey proves the QR flow with a real local database, Storage and Pages Function. Broader Projects/Articles editing and deliberate failure recovery are the next test batch. Local evidence does not certify production SMTP ownership, real device scanning, CMS handoff or user acceptance. Required runtime CI runs this isolated proof before deploying Preview; no live business-data mutation is part of the workflow.
