# Projects package import contract

Project content package import (NOW-PROJECT-IMPORT-001, 2026-10-15). Format and colleague guide: `docs/content-import/README.md`; Claude Design prompt: `docs/content-import/CLAUDE_DESIGN_PROMPT.md`; schema: `docs/content-import/project-package.schema.json`. Editor aggregate: `docs/architecture/projects-admin.md`.

## Boundary

- Browser only. No AI, no new Function endpoint, no migration. `/admin/projects` → **Import package** (owner/admin/editor; Viewers do not see it) opens `src/pages/admin/projects/ImportProjectDialog.tsx`, which parses, uploads images and saves once through the existing `POST /api/admin/projects` `action: 'save'` with `projectId: null`, `baseRevision: 0`. The Function re-validates the whole draft as for any Save; Publish blockers and promotion are unchanged. Nothing is published by an import, and existing projects are never updated.
- Accepted input: one `project.json` (file or pasted text) or a zip with `project.json` and `images/` only (`urblo-project-package` v1). No HTML, PDF, Markdown documents or other formats.

## Parsing and mapping (`src/features/blocks/importPackage.ts`)

- `parseProjectPackage(json)` is pure: exact `format`/`version`, every unknown key is an error with its path, 13 block types (`hotspot_image` refused), package fields = `src/features/blocks/schema.ts` content except images `{ file, alt }` and stones `{ stone: <Stone Library slug>, finish }`. The `image` block's optional `presentation` (`photo` | `drawing`, 2026-10-22) passes through unchanged; packages without it stay valid and import as photos. Block content is validated by `validateContentBlock(…, 'publish')` with every image and stone assumed found, so remaining issues are the package's own; issue paths map back to package fields.
- Errors stop the import (limits: 100 blocks/facts/materials, 50 distinct image files, 1 MB JSON; one video; `alt` required and not the file name; `images/*.jpg|jpeg|png|webp` only). Missing images, images without `file`, unknown stones/finishes, no hero/summary and HTML/headings in text are warnings.
- `packageToDraft(parsed, context)` builds a `ProjectAggregateDraft` with `createEmptyProjectAggregateDraft()` and `createProjectDraftKey()`: status `draft`, claim fields `needs_review` (the Save path normalizes these compatibility fields as for every Save), slug from the package or title with `-2`, `-3`… against CMS and bundled static Project slugs. Unresolved images stay `mediaAssetId: null` with their `alt`; unresolved stones stay `stoneGroupId: null` (stone cards keep the finish key). Every block is re-checked in `draft` mode.
- `catalogueResolvers()` resolves slugs against the Live Stone Library catalogue the editor already loads (`loadStoneCatalogueOptions()`); finishes match key or name ignoring case, spaces and hyphens; a material's variant is the first Live variant offering the finish.

## Zip and upload

- `src/features/blocks/importZip.ts` loads `fflate` with `import()` (own `fflate` chunk, never in the public entry or preloaded; `scripts/check-admin-config-gate.mjs` asserts it). It lists entries before inflating, refuses traversal/absolute/backslash names, anything outside `project.json` + `images/<file>`, non-JPG/PNG/WebP, images over 10 MB, more than 100 MB; it ignores `__MACOSX/` and `.DS_Store`, accepts one wrapping folder, and checks each image's magic bytes against its extension.
- Each distinct file uploads once through `src/pages/admin/media/uploadPickerFile.ts`, the same private-first upload, `media_assets` Draft insert, readback/cleanup and `media_asset.upload` audit as `AdminMediaPicker` (prefix `project-import`, source `project_import`, Projects `original` policy). A failed image offers Retry or Skip (skip = image to add later); a failed Save offers Try again without re-uploading.
- After Save the dialog records `project.import` (`projectId`, `blocks`, `imagesUploaded`, `imagesPending`, `stonesUnresolved`) and the editor opens the new draft with `Imported as a draft. Review each block, add any missing images, then Publish.`

## Offline check

`npm run agent:project-package -- <file.json|file.zip>` runs the same parser and zip reader under `tsx`, maps with the bundled `data/clean/stone_library.json` snapshot plus the dated live list `docs/content-import/stone-catalogue-2026-10-15.json` (the single source of the stone list in the README and Claude Design prompt) and runs `functions/_lib/blocks.js` on every block. No network or writes.
