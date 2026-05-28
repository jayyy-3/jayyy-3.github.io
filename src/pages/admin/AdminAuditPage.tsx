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
            title="Audit"
            eyebrow={canViewAudit ? 'Owner/Admin review' : 'Restricted'}
            actions={
                <div className="inline-flex min-h-10 items-center gap-2 rounded border border-black/15 bg-white px-3 text-xs font-bold uppercase tracking-[0.12em] text-black/58">
                    <Activity className="h-4 w-4" />
                    {events.length} events
                </div>
            }
        >
            {!canViewAudit ? (
                <section className="max-w-[860px] border border-black/10 bg-white p-6 md:p-8">
                    <ShieldAlert className="h-5 w-5 text-black" />
                    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                        Owner/Admin only
                    </p>
                    <h2 className="mt-3 text-[32px] font-light leading-tight text-black md:text-[48px]">
                        Audit visibility is restricted
                    </h2>
                    <p className="mt-5 max-w-[48rem] text-lg font-medium leading-8 text-[#33363f]">
                        Mutation history can expose private operational details. Viewers and editors should use the
                        content modules instead of the audit log.
                    </p>
                </section>
            ) : (
                <div className="grid gap-5 xl:grid-cols-[minmax(280px,410px)_minmax(0,1fr)_360px]">
                    <section className="border border-black/10 bg-white">
                        <div className="border-b border-black/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                Audit events
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-black">{filteredEvents.length} shown</h2>
                            <p className="mt-2 text-sm leading-6 text-black/55">
                                Latest {events.length} mutation events available to owner/admin roles.
                            </p>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                    Entity
                                    <select
                                        value={entityFilter}
                                        onChange={(event) => setEntityFilter(event.target.value)}
                                        className={fieldClass}
                                    >
                                        <option value="">All entities</option>
                                        {entityTypes.map((entityType) => (
                                            <option key={entityType} value={entityType}>
                                                {entityType}
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
                                                        {event.action}
                                                    </span>
                                                    <span className="mt-1 block truncate text-xs font-semibold uppercase tracking-[0.12em] text-black/40">
                                                        {event.entity_type}
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
                                    <h2 className="mt-5 text-xl font-semibold text-black">No audit events yet</h2>
                                    <p className="mt-3 text-sm leading-6 text-black/58">
                                        Audit visibility is ready, but mutation helpers still need to write events from
                                        admin CRUD workflows.
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
                                    {selectedEvent?.action ?? 'No event selected'}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-black/58">
                                    Audit rows are read-only. Use module records for operational edits.
                                </p>
                            </div>
                            <Database className="h-5 w-5 text-black" />
                        </div>

                        {selectedEvent ? (
                            <>
                                <div className="mt-7 grid gap-3 md:grid-cols-2">
                                    <InfoBlock label="Actor" value={actorName(selectedEvent.actor_user_id, adminProfiles)} />
                                    <InfoBlock label="Created" value={formatDateTime(selectedEvent.created_at)} />
                                    <InfoBlock label="Entity type" value={selectedEvent.entity_type} />
                                    <InfoBlock label="Entity ID" value={selectedEvent.entity_id ? String(selectedEvent.entity_id) : 'Not recorded'} />
                                </div>
                                <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-black/55">
                                    Metadata
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
                                Select an audit event after mutation helpers begin writing records.
                            </p>
                        )}
                    </section>

                    <aside className="space-y-5">
                        <section className="border border-black/10 bg-black p-5 text-white">
                            <Activity className="h-5 w-5 text-[var(--urblo-lime)]" />
                            <h2 className="mt-5 text-xl font-semibold">Audit health</h2>
                            <div className="mt-5 grid gap-3 text-sm leading-6 text-white/72">
                                <p>{summary.total} total events in the latest visible window.</p>
                                <p>{summary.withActor} events have an actor user recorded.</p>
                                <p>{summary.entityTypes} entity types appear in the log.</p>
                            </div>
                        </section>

                        <section className="border border-black/10 bg-white p-5">
                            <ShieldAlert className="h-5 w-5 text-black" />
                            <h2 className="mt-5 text-xl font-semibold text-black">Audit guardrails</h2>
                            <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                                <li>Audit events are visible only to owner/admin roles.</li>
                                <li>This screen does not mutate audit rows or expose delete controls.</li>
                                <li>Current CRUD screens still need shared mutation helpers to write event rows.</li>
                                <li>Server-side lead/form events should be added after live persistence is verified.</li>
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
