// Server copy of the shared content-block contract (`src/features/blocks/schema.ts` and
// `src/features/blocks/upgrade.ts`). The protected Projects Function validates every block
// with it before calling the aggregate RPC. `tests/functions-contract.test.ts` runs the
// shared fixture `tests/fixtures/content-blocks.json` through both validators and requires
// identical issue lists, so change both files and the fixture together.

export const CONTENT_BLOCK_TYPES = [
  "heading",
  "text",
  "quote",
  "callout",
  "stats",
  "steps",
  "spec_table",
  "comparison_table",
  "stone_cards",
  "image",
  "gallery",
  "hotspot_image",
  "video",
  "cta",
];

export const PROJECT_DRAFT_SCHEMA_VERSION = 2;

const TEXT_LIMITS = { title: 200, short: 400, body: 5000 };
const URL_LIMIT = 2048;

const text = (limit, required = false) => ({ kind: "text", limit, required });

/** Field order is the issue order and must match `BLOCK_SPECS` in schema.ts. */
const BLOCK_SPECS = {
  heading: { eyebrow: text("title"), title: text("title", true), intro: text("short") },
  text: { body: text("body", true) },
  quote: { quote: text("short", true), attribution: text("title"), role: text("title") },
  callout: {
    title: text("title"),
    body: text("short", true),
    tone: { kind: "enum", values: ["neutral", "lime"] },
  },
  stats: {
    items: {
      kind: "items",
      min: 1,
      max: 4,
      fields: { value: text("title", true), unit: text("title"), label: text("short", true) },
    },
    caption: text("short"),
  },
  steps: {
    intro: text("short"),
    items: {
      kind: "items",
      min: 1,
      max: 8,
      fields: {
        title: text("title", true),
        body: text("body", true),
        mediaAssetId: { kind: "id" },
        alt: text("short"),
      },
    },
  },
  spec_table: {
    title: text("title"),
    rows: {
      kind: "items",
      min: 1,
      max: 12,
      fields: { label: text("title", true), value: text("short", true) },
    },
  },
  comparison_table: {
    title: text("title"),
    columns: { kind: "strings", limit: "title", min: 2, max: 4 },
    rows: {
      kind: "items",
      min: 1,
      max: 20,
      fields: {
        label: text("title", true),
        cells: { kind: "strings", limit: "short", min: 0, max: 4 },
      },
    },
  },
  stone_cards: {
    title: text("title"),
    items: {
      kind: "items",
      min: 1,
      max: 6,
      fields: {
        stoneGroupId: { kind: "id", required: true },
        finishKey: text("title"),
        note: text("short"),
      },
    },
  },
  image: {
    mediaAssetId: { kind: "id", required: true },
    alt: text("short", true),
    caption: text("short"),
    label: text("title"),
    title: text("title"),
    presentation: { kind: "enum", values: ["photo", "drawing"], optional: true },
    legacyProjectMediaId: { kind: "legacy_id" },
  },
  gallery: {
    items: {
      kind: "items",
      min: 2,
      max: 12,
      fields: {
        mediaAssetId: { kind: "id", required: true },
        alt: text("short", true),
        caption: text("short"),
      },
    },
  },
  hotspot_image: {
    projectMaterialMapKey: { kind: "key", required: true },
    label: text("title"),
    caption: text("short"),
    title: text("title"),
    legacyProjectMediaId: { kind: "legacy_id" },
  },
  video: {
    youtubeUrl: { kind: "youtube" },
    label: text("title"),
    caption: text("short"),
    title: text("title"),
    legacyProjectMediaId: { kind: "legacy_id" },
  },
  cta: {
    title: text("title", true),
    body: text("short"),
    primary: { kind: "link" },
    secondary: { kind: "link", optional: true },
  },
};

