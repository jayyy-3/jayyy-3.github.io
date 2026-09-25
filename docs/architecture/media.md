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
