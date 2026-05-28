import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    Archive,
    CheckCircle2,
    FileText,
    MapPin,
    Plus,
    Save,
    ShieldAlert,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';

type ProjectStatus = 'draft' | 'published' | 'archived';
type ClaimStatus = 'needs_review' | 'approved' | 'deferred';
type CarbonStatus = '' | 'yes' | 'no' | 'not_available' | 'tbc';

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
    alt: string | null;
    caption: string | null;
    object_path: string | null;
    source_url: string | null;
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
    const [hotspots, setHotspots] = useState<ProjectHotspotRow[]>([]);
    const [stoneOptions, setStoneOptions] = useState<StoneOptionRow[]>([]);
    const [finishOptions, setFinishOptions] = useState<FinishOptionRow[]>([]);
    const [mediaOptions, setMediaOptions] = useState<MediaOptionRow[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [selectedFactId, setSelectedFactId] = useState<number | null>(null);
    const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
    const [selectedMapId, setSelectedMapId] = useState<number | null>(null);
    const [selectedHotspotId, setSelectedHotspotId] = useState<number | null>(null);
    const [projectForm, setProjectForm] = useState<ProjectFormState>(emptyProjectForm);
    const [factForm, setFactForm] = useState<FactFormState>(emptyFactForm);
    const [materialForm, setMaterialForm] = useState<MaterialFormState>(emptyMaterialForm);
    const [mapForm, setMapForm] = useState<MapFormState>(emptyMapForm);
    const [hotspotForm, setHotspotForm] = useState<HotspotFormState>(emptyHotspotForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProject, setIsSavingProject] = useState(false);
    const [isSavingFact, setIsSavingFact] = useState(false);
    const [isSavingMaterial, setIsSavingMaterial] = useState(false);
    const [isSavingMap, setIsSavingMap] = useState(false);
    const [isSavingHotspot, setIsSavingHotspot] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const selectedProject = useMemo(
        () => projects.find((project) => project.id === selectedProjectId) ?? null,
        [projects, selectedProjectId],
    );
    const selectedMap = useMemo(
        () => maps.find((map) => map.id === selectedMapId) ?? null,
        [maps, selectedMapId],
    );
    const selectedHotspot = useMemo(
        () => hotspots.find((hotspot) => hotspot.id === selectedHotspotId) ?? null,
        [hotspots, selectedHotspotId],
    );
    const projectCounts = useMemo(() => summarizeProjects(projects), [projects]);

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
            const [factsResult, materialsResult, mapsResult] = await Promise.all([
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
            ]);

            if (factsResult.error) throw new Error(factsResult.error.message);
            if (materialsResult.error) throw new Error(materialsResult.error.message);
            if (mapsResult.error) throw new Error(mapsResult.error.message);

            const factRows = factsResult.data ?? [];
            const materialRows = materialsResult.data ?? [];
            const mapRows = mapsResult.data ?? [];
            const nextFact = factRows[0] ?? null;
            const nextMaterial = materialRows[0] ?? null;
            const nextMap = mapRows.find((map) => map.id === preferredMapId) ?? mapRows[0] ?? null;

            setFacts(factRows);
            setSelectedFactId(nextFact?.id ?? null);
            setFactForm(rowToFactForm(nextFact));
            setMaterials(materialRows);
            setSelectedMaterialId(nextMaterial?.id ?? null);
            setMaterialForm(rowToMaterialForm(nextMaterial));
            setMaps(mapRows);
            setSelectedMapId(nextMap?.id ?? null);
            setMapForm(rowToMapForm(nextMap));
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
                    .select('id,alt,caption,object_path,source_url,media_type,status')
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
        setHotspots([]);
        setSelectedFactId(null);
        setSelectedMaterialId(null);
        setSelectedMapId(null);
        setSelectedHotspotId(null);
        setFactForm(emptyFactForm);
        setMaterialForm(emptyMaterialForm);
        setMapForm(emptyMapForm);
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

    function updateHotspotField<Key extends keyof HotspotFormState>(key: Key, value: HotspotFormState[Key]) {
        setHotspotForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    async function saveProject(nextStatus: ProjectStatus) {
        if (!supabase || !canEdit || !user) return;

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

        setNotice(nextStatus === 'published' ? 'Project published.' : 'Project saved.');
        await loadProjects(response.data.id);
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

        setNotice('Project fact saved.');
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

        setNotice('Project material saved.');
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

        setNotice(nextStatus === 'published' ? 'Material map published.' : 'Material map saved.');
        await loadProjectBundle(supabase, selectedProject.id, response.data.id, selectedHotspotId);
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

        setNotice(nextStatus === 'published' ? 'Hotspot published.' : 'Hotspot saved.');
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
                        ) : projects.length ? (
                            <div className="divide-y divide-black/10">
                                {projects.map((project) => (
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
                                            <StatusPill status={project.status} />
                                        </div>
                                        <p className="mt-3 truncate text-xs text-black/45">
                                            {project.claim_review_status} claim review
                                        </p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-5">
                                <FileText className="h-5 w-5 text-black" />
                                <h2 className="mt-5 text-xl font-semibold text-black">No project records yet</h2>
                                <p className="mt-3 text-sm leading-6 text-black/58">
                                    Create a project record, then add facts, materials, a material map, and hotspots.
                                    Public project pages remain static until the migration is switched on.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-5">
                    <form onSubmit={(event) => void handleProjectSubmit(event)} className="border border-black/10 bg-white p-5 md:p-6">
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
                            <StatusPill status={projectForm.status} />
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
                                label="Claim review"
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
                            <TextField
                                label="Cover media ID"
                                value={projectForm.coverMediaId}
                                disabled={!canEdit || isSavingProject || isLoading}
                                inputMode="numeric"
                                onChange={(value) => updateProjectField('coverMediaId', value)}
                            />
                            <TextField
                                label="Hero media ID"
                                value={projectForm.heroMediaId}
                                disabled={!canEdit || isSavingProject || isLoading}
                                inputMode="numeric"
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
                            <ActionButton disabled={!canEdit || isSavingProject || isLoading} label={isSavingProject ? 'Saving' : 'Save project'} icon="save" />
                            <button
                                type="button"
                                disabled={!canEdit || isSavingProject || isLoading}
                                onClick={() => void saveProject('published')}
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
                    </form>

                    <section className="grid gap-5 lg:grid-cols-2">
                        <SubrecordEditor
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
                            <TextField
                                label="Media ID"
                                value={materialForm.mediaAssetId}
                                disabled={!canEdit || isSavingMaterial || !selectedProject}
                                inputMode="numeric"
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
                    </section>
                </section>

                <aside className="space-y-5">
                    <section className="border border-black/10 bg-black p-5 text-white">
                        <MapPin className="h-5 w-5 text-[var(--urblo-lime)]" />
                        <h2 className="mt-5 text-xl font-semibold">Map health</h2>
                        <div className="mt-5 grid gap-3 text-sm leading-6 text-white/72">
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
                        <TextField
                            label="Map media ID"
                            value={mapForm.mediaAssetId}
                            disabled={!canEdit || isSavingMap || !selectedProject}
                            inputMode="numeric"
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
                        <TextField
                            label="Preview media ID"
                            value={hotspotForm.previewMediaId}
                            disabled={!canEdit || isSavingHotspot || !selectedMap}
                            inputMode="numeric"
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

function SubrecordEditor({
    title,
    eyebrow,
    disabled,
    onNew,
    children,
}: {
    title: string;
    eyebrow: string;
    disabled?: boolean;
    onNew: () => void;
    children: React.ReactNode;
}) {
    return (
        <section className="border border-black/10 bg-white p-5">
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
}

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

function StatusPill({ status }: { status: ProjectStatus }) {
    return (
        <span
            className={[
                'inline-flex h-8 shrink-0 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.14em]',
                status === 'published'
                    ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black'
                    : status === 'archived'
                      ? 'border-black/15 bg-black text-white'
                      : 'border-black/15 bg-white text-black/50',
            ].join(' ')}
        >
            {status}
        </span>
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
    const heroMediaId = optionalPositiveInteger(form.heroMediaId, 'Hero media ID');
    const coverMediaId = optionalPositiveInteger(form.coverMediaId, 'Cover media ID');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    if (heroMediaId.error) return validationFailure(heroMediaId.error);
    if (coverMediaId.error) return validationFailure(coverMediaId.error);

    if (form.status === 'published') {
        if (form.claimReviewStatus === 'needs_review') {
            return validationFailure('Published projects require claim review to be approved or deferred.');
        }

        if (!form.summary.trim() && !form.lead.trim()) {
            return validationFailure('Published projects require summary or lead copy.');
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
    const mediaAssetId = optionalPositiveInteger(form.mediaAssetId, 'Media asset ID');
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
    const mediaAssetId = requiredPositiveInteger(form.mediaAssetId, 'Map media ID');
    if (sortOrder.error) return validationFailure(sortOrder.error);
    if (mediaAssetId.error) return validationFailure(mediaAssetId.error);

    if (form.status === 'published' && !form.title.trim()) {
        return validationFailure('Published material maps require a title.');
    }

    return { error: null, sortOrder: sortOrder.value, mediaAssetId: mediaAssetId.value };
}

function validateHotspotForm(form: HotspotFormState) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.hotspotKey.trim())) {
        return validationFailure('Hotspot key must be lowercase kebab-case.');
    }

    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    const xPercent = percentNumber(form.xPercent, 'X percent');
    const yPercent = percentNumber(form.yPercent, 'Y percent');
    const projectMaterialId = optionalPositiveInteger(form.projectMaterialId, 'Project material ID');
    const previewMediaId = optionalPositiveInteger(form.previewMediaId, 'Preview media ID');
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
