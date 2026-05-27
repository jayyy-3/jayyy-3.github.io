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

interface DashboardState {
    isLoading: boolean;
    error: string | null;
    metrics: DashboardMetric[];
    recentLeads: RecentLead[];
}

const contentTables = [
    { table: 'stone_groups', label: 'Stone groups' },
    { table: 'projects', label: 'Projects' },
    { table: 'products', label: 'Products' },
    { table: 'articles', label: 'Articles' },
] as const;

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

        try {
            const [contentMetrics, newEnquiries, newSamples, recentEnquiries, recentSamples] =
                await Promise.all([
                    Promise.all(metricRequests),
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
                recentLeads,
            });
        } catch (error) {
            setDashboard({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Dashboard query failed.',
                metrics: [],
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
                                Module rollout
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-black">Launch-critical CMS path</h2>
                        </div>
                        <div className="divide-y divide-black/10">
                            {activeModules.map(({ key, label, path, summary, dependency, Icon, state }) => (
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
                                            state === 'active'
                                                ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black'
                                                : 'border-black/15 bg-white text-black/50',
                                        ].join(' ')}
                                    >
                                        {state === 'active' ? 'Active' : 'Scaffolded'}
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
                            <li>Add Storage buckets and media policies before upload CRUD.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </AdminShell>
    );
}
