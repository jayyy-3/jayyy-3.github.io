#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { argv, exit } from "node:process";
import { projects as staticProjectFixtures } from "../src/data/projectData.ts";
import { runVitest } from "./_lib/vitest.mjs";

// Source and migration contracts stay here. In-memory aggregate behaviour lives in
// tests/admin-projects-aggregate.test.ts; the verification graph runs it in its
// `unit` node and passes --source-only here to avoid running it twice.
const root = resolve(import.meta.dirname, "..");
const failures = [];

function readRequired(path) {
  const absolutePath = resolve(root, path);
  if (!existsSync(absolutePath)) {
    failures.push(`${path}: missing required Phase 1 source`);
    return "";
  }
  return readFileSync(absolutePath, "utf8");
}

function requireIncludes(text, needle, path, label = needle) {
  if (!text.includes(needle)) failures.push(`${path}: missing ${label}`);
}

function requireMatches(text, pattern, path, label) {
  if (!pattern.test(text)) failures.push(`${path}: missing ${label}`);
}

function forbidMatches(text, pattern, path, label) {
  if (pattern.test(text)) failures.push(`${path}: unexpected ${label}`);
}

const pagePath = "src/pages/admin/AdminProjectsPage.tsx";
const shellPath = "src/pages/admin/AdminShell.tsx";
const aggregatePath = "src/features/projects/projectAggregate.ts";
const apiContractPath = "src/features/projects/projectApiContract.ts";
const editorPath = "src/pages/admin/projects/ProjectEditor.tsx";
const previewPath = "src/pages/admin/projects/ProjectDraftPreview.tsx";
const mediaPath = "src/pages/admin/projects/InlineMediaField.tsx";
const hotspotPath = "src/pages/admin/projects/VisualHotspotEditor.tsx";
const publicViewPath = "src/components/projects/ProjectPageView.tsx";
const responsiveImagePath = "src/components/projects/ProjectResponsiveImage.tsx";
const imageDeliveryPath = "src/lib/projectImageDelivery.ts";
const publicRoutePath = "src/pages/ProjectDetails.tsx";
const servicePath = "src/service/ProjectService.ts";
const routePath = "functions/api/admin/projects.js";
const functionPath = "functions/_lib/admin-projects.js";
const migrationPath =
  "supabase/migrations/20260719015649_project_aggregate_drafts.sql";
const tombstoneMigrationPath =
  "supabase/migrations/20260802103337_restrict_archived_project_tombstones.sql";
const lockdownMigrationPath =
  "supabase/migrations/20260802105537_project_aggregate_write_lockdown.sql";
const stoneLibrarySourceMigrationPath =
  "supabase/migrations/20260812053204_project_materials_stone_library_source.sql";
const blocksMigrationPath = "supabase/migrations/20261014120000_project_blocks.sql";

const page = readRequired(pagePath);
const shell = readRequired(shellPath);
const aggregate = readRequired(aggregatePath);
const apiContract = readRequired(apiContractPath);
// The editor's Media and Materials sections and shared controls live in projects/sections/;
// source contracts apply to the editor as a whole.
const editorSectionPaths = [
  "src/pages/admin/projects/sections/editorContext.ts",
  "src/pages/admin/projects/sections/EditorControls.tsx",
  "src/pages/admin/projects/sections/BodySection.tsx",
  "src/pages/admin/projects/sections/MaterialsSection.tsx",
];
const editor = [editorPath, ...editorSectionPaths].map(readRequired).join("\n");
const preview = readRequired(previewPath);
// Projects configure the shared admin media picker (NOW-OPT-ADMIN-MEDIA-PICKER-001); the upload,
// alt-text and audit contracts below apply to the wrapper plus the shared picker source.
const media = [
  mediaPath,
  "src/pages/admin/media/AdminMediaPicker.tsx",
  "src/pages/admin/media/mediaPickerFiles.ts",
  // NOW-PROJECT-IMPORT-001: the private upload itself is shared with the package import.
  "src/pages/admin/media/uploadPickerFile.ts",
]
  .map(readRequired)
  .join("\n");
const hotspot = readRequired(hotspotPath);
const publicView = readRequired(publicViewPath);
const responsiveImage = readRequired(responsiveImagePath);
const imageDelivery = readRequired(imageDeliveryPath);
const publicRoute = readRequired(publicRoutePath);
const service = readRequired(servicePath);
const route = readRequired(routePath);
const server = readRequired(functionPath);
const migration = readRequired(migrationPath);
const tombstoneMigration = readRequired(tombstoneMigrationPath);
const lockdownMigration = readRequired(lockdownMigrationPath);
const stoneLibrarySourceMigration = readRequired(stoneLibrarySourceMigrationPath);
const blocksMigration = readRequired(blocksMigrationPath);
const browserProjectsSource = [
  page,
  shell,
  aggregate,
  editor,
  preview,
  media,
  hotspot,
].join("\n");

