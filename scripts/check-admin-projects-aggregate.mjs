#!/usr/bin/env node
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { exit } from "node:process";
import {
  collectProjectMediaAssetIds,
  createEmptyProjectAggregateDraft,
  draftToProjectData,
  getProjectPublishBlockers,
  mergeProjectMediaOptions,
  moveProjectDraftItem,
  normalizeProjectDraftForSave,
} from "../src/features/projects/projectAggregate.ts";
import { projects as staticProjectFixtures } from "../src/data/projectData.ts";
import {
  assertPublishDraft,
  assertPublishableMedia,
  mapRpcError,
  normalizeAutomaticClaimStatuses,
  summarizePublishCompensation,
  validateDraftShape,
} from "../functions/_lib/admin-projects.js";
import { isProjectApiResponse } from "../src/features/projects/projectApiContract.ts";
import {
  adminProjectsOptionsResponse,
  handleAdminProjectsRequest,
} from "../functions/_lib/admin-projects.js";

const root = resolve(import.meta.dirname, "..");
const failures = [];

// Supabase initializes its Realtime client even though this source verifier
// never opens a socket. Node 20 has no native WebSocket global, so provide a
// deliberately unusable test-only constructor: accidental realtime use still
// fails, while the mocked Auth/REST handler path remains runnable in the gate.
if (typeof globalThis.WebSocket === "undefined") {
  globalThis.WebSocket = class TestOnlyWebSocket {
    constructor() {
      throw new Error("Admin Projects source checks do not permit WebSocket use.");
    }
  };
}

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

async function withAdminProjectsFetchMock(mock, run) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const call = {
      url: input instanceof Request ? input.url : String(input),
      method: init.method || (input instanceof Request ? input.method : "GET"),
      body: init.body,
    };
    calls.push(call);
    return mock(call, calls);
  };

  try {
    return await run(calls);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

const mockAdminUserId = "11111111-1111-4111-8111-111111111111";
const mockAdminEnvironment = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
};

function mockAdminIdentity(call) {
  const url = new URL(call.url);
  if (url.pathname === "/auth/v1/user") {
    return Response.json(
      { id: mockAdminUserId, email: "owner@example.test" },
      { status: 200 },
    );
  }
  if (url.pathname === "/rest/v1/admin_profiles") {
    return Response.json([{ role: "owner", is_active: true }], {
      status: 200,
    });
  }
  return null;
}

