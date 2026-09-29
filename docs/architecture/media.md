# Media contract

Admin media upload, private-to-public promotion and Storage role boundary. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

## Deployment and Build Contract — admin media entries

  - Current admin media source: `/admin/media` reads up to 500 current `media_assets` records, keeps new External media state stable, uploads every new file to `urblo-admin-media`, and exports the loaded manifest to CSV for active Website owner / CMS manager / editor roles. A metadata-insert failure is read back before any cleanup; Website owners/CMS managers can best-effort remove a confirmed unreferenced private orphan, while Editors receive an explicit private-orphan warning because current delete RLS blocks their cleanup. Website owners/CMS managers can publish an existing private upload through a create-only copy into `urblo-public-media`; the operation is bound to the selected row's original private path and `updated_at`, the destination is never overwritten, ambiguous database results are read back, and rollback/cleanup first checks for other `media_assets` references. Storage and database writes are not atomic, so unknown/reference/readback/rollback failures retain the object and report its path for manual repair. Editors cannot run private promotion because current Storage RLS does not give them the delete capability required for safe rollback. Applied production migration `20260714050750_media_public_bucket_role_hardening.sql` also prevents Editors from bypassing this UI through a direct public-bucket insert/update. CSV export must write a change-history row before downloading.
  - `npm run agent:admin-media-role-boundary-live` is the separate approval-gated Storage policy verifier. Default/report mode performs no login or writes. With `--allow-writes --strict` and distinct active Editor plus owner/admin credentials, it proves Editor private insert/update succeeds, Editor public insert/update is denied, owner/admin public insert/update succeeds, and all tagged objects are removed. Byte/absence reads use a unique cache nonce to bypass Supabase CDN invalidation delay. The applied migration/policy readback and approved production proof passed on 2026-07-14 with independent zero-object cleanup readback; any rerun requires fresh approval.

### Supabase Launch Data Contract — media

- Media:
  - Storage-backed or external media records with source, status, alt text, credit, usage notes, technical metadata, and public/private bucket state.
  - Public adapters resolve `source_url` for published external/R2/Stream records. Published Storage records resolve only when `bucket = urblo-public-media` and `object_path` exists; private or Draft media never produces a public Storage URL.

### Supabase Launch Data Contract — Admin IA/access (media)

- Admin IA/access:
  - `/admin/media` is the first media CRUD screen and uses `media_assets` plus Supabase Storage buckets for upload-backed draft records, external records, metadata editing, audit-gated manifest export, and publish/archive guardrails.

## Shared admin media picker — 2026-09-28 (NOW-OPT-ADMIN-MEDIA-PICKER-001)

- `src/pages/admin/media/AdminMediaPicker.tsx` (UI, uploads, audit) and `mediaPickerFiles.ts` (pure file rules) serve Projects (`InlineMediaField` wrapper, page-loaded image list, `uploadPolicy="original"`, 10 MB, original kept), Products hero and model images, Articles cover and section images (self-loading, `uploadPolicy="optimize"`) and the Settings default share image (`selectable="published"`, no upload; stores the image's public address).
- Self-loading search queries `media_assets` on the server (image, not archived, alt/caption `ilike`, newest 24) instead of a fixed recent list; the selected image is read by ID. Private Drafts preview through one-hour signed links.
- Limits are shown before a file is chosen: optimize accepts JPG/PNG/WebP/AVIF up to 50 MB (resized in the browser to 2560 px by `optimizeImageForQr`, then at most 10 MB uploaded) and GIF up to 10 MB unchanged. HEIC gets plain guidance (no client transcode). Alt text starts empty, is required, and a file-name description (e.g. "IMG 4032") is rejected.
- Uploads keep the existing private-first contract: create-only upload to `urblo-admin-media`, Draft `media_assets` row, metadata readback, owner/admin-only cleanup, `media_asset.upload`/`media_asset.update` audit with a per-module `source`. No schema, Function or RLS change.
- Products and Articles still do not promote media at publish: a Draft image stays hidden publicly until a Website owner/CMS manager publishes it on the Media screen. The Projects server path copies storage objects with the exported `prepareMediaPromotions`, but the database side is bound to the `admin_project_aggregate` RPC (`p_promotions`), so reuse needs a new protected endpoint (follow-up).
- The Media screen keeps library/path/cleanup text behind Details (`technicalDetail(...)`); `agent:admin-crud-coverage` fails on user-visible bucket/Storage/promotion/rollback wording there.
