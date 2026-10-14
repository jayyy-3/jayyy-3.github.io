import {
    projects as staticProjects,
    type ProjectData,
    type ProjectHotspot,
    type ProjectMaterialMap,
} from '../../data/projectData.ts';
import {
    blockMediaAssetIds,
    blockStoneGroupIds,
    normalizeYouTubeId,
    validateContentBlock,
    type ContentBlock,
    type ContentBlockContentByType,
    type ContentBlockType,
} from '../blocks/schema.ts';
import { PROJECT_DRAFT_SCHEMA_VERSION } from '../blocks/upgrade.ts';
import { resolveBlockView } from '../blocks/resolve.ts';
import { blockViewImageUrls, type ContentBlockView } from '../blocks/view.ts';

export type ProjectLifecycleStatus = 'draft' | 'published' | 'archived';
export type ProjectClaimStatus = 'needs_review' | 'approved' | 'deferred';
export type ProjectCarbonStatus = '' | 'yes' | 'no' | 'not_available' | 'tbc';
export type ProjectEditorSection = 'overview' | 'facts' | 'media' | 'materials';

/** Public fallback title for an image with material points when its block has no title. */
export const defaultMaterialPointImageTitle = 'Stone and finish placement';

export interface ProjectDraftRecord {
    id: number | null;
    status: ProjectLifecycleStatus;
    slug: string;
    title: string;
    location: string;
    projectDateLabel: string;
    completedOn: string;
    summary: string;
    lead: string;
    client: string;
    landscapeArchitect: string;
    contractor: string;
    address: string;
    quantityLabel: string;
    carbonStatus: ProjectCarbonStatus;
    carbonNote: string;
    claimReviewStatus: ProjectClaimStatus;
    heroMediaId: number | null;
    coverMediaId: number | null;
    sortOrder: number;
}

export interface ProjectFactDraft {
    key: string;
    id: number | null;
    factLabel: string;
    factValue: string;
    factValueJson: unknown | null;
    claimStatus: ProjectClaimStatus;
    sortOrder: number;
}

export interface ProjectMaterialDraft {
    key: string;
    id: number | null;
    stoneGroupId: number | null;
    stoneVariantId: number | null;
    finishDefinitionId: number | null;
    application: string;
    note: string;
    mediaAssetId: number | null;
    claimStatus: ProjectClaimStatus;
    sortOrder: number;
}

export interface ProjectMaterialMapDraft {
    key: string;
    id: number | null;
    mediaAssetId: number | null;
    title: string;
    intro: string;
    sortOrder: number;
}

/** One page-body block: stable key, `project_blocks` row ID once published, type and content. */
export type ProjectBlockDraft = ContentBlock;

export interface ProjectHotspotDraft {
    key: string;
    id: number | null;
    projectMaterialMapKey: string;
    projectMaterialKey: string | null;
    xPercent: number;
    yPercent: number;
    label: string;
    application: string;
    note: string;
    previewMediaId: number | null;
    sortOrder: number;
}

export interface ProjectAggregateDraft {
    schemaVersion: typeof PROJECT_DRAFT_SCHEMA_VERSION;
    project: ProjectDraftRecord;
    facts: ProjectFactDraft[];
    materials: ProjectMaterialDraft[];
    maps: ProjectMaterialMapDraft[];
    blocks: ProjectBlockDraft[];
    hotspots: ProjectHotspotDraft[];
}

export type ProjectOrderedCollection = 'facts' | 'materials' | 'maps' | 'blocks' | 'hotspots';
export type ProjectMoveDirection = 'up' | 'down';

export interface ProjectRowSource {
    id: number;
    slug: string;
    title: string;
    status: ProjectLifecycleStatus;
    location: string | null;
    project_date_label: string | null;
    completed_on: string | null;
    summary: string | null;
    lead: string | null;
    client: string | null;
    landscape_architect: string | null;
    contractor: string | null;
    address: string | null;
    quantity_label: string | null;
    carbon_status: Exclude<ProjectCarbonStatus, ''> | null;
    carbon_note: string | null;
    claim_review_status: ProjectClaimStatus;
    hero_media_id: number | null;
    cover_media_id: number | null;
    sort_order: number;
}

export interface ProjectFactRowSource {
    id: number;
    project_id: number;
    fact_label: string;
    fact_value: string | null;
    fact_value_json: unknown;
    claim_status: ProjectClaimStatus;
    sort_order: number;
}

export interface ProjectMaterialRowSource {
    id: number;
    project_id: number;
    stone_group_id: number | null;
    stone_variant_id: number | null;
    finish_definition_id: number | null;
    application: string;
    note: string | null;
    media_asset_id: number | null;
    claim_status: ProjectClaimStatus;
    sort_order: number;
}

export interface ProjectMaterialMapRowSource {
    id: number;
    project_id: number;
    media_asset_id: number;
    title: string | null;
    intro: string | null;
    sort_order: number;
}

export interface ProjectBlockRowSource {
    id: number;
    project_id: number;
    block_key: string;
    block_type: ContentBlockType;
    content: unknown;
    media_asset_id: number | null;
    project_material_map_id: number | null;
    sort_order: number;
}

export interface ProjectHotspotRowSource {
    id: number;
    project_material_map_id: number;
    project_material_id: number | null;
    x_percent: number;
    y_percent: number;
    label: string | null;
    application: string | null;
    note: string | null;
    preview_media_id: number | null;
    sort_order: number;
}

