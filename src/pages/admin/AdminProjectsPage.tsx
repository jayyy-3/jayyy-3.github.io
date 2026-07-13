import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useNavigate, useParams } from 'react-router-dom';
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
import { parseProjectFactJsonDraft } from '../../lib/projectFactValue';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';
import { CmsLiveRuleCard, CmsPublicPageLink, CmsStatusCounts, CmsStatusMeaning, CmsStatusPill, ReadinessBadge } from './AdminCmsPrimitives';

type ProjectStatus = 'draft' | 'published' | 'archived';
type ProjectListFilter = ProjectStatus | 'all';
type ProjectWorkspace = 'overview' | 'facts' | 'materials' | 'media' | 'maps';
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

interface ProjectDirtyEditors {
    overview: boolean;
    fact: boolean;
    material: boolean;
    media: boolean;
    map: boolean;
    hotspot: boolean;
}

interface PublishBlocker {
    id: string;
    area: 'project' | 'fact' | 'material';
    field?: 'title' | 'slug' | 'summary' | 'claimReview';
    label: string;
    detail: string;
    rowId?: number;
}

interface ProofReviewOption {
    value: ClaimStatus;
    label: string;
    detail: string;
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
    const navigate = useNavigate();
    const { projectId: projectIdParam } = useParams<{ projectId?: string }>();
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
    const [projectFormBaseline, setProjectFormBaseline] = useState<ProjectFormState>(emptyProjectForm);
    const [activeWorkspace, setActiveWorkspace] = useState<ProjectWorkspace>('overview');
    const [projectSearch, setProjectSearch] = useState('');
    const [projectStatusFilter, setProjectStatusFilter] = useState<ProjectListFilter>('all');
    const [factForm, setFactForm] = useState<FactFormState>(emptyFactForm);
    const [factFormBaseline, setFactFormBaseline] = useState<FactFormState>(emptyFactForm);
    const [materialForm, setMaterialForm] = useState<MaterialFormState>(emptyMaterialForm);
    const [materialFormBaseline, setMaterialFormBaseline] = useState<MaterialFormState>(emptyMaterialForm);
    const [mapForm, setMapForm] = useState<MapFormState>(emptyMapForm);
    const [mapFormBaseline, setMapFormBaseline] = useState<MapFormState>(emptyMapForm);
    const [mediaBlockForm, setMediaBlockForm] = useState<MediaBlockFormState>(emptyMediaBlockForm);
    const [mediaBlockFormBaseline, setMediaBlockFormBaseline] = useState<MediaBlockFormState>(emptyMediaBlockForm);
    const [hotspotForm, setHotspotForm] = useState<HotspotFormState>(emptyHotspotForm);
    const [hotspotFormBaseline, setHotspotFormBaseline] = useState<HotspotFormState>(emptyHotspotForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProject, setIsSavingProject] = useState(false);
    const [isSavingFact, setIsSavingFact] = useState(false);
    const [isSavingMaterial, setIsSavingMaterial] = useState(false);
    const [isSavingMap, setIsSavingMap] = useState(false);
    const [isSavingMediaBlock, setIsSavingMediaBlock] = useState(false);
    const [isSavingHotspot, setIsSavingHotspot] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [highlightedPublishBlockerId, setHighlightedPublishBlockerId] = useState<string | null>(null);
    const projectEditorRef = useRef<HTMLFormElement | null>(null);
    const factsEditorRef = useRef<HTMLElement | null>(null);
    const materialsEditorRef = useRef<HTMLElement | null>(null);
    const mediaEditorRef = useRef<HTMLElement | null>(null);
    const mapsEditorRef = useRef<HTMLElement | null>(null);
    const hasLoadedProjectsRef = useRef(false);
    const skipNextRouteLoadRef = useRef(false);
    const allowNextRouteDiscardRef = useRef(false);
    const projectsLoadGenerationRef = useRef(0);
    const projectBundleLoadGenerationRef = useRef(0);
    const hotspotLoadGenerationRef = useRef(0);
    const selectedProjectIdRef = useRef<number | null>(null);
    const selectedFactIdRef = useRef<number | null>(null);
    const selectedMaterialIdRef = useRef<number | null>(null);
    const selectedMapIdRef = useRef<number | null>(null);
    const selectedMediaBlockIdRef = useRef<number | null>(null);
    const selectedHotspotIdRef = useRef<number | null>(null);
    const isProjectDirtyRef = useRef(false);
    const activeSaveCountRef = useRef(0);
    const savingProjectRef = useRef(false);
    const savingFactRef = useRef(false);
    const savingMaterialRef = useRef(false);
    const savingMapRef = useRef(false);
    const savingMediaBlockRef = useRef(false);
    const savingHotspotRef = useRef(false);

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
    const dirtyEditors = useMemo(
        () => ({
            overview: !formStatesMatch(projectForm, projectFormBaseline),
            fact: !formStatesMatch(factForm, factFormBaseline),
            material: !formStatesMatch(materialForm, materialFormBaseline),
            media: !formStatesMatch(mediaBlockForm, mediaBlockFormBaseline),
            map: !formStatesMatch(mapForm, mapFormBaseline),
            hotspot: !formStatesMatch(hotspotForm, hotspotFormBaseline),
        }),
        [
            factForm,
            factFormBaseline,
            hotspotForm,
            hotspotFormBaseline,
            mapForm,
            mapFormBaseline,
            materialForm,
            materialFormBaseline,
            mediaBlockForm,
            mediaBlockFormBaseline,
            projectForm,
            projectFormBaseline,
        ],
    );
    const dirtyEditorLabels = useMemo(() => getDirtyEditorLabels(dirtyEditors), [dirtyEditors]);
    const isProjectDirty = dirtyEditorLabels.length > 0;
    const dirtyEditorSummary = formatEditorList(dirtyEditorLabels);
    const isAnySaving =
        isSavingProject ||
        isSavingFact ||
        isSavingMaterial ||
        isSavingMap ||
        isSavingMediaBlock ||
        isSavingHotspot;

    selectedProjectIdRef.current = selectedProjectId;
    selectedFactIdRef.current = selectedFactId;
    selectedMaterialIdRef.current = selectedMaterialId;
    selectedMapIdRef.current = selectedMapId;
    selectedMediaBlockIdRef.current = selectedMediaBlockId;
    selectedHotspotIdRef.current = selectedHotspotId;
    isProjectDirtyRef.current = isProjectDirty;

    const fetchHotspots = useCallback(async (client: SupabaseClient, mapId: number) => {
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

        return data ?? [];
    }, []);

    const loadHotspots = useCallback(async (
        client: SupabaseClient,
        projectId: number,
        mapId: number | null,
        preferredHotspotId: number | null,
    ) => {
        const generation = ++hotspotLoadGenerationRef.current;
        if (!mapId) {
            if (
                generation !== hotspotLoadGenerationRef.current ||
                selectedProjectIdRef.current !== projectId ||
                selectedMapIdRef.current !== null
            ) {
                return false;
            }
            setHotspots([]);
            setSelectedHotspotId(null);
            setHotspotForm(emptyHotspotForm);
            setHotspotFormBaseline(emptyHotspotForm);
            return true;
        }

        const rows = await fetchHotspots(client, mapId);
        if (
            generation !== hotspotLoadGenerationRef.current ||
            selectedProjectIdRef.current !== projectId ||
            selectedMapIdRef.current !== mapId
        ) {
            return false;
        }

        const nextHotspot = rows.find((hotspot) => hotspot.id === preferredHotspotId) ?? rows[0] ?? null;
        const nextHotspotForm = rowToHotspotForm(nextHotspot);
        setHotspots(rows);
        setSelectedHotspotId(nextHotspot?.id ?? null);
        setHotspotForm(nextHotspotForm);
        setHotspotFormBaseline(nextHotspotForm);
        return true;
    }, [fetchHotspots]);

