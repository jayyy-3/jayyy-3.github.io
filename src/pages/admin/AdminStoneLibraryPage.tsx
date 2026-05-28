import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    Archive,
    CheckCircle2,
    Layers2,
    ListChecks,
    Plus,
    Save,
    ShieldAlert,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';

type StoneStatus = 'draft' | 'published' | 'archived' | 'tbc';
type Capability = 'yes' | 'no' | 'tbc';
type FinishStatus = 'draft' | 'published' | 'archived';

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
    const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const [groupForm, setGroupForm] = useState<StoneGroupFormState>(emptyGroupForm);
    const [variantForm, setVariantForm] = useState<StoneVariantFormState>(emptyVariantForm);
    const [capabilityForms, setCapabilityForms] = useState<Record<number, CapabilityFormState>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingGroup, setIsSavingGroup] = useState(false);
    const [isSavingVariant, setIsSavingVariant] = useState(false);
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
    const capabilityCounts = useMemo(
        () => summarizeCapabilities(Object.values(capabilityForms)),
        [capabilityForms],
    );

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

            const [groupsResult, finishesResult] = await Promise.all([
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

            const nextGroups = groupsResult.data ?? [];
            const finishes = finishesResult.data ?? [];
            const nextGroup =
                nextGroups.find((group) => group.id === preferredGroupId) ?? nextGroups[0] ?? null;

            setGroups(nextGroups);
            setFinishDefinitions(finishes);
            setSelectedGroupId(nextGroup?.id ?? null);
            setGroupForm(rowToGroupForm(nextGroup));

            if (!nextGroup) {
                setVariants([]);
                setSelectedVariantId(null);
                setVariantForm(emptyVariantForm);
                setCapabilityForms(createCapabilityForms(finishes, []));
                setIsLoading(false);
                return;
            }

            try {
                await loadVariantBundle(client, nextGroup.id, null, finishes);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Stone Library detail load failed.');
            }

            setIsLoading(false);
        },
        [loadVariantBundle],
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

    async function selectGroup(group: StoneGroupRow) {
        setSelectedGroupId(group.id);
        setGroupForm(rowToGroupForm(group));
        setError(null);
        setNotice(null);

        if (supabase) {
            try {
                await loadVariantBundle(supabase, group.id, null, finishDefinitions);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Stone Library detail load failed.');
            }
        }
    }

    async function selectVariant(variant: StoneVariantRow) {
        setSelectedVariantId(variant.id);
        setVariantForm(rowToVariantForm(variant));
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
        setGroupForm(emptyGroupForm);
        setVariantForm(emptyVariantForm);
        setVariants([]);
        setCapabilityForms(createCapabilityForms(finishDefinitions, []));
        setError(null);
        setNotice('New stone group started.');
    }

    function startNewVariant() {
        if (!selectedGroup) {
            setError('Create or select a stone group before adding variants.');
            return;
        }

        setSelectedVariantId(null);
        setVariantForm(emptyVariantForm);
        setCapabilityForms(createCapabilityForms(finishDefinitions, []));
        setError(null);
        setNotice('New variant started.');
    }

    async function handleGroupSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await saveGroup(groupForm.status);
    }

    async function handleVariantSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await saveVariant(variantForm.status);
    }

    async function saveGroup(nextStatus: StoneStatus) {
        if (!supabase || !canEdit || !user) {
            return;
        }

        const validation = validateGroupForm({ ...groupForm, status: nextStatus }, variants.length);
        if (validation.error) {
            setError(validation.error);
            return;
        }

        if (nextStatus === 'published' && !hasAvailableCapability(capabilityForms)) {
            setError('Published variants require at least one yes or TBC finish capability.');
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

        setNotice(nextStatus === 'published' ? 'Stone group published.' : 'Stone group saved.');
        await loadLibrary(response.data.id);
    }

    async function saveVariant(nextStatus: StoneStatus) {
        if (!supabase || !canEdit || !user || !selectedGroup) {
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

        setNotice(nextStatus === 'published' ? 'Variant published.' : 'Variant saved.');
        await loadVariantBundle(supabase, selectedGroup.id, response.data.id, finishDefinitions);
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
        setNotice(`${finish.display_name} capability saved.`);
    }

    return (
        <AdminShell
            title="Stone Library"
            eyebrow={canEdit ? 'Admin/Editor' : 'Read only'}
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
                            Library records
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-black">{groups.length} stone groups</h2>
                        <p className="mt-2 text-sm leading-6 text-black/55">
                            {groupCounts.published} published, {groupCounts.draft} draft, {groupCounts.tbc} TBC,{' '}
                            {groupCounts.archived} archived.
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
                        ) : groups.length ? (
                            <div className="divide-y divide-black/10">
                                {groups.map((group) => (
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
                                                    {group.stone_group_key} / {group.stone_type_display ?? 'Type TBC'}
                                                </span>
                                            </span>
                                            <StatusPill status={group.status} />
                                        </div>
                                        <p className="mt-3 truncate text-xs text-black/45">
                                            {[group.origin_region, group.origin_country].filter(Boolean).join(', ') ||
                                                'Origin TBC'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-5">
                                <Archive className="h-5 w-5 text-black" />
                                <h2 className="mt-5 text-xl font-semibold text-black">No stone records yet</h2>
                                <p className="mt-3 text-sm leading-6 text-black/58">
                                    Create the first stone group, then add variants and finish capabilities. Current
                                    public Stone Library pages still use static data until the content migration is
                                    switched on.
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
                                    Maintain the public family record and keep TBC information explicit before
                                    publishing.
                                </p>
                            </div>
                            <StatusPill status={groupForm.status} />
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
                                Stone key
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
                                    <option value="tbc">TBC</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Source name
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
                                Type display
                                <input
                                    value={groupForm.stoneTypeDisplay}
                                    onChange={(event) => updateGroupField('stoneTypeDisplay', event.target.value)}
                                    disabled={!canEdit || isSavingGroup || isLoading}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Type source
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
                                Price source
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
                            Summary
                            <textarea
                                value={groupForm.summary}
                                onChange={(event) => updateGroupField('summary', event.target.value)}
                                disabled={!canEdit || isSavingGroup || isLoading}
                                rows={4}
                                className={`${fieldClass} py-3 leading-6`}
                            />
                        </label>
                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Admin notes
                            <textarea
                                value={groupForm.notes}
                                onChange={(event) => updateGroupField('notes', event.target.value)}
                                disabled={!canEdit || isSavingGroup || isLoading}
                                rows={3}
                                className={`${fieldClass} py-3 leading-6`}
                            />
                        </label>

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
                                disabled={!canEdit || isSavingGroup || isLoading}
                                onClick={() => void saveGroup('published')}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Publish group
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
                                    Keep source variants visible so product defaults and finish availability stay
                                    traceable.
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
                                    <option value="tbc">TBC</option>
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
                                Source variant
                                <input
                                    value={variantForm.sourceVariant}
                                    onChange={(event) => updateVariantField('sourceVariant', event.target.value)}
                                    disabled={!canEdit || isSavingVariant || isLoading || !selectedGroup}
                                    className={fieldClass}
                                />
                            </label>
                            <label className="text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                Variant type
                                <input
                                    value={variantForm.variantType}
                                    onChange={(event) => updateVariantField('variantType', event.target.value)}
                                    disabled={!canEdit || isSavingVariant || isLoading || !selectedGroup}
                                    className={fieldClass}
                                />
                            </label>
                        </div>

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
                                disabled={!canEdit || isSavingVariant || isLoading || !selectedGroup}
                                onClick={() => void saveVariant('published')}
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
                </section>

                <aside className="space-y-5">
                    <section className="border border-black/10 bg-black p-5 text-white">
                        <Layers2 className="h-5 w-5 text-[var(--urblo-lime)]" />
                        <h2 className="mt-5 text-xl font-semibold">Content health</h2>
                        <div className="mt-5 grid gap-3 text-sm leading-6 text-white/72">
                            <p>{variants.length} variants attached to the selected stone group.</p>
                            <p>
                                {capabilityCounts.yes} yes, {capabilityCounts.tbc} TBC, {capabilityCounts.no} no finish
                                capability rows for the selected variant.
                            </p>
                            <p>{finishDefinitions.length} canonical finish definitions loaded from Supabase.</p>
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <ShieldAlert className="h-5 w-5 text-black" />
                        <h2 className="mt-5 text-xl font-semibold text-black">Publication guardrails</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                            <li>Published groups require a name, key, type display, summary, and at least one variant.</li>
                            <li>Published variants require a variant key and at least one yes or TBC finish capability.</li>
                            <li>TBC records stay explicit and admin-visible instead of being hidden in notes.</li>
                            <li>Viewer roles can inspect but not mutate Stone Library records.</li>
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
                                                <option value="yes">Yes</option>
                                                <option value="tbc">TBC</option>
                                                <option value="no">No</option>
                                            </select>
                                        </label>
                                        <label className="mt-3 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                            Sources
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
                                            Behavior note
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
                                            Admin note
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
            {status}
        </span>
    );
}

function CapabilityPill({ capability }: { capability: Capability }) {
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
            {capability}
        </span>
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
        return groupValidationFailure('Stone key must be lowercase kebab-case.');
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