export interface ProjectAggregateSourceRows {
    project: ProjectRowSource;
    facts: readonly ProjectFactRowSource[];
    materials: readonly ProjectMaterialRowSource[];
    maps: readonly ProjectMaterialMapRowSource[];
    blocks: readonly ProjectBlockRowSource[];
    hotspots: readonly ProjectHotspotRowSource[];
}

export interface ProjectMediaOption {
    id: number;
    bucket: string | null;
    alt: string | null;
    caption: string | null;
    objectPath: string | null;
    sourceUrl: string | null;
    sourceKind: string;
    mediaType: string;
    status: string;
    previewUrl?: string | null;
}

export interface ProjectStoneOption {
    id: number;
    key: string;
    label: string;
    status: string;
}

export interface ProjectStoneVariantOption {
    id: number;
    stoneGroupId: number;
    key: string;
    label: string;
    status: string;
    sortOrder: number;
}

export interface ProjectStoneFinishCapabilityOption {
    stoneVariantId: number;
    finishDefinitionId: number;
    capability: 'yes' | 'no' | 'tbc';
}

export interface ProjectStoneFinishImageOption {
    stoneGroupId: number | null;
    stoneVariantId: number | null;
    finishDefinitionId: number | null;
    mediaAssetId: number;
    imageRole: 'primary' | 'secondary' | 'detail' | 'swatch';
    status: string;
    sortOrder: number;
}

export interface ProjectFinishOption {
    id: number;
    key: string;
    label: string;
    status: string;
}

export interface ProjectAggregateMappingContext {
    media: readonly ProjectMediaOption[];
    stones: readonly ProjectStoneOption[];
    stoneVariants: readonly ProjectStoneVariantOption[];
    finishes: readonly ProjectFinishOption[];
    finishCapabilities: readonly ProjectStoneFinishCapabilityOption[];
    finishImages: readonly ProjectStoneFinishImageOption[];
}

export interface ProjectPublishBlocker {
    id: string;
    section: ProjectEditorSection;
    message: string;
}

const emptyProject: ProjectDraftRecord = {
    id: null,
    status: 'draft',
    slug: '',
    title: '',
    location: '',
    projectDateLabel: '',
    completedOn: '',
    summary: '',
    lead: '',
    client: '',
    landscapeArchitect: '',
    contractor: '',
    address: '',
    quantityLabel: '',
    carbonStatus: '',
    carbonNote: '',
    claimReviewStatus: 'approved',
    heroMediaId: null,
    coverMediaId: null,
    sortOrder: 0,
};

let fallbackKeyCounter = 0;

export function createProjectDraftKey(kind: 'fact' | 'material' | 'map' | 'block' | 'hotspot') {
    const randomId = globalThis.crypto?.randomUUID?.();
    if (randomId) return `${kind}:new:${randomId}`;
    fallbackKeyCounter += 1;
    return `${kind}:new:${Date.now()}:${fallbackKeyCounter}`;
}

export function createEmptyProjectAggregateDraft(): ProjectAggregateDraft {
    return {
        schemaVersion: PROJECT_DRAFT_SCHEMA_VERSION,
        project: { ...emptyProject },
        facts: [],
        materials: [],
        maps: [],
        blocks: [],
        hotspots: [],
    };
}

export function collectProjectMediaAssetIds(draft: ProjectAggregateDraft): number[] {
    const mediaIds = new Set<number>();
    const add = (mediaId: number | null) => {
        if (mediaId && Number.isInteger(mediaId) && mediaId > 0) mediaIds.add(mediaId);
    };

    add(draft.project.heroMediaId);
    add(draft.project.coverMediaId);
    draft.maps.forEach((map) => add(map.mediaAssetId));
    draft.blocks.forEach((block) => blockMediaAssetIds(block).forEach(add));

    return [...mediaIds].sort((left, right) => left - right);
}

export function mergeProjectMediaOptions(
    current: readonly ProjectMediaOption[],
    incoming: readonly ProjectMediaOption[],
): ProjectMediaOption[] {
    const incomingById = new Map(incoming.map((asset) => [asset.id, asset]));
    const merged = current.map((asset) => {
        const replacement = incomingById.get(asset.id);
        if (!replacement) return asset;
        incomingById.delete(asset.id);
        return {
            ...replacement,
            previewUrl: replacement.previewUrl ?? asset.previewUrl ?? null,
        };
    });

    return [...merged, ...incomingById.values()];
}

export function normalizeProjectDraftOrder(draft: ProjectAggregateDraft): ProjectAggregateDraft {
    const hotspotOrderByMap = new Map<string, number>();
    return {
        ...draft,
        facts: draft.facts.map((fact, index) => ({ ...fact, sortOrder: index })),
        materials: draft.materials.map((material, index) => ({ ...material, sortOrder: index })),
        maps: draft.maps.map((map, index) => ({ ...map, sortOrder: index })),
        blocks: draft.blocks.map((block, index) => ({ ...block, sortOrder: index })),
        hotspots: draft.hotspots.map((hotspot) => {
            const sortOrder = hotspotOrderByMap.get(hotspot.projectMaterialMapKey) ?? 0;
            hotspotOrderByMap.set(hotspot.projectMaterialMapKey, sortOrder + 1);
            return { ...hotspot, sortOrder };
        }),
    };
}

type HotspotImageBlock = ContentBlock<'hotspot_image'>;
type ImageBlock = ContentBlock<'image'>;

function isHotspotImageBlock(block: ProjectBlockDraft): block is HotspotImageBlock {
    return block.type === 'hotspot_image';
}

