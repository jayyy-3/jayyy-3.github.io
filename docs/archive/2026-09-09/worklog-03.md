## Entry - 2026-06-04 (Admin Product Model Publish Checklist UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Product Model publishing readable before editors click Publish.
- Added a Model publish checklist for model key, model label, and model image readiness inside `/admin/products`.
- Locked the Model Publish button until that checklist is clear, and added the same guard in the save path so an editor cannot publish a model that cannot satisfy the Product publish checklist.
- Generalized the existing Product publish checklist component so product-level and model-level readiness can share the same visual pattern with clearer module-specific copy.
- Expanded admin CRUD coverage so the Product Model publish checklist and locked-publish source contract are guarded.

### Changed Files
- `src/pages/admin/AdminProductsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now requires the Product Model publish checklist and locked-publish source contract.
- `npm run agent:check`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is source-verified locally until the final production signed-in editor walkthrough confirms the flow with imported product rows after deployment.

### Next Handoff
- Continue the CMS goal with production walkthrough proof and any remaining editor confusion found during real-content use.

## Entry - 2026-06-04 (Admin Articles Publish Checklist UX)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making Article publishing readable before editors click Publish.
- Added an Article publish checklist for title, website URL, published date, excerpt, at least one Published structured block, and published-block content readiness.
- Locked the Article Publish button until the checklist is clear, matching the Product/Project pattern and replacing hidden validation-only feedback.
- Updated Article publication guardrails to tell editors to complete the checklist and publish at least one structured block before public article bodies can appear.
- Expanded admin CRUD coverage so the Article publish checklist and locked-publish contract are source-guarded.

### Changed Files
- `src/pages/admin/AdminArticlesPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now requires the Article publish checklist and locked-publish source contract.
- `npm run agent:check`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- This is source-verified locally; a production signed-in editor walkthrough still needs to confirm the checklist with real imported article rows after deployment.

### Next Handoff
- Continue the CMS goal with production walkthrough proof and any remaining editor confusion found during real-content use.

## Entry - 2026-06-04 (Admin Public Page Confirmation Links)

### Scope
- Continued the `/admin` CMS editor-handoff goal by making post-publish confirmation visible inside content editors.
- Added shared `CmsPublicPageLink` UI that opens the public route only when a record is Published; Draft, TBC, and Archived records show a hidden-state explanation instead.
- Added the public-page confirmation control to Projects, Stone Library, Products, and Articles editor headers.
- Updated Dashboard handoff guidance so it no longer claims Stone Library detail and Article body rendering are unresolved public gaps; editors are now told to use the public-page link after publishing.
- Expanded admin CRUD coverage so the public-page confirmation control must remain on launch-critical content editors.

### Changed Files
- `src/pages/admin/AdminCmsPrimitives.tsx`
- `src/pages/admin/AdminDashboardPage.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `src/pages/admin/AdminProductsPage.tsx`
- `src/pages/admin/AdminArticlesPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/WORKLOG.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass. Coverage now requires the public-page confirmation control on Projects, Stone Library, Products, and Articles.
- `npm run agent:check`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- The public-page link is a confirmation shortcut; it does not replace the production signed-in editor walkthrough after deployment.
- Draft/TBC/Archived rows remain hidden by design, so editors still need to publish and then confirm the route.

### Next Handoff
- Continue the CMS goal with production walkthrough proof and any remaining editor confusion found during real-content use.

## Entry - 2026-06-04 (Public Stone Library Detail CMS Adapter)

### Scope
- Continued the `/admin` CMS editor-handoff goal by closing the Stone Library detail public-read gap.
- Added a public Stone Library detail adapter that reads Published Supabase stone families, variants, finish capabilities, and finish images before falling back to static Stone Library data.
- Updated `/stone-library/:stoneGroupId` to load detail data asynchronously, show a deliberate loading/error state, and avoid redirecting before the published-first lookup completes.
- Expanded `npm run agent:public-supabase-readiness` so it fails if Stone Library detail loses the published-first adapter or static fallback.
- Updated the editor guide, handoff, roadmap, and task queue to reflect that Stone Library listing/detail can now reflect Published CMS rows.

### Changed Files
- `src/service/StoneLibraryService.ts`
- `src/pages/StoneLibraryDetailPage.tsx`
- `scripts/check-public-supabase-readiness.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:public-supabase-readiness`: pass. Verified published-only public Supabase read boundaries, Stone Library detail published-first adapter guard, and static fallback contract.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:check`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; `/stone-library/alpine-white` route passed.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Imported Stone Library rows remain `draft` by design; an editor still needs to review and publish real family/variant/finish/image rows before the public site shows CMS-authored detail content.
- The CMS detail adapter maps cut options to a conservative on-request public row because the current Supabase Stone Library schema does not yet store cut-option rows separately.
- A final signed-in production editor walkthrough is still required after local commits are pushed and deployed.

### Next Handoff
- Continue the CMS goal with a signed-in production walkthrough and editor review/publish proof.

## Entry - 2026-06-04 (Public Article Structured Block Rendering)

### Scope
- Continued the `/admin` CMS editor-handoff goal by closing the public Article body gap.
- Added a public Article body adapter that reads Published Supabase `article_blocks` for the current article slug and falls back to sanitized legacy HTML from `legacy_source_path` when no published structured blocks are available.
- Added public renderers for structured article block types used by `/admin/articles`, including rich text, media, quote, FAQ, CTA, reference, proof metric, video-link, comparison, and callout blocks.
- Expanded `npm run agent:public-supabase-readiness` so it fails if Article public detail loses the structured-block adapter or fallback boundary.
- Updated the editor guide, handoff, roadmap, and task queue to reflect that Article body rendering is now CMS-backed for Published blocks while imported draft content remains private until reviewed and published.

### Changed Files
- `src/service/ArticleService.ts`
- `src/pages/ArticlePage.tsx`
- `scripts/check-public-supabase-readiness.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:public-supabase-readiness`: pass. Verified 95 draft Article blocks stay structured in import dry run and the public runtime boundary keeps published-only Supabase reads with static/legacy fallback.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Imported article rows and blocks remain `draft` by design; an editor still needs to review and publish real Article content before the public site shows those CMS-authored bodies.
- Stone Library detail now has a published-first Supabase adapter in the following worklog entry; production editor walkthrough remains.
- A final signed-in production editor walkthrough is still required after local commits are pushed and deployed.

### Next Handoff
- Continue the CMS goal with a signed-in production walkthrough and editor review/publish proof.

## Entry - 2026-06-04 (Admin Settings Access Handoff UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Settings/team-access pass.
- Replaced the remaining technical Settings protection copy with owner/admin-facing language.
- Added an Access setup checklist that explains the actual handoff sequence: create or invite a login account first, paste the existing login account ID, choose the lowest suitable role, keep the profile active, then ask the person to sign in at `/admin`.
- Renamed the form field to Existing login account ID and clarified that email alone cannot grant CMS access.
- Added a Role guide for Owner, Admin, Editor, and Viewer so non-technical owners understand permission tradeoffs before saving access.
- Expanded the admin CRUD coverage guard, CMS handoff docs, roadmap, task queue, and editor guide to reflect the account-handoff contract.

### Changed Files
- `src/pages/admin/AdminSettingsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- Visual sanity check: reviewed `.tmp/admin-config-gate/screenshots/admin-settings.png`; `/admin/settings` still renders the no-config protected shell without private settings/team content exposure.

### Risks and Gaps
- The browser CMS still cannot create the underlying login account or send an invite; it now states that clearly and guides the profile-grant step.
- Live Settings/team-access save proof remains a production authenticated owner/admin walkthrough item after local commits are pushed and deployed.

### Next Handoff
- Continue the CMS goal with a signed-in production editor walkthrough after deployment, or the remaining Stone Library detail/public Article rendering gaps.

## Entry - 2026-06-04 (Admin Dashboard Editor Start UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Dashboard first-screen pass.
- Added Start here quick actions for Review new leads, Publish content, and Prepare media so non-technical editors have a clear first decision after login.
- Fixed content-status routing for Stone families so the status row opens `/admin/stone-library` instead of falling back to `/admin`.
- Reworded Dashboard health labels away from database/claim jargon and toward editor-facing review tasks.
- Replaced stale launch-secret/checklist guidance with handoff guidance for account role setup, real-content walkthrough, publish checklists, and known public fallback gaps.
- Updated admin CRUD coverage, CMS handoff docs, roadmap, task queue, and editor guide to reflect the Dashboard editor-start contract.

### Changed Files
- `src/pages/admin/AdminDashboardPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- Visual sanity check: reviewed `.tmp/admin-config-gate/screenshots/admin.png`; `/admin` still renders the no-config protected shell without private dashboard content exposure.

### Risks and Gaps
- Dashboard editor-start UX is source-verified locally but still needs signed-in production editor walkthrough after these local commits are pushed and deployed.
- Stone Library detail and Article body rendering still have public fallback gaps, now called out in the Dashboard handoff guidance.

### Next Handoff
- Continue the CMS goal with a signed-in production editor walkthrough after deployment, or the remaining Stone Library detail/public Article rendering gaps.

## Entry - 2026-06-04 (Admin Stone Library Publish Checklist UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Stone Library publish-readiness pass.
- Added Stone Library family and variant Publish checklists so editors can see missing URL key, public summary, variant, and finish availability requirements before publication.
- Locked Stone family and Variant Publish actions while checklist blockers remain, replacing late validation surprises with visible readiness guidance.
- Replaced several technical/internal labels with editor-facing language such as Website URL key, Supplier/source label, Stone type shown on website, Public summary, Internal notes, Supplier/source variant, and Variant category.
- Reworded finish capability states from yes/TBC/no into Available, Needs confirmation, and Not available in the editor UI.
- Expanded the admin CRUD coverage guard, CMS handoff docs, roadmap, task queue, and editor guide to reflect Stone Library checklist/finish-availability authoring.

### Changed Files
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- Visual sanity check: reviewed `.tmp/admin-config-gate/screenshots/admin-stone-library.png`; `/admin/stone-library` still renders the no-config protected shell without private content exposure.

### Risks and Gaps
- The checklist is source-verified locally but still needs signed-in production editor walkthrough after these local commits are pushed and deployed.
- Stone Library detail remains static-backed until the deeper public variant/finish detail mapper is completed.

### Next Handoff
- Continue the CMS goal with a signed-in production editor walkthrough after deployment, or the remaining Stone Library detail/public Article rendering gaps.

## Entry - 2026-06-04 (Admin Media Publish Checklist UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Media publish-readiness pass.
- Replaced internal storage/source labels with editor-facing language such as Private draft library, Public website library, Media source, Publishing location, External archive link, and File details.
- Added a Media Publish checklist for source recording, public location, image alt text, and usage notes.
- Locked Media Publish and the status-save publish path while checklist blockers remain, so editors see the missing readiness step instead of discovering it through a late validation error.
- Expanded the admin CRUD coverage guard, CMS handoff docs, roadmap, task queue, and editor guide to reflect Media checklist/library-label authoring.

### Changed Files
- `src/pages/admin/AdminMediaPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- Visual sanity check: reviewed `.tmp/admin-config-gate/screenshots/admin-media.png`; `/admin/media` still renders the no-config protected shell without private content exposure.

