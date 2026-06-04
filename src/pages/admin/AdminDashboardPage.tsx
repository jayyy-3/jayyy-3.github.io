import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ArrowUpRight, Clock3, Compass, FilePenLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAdminAuth } from '../../lib/adminAuthHooks';
import AdminShell from './AdminShell';
import RequireAdmin from './RequireAdmin';
import { adminModules } from './adminContent';
import { CmsLiveRuleCard, CmsStatusCounts, CmsStatusMeaning, CmsWorkflowSteps } from './AdminCmsPrimitives';

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

interface ContentStatusSnapshot {
    label: string;
    path: string;
    moduleLabel: string;
    draft: number;
    published: number;
    archived: number;
}

interface DashboardState {
    isLoading: boolean;
    error: string | null;
    metrics: DashboardMetric[];
    contentStatus: ContentStatusSnapshot[];
    healthItems: DashboardHealthItem[];
    recentLeads: RecentLead[];
}

const contentTables = [
    { table: 'stone_groups', label: 'Stone families', moduleLabel: 'Stone Library', path: '/admin/stone-library' },
    { table: 'projects', label: 'Projects', moduleLabel: 'Projects', path: '/admin/projects' },
    { table: 'products', label: 'Products', moduleLabel: 'Products', path: '/admin/products' },
    { table: 'articles', label: 'Articles', moduleLabel: 'Articles', path: '/admin/articles' },
] as const;