export function normalizeProjectDraftForSave(draft: ProjectAggregateDraft): ProjectAggregateDraft {
    const pointBlockByMapKey = new Map(
        draft.blocks.flatMap((block) =>
            isHotspotImageBlock(block) && block.content.projectMaterialMapKey
                ? [[block.content.projectMaterialMapKey, block] as const]
                : []),
    );
    const materialByKey = new Map(draft.materials.map((material) => [material.key, material]));
    return normalizeProjectDraftOrder({
        ...draft,
        schemaVersion: PROJECT_DRAFT_SCHEMA_VERSION,
        project: { ...draft.project, claimReviewStatus: 'approved' },
        facts: draft.facts.map((fact) => ({ ...fact, claimStatus: 'approved' })),
        materials: draft.materials.map((material) => ({
            ...material,
            mediaAssetId: null,
            claimStatus: 'approved',
        })),
        // A map is the hidden child of the image block that carries its points: the block
        // title is the one editable title and the retired map introduction is cleared.
        maps: draft.maps.map((map) => {
            const block = pointBlockByMapKey.get(map.key);
            if (!block) return map;
            return {
                ...map,
                title: (block.content.title ?? '').trim() || defaultMaterialPointImageTitle,
                intro: '',
            };
        }),
        // An empty point use inherits its material's wording, which Publish requires.
        hotspots: draft.hotspots.map((hotspot) => ({
            ...hotspot,
            application: hotspot.application.trim()
                || (hotspot.projectMaterialKey ? materialByKey.get(hotspot.projectMaterialKey)?.application.trim() : '')
                || hotspot.application,
            label: '',
            previewMediaId: null,
        })),
    });
}

/** Image shown by an image block: a points block uses its map's image. */
export function blockImageId(draft: ProjectAggregateDraft, block: ProjectBlockDraft): number | null {
    if (isHotspotImageBlock(block)) {
        return draft.maps.find((map) => map.key === block.content.projectMaterialMapKey)?.mediaAssetId ?? null;
    }
    if (block.type === 'image') return block.content.mediaAssetId ?? null;
    return null;
}

function pointMapKeyForBlock(draft: ProjectAggregateDraft, blockKey: string): string | null {
    const block = draft.blocks.find((entry) => entry.key === blockKey);
    return block && isHotspotImageBlock(block) ? block.content.projectMaterialMapKey : null;
}

/**
 * Points on one image block in legend order. Draft array order is authoritative: reordering
 * swaps array positions and Save derives each point's sortOrder from it.
 */
export function hotspotsForBlock(draft: ProjectAggregateDraft, blockKey: string): ProjectHotspotDraft[] {
    const mapKey = pointMapKeyForBlock(draft, blockKey);
    if (!mapKey) return [];
    return draft.hotspots.filter((hotspot) => hotspot.projectMaterialMapKey === mapKey);
}

export function countHotspotsForMaterial(draft: ProjectAggregateDraft, materialKey: string): number {
    return draft.hotspots.filter((hotspot) => hotspot.projectMaterialKey === materialKey).length;
}

function legacyProvenance(content: { legacyProjectMediaId?: number }) {
    return content.legacyProjectMediaId ? { legacyProjectMediaId: content.legacyProjectMediaId } : {};
}

/** Turns an image block into a points block backed by a new map using the same image. */
export function enableBlockPoints(draft: ProjectAggregateDraft, blockKey: string): ProjectAggregateDraft {
    const block = draft.blocks.find((entry) => entry.key === blockKey);
    if (!block || block.type !== 'image') return draft;
    const map: ProjectMaterialMapDraft = {
        key: createProjectDraftKey('map'),
        id: null,
        mediaAssetId: block.content.mediaAssetId,
        title: block.content.title ?? '',
        intro: '',
        sortOrder: draft.maps.length,
    };
    const pointsBlock: HotspotImageBlock = {
        key: block.key,
        id: block.id,
        type: 'hotspot_image',
        sortOrder: block.sortOrder,
        content: {
            projectMaterialMapKey: map.key,
            title: block.content.title ?? '',
            label: block.content.label ?? '',
            caption: block.content.caption ?? '',
            ...legacyProvenance(block.content),
        },
    };
    return {
        ...draft,
        maps: [...draft.maps, map],
        blocks: draft.blocks.map((entry) => (entry.key === blockKey ? pointsBlock : entry)),
    };
}

/** Deletes a block's points and map, returning it to a plain image with the same picture. */
export function disableBlockPoints(draft: ProjectAggregateDraft, blockKey: string): ProjectAggregateDraft {
    const block = draft.blocks.find((entry) => entry.key === blockKey);
    if (!block || !isHotspotImageBlock(block) || !block.content.projectMaterialMapKey) return draft;
    const mapKey = block.content.projectMaterialMapKey;
    const map = draft.maps.find((entry) => entry.key === mapKey);
    const imageBlock: ImageBlock = {
        key: block.key,
        id: block.id,
        type: 'image',
        sortOrder: block.sortOrder,
        content: {
            mediaAssetId: map?.mediaAssetId ?? null,
            alt: '',
            title: block.content.title ?? '',
            label: block.content.label ?? '',
            caption: block.content.caption ?? '',
            ...legacyProvenance(block.content),
        },
    };
    return normalizeProjectDraftOrder({
        ...draft,
        maps: draft.maps.filter((entry) => entry.key !== mapKey),
        hotspots: draft.hotspots.filter((hotspot) => hotspot.projectMaterialMapKey !== mapKey),
        blocks: draft.blocks.map((entry) => (entry.key === blockKey ? imageBlock : entry)),
    });
}

