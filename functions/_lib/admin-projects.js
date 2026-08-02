import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://npkidywzwddbnfrnxlmo.supabase.co";
const PRIVATE_MEDIA_BUCKET = "urblo-admin-media";
const PUBLIC_MEDIA_BUCKET = "urblo-public-media";
const MAX_BODY_BYTES = 1_100_000;
const MAX_PROJECT_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_PROJECT_MEDIA_ASSETS = 50;
const MAX_PROJECT_MEDIA_TOTAL_BYTES = 100 * 1024 * 1024;
const POSTGRES_INTEGER_MIN = -2_147_483_648;
const POSTGRES_INTEGER_MAX = 2_147_483_647;
const BASE_UPDATED_AT_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;
const CLAIM_STATUSES = new Set(["needs_review", "approved", "deferred"]);
const LIFECYCLE_STATUSES = new Set(["draft", "published", "archived"]);
const CARBON_STATUSES = new Set(["", "yes", "no", "not_available", "tbc"]);
const MEDIA_ROLES = new Set([
  "cover",
  "hero",
  "gallery",
  "material_map",
  "supporting",
  "normal_image",
  "hotspot_image",
  "youtube_video",
]);
const PROJECT_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

class AdminProjectsError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function adminProjectsOptionsResponse() {
  return jsonResponse({}, { status: 204 });
}

export function adminProjectsMethodNotAllowedResponse() {
  return jsonResponse(
    {
      error: "method_not_allowed",
      message: "Use GET or POST for the Projects workspace.",
    },
    { status: 405 },
  );
}

export async function handleAdminProjectsRequest(request, env) {
  try {
    // Deliberately precedes environment lookup, body parsing, and every database call.
    // This keeps an unconfigured preview fail-closed without consuming a forged body.
    const accessToken = getBearerToken(request);
    const supabase = createServiceClient(getSupabaseConfig(env));
    const actor = await requireAdminActor(supabase, accessToken);

    if (request.method === "GET") {
      return jsonResponse(
        await handleGet(
          supabase,
          actor.user.id,
          actor.profile.role,
          request,
        ),
      );
    }

    if (request.method !== "POST") {
      return adminProjectsMethodNotAllowedResponse();
    }

    if (actor.profile.role === "viewer") {
      throw new AdminProjectsError(
        403,
        "read_only",
        "This Projects account is read-only.",
      );
    }

    const input = await parsePostInput(request);
    input.draft = normalizeAutomaticClaimStatuses(input.draft);

    if (input.action === "publish") {
      assertPublishDraft(input.draft);
      await assertPublishedReferenceRows(supabase, input.draft);
      const media = await loadReferencedMedia(supabase, input.draft);
      assertPublishableMedia(media);
      return jsonResponse(
        await publishAggregate(
          supabase,
          actor.user.id,
          actor.profile.role,
          input,
          media,
        ),
      );
    }

    const result = await callAggregateRpc(
      supabase,
      actor.user.id,
      actor.profile.role,
      input,
      [],
    );
    return jsonResponse(result);
  } catch (error) {
    if (error instanceof AdminProjectsError) {
      return jsonResponse(
        {
          error: error.code,
          message: error.message,
          ...(error.details || {}),
        },
        { status: error.status },
      );
    }

    return jsonResponse(
      {
        error: "admin_projects_failed",
        message:
          "Projects could not be updated. Reload the workspace and try again.",
      },
      { status: 500 },
    );
  }
}

async function handleGet(supabase, actorUserId, actorRole, request) {
  const rawProjectId = new URL(request.url).searchParams.get("projectId");
  if (rawProjectId === null || rawProjectId === "") {
    const result = await callAggregateRpc(
      supabase,
      actorUserId,
      actorRole,
      {
        action: "list",
        projectId: null,
        baseRevision: 0,
        baseUpdatedAt: null,
        draft: {},
      },
      [],
    );
    return { projects: Array.isArray(result?.projects) ? result.projects : [] };
  }

  const projectId = parsePositiveInteger(rawProjectId, "projectId");
  return loadAggregateEnvelope(supabase, actorUserId, actorRole, projectId);
}

async function loadAggregateEnvelope(
  supabase,
  actorUserId,
  actorRole,
  projectId,
) {
  const saved = await callAggregateRpc(
    supabase,
    actorUserId,
    actorRole,
    {
      action: "get",
      projectId,
      baseRevision: 0,
      baseUpdatedAt: null,
      draft: {},
    },
    [],
  );

  if (saved?.found) {
    return {
      projectId: saved.projectId,
      revision: saved.revision,
      baseUpdatedAt: saved.baseUpdatedAt,
      status: saved.status,
      draft: saved.draft,
    };
  }

  return loadCanonicalAggregate(supabase, projectId);
}

