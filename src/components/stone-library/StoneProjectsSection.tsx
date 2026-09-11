import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import ProjectResponsiveImage from '../projects/ProjectResponsiveImage';
import type { StoneProjectUsage } from '../../service/ProjectService';

function toFallbackLabel(value: string) {
    return value
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Projects using the selected finish come first; the original order holds within each group. */
function orderByActiveFinish(usages: StoneProjectUsage[], activeFinishKey: string | null) {
    if (!activeFinishKey) return usages;
    const matching = usages.filter((usage) => usage.finishKeys.includes(activeFinishKey));
    const others = usages.filter((usage) => !usage.finishKeys.includes(activeFinishKey));
    return [...matching, ...others];
}

export default function StoneProjectsSection({
    stoneName,
    usages,
    activeFinishKey,
    finishLabelByKey,
}: {
    stoneName: string;
    usages: StoneProjectUsage[];
    activeFinishKey: string | null;
    finishLabelByKey: ReadonlyMap<string, string>;
}) {
    if (!usages.length) return null;

    const ordered = orderByActiveFinish(usages, activeFinishKey);

    return (
        <section aria-labelledby="stone-projects-heading" className="mt-10 border-t border-black/10 pt-10 md:mt-12 md:pt-12">
            <div className="urblo-page-container">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="urblo-eyebrow">Used in projects</p>
                        <h2
                            id="stone-projects-heading"
                            className="mt-4 font-display text-[34px] font-semibold uppercase leading-[1.08] tracking-[0.03em] text-black md:text-[42px]"
                        >
                            Seen on site
                        </h2>
                    </div>
                    <p className="max-w-[28rem] text-[15px] leading-7 text-[var(--urblo-text)]">
                        Project records that specify {stoneName}. See placement opens the project image where it sits.
                    </p>
                </div>

                <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {ordered.map(({ project, finishKeys, pointRef }) => {
                        return (
                            <li key={project.slug} className="flex flex-col border-t border-black/12 pt-5">
                                <Link
                                    to={`/projects/${project.slug}`}
                                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--urblo-lime)] focus-visible:ring-offset-4"
                                >
                                    <div className="aspect-[4/3] overflow-hidden bg-black">
                                        <ProjectResponsiveImage
                                            src={project.listing.cover}
                                            profile="card"
                                            alt={project.listing.imageAlt || project.listing.title}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="flex items-start justify-between gap-4 pt-5">
                                        <div className="min-w-0">
                                            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-black/50">
                                                {project.listing.location} / {project.listing.year}
                                            </p>
                                            <h3 className="mt-3 text-[24px] font-semibold leading-[1.1] text-black">
                                                {project.listing.title || project.name}
                                            </h3>
                                        </div>
                                        <ArrowUpRight className="h-5 w-5 shrink-0 text-black transition group-hover:text-[var(--urblo-lime)]" />
                                    </div>
                                    {finishKeys.length ? (
                                        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Finishes used">
                                            {finishKeys.map((finishKey) => {
                                                const active = finishKey === activeFinishKey;
                                                return (
                                                    <li
                                                        key={finishKey}
                                                        className={[
                                                            'rounded-[4px] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black',
                                                            active
                                                                ? 'border-[var(--urblo-lime)] bg-[rgba(0,255,25,0.12)]'
                                                                : 'border-black/15 bg-white',
                                                        ].join(' ')}
                                                    >
                                                        {finishLabelByKey.get(finishKey) || toFallbackLabel(finishKey)}
                                                        {active ? <span className="sr-only"> (selected finish)</span> : null}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : null}
                                </Link>
                                {pointRef ? (
                                    <Link
                                        to={`/projects/${project.slug}?point=${encodeURIComponent(pointRef.hotspotId)}`}
                                        className="mt-4 inline-flex self-start border-b border-black pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-black transition-colors hover:border-[var(--urblo-lime)] focus-visible:border-[var(--urblo-lime)] focus-visible:outline-none"
                                        aria-label={`See placement of ${stoneName} in ${project.listing.title || project.name}`}
                                    >
                                        See placement
                                    </Link>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