### Risks and Gaps
- The checklist is source-verified locally but still needs signed-in production editor walkthrough after these local commits are pushed and deployed.
- Public media reuse still depends on editors publishing the relevant media before linking it from content modules.

### Next Handoff
- Continue the CMS goal with a signed-in production editor walkthrough after deployment, or the remaining Stone Library detail/public Article rendering gaps.

## Entry - 2026-06-04 (Admin Leads Workflow Guidance UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Leads workflow pass.
- Replaced technical lead detail language with editor-facing labels: `Source route` became Website page, notification states became Email pending/sent/failed/not required, and Turnstile state became Spam check passed/failed/not recorded.
- Added status-specific Recommended next step guidance in the workflow editor for enquiries and sample requests, so owner/admin users know what action each status implies before saving.
- Renamed the export action to Export visible queue while preserving the existing audit-gated CSV export behavior.
- Updated the admin CRUD coverage guard, CMS handoff docs, roadmap, task queue, and editor guide to reflect lead workflow guidance.

### Changed Files
- `src/pages/admin/AdminLeadsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- Visual sanity check: reviewed `.tmp/admin-config-gate/screenshots/admin-leads.png`; `/admin/leads` still renders the no-config protected shell without private content exposure.

### Risks and Gaps
- The workflow guidance is source-verified locally, but a signed-in production editor walkthrough is still needed after local CMS UX commits are pushed and deployed.
- Final Turnstile form proof remains separate; this pass only improves how stored anti-spam state is explained in the admin.

### Next Handoff
- Continue with a signed-in production editor walkthrough after deployment, or remaining public rendering/detail gaps.

## Entry - 2026-06-04 (Admin Products Publish Checklist UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Products publish-readiness pass.
- Replaced product-level `SEO JSON` editing with editor-facing Search title and Search description fields while preserving the existing `products.seo` JSON contract behind the form.
- Added a Product Publish checklist for product name, website URL, short description, hero image, at least one published model with image, material defaults, and specifications.
- Locked Product Publish and the status-save publish path while checklist blockers remain, so editors see what to fix before attempting publication.
- Expanded the admin CRUD coverage guard, CMS handoff docs, roadmap, task queue, and editor guide to reflect Product checklist/search-field authoring.

### Changed Files
- `src/pages/admin/AdminProductsPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npx tsc -b`: pass.
- `npm run lint`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- Visual sanity check: reviewed `.tmp/admin-config-gate/screenshots/admin-products.png`; `/admin/products` still renders the no-config protected shell without private content exposure.

### Risks and Gaps
- The checklist is source-verified locally but still needs signed-in production editor walkthrough after these local commits are pushed and deployed.
- Product public pages already prefer published Supabase rows with static fallback; this change improves editor readiness but does not alter public rendering.

### Next Handoff
- Continue the CMS goal with a signed-in production editor walkthrough after deployment, or the remaining Stone Library detail/public Article rendering gaps.

## Entry - 2026-06-04 (Admin Articles Form Authoring UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Articles authoring pass.
- Replaced article-level `SEO JSON` editing with editor-facing Search title and Search description fields while preserving the existing `articles.seo` JSON contract behind the form.
- Replaced direct Article block content JSON entry with block-type-specific editor forms for rich text, image/gallery notes, quotes, FAQ, CTA, project/stone references, comparison notes, proof metrics, video embeds, and callouts.
- Updated block publish validation so Published blocks require meaningful editor content for the selected block type instead of only requiring a non-empty JSON object.
- Updated the admin CRUD coverage guard, CMS handoff docs, roadmap, task queue, and editor guide to reflect form-based Article authoring.

### Changed Files
- `src/pages/admin/AdminArticlesPage.tsx`
- `scripts/check-admin-crud-coverage.mjs`
- `docs/ADMIN_EDITOR_GUIDE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass. Browserslist staleness notice and AdminApp chunk-size warning remain.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.
- Browser/IAB DOM check for `http://127.0.0.1:5173/admin/articles`: pass for page identity, nonblank config-required shell, no Vite overlay, and zero console warnings/errors. Browser screenshot capture timed out twice, so the visual sanity check used the generated Playwright gate screenshot at `.tmp/admin-config-gate/screenshots/admin-articles.png`.

### Risks and Gaps
- Local no-config browser validation can prove the route shell and guard state, but not the signed-in live Article editor form; that still needs production or local browser-safe Supabase config plus an active editor/admin session.
- Public Article detail still renders sanitized legacy HTML until structured public block rendering is implemented.
- Products still has a separate SEO JSON field that should receive the same editor-facing treatment in a later batch.

### Next Handoff
- Continue the CMS goal by replacing Products SEO JSON with editor-facing SEO fields or by adding a final production Article editor walkthrough after deployment.

## Entry - 2026-06-04 (Admin Products Media Selector UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Products media/default-material pass.
- Replaced raw Product hero media ID and Model image media ID entry with editor-facing media selectors and previews.
- Added Stone Library status feedback to Product material defaults so editors can see whether the linked stone is public-ready.
- Updated validation labels so Product media errors refer to selected images/media rather than database IDs.

### Changed Files
- `src/pages/admin/AdminProductsPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Products no longer requires hand-entering media IDs for hero/model images, but SEO JSON remains a technical field that still needs a friendlier editor layer.
- Product model publish readiness is still less explicit than Projects; a future pass should add a compact checklist for published model image/label/key readiness.

### Next Handoff
- Continue the CMS goal by simplifying Article block editing or replacing Products SEO JSON with editor-facing SEO fields.

## Entry - 2026-06-04 (Admin Stone Library Finish Image UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Stone Library finish-image pass.
- Added selected-media preview, source/status feedback, and missing-media feedback to the finish image link editor.
- Locked the Finish Image Publish action when the selected media record is not Published in `/admin/media`, with editor-facing guidance explaining what to fix.
- Updated the save-time validation copy so the error points editors back to publishing the media record, not to an internal database rule.

### Changed Files
- `src/pages/admin/AdminStoneLibraryPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass after preserving the existing source-gate phrase for published finish-image media requirements.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Stone Library finish images are clearer, but the finish capability grid still has dense source/admin-note fields that need more editorial guidance.
- Stone Library detail remains static-backed until the public variant/finish detail mapper is completed.

### Next Handoff
- Continue the CMS goal by simplifying Products media/default selectors or adding clearer Stone Library finish capability guidance.

## Entry - 2026-06-04 (Admin Projects Media Selector UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Projects media-linking pass.
- Replaced raw media ID entry with editor-facing media selectors and previews for project cover image, hero image, material image, media block asset, material map image, and hotspot preview image fields.
- Kept the existing Supabase data contract unchanged; selectors still write the same media ID values, but editors choose from readable media labels with thumbnail/status/source feedback.
- Updated validation labels so media errors refer to selected images/media rather than database IDs.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Projects no longer requires hand-entering media IDs for the main image links, but Products and Stone Library still have similar media-linking patterns that should be unified next.
- Media picker search/filtering is still basic because it uses the existing select list; a richer reusable media chooser remains a later UX improvement once the pattern is shared across modules.

### Next Handoff
- Continue the CMS goal by applying the same non-technical media selection pattern to Stone Library finish images and Product media/default imagery.

## Entry - 2026-06-04 (Admin Projects Publish Checklist UX)

### Scope
- Continued the `/admin` CMS editor-experience productization goal with a focused Projects publish-flow pass.
- Moved project Publish readiness into the Project editor instead of leaving it as a side-panel/error-only cue.
- Expanded the Project Publish checklist to include title, website URL, public summary/lead copy, project claims, fact claims, and material claims.
- Locked the Project Publish button while blockers remain, renamed the primary form submit from `Save draft` to `Save changes`, and changed the project-level claim field label to `Claims checked`.
- Made checklist actions scroll/select the relevant Project, Facts, or Materials editor section so editors know where to fix blockers.