requireIncludes(page, "<RequireAdmin>", pagePath, "protected admin boundary");
requireIncludes(page, "<AdminShell", pagePath, "admin shell");
requireIncludes(
  page,
  "/api/admin/projects",
  pagePath,
  "single aggregate endpoint",
);
requireIncludes(
  editor,
  'option.status !== "archived" || option.id === value',
  editorPath,
  "Draft and Live Stone Library options remain editable",
);
requireIncludes(
  editor,
  'entry.status !== "archived"',
  editorPath,
  "Draft Stone Library imagery is available to the Project editor",
);
requireIncludes(
  stoneLibrarySourceMigration,
  "variants.status <> 'archived'",
  stoneLibrarySourceMigrationPath,
  "unique Draft or Live variant backfill",
);
requireIncludes(
  server,
  'variants.get(id) !== "published"',
  functionPath,
  "publish-only Live variant enforcement",
);
requireIncludes(
  server,
  "Every material must have a published Stone Library finish image.",
  functionPath,
  "publish-only Live Stone Library image enforcement",
);
requireIncludes(
  aggregate,
  "mediaById.get(image.mediaAssetId)?.status === 'published'",
  aggregatePath,
  "client publish blocker for Draft Stone Library media",
);
requireIncludes(page, "baseRevision", pagePath, "private draft revision guard");
requireIncludes(
  page,
  "const [baseUpdatedAt, setBaseUpdatedAt]",
  pagePath,
  "canonical first-adoption token state",
);
requireMatches(
  page,
  /projectId:\s*draft\.project\.id,[\s\S]{0,100}baseRevision,[\s\S]{0,100}baseUpdatedAt,[\s\S]{0,100}draft:\s*requestDraft/,
  pagePath,
  "canonical token on every aggregate mutation",
);
requireIncludes(
  page,
  "setBaseUpdatedAt(payload.baseUpdatedAt)",
  pagePath,
  "response canonical token adoption",
);
requireIncludes(
  apiContract,
  "baseUpdatedAt: string | null",
  apiContractPath,
  "nullable canonical token response contract",
);
requireIncludes(
  apiContract,
  "isBaseUpdatedAt(candidate.baseUpdatedAt)",
  apiContractPath,
  "canonical token response validation",
);
requireIncludes(
  page,
  "readProjectListApiResponse",
  pagePath,
  "private draft-aware project index",
);
requireIncludes(
  page,
  "requireMessage: true",
  pagePath,
  "mutation response message requirement",
);
requireIncludes(
  page,
  "project-discard-navigation-banner",
  pagePath,
  "inline discard navigation choice",
);
requireIncludes(
  page,
  "Discard and continue",
  pagePath,
  "explicit discard-and-continue action",
);
requireIncludes(page, "Keep editing", pagePath, "explicit keep-editing action");
requireMatches(
  page,
  /error\.code\s*===\s*["']revision_conflict["']/,
  pagePath,
  "revision-only reload recovery",
);
requireIncludes(
  page,
  "showReload={hasConflict}",
  pagePath,
  "revision-conflict recovery state handoff",
);
requireMatches(
  editor,
  /const mutationDisabled\s*=\s*!canEdit\s*\|\|\s*isSaving\s*\|\|\s*showReload;/,
  editorPath,
  "revision-conflict mutation lock",
);
requireMatches(
  editor,
  /\(isDirty\s*\|\|\s*hasPendingMedia\)\s*&&\s*!isSaving\s*&&\s*!showReload/,
  editorPath,
  "revision-conflict stale discard suppression",
);
requireMatches(
  editor,
  /if\s*\(canEdit\s*&&\s*isDirty\s*&&\s*!isSaving\s*&&\s*!hasPendingMedia\s*&&\s*!showReload\)/,
  editorPath,
  "revision-conflict submit guard",
);
for (const hotspotConflictLock of [
  "disabled={isSaving || showReload}",
  "readOnly={!canEdit || hasPendingMedia || showReload}",
  "selectionDisabled={hasPendingMedia || showReload}",
]) {
  requireIncludes(
    editor,
    hotspotConflictLock,
    editorPath,
    `hotspot revision-conflict lock ${hotspotConflictLock}`,
  );
}
requireMatches(
  page,
  /async function handleAction\(action: ProjectEditorAction\)[\s\S]{0,260}hasConflict[\s\S]{0,40}return;/,
  pagePath,
  "parent revision-conflict mutation guard",
);
requireIncludes(page, "onRetry", pagePath, "failed draft retry action");
requireIncludes(
  page,
  "refreshMediaOptions",
  pagePath,
  "post-publish media URL refresh",
);
requireIncludes(
  page,
  "mediaPickerLimit = 500",
  pagePath,
  "latest-500 media picker cap",
);
const pickerLimitCalls = page.match(/\.limit\(mediaPickerLimit\)/g) ?? [];
if (pickerLimitCalls.length < 2) {
  failures.push(
    `${pagePath}: expected the initial and post-publish picker queries to retain the latest-500 cap`,
  );
}
requireIncludes(
  page,
  "fetchReferencedMediaOptions(nextDraft)",
  pagePath,
  "loaded-draft referenced media fetch",
);
requireMatches(
  page,
  /\.in\(["']id["'],\s*batch\)/,
  pagePath,
  "exact referenced media id query",
);
requireIncludes(
  page,
  "mergeProjectMediaOptions(current, resolvedReferencedOptions)",
  pagePath,
  "referenced media merge outside the picker cap",
);
requireIncludes(
  page,
  "signedPreviewRefreshIntervalMs = 45 * 60 * 1000",
  pagePath,
  "private preview refresh before one-hour expiry",
);
requireIncludes(
  page,
  "window.setInterval",
  pagePath,
  "private preview refresh timer",
);
requireIncludes(
  page,
  "window.clearInterval",
  pagePath,
  "private preview refresh timer cleanup",
);
requireIncludes(
  page,
  "createSignedUrls(paths, signedPreviewLifetimeSeconds)",
  pagePath,
  "central signed preview lifetime",
);
requireMatches(
  page,
  /asset\.bucket\s*!==\s*publicMediaBucket/,
  pagePath,
  "private-only signed preview refresh",
);
requireIncludes(
  page,
  "isDirty={isDirty}",
  pagePath,
  "single parent dirty-state handoff",
);
requireIncludes(
  editor,
  "isDirty: boolean",
  editorPath,
  "derived dirty-state prop",
);
forbidMatches(
  editor,
  /JSON\.stringify\(\s*(?:draft|baseline)\s*\)/,
  editorPath,
  "duplicate full-draft dirty serialization",
);
const dirtySerializationCalls = `${page}\n${editor}`.match(
  /JSON\.stringify\(\s*(?:draft|baseline)\s*\)/g,
) ?? [];
if (dirtySerializationCalls.length !== 2) {
  failures.push(
    `${pagePath}: expected exactly one full-draft dirty comparison, found ${dirtySerializationCalls.length / 2}`,
  );
}
requireIncludes(
  apiContract,
  "message?: string",
  apiContractPath,
  "optional GET response message",
);
requireMatches(
  page,
  /method:\s*['"]GET['"]/,
  pagePath,
  "authenticated aggregate load",
);
requireIncludes(
  page,
  "Authorization:",
  pagePath,
  "Bearer authorization header",
);
forbidMatches(
  page,
  /\.from\(['"]projects['"]\)/,
  pagePath,
  "public-table-only project index",
);
requireMatches(
  browserProjectsSource,
  /onAction\(['"]save['"]\)|action:\s*['"]save['"]/,
  pagePath,
  "Save action",
);
requireMatches(
  browserProjectsSource,
  /onAction\(['"]publish['"]\)|action:\s*['"]publish['"]/,
  pagePath,
  "Publish action",
);
requireMatches(
  browserProjectsSource,
  /onAction\(['"]archive['"]\)|action:\s*['"]archive['"]/,
  pagePath,
  "Hide/archive action",
);
forbidMatches(
  page + editor,
  /recordAdminAuditEvent|withAuditNotice/,
  pagePath,
  "browser-side aggregate Projects audit write",
);
forbidMatches(
  browserProjectsSource,
  /window\.confirm|\bconfirm\s*\(/,
  pagePath,
  "confirmation dialog",
);
forbidMatches(
  editor,
  /<fieldset\s+disabled=/,
  editorPath,
  "outer disabled fieldset that blocks navigation",
);
forbidMatches(
  browserProjectsSource,
  /\.from\(['"]project_(?:facts|materials|media|material_maps|hotspots)['"]\)[\s\S]{0,120}?\.(?:insert|update|upsert|delete)\s*\(/,
  pagePath,
  "direct child mutation outside the aggregate endpoint",
);
forbidMatches(
  editor + hotspot,
  /x_percent|y_percent|X percent|Y percent/i,
  editorPath,
  "raw hotspot coordinate control",
);
forbidMatches(
  shell + editor + media,
  /(?:>|['"`])\s*(?:storage bucket|promot(?:e|ion)|migration|static fallback|legacy page)\b/i,
  shellPath,
  "editor-facing Storage or migration implementation language",
);

for (const field of [
  "schemaVersion:",
  "project:",
  "facts:",
  "materials:",
  "maps:",
  "blocks:",
  "hotspots:",
]) {
  requireIncludes(aggregate, field, aggregatePath, `aggregate field ${field}`);
}
requireMatches(
  aggregate,
  /blockers\.length\s*<\s*3|slice\(0,\s*3\)/,
  aggregatePath,
  "three-item blocker limit",
);
requireIncludes(
  editor,
  "<ProjectDraftPreview",
  editorPath,
  "draft preview surface",
);
requireMatches(
  editor,
  /sticky|position:\s*['"]sticky['"]/,
  editorPath,
  "sticky single action bar",
);
requireIncludes(
  editor,
  "ProjectMutationDisabledContext",
  editorPath,
  "mutation-only Viewer/save lock",
);
requireIncludes(
  editor,
  "hidden={!open}",
  editorPath,
  "mounted collapsed sections preserve pending media",
);
requireIncludes(
  editor,
  "pendingMediaKeys",
  editorPath,
  "per-field pending media aggregation",
);
requireIncludes(
  editor,
  "busyMediaKeys",
  editorPath,
  "active media request aggregation",
);
requireIncludes(
  editor,
  "mediaFieldDisabled",
  editorPath,
  "other media fields lock while one is pending",
);
requireIncludes(
  editor,
  "moveProjectDraftItem",
  editorPath,
  "accessible collection reorder behavior",
);
requireMatches(
  page,
  /min-\[(?:10\d\d|11\d\d)px\]:grid-cols-\[/,
  pagePath,
  "medium-desktop master/detail workspace",
);
requireIncludes(
  page,
  'useState<ProjectListFilter>("projects")',
  pagePath,
  "active-project default list filter",
);
requireIncludes(
  page,
  'project.status === "archived"',
  pagePath,
  "archive exclusion from the default project list",
);
requireIncludes(
  page,
  'label={`Projects ${projectCounts.active}`}',
  pagePath,
  "active Project count instead of all database rows",
);
requireIncludes(
  page,
  'projectCounts.archived > 0',
  pagePath,
  "conditional Archive entry",
);
forbidMatches(
  page,
  /label=\{`All \$\{projects\.length\}`\}|label=\{`Saved \$\{|label=\{`Hidden \$\{/,
  pagePath,
  "misleading all-row or Saved/Hidden Project filters",
);
requireMatches(
  shell,
  /grid-cols-\[minmax\(0,1fr\)\][^"\n]*lg:grid-cols-\[264px_minmax\(0,1fr\)\]/,
  shellPath,
  "mobile shell track containment",
);
requireMatches(
  shell,
  /<nav className="[^"]*min-w-0[^"]*max-w-full[^"]*overflow-x-auto/,
  shellPath,
  "contained horizontally scrollable mobile navigation",
);
requireMatches(
  editor,
  /role="tab"[\s\S]{0,500}tabIndex=[\s\S]{0,500}onKeyDown=/,
  editorPath,
  "keyboard-operable roving map tabs",
);
requireMatches(
  editor,
  /role="tabpanel"[\s\S]{0,240}aria-labelledby=/,
  editorPath,
  "labelled material-map tab panel",
);
requireMatches(
  editor,
  /flex-col[^"]*sm:flex-row/,
  editorPath,
  "narrow-screen section header stacking",
);
// Each media block owns one image field whose identity survives turning material points
// on or off, so a pending upload can never move to another block.
requireIncludes(
  editor,
  "instanceKey={`media-${block.key}`}",
  editorPath,
  "stable per-block media field instance",
);
requireIncludes(
  editor,
  "key={`media-${block.key}`}",
  editorPath,
  "stable per-block media field identity",
);
forbidMatches(
  editor,
  /Material maps and points|Interactive material image|Add material map/,
  editorPath,
  "separate material-map editor",
);
forbidMatches(
  editor,
  /Point detail image|key=\{`hotspot-\$\{selectedHotspot\.key\}`\}/,
  editorPath,
  "Project-owned hotspot image override",
);
forbidMatches(
  editor,
  /Material detail image|Point title/,
  editorPath,
  "Project-owned material presentation controls",
);
requireIncludes(editor, 'label="Variant"', editorPath, "Stone Library variant selector");
requireIncludes(editor, "finishCapabilities.some", editorPath, "variant-supported finish filtering");
requireIncludes(editor, "stone-library-material-preview", editorPath, "canonical Stone Library preview card");
requireIncludes(
  stoneLibrarySourceMigration,
  "add column if not exists stone_variant_id",
  stoneLibrarySourceMigrationPath,
  "Project material Stone Library variant reference",
);
requireIncludes(
  stoneLibrarySourceMigration,
  "candidates.candidate_count = 1",
  stoneLibrarySourceMigrationPath,
  "unambiguous-only legacy variant backfill",
);
requireIncludes(
  stoneLibrarySourceMigration,
  "project_material_stone_library_mismatch",
  stoneLibrarySourceMigrationPath,
  "publish-time Stone Library relationship validation",
);
forbidMatches(
  editor,
  /ProofReviewControl|Review outcome|canManageClaims/,
  editorPath,
  "editor-facing proof review workflow",
);
requireMatches(
  editor,
  />\s*Save\s*</,
  editorPath,
  "Save button in the single action bar",
);
requireMatches(
  editor,
  />\s*Publish\s*</,
  editorPath,
  "Publish button in the single action bar",
);
requireMatches(
  editor,
  />\s*(?:Hide|Archive)\s*</,
  editorPath,
  "Hide button in the single action bar",
);
requireIncludes(
  preview,
  "ProjectPageView",
  previewPath,
  "shared public Project renderer",
);
requireIncludes(preview, "previewMode", previewPath, "preview mode boundary");
requireIncludes(
  preview,
  "ProjectService.getAll()",
  previewPath,
  "live Published/tombstone neighbour overlay",
);
forbidMatches(
  preview,
  /staticProjects/,
  previewPath,
  "static-only preview neighbour list",
);
requireIncludes(
  publicRoute,
  "ProjectPageView",
  publicRoutePath,
  "public route shared renderer",
);
requireIncludes(
  publicView,
  "previewMode",
  publicViewPath,
  "shared renderer preview mode",
);

requireMatches(
  hotspot,
  /onPointerDown=|onPointerMove=|setPointerCapture/,
  hotspotPath,
  "visual pointer hotspot editing",
);
requireMatches(
  hotspot,
  /getBoundingClientRect\(\)/,
  hotspotPath,
  "derived hotspot position from the image bounds",
);
requireMatches(media, /type=['"]file['"]/, mediaPath, "inline file input");
requireMatches(media, /onDrop=|onDragOver=/, mediaPath, "drag-and-drop upload");
requireMatches(media, /alt/i, mediaPath, "alt text capture");
requireMatches(media, /Search|search/i, mediaPath, "searchable media picker");
requireMatches(media, /<img|backgroundImage/, mediaPath, "media thumbnails");
const inlineMediaAuditCalls = media.match(/recordAdminAuditEvent\s*\(/g) ?? [];
if (inlineMediaAuditCalls.length !== 2) {
  failures.push(
    `${mediaPath}: expected exactly two inline media audit writes, found ${inlineMediaAuditCalls.length}`,
  );
}
requireMatches(
  media,
  /action:\s*['"]media_asset\.upload['"]/,
  mediaPath,
  "inline upload audit action",
);
requireMatches(
  media,
  /action:\s*['"]media_asset\.update['"]/,
  mediaPath,
  "inline alt update audit action",
);
requireMatches(
  media,
  /auditSource=['"]project_inline['"]/,
  mediaPath,
  "project-inline audit source",
);
requireMatches(
  media,
  /storagePosture:\s*['"]private-first['"]/,
  mediaPath,
  "private-first upload audit metadata",
);
requireIncludes(
  media,
  "metadataConfirmedByReadback",
  mediaPath,
  "metadata readback audit result",
);
requireMatches(
  media,
  /field:\s*['"]alt['"]/,
  mediaPath,
  "alt-field audit metadata",
);
requireMatches(
  media,
  /media picker upload audit failed/,
  mediaPath,
  "raw upload audit error logging",
);
requireMatches(
  media,
  /media picker description audit failed/,
  mediaPath,
  "raw alt audit error logging",
);
requireIncludes(
  media,
  "Change history could not be updated",
  mediaPath,
  "plain-language audit warning",
);
requireIncludes(
  media,
  "maximumProjectImageBytes = 10 * 1024 * 1024",
  mediaPath,
  "10 MiB inline upload limit",
);
requireIncludes(
  media,
  'uploadPolicy="original"',
  mediaPath,
  "Projects keep the original upload",
);
forbidMatches(
  media,
  /setPendingAlt\([^)]*\.name/,
  mediaPath,
  "alt text prefilled from the file name",
);
requireIncludes(
  media,
  "Your original is kept at full quality",
  mediaPath,
  "original-preservation upload reassurance",
);
requireIncludes(
  media,
  "High-quality website versions are prepared automatically",
  mediaPath,
  "automatic website-delivery explanation",
);
requireIncludes(
  publicView,
  "ProjectResponsiveImage",
  publicViewPath,
  "shared responsive Project imagery",
);
// The hero stays in the page view; body images moved to the shared block renderers
// (NOW-PROJECT-BLOCKS-001) and keep the same detail delivery profile.
requireIncludes(publicView, 'profile="hero"', publicViewPath, "hero image delivery profile");
// Image and step images render through the one BodyImage (2026-10-22), which owns the profile.
for (const blockImagePath of ["src/components/blocks/ImageBlock.tsx", "src/components/blocks/StepsBlock.tsx"]) {
  requireIncludes(readRequired(blockImagePath), "<BodyImage", blockImagePath, "shared body image renderer");
}
for (const blockImagePath of [
  "src/components/blocks/BodyImage.tsx",
  "src/components/blocks/GalleryBlock.tsx",
]) {
  requireIncludes(readRequired(blockImagePath), 'profile="detail"', blockImagePath, "detail image delivery profile");
}

// Shared content blocks (NOW-PROJECT-BLOCKS-001): one shared module, one renderer per type,
// one server validator held to the same fixture, and no block rendering inside the page view.
const blockSchemaPath = "src/features/blocks/schema.ts";
const blockSchema = readRequired(blockSchemaPath);
const serverBlocksPath = "functions/_lib/blocks.js";
const serverBlocks = readRequired(serverBlocksPath);
const blockTypes = [
  "heading", "text", "quote", "callout", "stats", "steps", "spec_table",
  "comparison_table", "stone_cards", "image", "gallery", "hotspot_image", "video", "cta",
];
const declaredTypes = (source) =>
  [...(/CONTENT_BLOCK_TYPES = \[([\s\S]*?)\]/.exec(source)?.[1] ?? "").matchAll(/['"]([a-z_]+)['"]/g)].map((match) => match[1]);
if (JSON.stringify(declaredTypes(blockSchema)) !== JSON.stringify(blockTypes)) {
  failures.push(`${blockSchemaPath}: block types must be exactly the 14 approved types in order`);
}
if (JSON.stringify(declaredTypes(serverBlocks)) !== JSON.stringify(blockTypes)) {
  failures.push(`${serverBlocksPath}: server block types must match the shared contract`);
}
const rendererNames = {
  heading: "HeadingBlock", text: "TextBlock", quote: "QuoteBlock", callout: "CalloutBlock",
  stats: "StatsBlock", steps: "StepsBlock", spec_table: "SpecTableBlock",
  comparison_table: "ComparisonTableBlock", stone_cards: "StoneCardsBlock", image: "ImageBlock",
  gallery: "GalleryBlock", hotspot_image: "HotspotImageBlock", video: "VideoBlock", cta: "CtaBlock",
};
const blockListPath = "src/components/blocks/BlockList.tsx";
const blockList = readRequired(blockListPath);
for (const [type, name] of Object.entries(rendererNames)) {
  readRequired(`src/components/blocks/${name}.tsx`);
  requireIncludes(blockList, `case '${type}':`, blockListPath, `${type} renderer dispatch`);
  requireIncludes(blockList, `<${name} `, blockListPath, `${name} renderer`);
}
requireIncludes(publicView, "<BlockList", publicViewPath, "shared block renderer for the Project body");
forbidMatches(
  publicView,
  /ProjectHotspotImage|youtube-nocookie|aspect-\[16\/9\]/,
  publicViewPath,
  "block rendering inlined in the Project page view",
);
for (const [path, needle, label] of [
  [serverBlocksPath, "export function validateContentBlock", "server block validator"],
  [serverBlocksPath, "export function upgradeLegacyProjectDraft", "server legacy draft upgrade"],
  [functionPath, "upgradeLegacyProjectDraft(body.draft)", "legacy draft upgrade before validation"],
  [functionPath, 'validateContentBlock(row, "draft")', "server block validation on Save"],
  [functionPath, "fillDraftAltText(input.draft, media)", "media descriptions filled after the media check"],
  [functionPath, "Use only Live Stone Library stones in stone cards.", "stone-card Live stone gate"],
  [aggregatePath, "validateContentBlock(", "client block publish blockers"],
  [servicePath, ".from('project_blocks')", "public body read from project_blocks"],
  ["tests/functions-contract.test.ts", "./fixtures/content-blocks.json", "shared validator fixture"],
  ["tests/functions-contract.test.ts", "serverBlocks.validateContentBlock", "server validator held to the fixture"],
  ["tests/functions-contract.test.ts", "clientBlocks.validateContentBlock", "client validator held to the fixture"],
]) {
  requireIncludes(readRequired(path), needle, path, label);
}
// Body image presentation (NOW-PROJECT-IMAGE-PRESENTATION-001): body images keep their natural
// ratio (no fixed 16:9 crop), carry their recorded size, and the drawing option is shared by
// both validators, the admin form and the package import.
for (const path of ["src/components/blocks/ImageBlock.tsx", "src/components/blocks/StepsBlock.tsx", "src/components/blocks/BodyImage.tsx"]) {
  forbidMatches(readRequired(path), /aspect-\[16\/9\]|object-cover/, path, "cropped fixed-ratio body image");
}
for (const [path, needle, label] of [
  ["src/components/blocks/BodyImage.tsx", "width={size?.width}", "body image width attribute from the recorded size"],
  ["src/components/blocks/BodyImage.tsx", "80svh", "portrait height cap"],
  ["src/components/blocks/BlockList.tsx", "groupBodyBlocks(", "portrait pairs"],
  [servicePath, "width_px", "public body reads the recorded media size"],
  ["src/features/blocks/schema.ts", "presentation: { kind: 'enum', values: IMAGE_PRESENTATIONS, optional: true }", "client image presentation field"],
  [serverBlocksPath, 'presentation: { kind: "enum", values: ["photo", "drawing"], optional: true }', "server image presentation field"],
  ["src/components/admin/blocks/ImageForm.tsx", "Drawing or document", "admin image presentation choice"],
  ["src/features/blocks/importPackage.ts", "'title', 'presentation']", "package image presentation field"],
  ["docs/content-import/project-package.schema.json", '"presentation"', "package schema image presentation"],
]) {
  requireIncludes(readRequired(path), needle, path, label);
}
forbidMatches(service, /\.from\(['"]project_media['"]\)/, servicePath, "public body read from project_media");
forbidMatches(server, /\.from\(["']project_media["']\)|mediaBlocks:/, functionPath, "Function read or write of the retired media blocks");

// Body block editor (NOW-PROJECT-BLOCKS-001 PR 1B): one shared form per type, an Add block
// panel, collapsible cards with move/duplicate/remove, and points kept on image blocks.
const blockFormDir = "src/components/admin/blocks";
const blockFormPath = `${blockFormDir}/BlockForm.tsx`;
const blockForm = readRequired(blockFormPath);
for (const [type, name] of Object.entries(rendererNames)) {
  const formName = name.replace(/Block$/, "Form");
  const formSource = readRequired(`${blockFormDir}/${formName}.tsx`);
  requireIncludes(blockForm, `case '${type}':`, blockFormPath, `${type} form dispatch`);
  requireIncludes(blockForm, `<${formName} `, blockFormPath, `${formName} form`);
  forbidMatches(formSource, /from ['"][./]*pages\//, `${blockFormDir}/${formName}.tsx`, "shared block form importing a page module");
}
const bodySectionPath = "src/pages/admin/projects/sections/BodySection.tsx";
const bodySection = readRequired(bodySectionPath);
for (const [needle, label] of [
  ["<AddBlockPanel", "Add block panel"],
  ["<BlockForm", "shared block forms"],
  ["duplicateBlock(", "Duplicate block"],
  ["insertBlocks(", "insert at a chosen position"],
  ["hidden={!isOpen}", "collapsed cards stay mounted so pending media survives"],
  ["aria-expanded={isOpen}", "accessible card toggle"],
  ['moveItem("blocks"', "block reordering"],
  ["Mark materials on this image", "material points on image blocks"],
  ["already has its one video", "one video per Project explained in the panel"],
]) {
  requireIncludes(bodySection, needle, bodySectionPath, label);
}
requireIncludes(editor, '{ id: "body", title: "Body" }', editorPath, "Body section in the editor");
forbidMatches(editor, /Page images and video/, editorPath, "retired Page images and video section");
readRequired(`${blockFormDir}/AddBlockPanel.tsx`).includes("CONTENT_BLOCK_DEFINITIONS") ||
  failures.push(`${blockFormDir}/AddBlockPanel.tsx: missing shared block definitions`);

// The block migration is expand-only and never alters or deletes project_media.
forbidMatches(
  blocksMigration,
  /alter\s+table\s+(?:if\s+exists\s+)?public\.project_media\b|drop\s+(?:table|column)[^;]*project_media|delete\s+from\s+public\.project_media|update\s+public\.project_media\b|truncate[^;]*project_media/i,
  blocksMigrationPath,
  "project_media alteration or deletion",
);
forbidMatches(blocksMigration, /\bdrop\s+(?:table|column)\b/i, blocksMigrationPath, "destructive drop in the expand-only migration");
for (const [needle, label] of [
  ["create table public.project_blocks", "project_blocks table"],
  ["alter table public.project_blocks enable row level security", "project_blocks RLS"],
  ["create policy project_blocks_public_select", "published-parent public read policy"],
  ["projects.claim_review_status = 'approved'", "approved-project public boundary"],
  ["revoke all on table public.project_blocks from public, anon, authenticated", "browser DML revoked"],
  ["grant select on table public.project_blocks to anon, authenticated", "browser read-only grant"],
  ["p_draft := private.project_upgrade_draft(p_draft)", "RPC upgrades older drafts"],
  ["legacyProjectMediaId", "copied rows record their source media row"],
  ["project_blocks_check: project_media row count changed", "self-check: project_media unchanged"],
  ["project_blocks_check: a private draft keeps the pre-block shape", "self-check: drafts reshaped"],
  ["project_blocks_check: % project/status groups differ", "self-check: per-project copy counts"],
  ["on public.project_blocks\n  for each statement execute function private.stone_reference_mutex()", "Stone reference mutex on project_blocks"],
  ["execute function private.stone_reference_guard()", "Stone reference guard on project_blocks"],
  ["p_id=any(b.linked_stone_group_ids)", "stone usage includes stone cards"],
]) {
  requireIncludes(blocksMigration, needle, blocksMigrationPath, label);
}
requireIncludes(
  responsiveImage,
  "data-original-src",
  responsiveImagePath,
  "original-image fallback contract",
);
for (const token of [
  "format', 'webp'",
  "resize', 'contain'",
  "widths: [960, 1440, 1920, 2500]",
  "quality: 88",
]) {
  requireIncludes(imageDelivery, token, imageDeliveryPath, "high-quality responsive delivery contract");
}
requireIncludes(
  media,
  "onPendingChange",
  mediaPath,
  "inline pending lifecycle callback",
);
requireIncludes(
  media,
  "onBusyChange",
  mediaPath,
  "inline active-request lifecycle callback",
);
requireMatches(
  media,
  /disabled=\{disabled \|\| isUploading \|\| isUpdatingDescription\}/,
  mediaPath,
  "busy picker lock",
);
forbidMatches(
  media,
  /signedUrl\s*\?\?\s*pendingPreviewUrl/,
  mediaPath,
  "revoked blob URL persisted after upload",
);

for (const table of [
  "project_materials",
  "project_material_maps",
  "project_hotspots",
]) {
  requireIncludes(
    service,
    `.from('${table}')`,
    servicePath,
    `Published ${table} read`,
  );
}
requireIncludes(
  route,
  "export async function onRequest(context)",
  routePath,
  "Cloudflare route handler",
);
requireIncludes(
  route,
  "context.request.method === 'OPTIONS'",
  routePath,
  "OPTIONS handling",
);
requireMatches(route, /['"]GET['"]/, routePath, "GET draft load method");
requireMatches(route, /['"]POST['"]/, routePath, "POST action method");
requireIncludes(
  route,
  "handleAdminProjectsRequest",
  routePath,
  "server handler delegation",
);

for (const contract of [
  "getBearerToken",
  "admin_project_aggregate",
]) {
  requireIncludes(
    server,
    contract,
    functionPath,
    `server contract ${contract}`,
  );
}
// Identity/configuration outcomes are covered by tests/admin-runtime.test.ts.
requireIncludes(
  server,
  "p_expected_actor_role: expectedActorRole",
  functionPath,
  "initial profile role forwarded to the aggregate transaction",
);
requireIncludes(
  server,
  "p_base_updated_at: input.baseUpdatedAt",
  functionPath,
  "canonical token forwarded to the aggregate transaction",
);
requireIncludes(
  server,
  "parseBaseUpdatedAt(body.baseUpdatedAt)",
  functionPath,
  "canonical token request validation",
);
requireIncludes(
  server,
  "baseUpdatedAt: project.updated_at",
  functionPath,
  "canonical-only GET token",
);
requireIncludes(
  server,
  "baseUpdatedAt: saved.baseUpdatedAt",
  functionPath,
  "private-draft GET token",
);
forbidMatches(
  server,
  /VITE_SUPABASE_(?:ANON|PUBLISHABLE)_KEY/,
  functionPath,
  "browser key in server Function",
);
// NOW-PUBLISH-COPY-BUDGET-001: the public copy is a create-only server-side Storage copy
// (no x-upsert header), so an existing destination is never overwritten.
requireMatches(
  server,
  /\.from\(PRIVATE_MEDIA_BUCKET\)\s*\.copy\(sourcePath, destinationPath, \{\s*destinationBucket: PUBLIC_MEDIA_BUCKET,?\s*\}\)/,
  functionPath,
  "create-only server-side public media copy",
);
forbidMatches(
  server,
  /upsert:\s*true|x-upsert/i,
  functionPath,
  "overwriting public media copy",
);
requireMatches(
  server,
  /rollback|compensat|cleanup/i,
  functionPath,
  "Storage compensation path",
);
requireMatches(
  server,
  /if\s*\(actor\.profile\.role\s*===\s*['"]viewer['"]\)[\s\S]{0,240}?parsePostInput/,
  functionPath,
  "Viewer POST rejection before body parsing",
);
requireMatches(
  migration,
  /v_actor_role\s*=\s*['"]viewer['"]\s+and\s+p_action\s+not\s+in\s*\(\s*['"]list['"]\s*,\s*['"]get['"]\s*\)/i,
  migrationPath,
  "Viewer read-only RPC boundary",
);
requireIncludes(
  migration,
  "get_archived_project_slugs",
  migrationPath,
  "archived Project tombstone RPC",
);
requireIncludes(
  tombstoneMigration,
  "get_archived_project_slugs",
  tombstoneMigrationPath,
  "replacement archived Project tombstone RPC",
);
requireIncludes(
  tombstoneMigration,
  "static_fallback_slugs",
  tombstoneMigrationPath,
  "known public fallback allowlist",
);
requireMatches(
  tombstoneMigration,
  /select\s+fallback\.slug/i,
  tombstoneMigrationPath,
  "allowlisted tombstone output",
);
requireMatches(
  tombstoneMigration,
  /from public\.projects[\s\S]+projects\.status = 'archived'/i,
  tombstoneMigrationPath,
  "archived canonical Project intersection",
);
forbidMatches(
  tombstoneMigration,
  /private\.project_drafts/i,
  tombstoneMigrationPath,
  "private draft read in public tombstone endpoint",
);
const expectedTombstoneSlugs = staticProjectFixtures
  .map((project) => project.slug)
  .sort();
const migrationTombstoneSlugs = [
  ...tombstoneMigration.matchAll(/\('([^']+)'::text\)/g),
]
  .map((match) => match[1])
  .sort();
if (
  JSON.stringify(migrationTombstoneSlugs) !==
  JSON.stringify(expectedTombstoneSlugs)
) {
  failures.push(
    `${tombstoneMigrationPath}: tombstone allowlist must exactly match bundled public Project slugs`,
  );
}
requireIncludes(
  service,
  "staticProjectSlugs.has(canonicalSlug)",
  servicePath,
  "client-side tombstone allowlist defence",
);

// Security and integrity properties of admin_project_aggregate. The original definition and the
// NOW-PROJECT-BLOCKS-001 replacement (the live one after that migration) must both satisfy them.
function checkAggregateRpcSource(migration, migrationPath, original) {
  for (const contract of [
    ...(original
      ? [
          "create table private.project_drafts",
          "revision bigint",
          "base_updated_at",
          "alter table public.project_facts",
          "alter table public.project_materials",
        ]
      : []),
    "admin_project_aggregate",
    "p_action not in ('list', 'get', 'save', 'publish', 'archive')",
    "p_base_revision",
    "p_base_updated_at",
    "p_expected_actor_role",
    "p_promotions",
    "security definer",
    "set search_path = ''",
    "admin_audit_events",
    "revoke execute",
    "service_role",
  ]) {
    requireIncludes(
      migration.toLowerCase(),
      contract.toLowerCase(),
      migrationPath,
      `migration contract ${contract}`,
    );
  }
  requireMatches(
    migration,
    /from public\.admin_profiles profiles[\s\S]{0,260}limit\s+1\s+for share;/i,
    migrationPath,
    "transaction-held active profile role lock",
  );
  requireMatches(
    migration,
    /v_actor_role\s+is\s+distinct\s+from\s+p_expected_actor_role[\s\S]{0,420}actor_role_changed[\s\S]{0,420}['"]headers['"]\s*,\s*jsonb_build_object\(\)/i,
    migrationPath,
    "fail-closed actor role consistency check",
  );
  requireMatches(
    migration,
    /admin_project_aggregate\(text, bigint, bigint, timestamptz, jsonb, uuid, text, jsonb\)[\s\S]{0,420}service_role;/i,
    migrationPath,
    "service-role-only expected-role RPC signature",
  );
  requireMatches(
    migration,
    /if v_project_exists[\s\S]{0,180}p_base_updated_at is null[\s\S]{0,120}p_base_updated_at is distinct from v_project\.updated_at[\s\S]{0,260}revision_conflict/i,
    migrationPath,
    "existing canonical first-adoption mismatch and null rejection",
  );
  requireMatches(
    migration,
    /if v_draft_exists[\s\S]{0,100}p_base_updated_at is distinct from v_saved_draft\.base_updated_at[\s\S]{0,260}revision_conflict/i,
    migrationPath,
    "private-draft canonical baseline token consistency",
  );
  requireMatches(
    migration,
    /p_action not in \(['"]save['"], ['"]publish['"]\)[\s\S]{0,100}p_base_revision <> 0[\s\S]{0,100}p_base_updated_at is not null/i,
    migrationPath,
    "new Project null canonical token boundary",
  );
  const baseTokenResponseCount = (
    migration.match(/['"]baseUpdatedAt['"]/g) ?? []
  ).length;
  if (baseTokenResponseCount < 4) {
    failures.push(
      `${migrationPath}: GET, Save, Publish, and Archive must return the canonical base token`,
    );
  }
  requireMatches(
    migration,
    /p_action\s+in\s*\(\s*['"]publish['"]\s*,\s*['"]archive['"]\s*\)[\s\S]{0,220}v_saved_draft\.base_updated_at\s+is\s+distinct\s+from\s+v_project\.updated_at/i,
    migrationPath,
    "publish-and-archive canonical revision conflict boundary",
  );
  requireMatches(
    migration,
    /select projects\.\* into v_project[\s\S]{0,180}where projects\.id = v_project_id[\s\S]{0,40}for update;/i,
    migrationPath,
    "canonical Project lock before revision comparison",
  );
  const canonicalConflictPosition = migration.indexOf(
    "v_saved_draft.base_updated_at is distinct from v_project.updated_at",
  );
  const canonicalLockPosition = migration.indexOf(
    "select projects.* into v_project",
  );
  const firstAdoptionConflictPosition = migration.indexOf(
    "if v_project_exists\n     and (\n       p_base_updated_at is null",
  );
  const firstDraftWritePosition = migration.indexOf("if p_action = 'save' then");
  const archiveMutationPosition = migration.indexOf("if p_action = 'archive' then");
  if (
    canonicalLockPosition < 0 ||
    firstAdoptionConflictPosition < 0 ||
    firstDraftWritePosition < 0 ||
    canonicalConflictPosition < 0 ||
    archiveMutationPosition < 0 ||
    canonicalLockPosition > firstAdoptionConflictPosition ||
    firstAdoptionConflictPosition > firstDraftWritePosition ||
    canonicalLockPosition > canonicalConflictPosition ||
    canonicalConflictPosition > archiveMutationPosition
  ) {
    failures.push(
      `${migrationPath}: locked canonical revision check must precede every archive mutation`,
    );
  }
  forbidMatches(
    migration,
    /delete\s+from\s+public\.project_(?:facts|materials|media|material_maps|hotspots)/i,
    migrationPath,
    "destructive child deletion",
  );
  requireMatches(
    migration,
    /p_action\s+not\s+in\s*\(\s*['"]save['"]\s*,\s*['"]publish['"]\s*\)/i,
    migrationPath,
    "new-project direct publish from revision zero",
  );
  requireMatches(
    migration,
    /publish[\s\S]{0,900}?jsonb_set\(\s*jsonb_set\(p_draft/i,
    migrationPath,
    "publish consumes the current request draft",
  );
  requireIncludes(
    migration,
    "v_item->>'claimStatus'",
    migrationPath,
    "per-child claim decisions",
  );
  requireIncludes(
    migration,
    "v_map_media_id",
    migrationPath,
    "hotspot block map-image normalization",
  );
  forbidMatches(
    migration,
    /claim_status\s*=\s*v_claim_status/i,
    migrationPath,
    "project claim status copied onto child rows",
  );
  forbidMatches(
    migration,
    /->>\s*'hotspotKey'/i,
    migrationPath,
    "non-contract hotspotKey field",
  );
  requireMatches(
    migration,
    /from public\.stone_groups[\s\S]{0,180}status\s*=\s*['"]published['"][\s\S]{0,80}for share/i,
    migrationPath,
    "transaction-local published stone lock",
  );
  forbidMatches(
    migration,
    /drop policy if exists projects_admin_insert/i,
    migrationPath,
    "contract-phase policy drop in additive migration",
  );
  forbidMatches(
    migration,
    /revoke insert, update, delete/i,
    migrationPath,
    "contract-phase table revoke in additive migration",
  );
  requireMatches(
    migration,
    /from public\.finish_definitions[\s\S]{0,180}status\s*=\s*['"]published['"][\s\S]{0,80}for share/i,
    migrationPath,
    "transaction-local published finish lock",
  );
  const pgrstBlocks = [
    ...migration.matchAll(
      /raise sqlstate 'PGRST' using[\s\S]*?detail\s*=\s*(jsonb_build_object\([^;]+\))::text;/gi,
    ),
  ];
  const pgrstRaiseCount = (migration.match(/raise sqlstate 'PGRST'/gi) || [])
    .length;
  if (!pgrstBlocks.length || pgrstBlocks.length !== pgrstRaiseCount) {
    failures.push(
      `${migrationPath}: every custom PGRST raise must have a structured detail object`,
    );
  }
  pgrstBlocks.forEach((match, index) => {
    if (!/['"]headers['"]\s*,\s*jsonb_build_object\(\)/i.test(match[1])) {
      failures.push(
        `${migrationPath}: PGRST response ${index + 1} is missing an empty headers object`,
      );
    }
  });

  const pgrstRaiseSegments = migration
    .split(/raise\s+sqlstate\s+['"]PGRST['"]\s+using/i)
    .slice(1)
    .map((segment) => segment.split(";", 1)[0]);
  for (const [index, segment] of pgrstRaiseSegments.entries()) {
    if (!/['"]headers['"]\s*,\s*jsonb?_build_object\s*\(\s*\)/i.test(segment)) {
      failures.push(
        `${migrationPath}: PGRST raise ${index + 1} is missing the required headers object`,
      );
    }
  }
}
checkAggregateRpcSource(migration, migrationPath, true);
checkAggregateRpcSource(blocksMigration, blocksMigrationPath, false);
requireIncludes(
  server,
  "normalizeAutomaticClaimStatuses",
  functionPath,
  "automatic compatibility claim normalization",
);
forbidMatches(
  server,
  /claim_review_forbidden|Finish the project proof review|Finish the proof review/,
  functionPath,
  "claim approval publish gate",
);
requireIncludes(
  server,
  "validateSortOrder",
  functionPath,
  "draft integer validation",
);
requireIncludes(
  server,
  "mapRpcError(error, status)",
  functionPath,
  "PostgREST HTTP status error mapping",
);
requireIncludes(
  server,
  "crypto.randomUUID()",
  functionPath,
  "request-owned Storage destination nonce",
);
requireIncludes(
  server,
  "MAX_PROJECT_IMAGE_BYTES = 10 * 1024 * 1024",
  functionPath,
  "10 MiB server image limit",
);
requireIncludes(
  server,
  "MAX_PROJECT_MEDIA_ASSETS = 50",
  functionPath,
  "aggregate image count budget",
);
requireIncludes(
  server,
  "MAX_PROJECT_MEDIA_TOTAL_BYTES = 100 * 1024 * 1024",
  functionPath,
  "aggregate byte budget",
);
// The bytes no longer pass through the Function, so the magic-byte sniff is replaced by
// the stored content type: declared type before the copy, stored type of the copy after.
requireMatches(
  server,
  /declaredMime !== null && !PROJECT_IMAGE_MIME_TYPES\.has\(declaredMime\)/,
  functionPath,
  "declared image type check before copying",
);
requireMatches(
  server,
  /!PROJECT_IMAGE_MIME_TYPES\.has\(storedMime\)[\s\S]{0,400}storedMime !== copy\.declaredMime/,
  functionPath,
  "stored copy type must be a supported image and equal the declared type",
);
requireMatches(
  server,
  /storedBytes !== copy\.declaredBytes/,
  functionPath,
  "stored copy size must equal the declared size",
);
requireMatches(
  server,
  /storedBytes > MAX_PROJECT_IMAGE_BYTES/,
  functionPath,
  "stored copy per-image size limit",
);
requireMatches(
  server,
  /storedBytesTotal > MAX_PROJECT_MEDIA_TOTAL_BYTES/,
  functionPath,
  "stored copy total size limit",
);
requireMatches(
  server,
  /\.from\(PUBLIC_MEDIA_BUCKET\)\s*\.list\(destinationFolder,/,
  functionPath,
  "single nonce-folder listing verifies every copy",
);
forbidMatches(
  server,
  /\.download\(|\.upload\(|digestBlob/,
  functionPath,
  "image bytes passing through the Projects Function",
);
// Subrequest budget: a named constant derived from the platform limit, checked before
// any Storage write.
requireIncludes(
  server,
  "const FUNCTION_SUBREQUEST_LIMIT = 50;",
  functionPath,
  "Cloudflare subrequest limit constant",
);
requireIncludes(
  server,
  "const PUBLISH_FIXED_SUBREQUESTS = 15;",
  functionPath,
  "worst-case fixed Publish subrequests",
);
requireMatches(
  server,
  /PUBLISH_STORAGE_COPY_BUDGET =\s*FUNCTION_SUBREQUEST_LIMIT - PUBLISH_FIXED_SUBREQUESTS - PUBLISH_SUBREQUEST_MARGIN/,
  functionPath,
  "derived storage copy budget",
);
requireMatches(
  server,
  /assertPublishableMedia\(media\);\s*assertPublishCopyBudget\(media\);[\s\S]{0,400}publishAggregate\(/,
  functionPath,
  "pre-flight copy budget before Publish writes",
);
requireMatches(
  server,
  /ownership:\s*["']ambiguous["']/,
  functionPath,
  "pre-upload ambiguous ownership registration",
);
requireMatches(
  server,
  /attemptedCopy\.ownership\s*=\s*["']not_owned["']/,
  functionPath,
  "definite conflict ownership withdrawal",
);
const attemptedRegistrationPosition = server.indexOf(
  "newlyCreated.push(attemptedCopy)",
);
const publicUploadPosition = server.indexOf(
  "const copy = await supabase.storage",
);
if (
  attemptedRegistrationPosition < 0 ||
  publicUploadPosition < 0 ||
  attemptedRegistrationPosition > publicUploadPosition
) {
  failures.push(
    `${functionPath}: attempted destination must be registered before Storage copy`,
  );
}
requireIncludes(
  server,
  "return `${destinationPrefix}/${nonce}`;",
  functionPath,
  "nonce-scoped public destination folder",
);
requireIncludes(
  server,
  "return `${destinationFolder}/${asset.id}-${version}-${fileName}`;",
  functionPath,
  "media- and version-bound public destination name",
);
requireIncludes(
  server,
  "cleanupPublishedPrivateSources",
  functionPath,
  "post-publish private media cleanup",
);
requireIncludes(
  server,
  "project.aggregate.media_cleanup",
  functionPath,
  "private media cleanup audit",
);
requireIncludes(
  server,
  "Canonical publish has committed",
  functionPath,
  "non-rollback post-publish cleanup boundary",
);
requireMatches(
  server,
  /\.eq\(['"]bucket['"],\s*PRIVATE_MEDIA_BUCKET\)[\s\S]{0,160}\.in\(['"]object_path['"],\s*sourcePaths\)/,
  functionPath,
  "reference-aware batched private source cleanup",
);
requireMatches(
  server,
  /\.eq\(['"]bucket['"],\s*PUBLIC_MEDIA_BUCKET\)[\s\S]{0,160}\.in\(['"]object_path['"],\s*paths\)/,
  functionPath,
  "reference-aware batched public copy compensation",
);
// Cleanup and compensation cost must not grow with the number of images: no awaited call
// inside any loop of either function.
function functionBody(source, signature) {
  const start = source.indexOf(signature);
  if (start < 0) return "";
  let depth = 0;
  for (let index = source.indexOf("{", source.indexOf(")", start)); index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}" && --depth === 0) return source.slice(start, index + 1);
  }
  return "";
}
function loopBodies(body) {
  const loops = [];
  for (const match of body.matchAll(/\b(?:for|while)\s*\(/g)) {
    let depth = 0;
    let index = match.index;
    for (; index < body.length; index += 1) {
      if (body[index] === "(") depth += 1;
      if (body[index] === ")" && --depth === 0) break;
    }
    const rest = body.slice(index + 1);
    const statement = rest.trimStart().startsWith("{")
      ? functionBody(rest, "")
      : rest.slice(0, rest.indexOf(";") + 1);
    loops.push(statement);
  }
  return loops;
}
for (const signature of [
  "async function cleanupPublishedPrivateSources(",
  "export async function compensatePublicCopies(",
]) {
  const body = functionBody(server, signature);
  if (!body) failures.push(`${functionPath}: missing ${signature}`);
  if ((body.match(/await supabase/g) || []).length !== 2) {
    failures.push(`${functionPath}: ${signature} must make exactly one reference query and one removal`);
  }
  if (loopBodies(body).some((loop) => /\bawait\b/.test(loop))) {
    failures.push(`${functionPath}: ${signature} must not make per-image subrequests`);
  }
}
// The editor and the import dialog warn about the copy budget before Publish, using one
// shared constant (mirrored by the Function; tests/publish-budget.test.ts asserts equality).
{
  const budgetPath = "src/features/blocks/publishBudget.ts";
  const budget = readRequired(budgetPath);
  requireIncludes(budget, "export const PUBLISH_NEW_IMAGE_BUDGET = 30;", budgetPath, "shared publish image budget");
  const dialogPath = "src/pages/admin/projects/ImportProjectDialog.tsx";
  const dialog = readRequired(dialogPath);
  requireMatches(dialog, />\s*PUBLISH_NEW_IMAGE_BUDGET[\s\S]{0,160}packagePublishBudgetMessage\(/, dialogPath, "import review copy-budget warning");
  const aggregatePath = "src/features/projects/projectAggregate.ts";
  const aggregate = readRequired(aggregatePath);
  requireMatches(aggregate, /newImageCount > PUBLISH_NEW_IMAGE_BUDGET[\s\S]{0,160}projectPublishBudgetMessage\(newImageCount\)/, aggregatePath, "editor publish note for the copy budget");
  forbidMatches(dialog + aggregate, /\b30 new images\b/, `${dialogPath} / ${aggregatePath}`, "hard-coded publish image budget in editor copy");
}
// The audit record precedes cleanup work, so it survives a request that runs out of
// subrequests while cleaning up.
const cleanupBody = server.slice(server.indexOf("async function cleanupPublishedPrivateSources("));
if (
  !/phase: "planned"[\s\S]*?\.from\("media_assets"\)/.test(cleanupBody.slice(0, cleanupBody.indexOf("export async function prepareMediaPromotions(")))
) {
  failures.push(`${functionPath}: the media_cleanup audit must be recorded before the cleanup reference query`);
}
const compensationBody = server.slice(server.indexOf("} catch (error) {\n    if (!newlyCreated.length) throw error;"));
if (
  compensationBody.indexOf('phase: "planned"') < 0 ||
  compensationBody.indexOf("compensatePublicCopies(supabase, newlyCreated)") < 0 ||
  compensationBody.indexOf('phase: "planned"') > compensationBody.indexOf("compensatePublicCopies(supabase, newlyCreated)")
) {
  failures.push(`${functionPath}: the publish_compensation audit must be recorded before compensation`);
}

for (const table of [
  "projects",
  "project_facts",
  "project_materials",
  "project_material_maps",
  "project_media",
  "project_hotspots",
]) {
  for (const operation of ["insert", "update", "delete"]) {
    requireIncludes(
      lockdownMigration,
      `drop policy if exists ${table}_admin_${operation}`,
      lockdownMigrationPath,
      `${table} legacy ${operation} policy removal`,
    );
  }
}
requireMatches(
  lockdownMigration,
  /revoke insert, update, delete, truncate, references, trigger on table[\s\S]+from authenticated;/i,
  lockdownMigrationPath,
  "full non-SELECT Project table privilege revoke",
);
requireMatches(
  lockdownMigration,
  /revoke all privileges on sequence[\s\S]+projects_id_seq[\s\S]+project_hotspots_id_seq[\s\S]+from authenticated;/i,
  lockdownMigrationPath,
  "Project identity-sequence revoke",
);
for (const policy of [
  "projects_public_select",
  "project_facts_public_select",
  "project_materials_public_select",
  "project_media_public_select",
  "project_material_maps_public_select",
  "project_hotspots_public_select",
]) {
  requireIncludes(
    lockdownMigration,
    `create policy ${policy}`,
    lockdownMigrationPath,
    `${policy} hardening`,
  );
}
requireMatches(
  lockdownMigration,
  /project_hotspots_public_select[\s\S]+materials\.claim_status = 'approved'/i,
  lockdownMigrationPath,
  "hotspot material approval public boundary",
);
requireIncludes(
  lockdownMigration,
  "notify pgrst, 'reload schema'",
  lockdownMigrationPath,
  "contract schema reload",
);
// NOW-PROJECT-IMPORT-001: Project package import. Browser-only (no new endpoint), one shared
// private upload, three single-step dialog stages, editors and above only, and the zip reader
// loaded on demand so it never reaches the public entry.
{
  const importDialogPath = "src/pages/admin/projects/ImportProjectDialog.tsx";
  const importPackagePath = "src/features/blocks/importPackage.ts";
  const importZipPath = "src/features/blocks/importZip.ts";
  const uploadPath = "src/pages/admin/media/uploadPickerFile.ts";
  const pickerPath = "src/pages/admin/media/AdminMediaPicker.tsx";
  const dialog = readRequired(importDialogPath);
  const importPackage = readRequired(importPackagePath);
  const importZip = readRequired(importZipPath);
  const upload = readRequired(uploadPath);
  const picker = readRequired(pickerPath);
  requireMatches(page, /\{canEdit \? \(\s*<button[\s\S]{0,600}Import package/, pagePath, "Import package entry shown to owner/admin/editor only");
  requireIncludes(page, "<ImportProjectDialog", pagePath, "package import dialog");
  requireMatches(page, /action: "save",\s*projectId: null,\s*baseRevision: 0/, pagePath, "import saves one new Draft through the Projects Save action");
  requireIncludes(page, "existingSlugs={[", pagePath, "import slug conflicts include every existing project address");
  for (const step of ['step === "choose"', 'step === "review"', 'step === "importing"']) {
    requireIncludes(dialog, step, importDialogPath, `one-at-a-time ${step} stage`);
  }
  for (const label of ["Choose file", "Package format", "Create draft", "Retry", "Skip this image", "Saving draft"]) {
    requireIncludes(dialog, label, importDialogPath, `"${label}" control or status`);
  }
  requireIncludes(dialog, "Imported as a draft. Review each block, add any missing images, then Publish.", importDialogPath, "post-import editor notice");
  requireMatches(dialog, /action:\s*"project\.import"/, importDialogPath, "project.import audit event");
  requireIncludes(dialog, "reportError(", importDialogPath, "errors through the admin translation layer");
  requireIncludes(dialog, 'preparePickerUpload(new File([blob], name, { type: blob.type }), "original")', importDialogPath, "Projects original-upload policy");
  requireIncludes(dialog, "uploadPickerFile(", importDialogPath, "shared private upload");
  requireIncludes(picker, "uploadPickerFile(", pickerPath, "shared private upload");
  forbidMatches(dialog + picker, /\.storage\s*\.from\([^)]*\)\s*\.upload\(/, importDialogPath, "a second copy of the private upload");
  requireMatches(upload, /\.upload\(objectPath, uploadFile, \{[\s\S]{0,120}upsert: false/, uploadPath, "create-only private upload");
  const dialogCopy = dialog.replace(/^import[^;]*;$/gm, "").replace(/\$\{[^}]*\}/g, "");
  forbidMatches(dialogCopy, /(?:>|["'`])[^<"'`{}]*\b(?:bucket|schema|database|table|storage|slug|endpoint)\b/i, importDialogPath, "implementation words in editor-facing import copy");
  forbidMatches(dialog + importPackage, /fetch\(\s*["'`]\/api\//, importDialogPath, "a new import endpoint");
  requireIncludes(importPackage, "validateContentBlock(", importPackagePath, "block content validated by the shared schema");
  requireIncludes(importPackage, "hotspot_image", importPackagePath, "image-with-points blocks refused");
  requireIncludes(importZip, "await import('fflate')", importZipPath, "zip reader loaded on demand");
  for (const [path, text] of [
    [pagePath, page],
    [importDialogPath, dialog],
    [importPackagePath, importPackage],
    [importZipPath, importZip],
    [uploadPath, upload],
  ]) {
    forbidMatches(text, /^import[^;]*from\s*["']fflate["']/m, path, "static fflate import");
  }
  requireMatches(readRequired("vite.config.ts"), /node_modules\/fflate\/[\s\S]{0,40}return 'fflate'/, "vite.config.ts", "separate on-demand fflate chunk");
  requireMatches(readRequired("scripts/check-admin-config-gate.mjs"), /assertPublicEntryBoundary\(/, "scripts/check-admin-config-gate.mjs", "public entry boundary that excludes fflate");
}

if (
  !argv.includes("--source-only") &&
  runVitest(["tests/admin-projects-aggregate.test.ts"]) !== 0
) {
  failures.push("Projects aggregate behaviour tests failed (tests/admin-projects-aggregate.test.ts).");
}

if (failures.length > 0) {
  console.error("Admin Projects aggregate checks failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  exit(1);
}

console.log("Admin Projects aggregate checks passed.");
console.log(
  "Verified aggregate mapping behavior, one endpoint, shared live preview, visual hotspots, inline media, server audit, and migration-source security boundaries.",
);
