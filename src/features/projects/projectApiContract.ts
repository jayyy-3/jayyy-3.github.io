import type {
  ProjectAggregateDraft,
  ProjectLifecycleStatus,
} from "./projectAggregate";

export interface ProjectApiResponse {
  projectId: number;
  revision: number;
  baseUpdatedAt: string | null;
  status: ProjectLifecycleStatus;
  draft: ProjectAggregateDraft;
  message?: string;
  warnings?: string[];
}

export function isProjectApiResponse(
  value: unknown,
  options: { requireMessage?: boolean } = {},
): value is ProjectApiResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ProjectApiResponse>;
  const messageIsValid = options.requireMessage
    ? typeof candidate.message === "string"
    : candidate.message === undefined || typeof candidate.message === "string";
  const warningsAreValid =
    candidate.warnings === undefined ||
    (Array.isArray(candidate.warnings) &&
      candidate.warnings.every((warning) => typeof warning === "string"));
  return (
    isPositiveInteger(candidate.projectId) &&
    Number.isInteger(candidate.revision) &&
    Number(candidate.revision) >= 0 &&
    isBaseUpdatedAt(candidate.baseUpdatedAt) &&
    (candidate.status === "draft" ||
      candidate.status === "published" ||
      candidate.status === "archived") &&
    isProjectDraft(candidate.draft) &&
    candidate.draft.project.status === candidate.status &&
    messageIsValid &&
    warningsAreValid
  );
}

function isBaseUpdatedAt(value: unknown): value is string | null {
  if (value === null) return true;
  return (
    typeof value === "string" &&
    value.length <= 64 &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    ) &&
    Number.isFinite(Date.parse(value))
  );
}

function isProjectDraft(value: unknown): value is ProjectAggregateDraft {
  if (!isRecord(value) || !isRecord(value.project)) return false;
  const project = value.project;
  const strings = [
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
  ];
  if (
    !isOptionalPositiveInteger(project.id) ||
    !isLifecycleStatus(project.status) ||
    !strings.every((field) => typeof project[field] === "string") ||
    !["", "yes", "no", "not_available", "tbc"].includes(
      String(project.carbonStatus),
    ) ||
    !isClaimStatus(project.claimReviewStatus) ||
    !isOptionalPositiveInteger(project.heroMediaId) ||
    !isOptionalPositiveInteger(project.coverMediaId) ||
    !Number.isInteger(project.sortOrder)
  )
    return false;

  return (
    isArrayOf(
      value.facts,
      (row) =>
        isDraftRow(row) &&
        typeof row.factLabel === "string" &&
        typeof row.factValue === "string" &&
        isClaimStatus(row.claimStatus),
    ) &&
    isArrayOf(
      value.materials,
      (row) =>
        isDraftRow(row) &&
        isOptionalPositiveInteger(row.stoneGroupId) &&
        isOptionalPositiveInteger(row.finishDefinitionId) &&
        typeof row.application === "string" &&
        typeof row.note === "string" &&
        isOptionalPositiveInteger(row.mediaAssetId) &&
        isClaimStatus(row.claimStatus),
    ) &&
    isArrayOf(
      value.maps,
      (row) =>
        isDraftRow(row) &&
        isOptionalPositiveInteger(row.mediaAssetId) &&
        typeof row.title === "string" &&
        typeof row.intro === "string",
    ) &&
    isArrayOf(
      value.mediaBlocks,
      (row) =>
        isDraftRow(row) &&
        [
          "cover",
          "hero",
          "gallery",
          "material_map",
          "supporting",
          "normal_image",
          "hotspot_image",
          "youtube_video",
        ].includes(String(row.mediaRole)) &&
        isOptionalPositiveInteger(row.mediaAssetId) &&
        (row.projectMaterialMapKey === null ||
          typeof row.projectMaterialMapKey === "string") &&
        ["blockTitle", "youtubeUrl", "label", "caption"].every(
          (field) => typeof row[field] === "string",
        ),
    ) &&
    isArrayOf(
      value.hotspots,
      (row) =>
        isDraftRow(row) &&
        typeof row.projectMaterialMapKey === "string" &&
        (row.projectMaterialKey === null ||
          typeof row.projectMaterialKey === "string") &&
        isPercent(row.xPercent) &&
        isPercent(row.yPercent) &&
        ["label", "application", "note"].every(
          (field) => typeof row[field] === "string",
        ) &&
        isOptionalPositiveInteger(row.previewMediaId),
    )
  );
}

function isDraftRow(value: unknown): value is Record<string, unknown> {
  return (
    isRecord(value) &&
    typeof value.key === "string" &&
    Boolean(value.key.trim()) &&
    isOptionalPositiveInteger(value.id) &&
    Number.isInteger(value.sortOrder)
  );
}

function isArrayOf(
  value: unknown,
  predicate: (row: Record<string, unknown>) => boolean,
): value is Record<string, unknown>[] {
  return (
    Array.isArray(value) &&
    value.every((row) => isRecord(row) && predicate(row))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function isOptionalPositiveInteger(value: unknown): value is number | null {
  return value === null || isPositiveInteger(value);
}

function isLifecycleStatus(value: unknown): value is ProjectLifecycleStatus {
  return value === "draft" || value === "published" || value === "archived";
}

function isClaimStatus(value: unknown) {
  return (
    value === "needs_review" || value === "approved" || value === "deferred"
  );
}

function isPercent(value: unknown) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}
