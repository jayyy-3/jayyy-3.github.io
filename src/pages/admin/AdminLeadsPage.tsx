import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CheckCircle2, Download, Inbox, Mail, PackageCheck, Save, Search, ShieldAlert } from 'lucide-react';
import { recordAdminAuditEvent, withAuditNotice } from '../../lib/adminAudit';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';

type LeadKind = 'enquiry' | 'sample';
type LeadKindFilter = LeadKind | 'all';
type EnquiryStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'closed' | 'spam';
type SampleStatus = 'new' | 'confirmed' | 'packed' | 'sent' | 'closed' | 'spam';
type LeadStatusFilter = 'all' | EnquiryStatus | SampleStatus;
type NotificationStatus = 'pending' | 'sent' | 'failed' | 'not_required';

interface EnquiryRow {
    id: number;
    status: EnquiryStatus;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    project_type: string | null;
    message: string | null;
    source_route: string | null;
    turnstile_success: boolean | null;
    notification_status: NotificationStatus;
    assigned_to: string | null;
    internal_notes: string | null;
    created_at: string;
    updated_at: string;
}

interface SampleRequestRow {
    id: number;
    status: SampleStatus;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    shipping_address: string | null;
    project_name: string | null;
    message: string | null;
    source_route: string | null;
    turnstile_success: boolean | null;
    notification_status: NotificationStatus;
    assigned_to: string | null;
    internal_notes: string | null;
    created_at: string;
    updated_at: string;
}

interface SampleRequestItemRow {
    id: number;
    sample_request_id: number;
    stone_group_id: number | null;
    finish_definition_id: number | null;
    quantity: number;
    notes: string | null;
}

interface AdminProfileRow {
    user_id: string;
    email: string;
    display_name: string | null;
    role: string;
    is_active: boolean;
}

interface StoneOptionRow {
    id: number;
    display_name: string;
}

interface FinishOptionRow {
    id: number;
    display_name: string;
}

interface LeadFormState {
    status: string;
    assignedTo: string;
    internalNotes: string;
}

interface CombinedLead {
    kind: LeadKind;
    id: number;
    status: string;
    name: string;
    email: string;
    company: string | null;
    context: string;
    notificationStatus: NotificationStatus;
    assignedTo: string | null;
    createdAt: string;
}

const emptyForm: LeadFormState = {
    status: 'new',
    assignedTo: '',
    internalNotes: '',
};

const enquiryStatusOptions: Array<[EnquiryStatus, string]> = [
    ['new', 'New'],
    ['contacted', 'Contacted'],
    ['quoted', 'Quoted'],
    ['won', 'Won'],
    ['closed', 'Closed'],
    ['spam', 'Spam'],
];

const sampleStatusOptions: Array<[SampleStatus, string]> = [
    ['new', 'New'],
    ['confirmed', 'Confirmed'],
    ['packed', 'Packed'],
    ['sent', 'Sent'],
    ['closed', 'Closed'],
    ['spam', 'Spam'],
];

const fieldClass =
    'mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black disabled:bg-black/[0.04] disabled:text-black/45';

export default function AdminLeadsPage() {
    return (
        <RequireAdmin>
            <AdminLeadsContent />
        </RequireAdmin>
    );
}

