import {
    projects as staticProjects,
    type ProjectData,
    type ProjectHotspot,
    type ProjectMaterialMap,
    type ProjectMediaBlock,
} from '../../data/projectData.ts';

export type ProjectLifecycleStatus = 'draft' | 'published' | 'archived';
export type ProjectClaimStatus = 'needs_review' | 'approved' | 'deferred';
export type ProjectCarbonStatus = '' | 'yes' | 'no' | 'not_available' | 'tbc';
export type ProjectMediaRole =
    | 'cover'
    | 'hero'
    | 'gallery'
    | 'material_map'
    | 'supporting'
    | 'normal_image'
    | 'hotspot_image'
    | 'youtube_video';

export type ProjectEditorSection = 'overview' | 'facts' | 'materials' | 'media' | 'maps';

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

export interface ProjectMediaBlockDraft {
    key: string;
    id: number | null;
    mediaRole: ProjectMediaRole;
    mediaAssetId: number | null;
    projectMaterialMapKey: string | null;
    blockTitle: string;
    youtubeUrl: string;
    label: string;
    caption: string;
    sortOrder: number;
}

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
    project: ProjectDraftRecord;
    facts: ProjectFactDraft[];
    materials: ProjectMaterialDraft[];
    maps: ProjectMaterialMapDraft[];
    mediaBlocks: ProjectMediaBlockDraft[];
    hotspots: ProjectHotspotDraft[];
}

export type ProjectOrderedCollection = 'facts' | 'materials' | 'maps' | 'mediaBlocks' | 'hotspots';
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

export interface ProjectMediaRowSource {
    id: number;
    project_id: number;
    media_asset_id: number | null;
    project_material_map_id: number | null;
    media_role: ProjectMediaRole;
    block_title: string | null;
    youtube_url: string | null;
    label: string | null;
    caption: string | null;
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
    mediaBlocks: readonly ProjectMediaRowSource[];
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

export interface ProjectFinishOption {
    id: number;
    key: string;
    label: string;
    status: string;
}

export interface ProjectAggregateMappingContext {
    media: readonly ProjectMediaOption[];
    stones: readonly ProjectStoneOption[];
    finishes: readonly ProjectFinishOption[];
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
    claimReviewStatus: 'needs_review',
    heroMediaId: null,
    coverMediaId: null,
    sortOrder: 0,
};

let fallbackKeyCounter = 0;

export function createProjectDraftKey(kind: 'fact' | 'material' | 'map' | 'media' | 'hotspot') {
    const randomId = globalThis.crypto?.randomUUID?.();
    if (randomId) return `${kind}:new:${randomId}`;
    fallbackKeyCounter += 1;
    return `${kind}:new:${Date.now()}:${fallbackKeyCounter}`;
}

export function createEmptyProjectAggregateDraft(): ProjectAggregateDraft {
    return {
        project: { ...emptyProject },
        facts: [],
        materials: [],
        maps: [],
        mediaBlocks: [],
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
    draft.materials.forEach((material) => add(material.mediaAssetId));
    draft.maps.forEach((map) => add(map.mediaAssetId));
    draft.mediaBlocks.forEach((block) => add(block.mediaAssetId));
    draft.hotspots.forEach((hotspot) => add(hotspot.previewMediaId));

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
        mediaBlocks: draft.mediaBlocks.map((mediaBlock, index) => ({ ...mediaBlock, sortOrder: index })),
        hotspots: draft.hotspots.map((hotspot) => {
            const sortOrder = hotspotOrderByMap.get(hotspot.projectMaterialMapKey) ?? 0;
            hotspotOrderByMap.set(hotspot.projectMaterialMapKey, sortOrder + 1);
            return { ...hotspot, sortOrder };
        }),
    };
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
        case 'mediaBlocks':
            return normalizeProjectDraftOrder({ ...draft, mediaBlocks: nextRows as ProjectMediaBlockDraft[] });
    }
}