async function loadCanonicalAggregate(supabase, projectId) {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError)
    throw upstreamError(
      "project_load_failed",
      "The project could not be loaded.",
    );
  if (!project)
    throw new AdminProjectsError(
      404,
      "project_not_found",
      "The project was not found.",
    );

  const [factsResult, materialsResult, mapsResult, mediaResult] =
    await Promise.all([
      supabase
        .from("project_facts")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order")
        .order("id"),
      supabase
        .from("project_materials")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order")
        .order("id"),
      supabase
        .from("project_material_maps")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order")
        .order("id"),
      supabase
        .from("project_media")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order")
        .order("id"),
    ]);

  for (const result of [
    factsResult,
    materialsResult,
    mapsResult,
    mediaResult,
  ]) {
    if (result.error)
      throw upstreamError(
        "project_load_failed",
        "The project sections could not be loaded.",
      );
  }

  const includeRow = (row) =>
    project.status === "archived" || row.status !== "archived";
  const facts = (factsResult.data || []).filter(includeRow);
  const materials = (materialsResult.data || []).filter(includeRow);
  const maps = (mapsResult.data || []).filter(includeRow);
  const mediaBlocks = (mediaResult.data || []).filter(includeRow);
  const mapIds = maps.map((map) => map.id);
  let hotspots = [];

  if (mapIds.length) {
    const { data, error } = await supabase
      .from("project_hotspots")
      .select("*")
      .in("project_material_map_id", mapIds)
      .order("sort_order")
      .order("id");
    if (error)
      throw upstreamError(
        "project_load_failed",
        "The project map points could not be loaded.",
      );
    hotspots = (data || []).filter(includeRow);
  }

  const mapKeyById = new Map(
    maps.map((row) => [row.id, persistedKey("map", row.id)]),
  );
  const materialKeyById = new Map(
    materials.map((row) => [row.id, persistedKey("material", row.id)]),
  );

  return {
    projectId,
    revision: 0,
    baseUpdatedAt: project.updated_at,
    status: project.status,
    draft: {
      project: {
        id: project.id,
        status: project.status,
        slug: project.slug,
        title: project.title,
        location: project.location || "",
        projectDateLabel: project.project_date_label || "",
        completedOn: project.completed_on || "",
        summary: project.summary || "",
        lead: project.lead || "",
        client: project.client || "",
        landscapeArchitect: project.landscape_architect || "",
        contractor: project.contractor || "",
        address: project.address || "",
        quantityLabel: project.quantity_label || "",
        carbonStatus: project.carbon_status || "",
        carbonNote: project.carbon_note || "",
        claimReviewStatus: project.claim_review_status,
        heroMediaId: project.hero_media_id,
        coverMediaId: project.cover_media_id,
        sortOrder: project.sort_order,
      },
      facts: facts.map((row) => ({
        key: persistedKey("fact", row.id),
        id: row.id,
        factLabel: row.fact_label,
        factValue: row.fact_value || "",
        factValueJson: row.fact_value_json ?? null,
        claimStatus: row.claim_status,
        sortOrder: row.sort_order,
      })),
      materials: materials.map((row) => ({
        key: persistedKey("material", row.id),
        id: row.id,
        stoneGroupId: row.stone_group_id,
        finishDefinitionId: row.finish_definition_id,
        application: row.application,
        note: row.note || "",
        mediaAssetId:
          row.media_role === "hotspot_image" ? null : row.media_asset_id,
        claimStatus: row.claim_status,
        sortOrder: row.sort_order,
      })),
      maps: maps.map((row) => ({
        key: persistedKey("map", row.id),
        id: row.id,
        mediaAssetId: row.media_asset_id,
        title: row.title || "",
        intro: row.intro || "",
        sortOrder: row.sort_order,
      })),
      mediaBlocks: mediaBlocks.map((row) => ({
        key: persistedKey("media", row.id),
        id: row.id,
        mediaRole: row.media_role,
        mediaAssetId: row.media_asset_id,
        projectMaterialMapKey: row.project_material_map_id
          ? mapKeyById.get(row.project_material_map_id) || null
          : null,
        blockTitle: row.block_title || "",
        youtubeUrl: row.youtube_url || "",
        label: row.label || "",
        caption: row.caption || "",
        sortOrder: row.sort_order,
      })),
      hotspots: hotspots.flatMap((row) => {
        const projectMaterialMapKey = mapKeyById.get(
          row.project_material_map_id,
        );
        if (!projectMaterialMapKey) return [];
        return [
          {
            key: persistedKey("hotspot", row.id),
            id: row.id,
            projectMaterialMapKey,
            projectMaterialKey: row.project_material_id
              ? materialKeyById.get(row.project_material_id) || null
              : null,
            xPercent: Number(row.x_percent),
            yPercent: Number(row.y_percent),
            label: row.label || "",
            application: row.application || "",
            note: row.note || "",
            previewMediaId: row.preview_media_id,
            sortOrder: row.sort_order,
          },
        ];
      }),
    },
  };
}

async function parsePostInput(request) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    throw new AdminProjectsError(
      413,
      "draft_too_large",
      "This project draft is too large to save.",
    );
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new AdminProjectsError(
      413,
      "draft_too_large",
      "This project draft is too large to save.",
    );
  }

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new AdminProjectsError(
      400,
      "invalid_json",
      "Send a valid JSON project request.",
    );
  }

  if (
    !isObject(body) ||
    !["save", "publish", "archive"].includes(body.action)
  ) {
    throw new AdminProjectsError(
      400,
      "invalid_action",
      "Choose Save, Publish, or Hide.",
    );
  }

  if (
    body.projectId !== null &&
    body.projectId !== undefined &&
    typeof body.projectId !== "number"
  ) {
    throw new AdminProjectsError(
      400,
      "invalid_project_id",
      "projectId must be a number or null.",
    );
  }
  const projectId =
    body.projectId === null || body.projectId === undefined
      ? null
      : parsePositiveInteger(body.projectId, "projectId");
  const baseRevision = parseNonNegativeInteger(
    body.baseRevision,
    "baseRevision",
  );
  const baseUpdatedAt = parseBaseUpdatedAt(body.baseUpdatedAt);
  if (projectId === null && baseUpdatedAt !== null) {
    throw new AdminProjectsError(
      400,
      "invalid_base_updated_at",
      "A new project cannot have an existing page version.",
    );
  }
  const draft = body.draft;
  validateDraftShape(draft);

  if (body.action === "archive" && projectId === null) {
    throw new AdminProjectsError(
      400,
      "project_id_required",
      "Save the new project before hiding it.",
    );
  }

  if (draft.project.id !== null && draft.project.id !== undefined) {
    const draftProjectId = parsePositiveInteger(
      draft.project.id,
      "draft.project.id",
    );
    if (projectId !== null && draftProjectId !== projectId) {
      throw new AdminProjectsError(
        409,
        "project_id_mismatch",
        "Reload this project before saving.",
      );
    }
  }

  return {
    action: body.action,
    projectId,
    baseRevision,
    baseUpdatedAt,
    draft,
  };
}