function AdminLeadsContent() {
    const { profile, user } = useAdminAuth();
    const canManageLeads = profile?.role === 'owner' || profile?.role === 'admin';
    const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
    const [sampleRequests, setSampleRequests] = useState<SampleRequestRow[]>([]);
    const [sampleItems, setSampleItems] = useState<SampleRequestItemRow[]>([]);
    const [adminProfiles, setAdminProfiles] = useState<AdminProfileRow[]>([]);
    const [stoneOptions, setStoneOptions] = useState<StoneOptionRow[]>([]);
    const [finishOptions, setFinishOptions] = useState<FinishOptionRow[]>([]);
    const [selectedKind, setSelectedKind] = useState<LeadKind | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [form, setForm] = useState<LeadFormState>(emptyForm);
    const [leadSearch, setLeadSearch] = useState('');
    const [kindFilter, setKindFilter] = useState<LeadKindFilter>('all');
    const [statusFilter, setStatusFilter] = useState<LeadStatusFilter>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const combinedLeads = useMemo(
        () =>
            [
                ...enquiries.map((lead): CombinedLead => ({
                    kind: 'enquiry',
                    id: lead.id,
                    status: lead.status,
                    name: lead.name,
                    email: lead.email,
                    company: lead.company,
                    context: lead.project_type ?? 'Project type pending',
                    notificationStatus: lead.notification_status,
                    assignedTo: lead.assigned_to,
                    createdAt: lead.created_at,
                })),
                ...sampleRequests.map((lead): CombinedLead => ({
                    kind: 'sample',
                    id: lead.id,
                    status: lead.status,
                    name: lead.name,
                    email: lead.email,
                    company: lead.company,
                    context: lead.project_name ?? 'Sample project pending',
                    notificationStatus: lead.notification_status,
                    assignedTo: lead.assigned_to,
                    createdAt: lead.created_at,
                })),
            ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
        [enquiries, sampleRequests],
    );

    const selectedEnquiry = useMemo(
        () => (selectedKind === 'enquiry' ? enquiries.find((lead) => lead.id === selectedId) ?? null : null),
        [enquiries, selectedId, selectedKind],
    );
    const selectedSample = useMemo(
        () => (selectedKind === 'sample' ? sampleRequests.find((lead) => lead.id === selectedId) ?? null : null),
        [sampleRequests, selectedId, selectedKind],
    );
    const selectedLead = selectedEnquiry ?? selectedSample;
    const selectedSampleItems = useMemo(
        () =>
            selectedKind === 'sample' && selectedId !== null
                ? sampleItems.filter((item) => item.sample_request_id === selectedId)
                : [],
        [sampleItems, selectedId, selectedKind],
    );
    const inboxSummary = useMemo(() => summarizeInbox(enquiries, sampleRequests), [enquiries, sampleRequests]);
    const filteredLeads = useMemo(
        () =>
            combinedLeads.filter((lead) => {
                const matchesKind = kindFilter === 'all' || lead.kind === kindFilter;
                const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
                const search = leadSearch.trim().toLowerCase();
                const matchesSearch =
                    !search ||
                    [lead.name, lead.email, lead.company, lead.context, lead.status, lead.kind]
                        .filter(Boolean)
                        .some((value) => String(value).toLowerCase().includes(search));
                return matchesKind && matchesStatus && matchesSearch;
            }),
        [combinedLeads, kindFilter, leadSearch, statusFilter],
    );

    const loadLeads = useCallback(
        async (preferred?: { kind: LeadKind; id: number } | null) => {
            if (!supabase) return;

            const client: SupabaseClient = supabase;
            setIsLoading(true);
            setError(null);

            const [enquiriesResult, samplesResult, itemsResult, profilesResult, stonesResult, finishesResult] =
                await Promise.all([
                    client
                        .from('enquiries')
                        .select(
                            'id,status,name,email,phone,company,project_type,message,source_route,turnstile_success,notification_status,assigned_to,internal_notes,created_at,updated_at',
                        )
                        .order('created_at', { ascending: false })
                        .limit(160)
                        .returns<EnquiryRow[]>(),
                    client
                        .from('sample_requests')
                        .select(
                            'id,status,name,email,phone,company,shipping_address,project_name,message,source_route,turnstile_success,notification_status,assigned_to,internal_notes,created_at,updated_at',
                        )
                        .order('created_at', { ascending: false })
                        .limit(160)
                        .returns<SampleRequestRow[]>(),
                    client
                        .from('sample_request_items')
                        .select('id,sample_request_id,stone_group_id,finish_definition_id,quantity,notes')
                        .order('id', { ascending: true })
                        .limit(500)
                        .returns<SampleRequestItemRow[]>(),
                    client
                        .from('admin_profiles')
                        .select('user_id,email,display_name,role,is_active')
                        .eq('is_active', true)
                        .order('email', { ascending: true })
                        .returns<AdminProfileRow[]>(),
                    client
                        .from('stone_groups')
                        .select('id,display_name')
                        .order('display_name', { ascending: true })
                        .returns<StoneOptionRow[]>(),
                    client
                        .from('finish_definitions')
                        .select('id,display_name')
                        .order('display_name', { ascending: true })
                        .returns<FinishOptionRow[]>(),
                ]);

            const loadError =
                enquiriesResult.error ??
                samplesResult.error ??
                itemsResult.error ??
                profilesResult.error ??
                stonesResult.error ??
                finishesResult.error;
            if (loadError) {
                setError(loadError.message);
                setIsLoading(false);
                return;
            }

            const nextEnquiries = enquiriesResult.data ?? [];
            const nextSamples = samplesResult.data ?? [];
            const nextCombined = [
                ...nextEnquiries.map((lead) => ({ kind: 'enquiry' as const, id: lead.id, createdAt: lead.created_at })),
                ...nextSamples.map((lead) => ({ kind: 'sample' as const, id: lead.id, createdAt: lead.created_at })),
            ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

            const nextSelected =
                preferred && nextCombined.some((lead) => lead.kind === preferred.kind && lead.id === preferred.id)
                    ? preferred
                    : nextCombined[0] ?? null;

            setEnquiries(nextEnquiries);
            setSampleRequests(nextSamples);
            setSampleItems(itemsResult.data ?? []);
            setAdminProfiles(profilesResult.data ?? []);
            setStoneOptions(stonesResult.data ?? []);
            setFinishOptions(finishesResult.data ?? []);
            setSelectedKind(nextSelected?.kind ?? null);
            setSelectedId(nextSelected?.id ?? null);
            setForm(leadToForm(nextSelected?.kind ?? null, nextSelected?.id ?? null, nextEnquiries, nextSamples));
            setIsLoading(false);
        },
        [],
    );

    useEffect(() => {
        void loadLeads();
    }, [loadLeads]);

    function selectLead(lead: CombinedLead) {
        setSelectedKind(lead.kind);
        setSelectedId(lead.id);
        setForm(leadToForm(lead.kind, lead.id, enquiries, sampleRequests));
        setNotice(null);
        setError(null);
    }

    function updateField<Key extends keyof LeadFormState>(key: Key, value: LeadFormState[Key]) {
        setForm((current) => ({ ...current, [key]: value }));
        setNotice(null);
    }

    async function saveLead(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!supabase || !canManageLeads || !user || !selectedKind || !selectedId) return;

        const allowedStatuses =
            selectedKind === 'enquiry'
                ? enquiryStatusOptions.map(([value]) => value)
                : sampleStatusOptions.map(([value]) => value);
        if (!allowedStatuses.some((status) => status === form.status)) {
            setError('Lead status is not valid for this lead type.');
            return;
        }

        setIsSaving(true);
        setError(null);
        setNotice(null);

        const payload = {
            status: form.status,
            assigned_to: form.assignedTo || null,
            internal_notes: form.internalNotes.trim() || null,
        };

        const response =
            selectedKind === 'enquiry'
                ? await supabase.from('enquiries').update(payload).eq('id', selectedId).select('id').single()
                : await supabase.from('sample_requests').update(payload).eq('id', selectedId).select('id').single();

        setIsSaving(false);

        if (response.error) {
            setError(response.error.message);
            return;
        }

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: selectedKind === 'enquiry' ? 'enquiry.workflow_update' : 'sample_request.workflow_update',
            entityType: selectedKind === 'enquiry' ? 'enquiries' : 'sample_requests',
            entityId: selectedId,
            metadata: {
                status: form.status,
                assignedTo: form.assignedTo || null,
                hasInternalNotes: Boolean(form.internalNotes.trim()),
            },
        });
        setNotice(withAuditNotice('Lead workflow updated.', auditError));
        await loadLeads({ kind: selectedKind, id: selectedId });
    }

    async function exportLeadCsv() {
        if (!supabase || !canManageLeads || !user || filteredLeads.length === 0) return;

        const visibleEnquiryIds = new Set(
            filteredLeads.filter((lead) => lead.kind === 'enquiry').map((lead) => lead.id),
        );
        const visibleSampleIds = new Set(filteredLeads.filter((lead) => lead.kind === 'sample').map((lead) => lead.id));
        const visibleEnquiries = enquiries.filter((lead) => visibleEnquiryIds.has(lead.id));
        const visibleSampleRequests = sampleRequests.filter((lead) => visibleSampleIds.has(lead.id));
        const visibleSampleItems = sampleItems.filter((item) => visibleSampleIds.has(item.sample_request_id));

        setIsExporting(true);
        setError(null);
        setNotice(null);

        const auditError = await recordAdminAuditEvent(supabase, {
            actorUserId: user.id,
            action: 'leads.export_csv',
            entityType: 'lead_export',
            entityId: null,
            metadata: {
                enquiryCount: visibleEnquiries.length,
                sampleRequestCount: visibleSampleRequests.length,
                sampleItemCount: visibleSampleItems.length,
                exportedVisibleRows: filteredLeads.length,
                totalLoadedRows: combinedLeads.length,
                filters: {
                    kind: kindFilter,
                    status: statusFilter,
                    searchApplied: Boolean(leadSearch.trim()),
                },
                newestCreatedAt: filteredLeads[0]?.createdAt ?? null,
                oldestCreatedAt: filteredLeads[filteredLeads.length - 1]?.createdAt ?? null,
            },
        });

        if (auditError) {
            setIsExporting(false);
            setError(`Export is locked because the change history could not be recorded: ${auditError}`);
            return;
        }

        const csv = buildLeadExportCsv(
            visibleEnquiries,
            visibleSampleRequests,
            visibleSampleItems,
            adminProfiles,
            stoneOptions,
            finishOptions,
        );
        downloadTextFile(csv, `urblo-leads-${new Date().toISOString().slice(0, 10)}.csv`);
        setIsExporting(false);
        setNotice(`Exported ${filteredLeads.length} visible lead records. Change history recorded.`);
    }

    const statusOptions = selectedKind === 'sample' ? sampleStatusOptions : enquiryStatusOptions;

    return (
        <AdminShell
            title="Leads"
            eyebrow={canManageLeads ? 'Lead management' : 'Read only'}
            actions={
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => void exportLeadCsv()}
                        disabled={!canManageLeads || isExporting || filteredLeads.length === 0}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/[0.04] disabled:text-black/35"
                        title={
                            filteredLeads.length
                                ? 'Export only the leads currently visible after search and filters.'
                                : 'No visible leads match the current search and filters.'
                        }
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? 'Recording export' : 'Export visible queue'}
                    </button>
                    <div className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black/58">
                        <Inbox className="h-4 w-4" />
                        {filteredLeads.length}/{inboxSummary.total} visible
                    </div>
                </div>
            }
        >
            <div className="grid gap-5 xl:grid-cols-[minmax(280px,410px)_minmax(0,1fr)_360px]">
                <section className="border border-black/10 bg-white">
                    <div className="border-b border-black/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                            Lead queue
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-black">{inboxSummary.newCount} new</h2>
                        <p className="mt-2 text-sm leading-6 text-black/55">
                            {inboxSummary.enquiries} enquiries, {inboxSummary.samples} sample requests.
                        </p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/45">
                            Export uses the current search and filters: {filteredLeads.length} visible of{' '}
                            {inboxSummary.total} loaded.
                        </p>
                        <label className="mt-4 flex min-h-11 items-center gap-2 border border-black/10 bg-[#f8f9f5] px-3 text-sm text-black">
                            <Search className="h-4 w-4 shrink-0 text-black/42" />
                            <input
                                value={leadSearch}
                                onChange={(event) => setLeadSearch(event.target.value)}
                                placeholder="Search name, email, company, context"
                                className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-black/36"
                            />
                        </label>
                        <div className="mt-3 grid grid-cols-3 gap-1">
                            {(['all', 'enquiry', 'sample'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setKindFilter(filter)}
                                    className={[
                                        'min-h-9 rounded border px-2 text-[11px] font-bold uppercase tracking-[0.1em] transition',
                                        kindFilter === filter
                                            ? 'border-black bg-black text-white'
                                            : 'border-black/10 bg-white text-black/55 hover:border-black',
                                    ].join(' ')}
                                >
                                    {filter === 'sample' ? 'samples' : filter}
                                </button>
                            ))}
                        </div>
                        <label className="mt-3 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Workflow status
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value as LeadStatusFilter)}
                                className={fieldClass}
                            >
                                <option value="all">All statuses</option>
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="quoted">Quoted</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="packed">Packed</option>
                                <option value="sent">Sent</option>
                                <option value="won">Won</option>
                                <option value="closed">Closed</option>
                                <option value="spam">Spam</option>
                            </select>
                        </label>
                    </div>
                    <div className="max-h-[760px] overflow-auto">
                        {isLoading ? (
                            <div className="space-y-3 p-4">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-24 animate-pulse rounded border border-black/10 bg-black/[0.04]"
                                    />
                                ))}
                            </div>
                        ) : filteredLeads.length ? (
                            <div className="divide-y divide-black/10">
                                {filteredLeads.map((lead) => (
                                    <button
                                        key={`${lead.kind}-${lead.id}`}
                                        type="button"
                                        onClick={() => selectLead(lead)}
                                        className={[
                                            'block w-full p-4 text-left transition hover:bg-[#f8f9f5]',
                                            selectedKind === lead.kind && selectedId === lead.id
                                                ? 'bg-[#f8f9f5]'
                                                : 'bg-white',
                                        ].join(' ')}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="min-w-0">
                                                <span className="block truncate text-sm font-semibold text-black">
                                                    {lead.name}
                                                </span>
                                                <span className="mt-1 block truncate text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                                    {lead.kind === 'sample' ? 'Sample request' : 'Enquiry'} /{' '}
                                                    {formatDate(lead.createdAt)}
                                                </span>
                                            </span>
                                            <StatusPill status={lead.status} />
                                        </div>
                                        <p className="mt-3 truncate text-xs text-black/45">
                                            {lead.company || lead.email} / {lead.context}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-5">
                                <Inbox className="h-5 w-5 text-black" />
                                <h2 className="mt-5 text-xl font-semibold text-black">
                                    {combinedLeads.length ? 'No matching leads' : 'No visible leads yet'}
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-black/58">
                                    {combinedLeads.length
                                        ? 'Clear the search or choose another filter.'
                                        : 'This inbox will populate after live form persistence creates contact and sample request rows.'}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-5">
                    <section className="border border-black/10 bg-white p-5 md:p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Lead detail
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-black">
                                    {selectedLead?.name ?? 'No lead selected'}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-black/58">
                                    Contact details, website source, form delivery, and internal workflow notes.
                                </p>
                            </div>
                            {selectedLead ? <StatusPill status={selectedLead.status} /> : null}
                        </div>

                        {selectedLead ? (
                            <>
                                <div className="mt-7 grid gap-3 md:grid-cols-2">
                                    <InfoBlock label="Email" value={selectedLead.email} href={`mailto:${selectedLead.email}`} />
                                    <InfoBlock label="Phone" value={selectedLead.phone ?? 'Not supplied'} href={selectedLead.phone ? `tel:${selectedLead.phone}` : undefined} />
                                    <InfoBlock label="Company" value={selectedLead.company ?? 'Not supplied'} />
                                    <InfoBlock label="Website page" value={formatSourceRoute(selectedLead.source_route)} />
                                    {selectedKind === 'enquiry' ? (
                                        <InfoBlock
                                            label="Project type"
                                            value={selectedEnquiry?.project_type ?? 'Not supplied'}
                                        />
                                    ) : (
                                        <InfoBlock
                                            label="Project name"
                                            value={selectedSample?.project_name ?? 'Not supplied'}
                                        />
                                    )}
                                    <InfoBlock label="Assigned" value={assigneeName(selectedLead.assigned_to, adminProfiles)} />
                                </div>

                                {selectedKind === 'sample' ? (
                                    <div className="mt-5 border border-black/10 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                            Shipping address
                                        </p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-black">
                                            {selectedSample?.shipping_address || 'Not supplied'}
                                        </p>
                                    </div>
                                ) : null}

                                <div className="mt-5 border border-black/10 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                        Message
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/68">
                                        {selectedLead.message || 'No message supplied.'}
                                    </p>
                                </div>

                                {selectedKind === 'sample' ? (
                                    <SampleItems
                                        items={selectedSampleItems}
                                        stones={stoneOptions}
                                        finishes={finishOptions}
                                    />
                                ) : null}
                            </>
                        ) : (
                            <p className="mt-7 text-sm leading-6 text-black/58">
                                Select a lead from the queue after form submissions exist.
                            </p>
                        )}
                    </section>

                    <form onSubmit={(event) => void saveLead(event)} className="border border-black/10 bg-white p-5 md:p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Workflow
                                </p>
                                <h2 className="mt-2 text-xl font-semibold text-black">Status and notes</h2>
                                <p className="mt-2 text-sm leading-6 text-black/58">
                                    Move the lead through one clear next action, then leave internal notes for the team.
                                </p>
                            </div>
                            <PackageCheck className="h-5 w-5 text-black" />
                        </div>

                        {selectedLead ? <WorkflowGuidance kind={selectedKind} status={form.status} /> : null}

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <SelectField
                                label="Status"
                                value={form.status}
                                disabled={!canManageLeads || isSaving || !selectedLead}
                                options={statusOptions}
                                onChange={(value) => updateField('status', value)}
                            />
                            <SelectField
                                label="Assigned owner"
                                value={form.assignedTo}
                                disabled={!canManageLeads || isSaving || !selectedLead}
                                options={[
                                    ['', 'Unassigned'],
                                    ...adminProfiles.map(
                                        (admin) =>
                                            [
                                                admin.user_id,
                                                `${admin.display_name || admin.email} (${formatTeamRole(admin.role)})`,
                                            ] as [string, string],
                                    ),
                                ]}
                                onChange={(value) => updateField('assignedTo', value)}
                            />
                        </div>

                        <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                            Internal notes
                            <textarea
                                value={form.internalNotes}
                                onChange={(event) => updateField('internalNotes', event.target.value)}
                                disabled={!canManageLeads || isSaving || !selectedLead}
                                rows={7}
                                className={`${fieldClass} py-3 leading-6`}
                            />
                        </label>

                        <div className="mt-6 flex flex-wrap gap-2">
                            <button
                                type="submit"
                                disabled={!canManageLeads || isSaving || !selectedLead}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-[var(--urblo-lime)] px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-black/35"
                            >
                                <Save className="h-4 w-4" />
                                {isSaving ? 'Saving' : 'Save workflow'}
                            </button>
                        </div>
                    </form>
                </section>

                <aside className="space-y-5">
                    <section className="border border-black/10 bg-black p-5 text-white">
                        <CheckCircle2 className="h-5 w-5 text-[var(--urblo-lime)]" />
                        <h2 className="mt-5 text-xl font-semibold">Inbox health</h2>
                        <div className="mt-5 grid gap-3 text-sm leading-6 text-white/72">
                            <p>{inboxSummary.newCount} new leads need first response.</p>
                            <p>{inboxSummary.failedNotifications} leads need email-delivery review.</p>
                            <p>{inboxSummary.spamCount} records are marked spam.</p>
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <ShieldAlert className="h-5 w-5 text-black" />
                        <h2 className="mt-5 text-xl font-semibold text-black">Workflow rules</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                            <li>New leads enter this inbox from the public Contact and Sample Request forms.</li>
                            <li>Lead managers can update workflow status, assignment, and internal notes.</li>
                            <li>CSV export is recorded in change history and only includes the currently visible filtered queue.</li>
                            <li>Use Closed to finish a real conversation while keeping its history.</li>
                            <li>Use Spam only for junk submissions so real customer conversations stay visible.</li>
                        </ul>
                    </section>

                    {selectedLead ? (
                        <section className="border border-black/10 bg-white p-5">
                            <Mail className="h-5 w-5 text-black" />
                            <h2 className="mt-5 text-xl font-semibold text-black">Form delivery</h2>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <NotificationPill status={selectedLead.notification_status} />
                                <SpamCheckPill value={selectedLead.turnstile_success} />
                            </div>
                            <p className="mt-4 text-sm leading-6 text-black/58">
                                These badges explain whether the team notification email was accepted and whether the
                                website spam check passed when the lead was submitted.
                            </p>
                        </section>
                    ) : null}

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
                    {!canManageLeads ? (
                        <section className="border border-black/10 bg-white p-5 text-sm leading-6 text-black/62">
                            Current role is read-only for Leads. Ask a lead manager to update workflow status, assignment, or internal notes.
                        </section>
                    ) : null}
                </aside>
            </div>
        </AdminShell>
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

function InfoBlock({ label, value, href }: { label: string; value: string; href?: string }) {
    return (
        <div className="border border-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">{label}</p>
            {href ? (
                <a href={href} className="mt-2 block break-all text-sm font-semibold leading-6 text-black underline">
                    {value}
                </a>
            ) : (
                <p className="mt-2 break-words text-sm font-semibold leading-6 text-black">{value}</p>
            )}
        </div>
    );
}

function SampleItems({
    items,
    stones,
    finishes,
}: {
    items: SampleRequestItemRow[];
    stones: StoneOptionRow[];
    finishes: FinishOptionRow[];
}) {
    const stoneMap = new Map(stones.map((stone) => [stone.id, stone.display_name]));
    const finishMap = new Map(finishes.map((finish) => [finish.id, finish.display_name]));

    return (
        <section className="mt-5 border border-black/10">
            <div className="border-b border-black/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Requested samples</p>
            </div>
            {items.length ? (
                <div className="divide-y divide-black/10">
                    {items.map((item) => (
                        <div key={item.id} className="grid gap-3 p-4 md:grid-cols-[1fr_120px]">
                            <div>
                                <p className="text-sm font-semibold text-black">
                                    {item.stone_group_id
                                        ? stoneMap.get(item.stone_group_id) ?? 'Stone not found'
                                        : 'Stone not selected'}
                                </p>
                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/42">
                                    {item.finish_definition_id
                                        ? finishMap.get(item.finish_definition_id) ?? 'Finish not found'
                                        : 'Finish not selected'}
                                </p>
                                {item.notes ? <p className="mt-3 text-sm leading-6 text-black/58">{item.notes}</p> : null}
                            </div>
                            <p className="text-sm font-semibold text-black md:text-right">Qty {item.quantity}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="p-4 text-sm leading-6 text-black/58">No item rows recorded for this request.</p>
            )}
        </section>
    );
}

function WorkflowGuidance({ kind, status }: { kind: LeadKind | null; status: string }) {
    const guidance = getWorkflowGuidance(kind, status);

    return (
        <section className="mt-5 border border-black/10 bg-[#f8f9f5] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Recommended next step</p>
            <h3 className="mt-2 text-lg font-semibold text-black">{guidance.title}</h3>
            <p className="mt-2 text-sm leading-6 text-black/62">{guidance.detail}</p>
        </section>
    );
}

function StatusPill({ status }: { status: string }) {
    const isActive = ['new', 'contacted', 'confirmed', 'packed', 'sent', 'quoted'].includes(status);
    const isDone = ['won', 'closed'].includes(status);

    return (
        <span
            className={[
                'inline-flex h-8 shrink-0 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.14em]',
                isActive
                    ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black'
                    : isDone
                      ? 'border-black/15 bg-white text-black/50'
                      : 'border-black/15 bg-black text-white',
            ].join(' ')}
        >
            {status}
        </span>
    );
}

function NotificationPill({ status }: { status: NotificationStatus }) {
    const labels: Record<NotificationStatus, string> = {
        pending: 'Email delivery pending',
        sent: 'Email sent',
        failed: 'Email delivery failed',
        not_required: 'Email not required',
    };

    return (
        <span
            className={[
                'inline-flex h-8 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.14em]',
                status === 'sent'
                    ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black'
                    : status === 'failed'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-black/15 bg-white text-black/50',
            ].join(' ')}
        >
            {labels[status]}
        </span>
    );
}

function SpamCheckPill({ value }: { value: boolean | null }) {
    const label = value === true ? 'Spam check passed' : value === false ? 'Spam check failed' : 'Spam check not recorded';

    return (
        <span
            className={[
                'inline-flex h-8 items-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.14em]',
                value === false ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-black/15 bg-white text-black/50',
            ].join(' ')}
        >
            {label}
        </span>
    );
}

function leadToForm(
    kind: LeadKind | null,
    id: number | null,
    enquiries: EnquiryRow[],
    sampleRequests: SampleRequestRow[],
): LeadFormState {
    if (kind === 'enquiry') {
        const lead = enquiries.find((row) => row.id === id);
        if (lead) {
            return {
                status: lead.status,
                assignedTo: lead.assigned_to ?? '',
                internalNotes: lead.internal_notes ?? '',
            };
        }
    }

    if (kind === 'sample') {
        const lead = sampleRequests.find((row) => row.id === id);
        if (lead) {
            return {
                status: lead.status,
                assignedTo: lead.assigned_to ?? '',
                internalNotes: lead.internal_notes ?? '',
            };
        }
    }

    return emptyForm;
}

function getWorkflowGuidance(kind: LeadKind | null, status: string) {
    if (status === 'spam') {
        return {
            title: 'No customer follow-up',
            detail: 'Keep the record marked Spam unless it was misclassified. Add a note if the team should ignore future similar submissions.',
        };
    }

    if (status === 'closed') {
        return {
            title: 'Conversation closed',
            detail: 'Use internal notes to record why it closed, especially if the customer may return later.',
        };
    }

    if (kind === 'sample') {
        const sampleGuidance: Record<string, { title: string; detail: string }> = {
            new: {
                title: 'Confirm details with the customer',
                detail: 'Check requested samples, shipping address, and project name before moving this request to Confirmed.',
            },
            confirmed: {
                title: 'Prepare the sample pack',
                detail: 'Assign an owner, confirm stock internally, then move to Packed when the sample set is ready.',
            },
            packed: {
                title: 'Dispatch and record the handoff',
                detail: 'Send the samples, add courier or handoff notes, then move to Sent.',
            },
            sent: {
                title: 'Follow up after delivery',
                detail: 'Add follow-up notes and close the request once the sample conversation is complete.',
            },
        };

        return sampleGuidance[status] ?? sampleGuidance.new;
    }

    const enquiryGuidance: Record<string, { title: string; detail: string }> = {
        new: {
            title: 'Make first contact',
            detail: 'Assign an owner, reply to the customer, then move the enquiry to Contacted.',
        },
        contacted: {
            title: 'Qualify the project',
            detail: 'Capture scope, timing, location, and material interest before preparing pricing or samples.',
        },
        quoted: {
            title: 'Track quote outcome',
            detail: 'Keep notes current while the customer reviews the quote, then move to Won or Closed.',
        },
        won: {
            title: 'Hand over to delivery',
            detail: 'Record the handoff details and keep the lead linked to the active project workflow outside the inbox.',
        },
    };

    return enquiryGuidance[status] ?? enquiryGuidance.new;
}

function summarizeInbox(enquiries: EnquiryRow[], samples: SampleRequestRow[]) {
    return {
        total: enquiries.length + samples.length,
        enquiries: enquiries.length,
        samples: samples.length,
        newCount: enquiries.filter((lead) => lead.status === 'new').length + samples.filter((lead) => lead.status === 'new').length,
        spamCount:
            enquiries.filter((lead) => lead.status === 'spam').length +
            samples.filter((lead) => lead.status === 'spam').length,
        failedNotifications:
            enquiries.filter((lead) => lead.notification_status === 'failed').length +
            samples.filter((lead) => lead.notification_status === 'failed').length,
    };
}

function formatSourceRoute(route: string | null) {
    if (!route) return 'Unknown page';

    const [path, query = ''] = route.split('?');
    const routeLabels: Record<string, string> = {
        '/contact': 'Contact page',
        '/capabilities': 'Capabilities page',
        '/products': 'Products page',
        '/projects': 'Projects page',
        '/stone-library': 'Stone Library',
    };

    const label = routeLabels[path] ?? path;
    if (query.includes('intent=sample-request')) {
        return `${label} / Sample request`;
    }

    return label;
}

function buildLeadExportCsv(
    enquiries: EnquiryRow[],
    sampleRequests: SampleRequestRow[],
    sampleItems: SampleRequestItemRow[],
    admins: AdminProfileRow[],
    stones: StoneOptionRow[],
    finishes: FinishOptionRow[],
) {
    const stoneMap = new Map(stones.map((stone) => [stone.id, stone.display_name]));
    const finishMap = new Map(finishes.map((finish) => [finish.id, finish.display_name]));
    const sampleItemsByRequest = new Map<number, SampleRequestItemRow[]>();
    sampleItems.forEach((item) => {
        sampleItemsByRequest.set(item.sample_request_id, [
            ...(sampleItemsByRequest.get(item.sample_request_id) ?? []),
            item,
        ]);
    });

    const rows = [
        [
            'Lead type',
            'Lead ID',
            'Workflow status',
            'Created',
            'Last updated',
            'Name',
            'Email',
            'Phone',
            'Company',
            'Project context',
            'Website page',
            'Email delivery',
            'Spam check',
            'Assigned owner',
            'Customer message',
            'Shipping address',
            'Requested samples',
            'Internal notes',
        ],
        ...enquiries.map((lead) => [
            'Enquiry',
            lead.id,
            lead.status,
            lead.created_at,
            lead.updated_at,
            lead.name,
            lead.email,
            lead.phone ?? '',
            lead.company ?? '',
            lead.project_type ?? '',
            formatSourceRoute(lead.source_route),
            notificationExportLabel(lead.notification_status),
            turnstileLabel(lead.turnstile_success),
            assigneeName(lead.assigned_to, admins),
            lead.message ?? '',
            '',
            '',
            lead.internal_notes ?? '',
        ]),
        ...sampleRequests.map((lead) => [
            'Sample request',
            lead.id,
            lead.status,
            lead.created_at,
            lead.updated_at,
            lead.name,
            lead.email,
            lead.phone ?? '',
            lead.company ?? '',
            lead.project_name ?? '',
            formatSourceRoute(lead.source_route),
            notificationExportLabel(lead.notification_status),
            turnstileLabel(lead.turnstile_success),
            assigneeName(lead.assigned_to, admins),
            lead.message ?? '',
            lead.shipping_address ?? '',
            formatSampleItems(sampleItemsByRequest.get(lead.id) ?? [], stoneMap, finishMap),
            lead.internal_notes ?? '',
        ]),
    ];

    return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

function formatSampleItems(
    items: SampleRequestItemRow[],
    stoneMap: Map<number, string>,
    finishMap: Map<number, string>,
) {
    return items
        .map((item) => {
            const stone = item.stone_group_id
                ? stoneMap.get(item.stone_group_id) ?? 'Stone not found'
                : 'Stone not selected';
            const finish = item.finish_definition_id
                ? finishMap.get(item.finish_definition_id) ?? 'Finish not found'
                : 'Finish not selected';
            const notes = item.notes ? `; notes: ${item.notes}` : '';
            return `${stone} / ${finish} / qty ${item.quantity}${notes}`;
        })
        .join(' | ');
}

function csvCell(value: unknown) {
    const text = value === null || value === undefined ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
}

function turnstileLabel(value: boolean | null) {
    if (value === true) return 'Spam check passed';
    if (value === false) return 'Spam check failed';
    return 'Spam check not recorded';
}

function notificationExportLabel(status: NotificationStatus) {
    const labels: Record<NotificationStatus, string> = {
        pending: 'Email delivery pending',
        sent: 'Email sent',
        failed: 'Email delivery failed',
        not_required: 'Email not required',
    };

    return labels[status];
}

function downloadTextFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function assigneeName(userId: string | null, admins: AdminProfileRow[]) {
    if (!userId) return 'Unassigned';
    const admin = admins.find((profile) => profile.user_id === userId);
    return admin?.display_name || admin?.email || 'Unknown team member';
}

function formatTeamRole(role: string) {
    const labels: Record<string, string> = {
        owner: 'Team owner',
        admin: 'Lead manager',
        editor: 'Editor',
    };

    return labels[role] ?? 'Team member';
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}
