# Delivery and Functions contract

Build, deployment, Pages Functions routing and static Cloudflare config, plus the isolated verification environment. Verification selection: `docs/agent/verification.md`; runbook: `docs/CLOUDFLARE_DEPLOYMENT.md`. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

## Deployment and Build Contract — build, deploy and Functions

- Current deployment workflow: `.github/workflows/deploy.yml`
  - Trigger: push to `main`
  - Pipeline: `npm ci` -> `npm run build` -> copy `dist/index.html` to `dist/404.html` -> deploy `dist/` to GitHub Pages
  - GitHub Pages does not read Cloudflare `_redirects`; `dist/404.html` is a short-term SPA fallback so direct clean-route visits can load the React app during the GitHub Pages preview period.
  - This fallback does not change the launch target and should not be treated as the final Cloudflare Pages routing mechanism.
- Local pre-push gate: `npm run gate` (`scripts/container-gate.sh`) checks whitespace, then runs the deduplicated verification graph in clean Node 20. Build includes TypeScript; the graph runs each selected check once per configuration. Ignored dotenv/local binding files are excluded from the image. CI uses Node 22 for pinned Wrangler and isolated Functions verification. Delivery/category rules live in `docs/OPERATING_PROTOCOL.md` and `docs/agent/verification.md`.
- Launch target deployment workflow:
  - Cloudflare Pages Git integration builds the repository.
  - Build command: `npm run build`
  - Output directory: `dist`
  - Production branch: `main` unless a later release process changes it.
  - Preview deployments are required for branch/PR review.
  - Cloudflare environment variables and secrets must not be committed.
  - Function routing (`public/_routes.json`) includes `/*` for the edge SEO middleware and excludes `/assets/*`, `/fonts/*`, `/media/*`, `/images/*` and `/downloads/*`, so hashed assets and media never invoke Functions.
- Edge SEO middleware (`functions/_middleware.js` → `functions/_lib/edge-seo.js`, model in `src/lib/edgeSeo.ts`): `/api/*` and `/image/*` pass straight to their Functions unchanged. For other GET/HEAD requests, static files and `_redirects` answer first; only the SPA shell is rewritten with HTMLRewriter to carry the route's title, description, robots, self canonical, Open Graph/Twitter tags, JSON-LD and a `urblo:edge-seo` marker. Unknown public paths (and archived/managed records) return 404 with the same shell, trailing-slash variants 301 to the canonical path, `/admin/*` shells pass through untouched, and `/sitemap.xml` is generated from the static registry plus Published projects/stones/products/articles. Published rows are read with the browser-safe key from the build-emitted `seo-edge-config.json` (never a service-role key; the path itself answers 404 publicly), cached 5 minutes fresh / 24 hours stale-while-revalidate in isolate memory and the Cache API; a detail miss older than 30 seconds rechecks once, and a failed CMS read serves the unchanged shell rather than asserting 404.
  - Deployed preview route/asset/redirect/API safe-failure smoke is staged through `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`. The command requires no secrets, rejects placeholder or non-origin base URLs before any network checks, rejects redirects on every direct-refresh route, requires every SPA route to reference the same entry assets as `/`, recursively discovers same-origin query-free `/assets/*` JS/CSS paths, requires JavaScript/CSS MIME types, and rejects an SPA HTML shell even when an asset URL returns HTTP 200. Absolute, protocol-relative, cross-origin, query-bearing, fragment-bearing, or namespace-escaping asset references fail instead of being rewritten to a different URL for verification. The gate also checks that the deployed admin bundle still contains the configuration-required/profile-gate contract without browser service-role env access patterns, checks Cloudflare-applied legacy redirects, verifies `/api/enquiries` and `/api/sample-requests` reject unsafe methods/malformed JSON/invalid payloads without creating rows, and verifies unauthenticated GET and POST requests to `/api/admin/projects` return structured `401` responses before database work while OPTIONS advertises GET/POST plus authorization/content-type. Production apex, `www`, and the moving `urblo.pages.dev` alias are matched after FQDN trailing-dot normalization and require an independent exact `--reference-url https://<8-hex-deployment>.urblo.pages.dev`; the full asset graph must match that immutable release byte-for-byte and by MIME. A removed long-lived cache header remains visible as a warning only after that comparison, and otherwise fails.
  - Current verified runtime: PR `#6` merge `a2a7ae5` is deployed as `c7a910df-6dd3-440b-8971-a6120353ed19`. Its immutable URL and both production custom domains pass the bound MIME/body-aware smoke. Four unchanged apex assets retain stale long-lived response-header warnings after exact immutable comparison; the latest `www` readback was warning-free.
- Current Pages Function source lives under `functions/api/enquiries.js`, `functions/api/sample-requests.js`, `functions/api/admin/invite-user.js`, `functions/api/admin/projects.js`, `functions/api/admin/image-qr.js`, and `functions/image/[slug].js`; shared protected Projects and Image QR behavior lives in `functions/_lib/`.
- Vite base config: `vite.config.ts`
  - `base: '/'` for root-domain Cloudflare Pages clean URL routing.
- Cloudflare Pages static config:
  - `public/_redirects` provides SPA fallback with `/* /index.html 200`.
  - Cloudflare Pages should continue to use `_redirects`; the GitHub Pages `404.html` fallback is harmless but not required on Cloudflare.
  - `public/_routes.json` includes `/*` (edge SEO middleware) and excludes the static asset and media folders.
  - `public/_headers` sets conservative launch security headers only. Project-authored `Cache-Control` overrides for `/assets/*`, `/fonts/*`, and `/media/*` are intentionally absent after a custom-domain cache stored SPA HTML under hashed asset URLs; Cloudflare Pages default cache/revalidation behavior is authoritative. Some unchanged apex assets can still expose the retired response header until Cloudflare revalidates them, so the deployed gate compares their exact bytes and MIME with the immutable deployment and reports the header as a warning rather than hiding it.
- Build script contract: `package.json`
  - `npm run build` => `tsc -b && vite build`
  - `npm run lint` => `eslint .`
  - typecheck path => `npx tsc -b`
- TypeScript contract update:
  - `resolveJsonModule: true` enabled in `tsconfig.app.json` to support `stone_library.json` imports.
- Lint scope contract update:
  - `.vite/**` ignored in `eslint.config.js`.

## Isolated verification environment

`supabase/config.toml` and the guarded local scripts define `urblo-isolated-v1` with synthetic Auth profiles, draft Articles and a generated test image. Local app execution uses actual Wrangler Pages Functions and local Storage/Postgres, with separate Vite envDir and generated local-only bindings; no production dotenv fallback is used. Preview remains production-backed/read-only. The historical helper-grant migration is conditional on the hosted-only helper existing, preserving its original privilege result. See `docs/LOCAL_DEVELOPMENT.md`.
