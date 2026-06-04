import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    Archive,
    CheckCircle2,
    FileText,
    MapPin,
    MousePointer2,
    Plus,
    Save,
    Search,
    ShieldAlert,
} from 'lucide-react';
import { recordAdminAuditEvent, withAuditNotice } from '../../lib/adminAudit';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';
import { CmsLiveRuleCard, CmsPublicPageLink, CmsStatusCounts, CmsStatusMeaning, CmsStatusPill, ReadinessBadge } from './AdminCmsPrimitives';

type ProjectStatus = 'draft' | 'published' | 'archived';
type ProjectListFilter = ProjectStatus | 'all';
type ClaimStatus = 'needs_review' | 'approved' | 'deferred';
type CarbonStatus = '' | 'yes' | 'no' | 'not_available' | 'tbc';
type ProjectMediaRole =
    | 'cover'
    | 'hero'
    | 'gallery'
    | 'material_map'
    | 'supporting'
    | 'normal_image'
    | 'hotspot_image'
    | 'youtube_video';

interface ProjectRow {
    id: number;
    slug: string;
    title: string;
    status: ProjectStatus;
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
    carbon_status: Exclude<CarbonStatus, ''> | null;
    carbon_note: string | null;
    claim_review_status: ClaimStatus;
    hero_media_id: number | null;
    cover_media_id: number | null;
    sort_order: number;
    published_at: string | null;
    archived_at: string | null;
    updated_at: string;
    created_at: string;
}

interface ProjectFactRow {
    id: number;
    project_id: number;
    fact_label: string;
    fact_value: string | null;
    fact_value_json: unknown;
    claim_status: ClaimStatus;
    sort_order: number;
    updated_at: string;
}

interface ProjectMaterialRow {
    id: number;
    project_id: number;
    stone_group_id: number | null;
    finish_definition_id: number | null;
    application: string;
    note: string | null;
    media_asset_id: number | null;
    claim_status: ClaimStatus;
    sort_order: number;
    updated_at: string;
}

interface ProjectMaterialMapRow {
    id: number;
    project_id: number;
    media_asset_id: number;
    title: string | null;
    intro: string | null;
    sort_order: number;
    status: ProjectStatus;
    published_at: string | null;
    archived_at: string | null;
    updated_at: string;
}

interface ProjectMediaRow {
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
    status: ProjectStatus;
    published_at: string | null;
    archived_at: string | null;
    updated_at: string;
}

interface ProjectHotspotRow {
    id: number;
    project_material_map_id: number;
    project_material_id: number | null;
    hotspot_key: string;
    x_percent: number;
    y_percent: number;
    label: string | null;
    application: string | null;
    note: string | null;
    preview_media_id: number | null;
    sort_order: number;
    status: ProjectStatus;
    published_at: string | null;
    archived_at: string | null;
    updated_at: string;
}

interface StoneOptionRow {
    id: number;
    stone_group_key: string;
    display_name: string;
    status: string;
}

interface FinishOptionRow {
    id: number;
    finish_key: string;
    display_name: string;
    status: string;
}

interface MediaOptionRow {
    id: number;
    bucket: string | null;
    alt: string | null;
    caption: string | null;
    object_path: string | null;
    source_url: string | null;
    source_kind: string;
    media_type: string;
    status: string;
}

interface ProjectFormState {
    status: ProjectStatus;
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
    carbonStatus: CarbonStatus;
    carbonNote: string;
    claimReviewStatus: ClaimStatus;
    heroMediaId: string;
    coverMediaId: string;
    sortOrder: string;
}

interface FactFormState {
    factLabel: string;
    factValue: string;
    factValueJson: string;
    claimStatus: ClaimStatus;
    sortOrder: string;
}

interface MaterialFormState {
    stoneGroupId: string;
    finishDefinitionId: string;
    application: string;
    note: string;
    mediaAssetId: string;
    claimStatus: ClaimStatus;
    sortOrder: string;
}

interface MapFormState {
    mediaAssetId: string;
    title: string;
    intro: string;
    sortOrder: string;
    status: ProjectStatus;
}

interface MediaBlockFormState {
    mediaRole: ProjectMediaRole;
    mediaAssetId: string;
    projectMaterialMapId: string;
    blockTitle: string;
    youtubeUrl: string;
    label: string;
    caption: string;
    sortOrder: string;
    status: ProjectStatus;
}

interface HotspotFormState {
    projectMaterialId: string;
    hotspotKey: string;
    xPercent: string;
    yPercent: string;
    label: string;
    application: string;
    note: string;
    previewMediaId: string;
    sortOrder: string;
    status: ProjectStatus;
}

interface PublishBlocker {
    id: string;
    area: 'project' | 'fact' | 'material';
    field?: 'title' | 'slug' | 'summary' | 'claimReview';
    label: string;
    detail: string;
    rowId?: number;
}

const emptyProjectForm: ProjectFormState = {
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
    heroMediaId: '',
    coverMediaId: '',
    sortOrder: '0',
};

const emptyFactForm: FactFormState = {
    factLabel: '',
    factValue: '',
    factValueJson: '',
    claimStatus: 'needs_review',
    sortOrder: '0',
};

const emptyMaterialForm: MaterialFormState = {
    stoneGroupId: '',
    finishDefinitionId: '',
    application: '',
    note: '',
    mediaAssetId: '',
    claimStatus: 'needs_review',
    sortOrder: '0',
};

const emptyMapForm: MapFormState = {
    mediaAssetId: '',
    title: '',
    intro: '',
    sortOrder: '0',
    status: 'draft',
};

const emptyMediaBlockForm: MediaBlockFormState = {
    mediaRole: 'normal_image',
    mediaAssetId: '',
    projectMaterialMapId: '',
    blockTitle: '',
    youtubeUrl: '',
    label: '',
    caption: '',
    sortOrder: '0',
    status: 'draft',
};

const emptyHotspotForm: HotspotFormState = {
    projectMaterialId: '',
    hotspotKey: '',
    xPercent: '',
    yPercent: '',
    label: '',
    application: '',
    note: '',
    previewMediaId: '',
    sortOrder: '0',
    status: 'draft',
};

const fieldClass =
    'mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black disabled:bg-black/[0.04] disabled:text-black/45';

export default function AdminProjectsPage() {
    return (
        <RequireAdmin>
            <AdminProjectsContent />
        </RequireAdmin>
    );
}

