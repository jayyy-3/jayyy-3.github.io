import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';
import { adminModules } from './adminContent';

interface DashboardMetric {
    label: string;
    value: number | null;
    note: string;
}

interface RecentLead {
    id: number;
    status: string;
    name: string;
    created_at: string;
    kind: 'Enquiry' | 'Sample';
}

interface DashboardHealthItem {
    label: string;
    value: number;
    action: string;
    path: string;
    severity: 'ready' | 'warning';
}

interface DashboardState {
    isLoading: boolean;
    error: string | null;
    metrics: DashboardMetric[];
    healthItems: DashboardHealthItem[];
    recentLeads: RecentLead[];
}

const contentTables = [
    { table: 'stone_groups', label: 'Stone groups' },
    { table: 'projects', label: 'Projects' },
    { table: 'products', label: 'Products' },
    { table: 'articles', label: 'Articles' },
] as const;

async function resolveCount(
    query: PromiseLike<{ count: number | null; error: { message?: string } | null }>,
) {
    const { count, error } = await query;
    if (error) {
        throw error;
    }
    return count ?? 0;
}

function healthItem(label: string, value: number, action: string, path: string): DashboardHealthItem {
    return {
        label,
        value,
        action,
        path,
        severity: value > 0 ? 'warning' : 'ready',
    };
}

export default function AdminDashboardPage() {
    return (
        <RequireAdmin>
            <AdminDashboardContent />
        </RequireAdmin>
    );
}