/**
 * Replaces an image block's picture; points keep their percentage positions. A plain image's
 * description is cleared because it described the previous picture.
 */
export function setBlockImage(
    draft: ProjectAggregateDraft,
    blockKey: string,
    mediaAssetId: number | null,
    alt = '',
): ProjectAggregateDraft {
    const mapKey = pointMapKeyForBlock(draft, blockKey);
    if (mapKey) {
        return {
            ...draft,
            maps: draft.maps.map((map) => (map.key === mapKey ? { ...map, mediaAssetId } : map)),
        };
    }
    return {
        ...draft,
        blocks: draft.blocks.map((block) =>
            block.key === blockKey && block.type === 'image'
                ? { ...block, content: { ...block.content, mediaAssetId, alt } }
                : block),
    };
}

/** Replaces one block's content (type-checked by the caller's block). */
export function updateBlockContent<T extends ContentBlockType>(
    draft: ProjectAggregateDraft,
    blockKey: string,
    content: ContentBlockContentByType[T],
): ProjectAggregateDraft {
    return {
        ...draft,
        blocks: draft.blocks.map((block) =>
            block.key === blockKey ? ({ ...block, content } as ProjectBlockDraft) : block),
    };
}

/** Removes a block; a points block also removes its map and points. */
export function removeBlock(draft: ProjectAggregateDraft, blockKey: string): ProjectAggregateDraft {
    if (!draft.blocks.some((block) => block.key === blockKey)) return draft;
    const mapKey = pointMapKeyForBlock(draft, blockKey);
    return normalizeProjectDraftOrder({
        ...draft,
        blocks: draft.blocks.filter((block) => block.key !== blockKey),
        maps: mapKey ? draft.maps.filter((map) => map.key !== mapKey) : draft.maps,
        hotspots: mapKey ? draft.hotspots.filter((hotspot) => hotspot.projectMaterialMapKey !== mapKey) : draft.hotspots,
    });
}

/**
 * Load-time adoption of maps created by the former separate map editor: every map that
 * no points block references gets its own points block appended in map order (the same
 * position the public page already gives it), and a points block with no title of its
 * own takes its map title so the public heading is unchanged. Idempotent.
 */
export function adoptLegacyMaterialMaps(draft: ProjectAggregateDraft): ProjectAggregateDraft {
    const mapByKey = new Map(draft.maps.map((map) => [map.key, map]));
    const linkedMapKeys = new Set<string>();
    let changed = false;
    const blocks = draft.blocks.map((block): ProjectBlockDraft => {
        if (!isHotspotImageBlock(block) || !block.content.projectMaterialMapKey) return block;
        const map = mapByKey.get(block.content.projectMaterialMapKey);
        if (!map) return block;
        linkedMapKeys.add(map.key);
        if ((block.content.title ?? '').trim() || !map.title.trim()) return block;
        changed = true;
        return { ...block, content: { ...block.content, title: map.title } };
    });
    for (const map of draft.maps) {
        if (linkedMapKeys.has(map.key)) continue;
        changed = true;
        linkedMapKeys.add(map.key);
        blocks.push({
            key: createProjectDraftKey('block'),
            id: null,
            type: 'hotspot_image',
            sortOrder: blocks.length,
            content: { projectMaterialMapKey: map.key, title: map.title, label: '', caption: '' },
        });
    }
    return changed ? { ...draft, blocks } : draft;
}

export function moveProjectDraftItem(
    draft: ProjectAggregateDraft,
    collection: ProjectOrderedCollection,
    key: string,
    direction: ProjectMoveDirection,
): ProjectAggregateDraft {
    if (collection === 'hotspots') {
        const currentIndex = draft.hotspots.findIndex((hotspot) => hotspot.key === key);
        if (currentIndex < 0) return draft;

        const current = draft.hotspots[currentIndex];
        const siblingIndexes = draft.hotspots.flatMap((hotspot, index) =>
            hotspot.projectMaterialMapKey === current.projectMaterialMapKey ? [index] : [],
        );
        const siblingIndex = siblingIndexes.indexOf(currentIndex);
        const targetSiblingIndex = siblingIndex + (direction === 'up' ? -1 : 1);
        const targetIndex = siblingIndexes[targetSiblingIndex];
        if (targetIndex === undefined) return draft;

        const hotspots = [...draft.hotspots];
        [hotspots[currentIndex], hotspots[targetIndex]] = [hotspots[targetIndex], hotspots[currentIndex]];
        return normalizeProjectDraftOrder({ ...draft, hotspots });
    }

    const rows = draft[collection];
    const currentIndex = rows.findIndex((row) => row.key === key);
    const targetIndex = currentIndex + (direction === 'up' ? -1 : 1);
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= rows.length) return draft;

    const nextRows = [...rows];
    [nextRows[currentIndex], nextRows[targetIndex]] = [nextRows[targetIndex], nextRows[currentIndex]];

    switch (collection) {
        case 'facts':
            return normalizeProjectDraftOrder({ ...draft, facts: nextRows as ProjectFactDraft[] });
        case 'materials':
            return normalizeProjectDraftOrder({ ...draft, materials: nextRows as ProjectMaterialDraft[] });
        case 'maps':
            return normalizeProjectDraftOrder({ ...draft, maps: nextRows as ProjectMaterialMapDraft[] });
        case 'blocks':
            return normalizeProjectDraftOrder({ ...draft, blocks: nextRows as ProjectBlockDraft[] });
    }
}

