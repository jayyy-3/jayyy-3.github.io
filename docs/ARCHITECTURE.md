# Urblo Web - Architecture and Contracts

This is the index. Stable technical contracts (routes, data, side effects and invariants) live in one file per module under `docs/architecture/`, each at most 8KB so `agent:init` can list only what a task touches. On 2026-09-26 (NOW-OPT-AGENT-DOCS-SLIM-001) every section of the previous single file moved there verbatim; nothing was removed. When a contract changes, edit the module file, not this index.

| File | Covers | Modules (`docs/agent/modules.json`) |
|---|---|---|
| `docs/architecture/platform.md` | System boundary, runtime and launch stack, known architecture risks, brand/design linkage rule | all (on demand) |
| `docs/architecture/harness.md` | Agent harness contract, where release evidence lives | harness |
| `docs/architecture/delivery.md` | Deployment and build contract, Pages Functions routing and source, static Cloudflare config, isolated verification environment | delivery |
| `docs/architecture/public-routes.md` | Route interface (`src/App.tsx`), route state, UI motion, navigation surfaces | public-ui |
| `docs/architecture/public-metadata.md` | Metadata/SEO contract, public slugs and redirects | public-ui |
| `docs/architecture/homepage.md` | Homepage contract | public-ui (on demand) |
| `docs/architecture/public-media.md` | Current static media contract | public-ui, stone-library (on demand) |
| `docs/architecture/content-data.md` | Published overlay with static fallback, content import readiness, access control, storage and side effects | content modules (on demand) |
| `docs/architecture/projects.md` | Project data contract, public rendering, media blocks, hotspots | projects |
| `docs/architecture/projects-admin.md` | Projects admin editor, aggregate endpoint/RPC, migrations | projects |
| `docs/architecture/stone-library.md` | Stone Library detail interaction and data contract | stone-library |
| `docs/architecture/stone-library-admin.md` | Stone aggregate/workspace contract | stone-library |
| `docs/architecture/products.md` | Product data, product store, Products admin | products |
| `docs/architecture/articles.md` | Article data, Articles admin, protected Function module boundaries | articles |
| `docs/architecture/forms.md` | Contact page, form Functions, notifications, Leads | forms |
| `docs/architecture/media.md` | Admin media, promotion, Storage role boundary | media |
| `docs/architecture/qr.md` | Image QR and material association | qr |
| `docs/architecture/auth-settings.md` | Admin Auth, invite/recovery, bootstrap, Settings, company locations | auth-settings |
| `docs/architecture/admin-cms.md` | Dashboard, Change history, shared admin rules and live verifiers | auth-settings |

Sections that were split across modules keep their original heading as a prefix, for example `## Deployment and Build Contract — admin media entries` or `### Supabase Launch Data Contract — Projects`, so a search for the old heading still finds every part.

Other authorities: product design `docs/DESIGN.md`; brand and claims `docs/brand-baseline.md`; admin routes and roles `docs/ADMIN_IA_ACCESS.md`; database `docs/SUPABASE_SCHEMA.md`; deployment runbook `docs/CLOUDFLARE_DEPLOYMENT.md`; module map `docs/PROJECT_MAP.md`.
