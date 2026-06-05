import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Activity, Database, ShieldAlert } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';

interface AuditEventRow {
    id: number;
    actor_user_id: string | null;
    action: string;
    entity_type: string;
    entity_id: number | null;
    metadata: unknown;
    created_at: string;
}

interface AdminProfileRow {
    user_id: string;
    email: string;
    display_name: string | null;
    role: string;
}

const fieldClass =
    'mt-2 min-h-11 w-full rounded border border-black/15 bg-white px-3 text-sm font-medium outline-none transition focus:border-black disabled:bg-black/[0.04] disabled:text-black/45';

export default function AdminAuditPage() {
    return (
        <RequireAdmin>
            <AdminAuditContent />
        </RequireAdmin>
    );
}

function AdminAuditContent() {
    const { profile } = useAdminAuth();
    const canViewAudit = profile?.role === 'owner' || profile?.role === 'admin';
    const [events, setEvents] = useState<AuditEventRow[]>([]);
    const [adminProfiles, setAdminProfiles] = useState<AdminProfileRow[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [entityFilter, setEntityFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const selectedEvent = useMemo(
        () => events.find((event) => event.id === selectedId) ?? events[0] ?? null,
        [events, selectedId],
    );
    const filteredEvents = useMemo(
        () =>
            events.filter((event) => {
                const entityMatch = entityFilter ? event.entity_type === entityFilter : true;
                const actionMatch = actionFilter
                    ? event.action.toLowerCase().includes(actionFilter.toLowerCase())
                    : true;
                return entityMatch && actionMatch;
            }),
        [actionFilter, entityFilter, events],
    );
    const entityTypes = useMemo(
        () => Array.from(new Set(events.map((event) => event.entity_type))).sort((left, right) => left.localeCompare(right)),
        [events],
    );
    const summary = useMemo(() => summarizeAudit(events), [events]);

    const loadAudit = useCallback(async () => {
        if (!supabase || !canViewAudit) {
            setIsLoading(false);
            return;
        }

        const client: SupabaseClient = supabase;
        setIsLoading(true);
        setError(null);

        const [eventsResult, profilesResult] = await Promise.all([
            client
                .from('admin_audit_events')
                .select('id,actor_user_id,action,entity_type,entity_id,metadata,created_at')
                .order('created_at', { ascending: false })
                .limit(240)
                .returns<AuditEventRow[]>(),
            client
                .from('admin_profiles')
                .select('user_id,email,display_name,role')
                .order('email', { ascending: true })
                .returns<AdminProfileRow[]>(),
        ]);

        const loadError = eventsResult.error ?? profilesResult.error;
        if (loadError) {
            setError(loadError.message);
            setIsLoading(false);
            return;
        }

        const rows = eventsResult.data ?? [];
        setEvents(rows);
        setAdminProfiles(profilesResult.data ?? []);
        setSelectedId((current) => (current && rows.some((event) => event.id === current) ? current : rows[0]?.id ?? null));
        setIsLoading(false);
    }, [canViewAudit]);

    useEffect(() => {
        void loadAudit();
    }, [loadAudit]);

    return (
        <AdminShell
            title="Change history"
            eyebrow={canViewAudit ? 'Website owner / CMS manager review' : 'Restricted'}
            actions={
                <div className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black/58">
                    <Activity className="h-4 w-4" />
                    {events.length} changes
                </div>
            }
        >
            {!canViewAudit ? (
                <section className="max-w-[860px] border border-black/10 bg-white p-6 md:p-8">
                    <ShieldAlert className="h-5 w-5 text-black" />
                    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                        Website owner / CMS manager only
                    </p>
                    <h2 className="mt-3 text-[32px] font-light leading-tight text-black md:text-[48px]">
                        Change history visibility is restricted
                    </h2>
                    <p className="mt-5 max-w-[48rem] text-lg font-medium leading-8 text-[#33363f]">
                        Change history can include private operational details. Editors should use the content modules
                        for day-to-day editing and ask a CMS manager when a saved change needs review.
                    </p>
                </section>
            ) : (
                <div className="grid gap-5 xl:grid-cols-[minmax(280px,410px)_minmax(0,1fr)_360px]">
                    <section className="border border-black/10 bg-white">
                        <div className="border-b border-black/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                Change history
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-black">{filteredEvents.length} shown</h2>
                            <p className="mt-2 text-sm leading-6 text-black/55">
                                Latest {events.length} saved changes, publish actions, exports, and sensitive operations
                                available to Website owner and CMS manager roles.
                            </p>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                    Area
                                    <select
                                        value={entityFilter}
                                        onChange={(event) => setEntityFilter(event.target.value)}
                                        className={fieldClass}
                                    >
                                        <option value="">All areas</option>
                                        {entityTypes.map((entityType) => (
                                            <option key={entityType} value={entityType}>
                                                {formatEntityType(entityType)}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                    Action search
                                    <input
                                        value={actionFilter}
                                        onChange={(event) => setActionFilter(event.target.value)}
                                        className={fieldClass}
                                    />
                                </label>
                            </div>
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
                            ) : filteredEvents.length ? (
                                <div className="divide-y divide-black/10">
                                    {filteredEvents.map((event) => (
                                        <button
                                            key={event.id}
                                            type="button"
                                            onClick={() => setSelectedId(event.id)}
                                            className={[
                                                'block w-full p-4 text-left transition hover:bg-[#f8f9f5]',
                                                selectedEvent?.id === event.id ? 'bg-[#f8f9f5]' : 'bg-white',
                                            ].join(' ')}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <span className="min-w-0">
                                                    <span className="block truncate text-sm font-semibold text-black">
                                                        {formatActionLabel(event.action)}
                                                    </span>
                                                    <span className="mt-1 block truncate text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                                        {formatEntityType(event.entity_type)}
                                                        {event.entity_id ? ` #${event.entity_id}` : ''}
                                                    </span>
                                                </span>
                                                <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-black/42">
                                                    {formatDate(event.created_at)}
                                                </span>
                                            </div>
                                            <p className="mt-3 truncate text-xs text-black/45">
                                                {actorName(event.actor_user_id, adminProfiles)}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-5">
                                    <Activity className="h-5 w-5 text-black" />
                                    <h2 className="mt-5 text-xl font-semibold text-black">No change history yet</h2>
                                    <p className="mt-3 text-sm leading-6 text-black/58">
                                        Change history visibility is ready. Saves, exports, and publish actions will
                                        appear here after the CMS saves them.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-5 md:p-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Event detail
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-black">
                                    {selectedEvent ? formatActionLabel(selectedEvent.action) : 'No activity selected'}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-black/58">
                                    Change history entries are read-only. Use the relevant CMS module to edit content,
                                    media, leads, or team access.
                                </p>
                            </div>
                            <Database className="h-5 w-5 text-black" />
                        </div>

                        {selectedEvent ? (
                            <>
                                <div className="mt-7 grid gap-3 md:grid-cols-2">
                                    <InfoBlock label="Actor" value={actorName(selectedEvent.actor_user_id, adminProfiles)} />
                                    <InfoBlock label="Created" value={formatDateTime(selectedEvent.created_at)} />
                                    <InfoBlock label="Area" value={formatEntityType(selectedEvent.entity_type)} />
                                    <InfoBlock label="Change reference" value={selectedEvent.entity_id ? `#${selectedEvent.entity_id}` : 'Not recorded'} />
                                </div>
                                <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                    Details
                                    <textarea
                                        value={JSON.stringify(selectedEvent.metadata ?? {}, null, 2)}
                                        readOnly
                                        rows={16}
                                        className={`${fieldClass} py-3 font-mono text-xs leading-6 normal-case tracking-normal`}
                                    />
                                </label>
                            </>
                        ) : (
                            <p className="mt-7 text-sm leading-6 text-black/58">
                                Select a change-history entry after saves or exports begin writing history.
                            </p>
                        )}
                    </section>

                    <aside className="space-y-5">
                        <section className="border border-black/10 bg-black p-5 text-white">
                            <Activity className="h-5 w-5 text-[var(--urblo-lime)]" />
                            <h2 className="mt-5 text-xl font-semibold">History health</h2>
                            <div className="mt-5 grid gap-3 text-sm leading-6 text-white/72">
                                <p>{summary.total} total entries in the latest visible window.</p>
                                <p>{summary.withActor} changes show who made them.</p>
                                <p>{summary.entityTypes} CMS areas appear in the history.</p>
                            </div>
                        </section>

                        <section className="border border-black/10 bg-white p-5">
                            <ShieldAlert className="h-5 w-5 text-black" />
                            <h2 className="mt-5 text-xl font-semibold text-black">Change history rules</h2>
                            <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                                <li>Change history is visible only to Website owner and CMS manager roles.</li>
                                <li>This screen is read-only and does not expose delete controls.</li>
                                <li>Save, publish, archive, and export actions write history entries after the primary action succeeds.</li>
                                <li>Lead and form entries appear after the website stores the submitted request.</li>
                            </ul>
                        </section>

                        {error ? (
                            <section className="border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                                {error}
                            </section>
                        ) : null}
                    </aside>
                </div>
            )}
        </AdminShell>
    );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
    return (
        <div className="border border-black/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">{label}</p>
            <p className="mt-2 break-words text-sm font-semibold leading-6 text-black">{value}</p>
        </div>
    );
}

function actorName(userId: string | null, admins: AdminProfileRow[]) {
    if (!userId) return 'System or unknown actor';
    const profile = admins.find((admin) => admin.user_id === userId);
    return profile?.display_name || profile?.email || userId;
}

const friendlyActionLabels = new Map<string, string>([
    ['admin_profile.bootstrap', 'Created first CMS access'],
    ['admin_profile.create', 'Granted CMS access'],
    ['admin_profile.update', 'Updated CMS access'],
    ['articles.archive', 'Archived article'],
    ['articles.create', 'Created article'],
    ['articles.publish', 'Published article'],
    ['articles.update', 'Updated article'],
    ['article_blocks.archive', 'Archived article section'],
    ['article_blocks.create', 'Created article section'],
    ['article_blocks.publish', 'Published article section'],
    ['article_blocks.update', 'Updated article section'],
    ['enquiries.create', 'Stored contact enquiry'],
    ['leads.export_csv', 'Exported leads CSV'],
    ['leads.update', 'Updated lead workflow'],
    ['media_assets.archive', 'Archived media'],
    ['media_assets.create', 'Created media'],
    ['media_assets.export_manifest', 'Exported media CSV'],
    ['media_assets.publish', 'Published media'],
    ['media_assets.update', 'Updated media'],
    ['products.archive', 'Archived product'],
    ['products.create', 'Created product'],
    ['products.publish', 'Published product'],
    ['products.update', 'Updated product'],
    ['product_models.archive', 'Archived product model'],
    ['product_models.create', 'Created product model'],
    ['product_models.publish', 'Published product model'],
    ['product_models.update', 'Updated product model'],
    ['projects.archive', 'Archived project'],
    ['projects.create', 'Created project'],
    ['projects.publish', 'Published project'],
    ['projects.update', 'Updated project'],
    ['sample_requests.create', 'Stored sample request'],
    ['site_settings.create', 'Created website settings'],
    ['site_settings.update', 'Updated website settings'],
    ['stone_finish_images.archive', 'Archived finish image'],
    ['stone_finish_images.create', 'Created finish image'],
    ['stone_finish_images.publish', 'Published finish image'],
    ['stone_finish_images.update', 'Updated finish image'],
    ['stone_groups.archive', 'Archived stone family'],
    ['stone_groups.create', 'Created stone family'],
    ['stone_groups.publish', 'Published stone family'],
    ['stone_groups.update', 'Updated stone family'],
    ['stone_variants.archive', 'Archived stone variant'],
    ['stone_variants.create', 'Created stone variant'],
    ['stone_variants.publish', 'Published stone variant'],
    ['stone_variants.update', 'Updated stone variant'],
]);

const friendlyEntityLabels = new Map<string, string>([
    ['admin_profiles', 'CMS team access'],
    ['admin_audit_events', 'Change history'],
    ['article_blocks', 'Article sections'],
    ['articles', 'Articles'],
    ['enquiries', 'Contact enquiries'],
    ['media_assets', 'Media library'],
    ['product_models', 'Product models'],
    ['products', 'Products'],
    ['project_facts', 'Project facts'],
    ['project_hotspots', 'Project hotspots'],
    ['project_material_maps', 'Project material maps'],
    ['project_materials', 'Project materials'],
    ['project_media', 'Project media'],
    ['projects', 'Projects'],
    ['sample_request_items', 'Sample request items'],
    ['sample_requests', 'Sample requests'],
    ['site_settings', 'Website settings'],
    ['stone_finish_capabilities', 'Stone finish availability'],
    ['stone_finish_images', 'Stone finish images'],
    ['stone_groups', 'Stone families'],
    ['stone_variants', 'Stone variants'],
]);

function formatActionLabel(action: string) {
    const friendlyLabel = friendlyActionLabels.get(action);
    if (friendlyLabel) return friendlyLabel;

    return action
        .split('.')
        .map((part) =>
            part
                .split('_')
                .filter(Boolean)
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' '),
        )
        .join(' / ');
}

function formatEntityType(entityType: string) {
    const friendlyLabel = friendlyEntityLabels.get(entityType);
    if (friendlyLabel) return friendlyLabel;

    return entityType
        .split('_')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function summarizeAudit(events: AuditEventRow[]) {
    return {
        total: events.length,
        withActor: events.filter((event) => Boolean(event.actor_user_id)).length,
        entityTypes: new Set(events.map((event) => event.entity_type)).size,
    };
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-AU', {
        day: '2-digit',
        month: 'short',
    }).format(new Date(value));
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat('en-AU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}