### Changed Files
- `src/pages/admin/AdminProjectsPage.tsx`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run agent:smoke`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions.
- `npm run agent:admin-config-gate`: pass after rerun outside the sandbox because local Vite preview listening was blocked by sandbox permissions; 11 admin routes passed the no-config gate.

### Risks and Gaps
- Projects is more usable for publish blockers, but media ID entry and nested media-map/hotspot editing are still technical and need later editor-facing selectors/previews.
- Customer/editor review-publish proof against real imported draft content remains outstanding until this local CMS UX batch is pushed and verified in production.

### Next Handoff
- Continue the CMS goal by simplifying remaining nested content editors, with Stone Library detail/finish-image editing and Project media selectors as the next highest-friction areas.

## Entry - 2026-06-04 (CMS Storage Proof, Draft Import, and Public Read Cutover)

### Scope
- Ran the approved Storage-inclusive admin live QA path.
- Added `scripts/apply-content-import-live.mjs` and `npm run agent:content-import:live` as a plan-only-by-default live draft import runner.
- Imported the reviewed static-to-Supabase payload into production Supabase as draft/review rows through browser-key owner/admin RLS.
- Cut public Projects, Products, Articles, and the Stone Library listing to prefer published Supabase reads with static fallback.
- Updated `npm run agent:public-supabase-readiness` from a static-only boundary check to a public browser-key read boundary plus static fallback check.

### Supabase Evidence
- Storage QA marker: `admin-live-1780497462544-23b1d5e3`.
- Storage object uploaded: `urblo-admin-media/live-check/admin-live-1780497462544-23b1d5e3.png`.
- Storage-inclusive admin QA recorded 48 audit rows, verified signed-in admin readback, and verified anonymous browser-key denial through private and public Storage object endpoints.
- Draft content import wrote/upserted 115 media assets, 13 stone groups, 15 variants, 153 finish capabilities, 53 finish image rows, 6 products, 28 product models, 18 material defaults, 18 specs, 5 projects, 41 project facts, 2 project materials, 1 project material map, 15 project media rows, 2 hotspots, 4 articles, and 95 article blocks.
- Stored parent counts after import: 13 stone groups, 6 products, 5 projects, and 4 articles.
- Anonymous browser-key reads exposed zero imported draft parent rows.

### Verification
- `npm run agent:content-import:apply-sql`: pass; local ignored artifacts generated with 0 warnings and 0 blockers.
- `npm run agent:content-import:live`: pass in plan-only mode.
- `npm run agent:content-import:live -- --allow-writes`: pass with approved admin session.
- `npx tsc -b`: pass after public-read adapter changes.
- `npm run build`: pass.
- `npm run lint`: pass.
- `npm run agent:smoke`: pass when rerun with local preview listen permission; the first sandboxed attempt failed with `listen EPERM` before route checks.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- Playwright Firefox public render QA against local preview: `/stone-library`, `/products`, `/projects`, and `/articles` rendered expected H1/content with no console/page errors.
- Git commit `7a318ab` pushed to `origin/main`.
- Cloudflare Pages production deployment `bc830b5f-4c98-46ab-8962-586478ff9259` for commit `7a318ab` reached `deploy` status `success`.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass on the current production deployment.

### Risks and Gaps
- Imported production content is intentionally still `draft`; public pages continue using static fallback until an editor publishes rows in `/admin`.
- Stone Library detail remains static-backed until the deeper public variant/finish detail mapper is completed.
- Article detail continues rendering sanitized legacy HTML from `legacy_source_path`; structured public block rendering remains a follow-up.
- Turnstile remains unconfigured/unverified.
- Unprofiled unauthorized admin browser QA remains staged but unrun.

### Next Handoff
- Finish full runtime/docs gates for this cutover branch.
- Publish a small reviewed content sample in `/admin` and smoke the public Supabase read path end to end.
- Complete Stone Library detail public adapter and article structured block renderer if the client wants public pages to reflect every CMS field immediately.

## Entry - 2026-06-04 (Admin CRUD Live QA and Project Media Migration)

### Scope
- Applied the approved `project_media_blocks` migration to the live Supabase project and aligned the local migration filename with the remote migration version.
- Verified `project_media` now has `project_material_map_id`, `block_title`, and `youtube_url`, plus the expected media-role and block-contract constraints/indexes.
- Re-ran approval-gated non-Storage admin CRUD/live lead workflow QA.
- Archived partial public-facing QA rows left by the failed pre-migration run and recorded cleanup audit rows.

### Supabase Evidence
- Remote migration list includes `20260603142359 project_media_blocks`.
- Columns verified: `project_media.project_material_map_id`, `project_media.block_title`, and `project_media.youtube_url`.
- Constraints verified: `project_media_media_role_check` and `project_media_block_contract_check`.
- Indexes verified: `project_media_project_material_map_idx`, `project_media_project_role_sort_idx`, and `project_media_one_active_youtube_idx`.

### Verification
- Failed pre-migration run marker: `admin-live-1780496442071-f27c2b7d`; it stopped at missing `project_media.block_title`.
- Passed run marker: `admin-live-1780496690772-b8a47213`.
- `npm run agent:admin-crud-live -- --allow-writes`: pass.
- Created tagged QA rows: `site_settings#4`, `media_assets#2`, `stone_groups#2`, `stone_variants#2`, `stone_finish_capabilities#2`, `stone_finish_images#2`, `products#2`, `product_models#2`, `product_material_defaults#2`, `product_specs#2`, `projects#2`, `project_facts#2`, `project_materials#2`, `project_material_maps#2`, `project_media#1`, `project_hotspots#1`, `articles#1`, `article_blocks#1`, `enquiries#5`, `sample_requests#4`, and `sample_request_items#4`.
- Audit rows recorded by the passing run: `48`.
- Dashboard health predicates matched tagged QA rows before archive cleanup.
- Tagged public-content rows were published, archived, and then checked for anonymous invisibility.
- Anonymous browser-key reads returned zero tagged QA content rows and no private lead rows.

### Cleanup
- Partial failed-run public-facing rows were archived non-destructively: `site_settings#3`, `media_assets#1`, `stone_groups#1`, `products#1`, and `projects#1`.
- Cleanup audit rows recorded: `admin_audit_events.id = 73` through `77`.

### Advisor Notes
- Security advisor returned one Auth warning: leaked password protection is disabled.
- Performance advisor returned existing INFO/WARN items around unused indexes and multiple permissive SELECT policies; these are follow-up tuning items, not blockers for the completed QA run.

### Risks and Gaps
- Optional Storage upload proof was not run because `--include-storage` was not approved/requested.
- Turnstile remains unconfigured/unverified.
- Static-to-Supabase content import and public read cutover still need explicit approval and review.

### Next Handoff
- Decide whether to run `npm run agent:admin-crud-live -- --allow-writes --include-storage` for final Storage upload proof.
- Decide whether Turnstile proof is required before launch and configure its site key/secret/token path if yes.
- Continue toward guarded content import/public read cutover after content review approval.

## Entry - 2026-06-04 (Production Active Admin Browser QA Passed)

### Scope
- Ran no-write active-admin browser QA against `https://urblo.com.au` for `info@urblo.com.au`.
- Installed the local Playwright Firefox runtime needed by the verifier.
- Used a browser-safe Supabase publishable key and a one-time shell/session credential path; no secrets were written to repo files or docs.
- Updated launch harness docs so active-admin browser QA is no longer listed as a blocker.

### Verification
- `curl -I https://urblo.com.au/`: HTTP `200` when run with external network access.
- `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`: pass.
- The verifier reported 9 authenticated admin routes checked and wrote ignored screenshots under `.tmp/admin-auth-browser/screenshots`.

### Screenshots
- `.tmp/admin-auth-browser/screenshots/login.png`
- `.tmp/admin-auth-browser/screenshots/admin.png`
- `.tmp/admin-auth-browser/screenshots/admin-leads.png`
- `.tmp/admin-auth-browser/screenshots/admin-media.png`
- `.tmp/admin-auth-browser/screenshots/admin-settings.png`
- `.tmp/admin-auth-browser/screenshots/admin-stone-library.png`
- `.tmp/admin-auth-browser/screenshots/admin-projects.png`
- `.tmp/admin-auth-browser/screenshots/admin-products.png`
- `.tmp/admin-auth-browser/screenshots/admin-articles.png`
- `.tmp/admin-auth-browser/screenshots/admin-audit.png`
- `.tmp/admin-auth-browser/screenshots/signed-out.png`

### Risks and Gaps
- Admin CRUD/live lead workflow verification is still pending explicit tagged-write approval.
- Optional Storage upload proof still requires intentional `--include-storage`.
- Turnstile remains unconfigured/unverified.
- The temporary admin password used for QA should be rotated after launch hardening.

### Next Handoff
- Run `npm run agent:admin-crud-live` in plan-only mode, then run `npm run agent:admin-crud-live -- --allow-writes` only after Jay approves tagged admin QA writes.
- Decide whether Turnstile proof is required before launch and configure its site key/secret/token path if yes.

## Entry - 2026-06-03 (First Admin Profile Bootstrapped)

### Scope
- Verified Supabase Auth contains confirmed user `info@urblo.com.au`.
- Created the first active admin profile linked to that Auth user with role `owner`.
- Recorded `admin_profile.bootstrap` in `admin_audit_events`.
- Verified admin readiness data with Supabase connector and browser-key REST boundary checks.
- Did not run browser login QA because no admin password/session was available to Codex.

### Changed Files
- `AGENTS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Supabase Evidence
- Auth user: `info@urblo.com.au`, user id `74b9e1d1-5f29-482c-836e-4feec8cd0087`, email confirmed on 2026-06-03.
- Admin profile: `info@urblo.com.au`, display name `Urblo Admin`, role `owner`, `is_active = true`.
- Active admin profile count: `1`.
- Bootstrap audit: `admin_audit_events.id = 8`, action `admin_profile.bootstrap`, metadata includes role `owner` and source `codex-first-admin-bootstrap`.
- Baseline seeds remain present: 12 published finish definitions and one published site settings row.

### Browser-Key Readiness Evidence
- Production browser key type: publishable.
- Anonymous browser-key REST read of published `site_settings`: HTTP `200`, one row.
- Anonymous browser-key REST read of published `finish_definitions`: HTTP `200`, 12 rows.
- Anonymous browser-key REST read of `admin_profiles`: HTTP `401`, denied.

### Risks and Gaps
- Active-admin browser login QA is still pending because Codex does not have `URBLO_ADMIN_PASSWORD` or an admin access token.
- Admin lead workflow/export QA and admin CRUD live verification remain pending until an authenticated owner/admin browser session is available and Jay approves tagged admin QA writes.
- Turnstile remains unconfigured/unverified.

### Next Handoff
- Provide admin credentials outside chat via local `.env.local`/shell variables, then run `npm run agent:admin-auth-browser -- --allow-login --strict --base-url https://urblo.com.au`.
- After no-write admin browser QA passes, run admin lead workflow/admin CRUD live checks only after explicit tagged-write approval.

## Entry - 2026-06-03 (Supabase Browser-Key Boundary Verified)

### Scope
- Verified Cloudflare Pages production now includes the deployed Supabase browser-safe publishable key after redeploy.
- Triggered Cloudflare Pages production redeploy `7d10ba13-5b9f-4d6e-86b9-e28218978189` for commit `7100bba` so build-time `VITE_` variables were included in the production bundle.
- Ran approved tagged production Contact and Sample Request submissions against `https://urblo.com.au`.
- Used the deployed public Supabase publishable key to verify private lead rows are not anonymously readable through REST.
- Checked Supabase Auth/admin profile readiness and found no Auth users and no admin profiles yet.

### Changed Files
- `AGENTS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Cloudflare Deployment Evidence
- Production deployment: `7d10ba13-5b9f-4d6e-86b9-e28218978189`.
- Deployment URL: `https://7d10ba13.urblo.pages.dev`.
- Commit: `7100bba34959885242103a1103aba32d450dd834`.
- Deployment status: `success`.
- Production bundle check: Supabase URL is present, a browser-safe publishable key is present, and no key value was printed.

### Live Boundary Proof
- Marker: `boundary-live-1780494471331-3df3d8f9`.
- Contact HTTP proof against `https://urblo.com.au/api/enquiries`: HTTP `201`, response id `4`, `notificationStatus = sent`.
- Sample Request HTTP proof against `https://urblo.com.au/api/sample-requests`: HTTP `201`, response sample request id `3`, sample item id `3`, `notificationStatus = sent`.
- Anonymous REST read with the deployed Supabase publishable key returned HTTP `401` for `enquiries.id = 4`.
- Anonymous REST read with the deployed Supabase publishable key returned HTTP `401` for `sample_requests.id = 3`.
- Anonymous REST read with the deployed Supabase publishable key returned HTTP `401` for `sample_request_items.id = 3`.
- Supabase connector readback confirmed the tagged enquiry, sample request, sample item, and audit rows exist.
- Supabase connector readback confirmed `admin_audit_events.id = 6/7` for the tagged boundary run.

### Admin Readiness
- `public.admin_profiles` is currently empty.
- `auth.users` is currently empty.
- Admin live login/profile QA is blocked until the first Supabase Auth user exists and an active `admin_profiles` row is linked to that user.