export function validateDraftShape(draft) {
  if (!isObject(draft) || !isObject(draft.project)) {
    throw new AdminProjectsError(
      400,
      "invalid_draft",
      "The project draft is incomplete.",
    );
  }

  const limits = {
    facts: 100,
    materials: 100,
    maps: 30,
    mediaBlocks: 100,
    hotspots: 300,
  };
  for (const [collection, limit] of Object.entries(limits)) {
    if (!Array.isArray(draft[collection]) || draft[collection].length > limit) {
      throw new AdminProjectsError(
        400,
        "invalid_draft",
        `The ${collection} section is invalid.`,
      );
    }
    validateUniqueKeys(draft[collection], collection);
  }

  validateProjectFields(draft.project);
  draft.facts.forEach((row, index) => validateFactFields(row, index));
  draft.materials.forEach((row, index) => validateMaterialFields(row, index));
  draft.maps.forEach((row, index) => validateMapFields(row, index));
  draft.mediaBlocks.forEach((row, index) =>
    validateMediaBlockFields(row, index),
  );
  draft.hotspots.forEach((row, index) => validateHotspotFields(row, index));
}

function validateUniqueKeys(rows, collection) {
  const keys = new Set();
  const ids = new Set();
  for (const row of rows) {
    if (
      !isObject(row) ||
      typeof row.key !== "string" ||
      !row.key.trim() ||
      row.key.length > 200
    ) {
      throw new AdminProjectsError(
        400,
        "invalid_draft_key",
        `A ${collection} item has no valid key.`,
      );
    }
    if (keys.has(row.key)) {
      throw new AdminProjectsError(
        400,
        "duplicate_draft_key",
        `A ${collection} item is duplicated.`,
      );
    }
    keys.add(row.key);
    validateOptionalId(row.id, `${collection}.id`);
    if (row.id !== null && row.id !== undefined) {
      if (ids.has(row.id)) {
        throw new AdminProjectsError(
          400,
          "duplicate_draft_id",
          `A ${collection} database row is duplicated.`,
        );
      }
      ids.add(row.id);
    }
  }
}

function validateProjectFields(project) {
  validateOptionalId(project.id, "project.id");
  if (!LIFECYCLE_STATUSES.has(project.status)) invalidField("project.status");
  for (const field of [
    "slug",
    "title",
    "location",
    "projectDateLabel",
    "completedOn",
    "summary",
    "lead",
    "client",
    "landscapeArchitect",
    "contractor",
    "address",
    "quantityLabel",
    "carbonNote",
  ]) {
    validateString(project[field], `project.${field}`);
  }
  if (project.completedOn && !isIsoDate(project.completedOn))
    invalidField("project.completedOn");
  if (!CARBON_STATUSES.has(project.carbonStatus))
    invalidField("project.carbonStatus");
  validateClaimStatus(project.claimReviewStatus, "project claim");
  validateOptionalId(project.heroMediaId, "project.heroMediaId");
  validateOptionalId(project.coverMediaId, "project.coverMediaId");
  validateSortOrder(project.sortOrder, "project.sortOrder");
}

function validateFactFields(row, index) {
  validateString(row.factLabel, `facts[${index}].factLabel`);
  validateString(row.factValue, `facts[${index}].factValue`);
  validateClaimStatus(row.claimStatus, `facts[${index}] claim`);
  validateSortOrder(row.sortOrder, `facts[${index}].sortOrder`);
}

function validateMaterialFields(row, index) {
  validateOptionalId(row.stoneGroupId, `materials[${index}].stoneGroupId`);
  validateOptionalId(
    row.finishDefinitionId,
    `materials[${index}].finishDefinitionId`,
  );
  validateOptionalId(row.mediaAssetId, `materials[${index}].mediaAssetId`);
  validateString(row.application, `materials[${index}].application`);
  validateString(row.note, `materials[${index}].note`);
  validateClaimStatus(row.claimStatus, `materials[${index}] claim`);
  validateSortOrder(row.sortOrder, `materials[${index}].sortOrder`);
}

function validateMapFields(row, index) {
  validateOptionalId(row.mediaAssetId, `maps[${index}].mediaAssetId`);
  validateString(row.title, `maps[${index}].title`);
  validateString(row.intro, `maps[${index}].intro`);
  validateSortOrder(row.sortOrder, `maps[${index}].sortOrder`);
}

function validateMediaBlockFields(row, index) {
  if (!MEDIA_ROLES.has(row.mediaRole)) {
    throw new AdminProjectsError(
      400,
      "invalid_media_role",
      "A project media block is invalid.",
    );
  }
  validateOptionalId(row.mediaAssetId, `mediaBlocks[${index}].mediaAssetId`);
  validateOptionalKey(
    row.projectMaterialMapKey,
    `mediaBlocks[${index}].projectMaterialMapKey`,
  );
  if (row.mediaRole === "youtube_video") {
    if (row.mediaAssetId !== null || row.projectMaterialMapKey !== null) {
      invalidField(`mediaBlocks[${index}]`);
    }
  } else if (row.mediaRole === "hotspot_image") {
    if (
      row.mediaAssetId !== null ||
      typeof row.projectMaterialMapKey !== "string" ||
      !row.projectMaterialMapKey.trim()
    ) {
      invalidField(`mediaBlocks[${index}]`);
    }
  } else if (row.projectMaterialMapKey !== null) {
    invalidField(`mediaBlocks[${index}].projectMaterialMapKey`);
  }
  for (const field of ["blockTitle", "youtubeUrl", "label", "caption"]) {
    validateString(row[field], `mediaBlocks[${index}].${field}`);
  }
  validateSortOrder(row.sortOrder, `mediaBlocks[${index}].sortOrder`);
}