const editorStartActions = [
    {
        label: 'Review new leads',
        note: 'Start here when a customer enquiry or sample request arrives.',
        path: '/admin/leads',
    },
    {
        label: 'Publish content',
        note: 'Open Projects, Products, Articles, or Stone Library and clear the publish checklist.',
        path: '/admin/projects',
    },
    {
        label: 'Prepare media',
        note: 'Publish images only after source, public location, alt text, and usage notes are ready.',
        path: '/admin/media',
    },
];

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
        contentStatus: [],
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
                note: 'Live on website',
            };
        });

        const contentStatusRequests = contentTables.map(async ({ table, label, moduleLabel, path }) => {
            const [draft, published, archived] = await Promise.all(
                (['draft', 'published', 'archived'] as const).map((status) =>
                    resolveCount(
                        client.from(table).select('id', { count: 'exact', head: true }).eq('status', status),
                    ),
                ),
            );
            return {
                label,
                moduleLabel,
                path,
                draft,
                published,
                archived,
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
                healthItem('Published projects with proof still under review', count, 'Review project proof', '/admin/projects'),
            ),
            resolveCount(
                client
                    .from('project_facts')
                    .select('id', { count: 'exact', head: true })
                    .eq('claim_status', 'needs_review'),
            ).then((count) =>
                healthItem('Project facts still under review', count, 'Review proof facts', '/admin/projects'),
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
                healthItem('Stone families still marked Needs confirmation', count, 'Review Stone Library', '/admin/stone-library'),
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
            const [contentMetrics, contentStatus, healthItems, newEnquiries, newSamples, recentEnquiries, recentSamples] =
                await Promise.all([
                    Promise.all(metricRequests),
                    Promise.all(contentStatusRequests),
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
                contentStatus,
                healthItems,
                recentLeads,
            });
        } catch (error) {
            setDashboard({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Dashboard query failed.',
                metrics: [],
                contentStatus: [],
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
                    <CmsLiveRuleCard>
                        <CmsStatusMeaning />
                    </CmsLiveRuleCard>

                    <section className="border border-black/10 bg-white p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Start here
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-black">
                                    Choose the next editing job
                                </h2>
                            </div>
                            <p className="max-w-xl text-sm leading-6 text-black/58">
                                Use this dashboard to decide what needs attention before opening a detail editor.
                            </p>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {editorStartActions.map((action) => (
                                <Link
                                    key={action.label}
                                    to={action.path}
                                    className="flex min-h-[132px] flex-col justify-between border border-black/10 bg-[#f8f9f5] p-4 transition hover:border-black hover:bg-white"
                                >
                                    <span>
                                        <span className="block text-base font-semibold text-black">{action.label}</span>
                                        <span className="mt-2 block text-sm leading-6 text-black/58">{action.note}</span>
                                    </span>
                                    <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-black">
                                        Open
                                        <ArrowUpRight className="h-4 w-4" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                    Editor workflow
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold text-black">
                                    Edit, review, publish
                                </h2>
                            </div>
                            <p className="max-w-xl text-sm leading-6 text-black/58">
                                Treat Draft as the safe workspace. Publish only after the readiness panel is clear.
                            </p>
                        </div>
                        <div className="mt-4">
                            <CmsWorkflowSteps />
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white">
                        <div className="border-b border-black/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                Content status
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-black">What the website can show now</h2>
                        </div>
                        <div className="divide-y divide-black/10">
                            {dashboard.isLoading ? (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="min-h-[104px] animate-pulse bg-[#f8f9f5] p-4" />
                                ))
                            ) : dashboard.contentStatus.length ? (
                                dashboard.contentStatus.map((snapshot) => (
                                    <Link
                                        key={snapshot.label}
                                        to={snapshot.path}
                                        className="grid gap-4 p-4 transition hover:bg-[#f8f9f5] lg:grid-cols-[180px_1fr]"
                                    >
                                        <div>
                                            <p className="text-base font-semibold text-black">{snapshot.label}</p>
                                            <p className="mt-1 text-sm leading-6 text-black/55">
                                                Published items can appear on the website. Draft is still your safe workspace.
                                            </p>
                                        </div>
                                        <CmsStatusCounts
                                            draft={snapshot.draft}
                                            published={snapshot.published}
                                            archived={snapshot.archived}
                                        />
                                    </Link>
                                ))
                            ) : (
                                <div className="p-4 text-sm leading-6 text-black/58">
                                    Status counts will appear after CMS content is loaded.
                                </div>
                            )}
                        </div>
                    </section>

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
                                    No review tasks are visible yet. The queue will populate after live content and
                                    customer enquiries exist.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white">
                        <div className="border-b border-black/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                                CMS sections
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-black">Where each editing job lives</h2>
                        </div>
                        <div className="divide-y divide-black/10">
                            {activeModules.map(({ key, label, path, summary, handoffLabel, Icon }) => (
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
                                            {handoffLabel}
                                        </span>
                                    </span>
                                    <span
                                        className={[
                                            'inline-flex h-8 items-center justify-center rounded border px-3 text-[11px] font-bold uppercase tracking-[0.14em]',
                                            'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black',
                                        ].join(' ')}
                                    >
                                        Open editor
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                </section>

                <aside className="space-y-5">
                    <section className="border border-black/10 bg-black p-5 text-white">
                        <Compass className="h-5 w-5 text-[var(--urblo-lime)]" />
                        <h2 className="mt-5 text-2xl font-semibold">Editor handoff status</h2>
                        <p className="mt-3 text-sm leading-6 text-white/68">
                            The private CMS is login-protected. Editors can work in Draft, use publish checklists,
                            and archive content without deleting it.
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
                                    No visible leads yet. New contact and sample request submissions will appear here
                                    once the live forms receive customer messages.
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="border border-black/10 bg-white p-5">
                        <FilePenLine className="h-5 w-5 text-black" />
                        <h2 className="mt-5 text-xl font-semibold text-black">Before handing to an editor</h2>
                        <ul className="mt-4 space-y-3 text-sm leading-6 text-black/62">
                            <li>Create or confirm the person's login account, then grant a CMS role in Settings.</li>
                            <li>Walk through one real Project, Product, Article, Media item, and Stone family.</li>
                            <li>Publish only after each on-screen checklist is clear.</li>
                            <li>Use the Open public page link in each editor after publishing to confirm the live route.</li>
                        </ul>
                    </section>
                </aside>
            </div>
        </AdminShell>
    );
}