### Verification Results
- Cloudflare deployment readback: deployment `7d10ba13-5b9f-4d6e-86b9-e28218978189` is `deploy/success`.
- Production bundle check: pass, browser-safe publishable key present without printing the key.
- Production private-row boundary proof: pass, anonymous reads denied for the tagged private lead rows.
- Supabase connector readback: pass for tagged rows and audit rows.

### Risks and Gaps
- Turnstile remains unconfigured/unverified.
- First admin bootstrap remains pending because there are no Supabase Auth users or admin profiles yet.
- Admin browser login and admin lead workflow remain blocked until the first admin Auth/profile path exists.

### Next Handoff
- Create or invite the first Supabase Auth user, then create/link the first active owner/admin `admin_profiles` row.
- Run admin readiness and no-write admin browser QA after that account exists.

## Entry - 2026-06-03 (SMTP2GO Notification Path Verified)

### Scope
- Selected SMTP2GO as the preferred Contact/Sample Request notification provider because Urblo already has a subscription.
- Updated the Pages Function form handler to prefer `SMTP2GO_API_KEY` through SMTP2GO's HTTP API and retain Resend as a compatibility fallback.
- Updated source/mock/live readiness checks and launch docs so final email proof uses SMTP2GO variables.
- Added SMTP2GO DNS records in Cloudflare for return-path, DKIM, and tracking verification.
- Pushed commit `3408f34` and verified Cloudflare Pages production deployment `0439e4f9-73d4-44d1-ac5a-17b7cf363dfa`.
- Ran approved tagged production SMTP2GO proof against `https://urblo.com.au` using HTTP submissions plus Supabase connector readback.

### Changed Files
- `AGENTS.md`
- `.env.example`
- `functions/_lib/forms.js`
- `scripts/check-forms-api.mjs`
- `scripts/check-forms-api-live.mjs`
- `scripts/check-live-readiness.mjs`
- `scripts/check-cloudflare-pages-readiness.mjs`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_CLOUDFLARE_LAUNCH_PLAN.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`

### Cloudflare DNS Evidence
- Account: Hunter (`077afae2c6f4e77badadf21e49e58eb7`)
- Zone: `urblo.com.au` (`544d6bf99e48f4b36d7abb24f053ab17`)
- Added DNS-only CNAME `em905485.urblo.com.au -> return.smtp2go.net`, record id `999d935aa8b2323d0d1b613aa5bcc276`.
- Added DNS-only CNAME `s905485._domainkey.urblo.com.au -> dkim.smtp2go.net`, record id `15b74562f23fb255774c77ad46c7d473`.
- Added DNS-only CNAME `link.urblo.com.au -> track.smtp2go.net`, record id `86625766121803fd24d38c7e84c785e5`.
- Readback confirmed all three records have `proxied = false` and TTL auto.
- Readback confirmed Google MX records remain `aspmx.l.google.com` plus `alt1` through `alt4`, and apex TXT/SPF records remain present.

### Cloudflare Deployment Evidence
- Production deployment: `0439e4f9-73d4-44d1-ac5a-17b7cf363dfa`.
- Deployment URL: `https://0439e4f9.urblo.pages.dev`.
- Commit: `3408f34a50daac7967e6f66fe260de28f25bc76e`.
- Deployment status: `success`.

### Live SMTP2GO Proof
- Marker: `smtp2go-live-1780493701494-8916a935`.
- Contact HTTP proof against `https://urblo.com.au/api/enquiries`: HTTP `201`, response id `3`, `notificationStatus = sent`.
- Sample Request HTTP proof against `https://urblo.com.au/api/sample-requests`: HTTP `201`, response sample request id `2`, sample item id `2`, `notificationStatus = sent`.
- Supabase connector readback: `enquiries.id = 3` exists with matching tagged email/source route and `notification_status = sent`.
- Supabase connector readback: `sample_requests.id = 2` exists with matching tagged email/source route and `notification_status = sent`.
- Supabase connector readback: `sample_request_items.id = 2` exists for `sample_request_id = 2`, `quantity = 1`, and notes including Angola Black, Honed, SMTP2GO Verification, and the marker.
- Supabase connector readback: `admin_audit_events.id = 4` records `enquiry.create` for `enquiries.id = 3` with matching source-route metadata.
- Supabase connector readback: `admin_audit_events.id = 5` records `sample_request.create` for `sample_requests.id = 2` with matching source-route metadata, `itemId = 2`, and `quantity = 1`.

### Verification Results
- `node --check scripts/check-forms-api.mjs`: pass.
- `node --check scripts/check-forms-api-live.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `node --check scripts/check-cloudflare-pages-readiness.mjs`: pass.
- `node scripts/check-forms-api.mjs`: pass, including SMTP2GO and Resend notification mocks.
- `npm run agent:forms-ui`: pass.
- `npm run agent:live-readiness`: report-only pass; email proof now reports `SMTP2GO_API_KEY or RESEND_API_KEY` as the provider input.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass after rerunning with approved local preview-server permission; the first sandboxed run could not reach the Vite preview server.
- `git push origin main`: pass after GitHub credentials became available; pushed `3408f34` to `origin/main`.
- `npm run agent:forms-live -- --allow-writes --allow-email --require-email --base-url https://urblo.com.au`: expected local verifier guard stopped before writes because no local `SUPABASE_SERVICE_ROLE_KEY` is available in this workspace. Equivalent approved production HTTP proof plus Supabase connector readback was used instead.

### Risks and Gaps
- Real SMTP2GO delivery is verified for the current provider path; future rechecks with the packaged live verifier require local `SUPABASE_SERVICE_ROLE_KEY` for row readback.
- Browser-safe Supabase private-row proof, Turnstile proof, and admin lead workflow proof remain separate launch checks.

### Next Handoff
- `NEXT-FORMS-EMAIL-NOTIFY-001` is complete for the current provider path.
- `NOW-FORMS-SUPABASE-001`
- `NOW-ADMIN-AUTH-RLS-001`

## Entry - 2026-06-02 (Production Domain Cutover)

### Scope
- Added production custom domains `urblo.com.au` and `www.urblo.com.au` to the Cloudflare Pages project `urblo`.
- Cut over apex and `www` website DNS to Cloudflare Pages.
- Preserved the previous website DNS values in Cloudflare DNS record comments and in `docs/CLOUDFLARE_DEPLOYMENT.md` for rollback.
- Kept Google Workspace MX records, apex TXT/SPF/verification records, NS records, and `qa.urblo.com.au` unchanged.
- Recorded the post-launch email-notification follow-up: Contact and Sample Request notifications should eventually go to `info@urblo.com.au`, but provider selection/configuration is deferred.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Cloudflare Evidence
- Account: Hunter (`077afae2c6f4e77badadf21e49e58eb7`)
- Zone: `urblo.com.au` (`544d6bf99e48f4b36d7abb24f053ab17`)
- Pages project: `urblo`
- Custom domains added:
  - `urblo.com.au`
  - `www.urblo.com.au`
- Current apex website DNS: `CNAME urblo.com.au -> urblo.pages.dev`, proxied, TTL auto.
- Current `www` website DNS: `CNAME www.urblo.com.au -> urblo.pages.dev`, proxied, TTL auto.
- Rollback apex website DNS: record id `9bc69b26cbeef071e02f4a1bd5f715e7`, `A urblo.com.au -> 159.198.65.164`, proxied, TTL auto.
- Rollback `www` website DNS: record id `4ce8ffa7ee003ae79acac67096ca33ab`, `CNAME www.urblo.com.au -> urblo.com.au`, proxied, TTL auto.
- Unchanged reference old-site DNS: `qa.urblo.com.au -> 159.198.65.164`, proxied, TTL auto.
- Google MX records remained pointed at `aspmx.l.google.com` and `alt1` through `alt4`.

### Verification Results
- `curl -I https://urblo.com.au`: HTTP `200`.
- `curl -I https://www.urblo.com.au`: HTTP `200`.
- `curl -I https://urblo.com.au/stone-library/angola-black`: HTTP `200`.
- `curl -I https://www.urblo.com.au/contact`: HTTP `200`.
- `curl -I https://urblo.com.au/api/enquiries`: HTTP `405`, expected safe-failure for GET.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.com.au`: pass.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://www.urblo.com.au`: pass.
- Cloudflare Pages domain API: `urblo.com.au` and `www.urblo.com.au` are both `active`; verification and HTTP validation are both `active`.

### Risks and Gaps
- Email notification is still not configured; form rows persist to Supabase and currently use `notification_status = not_required`.
- Browser-safe Supabase/admin readiness remains pending.
- Turnstile proof remains pending.
- If rollback is needed, use the DNS values recorded above and in `docs/CLOUDFLARE_DEPLOYMENT.md`; do not touch MX/TXT/SPF/NS records.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-FORMS-SUPABASE-001`
- `NEXT-FORMS-EMAIL-NOTIFY-001`

## Entry - 2026-06-02 (Cloudflare Deployed Form Persistence Verified)

### Scope
- Ran approved tagged live form QA writes against the deployed Cloudflare Pages production URL after the server-side Supabase env vars were configured and redeployed.
- Verified Contact and Sample Request valid submissions persisted to Supabase through deployed Pages Functions.
- Verified invalid tagged submissions returned validation failures and created no matching lead or audit rows.
- Rechecked the created rows with the Supabase connector using read-only SQL.
- Did not clean up or delete QA rows; they remain available for auditability until Jay explicitly approves cleanup.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Live Target
- Base URL: `https://urblo.pages.dev`
- Cloudflare Pages redeploy after env configuration: `17588cfa-2204-4b95-b6e0-4e3531e366bb`
- Marker: `urblo-live-1780380851058-3c7e6822`

### Verification Results
- Valid enquiry POST: HTTP `201`, response id `1`, `notificationStatus = not_required`.
- Valid sample request POST: HTTP `201`, response sample request id `1`, sample item id `1`, `notificationStatus = not_required`.
- Invalid enquiry POST: HTTP `400 validation_failed`.
- Invalid sample request POST: HTTP `400 validation_failed`.
- Supabase connector readback: `enquiries.id = 1` exists with email `enquiry-urblo-live-1780380851058-3c7e6822@example.com`, matching `source_route`, `notification_status = not_required`, and `turnstile_success = null`.
- Supabase connector readback: `sample_requests.id = 1` exists with email `sample-urblo-live-1780380851058-3c7e6822@example.com`, matching `source_route`, `notification_status = not_required`, and `turnstile_success = null`.
- Supabase connector readback: `sample_request_items.id = 1` exists for `sample_request_id = 1`, `quantity = 2`, and notes including Angola Black, Honed, Live Forms Check, and the marker.
- Supabase connector readback: `admin_audit_events.id = 1` records `enquiry.create` for `enquiries.id = 1` with matching source-route metadata.
- Supabase connector readback: `admin_audit_events.id = 2` records `sample_request.create` for `sample_requests.id = 1` with matching source-route metadata, `itemId = 1`, and `quantity = 2`.
- Supabase connector readback: invalid tagged enquiry rows = `0`, invalid tagged sample request rows = `0`, invalid tagged audit rows = `0`.

