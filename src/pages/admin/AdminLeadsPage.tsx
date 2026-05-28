import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CheckCircle2, Inbox, Mail, PackageCheck, Save, ShieldAlert } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';

type LeadKind = 'enquiry' | 'sample';
type EnquiryStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'closed' | 'spam';
type SampleStatus = 'new' | 'confirmed' | 'packed' | 'sent' | 'closed' | 'spam';
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
    const { profile } = useAdminAuth();
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
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
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

        if (!supabase || !canManageLeads || !selectedKind || !selectedId) return;

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

        setNotice('Lead workflow updated.');
        await loadLeads({ kind: selectedKind, id: selectedId });
    }

    const statusOptions = selectedKind === 'sample' ? sampleStatusOptions : enquiryStatusOptions;

    return (
        <AdminShell
            title="Leads"
            eyebrow={canManageLeads ? 'Owner/Admin workflow' : 'Read only'}
            actions={
                <div className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black/58">
                    <Inbox className="h-4 w-4" />
                    {inboxSummary.total} visible
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
                        ) : combinedLeads.length ? (
                            <div className="divide-y divide-black/10">
                                {combinedLeads.map((lead) => (
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
                                <h2 className="mt-5 text-xl font-semibold text-black">No visible leads yet</h2>
                                <p className="mt-3 text-sm leading-6 text-black/58">
                                    This inbox will populate after live form persistence is verified with the server-side
                                    Supabase service-role key.
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
                                    Contact details, source, notification state, and internal workflow notes.
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
                                    <InfoBlock label="Source route" value={selectedLead.source_route ?? 'Unknown'} />
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
                            </div>
                            <PackageCheck className="h-5 w-5 text-black" />
                        </div>

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
                                                `${admin.display_name || admin.email} (${admin.role})`,
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
                            <p>{inboxSummary.failedNotifications} records have failed notification state.</p>
                            <p>{inboxSummary.spamCount} records are marked spam.</p>
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <ShieldAlert className="h-5 w-5 text-black" />
                        <h2 className="mt-5 text-xl font-semibold text-black">Lead guardrails</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                            <li>Lead rows are created only through server-side form endpoints.</li>
                            <li>Owner/admin roles can update workflow status, assignment, and internal notes.</li>
                            <li>Physical deletes and export controls stay hidden until privacy policy is confirmed.</li>
                            <li>Live usefulness still depends on verified Supabase form persistence.</li>
                        </ul>
                    </section>

                    {selectedLead ? (
                        <section className="border border-black/10 bg-white p-5">
                            <Mail className="h-5 w-5 text-black" />
                            <h2 className="mt-5 text-xl font-semibold text-black">Delivery state</h2>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <NotificationPill status={selectedLead.notification_status} />
                                <span className="inline-flex h-8 items-center rounded border border-black/15 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-black/50">
                                    Turnstile {selectedLead.turnstile_success === false ? 'failed' : selectedLead.turnstile_success === true ? 'passed' : 'not recorded'}
                                </span>
                            </div>
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
                            Current role is read-only for Leads. Owner/admin access is required for workflow updates.
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
                                    {item.stone_group_id ? stoneMap.get(item.stone_group_id) ?? 'Unknown stone' : 'Stone TBC'}
                                </p>
                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-black/42">
                                    {item.finish_definition_id
                                        ? finishMap.get(item.finish_definition_id) ?? 'Unknown finish'
                                        : 'Finish TBC'}
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
            Notification {status.replace('_', ' ')}
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

function assigneeName(userId: string | null, admins: AdminProfileRow[]) {
    if (!userId) return 'Unassigned';
    const admin = admins.find((profile) => profile.user_id === userId);
    return admin?.display_name || admin?.email || 'Unknown admin';
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
}