function validateHotspotFields(row, index) {
  if (
    typeof row.projectMaterialMapKey !== "string" ||
    !row.projectMaterialMapKey.trim()
  ) {
    invalidField(`hotspots[${index}].projectMaterialMapKey`);
  }
  validateOptionalKey(
    row.projectMaterialKey,
    `hotspots[${index}].projectMaterialKey`,
  );
  if (!inPercentRange(row.xPercent))
    invalidField(`hotspots[${index}].xPercent`);
  if (!inPercentRange(row.yPercent))
    invalidField(`hotspots[${index}].yPercent`);
  for (const field of ["label", "application", "note"]) {
    validateString(row[field], `hotspots[${index}].${field}`);
  }
  validateOptionalId(row.previewMediaId, `hotspots[${index}].previewMediaId`);
  validateSortOrder(row.sortOrder, `hotspots[${index}].sortOrder`);
}

function validateString(value, field) {
  if (typeof value !== "string") invalidField(field);
}

function validateOptionalKey(value, field) {
  if (
    value !== null &&
    (typeof value !== "string" || !value.trim() || value.length > 200)
  ) {
    invalidField(field);
  }
}

function validateOptionalId(value, field) {
  if (
    value !== null &&
    value !== undefined &&
    (!Number.isSafeInteger(value) || value <= 0)
  ) {
    invalidField(field);
  }
}

function validateSortOrder(value, field) {
  if (
    !Number.isInteger(value) ||
    value < POSTGRES_INTEGER_MIN ||
    value > POSTGRES_INTEGER_MAX
  ) {
    invalidField(field);
  }
}

function invalidField(field) {
  throw new AdminProjectsError(
    400,
    "invalid_draft_field",
    `${field} has an invalid value.`,
  );
}

function isIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
  );
}

function validateClaimStatus(value, label) {
  if (!CLAIM_STATUSES.has(value)) {
    throw new AdminProjectsError(
      400,
      "invalid_claim_status",
      `The ${label} status is invalid.`,
    );
  }
}

export function assertPublishDraft(draft) {
  const blockers = [];
  const add = (message) => {
    if (blockers.length < 3) blockers.push(message);
  };
  const project = draft.project;

  if (!stringValue(project.title)) add("Give the project a title.");
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(stringValue(project.slug))) {
    add("Check the project page address.");
  }
  if (!stringValue(project.summary) && !stringValue(project.lead)) {
    add("Add a short project introduction.");
  }
  if (
    !positiveIntegerOrNull(project.heroMediaId) &&
    !positiveIntegerOrNull(project.coverMediaId)
  ) {
    add("Choose a main project image.");
  }
  const mapKeys = new Set(draft.maps.map((row) => row.key));
  const materialKeys = new Set(draft.materials.map((row) => row.key));
  if (
    draft.facts.some(
      (row) => !stringValue(row.factLabel) || !renderableFactValue(row),
    )
  ) {
    add("Complete the label and value for each project fact.");
  }
  if (
    draft.materials.some(
      (row) =>
        !positiveIntegerOrNull(row.stoneGroupId) ||
        !positiveIntegerOrNull(row.finishDefinitionId) ||
        !stringValue(row.application),
    )
  ) {
    add("Complete the stone, finish, and use for every material.");
  }
  if (
    draft.maps.some(
      (row) =>
        !positiveIntegerOrNull(row.mediaAssetId) || !stringValue(row.title),
    )
  ) {
    add("Add an image and title to every material map.");
  }
  if (
    draft.hotspots.some(
      (row) =>
        !mapKeys.has(row.projectMaterialMapKey) ||
        !row.projectMaterialKey ||
        !materialKeys.has(row.projectMaterialKey) ||
        !inPercentRange(row.xPercent) ||
        !inPercentRange(row.yPercent) ||
        !stringValue(row.application),
    )
  ) {
    add("Connect every map point to a material and place it on the image.");
  }
  if (draft.mediaBlocks.some((row) => !validMediaBlock(row, mapKeys))) {
    add("Complete every project media block.");
  }
  if (
    draft.mediaBlocks.filter((row) => row.mediaRole === "youtube_video")
      .length > 1
  ) {
    add("Keep one YouTube video on each project page.");
  }

  if (blockers.length) {
    throw new AdminProjectsError(409, "publish_blocked", blockers[0], {
      blockers,
    });
  }
}

async function assertPublishedReferenceRows(supabase, draft) {
  const stoneIds = uniquePositiveIds(
    draft.materials.map((row) => row.stoneGroupId),
  );
  const finishIds = uniquePositiveIds(
    draft.materials.map((row) => row.finishDefinitionId),
  );
  const [stones, finishes] = await Promise.all([
    loadStatuses(supabase, "stone_groups", stoneIds),
    loadStatuses(supabase, "finish_definitions", finishIds),
  ]);
  if (
    stoneIds.some((id) => stones.get(id) !== "published") ||
    finishIds.some((id) => finishes.get(id) !== "published")
  ) {
    throw new AdminProjectsError(
      409,
      "publish_blocked",
      "Every material must use a published stone and finish.",
      { blockers: ["Every material must use a published stone and finish."] },
    );
  }
}