### Risks and Gaps
- This proves base deployed persistence and server-side audit creation only.
- `notification_status = not_required` because no email provider variables were configured at that checkpoint; real SMTP2GO notification proof still needs `npm run agent:forms-live -- --allow-writes --allow-email --require-email`.
- `turnstile_success = null` because Turnstile is not configured; bot-protection proof still needs `VITE_TURNSTILE_SITE_KEY`, server-side Turnstile secret, a valid token, and `npm run agent:forms-live -- --allow-writes --require-turnstile --turnstile-token <token>`.
- Browser-key private-row denial was not verified because no browser-safe Supabase key is configured in Cloudflare Pages production.
- Admin lead workflow/export was not verified because first-admin/admin browser configuration is still pending.
- DNS and custom domains were not changed.

### Next Handoff
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-ADMIN-MEDIA-LEADS-001`
- `NOW-FORMS-SUPABASE-001`

## Entry - 2026-06-02 (Cloudflare Form Env Check)

### Scope
- Checked Cloudflare Pages environment variable presence for the `urblo` project after Jay configured the two server-side form variables.
- Confirmed production has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Confirmed preview environment variables are currently empty.
- Re-ran no-write deployed Pages smoke.

### Changed Files
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Cloudflare API project readback: pass. Production env includes `SUPABASE_URL` as plain text pointing to the Urblo Supabase project URL and `SUPABASE_SERVICE_ROLE_KEY` as secret text. Secret value was not printed.
- Cloudflare API project readback: preview env vars are empty.
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.pages.dev`: pass.
- `GET https://urblo.pages.dev/api/enquiries`: HTTP `405` with `method_not_allowed`, confirming the deployed Function still rejects unsafe method use without writes.

### Risks and Gaps
- Live form persistence was not run because it creates tagged Supabase QA rows and requires Jay approval.
- The standard `npm run agent:forms-live -- --allow-writes --base-url https://urblo.pages.dev` verifier also needs a local service-role verification key, or an approved connector-backed equivalent, to prove created rows and audit metadata.
- Browser-safe Supabase key, Turnstile, email provider, first-admin, and admin live verification inputs remain pending.

### Next Handoff
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-06-02 (Cloudflare Pages Preview Verified)

### Scope
- Verified Jay's Cloudflare Pages GitHub source configuration is now active.
- Confirmed the `urblo` Pages project is connected to `jayyy-3/jayyy-3.github.io`.
- Confirmed the first production deployment completed successfully on `urblo.pages.dev`.
- Ran deployed preview smoke against the live Pages default domain.
- Confirmed no production custom domain or DNS cutover was applied.

### Changed Files
- `AGENTS.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Cloudflare Evidence
- Account: Hunter (`077afae2c6f4e77badadf21e49e58eb7`)
- Pages project: `urblo`
- Project ID: `3c4c5af3-a2a8-4058-bc0e-0ee6e8cfcaca`
- Production URL: `https://urblo.pages.dev`
- Latest deployment: `542c25f4-2e55-437a-abbe-58d427aff48c`
- Deployment URL: `https://542c25f4.urblo.pages.dev`
- Environment: `production`
- Deployment status: `success`
- Commit: `9a1e9c6`
- Git source: `jayyy-3/jayyy-3.github.io`, branch `main`
- Custom domains: none
- Core DNS remains unchanged: apex and `qa` are proxied `A` records to `159.198.65.164`, and `www` is a proxied CNAME to `urblo.com.au`.

### Verification Results
- `npm run agent:cloudflare-preview-smoke -- --base-url https://urblo.pages.dev`: pass. Verified direct refresh for public/admin route shells, unknown-route fallback, deployed assets and route chunks, admin config/profile-gate bundle markers, browser service-role boundary, legacy product/article redirects, and no-write API safe-failure behavior for `/api/enquiries` and `/api/sample-requests`.
- `npm run agent:live-readiness -- --base-url https://urblo.pages.dev`: report-only pass. Cloudflare deployed-preview route/API smoke is ready; live form/admin checks remain missing service-role/browser-safe Supabase variables, first-admin inputs, admin credentials, Turnstile/email variables where applicable, and Jay approval for tagged live writes.
- `curl -I https://urblo.pages.dev`: HTTP `200`.
- Cloudflare API project readback: pass. Source, deployment, build config, and no-custom-domain state match expectations.

### Risks and Gaps
- Live form persistence is still unverified until Cloudflare Pages environment variables include `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_URL` and Jay approves tagged form QA writes.
- Admin auth/live CRUD remains unverified until browser-safe Supabase key configuration, first-admin setup, and active admin credentials are available.
- No production custom domain is attached yet; DNS cutover remains explicitly approval-gated.

### Next Handoff
- `NOW-FORMS-BACKEND-001`
- `NOW-ADMIN-AUTH-RLS-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-06-02 (Cloudflare Pages Project Creation)

### Scope
- Created the Cloudflare Pages project `urblo` in Hunter's Cloudflare account.
- Set production branch to `main`, build command to `npm run build`, output directory to `dist`, and root directory to `/`.
- Attempted to connect the GitHub repo `jayyy-3/jayyy-3.github.io` during project creation and again through the source endpoint.
- Confirmed DNS and custom domains were not changed.

### Changed Files
- `AGENTS.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Cloudflare Evidence
- Account: Hunter (`077afae2c6f4e77badadf21e49e58eb7`)
- Zone: `urblo.com.au` (`544d6bf99e48f4b36d7abb24f053ab17`)
- Pages project: `urblo`
- Project ID: `3c4c5af3-a2a8-4058-bc0e-0ee6e8cfcaca`
- Default domain: `urblo.pages.dev`
- Deployments: `0`
- Custom domains: none
- Current core DNS remains unchanged: apex and `qa` are proxied `A` records to `159.198.65.164`, and `www` is a proxied CNAME to `urblo.com.au`.

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- Cloudflare API project readback: pass. Project exists with expected branch/build/output settings and no latest deployment.
- Cloudflare API deployment list: pass. `0` deployments.
- Cloudflare API domains list: pass. No custom domains.
- `curl -I https://urblo.pages.dev`: returns Cloudflare `522`, expected while the Pages project has no deployment.

### Risks and Gaps
- GitHub source connection failed twice with Cloudflare API error `8000011`: `There is an internal issue with your Cloudflare Pages Git installation`.
- `wrangler` is available through `npx`, but this workspace is not logged in and no local `CLOUDFLARE_API_TOKEN` is configured, so direct upload could not run.
- Preview smoke cannot run until either the Pages GitHub app is reinstalled/reauthorized for this repo or a local Cloudflare API token is provided for `npx wrangler pages deploy dist --project-name=urblo --branch=main`.
- No DNS record, environment variable, secret, deployment, or production custom domain was changed.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-06-02 (Cloudflare Harness Drift Repair)

### Scope
- Repaired Harness drift after Cloudflare access was rechecked.
- Updated the Cloudflare task from zone-access blocked to actionable Pages project creation.
- Recorded the then-current recheck result that `urblo.com.au` was readable in Hunter's Cloudflare account, no Pages project existed before the subsequent `urblo` project creation, and apex/`www`/`qa` DNS still pointed to the old WordPress target.
- Kept production custom domain and DNS cutover explicitly out of scope until approval.

### Changed Files
- `AGENTS.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- `npm run agent:check`: pass. Harness path checks and Supabase foundation source readiness passed.
- `npm run agent:cloudflare-readiness`: pass. Repo-side Pages build contract, SPA fallback, Function routing scope, headers, API handlers, env placeholders, and deployment runbook remain valid.
- `git diff --check`: pass.

### Risks and Gaps
- No Cloudflare Pages project, deployment, custom domain, DNS record, environment variable, or secret was created or changed in this docs repair.
- Preview smoke still waits for a real `*.pages.dev` URL.
- DNS cutover remains a separate approval-gated launch step.

### Next Handoff
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-06-02 (Projects Archive, Detail, and Media Blocks)

### Scope
- Rebuilt `/projects` as a functional archive with breadcrumb, large title, proof-led intro, project count, sector filters, grid/list view controls, and equal-sized project images.
- Rebuilt `/projects/:slug` as a full-width case-study surface with oversized opening, previous/next project navigation, hero media, Project Information facts, narrative, ordered media blocks, Featured Materials where data supports it, and shared CTA.
- Added `ProjectHotspotImage` as the shared public hotspot renderer and made `ProjectMaterialMap` delegate to it.
- Extended static project data with listing metadata, story copy, ordered media blocks, and Moon Gate hotspot metadata.
- Extended `/admin/projects` source with ordered `project_media` block editing for normal images, hotspot images, and optional YouTube video rows.
- Added draggable/click hotspot placement on the selected admin material map image while keeping numeric x/y percentage fields.
- Prepared the project media block migration for the future live `project_media` block contract. This migration was later applied as `supabase/migrations/20260603142359_project_media_blocks.sql` during the 2026-06-04 approved admin QA run.
- Updated content import and admin verifiers so the static-to-Supabase path understands structured project media blocks.

### Changed Files
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-admin-crud-live.mjs`
- `scripts/check-content-import-readiness.mjs`
- `src/App.tsx`
- `src/components/projects/ProjectHotspotImage.tsx`
- `src/components/projects/ProjectMaterialMap.tsx`
- `src/data/projectData.ts`
- `src/pages/ProjectDetails.tsx`
- `src/pages/Projects.tsx`
- `src/pages/admin/AdminProjectsPage.tsx`
- `supabase/migrations/20260603142359_project_media_blocks.sql`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/projects`, `/projects/moon-gate-woolley-street`, admin route shells, shared CTA contracts, and current project/capability assets.
- `npm run agent:check`: pass.
- `npm run agent:admin-crud-coverage`: pass, including `project_media` coverage and source assertions for hotspot stage/marker controls, pointer placement handlers, and coordinate-update callbacks.
- `npm run agent:content-import -- --out .tmp/content-import-preview.json`: pass with 115 media candidates, 5 projects, 15 `project_media` rows, 1 `project_material_map`, 2 `project_hotspots`, 0 warnings, and 0 blockers.
- `npm run agent:content-import:apply-sql`: pass; regenerated ignored review/plan/preflight/apply/rollback artifacts under `.tmp/` without live Supabase writes.
- In-app Browser QA at `http://127.0.0.1:4174/projects`, desktop default viewport: page identity `Projects | Urblo`, nonblank `/projects` content, 5 equal `396x297` grid images, Education filter changed count to `02`, List view changed filtered images to equal `120x90`, `0` horizontal overflow, and no framework overlay.
- In-app Browser QA at `390x844`: `/projects` rendered 5 equal `327x245` grid images, Commercial filter changed count to `01`, retained `0` horizontal overflow, and no framework overlay.
- In-app Browser QA for `/projects/moon-gate-woolley-street`: page identity `Project Detail | Urblo`, h1 `Moon Gate | Woolley Street`, Project Information, previous/next navigation, full-width hero/media, 2 hotspot buttons, Featured Materials, `0` horizontal overflow, and no framework overlay. Desktop and mobile hotspot tap/click on `Flamed seating elements` set `aria-pressed="true"` and updated the inspector with New Grey/Flamed metadata, application copy, and Stone Library link.
- In-app Browser QA for `/projects/west-side-place`: page identity `Project Detail | Urblo`, h1 `West Side Place`, Project Information, narrative, previous/next navigation, ordered normal image captions, no hotspot controls as expected, `0` horizontal overflow, and no framework overlay at desktop and `390x844`.
- In-app Browser QA for `/admin/projects`: current no-browser-key environment renders the configuration-required admin auth state without private Projects module content, framework overlay, or horizontal overflow.
- Console health: Browser logs only the existing Cloudflare Turnstile warning `[Cloudflare Turnstile] Unknown parameter passed to api.js: "?ver=...", ignoring.` No task-caused runtime errors were observed.

