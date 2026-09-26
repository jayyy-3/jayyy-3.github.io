# Articles contract

Article data, static fallback, structured blocks, the Articles admin module and protected Function module boundaries. Moved verbatim from `docs/ARCHITECTURE.md` (index) on 2026-09-26.

## Data Contracts

### Article Data Contract
- Static migration fallback root: `public/articles`
- Static index manifest: `public/articles/index.json`
- Static detail fallback: `public/articles/<sourceSlug-or-slug>/content.html`
- Public access layer: `src/service/ArticleService.ts`
  - `getAll()` loads the static manifest and Published Supabase article metadata, overlays matching canonical slugs, carries forward missing legacy/source slugs from the matching static item, retains unmatched static articles, and appends new Published articles.
  - `getBySlug(slug)` resolves canonical, source, and legacy slugs from that merged collection.
  - `getBody(meta)` prefers Published structured `article_blocks`; when no Published structured body exists it returns the legacy HTML source slug for the page fallback.
- Metadata type: `src/types/article.ts`
  - Canonical article slugs are lowercase kebab-case. `sourceSlug` keeps the legacy content folder name when the source HTML still lives in a title-case export folder, and `legacySlugs` preserves old public URLs for redirect compatibility.
- Loading behavior:
  - `src/pages/ArticlesPage.tsx` calls `ArticleService.getAll()` for the Published/static overlay.
  - `src/pages/ArticlePage.tsx` uses the same merged metadata and renders Published structured blocks when available; otherwise it fetches legacy HTML from `sourceSlug || slug`.
  - Published structured CTA/video destinations are rendered only after `src/lib/publicContentLink.ts` accepts and canonicalizes a root-relative path or an `http:`/`https:` URL. Protocol-relative, script/data schemes, encoded control characters, and backslash variants are omitted.
- Cover images in the article manifest use local controlled paths under `public/media/launch/articles`.
- Legacy detail HTML passes through `prepareArticleHtml` in `src/lib/articleMedia.ts` before DOMPurify sanitization.
- Runtime cleanup rewrites known email proxy image URLs to local article media, converts Google-hosted emoji images to text, removes Squarespace campaign wrappers where possible, and rewrites old product-PDF links to `/products`.
- Raw newsletter HTML remains committed only as migration source; do not treat it as the long-term authoring format.
- Approved structured block types are tracked in `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`; raw newsletter HTML remains migration source material, not the long-term authoring format.

## Deployment and Build Contract — Articles admin entry

  - Current Articles admin source: `/admin/articles` reads and saves `articles` and `article_blocks` records for active Website owner / CMS manager / editor roles once browser-safe Supabase config and an active profile exist. Article/block reads and saves are bound to the selected article and original row identity, late block loads are ignored, record switching is blocked while a save is active, and block updates constrain both block ID and article ID without rewriting `article_id`. Published CTA and video destinations must be a canonical root-relative path or an `http:`/`https:` URL; the public renderer repeats the check and omits unsafe links.

### Supabase Launch Data Contract — Articles

- Articles:
  - Article metadata plus structured block records.
  - Blocks cover rich text, image, gallery, quote, FAQ, CTA, project spotlight, stone reference, comparison table, proof metric, video embed, and callout.

### Supabase Launch Data Contract — Admin IA/access (Articles)

- Admin IA/access:
  - `/admin/articles` is the next content CRUD screen and uses article metadata plus structured article block records.

## Articles and protected Function module boundaries

`src/pages/admin/AdminArticlesPage.tsx` owns only the protected route wrapper. Under `src/pages/admin/articles/`, `types.ts` defines row/form shapes, `forms.ts` owns conversions/validation/publish readiness, `data.ts` owns browser-key reads and parent-bound writes, and `useArticleEditor.ts` owns selected identities, stale-load guards, save locks and audit sequencing. `ArticlesWorkspace.tsx`, `ArticleEditorComponents.tsx` and `BlockContentEditor.tsx` retain the existing presentation and action bindings. The module continues separate primary and audit writes, with the same partial-audit warning contract; it is not an aggregate API.

`functions/_lib/admin-runtime.js` shares service configuration/client creation and verified user/active-profile reads for QR and Projects. Each caller still owns allowed roles, viewer behavior, exact errors/statuses and response shape. Missing bearer checks remain before configuration, request body or database work. Client-side source never imports this server module.
