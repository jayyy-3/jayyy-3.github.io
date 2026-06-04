import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    Archive,
    CheckCircle2,
    Image as ImageIcon,
    Layers2,
    ListChecks,
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
import { CmsPublicPageLink, CmsStatusCounts } from './AdminCmsPrimitives';

type StoneStatus = 'draft' | 'published' | 'archived' | 'tbc';
type StoneListFilter = StoneStatus | 'all';
type Capability = 'yes' | 'no' | 'tbc';
type FinishStatus = 'draft' | 'published' | 'archived';
type FinishImageStatus = 'draft' | 'published' | 'archived';
type FinishImageRole = 'primary' | 'secondary' | 'detail' | 'swatch';

interface StoneGroupRow {
    id: number;
    stone_group_key: string;
    display_name: string;
    source_name: string | null;
    status: StoneStatus;
    stone_type_source: string | null;
    stone_type_display: string | null;
    origin_region: string | null;
    origin_country: string | null;
    price_source: string | null;
    price_tier: number | null;
    raw_block_length_mm: number | null;
    raw_block_width_mm: number | null;
    raw_block_height_mm: number | null;
    summary: string | null;
    notes: string | null;
    sort_order: number;
    published_at: string | null;
    archived_at: string | null;
    updated_at: string;
    created_at: string;
}

interface StoneVariantRow {
    id: number;
    stone_group_id: number;
    variant_key: string;
    display_name: string | null;
    source_variant: string | null;
    variant_type: string;
    status: StoneStatus;
    sort_order: number;
    published_at: string | null;
    archived_at: string | null;
    updated_at: string;
    created_at: string;
}

interface FinishDefinitionRow {
    id: number;
    finish_key: string;
    display_name: string;
    sort_order: number;
    status: FinishStatus;
}

interface CapabilityRow {
    id: number;
    stone_variant_id: number;
    finish_definition_id: number;
    capability: Capability;
    sources: string[];
    behavior_note: string | null;
    admin_note: string | null;
    updated_at: string;
}

interface MediaAssetOption {
    id: number;
    status: FinishImageStatus;
    bucket: string | null;
    object_path: string | null;
    source_url: string | null;
    media_type: string;
    alt: string | null;
    usage_notes: string | null;
}

interface StoneFinishImageRow {
    id: number;
    stone_group_id: number | null;
    stone_variant_id: number | null;
    finish_definition_id: number | null;
    media_asset_id: number;
    image_role: FinishImageRole;
    sort_order: number;
    status: FinishImageStatus;
    published_at: string | null;
    archived_at: string | null;
    updated_at: string;
}

interface StoneGroupFormState {
    status: StoneStatus;
    stoneGroupKey: string;
    displayName: string;
    sourceName: string;
    stoneTypeSource: string;
    stoneTypeDisplay: string;
    originRegion: string;
    originCountry: string;
    priceSource: string;
    priceTier: string;
    rawBlockLengthMm: string;
    rawBlockWidthMm: string;
    rawBlockHeightMm: string;
    summary: string;
    notes: string;
    sortOrder: string;
}

interface StoneVariantFormState {
    status: StoneStatus;
    variantKey: string;
    displayName: string;
    sourceVariant: string;
    variantType: string;
    sortOrder: string;
}

interface CapabilityFormState {
    id: number | null;
    capability: Capability;
    sourcesText: string;
    behaviorNote: string;
    adminNote: string;
}

interface FinishImageFormState {
    id: number | null;
    status: FinishImageStatus;
    finishDefinitionId: string;
    mediaAssetId: string;
    imageRole: FinishImageRole;
    sortOrder: string;
}

const emptyGroupForm: StoneGroupFormState = {
    status: 'draft',
    stoneGroupKey: '',
    displayName: '',
    sourceName: '',
    stoneTypeSource: '',
    stoneTypeDisplay: '',
    originRegion: '',
    originCountry: '',
    priceSource: '',
    priceTier: '',
    rawBlockLengthMm: '',
    rawBlockWidthMm: '',
    rawBlockHeightMm: '',
    summary: '',
    notes: '',
    sortOrder: '0',
};

const emptyVariantForm: StoneVariantFormState = {
    status: 'draft',
    variantKey: '',
    displayName: '',
    sourceVariant: '',
    variantType: 'none',
    sortOrder: '0',
};

const emptyFinishImageForm: FinishImageFormState = {
    id: null,
    status: 'draft',
    finishDefinitionId: '',
    mediaAssetId: '',
    imageRole: 'primary',
    sortOrder: '0',
};

const fieldClass =
    'mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black disabled:bg-black/[0.04] disabled:text-black/45';

export default function AdminStoneLibraryPage() {
    return (
        <RequireAdmin>
            <AdminStoneLibraryContent />
        </RequireAdmin>
    );
}