### Risks and Gaps
- Superseded on 2026-06-04: the project media block migration is now applied and verified in the live Supabase project.
- Current static project data has no client-approved Urblo YouTube video configured, so public browser QA can verify the renderer/source contract but not a live configured video block.
- Live admin drag-and-drop QA is pending browser-safe Supabase config plus an active admin/editor profile. This checkpoint verifies the source implementation and strengthened no-secret admin coverage gate instead.
- Public Projects remain static/file-backed until content import and public read cutover are approved.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-ADMIN-CONTENT-CRUD-001`

## Entry - 2026-06-02 (Homepage Latest Projects Sketch Ratio)

### Scope
- Reworked the homepage Latest Projects layout to match the supplied sketch ratio: upper copy spans two columns, upper feature image spans two columns, and the lower draggable rail shows four portrait project images on desktop.
- Added optional `featureImage` and `featureImageAlt` fields to `HomepageProject` so the upper image can be selected independently from the lower rail image. Current static records use existing second-detail project media where available and fall back to the rail image if a future record omits feature media.
- Hid the rail scrollbar and converted rail labels into image overlays so lower project cards can use the full fixed-height portrait slot.
- Kept the section at exactly one viewport (`100svh`) and preserved stable copy/feature/rail heights across hover selection. Mobile uses a simplified active summary plus matching feature/rail heights.
- Extended `npm run agent:smoke` required assets to include the new homepage feature image paths.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/agent-smoke.sh`
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`
- `src/index.css`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including the new homepage feature image asset paths.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser plugin QA against `http://127.0.0.1:4174/`: pass for page identity, nonblank Project Section DOM, no relevant console warnings/errors, no horizontal overflow, section height equal to viewport height, and matching feature/rail heights in the active in-app viewport. Screenshot capture through Browser timed out, so screenshots were captured with Playwright fallback.
- Playwright Chromium fallback against `http://127.0.0.1:4174/`: pass at `1440x900`, `1366x768`, and `390x844`. Desktop checks confirmed section height equals viewport height, upper feature image height equals lower portrait image height, upper feature image width equals two rail image slots plus gutter, four project rail images are visible at desktop width, `View project` remains visible, hover changes the active project to Moon Gate, section/copy/feature/rail heights remain unchanged after hover, horizontal overflow is `0`, no framework overlay is present, and console issues are `0`. Mobile checks confirmed matching feature/rail heights, visible CTA, draggable rail overflow, no horizontal document overflow, and stable heights after hover.

### Risks and Gaps
- Deployed-preview visual QA remains pending until a Cloudflare Pages preview URL exists.
- Homepage project records remain static/file-backed until approved content import and public Supabase cutover.
- Admin-side selection of homepage feature media should map to the same `featureImage` concept when the CMS/public content migration is approved.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NEXT-PROJECTS-INTAKE-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`

## Entry - 2026-06-02 (Homepage Latest Projects Full-Screen Stability)

### Scope
- Reworked the homepage Latest Projects section so the whole section is exactly one viewport high (`100svh`) instead of being content-height driven.
- Fixed hover/tap layout shift by giving the active copy, active image, and thumbnail rail stable measured regions.
- Added short-screen desktop behavior that hides the active summary and places facts beside the CTA so 720-768px high screens do not clip controls.
- Added short mobile behavior that simplifies active copy/facts and shrinks rail media so the one-screen section remains readable at 375x667.
- Added lightweight `data-*` markers for repeatable rendered QA of the active region, active copy, active image, and rail.

### Changed Files
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/homepage/HomepageSections.tsx`
- `src/index.css`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including homepage project assets and public route/CTA contracts.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Playwright Chromium fallback against `http://127.0.0.1:4174/`: pass at `1440x900`, `1366x768`, `1280x720`, `390x844`, and `375x667`. Each viewport reported section height equal to viewport height, section scroll height equal to viewport height, 0 height delta for section/active copy/active image/rail after hover or tap selection, `0` horizontal overflow, no framework overlay, no console errors/warnings, visible section heading, visible CTA, and image above rail.
- In-app Browser plugin QA was attempted first but unavailable because `agent.browsers.list()` returned an empty backend list; Playwright was used as the fallback validation path.

### Risks and Gaps
- Deployed-preview visual QA remains pending until a Cloudflare Pages preview URL exists.
- The homepage project browser remains static data until the approved public content migration switches Projects to Supabase-backed reads.

### Next Handoff
- `NEXT-UI-PARITY-001`
- `NOW-CLOUDFLARE-PAGES-DEPLOY-001`
- `NOW-FORMS-BACKEND-001`

## Entry - 2026-06-01 (Homepage Latest Projects Redesign)

### Scope
- Replaced the old black Latest Projects card grid with an image-led selected-project browser based on the supplied sketch and Escofet-style reference rhythm.
- Updated `homepageData.latestProjects` to five project records with location, scope, year, summary, image, and alt text.
- Added a desktop rail that shows four project thumbnails at a time, supports horizontal drag, and lets hover/focus/tap update the upper project detail panel.
- Kept route navigation on the upper `View project` CTA so thumbnail interaction remains selection-only.
- Added smoke coverage for the five controlled project image assets.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `scripts/agent-smoke.sh`
- `src/components/homepage/HomepageSections.tsx`
- `src/data/homepage.ts`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including the five Latest Projects asset paths.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Playwright Chromium against `http://127.0.0.1:4174/`: desktop `1440x900` confirmed `The work speaks.`, the upper `View project` CTA, four fully visible project thumbnails, draggable rail movement from `scrollLeft 0` to `319`, hover selection for Moon Gate, 0 document horizontal overflow, and 0 console errors.
- Playwright Chromium mobile `390x844`: tap selection for Australian Catholic University updated the active thumbnail state, document horizontal overflow was `0`, and console errors were `0`.

### Risks and Gaps
- Final deployed visual QA remains pending until a Cloudflare Pages preview URL exists.
- Project summaries are still static homepage copy and should be reconciled with CMS-sourced public project records during the approved content migration.

## Entry - 2026-06-01 (Homepage Partner Banner Background)

### Scope
- Replaced the homepage `Design-led stone solutions for streetscapes & civil landscapes.` partner-banner background with the supplied West Side Place aerial image.
- Added the controlled optimized asset at `public/media/launch/homepage/partner-banner-west-side-place.jpg`.
- Updated homepage data and smoke coverage so the runtime asset path is guarded.
- Updated Harness notes for the homepage partner-banner image contract.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `public/media/launch/homepage/partner-banner-west-side-place.jpg`
- `scripts/agent-smoke.sh`
- `src/data/homepage.ts`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `asset ok: /media/launch/homepage/partner-banner-west-side-place.jpg`.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Playwright CLI fallback against `http://127.0.0.1:4174/`: desktop `1440x900` and mobile `390x844` both confirmed the partner banner `img` source is `/media/launch/homepage/partner-banner-west-side-place.jpg`, rendered the approved banner copy, had 0 horizontal overflow, and reported 0 console errors.

### Risks and Gaps
- None identified beyond normal deployed-preview QA after Cloudflare Pages preview exists.

## Entry - 2026-06-01 (Capability Statement Service Hub Redesign)

### Scope
- Reworked `/capabilities` from an editorial PDF-like page into a service-style capability hub informed by the supplied Sam the Paving Man capabilities reference.
- Rebuilt the page around the Founder PDF's five capability scopes, approach, lifecycle support, national reach, Urblo advantage, selected-project proof ledger, and email-gated PDF download.
- Rotated the previously sideways site-review image upright before reuse.
- Expanded the Capability Statement source verifier and Harness docs so the concrete capability modules and project ledger remain guarded.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `public/media/launch/capabilities/site-install-review.jpg`
- `scripts/check-capabilities-page-source.mjs`
- `src/pages/CapabilitiesPage.tsx`

### Verification Results
- `npm run agent:capabilities-ui`: pass.
- `npx tsc -b`: pass.
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser plugin QA fallback: the in-app Browser route was unavailable, so Playwright CLI with Chromium was used against local Vite dev server `http://127.0.0.1:4174/capabilities`.
- Browser QA desktop `1440x1000`: hero, capability hub, sticky module navigation, corrected site-review image usage, selected proof, and download section rendered with 0 console errors/warnings.
- Browser QA mobile `390x844`: hero, capability module list, first service detail, and corrected responsive stacking rendered without visible overlap; document horizontal overflow was `0`.

### Risks and Gaps
- Live email capture for the Capability Statement PDF download still depends on the same server-side `/api/enquiries` credential verification as Contact.
- Final deployed visual QA remains pending until a Cloudflare Pages preview URL exists.

## Entry - 2026-06-01 (Homepage Hero Single Terminal Symbol)

### Scope
- Removed the terminal dots from the first two homepage hero lines.
- Kept only the final `DELIVER.` symbol, with the dot in Urblo lime.
- Updated current Harness notes so the hero contract is `DESIGN`, `SOURCE`, `DELIVER.` rather than three punctuated lines.

