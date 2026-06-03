import { Archive, CheckCircle2, CircleDashed, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

export type CmsPublishStatus = 'draft' | 'published' | 'archived';
export type CmsStatusTone = 'draft' | 'published' | 'archived' | 'warning' | 'ready';

interface CmsStatusMeta {
    label: string;
    editorLabel: string;
    publicMeaning: string;
    tone: CmsStatusTone;
    Icon: ComponentType<{ className?: string }>;
}

const cmsStatusMeta: Record<CmsPublishStatus, CmsStatusMeta> = {
    draft: {
        label: 'Draft',
        editorLabel: 'Draft only',
        publicMeaning: 'Hidden from the public website until published.',
        tone: 'draft',
        Icon: CircleDashed,
    },
    published: {
        label: 'Published',
        editorLabel: 'Live on website',
        publicMeaning: 'Visible on public pages that read CMS content.',
        tone: 'published',
        Icon: Eye,
    },
    archived: {
        label: 'Archived',
        editorLabel: 'Archived',
        publicMeaning: 'Hidden from the public website and kept for record history.',
        tone: 'archived',
        Icon: Archive,
    },
};

const toneClasses: Record<CmsStatusTone, string> = {
    draft: 'border-black/15 bg-white text-black/58',
    published: 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.14)] text-black',
    archived: 'border-black bg-black text-white',
    warning: 'border-amber-300 bg-amber-50 text-amber-800',
    ready: 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)] text-black',
};

export function CmsStatusPill({ status }: { status: CmsPublishStatus }) {
    const meta = cmsStatusMeta[status];
    const Icon = meta.Icon;

    return (
        <span
            className={[
                'inline-flex h-8 shrink-0 items-center gap-1.5 rounded border px-3 text-[11px] font-bold uppercase tracking-[0.12em]',
                toneClasses[meta.tone],
            ].join(' ')}
            title={meta.publicMeaning}
        >
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
        </span>
    );
}

export function CmsStatusMeaning({ compact = false }: { compact?: boolean }) {
    return (
        <div className={compact ? 'grid gap-2' : 'grid gap-3 md:grid-cols-3'}>
            {(Object.keys(cmsStatusMeta) as CmsPublishStatus[]).map((status) => {
                const meta = cmsStatusMeta[status];
                const Icon = meta.Icon;

                return (
                    <div key={status} className="border border-black/10 bg-white p-3">
                        <div className="flex items-center gap-2">
                            <span
                                className={[
                                    'inline-flex h-7 w-7 items-center justify-center rounded border',
                                    toneClasses[meta.tone],
                                ].join(' ')}
                            >
                                <Icon className="h-3.5 w-3.5" />
                            </span>
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-black">
                                {meta.editorLabel}
                            </p>
                        </div>
                        <p className="mt-2 text-sm leading-5 text-black/58">{meta.publicMeaning}</p>
                    </div>
                );
            })}
        </div>
    );
}

export function CmsStatusCounts({
    draft,
    published,
    archived,
}: {
    draft: number;
    published: number;
    archived: number;
}) {
    const items: Array<{ status: CmsPublishStatus; value: number }> = [
        { status: 'published', value: published },
        { status: 'draft', value: draft },
        { status: 'archived', value: archived },
    ];

    return (
        <div className="grid grid-cols-3 gap-2">
            {items.map(({ status, value }) => {
                const meta = cmsStatusMeta[status];
                return (
                    <div key={status} className="border border-black/10 bg-white p-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">
                            {meta.label}
                        </p>
                        <p className="mt-2 text-2xl font-light leading-none text-black">{value}</p>
                    </div>
                );
            })}
        </div>
    );
}

export function CmsLiveRuleCard({ children }: { children?: ReactNode }) {
    return (
        <section className="border border-black/10 bg-white p-4">
            <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded bg-black text-white">
                    <EyeOff className="h-4 w-4" />
                </span>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/45">Website visibility</p>
                    <h2 className="mt-2 text-xl font-semibold text-black">Only Published content goes public</h2>
                    <p className="mt-2 text-sm leading-6 text-black/62">
                        Draft rows are safe to edit. Archived rows stay hidden. Public pages use published CMS rows
                        where cutover is complete, with static fallback still protecting unfinished areas.
                    </p>
                </div>
            </div>
            {children ? <div className="mt-4">{children}</div> : null}
        </section>
    );
}

export function CmsWorkflowSteps() {
    const steps = [
        { label: 'Edit draft', detail: 'Change copy, media, facts, and structured rows without affecting the website.' },
        { label: 'Review readiness', detail: 'Clear visible blockers before publishing, including claims and required media/copy.' },
        { label: 'Publish', detail: 'Published content becomes eligible for public CMS-backed pages.' },
    ];

    return (
        <div className="grid gap-3 lg:grid-cols-3">
            {steps.map((step, index) => (
                <article key={step.label} className="border border-black/10 bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-black/40">
                        Step {index + 1}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold text-black">{step.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-black/58">{step.detail}</p>
                </article>
            ))}
        </div>
    );
}

export function ReadinessBadge({ ready }: { ready: boolean }) {
    return (
        <span
            className={[
                'inline-flex min-h-8 items-center gap-1.5 rounded border px-3 text-[11px] font-bold uppercase tracking-[0.12em]',
                ready ? toneClasses.ready : toneClasses.warning,
            ].join(' ')}
        >
            {ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
            {ready ? 'Ready' : 'Needs review'}
        </span>
    );
}