export function rowsToProjectAggregateDraft(rows: ProjectAggregateSourceRows): ProjectAggregateDraft {
    const mapKeyById = new Map(rows.maps.map((map) => [map.id, persistedKey('map', map.id)]));
    const materialKeyById = new Map(
        rows.materials.map((material) => [material.id, persistedKey('material', material.id)]),
    );

    return {
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
        mediaBlocks: rows.mediaBlocks.map((mediaBlock) => ({
            key: persistedKey('media', mediaBlock.id),
            id: mediaBlock.id,
            mediaRole: mediaBlock.media_role,
            mediaAssetId: mediaBlock.media_asset_id,
            projectMaterialMapKey: mediaBlock.project_material_map_id
                ? (mapKeyById.get(mediaBlock.project_material_map_id) ?? null)
                : null,
            blockTitle: mediaBlock.block_title ?? '',
            youtubeUrl: mediaBlock.youtube_url ?? '',
            label: mediaBlock.label ?? '',
            caption: mediaBlock.caption ?? '',
            sortOrder: mediaBlock.sort_order,
        })),
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
    const materialByKey = new Map(
        draft.materials.filter((material) => material.claimStatus === 'approved').map((material) => [material.key, material]),
    );
    const mapByKey = new Map(draft.maps.map((map) => [map.key, map]));
    const mediaUrl = (mediaId: number | null) => {
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
            if (!material?.stoneGroupId || !material.finishDefinitionId) return [];
            const stone = stoneById.get(material.stoneGroupId);
            const finish = finishById.get(material.finishDefinitionId);
            if (!stone || !finish) return [];

            return [{
                id: hotspot.key,
                x: clampPercent(hotspot.xPercent),
                y: clampPercent(hotspot.yPercent),
                title: hotspot.label.trim() || undefined,
                description: hotspot.note.trim() || undefined,
                stoneGroupId: stone.key,
                finishKey: finish.key,
                application: hotspot.application.trim() || material.application.trim(),
                note: hotspot.note.trim() || material.note.trim(),
                image: mediaUrl(hotspot.previewMediaId || material.mediaAssetId) || undefined,
                imageAlt: mediaAlt(
                    hotspot.previewMediaId || material.mediaAssetId,
                    `${projectTitle} material detail`,
                ),
            }];
        });

    const materialMaps = draft.maps.map((map): ProjectMaterialMap => ({
        image: mediaUrl(map.mediaAssetId),
        imageAlt: mediaAlt(map.mediaAssetId, `${projectTitle} material placement`),
        title: map.title.trim() || 'Stone and finish placement',
        intro: map.intro.trim(),
        hotspots: mapHotspots(map.key),
    }));

    const linkedMapKeys = new Set<string>();
    const mediaBlocks = draft.mediaBlocks.flatMap((block): ProjectMediaBlock[] => {
        if (block.mediaRole === 'youtube_video') {
            const youtubeId = normalizeYouTubeId(block.youtubeUrl);
            if (!youtubeId) return [];
            return [{
                id: block.key,
                type: 'youtube_video',
                youtubeId,
                title: block.blockTitle.trim() || block.label.trim() || 'Project video',
                caption: block.caption.trim() || undefined,
            }];
        }

        if (block.mediaRole === 'hotspot_image' && block.projectMaterialMapKey) {
            const linkedMap = mapByKey.get(block.projectMaterialMapKey);
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
                title: block.blockTitle.trim() || linkedMap.title.trim() || 'Stone and finish placement',
                intro: linkedMap.intro.trim() || undefined,
                caption: block.caption.trim() || undefined,
                hotspots: mapHotspots(linkedMap.key),
            }];
        }

        const image = mediaUrl(block.mediaAssetId);
        if (!image) return [];
        return [{
            id: block.key,
            type: 'normal_image',
            src: image,
            alt: mediaAlt(block.mediaAssetId, `${projectTitle} project image`),
            title: block.blockTitle.trim() || undefined,
            label: block.label.trim() || undefined,
            caption: block.caption.trim() || undefined,
        }];
    });

    for (const map of materialMaps) {
        const sourceMap = draft.maps[materialMaps.indexOf(map)];
        if (!sourceMap || linkedMapKeys.has(sourceMap.key) || !map.image) continue;
        mediaBlocks.push({
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
        if (material.claimStatus !== 'approved') return [];
        if (!material.stoneGroupId || !material.finishDefinitionId) return [];
        const stone = stoneById.get(material.stoneGroupId);
        const finish = finishById.get(material.finishDefinitionId);
        if (!stone || !finish) return [];
        return [{
            stoneGroupId: stone.key,
            finishKey: finish.key,
            application: material.application.trim(),
            note: material.note.trim(),
            image: mediaUrl(material.mediaAssetId) || undefined,
            imageAlt: mediaAlt(material.mediaAssetId, `${stone.label} used at ${projectTitle}`),
        }];
    });

    const imageUrls = mediaBlocks.flatMap((block) => {
        if (block.type === 'normal_image') return [block.src];
        if (block.type === 'hotspot_image') return [block.image];
        return [];
    }).filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index);
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
        mediaBlocks,
        materials,
        cta: staticFallback?.cta,
        contentSource: 'cms',
    };
}