### Changed Files
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/homepage/HomepageSections.tsx`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser QA through the in-app Browser against local Vite preview on `http://127.0.0.1:4174`: pass for DOM/style checks.
- Browser QA desktop `1440x900`: hero lines are `DESIGN`, `SOURCE`, `DELIVER.`; dot count is 1; the only dot belongs to `DELIVER.` and computes to `rgb(0, 255, 25)`; no framework overlay, console warnings/errors, or horizontal overflow.
- Browser QA mobile `390x844`: hero lines are `DESIGN`, `SOURCE`, `DELIVER.`; dot count is 1; the only dot belongs to `DELIVER.` and computes to `rgb(0, 255, 25)`; no framework overlay, console warnings/errors, or horizontal overflow.
- Browser screenshot capability timed out twice on `Page.captureScreenshot`; Playwright fallback captured `/tmp/urblo-home-hero-single-dot-mobile.png` after waiting for `aria-label="DESIGN SOURCE DELIVER."`, confirming the mobile visual state without the welcome popup.

### Risks and Gaps
- None identified beyond normal deployed-preview QA after Cloudflare Pages preview exists.

## Entry - 2026-06-01 (Homepage Capabilities CTA Inner Ring)

### Scope
- Removed the nested circular icon ring from the homepage proof-section `Our Capabilities` CTA.
- Kept the outer pill button, text, and arrow motion, but removed the small inner circle that made the CTA read as a concentric-circle control.
- Updated the design Harness note for this CTA treatment.

### Changed Files
- `docs/DESIGN.md`
- `docs/WORKLOG.md`
- `src/components/homepage/HomepageSections.tsx`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser QA through the in-app Browser against local Vite preview on `http://127.0.0.1:4174`: pass.
- Browser QA desktop `1440x900`: `Our Capabilities` CTA still routes to `/capabilities`; inner icon wrapper border width is `0px`, border radius is `0px`, and no framework overlay, console warnings/errors, or horizontal overflow were observed.
- Browser QA mobile `390x844`: inner icon wrapper border width is `0px`, border radius is `0px`, and no framework overlay, console warnings/errors, or horizontal overflow were observed.

### Risks and Gaps
- None identified beyond normal deployed-preview QA after Cloudflare Pages preview exists.

## Entry - 2026-06-01 (Homepage Hero Final Dot)

### Scope
- Updated the homepage first-viewport verb stack so `DESIGN.` and `SOURCE.` no longer render green punctuation.
- Kept only the final `DELIVER.` terminal dot in Urblo lime, matching the latest user direction for the hero signal color.
- Updated Harness design/handoff/roadmap/task notes so future agents do not restore green punctuation to all three hero lines.

### Changed Files
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `src/components/homepage/HomepageSections.tsx`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser QA through the in-app Browser against local Vite preview on `http://127.0.0.1:4174`: pass.
- Browser QA desktop `1440x900`: computed hero dot colors are `DESIGN.` white, `SOURCE.` white, `DELIVER.` Urblo lime; no framework overlay, console warnings/errors, or horizontal overflow.
- Browser QA mobile `390x844`: computed hero dot colors are `DESIGN.` white, `SOURCE.` white, `DELIVER.` Urblo lime; no framework overlay, console warnings/errors, or horizontal overflow.

### Risks and Gaps
- None identified beyond normal deployed-preview QA after Cloudflare Pages preview exists.

## Entry - 2026-06-01 (Founder Capability Statement Web Page)

### Scope
- Replaced the provisional `/capabilities` page with a web-native version of Natalie Ma's 2026 Capability Statement, using the supplied PDF as the current client-approved capability source where it supersedes older placeholder copy.
- Added the downloadable 2026 Capability Statement PDF plus extracted capability and Natalie imagery under controlled `public/` launch paths.
- Added an email-gated Capability Statement download form that posts to `/api/enquiries` as `Capability statement download`, reveals the direct PDF link only after a successful API response, and reuses the shared Turnstile widget path when `VITE_TURNSTILE_SITE_KEY` is configured.
- Centralized the live CTA definitions used by capability, contact, sample request, and PDF download surfaces in `src/data/siteChrome.ts`, and added `/capabilities` to shared header/footer navigation.
- Updated `/our-story` so Natalie Ma's portrait, role, bio, and founder quote are sourced from the Capability Statement and visible in the team card without requiring hover.
- Updated Harness docs and source checks so future agents treat the Founder statement page, shared CTA data, PDF asset, media assets, and download lead-capture contract as guarded surfaces.

### Changed Files
- `AGENTS.md`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `package.json`
- `public/downloads/urblo-capability-statement-2026.pdf`
- `public/media/launch/capabilities/*`
- `public/media/launch/our-story/natalie-ma-2026.jpg`
- `scripts/agent-init.sh`
- `scripts/agent-smoke.sh`
- `scripts/check-capabilities-page-source.mjs`
- `scripts/check-contact-form-ui-source.mjs`
- `scripts/check-harness.mjs`
- `src/App.tsx`
- `src/components/TurnstileField.tsx`
- `src/components/homepage/HomepageSections.tsx`
- `src/data/siteChrome.ts`
- `src/lib/turnstileConfig.ts`
- `src/pages/CapabilitiesPage.tsx`
- `src/pages/ContactPage.tsx`
- `src/pages/OurStory.tsx`

### Verification Results
- `npm run build`: pass. Existing Browserslist/caniuse-lite staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass, including `/capabilities`, PDF/media assets, shared Capabilities CTAs, Contact form UI source check, and Capability Statement source check.
- `npm run agent:capabilities-ui`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:check`: pass.
- `jq empty docs/agent/tasks.json`: pass.
- `git diff --check`: pass.
- Browser QA through the in-app Browser against local Vite preview on `http://127.0.0.1:4174`: pass.
- Browser QA `/capabilities` desktop `1440x900`: correct title/route, nonblank hero, no framework overlay, no console warnings/errors, no horizontal overflow, hero leaves real next-section content visible.
- Browser QA `/capabilities` mobile `390x844`: correct title/route, nonblank hero, no framework overlay, no console warnings/errors, no horizontal overflow, next-section content visible.
- Browser QA Capability Statement form: invalid email shows inline validation, direct PDF link is hidden before success, and a valid email on local static preview shows the expected API-configuration error without revealing the direct PDF link.
- Browser QA `/our-story` desktop and mobile: Natalie image resolves to `public/media/launch/our-story/natalie-ma-2026.jpg`; Natalie role, PDF-sourced bio, and founder quote are visible; no framework overlay, console warnings/errors, or horizontal overflow were observed.

### Risks and Gaps
- Live Capability Statement download lead capture is not proven until the same server-side `/api/enquiries` credentials are configured and Jay approves tagged live form QA writes.
- Real Turnstile proof still requires public `VITE_TURNSTILE_SITE_KEY`, server-side Turnstile secret, a valid token, and the existing approval-gated live verifier.
- Real notification proof still requires Resend sender/recipient configuration and approval-gated live form writes.
- Browser QA was local built-preview only. Cloudflare Pages preview smoke remains pending until a Pages preview URL exists.
- Current web imagery is extracted from the supplied Capability Statement PDF; higher-resolution source photography can replace these assets later without changing the page contract.

### Next Handoff
- Continue live form verification after service-role credentials and Jay approval are available: `npm run agent:forms-live -- --allow-writes`, then the browser-boundary, email, and Turnstile variants when their required inputs exist.
- After Cloudflare Pages preview exists, run `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev` and re-run the live form verifier against that deployed origin after environment variables are configured.

## Entry - 2026-05-29 (Cloudflare Pages Account Read-Only Probe)

### Scope
- Used the Cloudflare API connector in read-only mode to inspect Pages project availability in the two accessible Cloudflare accounts.
- Checked Jay's account and Hunter's account without creating projects, deployments, domains, DNS records, environment variables, or secrets.
- Confirmed the Cloudflare launch blocker is account/project setup rather than a repo-side Pages readiness issue.

### Changed Files
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`

### Verification Results
- Cloudflare API spec lookup: pass. Confirmed the read-only Pages endpoint is `GET /accounts/{account_id}/pages/projects`.
- Jay Cloudflare account (`a9cbf84bf6677e2af8c76b353afe0d9d`) Pages project list: pass. The account is reachable and currently returns 0 Pages projects.
- Hunter Cloudflare account (`077afae2c6f4e77badadf21e49e58eb7`) Pages project list: blocked by Cloudflare API authentication error with the current token.
- `npm run agent:live-readiness`: pass in report-only mode; live Supabase keys, first-admin inputs, admin credentials, preview URL, and tagged-write approvals remain missing/manual-gated.
- `git status --short`: clean before this documentation checkpoint.

### Risks and Gaps
- No Cloudflare Pages project, preview deployment, production environment variable, custom domain, DNS record, or rollback state was created or changed.
- Jay's account appears usable for future Pages setup but has no existing Pages project to smoke-test.
- Hunter's account cannot be used with the current Cloudflare token until access is fixed.
- Creating a Pages project still requires Jay to choose the target account and approve the account-level action.

### Next Handoff
- Ask Jay whether to create the Cloudflare Pages project in Jay's account or resolve Hunter account access first.
- After a preview deployment exists, run `npm run agent:cloudflare-preview-smoke -- --base-url https://<preview>.pages.dev`.

## Entry - 2026-05-29 (Full Unprofiled Admin Route-Probe Coverage)

### Scope
- Expanded `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` so unauthorized-profile live mode derives its probes from the complete authenticated admin route list.
- The future no-write live QA now requires `/admin`, `/admin/leads`, `/admin/media`, `/admin/settings`, `/admin/stone-library`, `/admin/projects`, `/admin/products`, `/admin/articles`, and `/admin/audit` to stay on `/admin/unauthorized` without private module headings after an unprofiled Auth user signs in.
- Hardened `npm run agent:admin-crud-coverage` so the unauthorized-profile probes cannot quietly fall back to a small route subset.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `AGENTS.md`
- `docs/ADMIN_IA_ACCESS.md`
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/SUPABASE_SCHEMA.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-crud-coverage.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- Supabase changelog scan: pass. Relevant current notes for this source-only auth verifier checkpoint remain the April 28, 2026 Data/GraphQL API exposure change and May 2026 platform/auth notes; no database implementation change was needed.
- `npm run agent:live-readiness`: pass in report-only mode with live credentials, preview URL, first-admin inputs, and approvals still missing/manual-gated.
- `npm run agent:supabase-foundation-readiness`: pass.
- `node --check scripts/check-admin-auth-browser.mjs`: pass.
- `node --check scripts/check-admin-crud-coverage.mjs`: pass.
- `node --check scripts/check-live-readiness.mjs`: pass.
- `npm run agent:admin-auth-browser -- --expect-unauthorized`: pass in plan-only/no-login mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- Live unprofiled browser QA still requires browser-safe Supabase config and a valid Auth user with no active `admin_profiles` row.
- This checkpoint is source/tooling only. It does not prove active-admin login, first-admin bootstrap, live form persistence, admin CRUD writes, Storage upload policy, email/Turnstile behavior, or Cloudflare preview deployment.

