# System boundary and platform

System boundary, runtime and launch stack, architecture risks and the brand/design linkage rule. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

Last updated: 2026-08-02

## System Boundary
- Current implementation: React application shipped as static assets plus Cloudflare Pages Functions under `/api/*` and stable public image resolution under `/image/*`.
- Current implementation: Cloudflare Pages Function source now exists for `/api/enquiries`, `/api/sample-requests`, the protected CMS invite endpoint `/api/admin/invite-user`, the protected Projects aggregate endpoint `/api/admin/projects`, the protected Image QR endpoint `/api/admin/image-qr`, the public QR-data endpoint `/api/image-qr/:slug`, and the material-page target `/image/:slug`.
- Current implementation: the public Contact page submits enquiries and sample requests to those API routes. The Capability Statement download form on `/capabilities` also submits an email-only lead to `/api/enquiries` with `project_type = Capability statement download` before revealing the PDF download link. The API source attempts server-side audit events after successful lead inserts, and Sample Request uses a service-role-only Supabase RPC so the request row and first item row are created atomically. Basic deployed Contact/Sample Request persistence is verified on `https://urblo.pages.dev`; the Capability-specific download capture path still needs separate live route verification.
- Current Supabase project: `Urblo` (`npkidywzwddbnfrnxlmo`, `ap-southeast-2`) has the foundation schema/RLS migrations, baseline seeds, admin settings/profile/helper hardening, admin profile email uniqueness, media Storage role hardening, and Projects aggregate expand A, minimum-disclosure C, and write-lockdown B applied/read back. B is `supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql`: authenticated users retain reads but no direct writes to the six Project tables/sequences; service-role writes remain behind the protected aggregate endpoint, RLS remains enabled, and public children require approved Published parents. The aggregate runtime is deployed at merge `25c05ebb` / immutable Cloudflare deployment `877d13c4-1e28-45d7-a62a-afdd3b0e0dda`. Production deployment-bound smoke and all nine authenticated routes pass. The production editor handoff remains `revalidation_required` until Jay's fool test and the broader golden workflows are complete.
- Launch target: Cloudflare Pages static frontend, Cloudflare Pages Functions API endpoints, Supabase Postgres/Auth/Storage, and an Urblo-owned admin interface for content operations.
- Planning source: `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`.
- Supabase schema design source: `docs/SUPABASE_SCHEMA.md`.
- Admin IA/access design source: `docs/ADMIN_IA_ACCESS.md`.
- Admin operations (handoff evidence, Auth setup, storage, verification, rollback, completed reshape record): `docs/ADMIN_OPERATIONS_RUNBOOK.md`. The colleague quick guide `docs/ADMIN_EDITOR_GUIDE.md` is bundled into the admin Help drawer (`src/pages/admin/AdminHelp.tsx`) and therefore classifies as a runtime build input.

## Runtime Stack
- Bundler/dev server: Vite 6
- UI runtime: React 19
- Routing: `react-router-dom` with `BrowserRouter`
- Styling: Tailwind CSS + project CSS (`src/index.css`)
- Client state: Zustand (`src/store/productStore.ts`)
- Motion/interaction: Framer Motion
- Supporting libraries: Swiper, DOMPurify, lucide-react, qrcode.react
- Route loading: public page components are lazy-loaded in `src/App.tsx`; admin page modules are independently lazy-loaded in `src/pages/admin/AdminApp.tsx`.

## Launch Target Stack
- Public hosting: Cloudflare Pages.
- Backend/API: Cloudflare Pages Functions scoped to `/api/*` plus `/image/*` for stable QR image targets.
- Database: Supabase Postgres.
- Authentication: Supabase Auth for the admin area.
- Admin UI: Urblo-owned `/admin` interface, not raw Supabase Studio for customer operation.
- Public form protection: Cloudflare Turnstile.
- Transactional email: SMTP2GO HTTP API preferred, with Resend compatibility retained, wired from server-side API code only.
- Media storage:
  - Current static stopgap: launch-critical identity, hero, contact, and route banner assets live under `public/media/launch`.
  - Supabase Storage for normal editorial, Stone Library, project, and article imagery. Initial buckets are applied: `urblo-public-media` for public-safe assets and `urblo-admin-media` for private draft/review assets.
  - Cloudflare R2 or Stream remains the review path for large homepage video assets if Supabase Storage or Pages asset limits are a poor fit.
- Cost planning:
  - Lean production target: about USD 30/month before tax/usage spikes.
  - Safer production target with paid transactional email headroom: about USD 50/month before tax/usage spikes.
  - See `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md` for the component-level cost table.
- Schema planning:
  - First production schema plan lives in `docs/SUPABASE_SCHEMA.md`.
  - First `/admin` route, access-state, role, module rollout, and field-ownership contract lives in `docs/ADMIN_IA_ACCESS.md`.
  - Foundation migrations and baseline seeds are applied; runtime is not considered migrated until admin UI and API contracts are implemented and verified.
  - Supabase execution order is foundation migration, baseline seeds, forms backend, admin auth shell, then content CRUD.

## Known Architecture Risks

- Production CMS/Auth handoff, SMTP ownership, Turnstile, content facts and user/device acceptance have their own evidence boundaries in `docs/agent/tasks.json` and `docs/agent/admin-handoff-evidence.json`. Synthetic local workflows do not certify those outcomes.
- Stone Library, Products, Articles and Settings use separate browser-key/RLS writes. They do not become atomic merely because their UI save succeeds. Projects uses its deployed aggregate RPC; Media promotion remains non-atomic and retains explicit compensation/readback handling.
- Published overlays retain static fallback. The installed Projects minimum-disclosure tombstone contract is limited to the approved bundled fallback keys; other content types still need an explicit CMS-only cutover/removal policy.
- Published settings have a validated public consumer with bounded retry. Logo/favicon media IDs, automatic CMS-only sitemap inventory and first-response server/prerendered metadata remain outside that contract.
- Products, Stone Library and Media remain larger modules. Follow-up refactors must first add representative behavior/failure tests, preserve existing roles and data contracts, and target a specific change boundary; file size alone is not a defect.
- Raw article newsletter HTML remains migration source material. Known proxy images and campaign links are normalized by the public renderer; safe link and content rendering boundaries must remain enforced.
- Current deployment/version/account observations belong in structured status and the Cloudflare runbook, not duplicated mutable snapshots here. Cloudflare-only rollback to legacy direct-write Projects is invalid under the installed write-lockdown migration.

## Brand and Design Linkage Rule
For UI/copy/IA changes, architecture and implementation decisions must be reviewed against:
- `docs/brand-baseline.md` for positioning, audience, voice, and claim safety.
- `docs/DESIGN.md` for visual rhythm, page composition, interaction tone, and responsive UI quality.

Brand and design linkage is advisory in execution flow, but required in task notes for high-impact user-facing changes.