export function getProjectPublishBlockers(
    draft: ProjectAggregateDraft,
    context: ProjectAggregateMappingContext,
): ProjectPublishBlocker[] {
    const blockers: ProjectPublishBlocker[] = [];
    const add = (blocker: ProjectPublishBlocker) => {
        if (blockers.length < 3) blockers.push(blocker);
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

    if (draft.project.claimReviewStatus !== 'approved') {
        add({ id: 'project-review', section: 'overview', message: 'Approve the project proof review before publishing.' });
    }

    const incompleteFact = draft.facts.find((fact) => !fact.factLabel.trim() || factValue(fact) === null);
    if (incompleteFact) {
        add({ id: `fact-${incompleteFact.key}`, section: 'facts', message: 'Complete the label and value for each project fact.' });
    } else if (draft.facts.some((fact) => fact.claimStatus === 'needs_review')) {
        add({ id: 'facts-review', section: 'facts', message: 'Finish the proof review for the project facts.' });
    }

    const stoneById = new Map(context.stones.map((stone) => [stone.id, stone]));
    const finishById = new Map(context.finishes.map((finish) => [finish.id, finish]));
    const incompleteMaterial = draft.materials.find((material) =>
        !material.application.trim()
        || !material.stoneGroupId
        || !material.finishDefinitionId
        || stoneById.get(material.stoneGroupId)?.status !== 'published'
        || finishById.get(material.finishDefinitionId)?.status !== 'published',
    );
    if (incompleteMaterial) {
        add({ id: `material-${incompleteMaterial.key}`, section: 'materials', message: 'Complete the stone, finish and use for each material.' });
    } else if (draft.materials.some((material) => material.claimStatus === 'needs_review')) {
        add({ id: 'materials-review', section: 'materials', message: 'Finish the proof review for the material schedule.' });
    }

    const mapKeys = new Set(draft.maps.map((map) => map.key));
    const youtubeVideoCount = draft.mediaBlocks.filter((block) => block.mediaRole === 'youtube_video').length;
    if (youtubeVideoCount > 1) {
        add({ id: 'media-video-limit', section: 'media', message: 'Keep one YouTube video in this project.' });
    }

    const incompleteMedia = draft.mediaBlocks.find((block) => {
        if (block.mediaRole === 'youtube_video') return !normalizeYouTubeId(block.youtubeUrl);
        if (block.mediaRole === 'hotspot_image' && (!block.projectMaterialMapKey || !mapKeys.has(block.projectMaterialMapKey))) {
            return true;
        }
        const mediaId = block.mediaRole === 'hotspot_image' && block.projectMaterialMapKey
            ? draft.maps.find((map) => map.key === block.projectMaterialMapKey)?.mediaAssetId ?? null
            : block.mediaAssetId
              ?? (block.projectMaterialMapKey
                ? draft.maps.find((map) => map.key === block.projectMaterialMapKey)?.mediaAssetId ?? null
                : null);
        return !mediaId || !mediaById.get(mediaId)?.alt?.trim();
    });
    if (incompleteMedia) {
        add({ id: `media-${incompleteMedia.key}`, section: 'media', message: 'Choose or upload described images for every media block.' });
    }

    const incompleteMap = draft.maps.find((map) => !map.mediaAssetId || !map.title.trim());
    if (incompleteMap) {
        add({ id: `map-${incompleteMap.key}`, section: 'maps', message: 'Add an image and title to each material map.' });
    }

    const materialKeys = new Set(draft.materials.map((material) => material.key));
    const incompleteHotspot = draft.hotspots.find(
        (hotspot) => !mapKeys.has(hotspot.projectMaterialMapKey)
            || !hotspot.projectMaterialKey
            || !materialKeys.has(hotspot.projectMaterialKey)
            || !hotspot.application.trim(),
    );
    if (incompleteHotspot) {
        add({ id: `hotspot-${incompleteHotspot.key}`, section: 'maps', message: 'Connect each point to a material and describe where it is used.' });
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

function persistedKey(kind: 'fact' | 'material' | 'map' | 'media' | 'hotspot', id: number) {
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

    draft.facts
        .filter((fact) => fact.claimStatus === 'approved')
        .forEach((fact) => assign(fact.factLabel.trim(), factValue(fact)));
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

function normalizeYouTubeId(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^[a-zA-Z0-9_-]{6,}$/.test(trimmed) && !trimmed.includes('/')) return trimmed;

    try {
        const url = new URL(trimmed);
        if (url.hostname.includes('youtu.be')) return url.pathname.replace(/^\//, '') || null;
        if (url.hostname.includes('youtube.com') || url.hostname.includes('youtube-nocookie.com')) {
            const id = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop();
            return id && /^[a-zA-Z0-9_-]{6,}$/.test(id) ? id : null;
        }
    } catch {
        return null;
    }
    return null;
}
