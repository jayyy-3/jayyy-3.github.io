// Upgrade of pre-block Project drafts (schema version 1: `mediaBlocks`) to body blocks
// (schema version 2: `blocks`). The 2026-10-14 migration reshapes stored drafts once; the
// Function and RPC repeat this for drafts sent by a cached older editor. Keep it identical
// to `upgradeLegacyMediaBlock` in `functions/_lib/blocks.js`.
import type { ContentBlock } from './schema.ts';

export const PROJECT_DRAFT_SCHEMA_VERSION = 2;

export interface LegacyMediaBlockDraft {
    key: string;
    id: number | null;
    mediaRole: string;
    mediaAssetId: number | null;
    projectMaterialMapKey: string | null;
    blockTitle: string;
    youtubeUrl: string;
    label: string;
    caption: string;
    sortOrder: number;
}

const IMAGE_ROLES = new Set(['cover', 'hero', 'gallery', 'material_map', 'supporting', 'normal_image']);

function text(value: unknown) {
    return typeof value === 'string' ? value : '';
}

function positiveId(value: unknown): number | null {
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;
}

/**
 * One legacy media block becomes one body block. The source row ID is kept as
 * `content.legacyProjectMediaId`; the block row ID is resolved by the RPC.
 */
export function upgradeLegacyMediaBlock(legacy: LegacyMediaBlockDraft, index: number): ContentBlock {
    const legacyId = positiveId(legacy.id);
    const provenance = legacyId ? { legacyProjectMediaId: legacyId } : {};
    const key = `block:legacy:${text(legacy.key) || `index-${index}`}`;
    const sortOrder = Number.isInteger(legacy.sortOrder) ? legacy.sortOrder : index;
    if (legacy.mediaRole === 'youtube_video') {
        return {
            key,
            id: null,
            type: 'video',
            sortOrder,
            content: {
                youtubeUrl: text(legacy.youtubeUrl),
                title: text(legacy.blockTitle),
                label: text(legacy.label),
                caption: text(legacy.caption),
                ...provenance,
            },
        };
    }
    if (legacy.mediaRole === 'hotspot_image') {
        return {
            key,
            id: null,
            type: 'hotspot_image',
            sortOrder,
            content: {
                projectMaterialMapKey: text(legacy.projectMaterialMapKey) || null,
                title: text(legacy.blockTitle),
                label: text(legacy.label),
                caption: text(legacy.caption),
                ...provenance,
            },
        };
    }
    return {
        key,
        id: null,
        type: 'image',
        sortOrder,
        content: {
            mediaAssetId: IMAGE_ROLES.has(legacy.mediaRole) ? positiveId(legacy.mediaAssetId) : null,
            alt: '',
            title: text(legacy.blockTitle),
            label: text(legacy.label),
            caption: text(legacy.caption),
            ...provenance,
        },
    };
}

/** True when a stored or received Project draft predates body blocks (schema version missing or 1). */
export function isLegacyProjectDraft(draft: unknown): boolean {
    if (typeof draft !== 'object' || draft === null || Array.isArray(draft)) return false;
    return (draft as Record<string, unknown>).schemaVersion !== PROJECT_DRAFT_SCHEMA_VERSION;
}

/**
 * Returns a schema-version-2 copy of a legacy draft: `mediaBlocks` become `blocks` one to one
 * and the `mediaBlocks` key is removed. Other sections are untouched. Current drafts pass through.
 */
export function upgradeLegacyProjectDraft<T extends Record<string, unknown>>(draft: T): T {
    if (!isLegacyProjectDraft(draft)) return draft;
    const { mediaBlocks, ...rest } = draft as Record<string, unknown>;
    const blocks = Array.isArray(mediaBlocks)
        ? mediaBlocks.map((entry, index) =>
            upgradeLegacyMediaBlock((entry ?? {}) as LegacyMediaBlockDraft, index))
        : Array.isArray(rest.blocks) ? rest.blocks : [];
    return { ...rest, schemaVersion: PROJECT_DRAFT_SCHEMA_VERSION, blocks } as unknown as T;
}