    const loadProjectBundle = useCallback(
        async (
            client: SupabaseClient,
            projectId: number,
            preferredMapId: number | null = null,
            preferredHotspotId: number | null = null,
        ) => {
            const bundleGeneration = ++projectBundleLoadGenerationRef.current;
            const hotspotGeneration = ++hotspotLoadGenerationRef.current;
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
            const nextFactForm = rowToFactForm(nextFact);
            const nextMaterialForm = rowToMaterialForm(nextMaterial);
            const nextMapForm = rowToMapForm(nextMap);
            const nextMediaBlockForm = rowToMediaBlockForm(nextMediaBlock);
            const hotspotRows = nextMap ? await fetchHotspots(client, nextMap.id) : [];

            if (
                bundleGeneration !== projectBundleLoadGenerationRef.current ||
                hotspotGeneration !== hotspotLoadGenerationRef.current ||
                selectedProjectIdRef.current !== projectId
            ) {
                return false;
            }

            const nextHotspot =
                hotspotRows.find((hotspot) => hotspot.id === preferredHotspotId) ?? hotspotRows[0] ?? null;
            const nextHotspotForm = rowToHotspotForm(nextHotspot);

            setFacts(factRows);
            setSelectedFactId(nextFact?.id ?? null);
            setFactForm(nextFactForm);
            setFactFormBaseline(nextFactForm);
            setMaterials(materialRows);
            setSelectedMaterialId(nextMaterial?.id ?? null);
            setMaterialForm(nextMaterialForm);
            setMaterialFormBaseline(nextMaterialForm);
            setMaps(mapRows);
            setSelectedMapId(nextMap?.id ?? null);
            setMapForm(nextMapForm);
            setMapFormBaseline(nextMapForm);
            setMediaBlocks(mediaBlockRows);
            setSelectedMediaBlockId(nextMediaBlock?.id ?? null);
            setMediaBlockForm(nextMediaBlockForm);
            setMediaBlockFormBaseline(nextMediaBlockForm);
            setHotspots(hotspotRows);
            setSelectedHotspotId(nextHotspot?.id ?? null);
            setHotspotForm(nextHotspotForm);
            setHotspotFormBaseline(nextHotspotForm);
            return true;
        },
        [fetchHotspots],
    );

    const loadProjects = useCallback(
        async (preferredProjectId?: number | null, requestedRouteId?: string) => {
            if (!supabase) {
                return;
            }

            const loadGeneration = ++projectsLoadGenerationRef.current;
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
                    .limit(500)
                    .returns<MediaOptionRow[]>(),
            ]);

            if (loadGeneration !== projectsLoadGenerationRef.current) {
                return;
            }

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
            const requestedProject = rows.find((project) => project.id === preferredProjectId) ?? null;
            const nextProject = requestedProject ?? rows[0] ?? null;
            const requestedRouteIsInvalid =
                requestedRouteId !== undefined &&
                (!preferredProjectId || !Number.isInteger(preferredProjectId) || requestedProject === null);
            const nextProjectForm = rowToProjectForm(nextProject);
            selectedProjectIdRef.current = nextProject?.id ?? null;
            setProjects(rows);
            setStoneOptions(stonesResult.data ?? []);
            setFinishOptions(finishesResult.data ?? []);
            setMediaOptions(mediaResult.data ?? []);
            setSelectedProjectId(nextProject?.id ?? null);
            setProjectForm(nextProjectForm);
            setProjectFormBaseline(nextProjectForm);
            resetChildState();

            if (requestedRouteIsInvalid) {
                setNotice(
                    nextProject
                        ? `Project ${requestedRouteId} was not found. Showing ${nextProject.title} instead.`
                        : `Project ${requestedRouteId} was not found. Create the first project to continue.`,
                );
            }

            if (!nextProject) {
                hasLoadedProjectsRef.current = true;
                setIsLoading(false);
                if (requestedRouteId !== undefined && window.location.pathname !== '/admin/projects') {
                    skipNextRouteLoadRef.current = true;
                    navigate('/admin/projects', { replace: true });
                }
                return;
            }

            let bundleApplied = false;
            try {
                bundleApplied = await loadProjectBundle(client, nextProject.id);
            } catch (loadError) {
                if (
                    loadGeneration === projectsLoadGenerationRef.current &&
                    selectedProjectIdRef.current === nextProject.id
                ) {
                    setError(loadError instanceof Error ? loadError.message : 'Project detail load failed.');
                }
            }

            if (
                loadGeneration !== projectsLoadGenerationRef.current ||
                selectedProjectIdRef.current !== nextProject.id ||
                !bundleApplied
            ) {
                return;
            }

            hasLoadedProjectsRef.current = true;
            setIsLoading(false);