### Next Handoff
- When browser-safe Supabase config and an unprofiled Auth test account are available, run `npm run agent:admin-auth-browser -- --allow-login --expect-unauthorized --strict` to verify every launch-critical admin route stays unauthorized for that account.

## Entry - 2026-05-29 (Admin Runner Credential Input Boundary)

### Scope
- Extended the shared live input validation helper to the admin config browser gate so `--base-url` placeholders or non-origin URLs fail before browser navigation.
- Tightened active-admin and unprofiled admin browser QA readiness so copied email placeholders do not proceed to Supabase Auth login attempts.
- Tightened `admin-crud-live --allow-writes` so live RLS write verification requires either an explicit access token or a real email-shaped admin email/password pair before any live auth/write work can start.
- Updated Harness docs and task state to record the stricter admin runner input boundary.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-config-gate.mjs`
- `scripts/check-admin-crud-live.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- Supabase changelog scan: pass. The relevant hosted-platform note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint is local verifier/docs hardening only.
- `node --check` for edited admin/live-readiness scripts: pass.
- `npm run agent:admin-config-gate -- --base-url '<preview-origin>'`: expected fail before browser navigation with the placeholder base URL error.
- Placeholder active-admin browser QA check with dummy browser key/password: expected fail in strict plan mode with `valid URBLO_ADMIN_EMAIL` missing; no login attempted.
- Placeholder admin CRUD live write check with dummy browser key/password: expected fail before Supabase auth/write work with `valid URBLO_ADMIN_EMAIL + URBLO_ADMIN_PASSWORD` missing.
- Placeholder admin login readiness audit: `npm run agent:live-readiness` reports active-admin, unprofiled, and admin CRUD live write gates as missing valid email-shaped inputs when placeholder emails are supplied.
- `npm run agent:live-readiness`: pass in report-only mode with live inputs still missing/manual-gated.
- `npm run agent:admin-auth-browser`: pass in plan-only/no-login mode.
- `npm run agent:admin-crud-live`: pass in plan-only/no-write mode.
- `npm run agent:first-admin-bootstrap`: pass in plan-only/no-write mode.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:forms-ui`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run agent:supabase-foundation-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.

### Risks and Gaps
- This is another source-only verifier guard. It still does not provide service-role keys, browser-safe keys, admin credentials, first-admin profile, Cloudflare preview URL, or Jay approvals needed for live completion.

### Next Handoff
- Continue source-only hardening only where it reduces launch risk; otherwise live form/admin proof remains blocked on the external inputs listed by `npm run agent:live-readiness`.

## Entry - 2026-05-29 (Live Verifier Input Boundary)

### Scope
- Added a shared live input validation helper for placeholder detection, first-admin email shape checks, and origin-only base URL normalization.
- Aligned the actual live verifier scripts with the existing readiness-report boundary: `forms-live`, `cloudflare-preview-smoke`, and `admin-auth-browser` now reject copied placeholders or URLs with path/query/hash in `--base-url` before any network or live-write work starts.
- Tightened `admin-live-readiness` so copied first-admin email placeholders are reported as invalid before read-only Supabase checks.
- Updated Harness docs and task state so future handoffs distinguish readiness reporting from executable verifier input validation.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/_lib/live-input-validation.mjs`
- `scripts/check-admin-auth-browser.mjs`
- `scripts/check-admin-live-readiness.mjs`
- `scripts/check-cloudflare-preview-smoke.mjs`
- `scripts/check-forms-api-live.mjs`
- `scripts/check-live-readiness.mjs`

### Verification Results
- Supabase changelog scan: pass. The relevant hosted-platform note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint is local verifier/docs hardening only.
- `node --check` for the shared helper and all edited verifier scripts: pass.
- `node -e "JSON.parse(...docs/agent/tasks.json...)"`: pass.
- Negative placeholder check: `npm run agent:forms-live -- --allow-writes --base-url '<preview-origin>'` fails before Supabase work with the placeholder base URL error.
- Negative placeholder check: `npm run agent:cloudflare-preview-smoke -- --base-url '<preview-origin>'` fails before route/API requests with the placeholder base URL error.
- Negative placeholder check: `npm run agent:admin-auth-browser -- --base-url '<preview-origin>'` fails before browser navigation with the placeholder base URL error.
- Negative placeholder check: `npm run agent:admin-live-readiness -- --admin-email '<first-admin-email>'` reports `valid URBLO_FIRST_ADMIN_EMAIL or --admin-email` missing, alongside missing keys.
- Pathful URL checks for `forms-live` and `cloudflare-preview-smoke`: pass; both fail before live/network work because the base URL is not an origin-only value.
- `npm run agent:live-readiness`: pass in report-only mode with live inputs still missing/manual-gated.
- `npm run agent:admin-auth-browser`: pass in plan-only/no-login mode.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:check`: pass.
- `git diff --check`: pass.
- `npm run lint`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- `npm run agent:forms-ui`: pass.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.
- Plan-only `npm run agent:admin-crud-live`: pass.
- Plan-only `npm run agent:first-admin-bootstrap`: pass.
- `npm run agent:supabase-foundation-readiness`: pass.

### Risks and Gaps
- Live form persistence, first-admin readiness, active-admin browser QA, unprofiled unauthorized browser QA, admin CRUD live writes, Storage upload proof, email/Turnstile proof, and Cloudflare preview smoke remain blocked by the same missing credentials, preview URL, first-admin details, and Jay approvals.
- This checkpoint reduces false-start live verifier risk only; it does not make the CMS operational.

### Next Handoff
- Continue `NOW-FORMS-BACKEND-001`, `NOW-ADMIN-AUTH-RLS-001`, and `NOW-CLOUDFLARE-PAGES-DEPLOY-001` after credentials, first-admin details, preview URL, and write approvals are available.

## Entry - 2026-05-29 (Live Readiness Manual Input Validation)

### Scope
- Tightened `npm run agent:live-readiness` so non-secret manual `--base-url` and `--admin-email` inputs must be real values before readiness reports them as present.
- Copied placeholders such as `<preview-origin>` and `<first-admin-email>`, malformed emails, and preview URLs with path/query/hash now remain missing in text and JSON readiness output.
- Updated Harness docs and task state so future live verification handoffs do not confuse example placeholders with usable Cloudflare preview URLs or first-admin email inputs.
- No Supabase rows, Auth users, Storage objects, Cloudflare state, credentials, or live writes were created or changed.

### Changed Files
- `docs/ARCHITECTURE.md`
- `docs/CLOUDFLARE_DEPLOYMENT.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `docs/agent/verification.md`
- `scripts/check-live-readiness.mjs`

### Verification Results
- Supabase changelog scan: pass. The relevant current hosted-platform note remains the April 28, 2026 Data/GraphQL API exposure change; this checkpoint is local readiness tooling/docs only.
- Supabase connector read-only sanity: pass. Project `Urblo` is active healthy on Postgres 17.6.1, with 12 launch migrations, 24/24 expected launch tables with RLS, 114 public-schema policies, 12 finish rows, one default site settings row, zero admin/form/content parent rows, and zero security advisor lints.
- `node --check scripts/check-live-readiness.mjs`: pass.
- Placeholder readiness check: pass. `npm run agent:live-readiness -- --base-url '<preview-origin>' --admin-email '<first-admin-email>' --form-writes-approved --first-admin-writes-approved --admin-writes-approved --content-import-approved --content-merge-approved --content-public-cutover-approved --turnstile-token-provided` reports valid preview URL and valid first-admin email as missing.
- Valid override JSON check: pass. `npm run agent:live-readiness -- --json --base-url https://example.pages.dev --admin-email first@example.com --form-writes-approved --first-admin-writes-approved --admin-writes-approved --content-import-approved --content-merge-approved --content-public-cutover-approved --turnstile-token-provided` reports those non-secret values as present while preserving missing secret/session inputs.
- `npm run agent:live-readiness`: pass in report-only mode; live form/admin/Cloudflare inputs remain missing or approval-gated.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:cloudflare-readiness`: pass.
- `npm run agent:public-supabase-readiness`: pass.
- `npm run agent:forms-ui`: pass.
- `node scripts/check-forms-api.mjs`: pass.
- Plan-only `npm run agent:admin-auth-browser`: pass.
- Plan-only `npm run agent:admin-crud-live`: pass.
- Plan-only `npm run agent:first-admin-bootstrap`: pass.
- `npm run build`: pass. Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.

### Risks and Gaps
- This prevents false readiness from placeholder/manual input mistakes, but it does not provide the missing service-role key, browser-safe key, first-admin email/profile, admin credentials, Cloudflare preview URL, Turnstile/email secrets, or Jay approvals.
- The admin CMS remains source-ready but not live-operational until the credential-gated form/admin/preview checks run.

### Next Handoff
- Continue `NOW-FORMS-BACKEND-001`, `NOW-ADMIN-AUTH-RLS-001`, and `NOW-CLOUDFLARE-PAGES-DEPLOY-001` after the required credentials, first-admin details, preview URL, and approvals exist.

## Entry - 2026-05-29 (Production Dependency Audit)

### Scope
- Upgraded production-facing dependencies to remove the critical/high production audit path: `react-router-dom` to `^7.16.0`, `swiper` to `^12.2.0`, and `postcss` to `^8.5.15`.
- Ran `npm audit fix` to refresh safe transitive dependency versions in `package-lock.json`; `npm audit --omit=dev --audit-level=critical` now reports zero vulnerabilities.
- Added `tailwindcss/nesting` before Tailwind in `postcss.config.js` so Swiper 12 nested CSS builds cleanly instead of relying on PostCSS warning-tolerant output.

### Changed Files
- `AGENTS.md`
- `docs/HANDOFF.md`
- `docs/NEXT_STEPS.md`
- `docs/WORKLOG.md`
- `docs/agent/tasks.json`
- `package.json`
- `package-lock.json`
- `postcss.config.js`

### Verification Results
- `npm run build`: pass. The previous Swiper nested-CSS warnings are resolved; Browserslist staleness notice remains.
- `npm run lint`: pass.
- `npx tsc -b`: pass.
- `npm run agent:smoke`: pass.
- `npm run agent:admin-config-gate`: pass for 11 no-config admin routes in Firefox.
- `npm run agent:admin-crud-coverage`: pass.
- `npm run agent:check`: pass.
- `npm audit --omit=dev --audit-level=critical`: pass with zero vulnerabilities reported.
- Playwright Chromium homepage carousel render check: pass. The product carousel renders 5 slides, 5 pagination bullets, 2 navigation buttons, and a visible active slide.

### Risks and Gaps
- This reduces production dependency audit risk but does not complete live Supabase form/admin verification.
- Build still reports the existing Browserslist data staleness notice.

### Next Handoff
- Continue live form/admin verification after the required credentials, first-admin details, Cloudflare preview URL, and Jay approvals are available.