export function rowsToProjectAggregateDraft(rows: ProjectAggregateSourceRows): ProjectAggregateDraft {
    const mapKeyById = new Map(rows.maps.map((map) => [map.id, persistedKey('map', map.id)]));
    const materialKeyById = new Map(
        rows.materials.map((material) => [material.id, persistedKey('material', material.id)]),
    );

    return {
        schemaVersion: PROJECT_DRAFT_SCHEMA_VERSION,
        project: {
            id: rows.project.id,
            status: rows.project.status,
            slug: rows.project.slug,
            title: rows.project.title,
            location: rows.project.location ?? '',
            projectDateLabel: rows.project.project_date_label ?? '',
            completedOn: rows.project.completed_on ?? '',
            summary: rows.project.summary ?? '',
            lead: rows.project.lead ?? '',
            client: rows.project.client ?? '',
            landscapeArchitect: rows.project.landscape_architect ?? '',
            contractor: rows.project.contractor ?? '',
            address: rows.project.address ?? '',
            quantityLabel: rows.project.quantity_label ?? '',
            carbonStatus: rows.project.carbon_status ?? '',
            carbonNote: rows.project.carbon_note ?? '',
            claimReviewStatus: rows.project.claim_review_status,
            heroMediaId: rows.project.hero_media_id,
            coverMediaId: rows.project.cover_media_id,
            sortOrder: rows.project.sort_order,
        },
        facts: rows.facts.map((fact) => ({
            key: persistedKey('fact', fact.id),
            id: fact.id,
            factLabel: fact.fact_label,
            factValue: fact.fact_value ?? '',
            factValueJson: fact.fact_value_json ?? null,
            claimStatus: fact.claim_status,
            sortOrder: fact.sort_order,
        })),
        materials: rows.materials.map((material) => ({
            key: persistedKey('material', material.id),
            id: material.id,
            stoneGroupId: material.stone_group_id,
            stoneVariantId: material.stone_variant_id,
            finishDefinitionId: material.finish_definition_id,
            application: material.application,
            note: material.note ?? '',
            mediaAssetId: material.media_asset_id,
            claimStatus: material.claim_status,
            sortOrder: material.sort_order,
        })),
        maps: rows.maps.map((map) => ({
            key: persistedKey('map', map.id),
            id: map.id,
            mediaAssetId: map.media_asset_id,
            title: map.title ?? '',
            intro: map.intro ?? '',
            sortOrder: map.sort_order,
        })),
        blocks: rows.blocks.map((row) => canonicalBlockDraft(row, mapKeyById)),
        hotspots: rows.hotspots.flatMap((hotspot) => {
            const projectMaterialMapKey = mapKeyById.get(hotspot.project_material_map_id);
            if (!projectMaterialMapKey) return [];

            return [{
                key: persistedKey('hotspot', hotspot.id),
                id: hotspot.id,
                projectMaterialMapKey,
                projectMaterialKey: hotspot.project_material_id
                    ? (materialKeyById.get(hotspot.project_material_id) ?? null)
                    : null,
                xPercent: clampPercent(hotspot.x_percent),
                yPercent: clampPercent(hotspot.y_percent),
                label: hotspot.label ?? '',
                application: hotspot.application ?? '',
                note: hotspot.note ?? '',
                previewMediaId: hotspot.preview_media_id,
                sortOrder: hotspot.sort_order,
            }];
        }),
    };
}