function AdminDashboardContent() {
    const { profile } = useAdminAuth();
    const [dashboard, setDashboard] = useState<DashboardState>({
        isLoading: true,
        error: null,
        metrics: [],
        healthItems: [],
        recentLeads: [],
    });

    const loadDashboard = useCallback(async () => {
        if (!supabase) {
            return;
        }

        const client: SupabaseClient = supabase;

        setDashboard((current) => ({ ...current, isLoading: true, error: null }));

        const metricRequests = contentTables.map(async ({ table, label }) => {
            const { count, error } = await client
                .from(table)
                .select('id', { count: 'exact', head: true })
                .eq('status', 'published');

            if (error) {
                throw error;
            }

            return {
                label,
                value: count ?? 0,
                note: 'Published rows',
            };
        });

        const newEnquiriesRequest = client
            .from('enquiries')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'new');

        const newSamplesRequest = client
            .from('sample_requests')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'new');

        const recentEnquiriesRequest = client
            .from('enquiries')
            .select('id,status,name,created_at')
            .order('created_at', { ascending: false })
            .limit(4);

        const recentSamplesRequest = client
            .from('sample_requests')
            .select('id,status,name,created_at')
            .order('created_at', { ascending: false })
            .limit(4);

        const staleLeadCutoff = new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString();

        const healthRequests = [
            resolveCount(
                client
                    .from('media_assets')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'published')
                    .or('alt.is.null,usage_notes.is.null'),
            ).then((count) =>
                healthItem(
                    'Published media missing alt or usage notes',
                    count,
                    'Review media metadata',
                    '/admin/media',
                ),
            ),
            resolveCount(
                client
                    .from('projects')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'published')
                    .eq('claim_review_status', 'needs_review'),
            ).then((count) =>
                healthItem('Project claims needing review', count, 'Review project claims', '/admin/projects'),
            ),
            resolveCount(
                client
                    .from('project_facts')
                    .select('id', { count: 'exact', head: true })
                    .eq('claim_status', 'needs_review'),
            ).then((count) =>
                healthItem('Project fact rows needing review', count, 'Review proof facts', '/admin/projects'),
            ),
            resolveCount(
                client
                    .from('products')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'published')
                    .is('hero_media_id', null),
            ).then((count) =>
                healthItem('Published products missing hero media', count, 'Add product media', '/admin/products'),
            ),
            resolveCount(
                client
                    .from('articles')
                    .select('id', { count: 'exact', head: true })
                    .eq('status', 'published')
                    .is('cover_media_id', null),
            ).then((count) =>
                healthItem('Published articles missing cover media', count, 'Review article covers', '/admin/articles'),
            ),
            resolveCount(
                client.from('stone_groups').select('id', { count: 'exact', head: true }).eq('status', 'tbc'),
            ).then((count) =>
                healthItem('Stone groups still marked TBC', count, 'Review Stone Library state', '/admin/stone-library'),
            ),
            Promise.all([
                resolveCount(
                    client
                        .from('enquiries')
                        .select('id', { count: 'exact', head: true })
                        .eq('status', 'new')
                        .lt('created_at', staleLeadCutoff),
                ),
                resolveCount(
                    client
                        .from('sample_requests')
                        .select('id', { count: 'exact', head: true })
                        .eq('status', 'new')
                        .lt('created_at', staleLeadCutoff),
                ),
            ]).then(([enquiryCount, sampleCount]) =>
                healthItem('Stale new leads older than 48 hours', enquiryCount + sampleCount, 'Open lead inbox', '/admin/leads'),
            ),
        ];

        try {
            const [contentMetrics, healthItems, newEnquiries, newSamples, recentEnquiries, recentSamples] =
                await Promise.all([
                    Promise.all(metricRequests),
                    Promise.all(healthRequests),
                    newEnquiriesRequest,
                    newSamplesRequest,
                    recentEnquiriesRequest,
                    recentSamplesRequest,
                ]);

            if (newEnquiries.error) throw newEnquiries.error;
            if (newSamples.error) throw newSamples.error;
            if (recentEnquiries.error) throw recentEnquiries.error;
            if (recentSamples.error) throw recentSamples.error;

            const leadMetrics = [
                {
                    label: 'New enquiries',
                    value: newEnquiries.count ?? 0,
                    note: 'Needs first response',
                },
                {
                    label: 'New sample requests',
                    value: newSamples.count ?? 0,
                    note: 'Needs fulfilment check',
                },
            ];

            const recentLeads = [
                ...((recentEnquiries.data ?? []) as Omit<RecentLead, 'kind'>[]).map((lead) => ({
                    ...lead,
                    kind: 'Enquiry' as const,
                })),
                ...((recentSamples.data ?? []) as Omit<RecentLead, 'kind'>[]).map((lead) => ({
                    ...lead,
                    kind: 'Sample' as const,
                })),
            ]
                .sort(
                    (left, right) =>
                        new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
                )
                .slice(0, 6);

            setDashboard({
                isLoading: false,
                error: null,
                metrics: [...leadMetrics, ...contentMetrics],
                healthItems,
                recentLeads,
            });
        } catch (error) {
            setDashboard({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Dashboard query failed.',
                metrics: [],
                healthItems: [],
                recentLeads: [],
            });
        }
    }, []);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    const activeModules = useMemo(() => adminModules.filter((module) => module.key !== 'dashboard'), []);

    return (
        <AdminShell
            title="Dashboard"
            eyebrow={`Role: ${profile?.role ?? 'admin'}`}
            actions={
                <Link
                    to="/admin/leads"
                    className="inline-flex min-h-10 items-center gap-2 rounded bg-[var(--urblo-lime)] px-3 text-xs font-bold uppercase tracking-[0.12em] text-black transition hover:bg-black hover:text-white"
                >
                    Lead inbox
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            }
        >
            <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
                <section className="space-y-5">
                    <div className="grid gap-3 md:grid-cols-3">
                        {dashboard.isLoading
                            ? Array.from({ length: 6 }).map((_, index) => (
                                  <div
                                      key={index}
                                      className="min-h-[132px] animate-pulse border border-black/10 bg-white p-4"
                                  />
                              ))
                            : dashboard.metrics.map((metric) => (
                                  <article key={metric.label} className="border border-black/10 bg-white p-4">
                                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                          {metric.label}
                                      </p>
                                      <p className="mt-5 text-[40px] font-light leading-none text-black">
                                          {metric.value ?? '-'}
                                      </p>
                                      <p className="mt-3 text-sm font-medium text-black/55">{metric.note}</p>
                                  </article>
                              ))}
                    </div>

                    {dashboard.error ? (
                        <div className="border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                            {dashboard.error}
                        </div>
                    ) : null}

                    <section className="border border-black/10 bg-white">
                        <div className="border-b border-black/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                Content health queue
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-black">
                                Items to clear before public cutover
                            </h2>
                        </div>
                        <div className="divide-y divide-black/10">
                            {dashboard.isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="min-h-[76px] animate-pulse bg-[#f8f9f5] p-4" />
                                ))
                            ) : dashboard.healthItems.length ? (
                                dashboard.healthItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.path}
                                        className="grid gap-3 p-4 transition hover:bg-[#f8f9f5] md:grid-cols-[88px_1fr_150px]"
                                    >
                                        <span
                                            className={[
                                                'inline-flex h-10 w-20 items-center justify-center rounded border text-xl font-light',
                                                item.severity === 'warning'
                                                    ? 'border-black bg-black text-white'
                                                    : 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black',
                                            ].join(' ')}
                                        >
                                            {item.value}
                                        </span>
                                        <span>
                                            <span className="block text-sm font-semibold text-black">{item.label}</span>
                                            <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.14em] text-black/40">
                                                {item.severity === 'warning' ? 'Needs review' : 'Clear'}
                                            </span>
                                        </span>
                                        <span className="inline-flex h-9 items-center justify-center rounded border border-black/10 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-black/55">
                                            {item.action}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-4 text-sm leading-6 text-black/58">
                                    No health checks are visible yet. The queue will populate after live Supabase
                                    content and lead rows exist.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white">
                        <div className="border-b border-black/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                Module rollout
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-black">Launch-critical CMS path</h2>
                        </div>
                        <div className="divide-y divide-black/10">
                            {activeModules.map(({ key, label, path, summary, dependency, Icon }) => (
                                <Link
                                    key={key}
                                    to={path}
                                    className="grid gap-4 p-4 transition hover:bg-[#f8f9f5] md:grid-cols-[32px_1fr_130px]"
                                >
                                    <Icon className="h-5 w-5 text-black" />
                                    <span>
                                        <span className="block text-base font-semibold text-black">{label}</span>
                                        <span className="mt-1 block text-sm leading-6 text-black/60">{summary}</span>
                                        <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.14em] text-black/38">
                                            {dependency}
                                        </span>
                                    </span>
                                    <span
                                        className={[
                                            'inline-flex h-8 items-center justify-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.14em]',
                                            'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black',
                                        ].join(' ')}
                                    >
                                        Source ready
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </section>

                <aside className="space-y-5">
                    <section className="border border-black/10 bg-black p-5 text-white">
                        <CheckCircle2 className="h-5 w-5 text-[var(--urblo-lime)]" />
                        <h2 className="mt-5 text-2xl font-semibold">Auth gate is live</h2>
                        <p className="mt-3 text-sm leading-6 text-white/68">
                            This dashboard only renders after Supabase Auth returns a session and RLS allows
                            the matching active `admin_profiles` row.
                        </p>
                    </section>

                    <section className="border border-black/10 bg-white">
                        <div className="border-b border-black/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                Recent lead signal
                            </p>
                        </div>
                        <div className="divide-y divide-black/10">
                            {dashboard.isLoading ? (
                                <div className="p-4 text-sm font-semibold text-black/55">Loading leads...</div>
                            ) : dashboard.recentLeads.length ? (
                                dashboard.recentLeads.map((lead) => (
                                    <div key={`${lead.kind}-${lead.id}`} className="p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold text-black">{lead.name}</p>
                                            <span className="rounded border border-black/10 px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-black/50">
                                                {lead.kind}
                                            </span>
                                        </div>
                                        <p className="mt-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/42">
                                            <Clock3 className="h-3.5 w-3.5" />
                                            {lead.status}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-sm leading-6 text-black/58">
                                    No visible leads yet. Live form persistence still needs server-side service-role
                                    verification before this becomes the business inbox.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <AlertTriangle className="h-5 w-5 text-black" />
                        <h2 className="mt-5 text-xl font-semibold text-black">Open launch checks</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                            <li>Configure server-side `SUPABASE_SERVICE_ROLE_KEY` for live form writes.</li>
                            <li>Confirm the first admin email before creating an owner/admin profile.</li>
                            <li>Verify live admin save, upload, and export audit rows after browser-safe Supabase config.</li>
                            <li>Approve the static content import scope before applying draft rows to Supabase.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </AdminShell>
    );
}