function adminProjectMutationRequest(body) {
  return new Request("https://example.test/api/admin/projects", {
    method: "POST",
    headers: {
      Authorization: "Bearer test-token",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function revisionConflictResponse(message) {
  return Response.json(
    {
      code: "PGRST",
      message: JSON.stringify({ code: "revision_conflict", message }),
      details: JSON.stringify({
        status: 409,
        status_text: "Conflict",
        headers: {},
      }),
      hint: null,
    },
    { status: 409 },
  );
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

const page = readRequired(pagePath);
const shell = readRequired(shellPath);
const aggregate = readRequired(aggregatePath);
const apiContract = readRequired(apiContractPath);
const editor = readRequired(editorPath);
const preview = readRequired(previewPath);
const media = readRequired(mediaPath);
const hotspot = readRequired(hotspotPath);
const publicView = readRequired(publicViewPath);
const publicRoute = readRequired(publicRoutePath);
const service = readRequired(servicePath);
const route = readRequired(routePath);
const server = readRequired(functionPath);
const migration = readRequired(migrationPath);
const tombstoneMigration = readRequired(tombstoneMigrationPath);
const lockdownMigration = readRequired(lockdownMigrationPath);
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
  "project:",
  "facts:",
  "materials:",
  "maps:",
  "mediaBlocks:",
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
requireIncludes(
  editor,
  "key={`map-${selectedMap.key}`}",
  editorPath,
  "stable selected-map media identity",
);
requireIncludes(
  editor,
  "key={`hotspot-${selectedHotspot.key}`}",
  editorPath,
  "stable selected-hotspot media identity",
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
  /source:\s*['"]project_inline['"]/,
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
  /Inline project media upload audit failed/,
  mediaPath,
  "raw upload audit error logging",
);
requireMatches(
  media,
  /Inline project media description audit failed/,
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
  "SUPABASE_SERVICE_ROLE_KEY",
  "getBearerToken",
  "supabase.auth.getUser",
  "admin_project_aggregate",
]) {
  requireIncludes(
    server,
    contract,
    functionPath,
    `server contract ${contract}`,
  );
}
requireMatches(
  server,
  /\.from\(["']admin_profiles["']\)/,
  functionPath,
  "server admin profile lookup",
);
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
requireMatches(
  server,
  /upsert:\s*false/,
  functionPath,
  "create-only public media copy",
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

for (const contract of [
  "create table private.project_drafts",
  "revision bigint",
  "base_updated_at",
  "alter table public.project_facts",
  "alter table public.project_materials",
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
requireIncludes(
  server,
  "isSupportedImageBlob",
  functionPath,
  "downloaded image signature validation",
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
  "const upload = await supabase.storage",
);
if (
  attemptedRegistrationPosition < 0 ||
  publicUploadPosition < 0 ||
  attemptedRegistrationPosition > publicUploadPosition
) {
  failures.push(
    `${functionPath}: attempted destination must be registered before Storage upload`,
  );
}
requireIncludes(
  server,
  "${nonce}-${fileName}",
  functionPath,
  "nonce-bound public destination path",
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
  /\.eq\(['"]bucket['"],\s*PRIVATE_MEDIA_BUCKET\)[\s\S]{0,160}\.eq\(['"]object_path['"],\s*source\.sourcePath\)/,
  functionPath,
  "reference-aware private source cleanup",
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

const unauthenticatedGet = await handleAdminProjectsRequest(
  new Request("https://example.test/api/admin/projects", { method: "GET" }),
  {},
);
assert.equal(
  unauthenticatedGet.status,
  401,
  "Unauthenticated GET must fail before environment or database work",
);
assert.equal((await unauthenticatedGet.json()).error, "missing_session");

const unauthenticatedMalformedPost = await handleAdminProjectsRequest(
  new Request("https://example.test/api/admin/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  }),
  {},
);
assert.equal(
  unauthenticatedMalformedPost.status,
  401,
  "Unauthenticated POST must fail before reading malformed JSON",
);
assert.equal(
  (await unauthenticatedMalformedPost.json()).error,
  "missing_session",
);

const conflictDraft = createEmptyProjectAggregateDraft();
Object.assign(conflictDraft.project, {
  id: 12,
  title: "Conflict proof",
  slug: "conflict-proof",
});
await withAdminProjectsFetchMock(
  (call) => {
    const identityResponse = mockAdminIdentity(call);
    if (identityResponse) return identityResponse;
    if (new URL(call.url).pathname === "/rest/v1/rpc/admin_project_aggregate") {
      return revisionConflictResponse("Reload before saving.");
    }
    throw new Error(`Unexpected mocked Projects request: ${call.method} ${call.url}`);
  },
  async (calls) => {
    const response = await handleAdminProjectsRequest(
      adminProjectMutationRequest({
        action: "save",
        projectId: 12,
        baseRevision: 1,
        baseUpdatedAt: "2026-07-19T00:00:00.000000+00:00",
        draft: conflictDraft,
      }),
      mockAdminEnvironment,
    );
    const body = await response.json();
    assert.equal(
      response.status,
      409,
      `Stale Save response: ${JSON.stringify(body)}; calls: ${JSON.stringify(calls)}`,
    );
    assert.equal(body.error, "revision_conflict");
    assert.equal(body.message, "Reload before saving.");
    assert.equal(
      calls.filter(
        (call) =>
          new URL(call.url).pathname ===
          "/rest/v1/rpc/admin_project_aggregate",
      ).length,
      1,
      "A stale Save must issue one aggregate RPC and preserve its revision-conflict response",
    );
  },
);

const compensationDraft = createEmptyProjectAggregateDraft();
Object.assign(compensationDraft.project, {
  id: 12,
  title: "Publish compensation proof",
  slug: "publish-compensation-proof",
  summary: "A local mocked publish compensation proof.",
  claimReviewStatus: "approved",
  heroMediaId: 7,
  coverMediaId: 7,
});
const compensationSourceBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
const compensationSourceBlob = new Blob([compensationSourceBytes], {
  type: "image/jpeg",
});
const compensationMediaRow = {
  id: 7,
  status: "draft",
  bucket: "urblo-admin-media",
  object_path: "project-editor/compensation-proof.jpg",
  source_url: null,
  source_kind: "storage",
  media_type: "image",
  mime_type: "image/jpeg",
  size_bytes: compensationSourceBlob.size,
  alt: "Mocked compensation proof image",
  updated_at: "2026-07-19T00:00:00.000000+00:00",
};

await withAdminProjectsFetchMock(
  (call) => {
    const identityResponse = mockAdminIdentity(call);
    if (identityResponse) return identityResponse;

    const url = new URL(call.url);
    if (
      url.pathname === "/rest/v1/media_assets" &&
      url.searchParams.get("select")?.startsWith("id,status")
    ) {
      return Response.json([compensationMediaRow], { status: 200 });
    }
    if (
      url.pathname ===
        "/storage/v1/object/urblo-admin-media/project-editor/compensation-proof.jpg" &&
      call.method === "GET"
    ) {
      return new Response(compensationSourceBlob, {
        status: 200,
        headers: { "Content-Type": "image/jpeg" },
      });
    }
    if (
      url.pathname.startsWith(
        "/storage/v1/object/urblo-public-media/project-assets/7/",
      ) &&
      call.method === "POST"
    ) {
      return Response.json({ Key: url.pathname }, { status: 200 });
    }
    if (
      url.pathname.startsWith(
        "/storage/v1/object/urblo-public-media/project-assets/7/",
      ) &&
      call.method === "GET"
    ) {
      return new Response(compensationSourceBlob, {
        status: 200,
        headers: { "Content-Type": "image/jpeg" },
      });
    }
    if (url.pathname === "/rest/v1/rpc/admin_project_aggregate") {
      return revisionConflictResponse("Reload before publishing.");
    }
    if (
      url.pathname === "/rest/v1/media_assets" &&
      url.searchParams.get("select") === "id"
    ) {
      return Response.json([], { status: 200 });
    }
    if (
      url.pathname === "/storage/v1/object/urblo-public-media" &&
      call.method === "DELETE"
    ) {
      return Response.json([], { status: 200 });
    }
    if (
      url.pathname === "/rest/v1/admin_audit_events" &&
      call.method === "POST"
    ) {
      return new Response(null, { status: 201 });
    }
    throw new Error(`Unexpected mocked Projects request: ${call.method} ${call.url}`);
  },
  async (calls) => {
    const response = await handleAdminProjectsRequest(
      adminProjectMutationRequest({
        action: "publish",
        projectId: 12,
        baseRevision: 1,
        baseUpdatedAt: "2026-07-19T00:00:00.000000+00:00",
        draft: compensationDraft,
      }),
      mockAdminEnvironment,
    );
    const body = await response.json();
    assert.equal(response.status, 409);
    assert.equal(body.error, "revision_conflict");
    assert.deepEqual(body.cleanup, {
      removedCount: 1,
      retainedCount: 0,
      auditRecorded: true,
    });

    const publicUpload = calls.find(
      (call) =>
        call.method === "POST" &&
        new URL(call.url).pathname.startsWith(
          "/storage/v1/object/urblo-public-media/project-assets/7/",
        ),
    );
    const aggregateRpc = calls.find(
      (call) =>
        new URL(call.url).pathname ===
        "/rest/v1/rpc/admin_project_aggregate",
    );
    const publicRemoval = calls.find(
      (call) =>
        call.method === "DELETE" &&
        new URL(call.url).pathname ===
          "/storage/v1/object/urblo-public-media",
    );
    const compensationAudit = calls.find(
      (call) =>
        call.method === "POST" &&
        new URL(call.url).pathname === "/rest/v1/admin_audit_events",
    );
    assert.ok(publicUpload, "Publish must create the mocked public copy first");
    assert.ok(aggregateRpc, "Publish must call the aggregate RPC");
    assert.ok(publicRemoval, "A failed RPC must remove its mocked public copy");
    assert.ok(
      compensationAudit,
      "A failed publish must record its mocked compensation audit",
    );
    assert.ok(calls.indexOf(publicUpload) < calls.indexOf(aggregateRpc));
    assert.ok(calls.indexOf(aggregateRpc) < calls.indexOf(publicRemoval));
    assert.ok(calls.indexOf(publicRemoval) < calls.indexOf(compensationAudit));

    const publicPathPrefix =
      "/storage/v1/object/urblo-public-media/";
    const uploadedPath = decodeURIComponent(
      new URL(publicUpload.url).pathname.slice(publicPathPrefix.length),
    );
    const removalBody = JSON.parse(String(publicRemoval.body));
    const rpcBody = JSON.parse(String(aggregateRpc.body));
    const auditBody = JSON.parse(String(compensationAudit.body));
    assert.deepEqual(removalBody.prefixes, [uploadedPath]);
    assert.equal(
      rpcBody.p_promotions[0].destinationPath,
      uploadedPath,
      "The compensated path must be the exact request-owned promotion path",
    );
    assert.equal(
      auditBody.action,
      "project.aggregate.publish_compensation",
    );
    assert.deepEqual(auditBody.metadata.removed, [uploadedPath]);
    assert.equal(auditBody.metadata.originalError.code, "revision_conflict");
  },
);

const referencedMediaDraft = createEmptyProjectAggregateDraft();
referencedMediaDraft.project.heroMediaId = 701;
referencedMediaDraft.project.coverMediaId = 702;
referencedMediaDraft.materials = [{ mediaAssetId: 703 }];
referencedMediaDraft.maps = [{ mediaAssetId: 704 }];
referencedMediaDraft.mediaBlocks = [
  { mediaAssetId: 705 },
  { mediaAssetId: 701 },
];
referencedMediaDraft.hotspots = [{ previewMediaId: 706 }];
assert.deepEqual(
  collectProjectMediaAssetIds(referencedMediaDraft),
  [701, 702, 703, 704, 705, 706],
  "Every distinct media id referenced anywhere in a Project draft must be fetched exactly",
);

const currentMediaOptions = [
  {
    id: 1,
    bucket: "urblo-admin-media",
    alt: "Older description",
    caption: null,
    objectPath: "projects/one.jpg",
    sourceUrl: null,
    sourceKind: "storage",
    mediaType: "image",
    status: "draft",
    previewUrl: "https://signed.example/one",
  },
  {
    id: 2,
    bucket: null,
    alt: "Picker image",
    caption: null,
    objectPath: null,
    sourceUrl: "/picker-two.jpg",
    sourceKind: "external_legacy",
    mediaType: "image",
    status: "published",
    previewUrl: "/picker-two.jpg",
  },
];
const mergedMediaOptions = mergeProjectMediaOptions(currentMediaOptions, [
  {
    ...currentMediaOptions[0],
    alt: "Fresh description",
    previewUrl: null,
  },
  {
    id: 701,
    bucket: "urblo-admin-media",
    alt: "Referenced beyond picker cap",
    caption: null,
    objectPath: "projects/old-reference.jpg",
    sourceUrl: null,
    sourceKind: "storage",
    mediaType: "image",
    status: "draft",
    previewUrl: "https://signed.example/old-reference",
  },
]);
assert.deepEqual(
  mergedMediaOptions.map((asset) => asset.id),
  [1, 2, 701],
  "Exact referenced media must merge without dropping or reordering the latest picker results",
);
assert.equal(mergedMediaOptions[0].alt, "Fresh description");
assert.equal(
  mergedMediaOptions[0].previewUrl,
  "https://signed.example/one",
  "A transient signing failure must not discard an unexpired private preview",
);

const optionsResponse = adminProjectsOptionsResponse();
assert.equal(optionsResponse.status, 204);
assert.equal(
  optionsResponse.headers.get("access-control-allow-methods"),
  "GET, POST, OPTIONS",
);

const behaviorDraft = createEmptyProjectAggregateDraft();
Object.assign(behaviorDraft.project, {
  title: "Aggregate preview proof",
  slug: "aggregate-preview-proof",
  lead: "Lead-only opening copy.",
  carbonStatus: "yes",
  carbonNote: "Measured project note.",
  claimReviewStatus: "approved",
  heroMediaId: 1,
  coverMediaId: 1,
});
behaviorDraft.materials.push({
  key: "material:new:proof",
  id: null,
  stoneGroupId: 1,
  finishDefinitionId: 1,
  application: "Paving",
  note: "Material note",
  mediaAssetId: null,
  claimStatus: "approved",
  sortOrder: 0,
});
behaviorDraft.maps.push({
  key: "map:new:proof",
  id: null,
  mediaAssetId: 2,
  title: "Material placement",
  intro: "Map introduction",
  sortOrder: 0,
});
behaviorDraft.hotspots.push({
  key: "hotspot:new:proof",
  id: null,
  projectMaterialMapKey: "map:new:proof",
  projectMaterialKey: "material:new:proof",
  xPercent: 25,
  yPercent: 40,
  label: "Entry paving",
  application: "Paving",
  note: "Hotspot note",
  previewMediaId: null,
  sortOrder: 0,
});
const behaviorContext = {
  media: [
    {
      id: 1,
      bucket: null,
      alt: "Hero alt",
      caption: null,
      objectPath: null,
      sourceUrl: "/hero.jpg",
      sourceKind: "external_legacy",
      mediaType: "image",
      status: "published",
      previewUrl: "/hero.jpg",
    },
    {
      id: 2,
      bucket: null,
      alt: "Map alt",
      caption: null,
      objectPath: null,
      sourceUrl: "/map.jpg",
      sourceKind: "external_legacy",
      mediaType: "image",
      status: "published",
      previewUrl: "/map.jpg",
    },
  ],
  stones: [
    { id: 1, key: "bluestone", label: "Bluestone", status: "published" },
  ],
  finishes: [{ id: 1, key: "sawn", label: "Sawn", status: "published" }],
};

const orderDraft = structuredClone(behaviorDraft);
orderDraft.facts = [
  {
    key: "fact:new:first",
    id: null,
    factLabel: "First fact",
    factValue: "A",
    factValueJson: null,
    claimStatus: "approved",
    sortOrder: 4,
  },
  {
    key: "fact:new:second",
    id: null,
    factLabel: "Second fact",
    factValue: "B",
    factValueJson: null,
    claimStatus: "approved",
    sortOrder: 9,
  },
];
orderDraft.materials.push({
  ...orderDraft.materials[0],
  key: "material:new:second",
  application: "Steps",
  sortOrder: 9,
});
orderDraft.maps.push({
  ...orderDraft.maps[0],
  key: "map:new:second",
  title: "Second map",
  sortOrder: 9,
});
orderDraft.mediaBlocks = [
  {
    key: "media:new:first",
    id: null,
    mediaRole: "normal_image",
    mediaAssetId: 1,
    projectMaterialMapKey: null,
    blockTitle: "First image",
    youtubeUrl: "",
    label: "",
    caption: "",
    sortOrder: 4,
  },
  {
    key: "media:new:second",
    id: null,
    mediaRole: "normal_image",
    mediaAssetId: 2,
    projectMaterialMapKey: null,
    blockTitle: "Second image",
    youtubeUrl: "",
    label: "",
    caption: "",
    sortOrder: 9,
  },
];
orderDraft.hotspots = [
  orderDraft.hotspots[0],
  {
    ...orderDraft.hotspots[0],
    key: "hotspot:new:other-map",
    projectMaterialMapKey: "map:new:second",
    sortOrder: 7,
  },
  {
    ...orderDraft.hotspots[0],
    key: "hotspot:new:second",
    label: "Second point",
    sortOrder: 8,
  },
];

let reorderedDraft = moveProjectDraftItem(
  orderDraft,
  "facts",
  "fact:new:second",
  "up",
);
reorderedDraft = moveProjectDraftItem(
  reorderedDraft,
  "materials",
  "material:new:second",
  "up",
);
reorderedDraft = moveProjectDraftItem(
  reorderedDraft,
  "maps",
  "map:new:second",
  "up",
);
reorderedDraft = moveProjectDraftItem(
  reorderedDraft,
  "mediaBlocks",
  "media:new:second",
  "up",
);
reorderedDraft = moveProjectDraftItem(
  reorderedDraft,
  "hotspots",
  "hotspot:new:second",
  "up",
);
assert.equal(reorderedDraft.facts[0].key, "fact:new:second");
assert.equal(reorderedDraft.materials[0].key, "material:new:second");
assert.equal(reorderedDraft.maps[0].key, "map:new:second");
assert.equal(reorderedDraft.mediaBlocks[0].key, "media:new:second");
assert.deepEqual(
  reorderedDraft.hotspots
    .filter(
      (hotspot) => hotspot.projectMaterialMapKey === "map:new:proof",
    )
    .map((hotspot) => hotspot.key),
  ["hotspot:new:second", "hotspot:new:proof"],
  "Hotspot reordering must stay within its selected material map",
);
for (const rows of [
  reorderedDraft.facts,
  reorderedDraft.materials,
  reorderedDraft.maps,
  reorderedDraft.mediaBlocks,
]) {
  assert.deepEqual(
    rows.map((row) => row.sortOrder),
    [0, 1],
    "Reordered public collections must receive contiguous sort positions",
  );
}
assert.deepEqual(
  reorderedDraft.hotspots
    .filter(
      (hotspot) => hotspot.projectMaterialMapKey === "map:new:proof",
    )
    .map((hotspot) => hotspot.sortOrder),
  [0, 1],
  "Reordered points must receive contiguous per-map sort positions",
);
assert.equal(
  moveProjectDraftItem(reorderedDraft, "facts", "fact:new:second", "up"),
  reorderedDraft,
  "A boundary reorder must be a no-op",
);
const reorderedPreview = draftToProjectData(reorderedDraft, behaviorContext);
assert.equal(
  reorderedPreview.mediaBlocks?.[0]?.title,
  "Second image",
  "Draft preview must follow the same normalized media order saved publicly",
);

const behaviorPreview = draftToProjectData(behaviorDraft, behaviorContext);
assert.equal(
  behaviorPreview.listing.summary,
  undefined,
  "Lead-only drafts must not repeat the lead as story copy",
);
assert.equal(
  behaviorPreview.details["Carbon Offset"],
  "Yes — Measured project note.",
);
assert.deepEqual(
  behaviorPreview.images,
  ["/map.jpg"],
  "Hero/cover must not become duplicate media blocks",
);
assert.equal(
  behaviorPreview.mediaBlocks?.[0]?.type,
  "hotspot_image",
  "Unlinked material maps must render like the public adapter",
);
assert.equal(
  getProjectPublishBlockers(behaviorDraft, behaviorContext).length,
  0,
  "Complete aggregate behavior fixture must be publish-ready",
);
const blankHotspotLabelDraft = structuredClone(behaviorDraft);
blankHotspotLabelDraft.hotspots[0].label = "";
const blankHotspotLabelPreview = draftToProjectData(
  blankHotspotLabelDraft,
  behaviorContext,
);
assert.equal(
  blankHotspotLabelPreview.materialMap?.hotspots[0]?.title,
  undefined,
  "Blank hotspot labels must use the same stone-name fallback as the public renderer",
);
const duplicateVideoDraft = structuredClone(behaviorDraft);
duplicateVideoDraft.mediaBlocks.push(
  {
    key: "media:new:video-one",
    id: null,
    mediaRole: "youtube_video",
    mediaAssetId: null,
    projectMaterialMapKey: null,
    blockTitle: "One",
    youtubeUrl: "https://youtu.be/abcdefghijk",
    label: "",
    caption: "",
    sortOrder: 0,
  },
  {
    key: "media:new:video-two",
    id: null,
    mediaRole: "youtube_video",
    mediaAssetId: null,
    projectMaterialMapKey: null,
    blockTitle: "Two",
    youtubeUrl: "https://youtu.be/lmnopqrstuv",
    label: "",
    caption: "",
    sortOrder: 1,
  },
);
assert.ok(
  getProjectPublishBlockers(duplicateVideoDraft, behaviorContext).some(
    (blocker) => blocker.id === "media-video-limit",
  ),
  "The aggregate must block more than one active YouTube video before the database unique index does",
);
const brokenReferenceDraft = structuredClone(behaviorDraft);
brokenReferenceDraft.hotspots[0].projectMaterialKey = "material:new:missing";
assert.ok(
  getProjectPublishBlockers(brokenReferenceDraft, behaviorContext).some(
    (blocker) => blocker.section === "maps",
  ),
  "Missing child references must become a plain-language publish blocker",
);

const editorBaseline = structuredClone(behaviorDraft);
Object.assign(editorBaseline.project, { id: 20, status: "published" });
editorBaseline.facts.push({
  key: "fact:21",
  id: 21,
  factLabel: "Area",
  factValue: "400 m²",
  factValueJson: null,
  claimStatus: "approved",
  sortOrder: 0,
});
Object.assign(editorBaseline.materials[0], { id: 22 });
const legacyReviewDraft = structuredClone(editorBaseline);
legacyReviewDraft.project.claimReviewStatus = "needs_review";
legacyReviewDraft.facts[0].claimStatus = "deferred";
legacyReviewDraft.materials[0].claimStatus = "needs_review";

const normalizedClientDraft = normalizeProjectDraftForSave(legacyReviewDraft);
assert.equal(normalizedClientDraft.project.claimReviewStatus, "approved");
assert.ok(
  normalizedClientDraft.facts.every((row) => row.claimStatus === "approved"),
  "The single-editor Save path must mechanically normalize legacy fact review fields",
);
assert.ok(
  normalizedClientDraft.materials.every((row) => row.claimStatus === "approved"),
  "The single-editor Save path must mechanically normalize legacy material review fields",
);

const normalizedServerDraft = normalizeAutomaticClaimStatuses(legacyReviewDraft);
assert.equal(normalizedServerDraft.project.claimReviewStatus, "approved");
assert.ok(normalizedServerDraft.facts.every((row) => row.claimStatus === "approved"));
assert.ok(normalizedServerDraft.materials.every((row) => row.claimStatus === "approved"));
assert.equal(
  getProjectPublishBlockers(legacyReviewDraft, behaviorContext).some(
    (blocker) => blocker.id.includes("review"),
  ),
  false,
  "Legacy review fields must not create an editor-facing publish blocker",
);
assert.doesNotThrow(
  () => assertPublishDraft(normalizedServerDraft),
  "A complete single-editor draft must publish without a separate approval step",
);

const validServerDraft = structuredClone(editorBaseline);
assert.doesNotThrow(() => validateDraftShape(validServerDraft));
const invalidSortDraft = structuredClone(validServerDraft);
invalidSortDraft.project.sortOrder = "0";
assert.throws(
  () => validateDraftShape(invalidSortDraft),
  (error) => error?.status === 400 && error?.code === "invalid_draft_field",
  "String sort orders must be rejected before JSON reaches a list cast",
);
const invalidCoordinateDraft = structuredClone(validServerDraft);
invalidCoordinateDraft.hotspots[0].xPercent = 101;
assert.throws(
  () => validateDraftShape(invalidCoordinateDraft),
  (error) => error?.status === 400 && error?.code === "invalid_draft_field",
  "Out-of-range hotspot coordinates must be rejected on Save",
);
const duplicateChildIdDraft = structuredClone(validServerDraft);
duplicateChildIdDraft.facts.push({
  ...duplicateChildIdDraft.facts[0],
  key: "fact:different-key-same-id",
});
assert.throws(
  () => validateDraftShape(duplicateChildIdDraft),
  (error) => error?.status === 400 && error?.code === "duplicate_draft_id",
  "Different browser keys must not update the same child id twice",
);
const semanticExtraDraft = structuredClone(validServerDraft);
semanticExtraDraft.mediaBlocks.push({
  key: "media:new:semantic-extra",
  id: null,
  mediaRole: "youtube_video",
  mediaAssetId: 999,
  projectMaterialMapKey: null,
  blockTitle: "Video",
  youtubeUrl: "abcdefghijk",
  label: "",
  caption: "",
  sortOrder: 0,
});
assert.throws(
  () => validateDraftShape(semanticExtraDraft),
  (error) => error?.status === 400 && error?.code === "invalid_draft_field",
  "Unused YouTube media ids must be rejected instead of promoted",
);
assert.throws(
  () =>
    assertPublishableMedia([
      {
        id: 99,
        status: "published",
        source_kind: "external_legacy",
        source_url: "/document.pdf",
        media_type: "document",
        alt: "Not an image",
      },
    ]),
  (error) => error?.status === 409 && error?.code === "publish_blocked",
  "Document/video assets must not enter image-only aggregate fields",
);
assert.throws(
  () =>
    assertPublishableMedia([
      {
        id: 100,
        status: "draft",
        source_kind: "storage",
        bucket: "urblo-admin-media",
        object_path: "project-editor/oversize.png",
        source_url: null,
        media_type: "image",
        mime_type: "image/png",
        size_bytes: 10 * 1024 * 1024 + 1,
        alt: "Oversize image",
      },
    ]),
  (error) => error?.status === 409 && error?.code === "publish_blocked",
  "Declared images over 10 MiB must be rejected before Storage download",
);
assert.throws(
  () =>
    assertPublishableMedia(
      Array.from({ length: 51 }, (_, index) => ({
        id: index + 1,
        status: "published",
        source_kind: "external_legacy",
        source_url: `/image-${index}.jpg`,
        media_type: "image",
        mime_type: "image/jpeg",
        size_bytes: 1,
        alt: `Image ${index + 1}`,
      })),
    ),
  (error) => error?.status === 409 && error?.code === "publish_blocked",
  "Projects over the unique image count budget must be rejected",
);
assert.throws(
  () =>
    assertPublishableMedia([
      {
        id: 101,
        status: "draft",
        source_kind: "storage",
        bucket: "urblo-admin-media",
        object_path: "project-editor/not-image.pdf",
        source_url: null,
        media_type: "image",
        mime_type: "application/pdf",
        size_bytes: 100,
        alt: "Masquerading document",
      },
    ]),
  (error) => error?.status === 409 && error?.code === "publish_blocked",
  "Storage documents must not pass by changing only media_type",
);

const readEnvelope = {
  projectId: 20,
  revision: 0,
  baseUpdatedAt: "2026-07-14T05:29:55.123456+00:00",
  status: "published",
  draft: validServerDraft,
};
assert.equal(
  isProjectApiResponse(readEnvelope),
  true,
  "GET envelopes may omit mutation copy",
);
assert.equal(
  isProjectApiResponse(readEnvelope, { requireMessage: true }),
  false,
  "Mutation envelopes must still contain a message",
);
assert.equal(
  isProjectApiResponse(
    { ...readEnvelope, message: "Project saved." },
    { requireMessage: true },
  ),
  true,
);
assert.equal(
  isProjectApiResponse(
    {
      ...readEnvelope,
      message: "Project published.",
      warnings: ["Cleanup warning one.", "Cleanup warning two."],
    },
    { requireMessage: true },
  ),
  true,
  "Mutation envelopes may carry every post-publish warning",
);
assert.equal(
  isProjectApiResponse({ ...readEnvelope, warnings: [null] }),
  false,
  "Malformed warning arrays must fail closed",
);
assert.equal(
  isProjectApiResponse({ ...readEnvelope, projectId: 0 }),
  false,
  "GET envelopes require a positive project id",
);
assert.equal(
  isProjectApiResponse({ ...readEnvelope, revision: -1 }),
  false,
  "GET envelopes require a non-negative integer revision",
);
assert.equal(
  isProjectApiResponse({ ...readEnvelope, baseUpdatedAt: null }),
  true,
  "Draft-only new Projects may return a null canonical token",
);
assert.equal(
  isProjectApiResponse({ ...readEnvelope, baseUpdatedAt: "not-a-timestamp" }),
  false,
  "Malformed canonical tokens must fail closed",
);
const { baseUpdatedAt: _omittedBaseUpdatedAt, ...missingBaseUpdatedAtEnvelope } =
  readEnvelope;
assert.equal(
  isProjectApiResponse(missingBaseUpdatedAtEnvelope),
  false,
  "GET and mutation envelopes must always include a canonical token",
);
assert.equal(
  isProjectApiResponse({
    ...readEnvelope,
    draft: {
      project: [],
      facts: [null],
      materials: [],
      maps: [],
      mediaBlocks: [],
      hotspots: [],
    },
  }),
  false,
  "Malformed nested draft rows must fail closed before rendering",
);

const compensationDisclosure = summarizePublishCompensation(
  {
    removed: ["/owned-copy-a"],
    retained: [{ path: "/owned-copy-b", reason: "remove_failed" }],
  },
  false,
);
assert.deepEqual(compensationDisclosure.summary, {
  removedCount: 1,
  retainedCount: 1,
  auditRecorded: false,
});
assert.match(compensationDisclosure.warning, /manual cleanup/i);
assert.match(compensationDisclosure.warning, /cleanup record/i);
assert.doesNotMatch(
  compensationDisclosure.warning,
  /bucket|storage|public|private/i,
);
const missingAuditDisclosure = summarizePublishCompensation(
  { removed: ["/owned-copy-a"], retained: [] },
  false,
);
assert.match(
  missingAuditDisclosure.warning,
  /cleanup record/i,
  "A failed durable compensation audit must remain visible even when cleanup succeeded",
);

const mappedRevisionConflict = mapRpcError(
  {
    code: "revision_conflict",
    message: "Reload before saving.",
    details: null,
  },
  409,
);
assert.equal(mappedRevisionConflict.status, 409);
assert.equal(mappedRevisionConflict.code, "revision_conflict");
assert.equal(mappedRevisionConflict.message, "Reload before saving.");

const mappedActorRoleChange = mapRpcError(
  {
    code: "PGRST",
    message: JSON.stringify({
      code: "actor_role_changed",
      message: "Your Projects access changed. Reload the workspace before continuing.",
    }),
    details: JSON.stringify({
      status: 403,
      status_text: "Forbidden",
      headers: {},
    }),
  },
  400,
);
assert.equal(mappedActorRoleChange.status, 403);
assert.equal(mappedActorRoleChange.code, "actor_role_changed");
assert.match(mappedActorRoleChange.message, /access changed/i);

if (failures.length > 0) {
  console.error("Admin Projects aggregate checks failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  exit(1);
}

console.log("Admin Projects aggregate checks passed.");
console.log(
  "Verified aggregate mapping behavior, one endpoint, shared live preview, visual hotspots, inline media, server audit, and migration-source security boundaries.",
);