function AdminProjectsContent() {
    const { profile, user } = useAdminAuth();
    const canEdit = profile?.role === 'owner' || profile?.role === 'admin' || profile?.role === 'editor';
    const [projects, setProjects] = useState<ProjectRow[]>([]);
    const [facts, setFacts] = useState<ProjectFactRow[]>([]);
    const [materials, setMaterials] = useState<ProjectMaterialRow[]>([]);
    const [maps, setMaps] = useState<ProjectMaterialMapRow[]>([]);
    const [mediaBlocks, setMediaBlocks] = useState<ProjectMediaRow[]>([]);
    const [hotspots, setHotspots] = useState<ProjectHotspotRow[]>([]);
    const [stoneOptions, setStoneOptions] = useState<StoneOptionRow[]>([]);
    const [finishOptions, setFinishOptions] = useState<FinishOptionRow[]>([]);
    const [mediaOptions, setMediaOptions] = useState<MediaOptionRow[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [selectedFactId, setSelectedFactId] = useState<number | null>(null);
    const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
    const [selectedMapId, setSelectedMapId] = useState<number | null>(null);
    const [selectedMediaBlockId, setSelectedMediaBlockId] = useState<number | null>(null);
    const [selectedHotspotId, setSelectedHotspotId] = useState<number | null>(null);
    const [projectForm, setProjectForm] = useState<ProjectFormState>(emptyProjectForm);
    const [projectSearch, setProjectSearch] = useState('');
    const [projectStatusFilter, setProjectStatusFilter] = useState<ProjectListFilter>('all');
    const [factForm, setFactForm] = useState<FactFormState>(emptyFactForm);
    const [materialForm, setMaterialForm] = useState<MaterialFormState>(emptyMaterialForm);
    const [mapForm, setMapForm] = useState<MapFormState>(emptyMapForm);
    const [mediaBlockForm, setMediaBlockForm] = useState<MediaBlockFormState>(emptyMediaBlockForm);
    const [hotspotForm, setHotspotForm] = useState<HotspotFormState>(emptyHotspotForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProject, setIsSavingProject] = useState(false);
    const [isSavingFact, setIsSavingFact] = useState(false);
    const [isSavingMaterial, setIsSavingMaterial] = useState(false);
    const [isSavingMap, setIsSavingMap] = useState(false);
    const [isSavingMediaBlock, setIsSavingMediaBlock] = useState(false);
    const [isSavingHotspot, setIsSavingHotspot] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const projectEditorRef = useRef<HTMLFormElement | null>(null);
    const factsEditorRef = useRef<HTMLElement | null>(null);
    const materialsEditorRef = useRef<HTMLElement | null>(null);

    const selectedProject = useMemo(
        () => projects.find((project) => project.id === selectedProjectId) ?? null,
        [projects, selectedProjectId],
    );
    const selectedMap = useMemo(
        () => maps.find((map) => map.id === selectedMapId) ?? null,
        [maps, selectedMapId],
    );
    const selectedMediaBlock = useMemo(
        () => mediaBlocks.find((mediaBlock) => mediaBlock.id === selectedMediaBlockId) ?? null,
        [mediaBlocks, selectedMediaBlockId],
    );
    const selectedHotspot = useMemo(
        () => hotspots.find((hotspot) => hotspot.id === selectedHotspotId) ?? null,
        [hotspots, selectedHotspotId],
    );
    const selectedMapMedia = useMemo(
        () => (selectedMap ? mediaOptions.find((media) => media.id === selectedMap.media_asset_id) ?? null : null),
        [mediaOptions, selectedMap],
    );
    const selectedMapImageUrl = useMemo(() => getMediaUrl(selectedMapMedia), [selectedMapMedia]);
    const selectedCoverMedia = useMemo(
        () => findMediaOption(mediaOptions, projectForm.coverMediaId),
        [mediaOptions, projectForm.coverMediaId],
    );
    const selectedHeroMedia = useMemo(
        () => findMediaOption(mediaOptions, projectForm.heroMediaId),
        [mediaOptions, projectForm.heroMediaId],
    );
    const selectedMaterialMedia = useMemo(
        () => findMediaOption(mediaOptions, materialForm.mediaAssetId),
        [mediaOptions, materialForm.mediaAssetId],
    );
    const selectedMediaBlockAsset = useMemo(
        () => findMediaOption(mediaOptions, mediaBlockForm.mediaAssetId),
        [mediaBlockForm.mediaAssetId, mediaOptions],
    );
    const selectedMapFormMedia = useMemo(
        () => findMediaOption(mediaOptions, mapForm.mediaAssetId),
        [mapForm.mediaAssetId, mediaOptions],
    );
    const selectedHotspotPreviewMedia = useMemo(
        () => findMediaOption(mediaOptions, hotspotForm.previewMediaId),
        [hotspotForm.previewMediaId, mediaOptions],
    );
    const projectCounts = useMemo(() => summarizeProjects(projects), [projects]);
    const filteredProjects = useMemo(
        () =>
            projects.filter((project) => {
                const matchesStatus = projectStatusFilter === 'all' || project.status === projectStatusFilter;
                const search = projectSearch.trim().toLowerCase();
                const matchesSearch =
                    !search ||
                    [project.title, project.slug, project.location, project.client, project.landscape_architect]
                        .filter(Boolean)
                        .some((value) => String(value).toLowerCase().includes(search));
                return matchesStatus && matchesSearch;
            }),
        [projectSearch, projectStatusFilter, projects],
    );
    const publishBlockers = useMemo(
        () => getProjectPublishBlockers(projectForm, facts, materials),
        [facts, materials, projectForm],
    );

    const loadHotspots = useCallback(async (client: SupabaseClient, mapId: number | null, preferredHotspotId: number | null) => {
        if (!mapId) {
            setHotspots([]);
            setSelectedHotspotId(null);
            setHotspotForm(emptyHotspotForm);
            return;
        }

        const { data, error: hotspotError } = await client
            .from('project_hotspots')
            .select(
                'id,project_material_map_id,project_material_id,hotspot_key,x_percent,y_percent,label,application,note,preview_media_id,sort_order,status,published_at,archived_at,updated_at',
            )
            .eq('project_material_map_id', mapId)
            .order('sort_order', { ascending: true })
            .order('hotspot_key', { ascending: true })
            .returns<ProjectHotspotRow[]>();

        if (hotspotError) {
            throw new Error(hotspotError.message);
        }

        const rows = data ?? [];
        const nextHotspot = rows.find((hotspot) => hotspot.id === preferredHotspotId) ?? rows[0] ?? null;
        setHotspots(rows);
        setSelectedHotspotId(nextHotspot?.id ?? null);
        setHotspotForm(rowToHotspotForm(nextHotspot));
    }, []);

    const loadProjectBundle = useCallback(
        async (
            client: SupabaseClient,
            projectId: number,
            preferredMapId: number | null = null,
            preferredHotspotId: number | null = null,
        ) => {
            const [factsResult, materialsResult, mapsResult, mediaBlocksResult] = await Promise.all([
                client
                    .from('project_facts')
                    .select('id,project_id,fact_label,fact_value,fact_value_json,claim_status,sort_order,updated_at')
                    .eq('project_id', projectId)
                    .order('sort_order', { ascending: true })
                    .order('fact_label', { ascending: true })
                    .returns<ProjectFactRow[]>(),
                client
                    .from('project_materials')
                    .select(
                        'id,project_id,stone_group_id,finish_definition_id,application,note,media_asset_id,claim_status,sort_order,updated_at',
                    )
                    .eq('project_id', projectId)
                    .order('sort_order', { ascending: true })
                    .order('application', { ascending: true })
                    .returns<ProjectMaterialRow[]>(),
                client
                    .from('project_material_maps')
                    .select('id,project_id,media_asset_id,title,intro,sort_order,status,published_at,archived_at,updated_at')
                    .eq('project_id', projectId)
                    .order('sort_order', { ascending: true })
                    .returns<ProjectMaterialMapRow[]>(),
                client
                    .from('project_media')
                    .select(
                        'id,project_id,media_asset_id,project_material_map_id,media_role,block_title,youtube_url,label,caption,sort_order,status,published_at,archived_at,updated_at',
                    )
                    .eq('project_id', projectId)
                    .order('sort_order', { ascending: true })
                    .order('id', { ascending: true })
                    .returns<ProjectMediaRow[]>(),
            ]);

            if (factsResult.error) throw new Error(factsResult.error.message);
            if (materialsResult.error) throw new Error(materialsResult.error.message);
            if (mapsResult.error) throw new Error(mapsResult.error.message);
            if (mediaBlocksResult.error) throw new Error(mediaBlocksResult.error.message);

            const factRows = factsResult.data ?? [];
            const materialRows = materialsResult.data ?? [];
            const mapRows = mapsResult.data ?? [];
            const mediaBlockRows = mediaBlocksResult.data ?? [];
            const nextFact = factRows[0] ?? null;
            const nextMaterial = materialRows[0] ?? null;
            const nextMap = mapRows.find((map) => map.id === preferredMapId) ?? mapRows[0] ?? null;
            const nextMediaBlock = mediaBlockRows[0] ?? null;

            setFacts(factRows);
            setSelectedFactId(nextFact?.id ?? null);
            setFactForm(rowToFactForm(nextFact));
            setMaterials(materialRows);
            setSelectedMaterialId(nextMaterial?.id ?? null);
            setMaterialForm(rowToMaterialForm(nextMaterial));
            setMaps(mapRows);
            setSelectedMapId(nextMap?.id ?? null);
            setMapForm(rowToMapForm(nextMap));
            setMediaBlocks(mediaBlockRows);
            setSelectedMediaBlockId(nextMediaBlock?.id ?? null);
            setMediaBlockForm(rowToMediaBlockForm(nextMediaBlock));
            await loadHotspots(client, nextMap?.id ?? null, preferredHotspotId);
        },
        [loadHotspots],
    );

    const loadProjects = useCallback(
        async (preferredProjectId?: number | null) => {
            if (!supabase) {
                return;
            }

            const client: SupabaseClient = supabase;
            setIsLoading(true);
            setError(null);

            const [projectsResult, stonesResult, finishesResult, mediaResult] = await Promise.all([
                client
                    .from('projects')
                    .select(
                        'id,slug,title,status,location,project_date_label,completed_on,summary,lead,client,landscape_architect,contractor,address,quantity_label,carbon_status,carbon_note,claim_review_status,hero_media_id,cover_media_id,sort_order,published_at,archived_at,updated_at,created_at',
                    )
                    .order('sort_order', { ascending: true })
                    .order('title', { ascending: true })
                    .returns<ProjectRow[]>(),
                client
                    .from('stone_groups')
                    .select('id,stone_group_key,display_name,status')
                    .order('display_name', { ascending: true })
                    .returns<StoneOptionRow[]>(),
                client
                    .from('finish_definitions')
                    .select('id,finish_key,display_name,status')
                    .order('sort_order', { ascending: true })
                    .returns<FinishOptionRow[]>(),
                client
                    .from('media_assets')
                    .select('id,bucket,alt,caption,object_path,source_url,source_kind,media_type,status')
                    .order('updated_at', { ascending: false })
                    .limit(120)
                    .returns<MediaOptionRow[]>(),
            ]);

            if (projectsResult.error) {
                setError(projectsResult.error.message);
                setIsLoading(false);
                return;
            }

            if (stonesResult.error) {
                setError(stonesResult.error.message);
                setIsLoading(false);
                return;
            }

            if (finishesResult.error) {
                setError(finishesResult.error.message);
                setIsLoading(false);
                return;
            }

            if (mediaResult.error) {
                setError(mediaResult.error.message);
                setIsLoading(false);
                return;
            }

            const rows = projectsResult.data ?? [];
            const nextProject = rows.find((project) => project.id === preferredProjectId) ?? rows[0] ?? null;
            setProjects(rows);
            setStoneOptions(stonesResult.data ?? []);
            setFinishOptions(finishesResult.data ?? []);
            setMediaOptions(mediaResult.data ?? []);
            setSelectedProjectId(nextProject?.id ?? null);
            setProjectForm(rowToProjectForm(nextProject));

            if (!nextProject) {
                resetChildState();
                setIsLoading(false);
                return;
            }

            try {
                await loadProjectBundle(client, nextProject.id);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Project detail load failed.');
            }

            setIsLoading(false);
        },
        [loadProjectBundle],
    );

    useEffect(() => {
        void loadProjects();
    }, [loadProjects]);

    function resetChildState() {
        setFacts([]);
        setMaterials([]);
        setMaps([]);
        setMediaBlocks([]);
        setHotspots([]);
        setSelectedFactId(null);
        setSelectedMaterialId(null);
        setSelectedMapId(null);
        setSelectedMediaBlockId(null);
        setSelectedHotspotId(null);
        setFactForm(emptyFactForm);
        setMaterialForm(emptyMaterialForm);
        setMapForm(emptyMapForm);
        setMediaBlockForm(emptyMediaBlockForm);
        setHotspotForm(emptyHotspotForm);
    }

    async function selectProject(project: ProjectRow) {
        setSelectedProjectId(project.id);
        setProjectForm(rowToProjectForm(project));
        setError(null);
        setNotice(null);

        if (!supabase) {
            return;
        }

        try {
            await loadProjectBundle(supabase, project.id);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Project detail load failed.');
        }
    }

    function startNewProject() {
        setSelectedProjectId(null);
        setProjectForm(emptyProjectForm);
        resetChildState();
        setError(null);
        setNotice('New project started.');
    }

    function updateProjectField<Key extends keyof ProjectFormState>(key: Key, value: ProjectFormState[Key]) {
        setProjectForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function updateFactField<Key extends keyof FactFormState>(key: Key, value: FactFormState[Key]) {
        setFactForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function updateMaterialField<Key extends keyof MaterialFormState>(key: Key, value: MaterialFormState[Key]) {
        setMaterialForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function updateMapField<Key extends keyof MapFormState>(key: Key, value: MapFormState[Key]) {
        setMapForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function updateMediaBlockField<Key extends keyof MediaBlockFormState>(key: Key, value: MediaBlockFormState[Key]) {
        setMediaBlockForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function updateHotspotField<Key extends keyof HotspotFormState>(key: Key, value: HotspotFormState[Key]) {
        setHotspotForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    async function saveProject(nextStatus: ProjectStatus) {
        if (!supabase || !canEdit || !user) return;

        if (nextStatus === 'published') {
            const blockers = getProjectPublishBlockers(projectForm, facts, materials);
            if (blockers.length) {
                selectPublishBlocker(blockers[0]);
                setError(formatPublishBlockerError(blockers));
                setNotice(null);
                return;
            }
        }

        const validation = validateProjectForm({ ...projectForm, status: nextStatus });
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        const now = new Date().toISOString();
        const payload = {
            slug: projectForm.slug.trim(),
            title: projectForm.title.trim(),
            status: nextStatus,
            location: projectForm.location.trim() || null,
            project_date_label: projectForm.projectDateLabel.trim() || null,
            completed_on: projectForm.completedOn || null,
            summary: projectForm.summary.trim() || null,
            lead: projectForm.lead.trim() || null,
            client: projectForm.client.trim() || null,
            landscape_architect: projectForm.landscapeArchitect.trim() || null,
            contractor: projectForm.contractor.trim() || null,
            address: projectForm.address.trim() || null,
            quantity_label: projectForm.quantityLabel.trim() || null,
            carbon_status: projectForm.carbonStatus || null,
            carbon_note: projectForm.carbonNote.trim() || null,
            claim_review_status: projectForm.claimReviewStatus,
            hero_media_id: validation.heroMediaId,
            cover_media_id: validation.coverMediaId,
            sort_order: validation.sortOrder,
            updated_by: user.id,
            published_at:
                nextStatus === 'published' ? (selectedProject?.published_at ?? now) : selectedProject?.published_at,
            archived_at: nextStatus === 'archived' ? now : null,
        };

        setIsSavingProject(true);
        setError(null);
        setNotice(null);

        const response = selectedProjectId
            ? await supabase
                  .from('projects')
                  .update(payload)
                  .eq('id', selectedProjectId)
                  .select(
                      'id,slug,title,status,location,project_date_label,completed_on,summary,lead,client,landscape_architect,contractor,address,quantity_label,carbon_status,carbon_note,claim_review_status,hero_media_id,cover_media_id,sort_order,published_at,archived_at,updated_at,created_at',
                  )
                  .single<ProjectRow>()
            : await supabase
                  .from('projects')
                  .insert({ ...payload, created_by: user.id })
                  .select(
                      'id,slug,title,status,location,project_date_label,completed_on,summary,lead,client,landscape_architect,contractor,address,quantity_label,carbon_status,carbon_note,claim_review_status,hero_media_id,cover_media_id,sort_order,published_at,archived_at,updated_at,created_at',
                  )
                  .single<ProjectRow>();

        setIsSavingProject(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedProjectId
                ? nextStatus === 'published'
                    ? 'project.publish'
                    : nextStatus === 'archived'
                      ? 'project.archive'
                      : 'project.update'
                : 'project.create',
            entityType: 'projects',
            entityId: response.data.id,
            metadata: {
                slug: response.data.slug,
                status: response.data.status,
                claimReviewStatus: response.data.claim_review_status,
            },
        });
        setNotice(withAuditNotice(nextStatus === 'published' ? 'Project published.' : 'Project saved.', auditError));
        await loadProjects(response.data.id);
    }

    function selectPublishBlocker(blocker: PublishBlocker) {
        const targetRef =
            blocker.area === 'fact' ? factsEditorRef : blocker.area === 'material' ? materialsEditorRef : projectEditorRef;

        if (blocker.area === 'fact' && blocker.rowId) {
            const fact = facts.find((row) => row.id === blocker.rowId);
            if (fact) {
                setSelectedFactId(fact.id);
                setFactForm(rowToFactForm(fact));
            }
        }

        if (blocker.area === 'material' && blocker.rowId) {
            const material = materials.find((row) => row.id === blocker.rowId);
            if (material) {
                setSelectedMaterialId(material.id);
                setMaterialForm(rowToMaterialForm(material));
            }
        }

        window.setTimeout(() => targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    }

    async function handleProjectSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await saveProject(projectForm.status);
    }

    async function saveFact() {
        if (!supabase || !canEdit || !user || !selectedProject) return;

        const validation = validateFactForm(factForm);
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        const payload = {
            project_id: selectedProject.id,
            fact_label: factForm.factLabel.trim(),
            fact_value: factForm.factValue.trim() || null,
            fact_value_json: validation.factValueJson,
            claim_status: factForm.claimStatus,
            sort_order: validation.sortOrder,
            updated_by: user.id,
        };

        setIsSavingFact(true);
        setError(null);
        setNotice(null);

        const response = selectedFactId
            ? await supabase
                  .from('project_facts')
                  .update(payload)
                  .eq('id', selectedFactId)
                  .select('id,project_id,fact_label,fact_value,fact_value_json,claim_status,sort_order,updated_at')
                  .single<ProjectFactRow>()
            : await supabase
                  .from('project_facts')
                  .insert({ ...payload, created_by: user.id })
                  .select('id,project_id,fact_label,fact_value,fact_value_json,claim_status,sort_order,updated_at')
                  .single<ProjectFactRow>();

        setIsSavingFact(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedFactId ? 'project_fact.update' : 'project_fact.create',
            entityType: 'project_facts',
            entityId: response.data.id,
            metadata: {
                projectId: response.data.project_id,
                label: response.data.fact_label,
                claimStatus: response.data.claim_status,
            },
        });
        setNotice(withAuditNotice('Project fact saved.', auditError));
        await loadProjectBundle(supabase, selectedProject.id, selectedMapId, selectedHotspotId);
    }

    async function saveMaterial() {
        if (!supabase || !canEdit || !user || !selectedProject) return;

        const validation = validateMaterialForm(materialForm);
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        const payload = {
            project_id: selectedProject.id,
            stone_group_id: validation.stoneGroupId,
            finish_definition_id: validation.finishDefinitionId,
            application: materialForm.application.trim(),
            note: materialForm.note.trim() || null,
            media_asset_id: validation.mediaAssetId,
            claim_status: materialForm.claimStatus,
            sort_order: validation.sortOrder,
            updated_by: user.id,
        };

        setIsSavingMaterial(true);
        setError(null);
        setNotice(null);

        const response = selectedMaterialId
            ? await supabase
                  .from('project_materials')
                  .update(payload)
                  .eq('id', selectedMaterialId)
                  .select(
                      'id,project_id,stone_group_id,finish_definition_id,application,note,media_asset_id,claim_status,sort_order,updated_at',
                  )
                  .single<ProjectMaterialRow>()
            : await supabase
                  .from('project_materials')
                  .insert({ ...payload, created_by: user.id })
                  .select(
                      'id,project_id,stone_group_id,finish_definition_id,application,note,media_asset_id,claim_status,sort_order,updated_at',
                  )
                  .single<ProjectMaterialRow>();

        setIsSavingMaterial(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedMaterialId ? 'project_material.update' : 'project_material.create',
            entityType: 'project_materials',
            entityId: response.data.id,
            metadata: {
                projectId: response.data.project_id,
                stoneGroupId: response.data.stone_group_id,
                finishDefinitionId: response.data.finish_definition_id,
                claimStatus: response.data.claim_status,
            },
        });
        setNotice(withAuditNotice('Project material saved.', auditError));
        await loadProjectBundle(supabase, selectedProject.id, selectedMapId, selectedHotspotId);
    }

    async function saveMap(nextStatus: ProjectStatus) {
        if (!supabase || !canEdit || !user || !selectedProject) return;

        const validation = validateMapForm({ ...mapForm, status: nextStatus });
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        const now = new Date().toISOString();
        const payload = {
            project_id: selectedProject.id,
            media_asset_id: validation.mediaAssetId,
            title: mapForm.title.trim() || null,
            intro: mapForm.intro.trim() || null,
            sort_order: validation.sortOrder,
            status: nextStatus,
            updated_by: user.id,
            published_at: nextStatus === 'published' ? (selectedMap?.published_at ?? now) : selectedMap?.published_at,
            archived_at: nextStatus === 'archived' ? now : null,
        };

        setIsSavingMap(true);
        setError(null);
        setNotice(null);

        const response = selectedMapId
            ? await supabase
                  .from('project_material_maps')
                  .update(payload)
                  .eq('id', selectedMapId)
                  .select('id,project_id,media_asset_id,title,intro,sort_order,status,published_at,archived_at,updated_at')
                  .single<ProjectMaterialMapRow>()
            : await supabase
                  .from('project_material_maps')
                  .insert({ ...payload, created_by: user.id })
                  .select('id,project_id,media_asset_id,title,intro,sort_order,status,published_at,archived_at,updated_at')
                  .single<ProjectMaterialMapRow>();

        setIsSavingMap(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedMapId
                ? nextStatus === 'published'
                    ? 'project_material_map.publish'
                    : nextStatus === 'archived'
                      ? 'project_material_map.archive'
                      : 'project_material_map.update'
                : 'project_material_map.create',
            entityType: 'project_material_maps',
            entityId: response.data.id,
            metadata: {
                projectId: response.data.project_id,
                status: response.data.status,
            },
        });
        setNotice(
            withAuditNotice(nextStatus === 'published' ? 'Material map published.' : 'Material map saved.', auditError),
        );
        await loadProjectBundle(supabase, selectedProject.id, response.data.id, selectedHotspotId);
    }

    async function saveMediaBlock(nextStatus: ProjectStatus) {
        if (!supabase || !canEdit || !user || !selectedProject) return;

        const validation = validateMediaBlockForm({ ...mediaBlockForm, status: nextStatus }, maps);
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        const now = new Date().toISOString();
        const payload = {
            project_id: selectedProject.id,
            media_role: mediaBlockForm.mediaRole,
            media_asset_id: validation.mediaAssetId,
            project_material_map_id: validation.projectMaterialMapId,
            block_title: mediaBlockForm.blockTitle.trim() || null,
            youtube_url: validation.youtubeUrl,
            label: mediaBlockForm.label.trim() || null,
            caption: mediaBlockForm.caption.trim() || null,
            sort_order: validation.sortOrder,
            status: nextStatus,
            updated_by: user.id,
            published_at:
                nextStatus === 'published' ? (selectedMediaBlock?.published_at ?? now) : selectedMediaBlock?.published_at,
            archived_at: nextStatus === 'archived' ? now : null,
        };

        setIsSavingMediaBlock(true);
        setError(null);
        setNotice(null);

        const response = selectedMediaBlockId
            ? await supabase
                  .from('project_media')
                  .update(payload)
                  .eq('id', selectedMediaBlockId)
                  .select(
                      'id,project_id,media_asset_id,project_material_map_id,media_role,block_title,youtube_url,label,caption,sort_order,status,published_at,archived_at,updated_at',
                  )
                  .single<ProjectMediaRow>()
            : await supabase
                  .from('project_media')
                  .insert({ ...payload, created_by: user.id })
                  .select(
                      'id,project_id,media_asset_id,project_material_map_id,media_role,block_title,youtube_url,label,caption,sort_order,status,published_at,archived_at,updated_at',
                  )
                  .single<ProjectMediaRow>();

        setIsSavingMediaBlock(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedMediaBlockId
                ? nextStatus === 'published'
                    ? 'project_media.publish'
                    : nextStatus === 'archived'
                      ? 'project_media.archive'
                      : 'project_media.update'
                : 'project_media.create',
            entityType: 'project_media',
            entityId: response.data.id,
            metadata: {
                projectId: response.data.project_id,
                role: response.data.media_role,
                status: response.data.status,
            },
        });
        setNotice(withAuditNotice(nextStatus === 'published' ? 'Project media block published.' : 'Project media block saved.', auditError));
        await loadProjectBundle(supabase, selectedProject.id, selectedMapId, selectedHotspotId);
    }

    async function saveHotspot(nextStatus: ProjectStatus) {
        if (!supabase || !canEdit || !user || !selectedMap) return;

        const validation = validateHotspotForm({ ...hotspotForm, status: nextStatus });
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        const now = new Date().toISOString();
        const payload = {
            project_material_map_id: selectedMap.id,
            project_material_id: validation.projectMaterialId,
            hotspot_key: hotspotForm.hotspotKey.trim(),
            x_percent: validation.xPercent,
            y_percent: validation.yPercent,
            label: hotspotForm.label.trim() || null,
            application: hotspotForm.application.trim() || null,
            note: hotspotForm.note.trim() || null,
            preview_media_id: validation.previewMediaId,
            sort_order: validation.sortOrder,
            status: nextStatus,
            updated_by: user.id,
            published_at:
                nextStatus === 'published' ? (selectedHotspot?.published_at ?? now) : selectedHotspot?.published_at,
            archived_at: nextStatus === 'archived' ? now : null,
        };

        setIsSavingHotspot(true);
        setError(null);
        setNotice(null);

        const response = selectedHotspotId
            ? await supabase
                  .from('project_hotspots')
                  .update(payload)
                  .eq('id', selectedHotspotId)
                  .select(
                      'id,project_material_map_id,project_material_id,hotspot_key,x_percent,y_percent,label,application,note,preview_media_id,sort_order,status,published_at,archived_at,updated_at',
                  )
                  .single<ProjectHotspotRow>()
            : await supabase
                  .from('project_hotspots')
                  .insert({ ...payload, created_by: user.id })
                  .select(
                      'id,project_material_map_id,project_material_id,hotspot_key,x_percent,y_percent,label,application,note,preview_media_id,sort_order,status,published_at,archived_at,updated_at',
                  )
                  .single<ProjectHotspotRow>();

        setIsSavingHotspot(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedHotspotId
                ? nextStatus === 'published'
                    ? 'project_hotspot.publish'
                    : nextStatus === 'archived'
                      ? 'project_hotspot.archive'
                      : 'project_hotspot.update'
                : 'project_hotspot.create',
            entityType: 'project_hotspots',
            entityId: response.data.id,
            metadata: {
                projectMaterialMapId: response.data.project_material_map_id,
                projectMaterialId: response.data.project_material_id,
                key: response.data.hotspot_key,
                status: response.data.status,
            },
        });
        setNotice(withAuditNotice(nextStatus === 'published' ? 'Hotspot published.' : 'Hotspot saved.', auditError));
        await loadHotspots(supabase, selectedMap.id, response.data.id);
    }

    return (
        <AdminShell
            title="Projects"
            eyebrow={canEdit ? 'Admin/Editor' : 'Read only'}
            actions={
                <button
                    type="button"
                    onClick={startNewProject}
                    disabled={!canEdit}
                    className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                >
                    <Plus className="h-4 w-4" />
                    New project
                </button>
            }
        >
            <div className="grid gap-5 xl:grid-cols-[minmax(280px,390px)_minmax(0,1fr)_380px]">
                <section className="border border-black/10 bg-white">
                    <div className="border-b border-black/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            Project records
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-black">{projects.length} projects</h2>
                        <p className="mt-2 text-sm leading-6 text-black/55">
                            {projectCounts.published} published, {projectCounts.draft} draft, {projectCounts.archived}{' '}
                            archived.
                        </p>
                        <div className="mt-4">
                            <CmsStatusCounts
                                draft={projectCounts.draft}
                                published={projectCounts.published}
                                archived={projectCounts.archived}
                            />
                        </div>
                        <label className="mt-4 flex min-h-11 items-center gap-2 border border-black/10 bg-[#f8f9f5] px-3 text-sm text-black">
                            <Search className="h-4 w-4 shrink-0 text-black/42" />
                            <input
                                value={projectSearch}
                                onChange={(event) => setProjectSearch(event.target.value)}
                                placeholder="Search projects, slug, location, client"
                                className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-black/36"
                            />
                        </label>
                        <div className="mt-3 grid grid-cols-4 gap-1">
                            {(['all', 'published', 'draft', 'archived'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setProjectStatusFilter(filter)}
                                    className={[
                                        'min-h-9 rounded border px-2 text-[11px] font-bold uppercase tracking-[0.1em] transition',
                                        projectStatusFilter === filter
                                            ? 'border-black bg-black text-white'
                                            : 'border-black/10 bg-white text-black/55 hover:border-black',
                                    ].join(' ')}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="max-h-[760px] overflow-auto">
                        {isLoading ? (
                            <div className="space-y-3 p-4">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-20 animate-pulse rounded border border-black/10 bg-black/[0.04]"
                                    />
                                ))}
                            </div>
                        ) : filteredProjects.length ? (
                            <div className="divide-y divide-black/10">
                                {filteredProjects.map((project) => {
                                    const rowNeedsReview = project.claim_review_status === 'needs_review';
                                    return (
                                    <button
                                        key={project.id}
                                        type="button"
                                        onClick={() => void selectProject(project)}
                                        className={[
                                            'block w-full p-4 text-left transition hover:bg-[#f8f9f5]',
                                            selectedProjectId === project.id ? 'bg-[#f8f9f5]' : 'bg-white',
                                        ].join(' ')}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-semibold text-black">
                                                    {project.title}
                                                </span>
                                                <span className="mt-1 block truncate text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                                    {project.slug} / {project.location ?? 'Location TBC'}
                                                </span>
                                            </span>
                                            <CmsStatusPill status={project.status} />
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <ReadinessBadge ready={!rowNeedsReview} />
                                            <span className="text-xs font-semibold text-black/45">
                                                {rowNeedsReview
                                                    ? 'Claims must be approved or deferred before publish.'
                                                    : 'Project claims reviewed.'}
                                            </span>
                                        </div>
                                    </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-5">
                                <FileText className="h-5 w-5 text-black" />
                                <h2 className="mt-5 text-xl font-semibold text-black">
                                    {projects.length ? 'No matching projects' : 'No project records yet'}
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-black/58">
                                    {projects.length
                                        ? 'Clear the search or choose another status filter.'
                                        : 'Create a project record, then add facts, materials, a material map, and hotspots.'}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-5">
                    <form
                        ref={projectEditorRef}
                        onSubmit={(event) => void handleProjectSubmit(event)}
                        className="scroll-mt-5 border border-black/10 bg-white p-5 md:p-6"
                    >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Project editor
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-black">
                                    {selectedProject ? selectedProject.title : 'New project'}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-black/58">
                                    Keep case-study claims reviewed before publication. Material-map content stays
                                    structured for later public migration.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <CmsPublicPageLink
                                    href={projectForm.slug ? `/projects/${projectForm.slug}` : undefined}
                                    status={projectForm.status}
                                />
                                <CmsStatusPill status={projectForm.status} />
                            </div>
                        </div>

                        <div className="mt-5">
                            <CmsLiveRuleCard>
                                <CmsStatusMeaning compact />
                            </CmsLiveRuleCard>
                        </div>

                        <div className="mt-5">
                            <PublishReadinessPanel
                                blockers={publishBlockers}
                                disabled={!selectedProject && !projectForm.title.trim() && !projectForm.slug.trim()}
                                onSelect={selectPublishBlocker}
                            />
                        </div>

                        <div className="mt-7 grid gap-4 md:grid-cols-2">
                            <TextField
                                label="Title"
                                value={projectForm.title}
                                disabled={!canEdit || isSavingProject || isLoading}
                                required
                                onChange={(value) => updateProjectField('title', value)}
                            />
                            <TextField
                                label="Slug"
                                value={projectForm.slug}
                                disabled={!canEdit || isSavingProject || isLoading || Boolean(selectedProject)}
                                required
                                onChange={(value) => updateProjectField('slug', value)}
                            />
                            <SelectField
                                label="Status"
                                value={projectForm.status}
                                disabled={!canEdit || isSavingProject || isLoading}
                                onChange={(value) => updateProjectField('status', value as ProjectStatus)}
                                options={[
                                    ['draft', 'Draft'],
                                    ['published', 'Published'],
                                    ['archived', 'Archived'],
                                ]}
                            />
                            <SelectField
                                label="Claims checked"
                                value={projectForm.claimReviewStatus}
                                disabled={!canEdit || isSavingProject || isLoading}
                                onChange={(value) => updateProjectField('claimReviewStatus', value as ClaimStatus)}
                                options={[
                                    ['needs_review', 'Needs review'],
                                    ['approved', 'Approved'],
                                    ['deferred', 'Deferred'],
                                ]}
                            />
                            <TextField
                                label="Location"
                                value={projectForm.location}
                                disabled={!canEdit || isSavingProject || isLoading}
                                onChange={(value) => updateProjectField('location', value)}
                            />
                            <TextField
                                label="Date label"
                                value={projectForm.projectDateLabel}
                                disabled={!canEdit || isSavingProject || isLoading}
                                onChange={(value) => updateProjectField('projectDateLabel', value)}
                            />
                            <TextField
                                label="Completed on"
                                type="date"
                                value={projectForm.completedOn}
                                disabled={!canEdit || isSavingProject || isLoading}
                                onChange={(value) => updateProjectField('completedOn', value)}
                            />
                            <TextField
                                label="Sort order"
                                value={projectForm.sortOrder}
                                disabled={!canEdit || isSavingProject || isLoading}
                                inputMode="numeric"
                                onChange={(value) => updateProjectField('sortOrder', value)}
                            />
                        </div>

                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Summary
                            <textarea
                                value={projectForm.summary}
                                onChange={(event) => updateProjectField('summary', event.target.value)}
                                disabled={!canEdit || isSavingProject || isLoading}
                                rows={3}
                                className={`${fieldClass} py-3 leading-6`}
                            />
                        </label>
                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Lead
                            <textarea
                                value={projectForm.lead}
                                onChange={(event) => updateProjectField('lead', event.target.value)}
                                disabled={!canEdit || isSavingProject || isLoading}
                                rows={3}
                                className={`${fieldClass} py-3 leading-6`}
                            />
                        </label>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <TextField
                                label="Client"
                                value={projectForm.client}
                                disabled={!canEdit || isSavingProject || isLoading}
                                onChange={(value) => updateProjectField('client', value)}
                            />
                            <TextField
                                label="Landscape architect"
                                value={projectForm.landscapeArchitect}
                                disabled={!canEdit || isSavingProject || isLoading}
                                onChange={(value) => updateProjectField('landscapeArchitect', value)}
                            />
                            <TextField
                                label="Contractor"
                                value={projectForm.contractor}
                                disabled={!canEdit || isSavingProject || isLoading}
                                onChange={(value) => updateProjectField('contractor', value)}
                            />
                            <TextField
                                label="Quantity label"
                                value={projectForm.quantityLabel}
                                disabled={!canEdit || isSavingProject || isLoading}
                                onChange={(value) => updateProjectField('quantityLabel', value)}
                            />
                            <TextField
                                label="Address"
                                value={projectForm.address}
                                disabled={!canEdit || isSavingProject || isLoading}
                                onChange={(value) => updateProjectField('address', value)}
                            />
                            <SelectField
                                label="Carbon status"
                                value={projectForm.carbonStatus}
                                disabled={!canEdit || isSavingProject || isLoading}
                                onChange={(value) => updateProjectField('carbonStatus', value as CarbonStatus)}
                                options={[
                                    ['', 'Not set'],
                                    ['yes', 'Yes'],
                                    ['no', 'No'],
                                    ['not_available', 'Not available'],
                                    ['tbc', 'TBC'],
                                ]}
                            />
                            <MediaSelect
                                label="Cover image"
                                value={projectForm.coverMediaId}
                                disabled={!canEdit || isSavingProject || isLoading}
                                mediaOptions={mediaOptions}
                                selectedMedia={selectedCoverMedia}
                                emptyLabel="No cover image"
                                onChange={(value) => updateProjectField('coverMediaId', value)}
                            />
                            <MediaSelect
                                label="Hero image"
                                value={projectForm.heroMediaId}
                                disabled={!canEdit || isSavingProject || isLoading}
                                mediaOptions={mediaOptions}
                                selectedMedia={selectedHeroMedia}
                                emptyLabel="No hero image"
                                onChange={(value) => updateProjectField('heroMediaId', value)}
                            />
                        </div>

                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Carbon note
                            <textarea
                                value={projectForm.carbonNote}
                                onChange={(event) => updateProjectField('carbonNote', event.target.value)}
                                disabled={!canEdit || isSavingProject || isLoading}
                                rows={2}
                                className={`${fieldClass} py-3 leading-6`}
                            />
                        </label>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <ActionButton disabled={!canEdit || isSavingProject || isLoading} label={isSavingProject ? 'Saving' : 'Save changes'} icon="save" />
                            <button
                                type="button"
                                disabled={!canEdit || isSavingProject || isLoading || publishBlockers.length > 0}
                                onClick={() => void saveProject('published')}
                                title={
                                    publishBlockers.length
                                        ? 'Open the Publish checklist to clear blockers before publishing.'
                                        : 'Publish this project to the public website.'
                                }
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Publish project
                            </button>
                            <button
                                type="button"
                                disabled={!canEdit || isSavingProject || isLoading}
                                onClick={() => void saveProject('archived')}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                            >
                                <Archive className="h-4 w-4" />
                                Archive project
                            </button>
                        </div>
                        {publishBlockers.length ? (
                            <p className="mt-3 text-sm font-semibold leading-6 text-amber-800">
                                Publish is locked until the checklist above is clear.
                            </p>
                        ) : null}
                    </form>

                    <section className="grid gap-5 lg:grid-cols-2">
                        <SubrecordEditor
                            ref={factsEditorRef}
                            title="Facts"
                            eyebrow={`${facts.length} rows`}
                            onNew={() => {
                                setSelectedFactId(null);
                                setFactForm(emptyFactForm);
                            }}
                            disabled={!canEdit || !selectedProject}
                        >
                            <RecordChips
                                rows={facts}
                                selectedId={selectedFactId}
                                getLabel={(row) => row.fact_label}
                                onSelect={(row) => {
                                    setSelectedFactId(row.id);
                                    setFactForm(rowToFactForm(row));
                                }}
                            />
                            <TextField
                                label="Fact label"
                                value={factForm.factLabel}
                                disabled={!canEdit || isSavingFact || !selectedProject}
                                onChange={(value) => updateFactField('factLabel', value)}
                            />
                            <TextField
                                label="Fact value"
                                value={factForm.factValue}
                                disabled={!canEdit || isSavingFact || !selectedProject}
                                onChange={(value) => updateFactField('factValue', value)}
                            />
                            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                JSON value
                                <textarea
                                    value={factForm.factValueJson}
                                    onChange={(event) => updateFactField('factValueJson', event.target.value)}
                                    disabled={!canEdit || isSavingFact || !selectedProject}
                                    rows={2}
                                    className={`${fieldClass} py-3 leading-6`}
                                />
                            </label>
                            <SelectField
                                label="Claim status"
                                value={factForm.claimStatus}
                                disabled={!canEdit || isSavingFact || !selectedProject}
                                onChange={(value) => updateFactField('claimStatus', value as ClaimStatus)}
                                options={claimOptions}
                            />
                            <TextField
                                label="Sort order"
                                value={factForm.sortOrder}
                                disabled={!canEdit || isSavingFact || !selectedProject}
                                inputMode="numeric"
                                onChange={(value) => updateFactField('sortOrder', value)}
                            />
                            <button
                                type="button"
                                onClick={() => void saveFact()}
                                disabled={!canEdit || isSavingFact || !selectedProject}
                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                            >
                                <Save className="h-4 w-4" />
                                {isSavingFact ? 'Saving' : 'Save fact'}
                            </button>
                        </SubrecordEditor>

                        <SubrecordEditor
                            ref={materialsEditorRef}
                            title="Materials"
                            eyebrow={`${materials.length} rows`}
                            onNew={() => {
                                setSelectedMaterialId(null);
                                setMaterialForm(emptyMaterialForm);
                            }}
                            disabled={!canEdit || !selectedProject}
                        >
                            <RecordChips
                                rows={materials}
                                selectedId={selectedMaterialId}
                                getLabel={(row) => row.application}
                                onSelect={(row) => {
                                    setSelectedMaterialId(row.id);
                                    setMaterialForm(rowToMaterialForm(row));
                                }}
                            />
                            <SelectField
                                label="Stone group"
                                value={materialForm.stoneGroupId}
                                disabled={!canEdit || isSavingMaterial || !selectedProject}
                                onChange={(value) => updateMaterialField('stoneGroupId', value)}
                                options={[['', 'No stone link'], ...stoneOptions.map((stone) => [String(stone.id), stone.display_name] as [string, string])]}
                            />
                            <SelectField
                                label="Finish"
                                value={materialForm.finishDefinitionId}
                                disabled={!canEdit || isSavingMaterial || !selectedProject}
                                onChange={(value) => updateMaterialField('finishDefinitionId', value)}
                                options={[['', 'No finish link'], ...finishOptions.map((finish) => [String(finish.id), finish.display_name] as [string, string])]}
                            />
                            <TextField
                                label="Application"
                                value={materialForm.application}
                                disabled={!canEdit || isSavingMaterial || !selectedProject}
                                onChange={(value) => updateMaterialField('application', value)}
                            />
                            <MediaSelect
                                label="Material image"
                                value={materialForm.mediaAssetId}
                                disabled={!canEdit || isSavingMaterial || !selectedProject}
                                mediaOptions={mediaOptions}
                                selectedMedia={selectedMaterialMedia}
                                emptyLabel="No material image"
                                onChange={(value) => updateMaterialField('mediaAssetId', value)}
                            />
                            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Note
                                <textarea
                                    value={materialForm.note}
                                    onChange={(event) => updateMaterialField('note', event.target.value)}
                                    disabled={!canEdit || isSavingMaterial || !selectedProject}
                                    rows={3}
                                    className={`${fieldClass} py-3 leading-6`}
                                />
                            </label>
                            <SelectField
                                label="Claim status"
                                value={materialForm.claimStatus}
                                disabled={!canEdit || isSavingMaterial || !selectedProject}
                                onChange={(value) => updateMaterialField('claimStatus', value as ClaimStatus)}
                                options={claimOptions}
                            />
                            <TextField
                                label="Sort order"
                                value={materialForm.sortOrder}
                                disabled={!canEdit || isSavingMaterial || !selectedProject}
                                inputMode="numeric"
                                onChange={(value) => updateMaterialField('sortOrder', value)}
                            />
                            <button
                                type="button"
                                onClick={() => void saveMaterial()}
                                disabled={!canEdit || isSavingMaterial || !selectedProject}
                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                            >
                                <Save className="h-4 w-4" />
                                {isSavingMaterial ? 'Saving' : 'Save material'}
                            </button>
                        </SubrecordEditor>

                        <SubrecordEditor
                            title="Media blocks"
                            eyebrow={`${mediaBlocks.length} blocks`}
                            onNew={() => {
                                setSelectedMediaBlockId(null);
                                setMediaBlockForm(emptyMediaBlockForm);
                            }}
                            disabled={!canEdit || !selectedProject}
                        >
                            <RecordChips
                                rows={mediaBlocks}
                                selectedId={selectedMediaBlockId}
                                getLabel={(row) => `${getProjectMediaRoleLabel(row.media_role)} ${row.sort_order}`}
                                onSelect={(row) => {
                                    setSelectedMediaBlockId(row.id);
                                    setMediaBlockForm(rowToMediaBlockForm(row));
                                }}
                            />
                            <SelectField
                                label="Block type"
                                value={mediaBlockForm.mediaRole}
                                disabled={!canEdit || isSavingMediaBlock || !selectedProject}
                                onChange={(value) => updateMediaBlockField('mediaRole', value as ProjectMediaRole)}
                                options={projectMediaRoleOptions}
                            />
                            {mediaBlockForm.mediaRole === 'hotspot_image' ? (
                                <SelectField
                                    label="Hotspot map"
                                    value={mediaBlockForm.projectMaterialMapId}
                                    disabled={!canEdit || isSavingMediaBlock || !selectedProject}
                                    onChange={(value) => {
                                        const map = maps.find((entry) => String(entry.id) === value) ?? null;
                                        updateMediaBlockField('projectMaterialMapId', value);
                                        if (map) {
                                            updateMediaBlockField('mediaAssetId', String(map.media_asset_id));
                                        }
                                    }}
                                    options={[
                                        ['', 'Select material map'],
                                        ...maps.map((map) => [String(map.id), map.title || `Map ${map.id}`] as [string, string]),
                                    ]}
                                />
                            ) : null}
                            {mediaBlockForm.mediaRole !== 'youtube_video' ? (
                                <MediaSelect
                                    label="Media asset"
                                    value={mediaBlockForm.mediaAssetId}
                                    disabled={!canEdit || isSavingMediaBlock || !selectedProject}
                                    mediaOptions={mediaOptions}
                                    selectedMedia={selectedMediaBlockAsset}
                                    emptyLabel="Select media"
                                    onChange={(value) => updateMediaBlockField('mediaAssetId', value)}
                                />
                            ) : (
                                <TextField
                                    label="YouTube URL or ID"
                                    value={mediaBlockForm.youtubeUrl}
                                    disabled={!canEdit || isSavingMediaBlock || !selectedProject}
                                    onChange={(value) => updateMediaBlockField('youtubeUrl', value)}
                                />
                            )}
                            <TextField
                                label="Block title"
                                value={mediaBlockForm.blockTitle}
                                disabled={!canEdit || isSavingMediaBlock || !selectedProject}
                                onChange={(value) => updateMediaBlockField('blockTitle', value)}
                            />
                            <TextField
                                label="Label"
                                value={mediaBlockForm.label}
                                disabled={!canEdit || isSavingMediaBlock || !selectedProject}
                                onChange={(value) => updateMediaBlockField('label', value)}
                            />
                            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Caption
                                <textarea
                                    value={mediaBlockForm.caption}
                                    onChange={(event) => updateMediaBlockField('caption', event.target.value)}
                                    disabled={!canEdit || isSavingMediaBlock || !selectedProject}
                                    rows={3}
                                    className={`${fieldClass} py-3 leading-6`}
                                />
                            </label>
                            <SelectField
                                label="Status"
                                value={mediaBlockForm.status}
                                disabled={!canEdit || isSavingMediaBlock || !selectedProject}
                                onChange={(value) => updateMediaBlockField('status', value as ProjectStatus)}
                                options={statusOptions}
                            />
                            <TextField
                                label="Sort order"
                                value={mediaBlockForm.sortOrder}
                                disabled={!canEdit || isSavingMediaBlock || !selectedProject}
                                inputMode="numeric"
                                onChange={(value) => updateMediaBlockField('sortOrder', value)}
                            />
                            <div className="grid gap-2">
                                <button
                                    type="button"
                                    onClick={() => void saveMediaBlock(mediaBlockForm.status)}
                                    disabled={!canEdit || isSavingMediaBlock || !selectedProject}
                                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                                >
                                    <Save className="h-4 w-4" />
                                    {isSavingMediaBlock ? 'Saving' : 'Save media block'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void saveMediaBlock('published')}
                                    disabled={!canEdit || isSavingMediaBlock || !selectedProject}
                                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Publish block
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void saveMediaBlock('archived')}
                                    disabled={!canEdit || isSavingMediaBlock || !selectedProject}
                                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded bg-black px-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                                >
                                    <Archive className="h-4 w-4" />
                                    Archive block
                                </button>
                            </div>
                        </SubrecordEditor>
                    </section>
                </section>

                <aside className="space-y-5">
                    <section className="border border-black/10 bg-black p-5 text-white">
                        <MapPin className="h-5 w-5 text-[var(--urblo-lime)]" />
                        <h2 className="mt-5 text-xl font-semibold">Map health</h2>
                        <div className="mt-5 grid gap-3 text-sm leading-6 text-white/72">
                            <p>{mediaBlocks.length} detail media blocks on the selected project.</p>
                            <p>{maps.length} material maps on the selected project.</p>
                            <p>{hotspots.length} hotspots on the selected map.</p>
                            <p>{mediaOptions.length} media records available for ID linking.</p>
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Material map
                                </p>
                                <h2 className="mt-2 text-xl font-semibold text-black">
                                    {selectedMap ? selectedMap.title || `Map ${selectedMap.id}` : 'No map selected'}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedMapId(null);
                                    setMapForm(emptyMapForm);
                                    setHotspots([]);
                                    setSelectedHotspotId(null);
                                    setHotspotForm(emptyHotspotForm);
                                }}
                                disabled={!canEdit || !selectedProject}
                                className="inline-flex min-h-9 items-center gap-2 rounded border border-black/15 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black disabled:text-black/35"
                            >
                                <Plus className="h-4 w-4" />
                                New
                            </button>
                        </div>
                        <RecordChips
                            rows={maps}
                            selectedId={selectedMapId}
                            getLabel={(row) => row.title || `Map ${row.id}`}
                            onSelect={(row) => {
                                setSelectedMapId(row.id);
                                setMapForm(rowToMapForm(row));
                                if (supabase) void loadHotspots(supabase, row.id, null);
                            }}
                        />
                        <SelectField
                            label="Status"
                            value={mapForm.status}
                            disabled={!canEdit || isSavingMap || !selectedProject}
                            onChange={(value) => updateMapField('status', value as ProjectStatus)}
                            options={statusOptions}
                        />
                        <MediaSelect
                            label="Map image"
                            value={mapForm.mediaAssetId}
                            disabled={!canEdit || isSavingMap || !selectedProject}
                            mediaOptions={mediaOptions}
                            selectedMedia={selectedMapFormMedia}
                            emptyLabel="Select map image"
                            onChange={(value) => updateMapField('mediaAssetId', value)}
                        />
                        <TextField
                            label="Title"
                            value={mapForm.title}
                            disabled={!canEdit || isSavingMap || !selectedProject}
                            onChange={(value) => updateMapField('title', value)}
                        />
                        <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Intro
                            <textarea
                                value={mapForm.intro}
                                onChange={(event) => updateMapField('intro', event.target.value)}
                                disabled={!canEdit || isSavingMap || !selectedProject}
                                rows={3}
                                className={`${fieldClass} py-3 leading-6`}
                            />
                        </label>
                        <TextField
                            label="Sort order"
                            value={mapForm.sortOrder}
                            disabled={!canEdit || isSavingMap || !selectedProject}
                            inputMode="numeric"
                            onChange={(value) => updateMapField('sortOrder', value)}
                        />
                        <div className="mt-4 grid gap-2">
                            <button
                                type="button"
                                onClick={() => void saveMap(mapForm.status)}
                                disabled={!canEdit || isSavingMap || !selectedProject}
                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                            >
                                <Save className="h-4 w-4" />
                                {isSavingMap ? 'Saving' : 'Save map'}
                            </button>
                            <button
                                type="button"
                                onClick={() => void saveMap('published')}
                                disabled={!canEdit || isSavingMap || !selectedProject}
                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Publish map
                            </button>
                            <button
                                type="button"
                                onClick={() => void saveMap('archived')}
                                disabled={!canEdit || isSavingMap || !selectedProject}
                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded bg-black px-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                            >
                                <Archive className="h-4 w-4" />
                                Archive map
                            </button>
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Hotspot
                                </p>
                                <h2 className="mt-2 text-xl font-semibold text-black">
                                    {selectedHotspot ? selectedHotspot.hotspot_key : 'No hotspot selected'}
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedHotspotId(null);
                                    setHotspotForm(emptyHotspotForm);
                                }}
                                disabled={!canEdit || !selectedMap}
                                className="inline-flex min-h-9 items-center gap-2 rounded border border-black/15 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black disabled:text-black/35"
                            >
                                <Plus className="h-4 w-4" />
                                New
                            </button>
                        </div>
                        <RecordChips
                            rows={hotspots}
                            selectedId={selectedHotspotId}
                            getLabel={(row) => row.label || row.hotspot_key}
                            onSelect={(row) => {
                                setSelectedHotspotId(row.id);
                                setHotspotForm(rowToHotspotForm(row));
                            }}
                        />
                        <SelectField
                            label="Status"
                            value={hotspotForm.status}
                            disabled={!canEdit || isSavingHotspot || !selectedMap}
                            onChange={(value) => updateHotspotField('status', value as ProjectStatus)}
                            options={statusOptions}
                        />
                        <TextField
                            label="Hotspot key"
                            value={hotspotForm.hotspotKey}
                            disabled={!canEdit || isSavingHotspot || !selectedMap || Boolean(selectedHotspot)}
                            onChange={(value) => updateHotspotField('hotspotKey', value)}
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                            <TextField
                                label="X percent"
                                value={hotspotForm.xPercent}
                                disabled={!canEdit || isSavingHotspot || !selectedMap}
                                inputMode="decimal"
                                onChange={(value) => updateHotspotField('xPercent', value)}
                            />
                            <TextField
                                label="Y percent"
                                value={hotspotForm.yPercent}
                                disabled={!canEdit || isSavingHotspot || !selectedMap}
                                inputMode="decimal"
                                onChange={(value) => updateHotspotField('yPercent', value)}
                            />
                        </div>
                        <HotspotPlacementEditor
                            imageUrl={selectedMapImageUrl}
                            imageAlt={selectedMap?.title || 'Selected project material map'}
                            hotspots={hotspots}
                            activeHotspotId={selectedHotspotId}
                            xPercent={hotspotForm.xPercent}
                            yPercent={hotspotForm.yPercent}
                            disabled={!canEdit || isSavingHotspot || !selectedMap}
                            onSelect={(hotspot) => {
                                setSelectedHotspotId(hotspot.id);
                                setHotspotForm(rowToHotspotForm(hotspot));
                            }}
                            onPositionChange={(nextPosition) => {
                                updateHotspotField('xPercent', nextPosition.xPercent.toFixed(2));
                                updateHotspotField('yPercent', nextPosition.yPercent.toFixed(2));
                            }}
                        />
                        <SelectField
                            label="Linked material"
                            value={hotspotForm.projectMaterialId}
                            disabled={!canEdit || isSavingHotspot || !selectedMap}
                            onChange={(value) => updateHotspotField('projectMaterialId', value)}
                            options={[
                                ['', 'No material link'],
                                ...materials.map((material) => [String(material.id), material.application] as [string, string]),
                            ]}
                        />
                        <TextField
                            label="Label"
                            value={hotspotForm.label}
                            disabled={!canEdit || isSavingHotspot || !selectedMap}
                            onChange={(value) => updateHotspotField('label', value)}
                        />
                        <TextField
                            label="Application"
                            value={hotspotForm.application}
                            disabled={!canEdit || isSavingHotspot || !selectedMap}
                            onChange={(value) => updateHotspotField('application', value)}
                        />
                        <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Note
                            <textarea
                                value={hotspotForm.note}
                                onChange={(event) => updateHotspotField('note', event.target.value)}
                                disabled={!canEdit || isSavingHotspot || !selectedMap}
                                rows={3}
                                className={`${fieldClass} py-3 leading-6`}
                            />
                        </label>
                        <MediaSelect
                            label="Preview image"
                            value={hotspotForm.previewMediaId}
                            disabled={!canEdit || isSavingHotspot || !selectedMap}
                            mediaOptions={mediaOptions}
                            selectedMedia={selectedHotspotPreviewMedia}
                            emptyLabel="No preview image"
                            onChange={(value) => updateHotspotField('previewMediaId', value)}
                        />
                        <TextField
                            label="Sort order"
                            value={hotspotForm.sortOrder}
                            disabled={!canEdit || isSavingHotspot || !selectedMap}
                            inputMode="numeric"
                            onChange={(value) => updateHotspotField('sortOrder', value)}
                        />
                        <div className="mt-4 grid gap-2">
                            <button
                                type="button"
                                onClick={() => void saveHotspot(hotspotForm.status)}
                                disabled={!canEdit || isSavingHotspot || !selectedMap}
                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                            >
                                <Save className="h-4 w-4" />
                                {isSavingHotspot ? 'Saving' : 'Save hotspot'}
                            </button>
                            <button
                                type="button"
                                onClick={() => void saveHotspot('published')}
                                disabled={!canEdit || isSavingHotspot || !selectedMap}
                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Publish hotspot
                            </button>
                            <button
                                type="button"
                                onClick={() => void saveHotspot('archived')}
                                disabled={!canEdit || isSavingHotspot || !selectedMap}
                                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded bg-black px-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                            >
                                <Archive className="h-4 w-4" />
                                Archive hotspot
                            </button>
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <ShieldAlert className="h-5 w-5 text-black" />
                        <h2 className="mt-5 text-xl font-semibold text-black">Publication guardrails</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                            <li>Published projects require reviewed claims plus either summary or lead copy.</li>
                            <li>Public facts/materials expose only approved rows.</li>
                            <li>Published maps require a media ID; hotspots require coordinates between 0 and 100.</li>
                            <li>Physical deletes remain hidden; archive is the safe operational path.</li>
                        </ul>
                    </section>

                    {error ? (
                        <section className="border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                            {error}
                        </section>
                    ) : null}
                    {notice ? (
                        <section className="border border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.10)] p-4 text-sm font-semibold leading-6 text-black">
                            {notice}
                        </section>
                    ) : null}
                    {!canEdit ? (
                        <section className="border border-black/10 bg-white p-5 text-sm leading-6 text-black/62">
                            Current role is read-only for Projects. Ask an editor/admin to update project records.
                        </section>
                    ) : null}
                </aside>
            </div>
        </AdminShell>
    );
}

const statusOptions: Array<[string, string]> = [
    ['draft', 'Draft'],
    ['published', 'Published'],
    ['archived', 'Archived'],
];

const claimOptions: Array<[string, string]> = [
    ['needs_review', 'Needs review'],
    ['approved', 'Approved'],
    ['deferred', 'Deferred'],
];

const projectMediaRoleOptions: Array<[string, string]> = [
    ['normal_image', 'Normal image'],
    ['hotspot_image', 'Hotspot image'],
    ['youtube_video', 'YouTube video'],
    ['gallery', 'Gallery image'],
    ['supporting', 'Supporting image'],
    ['material_map', 'Material map image'],
    ['hero', 'Hero reference'],
    ['cover', 'Cover reference'],
];

function getProjectMediaRoleLabel(role: ProjectMediaRole) {
    return (
        projectMediaRoleOptions.find(([value]) => value === role)?.[1] ??
        role.replace(/_/g, ' ')
    );
}

function formatMediaOption(media: MediaOptionRow) {
    const label = media.alt || media.caption || media.object_path || media.source_url || `Asset ${media.id}`;
    return `#${media.id} / ${label}`;
}

function findMediaOption(mediaOptions: MediaOptionRow[], value: string) {
    const mediaId = Number(value);
    if (!Number.isFinite(mediaId)) return null;
    return mediaOptions.find((media) => media.id === mediaId) ?? null;
}

function getMediaUrl(asset: MediaOptionRow | null) {
    if (!asset) {
        return null;
    }

    if (asset.source_kind === 'storage' && asset.bucket === 'urblo-public-media' && asset.object_path && supabase) {
        return supabase.storage.from(asset.bucket).getPublicUrl(asset.object_path).data.publicUrl;
    }

    return asset.source_url || asset.object_path;
}

function MediaSelect({
    label,
    value,
    disabled,
    mediaOptions,
    selectedMedia,
    emptyLabel,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    mediaOptions: MediaOptionRow[];
    selectedMedia: MediaOptionRow | null;
    emptyLabel: string;
    onChange: (value: string) => void;
}) {
    const previewUrl = getMediaUrl(selectedMedia);

    return (
        <div className="space-y-2">
            <SelectField
                label={label}
                value={value}
                disabled={disabled}
                onChange={onChange}
                options={[
                    ['', emptyLabel],
                    ...mediaOptions.map((media) => [String(media.id), formatMediaOption(media)] as [string, string]),
                ]}
            />
            {selectedMedia ? (
                <div className="flex gap-3 border border-black/10 bg-[#f8f9f5] p-3">
                    <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden bg-white">
                        {previewUrl && selectedMedia.media_type === 'image' ? (
                            <img
                                src={previewUrl}
                                alt={selectedMedia.alt || selectedMedia.caption || label}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <FileText className="h-5 w-5 text-black/35" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-black">
                            {selectedMedia.alt || selectedMedia.caption || selectedMedia.object_path || `Asset ${selectedMedia.id}`}
                        </p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/45">
                            {selectedMedia.media_type} / {selectedMedia.status} / #{selectedMedia.id}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-black/52">
                            {selectedMedia.source_kind === 'storage'
                                ? selectedMedia.object_path || 'Storage object'
                                : selectedMedia.source_url || 'External source'}
                        </p>
                    </div>
                </div>
            ) : value ? (
                <p className="border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">
                    Selected media is not in the available media list.
                </p>
            ) : null}
        </div>
    );
}

function getProjectPublishBlockers(
    projectForm: ProjectFormState,
    facts: ProjectFactRow[],
    materials: ProjectMaterialRow[],
): PublishBlocker[] {
    const blockers: PublishBlocker[] = [];

    if (!projectForm.title.trim()) {
        blockers.push({
            id: 'project-title',
            area: 'project',
            field: 'title',
            label: 'Project title',
            detail: 'Add the public project title shown in the project list and detail page.',
        });
    }

    if (!projectForm.slug.trim()) {
        blockers.push({
            id: 'project-slug',
            area: 'project',
            field: 'slug',
            label: 'Project website URL',
            detail: 'Add the lowercase URL slug for this project, for example moon-gate-woolley-street.',
        });
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(projectForm.slug.trim())) {
        blockers.push({
            id: 'project-slug-format',
            area: 'project',
            field: 'slug',
            label: 'Project website URL',
            detail: 'Use lowercase words separated by hyphens, with no spaces or punctuation.',
        });
    }

    if (projectForm.claimReviewStatus === 'needs_review') {
        blockers.push({
            id: 'project-claim-review',
            area: 'project',
            field: 'claimReview',
            label: 'Project claim review',
            detail: 'Set Claims checked to Approved or Deferred after the project claims have been reviewed.',
        });
    }

    if (!projectForm.summary.trim() && !projectForm.lead.trim()) {
        blockers.push({
            id: 'project-summary-lead',
            area: 'project',
            field: 'summary',
            label: 'Public summary',
            detail: 'Add Summary or Lead copy so the public project page has introductory text.',
        });
    }

    facts
        .filter((fact) => fact.claim_status === 'needs_review')
        .forEach((fact) => {
            blockers.push({
                id: `fact-${fact.id}`,
                area: 'fact',
                rowId: fact.id,
                label: `Fact: ${fact.fact_label}`,
                detail: 'Open Facts and set this row to Approved or Deferred after review.',
            });
        });

    materials
        .filter((material) => material.claim_status === 'needs_review')
        .forEach((material) => {
            blockers.push({
                id: `material-${material.id}`,
                area: 'material',
                rowId: material.id,
                label: `Material: ${material.application}`,
                detail: 'Open Materials and set this row to Approved or Deferred after review.',
            });
        });

    return blockers;
}

function formatPublishBlockerError(blockers: PublishBlocker[]) {
    const visible = blockers.slice(0, 3).map((blocker) => `${blocker.label}: ${blocker.detail}`);
    const remaining = blockers.length > visible.length ? ` ${blockers.length - visible.length} more item(s) need review.` : '';
    return `Cannot publish yet. Use the Publish checklist in the Project editor to fix: ${visible.join(' ')}${remaining}`;
}

function parsePercentValue(value: string) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : null;
}

function clampPercent(value: number) {
    return Math.min(100, Math.max(0, value));
}

function PublishReadinessPanel({
    blockers,
    disabled,
    onSelect,
}: {
    blockers: PublishBlocker[];
    disabled?: boolean;
    onSelect: (blocker: PublishBlocker) => void;
}) {
    const ready = !disabled && blockers.length === 0;
    const projectBlockers = blockers.filter((blocker) => blocker.area === 'project').length;
    const factBlockers = blockers.filter((blocker) => blocker.area === 'fact').length;
    const materialBlockers = blockers.filter((blocker) => blocker.area === 'material').length;

    return (
        <section
            className={[
                'border p-5',
                ready
                    ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.08)]'
                    : 'border-amber-200 bg-amber-50',
            ].join(' ')}
        >
            <div className="flex items-start gap-3">
                {ready ? (
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-black" />
                ) : (
                    <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
                )}
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                        Publish checklist
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-black">
                        {disabled ? 'Start or select a project' : ready ? 'Ready for the public website' : `${blockers.length} blocker(s) before publish`}
                    </h2>
                    {!disabled && !ready ? (
                        <p className="mt-2 text-sm leading-6 text-black/62">
                            Fix the items below before publishing. Buttons jump to the exact section to update.
                        </p>
                    ) : null}
                </div>
            </div>

            {disabled ? (
                <p className="mt-4 text-sm leading-6 text-black/60">
                    Create or select a project record to see the exact publish checks.
                </p>
            ) : ready ? (
                <p className="mt-4 text-sm leading-6 text-black/70">
                    Title, URL, public copy, project claims, fact claims, and material claims are ready.
                </p>
            ) : (
                <div className="mt-4 space-y-3">
                    <div className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-black/52 sm:grid-cols-3">
                        <span className="border border-black/10 bg-white px-3 py-2">Project {projectBlockers}</span>
                        <span className="border border-black/10 bg-white px-3 py-2">Facts {factBlockers}</span>
                        <span className="border border-black/10 bg-white px-3 py-2">Materials {materialBlockers}</span>
                    </div>
                    {blockers.map((blocker) => (
                        <button
                            key={blocker.id}
                            type="button"
                            onClick={() => onSelect(blocker)}
                            className="block w-full rounded border border-amber-300 bg-white px-3 py-3 text-left transition hover:border-black"
                        >
                            <span className="block text-xs font-bold uppercase tracking-[0.12em] text-black">
                                {blocker.label}
                            </span>
                            <span className="mt-1 block text-sm leading-6 text-black/62">{blocker.detail}</span>
                            <span className="mt-2 block text-xs font-bold uppercase tracking-[0.12em] text-amber-800">
                                {getPublishBlockerActionLabel(blocker)}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}

function getPublishBlockerActionLabel(blocker: PublishBlocker) {
    if (blocker.area === 'fact') return 'Go to Facts';
    if (blocker.area === 'material') return 'Go to Materials';
    return 'Go to Project editor';
}

function HotspotPlacementEditor({
    imageUrl,
    imageAlt,
    hotspots,
    activeHotspotId,
    xPercent,
    yPercent,
    disabled,
    onSelect,
    onPositionChange,
}: {
    imageUrl: string | null;
    imageAlt: string;
    hotspots: ProjectHotspotRow[];
    activeHotspotId: number | null;
    xPercent: string;
    yPercent: string;
    disabled?: boolean;
    onSelect: (hotspot: ProjectHotspotRow) => void;
    onPositionChange: (position: { xPercent: number; yPercent: number }) => void;
}) {
    const stageRef = useRef<HTMLDivElement | null>(null);
    const [dragging, setDragging] = useState(false);

    const activeX = parsePercentValue(xPercent);
    const activeY = parsePercentValue(yPercent);
    const displayedHotspots = hotspots.map((hotspot) => {
        if (hotspot.id === activeHotspotId && activeX !== null && activeY !== null) {
            return { ...hotspot, x_percent: activeX, y_percent: activeY };
        }

        return hotspot;
    });

    if (!activeHotspotId && activeX !== null && activeY !== null) {
        displayedHotspots.push({
            id: -1,
            project_material_map_id: 0,
            project_material_id: null,
            hotspot_key: 'draft-hotspot',
            x_percent: activeX,
            y_percent: activeY,
            label: 'Draft hotspot',
            application: null,
            note: null,
            preview_media_id: null,
            sort_order: 0,
            status: 'draft',
            published_at: null,
            archived_at: null,
            updated_at: '',
        });
    }

    function updateFromPointer(event: ReactPointerEvent<HTMLElement>) {
        if (disabled || !stageRef.current) return;

        const rect = stageRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        onPositionChange({
            xPercent: clampPercent(x),
            yPercent: clampPercent(y),
        });
    }

    if (!imageUrl) {
        return (
            <div className="rounded border border-black/10 bg-black/[0.03] p-4 text-sm leading-6 text-black/55">
                Select a material map with a public media URL to position hotspots visually.
            </div>
        );
    }

    return (
        <div className="rounded border border-black/10 bg-white p-3">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-black/45">
                <MousePointer2 className="h-4 w-4 text-black" />
                Drag point placement
            </div>
            <div
                ref={stageRef}
                data-hotspot-stage
                className={[
                    'relative overflow-hidden bg-black',
                    disabled ? 'cursor-not-allowed opacity-70' : 'cursor-crosshair',
                ].join(' ')}
                onPointerDown={(event) => {
                    if (disabled || (event.target as HTMLElement).closest('[data-hotspot-marker]')) return;
                    setDragging(true);
                    event.currentTarget.setPointerCapture(event.pointerId);
                    updateFromPointer(event);
                }}
                onPointerMove={(event) => {
                    if (dragging) updateFromPointer(event);
                }}
                onPointerUp={(event) => {
                    setDragging(false);
                    event.currentTarget.releasePointerCapture(event.pointerId);
                }}
                onPointerCancel={() => setDragging(false)}
            >
                <img src={imageUrl} alt={imageAlt} className="aspect-[4/3] w-full object-cover" />
                {displayedHotspots.map((hotspot) => {
                    const active = hotspot.id === activeHotspotId || (hotspot.id === -1 && !activeHotspotId);

                    return (
                        <button
                            key={hotspot.id}
                            type="button"
                            data-hotspot-marker
                            disabled={disabled && !active}
                            className={[
                                'absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--urblo-lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                                active
                                    ? 'border-[var(--urblo-lime)] bg-white shadow-[0_0_0_5px_rgba(0,255,25,0.20)]'
                                    : 'border-white/80 bg-black/40 text-white hover:border-[var(--urblo-lime)]',
                            ].join(' ')}
                            style={{ left: `${hotspot.x_percent}%`, top: `${hotspot.y_percent}%` }}
                            aria-label={`Position ${hotspot.label || hotspot.hotspot_key}`}
                            onPointerDown={(event) => {
                                if (disabled) return;
                                event.stopPropagation();
                                if (hotspot.id !== -1) {
                                    onSelect(hotspot);
                                }
                                setDragging(true);
                                event.currentTarget.setPointerCapture(event.pointerId);
                                updateFromPointer(event);
                            }}
                            onPointerMove={(event) => {
                                if (dragging && active) updateFromPointer(event);
                            }}
                            onPointerUp={(event) => {
                                setDragging(false);
                                event.currentTarget.releasePointerCapture(event.pointerId);
                            }}
                            onPointerCancel={() => setDragging(false)}
                        >
                            <span className={active ? 'h-2.5 w-2.5 rounded-full bg-[var(--urblo-lime)]' : 'h-2.5 w-2.5 rounded-full bg-white'} />
                        </button>
                    );
                })}
            </div>
            <p className="mt-3 text-xs leading-5 text-black/48">
                Coordinates are saved only after the hotspot form is saved or published.
            </p>
        </div>
    );
}

function TextField({
    label,
    value,
    disabled,
    required,
    type = 'text',
    inputMode,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    required?: boolean;
    type?: string;
    inputMode?: 'numeric' | 'decimal';
    onChange: (value: string) => void;
}) {
    return (
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
            {label}
            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                required={required}
                inputMode={inputMode}
                className={fieldClass}
            />
        </label>
    );
}

function SelectField({
    label,
    value,
    disabled,
    options,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    options: Array<[string, string]>;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
            {label}
            <select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={fieldClass}>
                {options.map(([optionValue, labelText]) => (
                    <option key={optionValue} value={optionValue}>
                        {labelText}
                    </option>
                ))}
            </select>
        </label>
    );
}

function ActionButton({ disabled, label }: { disabled?: boolean; label: string; icon: 'save' }) {
    return (
        <button
            type="submit"
            disabled={disabled}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
        >
            <Save className="h-4 w-4" />
            {label}
        </button>
    );
}

interface SubrecordEditorProps {
    title: string;
    eyebrow: string;
    disabled?: boolean;
    onNew: () => void;
    children: ReactNode;
}

const SubrecordEditor = forwardRef<HTMLElement, SubrecordEditorProps>(function SubrecordEditor(
    { title, eyebrow, disabled, onNew, children },
    ref,
) {
    return (
        <section ref={ref} className="scroll-mt-5 border border-black/10 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">{eyebrow}</p>
                    <h2 className="mt-2 text-xl font-semibold text-black">{title}</h2>
                </div>
                <button
                    type="button"
                    onClick={onNew}
                    disabled={disabled}
                    className="inline-flex min-h-9 items-center gap-2 rounded border border-black/15 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black disabled:text-black/35"
                >
                    <Plus className="h-4 w-4" />
                    New
                </button>
            </div>
            <div className="mt-5 space-y-4">{children}</div>
        </section>
    );
});

function RecordChips<T extends { id: number }>({
    rows,
    selectedId,
    getLabel,
    onSelect,
}: {
    rows: T[];
    selectedId: number | null;
    getLabel: (row: T) => string;
    onSelect: (row: T) => void;
}) {
    if (!rows.length) {
        return <p className="text-sm leading-6 text-black/50">No records yet.</p>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {rows.map((row) => (
                <button
                    key={row.id}
                    type="button"
                    onClick={() => onSelect(row)}
                    className={[
                        'inline-flex min-h-9 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.12em] transition',
                        row.id === selectedId
                            ? 'border-black bg-black text-white'
                            : 'border-black/15 bg-white text-black/58 hover:border-black hover:text-black',
                    ].join(' ')}
                >
                    {getLabel(row)}
                </button>
            ))}
        </div>
    );
}

function rowToProjectForm(row: ProjectRow | null): ProjectFormState {
    if (!row) return emptyProjectForm;

    return {
        status: row.status,
        slug: row.slug,
        title: row.title,
        location: row.location ?? '',
        projectDateLabel: row.project_date_label ?? '',
        completedOn: row.completed_on ?? '',
        summary: row.summary ?? '',
        lead: row.lead ?? '',
        client: row.client ?? '',
        landscapeArchitect: row.landscape_architect ?? '',
        contractor: row.contractor ?? '',
        address: row.address ?? '',
        quantityLabel: row.quantity_label ?? '',
        carbonStatus: row.carbon_status ?? '',
        carbonNote: row.carbon_note ?? '',
        claimReviewStatus: row.claim_review_status,
        heroMediaId: row.hero_media_id === null ? '' : String(row.hero_media_id),
        coverMediaId: row.cover_media_id === null ? '' : String(row.cover_media_id),
        sortOrder: String(row.sort_order),
    };
}

function rowToFactForm(row: ProjectFactRow | null): FactFormState {
    if (!row) return emptyFactForm;

    return {
        factLabel: row.fact_label,
        factValue: row.fact_value ?? '',
        factValueJson: row.fact_value_json ? JSON.stringify(row.fact_value_json, null, 2) : '',
        claimStatus: row.claim_status,
        sortOrder: String(row.sort_order),
    };
}

function rowToMaterialForm(row: ProjectMaterialRow | null): MaterialFormState {
    if (!row) return emptyMaterialForm;

    return {
        stoneGroupId: row.stone_group_id === null ? '' : String(row.stone_group_id),
        finishDefinitionId: row.finish_definition_id === null ? '' : String(row.finish_definition_id),
        application: row.application,
        note: row.note ?? '',
        mediaAssetId: row.media_asset_id === null ? '' : String(row.media_asset_id),
        claimStatus: row.claim_status,
        sortOrder: String(row.sort_order),
    };
}

function rowToMapForm(row: ProjectMaterialMapRow | null): MapFormState {
    if (!row) return emptyMapForm;

    return {
        mediaAssetId: String(row.media_asset_id),
        title: row.title ?? '',
        intro: row.intro ?? '',
        sortOrder: String(row.sort_order),
        status: row.status,
    };
}

function rowToMediaBlockForm(row: ProjectMediaRow | null): MediaBlockFormState {
    if (!row) return emptyMediaBlockForm;

    return {
        mediaRole: row.media_role,
        mediaAssetId: row.media_asset_id === null ? '' : String(row.media_asset_id),
        projectMaterialMapId: row.project_material_map_id === null ? '' : String(row.project_material_map_id),
        blockTitle: row.block_title ?? '',
        youtubeUrl: row.youtube_url ?? '',
        label: row.label ?? '',
        caption: row.caption ?? '',
        sortOrder: String(row.sort_order),
        status: row.status,
    };
}

function rowToHotspotForm(row: ProjectHotspotRow | null): HotspotFormState {
    if (!row) return emptyHotspotForm;

    return {
        projectMaterialId: row.project_material_id === null ? '' : String(row.project_material_id),
        hotspotKey: row.hotspot_key,
        xPercent: String(row.x_percent),
        yPercent: String(row.y_percent),
        label: row.label ?? '',
        application: row.application ?? '',
        note: row.note ?? '',
        previewMediaId: row.preview_media_id === null ? '' : String(row.preview_media_id),
        sortOrder: String(row.sort_order),
        status: row.status,
    };
}

function validateProjectForm(form: ProjectFormState) {
    if (!form.title.trim()) return validationFailure('Project title is required.');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
        return validationFailure('Project slug must be lowercase kebab-case.');
    }

    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    const heroMediaId = optionalPositiveInteger(form.heroMediaId, 'Hero image');
    const coverMediaId = optionalPositiveInteger(form.coverMediaId, 'Cover image');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    if (heroMediaId.error) return validationFailure(heroMediaId.error);
    if (coverMediaId.error) return validationFailure(coverMediaId.error);

    if (form.status === 'published') {
        if (form.claimReviewStatus === 'needs_review') {
            return validationFailure('Cannot publish yet. Set Claims checked to Approved or Deferred.');
        }

        if (!form.summary.trim() && !form.lead.trim()) {
            return validationFailure('Cannot publish yet. Add Summary or Lead copy for the public project page.');
        }
    }

    return {
        error: null,
        sortOrder: sortOrder.value,
        heroMediaId: heroMediaId.value,
        coverMediaId: coverMediaId.value,
    };
}

function validateFactForm(form: FactFormState) {
    if (!form.factLabel.trim()) return validationFailure('Fact label is required.');
    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    if (sortOrder.error) return validationFailure(sortOrder.error);

    let factValueJson: unknown = null;
    if (form.factValueJson.trim()) {
        try {
            factValueJson = JSON.parse(form.factValueJson);
        } catch {
            return validationFailure('Fact JSON value is not valid JSON.');
        }
    }

    return { error: null, sortOrder: sortOrder.value, factValueJson };
}

function validateMaterialForm(form: MaterialFormState) {
    if (!form.application.trim()) return validationFailure('Material application is required.');
    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    const stoneGroupId = optionalPositiveInteger(form.stoneGroupId, 'Stone group ID');
    const finishDefinitionId = optionalPositiveInteger(form.finishDefinitionId, 'Finish definition ID');
    const mediaAssetId = optionalPositiveInteger(form.mediaAssetId, 'Material image');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    if (stoneGroupId.error) return validationFailure(stoneGroupId.error);
    if (finishDefinitionId.error) return validationFailure(finishDefinitionId.error);
    if (mediaAssetId.error) return validationFailure(mediaAssetId.error);

    return {
        error: null,
        sortOrder: sortOrder.value,
        stoneGroupId: stoneGroupId.value,
        finishDefinitionId: finishDefinitionId.value,
        mediaAssetId: mediaAssetId.value,
    };
}

function validateMapForm(form: MapFormState) {
    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    const mediaAssetId = requiredPositiveInteger(form.mediaAssetId, 'Map image');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    if (mediaAssetId.error) return validationFailure(mediaAssetId.error);

    if (form.status === 'published' && !form.title.trim()) {
        return validationFailure('Published material maps require a title.');
    }

    return { error: null, sortOrder: sortOrder.value, mediaAssetId: mediaAssetId.value };
}

function validateMediaBlockForm(form: MediaBlockFormState, maps: ProjectMaterialMapRow[]) {
    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    if (sortOrder.error) return validationFailure(sortOrder.error);

    if (form.mediaRole === 'youtube_video') {
        const youtubeUrl = normalizeYouTubeInput(form.youtubeUrl);
        if (!youtubeUrl) return validationFailure('YouTube blocks require a valid YouTube URL or video ID.');
        if (form.status === 'published' && !form.blockTitle.trim()) {
            return validationFailure('Published YouTube blocks require a block title.');
        }

        return {
            error: null,
            sortOrder: sortOrder.value,
            mediaAssetId: null,
            projectMaterialMapId: null,
            youtubeUrl,
        };
    }

    const projectMaterialMapId = optionalPositiveInteger(form.projectMaterialMapId, 'Hotspot map ID');
    if (projectMaterialMapId.error) return validationFailure(projectMaterialMapId.error);

    let mediaAssetId = optionalPositiveInteger(form.mediaAssetId, 'Media asset');
    if (mediaAssetId.error) return validationFailure(mediaAssetId.error);

    if (form.mediaRole === 'hotspot_image') {
        if (!projectMaterialMapId.value) {
            return validationFailure('Hotspot image blocks require a linked material map.');
        }

        const linkedMap = maps.find((map) => map.id === projectMaterialMapId.value);
        if (!linkedMap) {
            return validationFailure('Selected material map was not found.');
        }

        if (!mediaAssetId.value) {
            mediaAssetId = { error: null, value: linkedMap.media_asset_id };
        }
    }

    if (!mediaAssetId.value) {
        return validationFailure('Image media blocks require selected media.');
    }

    return {
        error: null,
        sortOrder: sortOrder.value,
        mediaAssetId: mediaAssetId.value,
        projectMaterialMapId: form.mediaRole === 'hotspot_image' ? projectMaterialMapId.value : null,
        youtubeUrl: null,
    };
}

function validateHotspotForm(form: HotspotFormState) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.hotspotKey.trim())) {
        return validationFailure('Hotspot key must be lowercase kebab-case.');
    }

    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    const xPercent = percentNumber(form.xPercent, 'X percent');
    const yPercent = percentNumber(form.yPercent, 'Y percent');
    const projectMaterialId = optionalPositiveInteger(form.projectMaterialId, 'Project material ID');
    const previewMediaId = optionalPositiveInteger(form.previewMediaId, 'Preview image');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    if (xPercent.error) return validationFailure(xPercent.error);
    if (yPercent.error) return validationFailure(yPercent.error);
    if (projectMaterialId.error) return validationFailure(projectMaterialId.error);
    if (previewMediaId.error) return validationFailure(previewMediaId.error);

    if (form.status === 'published' && !form.application.trim()) {
        return validationFailure('Published hotspots require an application label.');
    }

    return {
        error: null,
        sortOrder: sortOrder.value,
        xPercent: xPercent.value,
        yPercent: yPercent.value,
        projectMaterialId: projectMaterialId.value,
        previewMediaId: previewMediaId.value,
    };
}

function validationFailure(error: string) {
    return { error };
}

function requiredInteger(value: string, label: string): { error: string | null; value: number } {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
        return { error: `${label} must be a whole number.`, value: 0 };
    }
    return { error: null, value: parsed };
}

function optionalPositiveInteger(value: string, label: string): { error: string | null; value: number | null } {
    if (!value.trim()) return { error: null, value: null };
    return requiredPositiveInteger(value, label);
}

function requiredPositiveInteger(value: string, label: string): { error: string | null; value: number } {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return { error: `${label} must be a whole positive number.`, value: 0 };
    }
    return { error: null, value: parsed };
}

function percentNumber(value: string, label: string): { error: string | null; value: number } {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        return { error: `${label} must be a number between 0 and 100.`, value: 0 };
    }
    return { error: null, value: parsed };
}

function normalizeYouTubeInput(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^[a-zA-Z0-9_-]{6,}$/.test(trimmed) && !trimmed.includes('/')) {
        return trimmed;
    }

    try {
        const url = new URL(trimmed);
        if (url.hostname.includes('youtu.be')) {
            return url.pathname.replace('/', '') || null;
        }
        if (url.hostname.includes('youtube.com') || url.hostname.includes('youtube-nocookie.com')) {
            const id = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop();
            return id && /^[a-zA-Z0-9_-]{6,}$/.test(id) ? id : null;
        }
    } catch {
        return null;
    }

    return null;
}

function summarizeProjects(projects: ProjectRow[]) {
    return projects.reduce(
        (summary, project) => ({
            draft: summary.draft + (project.status === 'draft' ? 1 : 0),
            published: summary.published + (project.status === 'published' ? 1 : 0),
            archived: summary.archived + (project.status === 'archived' ? 1 : 0),
        }),
        { draft: 0, published: 0, archived: 0 },
    );
}
