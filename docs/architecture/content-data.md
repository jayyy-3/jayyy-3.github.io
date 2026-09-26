# Content data and side-effect contract

Published CMS overlay with static fallback, content import readiness, access control, storage and side effects. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

### Supabase Launch Data Contract — content import and public overlay

- Content import readiness:
  - `scripts/check-content-import-readiness.mjs` is the source-only dry run for static-to-Supabase import preparation.
  - It intentionally marks import candidates as `draft` and uses natural keys/source URLs so provisional static content is not treated as final published client-approved content.
  - It extracts current legacy article newsletter HTML into draft structured blocks with claim-review metadata, while keeping source copy unpublished and review-gated.
  - The optional `--out` flag writes a local ignored JSON artifact for review without writing Supabase rows.
  - The optional `--plan-out` flag writes a local ignored Markdown apply/rollback plan for review without writing Supabase rows.
  - The optional `--preflight-sql-out` flag writes a local ignored read-only SQL artifact for reviewing current target table counts, status distribution, RLS state, and policies before any import is approved.
  - The optional `--apply-sql-out` flag writes a local ignored guarded draft import SQL artifact. It is not executed by the harness, aborts by default unless an explicit in-transaction approval setting is added, keeps imported content in `draft`, and requires a second explicit merge approval if target parent natural keys already exist.
  - Project import now prefers structured `mediaBlocks` from `src/data/projectData.ts` over legacy gallery fields, maps `normal_image` and `hotspot_image` rows into `project_media`, prepares `project_material_maps` for hotspot images, and keeps YouTube rows supported when future project data includes a client-approved video.
- Public migration overlay:
  - Published Projects, Products, and Articles overlay the matching static item by canonical slug; unrelated static items remain until an explicit CMS-only cutover.
  - Matching Published Projects keep static `sector`/`category` taxonomy and static-only CTA display structures until those values are fully represented by the public CMS adapter. CMS-owned title, summary, approved facts/materials, ordered media, maps/hotspots, and metadata win. If any dependent Project relation read fails, the CMS Project collection is rejected for that read so the intact static fallback remains.
  - Stone Library uses one published catalogue snapshot; managed keys never fall back to static content. Configured RPC/client failures show a retry state. Successful reads may add only unmanaged bundled fallback keys; unconfigured local builds use static data.
  - Draft rows do not replace static migration fallback. Applied migration A added `get_archived_project_slugs()` so Archive can suppress a matching bundled Project. Applied/read-back migration `20260802103337_restrict_archived_project_tombstones.sql` removes private-draft reads and returns only the archived-canonical/five-public-fallback intersection; the public adapter rejects any unexpected slug independently. The 2026-08-02 result is the expected empty list. If the RPC is unavailable, source preserves healthy static pages.
  - Public Project material/map/hotspot consumption and shared draft/public rendering are deployed. Deterministic tests cover stale-Save 409, the conflict reload-only lock, and full failed-Publish public-copy compensation; production deployment-bound smoke/login and A/C/B readbacks pass. Optional live negative proof needs separate approval, and User acceptance and optional live negative proof are tracked separately in the task queue and WORKLOG.

### Supabase Launch Data Contract — access control

- Access control:
  - Public reads expose only published content.
  - Admin writes require Supabase Auth.
  - RLS must be enabled for exposed tables before any public integration is considered complete.

## Storage and Side-Effect Contract
- Local storage keys:
  - `seenPopup` read and written by `WelcomePopup` on first display
- Dangerous HTML render points:
  - `ArticlePage` renders sanitized article HTML
- Runtime fetches:
  - Static JSON/HTML from `public/articles` remains the legacy Article fallback.
  - `src/lib/publicContentClient.ts` creates a non-session browser client from `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`; no public client is created when neither key exists.
  - Projects, Products, Articles, Stone Library, and default site settings read Published Supabase data directly through that browser client and public RLS, then apply their documented static fallback/overlay contracts.
  - Published Storage media resolves only from `urblo-public-media`; Draft, private, invalid, or unsafe media locations do not become public URLs.
  - Contact form POST requests to `/api/enquiries` and `/api/sample-requests`
  - Admin routes use `@supabase/supabase-js` only when `VITE_SUPABASE_ANON_KEY` or `VITE_SUPABASE_PUBLISHABLE_KEY` is configured.
- Contact side effects:
  - Contact page submit sends validated form payloads to Cloudflare Pages Functions.
  - Direct email and phone links remain available as manual contact channels.
- Supabase and API side effects:
  - Public content/settings reads use the browser-safe public Supabase client and published-only RLS; service-role credentials never enter browser code.
  - Admin paths require authenticated Supabase sessions.
  - Media uploads use Supabase Storage only from authenticated admin/editor sessions, always enter the private `urblo-admin-media` bucket first, and create/update `media_assets` metadata through RLS. Public Storage is reached only through the guarded owner/admin promotion path.
  - Form submissions create durable Supabase records and email notifications.
  - Old WordPress media URLs must not remain first-viewport production dependencies.