export function draftToProjectData(
    draft: ProjectAggregateDraft,
    context: ProjectAggregateMappingContext,
): ProjectData {
    const mediaById = new Map(context.media.map((asset) => [asset.id, asset]));
    const stoneById = new Map(context.stones.map((stone) => [stone.id, stone]));
    const finishById = new Map(context.finishes.map((finish) => [finish.id, finish]));
    const variantById = new Map(context.stoneVariants.map((variant) => [variant.id, variant]));
    const materialByKey = new Map(
        draft.materials.map((material) => [material.key, material]),
    );
    const mapByKey = new Map(draft.maps.map((map) => [map.key, map]));
    const mediaUrl = (mediaId: number | null | undefined) => {
        if (!mediaId) return '';
        const media = mediaById.get(mediaId);
        return media?.previewUrl || media?.sourceUrl || '';
    };
    const mediaAlt = (mediaId: number | null, fallback: string) => {
        if (!mediaId) return fallback;
        return mediaById.get(mediaId)?.alt?.trim() || fallback;
    };
    const projectTitle = draft.project.title.trim() || 'Untitled project';
    const projectSlug = draft.project.slug.trim() || slugify(projectTitle) || 'project-preview';
    const staticFallback = staticProjects.find((project) => project.slug === projectSlug);
    const coverId = draft.project.coverMediaId ?? draft.project.heroMediaId;
    const heroId = draft.project.heroMediaId ?? draft.project.coverMediaId;
    const coverUrl = mediaUrl(coverId) || '/media/launch/contact/project-contact.jpg';
    const heroUrl = mediaUrl(heroId) || coverUrl;
    const details = buildProjectDetails(draft);

    const mapHotspots = (mapKey: string): ProjectHotspot[] =>
        draft.hotspots.flatMap((hotspot) => {
            if (hotspot.projectMaterialMapKey !== mapKey || !hotspot.projectMaterialKey) return [];
            const material = materialByKey.get(hotspot.projectMaterialKey);
            if (!material?.stoneGroupId || !material.stoneVariantId || !material.finishDefinitionId) return [];
            const stone = stoneById.get(material.stoneGroupId);
            const variant = variantById.get(material.stoneVariantId);
            const finish = finishById.get(material.finishDefinitionId);
            if (!stone || !variant || !finish) return [];
            const finishImage = context.finishImages
                .filter((image) => image.status !== 'archived')
                .filter((image) => image.stoneGroupId === stone.id)
                .filter((image) => image.stoneVariantId === variant.id || image.stoneVariantId === null)
                .filter((image) => image.finishDefinitionId === finish.id || image.finishDefinitionId === null)
                .sort((left, right) => {
                    const leftExact = Number(left.stoneVariantId === variant.id) + Number(left.finishDefinitionId === finish.id);
                    const rightExact = Number(right.stoneVariantId === variant.id) + Number(right.finishDefinitionId === finish.id);
                    if (leftExact !== rightExact) return rightExact - leftExact;
                    if (left.imageRole !== right.imageRole) return left.imageRole === 'primary' ? -1 : 1;
                    return left.sortOrder - right.sortOrder;
                })[0];

            return [{
                id: hotspot.key,
                x: clampPercent(hotspot.xPercent),
                y: clampPercent(hotspot.yPercent),
                stoneVariantId: variant.key,
                description: hotspot.note.trim() || undefined,
                stoneGroupId: stone.key,
                finishKey: finish.key,
                application: hotspot.application.trim() || material.application.trim(),
                note: hotspot.note.trim() || material.note.trim(),
                image: mediaUrl(finishImage?.mediaAssetId ?? null) || undefined,
                imageAlt: mediaAlt(finishImage?.mediaAssetId ?? null, `${stone.label} ${finish.label} finish`),
            }];
        });

    const materialMaps = draft.maps.map((map): ProjectMaterialMap => ({
        image: mediaUrl(map.mediaAssetId),
        imageAlt: mediaAlt(map.mediaAssetId, `${projectTitle} material placement`),
        title: map.title.trim() || defaultMaterialPointImageTitle,
        intro: map.intro.trim(),
        hotspots: mapHotspots(map.key),
    }));

    const linkedMapKeys = new Set<string>();
    const blocks = draft.blocks.flatMap((block): ContentBlockView[] => {
        if (isHotspotImageBlock(block)) {
            const linkedMap = block.content.projectMaterialMapKey
                ? mapByKey.get(block.content.projectMaterialMapKey)
                : undefined;
            if (!linkedMap) return [];
            const imageId = linkedMap.mediaAssetId;
            const image = mediaUrl(imageId);
            if (!image) return [];
            linkedMapKeys.add(linkedMap.key);
            return [{
                id: block.key,
                type: 'hotspot_image',
                image,
                imageAlt: mediaAlt(imageId, `${projectTitle} material placement`),
                title: (block.content.title ?? '').trim() || linkedMap.title.trim() || defaultMaterialPointImageTitle,
                caption: (block.content.caption ?? '').trim() || undefined,
                hotspots: mapHotspots(linkedMap.key),
            }];
        }
        const view = resolveBlockView(block, block.key, {
            fallbackAlt: `${projectTitle} project image`,
            mediaUrl,
            mediaAlt: (mediaId) => (mediaId ? mediaById.get(mediaId)?.alt?.trim() ?? '' : ''),
            stoneKey: (stoneGroupId) => stoneById.get(stoneGroupId)?.key ?? null,
        });
        return view ? [view] : [];
    });

    for (const map of materialMaps) {
        const sourceMap = draft.maps[materialMaps.indexOf(map)];
        if (!sourceMap || linkedMapKeys.has(sourceMap.key) || !map.image) continue;
        blocks.push({
            id: `${sourceMap.key}:automatic`,
            type: 'hotspot_image',
            image: map.image,
            imageAlt: map.imageAlt,
            title: map.title,
            intro: map.intro || undefined,
            hotspots: map.hotspots,
        });
    }

    const materials = draft.materials.flatMap((material) => {
        if (!material.stoneGroupId || !material.stoneVariantId || !material.finishDefinitionId) return [];
        const stone = stoneById.get(material.stoneGroupId);
        const variant = context.stoneVariants.find((entry) => entry.id === material.stoneVariantId);
        const finish = finishById.get(material.finishDefinitionId);
        if (!stone || !variant || !finish) return [];
        return [{
            stoneGroupId: stone.key,
            stoneVariantId: variant.key,
            finishKey: finish.key,
            application: material.application.trim(),
            note: material.note.trim(),
        }];
    });

    const imageUrls = blockViewImageUrls(blocks)
        .filter((value, index, values) => Boolean(value) && values.indexOf(value) === index);
    const dateLabel = draft.project.projectDateLabel.trim() || draft.project.completedOn.trim();

    return {
        slug: projectSlug,
        name: projectTitle,
        images: imageUrls,
        details,
        listing: {
            title: projectTitle,
            location: draft.project.location.trim(),
            state: deriveState(draft.project.location),
            date: dateLabel,
            year: dateLabel.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? '',
            sector: staticFallback?.listing.sector ?? 'Project',
            category: staticFallback?.listing.category ?? 'Civil landscape',
            cover: coverUrl,
            imageAlt: mediaAlt(coverId, `${projectTitle} project`),
            summary: draft.project.summary.trim() || undefined,
        },
        hero: heroUrl
            ? {
                  image: heroUrl,
                  alt: mediaAlt(heroId, `${projectTitle} project`),
              }
            : undefined,
        lead: draft.project.lead.trim() || draft.project.summary.trim() || undefined,
        story: draft.project.summary.trim() ? [draft.project.summary.trim()] : undefined,
        materialMap: materialMaps.find((map) => Boolean(map.image)) ?? undefined,
        blocks,
        materials,
        cta: staticFallback?.cta,
        contentSource: 'cms',
    };
}