async function loadStatuses(supabase, table, ids) {
  if (!ids.length) return new Map();
  const { data, error } = await supabase
    .from(table)
    .select("id,status")
    .in("id", ids);
  if (error)
    throw upstreamError(
      "reference_load_failed",
      "Project references could not be checked.",
    );
  return new Map((data || []).map((row) => [Number(row.id), row.status]));
}

export function normalizeAutomaticClaimStatuses(requested) {
  const normalized = structuredClone(requested);
  normalized.project.claimReviewStatus = "approved";
  normalized.facts = normalized.facts.map((row) => ({
    ...row,
    claimStatus: "approved",
  }));
  normalized.materials = normalized.materials.map((row) => ({
    ...row,
    claimStatus: "approved",
  }));
  return normalized;
}

async function loadReferencedMedia(supabase, draft) {
  const ids = uniquePositiveIds([
    draft.project.heroMediaId,
    draft.project.coverMediaId,
    ...draft.materials.map((row) => row.mediaAssetId),
    ...draft.maps.map((row) => row.mediaAssetId),
    ...draft.mediaBlocks
      .filter((row) => usesDirectMediaAsset(row.mediaRole))
      .map((row) => row.mediaAssetId),
    ...draft.hotspots.map((row) => row.previewMediaId),
  ]);
  if (!ids.length) return [];

  const { data, error } = await supabase
    .from("media_assets")
    .select(
      "id,status,bucket,object_path,source_url,source_kind,media_type,mime_type,size_bytes,alt,updated_at",
    )
    .in("id", ids);
  if (error)
    throw upstreamError(
      "media_load_failed",
      "Referenced media could not be checked.",
    );
  if ((data || []).length !== ids.length) {
    throw new AdminProjectsError(
      409,
      "publish_blocked",
      "A referenced image no longer exists.",
    );
  }
  return (data || []).sort((left, right) => Number(left.id) - Number(right.id));
}

export function assertPublishableMedia(media) {
  const blockers = [];
  let declaredStorageBytes = 0;
  if (media.length > MAX_PROJECT_MEDIA_ASSETS) {
    blockers.push(
      `Use no more than ${MAX_PROJECT_MEDIA_ASSETS} unique images in one project.`,
    );
  }
  for (const asset of media) {
    if (asset.media_type !== "image") {
      blockers.push("Choose image files for project image fields.");
    }
    if (
      asset.size_bytes != null &&
      Number(asset.size_bytes) > MAX_PROJECT_IMAGE_BYTES
    ) {
      blockers.push("Project images must be 10 MB or smaller.");
    }
    if (
      asset.source_kind === "storage" &&
      !PROJECT_IMAGE_MIME_TYPES.has(asset.mime_type)
    ) {
      blockers.push("Choose a supported image file for every project image.");
    }
    if (asset.status === "archived") {
      blockers.push(
        "A referenced media item is hidden and cannot be published.",
      );
    }
    if (asset.media_type === "image" && !stringValue(asset.alt)) {
      blockers.push("Add a description to every referenced image.");
    }
    if (asset.source_kind === "storage") {
      const declaredBytes = Number(asset.size_bytes);
      if (!Number.isSafeInteger(declaredBytes) || declaredBytes < 0) {
        blockers.push("A referenced upload has no reliable file size.");
      } else {
        declaredStorageBytes += declaredBytes;
      }
      if (
        asset.bucket !== PRIVATE_MEDIA_BUCKET &&
        !(asset.bucket === PUBLIC_MEDIA_BUCKET && asset.status === "published")
      ) {
        blockers.push("A referenced upload is not ready to publish.");
      }
    } else if (!safePublicSourceUrl(asset.source_url)) {
      blockers.push("A referenced media URL is unsafe or incomplete.");
    }
    if (blockers.length >= 3) break;
  }
  if (declaredStorageBytes > MAX_PROJECT_MEDIA_TOTAL_BYTES) {
    blockers.push("Keep the total project image payload at 100 MB or less.");
  }
  if (blockers.length) {
    throw new AdminProjectsError(409, "publish_blocked", blockers[0], {
      blockers,
    });
  }
}

async function publishAggregate(
  supabase,
  actorUserId,
  actorRole,
  input,
  media,
) {
  const newlyCreated = [];
  let promotions;
  let result;
  try {
    const publishNonce = crypto.randomUUID();
    promotions = await prepareMediaPromotions(
      supabase,
      media,
      newlyCreated,
      publishNonce,
    );
    result = await callAggregateRpc(
      supabase,
      actorUserId,
      actorRole,
      input,
      promotions,
    );
  } catch (error) {
    if (!newlyCreated.length) throw error;
    let cleanup;
    try {
      cleanup = await compensatePublicCopies(supabase, newlyCreated);
    } catch {
      cleanup = {
        removed: [],
        retained: newlyCreated.map((copy) => ({
          path: copy.path,
          reason: "cleanup_failed",
        })),
      };
    }
    const auditRecorded = await recordPublishCompensationAudit(
      supabase,
      actorUserId,
      input.projectId,
      error,
      cleanup,
    );
    const disclosure = summarizePublishCompensation(cleanup, auditRecorded);
    if (error instanceof AdminProjectsError) {
      throw new AdminProjectsError(
        error.status,
        error.code,
        `${error.message}${disclosure.warning}`,
        {
          ...(error.details || {}),
          cleanup: disclosure.summary,
        },
      );
    }
    throw new AdminProjectsError(
      502,
      "publish_failed",
      `The project was not published.${disclosure.warning}`,
      { cleanup: disclosure.summary },
    );
  }

  // Canonical publish has committed. Cleanup is intentionally outside the
  // compensation catch: a cleanup outage must never report or treat the live
  // project as rolled back.
  let cleanup;
  try {
    cleanup = await cleanupPublishedPrivateSources(
      supabase,
      actorUserId,
      result.projectId,
      promotions,
    );
  } catch {
    cleanup = {
      warnings: [
        "The project is live, but source-file cleanup needs manual review.",
      ],
    };
  }
  if (!cleanup.warnings.length) return result;
  return {
    ...result,
    warnings: cleanup.warnings,
  };
}