            const canonicalProjectPath = `/admin/projects/${nextProject.id}`;
            if (window.location.pathname !== canonicalProjectPath) {
                skipNextRouteLoadRef.current = true;
                navigate(canonicalProjectPath, { replace: true });
            }
        },
        [loadProjectBundle, navigate],
    );

    useEffect(() => {
        if (skipNextRouteLoadRef.current) {
            skipNextRouteLoadRef.current = false;
            return;
        }

        if (hasLoadedProjectsRef.current && activeSaveCountRef.current > 0) {
            const currentProjectId = selectedProjectIdRef.current;
            skipNextRouteLoadRef.current = true;
            navigate(currentProjectId ? `/admin/projects/${currentProjectId}` : '/admin/projects', {
                replace: true,
            });
            setNotice('A save is still finishing. Wait for it to complete before switching project records.');
            return;
        }

        if (allowNextRouteDiscardRef.current) {
            allowNextRouteDiscardRef.current = false;
        } else if (hasLoadedProjectsRef.current && isProjectDirtyRef.current) {
            const shouldDiscard = window.confirm(
                'This project has unsaved changes. Leave this record and discard those changes?',
            );
            if (!shouldDiscard) {
                const currentProjectId = selectedProjectIdRef.current;
                skipNextRouteLoadRef.current = true;
                navigate(currentProjectId ? `/admin/projects/${currentProjectId}` : '/admin/projects', {
                    replace: true,
                });
                return;
            }
        }

        void loadProjects(parseProjectRouteId(projectIdParam), projectIdParam);
    }, [loadProjects, navigate, projectIdParam]);

    useEffect(() => {
        if (!isProjectDirty && !isAnySaving) return;

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };
        const handleDocumentClick = (event: MouseEvent) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            const target = event.target;
            const anchor = target instanceof Element ? target.closest<HTMLAnchorElement>('a[href]') : null;
            const button = target instanceof Element ? target.closest<HTMLButtonElement>('button') : null;
            const isSignOut = button?.textContent?.trim().toLowerCase() === 'sign out';
            if (!anchor && !isSignOut) return;
            if (anchor && (anchor.target === '_blank' || anchor.hasAttribute('download'))) return;

            if (anchor) {
                const destination = new URL(anchor.href, window.location.href);
                if (destination.href === window.location.href) return;
            }

            if (activeSaveCountRef.current > 0) {
                event.preventDefault();
                event.stopPropagation();
                setNotice('A save is still finishing. Wait for it to complete before leaving Projects.');
                return;
            }

            const shouldLeave = window.confirm(
                `Unsaved changes in ${dirtyEditorSummary}. Leave this page and discard those changes?`,
            );
            if (!shouldLeave) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                allowNextRouteDiscardRef.current = true;
            }
        };
        const handlePopState = () => {
            if (activeSaveCountRef.current > 0) {
                const currentProjectId = selectedProjectIdRef.current;
                skipNextRouteLoadRef.current = true;
                navigate(currentProjectId ? `/admin/projects/${currentProjectId}` : '/admin/projects', {
                    replace: true,
                });
                setNotice('A save is still finishing. Wait for it to complete before switching project records.');
                return;
            }

            const shouldLeave = window.confirm(
                `Unsaved changes in ${dirtyEditorSummary}. Leave this record and discard those changes?`,
            );
            if (shouldLeave) {
                allowNextRouteDiscardRef.current = true;
                return;
            }

            const currentProjectId = selectedProjectIdRef.current;
            skipNextRouteLoadRef.current = true;
            navigate(currentProjectId ? `/admin/projects/${currentProjectId}` : '/admin/projects', {
                replace: true,
            });
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);
        document.addEventListener('click', handleDocumentClick, true);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
            document.removeEventListener('click', handleDocumentClick, true);
        };
    }, [dirtyEditorSummary, isAnySaving, isProjectDirty, navigate]);

    function beginSave(saveRef: { current: boolean }, setSaving: (value: boolean) => void) {
        if (saveRef.current) return false;
        saveRef.current = true;
        activeSaveCountRef.current += 1;
        setSaving(true);
        return true;
    }

    function endSave(saveRef: { current: boolean }, setSaving: (value: boolean) => void) {
        if (!saveRef.current) return;
        saveRef.current = false;
        activeSaveCountRef.current = Math.max(0, activeSaveCountRef.current - 1);
        setSaving(false);
    }

    function blockRecordChangeWhileSaving(action: string) {
        if (activeSaveCountRef.current === 0) return false;
        setNotice(`A save is still finishing. Wait for it to complete before ${action}.`);
        return true;
    }

    function resetChildState() {
        projectBundleLoadGenerationRef.current += 1;
        hotspotLoadGenerationRef.current += 1;
        selectedFactIdRef.current = null;
        selectedMaterialIdRef.current = null;
        selectedMapIdRef.current = null;
        selectedMediaBlockIdRef.current = null;
        selectedHotspotIdRef.current = null;
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
        setFactFormBaseline(emptyFactForm);
        setMaterialForm(emptyMaterialForm);
        setMaterialFormBaseline(emptyMaterialForm);
        setMapForm(emptyMapForm);
        setMapFormBaseline(emptyMapForm);
        setMediaBlockForm(emptyMediaBlockForm);
        setMediaBlockFormBaseline(emptyMediaBlockForm);
        setHotspotForm(emptyHotspotForm);
        setHotspotFormBaseline(emptyHotspotForm);
    }

    function confirmDiscardDirtyEditors(action: string, labels: string[] = dirtyEditorLabels) {
        if (!labels.length) return true;

        return window.confirm(
            `Unsaved changes in ${formatEditorList(labels)}. ${action} and discard those changes?`,
        );
    }

    function selectFactEditor(fact: ProjectFactRow) {
        if (fact.id === selectedFactId) return true;
        if (blockRecordChangeWhileSaving('switching facts')) return false;
        if (!confirmDiscardDirtyEditors('Switch facts', dirtyEditors.fact ? ['Fact'] : [])) return false;

        const nextForm = rowToFactForm(fact);
        selectedFactIdRef.current = fact.id;
        setSelectedFactId(fact.id);
        setFactForm(nextForm);
        setFactFormBaseline(nextForm);
        return true;
    }

    function startNewFact() {
        if (blockRecordChangeWhileSaving('starting a new fact')) return;
        if (!confirmDiscardDirtyEditors('Start a new fact', dirtyEditors.fact ? ['Fact'] : [])) return;
        selectedFactIdRef.current = null;
        setSelectedFactId(null);
        setFactForm(emptyFactForm);
        setFactFormBaseline(emptyFactForm);
    }

    function selectMaterialEditor(material: ProjectMaterialRow) {
        if (material.id === selectedMaterialId) return true;
        if (blockRecordChangeWhileSaving('switching materials')) return false;
        if (!confirmDiscardDirtyEditors('Switch materials', dirtyEditors.material ? ['Material'] : [])) return false;

        const nextForm = rowToMaterialForm(material);
        selectedMaterialIdRef.current = material.id;
        setSelectedMaterialId(material.id);
        setMaterialForm(nextForm);
        setMaterialFormBaseline(nextForm);
        return true;
    }

    function startNewMaterial() {
        if (blockRecordChangeWhileSaving('starting a new material')) return;
        if (!confirmDiscardDirtyEditors('Start a new material', dirtyEditors.material ? ['Material'] : [])) return;
        selectedMaterialIdRef.current = null;
        setSelectedMaterialId(null);
        setMaterialForm(emptyMaterialForm);
        setMaterialFormBaseline(emptyMaterialForm);
    }

    function selectMediaBlockEditor(mediaBlock: ProjectMediaRow) {
        if (mediaBlock.id === selectedMediaBlockId) return;
        if (blockRecordChangeWhileSaving('switching media blocks')) return;
        if (!confirmDiscardDirtyEditors('Switch media blocks', dirtyEditors.media ? ['Media block'] : [])) return;

        const nextForm = rowToMediaBlockForm(mediaBlock);
        selectedMediaBlockIdRef.current = mediaBlock.id;
        setSelectedMediaBlockId(mediaBlock.id);
        setMediaBlockForm(nextForm);
        setMediaBlockFormBaseline(nextForm);
    }

    function startNewMediaBlock() {
        if (blockRecordChangeWhileSaving('starting a new media block')) return;
        if (!confirmDiscardDirtyEditors('Start a new media block', dirtyEditors.media ? ['Media block'] : [])) return;
        selectedMediaBlockIdRef.current = null;
        setSelectedMediaBlockId(null);
        setMediaBlockForm(emptyMediaBlockForm);
        setMediaBlockFormBaseline(emptyMediaBlockForm);
    }

    function selectHotspotEditor(hotspot: ProjectHotspotRow) {
        if (hotspot.id === selectedHotspotId) return;
        if (blockRecordChangeWhileSaving('switching hotspots')) return;
        if (!confirmDiscardDirtyEditors('Switch hotspots', dirtyEditors.hotspot ? ['Hotspot'] : [])) return;

        const nextForm = rowToHotspotForm(hotspot);
        selectedHotspotIdRef.current = hotspot.id;
        setSelectedHotspotId(hotspot.id);
        setHotspotForm(nextForm);
        setHotspotFormBaseline(nextForm);
    }

    function startNewHotspot() {
        if (blockRecordChangeWhileSaving('starting a new hotspot')) return;
        if (!confirmDiscardDirtyEditors('Start a new hotspot', dirtyEditors.hotspot ? ['Hotspot'] : [])) return;
        selectedHotspotIdRef.current = null;
        setSelectedHotspotId(null);
        setHotspotForm(emptyHotspotForm);
        setHotspotFormBaseline(emptyHotspotForm);
    }

    async function selectMapEditor(map: ProjectMaterialMapRow) {
        if (map.id === selectedMapId) return;
        if (blockRecordChangeWhileSaving('switching maps')) return;
        const dirtyMapLabels = [
            ...(dirtyEditors.map ? ['Map'] : []),
            ...(dirtyEditors.hotspot ? ['Hotspot'] : []),
        ];
        if (!confirmDiscardDirtyEditors('Switch maps', dirtyMapLabels)) return;

        const nextForm = rowToMapForm(map);
        selectedMapIdRef.current = map.id;
        selectedHotspotIdRef.current = null;
        setSelectedMapId(map.id);
        setMapForm(nextForm);
        setMapFormBaseline(nextForm);
        setHotspots([]);
        setSelectedHotspotId(null);
        setHotspotForm(emptyHotspotForm);
        setHotspotFormBaseline(emptyHotspotForm);
        if (supabase) {
            try {
                await loadHotspots(supabase, selectedProjectIdRef.current ?? 0, map.id, null);
            } catch (loadError) {
                if (selectedMapIdRef.current === map.id) {
                    setError(loadError instanceof Error ? loadError.message : 'Project hotspots could not be loaded.');
                }
            }
        }
    }

    function startNewMap() {
        if (blockRecordChangeWhileSaving('starting a new map')) return;
        const dirtyMapLabels = [
            ...(dirtyEditors.map ? ['Map'] : []),
            ...(dirtyEditors.hotspot ? ['Hotspot'] : []),
        ];
        if (!confirmDiscardDirtyEditors('Start a new map', dirtyMapLabels)) return;

        projectBundleLoadGenerationRef.current += 1;
        hotspotLoadGenerationRef.current += 1;
        selectedMapIdRef.current = null;
        selectedHotspotIdRef.current = null;
        setSelectedMapId(null);
        setMapForm(emptyMapForm);
        setMapFormBaseline(emptyMapForm);
        setHotspots([]);
        setSelectedHotspotId(null);
        setHotspotForm(emptyHotspotForm);
        setHotspotFormBaseline(emptyHotspotForm);
    }

    async function selectProject(project: ProjectRow) {
        if (project.id === selectedProjectId) return;
        if (blockRecordChangeWhileSaving('switching projects')) return;
        if (!confirmDiscardDirtyEditors('Switch projects')) {
            return;
        }

        const nextProjectForm = rowToProjectForm(project);
        selectedProjectIdRef.current = project.id;
        setSelectedProjectId(project.id);
        setProjectForm(nextProjectForm);
        setProjectFormBaseline(nextProjectForm);
        setActiveWorkspace('overview');
        resetChildState();
        setError(null);
        setNotice(null);
        setHighlightedPublishBlockerId(null);
        setIsLoading(true);
        skipNextRouteLoadRef.current = true;
        navigate(`/admin/projects/${project.id}`);

        if (!supabase) {
            return;
        }

        try {
            await loadProjectBundle(supabase, project.id);
        } catch (loadError) {
            if (selectedProjectIdRef.current === project.id) {
                setError(loadError instanceof Error ? loadError.message : 'Project detail load failed.');
            }
        } finally {
            if (selectedProjectIdRef.current === project.id) {
                setIsLoading(false);
            }
        }
    }

    function startNewProject() {
        if (isLoading) {
            setNotice('Wait for the project workspace to finish loading before starting a new project.');
            return;
        }
        if (blockRecordChangeWhileSaving('starting a new project')) return;
        if (!confirmDiscardDirtyEditors('Start a new project')) {
            return;
        }

        projectsLoadGenerationRef.current += 1;
        selectedProjectIdRef.current = null;
        setSelectedProjectId(null);
        setProjectForm(emptyProjectForm);
        setProjectFormBaseline(emptyProjectForm);
        setActiveWorkspace('overview');
        resetChildState();
        setError(null);
        setNotice('New project started.');
        setHighlightedPublishBlockerId(null);
        if (window.location.pathname !== '/admin/projects') {
            skipNextRouteLoadRef.current = true;
            navigate('/admin/projects');
        }
    }

    function selectWorkspace(workspace: ProjectWorkspace) {
        if (workspace === activeWorkspace) return true;
        const activeDirtyLabels = getWorkspaceDirtyEditorLabels(activeWorkspace, dirtyEditors);
        if (
            activeDirtyLabels.length > 0 &&
            !window.confirm(
                `Unsaved changes in ${formatEditorList(activeDirtyLabels)}. Continue to ${getProjectWorkspaceLabel(workspace)} with those changes still unsaved?`,
            )
        ) {
            return false;
        }
        setActiveWorkspace(workspace);
        return true;
    }

    function updateProjectField<Key extends keyof ProjectFormState>(key: Key, value: ProjectFormState[Key]) {
        setProjectForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
        setHighlightedPublishBlockerId(null);
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
                setHighlightedPublishBlockerId(blockers[0].id);
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

        if (!beginSave(savingProjectRef, setIsSavingProject)) return;
        const projectId = selectedProjectIdRef.current;

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

        setError(null);
        setNotice(null);

        const response = projectId
            ? await supabase
                  .from('projects')
                  .update(payload)
                  .eq('id', projectId)
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

        if (response.error) {
            endSave(savingProjectRef, setIsSavingProject);
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: projectId
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
        if (selectedProjectIdRef.current !== projectId) {
            endSave(savingProjectRef, setIsSavingProject);
            return;
        }
        const savedProjectForm = rowToProjectForm(response.data);
        setProjects((current) =>
            upsertRowById(current, response.data, (left, right) =>
                left.sort_order - right.sort_order || left.title.localeCompare(right.title),
            ),
        );
        selectedProjectIdRef.current = response.data.id;
        setSelectedProjectId(response.data.id);
        setProjectForm(savedProjectForm);
        setProjectFormBaseline(savedProjectForm);
        setNotice(withAuditNotice(nextStatus === 'published' ? 'Project published.' : 'Project saved.', auditError));
        const canonicalProjectPath = `/admin/projects/${response.data.id}`;
        if (window.location.pathname !== canonicalProjectPath) {
            skipNextRouteLoadRef.current = true;
            navigate(canonicalProjectPath, { replace: true });
        }
        endSave(savingProjectRef, setIsSavingProject);
    }

    function selectPublishBlocker(blocker: PublishBlocker) {
        setHighlightedPublishBlockerId(blocker.id);
        const targetWorkspace =
            blocker.area === 'fact' ? 'facts' : blocker.area === 'material' ? 'materials' : 'overview';
        if (!selectWorkspace(targetWorkspace)) return;
        const targetRef =
            blocker.area === 'fact' ? factsEditorRef : blocker.area === 'material' ? materialsEditorRef : projectEditorRef;

        if (blocker.area === 'fact' && blocker.rowId) {
            const fact = facts.find((row) => row.id === blocker.rowId);
            if (fact) {
                if (!selectFactEditor(fact)) return;
            }
        }

        if (blocker.area === 'material' && blocker.rowId) {
            const material = materials.find((row) => row.id === blocker.rowId);
            if (material) {
                if (!selectMaterialEditor(material)) return;
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

        if (!beginSave(savingFactRef, setIsSavingFact)) return;
        const projectId = selectedProject.id;
        const factId = selectedFactIdRef.current;

        const payload = {
            fact_label: factForm.factLabel.trim(),
            fact_value: factForm.factValue.trim() || null,
            fact_value_json: validation.factValueJson,
            claim_status: factForm.claimStatus,
            sort_order: validation.sortOrder,
            updated_by: user.id,
        };

        setError(null);
        setNotice(null);

        const response = factId
            ? await supabase
                  .from('project_facts')
                  .update(payload)
                  .eq('id', factId)
                  .eq('project_id', projectId)
                  .select('id,project_id,fact_label,fact_value,fact_value_json,claim_status,sort_order,updated_at')
                  .single<ProjectFactRow>()
            : await supabase
                  .from('project_facts')
                  .insert({ ...payload, project_id: projectId, created_by: user.id })
                  .select('id,project_id,fact_label,fact_value,fact_value_json,claim_status,sort_order,updated_at')
                  .single<ProjectFactRow>();

        if (response.error) {
            endSave(savingFactRef, setIsSavingFact);
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: factId ? 'project_fact.update' : 'project_fact.create',
            entityType: 'project_facts',
            entityId: response.data.id,
            metadata: {
                projectId: response.data.project_id,
                label: response.data.fact_label,
                claimStatus: response.data.claim_status,
            },
        });
        if (
            selectedProjectIdRef.current !== projectId ||
            selectedFactIdRef.current !== factId
        ) {
            endSave(savingFactRef, setIsSavingFact);
            return;
        }
        const savedFactForm = rowToFactForm(response.data);
        setFacts((current) =>
            upsertRowById(current, response.data, (left, right) =>
                left.sort_order - right.sort_order || left.fact_label.localeCompare(right.fact_label),
            ),
        );
        selectedFactIdRef.current = response.data.id;
        setSelectedFactId(response.data.id);
        setFactForm(savedFactForm);
        setFactFormBaseline(savedFactForm);
        setNotice(withAuditNotice('Project fact saved.', auditError));
        endSave(savingFactRef, setIsSavingFact);
    }

    async function saveMaterial() {
        if (!supabase || !canEdit || !user || !selectedProject) return;

        const validation = validateMaterialForm(materialForm);
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        if (!beginSave(savingMaterialRef, setIsSavingMaterial)) return;
        const projectId = selectedProject.id;
        const materialId = selectedMaterialIdRef.current;

        const payload = {
            stone_group_id: validation.stoneGroupId,
            finish_definition_id: validation.finishDefinitionId,
            application: materialForm.application.trim(),
            note: materialForm.note.trim() || null,
            media_asset_id: validation.mediaAssetId,
            claim_status: materialForm.claimStatus,
            sort_order: validation.sortOrder,
            updated_by: user.id,
        };

        setError(null);
        setNotice(null);

        const response = materialId
            ? await supabase
                  .from('project_materials')
                  .update(payload)
                  .eq('id', materialId)
                  .eq('project_id', projectId)
                  .select(
                      'id,project_id,stone_group_id,finish_definition_id,application,note,media_asset_id,claim_status,sort_order,updated_at',
                  )
                  .single<ProjectMaterialRow>()
            : await supabase
                  .from('project_materials')
                  .insert({ ...payload, project_id: projectId, created_by: user.id })
                  .select(
                      'id,project_id,stone_group_id,finish_definition_id,application,note,media_asset_id,claim_status,sort_order,updated_at',
                  )
                  .single<ProjectMaterialRow>();

        if (response.error) {
            endSave(savingMaterialRef, setIsSavingMaterial);
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: materialId ? 'project_material.update' : 'project_material.create',
            entityType: 'project_materials',
            entityId: response.data.id,
            metadata: {
                projectId: response.data.project_id,
                stoneGroupId: response.data.stone_group_id,
                finishDefinitionId: response.data.finish_definition_id,
                claimStatus: response.data.claim_status,
            },
        });
        if (
            selectedProjectIdRef.current !== projectId ||
            selectedMaterialIdRef.current !== materialId
        ) {
            endSave(savingMaterialRef, setIsSavingMaterial);
            return;
        }
        const savedMaterialForm = rowToMaterialForm(response.data);
        setMaterials((current) =>
            upsertRowById(current, response.data, (left, right) =>
                left.sort_order - right.sort_order || left.application.localeCompare(right.application),
            ),
        );
        selectedMaterialIdRef.current = response.data.id;
        setSelectedMaterialId(response.data.id);
        setMaterialForm(savedMaterialForm);
        setMaterialFormBaseline(savedMaterialForm);
        setNotice(withAuditNotice('Project material saved.', auditError));
        endSave(savingMaterialRef, setIsSavingMaterial);
    }

    async function saveMap(nextStatus: ProjectStatus) {
        if (!supabase || !canEdit || !user || !selectedProject) return;

        const validation = validateMapForm({ ...mapForm, status: nextStatus });
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        if (!beginSave(savingMapRef, setIsSavingMap)) return;
        const projectId = selectedProject.id;
        const mapId = selectedMapIdRef.current;

        const now = new Date().toISOString();
        const payload = {
            media_asset_id: validation.mediaAssetId,
            title: mapForm.title.trim() || null,
            intro: mapForm.intro.trim() || null,
            sort_order: validation.sortOrder,
            status: nextStatus,
            updated_by: user.id,
            published_at: nextStatus === 'published' ? (selectedMap?.published_at ?? now) : selectedMap?.published_at,
            archived_at: nextStatus === 'archived' ? now : null,
        };

        setError(null);
        setNotice(null);

        const response = mapId
            ? await supabase
                  .from('project_material_maps')
                  .update(payload)
                  .eq('id', mapId)
                  .eq('project_id', projectId)
                  .select('id,project_id,media_asset_id,title,intro,sort_order,status,published_at,archived_at,updated_at')
                  .single<ProjectMaterialMapRow>()
            : await supabase
                  .from('project_material_maps')
                  .insert({ ...payload, project_id: projectId, created_by: user.id })
                  .select('id,project_id,media_asset_id,title,intro,sort_order,status,published_at,archived_at,updated_at')
                  .single<ProjectMaterialMapRow>();

        if (response.error) {
            endSave(savingMapRef, setIsSavingMap);
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: mapId
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
        if (
            selectedProjectIdRef.current !== projectId ||
            selectedMapIdRef.current !== mapId
        ) {
            endSave(savingMapRef, setIsSavingMap);
            return;
        }
        const wasNewMap = mapId === null;
        const savedMapForm = rowToMapForm(response.data);
        setMaps((current) =>
            upsertRowById(current, response.data, (left, right) => left.sort_order - right.sort_order),
        );
        selectedMapIdRef.current = response.data.id;
        setSelectedMapId(response.data.id);
        setMapForm(savedMapForm);
        setMapFormBaseline(savedMapForm);
        if (wasNewMap) {
            setHotspots([]);
            setSelectedHotspotId(null);
            setHotspotForm(emptyHotspotForm);
            setHotspotFormBaseline(emptyHotspotForm);
        }
        setNotice(
            withAuditNotice(nextStatus === 'published' ? 'Material map published.' : 'Material map saved.', auditError),
        );
        endSave(savingMapRef, setIsSavingMap);
    }

    async function saveMediaBlock(nextStatus: ProjectStatus) {
        if (!supabase || !canEdit || !user || !selectedProject) return;

        const validation = validateMediaBlockForm({ ...mediaBlockForm, status: nextStatus }, maps);
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        if (!beginSave(savingMediaBlockRef, setIsSavingMediaBlock)) return;
        const projectId = selectedProject.id;
        const mediaBlockId = selectedMediaBlockIdRef.current;

        const now = new Date().toISOString();
        const payload = {
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

        setError(null);
        setNotice(null);

        const response = mediaBlockId
            ? await supabase
                  .from('project_media')
                  .update(payload)
                  .eq('id', mediaBlockId)
                  .eq('project_id', projectId)
                  .select(
                      'id,project_id,media_asset_id,project_material_map_id,media_role,block_title,youtube_url,label,caption,sort_order,status,published_at,archived_at,updated_at',
                  )
                  .single<ProjectMediaRow>()
            : await supabase
                  .from('project_media')
                  .insert({ ...payload, project_id: projectId, created_by: user.id })
                  .select(
                      'id,project_id,media_asset_id,project_material_map_id,media_role,block_title,youtube_url,label,caption,sort_order,status,published_at,archived_at,updated_at',
                  )
                  .single<ProjectMediaRow>();

        if (response.error) {
            endSave(savingMediaBlockRef, setIsSavingMediaBlock);
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: mediaBlockId
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
        if (
            selectedProjectIdRef.current !== projectId ||
            selectedMediaBlockIdRef.current !== mediaBlockId
        ) {
            endSave(savingMediaBlockRef, setIsSavingMediaBlock);
            return;
        }
        const savedMediaBlockForm = rowToMediaBlockForm(response.data);
        setMediaBlocks((current) =>
            upsertRowById(current, response.data, (left, right) =>
                left.sort_order - right.sort_order || left.id - right.id,
            ),
        );
        selectedMediaBlockIdRef.current = response.data.id;
        setSelectedMediaBlockId(response.data.id);
        setMediaBlockForm(savedMediaBlockForm);
        setMediaBlockFormBaseline(savedMediaBlockForm);
        setNotice(withAuditNotice(nextStatus === 'published' ? 'Project media block published.' : 'Project media block saved.', auditError));
        endSave(savingMediaBlockRef, setIsSavingMediaBlock);
    }

    async function saveHotspot(nextStatus: ProjectStatus) {
        if (!supabase || !canEdit || !user || !selectedMap) return;

        const validation = validateHotspotForm({ ...hotspotForm, status: nextStatus });
        if (validation.error !== null) {
            setError(validation.error);
            return;
        }

        if (!beginSave(savingHotspotRef, setIsSavingHotspot)) return;
        const projectId = selectedProjectIdRef.current;
        const mapId = selectedMap.id;
        const hotspotId = selectedHotspotIdRef.current;

        const now = new Date().toISOString();
        const payload = {
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

        setError(null);
        setNotice(null);

        const response = hotspotId
            ? await supabase
                  .from('project_hotspots')
                  .update(payload)
                  .eq('id', hotspotId)
                  .eq('project_material_map_id', mapId)
                  .select(
                      'id,project_material_map_id,project_material_id,hotspot_key,x_percent,y_percent,label,application,note,preview_media_id,sort_order,status,published_at,archived_at,updated_at',
                  )
                  .single<ProjectHotspotRow>()
            : await supabase
                  .from('project_hotspots')
                  .insert({ ...payload, project_material_map_id: mapId, created_by: user.id })
                  .select(
                      'id,project_material_map_id,project_material_id,hotspot_key,x_percent,y_percent,label,application,note,preview_media_id,sort_order,status,published_at,archived_at,updated_at',
                  )
                  .single<ProjectHotspotRow>();

        if (response.error) {
            endSave(savingHotspotRef, setIsSavingHotspot);
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: hotspotId
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
        if (
            selectedProjectIdRef.current !== projectId ||
            selectedMapIdRef.current !== mapId ||
            selectedHotspotIdRef.current !== hotspotId
        ) {
            endSave(savingHotspotRef, setIsSavingHotspot);
            return;
        }
        const savedHotspotForm = rowToHotspotForm(response.data);
        setHotspots((current) =>
            upsertRowById(current, response.data, (left, right) =>
                left.sort_order - right.sort_order || left.hotspot_key.localeCompare(right.hotspot_key),
            ),
        );
        selectedHotspotIdRef.current = response.data.id;
        setSelectedHotspotId(response.data.id);
        setHotspotForm(savedHotspotForm);
        setHotspotFormBaseline(savedHotspotForm);
        setNotice(withAuditNotice(nextStatus === 'published' ? 'Hotspot published.' : 'Hotspot saved.', auditError));
        endSave(savingHotspotRef, setIsSavingHotspot);
    }

    return (
        <AdminShell
            title="Projects"
            eyebrow={canEdit ? 'Editing access' : 'Read only'}
            actions={
                <button
                    type="button"
                    onClick={startNewProject}
                    disabled={!canEdit || isLoading || isAnySaving}
                    className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                >
                    <Plus className="h-4 w-4" />
                    New project
                </button>
            }
        >
            <div
                className={[
                    'grid items-start gap-5 xl:grid-cols-[minmax(280px,390px)_minmax(0,1fr)]',
                    isLoading ? 'opacity-60' : '',
                ].join(' ')}
                aria-busy={isLoading}
                inert={isLoading}
            >
                <section className="border border-black/10 bg-white">
                    <div className="border-b border-black/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            Project case studies
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
                                placeholder="Search project, URL key, location, client"
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
                                                    URL: {project.slug} / {project.location ?? 'Location not set'}
                                                </span>
                                            </span>
                                            <CmsStatusPill status={project.status} />
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <ReadinessBadge ready={!rowNeedsReview} />
                                            <span className="text-xs font-semibold text-black/45">
                                                {rowNeedsReview
                                                    ? 'Proof review still needs an editor decision before publish.'
                                                    : 'Project proof has been reviewed for publication.'}
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
                                    {projects.length ? 'No matching projects' : 'No project case studies yet'}
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-black/58">
                                    {projects.length
                                        ? 'Clear the search or choose another status filter.'
                                        : 'Create a project, then add facts, materials, a material map, and hotspots.'}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="min-w-0 space-y-5">
                    <nav
                        aria-label="Project editing tasks"
                        className="border border-black/10 bg-white p-2"
                    >
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5" role="tablist">
                            {([
                                ['overview', 'Overview', `${publishBlockers.length} blockers`],
                                ['facts', 'Facts', `${facts.length} details`],
                                ['materials', 'Materials', `${materials.length} materials`],
                                ['media', 'Media', `${mediaBlocks.length} blocks`],
                                ['maps', 'Maps & hotspots', `${maps.length} maps · ${hotspots.length} hotspots`],
                            ] as Array<[ProjectWorkspace, string, string]>).map(([workspace, label, count]) => {
                                const isActive = activeWorkspace === workspace;
                                const isDisabled = workspace !== 'overview' && !selectedProject;
                                return (
                                    <button
                                        key={workspace}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        aria-controls={`project-workspace-${workspace}`}
                                        disabled={isDisabled}
                                        onClick={() => selectWorkspace(workspace)}
                                        className={[
                                            'flex min-h-14 flex-col items-start justify-center gap-1 rounded border px-3 text-left text-xs font-bold uppercase tracking-[0.1em] transition',
                                            isActive
                                                ? 'border-black bg-black text-white'
                                                : 'border-black/10 bg-white text-black/58 hover:border-black hover:text-black',
                                            isDisabled ? 'cursor-not-allowed opacity-35' : '',
                                        ].join(' ')}
                                    >
                                        <span>{label}</span>
                                        <span
                                            className={[
                                                'text-[10px] font-semibold normal-case tracking-normal',
                                                isActive ? 'text-white/65' : 'text-black/42',
                                            ].join(' ')}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    {isProjectDirty ? (
                        <section
                            role="status"
                            className="border border-amber-300 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900"
                        >
                            Unsaved changes in {dirtyEditorSummary}. Save the affected editor before switching records,
                            refreshing, signing out, or leaving Admin.
                        </section>
                    ) : null}
                    {error ? (
                        <section
                            role="alert"
                            className="border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700"
                        >
                            {error}
                        </section>
                    ) : null}
                    {notice ? (
                        <section
                            role="status"
                            className="border border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.10)] p-4 text-sm font-semibold leading-6 text-black"
                        >
                            {notice}
                        </section>
                    ) : null}

                    {activeWorkspace === 'overview' ? (
                    <form
                        id="project-workspace-overview"
                        role="tabpanel"
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
                                    Edit the public case study, review proof-sensitive details, then publish when the
                                    checklist is clear.
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
                            <ProjectPublishStatusSummary
                                status={projectForm.status}
                                blockers={publishBlockers}
                                disabled={!selectedProject && !projectForm.title.trim() && !projectForm.slug.trim()}
                                onSelectFirst={selectPublishBlocker}
                            />
                        </div>

                        <div className="mt-5">
                            <PublishReadinessPanel
                                blockers={publishBlockers}
                                disabled={!selectedProject && !projectForm.title.trim() && !projectForm.slug.trim()}
                                highlightedBlockerId={highlightedPublishBlockerId}
                                onSelect={selectPublishBlocker}
                            />
                        </div>

                        <ProjectActionBar
                            status={projectForm.status}
                            isSaving={isSavingProject}
                            disabled={!canEdit || isLoading}
                            blockerCount={publishBlockers.length}
                            firstBlockerLabel={publishBlockers[0]?.label}
                            onPublish={() => void saveProject('published')}
                            onArchive={() => void saveProject('archived')}
                        />

                        <div className="mt-7 grid gap-4 md:grid-cols-2">
                            <TextField
                                label="Title"
                                value={projectForm.title}
                                disabled={!canEdit || isSavingProject || isLoading}
                                required
                                onChange={(value) => updateProjectField('title', value)}
                            />
                            <TextField
                                label="Website URL key"
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
                                help="Published is allowed only after the Publish checklist is clear. Use Draft while editing."
                                options={[
                                    ['draft', 'Draft'],
                                    ['published', 'Published'],
                                    ['archived', 'Archived'],
                                ]}
                            />
                            <SelectField
                                label="Project proof review"
                                value={projectForm.claimReviewStatus}
                                disabled={!canEdit || isSavingProject || isLoading}
                                onChange={(value) => updateProjectField('claimReviewStatus', value as ClaimStatus)}
                                options={proofReviewOptions.map(({ value, label }) => [value, label])}
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

                        <div className="mt-3">
                            <ProofReviewHelp value={projectForm.claimReviewStatus} />
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
                                    ['tbc', 'Needs confirmation'],
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

                        <ProjectActionBar
                            status={projectForm.status}
                            isSaving={isSavingProject}
                            disabled={!canEdit || isLoading}
                            blockerCount={publishBlockers.length}
                            firstBlockerLabel={publishBlockers[0]?.label}
                            onPublish={() => void saveProject('published')}
                            onArchive={() => void saveProject('archived')}
                            compact
                        />
                    </form>
                    ) : null}

                    <section className="grid gap-5">
                        {activeWorkspace === 'facts' ? (
                        <SubrecordEditor
                            id="project-workspace-facts"
                            ref={factsEditorRef}
                            title="Facts"
                            eyebrow={`${facts.length} details`}
                            onNew={startNewFact}
                            disabled={!canEdit || !selectedProject}
                        >
                            <RecordChips
                                rows={facts}
                                selectedId={selectedFactId}
                                getLabel={(row) => `${row.fact_label} - ${getProofReviewLabel(row.claim_status)}`}
                                onSelect={selectFactEditor}
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
                                Structured detail
                                <textarea
                                    value={factForm.factValueJson}
                                    onChange={(event) => updateFactField('factValueJson', event.target.value)}
                                    disabled={!canEdit || isSavingFact || !selectedProject}
                                    rows={2}
                                    className={`${fieldClass} py-3 leading-6`}
                                />
                                <span className="mt-2 block text-xs font-medium normal-case leading-5 tracking-normal text-black/45">
                                    Optional advanced detail for structured project facts. Most facts only need the
                                    Fact value field above.
                                </span>
                            </label>
                            <SelectField
                                label="Proof review"
                                value={factForm.claimStatus}
                                disabled={!canEdit || isSavingFact || !selectedProject}
                                onChange={(value) => updateFactField('claimStatus', value as ClaimStatus)}
                                options={proofReviewOptions.map(({ value, label }) => [value, label])}
                            />
                            <ProofReviewHelp value={factForm.claimStatus} context="fact" />
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
                        ) : null}

                        {activeWorkspace === 'materials' ? (
                        <SubrecordEditor
                            id="project-workspace-materials"
                            ref={materialsEditorRef}
                            title="Materials"
                            eyebrow={`${materials.length} materials`}
                            onNew={startNewMaterial}
                            disabled={!canEdit || !selectedProject}
                        >
                            <RecordChips
                                rows={materials}
                                selectedId={selectedMaterialId}
                                getLabel={(row) => `${row.application} - ${getProofReviewLabel(row.claim_status)}`}
                                onSelect={selectMaterialEditor}
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
                                label="Proof review"
                                value={materialForm.claimStatus}
                                disabled={!canEdit || isSavingMaterial || !selectedProject}
                                onChange={(value) => updateMaterialField('claimStatus', value as ClaimStatus)}
                                options={proofReviewOptions.map(({ value, label }) => [value, label])}
                            />
                            <ProofReviewHelp value={materialForm.claimStatus} context="material" />
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
                        ) : null}

                        {activeWorkspace === 'media' ? (
                        <SubrecordEditor
                            id="project-workspace-media"
                            ref={mediaEditorRef}
                            title="Media blocks"
                            eyebrow={`${mediaBlocks.length} blocks`}
                            onNew={startNewMediaBlock}
                            disabled={!canEdit || !selectedProject}
                        >
                            <RecordChips
                                rows={mediaBlocks}
                                selectedId={selectedMediaBlockId}
                                getLabel={(row) =>
                                    `${getProjectMediaRoleLabel(row.media_role)} ${row.sort_order} - ${getProjectStatusLabel(row.status)}`
                                }
                                onSelect={selectMediaBlockEditor}
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
                                    label="Media from library"
                                    value={mediaBlockForm.mediaAssetId}
                                    disabled={!canEdit || isSavingMediaBlock || !selectedProject}
                                    mediaOptions={mediaOptions}
                                    selectedMedia={selectedMediaBlockAsset}
                                    emptyLabel="Select media"
                                    onChange={(value) => updateMediaBlockField('mediaAssetId', value)}
                                />
                            ) : (
                                <TextField
                                    label="YouTube link"
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
                                help="Published blocks can appear on the public project page. Draft blocks stay hidden while you edit."
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
                        ) : null}
                    </section>

                    {activeWorkspace === 'maps' ? (
                <section
                    id="project-workspace-maps"
                    role="tabpanel"
                    ref={mapsEditorRef}
                    className="grid scroll-mt-5 items-start gap-5 lg:grid-cols-2"
                >
                    <section className="border border-black/10 bg-black p-5 text-white">
                        <MapPin className="h-5 w-5 text-[var(--urblo-lime)]" />
                        <h2 className="mt-5 text-xl font-semibold">Map health</h2>
                        <div className="mt-5 grid gap-3 text-sm leading-6 text-white/72">
                            <p>{mediaBlocks.length} detail media blocks on the selected project.</p>
                            <p>{maps.length} material maps on the selected project.</p>
                            <p>{hotspots.length} hotspots on the selected map.</p>
                            <p>{mediaOptions.length} Media library items available for project images and video blocks.</p>
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
                                onClick={startNewMap}
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
                            getLabel={(row) => `${row.title || `Map ${row.id}`} - ${getProjectStatusLabel(row.status)}`}
                            onSelect={(row) => void selectMapEditor(row)}
                        />
                        <SelectField
                            label="Status"
                            value={mapForm.status}
                            disabled={!canEdit || isSavingMap || !selectedProject}
                            onChange={(value) => updateMapField('status', value as ProjectStatus)}
                            help="Published maps can appear on the public project page when used by a media block. Draft maps stay hidden."
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
                                onClick={startNewHotspot}
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
                            getLabel={(row) => `${row.label || row.hotspot_key} - ${getProjectStatusLabel(row.status)}`}
                            onSelect={selectHotspotEditor}
                        />
                        <SelectField
                            label="Status"
                            value={hotspotForm.status}
                            disabled={!canEdit || isSavingHotspot || !selectedMap}
                            onChange={(value) => updateHotspotField('status', value as ProjectStatus)}
                            help="Published hotspots can appear on a published material map. Draft hotspots stay hidden."
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
                            onSelect={selectHotspotEditor}
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
                        <h2 className="mt-5 text-xl font-semibold text-black">Publishing rules</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                            <li>Publish is locked until project proof, fact proof, and material proof are reviewed.</li>
                            <li>Approved proof can show publicly; Deferred proof stays saved but is not treated as an approved public claim.</li>
                            <li>Published maps need an image; hotspots need saved positions inside the image.</li>
                            <li>Archive hides the CMS version. A matching legacy project can remain visible during migration until CMS-only cutover.</li>
                        </ul>
                    </section>

                </section>
                    ) : null}

                    {!canEdit ? (
                        <section className="border border-black/10 bg-white p-5 text-sm leading-6 text-black/62">
                            Current role is read-only for Projects. Ask an editor or CMS manager to update projects.
                        </section>
                    ) : null}
                </section>
            </div>
        </AdminShell>
    );
}

function parseProjectRouteId(value: string | undefined) {
    if (value === undefined) return null;
    const projectId = Number(value);
    return Number.isInteger(projectId) && projectId > 0 ? projectId : null;
}

const statusOptions: Array<[string, string]> = [
    ['draft', 'Draft'],
    ['published', 'Published'],
    ['archived', 'Archived'],
];

const proofReviewOptions: ProofReviewOption[] = [
    {
        value: 'needs_review',
        label: 'Needs review',
        detail: 'Not ready for the public website. An editor needs to check the proof or wording first.',
    },
    {
        value: 'approved',
        label: 'Approved for public use',
        detail: 'Ready to appear on the public project page as reviewed proof.',
    },
    {
        value: 'deferred',
        label: 'Deferred / keep private',
        detail: 'Keep this note saved, but do not treat it as approved public proof.',
    },
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

function ProofReviewHelp({ value, context = 'project' }: { value: ClaimStatus; context?: 'project' | 'fact' | 'material' }) {
    const option = proofReviewOptions.find((item) => item.value === value) ?? proofReviewOptions[0];
    const locksPublish =
        value === 'needs_review' && (context === 'fact' || context === 'material')
            ? ` This ${context} will keep Project Publish locked until you choose Approved for public use or Deferred / keep private.`
            : '';

    return (
        <p className="rounded border border-black/10 bg-[#f8f9f5] px-3 py-2 text-xs font-semibold leading-5 text-black/58">
            {option.detail}
            {locksPublish}
        </p>
    );
}

function getProofReviewLabel(value: ClaimStatus) {
    return proofReviewOptions.find((item) => item.value === value)?.label ?? 'Needs review';
}

function formatMediaOption(media: MediaOptionRow) {
    const label = media.alt || media.caption || media.object_path || media.source_url || 'Untitled media';
    return `${label} (${getMediaStatusLabel(media.status)} in Media)`;
}

function getMediaStatusLabel(status: string) {
    const match = statusOptions.find(([value]) => value === status);
    return match?.[1] ?? 'Unknown status';
}

function getProjectStatusLabel(status: ProjectStatus) {
    return statusOptions.find(([value]) => value === status)?.[1] ?? 'Draft';
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
    const [search, setSearch] = useState('');
    const previewUrl = getMediaUrl(selectedMedia);
    const filteredMediaOptions = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return mediaOptions;

        return mediaOptions.filter((media) =>
            [media.alt, media.caption, media.object_path, media.source_url, media.source_kind, media.media_type, media.status]
                .filter(Boolean)
                .some((candidate) => String(candidate).toLowerCase().includes(query)),
        );
    }, [mediaOptions, search]);
    const visibleMediaOptions = useMemo(() => {
        if (!selectedMedia || filteredMediaOptions.some((media) => media.id === selectedMedia.id)) {
            return filteredMediaOptions;
        }
        return [selectedMedia, ...filteredMediaOptions];
    }, [filteredMediaOptions, selectedMedia]);

    return (
        <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                Search {label.toLowerCase()}
                <span className="mt-2 flex min-h-11 items-center gap-2 rounded border border-black/15 bg-white px-3 focus-within:border-black">
                    <Search className="h-4 w-4 shrink-0 text-black/40" />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        disabled={disabled}
                        placeholder="Search by name, caption, path, or status"
                        className="min-w-0 flex-1 bg-transparent text-sm font-medium normal-case tracking-normal outline-none placeholder:text-black/35 disabled:text-black/35"
                    />
                </span>
                <span className="mt-2 block text-xs font-medium normal-case tracking-normal text-black/45">
                    {filteredMediaOptions.length} of {mediaOptions.length} Media library items
                </span>
            </label>
            <SelectField
                label={label}
                value={value}
                disabled={disabled}
                onChange={onChange}
                options={[
                    ['', emptyLabel],
                    ...visibleMediaOptions.map((media) => [String(media.id), formatMediaOption(media)] as [string, string]),
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
                            {selectedMedia.alt || selectedMedia.caption || selectedMedia.object_path || 'Untitled media'}
                        </p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/45">
                            {selectedMedia.media_type} / {getMediaStatusLabel(selectedMedia.status)} in Media
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
            detail: 'Add the website URL key for this project, for example moon-gate-woolley-street.',
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
            label: 'Project proof review',
            detail: 'Set Project proof review to Approved for public use or Deferred / keep private after review.',
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
                detail: 'Open Facts and set Proof review to Approved for public use or Deferred / keep private.',
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
                detail: 'Open Materials and set Proof review to Approved for public use or Deferred / keep private.',
            });
        });

    return blockers;
}

function formatPublishBlockerError(blockers: PublishBlocker[]) {
    const first = blockers[0];
    const remaining = blockers.length > 1 ? ` ${blockers.length - 1} more checklist item(s) remain after that.` : '';
    return `Publish is locked for now. Start with ${first.label}: ${first.detail}${remaining} The first repair item is highlighted in the checklist below.`;
}

function parsePercentValue(value: string) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 ? parsed : null;
}

function clampPercent(value: number) {
    return Math.min(100, Math.max(0, value));
}

function ProjectPublishStatusSummary({
    status,
    blockers,
    disabled,
    onSelectFirst,
}: {
    status: ProjectStatus;
    blockers: PublishBlocker[];
    disabled?: boolean;
    onSelectFirst: (blocker: PublishBlocker) => void;
}) {
    const firstBlocker = blockers[0] ?? null;
    const isPublished = status === 'published';
    const readyToPublish = !disabled && blockers.length === 0;
    const stateLabel = disabled
        ? 'Choose a project'
        : isPublished
          ? 'Live on website'
          : readyToPublish
            ? 'Ready, not live yet'
            : 'Not ready to publish';
    const detail = disabled
        ? 'Select a project or start a new one to see whether it can appear on the website.'
        : isPublished
          ? 'This project is Published, so its approved content can appear on the public project page.'
          : readyToPublish
            ? 'The checklist is clear. Publish when the editor has made the final content decision.'
            : `${blockers.length} item${blockers.length === 1 ? '' : 's'} must be fixed before this project can appear on the website.`;

    return (
        <section
            className={[
                'border p-4',
                isPublished
                    ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.08)]'
                    : readyToPublish
                      ? 'border-black/10 bg-[#f8f9f5]'
                      : 'border-amber-200 bg-amber-50',
            ].join(' ')}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    {isPublished || readyToPublish ? (
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-black" />
                    ) : (
                        <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-amber-700" />
                    )}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">
                            Website publish status
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-black">{stateLabel}</h3>
                        <p className="mt-2 text-sm leading-6 text-black/62">{detail}</p>
                    </div>
                </div>
                <CmsStatusPill status={status} />
            </div>
            {!disabled && firstBlocker ? (
                <button
                    type="button"
                    onClick={() => onSelectFirst(firstBlocker)}
                    className="mt-4 inline-flex min-h-10 items-center justify-center rounded border border-amber-300 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-amber-900 transition hover:border-black hover:text-black"
                >
                    Start with: {firstBlocker.label}
                </button>
            ) : null}
        </section>
    );
}

function PublishReadinessPanel({
    blockers,
    disabled,
    highlightedBlockerId,
    onSelect,
}: {
    blockers: PublishBlocker[];
    disabled?: boolean;
    highlightedBlockerId?: string | null;
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
                    Create or select a project to see the exact publish checks.
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
                            className={[
                                'block w-full rounded border px-3 py-3 text-left transition hover:border-black',
                                highlightedBlockerId === blocker.id
                                    ? 'border-black bg-white shadow-[inset_4px_0_0_var(--urblo-lime)]'
                                    : 'border-amber-300 bg-white',
                            ].join(' ')}
                        >
                            {highlightedBlockerId === blocker.id ? (
                                <span className="mb-2 inline-flex rounded bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                                    Start here
                                </span>
                            ) : null}
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
    help,
    onChange,
}: {
    label: string;
    value: string;
    disabled?: boolean;
    options: Array<[string, string]>;
    help?: string;
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
            {help ? <span className="mt-2 block text-xs font-semibold leading-5 text-black/50">{help}</span> : null}
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

function ProjectActionBar({
    status,
    isSaving,
    disabled,
    blockerCount,
    firstBlockerLabel,
    onPublish,
    onArchive,
    compact = false,
}: {
    status: ProjectStatus;
    isSaving: boolean;
    disabled?: boolean;
    blockerCount: number;
    firstBlockerLabel?: string;
    onPublish: () => void;
    onArchive: () => void;
    compact?: boolean;
}) {
    const isDisabled = disabled || isSaving;
    const publishLocked = blockerCount > 0;
    const actionNote = publishLocked
        ? `Publish locked: clear ${firstBlockerLabel ?? 'the first checklist item'} first.`
        : status === 'published'
          ? 'Published changes can appear on the website after you save.'
          : 'Save keeps changes in the CMS. Publish only when the checklist is clear.';

    return (
        <section
            className={[
                'border border-black/10 bg-[#f8f9f5] p-4',
                compact ? 'mt-6' : 'mt-5',
            ].join(' ')}
        >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Project actions</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <CmsStatusPill status={status} />
                        <p className="text-sm font-semibold leading-6 text-black/62">{actionNote}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ActionButton disabled={isDisabled} label={isSaving ? 'Saving' : 'Save changes'} icon="save" />
                    <button
                        type="button"
                        disabled={isDisabled || publishLocked}
                        onClick={onPublish}
                        title={
                            publishLocked
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
                        disabled={isDisabled}
                        onClick={onArchive}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                    >
                        <Archive className="h-4 w-4" />
                        Archive project
                    </button>
                </div>
            </div>
        </section>
    );
}

interface SubrecordEditorProps {
    id: string;
    title: string;
    eyebrow: string;
    disabled?: boolean;
    onNew: () => void;
    children: ReactNode;
}

const SubrecordEditor = forwardRef<HTMLElement, SubrecordEditorProps>(function SubrecordEditor(
    { id, title, eyebrow, disabled, onNew, children },
    ref,
) {
    return (
        <section
            id={id}
            role="tabpanel"
            ref={ref}
            className="scroll-mt-5 border border-black/10 bg-white p-5"
        >
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
        return <p className="text-sm leading-6 text-black/50">Nothing added yet.</p>;
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

function formStatesMatch<FormState>(current: FormState, baseline: FormState) {
    return JSON.stringify(current) === JSON.stringify(baseline);
}

function getDirtyEditorLabels(dirtyEditors: ProjectDirtyEditors) {
    return [
        dirtyEditors.overview ? 'Overview' : null,
        dirtyEditors.fact ? 'Fact' : null,
        dirtyEditors.material ? 'Material' : null,
        dirtyEditors.media ? 'Media block' : null,
        dirtyEditors.map ? 'Map' : null,
        dirtyEditors.hotspot ? 'Hotspot' : null,
    ].filter((label): label is string => label !== null);
}

function getWorkspaceDirtyEditorLabels(workspace: ProjectWorkspace, dirtyEditors: ProjectDirtyEditors) {
    if (workspace === 'overview') return dirtyEditors.overview ? ['Overview'] : [];
    if (workspace === 'facts') return dirtyEditors.fact ? ['Fact'] : [];
    if (workspace === 'materials') return dirtyEditors.material ? ['Material'] : [];
    if (workspace === 'media') return dirtyEditors.media ? ['Media block'] : [];

    return [dirtyEditors.map ? 'Map' : null, dirtyEditors.hotspot ? 'Hotspot' : null].filter(
        (label): label is string => label !== null,
    );
}

function getProjectWorkspaceLabel(workspace: ProjectWorkspace) {
    if (workspace === 'overview') return 'Overview';
    if (workspace === 'facts') return 'Facts';
    if (workspace === 'materials') return 'Materials';
    if (workspace === 'media') return 'Media';
    return 'Maps and hotspots';
}

function formatEditorList(labels: string[]) {
    if (labels.length === 0) return 'this project';
    if (labels.length === 1) return labels[0];
    if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
    return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
}

function upsertRowById<Row extends { id: number }>(rows: Row[], savedRow: Row, compare: (left: Row, right: Row) => number) {
    return [...rows.filter((row) => row.id !== savedRow.id), savedRow].sort(compare);
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
        return validationFailure('Website URL key must use lowercase words separated by hyphens.');
    }

    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    const heroMediaId = optionalPositiveInteger(form.heroMediaId, 'Hero image');
    const coverMediaId = optionalPositiveInteger(form.coverMediaId, 'Cover image');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    if (heroMediaId.error) return validationFailure(heroMediaId.error);
    if (coverMediaId.error) return validationFailure(coverMediaId.error);

    if (form.status === 'published') {
        if (form.claimReviewStatus === 'needs_review') {
            return validationFailure('Publish is locked. Set Project proof review to Approved for public use or Deferred / keep private.');
        }

        if (!form.summary.trim() && !form.lead.trim()) {
            return validationFailure('Publish is locked. Add Summary or Lead copy for the public project page.');
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

    const factJson = parseProjectFactJsonDraft(form.factValueJson);
    if (factJson.error) return validationFailure(factJson.error);

    return { error: null, sortOrder: sortOrder.value, factValueJson: factJson.value };
}

function validateMaterialForm(form: MaterialFormState) {
    if (!form.application.trim()) return validationFailure('Material application is required.');
    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    const stoneGroupId = optionalPositiveInteger(form.stoneGroupId, 'Stone selection');
    const finishDefinitionId = optionalPositiveInteger(form.finishDefinitionId, 'Finish selection');
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
        if (!youtubeUrl) return validationFailure('YouTube blocks require a valid YouTube link.');
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

    const projectMaterialMapId = optionalPositiveInteger(form.projectMaterialMapId, 'Hotspot map selection');
    if (projectMaterialMapId.error) return validationFailure(projectMaterialMapId.error);

    let mediaAssetId = optionalPositiveInteger(form.mediaAssetId, 'Media selection');
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
    const projectMaterialId = optionalPositiveInteger(form.projectMaterialId, 'Project material selection');
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