export function getProjectPublishBlockers(
    draft: ProjectAggregateDraft,
    context: ProjectAggregateMappingContext,
): ProjectPublishBlocker[] {
    return collectProjectPublishBlockers(draft, context).slice(0, 3);
}

/** Editor sections holding at least one publish blocker, including those past the first three. */
export function getProjectBlockerSections(
    draft: ProjectAggregateDraft,
    context: ProjectAggregateMappingContext,
): Set<ProjectEditorSection> {
    return new Set(collectProjectPublishBlockers(draft, context).map((blocker) => blocker.section));
}

function collectProjectPublishBlockers(
    draft: ProjectAggregateDraft,
    context: ProjectAggregateMappingContext,
): ProjectPublishBlocker[] {
    const blockers: ProjectPublishBlocker[] = [];
    const add = (blocker: ProjectPublishBlocker) => {
        blockers.push(blocker);
    };
    const mediaById = new Map(context.media.map((asset) => [asset.id, asset]));

    if (!draft.project.title.trim()) {
        add({ id: 'project-title', section: 'overview', message: 'Give the project a title.' });
    } else if (!isValidSlug(draft.project.slug)) {
        add({ id: 'project-address', section: 'overview', message: 'Check the project page address.' });
    }

    if (!draft.project.summary.trim() && !draft.project.lead.trim()) {
        add({ id: 'project-introduction', section: 'overview', message: 'Add a short project introduction.' });
    }

    const heroId = draft.project.heroMediaId ?? draft.project.coverMediaId;
    if (!heroId) {
        add({ id: 'project-hero', section: 'overview', message: 'Choose a main project image.' });
    } else if (!mediaById.get(heroId)?.alt?.trim()) {
        add({ id: 'project-hero-alt', section: 'overview', message: 'Choose or upload a main image with a description.' });
    }

    const incompleteFact = draft.facts.find((fact) => !fact.factLabel.trim() || factValue(fact) === null);
    if (incompleteFact) {
        add({ id: `fact-${incompleteFact.key}`, section: 'facts', message: 'Complete the label and value for each project fact.' });
    }

    const stoneById = new Map(context.stones.map((stone) => [stone.id, stone]));
    const finishById = new Map(context.finishes.map((finish) => [finish.id, finish]));
    const variantById = new Map(context.stoneVariants.map((variant) => [variant.id, variant]));
    const incompleteMaterial = draft.materials.find((material) =>
        !material.application.trim()
        || !material.stoneGroupId
        || !material.stoneVariantId
        || !material.finishDefinitionId
        || stoneById.get(material.stoneGroupId)?.status !== 'published'
        || variantById.get(material.stoneVariantId)?.status !== 'published'
        || variantById.get(material.stoneVariantId)?.stoneGroupId !== material.stoneGroupId
        || finishById.get(material.finishDefinitionId)?.status !== 'published'
        || !context.finishCapabilities.some((capability) =>
            capability.stoneVariantId === material.stoneVariantId
            && capability.finishDefinitionId === material.finishDefinitionId
            && capability.capability !== 'no')
        || !context.finishImages.some((image) =>
            image.status === 'published'
            && image.stoneGroupId === material.stoneGroupId
            && (image.stoneVariantId === material.stoneVariantId || image.stoneVariantId === null)
            && (image.finishDefinitionId === material.finishDefinitionId || image.finishDefinitionId === null)
            && mediaById.get(image.mediaAssetId)?.status === 'published')
    );
    if (incompleteMaterial) {
        add({ id: `material-${incompleteMaterial.key}`, section: 'materials', message: 'Complete the material and make its Stone Library stone, variant, finish and image Live.' });
    }

    const mapKeys = new Set(draft.maps.map((map) => map.key));
    const youtubeVideoCount = draft.blocks.filter((block) => block.type === 'video').length;
    if (youtubeVideoCount > 1) {
        add({ id: 'media-video-limit', section: 'media', message: 'Keep one YouTube video in this project.' });
    }

    // Image descriptions left empty are filled from the chosen media item on Publish.
    const withMediaAlt = (block: ProjectBlockDraft): ProjectBlockDraft => {
        const fill = <T extends { mediaAssetId?: number | null; alt?: string }>(item: T): T =>
            item.mediaAssetId && !(item.alt ?? '').trim()
                ? { ...item, alt: mediaById.get(item.mediaAssetId)?.alt?.trim() ?? '' }
                : item;
        if (block.type === 'image') return { ...block, content: fill(block.content) };
        if (block.type === 'gallery') return { ...block, content: { ...block.content, items: block.content.items.map(fill) } };
        if (block.type === 'steps') return { ...block, content: { ...block.content, items: block.content.items.map(fill) } };
        return block;
    };
    const described = (mediaId: number | null | undefined) =>
        Boolean(mediaId && mediaById.get(mediaId)?.alt?.trim());
    const incompleteMedia = draft.blocks.find((block) => {
        switch (block.type) {
            case 'hotspot_image': {
                const mapKey = block.content.projectMaterialMapKey;
                if (!mapKey || !mapKeys.has(mapKey)) return true;
                return !described(draft.maps.find((map) => map.key === mapKey)?.mediaAssetId);
            }
            case 'video':
                return !normalizeYouTubeId(block.content.youtubeUrl);
            case 'image':
                return !described(block.content.mediaAssetId);
            case 'gallery':
                return block.content.items.length < 2 || block.content.items.some((item) => !described(item.mediaAssetId));
            case 'steps':
                return block.content.items.some((item) => item.mediaAssetId && !described(item.mediaAssetId));
            default:
                return false;
        }
    });
    // Maps are hidden children of image blocks; one without an image is the same gap.
    const incompleteMap = incompleteMedia ? undefined : draft.maps.find((map) => !map.mediaAssetId);
    if (incompleteMedia || incompleteMap) {
        add({
            id: incompleteMedia ? `media-${incompleteMedia.key}` : `media-map-${incompleteMap?.key}`,
            section: 'media',
            message: incompleteMedia?.type === 'video'
                ? 'Add a YouTube link to every video block.'
                : 'Choose a described image for every media block.',
        });
    }

    const incompleteBlock = draft.blocks.find((block) =>
        block !== incompleteMedia && validateContentBlock(withMediaAlt(block), 'publish').length > 0);
    if (incompleteBlock) {
        add({ id: `block-${incompleteBlock.key}`, section: 'media', message: 'Complete every required field in the page body.' });
    }

    const unpublishedStoneBlock = draft.blocks.find((block) =>
        blockStoneGroupIds(block).some((stoneId) => stoneById.get(stoneId)?.status !== 'published'));
    if (unpublishedStoneBlock) {
        add({ id: `block-stone-${unpublishedStoneBlock.key}`, section: 'media', message: 'Use only Live Stone Library stones in stone cards.' });
    }

    const materialByKey = new Map(draft.materials.map((material) => [material.key, material]));
    const incompleteHotspot = draft.hotspots.find((hotspot) => {
        const material = hotspot.projectMaterialKey ? materialByKey.get(hotspot.projectMaterialKey) : undefined;
        return !mapKeys.has(hotspot.projectMaterialMapKey)
            || !material
            || (!hotspot.application.trim() && !material.application.trim());
    });
    if (incompleteHotspot) {
        add({ id: `hotspot-${incompleteHotspot.key}`, section: 'media', message: 'Connect every point to a material and say where it is used.' });
    }

    return blockers;
}