export function summarizePublishCompensation(cleanup, auditRecorded) {
  const removedCount = cleanup.removed.length;
  const retainedCount = cleanup.retained.length;
  const warnings = [];
  if (retainedCount > 0)
    warnings.push("Some temporary files also need manual cleanup.");
  if (!auditRecorded)
    warnings.push("The cleanup record also needs administrator review.");
  return {
    warning: warnings.length ? ` ${warnings.join(" ")}` : "",
    summary: { removedCount, retainedCount, auditRecorded },
  };
}

async function recordPublishCompensationAudit(
  supabase,
  actorUserId,
  projectId,
  originalError,
  cleanup,
) {
  try {
    const { error } = await supabase.from("admin_audit_events").insert({
      actor_user_id: actorUserId,
      action: "project.aggregate.publish_compensation",
      entity_type: "projects",
      entity_id: projectId,
      metadata: {
        originalError:
          originalError instanceof AdminProjectsError
            ? { code: originalError.code, status: originalError.status }
            : { code: "publish_failed", status: 502 },
        removed: cleanup.removed,
        retained: cleanup.retained,
        source: "functions/api/admin/projects.js",
      },
    });
    return !error;
  } catch {
    return false;
  }
}

async function cleanupPublishedPrivateSources(
  supabase,
  actorUserId,
  projectId,
  promotions,
) {
  const sources = [
    ...new Map(
      promotions
        .filter((promotion) => promotion.promotionKind === "storage_copy")
        .map((promotion) => [promotion.sourcePath, promotion]),
    ).values(),
  ];
  if (!sources.length) return { warnings: [] };

  const removed = [];
  const retained = [];
  for (const source of sources) {
    try {
      const { data: references, error: referenceError } = await supabase
        .from("media_assets")
        .select("id")
        .eq("bucket", PRIVATE_MEDIA_BUCKET)
        .eq("object_path", source.sourcePath)
        .limit(1);
      if (referenceError) {
        retained.push({
          path: source.sourcePath,
          reason: "reference_check_failed",
        });
        continue;
      }
      if ((references || []).length) {
        retained.push({ path: source.sourcePath, reason: "still_referenced" });
        continue;
      }

      const { error: removeError } = await supabase.storage
        .from(PRIVATE_MEDIA_BUCKET)
        .remove([source.sourcePath]);
      if (removeError)
        retained.push({ path: source.sourcePath, reason: "remove_failed" });
      else removed.push(source.sourcePath);
    } catch {
      retained.push({ path: source.sourcePath, reason: "cleanup_failed" });
    }
  }

  const { error: auditError } = await supabase
    .from("admin_audit_events")
    .insert({
      actor_user_id: actorUserId,
      action: "project.aggregate.media_cleanup",
      entity_type: "projects",
      entity_id: projectId,
      metadata: {
        removed,
        retained,
        source: "functions/api/admin/projects.js",
      },
    });

  const warnings = [];
  if (retained.some((item) => item.reason === "still_referenced")) {
    warnings.push(
      "Some source files were retained because they are still in use.",
    );
  }
  if (retained.some((item) => item.reason !== "still_referenced")) {
    warnings.push(
      "The project is live, but some source-file cleanup needs manual review.",
    );
  }
  if (auditError) {
    warnings.push(
      "The project is live, but its cleanup record could not be saved.",
    );
  }
  return { warnings };
}