export function isContentBlockType(value) {
  return typeof value === "string" && CONTENT_BLOCK_TYPES.includes(value);
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveId(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function hasUnsafeLinkCharacter(value) {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (character === "\\" || codePoint <= 31 || (codePoint >= 127 && codePoint <= 159)) return true;
  }
  return false;
}

/** Root-relative site path (not `//`) or an `http:`/`https:` URL. */
export function isSafeBlockHref(value) {
  const normalized = String(value).trim();
  if (!normalized || normalized.length > URL_LIMIT || hasUnsafeLinkCharacter(String(value))) return false;
  let decoded;
  try {
    decoded = decodeURIComponent(normalized);
  } catch {
    return false;
  }
  if (hasUnsafeLinkCharacter(decoded)) return false;
  if (normalized.startsWith("/")) return !normalized.startsWith("//") && !decoded.startsWith("//");
  try {
    const url = new URL(normalized);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,}$/;
const YOUTUBE_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
];

export function normalizeYouTubeId(value) {
  const source = typeof value === "string" ? value.trim() : "";
  if (!source) return null;
  if (YOUTUBE_ID.test(source)) return source;
  try {
    const url = new URL(source);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    let id = null;
    if (url.hostname === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] || null;
    } else if (YOUTUBE_HOSTS.includes(url.hostname)) {
      id = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop() || null;
    }
    return id && YOUTUBE_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

function validateText(value, spec, path, mode, issues) {
  if (value === undefined) {
    if (spec.required && mode === "publish") issues.push({ path, code: "required" });
    return;
  }
  if (typeof value !== "string") {
    issues.push({ path, code: "invalid_type" });
    return;
  }
  if (value.length > TEXT_LIMITS[spec.limit]) issues.push({ path, code: "too_long" });
  else if (spec.required && mode === "publish" && !value.trim()) issues.push({ path, code: "required" });
}

function pushUnknownFields(value, known, path, issues) {
  for (const key of Object.keys(value).sort()) {
    if (!known.includes(key)) issues.push({ path: `${path}.${key}`, code: "unknown_field" });
  }
}

function validateField(value, spec, path, mode, issues) {
  switch (spec.kind) {
    case "text":
      validateText(value, spec, path, mode, issues);
      return;
    case "id":
      if (value === undefined || value === null) {
        if (spec.required && mode === "publish") issues.push({ path, code: "required" });
      } else if (!isPositiveId(value)) {
        issues.push({ path, code: "invalid_type" });
      }
      return;
    case "legacy_id":
      if (value !== undefined && !isPositiveId(value)) issues.push({ path, code: "invalid_type" });
      return;
    case "key":
      if (value === undefined || value === null) {
        if (spec.required && mode === "publish") issues.push({ path, code: "required" });
      } else if (typeof value !== "string") {
        issues.push({ path, code: "invalid_type" });
      } else if (value.length > TEXT_LIMITS.title) {
        issues.push({ path, code: "too_long" });
      } else if (!value.trim()) {
        issues.push({ path, code: "invalid_value" });
      }
      return;
    case "enum":
      if (value === undefined && spec.optional) return;
      if (typeof value !== "string") issues.push({ path, code: "invalid_type" });
      else if (!spec.values.includes(value)) issues.push({ path, code: "invalid_value" });
      return;
    case "youtube":
      if (value === undefined) {
        if (mode === "publish") issues.push({ path, code: "required" });
      } else if (typeof value !== "string") {
        issues.push({ path, code: "invalid_type" });
      } else if (value.length > TEXT_LIMITS.short) {
        issues.push({ path, code: "too_long" });
      } else if (mode === "publish") {
        if (!value.trim()) issues.push({ path, code: "required" });
        else if (!normalizeYouTubeId(value)) issues.push({ path, code: "invalid_value" });
      }
      return;
    case "link": {
      if (value === undefined || value === null) {
        if (!spec.optional && mode === "publish") issues.push({ path, code: "required" });
        return;
      }
      if (!isPlainObject(value)) {
        issues.push({ path, code: "invalid_type" });
        return;
      }
      pushUnknownFields(value, ["label", "href"], path, issues);
      const before = issues.length;
      validateText(value.label, { limit: "title" }, `${path}.label`, mode, issues);
      if (value.href !== undefined && typeof value.href !== "string") {
        issues.push({ path: `${path}.href`, code: "invalid_type" });
      } else if (typeof value.href === "string" && value.href.length > URL_LIMIT) {
        issues.push({ path: `${path}.href`, code: "too_long" });
      }
      if (mode !== "publish" || issues.length !== before) return;
      const label = typeof value.label === "string" ? value.label.trim() : "";
      const href = typeof value.href === "string" ? value.href.trim() : "";
      if (spec.optional && !label && !href) return;
      if (!label) issues.push({ path: `${path}.label`, code: "required" });
      if (!href) issues.push({ path: `${path}.href`, code: "required" });
      else if (!isSafeBlockHref(href)) issues.push({ path: `${path}.href`, code: "invalid_value" });
      return;
    }
    case "strings": {
      if (value === undefined) {
        if (spec.min > 0 && mode === "publish") issues.push({ path, code: "too_few" });
        return;
      }
      if (!Array.isArray(value)) {
        issues.push({ path, code: "invalid_type" });
        return;
      }
      if (value.length > spec.max) {
        issues.push({ path, code: "too_many" });
        return;
      }
      if (mode === "publish" && value.length < spec.min) issues.push({ path, code: "too_few" });
      value.forEach((entry, index) =>
        validateText(entry, { limit: spec.limit, required: spec.min > 0 }, `${path}[${index}]`, mode, issues),
      );
      return;
    }
    case "items": {
      if (value === undefined) {
        if (mode === "publish") issues.push({ path, code: "too_few" });
        return;
      }
      if (!Array.isArray(value)) {
        issues.push({ path, code: "invalid_type" });
        return;
      }
      if (value.length > spec.max) {
        issues.push({ path, code: "too_many" });
        return;
      }
      if (mode === "publish" && value.length < spec.min) issues.push({ path, code: "too_few" });
      value.forEach((entry, index) => validateObject(entry, spec.fields, `${path}[${index}]`, mode, issues));
      return;
    }
    default:
      issues.push({ path, code: "invalid_value" });
  }
}

function validateObject(value, fields, path, mode, issues) {
  if (!isPlainObject(value)) {
    issues.push({ path, code: "invalid_type" });
    return;
  }
  pushUnknownFields(value, Object.keys(fields), path, issues);
  for (const [name, spec] of Object.entries(fields)) {
    validateField(value[name], spec, `${path}.${name}`, mode, issues);
  }
}

/**
 * @param {{ type: unknown, content: any }} block
 * @param {"draft" | "publish"} mode
 * @returns {Array<{ path: string, code: string }>}
 */
export function validateContentBlock(block, mode) {
  if (!isContentBlockType(block?.type)) return [{ path: "type", code: "invalid_value" }];
  const issues = [];
  validateObject(block.content, BLOCK_SPECS[block.type], "content", mode, issues);
  if (issues.length || mode !== "publish") return issues;

  if (block.type === "comparison_table") {
    block.content.rows.forEach((row, index) => {
      if (row.cells.length !== block.content.columns.length) {
        issues.push({ path: `content.rows[${index}].cells`, code: "invalid_value" });
      }
    });
  }
  if (block.type === "steps") {
    block.content.items.forEach((item, index) => {
      if (isPositiveId(item.mediaAssetId) && !(item.alt ?? "").trim()) {
        issues.push({ path: `content.items[${index}].alt`, code: "required" });
      }
    });
  }
  return issues;
}

/** Media asset IDs referenced by a block's content, in content order. */
export function blockMediaAssetIds(block) {
  const content = isPlainObject(block?.content) ? block.content : {};
  const ids = [];
  const add = (value) => {
    if (isPositiveId(value) && !ids.includes(value)) ids.push(value);
  };
  if (block?.type === "image") add(content.mediaAssetId);
  if ((block?.type === "gallery" || block?.type === "steps") && Array.isArray(content.items)) {
    for (const item of content.items) if (isPlainObject(item)) add(item.mediaAssetId);
  }
  return ids;
}

/** Stone Library stone IDs referenced by a `stone_cards` block. */
export function blockStoneGroupIds(block) {
  if (block?.type !== "stone_cards" || !isPlainObject(block.content) || !Array.isArray(block.content.items)) {
    return [];
  }
  const ids = [];
  for (const item of block.content.items) {
    if (isPlainObject(item) && isPositiveId(item.stoneGroupId) && !ids.includes(item.stoneGroupId)) {
      ids.push(item.stoneGroupId);
    }
  }
  return ids;
}

/**
 * Fills each empty image description from its media asset's description (Publish only, after
 * the referenced media rows are loaded), so editors are not asked to type it twice.
 * @param {any} block
 * @param {{ get(id: number): string | undefined }} altById
 */
export function fillBlockAltText(block, altById) {
  const fill = (target) => {
    if (!isPlainObject(target) || !isPositiveId(target.mediaAssetId)) return target;
    if (typeof target.alt === "string" && target.alt.trim()) return target;
    const alt = altById.get(target.mediaAssetId);
    return alt ? { ...target, alt } : target;
  };
  if (block?.type === "image") return { ...block, content: fill(block.content) };
  if ((block?.type === "gallery" || block?.type === "steps") && Array.isArray(block.content?.items)) {
    return { ...block, content: { ...block.content, items: block.content.items.map(fill) } };
  }
  return block;
}

const IMAGE_ROLES = new Set(["cover", "hero", "gallery", "material_map", "supporting", "normal_image"]);

function stringOrEmpty(value) {
  return typeof value === "string" ? value : "";
}

/** Mirrors `upgradeLegacyMediaBlock` in `src/features/blocks/upgrade.ts`. */
export function upgradeLegacyMediaBlock(legacy, index) {
  const legacyId = isPositiveId(legacy?.id) ? legacy.id : null;
  const provenance = legacyId ? { legacyProjectMediaId: legacyId } : {};
  const key = `block:legacy:${stringOrEmpty(legacy?.key) || `index-${index}`}`;
  const sortOrder = Number.isInteger(legacy?.sortOrder) ? legacy.sortOrder : index;
  if (legacy?.mediaRole === "youtube_video") {
    return {
      key,
      id: null,
      type: "video",
      sortOrder,
      content: {
        youtubeUrl: stringOrEmpty(legacy.youtubeUrl),
        title: stringOrEmpty(legacy.blockTitle),
        label: stringOrEmpty(legacy.label),
        caption: stringOrEmpty(legacy.caption),
        ...provenance,
      },
    };
  }
  if (legacy?.mediaRole === "hotspot_image") {
    return {
      key,
      id: null,
      type: "hotspot_image",
      sortOrder,
      content: {
        projectMaterialMapKey: stringOrEmpty(legacy.projectMaterialMapKey) || null,
        title: stringOrEmpty(legacy.blockTitle),
        label: stringOrEmpty(legacy.label),
        caption: stringOrEmpty(legacy.caption),
        ...provenance,
      },
    };
  }
  return {
    key,
    id: null,
    type: "image",
    sortOrder,
    content: {
      mediaAssetId:
        IMAGE_ROLES.has(legacy?.mediaRole) && isPositiveId(legacy?.mediaAssetId) ? legacy.mediaAssetId : null,
      alt: "",
      title: stringOrEmpty(legacy?.blockTitle),
      label: stringOrEmpty(legacy?.label),
      caption: stringOrEmpty(legacy?.caption),
      ...provenance,
    },
  };
}

/** Mirrors `upgradeLegacyProjectDraft` in `src/features/blocks/upgrade.ts`. */
export function upgradeLegacyProjectDraft(draft) {
  if (!isPlainObject(draft) || draft.schemaVersion === PROJECT_DRAFT_SCHEMA_VERSION) return draft;
  const { mediaBlocks, ...rest } = draft;
  const blocks = Array.isArray(mediaBlocks)
    ? mediaBlocks.map((entry, index) => upgradeLegacyMediaBlock(entry ?? {}, index))
    : Array.isArray(rest.blocks)
      ? rest.blocks
      : [];
  return { ...rest, schemaVersion: PROJECT_DRAFT_SCHEMA_VERSION, blocks };
}