export function slugify(value: string) {
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

function persistedKey(kind: 'fact' | 'material' | 'map' | 'block' | 'hotspot', id: number) {
    return `${kind}:${id}`;
}

function isValidSlug(value: string) {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim());
}

function clampPercent(value: number) {
    if (!Number.isFinite(value)) return 50;
    return Math.min(100, Math.max(0, Math.round(value * 100) / 100));
}

function factValue(fact: ProjectFactDraft): string | string[] | null {
    if (Array.isArray(fact.factValueJson)) {
        const values = fact.factValueJson.filter((value): value is string => typeof value === 'string' && Boolean(value.trim()));
        if (values.length) return values;
    }
    if (typeof fact.factValueJson === 'string' && fact.factValueJson.trim()) return fact.factValueJson.trim();
    if (fact.factValue.trim()) return fact.factValue.trim();
    return null;
}

function buildProjectDetails(draft: ProjectAggregateDraft) {
    const details: Record<string, string | string[]> = {};
    const assign = (label: string, value: string | string[] | null | undefined) => {
        if (!label) return;
        if (Array.isArray(value) ? value.length > 0 : Boolean(value?.trim())) details[label] = value as string | string[];
    };
    const setIfMissing = (label: string, value: string | string[] | null | undefined) => {
        if (Object.prototype.hasOwnProperty.call(details, label)) return;
        assign(label, value);
    };

    draft.facts.forEach((fact) => assign(fact.factLabel.trim(), factValue(fact)));
    setIfMissing('Client', draft.project.client);
    setIfMissing('Landscape Architect', draft.project.landscapeArchitect);
    setIfMissing('Contractor', draft.project.contractor);
    setIfMissing('Date', draft.project.projectDateLabel || draft.project.completedOn);
    setIfMissing('Address', draft.project.address);
    setIfMissing('Quantity', draft.project.quantityLabel);
    if (draft.project.carbonStatus) {
        const carbonLabel: Record<Exclude<ProjectCarbonStatus, ''>, string> = {
            yes: 'Yes',
            no: 'No',
            not_available: 'Not available',
            tbc: 'To be confirmed',
        };
        const label = carbonLabel[draft.project.carbonStatus];
        setIfMissing('Carbon Offset', draft.project.carbonNote.trim() ? `${label} — ${draft.project.carbonNote.trim()}` : label);
    }
    return details;
}

function deriveState(location: string) {
    const match = location.toUpperCase().match(/\b(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)\b/);
    return match?.[1] ?? '';
}

/**
 * A published `project_blocks` row as a draft block. The row's stored key is kept; a points
 * block takes its map key from the row's map column, which is authoritative.
 */
function canonicalBlockDraft(row: ProjectBlockRowSource, mapKeyById: ReadonlyMap<number, string>): ProjectBlockDraft {
    const content = (typeof row.content === 'object' && row.content !== null && !Array.isArray(row.content)
        ? { ...(row.content as Record<string, unknown>) }
        : {}) as Record<string, unknown>;
    if (row.block_type === 'hotspot_image') {
        content.projectMaterialMapKey = row.project_material_map_id
            ? mapKeyById.get(row.project_material_map_id) ?? null
            : null;
    }
    return {
        key: row.block_key || persistedKey('block', row.id),
        id: row.id,
        type: row.block_type,
        content,
        sortOrder: row.sort_order,
    } as unknown as ProjectBlockDraft;
}