async function prepareMediaPromotions(
  supabase,
  media,
  newlyCreated,
  publishNonce,
) {
  const promotions = [];
  let downloadedBytes = 0;
  for (const asset of media) {
    if (asset.source_kind !== "storage") {
      promotions.push({
        promotionKind: "external_reference",
        mediaAssetId: asset.id,
        sourceUpdatedAt: asset.updated_at,
      });
      continue;
    }
    if (asset.bucket === PUBLIC_MEDIA_BUCKET && asset.status === "published")
      continue;

    const sourcePath = stringValue(asset.object_path);
    if (!sourcePath || asset.bucket !== PRIVATE_MEDIA_BUCKET) {
      throw new AdminProjectsError(
        409,
        "media_not_public_ready",
        "A referenced upload is unavailable.",
      );
    }
    const { data: sourceBlob, error: sourceError } = await supabase.storage
      .from(PRIVATE_MEDIA_BUCKET)
      .download(sourcePath);
    if (sourceError || !sourceBlob) {
      throw upstreamError(
        "media_copy_failed",
        "A referenced upload could not be read.",
      );
    }
    if (sourceBlob.size > MAX_PROJECT_IMAGE_BYTES) {
      throw new AdminProjectsError(
        409,
        "media_too_large",
        "Project images must be 10 MB or smaller.",
      );
    }
    downloadedBytes += sourceBlob.size;
    if (downloadedBytes > MAX_PROJECT_MEDIA_TOTAL_BYTES) {
      throw new AdminProjectsError(
        409,
        "media_budget_exceeded",
        "Keep the total project image payload at 100 MB or less.",
      );
    }
    if (!(await isSupportedImageBlob(sourceBlob))) {
      throw new AdminProjectsError(
        409,
        "media_type_mismatch",
        "A referenced upload is not a supported image file.",
      );
    }

    const destinationPath = destinationFor(asset, sourcePath, publishNonce);
    const sourceDigest = await digestBlob(sourceBlob);
    const attemptedCopy = {
      mediaAssetId: asset.id,
      path: destinationPath,
      ownership: "ambiguous",
    };
    // Register before the cross-system write. If the request fails after the
    // object was created but before Storage returns, compensation still knows
    // which nonce-scoped destination to inspect and remove.
    newlyCreated.push(attemptedCopy);
    const upload = await supabase.storage
      .from(PUBLIC_MEDIA_BUCKET)
      .upload(destinationPath, sourceBlob, {
        cacheControl: "31536000",
        contentType:
          asset.mime_type || sourceBlob.type || "application/octet-stream",
        upsert: false,
      });

    const alreadyExists = upload.error && isAlreadyExistsError(upload.error);
    if (alreadyExists) {
      // A definite conflict proves this request did not create the object.
      newlyCreated.splice(newlyCreated.indexOf(attemptedCopy), 1);
      attemptedCopy.ownership = "not_owned";
    }
    if (upload.error && !alreadyExists) {
      throw upstreamError(
        "media_copy_failed",
        "A referenced upload could not be copied for publishing.",
      );
    }
    const createdByRequest = !upload.error;
    if (createdByRequest) attemptedCopy.ownership = "created";

    const { data: publicBlob, error: publicError } = await supabase.storage
      .from(PUBLIC_MEDIA_BUCKET)
      .download(destinationPath);
    if (
      publicError ||
      !publicBlob ||
      (await digestBlob(publicBlob)) !== sourceDigest
    ) {
      throw new AdminProjectsError(
        409,
        "media_copy_mismatch",
        "A public media copy could not be verified, so the project was not published.",
      );
    }

    promotions.push({
      promotionKind: "storage_copy",
      mediaAssetId: asset.id,
      sourceBucket: PRIVATE_MEDIA_BUCKET,
      sourcePath,
      sourceUpdatedAt: asset.updated_at,
      destinationBucket: PUBLIC_MEDIA_BUCKET,
      destinationPath,
      createdByRequest,
    });
  }
  return promotions;
}

async function compensatePublicCopies(supabase, copies) {
  const removed = [];
  const retained = [];
  for (const copy of copies) {
    const { data: references, error: referenceError } = await supabase
      .from("media_assets")
      .select("id")
      .eq("bucket", PUBLIC_MEDIA_BUCKET)
      .eq("object_path", copy.path)
      .limit(1);
    if (referenceError || (references || []).length) {
      retained.push({
        path: copy.path,
        reason: referenceError ? "reference_check_failed" : "referenced",
      });
      continue;
    }
    const { error } = await supabase.storage
      .from(PUBLIC_MEDIA_BUCKET)
      .remove([copy.path]);
    if (error) retained.push({ path: copy.path, reason: "remove_failed" });
    else removed.push(copy.path);
  }
  return { removed, retained };
}

async function callAggregateRpc(
  supabase,
  actorUserId,
  expectedActorRole,
  input,
  promotions,
) {
  const { data, error, status } = await supabase.rpc(
    "admin_project_aggregate",
    {
      p_action: input.action,
      p_project_id: input.projectId,
      p_base_revision: input.baseRevision,
      p_base_updated_at: input.baseUpdatedAt,
      p_draft: input.draft,
      p_actor_user_id: actorUserId,
      p_expected_actor_role: expectedActorRole,
      p_promotions: promotions,
    },
  );
  if (error) throw mapRpcError(error, status);
  if (!isObject(data))
    throw upstreamError(
      "aggregate_response_invalid",
      "Projects returned an invalid response.",
    );
  return data;
}

export function mapRpcError(error, responseStatus = null) {
  const messagePayload = parseJsonObject(error?.message);
  const detailPayload = parseJsonObject(error?.details);
  if (messagePayload?.code && messagePayload?.message) {
    const status =
      Number(detailPayload?.status) ||
      (Number.isInteger(responseStatus) &&
      responseStatus >= 400 &&
      responseStatus <= 599
        ? responseStatus
        : 409);
    return new AdminProjectsError(
      status,
      messagePayload.code,
      messagePayload.message,
    );
  }
  if (
    typeof error?.code === "string" &&
    error.code.includes("_") &&
    typeof error?.message === "string" &&
    error.message
  ) {
    const status =
      Number.isInteger(responseStatus) &&
      responseStatus >= 400 &&
      responseStatus <= 599
        ? responseStatus
        : 409;
    return new AdminProjectsError(status, error.code, error.message);
  }
  if (error?.code === "42501")
    return new AdminProjectsError(
      403,
      "not_allowed",
      "This action is not allowed.",
    );
  if (error?.code === "23505")
    return new AdminProjectsError(
      409,
      "duplicate_project",
      "That project page address is already in use.",
    );
  if (["22023", "23503", "23514"].includes(error?.code)) {
    return new AdminProjectsError(
      400,
      "invalid_project",
      "The project contains invalid or missing information.",
    );
  }
  return upstreamError(
    "aggregate_failed",
    "The project change could not be committed.",
  );
}

function getSupabaseConfig(env) {
  const url = (env.SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, "");
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    throw new AdminProjectsError(
      500,
      "server_not_configured",
      "The Projects workspace is not configured on this deployment.",
    );
  }
  return { url, serviceKey };
}

