# Post-deploy readiness reference

On-demand reference for the `delivery` module (`docs/agent/modules.json`). Rule file: `docs/architecture/delivery.md`; runbook: `docs/CLOUDFLARE_DEPLOYMENT.md`.

## Readiness waits before the immutable smoke

`scripts/_lib/deployment-readiness.mjs` runs only when `scripts/check-cloudflare-preview-smoke.mjs` is called with `--wait-for-functions` on an immutable `https://<8-hex>.urblo-site.pages.dev` origin, as the CI "Verify immutable deployment" step in `.github/workflows/deploy.yml` does. Before any smoke assertion:

1. `waitForDeploymentFunctions` polls `/api/enquiries` until it answers the JSON `405 method_not_allowed` contract three attempts in a row.
2. `waitForDeploymentPages` (added 2026-10-15) polls `/` and `/projects` (`readinessPagePaths`) until every path returns `200 text/html` containing `<div id="root"></div>` and a Vite `/assets/*.js` reference (`pageShellReady`) three attempts in a row. Any path failing resets the window.

Both waits share one bounded pattern: up to 120 s each, 5 s backoff, 12 s per request, GET only, `redirect: 'manual'`, no headers or body. HTML 404/5xx/edge-error answers, a 200 without the shell and transport errors retry; redirects, 401/403/429 and malformed contracts fail at once. Diagnostics come from `responseDiagnostic` (status, type, body class, cf-ray), never response text. The waits add no assertion and weaken none: the smoke's route, asset, redirect, edge SEO and Function checks run unchanged afterwards. Behaviour is covered by `scripts/check-deployment-readiness.mjs` (graph node `deployment-readiness`).

History: the PR #95 and #96 first attempts and production run 38679742624 (main `eff2b17`, 2026-10-15) each failed "/ returned 404, expected 200" seconds after Function readiness and passed on re-run; the page wait closes that gap.

## Historical runtime note

Moved verbatim from `docs/architecture/delivery.md` on 2026-10-15 to keep that rule file within the startup budget:

  - Current verified runtime: PR `#6` merge `a2a7ae5` is deployed as `c7a910df-6dd3-440b-8971-a6120353ed19`. Its immutable URL and both production custom domains pass the bound MIME/body-aware smoke. Four unchanged apex assets retain stale long-lived response-header warnings after exact immutable comparison; the latest `www` readback was warning-free.