function AdminStoneLibraryContent() {
    const { profile, user } = useAdminAuth();
    const canEdit = profile?.role === 'owner' || profile?.role === 'admin' || profile?.role === 'editor';
    const [groups, setGroups] = useState<StoneGroupRow[]>([]);
    const [variants, setVariants] = useState<StoneVariantRow[]>([]);
    const [finishDefinitions, setFinishDefinitions] = useState<FinishDefinitionRow[]>([]);
    const [mediaAssets, setMediaAssets] = useState<MediaAssetOption[]>([]);
    const [finishImages, setFinishImages] = useState<StoneFinishImageRow[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
    const [groupForm, setGroupForm] = useState<StoneGroupFormState>(emptyGroupForm);
    const [groupSearch, setGroupSearch] = useState('');
    const [groupStatusFilter, setGroupStatusFilter] = useState<StoneListFilter>('all');
    const [variantForm, setVariantForm] = useState<StoneVariantFormState>(emptyVariantForm);
    const [capabilityForms, setCapabilityForms] = useState<Record<number, CapabilityFormState>>({});
    const [finishImageForm, setFinishImageForm] = useState<FinishImageFormState>(emptyFinishImageForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingGroup, setIsSavingGroup] = useState(false);
    const [isSavingVariant, setIsSavingVariant] = useState(false);
    const [isSavingFinishImage, setIsSavingFinishImage] = useState(false);
    const [savingCapabilityId, setSavingCapabilityId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const selectedGroup = useMemo(
        () => groups.find((group) => group.id === selectedGroupId) ?? null,
        [groups, selectedGroupId],
    );
    const selectedVariant = useMemo(
        () => variants.find((variant) => variant.id === selectedVariantId) ?? null,
        [variants, selectedVariantId],
    );
    const groupCounts = useMemo(() => summarizeGroups(groups), [groups]);
    const filteredGroups = useMemo(
        () =>
            groups.filter((group) => {
                const matchesStatus = groupStatusFilter === 'all' || group.status === groupStatusFilter;
                const search = groupSearch.trim().toLowerCase();
                const matchesSearch =
                    !search ||
                    [
                        group.display_name,
                        group.stone_group_key,
                        group.source_name,
                        group.stone_type_display,
                        group.origin_region,
                        group.origin_country,
                    ]
                        .filter(Boolean)
                        .some((value) => String(value).toLowerCase().includes(search));
                return matchesStatus && matchesSearch;
            }),
        [groupSearch, groupStatusFilter, groups],
    );
    const capabilityCounts = useMemo(
        () => summarizeCapabilities(Object.values(capabilityForms)),
        [capabilityForms],
    );
    const visibleFinishImages = useMemo(
        () =>
            finishImages.filter((image) => {
                if (!selectedVariantId) {
                    return true;
                }
                return image.stone_variant_id === selectedVariantId || image.stone_variant_id === null;
            }),
        [finishImages, selectedVariantId],
    );

    const finishById = useMemo(
        () => new Map(finishDefinitions.map((finish) => [finish.id, finish])),
        [finishDefinitions],
    );
    const variantById = useMemo(() => new Map(variants.map((variant) => [variant.id, variant])), [variants]);
    const mediaById = useMemo(() => new Map(mediaAssets.map((asset) => [asset.id, asset])), [mediaAssets]);
    const selectedFinishImageMedia = useMemo(
        () => findMediaAsset(mediaAssets, finishImageForm.mediaAssetId),
        [finishImageForm.mediaAssetId, mediaAssets],
    );
    const finishImagePublishBlocked =
        Boolean(finishImageForm.mediaAssetId) && selectedFinishImageMedia?.status !== 'published';
    const groupPublishChecklist = useMemo(
        () => getStoneGroupPublishChecklist(groupForm, variants.length, capabilityForms),
        [capabilityForms, groupForm, variants.length],
    );
    const variantPublishChecklist = useMemo(
        () => getStoneVariantPublishChecklist(variantForm, capabilityForms, selectedGroup),
        [capabilityForms, selectedGroup, variantForm],
    );
    const canPublishGroup = groupPublishChecklist.every((item) => item.ready);
    const canPublishVariant = variantPublishChecklist.every((item) => item.ready);

    const loadFinishImages = useCallback(async (client: SupabaseClient, groupId: number, preferredImageId?: number) => {
        const { data, error: imageError } = await client
            .from('stone_finish_images')
            .select(
                'id,stone_group_id,stone_variant_id,finish_definition_id,media_asset_id,image_role,sort_order,status,published_at,archived_at,updated_at',
            )
            .eq('stone_group_id', groupId)
            .order('sort_order', { ascending: true })
            .order('id', { ascending: true })
            .returns<StoneFinishImageRow[]>();

        if (imageError) {
            throw new Error(imageError.message);
        }

        const nextImages = data ?? [];
        const nextImage = nextImages.find((image) => image.id === preferredImageId) ?? null;
        setFinishImages(nextImages);
        setSelectedImageId(nextImage?.id ?? null);
        setFinishImageForm(rowToFinishImageForm(nextImage));
    }, []);

    const loadVariantBundle = useCallback(
        async (
            client: SupabaseClient,
            groupId: number,
            preferredVariantId: number | null,
            finishes: FinishDefinitionRow[],
        ) => {
            const { data: variantRows, error: variantError } = await client
                .from('stone_variants')
                .select(
                    'id,stone_group_id,variant_key,display_name,source_variant,variant_type,status,sort_order,published_at,archived_at,updated_at,created_at',
                )
                .eq('stone_group_id', groupId)
                .order('sort_order', { ascending: true })
                .order('variant_key', { ascending: true })
                .returns<StoneVariantRow[]>();

            if (variantError) {
                throw new Error(variantError.message);
            }

            const nextVariants = variantRows ?? [];
            const nextVariant =
                nextVariants.find((variant) => variant.id === preferredVariantId) ?? nextVariants[0] ?? null;

            setVariants(nextVariants);
            setSelectedVariantId(nextVariant?.id ?? null);
            setVariantForm(rowToVariantForm(nextVariant));

            if (!nextVariant) {
                setCapabilityForms(createCapabilityForms(finishes, []));
                return;
            }

            const { data: capabilityRows, error: capabilityError } = await client
                .from('stone_finish_capabilities')
                .select(
                    'id,stone_variant_id,finish_definition_id,capability,sources,behavior_note,admin_note,updated_at',
                )
                .eq('stone_variant_id', nextVariant.id)
                .returns<CapabilityRow[]>();

            if (capabilityError) {
                throw new Error(capabilityError.message);
            }

            setCapabilityForms(createCapabilityForms(finishes, capabilityRows ?? []));
        },
        [],
    );

    const loadLibrary = useCallback(
        async (preferredGroupId?: number | null) => {
            if (!supabase) {
                return;
            }

            const client: SupabaseClient = supabase;
            setIsLoading(true);
            setError(null);

            const [groupsResult, finishesResult, mediaResult] = await Promise.all([
                client
                    .from('stone_groups')
                    .select(
                        'id,stone_group_key,display_name,source_name,status,stone_type_source,stone_type_display,origin_region,origin_country,price_source,price_tier,raw_block_length_mm,raw_block_width_mm,raw_block_height_mm,summary,notes,sort_order,published_at,archived_at,updated_at,created_at',
                    )
                    .order('sort_order', { ascending: true })
                    .order('display_name', { ascending: true })
                    .returns<StoneGroupRow[]>(),
                client
                    .from('finish_definitions')
                    .select('id,finish_key,display_name,sort_order,status')
                    .order('sort_order', { ascending: true })
                    .returns<FinishDefinitionRow[]>(),
                client
                    .from('media_assets')
                    .select('id,status,bucket,object_path,source_url,media_type,alt,usage_notes')
                    .in('media_type', ['image', 'video'])
                    .order('updated_at', { ascending: false })
                    .limit(160)
                    .returns<MediaAssetOption[]>(),
            ]);

            if (groupsResult.error) {
                setError(groupsResult.error.message);
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

            const nextGroups = groupsResult.data ?? [];
            const finishes = finishesResult.data ?? [];
            const media = mediaResult.data ?? [];
            const nextGroup =
                nextGroups.find((group) => group.id === preferredGroupId) ?? nextGroups[0] ?? null;

            setGroups(nextGroups);
            setFinishDefinitions(finishes);
            setMediaAssets(media);
            setSelectedGroupId(nextGroup?.id ?? null);
            setGroupForm(rowToGroupForm(nextGroup));

            if (!nextGroup) {
                setVariants([]);
                setSelectedVariantId(null);
                setSelectedImageId(null);
                setVariantForm(emptyVariantForm);
                setCapabilityForms(createCapabilityForms(finishes, []));
                setFinishImages([]);
                setFinishImageForm(emptyFinishImageForm);
                setIsLoading(false);
                return;
            }

            try {
                await loadVariantBundle(client, nextGroup.id, null, finishes);
                await loadFinishImages(client, nextGroup.id);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Stone Library detail load failed.');
            }

            setIsLoading(false);
        },
        [loadFinishImages, loadVariantBundle],
    );

    useEffect(() => {
        void loadLibrary();
    }, [loadLibrary]);

    function updateGroupField<Key extends keyof StoneGroupFormState>(
        key: Key,
        value: StoneGroupFormState[Key],
    ) {
        setGroupForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function updateVariantField<Key extends keyof StoneVariantFormState>(
        key: Key,
        value: StoneVariantFormState[Key],
    ) {
        setVariantForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    function updateCapabilityField<Key extends keyof CapabilityFormState>(
        finishId: number,
        key: Key,
        value: CapabilityFormState[Key],
    ) {
        setCapabilityForms((current) => ({
            ...current,
            [finishId]: {
                ...(current[finishId] ?? emptyCapabilityForm()),
                [key]: value,
            },
        }));
        setNotice(null);
    }

    function updateFinishImageField<Key extends keyof FinishImageFormState>(
        key: Key,
        value: FinishImageFormState[Key],
    ) {
        setFinishImageForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    async function selectGroup(group: StoneGroupRow) {
        setSelectedGroupId(group.id);
        setGroupForm(rowToGroupForm(group));
        setError(null);
        setNotice(null);

        if (supabase) {
            try {
                await loadVariantBundle(supabase, group.id, null, finishDefinitions);
                await loadFinishImages(supabase, group.id);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Stone Library detail load failed.');
            }
        }
    }

    async function selectVariant(variant: StoneVariantRow) {
        setSelectedVariantId(variant.id);
        setSelectedImageId(null);
        setVariantForm(rowToVariantForm(variant));
        setFinishImageForm(emptyFinishImageForm);
        setError(null);
        setNotice(null);

        if (!supabase) {
            return;
        }

        const { data, error: capabilityError } = await supabase
            .from('stone_finish_capabilities')
            .select('id,stone_variant_id,finish_definition_id,capability,sources,behavior_note,admin_note,updated_at')
            .eq('stone_variant_id', variant.id)
            .returns<CapabilityRow[]>();

        if (capabilityError) {
            setError(capabilityError.message);
            return;
        }

        setCapabilityForms(createCapabilityForms(finishDefinitions, data ?? []));
    }

    function startNewGroup() {
        setSelectedGroupId(null);
        setSelectedVariantId(null);
        setSelectedImageId(null);
        setGroupForm(emptyGroupForm);
        setVariantForm(emptyVariantForm);
        setVariants([]);
        setCapabilityForms(createCapabilityForms(finishDefinitions, []));
        setFinishImages([]);
        setFinishImageForm(emptyFinishImageForm);
        setError(null);
        setNotice('New stone group started.');
    }

    function startNewVariant() {
        if (!selectedGroup) {
            setError('Create or select a stone group before adding variants.');
            return;
        }

        setSelectedVariantId(null);
        setSelectedImageId(null);
        setVariantForm(emptyVariantForm);
        setCapabilityForms(createCapabilityForms(finishDefinitions, []));
        setFinishImageForm(emptyFinishImageForm);
        setError(null);
        setNotice('New variant started.');
    }

    function selectFinishImage(image: StoneFinishImageRow) {
        setSelectedImageId(image.id);
        setFinishImageForm(rowToFinishImageForm(image));
        setError(null);
        setNotice(null);
    }

    function startNewFinishImage() {
        if (!selectedGroup || !selectedVariant) {
            setError('Select a stone group and variant before adding finish images.');
            return;
        }

        setSelectedImageId(null);
        setFinishImageForm({
            ...emptyFinishImageForm,
            finishDefinitionId: finishDefinitions[0] ? String(finishDefinitions[0].id) : '',
        });
        setError(null);
        setNotice('New finish image link started.');
    }

    async function handleGroupSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await saveGroup(groupForm.status);
    }

    async function handleVariantSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await saveVariant(variantForm.status);
    }

    async function handleFinishImageSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await saveFinishImage(finishImageForm.status);
    }

    async function saveGroup(nextStatus: StoneStatus) {
        if (!supabase || !canEdit || !user) {
            return;
        }

        if (nextStatus === 'published' && !canPublishGroup) {
            setError('Complete the Stone Library publish checklist before publishing this stone family.');
            return;
        }

        const validation = validateGroupForm({ ...groupForm, status: nextStatus }, variants.length);
        if (validation.error) {
            setError(validation.error);
            return;
        }

        if (nextStatus === 'published' && !hasAvailableCapability(capabilityForms)) {
            setError('Published stone families need at least one finish marked Available or Needs confirmation.');
            return;
        }

        const now = new Date().toISOString();
        const payload = {
            stone_group_key: groupForm.stoneGroupKey.trim(),
            display_name: groupForm.displayName.trim(),
            source_name: groupForm.sourceName.trim() || null,
            status: nextStatus,
            stone_type_source: groupForm.stoneTypeSource.trim() || null,
            stone_type_display: groupForm.stoneTypeDisplay.trim() || null,
            origin_region: groupForm.originRegion.trim() || null,
            origin_country: groupForm.originCountry.trim() || null,
            price_source: groupForm.priceSource.trim() || null,
            price_tier: validation.priceTier,
            raw_block_length_mm: validation.rawBlockLengthMm,
            raw_block_width_mm: validation.rawBlockWidthMm,
            raw_block_height_mm: validation.rawBlockHeightMm,
            summary: groupForm.summary.trim() || null,
            notes: groupForm.notes.trim() || null,
            sort_order: validation.sortOrder,
            updated_by: user.id,
            published_at:
                nextStatus === 'published' ? (selectedGroup?.published_at ?? now) : selectedGroup?.published_at,
            archived_at: nextStatus === 'archived' ? now : null,
        };

        setIsSavingGroup(true);
        setError(null);
        setNotice(null);

        const response = selectedGroupId
            ? await supabase
                  .from('stone_groups')
                  .update(payload)
                  .eq('id', selectedGroupId)
                  .select(
                      'id,stone_group_key,display_name,source_name,status,stone_type_source,stone_type_display,origin_region,origin_country,price_source,price_tier,raw_block_length_mm,raw_block_width_mm,raw_block_height_mm,summary,notes,sort_order,published_at,archived_at,updated_at,created_at',
                  )
                  .single<StoneGroupRow>()
            : await supabase
                  .from('stone_groups')
                  .insert({ ...payload, created_by: user.id })
                  .select(
                      'id,stone_group_key,display_name,source_name,status,stone_type_source,stone_type_display,origin_region,origin_country,price_source,price_tier,raw_block_length_mm,raw_block_width_mm,raw_block_height_mm,summary,notes,sort_order,published_at,archived_at,updated_at,created_at',
                  )
                  .single<StoneGroupRow>();

        setIsSavingGroup(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedGroupId
                ? nextStatus === 'published'
                    ? 'stone_group.publish'
                    : nextStatus === 'archived'
                      ? 'stone_group.archive'
                      : 'stone_group.update'
                : 'stone_group.create',
            entityType: 'stone_groups',
            entityId: response.data.id,
            metadata: {
                key: response.data.stone_group_key,
                status: response.data.status,
            },
        });
        setNotice(
            withAuditNotice(nextStatus === 'published' ? 'Stone group published.' : 'Stone group saved.', auditError),
        );
        await loadLibrary(response.data.id);
    }

    async function saveVariant(nextStatus: StoneStatus) {
        if (!supabase || !canEdit || !user || !selectedGroup) {
            return;
        }

        if (nextStatus === 'published' && !canPublishVariant) {
            setError('Complete the variant publish checklist before publishing this variant.');
            return;
        }

        const validation = validateVariantForm({ ...variantForm, status: nextStatus });
        if (validation.error) {
            setError(validation.error);
            return;
        }

        const now = new Date().toISOString();
        const payload = {
            stone_group_id: selectedGroup.id,
            variant_key: variantForm.variantKey.trim(),
            display_name: variantForm.displayName.trim() || null,
            source_variant: variantForm.sourceVariant.trim() || null,
            variant_type: variantForm.variantType.trim() || 'none',
            status: nextStatus,
            sort_order: validation.sortOrder,
            updated_by: user.id,
            published_at:
                nextStatus === 'published' ? (selectedVariant?.published_at ?? now) : selectedVariant?.published_at,
            archived_at: nextStatus === 'archived' ? now : null,
        };

        setIsSavingVariant(true);
        setError(null);
        setNotice(null);

        const response = selectedVariantId
            ? await supabase
                  .from('stone_variants')
                  .update(payload)
                  .eq('id', selectedVariantId)
                  .select(
                      'id,stone_group_id,variant_key,display_name,source_variant,variant_type,status,sort_order,published_at,archived_at,updated_at,created_at',
                  )
                  .single<StoneVariantRow>()
            : await supabase
                  .from('stone_variants')
                  .insert({ ...payload, created_by: user.id })
                  .select(
                      'id,stone_group_id,variant_key,display_name,source_variant,variant_type,status,sort_order,published_at,archived_at,updated_at,created_at',
                  )
                  .single<StoneVariantRow>();

        setIsSavingVariant(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedVariantId
                ? nextStatus === 'published'
                    ? 'stone_variant.publish'
                    : nextStatus === 'archived'
                      ? 'stone_variant.archive'
                      : 'stone_variant.update'
                : 'stone_variant.create',
            entityType: 'stone_variants',
            entityId: response.data.id,
            metadata: {
                stoneGroupId: response.data.stone_group_id,
                key: response.data.variant_key,
                status: response.data.status,
            },
        });
        setNotice(withAuditNotice(nextStatus === 'published' ? 'Variant published.' : 'Variant saved.', auditError));
        await loadVariantBundle(supabase, selectedGroup.id, response.data.id, finishDefinitions);
        await loadFinishImages(supabase, selectedGroup.id);
    }

    async function saveCapability(finish: FinishDefinitionRow) {
        if (!supabase || !canEdit || !user || !selectedVariant) {
            return;
        }

        const form = capabilityForms[finish.id] ?? emptyCapabilityForm();
        const sources = parseSources(form.sourcesText);
        const payload = {
            stone_variant_id: selectedVariant.id,
            finish_definition_id: finish.id,
            capability: form.capability,
            sources,
            behavior_note: form.behaviorNote.trim() || null,
            admin_note: form.adminNote.trim() || null,
            updated_by: user.id,
        };

        setSavingCapabilityId(finish.id);
        setError(null);
        setNotice(null);

        const response = form.id
            ? await supabase
                  .from('stone_finish_capabilities')
                  .update(payload)
                  .eq('id', form.id)
                  .select('id,stone_variant_id,finish_definition_id,capability,sources,behavior_note,admin_note,updated_at')
                  .single<CapabilityRow>()
            : await supabase
                  .from('stone_finish_capabilities')
                  .insert({ ...payload, created_by: user.id })
                  .select('id,stone_variant_id,finish_definition_id,capability,sources,behavior_note,admin_note,updated_at')
                  .single<CapabilityRow>();

        setSavingCapabilityId(null);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        setCapabilityForms((current) => ({
            ...current,
            [finish.id]: rowToCapabilityForm(response.data),
        }));
        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: form.id ? 'stone_finish_capability.update' : 'stone_finish_capability.create',
            entityType: 'stone_finish_capabilities',
            entityId: response.data.id,
            metadata: {
                stoneVariantId: response.data.stone_variant_id,
                finishDefinitionId: response.data.finish_definition_id,
                capability: response.data.capability,
            },
        });
        setNotice(withAuditNotice(`${finish.display_name} capability saved.`, auditError));
    }

    async function saveFinishImage(nextStatus: FinishImageStatus) {
        if (!supabase || !canEdit || !user || !selectedGroup || !selectedVariant) {
            return;
        }

        const validation = validateFinishImageForm({ ...finishImageForm, status: nextStatus });
        if (validation.error) {
            setError(validation.error);
            return;
        }

        const linkedMedia = mediaById.get(validation.mediaAssetId);
        if (nextStatus === 'published' && linkedMedia?.status !== 'published') {
            setError(
                'Publish is locked. Open Media and publish the selected Media library item before publishing this finish image.',
            );
            return;
        }

        const now = new Date().toISOString();
        const selectedImage = finishImages.find((image) => image.id === selectedImageId) ?? null;
        const payload = {
            stone_group_id: selectedGroup.id,
            stone_variant_id: selectedVariant.id,
            finish_definition_id: validation.finishDefinitionId,
            media_asset_id: validation.mediaAssetId,
            image_role: finishImageForm.imageRole,
            status: nextStatus,
            sort_order: validation.sortOrder,
            updated_by: user.id,
            published_at:
                nextStatus === 'published' ? (selectedImage?.published_at ?? now) : (selectedImage?.published_at ?? null),
            archived_at: nextStatus === 'archived' ? now : null,
        };

        setIsSavingFinishImage(true);
        setError(null);
        setNotice(null);

        const response = selectedImageId
            ? await supabase
                  .from('stone_finish_images')
                  .update(payload)
                  .eq('id', selectedImageId)
                  .select(
                      'id,stone_group_id,stone_variant_id,finish_definition_id,media_asset_id,image_role,sort_order,status,published_at,archived_at,updated_at',
                  )
                  .single<StoneFinishImageRow>()
            : await supabase
                  .from('stone_finish_images')
                  .insert({ ...payload, created_by: user.id })
                  .select(
                      'id,stone_group_id,stone_variant_id,finish_definition_id,media_asset_id,image_role,sort_order,status,published_at,archived_at,updated_at',
                  )
                  .single<StoneFinishImageRow>();

        setIsSavingFinishImage(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedImageId
                ? nextStatus === 'published'
                    ? 'stone_finish_image.publish'
                    : nextStatus === 'archived'
                      ? 'stone_finish_image.archive'
                      : 'stone_finish_image.update'
                : 'stone_finish_image.create',
            entityType: 'stone_finish_images',
            entityId: response.data.id,
            metadata: {
                stoneGroupId: response.data.stone_group_id,
                stoneVariantId: response.data.stone_variant_id,
                finishDefinitionId: response.data.finish_definition_id,
                mediaAssetId: response.data.media_asset_id,
                imageRole: response.data.image_role,
                status: response.data.status,
            },
        });
        setNotice(
            withAuditNotice(
                nextStatus === 'published' ? 'Finish image published.' : 'Finish image link saved.',
                auditError,
            ),
        );
        await loadFinishImages(supabase, selectedGroup.id, response.data.id);
    }

    return (
        <AdminShell
            title="Stone Library"
            eyebrow={canEdit ? 'Editor access' : 'Read only'}
            actions={
                <button
                    type="button"
                    onClick={startNewGroup}
                    disabled={!canEdit}
                    className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                >
                    <Plus className="h-4 w-4" />
                    New stone
                </button>
            }
        >
            <div className="grid gap-5 xl:grid-cols-[minmax(280px,390px)_minmax(0,1fr)_360px]">
                <section className="border border-black/10 bg-white">
                    <div className="border-b border-black/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            Stone families
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-black">{groups.length} stone groups</h2>
                        <p className="mt-2 text-sm leading-6 text-black/55">
                            {groupCounts.published} published, {groupCounts.draft} draft, {groupCounts.tbc} need
                            confirmation, {groupCounts.archived} archived.
                        </p>
                        <div className="mt-4">
                            <CmsStatusCounts
                                draft={groupCounts.draft + groupCounts.tbc}
                                published={groupCounts.published}
                                archived={groupCounts.archived}
                            />
                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                Needs confirmation is counted with Draft because it is not public-ready.
                            </p>
                        </div>
                        <label className="mt-4 flex min-h-11 items-center gap-2 border border-black/10 bg-[#f8f9f5] px-3 text-sm text-black">
                            <Search className="h-4 w-4 shrink-0 text-black/42" />
                            <input
                                value={groupSearch}
                                onChange={(event) => setGroupSearch(event.target.value)}
                                placeholder="Search stone, key, type, origin"
                                className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-black/36"
                            />
                        </label>
                        <div className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-5">
                            {(['all', 'published', 'draft', 'tbc', 'archived'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setGroupStatusFilter(filter)}
                                    className={[
                                        'min-h-9 rounded border px-1 text-[10px] font-bold uppercase tracking-[0.08em] transition',
                                        groupStatusFilter === filter
                                            ? 'border-black bg-black text-white'
                                            : 'border-black/10 bg-white text-black/55 hover:border-black',
                                    ].join(' ')}
                                >
                                    {getStoneFilterLabel(filter)}
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
                        ) : filteredGroups.length ? (
                            <div className="divide-y divide-black/10">
                                {filteredGroups.map((group) => (
                                    <button
                                        key={group.id}
                                        type="button"
                                        onClick={() => void selectGroup(group)}
                                        className={[
                                            'block w-full p-4 text-left transition hover:bg-[#f8f9f5]',
                                            selectedGroupId === group.id ? 'bg-[#f8f9f5]' : 'bg-white',
                                        ].join(' ')}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-semibold text-black">
                                                    {group.display_name}
                                                </span>
                                                <span className="mt-1 block truncate text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                                    {group.stone_group_key} / {group.stone_type_display ?? 'Type needs confirmation'}
                                                </span>
                                            </span>
                                            <StatusPill status={group.status} />
                                        </div>
                                        <p className="mt-3 truncate text-xs text-black/45">
                                            {[group.origin_region, group.origin_country].filter(Boolean).join(', ') ||
                                                'Origin needs confirmation'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-5">
                                <Archive className="h-5 w-5 text-black" />
                                <h2 className="mt-5 text-xl font-semibold text-black">
                                    {groups.length ? 'No matching stones' : 'No stone families yet'}
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-black/58">
                                    {groups.length
                                        ? 'Clear the search or choose another status filter.'
                                        : 'Create the first stone group, then add variants and finish capabilities.'}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-5">
                    <form onSubmit={(event) => void handleGroupSubmit(event)} className="border border-black/10 bg-white p-5 md:p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Stone group
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-black">
                                    {selectedGroup ? selectedGroup.display_name : 'New stone group'}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-black/58">
                                    Maintain the public stone family record and keep confirmation gaps visible before
                                    publishing.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <CmsPublicPageLink
                                    href={groupForm.stoneGroupKey ? `/stone-library/${groupForm.stoneGroupKey}` : undefined}
                                    status={groupForm.status}
                                />
                                <StatusPill status={groupForm.status} />
                            </div>
                        </div>

                        <div className="mt-7 grid gap-4 md:grid-cols-2">
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Display name
                                <input
                                    value={groupForm.displayName}
                                    onChange={(event) => updateGroupField('displayName', event.target.value)}
                                    disabled={!canEdit || isSavingGroup || isLoading}
                                    required
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Website URL key
                                <input
                                    value={groupForm.stoneGroupKey}
                                    onChange={(event) => updateGroupField('stoneGroupKey', event.target.value)}
                                    disabled={!canEdit || isSavingGroup || isLoading || Boolean(selectedGroup)}
                                    required
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Status
                                <select
                                    value={groupForm.status}
                                    onChange={(event) => updateGroupField('status', event.target.value as StoneStatus)}
                                    disabled={!canEdit || isSavingGroup || isLoading}
                                    className={fieldClass}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="tbc">Needs confirmation</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Supplier/source label
                                <input
                                    value={groupForm.sourceName}
                                    onChange={(event) => updateGroupField('sourceName', event.target.value)}
                                    disabled={!canEdit || isSavingGroup || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Sort order
                                <input
                                    value={groupForm.sortOrder}
                                    onChange={(event) => updateGroupField('sortOrder', event.target.value)}
                                    disabled={!canEdit || isSavingGroup || isLoading}
                                    inputMode="numeric"
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Stone type shown on website
                                <input
                                    value={groupForm.stoneTypeDisplay}
                                    onChange={(event) => updateGroupField('stoneTypeDisplay', event.target.value)}
                                    disabled={!canEdit || isSavingGroup || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Stone type proof note
                                <input
                                    value={groupForm.stoneTypeSource}
                                    onChange={(event) => updateGroupField('stoneTypeSource', event.target.value)}
                                    disabled={!canEdit || isSavingGroup || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Origin region
                                <input
                                    value={groupForm.originRegion}
                                    onChange={(event) => updateGroupField('originRegion', event.target.value)}
                                    disabled={!canEdit || isSavingGroup || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Origin country
                                <input
                                    value={groupForm.originCountry}
                                    onChange={(event) => updateGroupField('originCountry', event.target.value)}
                                    disabled={!canEdit || isSavingGroup || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Pricing note
                                <input
                                    value={groupForm.priceSource}
                                    onChange={(event) => updateGroupField('priceSource', event.target.value)}
                                    disabled={!canEdit || isSavingGroup || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Price tier
                                <select
                                    value={groupForm.priceTier}
                                    onChange={(event) => updateGroupField('priceTier', event.target.value)}
                                    disabled={!canEdit || isSavingGroup || isLoading}
                                    className={fieldClass}
                                >
                                    <option value="">Price on request</option>
                                    <option value="1">Budget</option>
                                    <option value="2">Balanced</option>
                                    <option value="3">Premium</option>
                                </select>
                            </label>
                        </div>

                        <div className="mt-3">
                            <StoneStatusHelp status={groupForm.status} />
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Block length mm
                                <input
                                    value={groupForm.rawBlockLengthMm}
                                    onChange={(event) => updateGroupField('rawBlockLengthMm', event.target.value)}
                                    disabled={!canEdit || isSavingGroup || isLoading}
                                    inputMode="numeric"
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Block width mm
                                <input
                                    value={groupForm.rawBlockWidthMm}
                                    onChange={(event) => updateGroupField('rawBlockWidthMm', event.target.value)}
                                    disabled={!canEdit || isSavingGroup || isLoading}
                                    inputMode="numeric"
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Block height mm
                                <input
                                    value={groupForm.rawBlockHeightMm}
                                    onChange={(event) => updateGroupField('rawBlockHeightMm', event.target.value)}
                                    disabled={!canEdit || isSavingGroup || isLoading}
                                    inputMode="numeric"
                                    className={fieldClass}
                                />
                            </label>
                        </div>

                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Public summary
                            <textarea
                                value={groupForm.summary}
                                onChange={(event) => updateGroupField('summary', event.target.value)}
                                disabled={!canEdit || isSavingGroup || isLoading}
                                rows={4}
                                className={`${fieldClass} py-3 leading-6`}
                            />
                        </label>
                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Internal notes
                            <textarea
                                value={groupForm.notes}
                                onChange={(event) => updateGroupField('notes', event.target.value)}
                                disabled={!canEdit || isSavingGroup || isLoading}
                                rows={3}
                                className={`${fieldClass} py-3 leading-6`}
                            />
                        </label>

                        <StonePublishChecklist items={groupPublishChecklist} />

                        <div className="mt-6 flex flex-wrap gap-2">
                            <button
                                type="submit"
                                disabled={!canEdit || isSavingGroup || isLoading}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                            >
                                <Save className="h-4 w-4" />
                                {isSavingGroup ? 'Saving' : 'Save group'}
                            </button>
                            <button
                                type="button"
                                disabled={!canEdit || isSavingGroup || isLoading || !canPublishGroup}
                                onClick={() => void saveGroup('published')}
                                title={
                                    canPublishGroup
                                        ? 'Publish stone family'
                                        : 'Complete the Stone Library publish checklist first.'
                                }
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Publish family
                            </button>
                            <button
                                type="button"
                                disabled={!canEdit || isSavingGroup || isLoading}
                                onClick={() => void saveGroup('archived')}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                            >
                                <Archive className="h-4 w-4" />
                                Archive group
                            </button>
                        </div>
                    </form>

                    <form onSubmit={(event) => void handleVariantSubmit(event)} className="border border-black/10 bg-white p-5 md:p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Variants
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-black">
                                    {selectedVariant ? selectedVariant.variant_key : 'New variant'}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-black/58">
                                    Keep each product-facing variant clear so finish availability stays traceable.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={startNewVariant}
                                disabled={!canEdit || !selectedGroup}
                                className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                            >
                                <Plus className="h-4 w-4" />
                                New variant
                            </button>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {variants.map((variant) => (
                                <button
                                    key={variant.id}
                                    type="button"
                                    onClick={() => void selectVariant(variant)}
                                    className={[
                                        'inline-flex min-h-9 items-center gap-2 rounded border px-3 text-xs font-bold uppercase tracking-[0.12em] transition',
                                        selectedVariantId === variant.id
                                            ? 'border-black bg-black text-white'
                                            : 'border-black/15 bg-white text-black/58 hover:border-black hover:text-black',
                                    ].join(' ')}
                                >
                                    {variant.display_name || variant.variant_key}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Variant key
                                <input
                                    value={variantForm.variantKey}
                                    onChange={(event) => updateVariantField('variantKey', event.target.value)}
                                    disabled={!canEdit || isSavingVariant || isLoading || Boolean(selectedVariant)}
                                    required
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Display label
                                <input
                                    value={variantForm.displayName}
                                    onChange={(event) => updateVariantField('displayName', event.target.value)}
                                    disabled={!canEdit || isSavingVariant || isLoading || !selectedGroup}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Status
                                <select
                                    value={variantForm.status}
                                    onChange={(event) => updateVariantField('status', event.target.value as StoneStatus)}
                                    disabled={!canEdit || isSavingVariant || isLoading || !selectedGroup}
                                    className={fieldClass}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="tbc">Needs confirmation</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Sort order
                                <input
                                    value={variantForm.sortOrder}
                                    onChange={(event) => updateVariantField('sortOrder', event.target.value)}
                                    disabled={!canEdit || isSavingVariant || isLoading || !selectedGroup}
                                    inputMode="numeric"
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Supplier/source variant
                                <input
                                    value={variantForm.sourceVariant}
                                    onChange={(event) => updateVariantField('sourceVariant', event.target.value)}
                                    disabled={!canEdit || isSavingVariant || isLoading || !selectedGroup}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Variant category
                                <input
                                    value={variantForm.variantType}
                                    onChange={(event) => updateVariantField('variantType', event.target.value)}
                                    disabled={!canEdit || isSavingVariant || isLoading || !selectedGroup}
                                    className={fieldClass}
                                />
                            </label>
                        </div>

                        <div className="mt-3">
                            <StoneStatusHelp status={variantForm.status} />
                        </div>

                        <StonePublishChecklist items={variantPublishChecklist} title="Variant publish checklist" />

                        <div className="mt-6 flex flex-wrap gap-2">
                            <button
                                type="submit"
                                disabled={!canEdit || isSavingVariant || isLoading || !selectedGroup}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                            >
                                <Save className="h-4 w-4" />
                                {isSavingVariant ? 'Saving' : 'Save variant'}
                            </button>
                            <button
                                type="button"
                                disabled={!canEdit || isSavingVariant || isLoading || !selectedGroup || !canPublishVariant}
                                onClick={() => void saveVariant('published')}
                                title={
                                    canPublishVariant
                                        ? 'Publish variant'
                                        : 'Complete the variant publish checklist first.'
                                }
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Publish variant
                            </button>
                            <button
                                type="button"
                                disabled={!canEdit || isSavingVariant || isLoading || !selectedGroup}
                                onClick={() => void saveVariant('archived')}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                            >
                                <Archive className="h-4 w-4" />
                                Archive variant
                            </button>
                        </div>
                    </form>

                    <section className="border border-black/10 bg-white p-5 md:p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Finish images
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-black">
                                    {selectedImageId ? 'Edit image link' : 'New image link'}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-black/58">
                                    Choose approved Media library items for each variant and finish so texture evidence
                                    is clear before anything goes public.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={startNewFinishImage}
                                disabled={!canEdit || !selectedGroup || !selectedVariant}
                                className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                            >
                                <Plus className="h-4 w-4" />
                                New image
                            </button>
                        </div>

                        <div className="mt-6 grid gap-3 md:grid-cols-2">
                            {visibleFinishImages.length ? (
                                visibleFinishImages.map((image) => {
                                    const finish = image.finish_definition_id
                                        ? finishById.get(image.finish_definition_id)
                                        : null;
                                    const variant = image.stone_variant_id ? variantById.get(image.stone_variant_id) : null;
                                    const media = mediaById.get(image.media_asset_id);

                                    return (
                                        <button
                                            key={image.id}
                                            type="button"
                                            onClick={() => selectFinishImage(image)}
                                            className={[
                                                'rounded border p-3 text-left transition',
                                                selectedImageId === image.id
                                                    ? 'border-black bg-[#f8f9f5]'
                                                    : 'border-black/10 bg-white hover:border-black/30',
                                            ].join(' ')}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-black">
                                                        {finish?.display_name ?? 'Finish not set'}
                                                    </p>
                                                    <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-black/40">
                                                        {variant?.variant_key ?? 'Group level'} / {image.image_role}
                                                    </p>
                                                </div>
                                                <StatusPill status={image.status} />
                                            </div>
                                            <p className="mt-3 truncate text-xs text-black/50">
                                                {mediaLabel(media)}
                                            </p>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="rounded border border-black/10 bg-[#f8f9f5] p-4 text-sm leading-6 text-black/58 md:col-span-2">
                                    No finish images for this selected variant yet. Add images in `/admin/media`, then
                                    attach them here as primary, secondary, detail, or swatch evidence.
                                </div>
                            )}
                        </div>

                        <form onSubmit={(event) => void handleFinishImageSubmit(event)} className="mt-6 border-t border-black/10 pt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                    Finish
                                    <select
                                        value={finishImageForm.finishDefinitionId}
                                        onChange={(event) =>
                                            updateFinishImageField('finishDefinitionId', event.target.value)
                                        }
                                        disabled={!canEdit || isSavingFinishImage || !selectedVariant}
                                        required
                                        className={fieldClass}
                                    >
                                        <option value="">Select finish</option>
                                        {finishDefinitions.map((finish) => (
                                            <option key={finish.id} value={finish.id}>
                                                {finish.display_name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <FinishImageMediaSelect
                                    value={finishImageForm.mediaAssetId}
                                    disabled={!canEdit || isSavingFinishImage || !selectedVariant}
                                    mediaAssets={mediaAssets}
                                    selectedMedia={selectedFinishImageMedia}
                                    onChange={(value) => updateFinishImageField('mediaAssetId', value)}
                                />
                                <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                    Role
                                    <select
                                        value={finishImageForm.imageRole}
                                        onChange={(event) =>
                                            updateFinishImageField('imageRole', event.target.value as FinishImageRole)
                                        }
                                        disabled={!canEdit || isSavingFinishImage || !selectedVariant}
                                        className={fieldClass}
                                    >
                                        <option value="primary">Primary</option>
                                        <option value="secondary">Secondary</option>
                                        <option value="detail">Detail</option>
                                        <option value="swatch">Swatch</option>
                                    </select>
                                </label>
                                <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                    Status
                                    <select
                                        value={finishImageForm.status}
                                        onChange={(event) =>
                                            updateFinishImageField('status', event.target.value as FinishImageStatus)
                                        }
                                        disabled={!canEdit || isSavingFinishImage || !selectedVariant}
                                        className={fieldClass}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </label>
                                <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                    Sort order
                                    <input
                                        value={finishImageForm.sortOrder}
                                        onChange={(event) => updateFinishImageField('sortOrder', event.target.value)}
                                        disabled={!canEdit || isSavingFinishImage || !selectedVariant}
                                        inputMode="numeric"
                                        className={fieldClass}
                                    />
                                </label>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
                                <button
                                    type="submit"
                                    disabled={!canEdit || isSavingFinishImage || !selectedVariant}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-black/15 bg-white px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                                >
                                    <Save className="h-4 w-4" />
                                    {isSavingFinishImage ? 'Saving' : 'Save image link'}
                                </button>
                                <button
                                    type="button"
                                    disabled={
                                        !canEdit ||
                                        isSavingFinishImage ||
                                        !selectedVariant ||
                                        !finishImageForm.mediaAssetId ||
                                        finishImagePublishBlocked
                                    }
                                    onClick={() => void saveFinishImage('published')}
                                    title={
                                        finishImagePublishBlocked
                                            ? 'Publish the selected Media library item before publishing this finish image.'
                                            : 'Publish this finish image link.'
                                    }
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Publish image
                                </button>
                                <button
                                    type="button"
                                    disabled={!canEdit || isSavingFinishImage || !selectedVariant}
                                    onClick={() => void saveFinishImage('archived')}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-black px-4 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#33363f] disabled:cursor-not-allowed disabled:bg-black/25"
                                >
                                    <Archive className="h-4 w-4" />
                                    Archive image
                                </button>
                            </div>
                            {finishImagePublishBlocked ? (
                                <p className="mt-3 border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-800">
                                    Publish is locked because the selected Media library item is not Published in Media.
                                </p>
                            ) : null}
                        </form>
                    </section>
                </section>

                <aside className="space-y-5">
                    <section className="border border-black/10 bg-black p-5 text-white">
                        <Layers2 className="h-5 w-5 text-[var(--urblo-lime)]" />
                        <h2 className="mt-5 text-xl font-semibold">Content health</h2>
                        <div className="mt-5 grid gap-3 text-sm leading-6 text-white/72">
                            <p>{variants.length} variants attached to the selected stone group.</p>
                            <p>
                                {capabilityCounts.yes} available, {capabilityCounts.tbc} need confirmation,{' '}
                                {capabilityCounts.no} not available finish options for the selected variant.
                            </p>
                            <p>{visibleFinishImages.length} finish image links visible for the selected variant.</p>
                            <p>{finishDefinitions.length} finish options available for this stone.</p>
                            <p>{mediaAssets.length} Media library items available for finish images.</p>
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-black" />
                            <ImageIcon className="h-5 w-5 text-black/45" />
                        </div>
                        <h2 className="mt-5 text-xl font-semibold text-black">Publishing rules</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                            <li>Published groups require a name, key, type display, summary, and at least one variant.</li>
                            <li>Published variants require a variant key and at least one Available or Needs confirmation finish.</li>
                            <li>Published finish images require a selected finish and a Media library item that is Published in Media.</li>
                            <li>Needs confirmation stays visible to editors until the stone or finish is ready for the website.</li>
                            <li>Viewers can inspect the Stone Library but cannot save changes.</li>
                            <li>Use Archive to remove a stone from the website while keeping its editing history.</li>
                        </ul>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Finish matrix
                                </p>
                                <h2 className="mt-2 text-xl font-semibold text-black">
                                    {selectedVariant ? selectedVariant.variant_key : 'No variant selected'}
                                </h2>
                            </div>
                            <ListChecks className="h-5 w-5 text-black" />
                        </div>

                        <div className="mt-5 max-h-[720px] space-y-3 overflow-auto pr-1">
                            {finishDefinitions.map((finish) => {
                                const form = capabilityForms[finish.id] ?? emptyCapabilityForm();
                                return (
                                    <div key={finish.id} className="border border-black/10 p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-black">{finish.display_name}</p>
                                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/40">
                                                    {finish.finish_key}
                                                </p>
                                            </div>
                                            <CapabilityPill capability={form.capability} />
                                        </div>

                                        <label className="mt-3 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                            Capability
                                            <select
                                                value={form.capability}
                                                onChange={(event) =>
                                                    updateCapabilityField(
                                                        finish.id,
                                                        'capability',
                                                        event.target.value as Capability,
                                                    )
                                                }
                                                disabled={!canEdit || !selectedVariant || savingCapabilityId === finish.id}
                                                className={fieldClass}
                                            >
                                                <option value="yes">Available</option>
                                                <option value="tbc">Needs confirmation</option>
                                                <option value="no">Not available</option>
                                            </select>
                                        </label>
                                        <label className="mt-3 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                            Review notes
                                            <input
                                                value={form.sourcesText}
                                                onChange={(event) =>
                                                    updateCapabilityField(finish.id, 'sourcesText', event.target.value)
                                                }
                                                disabled={!canEdit || !selectedVariant || savingCapabilityId === finish.id}
                                                placeholder="samples, spec"
                                                className={fieldClass}
                                            />
                                        </label>
                                        <label className="mt-3 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                            Public behavior note
                                            <textarea
                                                value={form.behaviorNote}
                                                onChange={(event) =>
                                                    updateCapabilityField(finish.id, 'behaviorNote', event.target.value)
                                                }
                                                disabled={!canEdit || !selectedVariant || savingCapabilityId === finish.id}
                                                rows={2}
                                                className={`${fieldClass} py-3 leading-6`}
                                            />
                                        </label>
                                        <label className="mt-3 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                            Internal note
                                            <textarea
                                                value={form.adminNote}
                                                onChange={(event) =>
                                                    updateCapabilityField(finish.id, 'adminNote', event.target.value)
                                                }
                                                disabled={!canEdit || !selectedVariant || savingCapabilityId === finish.id}
                                                rows={2}
                                                className={`${fieldClass} py-3 leading-6`}
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            disabled={!canEdit || !selectedVariant || savingCapabilityId === finish.id}
                                            onClick={() => void saveCapability(finish)}
                                            className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-black/35"
                                        >
                                            <Save className="h-4 w-4" />
                                            {savingCapabilityId === finish.id ? 'Saving' : 'Save finish'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
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
                            Current role is read-only for Stone Library. Ask an editor/admin to update material records.
                        </section>
                    ) : null}
                </aside>
            </div>
        </AdminShell>
    );
}

function StatusPill({ status }: { status: StoneStatus }) {
    const label = status === 'tbc' ? 'Needs confirmation' : status;
    return (
        <span
            className={[
                'inline-flex h-8 shrink-0 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.14em]',
                status === 'published'
                    ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black'
                    : status === 'archived'
                      ? 'border-black/15 bg-black text-white'
                      : status === 'tbc'
                        ? 'border-black/20 bg-[#f5f6f2] text-black/62'
                        : 'border-black/15 bg-white text-black/50',
            ].join(' ')}
        >
            {label}
        </span>
    );
}

function getStoneFilterLabel(filter: StoneListFilter) {
    const labels: Record<StoneListFilter, string> = {
        all: 'All',
        published: 'Published',
        draft: 'Draft',
        tbc: 'Needs confirmation',
        archived: 'Archived',
    };

    return labels[filter];
}

function StoneStatusHelp({ status }: { status: StoneStatus }) {
    const messages: Record<StoneStatus, string> = {
        draft: 'Draft is safe to edit and will not appear on the public website.',
        tbc: 'Needs confirmation stays visible in the CMS, but is treated like Draft for public pages.',
        published: 'Published can appear in the public Stone Library and linked product material choices.',
        archived: 'Archived is hidden from the public website and kept for editing history.',
    };

    return (
        <p className="rounded border border-black/10 bg-[#f8f9f5] px-3 py-2 text-xs font-semibold leading-5 text-black/58">
            {messages[status]}
        </p>
    );
}

function CapabilityPill({ capability }: { capability: Capability }) {
    const labels: Record<Capability, string> = {
        yes: 'Available',
        tbc: 'Needs confirmation',
        no: 'Not available',
    };

    return (
        <span
            className={[
                'inline-flex h-7 shrink-0 items-center rounded border px-2.5 text-[10px] font-bold uppercase tracking-[0.14em]',
                capability === 'yes'
                    ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black'
                    : capability === 'tbc'
                      ? 'border-black/20 bg-[#f5f6f2] text-black/62'
                      : 'border-black/15 bg-white text-black/40',
            ].join(' ')}
        >
            {labels[capability]}
        </span>
    );
}

function StonePublishChecklist({
    items,
    title = 'Stone Library publish checklist',
}: {
    items: Array<{ label: string; ready: boolean; detail: string }>;
    title?: string;
}) {
    const readyCount = items.filter((item) => item.ready).length;
    const allReady = readyCount === items.length;

    return (
        <section className="mt-5 border border-black/10 bg-[#f8f9f5] p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">{title}</p>
                    <h3 className="mt-2 text-lg font-semibold text-black">
                        {allReady ? 'Ready for public review' : `${items.length - readyCount} item${items.length - readyCount === 1 ? '' : 's'} need review`}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-black/58">
                        Published Stone Library content can appear in public stone listings and product material links.
                    </p>
                </div>
                <span
                    className={[
                        'inline-flex min-h-8 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.12em]',
                        allReady
                            ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black'
                            : 'border-amber-300 bg-amber-50 text-amber-800',
                    ].join(' ')}
                >
                    {readyCount}/{items.length} ready
                </span>
            </div>
            <div className="mt-4 grid gap-2">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className={[
                            'border p-3',
                            item.ready ? 'border-[var(--urblo-lime)] bg-white' : 'border-amber-200 bg-amber-50',
                        ].join(' ')}
                    >
                        <div className="flex items-start gap-2">
                            {item.ready ? (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-black" />
                            ) : (
                                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
                            )}
                            <div>
                                <p className="text-sm font-semibold text-black">{item.label}</p>
                                <p className="mt-1 text-sm leading-5 text-black/58">{item.detail}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function rowToGroupForm(row: StoneGroupRow | null): StoneGroupFormState {
    if (!row) {
        return emptyGroupForm;
    }

    return {
        status: row.status,
        stoneGroupKey: row.stone_group_key,
        displayName: row.display_name,
        sourceName: row.source_name ?? '',
        stoneTypeSource: row.stone_type_source ?? '',
        stoneTypeDisplay: row.stone_type_display ?? '',
        originRegion: row.origin_region ?? '',
        originCountry: row.origin_country ?? '',
        priceSource: row.price_source ?? '',
        priceTier: row.price_tier === null ? '' : String(row.price_tier),
        rawBlockLengthMm: row.raw_block_length_mm === null ? '' : String(row.raw_block_length_mm),
        rawBlockWidthMm: row.raw_block_width_mm === null ? '' : String(row.raw_block_width_mm),
        rawBlockHeightMm: row.raw_block_height_mm === null ? '' : String(row.raw_block_height_mm),
        summary: row.summary ?? '',
        notes: row.notes ?? '',
        sortOrder: String(row.sort_order),
    };
}

function rowToVariantForm(row: StoneVariantRow | null): StoneVariantFormState {
    if (!row) {
        return emptyVariantForm;
    }

    return {
        status: row.status,
        variantKey: row.variant_key,
        displayName: row.display_name ?? '',
        sourceVariant: row.source_variant ?? '',
        variantType: row.variant_type,
        sortOrder: String(row.sort_order),
    };
}

function rowToCapabilityForm(row: CapabilityRow): CapabilityFormState {
    return {
        id: row.id,
        capability: row.capability,
        sourcesText: row.sources.join(', '),
        behaviorNote: row.behavior_note ?? '',
        adminNote: row.admin_note ?? '',
    };
}

function rowToFinishImageForm(row: StoneFinishImageRow | null): FinishImageFormState {
    if (!row) {
        return emptyFinishImageForm;
    }

    return {
        id: row.id,
        status: row.status,
        finishDefinitionId: row.finish_definition_id === null ? '' : String(row.finish_definition_id),
        mediaAssetId: String(row.media_asset_id),
        imageRole: row.image_role,
        sortOrder: String(row.sort_order),
    };
}

function emptyCapabilityForm(): CapabilityFormState {
    return {
        id: null,
        capability: 'no',
        sourcesText: '',
        behaviorNote: '',
        adminNote: '',
    };
}

function createCapabilityForms(
    finishes: FinishDefinitionRow[],
    rows: CapabilityRow[],
): Record<number, CapabilityFormState> {
    const rowByFinishId = new Map(rows.map((row) => [row.finish_definition_id, row]));

    return finishes.reduce<Record<number, CapabilityFormState>>((forms, finish) => {
        const existing = rowByFinishId.get(finish.id);
        forms[finish.id] = existing ? rowToCapabilityForm(existing) : emptyCapabilityForm();
        return forms;
    }, {});
}

function validateGroupForm(
    form: StoneGroupFormState,
    variantCount: number,
): {
    error: string | null;
    priceTier: number | null;
    rawBlockLengthMm: number | null;
    rawBlockWidthMm: number | null;
    rawBlockHeightMm: number | null;
    sortOrder: number;
} {
    if (!form.displayName.trim()) {
        return groupValidationFailure('Stone group display name is required.');
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.stoneGroupKey.trim())) {
        return groupValidationFailure('Website URL key must be lowercase kebab-case.');
    }

    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    if (sortOrder.error) return groupValidationFailure(sortOrder.error);

    const priceTier = optionalPriceTier(form.priceTier);
    if (priceTier.error) return groupValidationFailure(priceTier.error);

    const rawBlockLengthMm = optionalPositiveInteger(form.rawBlockLengthMm, 'Block length');
    const rawBlockWidthMm = optionalPositiveInteger(form.rawBlockWidthMm, 'Block width');
    const rawBlockHeightMm = optionalPositiveInteger(form.rawBlockHeightMm, 'Block height');
    if (rawBlockLengthMm.error) return groupValidationFailure(rawBlockLengthMm.error);
    if (rawBlockWidthMm.error) return groupValidationFailure(rawBlockWidthMm.error);
    if (rawBlockHeightMm.error) return groupValidationFailure(rawBlockHeightMm.error);

    if (form.status === 'published') {
        if (!form.stoneTypeDisplay.trim()) {
            return groupValidationFailure('Published stone groups require a type display.');
        }

        if (!form.summary.trim()) {
            return groupValidationFailure('Published stone groups require a summary.');
        }

        if (variantCount === 0) {
            return groupValidationFailure('Published stone groups require at least one variant.');
        }
    }

    return {
        error: null,
        priceTier: priceTier.value,
        rawBlockLengthMm: rawBlockLengthMm.value,
        rawBlockWidthMm: rawBlockWidthMm.value,
        rawBlockHeightMm: rawBlockHeightMm.value,
        sortOrder: sortOrder.value,
    };
}

function groupValidationFailure(error: string): ReturnType<typeof validateGroupForm> {
    return {
        error,
        priceTier: null,
        rawBlockLengthMm: null,
        rawBlockWidthMm: null,
        rawBlockHeightMm: null,
        sortOrder: 0,
    };
}

function validateVariantForm(form: StoneVariantFormState): { error: string | null; sortOrder: number } {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.variantKey.trim())) {
        return { error: 'Variant key must be lowercase kebab-case.', sortOrder: 0 };
    }

    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    if (sortOrder.error) {
        return { error: sortOrder.error, sortOrder: 0 };
    }

    return { error: null, sortOrder: sortOrder.value };
}

function validateFinishImageForm(form: FinishImageFormState): {
    error: string | null;
    finishDefinitionId: number;
    mediaAssetId: number;
    sortOrder: number;
} {
    const finishDefinitionId = requiredPositiveInteger(form.finishDefinitionId, 'Finish');
    if (finishDefinitionId.error) return finishImageValidationFailure('Finish image links require a finish.');

    const mediaAssetId = requiredPositiveInteger(form.mediaAssetId, 'Media library item');
    if (mediaAssetId.error) return finishImageValidationFailure('Finish image links require a Media library item.');

    const sortOrder = requiredInteger(form.sortOrder, 'Sort order');
    if (sortOrder.error) return finishImageValidationFailure(sortOrder.error);

    return {
        error: null,
        finishDefinitionId: finishDefinitionId.value,
        mediaAssetId: mediaAssetId.value,
        sortOrder: sortOrder.value,
    };
}

function finishImageValidationFailure(error: string): ReturnType<typeof validateFinishImageForm> {
    return {
        error,
        finishDefinitionId: 0,
        mediaAssetId: 0,
        sortOrder: 0,
    };
}

function optionalPriceTier(value: string): { error: string | null; value: number | null } {
    if (!value.trim()) {
        return { error: null, value: null };
    }

    const parsed = Number(value);
    if (parsed !== 1 && parsed !== 2 && parsed !== 3) {
        return { error: 'Price tier must be Budget, Balanced, Premium, or blank.', value: null };
    }

    return { error: null, value: parsed };
}

function requiredInteger(value: string, label: string): { error: string | null; value: number } {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
        return { error: `${label} must be a whole number.`, value: 0 };
    }

    return { error: null, value: parsed };
}

function requiredPositiveInteger(value: string, label: string): { error: string | null; value: number } {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return { error: `${label} is required.`, value: 0 };
    }

    return { error: null, value: parsed };
}

function optionalPositiveInteger(value: string, label: string): { error: string | null; value: number | null } {
    if (!value.trim()) {
        return { error: null, value: null };
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return { error: `${label} must be a whole positive number.`, value: null };
    }

    return { error: null, value: parsed };
}

function parseSources(value: string): string[] {
    return value
        .split(/[\n,]/)
        .map((entry) => entry.trim())
        .filter(Boolean);
}

function summarizeGroups(groups: StoneGroupRow[]) {
    return groups.reduce(
        (summary, group) => ({
            draft: summary.draft + (group.status === 'draft' ? 1 : 0),
            published: summary.published + (group.status === 'published' ? 1 : 0),
            archived: summary.archived + (group.status === 'archived' ? 1 : 0),
            tbc: summary.tbc + (group.status === 'tbc' ? 1 : 0),
        }),
        { draft: 0, published: 0, archived: 0, tbc: 0 },
    );
}

function summarizeCapabilities(forms: CapabilityFormState[]) {
    return forms.reduce(
        (summary, form) => ({
            yes: summary.yes + (form.capability === 'yes' ? 1 : 0),
            no: summary.no + (form.capability === 'no' ? 1 : 0),
            tbc: summary.tbc + (form.capability === 'tbc' ? 1 : 0),
        }),
        { yes: 0, no: 0, tbc: 0 },
    );
}

function hasAvailableCapability(forms: Record<number, CapabilityFormState>) {
    return Object.values(forms).some((form) => form.capability === 'yes' || form.capability === 'tbc');
}

function getStoneGroupPublishChecklist(
    form: StoneGroupFormState,
    variantCount: number,
    capabilityForms: Record<number, CapabilityFormState>,
) {
    return [
        {
            label: 'Name and website URL key',
            ready: Boolean(form.displayName.trim()) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.stoneGroupKey.trim()),
            detail: 'Add the public stone name and a lowercase URL key such as alpine-white.',
        },
        {
            label: 'Website stone type',
            ready: Boolean(form.stoneTypeDisplay.trim()),
            detail: 'Show editors and visitors the plain-language stone type, for example granite or limestone.',
        },
        {
            label: 'Public summary',
            ready: Boolean(form.summary.trim()),
            detail: 'Add a short visitor-facing description before this stone family can be published.',
        },
        {
            label: 'At least one variant',
            ready: variantCount > 0,
            detail: 'Add a variant so product defaults and finish availability have something to attach to.',
        },
        {
            label: 'Finish availability reviewed',
            ready: hasAvailableCapability(capabilityForms),
            detail: 'Mark at least one finish as Available or Needs confirmation for the selected variant.',
        },
    ];
}

function getStoneVariantPublishChecklist(
    form: StoneVariantFormState,
    capabilityForms: Record<number, CapabilityFormState>,
    selectedGroup: StoneGroupRow | null,
) {
    return [
        {
            label: 'Stone family selected',
            ready: Boolean(selectedGroup),
            detail: 'Choose the parent stone family before publishing a variant.',
        },
        {
            label: 'Variant URL key',
            ready: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.variantKey.trim()),
            detail: 'Use a lowercase key so this variant can be referenced consistently.',
        },
        {
            label: 'Editor-facing label',
            ready: Boolean(form.displayName.trim() || form.sourceVariant.trim() || form.variantKey.trim()),
            detail: 'Give editors a recognizable variant label, source variant, or clear key.',
        },
        {
            label: 'Finish availability reviewed',
            ready: hasAvailableCapability(capabilityForms),
            detail: 'Mark at least one finish as Available or Needs confirmation before publishing this variant.',
        },
    ];
}

function findMediaAsset(mediaAssets: MediaAssetOption[], value: string) {
    const mediaId = Number(value);
    if (!Number.isFinite(mediaId)) return null;
    return mediaAssets.find((asset) => asset.id === mediaId) ?? null;
}

function getMediaAssetUrl(asset: MediaAssetOption | null) {
    if (!asset) return null;

    if (asset.source_url) return asset.source_url;

    if (asset.bucket === 'urblo-public-media' && asset.object_path && supabase) {
        return supabase.storage.from(asset.bucket).getPublicUrl(asset.object_path).data.publicUrl;
    }

    return asset.object_path;
}

function mediaLabel(asset: MediaAssetOption | undefined) {
    if (!asset) {
        return 'Media item unavailable';
    }

    const label = asset.alt || asset.usage_notes || 'Untitled media';
    return `${label} - ${asset.status === 'published' ? 'Published' : 'Not published yet'}`;
}

function FinishImageMediaSelect({
    value,
    disabled,
    mediaAssets,
    selectedMedia,
    onChange,
}: {
    value: string;
    disabled?: boolean;
    mediaAssets: MediaAssetOption[];
    selectedMedia: MediaAssetOption | null;
    onChange: (value: string) => void;
}) {
    const previewUrl = getMediaAssetUrl(selectedMedia);

    return (
        <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                Media from library
                <select
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    disabled={disabled}
                    required
                    className={fieldClass}
                >
                    <option value="">Select media</option>
                    {mediaAssets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                            {mediaLabel(asset)}
                        </option>
                    ))}
                </select>
            </label>
            {selectedMedia ? (
                <div className="flex gap-3 border border-black/10 bg-[#f8f9f5] p-3">
                    <div className="flex h-24 w-28 shrink-0 items-center justify-center overflow-hidden bg-white">
                        {previewUrl && selectedMedia.media_type === 'image' ? (
                            <img
                                src={previewUrl}
                                alt={selectedMedia.alt || selectedMedia.usage_notes || 'Selected media'}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <ImageIcon className="h-5 w-5 text-black/35" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-black">
                            {selectedMedia.alt ||
                                selectedMedia.usage_notes ||
                                'Untitled media'}
                        </p>
                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-black/45">
                            {selectedMedia.status === 'published' ? 'Published in Media' : 'Not published in Media'}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-black/52">
                            {selectedMedia.status === 'published'
                                ? 'This Media library item can support a public finish image.'
                                : 'Open Media, review the asset, then publish it before this finish image goes public.'}
                        </p>
                        {selectedMedia.status !== 'published' ? (
                            <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-amber-800">
                                Publish this Media library item before making this finish image public.
                            </p>
                        ) : null}
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