function createServiceClient(config) {
  return createClient(config.url, config.serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

function getBearerToken(request) {
  const match = /^Bearer\s+(.+)$/i.exec(
    request.headers.get("authorization") || "",
  );
  if (!match?.[1]) {
    throw new AdminProjectsError(
      401,
      "missing_session",
      "Sign in before opening Projects.",
    );
  }
  return match[1].trim();
}

async function requireAdminActor(supabase, accessToken) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    throw new AdminProjectsError(
      401,
      "invalid_session",
      "Sign in again before opening Projects.",
    );
  }
  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("user_id,role,is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (
    profileError ||
    !profile ||
    !["owner", "admin", "editor", "viewer"].includes(profile.role)
  ) {
    throw new AdminProjectsError(
      403,
      "not_allowed",
      "Active Projects access is required.",
    );
  }
  return { user, profile };
}

function jsonResponse(body, init = {}) {
  return new Response(init.status === 204 ? null : JSON.stringify(body), {
    status: init.status || 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "authorization, content-type",
      ...(init.headers || {}),
    },
  });
}

function validMediaBlock(block, mapKeys) {
  if (!MEDIA_ROLES.has(block.mediaRole)) return false;
  if (block.mediaRole === "youtube_video") {
    return (
      block.mediaAssetId === null &&
      block.projectMaterialMapKey === null &&
      validYouTubeUrl(block.youtubeUrl)
    );
  }
  if (block.mediaRole === "hotspot_image") {
    return (
      block.mediaAssetId === null &&
      Boolean(
        block.projectMaterialMapKey && mapKeys.has(block.projectMaterialMapKey),
      )
    );
  }
  return (
    block.projectMaterialMapKey === null &&
    positiveIntegerOrNull(block.mediaAssetId)
  );
}

function usesDirectMediaAsset(mediaRole) {
  return mediaRole !== "youtube_video" && mediaRole !== "hotspot_image";
}

function validYouTubeUrl(value) {
  return Boolean(normalizeYouTubeId(value));
}

function normalizeYouTubeId(value) {
  const source = stringValue(value);
  if (/^[A-Za-z0-9_-]{6,}$/.test(source)) return source;
  try {
    const url = new URL(source);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    let id = null;
    if (url.hostname === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] || null;
    } else if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtube-nocookie.com",
        "www.youtube-nocookie.com",
      ].includes(url.hostname)
    ) {
      id =
        url.searchParams.get("v") ||
        url.pathname.split("/").filter(Boolean).pop() ||
        null;
    }
    return id && /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

function safePublicSourceUrl(value) {
  const source = typeof value === "string" ? value : "";
  if (
    !source ||
    source !== source.trim() ||
    /[\u0000-\u001f\u007f\\]/.test(source) ||
    /%(?:0[0-9a-f]|1[0-9a-f]|7f|2e)/i.test(source)
  )
    return false;
  if (source.startsWith("/")) return !source.startsWith("//");
  try {
    const url = new URL(source);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

function destinationFor(asset, sourcePath, publishNonce) {
  const version = String(asset.updated_at || "unknown")
    .replace(/[^0-9A-Za-z]/g, "")
    .slice(0, 32);
  const nonce = String(publishNonce)
    .replace(/[^0-9A-Za-z-]/g, "")
    .slice(0, 48);
  const rawName = sourcePath.split("/").pop() || `asset-${asset.id}`;
  const fileName =
    rawName.replace(/[^0-9A-Za-z._-]/g, "-").replace(/^-+/, "") ||
    `asset-${asset.id}`;
  return `project-assets/${asset.id}/${version}/${nonce}-${fileName}`;
}

async function digestBlob(blob) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await blob.arrayBuffer(),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function isSupportedImageBlob(blob) {
  const bytes = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
  const ascii = (start, end) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return true;
  if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") return true;
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return true;
  return ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12));
}

function isAlreadyExistsError(error) {
  return (
    String(error?.statusCode || "") === "409" ||
    /already exists|duplicate|conflict/i.test(String(error?.message || ""))
  );
}

function renderableFactValue(row) {
  if (stringValue(row.factValue)) return true;
  if (typeof row.factValueJson === "string")
    return Boolean(row.factValueJson.trim());
  return (
    Array.isArray(row.factValueJson) &&
    row.factValueJson.some((value) => typeof value === "string" && value.trim())
  );
}

function uniquePositiveIds(values) {
  return [
    ...new Set(values.filter((value) => Number.isInteger(value) && value > 0)),
  ].sort((left, right) => left - right);
}

function positiveIntegerOrNull(value) {
  return Number.isInteger(value) && value > 0;
}

function inPercentRange(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}

function parsePositiveInteger(value, field) {
  const parsed =
    typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new AdminProjectsError(
      400,
      "invalid_project_id",
      `${field} must be a positive integer.`,
    );
  }
  return parsed;
}

function parseNonNegativeInteger(value, field) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new AdminProjectsError(
      400,
      "invalid_revision",
      `${field} must be a non-negative integer.`,
    );
  }
  return value;
}

function parseBaseUpdatedAt(value) {
  if (value === null) return null;
  if (
    typeof value !== "string" ||
    value.length > 64 ||
    !BASE_UPDATED_AT_PATTERN.test(value) ||
    !Number.isFinite(Date.parse(value))
  ) {
    throw new AdminProjectsError(
      400,
      "invalid_base_updated_at",
      "Reload this project before saving.",
    );
  }
  return value;
}

function persistedKey(kind, id) {
  return `${kind}:${id}`;
}

function stringValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseJsonObject(value) {
  try {
    const parsed = JSON.parse(value || "");
    return isObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function upstreamError(code, message) {
  return new AdminProjectsError(502, code, message);
}
